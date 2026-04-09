class RulerPanel {
  #callback = () => {};
  #elmP = null;
  constructor(elmP, callback) {
    this.#elmP = elmP;
    this.#callback = callback;
    this.#init();
  }

  #init() {
    this.showRulers = this.#elmP.querySelector("#chk-rulers");
    this.#eventListener();
  }

  #eventListener() {
    this.showRulers.addEventListener("change", () => {
      this.#callback({ action: "setRuler", value: this.showRulers.checked });
    });
  }
}
export { RulerPanel };
