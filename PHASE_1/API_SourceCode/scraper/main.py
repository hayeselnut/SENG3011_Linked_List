from typing import ClassVar
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


CDC_PREFIX = "https://www.cdc.gov"

def fix_url(url):
    if not url.startswith("https:"):
        url = CDC_PREFIX + url
    return url


def get_page_html(url):
    page = requests.get(url)
    page_soup = soup(page.content, 'html.parser')

    return page_soup

def body_has_content(page):
    containers = page.find_all("body")
    if str(containers) == '[<body></body>]':
        return False
    return True

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

def get_report_url(page_soup):

    return [el.find('a').get('href') for el in soup.find_all('li', {'class': 'list-group-item'})]

def get_headline(page_soup):
    #page_soup = get_page_html(url)
    container = page_soup.find("title")
    #print(container)
    if container != None:
        #print(container)
        container = re.sub('<[^>]+>', '', str(container))
        container = re.sub(r'\s+\-.*|\s+\|.*',"", container)
    else:
        container = "unknown"
    return container

def get_publish_date(page_soup):
    #page_soup = get_page_html(url)
    
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
        return '1000-01-01T00:00:00Z'


def get_maintext(page_soup):
    #page_soup = get_page_html(url)
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

def get_disease(title, all_diseases):
    disease_list = []

    splited_title = title.lower().split(" ")

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
    
def get_eventDate(maintext, publish_date):
    try: 
        matches = datefinder.find_dates(maintext)
        match_list = []
        for match in matches:
            match_list.append(match)
        earliest_date = min(match_list)
        return earliest_date
    except Exception:  
        return publish_date


def get_syndrome_list():
    data = {}
    syndrome_list = []
    with open('syndrome_list.json') as json_file:
        data = json.load(json_file)
        for x in data: 
            syndrome = x['name']

            # used top lower case everything
            y = syndrome.lower()

            # used to remove any spacing
            y = re.sub('-',' ', y)

            syndrome_list.append(y)


    return syndrome_list


# checks the html for the words 
def checkSyndrome(page):
    
    # it's not gonna be super accurate, but freak it, I needa deploy this shit 
    syndromeList = get_syndrome_list()
    mentionedSyndromes = []
    p = page.lower()


    #
    for syndrome in syndromeList:

        if isSyndromeInText(syndrome, p) == True:
            mentionedSyndromes.append(syndrome)

    
    print(mentionedSyndromes)
    return syndromeList

# checks if the given syndrome is in the main text, and uses stupid logic to determine, thus WHATEVER
def isSyndromeInText(syndrome, text):

    # get the syndrome and remove of, like, and 
    modified = re.sub('like|and|of', '', syndrome)


    # then make a counter for that syndrome
    size = len(modified.split())
    
    # initialize a counter
    counter = 0

    # SORT THE WHOLE THING

    # REMOVE ANYTHING THAT IS NOT IN THE LIST

    # 

    # then go thru the text and find the ones that match, and check the count at the end
    #for word in modified.split():
    #    re.search(r"\b\L<word>\b", )
    #        counter += 1
    
    print (syndrome + " " + str(counter))

    # if the count is the same as the sizez of the syndrome, return true 
    if counter == size:
        return True
    # return false

    return False


#for word in syndrome.split(" "):
#            
#            if word in page:
#                counter += 1
#                if syndrome not in mentionedSyndromes:
#                    if counter == size:
#                        mentionedSyndromes.append(syndrome)
                



def main():

    all_articles = []
    all_reports = []

    all_diseases = []
    with open('./files/disease_list.json') as json_file:
        disease_dict = json.load(json_file)
    for each in disease_dict:
        all_diseases.append(each['name'])

    link_list = []
    get_USAndTravel("https://www.cdc.gov/outbreaks/", link_list)
    counter  = 0

    for url in link_list:
        article = {}
        single_report = []

        #get html of each url
        page = get_page_html(url)

        if (body_has_content(page) == False):
            continue
        
    
        try:
            #print(get_publish_date(page))
            article['last_web_scrapped'] = datetime.now()
            article['id'] = generate_unique_article_id(counter)
            title = get_headline(page)
            article['headline'] = title
            date_of_publication = parser.isoparse(get_publish_date(page))
            article['date_of_publication'] = date_of_publication
            article['url'] = url
            main_text = get_maintext(page)
            article['main_text'] = main_text
            article['reports'] = single_report
            all_articles.append(article)
            
            report_obj = {}
            report_obj['syndromes'] = ['dummy - fever']
            diseases = get_disease(title, all_diseases)
            report_obj['diseases'] = diseases
            report_obj['locations'] = ['dummy - VTabSvJyA8rx6pGNb17h']
            report_obj['event_date'] = parser.isoparse(str(get_eventDate(main_text, date_of_publication)))
            single_report.append(report_obj)
            all_reports.append(report_obj)

            #print(url)
            #checkSyndrome(page.prettify())


            #print(article)
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

    # what's this? 
    # with open('./files/articles.json', 'w') as f:
    #     json.dump(all_articles, f)



################
    cred = credentials.Certificate('./still-resource-306306-5177b823cb38.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    count = 0

    for obj in all_articles:
        db.collection(u'articles').document(obj['id']).set(obj)
        count += 1

    count = 0
    for obj in all_reports:
        db.collection(u'reports').document(str(count)).set(obj)
        count += 1
##################

    # db.collection(u'articles').document(u'0').delete()
    # db.collection(u'articles').document(u'1').delete()


#https://www2c.cdc.gov/podcasts/feed.asp?feedid=513&format=json





# Calling main function
if __name__ == "__main__":
    main()
