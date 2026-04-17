import { Vector } from "../utils/vector";

class PanTools {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;
    const { target } = evt;
    if (evt.button == 1) return;
    const offset = _._vp.getOffset;
    const mouseStart = new Vector({ x: evt.clientX, y: evt.clientY });

    const moveCallback = function (evt) {
      const mouseMove = new Vector({ x: evt.clientX, y: evt.clientY });
      const newPos = Vector.add(offset, Vector.subtract(mouseMove, mouseStart));

      _._vp.setOffset = newPos;
      _.setOffset = newPos;

      _.render();
    };
    const upCallback = function (evt) {
      target.removeEventListener("pointermove", moveCallback);
      target.removeEventListener("pointerup", upCallback);
      _.render();
    };

    target.addEventListener("pointermove", moveCallback);
    target.addEventListener("pointerup", upCallback);
  }

  static configureEventListener(viewport, main) {
    this.#Event = this.addPointerDownListener.bind(main);
    viewport.addEventListener("pointerdown", this.#Event);
  }

  static removeEventListeners(viewport) {
    viewport.removeEventListener("pointerdown", this.#Event);
    this.#Event = null;
  }
}
export { PanTools };
