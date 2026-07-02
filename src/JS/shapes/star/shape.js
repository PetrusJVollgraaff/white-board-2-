import { Layer } from "../../display/Layer";
import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class StarShape extends Shape {
  constructor(
    {
      center = Vector.zero(),
      size = { width: 0, height: 0 },
      options = Shape.getDefaultOptions(),
    },
    callback,
  ) {
    super(options, callback);
    this.center = center instanceof Vector ? center : new Vector(center);
    this.size = size;
    this.options = options;
  }

  getExtraHandlePos() {
    return Vector.zero();
  }

  serialize() {
    return JSON.parse(JSON.stringify({ ...{ shape: this.shape }, ...this }));
  }

  isHandleSelected(ctx, mousepos) {
    let selected = false;
    if (this.selected && this?.selections)
      selected = this.selections?.isSelected(ctx, mousepos);

    return selected;
  }

  isSelected(ctx, mousepos) {
    const { fill, stroke } = this.options;
    const { x, y } = mousepos;
    let selected = false;
    ctx.save();
    Layer.rotateCanvas(ctx, this.center, this.rotation);
    var isfill = fill.visible ? ctx.isPointInPath(this.path, x, y) : false;
    selected = isfill || ctx.isPointInStroke(this.path, x, y);
    ctx.restore();
    return selected;
  }

  setCorner2(corner2) {
    this.corner2 = corner2;
  }

  getEllipseVect(angles, adddeg = 0, dist = 1) {
    const center = this.center ? this.center : Vector.zero();
    const { size } = this;

    const radiusX = (size.width * dist) / 2;
    const radiusY = (size.height * dist) / 2;

    return angles.map((deg) => {
      const rad = Vector.DegreeToRadians(adddeg + deg); // Convert degrees to radians
      const x = center.x + radiusX * Math.cos(rad);
      const y = center.y + radiusY * Math.sin(rad);
      return { x, y };
    });
  }

  set setWidth(width) {
    this.size.width = width;
  }

  set setHeight(height) {
    this.size.height = height;
  }
}

class Star5Point extends StarShape {
  shape = "Star5Point";
  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return null;
  }

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "star5point",
        title: "Star 5 Point",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0  9.76,6.08  16,6.08  11.04,10.56  12.79,16  8,12.96  3.2,16  4.96,10.56  0,6.08  6.24,6.08 " fill="none" stroke="currentColor" stroke-width="1.5"/></polygon></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Star5Point(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  drawCorners({ width, height, x, y }) {
    const left = x - width / 2;
    const top = y - height / 2;
    const right = left + width;
    const bottom = top + height;

    const height1 = height * 0.38;
    const height2 = height * 0.66;
    const height3 = height * 0.81;

    const width2 = width * 0.11;
    const width3 = width * 0.08;

    return [
      [x, top],
      [x + width2, top + height1],
      [right, top + height1],
      [x + width2 + width3, top + height2],
      [x + width2 * 2 + width3, bottom],
      [x, top + height3],
      [x - width2 * 2 - width3, bottom],
      [x - width2 - width3, top + height2],
      [left, top + height1],
      [x - width2, top + height1],
    ];
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { width, height } = this.size;

    const corners = this.drawCorners({ width, height, x, y });

    for (const key in corners) {
      this.path.lineTo(corners[key][0], corners[key][1]);
    }

    this.path.lineTo(corners[0][0], corners[0][1]);

    this.applyStyles(ctx, this.path);
  }
}

