class SelectTool {
  static #Event = null;

  static addPointerDownListener(evt) {
    var _ = this;
    const { target } = evt;
    if (evt.button == 1) return;

    _(evt);
    const moveCallback = function (evt) {
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

export { SelectTool };
