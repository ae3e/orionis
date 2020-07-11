import document from "document";
import exercise from "exercise";

import * as config from "../config";
import { Application, View, $at } from "../lib/view";
import * as utils from "../lib/utils";
import Clock from "../subviews/clock";
import GPS from "../subviews/gps";
import HRM from "../subviews/hrm";
import Popup from "../subviews/popup";

//Used to calculate cadence
import { today } from "user-activity";

import { readFileSync } from "fs";
import {degrees2meters, convertToScreenCoords} from "../../common/lib";

const $ = $at("#view-exercise");

export class ViewExercise extends View {
  el = $();

  btnFinish = $("#btnFinish");
  btnToggle = $("#btnToggle");
  lblStatus = $("#lblStatus");

  elBoxStats = $("#boxStats");
  lblSpeed = $("#lblSpeed");
  lblSpeedUnits = $("#lblSpeedUnits");
  lblSpeedAvg = $("#lblSpeedAvg");
  lblSpeedAvgUnits = $("#lblSpeedAvgUnits");
  lblPace = $("#lblPace");
  lblPaceUnits = $("#lblPaceUnits");
  lblDistance = $("#lblDistance");
  lblDistanceUnits = $("#lblDistanceUnits");
  lblActiveTime = $("#lblActiveTime");
  lblCadence = $("#lblCadence");
  lblCadenceUnits = $("#lblCadenceUnits");

  data = null; //data in transfered file
  prevPosition = null; //used with currentPosition to calculate orientation
  angle = 0; //used to rotate local map

  stepsHistory = [parseInt(today.local.steps)];

  handlePopupNo = () => {
    this.remove(this.popup);
  };

  handlePopupYes = () => {
    this.remove(this.popup);
    exercise.stop();
    Application.switchTo("ViewEnd");
  };

  handleToggle = () => {
    console.log(exercise.state)
    switch(exercise.state){
      case 'started':
        this.handlePause();
        break;
      case 'paused':
        this.handleResume();
        break;
      case 'stopped':
        exercise.start(config.exerciseType, config.exerciseOptions);
        this.setComboIcon(this.btnToggle, config.icons.pause);
        utils.hide(this.btnFinish);
        break;
    }
  };

  handlePause = () => {
    console.log("pause")
    exercise.pause();
    this.lblStatus.text = "paused";
    this.setComboIcon(this.btnToggle, config.icons.play);
    utils.show(this.btnFinish);
  };

  handleResume = () => {
    exercise.resume();
    this.lblStatus.text = "";
    this.setComboIcon(this.btnToggle, config.icons.pause);
    utils.hide(this.btnFinish);
  };

  setComboIcon(combo, icon) {
    combo.getElementById("combo-button-icon").href = icon;
    combo.getElementById("combo-button-icon-press").href = icon;
  }

  handleFinish = () => {
    let popupSettings = {
      title: "End activity?",
      message: `Are you sure you want to finish this ${
        config.exerciseType
      } session?`,
      btnLeftLabel: "Cancel",
      btnLeftCallback: this.handlePopupNo,
      btnRightLabel: "End",
      btnRightCallback: this.handlePopupYes
    };
    this.popup = new Popup("#popup", popupSettings);
    this.insert(this.popup);
  };

  handleCancel = () => {
    this.gps.callback = undefined;
    Application.switchTo("ViewSelect");
  }

