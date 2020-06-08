import document from "document";
import exercise from "exercise";

import * as config from "../config";
import { Application, View, $at } from "../lib/view";
import * as utils from "../lib/utils";
import Clock from "../subviews/clock";
import GPS from "../subviews/gps";
import HRM from "../subviews/hrm";
import Popup from "../subviews/popup";

import { readFileSync } from "fs";
import {degrees2meters, decodePolyline, getStats, convertToScreenCoords} from "../../common/lib";

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
  lblCalories = $("#lblCalories");

  data = null;
  

  //var watchID = geolocation.watchPosition(locationSuccess, locationError, { timeout: 60 * 1000 });
  prevPosition = null;
  angle = 0;

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
        exercise.start(config.exerciseName, config.exerciseOptions);
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
        config.exerciseName
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
    //exercise.start(config.exerciseName, config.exerciseOptions);
    this.lblStatus.text = "";
    //this.gps.callback = undefined;




    console.log("Latitude: " + position.coords.latitude +
                  " Longitude: " + position.coords.longitude);
    let mercatorPosition = degrees2meters(position.coords.longitude,position.coords.latitude)
    let screenPosition = convertToScreenCoords([mercatorPosition],this.data.stats)


    let circle = document.getElementById("ionic").getElementsByTagName("circle");
    circle[0].cx=screenPosition[0][0];
    circle[0].cy=screenPosition[0][1];

    let currentPosition = [screenPosition[0][0],screenPosition[0][1]]
    console.log(this.prevPosition)
    console.log(currentPosition)
    if(this.prevPosition===null){
      this.prevPosition = currentPosition
    }else{
      //angle = (Math.atan((currentPosition[0]-prevPosition[0])/(currentPosition[1]-prevPosition[1])))*180/Math.PI;
      this.angle = 90 + Math.atan2(currentPosition[1]-this.prevPosition[1],currentPosition[0]-this.prevPosition[0])*180/Math.PI;

      console.log('angle: '+this.angle)
      this.prevPosition = currentPosition
    }
    //local map
    let distance= this.data.maxDistance + 2 ;
    let bbox=[screenPosition[0][0]-distance,screenPosition[0][0]+distance,screenPosition[0][1]-distance,screenPosition[0][1]+distance]

    //Filtered points in bbox screen plus or minus the distance (6: defined arbitrary).
    //Take a larger area to be able to rotate using orientation calculated with GPS (No compass on Ionic)
      let filtered = this.data.screenCoords.map((elt,i)=>{return [elt[0],elt[1],i];}).filter((elt,i)=>{
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
          let first = [this.data.screenCoords[filtered[0][2]-1][0],this.data.screenCoords[filtered[0][2]-1][1],filtered[0][2]-1]
          filtered.unshift(first);
        }else{
          k=1;
        }
        if(filtered[filtered.length-1][2]!=this.data.screenCoords.length-1){
          let last = [this.data.screenCoords[filtered[filtered.length-1][2]+1][0],this.data.screenCoords[filtered[filtered.length-1][2]+1][1],filtered[filtered.length-1][2]+1]
          filtered.push(last)
        }
        
        while(k<filtered.length-1){
          //console.log('k: '+k);
          //console.log('length '+filtered.length);
          //console.log(JSON.stringify(filtered))
          if(filtered[k][2]+1!=filtered[k+1][2]){
            //console.log(filtered[k][2]+" "+filtered[k+1][2])
            let after = [this.data.screenCoords[filtered[k][2]+1][0],this.data.screenCoords[filtered[k][2]+1][1],filtered[k][2]+1];
            let before = [this.data.screenCoords[filtered[k+1][2]-1][0],this.data.screenCoords[filtered[k+1][2]-1][1],filtered[k+1][2]-1];
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
        group.groupTransform.rotate.angle = -this.angle

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
    console.log(this.data.screenCoords.length)
    let lines = document.getElementById("ionic").getElementsByTagName("line");
    lines.forEach(line=>{
      line.x1=0;
      line.y1=0;
      line.x2=0;
      line.y2=0;
    })
    
    //Limit to 100 points otherwise Error:Jerryscript out of memory.
    //Must be improved : https://github.com/gaperton/ionic-views/blob/master/docs/optimization-guidelines.md
    let sc = this.data.screenCoords.filter((elt,i,arr)=>i%(parseInt(arr.length/100)+1)===0);
    for(let i=0;i<sc.length-1;i++){
      lines[i].x1=sc[i][0];
      lines[i].y1=sc[i][1];
      lines[i].x2=sc[i+1][0];
      lines[i].y2=sc[i+1][1];
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

      let sec = Math.round(3600/speed.value);
      

      //Math.trunc doesn't work??
      const trunc = (n, decimalPlaces) => {
        const decimals = decimalPlaces ? decimalPlaces : 2;
        const asString = n.toString();
        const pos = asString.indexOf('.') != -1 ? asString.indexOf('.') + decimals + 1 : asString.length;
        return parseFloat(n.toString().substring(0, pos));
      };

      let min = (sec/60).toString().split('.')[0];

      const pace = {value: min+':'+(sec-min*60), units:"mpk"};
      this.lblPace.text = pace.value;
      this.lblPaceUnits.text = `pace ${pace.units}`;

      const distance = utils.formatDistance(exercise.stats.distance);
      this.lblDistance.text = distance.value;
      this.lblDistanceUnits.text = `distance ${distance.units==='kilometers'?'km':'miles'}`;

      this.lblActiveTime.text = utils.formatActiveTime(exercise.stats.activeTime);

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