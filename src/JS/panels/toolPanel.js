import { createDOMElement } from "../display/model";

class ToolPanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;

  #Active = "select";

  #SelectBtn = null;
  #RectBtn = null;
  #EllipseBtn = null;
  #LineBtn = null;
  #FreeHandBtn = null;
  #PanBtn = null;

  #tools = {
    select: {
      type: "button",
      attributes: { "data-tool": "select", title: "Select (V)" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><path d="M3 1l4.5 13L9 9l5 2z"></path></svg>',
    },
    RectShape: {
      type: "button",
      attributes: { "data-tool": "rect", title: "Select (R)" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><rect x="2" y="4" width="12" height="8" fill="none" stroke="currentColor" stroke-width="1.5"></rect></svg>',
    },
    EllipseShape: {
      type: "button",
      attributes: { "data-tool": "ellipse", title: "Ellipse (E)" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="6" ry="4" fill="none" stroke="currentColor" stroke-width="1.5"></ellipse></svg>',
    },
    line: {
      type: "button",
      attributes: { "data-tool": "line", title: "Line (L)" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><line x1="2" y1="14" x2="14" y2="2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></line></svg>',
    },
    freehand: {
      type: "button",
      attributes: { "data-tool": "freehand", title: "Freehand (F)" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><path d="M2 14 Q4 2 8 8 Q12 14 14 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>',
    },
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
