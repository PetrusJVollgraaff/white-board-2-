import { createDOMElement } from "../display/model";

class EditPanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;

  #copyBtn = null;
  #pasteBtn = null;
  #dupBtn = null;

  #selectAllBtn = null;
  #unselectAllBtn = null;
  constructor(elmP, callback) {
    this.#elmP = elmP;
    this.#callback = callback;
    this.#elm = this.#elmP.querySelector("li#edit_ctn");

    this.#init();
  }

  #init() {
    this.#build();
    this.#eventListener();
  }

  #build() {
    this.#copyBtn = createDOMElement({
      type: "button",
      attributes: { title: "Copy (Ctrl+C)" },
      text: "Copy",
    });
    this.#pasteBtn = createDOMElement({
      type: "button",
      attributes: { title: "Paste (Ctrl+V)" },
      text: "Paste",
    });
    this.#dupBtn = createDOMElement({
      type: "button",
      attributes: { title: "Delete (Ctrl+D)" },
      text: "Duplicate",
    });

    this.#selectAllBtn = createDOMElement({
      type: "button",
      attributes: { title: "Select All" },
      text: "Select All",
    });

    this.#unselectAllBtn = createDOMElement({
      type: "button",
      attributes: { title: "Unselect All" },
      text: "Unselect All",
    });

    this.#elm.appendChild(this.#copyBtn);
    this.#elm.appendChild(this.#pasteBtn);
    this.#elm.appendChild(this.#dupBtn);
    this.#elm.appendChild(this.#selectAllBtn);
    this.#elm.appendChild(this.#unselectAllBtn);
  }

  #eventListener() {
    this.#copyBtn.addEventListener("click", () => {
      this.#callback({ action: "setEdit", value: "copy" });
    });

    this.#pasteBtn.addEventListener("click", () => {
      this.#callback({ action: "setEdit", value: "paste" });
    });

    this.#dupBtn.addEventListener("click", () =>
      this.#callback({ action: "setEdit", value: "duplicate" }),
    );

    this.#selectAllBtn.addEventListener("click", () =>
      this.#callback({ action: "setEdit", value: "selectAll" }),
    );

    this.#unselectAllBtn.addEventListener("click", () =>
      this.#callback({ action: "setEdit", value: "unSelectAll" }),
    );
  }
}

export { EditPanel };
