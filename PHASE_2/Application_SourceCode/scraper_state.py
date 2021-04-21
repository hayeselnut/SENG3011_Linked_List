import requests
from bs4 import BeautifulSoup as soup
import re
import json
from datetime import datetime
from dateutil import parser, tz
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import datefinder
import hashlib

def get_maintext(page_soup):
    container = page_soup.findAll('p') 
    #print("la2")
    if container != None:
        container = re.sub('<[^>]+>', '', str(container))
        container = re.sub(r'\s+\-.*|\s+\|.*|\n*|\r*',"", container)
        container = container.replace(u'\xa0', u' ')
        container.strip()
        if container.startswith('[') and container.endswith(']'):
            container = container[1:-1]
        #if 'signs-symptoms' in url:
        try:
            div = page_soup.find_all('div', {'class' : 'syndicate'})
            container2 = ''
            for each in div:
                for li in each.find_all('li'):
                    if li.string is not None:
                        container2 = container2 + li.string + ' '
            container = container + ' ' + str(container2)
        except Exception:
            pass
    else:
        container = "unknown"
    return str(container)


def get_headline(page_soup):
    container = page_soup.find("title")
    if container != None:
        container = re.sub('<[^>]+>', '', str(container))
    else:
        container = "unknown"
    return container

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

def get_page_html(url):
    try:
        page = requests.get(url)
        page_soup = soup(page.content, 'html.parser')

        return page_soup
    except Exception:
        return None


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
        return '2021-04-02T00:00:00Z'

def create_unique_id(type, url):
    uniqueString = str(type) + " " + str(url)
    return hashlib.sha3_256(str(uniqueString).encode()).hexdigest()

def get_state_links(address, link_list):
    page_soup = get_page_html(address)
    #containers = page_soup.find_all("h2", id=True)
    containers = page_soup.find("div", {'class': 'right-aligned-content'})
    state_names = containers.find_all("h2")
    state_list = []

    urls = containers.find_all("ul")
    url_list = []
    for state_name in state_names:
        state_list.append(state_name.text)
    
    for url in urls:
        url_home = url.find("a", href=True)
        if url_home is not None:
            url_list.append(url_home.text)


    final_list = []
    count = 0
    while count < 44:
        final_list.append((state_list[count], url_list[count]))
        count += 1

    with open('links_states.txt', 'w', encoding="utf-8") as f:
        #f.write(all_articles)
        print(final_list, file=f)

    return final_list

# def get_all_locations_from_firebase():
#     cred = credentials.Certificate('./still-resource-306306-524a6554abdb.json')
#     firebase_admin.initialize_app(cred)
#     db = firestore.client()


if __name__ == "__main__":

    link_list = []
    link_list = get_state_links("https://www.api.org/news-policy-and-issues/pandemic-information/state-pandemic-resources", link_list)

    all_articles = []
    all_reports = []
    all_locations = []


    for url in link_list:

        article = {}
        single_report = []

        #get html of each url
        page = get_page_html(url[1])
        state = url[0]

        if state.endswith(':'):
            state = state[:-1]

        while page == None:
            page = get_page_html(url[1])

        try:
            
            title = get_headline(page)

            article['id'] = create_unique_id("article", url)
            #print(url)
            #print(title)
            article['headline'] = title
            #print(get_publish_date(page))
            date_of_publication = parser.isoparse(get_publish_date(page))
            article['date_of_publication'] = date_of_publication
            article['url'] = url[1]
            #print("la")
            main_text = get_maintext(page)
            article['main_text'] = main_text

            
            report_obj = {}
            report_obj['id'] = create_unique_id("report", url)
            report_obj['syndromes'] = ['Acute respiratory syndrome', 'Influenza-like illness', 'Fever of unknown Origin']
            report_obj['diseases'] = ['COVID-19']
            report_obj['locations'] = []
            locations = {}
            locations['country'] = 'United States'
            locations['location'] = state
            locations['id'] = create_unique_id(locations['country'], locations['location'])

            report_obj['locations'].append(locations)

            all_locations.append(locations)

            report_obj['event_date'] = parser.isoparse(str(get_eventDate(main_text, date_of_publication, title)))
            
            single_report.append(report_obj)
            
            article['reports'] = single_report

            all_articles.append(article)
            all_reports.append(report_obj)


            #print(article)
            #print(report_obj)
            print("Document written")


        except Exception as e:
            raise(e)

    # with open('myfile.txt', 'w', encoding="utf-8") as f:
    #     #f.write(all_articles)
    #     print(all_articles, file=f)

    # with open('myfile2.txt', 'w', encoding="utf-8") as f:
    #     print(all_reports, file=f)
    
    # with open('myfile3.txt','w', encoding="utf-8") as f:
    #     print(all_locations, file=f)

    cred = credentials.Certificate('./still-resource-306306-524a6554abdb.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    for obj in all_articles:
        db.collection(u'articles').document(obj['id']).set(obj)


    for obj in all_reports:
        db.collection(u'reports').document(obj['id']).set(obj)

    for obj in all_locations:
        db.collection(u'locations').document(obj['id']).set(obj)