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
    super();
  }

  onMount() {
    this.bar.start();
  }

  onUnmount() {
    this.bar.stop()
  }

  onRender() {
    let altitude = utils.convertPressureToAltitude(this.bar.pressure / 100,"m","ft")
    this.label.text = altitude.value;
    this.units.text = `altitude ${altitude.units}`
  }
}
