import { Vector } from "../utils/vector";

class ViewPort extends EventTarget {
  #offset = Vector.zero();
  #zoom = 1;

  static zoom_step = 1.12;
  static min_zoom = 0.04;
  static max_zoom = 40;

  constructor(ratio) {
    super();
    //this.#zoom = ratio;
    console.log(this.#zoom);
  }

  get getOffset() {
    return this.#offset;
  }

  get getZoom() {
    return this.#zoom;
  }

  set setOffset(data = Vector.zero()) {
    this.#offset = data;
  }

  get zoomLabel() {
    return Math.round(this.#zoom * 100) + "%";
  }

  handleZoom(deltaY, vec = Vector.zero()) {
    const zoomstep = ViewPort.zoom_step;
    const z = this.#zoom * (deltaY < 0 ? zoomstep : 1 / zoomstep);
    const newZ = Math.max(ViewPort.min_zoom, Math.min(ViewPort.max_zoom, z));
    let newVec = Vector.subtract(vec, this.#offset);
    newVec.x = newVec.x * (newZ / z);
    newVec.y = newVec.y * (newZ / z);
    let newVec2 = Vector.subtract(vec, newVec);

    this.setOffset = newVec2;

    this.#zoom = newZ;
  }

  fitDoc({ width, height }) {
    this.#zoom = Math.min(width / width, height / height, 2);
    this.setOffset = new Vector({
      x: this.#zoom / 2,
      y: this.#zoom / 2,
    });
  }
}

export default ViewPort;