class Star6Point extends StarShape {
  shape = "Star6Point";
  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return null;
  }

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "star6point",
        title: "Star 6 Point",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0  10.08,4.8  16,4  12.16,8  16,12  10.08,11.2  8,16  5.92,11.2  0,12  3.84,8  0,4 5.92,4.8" fill="none" stroke="currentColor" stroke-width="1.5"/></polygon></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Star6Point(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  drawCorners({ width, height, x, y }) {
    const left = x - width / 2;
    const top = y - height / 2;
    const right = left + width;
    const bottom = top + height;

    const height1 = height * 0.25;
    const height2 = height * 0.2;
    const width2 = width * 0.13;

    return [
      [x, top],
      [x + width2, y - height2],
      [right, top + height1],
      [x + width2 * 2, y],
      [right, bottom - height1],
      [x + width2, y + height2],
      [x, bottom],
      [x - width2, y + height2],
      [left, bottom - height1],
      [x - width2 * 2, y],
      [left, top + height1],
      [x - width2, y - height2],
    ];
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { width, height } = this.size;

    const corners = drawCorners({ width, height, x, y });

    for (const key in corners) {
      this.path.lineTo(corners[key][0], corners[key][1]);
    }

    this.path.lineTo(corners[0][0], corners[0][1]);

    this.applyStyles(ctx, this.path);
  }
}

