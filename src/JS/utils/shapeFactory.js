import { FreeHandShape } from "../shapes/patterns/freehand";
import { LineShape } from "../shapes/patterns/line";
import { BasicShapes } from "../shapes/basic/shape";

class ShapeFactory {
  static #available = {};

  static registerShapes() {
    this.registerShape(FreeHandShape, "FreeHandShape");
    this.registerShape(LineShape, "LineShape");
    for (const key in BasicShapes) {
      this.registerShape(BasicShapes[key], key);
    }
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
