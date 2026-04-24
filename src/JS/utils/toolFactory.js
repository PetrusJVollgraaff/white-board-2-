import { EditTool } from "../display/EditTools";
import { HistoryTool } from "../display/HistoryTool";
import { PanTools } from "../mouseEvents/panTool";
import { SelectTool } from "../mouseEvents/selectTool";

class ToolFactory {
  static #available = {};

  static registerTools() {
    this.registerTool(HistoryTool, "history");
    this.registerTool(SelectTool, "select");
    this.registerTool(EditTool, "edit");
    this.registerTool(PanTools, "pan");
  }

  static registerTool(classType, typeName) {
    this.#available[typeName] = { tool: classType };
  }

  static getTool(tool) {
    return this.#available[tool].tool;
  }
}

export { ToolFactory };
