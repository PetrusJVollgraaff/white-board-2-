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
      method: "sendToBack",
      option: { type: "button", attributes: { title: "back" }, text: "back" },
    },
    front: {
      elm: null,
      event: "click",
      method: "bringToFront",
      option: { type: "button", attributes: { title: "front" }, text: "front" },
    },
    backward: {
      elm: null,
      event: "click",
      method: "sendBackward",
      option: {
        type: "button",
        attributes: { title: "backward" },
        text: "Bwd",
      },
    },
    forward: {
      elm: null,
      event: "click",
      method: "bringForward",
      option: { type: "button", attributes: { title: "forward" }, text: "Fwd" },
    },
  };
  #main = null;

  size = { width: 0, height: 0, ratio: 0 };
  center = Vector.zero();
  angle = 0;

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
    ratio = 0,
  }) {
    const { x, y, width, height, rotation } = this.#elms;

    this.size = size;
    this.center = center;
    this.angle = angle;
    this.size.ratio = ratio;

    x.elm.value = this.center.x;
    y.elm.value = this.center.y;

    width.elm.value = this.size.width;
    height.elm.value = this.size.height;

    rotation.elm.value = this.angle;
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
    const constrainElm = this.#elms.constrain.elm;
    Object.entries(this.#elms).forEach((item, idx) => {
      const { elm, event } = item[1];
      const key = item[0];

      elm.addEventListener(event, (evt) => {
        if (key == "width" || key == "height") {
          this.size[key] = Number(evt.target.value);
          if (constrainElm.checked) {
            const key2 = key == "width" ? "height" : "width";
            this.size[key2] = this.size[key] / this.size.ratio;
            this.#elms[key2].elm.value = this.size[key2];
          }

          this.#main.setShapeSize = {
            action: "setSize",
            obj: { ...this.size },
          };
        } else if (key == "x" || key == "y") {
          this.center[key] = Number(evt.target.value);
          this.#main.setShapeSize = {
            action: "setCenter",
            obj: { center: new Vector(this.center) },
          };
        } else if (key == "rotaion") {
          /*this.#main.setRotation = {
            action: "setRotation",
            rotation: Number(evt.target.value),
          };*/
        } else {
          /*this.#main.setConstrain = {
            action: "setConstrain",
            constrain: Number(evt.target.value.checked),
          };*/
        }
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
      const { elm, event, method } = item[1];

      elm.addEventListener(event, (evt) => {
        this.#main.setArrangeShapes = {
          action: "setArrange",
          method,
        };
      });
    });
  }
}

export { SizePanel };
