import{Coords} from './mapdata'
import{USCoords} from './USA'
import{INCoords} from './INcoord'
/*
Why should I be so troublesome, because I can't save it. 100m files cannot be saved on github, and the stack will burst.
My idea is to write an API that can query coords, but it seems we are running out of time.
*/

export function getcoord(country,state) {
    // Result is a list of event_date, url and headline
    const value = [];
  //  console.log(state);
    if(country === 'india'){

       // console.log(Coords);
        for (var i  in INCoords){
            //console.log(Coords[i]);
            var ii = INCoords[i];
          //  console.log(ii.properties.city,city,ii.properties.state , state);
            if (ii.properties.state === state){
                for(var x in ii.coordinates){
                    var xx = ii.coordinates[x];
                   // console.log(xx);
                    var temp = {lng:xx[0],lat : xx[1]}
                  //  console.log(temp);
                    value.push(temp);
                }
            }
        }
    }else{

       // console.log(Coords);
        for (var i  in USCoords){
            //console.log(Coords[i]);
            var ii = USCoords[i];
            // console.log(ii.properties.state , state);
            if (ii.properties.state == state){
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

    // console.log(value);
    return value;
}
