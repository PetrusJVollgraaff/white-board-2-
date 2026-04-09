class ToolPanel {
  #callback = () => {};
  #elmP = null;
  #Active = "select";
  #SelectBtn = null;
  #RectBtn = null;
  #EllipseBtn = null;
  #LineBtn = null;
  #FreeHandBtn = null;
  #PanBtn = null;

  constructor(elmP, callback) {
    this.#elmP = elmP;
    this.#callback = callback;

    this.#SelectBtn = this.#elmP.querySelector('button[data-tool="select"]');
    this.#RectBtn = this.#elmP.querySelector('button[data-tool="rect"]');
    this.#EllipseBtn = this.#elmP.querySelector('button[data-tool="ellipse"]');
    this.#LineBtn = this.#elmP.querySelector('button[data-tool="line"]');
    this.#FreeHandBtn = this.#elmP.querySelector(
      'button[data-tool="freehand"]',
    );
    this.#PanBtn = this.#elmP.querySelector('button[data-tool="pan"]');

    this.#init();
  }

  #setSelected(val) {
    this.#elmP
      .querySelector('button[data-tool="' + this.#Active + '"]')
      .classList.remove("active");

    this.#Active = val;
    this.#elmP
      .querySelector('button[data-tool="' + val + '"]')
      .classList.add("active");

    this.#callback({ action: "setTool", tool: this.#Active });
  }

  #init() {
    this.#eventListener();
  }

  #eventListener() {
    this.#SelectBtn.addEventListener("click", () => {
      this.#setSelected("select");
    });
    this.#RectBtn.addEventListener("click", () => {
      this.#setSelected("rect");
    });
    this.#EllipseBtn.addEventListener("click", () => {
      this.#setSelected("ellipse");
    });
    this.#LineBtn.addEventListener("click", () => {
      this.#setSelected("line");
    });
    this.#FreeHandBtn.addEventListener("click", () => {
      this.#setSelected("freehand");
    });
    this.#PanBtn.addEventListener("click", () => {
      this.#setSelected("pan");
    });
  }
}

export { ToolPanel };
