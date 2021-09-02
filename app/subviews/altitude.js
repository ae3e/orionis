/*
  Watch the barometer to calculate altitude.
*/
import { Barometer  } from "barometer";
import * as utils from "../lib/utils";
import { View, $at } from "../lib/view";

export default class Altitude extends View {
  constructor(parent) {
    if (!parent) throw new Error("Barometer parent element is undefined");
    this.bar = new Barometer();
    const $ = $at(parent);
    this.label = $("#lblAltitude");
    this.units = $("#lblAltitudeUnits")

    const $2 = $at("#view-exercise");
    this.lblAltitudeMin = $2("#lblAltitudeMinBaro");
    this.lblAltitudeMax = $2("#lblAltitudeMaxBaro");
    this.lblAltitudeGain = $2("#lblAltitudeGainBaro");
    //this.lblAltitudeLoss = $2("#lblAltitudeLoss");
    //this.lblAltitudeMinUnits = $("#lblAltitudeMinUnits");

    this.prepreviousAltitude = null;
    this.previousAltitude = null;
    this.currentAltitude = null;
    this.altitudeMin = null;
    this.altitudeMax = null;
    this.altitudeGain = 0;
    this.altitudeLoss = 0;
    super();
  }

  onMount() {
    this.refreshIntervalId = setInterval(() => {
      this.prepreviousAltitude = this.previousAltitude;
      this.previousAltitude = this.currentAltitude;
      this.currentAltitude = utils.convertPressureToAltitude(this.bar.pressure / 100,"m","ft")
      if(this.prepreviousAltitude && this.previousAltitude){
        //console.log(this.currentAltitude.value+' '+this.previousAltitude.value || 0)
        let diff = this.prepreviousAltitude.value - this.currentAltitude.value;
        diff<0?this.altitudeGain+=diff:this.altitudeLoss+=diff
        if(!this.altitudeMax)this.altitudeMax = this.currentAltitude.value
        if(!this.altitudeMin)this.altitudeMin = this.currentAltitude.value
        if(this.currentAltitude.value>this.altitudeMax)this.altitudeMax = this.currentAltitude.value
        if(this.currentAltitude.value<this.altitudeMin)this.altitudeMin = this.currentAltitude.value
      }
    }, 1000);
    this.bar.start();
  }

  onUnmount() {
    clearInterval(this.refreshIntervalId);
    this.bar.stop()
  }

  onRender() {

    let altitude = utils.convertPressureToAltitude(this.bar.pressure / 100,"m","ft")
    this.label.text = altitude.value;
    this.units.text = `altitude ${altitude.units}`
    /*let altitudeMax = Math.max(...this.altitudes)
    let altitudeMin = Math.min(...this.altitudes)
    let altitudeGain = 0;
    let altitudeLoss = 0;
    this.altitudes.forEach((elt,i,arr)=>{
      if(i>0){
        let diff = arr[i]-arr[i-1];
        diff>0?altitudeGain+=diff:altitudeLoss+=diff
      }
    })*/

    this.lblAltitudeMin.text = this.altitudeMin;
    this.lblAltitudeMax.text = this.altitudeMax;
    this.lblAltitudeGain.text = this.altitudeGain;
    //this.lblAltitudeLoss.text = this.altitudeLoss;

    //this.lblAltitudeMinUnits.text = `min ${altitude.units}`
    //console.log(this.altitudeMin+' '+this.altitudeMax+' '+this.altitudeGain+' '+this.altitudeLoss)
  }
}
