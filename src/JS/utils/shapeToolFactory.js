import { EllipseTool } from "../mouseEvents/ellipseTool";
import { FreeHandTool } from "../mouseEvents/freehandTool";
import { LineTool } from "../mouseEvents/lineTool";
import { RectTool } from "../mouseEvents/rectTool";

class ShapeToolFactory {
  static #available = {};

  static registerTools() {
    this.registerTool(RectTool, "rect");
    this.registerTool(EllipseTool, "ellipse");
    this.registerTool(FreeHandTool, "freehand");
    this.registerTool(LineTool, "line");
  }

  static registerTool(classType, typeName) {
    this.#available[typeName] = { tool: classType };

    console.log(this.#available);
  }

  static getTool(tool) {
    return this.#available[tool].tool;
  }
}

export { ShapeToolFactory };
