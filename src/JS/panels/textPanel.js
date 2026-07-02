import { createDOMElement } from "../display/model";
import { Vector } from "../utils/vector";

class TextPanel {
  #elmP = null;
  #sizeOptions = [
    6, 7, 8, 9, 10, 10.5, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 32,
    36, 40, 44, 48, 54, 60, 66, 72, 80, 88, 96,
  ];

  #FamilyOptions = [
    "Arial",
    "Helvetica",
    "Verdana",
    "Trebuchet MS",
    "Gill Sans",
    "Noto Sans",
    "Avantgarde",
    "Optima",
    "Arial Narrow",
  ];

  #AlignOptions = ["Left", "Center", "Right", "Start", "End"];

  #elms = {
    size: {
      elm: null,
      event: "change",
      option: { type: "select" },
      options: this.#sizeOptions,
    },
    family: {
      elm: null,
      event: "change",
      option: { type: "select" },
      options: this.#FamilyOptions,
    },
    align: {
      elm: null,
      event: "change",
      option: { type: "select" },
      options: this.#AlignOptions,
    },
  };

  #main = null;

  size = 16;
  family = "Arial";
  align = "left";

  #callback = () => {};
  constructor({ elmP, main, callback }) {
    this.#elmP = elmP;
    this.#main = main;
    this.#callback = callback;

    this.#init();
  }

  set setValues({}) {}

  #init() {
    this.#build();
    this.#eventListeners();
  }

  #build() {
    const maindiv = createDOMElement({ attributes: { id: "text_ctn" } });
    this.#elmP.appendChild(maindiv);

    const div = createDOMElement({ attributes: { "data-t": "text" } });
    Object.entries(this.#elms).forEach((item, idx) => {
      const label = createDOMElement({ type: "label" });
      label.appendChild(createDOMElement({ type: "span", text: item[0] }));
      item[1].elm = this.#buildSelect(item);

      label.appendChild(item[1].elm);
      div.appendChild(label);
    });

    maindiv.append(div);
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

  #eventListeners() {
    Object.entries(this.#elms).forEach((item, idx) => {
      const { elm, event } = item[1];
      const obj = { fill: {} };

      elm.addEventListener(event, (evt) => {
        obj.fill[item[0]] = evt.target.value;
        this.#main.setTextSettings = obj;
      });
    });
  }
}

export { TextPanel };
