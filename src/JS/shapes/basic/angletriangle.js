import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class AngleTriangle extends Shape {
  #rotation = 0;
  #shape = "AngleTriangle";
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

export { AngleTriangle };
