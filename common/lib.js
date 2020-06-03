export function degrees2meters (lon,lat) {
    var x = lon * 20037508.34 / 180;
    var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y = y * 20037508.34 / 180;
    return [x, y];
}

/**
 * Decodes to a [latitude, longitude] coordinates array.
 *
 * This is adapted from the implementation in Project-OSRM.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Array}
 *
 * @see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
 */
export function decodePolyline (str, precision) {
    var index = 0,
    lat = 0,
    lng = 0,
    coordinates = [],
    shift = 0,
    result = 0,
    byte = null,
    latitude_change,
    longitude_change,
    factor = Math.pow(10, Number.isInteger(precision) ? precision : 5);

  // Coordinates have variable length when encoded, so just keep
  // track of whether we've hit the end of the string. In each
  // loop iteration, a single coordinate is decoded.
  while (index < str.length) {

    // Reset shift, result, and byte
    byte = null;
    shift = 0;
    result = 0;

    do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
    } while (byte >= 0x20);

    latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

    shift = result = 0;

    do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
    } while (byte >= 0x20);

    longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
};

export function getStats(XYCoords){
    let width = 348-10*2;
    let height = 250-10*2;
    
    let x=[],y=[]
    if(Array.isArray(XYCoords[0][0])){
      XYCoords.forEach(elt=>{
        x.push(elt[0][0]);
        y.push(elt[1][1]);
      })
    }else{
      XYCoords.forEach(elt=>{
        x.push(elt[0]);
        y.push(elt[1]);
      })
    }
    
    let xmin = Math.min(...x);
    let xmax = Math.max(...x);
    let ymin = Math.min(...y);
    let ymax = Math.max(...y)
    
    let xdelta = xmax-xmin;
    let ydelta = ymax-ymin;
    let factor = xdelta/width;
    let scale = 1/xdelta*width
    if(factor<ydelta/height){
      factor = ydelta/height
      scale = 1/ydelta*height
    }
    
    return {xmin,xmax,ymin,ymax,xdelta,ydelta,factor,scale}
  }

  export function convertToScreenCoords(XYCoords, stats){
  
    return XYCoords.map(elt=>{      
        return [
          (elt[0]-stats.xmin+(328/stats.scale-stats.xdelta)/2)*stats.scale+10,
          250-(elt[1]-stats.ymin+(230/stats.scale-stats.ydelta)/2)*stats.scale-10
        ]
    });
  }