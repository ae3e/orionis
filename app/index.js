import { inbox } from "file-transfer"
import { listDirSync, readFileSync } from "fs";

import document from "document";
import { geolocation } from "geolocation";

import { Application } from "./lib/view";

import { ViewEnd } from "./views/end";
import { ViewExercise } from "./views/exercise";
import { ViewConfig } from "./views/config";
import { ViewSelect } from "./views/select";

class MultiScreenApp extends Application {
  screens = { ViewSelect, ViewExercise, ViewConfig, ViewEnd };
}

MultiScreenApp.start("ViewSelect");

function processAllFiles() {
  let fileName;
  while (fileName = inbox.nextFile()) {
    console.log(`/private/data/${fileName} is now available`);
    
    let text = readFileSync("polyline.txt", "cbor");
    //body.text = "Transfered";
    console.log(text);
    //let MercatorCoords = decodePolyline(JSON.parse(text)).map(elt=>degrees2meters(elt[1],elt[0]));
    //console.log(MercatorCoords[0]);
    //drawRoute();
  }
}
inbox.addEventListener("newfile", processAllFiles);
processAllFiles();

const listDir = listDirSync("/private/data");
let dirIter;
while((dirIter = listDir.next()) && !dirIter.done) {
  console.log(dirIter.value);
  //drawRoute();
}


console.log('Hello world!');
