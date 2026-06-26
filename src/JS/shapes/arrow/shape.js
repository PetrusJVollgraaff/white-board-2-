import { Layer } from "../../display/Layer";
import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class ArrowShape extends Shape {
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

class BlockArrow1 extends ArrowShape {
  shape = "BlockArrow1";
  #extraoptions = {
    values: [0.75],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  static btn() {
    return {
      type: "button",
      attributes: { "data-tool": "blockarrow2", title: "Block Arrow 2" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="currentColor" stroke-width="1.5"/></rect></svg>',
    };
  }

  static load(data, callback) {
    const shape = new BlockArrow1(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  getExtraHandlePos() {
    const { x, y } = this.center;
    const { width, height } = this.size;
    const [dist1] = this.#extraoptions.values;

    const half_w = width / 2;
    const left = x - half_w;
    const top = y - height / 2;
    const extraPoint = left + width * dist1;

    return new Vector({ x: extraPoint, y: top });
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;

    const [dist] = this.#extraoptions.values;
    const left = x - size.width / 2;
    const top = y - size.height / 2;

    this.path.moveTo(left, top);
    this.path.lineTo(left + size.width * dist, top);
    this.path.lineTo(left + size.width, y);
    this.path.lineTo(left + size.width * dist, top + size.height);
    this.path.lineTo(left, top + size.height);
    this.path.lineTo(left, top);

    this.applyStyles(ctx, this.path);
  }
}

class BlockArrow2 extends ArrowShape {
  shape = "BlockArrow2";
  #extraoptions = {
    values: [0.75],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  getExtraHandlePos(center, size) {
    const { x, y } = this.center;
    const { width, height } = this.size;
    const [dist1] = this.#extraoptions.values;

    const half_w = width / 2;
    const left = x - half_w;
    const top = y - height / 2;
    const extraPoint = left + width * dist1;

    return new Vector({ x: extraPoint, y: top });
  }

  static btn() {
    return {
      type: "button",
      attributes: { "data-tool": "blockarrow2", title: "Block Arrow 2" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="currentColor" stroke-width="1.5"/></rect></svg>',
    };
  }

  static load(data, callback) {
    const shape = new BlockArrow2(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;

    const [dist] = this.#extraoptions.values;
    const left = x - size.width / 2;
    const top = y - size.height / 2;

    this.path.moveTo(left, top);
    this.path.lineTo(left + size.width * dist, top);
    this.path.lineTo(left + size.width, y);
    this.path.lineTo(left + size.width * dist, top + size.height);
    this.path.lineTo(left, top + size.height);
    this.path.lineTo(left + size.width * (1 - dist), y);
    this.path.lineTo(left, top);
    this.path.lineTo(x, top);

    this.applyStyles(ctx, this.path);
  }
}

class BlockArrow3 extends ArrowShape {
  shape = "BlockArrow3";

  #extraoptions = {
    values: [0.75, 0.25],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  getExtraHandlePos() {
    const { x, y } = this.center;
    const { width, height } = this.size;
    const [dist1, dist2] = this.#extraoptions.values;

    const half_h = height / 2;
    const left = x - width / 2;
    const top = y - half_h;
    const extraPoint1 = left + width * dist1;
    const extraPoint2 = top + half_h * dist2;

    return new Vector({ x: extraPoint1, y: extraPoint2 });
  }

  static btn() {
    return {
      type: "button",
      attributes: { "data-tool": "blockarrow3", title: "Block Arrow 3" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="currentColor" stroke-width="1.5"/></rect></svg>',
    };
  }

  static load(data, callback) {
    const shape = new BlockArrow3(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;
    const [dist1, dist2] = this.#extraoptions.values;

    const half_h = size.height / 2;
    const left = x - size.width / 2;
    const top = y - half_h;
    const bottom = top + size.height;

    this.path.moveTo(left, top + half_h * dist2);
    this.path.lineTo(left + size.width * dist1, top + half_h * dist2);
    this.path.lineTo(left + size.width * dist1, top);
    this.path.lineTo(left + size.width, y);
    this.path.lineTo(left + size.width * dist1, bottom);
    this.path.lineTo(left + size.width * dist1, bottom - half_h * dist2);
    this.path.lineTo(left, bottom - half_h * dist2);
    this.path.lineTo(left, top + half_h * dist2);

    this.applyStyles(ctx, this.path);
  }
}

class BlockArrow4 extends ArrowShape {
  shape = "BlockArrow4";

  #extraoptions = {
    values: [0.5, 0.5],
    handles: 1,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  getExtraHandlePos() {
    const { x, y } = this.center;
    const { width, height } = this.size;
    const [dist1, dist2] = this.#extraoptions.values;

    const half_w = width / 2;
    const half_h = height / 2;
    const left = x - half_w;
    const top = y - half_h;
    const extraPoint1 = left + half_w * dist1;
    const extraPoint2 = top + half_h * dist2;

    return new Vector({ x: extraPoint1, y: extraPoint2 });
  }

  static btn() {
    return {
      type: "button",
      attributes: { "data-tool": "blockarrow4", title: "Block Arrow 4" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="currentColor" stroke-width="1.5"/></rect></svg>',
    };
  }

  static load(data, callback) {
    const shape = new BlockArrow4(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;
    const [dist1, dist2] = this.#extraoptions.values;

    const half_h = size.height / 2;
    const half_w = size.width / 2;
    const left = x - half_w;
    const top = y - half_h;
    const right = left + size.width;
    const bottom = top + size.height;

    this.path.moveTo(left, y);
    this.path.lineTo(left + half_w * dist1, top);
    this.path.lineTo(left + half_w * dist1, top + half_h * dist2);
    this.path.lineTo(right - half_w * dist1, top + half_h * dist2);
    this.path.lineTo(right - half_w * dist1, top);
    this.path.lineTo(left + size.width, y);
    this.path.lineTo(right - half_w * dist1, top + size.height);
    this.path.lineTo(right - half_w * dist1, bottom - half_h * dist2);
    this.path.lineTo(left + half_w * dist1, bottom - half_h * dist2);
    this.path.lineTo(left + half_w * dist1, top + size.height);
    this.path.lineTo(left, y);

    this.applyStyles(ctx, this.path);
  }
}

class BlockArrow5 extends ArrowShape {
  shape = "BlockArrow5";
  #extraoptions = {
    values: [0.55, 0.65, 0.75, 0.4],
    handles: 3,
  };

  constructor(data, callback) {
    super(data, callback);
  }

  hasExtraOptions() {
    return this.#extraoptions;
  }

  getExtraHandlePos(handle) {
    const { x, y } = this.center;
    const { width, height } = this.size;
    const [dist1, dist2, dist3, dist4] = this.extraoptions.values;

    const half_w = width / 2;
    const half_h = height / 2;
    const left = x - half_w;
    const top = y - half_h;
    const right = left + size.width;

    if (handle == 0) {
      const extraPoint1 = left + width * dist1;
      return new Vector({ x: extraPoint1, y: top });
    } else if (handle == 1) {
      const extraPoint2 = top + half_h * dist4;
      return new Vector({ x: right, y: extraPoint2 });
    } else {
      const extraPoint1 = left + width * dist3;
      const extraPoint2 = top + half_h * dist2;
      return new Vector({ x: extraPoint1, y: extraPoint2 });
    }
  }

  static btn() {
    return {
      type: "button",
      attributes: { "data-tool": "blockarrow5", title: "Block Arrow 5" },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="8,0 16,8 8,16 0,8" fill="none" stroke="currentColor" stroke-width="1.5"/></rect></svg>',
    };
  }

  static load(data, callback) {
    const shape = new BlockArrow5(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;
    const [dist1, dist2, dist3, dist4] = this.#extraoptions.values;

    const half_h = size.height / 2;
    const left = x - size.width / 2;
    const top = y - half_h;
    const bottom = top + size.height;

    this.path.moveTo(left, top);
    this.path.lineTo(left + size.width * dist1, top);
    this.path.lineTo(left + size.width * dist1, top + half_h * dist2);
    this.path.lineTo(left + size.width * dist3, top + half_h * dist2);
    this.path.lineTo(left + size.width * dist3, top + half_h * dist4);
    this.path.lineTo(left + size.width, y);
    this.path.lineTo(left + size.width * dist3, bottom - half_h * dist4);
    this.path.lineTo(left + size.width * dist3, bottom - half_h * dist2);
    this.path.lineTo(left + size.width * dist1, bottom - half_h * dist2);
    this.path.lineTo(left + size.width * dist1, bottom);
    this.path.lineTo(left, bottom);
    this.path.lineTo(left, top);

    this.applyStyles(ctx, this.path);
  }
}

const ArrowShapes = {
  BlockArrow1,
  BlockArrow2,
  BlockArrow3,
  BlockArrow4,
  BlockArrow5,
};
export { ArrowShapes };
