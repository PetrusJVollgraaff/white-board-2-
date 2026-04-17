import { createDOMElement } from "../display/model";

class GraphicPanel {
  static Default() {
    return {
      mode: "default",
      transparent: 0,
      brightness: 0,
      contrast: 0,
      red: 0,
      green: 0,
      blue: 0,
      gamma: 0.1,
    };
  }

  #elmP = null;
  #modeSelect = ["default", "grayscale", "black/white", "watermark"];
  #elms = {
    mode: {
      elm: null,
      event: "change",
      option: { type: "select" },
      options: this.#modeSelect,
    },
    transparent: {
      elm: null,
      event: "input",
      option: { type: "input", attributes: { type: "number", min: 1 } },
    },
    brightness: {
      elm: null,
      event: "input",
      option: {
        type: "input",
        attributes: { type: "number", min: -100, max: 100 },
      },
    },
    contrast: {
      elm: null,
      event: "input",
      option: {
        type: "input",
        attributes: { type: "number", min: -100, max: 100 },
      },
    },
    red: {
      elm: null,
      event: "input",
      option: {
        type: "input",
        attributes: { type: "number", min: -100, max: 100 },
      },
    },
    green: {
      elm: null,
      event: "input",
      option: {
        type: "input",
        attributes: { type: "number", min: -100, max: 100 },
      },
    },
    blue: {
      elm: null,
      event: "input",
      option: {
        type: "input",
        attributes: { type: "number", min: -100, max: 100 },
      },
    },
    gamma: {
      elm: null,
      event: "input",
      option: {
        type: "input",
        attributes: { type: "number", min: 0.1, max: 10, step: 0.1 },
      },
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

  set setValues(data) {
    const { mode, transparent, brightness, contrast } = this.#elms;
    const { red, green, blue, gamma } = this.#elms;

    mode.elm.value = data.mode;
    transparent.elm.value = data.transparent;
    brightness.elm.value = data.brightness;
    contrast.elm.value = data.contrast;

    red.elm.value = data.red;
    green.elm.value = data.green;
    blue.elm.value = data.blue;
    gamma.elm.value = data.gamma;
  }

  #init() {
    this.#build();
    this.#eventListener();
    this.setValues = GraphicPanel.Default();
  }

  #build() {
    const div = createDOMElement({ attributes: { id: "graphic-ctn" } });
    Object.entries(this.#elms).forEach((item, idx) => {
      const label = createDOMElement({
        type: item[0] == "color" ? "div" : "label",
      });
      label.appendChild(createDOMElement({ type: "span", text: item[0] }));
      item[1].elm =
        item[1].option.type == "select"
          ? this.#buildSelect(item)
          : createDOMElement(item[1].option);

      label.appendChild(item[1].elm);

      div.appendChild(label);
    });

    this.#elmP.append(div);
  }

  #buildSelect(key) {
    const elm = createDOMElement(key[1].option);
    key[1].options.forEach((item) => {
      elm.appendChild(
        createDOMElement({
          type: "option",
          attributes: { value: item },
          text: item,
        }),
      );
    });

    return elm;
  }

  #eventListener() {
    Object.entries(this.#elms).forEach((item, idx) => {
      const { elm, event } = item[1];

      elm.addEventListener(event, (evt) => {
        console.log(evt.target.value);
      });
    });
  }
}

export { GraphicPanel };
