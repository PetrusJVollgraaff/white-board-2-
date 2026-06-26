import { Layer } from "../../display/Layer";
import { SelectionHandle } from "../../transformbox/selections";
import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class BasicShape extends Shape {
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

  getExtraHandlePos(handle = 1) {
    return Vector.zero();
  }

  serialize() {
    return JSON.parse(JSON.stringify({ ...{ shape: this.shape }, ...this }));
  }

  isHandleSelected(ctx, mousePos) {
    const { selected, selections: gizmo } = this;
    let isSelected =
      selected && gizmo ? gizmo?.isSelected(ctx, mousePos) : false;

    return isSelected;
  }

  isSelected(ctx, mousePos) {
    const { fill, stroke } = this.options;
    const { x, y } = mousePos;
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

  set setWidth(width) {
    this.size.width = width;
  }

  set setHeight(height) {
    this.size.height = height;
  }
}

class AngleTriangle extends BasicShape {
  shape = "AngleTriangle";
  #pathSet = new Set();

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
        "data-tool": "angletriangle",
        title: "Angle Triangle",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="0,0 16,16 0,16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    };
  }

  static load(data, callback) {
    const shape = new AngleTriangle(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;

    const left = x - size.width / 2;
    const top = y - size.height / 2;

    ctx.beginPath();
    this.path.moveTo(left, top);
    this.path.lineTo(left + size.width, top + size.height);
    this.path.lineTo(left, top + size.height);
    this.path.lineTo(left, top);

    this.applyStyles(ctx, this.path);
  }
}

class CrossShape extends BasicShape {
  shape = "CrossShape";
  #pathSet = new Set();
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  getDiff(mousePos) {
    const { center, size, rotation } = this;
    const y = center.y - size.height / 2;
    const x = center.x - size.width / 2;
    const diff = Vector.subtract(mousePos, new Vector({ x, y }));
    const polar = diff.toPolar();
    polar.dir -= rotation;
    diff.toXY(polar);

    return diff;
  }

  setExtraValue(mousePos, startPosition, handle, save = true) {
    const { width, height } = this.size;
    const half_w = width / 2;
    const half_h = height / 2;
    const diff = this.getDiff(mousePos);

    const minsize = Math.min(half_w, half_h);
    const newvalue = Math.min(Math.max(diff.x, 0), minsize) / minsize;
    this.#extraoptions.values[0] = newvalue;

    /*viewport.dispatchEvent(
      new CustomEvent("extraChanged", {
        detail: {
          shape: this,
          extraoptions: { values },
          save,
        },
      })
    );*/
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  getExtraHandlePos() {
    const { x, y } = this.center;
    const { width, height } = this.size;

    const half_h = height / 2;
    const half_w = width / 2;
    const minSize = Math.min(half_h, half_w);

    const left = x - half_w;
    const top = y - half_h;
    const extraPoint = left + minSize * this.#extraoptions.values[0];

    return new Vector({ x: extraPoint, y: top });
  }

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "crossshape",
        title: "Cross Shape",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="0,6 6,6 6,0 10,0 10,6 16,6  16,10 10,10 10,16 6,16 6,10 0,10" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    };
  }

  static load(data, callback) {
    const shape = new CrossShape(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();

    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;

    const dist1 = this.#extraoptions.values[0];
    const half_h = size.height / 2;
    const half_w = size.width / 2;

    const minSize = Math.min(half_h, half_w);
    const left = x - half_w;
    const right = left + size.width;
    const top = y - half_h;
    const bottom = top + size.height;

    ctx.beginPath();
    this.path.moveTo(left + minSize * dist1, top);
    this.path.lineTo(right - minSize * dist1, top);
    this.path.lineTo(right - minSize * dist1, top + minSize * dist1);
    this.path.lineTo(right, top + minSize * dist1);
    this.path.lineTo(right, bottom - minSize * dist1);
    this.path.lineTo(right - minSize * dist1, bottom - minSize * dist1);
    this.path.lineTo(right - minSize * dist1, bottom);
    this.path.lineTo(left + minSize * dist1, bottom);
    this.path.lineTo(left + minSize * dist1, bottom - minSize * dist1);
    this.path.lineTo(left, bottom - minSize * dist1);
    this.path.lineTo(left, top + minSize * dist1);
    this.path.lineTo(left + minSize * dist1, top + minSize * dist1);
    this.path.lineTo(left + minSize * dist1, top);

    this.applyStyles(ctx, this.path);
  }
}

class EllipseShape extends BasicShape {
  #shape = "EllipseShape";
  #pathSet = new Set();

  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return null;
  }

  static btn() {
    return {
      type: "button",
      attributes: { "data-tool": "ellipse", title: "Ellipse" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="6" ry="4" fill="none" stroke="currentColor" stroke-width="1.5"></ellipse></svg>',
    };
  }

  static load(data, callback) {
    const shape = new EllipseShape(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;

    ctx.beginPath();
    this.path.ellipse(
      x,
      y,
      Math.abs(size.width / 2),
      Math.abs(size.height / 2),
      0,
      0,
      2 * Math.PI,
    );

    this.applyStyles(ctx, this.path);
  }
}

class EllipsePie extends BasicShape {
  #shape = "EllipsePie";
  #pathSet = new Set();
  #extraoptions = {
    values: [0, 270],
    handles: 2,
    direction: "xy",
  };

  constructor(data, callback) {
    super(data, callback);
  }

  getDiff(mousePos) {
    const diff = mousePos;
    const polar = diff.toPolar();
    polar.dir -= this.rotation;
    diff.toXY(polar);

    return diff;
  }

  setExtraValue(mousePos, startPosition, handle, save = true) {
    const diff = this.getDiff(mousePos);
    const pos = handle.type != "handle_1" ? 1 : 0;
    const centerV = new Vector(this.center);
    const delta = diff.subtract(centerV);
    let degrees = Vector.RadianToDegree(delta.direction());

    this.#extraoptions.values[pos] = degrees;

    /*viewport.dispatchEvent(
      new CustomEvent("extraChanged", {
        detail: {
          shape: this,
          extraoptions: { values },
          save,
        },
      })
    );*/
  }

  getExtraHandlePos(handle) {
    const { width, height } = this.size;
    const extraPoint = calculatePoint(
      Vector.DegreeToRadians(this.#extraoptions.values[handle]),
      this.center,
      width - SelectionHandle.size * 2,
      height - SelectionHandle.size * 2,
    );

    return new Vector(extraPoint);
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  static btn() {
    return {
      type: "button",
      attributes: { "data-tool": "ellipsepie", title: "EllipsePie" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><ellipse cx="8" cy="8" rx="6" ry="4" fill="none" stroke="currentColor" stroke-width="1.5"></ellipse></svg>',
    };
  }

  static load(data, callback) {
    const shape = new EllipsePie(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;
    const left = x - size.width / 2;
    const top = y - size.height / 2;

    const radiusX = Math.abs(size.width / 2);
    const radiusY = Math.abs(size.height / 2);

    ctx.beginPath();
    this.path.moveTo(left + size.width / 2, top + size.height / 2);
    this.path.ellipse(
      x,
      y,
      radiusX,
      radiusY,
      0,
      Vector.DegreeToRadians(this.#extraoptions.values[0]),
      Vector.DegreeToRadians(this.#extraoptions.values[1]),
    );

    this.path.lineTo(left + size.width / 2, top + size.height / 2);

    this.applyStyles(ctx, this.path);
  }
}

class Hexagon extends BasicShape {
  shape = "Hexagon";
  #pathSet = new Set();
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  getExtraHandlePos(center, size) {
    const { x, y } = this.center;
    const { width, height } = this.size;
    const half_w = width / 2;
    const top = y - height / 2;
    const toppoint_x = x - half_w * this.#extraoptions.values[0];

    return new Vector({ x: toppoint_x, y: top + SelectionHandle.size });
  }

  getDiff(mousePos) {
    const { center, size, rotation } = this;
    const y = center.y - size.height / 2 + SelectionHandle.size;
    const x = center.x - size.width / 2;
    const diff = Vector.subtract(mousePos, new Vector({ x, y }));
    const polar = diff.toPolar();
    polar.dir -= rotation;
    diff.toXY(polar);

    return diff;
  }

  setExtraValue(mousePos, startPosition, handle, save = true) {
    const { width, height } = this.size;
    const half_w = width / 2;
    const half_h = height / 2;

    const diff = this.getDiff(mousePos);

    const minsize = Math.min(half_w, half_h);
    const fixvalue = Math.min(Math.max(diff.x, 0), minsize);
    const newvalue = 1 - Math.abs(fixvalue / minsize).toFixed(2);
    this.#extraoptions.values[0] = newvalue;

    /*viewport.dispatchEvent(
      new CustomEvent("extraChanged", {
        detail: {
          shape: this,
          extraoptions: { values },
          save,
        },
      })
    );*/
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "hexagon",
        title: "Hexagon",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="0,8 4,0 11,0 16,8 11,16 4,16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Hexagon(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;

    const dist1 = this.#extraoptions.values[0];
    const half_width = size.width / 2;
    const left = x - size.width / 2;
    const top = y - size.height / 2;
    const bottom = top + size.height;

    ctx.beginPath();
    this.path.moveTo(x - half_width * dist1, top);
    this.path.lineTo(x + half_width * dist1, top);
    this.path.lineTo(left + size.width, top + size.height * 0.5);
    this.path.lineTo(x + half_width * dist1, bottom);
    this.path.lineTo(x - half_width * dist1, bottom);
    this.path.lineTo(left, top + size.height * 0.5);
    this.path.lineTo(x - half_width * dist1, top);

    this.applyStyles(ctx, this.path);
  }
}

class IsoscelesTriangle extends BasicShape {
  shape = "IsoscelesTriangle";
  #pathSet = new Set();
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  getDiff(mousePos) {
    const { center, size, rotation } = this;
    const y = center.y - size.height / 2;
    const x = center.x - size.width / 2;
    const diff = Vector.subtract(mousePos, new Vector({ x, y }));
    const polar = diff.toPolar();
    polar.dir -= rotation;
    diff.toXY(polar);

    return diff;
  }

  getExtraHandlePos(center, size) {
    const { x, y } = this.center;
    const { height, width } = this.size;

    const left = x - width / 2;
    const top = y - height / 2;
    const toppoint_x = left + width * this.#extraoptions.values[0];

    return new Vector({ x: toppoint_x, y: top + SelectionHandle.size });
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "isosceles triangle",
        title: "Isosceles Triangle",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0 16,16 0,16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    };
  }

  static load(data, callback) {
    const shape = new IsoscelesTriangle(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;

    const left = x - size.width / 2;
    const top = y - size.height / 2;
    const toppoint_x = left + size.width * this.#extraoptions.values[0];

    ctx.beginPath();
    //this.path.rect(left, top, this.size.width, this.size.height);
    this.path.moveTo(toppoint_x, top);
    this.path.lineTo(left + size.width, top + size.height);
    this.path.lineTo(left, top + size.height);
    this.path.lineTo(toppoint_x, top);

    this.applyStyles(ctx, this.path);
  }
}

class Octagon extends BasicShape {
  shape = "Octagon";
  #pathSet = new Set();
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

  getDiff(mousePos) {
    const { center, size, rotation } = this;
    const y = center.y - size.height / 2 + SelectionHandle.size;
    const x = center.x - size.width / 2;
    const diff = Vector.subtract(mousePos, new Vector({ x, y }));
    const polar = diff.toPolar();
    polar.dir -= rotation;
    diff.toXY(polar);

    return diff;
  }

  setExtraValue(mousePos, startPosition, handle, save = true) {
    const { width, height } = this.size;
    const half_w = width / 2;
    const half_h = height / 2;

    const diff = this.getDiff(mousePos);

    const minsize = Math.min(half_w, half_h);
    const fixvalue = Math.min(Math.max(diff.x, 0), minsize);
    const newvalue = 1 - Math.abs(fixvalue / minsize).toFixed(2);
    this.#extraoptions.values[0] = newvalue;

    /*viewport.dispatchEvent(
      new CustomEvent("extraChanged", {
        detail: {
          shape: this,
          extraoptions: { values },
          save,
        },
      })
    );*/
  }

  getExtraHandlePos() {
    const [dist1] = this.#extraoptions.values;
    const { x, y } = this.center;
    const { width, height } = this.size;

    const half_w = width / 2;
    const top = y - height / 2;
    const toppoint_x = x - half_w * dist1;

    return new Vector({
      x: toppoint_x,
      y: top + SelectionSelectionHandle.size,
    });
  }

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "octagon",
        title: "Octagon",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="5,0 10,0 16,5 16,10 10,16 5,16 0,10 0,5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Octagon(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;
    const [dist1] = this.#extraoptions.values;

    const half_width = size.width / 2;
    const half_height = size.height / 2;
    const left = x - size.width / 2;
    const top = y - size.height / 2;
    const right = left + size.width;
    const bottom = top + size.height;

    ctx.beginPath();
    this.path.moveTo(x - half_width * dist1, top);
    this.path.lineTo(x + half_width * dist1, top);
    this.path.lineTo(right, y - half_height * dist1);
    this.path.lineTo(right, y + half_height * dist1);
    this.path.lineTo(x + half_width * dist1, bottom);
    this.path.lineTo(x - half_width * dist1, bottom);
    this.path.lineTo(left, y + half_height * dist1);
    this.path.lineTo(left, y - half_height * dist1);
    this.path.lineTo(x - half_width * dist1, top);

    this.applyStyles(ctx, this.path);
  }
}

class Pentagon extends BasicShape {
  shape = "Pentagon";
  #pathSet = new Set();

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
        "data-tool": "pentagon",
        title: "Pentagon",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0 16,6 12,16 4,16 0,6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Pentagon(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;

    const left = x - size.width / 2;
    const top = y - size.height / 2;

    ctx.beginPath();
    this.path.moveTo(left + size.width / 2, top);
    this.path.lineTo(left + size.width, top + size.height * 0.38);
    this.path.lineTo(left + size.width * 0.8, top + size.height);
    this.path.lineTo(left + size.width * 0.2, top + size.height);
    this.path.lineTo(left, top + size.height * 0.38);
    this.path.lineTo(left + size.width / 2, top);

    this.applyStyles(ctx, this.path);
  }
}

class RectShape extends BasicShape {
  shape = "RectShape";
  #pathSet = new Set();

  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return null;
  }

  static btn() {
    return {
      type: "button",
      attributes: { "data-tool": "rect", title: "Rectangle" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><rect x="2" y="4" width="12" height="8" fill="none" stroke="currentColor" stroke-width="1.5"></rect></svg>',
    };
  }

  static load(data, callback) {
    const shape = new RectShape(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;
    const left = x - size.width / 2;
    const top = y - size.height / 2;

    ctx.beginPath();
    this.path.rect(left, top, size.width, size.height);

    this.applyStyles(ctx, this.path);
  }
}

class Diament extends BasicShape {
  shape = "Diament";
  #pathSet = new Set();

  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return null;
  }

  static btn() {
    return {
      type: "button",
      attributes: { "data-tool": "diament", title: "Diament" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="currentColor" stroke-width="1.5"/></rect></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Diament(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;
    const left = x - size.width / 2;
    const top = y - size.height / 2;

    ctx.beginPath();
    this.path.moveTo(left + size.width / 2, top);
    this.path.lineTo(left + size.width, top + size.height / 2);
    this.path.lineTo(left + size.width / 2, top + size.height);
    this.path.lineTo(left, top + size.height / 2);
    this.path.lineTo(left + size.width / 2, top);

    this.applyStyles(ctx, this.path);
  }
}

class Trapezoid extends BasicShape {
  shape = "Trapezoid";
  #pathSet = new Set();
  #extraoptions = {
    values: [0.25],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  getDiff(mousePos) {
    const { center, size, rotation } = this;
    const left = center.x - size.width / 2;
    const diff = Vector.subtract(
      mousePos,
      new Vector({ x: left, y: center.y }),
    );
    const polar = diff.toPolar();
    polar.dir -= rotation;
    diff.toXY(polar);

    return diff;
  }

  setExtraValue(e, handle, startPosition, save = true) {
    const sizes = {
      width: this.size.width,
      height: this.size.height,
      half_w: this.size.width / 2,
      half_h: this.size.height / 2,
    };
    const mousePos = viewport.getAdjustedPosition(
      new Vec2(e.offsetX, e.offsetY),
    );

    const diff = this.shape.getDiff(
      mousePos,
      this.center,
      this.size,
      this.rotation,
    );

    const newvalue = Math.min(Math.max(diff.x, 0), sizes.half_w) / sizes.half_w;
    this.#extraoptions.values[0] = newvalue;

    viewport.dispatchEvent(
      new CustomEvent("extraChanged", {
        detail: {
          shape: this,
          extraoptions: { values },
          save,
        },
      }),
    );
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  getExtraHandlePos() {
    const { x, y } = this.center;
    const { height, width } = this.size;

    const half_w = width / 2;
    const left = x - half_w;
    const bottom = y + height / 2;
    const extraPoint = left + half_w * this.#extraoptions.values[0];

    return new Vector({ x: extraPoint, y: bottom });
  }

  static btn() {
    return {
      type: "button",
      attributes: { "data-tool": "trapezoid", title: "Trapezoid" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="currentColor" stroke-width="1.5"/></rect></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Trapezoid(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;
    const dist1 = this.#extraoptions.values[0];
    const half_h = size.height / 2;
    const half_w = size.width / 2;
    const left = x - half_w;
    const right = left + size.width;
    const top = y - half_h;

    ctx.beginPath();
    this.path.moveTo(left, top);
    this.path.lineTo(left + size.width, top);
    this.path.lineTo(right - half_w * dist1, top + size.height);
    this.path.lineTo(left + half_w * dist1, top + size.height);
    this.path.lineTo(left, top);

    this.applyStyles(ctx, this.path);
  }
}

class Parallelorgram extends BasicShape {
  shape = "Parallelorgram";
  #pathSet = new Set();
  #extraoptions = {
    values: [0.25],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  getDiff(mousePos) {
    const { center, size, rotation } = this;
    const left = center.x - size.width / 2;
    const diff = Vector.subtract(
      mousePos,
      new Vector({ x: left, y: center.y }),
    );
    const polar = diff.toPolar();
    polar.dir -= rotation;
    diff.toXY(polar);

    return diff;
  }

  setExtraValue(mousePos, startPosition, handle, save = true) {
    const { width } = this.size;
    const diff = this.getDiff(mousePos);

    const newvalue = Math.min(Math.max(diff.x, 0), width) / width;
    this.extraoptions.values[0] = newvalue;

    /*viewport.dispatchEvent(
      new CustomEvent("extraChanged", {
        detail: {
          shape: this,
          extraoptions: { values },
          save,
        },
      })
    );*/
  }

  getExtraHandlePos() {
    const { x, y } = this.center;
    const { height, width } = this.size;
    const half_w = width / 2;
    const left = x - half_w;
    const top = y - height / 2;
    const extraPoint = left + width * this.#extraoptions.values[0];

    return new Vector({ x: extraPoint, y: top });
  }

  static btn() {
    return {
      type: "button",
      attributes: { "data-tool": "parallelorgram", title: "Parallelorgram" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="currentColor" stroke-width="1.5"/></rect></svg>',
    };
  }

  static load(data, callback) {
    const shape = new TParallelorgram(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;
    const dist1 = this.#extraoptions.values[0];
    const half_h = size.height / 2;
    const half_w = size.width / 2;
    const left = x - half_w;
    const right = left + size.width;
    const top = y - half_h;

    ctx.beginPath();
    this.path.moveTo(left + size.width * dist1, top);
    this.path.lineTo(left + size.width, top);
    this.path.lineTo(right - size.width * dist1, top + size.height);
    this.path.lineTo(left, top + size.height);
    this.path.lineTo(left + size.width * dist1, top);

    this.applyStyles(ctx, this.path);
  }
}

function calculatePoint(eccentricAngle, center, width, height) {
  // Calculate semi-major and semi-minor axes
  let a = width / 2;
  let b = height / 2;

  // Calculate new point using the parametric equations for an ellipse
  let x = center.x + a * Math.cos(eccentricAngle);
  let y = center.y + b * Math.sin(eccentricAngle);

  return { x, y };
}

const BasicShapes = {
  RectShape,
  EllipseShape,
  IsoscelesTriangle,
  AngleTriangle,
  Octagon,
  Pentagon,
  Hexagon,
  CrossShape,
  Diament,
  Trapezoid,
  Parallelorgram,
  EllipsePie,
};
export { BasicShapes };
