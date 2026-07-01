import { createDOMElement } from "../display/model";
import { ImagesShape } from "../shapes/image/shape";

class ImagePanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;
  #main = null;

  #ImgBtn = null;
  #FileInput = null;
  constructor(elmP, main, callback) {
    this.#main = main;
    this.#elmP = elmP;
    this.#elm = this.#elmP.querySelector("li#image_ctn");
    this.#callback = callback;

    this.#init();
  }

  #init() {
    this.#build();
    this.#eventListener();
  }

  #build() {
    this.#ImgBtn = createDOMElement({
      type: "button",
      attributes: { title: "Upload Image" },
      text: "Image Uploader",
    });
    this.#FileInput = createDOMElement({
      type: "input",
      attributes: { type: "file", accept: "image/*" },
    });

    this.#elm.appendChild(this.#ImgBtn);
  }

  #eventListener() {
    this.#ImgBtn.addEventListener("click", () => {
      this.#FileInput.showPicker();
    });

    this.#FileInput.addEventListener("change", async (evt) => {
      await this.#loadImages(evt.target.files[0]);
    });
  }

  async #loadImages(file) {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bitmap, 0, 0);

    const img = new Image();

    console.log(canvas.convertToBlob);

    img.src = canvas.convertToBlob
      ? URL.createObjectURL(await canvas.convertToBlob())
      : URL.createObjectURL(file);

    await img.decode();

    this.#callback(
      new ImagesShape(
        { bitmap, size: { width, height }, imageData: img },
        this.#main.ShapeCallback.bind(this.#main),
      ),
    );
  }
}

export { ImagePanel };
