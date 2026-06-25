import { EllipseShape } from "../shapes/basic/ellipse";
import { FreeHandShape } from "../shapes/patterns/freehand";
import { LineShape } from "../shapes/patterns/line";
import { RectShape } from "../shapes/basic/rectangle";
import { IsoscelesTriangle } from "../shapes/basic/isoscelestriangle";
import { AngleTriangle } from "../shapes/basic/angletriangle";
import { Octagon } from "../shapes/basic/octagon";
import { Pentagon } from "../shapes/basic/pentagon";
import { Hexagon } from "../shapes/basic/hexagon";
import { CrossShape } from "../shapes/basic/crossshape";

class ShapeFactory {
  static #available = {};

  static registerShapes() {
    this.registerShape(RectShape, "RectShape");
    this.registerShape(EllipseShape, "EllipseShape");
    this.registerShape(FreeHandShape, "FreeHandShape");
    this.registerShape(LineShape, "LineShape");
    this.registerShape(IsoscelesTriangle, "IsoscelesTriangle");
    this.registerShape(AngleTriangle, "AngleTriangle");
    this.registerShape(Octagon, "Octagon");
    this.registerShape(Pentagon, "Pentagon");
    this.registerShape(Hexagon, "Hexagon");
    this.registerShape(CrossShape, "CrossShape");
  }

  static registerShape(classType, typeName) {
    this.#available[typeName] = { shape: classType };
  }

  static loadShape(shapeData, callback) {
    const cls = this.#available[shapeData.shape].shape;
    const shape = cls.load(shapeData, callback);

    return shape;
  }

  static newShape(shape) {
    return this.#available[shape].shape;
  }

  static loadShapes(data, callback) {
    const loadedShapes = [];
    for (const shapeData of data) {
      const shape = this.loadShape(shapeData, callback);
      loadedShapes.push(shape);
    }

    return loadedShapes;
  }
}

export { ShapeFactory };
