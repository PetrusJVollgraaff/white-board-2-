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

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "star5point",
        title: "Star 5 Point",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="0,0 16,16 0,16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Star5Point(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;

    const left = x - size.width / 2;
    const top = y - size.height / 2;
    const right = left + size.width;
    const bottom = top + size.height;

    const height1 = size.height * 0.38;
    const height2 = size.height * 0.66;
    const height3 = size.height * 0.81;

    const width2 = size.width * 0.11;
    const width3 = size.width * 0.08;

    this.path.moveTo(x, top);
    this.path.lineTo(x + width2, top + height1);
    this.path.lineTo(right, top + height1);
    this.path.lineTo(x + width2 + width3, top + height2);
    this.path.lineTo(x + width2 * 2 + width3, bottom);
    this.path.lineTo(x, top + height3);
    this.path.lineTo(x - width2 * 2 - width3, bottom);
    this.path.lineTo(x - width2 - width3, top + height2);
    this.path.lineTo(left, top + height1);
    this.path.lineTo(x - width2, top + height1);
    this.path.lineTo(x, top);

    this.applyStyles(ctx, this.path);
  }
}

class Star6Point extends StarShape {
  shape = "Star6Point";
  constructor(data, callback) {
    super(data, callback);
  }
  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "star6point",
        title: "Star 6 Point",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="0,0 16,16 0,16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    };
  }

  static load(data, callback) {
    const shape = new Star6Point(data, callback);
    shape.selected = data.selected;
    return shape;
  }

  draw(ctx, hitRegion = false) {
    this.path = new Path2D();
    const { x, y } = this.center ? this.center : Vector.zero();
    const { size } = this;

    const left = x - size.width / 2;
    const top = y - size.height / 2;
    const right = left + size.width;
    const bottom = top + size.height;

    const height1 = size.height * 0.25;
    const height2 = size.height * 0.2;
    const width2 = size.width * 0.13;

    this.path.moveTo(x, top);
    this.path.lineTo(x + width2, y - height2);
    this.path.lineTo(right, top + height1);
    this.path.lineTo(x + width2 * 2, y);
    this.path.lineTo(right, bottom - height1);
    this.path.lineTo(x + width2, y + height2);
    this.path.lineTo(x, bottom);
    this.path.lineTo(x - width2, y + height2);
    this.path.lineTo(left, bottom - height1);
    this.path.lineTo(x - width2 * 2, y);
    this.path.lineTo(left, top + height1);
    this.path.lineTo(x - width2, y - height2);
    this.path.lineTo(x, top);

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

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "star8point",
        title: "Star 8 Point",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="0,0 16,16 0,16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
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

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "star12point",
        title: "Star 12 Point",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="0,0 16,16 0,16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
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

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "star24point",
        title: "Star 24 Point",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><polygon points="0,0 16,16 0,16" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
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
