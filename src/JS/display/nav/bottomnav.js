import { BasicShapePanel } from "../../panels/basicShapePanel";
import { ToolPanel } from "../../panels/toolPanel";
import { ZoomPanel } from "../../panels/zoomPanel";
import { DropDown } from "../dropdown";

class BottomNav {
  #callback = () => {};
  #elm = null;
  #main = null;
  constructor({ elm, main, callback }) {
    this.#elm = elm;
    this.#main = main;
    this.#callback = callback;

    this.#init();
  }

  #init() {
    this.#buildBasicShapeDrop();
    new ZoomPanel(this.#elm, this.#callback);
    new ToolPanel(this.#elm, this.#callback);
  }

  #buildBasicShapeDrop() {
    new DropDown({
      elm: this.#elm.querySelector("li#basicshape_ctn"),
      innerhtml:
        '<svg viewBox="0 0 16 16"><rect x="2" y="4" width="12" height="8" fill="none" stroke="currentColor" stroke-width="1.5"></rect></svg>',
      html: "button",
      dir: "up",
      extraclass: ["grid_dropdown"],
      callback: (dropElm) => {
        new BasicShapePanel(dropElm, this.#callback);
      },
    });
  }
}

export { BottomNav };
