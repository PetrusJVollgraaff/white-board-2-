import { createDOMElement } from "../display/model";

class ColorPanel {
  #elmP = null;
  #elm = null;
  #main = null;
  #areaType = ["solid", "linear", "axial", "radial"];
  #lineType = ["solid", "linear", "axial"];
  #lineStyle = ["continues", "dashed", "ultrafinedash", "finedash"];

  #AreaOptions = {
    type: {
      elm: null,
      event: "change",
      value: "solid",
      option: { type: "select" },
      options: this.#areaType,
    },
    color: {
      elm: null,
      event: "input",
      value: "#000000",
      option: { type: "input", attributes: { type: "color" } },
    },
    picker: {
      elm: null,
      event: "button",
      for: "color",
      option: { type: "button", attributes: { type: "color" } },
    },
    opacity: {
      elm: null,
      event: "input",
      value: 0,
      option: {
        type: "input",
        attributes: { type: "range", min: 0, max: 100 },
      },
    },
  };

  #LineOptions = {
    type: {
      elm: null,
      event: "change",
      value: "solid",
      option: { type: "select" },
      options: this.#lineType,
    },
    style: {
      elm: null,
      event: "change",
      value: "continues",
      option: { type: "select" },
      options: this.#lineStyle,
    },
    size: {
      elm: null,
      event: "input",
      value: 1,
      option: {
        type: "input",
        attributes: { type: "range", min: 0, max: 100 },
      },
    },
    color: {
      elm: null,
      value: "#FFFFFF",
      event: "input",
      option: { type: "input", attributes: { type: "color" } },
    },
    picker: {
      elm: null,
      event: "button",
      for: "color",
      option: { type: "button", attributes: { type: "color" } },
    },
    opacity: {
      elm: null,
      event: "input",
      value: 0,
      option: {
        type: "input",
        attributes: { type: "range", min: 0, max: 100 },
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

  set setValues(data) {
    this.#setArea(data);
    this.#setBorder(data);
  }

  #setArea({ fill }) {
    const { type, color, opacity } = this.#AreaOptions;

    type.elm.value = fill.type;
    color.elm.value = fill.color;
    opacity.elm.value = fill.opacity;
  }

  #setBorder({ stroke }) {
    const { type, color, opacity, size, style } = this.#LineOptions;

    type.elm.value = stroke.type;
    color.elm.value = stroke.color;
    opacity.elm.value = stroke.opacity;
    size.elm.value = stroke.size;
    style.elm.value = stroke.style;
  }

  #init() {
    this.#build();
    this.#eventListener();
  }

  #build() {
    const maindiv = createDOMElement({ attributes: { id: "color_ctn" } });
    this.#elmP.appendChild(maindiv);
    this.#buildArea(maindiv);
    this.#buildBorder(maindiv);
  }

  #buildArea(maindiv) {
    const div = createDOMElement({ attributes: { "data-t": "area" } });
    div.appendChild(createDOMElement({ type: "span", text: "area" }));
    Object.entries(this.#AreaOptions).forEach((item, idx) => {
      const label = createDOMElement({
        type: item[0] == "color" ? "div" : "label",
      });
      label.appendChild(createDOMElement({ type: "span", text: item[0] }));
      item[1].elm =
        item[1].option.type == "select"
          ? this.#buildSelect(item)
          : createDOMElement(item[1].option);

      if (item[0] == "picker") {
        this.#AreaOptions[item[1].for].elm.after(item[1].elm);
      } else {
        label.appendChild(item[1].elm);
        div.appendChild(label);
      }
    });

    maindiv.append(div);
  }

  #buildBorder(maindiv) {
    const div = createDOMElement({ attributes: { "data-t": "border" } });
    div.appendChild(createDOMElement({ type: "span", text: "border" }));
    Object.entries(this.#LineOptions).forEach((item, idx) => {
      const label = createDOMElement({
        type: item[0] == "color" ? "div" : "label",
      });
      label.appendChild(createDOMElement({ type: "span", text: item[0] }));
      item[1].elm =
        item[1].option.type == "select"
          ? this.#buildSelect(item)
          : createDOMElement(item[1].option);

      if (item[0] == "picker") {
        this.#LineOptions[item[1].for].elm.after(item[1].elm);
      } else {
        label.appendChild(item[1].elm);
        div.appendChild(label);
      }
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

  #eventListener() {
    this.#areaEvents();
    this.#lineEvents();
  }

  #areaEvents() {
    Object.entries(this.#AreaOptions).forEach((item, idx) => {
      const { elm, event } = item[1];

      elm.addEventListener(event, (evt) => {
        console.log(evt.target.value);
      });
    });
  }

  #lineEvents() {
    Object.entries(this.#LineOptions).forEach((item, idx) => {
      const { elm, event } = item[1];

      elm.addEventListener(event, (evt) => {
        console.log(evt.target.value);
      });
    });
  }
}
export { ColorPanel };
