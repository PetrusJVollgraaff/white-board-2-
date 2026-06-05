import { createDOMElement } from "../display/model";
import { FilePanel } from "../panels/filePanel";
import { HistoryPanel } from "../panels/historyPanel";
import { RulerPanel } from "../panels/rulerPanel";
import { ViewportSizePanel } from "../panels/ViewportSizePanel";
import { ToolPanel } from "../panels/toolPanel";
import { ZoomPanel } from "../panels/zoomPanel";
import { EditPanel } from "../panels/editPanel";

class TopNav {
  #callback = () => {};
  #elm = null;
  #main = null;
  #fileshow = false;
  #elmFile = null;
  #dropFileElm = null;
  constructor({ elm, main, callback }) {
    this.#elm = elm;
    this.#main = main;
    this.#callback = callback;
    this.#init();
  }

  #init() {
    this.#buildFileDrop();
    new ViewportSizePanel(this.#elm, this.#callback);
    new RulerPanel(this.#elm, this.#callback);
    new HistoryPanel(this.#elm, this.#callback);
    new EditPanel(this.#elm, this.#callback);

    this.#eventListener();
  }

  #buildFileDrop() {
    this.#elmFile = this.#elm.querySelector("li#file_ctn");

    this.#elmFile.style.position = "relative";
    this.#elmFile.style.cursor = "pointer";

    this.#elmFile.appendChild(
      createDOMElement({
        type: "span",
        attributes: { class: "tlbl" },
        text: "File",
      }),
    );

    this.#dropFileElm = createDOMElement({
      type: "ul",
      attributes: { class: "dropbox", "data-s": this.#fileshow },
    });

    this.#elmFile.appendChild(this.#dropFileElm);

    new FilePanel(this.#dropFileElm, this.#callback);
  }

  #eventListener() {
    this.#elmFile.addEventListener("click", () => {
      this.#fileshow = !this.#fileshow;
      this.#dropFileElm.setAttribute("data-s", this.#fileshow);
    });
  }
}

export { TopNav };
