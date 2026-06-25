import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class BasicShape extends Shape {
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

  serialize() {
    return JSON.parse(JSON.stringify({ ...{ shape: this.shape }, ...this }));
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
}

class AngleTriangle extends BasicShape {
  #rotation = 0;
  shape = "AngleTriangle";
  #pathSet = new Set();
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
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
  #rotation = 0;
  shape = "CrossShape";
  #pathSet = new Set();
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
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
  #rotation = 0;
  #shape = "EllipseShape";
  #pathSet = new Set();

  constructor(data, callback) {
    super(data, callback);
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

class Hexagon extends BasicShape {
  #rotation = 0;
  shape = "Hexagon";
  #pathSet = new Set();
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
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
  #rotation = 0;
  shape = "IsoscelesTriangle";
  #pathSet = new Set();
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
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
  #rotation = 0;
  shape = "Octagon";
  #pathSet = new Set();
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
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

    const dist1 = this.#extraoptions.values[0];
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
  #rotation = 0;
  shape = "Pentagon";
  #pathSet = new Set();

  constructor(data, callback) {
    super(data, callback);
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
  #rotation = 0;
  shape = "RectShape";
  #pathSet = new Set();

  constructor(data, callback) {
    super(data, callback);
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
    const center = this.center ? this.center : Vector.zero();
    const left = center.x - this.size.width / 2;
    const top = center.y - this.size.height / 2;

    ctx.beginPath();
    this.path.rect(left, top, this.size.width, this.size.height);

    this.applyStyles(ctx, this.path);
  }
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
};
export { BasicShapes };
