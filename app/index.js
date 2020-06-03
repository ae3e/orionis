import { inbox } from "file-transfer"
import { listDirSync, readFileSync } from "fs";
import {degrees2meters, decodePolyline, getStats, convertToScreenCoords} from "../common/lib";
import document from "document";
import { geolocation } from "geolocation";

function processAllFiles() {
  let fileName;
  while (fileName = inbox.nextFile()) {
    console.log(`/private/data/${fileName} is now available`);
    
    let text = readFileSync("polyline.txt", "cbor");
    //body.text = "Transfered";
    console.log(text);
    //let MercatorCoords = decodePolyline(JSON.parse(text)).map(elt=>degrees2meters(elt[1],elt[0]));
    //console.log(MercatorCoords[0]);
    drawRoute();
  }
}
inbox.addEventListener("newfile", processAllFiles);
processAllFiles();

const listDir = listDirSync("/private/data");
let dirIter;
while((dirIter = listDir.next()) && !dirIter.done) {
  console.log(dirIter.value);
  drawRoute();
}


function drawRoute(){
  let text = readFileSync("polyline.txt", "cbor");
  let data = JSON.parse(text);
  console.log(data.screenCoords.length)
  let lines = document.getElementById("ionic").getElementsByTagName("line");
  lines.forEach(line=>{
    line.x1=0;
    line.y1=0;
    line.x2=0;
    line.y2=0;
  })
  
  //Limit to 100 points otherwise Error:Jerryscript out of memory.
  //Must be improved : https://github.com/gaperton/ionic-views/blob/master/docs/optimization-guidelines.md
  let sc = data.screenCoords.filter((elt,i,arr)=>i%(parseInt(arr.length/100)+1)===0);
  for(let i=0;i<sc.length-1;i++){
    lines[i].x1=sc[i][0];
    lines[i].y1=sc[i][1];
    lines[i].x2=sc[i+1][0];
    lines[i].y2=sc[i+1][1];
  }

  var watchID = geolocation.watchPosition(locationSuccess, locationError, { timeout: 60 * 1000 });
  var prevPosition = null;
  var angle = 0;

  function locationSuccess(position) {
    console.log("Latitude: " + position.coords.latitude +
                  " Longitude: " + position.coords.longitude);
    let mercatorPosition = degrees2meters(position.coords.longitude,position.coords.latitude)
    let screenPosition = convertToScreenCoords([mercatorPosition],data.stats)


    let circle = document.getElementById("ionic").getElementsByTagName("circle");
    circle[0].cx=screenPosition[0][0];
    circle[0].cy=screenPosition[0][1];

    let currentPosition = [screenPosition[0][0],screenPosition[0][1]]
    console.log(prevPosition)
    console.log(currentPosition)
    if(prevPosition===null){
      prevPosition = currentPosition
    }else{
      //angle = (Math.atan((currentPosition[0]-prevPosition[0])/(currentPosition[1]-prevPosition[1])))*180/Math.PI;
      angle = 90 + Math.atan2(currentPosition[1]-prevPosition[1],currentPosition[0]-prevPosition[0])*180/Math.PI;

      console.log('angle: '+angle)
      prevPosition = currentPosition
    }
    //local map
    let distance= data.maxDistance + 2 ;
    let bbox=[screenPosition[0][0]-distance,screenPosition[0][0]+distance,screenPosition[0][1]-distance,screenPosition[0][1]+distance]

    //Filtered points in bbox screen plus or minus the distance (6: defined arbitrary).
    //Take a larger area to be able to rotate using orientation calculated with GPS (No compass on Ionic)
      let filtered = data.screenCoords.map((elt,i)=>{return [elt[0],elt[1],i];}).filter((elt,i)=>{
        if(elt[0]>bbox[0] && elt[0]<bbox[1] && elt[1]>bbox[2] && elt[1]<bbox[3]){
          return true;
        }else{
          return false;
        }
      })
      console.log(filtered.length)
      //console.log(filtered)
      /*
      If at least one point is returned
      1. Get first and last index then add one point before and one after (only if it's not the first (0) or the last)
      [2,3,17,18] => [1,2,3,17,18,19]
      2. Find if points are contiguous and add one more points
      [1,2,3,17,18,19] => [1,2,3,4,16,17,18,19]
      otherwise remove drawing of route
      */
      if(filtered.length>0){
        let k=0;
        if(filtered[0][2]!=0){
          let first = [data.screenCoords[filtered[0][2]-1][0],data.screenCoords[filtered[0][2]-1][1],filtered[0][2]-1]
          filtered.unshift(first);
        }else{
          k=1;
        }
        if(filtered[filtered.length-1][2]!=data.screenCoords.length-1){
          let last = [data.screenCoords[filtered[filtered.length-1][2]+1][0],data.screenCoords[filtered[filtered.length-1][2]+1][1],filtered[filtered.length-1][2]+1]
          filtered.push(last)
        }
        
        while(k<filtered.length-1){
          //console.log('k: '+k);
          //console.log('length '+filtered.length);
          //console.log(JSON.stringify(filtered))
          if(filtered[k][2]+1!=filtered[k+1][2]){
            //console.log(filtered[k][2]+" "+filtered[k+1][2])
            let after = [data.screenCoords[filtered[k][2]+1][0],data.screenCoords[filtered[k][2]+1][1],filtered[k][2]+1];
            let before = [data.screenCoords[filtered[k+1][2]-1][0],data.screenCoords[filtered[k+1][2]-1][1],filtered[k+1][2]-1];
            filtered.splice(k+1,0,after,before)
            k=k+2;
          }else{
            k++
          }
        }
  
        let transformedScreenCoords = filtered.map(elt=>{
          return transformScreenCoords(elt,screenPosition,distance)
        })
  
        
        let lines2 = document.getElementById("item2").getElementsByTagName("line");
        lines2.forEach(line=>{
          line.x1=0;
          line.y1=0;
          line.x2=0;
          line.y2=0;
        })
        
        let sc2 = transformedScreenCoords.filter((elt,i,arr)=>i%(parseInt(arr.length/100)+1)===0);
        //console.log(sc2)
        //console.log(sc2[0])
        //console.log(sc2.length)
        for(let i=0;i<sc2.length-1;i++){
          if(sc2[i][2]+1===sc2[i+1][2]){
            lines2[i].x1=sc2[i][0];
            lines2[i].y1=sc2[i][1];
            lines2[i].x2=sc2[i+1][0];
            lines2[i].y2=sc2[i+1][1];
          }
        }

        let circle = document.getElementById("item2").getElementsByTagName("circle");
        circle[0].cx=174;
        circle[0].cy=125;
        let group = document.getElementById("item2").getElementById("group");
        //console.log(group.groupTransform.rotate.angle)
        group.groupTransform.rotate.angle = -angle

        let group = document.getElementById("ionic").getElementById("group");
        //console.log(group.groupTransform.rotate.angle)
        //group.groupTransform.rotate.angle = 90
      }else{
        let lines2 = document.getElementById("item2").getElementsByTagName("line");
        lines2.forEach(line=>{
          line.x1=0;
          line.y1=0;
          line.x2=0;
          line.y2=0;
        })
      }
      

  }

  function locationError(error) {
    console.log("Error: " + error.code,
                "Message: " + error.message);
  }
}



function transformScreenCoords (elt,screenPosition,zoom){
  return [((elt[0]-screenPosition[0][0])*348/(zoom*2)+174),((elt[1]-screenPosition[0][1])*348/(zoom*2)+125),elt[2]]
}

console.log('Hello world!');
