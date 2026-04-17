import { Vector } from "../utils/vector";

class SelectTool {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;

    const { target } = evt;
    if (evt.button == 0) {
      const vp = _.vpPt(evt);
      const startPosition = _._vp.toDoc(vp.x, vp.y);
      const shape = _.getShape(startPosition);
      const isClickingSelectedShape = shape && shape.selected;

      if (!shape) return;

      if (!isClickingSelectedShape) {
        shape.select();
      }

      const OldCenter = shape.getCenter;
      let mouseDelta = null;
      let isDragging = false;

      _.rightNav.setSize = shape.getSize;
      _.rightNav.setColor = shape.getColor;

      const moveCallback = function (evt) {
        const vp = _.vpPt(evt);
        const mousePosition = _._vp.toDoc(vp.x, vp.y);
        const diff = Vector.subtract(mousePosition, startPosition);

        isDragging = true;
        shape.setCenter = {
          center: Vector.add(OldCenter, diff),
        };

        _.render();
      };
      const upCallback = function (evt) {
        target.removeEventListener("pointermove", moveCallback);
        target.removeEventListener("pointerup", upCallback);

        if (isDragging) {
          _.rightNav.setSize = shape.getSize;
          shape.unselect();
        }

        _.render();
      };

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

export { SelectTool };
