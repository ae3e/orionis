import document from "document";
import {Application, View, $at } from "../lib/view";
import Clock from "../subviews/clock";
import * as config from "../config";

const $ = $at("#view-config");

export class ViewConfig extends View {
  el = $();
  btnOK = $("#btnOK");

  handleRefresh = () => {
    this.render();
  }

  handleBack = () => {
    let container = document.getElementById("type-cycle");

    // Get the selected index
    let currentIndex = container.value;
    console.log(currentIndex);
    config.changeExerciseType('Bike');
    Application.switchTo("ViewSelect");
  }

  handleKeypress = (evt) => {
    evt.preventDefault();
    if (evt.key === "back") this.handleBack();
  }

  onMount() {

    this.clock = new Clock("#subview-clock3", "seconds");
    this.insert(this.clock);
    this.btnOK.addEventListener("click", this.handleBack);
    document.addEventListener("keypress", this.handleKeypress);
  }

  onRender() {

  }

  onUnmount() {
    this.btnOK.removeEventListener("click", this.handleBack);
    document.removeEventListener("keypress", this.handleKeypress);
  }
}
