import { EditTool } from "../tools/EditTools";
import { HistoryTool } from "../tools/HistoryTool";
import { PanTools, SelectTool } from "../mouseEvents/mouseEventTools";

class ToolFactory {
  static #available = {};

  static registerTools() {
    this.registerTool("history", HistoryTool);
    this.registerTool("edit", EditTool);
    this.registerTool("select", SelectTool);
    this.registerTool("pan", PanTools);
  }

  static registerTool(typeName, classType) {
    this.#available[typeName] = { tool: classType };
  }

  static getTool(typeName) {
    return this.#available[typeName].tool;
  }
}

export { ToolFactory };
