import { Vector } from "../utils/vector";

class Shape {
  constructor(options) {
    this.id = null;
    this.center = Vector.zero();
    this.options = options;
    this.rotation = 0;
    this.selected = false;
  }

  static getHitRGB(id) {
    const red = (id & 0xff0000) >> 16;
    const green = (id & 0x00ff00) >> 8;
    const blue = id & 0x0000ff;
    return `rgb(${red},${green},${blue})`;
  }

  serialize() {
    throw new Error("serialize method must be implemented");
  }

  set setCenter({ center = Vector.zero(), save = true }) {
    this.center = center;
  }

  set setWidth(width) {
    throw new Error("setWidth method must be implemented");
  }

  set setHeight(height) {
    throw new Error("setHeight method must be implemented");
  }

  set setSize({ width, height, save = true }) {
    this.setWidth = width;
    this.setHeight = height;
  }

  set setRotation({ angle, save = true }) {
    this.rotation = angle;
  }

  set setOptions({ options, save = true }) {
    for (const key in options) {
      if (this.options.hasOwnProperty(key)) this.options[key] = options[key];
    }
  }

  reCenter() {
    const points = this.getPoints();
    this.center = Vector.mid(points);
    //this.size = BoundingBox.fromPoints(points)

    for (const point of points) {
      const newPoint = Vector.subtract(point, this.center);
      point = newPoint;
    }

    this.setPoints(points);
  }

  applyHitRegionStyles(ctx, dilaion = 10) {
    const rgb = Shape.getHitRGB(this.id);
    const { lineCap, lineJoin, stroke } = this.options;
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;
    ctx.fillStyle = rgb;
    ctx.strokeStyle = rgb;
    ctx.lineWidth = stroke.width + dilaion;

    ctx.fill();
    if (stroke.enable) {
      ctx.stroke();
    }
  }

  getPoints() {
    throw new Error("getPoints method must be implemented");
  }

  setPoints() {
    throw new Error("getPoints method must be implemented");
  }

  draw(ctx) {
    throw new Error("draw method must be implemented");
  }
}
