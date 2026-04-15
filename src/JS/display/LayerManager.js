import { Layer } from "./Layer";

class LayerManager {
  #layers = [];
  #activeLayer = null;
  #mergeMode = false;
  #mergeSelIds = new Set();
  #onChange = null;
  #main = null;
  constructor({ main }) {
    this.#main = main;
    this.#init();
  }

  #init() {
    this.add("Background");
    //this.#layers.push(new Layer({name:"Background"}));
    this.#activeLayer = this.#layers[0].getId;
  }

  /**  Sets Gets */
  #Active(id) {
    if (this.#layers.some((l) => l.getId == id)) {
      this.#activeLayer = id;
      this.#layers.forEach((l) => (l.setActive = this.#activeLayer == l.getId));
    }
  }
  get layers() {
    return this.#layers;
  }

  get activeLayer() {
    return this.#layers.find((l) => l.id === this.#activeLayer) ?? null;
  }

  #layerCallback(data) {
    const { action } = data;
    if (action == "active") this.#Active(data.id);
    this.#main.render();
  }

  /** layer methods */
  draw(elm, size) {
    this.#layers.forEach((l) => {
      elm.append(l.draw(this.#activeLayer, size));
    });
  }

  #layerNameExist(name, num) {
    let newName = `${name} ${num}`;
    while (this.#layers.some((l) => l.getName == newName)) {
      num += 1;
      newName = `${name} ${num}`;
    }

    return newName;
  }

  add(givenname) {
    const name =
      givenname ?? this.#layerNameExist("Layer", this.#layers.length + 1);
    const layer = new Layer({ name, callback: this.#layerCallback.bind(this) });
    const idx = 0; //this.#layers.findIndex((l) => l.getId == this.#activeLayer);

    this.#layers.splice(idx, 0, layer);
    this.#activeLayer = layer.getId;
    return layer;
  }

  duplicate() {
    const src = this.#layers.find((l) => l.getId == this.#activeLayer);
    if (!src) return null;

    const copy = src.clone();
    copy.name = src.name + " copy";
    const idx = this.#layers.findIndex((l) => l.getId == this.#activeLayer);
    this.#layers.splice(idx, 0, copy);
    this.#activeLayer = copy.getId;
    return copy;
  }

  delete() {
    if (this.#layers.length <= 1) return false;
    const idx = this.#layers.findIndex((l) => l.getId == this.#activeLayer);
    this.#layers.splice(idx, 1);
    this.#activeLayer =
      this.#layers[Math.min(idx, this.#layers.length - 1)].getId;
    return true;
  }

  moveUp() {
    const idx = this.#layers.findIndex((l) => l.getId == this.#activeLayer);
    if (idx <= 0) return;
    this.#move(idx, idx - 1);
  }

  moveDown() {
    const idx = this.#layers.findIndex((l) => l.getId == this.#activeLayer);
    if (idx >= this.#layers.length - 1) return;
    this.#move(idx, idx + 1);
  }

  #move(idx, idx2) {
    [this.#layers[idx], this.#layers[idx2]] = [
      this.#layers[idx2],
      this.#layers[idx],
    ];
  }

  /** shapes Methods  */
  addShape(shape) {
    const idx = this.#layers.findIndex((l) => l.getId === this.#activeLayer);
    if (idx > -1) this.#layers[idx].addShape = shape;
  }

  drawShape(ctx, shape = []) {
    const shapes = Object.values(
      this.#layers.map((l) => l.getShapes).reverse(),
    ).flat();
    [...shapes, ...shape].forEach((s) => {
      s.draw(ctx);
    });
  }
}
export { LayerManager };
