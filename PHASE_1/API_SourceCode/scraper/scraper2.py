import requests
from bs4 import BeautifulSoup as soup
import re
import json
from datetime import datetime
from dateutil import parser, tz
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import hashlib
import datefinder
from fuzzywuzzy import process
from geotext import GeoText
import geocoder
from geopy.geocoders import Nominatim
import geograpy
import nltk

from flask import Flask

CDC_PREFIX = "https://www.cdc.gov"

def fix_url(url):
    if not url.startswith("https:"):
        url = CDC_PREFIX + url
    return url


def get_page_html(url):
    try:
        page = requests.get(url)
        page_soup = soup(page.content, 'html.parser')

        return page_soup
    except Exception:
        return None

def body_has_content(page):
    containers = page.find_all("body")
    if str(containers) == '[<body></body>]' or str(containers) == None:
        return False
    return True

def get_valuable_nested_links(url, link_list):

    link_list.append(url)
    html = get_page_html(url)
    nested_links = get_nested_url(html)

    for each in nested_links:
        if any ([each.endswith('/index.html'), 
                each.endswith('/index.htm'),
                each.isdigit(),
                '/2011/' in each,
                '/2010/' in each,
                '/2009/' in each,
                '/2008/' in each,
                '/2007/' in each,
                '/2006/' in each,
                ]) and '2019-ncov/' not in each:
            each = fix_url(each)
            link_list.append(each)

    return link_list


def get_USAndTravel(url, link_list):

    page_soup = get_page_html(url)
    if page_soup == None:
        page_soup = get_page_html(url)
    # tag: a, attribute: feed-item-title -> getting US based & Travel Notices Affecting International Travelers
    # food safety: elements with attribute name "data_ng_href" -> doesnt work need to either use feedid or js

    containers = page_soup.find_all("a", {"class": "feed-item-title"}, href=True)

    for container in containers:
        # extract urls from html containers
        url = container['href']
        # add prefix for broken url
        url = fix_url(url)
        #print(url)
        # html = get_page_html(url)
        # nested_links = get_nested_url(html)

        # for each in nested_links:
        #     if any ([each.endswith('/index.html'), 
        #              each.endswith('/index.htm'),
        #              each.isdigit(),
        #              ]) and '2019-ncov/' not in each:
        #         each = fix_url(each)
        #         link_list.append(each)
        link_list = get_valuable_nested_links(url, link_list)

    #add E coli urls
    # E_coli_url = 'https://www2c.cdc.gov/podcasts/feed.asp?feedid=280&format=json'
    # r1 = requests.get(E_coli_url)
    # json_data = r1.json()
    # for each in json_data['entries']:
    #     url = fix_url(each['link'])
    #     link_list.append(url)
    E_coli_url = 'https://www.cdc.gov/ecoli/2021/o157h7-02-21/index.html'
    link_list = get_valuable_nested_links(E_coli_url, link_list)

    #print(link_list)
    #print(link_list)
    return link_list


def get_nested_url(page_soup):

    return [el.find('a').get('href') for el in page_soup.find_all('li', {'class': 'list-group-item'})]



def get_headline(page_soup):
    container = page_soup.find("title")
    if container != None:
        container = re.sub('<[^>]+>', '', str(container))
    else:
        container = "unknown"
    return container

def get_publish_date(page_soup):    
    date = page_soup.find('meta', {"name": "DC.date"}, content=True)

    if date != None:
        if date['content'].endswith('/'):
            date['content'] = date['content'][:-1]
        return date['content']

    elif page_soup.find('div', {"class": "col last-reviewed"}) != None: 

        container = page_soup.find('div', {"class": "col last-reviewed"})
        match_line = re.search(r'Page last updated: \<span\>(.*)\<\/span\>', str(container))
        match_date = re.search(r'\<span\>(.*?)\<\/span\>',str(match_line)).group(1)

        PYCON_DATE = parser.parse(match_date)
        PYCON_DATE = PYCON_DATE.replace(tzinfo=tz.gettz("Australia"))

        res_date = str(PYCON_DATE).replace(' ','T') + "Z"

        return res_date
    else:
        return '1000-01-01T00:00:00Z'


