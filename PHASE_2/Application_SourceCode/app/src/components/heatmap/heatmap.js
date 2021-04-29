import { Polygon } from '@react-google-maps/api';
import React from 'react';
import aggregateDangerIndexes from '../dangerIndexAggregator';
import { getcoord } from './getcoord';

const percentToRGB = (percent) => { 
  var r, g, b; 
  if (percent < 50) { 
   // green to yellow 
   r = Math.floor(255 * (percent/50)); 
   g = 255; 

  } else { 
   // yellow to red 
   r = 255; 
   g = Math.floor(255 * ((100 - percent)/50)); 
  } 
  b = 0; 
  var rr,gg,bb;
  rr = Number(r).toString(16);
  gg = Number(g).toString(16);
  bb = Number(b).toString(16);
  if (rr.length < 2) {
      rr = '0' + rr;
  }
  if (gg.length < 2) {
      gg = '0' + gg;
  }
  if (bb.length < 2) {
      bb = '0' + bb;
  }
  return '#' + rr + gg + bb;
} 

const Heatmap = (props) => {
  const { country, province, recorded } = props;

  const [dangerIndexes, setDangerIndexes] = React.useState({});

  React.useEffect(() => {
    aggregateDangerIndexes(recorded).then(res => {
      setDangerIndexes(res);
    });
  }, [recorded]);

  const getOptions = (provinceIndex, outline) => ({
    strokeColor: '#000000',
    strokeOpacity: 0.8,
    strokeWeight: outline ? 2 : 0,
    fillColor: percentToRGB(provinceIndex),
    fillOpacity: 0.35,
  })

  console.log(dangerIndexes);

  return (
    <>
      {Object.keys(dangerIndexes).map((Province, index) => (
        <Polygon
          key={index}
          paths={getcoord(country, Province)}
          options={getOptions(dangerIndexes[Province], Province === province)}
        />
      ))}
    </>
  );
};

export default Heatmap;
