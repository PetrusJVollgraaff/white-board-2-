import { createDOMElement } from "../display/model";

class FilePanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;

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
    this.#saveBtn = createDOMElement({ type: "li", text: "💾 Save" });
    this.#loadBtn = createDOMElement({ type: "li", text: "📂 Load" });
    this.#exportBtn = createDOMElement({ type: "li", text: "⬇ Export" });
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

    this.#elmP.appendChild(this.#saveBtn);
    this.#elmP.appendChild(this.#loadBtn);
    this.#elmP.appendChild(this.#exportBtn);
    //this.#dropdownElm.appendChild(this.#formSlct);
  }

  #eventListener() {
    this.#saveBtn.addEventListener("click", () => {
      this.#callback({ action: "setFile", value: "save" });
    });

    this.#loadBtn.addEventListener("click", () => {
      FilePanel.loadFile({ accept: ".json" }, (data) => {
        this.#callback({ ...{ action: "setFile", value: "load" }, ...data });
      });
    });

    this.#exportBtn.addEventListener("click", () =>
      this.#callback({ action: "setFile", value: "export" }),
    );

    this.#formSlct.addEventListener("change", (evt) => {
      const format = evt.target.value;
      this.#callback({ action: "setFile", value: "format", format });
    });
  }
}
export { FilePanel };
