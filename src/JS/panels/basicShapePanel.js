import { createDOMElement } from "../display/model";

class BasicShapePanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;

  #tools = {
    rect: {
      type: "button",
      attributes: { "data-tool": "rect", title: "Select (R)" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><rect x="2" y="4" width="12" height="8" fill="none" stroke="currentColor" stroke-width="1.5"></rect></svg>',
    },
    ellipse: {
      type: "button",
      attributes: { "data-tool": "ellipse", title: "Ellipse (E)" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="6" ry="4" fill="none" stroke="currentColor" stroke-width="1.5"></ellipse></svg>',
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
      const { attributes, text, innerhtml } = this.#tools[key];
      this.#tools[key]["btn"] = createDOMElement({
        type: "button",
        attributes,
        text,
        innerhtml,
      });

      this.#tools[key]["li"] = createDOMElement({ type: "li" });
      this.#tools[key]["li"].appendChild(this.#tools[key]["btn"]);
      this.#elmP.appendChild(this.#tools[key]["li"]);
    }
  }

  #eventListener() {
    for (const tool in this.#tools) {
      this.#tools[tool].btn.addEventListener("click", (e) => {
        this.#callback({ action: "setTool", tool });
      });
    }
  }
}

export { BasicShapePanel };
