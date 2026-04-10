import { createDOMElement } from "../display/model";

class RulerPanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;
  #showRulers = null;

  constructor(elmP, callback) {
    this.#elmP = elmP;
    this.#callback = callback;
    this.#elm = this.#elmP.querySelector("li#ruler_ctn");
    this.#init();
  }

  #init() {
    this.#build();
    this.#eventListener();
  }

  #build() {
    this.#elm.appendChild(
      createDOMElement({
        type: "span",
        attributes: { class: "tlbl" },
        text: "VIEW RULERS",
      }),
    );
    this.#showRulers = createDOMElement({
      type: "input",
      attributes: {
        type: "checkbox",
        checked: "checked",
      },
    });

    this.#elm.appendChild(this.#showRulers);
  }

  #eventListener() {
    this.#showRulers.addEventListener("change", () => {
      this.#callback({ action: "setRuler", value: this.#showRulers.checked });
    });
  }
}
export { RulerPanel };
