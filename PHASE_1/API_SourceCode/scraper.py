import requests
from bs4 import BeautifulSoup as soup
import re
import json

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
        
def get_headline(url):
    page_soup = get_page_html(url)
    container = page_soup.find("title")
    if container == None:
        container = page_soup.find("h1", {"id": "content"})
    
    return container


link_list = []
get_USAndTravel("https://www.cdc.gov/outbreaks/", link_list)

#get_foodSafety("https://www.cdc.gov/outbreaks/", link_list)
# print(link_list)
# print(len(link_list))
all_articles = {}
count = 0
for url in link_list:
    article = {}
    report = {}
    article['url'] = url
    article['date_of_publication'] = url
    article['headline'] = get_headline(url)
    article['maintext'] = url
    article['report'] = report
    all_articles['article'+ str(count)] = article
    count += 1
    print(article)
# with open('mydata.json', 'w') as f:
#     json.dump(all_articles, f)




#