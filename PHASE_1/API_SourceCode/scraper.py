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
    if container != None:
        container = re.sub('<[^>]+>', '', str(container))
        container = re.sub(r'\s+\-.*|\s+\|.*',"", container)
    else:
        container = "unknown"
    return container

# def get_publish_date(url):
#     #page = requests.get("https://www2c.cdc.gov/podcasts/feed.asp?feedid=513&format=json")
    
#     if get_page_html(url) in l1:
#         return t1[l1.index(url)] 

#     # if get_page_html(url) in l2:
#     #     return t2[l2.index(get_page_html(url))]

#     return "unknown"

def get_maintext(url):
    page_soup = get_page_html(url)
    container = page_soup.findAll('p') 
    if container != None:
        container = re.sub('<[^>]+>', '', str(container))
        container = re.sub(r'\s+\-.*|\s+\|.*|\n*|\r*',"", container)
        container = container.replace(u'\xa0', u' ')
    else:
        container = "unknown"
    return container



#get_foodSafety("https://www.cdc.gov/outbreaks/", link_list)
# print(link_list)
# print(len(link_list))

# url1 = "https://www2c.cdc.gov/podcasts/feed.asp?feedid=513&format=json"

# r1 = requests.get(url1)

# l1 = []
# t1 = []
# json_data = r1.json()
# count = 0
# for item in json_data['entries']:
#     l1.append(get_page_html(item['link']))
#     t1.append(item['pubdate'])


# url2 = "https://www2c.cdc.gov/podcasts/feed.asp?feedid=66&format=json"

# r2 = requests.get(url2)

# l2 = []
# t2 = []
# json_data = r2.json()
# count = 0
# for item in json_data['entries']:
#     l2.append(get_page_html(item['link']))
#     t2.append(item['pubdate'])


def get_all_embedded_links(url):
    page_soup = get_page_html(url)
    list = []
    for a_tag in page_soup.findAll('a'):
        href = a_tag.attrs.get("href")
        if href == "" or href is None:
            continue
        else:
            list.append(href)

    return list



    
def main():
    link_list = []
    get_USAndTravel("https://www.cdc.gov/outbreaks/", link_list)

    all_articles = {}
    count = 0
    
    #article = link_list[0]
    #print(get_all_embedded_links(article))
    
    #for url in link_list:
    #    #get_publish_date(url)
    #    article = {}
    #    report = {}
    #    article['url'] = url
    #    article['date_of_publication'] = "not done atm"
    #    article['headline'] = get_headline(url)
    #    article['maintext'] = get_maintext(url)
    #    article['report'] = report
    #    all_articles['article'+ str(count)] = article
    #    count += 1
    #    
    #    printArticle(article)
    # with open('mydata.json', 'w') as f:
    #     json.dump(all_articles, f)


#https://www2c.cdc.gov/podcasts/feed.asp?feedid=513&format=json

def printArticle(article):
    print("----------------------------------")
    print(article["url"])
    print(article["date_of_publication"])
    print(article["headline"])
    print(article["maintext"])
    print(article["report"])


# TODO need to put main in a different py file

# Calling main function
if __name__ == "__main__":
    main()
