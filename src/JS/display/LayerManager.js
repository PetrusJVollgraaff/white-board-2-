import { ToolFactory } from "../utils/toolFactory";
import { Layer } from "./Layer";

class LayerManager {
  #layers = [];
  #activeLayer = null;
  #mergeMode = false;
  #mergeSelIds = new Set();
  #onChange = null;
  #main = null;
  #dragSrcId = null;
  #layerList = [];
  #history = ToolFactory.getTool("history");
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
      this.#main.setItemsUnselect = false;

      this.#activeLayer = id;
      this.#layers.forEach((l) => (l.setActive = this.#activeLayer == l.getId));
      this.#main.getSelections;
    }
  }

  get layers() {
    return this.#layers;
  }

  get activeLayer() {
    return this.#layers.find((l) => l.getId === this.#activeLayer) ?? null;
  }

  get activeLayerShapes() {
    const idx = this.#layers.findIndex((l) => l.getId === this.#activeLayer);

    return idx > -1 ? this.#layers[idx].getShapes : null;
  }

  set setLayerOpacity(value) {
    const idx = this.#layers.findIndex((l) => l.getId === this.#activeLayer);
    this.#layers[idx].setOpacity = value;
  }

  set arrangeLayerShapes(value) {
    const layer = this.activeLayer;

    if (layer) layer[value];
  }

  #layerCallback(data) {
    const { action } = data;
    if (action == "active") this.#Active(data.id);
    if (action == "dragstart") this.#dragSrcId = data.id;
    if (action == "dragsover") {
      this.#layers.forEach((l, i) => {
        l.setElmClass = { className: "drag-over", action: "remove" };
      });
    }
    if (action == "dragend") {
      this.reorderTo(this.#dragSrcId, data.id);
      const layer = this.#layers.find((l) => l.getId == this.#dragSrcId);
      layer.dispatchEvent(new CustomEvent("endDrag", { detail: {} }));
      this.#dragSrcId = null;
      this.#history.record(this.#layers);
    }

    this.#main.render();
  }

  /** layer methods */
  render(elm = null) {
    if (!this.#layerList.includes(elm) && elm) this.#layerList.push(elm);

    this.#layers.forEach((l) => {
      this.#layerList.forEach((elm) => {
        elm.append(l.render(this.#activeLayer, this.#main.getSize));
      });
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

  load({ layers }) {
    this.#layers = layers.map((l) => {
      if (l.selected) {
        this.#activeLayer = l.id;
      }
      return Layer.load({
        ...l,
        ...{ callback: this.#layerCallback.bind(this) },
      });
    });
    this.#layerList.forEach((elm) => (elm.innerHTML = ""));
    this.render();
  }

  add(givenname) {
    const src = this.#layers.find((l) => l.getId == this.#activeLayer);
    if (src) src.setActive = false;

    const size = this.#main.getSize;
    const name = givenname ?? this.#layerNameExist("Layer", 1);
    const layer = new Layer({
      name,
      size,
      callback: this.#layerCallback.bind(this),
      main: this.#main,
    });
    const idx = 0; //this.#layers.findIndex((l) => l.getId == this.#activeLayer);

    this.#layers.splice(idx, 0, layer);
    layer.setActive = true;
    this.#activeLayer = layer.getId;

    this.#fixlayerOrder();
    this.#history.record(this.#layers);
    return layer;
  }

  duplicate() {
    const src = this.#layers.find((l) => l.getId == this.#activeLayer);
    if (!src) return null;

    const copy = src.clone(this.#layerCallback.bind(this));
    copy.name = src.name + " copy";

    const idx = this.#layers.findIndex((l) => l.getId == this.#activeLayer);
    this.#layers.splice(idx, 0, copy);
    src.setActive = false;
    copy.setActive = true;
    this.#activeLayer = copy.getId;

    this.#fixlayerOrder();
    this.#history.record(this.#layers);
    return copy;
  }

  delete() {
    if (this.#layers.length <= 1) return false;
    const idx = this.#layers.findIndex((l) => l.getId == this.#activeLayer);
    this.#layers.splice(idx, 1);

    this.#activeLayer =
      this.#layers[Math.min(idx, this.#layers.length - 1)].getId;
    this.#layers[Math.min(idx, this.#layers.length - 1)].setActive = true;

    this.#fixlayerOrder();
    this.#history.record(this.#layers);
    return true;
  }

  reorderTo(fromId, toId) {
    const fi = this.#layers.findIndex((l) => l.getId === fromId);
    const ti = this.#layers.findIndex((l) => l.getId === toId);

    if (fi === -1 || ti === -1 || fi === ti) return;
    const [layer] = this.#layers.splice(fi, 1);
    this.#layers.splice(ti, 0, layer);
    this.#fixlayerOrder();
    this.render();
  }

  moveUp() {
    const idx = this.#layers.findIndex((l) => l.getId == this.#activeLayer);
    if (idx <= 0) return;
    this.#move(idx, idx - 1);
    this.#fixlayerOrder();
  }

  moveDown() {
    const idx = this.#layers.findIndex((l) => l.getId == this.#activeLayer);
    if (idx >= this.#layers.length - 1) return;
    this.#move(idx, idx + 1);
    this.#fixlayerOrder();
  }

  #fixlayerOrder() {
    this.#layers.forEach((l, i) => {
      l.setOrder = i;
    });
  }

  #move(idx, idx2) {
    [this.#layers[idx], this.#layers[idx2]] = [
      this.#layers[idx2],
      this.#layers[idx],
    ];
  }

  /** shapes Methods  */
  addShape(shape) {
    const size = this.#main.getSize;
    const idx = this.#layers.findIndex((l) => l.getId === this.#activeLayer);
    if (idx > -1) {
      this.#layers[idx].addShape = shape;
      this.#layers[idx].renderThumb(size.w, size.h);
    }
  }

  removeShapes() {
    const size = this.#main.getSize;
    const idx = this.#layers.findIndex((l) => l.getId === this.#activeLayer);
    if (idx > -1) {
      this.#layers[idx].removeShapes = true;
      this.#layers[idx].renderThumb(size.w, size.h);
    }
  }

  drawShape(ctx, shape = []) {
    const size = this.#main.getSize;
    this.#layers.forEach((l) => l.renderThumb(size.w, size.h));
    const layers = Object.values(this.#layers).flat().reverse();

    layers.forEach((l) => {
      const newshape = l.getId === this.#activeLayer ? shape : [];
      l.renderShapes(ctx, newshape);
    });
  }
}
export { LayerManager };
