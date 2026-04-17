import { ColorPanel } from "../panels/colorPanel";
import { GraphicPanel } from "../panels/graphicPanel";
import { LayerPanel } from "../panels/layerPanel";
import { SizePanel } from "../panels/sizePanel";
import { createDOMElement } from "./model";

class RightNav {
  #callback = () => {};
  #elm = null;
  #hideBtn = null;
  #main = null;
  #isHidden = false;
  #tabs = {
    colors: { title: "colors", elm: null, btn: null },
    size: { title: "size & position", elm: null, btn: null },
    layers: { title: "layers", elm: null, btn: null },
    graphic: { title: "graphic", elm: null, btn: null },
  };
  constructor({ elm, main, callback }) {
    this.#elm = elm;
    this.#main = main;
    this.#callback = callback;
    this.#init();
  }

  set setSize(data) {
    this.SizePanel.setValues = data;
  }

  set setColor(data) {
    this.ColorPanel.setValues = data;
  }

  #init() {
    this.#hideBtn = this.#elm.querySelector("button#right_navbar_btn");
    this.#tabs.layers.elm = this.#elm.querySelector(".tab");
    this.#buildTabs();
    this.#build();
    this.#eventListener();
  }

  #buildTabs() {
    Object.entries(this.#tabs).forEach((item, idx) => {
      const title = item[1].title;
      item[1].elm = createDOMElement({
        attributes: { "data-tab": item[1].title, class: "tab hide" },
      });

      item[1].btn = createDOMElement({
        type: "button",
        attributes: { class: "view-tab" },
        text: "⮛",
      });

      const header = createDOMElement();
      header.appendChild(createDOMElement({ type: "span", text: title }));
      header.appendChild(item[1].btn);

      item[1].elm.appendChild(header);
      item[1].elm.appendChild(
        createDOMElement({ attributes: { class: "inner-tab" } }),
      );

      this.#elm.appendChild(item[1].elm);
    });
  }

  #build() {
    new LayerPanel({
      elmP: this.#tabs.layers.elm.querySelector(".inner-tab"),
      main: this.#main,
      callback: this.#callback,
    });

    this.SizePanel = new SizePanel({
      elmP: this.#tabs.size.elm.querySelector(".inner-tab"),
      main: this.#main,
      callback: this.#callback,
    });

    this.ColorPanel = new ColorPanel({
      elmP: this.#tabs.colors.elm.querySelector(".inner-tab"),
      main: this.#main,
      callback: this.#callback,
    });

    new GraphicPanel({
      elmP: this.#tabs.graphic.elm.querySelector(".inner-tab"),
      main: this.#main,
      callback: this.#callback,
    });
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

    Object.entries(this.#tabs).forEach((item, idx) => {
      const { elm, btn } = item[1];
      btn.addEventListener("click", (evt) => {
        const { target } = evt;
        const isvalid = elm.classList.contains("hide");
        var action = isvalid ? "remove" : "add";
        var btn = isvalid ? "⮙" : "⮛";
        target.innerHTML = btn;
        elm.classList[action]("hide");
      });
    });
  }
}

export { RightNav };
