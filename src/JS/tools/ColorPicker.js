import { createDOMElement, Modal } from "../display/model";
class ColorPicker {
  #Inputs = {
    hsl: {
      h: {
        event: this.#changeHue.bind(this),
        text: "H",
        attributes: {
          title: "Hue",
          max: "360",
          min: "0",
          step: "1",
          type: "number",
        },
      },
      s: {
        event: this.#changeSat.bind(this),
        text: "S",
        attributes: {
          title: "Saturation",
          max: "100",
          min: "0",
          step: "1",
          type: "number",
        },
      },
      l: {
        event: this.#changeLight.bind(this),
        text: "L",
        attributes: {
          title: "Lightness",
          max: "100",
          min: "0",
          step: "1",
          type: "number",
        },
      },
    },
    rgb: {
      r: {
        event: this.#changeRGB.bind(this),
        text: "R",
        attributes: {
          title: "Red",
          max: "255",
          min: "0",
          step: "1",
          type: "number",
        },
      },
      g: {
        event: this.#changeRGB.bind(this),
        text: "G",
        attributes: {
          title: "Green",
          max: "255",
          min: "0",
          step: "1",
          type: "number",
        },
      },
      b: {
        event: this.#changeRGB.bind(this),
        text: "B",
        attributes: {
          title: "Blue",
          max: "255",
          min: "0",
          step: "1",
          type: "number",
        },
      },
    },
    cmyk: {
      c: {
        event: this.#changeCMYK.bind(this),
        text: "C",
        attributes: {
          title: "Cyan",
          max: "100",
          min: "0",
          step: "1",
          type: "number",
        },
      },
      m: {
        event: this.#changeCMYK.bind(this),
        text: "M",
        attributes: {
          title: "Magenta",
          max: "100",
          min: "0",
          step: "1",
          type: "number",
        },
      },
      y: {
        event: this.#changeCMYK.bind(this),
        text: "Y",
        attributes: {
          title: "Yellow",
          max: "100",
          min: "0",
          step: "1",
          type: "number",
        },
      },
      k: {
        event: this.#changeCMYK.bind(this),
        text: "K",
        attributes: {
          title: "Black",
          max: "100",
          min: "0",
          step: "1",
          type: "number",
        },
      },
    },
    hex: {
      event: this.#changeHex.bind(this),
      text: "hex",
      attributes: {
        title: "Hex",
        type: "text",
        pattern: "^#(?:[0-9a-fA-F]{3,4}){1,2}$",
      },
    },
    opacity: {
      event: this.#changeOpacity.bind(this),
      attributes: {
        max: "1",
        min: "0",
        step: "0.1",
        title: "Opacity",
        type: "range",
      },
    },
    hue: {
      event: this.#changeHue.bind(this),
      attributes: {
        max: "360",
        min: "0",
        step: "1",
        title: "Hue",
        type: "range",
      },
    },
  };
  #size = { width: 150, height: 150 };
  #elm = null;
  #colortype = "hsl";
  #Canvas = createDOMElement({ type: "canvas" });
  #Ctx = this.#Canvas.getContext("2d");
  #modal = null;
  #colorOp = { showFill: true, hex: "ffffff" };
  #divcont = createDOMElement();
  constructor(elm, hexvalue = "ffffff") {
    this.#colorOp.hex = hexvalue;
    this.#assignInputElements();
    this.#assignInputEvents();
    this.#elm = elm;
    this.#Canvas.width = this.#size.width;
    this.#Canvas.height = this.#size.height;

    this.#setHSL_RGB();

    this.outputCanvas = createDOMElement({
      attributes: { class: "color_prev" },
    });

    this.mainDiv = createDOMElement();
    this.#buildContent();

    this.#init();
  }

  #addColorEvent() {
    this.#Canvas.addEventListener("pointerdown", (e) => {
      const updateSL = (e) => this.#updateSL(e);
      updateSL(e);
      this.#Canvas.addEventListener("pointermove", updateSL);
      this.#Canvas.addEventListener("pointerup", () => {
        this.#Canvas.removeEventListener("pointermove", updateSL);
      });
    });
  }

  #updateSL(e) {
    e.preventDefault();
    e.stopPropagation();
    const { width: w, height: h } = this.#size;
    const { offsetX: x, offsetY: y } = e;
    const lightFac = 1 - (0.5 * x) / w;

    this.#colorOp.hsl.s = (x / w) * 100;
    this.#colorOp.hsl.l = (1 - 0.5 * (x / w) ** 1 - (y / h) * lightFac) * 100;

    this.#setHexValue();
    this.#colorOp.rgb = ColorConvertor.hexToRgb(this.#colorOp.hex);
    this.#colorOp.cmyk = ColorConvertor.hexToCmyk(this.#colorOp.hex);
    this.#setColor();
  }

  #init() {
    this.modal = new Modal({
      title: "Color Picker",
      onOpen: (modal, contentdiv) => {
        contentdiv.appendChild(this.mainDiv);
        this.#addColorEvent();
        this.#setColor();
      },
      buttons: [
        {
          title: "Apply",
          click: (modal) => {
            this.#elm.style.background = `hsla(${this.#colorOp.hsl.h}, ${this.#colorOp.hsl.s}%, ${this.#colorOp.hsl.l}%, ${Number(this.#colorOp.hsl.a)})`;
            modal.close();
          },
        },
        {
          title: "Cancel",
          click: function (modal) {
            modal.close();
          },
        },
      ],
    });
  }

  #buildContent() {
    this.mainDiv.appendChild(this.#Canvas);
    this.mainDiv.appendChild(this.outputCanvas);
    this.#rangeInput();
    this.#SelectElm();
    this.#NumberInput();
  }

  #NumberInput() {
    var action =
      this.#colortype != "hex" && this.#colortype != "cmyk" ? "add" : "remove";

    this.#divcont.classList[action]("col_3");

    if (this.#colortype == "hex") {
      const { text: title, elm } = this.#Inputs[this.#colortype];
      this.#buildInput(title, elm);
    } else {
      const inputs = this.#Inputs[this.#colortype];
      for (const key in inputs) {
        const { text: title, elm } = inputs[key];
        this.#buildInput(title, elm);
      }
    }

    this.mainDiv.appendChild(this.#divcont);
  }

  #buildInput(title, elm) {
    var labelElm = createDOMElement({
      type: "label",
      attributes: { title },
    });

    this.#divcont.appendChild(labelElm);
    labelElm.appendChild(elm);
  }

  #SelectElm() {
    var select = createDOMElement({
      type: "select",
      attributes: { value: this.colortype },
    });

    document.createElement("select");

    for (const key in this.#Inputs) {
      if (key != "opacity" && key != "hue") {
        var option = createDOMElement({
          type: "option",
          attributes: { value: key },
          text: key.toUpperCase(),
        });
        select.appendChild(option);
      }
    }
    this.mainDiv.appendChild(select);

    select.addEventListener("change", this.#changeColorType.bind(this));
  }

  #changeColorType(e) {
    e.preventDefault();
    e.stopPropagation();
    this.#colortype = e.target.value;
    this.#divcont.innerHTML = "";
    this.#NumberInput();
    this.#setInputVal();
  }

  #rangeInput() {
    this.mainDiv.appendChild(this.#Inputs.hue.elm);
    this.mainDiv.appendChild(this.#Inputs.opacity.elm);
  }

  #assignInputElements() {
    for (const key in this.#Inputs) {
      if (key == "hex" || key == "opacity" || key == "hue") {
        const { attributes } = this.#Inputs[key];
        this.#Inputs[key]["elm"] = createDOMElement({
          type: "input",
          attributes,
        });
      } else {
        for (const key1 in this.#Inputs[key]) {
          const { attributes } = this.#Inputs[key][key1];
          this.#Inputs[key][key1]["elm"] = createDOMElement({
            type: "input",
            attributes,
          });
        }
      }
    }
  }

  #assignInputEvents() {
    for (const key in this.#Inputs) {
      if (key == "hex" || key == "opacity" || key == "hue") {
        const { elm, event: func } = this.#Inputs[key];
        this.#assingEventsListener(elm, func);
      } else {
        for (const subkey in this.#Inputs[key]) {
          const { elm, event: func } = this.#Inputs[key][subkey];
          this.#assingEventsListener(elm, func, { key, subkey });
        }
      }
    }
  }

  #assingEventsListener(elm, func, data = null) {
    elm.addEventListener("input", (e) => func(e, data));
  }

  #changeRGB(e, data) {
    e.preventDefault();
    e.stopPropagation();
    this.#colorOp.rgb[data.subkey] = e.target.value;
    this.#setRGBtoHSL();
  }

  #changeOpacity(e) {
    e.preventDefault();
    e.stopPropagation();

    const v = Number(e.target.value);
    this.#colorOp.hsl.a = v;
    this.#colorOp.rgb.a = v;
    this.#colorOp.cmyk.a = v;
    this.#setHexValue();
    this.#setColor();
    this.#colorOp.cmyk = ColorConvertor.hexToCmyk(this.#colorOp.hex);
  }

  #changeHue(e) {
    e.preventDefault();
    e.stopPropagation();
    const v = Number(e.target.value);
    let h = v < 0 ? v % 360 : v > 360 ? v % 360 : v == "" ? 0 : v;
    this.#colorOp.hsl.h = h;
    this.#Inputs.hue.elm.value = this.#colorOp.hsl.h;
    this.#setHSLtoRGB();
    this.#setInputVal();
  }

  #changeSat(e) {
    e.preventDefault();
    e.stopPropagation();
    const v = Number(e.target.value);
    var s = v < 0 ? v % 100 : v > 100 ? v % 100 : v == "" ? 0 : v;
    this.#colorOp.hsl.s = s * 100;
    this.#setHSLtoRGB();
  }

  #changeLight(e) {
    e.preventDefault();
    e.stopPropagation();
    const v = Number(e.target.value);
    var l = v < 0 ? v % 100 : v > 100 ? v % 100 : v == "" ? 0 : v;
    this.#colorOp.hsl.l = l * 100;
    this.#setHSLtoRGB();
    this.#setColor();
  }

  #changeHex(e) {
    e.preventDefault();
    e.stopPropagation();
    const v = Number(e.target.value);
    const { a } = this.#colorOp.hsl;
    this.#colorOp.hex = v + ColorConvertor.decimalToHexOpacity(a);
    this.#setHSL_RGB();
    this.#setTopColor();
    this.#Inputs.hue.elm.value = this.#colorOp.hsl.h;
  }

  #changeCMYK(e, data) {
    this.#colorOp.cmyk[data.subkey] = e.target.value;
    this.#setCMYLtoHSL();
  }

  #setHSL_RGB() {
    const { hex } = this.#colorOp;
    this.#colorOp.hsl = ColorConvertor.hexToHsl(hex);
    this.#colorOp.rgb = ColorConvertor.hexToRgb(hex);
    this.#colorOp.cmyk = ColorConvertor.hexToCmyk(hex);
  }

  #setHexValue() {
    this.#colorOp.hex = ColorConvertor.hslToHex(this.#colorOp.hsl);
  }

  #setCMYLtoHSL() {
    this.#colorOp.hsl = ColorConvertor.cmykToHsl(this.#colorOp.cmyk);
    this.#colorOp.rgb = ColorConvertor.hslToRgb(this.#colorOp.hsl);
    this.#Inputs.hue.elm.value = this.#colorOp.hsl.h;
    this.#setHexValue();
    this.#setTopColor();
  }

  #setRGBtoHSL() {
    this.#colorOp.hsl = ColorConvertor.rgbToHsl(this.#colorOp.rgb);
    this.#setHexValue();
    this.#setTopColor();
    this.#Inputs.hue.elm.value = this.#colorOp.hsl.h;
  }

  #setHSLtoRGB() {
    this.#colorOp.rgb = ColorConvertor.hslToRgb(this.#colorOp.hsl);
    this.#colorOp.cmyk = ColorConvertor.hslToCmyk(this.#colorOp.hsl);
    this.#setHexValue();
    this.#setTopColor();
  }

  #setTopColor() {
    this.#generateSLGradient();
    this.#showOutputColor();

    this.#Inputs.opacity.elm.style.background =
      "linear-gradient(to right, transparent, " + this.#getFill() + ")";
  }

  #showOutputColor() {
    const { hsl, showFill } = this.#colorOp;
    var opacity = hsl.a;
    var background =
      showFill && Number(opacity) > 0
        ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${Number(hsl.a)})`
        : (showFill && Number(opacity) == 0) || !showFill
          ? `linear-gradient(to bottom right, white calc(50% - 1px), red,white calc(50% + 1px) )`
          : "white";

    this.outputCanvas.style.background = background;
  }

  #setColor() {
    this.#setTopColor();
    this.#setInputVal();
  }

  #setInputVal() {
    const t = this.#colortype;
    if (t == "hex") {
      this.#Inputs[t].elm.value = this.#colorOp[t];
    } else {
      const mainkey = this.#Inputs[t];
      for (const key in mainkey) {
        mainkey[key].elm.value = this.#colorOp[t][key];
      }
    }
  }

  #getFill() {
    const { showFill, hsl } = this.#colorOp;

    return showFill ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : null;
  }

  #generateSLGradient() {
    const { width: w, height: h } = this.#size;
    const { hsl } = this.#colorOp;
    // To-Do speedup this
    const stepSize = 2;
    for (let x = 0; x < w; x += stepSize) {
      for (let y = 0; y < h; y += stepSize) {
        const saturation = x / w;
        const lightFac = 1 - (0.5 * x) / w;
        const lightness = 1 - 0.5 * (x / w) ** 1 - (y / h) * lightFac;

        this.#Ctx.fillStyle = `hsl(${hsl.h}, ${saturation * 100}%, ${lightness * 100}%)`;
        this.#Ctx.fillRect(x, y, stepSize, stepSize);
      }
    }

    // Warning, inverting the formula must be done again if we change it
    const dotX = (hsl.s / 100) * w;
    const lightFac = 1 - (0.5 * dotX) / w;
    const dotY = (-(hsl.l / 100 - 1 + 0.5 * (dotX / w) ** 1) / lightFac) * h;

    this.#Ctx.strokeStyle = "white";
    this.#Ctx.beginPath();
    this.#Ctx.arc(dotX, dotY, 5, 0, 2 * Math.PI);
    this.#Ctx.lineWidth = 3;
    this.#Ctx.stroke();
    this.#Ctx.strokeStyle = "black";
    this.#Ctx.lineWidth = 1;
    this.#Ctx.stroke();
  }
}

class ColorConvertor {
  static hslToRgb(hsla = { h: 0, s: 50, l: 50, a: 1 }) {
    const h = hsla.h;
    const s = hsla.s / 100;
    const l = hsla.l / 100;
    const a = hsla.a;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0,
      g = 0,
      b = 0;

    if (0 <= h && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (60 <= h && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (120 <= h && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (180 <= h && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (240 <= h && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (300 <= h && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b, a };
  }

  static rgbToHex(rgba = { r: 0, g: 0, b: 0, a: 1 }) {
    const { r, g, b, a } = rgba;
    return (
      "#" +
      [r, g, b, a]
        .map((x, idx) => {
          const hex =
            idx == 3 ? ColorConvertor.decimalToHexOpacity(x) : x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }

  static hslToHex(hsla = { h: 0, s: 50, l: 50, alpha: 1 }) {
    const rgba = ColorConvertor.hslToRgb(hsla);
    return ColorConvertor.rgbToHex(rgba);
  }

  static rgbToHsl(rgba = { r: 0, g: 0, b: 0, a: 1 }) {
    const r = rgba.r / 255;
    const g = rgba.g / 255;
    const b = rgba.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      switch (max) {
        case r:
          h = (g - b) / delta + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / delta + 2;
          break;
        case b:
          h = (r - g) / delta + 4;
          break;
      }
      h *= 60;
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
      a: rgba.a,
    };
  }

  static hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }

    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    const bigint = parseInt(hex, 16);

    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
      a,
    };
  }

  static hexToHsl(hex) {
    const rgba = ColorConvertor.hexToRgb(hex);
    return ColorConvertor.rgbToHsl(rgba);
  }

  static decimalToHexOpacity(decimal) {
    if (decimal < 0 || decimal > 1) {
      throw new Error("Opacity must be a decimal between 0 and 1.");
    }
    // Convert to 8-bit value and to hex
    let hex = Math.round(decimal * 255).toString(16);
    // Ensure it's two characters long
    return hex.padStart(2, "0");
  }

  static NumberToHex(number) {
    if (number < 0 && number > 255) {
      throw new Error("Value must be a number between 0 and 255.");
    }
    // Convert to 8-bit value and to hex
    let hex = number.toString(16);
    // Ensure it's two characters long
    return hex.padStart(2, "0").toString();
  }

  // RGB → CMYK
  static rgbToCmyk(rgba = { r: 0, g: 0, b: 0, a: 1 }) {
    const r = rgba.r / 255;
    const g = rgba.g / 255;
    const b = rgba.b / 255;

    const k = 1 - Math.max(r, g, b);

    // Handle black (avoid division by zero)
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100, a: rgba.a };

    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
      a: rgba.a,
    };
  }

  // CMYK → RGB
  static cmykToRgb(cmyka = { c: 0, m: 0, y: 0, k: 0, a: 1 }) {
    const c = cmyka.c / 100;
    const m = cmyka.m / 100;
    const y = cmyka.y / 100;
    const k = cmyka.k / 100;

    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));

    return { r, g, b, a: cmyka.a };
  }

  // HSL → CMYK (via RGB)
  static hslToCmyk(hsla = { h: 0, s: 50, l: 50, a: 1 }) {
    const rgba = ColorConvertor.hslToRgb(hsla);
    return ColorConvertor.rgbToCmyk(rgba);
  }

  // CMYK → HSL (via RGB)
  static cmykToHsl(cmyka = { c: 0, m: 0, y: 0, k: 0, a: 1 }) {
    const rgba = ColorConvertor.cmykToRgb(cmyka);
    return ColorConvertor.rgbToHsl(rgba);
  }

  // CMYK → Hex (via RGB)
  static cmykToHex(cmyka = { c: 0, m: 0, y: 0, k: 0, a: 1 }) {
    const rgba = ColorConvertor.cmykToRgb(cmyka);
    return ColorConvertor.rgbToHex(rgba);
  }

  // Hex → CMYK (via RGB)
  static hexToCmyk(hex) {
    const rgba = ColorConvertor.hexToRgb(hex);
    return ColorConvertor.rgbToCmyk(rgba);
  }
}

export { ColorPicker };
