import { createDOMElement } from "../display/model";
import { StarShapes as SS } from "../shapes/star/shape";

class StarShapePanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;

  #tools = {
    Star5Point: SS.Star5Point.btn(),
    Star6Point: SS.Star6Point.btn(),
    Star8Point: SS.Star8Point.btn(),
    Star12Point: SS.Star12Point.btn(),
    Star24Point: SS.Star24Point.btn(),
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

export { StarShapePanel };
