import { DataReader } from "../../utils/dataReader";
import { Shape } from "../shape";

class Images extends Shape {
  shape = "Images";
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
      filedata,
      filetype,
      bitmap = undefined,
      imageData = "",
    },
    callback,
  ) {
    super(options, callback);
    this.filedata = filedata;
    this.filetype = filetype;
    this.size = size;
    this.imageData = imageData;

    if (bitmap != undefined) {
      this.original = {
        size: size,
        ratio: bitmap.width / bitmap.height,
        imageData: imageData,
      };
      this.ratio = bitmap.width / bitmap.height;
      this.img = imageData;
    }

    this.offscreen = DataReader.uint8ClampedArrayToCanvas(this.img, this.size);
  }

  static load(data, callback) {
    const text = new Images(data, callback);
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

  async draw(ctx, hitRegion = false) {
    const { width, height } = this.size;

    const x = this.center.x - width / 2;
    const y = this.center.y - height / 2;
    imagePos = new Vector({ x, y }).add(viewport.zeroCenterOffset);

    if (hitRegion) {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      this.applyHitRegionStyles(ctx);
    } else {
      ctx.save();
      ctx.translate(this.center.x, this.center.y);
      ctx.scale(Math.sign(width), Math.sign(height));
      ctx.beginPath();
      //ctx.putImageData(this.img, imagePos.x, imagePos.y);
      ctx.drawImage(
        this.offscreen.canvas,
        -width / 2,
        -height / 2,
        width,
        height,
      );

      ctx.restore();
    }
  }
}

export { Images };
