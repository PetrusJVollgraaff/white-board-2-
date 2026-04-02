import { SizePanel } from "../panels/sizePanel";
import { ZoomPanel } from "../panels/zoomPanel";

class TopNav {
  #callback = () => {};
  #elmP = null;
  constructor(elmP, callback) {
    this.#elmP = elmP;
    this.#callback = callback;

    new SizePanel(this.#elmP, this.#callback);
    new ZoomPanel(this.#elmP, this.#callback);

    this.showRulers = this.#elmP.querySelector("#chk-rulers");

    this.#init();
  }

  #init() {}
}

export { TopNav };
