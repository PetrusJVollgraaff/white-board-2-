import { LineShape } from "../shapes/patterns/line";
import { Shape } from "../shapes/shape";
import { Vector } from "../utils/vector";

class LineTool {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;

    const { target } = evt;
    if (evt.button == 0) {
      const vp = _.vpPt(evt);
      const startPosition = _._vp.toDoc(vp.x, vp.y);
      let shape = null;

      const moveCallback = function (evt) {
        const vp = _.vpPt(evt);
        const mousePosition = _._vp.toDoc(vp.x, vp.y);

        shape = new LineShape({
          corner1: startPosition,
          callback: _.ShapeCallback.bind(_),
        });

        shape.setCorner2 = mousePosition;

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

export { LineTool };
