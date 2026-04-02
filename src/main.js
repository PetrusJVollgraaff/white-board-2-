import { TopNav } from "./JS/display/nav";
import { RulerRenderer } from "./JS/display/ruler";
import ViewPort from "./JS/display/viewport";
import { Vector } from "./JS/utils/vector";

class DrawingBoard {
  #mainArea = document.getElementById("main-area");
  #topNav = document.getElementById("top_navbar");
  #mainC = document.getElementById("main-canvas");
  #mainCtx = this.#mainC.getContext("2d");
  #viewportElm = document.getElementById("viewport");
  #rulers = null;
  #topnav = null;

  #stageSize = {
    "800,600": { w: 800, h: 600 },
    "1920,1080": { w: 1920, h: 1080 },
    "2560,1440": { w: 2560, h: 1440 },

    "3840,2160": { w: 3840, h: 2160 },
    "2480,3508": { w: 2480, h: 3508 },
    "3508,2480": { w: 3508, h: 2480 },

    "2550,3300": { w: 2550, h: 3300 },
    "1080,1080": { w: 1080, h: 1080 },
  };

  #StageProperties = {
    offset: Vector.zero(),
    center: Vector.zero(),
    size: this.#stageSize["800,600"],
    ratio: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
  };
  #showRulers = true;
  #isPanning = false;
  _tool = "pan";

  constructor() {
    this.#mainC.width = this.#viewportElm.clientWidth;
    this.#mainC.height = this.#viewportElm.clientHeight;
    this.#setStageProperties();

    this._vp = new ViewPort(this.#StageProperties.ratio);
    this.#rulers = new RulerRenderer(
      document.getElementById("ruler-h"),
      document.getElementById("ruler-v"),
    );

    this.#bindEvents();

    this.#topnav = new TopNav(this.#topNav, (data) => {
      const { action } = data;

      switch (action) {
        case "setSize":
          return this.#setSize(data);
        case "setZoom":
          return this.#setZoom(data);
        case "setRuler":
          return this.#setRuler(data);
      }
    });

    new ResizeObserver(() => {
      this.#rulers.syncSizes(this.#StageProperties);
      this.#render();
    }).observe(this.#viewportElm);

    this.#rulers.syncSizes(this.#StageProperties);
    this.#fitToViewport();
  }

  #setRuler(data) {
    var action = data.value ? "remove" : "add";
    this.#mainArea.classList[action]("rulers-hidden");
  }

  #setSize(data) {
    this.#StageProperties.size = data?.size
      ? this.#stageSize[data?.size]
      : data.custom;
    this.#fitToViewport();
  }

  #setZoom(data) {
    if (data.value == "fit") {
      this.#fitToViewport();
    } else {
      const zoom = this._vp.getZoom;
      const zoomstep = ViewPort.zoom_step;

      var z = data.value == "in" ? zoom * zoomstep : zoom / zoomstep;
      this._vp.applyZoom(z, this.#StageProperties.offset);
      this.#StageProperties.offset = this._vp.getOffset;
      this.#render();
    }
  }

  #setStageProperties() {
    this.#StageProperties.ratio = this.#mainC.height / this.#mainC.width;
    this.#StageProperties.right = this.#mainC.width;
    this.#StageProperties.bottom = this.#mainC.height;
    this.#StageProperties.width = this.#mainC.width;
    this.#StageProperties.height = this.#mainC.height;
    this.#StageProperties.center = new Vector({
      x: this.#mainC.width / 2,
      y: this.#mainC.height / 2,
    });
  }

  #render() {
    const zoom = this._vp.getZoom;
    const { offset, width, height, size } = this.#StageProperties;
    if (this.#showRulers) this.#rulers.draw(this._vp, this.#StageProperties);

    this.#mainCtx.clearRect(0, 0, width, height);
    this.#mainCtx.save();
    this.#mainCtx.fillStyle = "#ffffff";
    this.#mainCtx.fillRect(offset.x, offset.y, size.w * zoom, size.h * zoom);
    this.#mainCtx.scale(zoom, zoom);
    this.#mainCtx.translate(offset.x / zoom, offset.y / zoom);
    this.#mainCtx.restore();

    document.getElementById("zoom-level").textContent = this._vp.zoomLabel;
  }

  #fitToViewport() {
    this._vp.fitDoc(this.#StageProperties);
    this.#StageProperties.offset = this._vp.getOffset;

    this.#render();
  }

  #vpPt(e) {
    const { left, top } = this.#viewportElm.getBoundingClientRect();
    return new Vector({ x: e.clientX - left, y: e.clientY - top });
  }

  #onWheel(e) {
    e.preventDefault();
    this._vp.handleZoom(e.deltaY, this.#vpPt(e));
    this.#StageProperties.offset = this._vp.getOffset;
    this.#render();
  }

  #onMouseDown(e) {
    if (e.button !== 0) return;

    if (this._tool === "pan") {
      const offset = this._vp.getOffset;
      const mouseStart = new Vector({ x: e.clientX, y: e.clientY });
      this._panStart = { offset: new Vector({ ...offset }), mouseStart };
      this.#isPanning = true;
      this.#viewportElm.classList.add("panning");

      return;
    }
  }

  #onMouseMove(e) {
    if (this.#isPanning) {
      const { offset, mouseStart } = this._panStart;
      const mouseMove = new Vector({ x: e.clientX, y: e.clientY });
      const newPos = Vector.add(offset, Vector.subtract(mouseMove, mouseStart));

      this._vp.setOffset = newPos;
      this.#StageProperties.offset = newPos;

      this.#render();
      return;
    }
  }

  #onMouseUp() {
    if (this.#isPanning) {
      this.#viewportElm.classList.remove("panning");
      this.#isPanning = false;
      this.#render();
      return;
    }
  }

  #bindEvents() {
    const vp = this.#viewportElm;
    vp.addEventListener("mousedown", (e) => this.#onMouseDown(e));
    window.addEventListener("mousemove", (e) => this.#onMouseMove(e));
    window.addEventListener("mouseup", (e) => this.#onMouseUp(e));
    vp.addEventListener("wheel", (e) => this.#onWheel(e), { passive: false });
  }
}

new DrawingBoard();
