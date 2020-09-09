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
    let exercisTypes=['run','cycling','hiking']
    // Get the selected index
    let currentIndex = container.value;
    console.log(currentIndex);
    if(currentIndex===0){
      document.getElementById("runStats").style.display = "inline";
      document.getElementById("dottest").style.display = "inline";
      //document.getElementById("runStats").style.visbility = "hidden";
      //document.getElementById("runStats").style.visbility = "inline";
    }else{
      document.getElementById("runStats").style.display = "none";
      document.getElementById("dottest").style.display = "none";
      //document.getElementById("runStats").style.visbility = "hidden";
    }
    config.changeExerciseType(exercisTypes[currentIndex]);
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
