import {
  FreeHandTool,
  LineTool,
  ShapeTool,
} from "../mouseEvents/mouseEventTools";

class ShapeToolFactory {
  static #available = {};

  static registerTools() {
    this.registerTool(FreeHandTool, "FreeHandShape");
    this.registerTool(LineTool, "LineShape");
    this.registerTool(ShapeTool, "shape");
  }

  static registerTool(classType, typeName) {
    this.#available[typeName] = { tool: classType };
  }

  static getTool(tool) {
    if (tool == "FreeHandShape" || tool == "LineShape") {
      return this.#available[tool].tool;
    }

    return this.#available.shape.tool;
  }
}

export { ShapeToolFactory };
