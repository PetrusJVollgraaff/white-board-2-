class ShapeFactory {
  static #available = {};

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
