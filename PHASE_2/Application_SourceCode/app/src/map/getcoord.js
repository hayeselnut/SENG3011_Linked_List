import{Coords} from './mapdata.js'

export function getcoord(state,city) {
    // Result is a list of event_date, url and headline
    const value = [];

    if(city == ''){

        for (var i  in Coords){
            if (i.properties.state == state){
                for(var x in i.coordinates){
                    value.append({lng:x[0],lat:x[1]});
                }
            }
        }
    }else{

       // console.log(Coords);
        for (var i  in Coords){
            //console.log(Coords[i]);
            var ii = Coords[i];
          //  console.log(ii.properties.city,city,ii.properties.state , state);
            if (ii.properties.city == city && ii.properties.state == state){
                
                for(var x in ii.coordinates){
                    var xx = ii.coordinates[x];
                   // console.log(xx);
                    var temp = {lng:xx[0],lat : xx[1]}
                  //  console.log(temp);
                    value.push(temp);
                }
            }
        }

    }
    return null;
}
