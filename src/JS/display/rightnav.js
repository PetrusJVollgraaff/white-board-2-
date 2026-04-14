import { LayerPanel } from "../panels/layerPanel";

class RightNav {
  #callback = () => {};
  #elm = null;
  #hideBtn = null;
  #main = null;
  #isHidden = false;
  constructor({ elm, main, callback }) {
    this.#elm = elm;
    this.#main = main;
    this.#callback = callback;

    new LayerPanel({
      elmP: this.#elm,
      main: this.#main,
      callback: this.#callback,
    });

    this.#init();
  }

  #init() {
    this.#hideBtn = this.#elm.querySelector("button#right_navbar_btn");
    this.#eventListener();
  }

  #eventListener() {
    this.#hideBtn.addEventListener("click", () => {
      this.#isHidden = !this.#isHidden;
      const action = this.#isHidden ? "add" : "remove";
      this.#elm.classList[action]("hide");
      this.#hideBtn.disabled = true;
    });

    this.#elm.addEventListener("transitionend", (evt) => {
      if (evt.target != this.#elm) return;

      const arrow = this.#isHidden ? "◁" : "▷";
      this.#hideBtn.innerHTML = arrow;
      this.#hideBtn.disabled = false;
    });
  }
}

export { RightNav };
