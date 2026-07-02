import { Layer } from "../../display/Layer";
import { SelectionHandle } from "../../transformbox/selections";
import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class TextShape extends Shape {
  shape = "TextShape";

  static detaultText = {
    fontSize: 16,
    fontFamily: "Arial",
    textAlign: "center",
    textBaseline: "middle",
    value: "Enter Text Here",
  };

  static getDetaultText() {
    return JSON.parse(JSON.stringify(TextShape.detaultText));
  }

  static btn() {
    return {
      type: "button",
      attributes: {
        "data-tool": "textshape",
        title: "Text",
      },
      innerhtml:
        '<svg viewBox="0 0 16 16"><text x="8" y="15" font-size="18" text-anchor="middle" fill="currentColor">Τ</text></svg>',
    };
  }
  #text = null;
  #thinWhiteSpace = null;
  #dilation = 10;
  constructor(
    {
      center = Vector.zero(),
      size = { width: 0, height: 0 },
      options = Shape.getDefaultOptions(),
    },
    callback,
  ) {
    super(options, callback);
    this.center = center;
    this.#text = TextShape.getDetaultText();
    this.#thinWhiteSpace = String.fromCharCode(8202);
    this.setBuildText();
  }

  static load(data, callback) {
    const text = new TextShape(data, callback);
    text.selected = data.selected;
    return text;
  }

  serialize() {
    return JSON.parse(JSON.stringify({ ...{ shape: this.shape }, ...this }));
  }

  hasExtraOptions() {
    return null;
  }

  isSelected(ctx, mousepos) {
    const { x, y } = mousepos;
    const { width, height } = this.size;
    const left = this.center.x - width / 2;
    const top = this.center.y - height / 2;
    const right = this.center.x + width / 2;
    const bottom = this.center.y + height / 2;

    return x >= left && x <= right && y >= top && y <= bottom;
  }

  setCorner2(corner2) {
    this.corner2 = corner2;
  }

  setText(value, save = true) {
    this.#text.value = value;
    let maxLineWidth = this.getWidestLine();
    this.size = {};
    this.size.width = maxLineWidth;
    let lines = this.parseText();
    this.size.height = this.#text.fontSize * lines.length;
    //viewport.dispatchEvent(
    //  new CustomEvent("textChanged", { detail: { shape: this, save } })
    //);
  }

  get getTextProperties() {
    return this.#text;
  }

  setTextOptions(options, save = true) {
    for (const key in options) {
      if (this.#text.hasOwnProperty(key)) {
        this.#text[key] = options[key];
      }
    }

    //this.setBuildText();

    /*viewport.dispatchEvent(
      new CustomEvent("optionsChanged", { detail: { shape: this, save } }),
    );*/
  }

  setProperties(ctx) {
    const { fontSize, fontFamily, textAlign, textBaseline } = this.#text;

    ctx.font = fontSize + "px " + fontFamily;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
  }

  setBuildText() {
    // WARNING, potential memory leak
    const { value, fontSize: height } = this.#text;
    const tmpCanvas = document.createElement("canvas");
    const tmpCtx = tmpCanvas.getContext("2d");
    this.setProperties(tmpCtx);
    const { width } = tmpCtx.measureText(value);
    this.size = { width, height };
  }

  getWidestLine() {
    let maxLineWidth = 0;
    let lines = this.parseText();
    for (let line of lines) {
      let lineWidth = this.getTextWidthOnCanvas(line);
      if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
    }
    return maxLineWidth;
  }

  parseText() {
    const { textAlign } = this.#text;

    let lines = this.#text.value.split("\n");
    let longestLineWidth = 0;
    for (let line of lines) {
      if (this.getTextWidthOnCanvas(line) > longestLineWidth) {
        longestLineWidth = this.getTextWidthOnCanvas(line);
      }
    }
    if (textAlign) {
      switch (textAlign) {
        case "left":
          for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (this.getTextWidthOnCanvas(line) < longestLineWidth) {
              let offsetSize =
                longestLineWidth - this.getTextWidthOnCanvas(line);
              this.#text.xOffsets[i] = -offsetSize / 2;
            }
          }
          break;
        case "right":
          for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (this.getTextWidthOnCanvas(line) < longestLineWidth) {
              let offsetSize =
                longestLineWidth - this.getTextWidthOnCanvas(line);
              this.#text.xOffsets[i] = offsetSize / 2;
            }
          }
          break;
        default:
          this.#text.xOffsets = {};
      }
    }

    return lines;
  }

  getPaddingSize(line, longestLine) {
    let longWidth = this.getTextWidthOnCanvas(longestLine);
    let shortWidth = this.getTextWidthOnCanvas(line);
    let widthOfSpace = this.getTextWidthOnCanvas(this.thinWhiteSpace);
    let paddingSize = (longWidth - shortWidth) / widthOfSpace;
    return Math.round(paddingSize);
  }

  getIndexOfTextAtPoint(point, line) {
    let index = 0;
    let left = this.center.x - this.getTextWidthOnCanvas(line) / 2;

    while (index < line.length) {
      let offset = left + this.getTextWidthOnCanvas(line.slice(0, index + 1));
      if (offset >= point.x) break;
      index++;
    }

    return index;
  }

  getTextWidthOnCanvas(text) {
    return this.getTextMeasure(text).width;
  }

  getTextMeasure(text) {
    const tmpCanvas = document.createElement("canvas");
    const tmpCtx = tmpCanvas.getContext("2d");
    this.setProperties(tmpCtx);
    return tmpCtx.measureText(text);
  }

  draw(ctx, hitRegion = false) {
    const lines = this.parseText();
    const { fontSize, xOffsets } = this.#text;
    const y = this.center.y - this.size.height / 2;
    //this.drawShowdowFill(ctx);

    ctx.save();
    this.setProperties(ctx);

    let row = 0;
    for (let line of lines) {
      let xOffset = xOffsets[row] || 0;
      const x = this.center.x + xOffset;
      ctx.beginPath();
      ctx.fillStyle = this.createColors(ctx, this.options.fill);

      ctx.fillText(line, x, y + fontSize / 2 + row * fontSize);

      if (this.options.stroke) {
        ctx.lineWidth = this.options.stroke.size;
        ctx.strokeStyle = this.createColors(ctx, this.options.stroke);
        ctx.strokeText(line, x, y + fontSize / 2 + row * fontSize);
      }
      row++;
    }

    ctx.restore();

    this.selections?.draw(ctx);
  }

  set setWidth(width) {
    this.size.width = width;
  }

  set setHeight(height) {
    this.size.height = height;
  }
}
export { TextShape };
