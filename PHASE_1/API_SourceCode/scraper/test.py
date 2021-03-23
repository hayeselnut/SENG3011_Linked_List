import json
import re


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


# checks the main text for both the article and the report 
def checkSyndrome(maintext):
    
    # it's not gonna be super accurate, but freak it, I needa deploy this shit 
    syndromeList = get_syndrome_list()
    
    for syndrome in syndromeList:
        for word in syndrome.split(" "):
            if word in maintext:
                print(syndrome)
        

    
    return 0



# Calling main function
if __name__ == "__main__":
    checkSyndrome("hrehjjkdfshg")
