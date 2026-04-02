import { Vector } from "../utils/vector";

class ViewPort extends EventTarget {
  #offset = Vector.zero();
  #zoom = 1;

  static zoom_step = 1.12;
  static min_zoom = 0.04;
  static max_zoom = 40;

  constructor(ratio) {
    super();
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

  applyZoom(z, vec = Vector.zero()) {
    const newZ = Math.max(ViewPort.min_zoom, Math.min(ViewPort.max_zoom, z));
    const test = Vector.subtract(vec, this.#offset).scale(newZ / this.#zoom);

    this.#zoom = newZ;
    this.setOffset = Vector.subtract(vec, test);
  }

  handleZoom(deltaY, vec = Vector.zero()) {
    const zoomstep = ViewPort.zoom_step;
    const z = this.#zoom * (deltaY < 0 ? zoomstep : 1 / zoomstep);
    this.applyZoom(z, vec);
  }

  fitDoc({ width, height, size }) {
    this.#zoom = Math.min((width * 0.85) / size.w, (height * 0.85) / size.h, 2);
    this.setOffset = new Vector({
      x: (width - size.w * this.#zoom) / 2,
      y: (height - size.h * this.#zoom) / 2,
    });
  }
}

export default ViewPort;
