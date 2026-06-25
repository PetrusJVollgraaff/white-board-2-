import { createDOMElement } from "../display/model";
import { AngleTriangle } from "../shapes/basic/angletriangle";
import { CrossShape } from "../shapes/basic/crossshape";
import { EllipseShape } from "../shapes/basic/ellipse";
import { Hexagon } from "../shapes/basic/hexagon";
import { IsoscelesTriangle } from "../shapes/basic/isoscelestriangle";
import { Octagon } from "../shapes/basic/octagon";
import { Pentagon } from "../shapes/basic/pentagon";
import { RectShape } from "../shapes/basic/rectangle";

class BasicShapePanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;

  #tools = {
    RectShape: RectShape.btn(),
    EllipseShape: EllipseShape.btn(),
    IsoscelesTriangle: IsoscelesTriangle.btn(),
    AngleTriangle: AngleTriangle.btn(),
    Octagon: Octagon.btn(),
    Pentagon: Pentagon.btn(),
    Hexagon: Hexagon.btn(),
    CrossShape: CrossShape.btn(),
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
