import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class RectShape extends Shape {
  #rotation = 0;
  #shape = "RectShape";
  #pathSet = new Set();

  constructor({
    center = Vector.zero(),
    size = { width: 0, height: 0 },
    options = Shape.defaultOptions(),
  }) {
    super(options);

    this.center = center;
    this.size = size;
    this.options = options;
  }

  setCorner2(corner2) {
    this.corner2 = corner2;
  }

  set setWidth(width) {
    this.size.width = width;
  }

  set setHeight(height) {
    this.size.height = height;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const center = this.center ? this.center : Vector.zero();
    const left = center.x - this.size.width / 2;
    const top = center.y - this.size.height / 2;

    ctx.beginPath();
    this.path.rect(left, top, this.size.width, this.size.height);

    this.applyStyles(ctx, this.path);
  }
}

export { RectShape };
