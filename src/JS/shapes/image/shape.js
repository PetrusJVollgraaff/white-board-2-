import { DataReader } from "../../utils/dataReader";
import { Vector } from "../../utils/vector";
import { Shape } from "../shape";

class ImagesShape extends Shape {
  shape = "ImagesShape";
  #filters = [];
  #worker = null;
  #graphic = {
    mode: "default",
    opacity: 100,
    brightness: 0,
    contrast: 0,
    rgb: {
      r: 0,
      g: 0,
      b: 0,
    },
    gamma: 1,
    /*invert: 0,
    sepia: 0,
    saturate: 100,
    huerotate: 0,*/
  };

  constructor(
    {
      center = Vector.zero(),
      size = { width: 0, height: 0 },
      bitmap = null,
      imageData = "",
    },
    callback,
    options = Shape.getDefaultOptions(),
  ) {
    super(options, callback);
    this.size = size;
    this.imageData = imageData;

    if (bitmap) {
      this.original = {
        size: size,
        ratio: bitmap.width / bitmap.height,
        imageData: imageData,
      };
      this.ratio = bitmap.width / bitmap.height;
      this.img = imageData;
    }

    //this.offscreen = DataReader.uint8ClampedArrayToCanvas(this.img, this.size);
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

  static load(data, callback) {
    const text = new ImagesShape(data, callback);
    text.selected = data.selected;
    return text;
  }

  serialize() {
    return JSON.parse(JSON.stringify({ ...{ shape: this.shape }, ...this }));
  }

  setfilterChorma(index, value, option, save) {
    var action = option == "threshold" ? "setThreshold" : "setKeyFromHex";
    this.#filters[index][action](value);

    this.appendGraphic(save);
  }

  async filterChorma(op, save = true) {
    const { data, width, height } = this.original.imageData;
    const copy = DataReader.createImageData({ width, height }, data);

    this.imageData =
      op == "added"
        ? await this.#filters.reduce((i, f) => f.apply(i), copy)
        : copy;

    this.appendGraphic(save);
  }

  async appendGraphic(save) {
    const _ = this;
    if (this.#worker) this.#worker.terminate();
    this.#worker = new Worker("./js/filter/imageFilters.js");

    const { width, height, data } = this.imageData;
    const size = { width, height };
    const ImageData = DataReader.createImageData(size, data);

    this.#worker.postMessage({ size, imageData, filters: this.#graphic });

    this.#worker.onmessage = async function (evt) {
      _.img = evt.data;
      _.offscreen = DataReader.uint8ClampedArrayToCanvas(_.img, _.size);

      /*viewport.dispatchEvent(
        new CustomEvent("optionsChanged", { detail: { shape: _, save } }),
      );*/
    };
  }

  draw(ctx, hitRegion = false) {
    const { width, height } = this.size;

    const x = this.center.x - width / 2;
    const y = this.center.y - height / 2;
    const imagePos = new Vector({ x, y });

    if (hitRegion) {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      this.applyHitRegionStyles(ctx);
    } else {
      ctx.save();
      ctx.beginPath();
      //ctx.putImageData(this.img, imagePos.x, imagePos.y);
      ctx.drawImage(this.img, x, y, width, height);

      ctx.restore();

      this.selections?.draw(ctx);
    }
  }

  set setWidth(width) {
    this.size.width = width;
  }

  set setHeight(height) {
    this.size.height = height;
  }
}

export { ImagesShape };
