import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class CrossShape extends Shape {
  #rotation = 0;
  #shape = "CrossShape";
  #pathSet = new Set();
  #extraoptions = {
    values: [0.5],
    handles: 1,
  };

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

export { CrossShape };
