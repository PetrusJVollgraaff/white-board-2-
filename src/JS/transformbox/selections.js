import { Layer } from "../display/Layer";
import { Vector } from "../utils/vector";
import { BoundingBox } from "./boundingBox";

class Selection {
  static nextId = 0;
  hasHandle(id) {
    return this.hasHandle.find((h) => h.id == id);
  }

  isSelected(ctx, mouse) {
    return this.handles.find((h) => h.isSelected(ctx, mouse, this));
  }
}

class SelectionHandle {
  static size = 10;
  static TYPES = {
    TOP: "top",
    RIGHT: "right",
    BOTTOM: "bottom",
    LEFT: "left",
    TOP_LEFT: "topLeft",
    TOP_RIGHT: "topRight",
    BOTTOM_LEFT: "bottomLeft",
    BOTTOM_RIGHT: "bottomRight",
    ROTATE: "rotate",
    CONSTRAIN: "constrain",
  };

  static EXTRA = {
    HANDLE_1: "handle_1",
    HANDLE_2: "handle_2",
    HANDLE_3: "handle_3",
    HANDLE_4: "handle_4",
  };

  constructor(center, type) {
    this.center = center;
    this.type = type;
    this.path = new Path2D();
  }

  isSelected(ctx, mouse, { center, rotation }) {
    let selected = false;

    ctx.save();
    Layer.rotateCanvas(ctx, center, rotation);
    selected = ctx.isPointInPath(this.path, mouse.x, mouse.y);

    ctx.restore();
    return selected;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();

    const { size, TYPES } = SelectionHandle;
    const { x, y } = this.center;
    const isDefaultTypes = Object.values(TYPES).includes(this.type);

    ctx.fillStyle = isDefaultTypes ? "black" : "red";
    ctx.strokeStyle = isDefaultTypes ? "white" : "black";
    ctx.lineWidth = 2;

    if (isDefaultTypes) this.path.rect(x - size / 2, y - size / 2, size, size);
    else this.path.arc(x, y, Math.abs(size / 2), 0, 2 * Math.PI);

    ctx.fill(this.path);
  }
}

class ShapeSelection extends Selection {
  #shape = null;
  center = Vector.zero();
  rotation = 0;
  constrain = false;
  constructor(shape) {
    super();
    this.#shape = shape;
    this.center = shape.getCenter;
    this.rotation = shape.rotation;
    this.constrain = shape.constrain;

    this.#generate();
    shape.selections = this;
  }

  #generate() {
    const { TYPES, size } = SelectionHandle;
    const points = this.#shape.getPoints;
    this.box = BoundingBox.fromPoints(points.map((p) => p.add(this.center)));

    const { topLeft, topRight, bottomLeft, bottomRight } = this.box;
    const rotationPoint = Vector.mid([topLeft, topRight]).subtract(
      new Vector({ x: 0, y: 2 * size }),
    );

    const constrainPoint = new Vector(topRight).subtract(
      new Vector({ x: -2 * size, y: 2 * size }),
    );

