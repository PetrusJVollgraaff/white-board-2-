import { ControlFlow } from "../utils/util";

class TopNav {
  #callback = () => {};
  #elmP = null;
  constructor(elmP, callback) {
    this.#elmP = elmP;
    this.#callback = callback;

    this.selSize = this.#elmP.querySelector("#sel-size");
    this.customWidthEl = this.#elmP.querySelector("#cw");
    this.customHeightEl = this.#elmP.querySelector("#ch");

    this.zoomInBtn = this.#elmP.querySelector("#btn-zin");
    this.zoomOutBtn = this.#elmP.querySelector("#btn-zout");
    this.zoomFitBtn = this.#elmP.querySelector("#btn-fit");

    this.#init();
  }

  #init() {
    this.#eventListener();
  }

  #eventListener() {
    this.#sizeEvents();
    this.#zoomEvents();
  }

  #sizeEvents() {
    this.selSize.addEventListener("change", () => {
      const { value: size } = this.selSize;

      if (size === "custom") {
        this.customWidthEl.style.display = this.customHeightEl.style.display =
          "inline-block";
      } else {
        this.customWidthEl.style.display = this.customHeightEl.style.display =
          "none";
        const [w, h] = size.split(",").map(Number);
        this.customWidthEl.value = w;
        this.customHeightEl.value = h;

        this.#callback({ action: "setSize", size });
      }
    });

    [this.customWidthEl, this.customHeightEl].forEach((elm, idx, arr) => {
      const handler = ControlFlow.debounce((e) => {
        this.#callback({
          action: "setSize",
          custom: {
            w: Number(arr[0].value),
            h: Number(arr[1].value),
          },
        });
      }, 1000);

      elm.addEventListener("input", handler);
    });
  }

  #zoomEvents() {
    //const zc = () => [this._vpEl.clientWidth / 2, this._vpEl.clientHeight / 2];
    this.zoomInBtn.addEventListener("click", () => {
      //const [cx, cy] = zc();
      this.#callback({ action: "setZoom", value: "in" });

      //this._vp.applyZoom(this._vp.zoom * 1.25, cx, cy);
      //this.render();
    });

    this.zoomOutBtn.addEventListener("click", () => {
      this.#callback({ action: "setZoom", value: "out" });
      //const [cx, cy] = zc();
      //this._vp.applyZoom(this._vp.zoom / 1.25, cx, cy);
      //this.render();
    });

    this.zoomFitBtn.addEventListener("click", () =>
      //this._fitToViewport()
      this.#callback({ action: "setZoom", value: "fit" }),
    );
  }
}

export { TopNav };
