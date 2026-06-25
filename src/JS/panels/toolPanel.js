import { createDOMElement } from "../display/model";
import { BasicShapes } from "../shapes/basic/shape";
import { FreeHandShape } from "../shapes/patterns/freehand";
import { LineShape } from "../shapes/patterns/line";

class ToolPanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;

  #Active = "select";

  #tools = {
    select: {
      type: "button",
      attributes: { "data-tool": "select", title: "Select (V)" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><path d="M3 1l4.5 13L9 9l5 2z"></path></svg>',
    },
    RectShape: BasicShapes.RectShape.btn(),
    EllipseShape: BasicShapes.EllipseShape.btn(),
    line: LineShape.btn(),
    freehand: FreeHandShape.btn(),
    pan: {
      type: "button",
      attributes: { "data-tool": "pan", title: "Pan (H / Space)" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><text x="1" y="13" font-size="12" fill="currentColor">✋</text></svg>',
    },
  };

  constructor(elmP, callback) {
    this.#elmP = elmP;
    this.#callback = callback;
    this.#elm = this.#elmP.querySelector("li#tool_ctn");

    this.#init();
  }

  #setSelected(Elm, val) {
    const active = this.#elmP.querySelector("button.active");
    if (active) active.classList.remove("active");

    this.#Active = val;
    Elm.classList.add("active");

    this.#callback({ action: "setTool", tool: this.#Active });
  }

  #init() {
    this.#build();
    this.#eventListener();
  }

  #build() {
    for (const key in this.#tools) {
      const { type, attributes, innerhtml } = this.#tools[key];
      this.#tools[key]["elm"] = createDOMElement({
        type,
        attributes,
        innerhtml,
      });
      this.#elm.appendChild(this.#tools[key]["elm"]);
    }
  }

  #eventListener() {
    for (const key in this.#tools) {
      const { elm } = this.#tools[key];
      elm.addEventListener("click", (evt) => {
        this.#setSelected(elm, key);
      });
    }
  }
}

export { ToolPanel };
