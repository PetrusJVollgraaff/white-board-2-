import { FilePanel } from "../panels/filePanel";
import { HistoryPanel } from "../panels/historyPanel";
import { RulerPanel } from "../panels/rulerPanel";
import { SizePanel } from "../panels/sizePanel";
import { ToolPanel } from "../panels/toolPanel";
import { ZoomPanel } from "../panels/zoomPanel";

class TopNav {
  #callback = () => {};
  #elm = null;
  #main = null;
  constructor({ elm, main, callback }) {
    this.#elm = elm;
    this.#main = main;
    this.#callback = callback;

    new SizePanel(this.#elm, this.#callback);
    new ZoomPanel(this.#elm, this.#callback);
    new RulerPanel(this.#elm, this.#callback);
    new ToolPanel(this.#elm, this.#callback);
    new HistoryPanel(this.#elm, this.#callback);
    new FilePanel(this.#elm, this.#callback);

    this.#init();
  }

  #init() {}
}

export { TopNav };