    this.handles = [
      new SelectionHandle(topLeft, TYPES.TOP_LEFT),
      new SelectionHandle(topRight, TYPES.TOP_RIGHT),
      new SelectionHandle(bottomLeft, TYPES.BOTTOM_LEFT),
      new SelectionHandle(bottomRight, TYPES.BOTTOM_RIGHT),
      new SelectionHandle(Vector.mid([topLeft, topRight]), TYPES.TOP),
      new SelectionHandle(Vector.mid([bottomLeft, bottomRight]), TYPES.BOTTOM),
      new SelectionHandle(Vector.mid([topLeft, bottomLeft]), TYPES.LEFT),
      new SelectionHandle(Vector.mid([topRight, bottomRight]), TYPES.RIGHT),
      new SelectionHandle(rotationPoint, TYPES.ROTATE),
      new SelectionHandle(constrainPoint, TYPES.CONSTRAIN),
    ];
  }

  update() {
    this.rotation = this.#shape.rotation;
    this.center = this.#shape.getCenter;
    this.constrain = this.#shape.constrain;
    const { size } = SelectionHandle;
    const points = this.#shape.getPoints;
    this.box = BoundingBox.fromPoints(points.map((p) => p.add(this.center)));

    const { topLeft, topRight, bottomLeft, bottomRight } = this.box;
    const rotationPoint = Vector.mid([topLeft, topRight]).subtract(
      new Vector({ x: 0, y: 2 * size }),
    );

    const constrainPoint = new Vector(topRight).subtract(
      new Vector({ x: -2 * size, y: 2 * size }),
    );

    this.handles[0].center = topLeft;
    this.handles[1].center = topRight;
    this.handles[2].center = bottomLeft;
    this.handles[3].center = bottomRight;
    this.handles[4].center = Vector.mid([topLeft, topRight]);
    this.handles[5].center = Vector.mid([bottomLeft, bottomRight]);
    this.handles[6].center = Vector.mid([topLeft, bottomLeft]);
    this.handles[7].center = Vector.mid([topRight, bottomRight]);
    this.handles[8].center = rotationPoint;
    this.handles[9].center = constrainPoint;
  }

  draw(ctx, hitRegion = false) {
    ctx.save();
    ctx.beginPath();

    if (!hitRegion) {
      ctx.rect(
        this.box.topLeft.x,
        this.box.topLeft.y,
        this.box.width,
        this.box.height,
      );
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = "black";
      ctx.lineWidth /= 2;
      ctx.stroke();

      const centerRadius = 0.5 * SelectionHandle.size;
      const centerLength = 2 * Math.PI * centerRadius;
      const dashCount = 3;
      const dashLength = (0.25 * centerLength) / dashCount;
      const spaceLength = (0.75 * centerLength) / dashCount;

      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.setLineDash([dashLength, spaceLength]);
      ctx.arc(this.center.x, this.center.y, centerRadius, 0, 2 * Math.PI);
      ctx.lineCap = "round";
      ctx.strokeStyle = "white";
      ctx.stroke();
      ctx.lineWidth /= 2;
      ctx.strokeStyle = "black";
      ctx.stroke();
      ctx.restore();
    }

    for (const handle of this.handles) {
      handle.draw(ctx, hitRegion);
    }

    ctx.restore();
  }

  #newRatio(handle, ratio) {
    const { TYPES } = SelectionHandle;

    switch (handle) {
      case TYPES.RIGHT:
        return new Vector({ x: ratio.x, y: 1 });
      case TYPES.LEFT:
        return new Vector({ x: 2 - ratio.x, y: 1 });
      case TYPES.TOP:
        return new Vector({ x: 1, y: 2 - ratio.y });
      case TYPES.BOTTOM:
        return new Vector({ x: 1, y: ratio.y });
      case TYPES.TOP_LEFT:
        return new Vector({ x: 2 - ratio.x, y: 2 - ratio.y });
      case TYPES.TOP_RIGHT:
        return new Vector({ x: ratio.x, y: 2 - ratio.y });
      case TYPES.BOTTOM_LEFT:
        return new Vector({ x: 2 - ratio.x, y: ratio.y });
      case TYPES.BOTTOM_RIGHT:
        return new Vector({ x: ratio.x, y: ratio.y });
    }
  }

  #scaleRatio(ratio) {
    const scaler = Math.max(Math.abs(ratio.x), Math.abs(ratio.y));
    return new Vector({
      x: Math.sign(ratio.x) * scaler,
      y: Math.sign(ratio.y) * scaler,
    });
  }

  #setShapeSize(shape, oldBox, startingSigns, ratio, main) {
    const { widthSign, heightSign } = startingSigns;
    const { x, y } = ratio;
    const { width, height } = oldBox;

    shape.setSize = {
      width: width * x * widthSign,
      height: height * y * heightSign,
      save: false,
    };
    main.rightNav.setSize = shape.getSize;
  }

  addEventListeners(target, startPosition, handle, main) {
    const selectedShapes = main.getSelectedShapes;
    const { TYPES } = SelectionHandle;

    if (selectedShapes.length == 1 && handle.type === TYPES.CONSTRAIN) {
      selectedShapes[0].setConstrain = { save: false };
      main.rightNav.setSize = selectedShapes[0].getSize;
      return;
    }

    const oldRotations = selectedShapes.map((s) => s.rotation);
    const oldBoxes = selectedShapes.map((s) =>
      BoundingBox.fromPoints(s.getPoints.map((p) => p.add(this.center))),
    );

    const startingSigns = selectedShapes.map((s) => {
      const { width, height } = s.size;
      return {
        widthSign: Math.sign(width),
        heightSign: Math.sign(height),
      };
    });

    let mouseDelta = null;
    const prevSize = { ...this.box };

    const moveCallback = (evt) => {
      const vp = main.vpPt(evt);
      const mousePosition = main._vp.toDoc(vp.x, vp.y);

      mouseDelta = Vector.subtract(mousePosition, startPosition);

      const polar = mouseDelta.toPolar();
      polar.dir -= this.rotation;
      mouseDelta.toXY(polar);

      let ratio = new Vector({
        x: mouseDelta.x / prevSize.width,
        y: mouseDelta.y / prevSize.height,
      })
        .scale(2)
        .add(new Vector({ x: 1, y: 1 }));

      if (Object.values(TYPES).includes(handle.type)) {
        ratio = this.#newRatio(handle.type, ratio);

        // endregion
        if (selectedShapes.length == 1) {
          const shape = selectedShapes[0];
          const oldBox = oldBoxes[0];
          const oldRotation = oldRotations[0];
          if (shape.constrain) {
            ratio = this.#scaleRatio(ratio);
            this.#setShapeSize(shape, oldBox, startingSigns[0], ratio, main);
            return;
          }
        }

        // Preserve aspect ratio if shift key is held
        // region shift key preserve ratio
        if (
          evt.shiftKey &&
          [
            TYPES.TOP_LEFT,
            TYPES.TOP_RIGHT,
            TYPES.BOTTOM_LEFT,
            TYPES.BOTTOM_RIGHT,
          ].includes(handle.type)
        ) {
          ratio = this.#scaleRatio(ratio);
        }

        for (let i = 0; i < selectedShapes.length; i++) {
          const shape = selectedShapes[i];
          const oldBox = oldBoxes[i];
          const oldRotation = oldRotations[i];

          if (handle.type === TYPES.ROTATE) {
            const fixedStart = main._vp.toDoc(startPosition.x, startPosition.y);
            const fixedMouse = main._vp.toDoc(mousePosition.x, mousePosition.y);

            // vectors centered at the bounding box center
            const v1 = Vector.subtract(startPosition, oldBox.center);
            const v2 = Vector.subtract(mousePosition, oldBox.center);
            const angle = Vector.getSignAngle(v2, v1);

            shape.setRotation = { angle: oldRotation + angle, save: false };
            main.rightNav.setSize = shape.getSize;
          } else {
            this.#setShapeSize(shape, oldBox, startingSigns[0], ratio, main);
          }
        }
      }
    };

    const upCallback = (e) => {
      target.removeEventListener("pointermove", moveCallback);
      target.removeEventListener("pointerup", upCallback);
    };
    target.addEventListener("pointermove", moveCallback);
    target.addEventListener("pointerup", upCallback);
  }
}

