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

CDC_PREFIX = "https://www.cdc.gov"

def fix_url(url):
    if not url.startswith("https:"):
        url = CDC_PREFIX + url
    return url


def get_page_html(url):
    page = requests.get(url)
    page_soup = soup(page.content, 'html.parser')

    return page_soup


def get_USAndTravel(url, link_list):
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


# def get_foodSafety(url, link_list):
#     soup = get_page_html(url)
#     containers = soup.find_all("a", {"ng-click": "clickThrough(article.link)"}, href=True)
#     print(containers)
#     for container in containers:
#         # extract urls from html containers
#         url = container['href']
#         # add prefix for broken url
#         url = fix_url(url)

#         link_list.append(url)

def get_report_url(url):
    report_list = []
    soup = get_page_html(url)

    return [el.find('a').get('href') for el in soup.find_all('li', {'class': 'list-group-item'})]



def get_headline(url):
    page_soup = get_page_html(url)
    container = page_soup.find("title")
    if container != None:
        container = re.sub('<[^>]+>', '', str(container))
        container = re.sub(r'\s+\-.*|\s+\|.*',"", container)
    else:
        container = "unknown"
    return container

def get_publish_date(url):
    page_soup = get_page_html(url)
    
    date = page_soup.find('meta', {"name": "DC.date"}, content=True)

    if date != None:
        return date['content']
    elif page_soup.find('div', {"class": "col last-reviewed"}) != None: 

        container = page_soup.find('div', {"class": "col last-reviewed"})
        match_line = re.search(r'Page last updated: \<span\>(.*)\<\/span\>', str(container))
        match_date = re.search(r'\<span\>(.*?)\<\/span\>',str(match_line)).group(1)

        PYCON_DATE = parser.parse(match_date)
        PYCON_DATE = PYCON_DATE.replace(tzinfo=tz.gettz("Australia"))

        return str(PYCON_DATE).replace(' ','T') + "Z"
    else:
        return 'unknown'


def get_maintext(url):
    page_soup = get_page_html(url)
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

def generate_unique_article_id(counter):
    unique = hashlib.md5(str(counter).encode('utf-8'))

    return unique.hexdigest()

def main():


    all_articles = []

    link_list = []
    get_USAndTravel("https://www.cdc.gov/outbreaks/", link_list)
    counter  = 0

    for url in link_list:
        article = {}
        report = []

        #print(get_report_url(url))

        try:
            article['id'] = generate_unique_article_id(counter)
            article['headline'] = get_headline(url)
            article['date_of_publication'] = get_publish_date(url)
            article['url'] = url
            article['main_text'] = get_maintext(url)
            article['reports'] = report
            all_articles.append(article)
            
            
        except requests.ConnectionError as e:
            print("OOPS!! Connection Error. Make sure you are connected to Internet. Technical Details given below.\n")
            print(str(e))
        except requests.Timeout as e:
            print("OOPS!! Timeout Error")
            print(str(e))
        except requests.RequestException as e:
            print("OOPS!! General Error")
            print(str(e))
        except KeyboardInterrupt:
            print("Someone closed the program")

        counter += 1
    # with open('./files/articles.json', 'w') as f:
    #     json.dump(all_articles, f)

    cred = credentials.Certificate('./still-resource-306306-5177b823cb38.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()


    count = 0

    for obj in all_articles:

        db.collection(u'articles').document(obj['id']).set(obj)
        count += 1



#https://www2c.cdc.gov/podcasts/feed.asp?feedid=513&format=json





# Calling main function
if __name__ == "__main__":
    main()
