import {
  FreeHandTool,
  LineTool,
  ShapeTool,
  TextTool,
} from "../mouseEvents/mouseEventTools";

class ShapeToolFactory {
  static #available = {};

  static registerTools() {
    this.registerTool("FreeHandShape", FreeHandTool);
    this.registerTool("LineShape", LineTool);
    this.registerTool("TextShape", TextTool);
    this.registerTool("shape", ShapeTool);
  }

  static registerTool(typeName, classType) {
    this.#available[typeName] = { tool: classType };
  }

  static getTool(typeName) {
    if (
      typeName == "FreeHandShape" ||
      typeName == "LineShape" ||
      typeName == "TextShape"
    ) {
      return this.#available[typeName].tool;
    }

    return this.#available.shape.tool;
  }
}

export { ShapeToolFactory };
