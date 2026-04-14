class ColorPickerTool {
  static #Event = null;
  static addPointerDownListener(evt) {
    var _ = this;
    if (evt.button == 1) return;

    _(evt);
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
