import { ShapeFactory } from "../../utils/shapeFactory";
import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class LineShape extends Shape {
  #rotation = 0;
  #shape = "LineShape";
  #pathSet = new Set();

  constructor(
    {
      corner1 = Vector.zero(),
      options = Shape.defaultOptions(),
      points = null,
    },
    callback,
  ) {
    super(options, callback);

    this.points = points
      ? points.map((p) => new Vector(p))
      : [corner1, corner1];
    this.options = options;
  }

  static load(data, callback) {
    const shape = new LineShape(data, callback);
    shape.setCenter = { center: new Vector(data.center), save: false };
    shape.size = data.size;
    shape.setSize = { ...data.size, ...{ save: false } };
    return shape;
  }

  serialize() {
    const json = JSON.parse(
      JSON.stringify({ ...{ shape: this.#shape }, ...this }),
    );

    json.options.fill.color = "#FF0000";
    json.options.stroke.color = "#00FFFF";

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

    selected = ctx.isPointInStroke(this.path, mousePos.x, mousePos.y);

    //viewport.selectedLayer.rotateCanvas(this.center, -this.rotation);
    return selected;
  }

  set setCorner2(corner2) {
    this.points[1] = corner2;
    this.size = this.getSizeByPoints;
  }

  set setWidth(width) {
    const size = this.getSizeByPoints;
    let flip = 1;
    flip = Math.sign(width) !== Math.sign(this.size.width) ? -1 : 1;

    const eps = 0.0001;
    if (size.width == 0) {
      console.error("Size 0 problem!");
    }

    const _width = size.width == 0 ? eps : size.width;
    const ratio = (flip * Math.abs(width)) / _width;
    for (const point of this.points) {
      point.x *= ratio;
    }
    this.size.width = width;
  }

  set setHeight(height) {
    const size = this.getSizeByPoints;
    let flip = 1;
    flip = Math.sign(height) !== Math.sign(this.size.height) ? -1 : 1;

    const eps = 0.0001;
    if (size.height == 0) {
      console.error("Size 0 problem!");
    }
    const _height = size.height == 0 ? eps : size.height;
    const ratio = (flip * Math.abs(height)) / _height;
    for (const point of this.points) {
      point.y *= ratio;
    }
    this.size.height = height;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const center = this.center ? this.center : Vector.zero();
    const { x, y } = center;

    ctx.beginPath();
    this.path = new Path2D();
    this.path.moveTo(this.points[0].x + center.x, this.points[0].y + center.y);
    this.path.lineTo(this.points[1].x + center.x, this.points[1].y + center.y);

    this.applyStyles(ctx, this.path);
  }
}

ShapeFactory.registerShape(LineShape, "LineShape");

export { LineShape };
