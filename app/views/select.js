import { me } from "appbit";
import document from "document";
import * as config from "../config";
import { Application, View, $at } from "../lib/view";

const $ = $at("#view-select");

export class ViewSelect extends View {
  el = $();

  constructor() {
    this.btnStart = $("#btnStart");
    this.btnConfig = $("#btnConfig");
    this.lblTitle = $("#lblTitle");

    super();
  }

  handleStart = () => {
    Application.switchTo("ViewExercise");
  }

  handleConfig = () => {
    Application.switchTo("ViewConfig");
  }

  handleKeypress = (evt) => {
    if (evt.key === "down") this.handleStart();
  }

  onMount() {
    me.appTimeoutEnabled = false; // Disable timeout

    this.btnStart.addEventListener("click", this.handleStart);
    this.btnConfig.addEventListener("click", this.handleConfig);
    document.addEventListener("keypress", this.handleKeypress);
  }

  onRender() {
    this.lblTitle.text = config.exerciseType;
  }

  onUnmount() {
    this.btnStart.removeEventListener("click", this.handleStart);
    this.btnConfig.removeEventListener("click", this.handleConfig);
    document.removeEventListener("keypress", this.handleKeypress);
  }
}
