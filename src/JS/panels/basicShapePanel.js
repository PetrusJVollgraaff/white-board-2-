import { createDOMElement } from "../display/model";
import { BasicShapes as BS } from "../shapes/basic/shape";

class BasicShapePanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;

  #tools = {
    RectShape: BS.RectShape.btn(),
    EllipseShape: BS.EllipseShape.btn(),
    IsoscelesTriangle: BS.IsoscelesTriangle.btn(),
    AngleTriangle: BS.AngleTriangle.btn(),
    Octagon: BS.Octagon.btn(),
    Pentagon: BS.Pentagon.btn(),
    Hexagon: BS.Hexagon.btn(),
    CrossShape: BS.CrossShape.btn(),
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
