from helper import *

#app = Flask(__name__)

#@app.route('/')
def main():
    
    cred = credentials.Certificate('clear-spirit-308909-cd0ce61bd872.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    all_diseases = []
    with open('disease_list.json') as json_file:
        disease_dict = json.load(json_file)
    for each in disease_dict:
        all_diseases.append(each['name'])
    
    # get the list of html map
    listOfPages = []
    getUrlToHtmlMap("https://www.cdc.gov/outbreaks/", listOfPages)

    

    # then do work on the html map 

    # then if possible upload the info while running
    
    # so therefore everything is done concurrently

    # or better yet after this may or may not need to make two cloud functions

    # one gets all the links

    # the other one processes all the data 

    # and another to add all the data to the fire store 

    


    # link_list = []
    # link_list = get_USAndTravel("https://www.cdc.gov/outbreaks/", link_list)
    

    #urlMapHtmlMap = get_valuable_nested_html(url, link_list, listOfPages)

    #print(link_list)
    #return
    all_articles = []
    all_reports = []
    all_locations = []

    #link_list.append('https://www.cdc.gov/listeria/outbreaks/cantaloupes-jensen-farms/index.html')


    # literally just make a list of dictionaries that one store the url and then the html of it 

    


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
#            article['last_web_scrapped'] = datetime.now()
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
#            report_obj['syndromes'] = get_syndroms(main_text)
#
#            report_obj['syndromes'] = ['dummy - fever']
#            diseases = get_disease(title, all_diseases)
#            report_obj['diseases'] = diseases
#            report_obj['locations'] = []
#            locations = get_location(title, main_text, url)
#            #print(locations)
#            # set of two lists
#            for loc in locations:
#                loc_id = create_unique_id(loc['country'], loc['location'])
#                report_obj['locations'].append(loc_id)
#                loc['id'] = loc_id
#                if loc not in all_locations:
#                    all_locations.append(loc)

            #report_obj['locations'] = locations
#            report_obj['event_date'] = parser.isoparse(str(get_eventDate(main_text, date_of_publication, title)))
            
#            single_report.append(report_obj['id'])
#            
#            article['reports'] = single_report
#
#            #all_articles.append(article)
#
#            db.collection(u'articles').document(article['id']).set(article)
#            all_reports.append(report_obj)
#
#
#            print(article)
#
#        except Exception:
#            continue
#    return {}
    
    # with open('myfile.txt', 'w', encoding="utf-8") as f:
    #     #f.write(all_articles)
    #     print(all_articles, file=f)

    # with open('myfile2.txt', 'w', encoding="utf-8") as f:
    #     print(all_reports, file=f)
    
    # with open('myfile3.txt','w', encoding="utf-8") as f:
    #     print(all_locations, file=f)

#################
    

    #for obj in all_articles:
        


#    for obj in all_reports:
#        db.collection(u'reports').document(obj['id']).set(obj)
#
#    for obj in all_locations:
#        db.collection(u'locations').document(obj['id']).set(obj)
#    
#    return {}
###################

    # db.collection(u'articles').document(u'0').delete()
    # db.collection(u'articles').document(u'1').delete()


#https://www2c.cdc.gov/podcasts/feed.asp?feedid=513&format=json



# Calling main function
#if __name__ == "__main__":
#
#    app.run(host='127.0.0.1', port=8080, debug=True)

main()