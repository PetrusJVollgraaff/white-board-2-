import { FreeHandShape } from "../shapes/patterns/freehand";
import { Shape } from "../shapes/shape";
import { Vector } from "../utils/vector";

class FreeHandTool {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;

    const { target } = evt;
    if (evt.button == 0) {
      const vp = _.vpPt(evt);
      const startPoint = _._vp.toDoc(vp.x, vp.y);
      let shape = new FreeHandShape(
        {
          startPoint,
        },
        _.ShapeCallback.bind(_),
      );

      const moveCallback = function (evt) {
        const vp = _.vpPt(evt);
        const mousePosition = _._vp.toDoc(vp.x, vp.y);
        const { center, size } = Shape.getCenterAndSize(
          startPoint,
          mousePosition,
        );

        shape.addPoint = mousePosition;

        _.render([shape]);
      };

      const upCallback = function (evt) {
        target.removeEventListener("pointermove", moveCallback);
        target.removeEventListener("pointerup", upCallback);
        shape.recenter();
        _.appendShape(shape);
        //if (shape?.size.width > 0 && shape?.size.height > 0) {}
      };

      _.render();

      target.addEventListener("pointermove", moveCallback);
      target.addEventListener("pointerup", upCallback);
    }
  }

  static configureEventListener(viewport, main) {
    this.#Event = this.addPointerDownListener.bind(main);
    viewport.addEventListener("pointerdown", this.#Event);
  }

  static removeEventListeners(viewport) {
    viewport.removeEventListener("pointerdown", this.#Event);
    this.#Event = null;
  }
}

export { FreeHandTool };
