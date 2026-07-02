import { ArrowShapePanel } from "../../panels/arrowShapePanel";
import { BasicShapePanel } from "../../panels/basicShapePanel";
import { ImagePanel } from "../../panels/imagePanel";
import { StarShapePanel } from "../../panels/starShapePanel";
import { ToolPanel } from "../../panels/toolPanel";
import { ZoomPanel } from "../../panels/zoomPanel";
import { DropDown } from "../dropdown";

class BottomNav {
  #callback = () => {};
  #elm = null;
  #main = null;
  #tooPanel = null;
  constructor({ elm, main, callback }) {
    this.#elm = elm;
    this.#main = main;
    this.#callback = callback;

    this.#init();
  }

  #init() {
    this.#tooPanel = new ToolPanel(this.#elm, this.#callback);
    this.#buildBasicShapeDrop();
    this.#buildArrowShapeDrop();
    this.#buildStarShapeDrop();
    new ZoomPanel(this.#elm, this.#callback);
    new ImagePanel(this.#elm, this.#main, (shape) => {
      this.#main.appendShape(shape);
    });
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
        new BasicShapePanel(dropElm, (data) => {
          if (data.action == "setTool") this.#tooPanel.setSelected = null;
          this.#callback(data);
        });
      },
    });
  }

  #buildArrowShapeDrop() {
    new DropDown({
      elm: this.#elm.querySelector("li#arrowshape_ctn"),
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="0,0 11,0 16,8 11,16 0,16" fill="none" stroke="currentColor" stroke-width="1.5"/></polygon></svg>',
      html: "button",
      dir: "up",
      extraclass: ["grid_dropdown"],
      callback: (dropElm) => {
        new ArrowShapePanel(dropElm, (data) => {
          if (data.action == "setTool") this.#tooPanel.setSelected = null;
          this.#callback(data);
        });
      },
    });
  }

  #buildStarShapeDrop() {
    new DropDown({
      elm: this.#elm.querySelector("li#starshape_ctn"),
      innerhtml:
        '<svg viewBox="0 0 16 16"><rect x="2" y="4" width="12" height="8" fill="none" stroke="currentColor" stroke-width="1.5"></rect></svg>',
      html: "button",
      dir: "up",
      extraclass: ["grid_dropdown"],
      callback: (dropElm) => {
        new StarShapePanel(dropElm, (data) => {
          if (data.action == "setTool") this.#tooPanel.setSelected = null;
          this.#callback(data);
        });
      },
    });
  }
}

export { BottomNav };
