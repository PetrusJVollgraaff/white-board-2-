import { FreeHandShape } from "../shapes/patterns/freehand";
import { LineShape } from "../shapes/patterns/line";
import { Shape } from "../shapes/shape";
import { TextShape } from "../shapes/text/shape";
import { ShapeFactory } from "../utils/shapeFactory";
import { Vector } from "../utils/vector";

class FreeHandTool {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;

    const { target } = evt;
    if (evt.button == 0) {
      const vp = _.vpPt(evt);
      const startPoint = _._vp.toDoc(vp.x, vp.y);
      const ShapeClass = ShapeFactory.newShape(_.getActiveTool);
      let shape = new ShapeClass({ startPoint }, _.ShapeCallback.bind(_));

      const moveCallback = function (evt) {
        const vp = _.vpPt(evt);
        const mousePos = _._vp.toDoc(vp.x, vp.y);
        const { center, size } = Shape.getCenterAndSize(startPoint, mousePos);

        shape.addPoint = mousePos;

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

class LineTool {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;

    const { target } = evt;
    if (evt.button == 0) {
      const vp = _.vpPt(evt);
      const corner1 = _._vp.toDoc(vp.x, vp.y);
      const ShapeClass = ShapeFactory.newShape(_.getActiveTool);
      let shape = new ShapeClass({ corner1 }, _.ShapeCallback.bind(_));

      const moveCallback = function (evt) {
        const vp = _.vpPt(evt);
        shape.setCorner2 = _._vp.toDoc(vp.x, vp.y);
        _.render([shape]);
      };

      const upCallback = function (evt) {
        target.removeEventListener("pointermove", moveCallback);
        target.removeEventListener("pointerup", upCallback);
        shape.recenter();
        _.appendShape(shape);
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

class TextTool {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;

    const { target } = evt;
    if (evt.button == 0) {
      const vp = _.vpPt(evt);
      const center = _._vp.toDoc(vp.x, vp.y);
      const ShapeClass = ShapeFactory.newShape(_.getActiveTool);
      let shape = new ShapeClass({ center }, _.ShapeCallback.bind(_));

      _.appendShape(shape);
      _.render();
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

class PanTools {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;
    const { target } = evt;
    if (evt.button == 1) return;
    const offset = _._vp.getOffset;
    const mouseStart = new Vector({ x: evt.clientX, y: evt.clientY });

    const moveCallback = function (evt) {
      const mouseMove = new Vector({ x: evt.clientX, y: evt.clientY });
      const newPos = Vector.add(offset, Vector.subtract(mouseMove, mouseStart));

      _._vp.setOffset = newPos;
      _.setOffset = newPos;

      _.render();
    };
    const upCallback = function (evt) {
      target.removeEventListener("pointermove", moveCallback);
      target.removeEventListener("pointerup", upCallback);
      _.render();
    };

    target.addEventListener("pointermove", moveCallback);
    target.addEventListener("pointerup", upCallback);
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

class SelectTool {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;

    if (evt.button == 1) return;

    const { ctrlKey, shiftKey, target } = evt;
    const vp = _.vpPt(evt);
    const startPos = _._vp.toDoc(vp.x, vp.y);

    const shape = _.getShape(startPos);
    const selectionShape = _.getSelections(startPos);
    const adjustmentShape = _.getAdjustments(startPos);

    if (selectionShape) {
      const { selections } = selectionShape;
      const handle = selections.isSelected(this.getmainCtx, startPos);
      if (handle) {
        selections.addEventListeners(target, startPos, handle, _);
        return;
      }
    }

    if (adjustmentShape) {
      const { adjustments } = adjustmentShape;
      const handle = adjustments.isSelected(this.getmainCtx, startPos);
      if (handle) {
        adjustments.addEventListeners(target, startPos, handle, _);
        return;
      }
    }

    const isClickingSelectedShape = shape && shape.selected;

    if (!isClickingSelectedShape) {
      if (!ctrlKey && !shiftKey) _.setItemsUnselect = false;
    }

    if (!shape) {
      _.setItemsUnselect = false;
      _.render();
      return;
    }

    if (!isClickingSelectedShape) {
      shape.select();
      if (shape instanceof TextShape) {
        _.ShapeCallback({
          event: {
            name: "TextSelected",
            detail: { shape, clickedPoint: startPos },
          },
        });
      }
    }

    const OldCenter = shape.getCenter;
    let mouseDelta = null;
    let isDragging = false;

    _.rightNav.setSize = shape.getSize;
    _.rightNav.setColor = shape.getColor;

    const moveCallback = function (evt) {
      const vp = _.vpPt(evt);
      const mousePos = _._vp.toDoc(vp.x, vp.y);
      mouseDelta = Vector.subtract(mousePos, startPos);

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
        if (isDragging && _._vp.getAdjustedScale(mouseDelta).magnitude() > 0) {
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

  static configureEventListener(viewport, main) {
    this.#Event = this.addPointerDownListener.bind(main);
    viewport.addEventListener("pointerdown", this.#Event);
  }

  static removeEventListeners(viewport) {
    viewport.removeEventListener("pointerdown", this.#Event);
    this.#Event = null;
  }
}

class ShapeTool {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;

    const { target } = evt;
    if (evt.button == 0) {
      const vp = _.vpPt(evt);
      const startPos = _._vp.toDoc(vp.x, vp.y);
      let shape = null;

      const moveCallback = function (evt) {
        const vp = _.vpPt(evt);
        const mousePos = _._vp.toDoc(vp.x, vp.y);
        const { center, size } = Shape.getCenterAndSize(startPos, mousePos);

        if (shape) {
          shape.setCenter = { center, save: false };
          shape.setSize = { ...size, ...{ save: false } };
        } else {
          const ShapeClass = ShapeFactory.newShape(_.getActiveTool);
          shape = new ShapeClass(
            {
              center,
              size,
            },
            _.ShapeCallback.bind(_),
          );
        }

        _.render([shape]);
      };

      const upCallback = function (evt) {
        target.removeEventListener("pointermove", moveCallback);
        target.removeEventListener("pointerup", upCallback);
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

export { FreeHandTool, LineTool, PanTools, SelectTool, ShapeTool, TextTool };
