import { ToolPanel } from "../panels/toolPanel";
import { ZoomPanel } from "../panels/zoomPanel";

class BottomNav {
  #callback = () => {};
  #elm = null;
  #main = null;
  constructor({ elm, main, callback }) {
    this.#elm = elm;
    this.#main = main;
    this.#callback = callback;

    new ZoomPanel(this.#elm, this.#callback);
    new ToolPanel(this.#elm, this.#callback);

    this.#init();
  }

  #init() {}
}

export { BottomNav };