  handleLocationSuccess = (position) => {
    utils.show(this.btnToggle);

    this.lblStatus.text = "";
    //this.gps.callback = undefined;


    let mercatorPosition = degrees2meters(position.coords.longitude,position.coords.latitude)
    let screenPosition = convertToScreenCoords([mercatorPosition],this.data.stats)

    //Update position on global map
    let circle = document.getElementById("ionic").getElementsByTagName("circle");
    circle[0].cx=screenPosition[0][0];
    circle[0].cy=screenPosition[0][1];

    let currentPosition = [screenPosition[0][0],screenPosition[0][1]]
    if(this.prevPosition===null){
      this.prevPosition = currentPosition
    }else{
      this.angle = 90 + Math.atan2(currentPosition[1]-this.prevPosition[1],currentPosition[0]-this.prevPosition[0])*180/Math.PI;
      this.prevPosition = currentPosition
    }

    //local map
    let distance= this.data.stats.scale*500;//500m around my position ;

    //bbox as xmin,ymin,xmax,ymax
    let bbox=[screenPosition[0][0]-distance,screenPosition[0][1]-distance,screenPosition[0][0]+distance,screenPosition[0][1]+distance]


    //Clip lines in the viewport for local map
    let lines = [];
    this.data.screenCoords.forEach((elt,i,arr)=>{
      if(i>0){
        lineclip([arr[i],arr[i-1]], bbox, lines);
      }
    })

    let transformedScreenLines = lines.map(elt=>{
      return [transformScreenCoords(elt[0],screenPosition,distance),transformScreenCoords(elt[1],screenPosition,distance)]
    })
    

    //Draw local map
    let lines2 = document.getElementById("item2").getElementsByTagName("line");
    lines2.forEach(line=>{
      line.x1=0;
      line.y1=0;
      line.x2=0;
      line.y2=0;
    })
    
    if(lines.length>0){
      for(let i=0;i<transformedScreenLines.length;i++){
        lines2[i].x1=transformedScreenLines[i][0][0];
        lines2[i].y1=transformedScreenLines[i][0][1];
        lines2[i].x2=transformedScreenLines[i][1][0];
        lines2[i].y2=transformedScreenLines[i][1][1];
      }
      let circle = document.getElementById("item2").getElementsByTagName("circle");
      circle[0].cx=174;
      circle[0].cy=125;
      let group = document.getElementById("item2").getElementById("group");
      group.groupTransform.rotate.angle = -this.angle

    }else{
      let lines2 = document.getElementById("item2").getElementsByTagName("line");
      lines2.forEach(line=>{
        line.x1=0;
        line.y1=0;
        line.x2=0;
        line.y2=0;
      })
    }
  };

  handleRefresh = () => {
    this.render();
  }

  handleButton = (evt) => {
    evt.preventDefault();
    switch (evt.key) {
      case "back":
        if (exercise.state === "stopped") {
          this.handleCancel();
        }
        break;
      case "up":
        if (exercise.state === "paused") {
          this.handleFinish();
        }
        break;
      case "down":
        if (exercise.state === "started") {
          this.handleToggle();
        }
        break;
    }
  }

  onMount() {
    let text = readFileSync("polyline.txt", "cbor");
    this.data = JSON.parse(text);
    
    //Draw global map
    let lines = document.getElementById("ionic").getElementsByTagName("line");
    lines.forEach(line=>{
      line.x1=0;
      line.y1=0;
      line.x2=0;
      line.y2=0;
    })
    
    for(let i=0;i<this.data.screenCoords.length-1;i++){
      lines[i].x1=this.data.screenCoords[i][0];
      lines[i].y1=this.data.screenCoords[i][1];
      lines[i].x2=this.data.screenCoords[i+1][0];
      lines[i].y2=this.data.screenCoords[i+1][1];
    }


    utils.hide(this.btnFinish);
    utils.hide(this.btnToggle);
    this.setComboIcon(this.btnToggle, config.icons.play);
    this.lblStatus.text = "connecting";

    this.clock = new Clock("#subview-clock", "seconds", this.handleRefresh);
    this.insert(this.clock);

    this.hrm = new HRM("#subview-hrm");
    this.insert(this.hrm);

    this.gps = new GPS("#subview-gps2", this.handleLocationSuccess);
    this.insert(this.gps);

    this.btnToggle.addEventListener("click", this.handleToggle);
    this.btnFinish.addEventListener("click", this.handleFinish);
    document.addEventListener("keypress", this.handleButton);
  }

