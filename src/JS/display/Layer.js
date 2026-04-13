class Layer {
  #id = Layer._uid();
  #name = null;
  #visible = true;
  #opacity = 100;
  #shapes = [];
  #mergeHistory = null;
  constructor(name, opts = {}) {
    this.#name = name;
  }

  static _uid() {
    return "L" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  get isMerged() {
    return Array.isArray(this.#mergeHistory) && this.#mergeHistory.length > 0;
  }

  get shapeCount() {
    return this.#shapes.length;
  }

  clone() {}

  toJSON() {}

  static fromJSON(o) {}

  render() {}

  thumb({ width, height }) {}
}
