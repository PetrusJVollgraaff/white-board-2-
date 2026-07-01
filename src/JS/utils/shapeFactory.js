import { FreeHandShape } from "../shapes/patterns/freehand";
import { LineShape } from "../shapes/patterns/line";
import { BasicShapes } from "../shapes/basic/shape";
import { ArrowShapes } from "../shapes/arrow/shape";
import { StarShapes } from "../shapes/star/shape";
import { ImagesShape } from "../shapes/image/shape";

class ShapeFactory {
  static #available = {};

  static registerShapes() {
    this.registerShape(FreeHandShape, "FreeHandShape");
    this.registerShape(LineShape, "LineShape");
    this.registerShape(ImagesShape, "ImagesShape");
    for (const key in BasicShapes) this.registerShape(BasicShapes[key], key);
    for (const key in ArrowShapes) this.registerShape(ArrowShapes[key], key);
    for (const key in StarShapes) this.registerShape(StarShapes[key], key);
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
