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
    selected = ctx.isPointInPath(this.path, mouse.x, mouse.y);
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
  constructor(shape) {
    super();
    this.#shape = shape;
    this.center = shape.getCenter;
    this.rotation = 0;

    this.#generate();
    shape.selections = this;
  }

  updatePosition() {
    this.center = this.#shape.getCenter;
    this.#update();
  }

  updateSize() {
    this.#update();
  }

  updateRotation() {
    this.rotation = this.#shape?.rotation
      ? this.shape.rotation
      : this.shape.angle;
    this.#update();
  }

  #generate() {
    const { TYPES, size } = SelectionHandle;
    const points = this.#shape.getPoints;
    this.box = BoundingBox.fromPoints(points.map((p) => p.add(this.center)));

    const { topLeft, topRight, bottomLeft, bottomRight } = this.box;
    const rotationPoint = Vector.mid([topLeft, topRight]).subtract(
      new Vector({ x: 0, y: 2 * size }),
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
    ];
  }

  #update() {
    const { size } = SelectionHandle;
    const points = this.#shape.getPoints;
    this.box = BoundingBox.fromPoints(points.map((p) => p.add(this.center)));

    const { topLeft, topRight, bottomLeft, bottomRight } = this.box;
    const rotationPoint = Vector.mid([topLeft, topRight]).subtract(
      new Vector({ x: 0, y: 2 * size }),
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

  addEventListeners(target, startPosition, handle, main) {
    const selectedShapes = main.getSelectedShapes;
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

    const oldRotations = selectedShapes.map((s) => s.rotation);
    let mouseDelta = null;
    const { width, height } = this.box;
    const prevSize = { width, height };

    const moveCallback = (evt) => {
      const vp = main.vpPt(evt);
      const mousePosition = main._vp.toDoc(vp.x, vp.y);
      mouseDelta = Vector.subtract(mousePosition, startPosition);
      //const polar = diff.toPolar();
      //polar.dir -= this.rotation;

      let ratio = new Vector({
        x: mouseDelta.x / prevSize.width,
        y: mouseDelta.y / prevSize.height,
      })
        .scale(2)
        .add(new Vector({ x: 1, y: 1 }));
      const { TYPES } = SelectionHandle;

      if (Object.values(TYPES).includes(handle.type)) {
        switch (handle.type) {
          case TYPES.RIGHT:
            ratio = new Vector({ x: ratio.x, y: 1 });
            break;
          case TYPES.LEFT:
            ratio = new Vector({ x: 2 - ratio.x, y: 1 });
            break;
          case TYPES.TOP:
            ratio = new Vector({ x: 1, y: 2 - ratio.y });
            break;
          case TYPES.BOTTOM:
            ratio = new Vector({ x: 1, y: ratio.y });
            break;
          case TYPES.TOP_LEFT:
            ratio = new Vector({ x: 2 - ratio.x, y: 2 - ratio.y });
            break;
          case TYPES.TOP_RIGHT:
            ratio = new Vector({ x: ratio.x, y: 2 - ratio.y });
            break;
          case TYPES.BOTTOM_LEFT:
            ratio = new Vector({ x: 2 - ratio.x, y: ratio.y });
            break;
          case TYPES.BOTTOM_RIGHT:
            ratio = new Vector({ x: ratio.x, y: ratio.y });
            break;
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
          const scaler = Math.max(Math.abs(ratio.x), Math.abs(ratio.y));
          ratio = new Vector({
            x: Math.sign(ratio.x) * scaler,
            y: Math.sign(ratio.y) * scaler,
          });
        }

        // endregion
        for (let i = 0; i < selectedShapes.length; i++) {
          const shape = selectedShapes[i];
          const oldBox = oldBoxes[i];
          const oldRotation = oldRotations[i];

          //if (handle.type === TYPES.ROTATE) {
          //  const fixedStart = viewport.getAdjustedPosition(startPosition);
          //  const fixedMouse = viewport.getAdjustedPosition(mousePosition);

          // vectors centered at the bounding box center
          //  const v1 = Vec2.subtract(fixedStart, oldBox.center);
          //  const v2 = Vec2.subtract(fixedMouse, oldBox.center);
          //  const angle = Vec2.getSignedAngle(v2, v1);
          //  const combinedAngle = oldRotation + angle;
          //  shape.setRotation(combinedAngle, false);
          //} else {
          shape.setSize = {
            width: oldBox.width * ratio.x * startingSigns[i].widthSign,
            height: oldBox.height * ratio.y * startingSigns[i].heightSign,
            save: false,
          };
          main.rightNav.setSize = shape.getSize;
          //}
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

export { ShapeSelection, SelectionHandle, Selection };