  onRender() {
    if (exercise && exercise.stats) {

      const speed = utils.formatSpeed(exercise.stats.speed.current);
      this.lblSpeed.text = speed.value;
      this.lblSpeedUnits.text = `speed ${speed.units}`;

      const speedAvg = utils.formatSpeed(exercise.stats.speed.average);
      this.lblSpeedAvg.text = speedAvg.value;
      this.lblSpeedAvgUnits.text = `speed avg ${speedAvg.units}`;

      const pace = utils.convertSpeedToPace(speed);
      this.lblPace.text = pace.value;
      this.lblPaceUnits.text = `pace ${pace.units}`;

      const distance = utils.formatDistance(exercise.stats.distance);
      this.lblDistance.text = distance.value;
      this.lblDistanceUnits.text = `distance ${distance.units}`;

      this.lblActiveTime.text = utils.formatActiveTime(exercise.stats.activeTime);

      /**
       * To calculate cadence:
       * 1. Store number of steps every seconds (because screen is refreshed every seconds)
       * 2. Calculate number of steps in 10 sec
       */
      this.stepsHistory.push(parseInt(today.local.steps)); // Get current step count
      var period = 10; //Number of seconds used to calculate cadence
      this.newCadence = 0
      if(this.stepsHistory.length===period+1){
        this.newCadence = parseInt((this.stepsHistory[period] - this.stepsHistory[0]) * 60/period); // Calculate current cadence
        this.stepsHistory.shift();
      }
      console.log(new Date().getSeconds()+' '+today.local.steps+' '+this.newCadence)
      
      this.lblCadence.text = this.newCadence;
      this.lblCadenceUnits.text = `cadence spm`;

      //this.lblCalories.text = utils.formatCalories(exercise.stats.calories);
    }
  }

  onUnmount() {

    this.btnToggle.removeEventListener("click", this.handleToggle);
    this.btnFinish.removeEventListener("click", this.handleFinish);
    document.removeEventListener("keypress", this.handleButton);
  }

  
}

function transformScreenCoords (elt,screenPosition,zoom){
  return [((elt[0]-screenPosition[0][0])*348/(zoom*2)+174),((elt[1]-screenPosition[0][1])*348/(zoom*2)+125),elt[2]]
}

// Cohen-Sutherland line clippign algorithm, adapted to efficiently
// handle polylines rather than just segments

function lineclip(points, bbox, result) {

  var len = points.length,
      codeA = bitCode(points[0], bbox),
      part = [],
      i, a, b, codeB, lastCode;

  if (!result) result = [];

  for (i = 1; i < len; i++) {
      a = points[i - 1];
      b = points[i];
      codeB = lastCode = bitCode(b, bbox);

      while (true) {

          if (!(codeA | codeB)) { // accept
              part.push(a);

              if (codeB !== lastCode) { // segment went outside
                  part.push(b);

                  if (i < len - 1) { // start a new line
                      result.push(part);
                      part = [];
                  }
              } else if (i === len - 1) {
                  part.push(b);
              }
              break;

          } else if (codeA & codeB) { // trivial reject
              break;

          } else if (codeA) { // a outside, intersect with clip edge
              a = intersect(a, b, codeA, bbox);
              codeA = bitCode(a, bbox);

          } else { // b outside
              b = intersect(a, b, codeB, bbox);
              codeB = bitCode(b, bbox);
          }
      }

      codeA = lastCode;
  }

  if (part.length) result.push(part);

  return result;
}

// intersect a segment against one of the 4 lines that make up the bbox

function intersect(a, b, edge, bbox) {
  return edge & 8 ? [a[0] + (b[0] - a[0]) * (bbox[3] - a[1]) / (b[1] - a[1]), bbox[3]] : // top
         edge & 4 ? [a[0] + (b[0] - a[0]) * (bbox[1] - a[1]) / (b[1] - a[1]), bbox[1]] : // bottom
         edge & 2 ? [bbox[2], a[1] + (b[1] - a[1]) * (bbox[2] - a[0]) / (b[0] - a[0])] : // right
         edge & 1 ? [bbox[0], a[1] + (b[1] - a[1]) * (bbox[0] - a[0]) / (b[0] - a[0])] : // left
         null;
}

// bit code reflects the point position relative to the bbox:

//         left  mid  right
//    top  1001  1000  1010
//    mid  0001  0000  0010
// bottom  0101  0100  0110

function bitCode(p, bbox) {
  var code = 0;

  if (p[0] < bbox[0]) code |= 1; // left
  else if (p[0] > bbox[2]) code |= 2; // right

  if (p[1] < bbox[1]) code |= 4; // bottom
  else if (p[1] > bbox[3]) code |= 8; // top

  return code;
}