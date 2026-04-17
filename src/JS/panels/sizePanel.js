import { createDOMElement } from "../display/model";
import { Vector } from "../utils/vector";

class SizePanel {
  #elmP = null;
  #elms = {
    x: {
      elm: null,
      event: "input",
      option: { type: "input", attributes: { type: "number" } },
    },
    y: {
      elm: null,
      event: "input",
      option: { type: "input", attributes: { type: "number" } },
    },
    width: {
      elm: null,
      event: "input",
      option: { type: "input", attributes: { type: "number", min: 1 } },
    },
    height: {
      elm: null,
      event: "input",
      option: { type: "input", attributes: { type: "number", min: 1 } },
    },
    rotation: {
      elm: null,
      event: "input",
      option: {
        type: "input",
        attributes: { type: "number", min: 0, max: 360 },
      },
    },
    constrain: {
      elm: null,
      event: "change",
      option: { type: "input", attributes: { type: "checkbox" } },
    },
  };

  #arrangebtn = {
    back: {
      elm: null,
      event: "click",
      option: { type: "button", attributes: { title: "back" }, text: "back" },
    },
    front: {
      elm: null,
      event: "click",
      option: { type: "button", attributes: { title: "front" }, text: "front" },
    },
    backward: {
      elm: null,
      event: "click",
      option: {
        type: "button",
        attributes: { title: "backward" },
        text: "Bwd",
      },
    },
    forward: {
      elm: null,
      event: "click",
      option: { type: "button", attributes: { title: "forward" }, text: "Fwd" },
    },
  };
  #main = null;
  #callback = () => {};
  constructor({ elmP, main, callback }) {
    this.#elmP = elmP;
    this.#main = main;
    this.#callback = callback;

    this.#init();
  }

  set setValues({
    center = Vector.zero(),
    size = { width: 0, height: 0 },
    angle = 0,
  }) {
    const { x, y, width, height, rotation } = this.#elms;

    x.elm.value = center.x;
    y.elm.value = center.y;

    width.elm.value = size.width;
    height.elm.value = size.height;

    rotation.elm.value = angle;
  }

  #init() {
    this.maindiv = createDOMElement({ attributes: { id: "size_ctn" } });
    this.#sizeBuild();
    this.#arrangeBuild();
    this.#sizeEventListener();
    this.#arrangeEventListener();
  }

  #sizeBuild() {
    Object.entries(this.#elms).forEach((item, idx) => {
      const label = createDOMElement({ type: "label" });
      label.appendChild(createDOMElement({ type: "span", text: item[0] }));
      item[1].elm = createDOMElement(item[1].option);
      label.appendChild(item[1].elm);

      this.maindiv.appendChild(label);
    });

    this.#elmP.append(this.maindiv);
  }

  #sizeEventListener() {
    Object.entries(this.#elms).forEach((item, idx) => {
      const { elm, event } = item[1];

      elm.addEventListener(event, (evt) => {
        console.log(evt.target.value);
      });
    });
  }

  #arrangeBuild() {
    const div = createDOMElement({ attributes: { class: "arrange_ctn" } });
    Object.entries(this.#arrangebtn).forEach((item, idx) => {
      item[1].elm = createDOMElement(item[1].option);
      div.appendChild(item[1].elm);
    });

    this.maindiv.append(div);
  }

  #arrangeEventListener() {
    Object.entries(this.#arrangebtn).forEach((item, idx) => {
      const { elm, event } = item[1];

      elm.addEventListener(event, (evt) => {
        console.log(evt.target.value);
      });
    });
  }
}

export { SizePanel };
