import { createDOMElement } from "../display/model";

class FilePanel {
  #callback = () => {};
  #elmP = null;

  #tools = {
    save: { text: "💾 Save" },
    load: { text: "📂 Load" },
    export: { text: "⬇ Export" },
  };

  #saveBtn = null;
  #loadBtn = null;
  #exportBtn = null;
  #formSlct = null;
  #exportOptions = [
    { name: "PNG", value: "png" },
    { name: "JPEG", value: "jpeg" },
    { name: "SVG", value: "svg" },
  ];

  static loadFile(attr, callback) {
    const attributes = { ...{ type: "file" }, ...attr };
    const input = createDOMElement({ type: "input", attributes });

    input.click();

    input.addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const { name } = f.name;

      const r = new FileReader();
      r.onload = (ev) => {
        const { result } = ev.target;
        callback({ result, name });
        input.remove();
      };

      r.readAsText(f);
    });
  }

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
      const { text } = this.#tools[key];
      this.#tools[key]["elm"] = createDOMElement({ type: "li", text });

      this.#elmP.appendChild(this.#tools[key]["elm"]);
    }

    this.#formSlct = createDOMElement({
      type: "select",
      attributes: { name: "sel-fmt" },
    });
    for (const opt of this.#exportOptions) {
      this.#formSlct.appendChild(
        createDOMElement({
          type: "option",
          attributes: { value: opt.value },
          text: opt.name,
        }),
      );
    }

    //this.#dropdownElm.appendChild(this.#formSlct);
  }

  #eventListener() {
    for (const value in this.#tools) {
      if (value == "load") {
        this.#tools[value].elm.addEventListener("click", (e) => {
          console.log(e);
          e.preventDefault();
          e.stopPropagation();

          FilePanel.loadFile({ accept: ".json" }, (data) => {
            this.#callback({ ...{ action: "setFile", value }, ...data });
          });
        });
      } else {
        this.#tools[value].elm.addEventListener("click", (e) => {
          this.#callback({ action: "setFile", value });
        });
      }
    }

    this.#formSlct.addEventListener("change", (evt) => {
      const format = evt.target.value;
      this.#callback({ action: "setFile", value: "format", format });
    });
  }
}
export { FilePanel };