def get_maintext(page_soup):
    container = page_soup.findAll('p') 
    if container != None:
        container = re.sub('<[^>]+>', '', str(container))
        container = re.sub(r'\s+\-.*|\s+\|.*|\n*|\r*',"", container)
        container = container.replace(u'\xa0', u' ')
        container.strip()
        if container.startswith('[') and container.endswith(']'):
            container = container[1:-1]
    else:
        container = "unknown"
    return str(container)


# url1 = "https://www2c.cdc.gov/podcasts/feed.asp?feedid=513&format=json"
# r1 = requests.get(url1)
# json_data = r1.json()


def get_disease(title, all_diseases):
    disease_list = []

    if 'E. coli' in title:
        disease_list.append('ehec (e.coli)')
        return disease_list
    elif 'tobacco' in title.lower():
        disease_list.append('other')
        return disease_list

    title = re.sub(r'\|','', title)

    splited_title = title.lower().split()

    highest_percent = 80
    target_disease = 'unknown'
    for each in splited_title:
        if each == '-':
            continue

        if each.endswith('a'):
            tmp_name = each[:-1]+'osis'
            if tmp_name in all_diseases:
                target_disease = tmp_name
                break

        matching_percent = process.extractOne(each, all_diseases)
        if matching_percent[1] > highest_percent:
            highest_percent = matching_percent[1]
            target_disease = matching_percent[0]

    disease_list.append(target_disease)

    return disease_list
    
def get_eventDate(maintext, publish_date, title):
    
    try: 
        match_list = []

        matches = datefinder.find_dates(title)
        for match in matches:
            match_list.append(match)
        if not match_list:
            matches2 = datefinder.find_dates(maintext)
            for match in matches2:
                if match.year > '2000':
                    match_list.append(match)

        res = min(match_list)

        if res is None:
            return publish_date
        # elif res.year() < ''
        return res
 
    except Exception:  
        return publish_date

def get_location(title, main_text, url):
    locations_list = []
    cities = ''
    countries = ''
    splited_url = re.split(r'\/|\-',url)
    splited_url = " ".join(splited_url)

    places = geograpy.get_place_context(text=main_text)
    places2 = geograpy.get_place_context(text=title)
    places3 = geograpy.get_place_context(text=splited_url)

    cities = places.cities
    countries = places.countries
    cities2 = places2.cities
    countries2 = places2.countries
    cities3 = places3.cities
    countries3 = places3.countries

    if cities:
        locations_list = get_location_objects_from_cities(cities, locations_list)

    if cities2:
        locations_list = get_location_objects_from_cities(cities2, locations_list)

    if cities3:
        locations_list = get_location_objects_from_cities(cities3, locations_list)

    if countries:
        locations_list = get_location_objects_from_countries(countries, locations_list)

    if countries2:
        locations_list = get_location_objects_from_countries(countries2, locations_list)

    if countries3:
        locations_list = get_location_objects_from_countries(countries3, locations_list)

        
    if not locations_list:
        # set up as default locatoin - US, unknown city
        location = {}
        location['country'] = 'United States'
        location['location'] = 'unknown'

        locations_list.append(location)

    return locations_list

def get_location_objects_from_countries(countries, locations_list):
    #locations_list = []
    for country in countries:
        location = {}
        location['country'] = country
        location['location'] = 'unknown'
    
        if not any(obj['country'] == country for obj in locations_list):
            locations_list.append(location)

    return locations_list

