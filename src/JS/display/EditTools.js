import { ShapeFactory } from "../utils/shapeFactory";

class EditTool {
  static clipboard = null;

  static selectAll(layerManager) {
    layerManager.activeLayerShapes.forEach((s) => s.select());
  }

  static unSelectAll(layerManager) {
    layerManager.activeLayerShapes.forEach((s) => s.unselect());
  }

  static copy(layerManager) {
    const shapes = layerManager.activeLayerShapes.filter((s) => s.selected);

    if (!shapes) {
      this.clipboard = null;
      return;
    }

    this.clipboard = shapes.map((s) => s.serialize());
  }

  static paste(layerManager, main) {
    if (this.clipboard) {
      const shapes = ShapeFactory.loadShapes(
        this.clipboard,
        main.ShapeCallback.bind(main),
      );
      shapes.forEach((shape) => {
        layerManager.addShape(shape);
      });
    }
  }

  static duplicate(layerManager, main) {
    this.copy(layerManager);
    this.paste(layerManager, main);
  }
}

export { EditTool };
