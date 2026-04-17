import { TopNav } from "./JS/display/topnav";
import { RulerRenderer } from "./JS/display/ruler";
import ViewPort from "./JS/display/viewport";
import { Vector } from "./JS/utils/vector";
import { ExportManager } from "./JS/utils/export";
import { RightNav } from "./JS/display/rightnav";
import { LayerManager } from "./JS/display/LayerManager";
import { SelectTool } from "./JS/mouseEvents/selectTool";
import { PanTools } from "./JS/mouseEvents/panTool";
import { RectTool } from "./JS/mouseEvents/rectTool";
import { RectShape } from "./JS/shapes/patterns/rectangle";
import { BoundingBox } from "./JS/utils/boundingBox";
import { ViewportSizePanel } from "./JS/panels/ViewportSizePanel";

class DrawingBoard {
  #mainArea = document.getElementById("main-area");
  #topNavElm = document.getElementById("top_navbar");
  #rightNavElm = document.getElementById("right_navbar");
  #mainC = document.getElementById("main-canvas");
  #mainCtx = this.#mainC.getContext("2d");
  #viewportElm = document.getElementById("viewport");
  #rulers = null;
  #exportFormat = "png";

  #StageProperties = {
    offset: Vector.zero(),
    center: Vector.zero(),
    size: ViewportSizePanel.Sizes["800x600"],
    ratio: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
  };
  #showRulers = true;
  #toolActive = "pan";
  #SelectedEvent = null;
  #currentShape = null;
  #isDraggin = false;
  #startPoint = Vector.zero();
  #layerManager = new LayerManager({ main: this });
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

    new TopNav({
      elm: this.#topNavElm,
      main: this,
      callback: (data) => {
        const { action } = data;

        switch (action) {
          case "setSize":
            return this.#setSize(data);
          case "setZoom":
            return this.#setZoom(data);
          case "setRuler":
            return this.#setRuler(data);
          case "setTool":
            return this.#setTool(data);
          case "setFile":
            return this.#setFile(data);
        }
      },
    });

    this.rightNav = new RightNav({
      elm: this.#rightNavElm,
      main: this,
      callback: (data) => {
        const { action } = data;

        switch (action) {
          case "setLayer":
            return this.#setLayer(data);
        }
      },
    });

    new ResizeObserver(() => {
      this.#rulers.syncSizes(this.#StageProperties);
      this.render();
    }).observe(this.#viewportElm);

    this.#rulers.syncSizes(this.#StageProperties);
    this.#fitToViewport();
  }

  set setLayers(elm) {
    this.#layerManager.render(elm);
    this.render();
  }

  get vpPt() {
    const { left, top } = this.#viewportElm.getBoundingClientRect();
    return (e) => new Vector({ x: e.clientX - left, y: e.clientY - top });
  }

  get getSize() {
    return this.#StageProperties.size;
  }

  #appendShape() {
    this.#layerManager.addShape(this.#currentShape);
  }

  #setTool(data) {
    const { tool } = data;
    this.#toolActive = tool;
    this.#SelectedEvent.removeEventListeners(this.#viewportElm);
    this.#setMousEvents();
  }

  #setRuler(data) {
    var action = data.value ? "remove" : "add";
    this.#mainArea.classList[action]("rulers-hidden");
  }

  #setSize(data) {
    this.#StageProperties.size = data?.size
      ? SizePanel.Sizes[data?.size]
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
      this.render();
    }
  }

  #setFile(data) {
    const { value } = data;

    if (value === "format") {
      this.#exportFormat = data.format;
      return;
    }

    if (value === "export") {
      switch (this.#exportFormat) {
        case "png":
          return ExportManager.ExportPNG();
        case "jpeg":
          return ExportManager.ExportJPEG();
        case "svg":
          return ExportManager.ExportSVG();
      }
    }
    if (value === "load") {
      return;
    }
    if (value === "save") {
      return;
    }
  }

  #setLayer(data) {
    var { value, from } = data;
    if (from == "top") {
      this.#layerManager[value]();
      return;
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

  render(shapes = []) {
    const zoom = this._vp.getZoom;
    const { offset, width, height, size } = this.#StageProperties;
    if (this.#showRulers) this.#rulers.draw(this._vp, this.#StageProperties);

    this.#mainCtx.clearRect(0, 0, width, height);
    this.#mainCtx.save();
    this.#mainCtx.fillStyle = "#ffffff";
    this.#mainCtx.fillRect(offset.x, offset.y, size.w * zoom, size.h * zoom);
    this.#mainCtx.scale(zoom, zoom);
    this.#mainCtx.translate(offset.x / zoom, offset.y / zoom);

    document.getElementById("zoom-level").textContent = this._vp.zoomLabel;

    this.#layerManager.drawShape(this.#mainCtx, shapes);
    this.#mainCtx.restore();
  }

  #fitToViewport() {
    this._vp.fitDoc(this.#StageProperties);
    this.#StageProperties.offset = this._vp.getOffset;

    this.render();
  }

  #onWheel(e) {
    e.preventDefault();
    this._vp.handleZoom(e.deltaY, this.vpPt(e));
    this.#StageProperties.offset = this._vp.getOffset;
    this.render();
  }

  #bindEvents() {
    const vp = this.#viewportElm;
    /*vp.addEventListener("mousedown", (e) => this.#onMouseDown(e));
    window.addEventListener("mousemove", (e) => this.#onMouseMove(e));
    window.addEventListener("mouseup", (e) => this.#onMouseUp(e));*/
    this.#setMousEvents();
    vp.addEventListener("wheel", (e) => this.#onWheel(e), { passive: false });
  }

  #setMousEvents() {
    const vp = this.#viewportElm;
    if (this.#toolActive == "select") {
      this.#SelectedEvent = SelectTool;
      this.#SelectedEvent.configureEventListener(
        vp,
        this.#SelectEvents.bind(this),
      );
      return;
    }

    if (this.#toolActive == "pan") {
      this.#SelectedEvent = PanTools;
      this.#SelectedEvent.configureEventListener(
        vp,
        this.#PanEvents.bind(this),
      );
      return;
    }

    if (this.#toolActive == "rect") {
      this.#SelectedEvent = RectTool;
      this.#SelectedEvent.configureEventListener(
        vp,
        this.#RectEvents.bind(this),
      );
      return;
    }
  }

  #PanEvents(evt) {
    if (evt instanceof PointerEvent) {
      const { type, clientX, clientY } = evt;
      if (type == "pointerdown") {
        const offset = this._vp.getOffset;
        const mouseStart = new Vector({ x: clientX, y: clientY });
        this._panStart = { offset: new Vector({ ...offset }), mouseStart };
        this.#viewportElm.classList.add("panning");
      } else if (type == "pointermove") {
        const { offset, mouseStart } = this._panStart;
        const mouseMove = new Vector({ x: clientX, y: clientY });
        const newPos = Vector.add(
          offset,
          Vector.subtract(mouseMove, mouseStart),
        );

        this._vp.setOffset = newPos;
        this.#StageProperties.offset = newPos;

        this.render();
      } else {
        this.#viewportElm.classList.remove("panning");
        this.render();
      }
    }
  }

  #RectEvents(evt) {
    var startPoint = null;
    if (evt instanceof PointerEvent) {
      const { type } = evt;
      const vp = this.vpPt(evt);
      const doc = this._vp.toDoc(vp.x, vp.y);

      if (type == "pointerdown") {
        this.#startPoint = doc;
      } else if (type == "pointermove") {
        const { center, size } = DrawingBoard.getCenterAndSize(
          this.#startPoint,
          doc,
        );
        if (this.#currentShape) {
          this.#currentShape.setCenter = { center };
          this.#currentShape.setSize = size;
        } else {
          this.#currentShape = new RectShape({ center, size });
        }

        this.render([this.#currentShape]);
      } else if (type == "pointerup") {
        if (this.#currentShape) {
          this.#appendShape();
          this.#startPoint = Vector.zero();
          this.#currentShape = null;
          this.render();
        }
      }
    }
  }

  static getCenterAndSize(corner1, corner2) {
    const points = [corner1, corner2];
    const center = Vector.mid(points);
    const size = BoundingBox.fromPoints(points);
    return { center, size };
  }

  #SelectEvents(evt) {
    var startPoint = null;
    if (evt instanceof PointerEvent) {
      const { type, button } = evt;
      const vp = this.vpPt(evt);
      const doc = this._vp.toDoc(vp.x, vp.y);

      if (button < 1) {
        if (type == "pointerdown") {
          const shapes = this.#layerManager.activeLayerShapes;

          if (shapes) {
            const shape = shapes.find((s) => s.isSelected(this.#mainCtx, doc));
            this.isClickingSelectedShape = shape && shape.selected;

            if (!shape) return;

            if (!this.isClickingSelectedShape) {
              this.#currentShape = shape;
              this.#startPoint = doc;
              this.OldCenter = this.#currentShape.getCenter;
              this.#currentShape.select();
              this.rightNav.setSize = this.#currentShape.getSize;
              this.rightNav.setColor = this.#currentShape.getColor;
            }
            this.#isDraggin = false;
          }
        } else if (type == "pointermove") {
          if (!this.#currentShape) return;
          const diff = Vector.subtract(doc, this.#startPoint);

          this.#isDraggin = true;
          this.#currentShape.setCenter = {
            center: Vector.add(this.OldCenter, diff),
          };

          this.render();
        } else if (type == "pointerup") {
          if (!this.#currentShape) return;
          if (this.isClickingSelectedShape && !this.#isDraggin) {
          }

          if (this.#isDraggin) {
            this.rightNav.setSize = this.#currentShape.getSize;
            this.#currentShape.unselect();
          }
          if (this.#currentShape) this.#currentShape = null;
          this.render();
        }
      }
    }
  }
}

new DrawingBoard();
