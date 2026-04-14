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

  set Active(id) {
    if (this.#layers.some((l) => l.id == id)) {
      this.#activeLayer = id;
    }
  }
  get layers() {
    return this.#layers;
  }

  get activeLayer() {
    return this.#layers.find((l) => l.id === this.#activeLayer) ?? null;
  }

  draw(elm, size) {
    this.#layers.forEach((l) => {
      elm.append(l.draw(this.#activeLayer, size));
    });
  }

  #init() {
    this.#layers.push(new Layer("Background"));
    this.#activeLayer = this.#layers[0].getId;
  }

  add(name) {
    const layer = new Layer(name ?? `Layer ${this.#layers.length + 1}`);
    const idx = this.#layers.findIndex((l) => l.getId == this.#activeLayer);

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
}
export { LayerManager };
