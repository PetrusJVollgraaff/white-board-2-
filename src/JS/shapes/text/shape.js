import { Layer } from "../../display/Layer";
import { SelectionHandle } from "../../transformbox/selections";
import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class Text extends Shape {
  shape = "Text";

  static detaultText = {
    fontSize: 60,
    fontFamily: "Arial",
    textAlign: "center",
    textBaseline: "middle",
    value: "Enter Text Here",
  };

  static getDetaultText() {
    return JSON.parse(JSON.stringify(Shape.detaultText));
  }

  constructor(
    {
      center = Vector.zero(),
      size = { width: 0, height: 0 },
      options = Shape.getDefaultOptions(),
    },
    callback,
  ) {
    super(options, callback);
    this.center = center instanceof Vector ? center : new Vector(center);

    this.#text = getDetaultText();
    this.#thinWhiteSpace = String.fromCharCode(8202);
    this.setBuildText();
  }

  static load(data, callback) {
    const text = new Text(data, callback);
    text.selected = data.selected;
    return text;
  }

  serialize() {
    return JSON.parse(JSON.stringify({ ...{ shape: this.shape }, ...this }));
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
    const { value, fontSize } = this.#text;
    const tmpCanvas = document.createElement("canvas");
    const tmpCtx = tmpCanvas.getContext("2d");
    this.setProperties(tmpCtx);
    const metrics = tmpCtx.measureText(value);
    this.size = {
      width: metrics.width,
      height: fontSize,
    };
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
    let lines = this.#text.value.split("\n");
    let longestLineWidth = 0;
    for (let line of lines) {
      if (this.getTextWidthOnCanvas(line) > longestLineWidth) {
        longestLineWidth = this.getTextWidthOnCanvas(line);
      }
    }
    if (this.#text._textAlign) {
      switch (this.#text._textAlign) {
        case "Center":
          this.#text.xOffsets = {};
          break;
        case "Left":
          for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (this.getTextWidthOnCanvas(line) < longestLineWidth) {
              let offsetSize =
                longestLineWidth - this.getTextWidthOnCanvas(line);
              this.#text.xOffsets[i] = -offsetSize / 2;
            }
          }
          break;
        case "Right":
          for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (this.getTextWidthOnCanvas(line) < longestLineWidth) {
              let offsetSize =
                longestLineWidth - this.getTextWidthOnCanvas(line);
              this.#text.xOffsets[i] = offsetSize / 2;
            }
          }
          break;
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
    const { fontSize, dilation, xOffsets } = this.#text;
    //left = this.center.x - this.size.width / 2;
    const x = this.center.y - this.size.height / 2;

    let lines = this.parseText();

    this.drawShowdowFill(ctx);

    ctx.save();
    this.setProperties(ctx);

    if (hitRegion) {
      let row = 0;
      for (let line of lines) {
        let xOffset = xOffsets[row] || 0;
        const y = this.center.x + xOffset;
        ctx.beginPath();
        const rgb = Shape.getHitRGB(this.id.split("_")[1]);
        ctx.fillStyle = rgb;
        ctx.strokeStyle = rgb;
        ctx.lineWidth = this.options.stroke.size + dilation;
        ctx.fillText(line, y, x + fontSize / 2 + row * fontSize);
        ctx.strokeText(line, y, x + fontSize / 2 + row * fontSize);
        row++;
      }
    } else {
      let row = 0;
      for (let line of lines) {
        let xOffset = xOffsets[row] || 0;
        const y = this.center.x + xOffset;
        ctx.beginPath();
        ctx.fillStyle = this.createColors(ctx, this.options.fill);

        ctx.fillText(line, y, x + fontSize / 2 + row * fontSize);

        if (this.options.stroke) {
          ctx.lineWidth = this.options.stroke.size;
          ctx.strokeStyle = this.createColors(ctx, this.options.stroke);
          ctx.strokeText(line, y, x + fontSize / 2 + row * fontSize);
        }
        row++;
      }
    }

    ctx.restore();
  }
}
export { Text };
