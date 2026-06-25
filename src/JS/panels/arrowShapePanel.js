import { createDOMElement } from "../display/model";
import { ArrowShapes as AS } from "../shapes/arrow/shape";

class ArrowShapePanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;

  #tools = {
    BlockArrow1: AS.BlockArrow1.btn(),
    BlockArrow2: AS.BlockArrow2.btn(),
    BlockArrow3: AS.BlockArrow3.btn(),
    BlockArrow4: AS.BlockArrow4.btn(),
    BlockArrow5: AS.BlockArrow5.btn(),
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

export { ArrowShapePanel };