class Star8Point extends StarShape {
  shape = "Star8Point";
  #angles = Array.from({ length: 8 }, (_, i) => i * 45);
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  setExtraValue({ mousepos, save = true }) {
    const { width } = this.size;

    const half_w = width / 2;
    const x = this.center.x - half_w;

    const diff = Vector.subtract(mousepos, new Vector({ x, y: this.center.y }));
    const polar = diff.toPolar();
    polar.dir -= this.rotation;
    diff.toXY(polar);

    const newvalue = 1 - Math.min(Math.max(diff.x, 0), half_w) / half_w;
    this.#extraoptions.values[0] = newvalue;

    this.EventCallback(save);
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  getExtraHandlePos() {
    const { x, y } = this.center;
    const { width, height } = this.size;
    const [dist1] = this.#extraoptions.values;

    const half_w = width / 2;
    const left = x - half_w;
    const extraPoint = left + half_w * Math.abs(dist1 - 1);

    return new Vector({ x: extraPoint, y });
  }

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "star8point",
        title: "Star 8 Point",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="16,8 11.69,9.53 13.65,13.65 9.53,11.69 8,16 6.46,11.69 2.34,13.65 4.30,9.53 0,8 4.30,6.46 2.34,2.34 6.46,4.30 8,0 9.53,4.3 13.65,2.34 11.69,6.46" fill="none" stroke="currentColor" stroke-width="1.5"/></polygon></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Star8Point(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const [dist1] = this.#extraoptions.values;
    const center = this.center ? this.center : Vector.zero();
    const outerCorners = this.getEllipseVect(this.#angles);
    const innerCorners = this.getEllipseVect(this.#angles, 22.5, dist1);

    for (const key in outerCorners) {
      this.path.lineTo(outerCorners[key].x, outerCorners[key].y);
      this.path.lineTo(innerCorners[key].x, innerCorners[key].y);
    }

    this.path.lineTo(outerCorners[0].x, outerCorners[0].y);

    this.applyStyles(ctx, this.path);
  }
}

class Star12Point extends StarShape {
  shape = "Star12Point";
  #angles = Array.from({ length: 12 }, (_, i) => i * 30);
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  setExtraValue({ mousepos, save = true }) {
    const { width } = this.size;

    const half_w = width / 2;
    const x = this.center.x - half_w;

    const diff = Vector.subtract(mousepos, new Vector({ x, y: this.center.y }));
    const polar = diff.toPolar();
    polar.dir -= this.rotation;
    diff.toXY(polar);

    const newvalue = 1 - Math.min(Math.max(diff.x, 0), half_w) / half_w;
    this.#extraoptions.values[0] = newvalue;

    this.EventCallback(save);
  }

  getExtraHandlePos() {
    const { x, y } = this.center;
    const { width, height } = this.size;
    const [dist1] = this.#extraoptions.values;

    const half_w = width / 2;
    const left = x - half_w;
    const extraPoint = left + half_w * Math.abs(dist1 - 1);

    return new Vector({ x: extraPoint, y });
  }

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "star12point",
        title: "Star 12 Point",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="16,8 11.86,9.03 14.92,12 10.82,10.82 12,14.92 9.03,11.86 8,16 6.96,11.86 4,14.92 4.17,10.82 1.07,12 4.13,9.03 0,8 4.13,6.96 1.07,4 5.17,5.17 4,1.07 6.96,4.13 8,0 9.03,4.13 12,1.07 10.82,5.17 14.92,4 11.86,6.96" fill="none" stroke="currentColor" stroke-width="1.5"/></polygon></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Star12Point(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const [dist1] = this.#extraoptions.values;
    const center = this.center ? this.center : Vector.zero();
    const outerCorners = this.getEllipseVect(this.#angles);
    const innerCorners = this.getEllipseVect(this.#angles, 15, dist1);

    for (const key in outerCorners) {
      this.path.lineTo(outerCorners[key].x, outerCorners[key].y);
      this.path.lineTo(innerCorners[key].x, innerCorners[key].y);
    }

    this.path.lineTo(outerCorners[0].x, outerCorners[0].y);

    this.applyStyles(ctx, this.path);
  }
}

class Star24Point extends StarShape {
  shape = "Star24Point";
  #angles = Array.from({ length: 24 }, (_, i) => i * 15);
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  setExtraValue({ mousepos, save = true }) {
    const { width } = this.size;

    const half_w = width / 2;
    const x = this.center.x - half_w;

    const diff = Vector.subtract(mousepos, new Vector({ x, y: this.center.y }));
    const polar = diff.toPolar();
    polar.dir -= this.rotation;
    diff.toXY(polar);

    const newvalue = 1 - Math.min(Math.max(diff.x, 0), half_w) / half_w;
    this.#extraoptions.values[0] = newvalue;

    this.EventCallback(save);
  }

  getExtraHandlePos() {
    const { x, y } = this.center;
    const { width, height } = this.size;
    const [dist1] = this.#extraoptions.values;

    const half_w = width / 2;
    const left = x - half_w;
    const extraPoint = left + half_w * Math.abs(dist1 - 1);

    return new Vector({ x: extraPoint, y });
  }

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "star24point",
        title: "Star 24 Point",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="16,8 11.96,8.52 15.72,10.07 11.69,9.53 14.92,12 11.17,10.43 13.65,13.65 10.43,11.17 12,14.92 9.53,11.69 10.07,15.72 8.5,11.96 8,16 7.47,11.96 5.92,15.72 6.46,11.69 4,14.92 5.56,11.17 2.34,13.65 4.82,10.43 1.07,12 4.30,9.53 0.27,10.07 4.03,8.52 0,8 4.03,7.47 0.27,5.92 4.30,6.46 1.07,4 4.82,5.56 2.34,2.34 5.56,4.82 4,1.07 6.46,4.30 5.92,0.27 7.47,4.03 8,0 8.52,4.03 10.07,0.27 9.53,4.30 12,1.07 10.43,4.82 13.65,2.34 11.17,5.56 14.92,4 11.69,6.46 15.72,5.92 11.96,7.47" fill="none" stroke="currentColor" stroke-width="1.5"/></polygon></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Star24Point(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const [dist1] = this.#extraoptions.values;
    const outerCorners = this.getEllipseVect(this.#angles);
    const innerCorners = this.getEllipseVect(this.#angles, 7.5, dist1);

    for (const key in outerCorners) {
      this.path.lineTo(outerCorners[key].x, outerCorners[key].y);
      this.path.lineTo(innerCorners[key].x, innerCorners[key].y);
    }
    this.path.lineTo(outerCorners[0].x, outerCorners[0].y);

    this.applyStyles(ctx, this.path);
  }
}

const StarShapes = {
  Star5Point,
  Star6Point,
  Star8Point,
  Star12Point,
  Star24Point,
};
export { StarShapes };
