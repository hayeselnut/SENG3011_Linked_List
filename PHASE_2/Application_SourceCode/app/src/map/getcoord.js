import{Coords} from './mapdata.js'

function getcoord(state,city ='') {
    // Result is a list of event_date, url and headline
    export const value = {};

    if(city = ''){

        for (var i  in Coords){
            if (i.properties.state == state){
                for(var x in i.coordinates){
                    value.append({lng:x[0],lat:x[1]});
                }
            }
        }
    }else{

        for (var i  in Coords){
            if (i.properties.city == city && i.properties.state == state){
                for(var x in i.coordinates){
                    value.append({lng:x[0],lat:x[1]});
                }
            }
        }

    }
    return value;
}
