import { ShapeFactory } from "../../utils/shapeFactory";
import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class RectShape extends Shape {
  #rotation = 0;
  #shape = "RectShape";
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
    const shape = new RectShape(data, callback);
    shape.selected = data.selected;
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
    const left = center.x - this.size.width / 2;
    const top = center.y - this.size.height / 2;

    ctx.beginPath();
    this.path.rect(left, top, this.size.width, this.size.height);

    this.applyStyles(ctx, this.path);
  }
}

ShapeFactory.registerShape(RectShape, "RectShape");

export { RectShape };
