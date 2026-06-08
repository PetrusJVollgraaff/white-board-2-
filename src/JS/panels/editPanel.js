import { createDOMElement } from "../display/model";

class EditPanel {
  #callback = () => {};
  #elmP = null;

  #tools = {
    copy: { text: "Copy", attributes: { title: "Copy (Ctrl+C)" } },
    paste: { text: "Paste", attributes: { title: "Paste (Ctrl+V)" } },
    duplicate: {
      text: "Duplicate",
      attributes: { title: "Duplicate (Ctrl+D)" },
    },
    selectall: { text: "Select All", attributes: { title: "Select All" } },
    unselectall: {
      text: "Unselect All",
      attributes: { title: "Unselect All" },
    },
  };

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
        this.#callback({ action: "setEdit", value });
      });
    }
  }
}

export { EditPanel };
