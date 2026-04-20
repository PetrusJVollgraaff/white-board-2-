import { BoundingBox } from "../transformbox/boundingBox";
import { ShapeSelection } from "../transformbox/selections";
import { Vector } from "../utils/vector";
import { RectShape } from "./patterns/rectangle";

class Shape {
  static shapeClass(type) {
    const classObj = eval(type);
    return classObj;
  }

  static defaultOptions() {
    return {
      lineCap: "round",
      lineJoin: "round",
      fill: {
        visible: true,
        type: "solid",
        color: "#FFFF00",
        opacity: 100,
      },

      stroke: {
        visible: true,
        type: "solid",
        style: "continues",
        color: "#000000",
        opacity: 100,
        size: 2,
      },
    };
  }

  constructor(options = Shape.defaultOptions(), callback) {
    console.log(callback, options);
    this.id = null;
    this.center = Vector.zero();
    this.options = options;
    this.rotation = 0;
    this.selected = false;
    this.callback = callback;
  }

  static getHitRGB(id) {
    const red = (id & 0xff0000) >> 16;
    const green = (id & 0x00ff00) >> 8;
    const blue = id & 0x0000ff;
    return `rgb(${red},${green},${blue})`;
  }

  static getCenterAndSize(corner1, corner2) {
    const points = [corner1, corner2];
    const center = Vector.mid(points);
    const size = BoundingBox.fromPoints(points);
    return { center, size };
  }

  serialize() {
    throw new Error("serialize method must be implemented");
  }

  get getCenter() {
    return this.center;
  }

  get getSize() {
    return {
      center: this.center,
      size: this.size,
      angle: this.rotation,
    };
  }

  get getColor() {
    return this.options;
  }

  get getPoints() {
    const { width, height } = this.size;
    const halfW = width / 2;
    const halfH = height / 2;
    return [
      new Vector({ x: -halfW, y: -halfH }),
      new Vector({ x: -halfW, y: halfH }),
      new Vector({ x: halfW, y: halfH }),
      new Vector({ x: halfW, y: -halfH }),
    ];
  }

  get getSizeByPoints() {
    const minX = Math.min(...this.points.map((p) => p.x));
    const minY = Math.min(...this.points.map((p) => p.y));
    const maxX = Math.max(...this.points.map((p) => p.x));
    const maxY = Math.max(...this.points.map((p) => p.y));
    return {
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  recenter() {
    //const points = this.getPoints();
    this.center = Vector.mid(this.points);
    this.size = BoundingBox.fromPoints(this.points);
    for (const point of this.points) {
      const newPoint = Vector.subtract(point, this.center);
      point.x = newPoint.x;
      point.y = newPoint.y;
    }
    //this.setPoints(points);
  }

  select(save = true) {
    this.selected = true;
    this.selections = new ShapeSelection(this);
    this.callback({
      event: {
        name: "shapeSelected",
        detail: { shape: this, save },
      },
    });
  }

  unselect(save = true) {
    this.selected = false;
    this.selections = null;
    this.callback({
      event: {
        name: "shapeUnselected",
        detail: { shape: this, save },
      },
    });
  }

  set setCenter({ center = Vector.zero(), save = true }) {
    this.center = center;
    this.selections?.updatePosition();
    this.callback({
      event: {
        name: "positionChanged",
        detail: { shape: this, save },
      },
    });
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
    this.selections?.updateSize();
    this.callback({
      event: {
        name: "sizeChanged",
        detail: { shape: this, save },
      },
    });
  }

  set setRotation({ angle, save = true }) {
    this.rotation = angle;
    this.selections?.updateRotation();

    this.callback({
      event: {
        name: "rotationChanged",
        detail: { shape: this, save },
      },
    });
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

  createColors(ctx, options, ctxstyle) {
    const { type, image, color, opacity, linear } = options;
    const { width, height } = this.size;

    if (type == "linear" || type == "axial") {
      const radius = Math.min(height, width);
      const { points, colors, angle } = linear;
      ctx[ctxstyle] = LinearStyle(
        ctx,
        type,
        points,
        colors,
        angle,
        radius,
        this.center,
      );
    } else if (type == "solid" || (type == "image" && image.file == "")) {
      ctx[ctxstyle] = color; //+ decimalToHexOpacity(opacity);
    }
  }

  applyStyles(ctx, path) {
    ctx.save();
    const { fill, stroke, lineCap, lineJoin } = this.options;

    //Area options
    this.createColors(ctx, fill, "fillStyle");

    //Border options
    this.createColors(ctx, stroke, "strokeStyle");

    ctx.lineWidth = stroke.size;
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;

    if (fill.visible) {
      ctx.fill(path);
    }

    ctx.stroke(path);
    ctx.restore();
  }

  setPoints() {
    throw new Error("getPoints method must be implemented");
  }

  draw(ctx) {
    throw new Error("draw method must be implemented");
  }
}

function LinearStyle(ctx, type, points, colors, angle, radius, center) {
  const newpoints = points.map((p, i) => {
    return p.rotateByCenterAndRadius(center, angle + i * 180, radius / 2);
  });

  const gradient = ctx.createLinearGradient(
    newpoints[0].x,
    newpoints[0].y,
    newpoints[1].x,
    newpoints[1].y,
  );

  if (type == "linear") {
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
  } else {
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[0]);
  }

  return gradient;
}

export { Shape };
