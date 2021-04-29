// Get the cities on route we need to calculate how many cases on each route 
export const routeCovidCalculator = (routecitys, casesByCity) => {
    // routeCitys is a list of lists 
    // produce a dictionary of cities to covid cases 
    const setOfCitys = calcSetOfCitys(routecitys);
    let covidCountSet = {}; 

    const event = new Date();
    console.log('date', event.toISOString());


    for (const [key, value] of Object.entries(casesByCity)) {
        console.log('inside covidCountList', casesByCity);
        // if the "City" key
        if (value.City in setOfCitys) {
            
            // setOfCitys[value.City] = value.City.dataByDates.(date).active

        } 
        console.log(key, value);
            
    }
        
    return covidCountSet; 
}

const calcSetOfCitys = (routecitys) => {
    let setOfCitys = {};
    routecitys.forEach((route) => {
        route.forEach((city) => {
            if (!setOfCitys.hasOwnProperty(city)) {
                setOfCitys.city = 0;
            }
        })
    })
    console.log('set', setOfCitys)
    return setOfCitys;
}

const routeCases = (routecitys, setOfCitys) => {
    // takes the set of cities and relative data and then adds it up per route 
    return
}

const overallCalculatorOfRouteCases = () => {
    // combines all the functions 
    return
}