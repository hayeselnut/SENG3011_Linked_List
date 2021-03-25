from helper import *

def main(requests):

    # Getting the lists of diseases and syndromes
    all_diseases = get_disease_list()
    all_syndromes = get_syndrome_list()

    # Getting all the links from the CDC website 
    link_list = []
    link_list = get_USAndTravel("https://www.cdc.gov/outbreaks/", link_list)

    # Initializing all the lists that will be used to store all the scraped data
    all_articles = []
    all_reports = []
    all_locations = []
    
    # Going thru the list of url's and populating the lists
    for url in link_list:
        # 
        article = {}
        single_report = []

        #get html of each url
        page = get_page_html(url)

        if (page == None or body_has_content(page) == False):
            continue
    
        try:
            # Create article 
            article = create_article(url, page)

            
            report_obj = {} 
            report_obj['id'] = create_unique_id("report", url)
            report_obj['syndromes'] = ['dummy - fever']



            diseases = get_disease(article['title'], all_diseases)
            report_obj['diseases'] = diseases
            locations = get_location(article['title'], article['main_text'], url)

            #print(locations)
            # set of two lists
            for loc in locations:
                if loc not in all_locations:
                    all_locations.append(loc)

            report_obj['locations'] = locations
            report_obj['event_date'] = parser.isoparse(str(get_eventDate( article['main_text'], article['date_of_publication'], article['title'])))
            
            single_report.append(report_obj)
            
            article['reports'] = single_report

            all_articles.append(article)
            all_reports.append(report_obj)


        except Exception:
            continue


#    for url in link_list:
#        article = {}
#        single_report = []
#
#        #get html of each url
#        page = get_page_html(url)
#
#        if (page == None or body_has_content(page) == False):
#            continue
#    
#        try:
#            
#            title = get_headline(page)
#
#            article['id'] = create_unique_id("article", url)
#            #print(url)
#            #print(title)
#            article['headline'] = title
#            #print(get_publish_date(page))
#            date_of_publication = parser.isoparse(get_publish_date(page))
#            article['date_of_publication'] = date_of_publication
#            article['url'] = url
#            main_text = get_maintext(page)
#            article['main_text'] = main_text
#
#            
#            report_obj = {}
#            report_obj['id'] = create_unique_id("report", url)
#            report_obj['syndromes'] = ['dummy - fever']
#            diseases = get_disease(title, all_diseases)
#            report_obj['diseases'] = diseases
#            locations = get_location(title, main_text, url)
#
#            #print(locations)
#            # set of two lists
#            for loc in locations:
#                if loc not in all_locations:
#                    all_locations.append(loc)
#
#            report_obj['locations'] = locations
#            report_obj['event_date'] = parser.isoparse(str(get_eventDate(main_text, date_of_publication, title)))
#            
#            single_report.append(report_obj)
#            
#            article['reports'] = single_report
#
#            all_articles.append(article)
#            all_reports.append(report_obj)
#
#
#            #print(article)
#            counter += 1
#
#        except Exception:
#            continue
#    
#    
#    # with open('myfile.txt', 'w', encoding="utf-8") as f:
#    #     #f.write(all_articles)
#    #     print(all_articles, file=f)
#
#    # with open('myfile2.txt', 'w', encoding="utf-8") as f:
#    #     print(all_reports, file=f)
#    
#    # with open('myfile3.txt','w', encoding="utf-8") as f:
#    #     print(all_locations, file=f)
#
#################
#    print("running firebase stuff")
#    cred = credentials.Certificate('linked-list2-35b3d625a49d.json')
#    firebase_admin.initialize_app(cred)
#    db = firestore.client()
#
#
#
#    for obj in all_articles:
#        db.collection(u'articles').document(obj['id']).set(obj)
#
#
#    for obj in all_reports:
#        db.collection(u'reports').document(obj['id']).set(obj)
#
#    for obj in all_locations:
#        location_id = create_unique_id(obj['country'], obj['location'])
#        obj['id'] = location_id
#        db.collection(u'locations').document(obj['id']).set(obj)
#    print("done with firebase stuff")        
##################

    # db.collection(u'articles').document(u'0').delete()
    # db.collection(u'articles').document(u'1').delete()


#https://www2c.cdc.gov/podcasts/feed.asp?feedid=513&format=json

# Calling main function
if __name__ == "__main__":
    main(1)