class ShapeAdjustment extends Selection {
  #shape = null;
  center = Vector.zero();
  rotation = 0;
  handles = [];
  constructor(shape) {
    super();
    this.#shape = shape;
    this.center = shape.getCenter;
    this.rotation = shape.rotation;

    this.#generate();
    shape.adjustment = this;
  }

  update() {
    const { handles } = this.#shape.hasExtraOptions();
    const points = this.#shape.getPoints;
    this.box = BoundingBox.fromPoints(points.map((p) => p.add(this.center)));

    this.rotation = this.#shape.rotation;

    for (var i = 0; i < handles; i++) {
      const extrapoint = this.#shape.getExtraHandlePos(i);

      this.handles[i].center = extrapoint;
    }
  }

  #generate() {
    const { handles } = this.#shape.hasExtraOptions();
    const { EXTRA } = SelectionHandle;
    const points = this.#shape.getPoints;

    this.box = BoundingBox.fromPoints(points.map((p) => p.add(this.center)));

    for (var i = 0; i < handles; i++) {
      const extrapoint = this.#shape.getExtraHandlePos(i);

      this.handles.push(
        new SelectionHandle(extrapoint, EXTRA["HANDLE_" + (i + 1)]),
      );
    }
  }

  addEventListeners(target, startpos, handle, main) {
    const moveCallback = (evt) => {
      const vp = main.vpPt(evt);
      const mousepos = main._vp.toDoc(vp.x, vp.y);
      const { EXTRA } = SelectionHandle;
      if (Object.values(EXTRA).includes(handle.type)) {
        this.#shape.setExtraValue({ mousepos, startpos, handle });
      }
    };

    const upCallback = (e) => {
      target.removeEventListener("pointermove", moveCallback);
      target.removeEventListener("pointerup", upCallback);
    };
    target.addEventListener("pointermove", moveCallback);
    target.addEventListener("pointerup", upCallback);
  }

  draw(ctx, hitRegion = false) {
    ctx.save();
    ctx.beginPath();

    for (const handle of this.handles) {
      handle.draw(ctx, hitRegion);
    }

    ctx.restore();
  }
}

export { ShapeSelection, SelectionHandle, Selection, ShapeAdjustment };
