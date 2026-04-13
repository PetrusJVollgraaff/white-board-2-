class LayerManager {
  #layers = [];
  #activeLayer = null;
  #mergeMode = false;
  #mergeSelIds = new Set();
  #onChange = null;
  constructor() {}

  set ChangeCallback(fn) {
    this.#onChange = fn;
  }

  get layers() {
    return this.#layers;
  }

  get activeLayer() {
    return this.#layers.find((l) => l.id === this.#activeLayer) ?? null;
  }
  get mergeMode() {
    return this.#mergeMode;
  }

  get mergeSelIds() {
    return this.#mergeSelIds;
  }

  get mergeSelCount() {
    return this.#mergeSelIds.size;
  }

  #init() {
    this.#layers.push(new Layer("Background"));
    this.#activeLayer = this.#layers[0].id;
  }

  add(name) {
    const layer = new Layer(name ?? `Layer ${this.#layers.length + 1}`);
    const idx = this.#activeLayer;

    this.#layers.splice(idx, 0, layer);
    this.#activeLayer = layer.id;
    return layer;
  }

  duplicate() {
    const src = this.#activeLayer;
    if (!src) return null;

    const copy = src.clone();
    copy.name = src.name + " copy";
    const idx = this.activeLayer;
    this.#layers.splice(idx, 0, copy);
    this.#activeLayer = copy.id;
    return copy;
  }

  delete() {
    if (this.#layers.length <= 1) return false;
    const idx = this.#activeLayer;
    this.#layers.splice(idx, 1);
    this.#activeLayer = this.#layers[Math.min(idx, this.#layers.length - 1)].id;
    return true;
  }

  set Active(id) {
    if (this.#layers.some((l) => l.id == id)) {
      this.#activeLayer = id;
    }
  }

  moveUp() {}

  moveDown() {}

  reorder() {}

  setOpacity() {}

  rename() {}

  set visible(id) {}

  enterMerge() {}
  exitMerge() {}

  toggleMerge() {}
}
