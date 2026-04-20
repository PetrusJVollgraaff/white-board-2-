class HistoryTool {
  static redoStack = [];
  static undoStack = [];

  static redo(callback) {
    if (this.redoStack.length > 0) {
      const data = HistoryTool.redo.pop();
      HistoryTool.undoStack.push(data);
    }

    callback({
      event: {
        event: {
          name: "history",
          detail: { layers: [] },
        },
      },
    });
  }

  static undo(callback) {
    if (!this.undoStack.length) return;
    this.redoStack.push(this.undoStack.pop());

    if (this.undoStack.length > 0) {
      const newLayers = this.undoStack[this.undoStack.length - 1];
    } else {
    }

    callback({
      event: {
        event: {
          name: "history",
          detail: { layers: [] },
        },
      },
    });
  }

  static record(layers) {
    const newState = layers.map((l) => l.serialize());

    if (this.undoStack.length > 0) {
      const lastItem = this.undoStack[this.undoStack.length - 1];
      if (JSON.stringify(lastItem) === JSON.stringify(newState)) return;
    }

    this.undoStack.push(newState);
    this.redoStack.length = 0;
  }
}
