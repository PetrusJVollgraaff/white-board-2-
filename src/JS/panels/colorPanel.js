import { createDOMElement } from "../display/model";

class ColorPanel {
  #elmP = null;
  #elm = null;
  #main = null;
  #areaType = ["solid", "linear", "axial", "radial"];
  #lineType = ["solid", "linear", "axial"];
  #lineStyle = ["continues", "dashed", "ultrafinedash", "finedash"];
  #Option = {
    area: {
      type: {
        elm: null,
        event: "change",
        option: { type: "select" },
      },
      color: {
        elm: null,
        event: "input",
        option: { type: "input", attributes: { type: "color" } },
      },
      opacity: {
        elm: null,
        event: "input",
        option: {
          type: "input",
          attributes: { type: "range", min: 0, max: 100 },
        },
      },
    },
    line: {
      type: {
        elm: null,
        event: "change",
        option: { type: "select" },
      },
      width: {
        elm: null,
        event: "input",
        option: {
          type: "input",
          attributes: { type: "range", min: 0, max: 100 },
        },
      },
      color: {
        elm: null,
        event: "input",
        option: { type: "input", attributes: { type: "color" } },
      },
      opacity: {
        elm: null,
        event: "input",
        option: {
          type: "input",
          attributes: { type: "range", min: 0, max: 100 },
        },
      },
      style: {
        elm: null,
        event: "change",
        option: { type: "select" },
      },
    },
  };
  #callback = () => {};
  constructor({ elmP, main, callback }) {
    this.#elmP = elmP;
    this.#main = main;
    this.#callback = callback;

    this.#init();
  }

  #init() {
    this.#build();
    this.#eventListener();
  }

  #build() {
    const maindiv = createDOMElement({ attributes: { id: "color_ctn" } });
    this.#elmP.appendChild(maindiv);
    Object.entries(this.#Option).forEach((item, idx) => {
      const div = createDOMElement({ attributes: { "data-t": item[0] } });
      div.appendChild(createDOMElement({ type: "span", text: item[0] }));

      Object.entries(item[1]).forEach((key, idx) => {
        const label = createDOMElement({ type: "label" });
        label.appendChild(createDOMElement({ type: "span", text: key[0] }));
        if (key[1].option.type == "select") {
          key[1].elm = this.#buildSelect(item[0], key);
        } else {
          key[1].elm = createDOMElement(key[1].option);
        }

        label.appendChild(key[1].elm);
        div.appendChild(label);
      });

      maindiv.append(div);
    });
  }

  #buildSelect(main, key) {
    const elm = createDOMElement(key[1].option);
    const options =
      main == "area"
        ? this.#areaType
        : key[0] == "type"
          ? this.#lineType
          : this.#lineStyle;

    options.forEach((item) => {
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
    this.#areaEvents();
    this.#lineEvents();
  }

  #areaEvents() {
    Object.entries(this.#Option.area).forEach((item, idx) => {
      const { elm, event } = item[1];
      console.log(item[0], event);
      elm.addEventListener(event, (evt) => {
        console.log(evt.target.value);
      });
    });
  }

  #lineEvents() {
    Object.entries(this.#Option.line).forEach((item, idx) => {
      const { elm, event } = item[1];
      elm.addEventListener(event, (evt) => {
        console.log(evt.target.value);
      });
    });
  }
}
export { ColorPanel };
