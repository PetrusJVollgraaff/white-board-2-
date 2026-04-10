import { createDOMElement } from "../display/model";

class ZoomPanel {
  #callback = () => {};
  #elmP = null;
  #elm = null;

  #zoomInBtn = null;
  #zoomOutBtn = null;
  #zoomFitBtn = null;
  constructor(elmP, callback) {
    this.#elmP = elmP;
    this.#elm = this.#elmP.querySelector("li#zoom_ctn");
    this.#callback = callback;

    this.#init();
  }

  #init() {
    this.#build();
    this.#eventListener();
  }

  #build() {
    this.#zoomInBtn = createDOMElement({
      type: "button",
      attributes: { title: "Zoom Out (−)" },
      text: "−",
    });
    this.#zoomOutBtn = createDOMElement({
      type: "button",
      attributes: { title: "Zoom IN (+)" },
      text: "+",
    });
    this.#zoomFitBtn = createDOMElement({
      type: "button",
      attributes: { title: "Fit to screen)" },
      text: "Fit",
    });

    this.#elm.appendChild(
      createDOMElement({
        type: "span",
        attributes: { class: "tlbl" },
        text: "ZOOM",
      }),
    );

    this.#elm.appendChild(this.#zoomInBtn);
    this.#elm.appendChild(
      createDOMElement({
        type: "span",
        attributes: { id: "zoom-level" },
        text: "100%",
      }),
    );
    this.#elm.appendChild(this.#zoomOutBtn);
    this.#elm.appendChild(this.#zoomFitBtn);
  }

  #eventListener() {
    this.#zoomInBtn.addEventListener("click", () => {
      this.#callback({ action: "setZoom", value: "in" });
    });

    this.#zoomOutBtn.addEventListener("click", () => {
      this.#callback({ action: "setZoom", value: "out" });
    });

    this.#zoomFitBtn.addEventListener("click", () =>
      this.#callback({ action: "setZoom", value: "fit" }),
    );
  }
}
export { ZoomPanel };
