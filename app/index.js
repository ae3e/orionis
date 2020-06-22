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
  }
}
inbox.addEventListener("newfile", processAllFiles);
processAllFiles();


/* Later to have multiple routes on the watch
const listDir = listDirSync("/private/data");
let dirIter;
while((dirIter = listDir.next()) && !dirIter.done) {
  console.log(dirIter.value);
}*/
