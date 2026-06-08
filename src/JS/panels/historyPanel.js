import { createDOMElement } from "../display/model";

class HistoryPanel {
  #callback = () => {};
  #elmP = null;

  #tools = {
    undo: { text: "↩ Undo", attributes: { title: "Undo (Ctrl+Z)" } },
    redo: { text: "↪ Redo", attributes: { title: "Redo (Ctrl+Y)" } },
    delete: { text: "🗑 Delete", attributes: { title: "Delete (Del)" } },
  };

  #undoBtn = null;
  #redoBtn = null;
  #delBtn = null;
  constructor(elmP, callback) {
    this.#elmP = elmP;
    this.#callback = callback;

    this.#init();
  }

  #init() {
    this.#build();
    this.#eventListener();
  }

  #build() {
    for (const key in this.#tools) {
      const { attributes, text } = this.#tools[key];
      this.#tools[key]["elm"] = createDOMElement({
        type: "li",
        attributes,
        text,
      });

      this.#elmP.appendChild(this.#tools[key]["elm"]);
    }
  }

  #eventListener() {
    for (const value in this.#tools) {
      this.#tools[value].elm.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.#callback({ action: "setHistory", value });
      });
    }
  }
}
export { HistoryPanel };
