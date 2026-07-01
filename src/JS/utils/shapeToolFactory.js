import {
  FreeHandTool,
  LineTool,
  ShapeTool,
  TextTool,
} from "../mouseEvents/mouseEventTools";

class ShapeToolFactory {
  static #available = {};

  static registerTools() {
    this.registerTool(FreeHandTool, "FreeHandShape");
    this.registerTool(LineTool, "LineShape");
    this.registerTool(TextTool, "TextShape");
    this.registerTool(ShapeTool, "shape");
  }

  static registerTool(classType, typeName) {
    this.#available[typeName] = { tool: classType };
  }

  static getTool(tool) {
    console.log(tool);
    if (tool == "FreeHandShape" || tool == "LineShape" || tool == "TextShape") {
      return this.#available[tool].tool;
    }

    return this.#available.shape.tool;
  }
}

export { ShapeToolFactory };
