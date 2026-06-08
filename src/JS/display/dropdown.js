import { createDOMElement } from "../display/model";

class DropDown {
  #elm = null;
  #title = null;
  #callback = () => {};
  #dropElm = null;
  #dropshow = false;
  constructor({ elm, title, callback }) {
    this.#elm = elm;
    this.#title = title;
    this.#callback = callback;
    this.#init();
  }

  #init() {
    this.#build();
    this.#eventListener();
  }

  #build() {
    this.#elm.style.position = "relative";
    this.#elm.style.cursor = "pointer";

    this.#elm.appendChild(
      createDOMElement({
        type: "span",
        attributes: { class: "tlbl" },
        text: this.#title,
      }),
    );

    this.#dropElm = createDOMElement({
      type: "ul",
      attributes: { class: "dropbox", "data-s": this.#dropshow },
    });

    this.#elm.appendChild(this.#dropElm);
    this.#callback(this.#dropElm);
    //new FilePanel(this.#dropElm, this.#callback);
  }

  #eventListener() {
    this.#elm.addEventListener("click", () => {
      this.#dropshow = !this.#dropshow;
      this.#dropElm.setAttribute("data-s", this.#dropshow);
    });
  }
}

export { DropDown };
