import { createDOMElement } from "../display/model";

class DropDown {
  #elm = null;
  #title = null;
  #innerhtml = null;
  #callback = () => {};
  #dropElm = null;
  #dropshow = false;
  #dir = "down";
  #html = "span";
  #extraclass = ["dropbox"];
  constructor({
    elm,
    callback,
    dir = "down",
    extraclass = [],
    title = null,
    innerhtml = null,
    html = "span",
  }) {
    this.#elm = elm;
    this.#title = title;
    this.#innerhtml = innerhtml;
    this.#callback = callback;
    this.#html = html;
    this.#dir = dir;
    this.#extraclass = this.#extraclass.concat(extraclass);
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
        type: this.#html,
        attributes: { class: "tlbl" },
        text: this.#title,
        innerhtml: this.#innerhtml,
      }),
    );

    this.#dropElm = createDOMElement({
      type: "ul",
      attributes: {
        class: this.#extraclass.map((c) => c).join(" "),
        "data-s": this.#dropshow,
        "data-dir": this.#dir,
      },
    });

    this.#elm.appendChild(this.#dropElm);
    this.#callback(this.#dropElm);
  }

  #eventListener() {
    this.#elm.addEventListener("click", () => {
      this.#dropshow = !this.#dropshow;
      this.#dropElm.setAttribute("data-s", this.#dropshow);
    });

    window.addEventListener("click", (evt) => {
      const { target } = evt;

      if (target.closest("li") != this.#elm && this.#dropshow) {
        this.#dropshow = !this.#dropshow;
        this.#dropElm.setAttribute("data-s", this.#dropshow);
      }
    });
  }
}

export { DropDown };
