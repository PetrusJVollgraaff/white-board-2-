import { Vector } from "../utils/vector";

class SelectTool {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;

    const { target } = evt;
    if (evt.button == 0) {
      const { ctrlKey, shiftKey } = evt;
      const vp = _.vpPt(evt);
      const startPosition = _._vp.toDoc(vp.x, vp.y);
      const shape = _.getShape(startPosition);
      const selection = _.getSelections(startPosition);

      if (selection) {
        const handle = selection.isSelected(this.getmainCtx, startPosition);
        selection.addEventListeners(target, startPosition, handle, _);
        return;
      }

      const isClickingSelectedShape = shape && shape.selected;

      if (!isClickingSelectedShape) {
        if (!ctrlKey && !shiftKey) _.setItemsUnselect = false;
      }

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
        mouseDelta = Vector.subtract(mousePosition, startPosition);

        isDragging = true;
        shape.setCenter = {
          center: Vector.add(OldCenter, mouseDelta),
          save: false,
        };
        _.rightNav.setSize = { ...shape.getSize, ...{ save: false } };

        _.render();
      };
      const upCallback = function (evt) {
        target.removeEventListener("pointermove", moveCallback);
        target.removeEventListener("pointerup", upCallback);

        if (isClickingSelectedShape && !isDragging) {
          shape.unselect();
        }

        if (mouseDelta) {
          if (
            isDragging &&
            _._vp.getAdjustedScale(mouseDelta).magnitude() > 0
          ) {
            _.rightNav.setSize = shape.getSize;
            shape.setCenter = {
              center: Vector.add(OldCenter, mouseDelta),
            };
          }
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
