import { BoundingBox } from "../../transformbox/boundingBox";
import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class FreeHandShape extends Shape {
  #rotation = 0;
  #shape = "FreeHandShape";
  #pathSet = new Set();

  constructor(
    { startPoint = Vector.zero(), options = Shape.defaultOptions() },
    callback,
  ) {
    super(options, callback);

    this.points = [startPoint];
    this.options = options;
  }

  static load(data, callback) {
    const shape = new FreeHandShape(data, callback);
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

    var isfill = fill.visible
      ? ctx.isPointInPath(this.path, mousePos.x, mousePos.y)
      : false;
    selected = isfill || ctx.isPointInStroke(this.path, mousePos.x, mousePos.y);

    //viewport.selectedLayer.rotateCanvas(this.center, -this.rotation);
    return selected;
  }

  set addPoint(point) {
    this.points.push(point);
    this.size = this.getSizeByPoints;
  }

  set setWidth(newWidth) {
    const box = BoundingBox.fromPoints(this.points);
    let flip = 1;
    flip = Math.sign(newWidth) !== Math.sign(this.size.width) ? -1 : 1;

    const eps = 0.0001;
    if (box.width == 0) {
      console.error("Size 0 problem!");
    }

    const width = box.width == 0 ? eps : box.width;
    const ratio = (flip * Math.abs(newWidth)) / width;
    for (const point of this.points) {
      point.x *= ratio;
    }
    this.size.width = newWidth;
  }

  set setHeight(newHeight) {
    const box = BoundingBox.fromPoints(this.points);
    let flip = 1;
    flip = Math.sign(newHeight) !== Math.sign(this.size.height) ? -1 : 1;

    const eps = 0.0001;
    if (box.height == 0) {
      console.error("Size 0 problem!");
    }
    const height = box.height == 0 ? eps : box.height;
    const ratio = (flip * Math.abs(newHeight)) / height;
    for (const point of this.points) {
      point.y *= ratio;
    }
    this.size.height = newHeight;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const center = this.center ? this.center : Vector.zero();
    const { x, y } = center;

    ctx.beginPath();
    this.path.moveTo(this.points[0].x + center.x, this.points[0].y + center.y);
    for (let i = 1; i < this.points.length; i++) {
      this.path.lineTo(
        this.points[i].x + center.x,
        this.points[i].y + center.y,
      );
    }

    this.applyStyles(ctx, this.path);
  }
}

export { FreeHandShape };
