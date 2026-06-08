import { createDOMElement } from "../model";
import { FilePanel } from "../../panels/filePanel";
import { HistoryPanel } from "../../panels/historyPanel";
import { RulerPanel } from "../../panels/rulerPanel";
import { ViewportSizePanel } from "../../panels/ViewportSizePanel";
import { ToolPanel } from "../../panels/toolPanel";
import { ZoomPanel } from "../../panels/zoomPanel";
import { EditPanel } from "../../panels/editPanel";
import { DropDown } from "../dropdown";

class TopNav {
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
    this.#buildFileDrop();
    this.#buildEditDrop();
    new ViewportSizePanel(this.#elm, this.#callback);
    new RulerPanel(this.#elm, this.#callback);
  }

  #buildFileDrop() {
    new DropDown({
      elm: this.#elm.querySelector("li#file_ctn"),
      title: "File",
      callback: (dropElm) => {
        new FilePanel(dropElm, this.#callback);
      },
    });
  }

  #buildEditDrop() {
    new DropDown({
      elm: this.#elm.querySelector("li#edit_ctn"),
      title: "Edit",
      callback: (dropElm) => {
        new HistoryPanel(dropElm, this.#callback);
        new EditPanel(dropElm, this.#callback);
      },
    });
  }
}

export { TopNav };
