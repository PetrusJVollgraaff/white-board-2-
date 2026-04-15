import { Vector } from "../utils/vector";

class RectTool {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;
    const { target } = evt;
    if (evt.button == 1) return;
    evt["startPoint"] = new Vector({ x: evt.clientX, y: evt.clientY });
    _(evt);
    const moveCallback = function (evt) {
      evt["movePoint"] = new Vector({ x: evt.clientX, y: evt.clientY });
      _(evt);
    };
    const upCallback = function (evt) {
      _(evt);
      target.removeEventListener("pointermove", moveCallback);
      target.removeEventListener("pointerup", upCallback);
    };

    target.addEventListener("pointermove", moveCallback);
    target.addEventListener("pointerup", upCallback);
  }

  static configureEventListener(viewport, callback) {
    this.#Event = this.addPointerDownListener.bind(callback);
    viewport.addEventListener("pointerdown", this.#Event);
  }

  static removeEventListeners(viewport) {
    viewport.removeEventListener("pointerdown", this.#Event);
    this.#Event = null;
  }
}

export { RectTool };
