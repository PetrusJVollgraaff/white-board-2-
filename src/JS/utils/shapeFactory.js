import { EllipseShape } from "../shapes/patterns/ellipse";
import { FreeHandShape } from "../shapes/patterns/freehand";
import { LineShape } from "../shapes/patterns/line";
import { RectShape } from "../shapes/patterns/rectangle";

class ShapeFactory {
  static #available = {};

  static registerShapes() {
    this.registerShape(RectShape, "RectShape");
    this.registerShape(EllipseShape, "EllipseShape");
    this.registerShape(FreeHandShape, "FreeHandShape");
    this.registerShape(LineShape, "LineShape");
  }

  static registerShape(classType, typeName) {
    this.#available[typeName] = { shape: classType };
  }

  static loadShape(shapeData, callback) {
    const cls = this.#available[shapeData.shape].shape;
    const shape = cls.load(shapeData, callback);

    return shape;
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
