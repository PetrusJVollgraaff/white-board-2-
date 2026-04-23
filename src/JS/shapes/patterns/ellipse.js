import { ShapeFactory } from "../../utils/shapeFactory";
import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class EllipseShape extends Shape {
  #rotation = 0;
  #shape = "EllipseShape";
  #pathSet = new Set();

  constructor(
    {
      center = Vector.zero(),
      size = { width: 0, height: 0 },
      options = Shape.defaultOptions,
    },
    callback,
  ) {
    super(options, callback);

    this.center = center instanceof Vector ? center : new Vector(center);
    this.size = size;
    this.options = options;
  }

  static load(data, callback) {
    const shape = new EllipseShape(data, callback);
    return shape;
  }

  serialize() {
    const json = JSON.parse(
      JSON.stringify({ ...{ shape: this.#shape }, ...this }),
    );
    return json;
  }

  isHandleSelected(ctx, mousePos) {
    let selected = false;
    if (this.selected && this?.selections)
      selected = this.selections?.isSelected(ctx, mousePos);

    return selected;
  }

  isSelected(ctx, mousePos) {
    const { fill, stroke } = this.options;
    let selected = false;

    //viewport.selectedLayer.rotateCanvas(this.center, this.rotation);

    var isfill = fill.visible
      ? ctx.isPointInPath(this.path, mousePos.x, mousePos.y)
      : false;
    selected = isfill || ctx.isPointInStroke(this.path, mousePos.x, mousePos.y);

    //viewport.selectedLayer.rotateCanvas(this.center, -this.rotation);
    return selected;
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
    const { x, y } = center;
    const { width, height } = this.size;

    ctx.beginPath();
    this.path.ellipse(
      x,
      y,
      Math.abs(width / 2),
      Math.abs(height / 2),
      0,
      0,
      2 * Math.PI,
    );

    this.applyStyles(ctx, this.path);
  }
}

ShapeFactory.registerShape(EllipseShape, "EllipseShape");

export { EllipseShape };
