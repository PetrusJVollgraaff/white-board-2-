import { EditTool } from "../tools/EditTools";
import { HistoryTool } from "../tools/HistoryTool";
import { PanTools, SelectTool } from "../mouseEvents/mouseEventTools";

class ToolFactory {
  static #available = {};

  static registerTools() {
    this.registerTool(HistoryTool, "history");
    this.registerTool(EditTool, "edit");
    this.registerTool(SelectTool, "select");
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