def get_location_objects_from_cities(cities, locations_list):
    #locations_list = []
    bad_city_words = ['Date', 'Of', 'Diamond', 'Most','March', 'Black', 'Media', 'Standard', 'Turkey', 'Early', 'English', 'Central', 'University', 'Long', 'Best', 'Ask', 'Page', 'Broken Arrow', 'Research', 'Strong', 'Sunshine', 'West', 'Man', 'Rice','Point', 'Gay', 'Blue Bell', 'High Level', 'Michael', 'Low', 'Plan', 'Williams', 'Tyler', 'See', 'Young', 'Bell', 'All', 'Level']
    for city in cities:
        if city in bad_city_words:
            continue
        geolocator = Nominatim(user_agent = "geoapiExercises")
        location = geolocator.geocode(city)
        country = str(location).split (",")[-1]
        country = country.strip()
        location = {}
        location['country'] = country
        location['location'] = city
        if location not in locations_list:
            locations_list.append(location)

    return locations_list


def create_unique_id(type, url):
    uniqueString = str(type) + " " + str(url)
    return hashlib.sha3_256(str(uniqueString).encode()).hexdigest()


app = Flask(__name__)

@app.route('/main')
def main():

    all_diseases = []
    with open('disease_list.json') as json_file:
        disease_dict = json.load(json_file)
    for each in disease_dict:
        all_diseases.append(each['name'])

    link_list = []
    link_list = get_USAndTravel("https://www.cdc.gov/outbreaks/", link_list)
    
    #print(link_list)
    #return
    all_articles = []
    all_reports = []
    all_locations = []

    #link_list.append('https://www.cdc.gov/listeria/outbreaks/cantaloupes-jensen-farms/index.html')

    for url in link_list:
        article = {}
        single_report = []

        #get html of each url
        page = get_page_html(url)

        if (page == None or body_has_content(page) == False):
            continue
    
        try:
            
            title = get_headline(page)

            article['id'] = create_unique_id("article", url)
            #print(url)
            #print(title)
            article['headline'] = title
            #print(get_publish_date(page))
            date_of_publication = parser.isoparse(get_publish_date(page))
            article['date_of_publication'] = date_of_publication
            article['url'] = url
            main_text = get_maintext(page)
            article['main_text'] = main_text

            
            report_obj = {}
            report_obj['id'] = create_unique_id("report", url)
            report_obj['syndromes'] = ['dummy - fever']
            diseases = get_disease(title, all_diseases)
            report_obj['diseases'] = diseases
            report_obj['locations'] = []
            locations = get_location(title, main_text, url)
            #print(locations)
            # set of two lists
            for loc in locations:
                loc_id = create_unique_id(loc['country'], loc['location'])
                report_obj['locations'].append(loc_id)
                loc['id'] = loc_id
                if loc not in all_locations:
                    all_locations.append(loc)

            #report_obj['locations'] = locations
            report_obj['event_date'] = parser.isoparse(str(get_eventDate(main_text, date_of_publication, title)))
            
            single_report.append(report_obj['id'])
            
            article['reports'] = single_report

            all_articles.append(article)
            all_reports.append(report_obj)


            print(article)

        except Exception:
            continue
    
    
    # with open('myfile.txt', 'w', encoding="utf-8") as f:
    #     #f.write(all_articles)
    #     print(all_articles, file=f)

    # with open('myfile2.txt', 'w', encoding="utf-8") as f:
    #     print(all_reports, file=f)
    
    # with open('myfile3.txt','w', encoding="utf-8") as f:
    #     print(all_locations, file=f)

#################
    cred = credentials.Certificate('./linked-list2-firebase-adminsdk-2z1uo-bf78a7be2c.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    for obj in all_articles:
        db.collection(u'articles').document(obj['id']).set(obj)


    for obj in all_reports:
        db.collection(u'reports').document(obj['id']).set(obj)

    for obj in all_locations:
        db.collection(u'locations').document(obj['id']).set(obj)
    
    return {}
###################

    # db.collection(u'articles').document(u'0').delete()
    # db.collection(u'articles').document(u'1').delete()


#https://www2c.cdc.gov/podcasts/feed.asp?feedid=513&format=json



# Calling main function
if __name__ == "__main__":

    app.run(host='127.0.0.1', port=8080, debug=True)