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
from langdetect import detect
import geograpy
import nltk


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

        link_list.append(url)
        #print(url)
        html = get_page_html(url)
        nested_links = get_nested_url(html)

        for each in nested_links:
            if any ([each.endswith('/index.html'), 
                     each.endswith('/index.htm'),
                     each.isdigit(),
                     ]) and '2019-ncov/' not in each:
                each = fix_url(each)
                link_list.append(each)

    #add E coli urls
    E_coli_url = 'https://www2c.cdc.gov/podcasts/feed.asp?feedid=280&format=json'
    r1 = requests.get(E_coli_url)
    json_data = r1.json()
    for each in json_data['entries']:
        url = fix_url(each['link'])
        link_list.append(url)


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

    title = re.sub(r'\|','', title)

    splited_title = title.lower().split()

    highest_percent = 80
    target_disease = ''
    for each in splited_title:
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
                match_list.append(match)
        res = min(match_list)
        if res is None:
            return publish_date
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
    if countries:
        locations_list = get_location_objects_from_countries(countries, locations_list)
    if countries2:
        locations_list = get_location_objects_from_countries(countries2, locations_list)
    if cities3:
        locations_list = get_location_objects_from_cities(cities3, locations_list)
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
    locations_list = []

    for city in cities:
        if city == 'Date' or city == 'Of' or city == 'Most' or city == 'March':
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






"""
    Helper Function that gets the syndrome list from the syndrome_list.json file

"""
def get_syndrome_list():
    all_syndromes = []

    with open('syndrome_list.json') as json_file:
       syndrome_dict = json.load(json_file)

    for syndrome in syndrome_dict:
        all_syndromes.append(syndrome['name'])

    return all_syndromes



"""
    Helper Function that gets the disease list from the disease_list.json file
"""
def get_disease_list():
    
    all_diseases = []

    with open('disease_list.json') as json_file:
        disease_dict = json.load(json_file)
    for each in disease_dict:
        all_diseases.append(each['name'])

    return all_diseases

"""
    Helper function that creates the article dictionary and fills in majority of the fields
"""

def create_article(url, page):
    article = {}
    
    article['id'] = create_unique_id("article", url)
    article['headline'] = get_headline(page)
    date_of_publication = parser.isoparse(get_publish_date(page))
    article['date_of_publication'] = date_of_publication
    article['url'] = url
    main_text = get_maintext(page)
    article['main_text'] = main_text

    return article