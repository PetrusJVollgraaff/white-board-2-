import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class RectShape extends Shape {
  #rotation = 0;
  #shape = "RectShape";
  #pathSet = new Set();

  constructor({
    center = Vector.zero(),
    size = { width: 0, height: 0 },
    type,
    options = Shape.defaultOptions(),
  }) {
    super(options, type);

    this.center = center;
    this.size = size;
    this.options = options;
  }

  static load(data) {
    const shape = new RectangleShapes(
      Vec2.load(data.center),
      data.size,
      data.type,
      JSON.parse(JSON.stringify(data.options)),
    );

    return shape;
  }
  /*
  isFillClickedon(mousePos) {
    const paths = Array.from(this.pathSet);
    viewport.OffscreenLayer.rotateCanvas(this.center, this.rotation);

    const isclickedon = viewport.OffscreenLayer.ctx.isPointInPath(
      paths[0][0],
      mousePos.x,
      mousePos.y,
    );

    viewport.OffscreenLayer.rotateCanvas(this.center, -this.rotation);
    return isclickedon;
  }

  isStrokeClickedon(mousePos) {
    const paths = Array.from(this.pathSet);
    viewport.OffscreenLayer.rotateCanvas(this.center, this.rotation);

    const isclickedon = viewport.OffscreenLayer.ctx.isPointInStroke(
      paths[0][0],
      mousePos.x,
      mousePos.y,
    );

    viewport.OffscreenLayer.rotateCanvas(this.center, -this.rotation);
    return isclickedon;
  }

  isSelected(e) {
    const mousePos = viewport.getMousePosition(new Vec2(e.offsetX, e.offsetY));
    const isfill = this.options.fill.visible && this.isFillClickedon(mousePos);

    return isfill || this.isStrokeClickedon(mousePos);
  }*/

  setCorner2(corner2) {
    this.corner2 = corner2;
  }

  _setWidth(width) {
    this.size.width = width;
  }

  _setHeight(height) {
    this.size.height = height;
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

export { RectShape };
