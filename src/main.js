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
import { BoundingBox } from "./JS/transformbox/boundingBox";
import { ViewportSizePanel } from "./JS/panels/ViewportSizePanel";
import { ShapeSelection } from "./JS/transformbox/selections";
import { EllipseTool } from "./JS/mouseEvents/ellipseTool";
import { LineTool } from "./JS/mouseEvents/lineTool";
import { FreeHandTool } from "./JS/mouseEvents/freehandTool";

class DrawingBoard extends EventTarget {
  #mainArea = document.getElementById("main-area");
  #topNavElm = document.getElementById("top_navbar");
  #rightNavElm = document.getElementById("right_navbar");
  #mainC = document.getElementById("main-canvas");
  #mainCtx = this.#mainC.getContext("2d");
  #viewportElm = document.getElementById("viewport");
  #rulers = null;
  #exportFormat = "png";
  #selectedItems = [];
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
    super();
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
            return this.#setViewPortSize(data);
          case "setZoom":
            return this.#setZoom(data);
          case "setRuler":
            return this.#setRuler(data);
          case "setTool":
            return this.#setTool(data);
          case "setFile":
            return this.#setFile(data);
          case "setHistory":
            return this.#setHistory(data);
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
          case "setColor":
            return this.#setColor(data);
          case "setSize":
            return this.#setSize(data);
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

  /** Setters */
  set setOffset(value) {
    this.#StageProperties.offset = value;
  }

  set setLayers(elm) {
    this.#layerManager.render(elm);
    this.render();
  }

  set setLayerOpacity(value) {
    this.#layerManager.setLayerOpacity = value;
    this.render();
  }

  set setMouseEvent(event) {
    const vp = this.#viewportElm;
    if (this.#SelectedEvent) this.#SelectedEvent.removeEventListeners(vp);

    this.#SelectedEvent = event;
    this.#SelectedEvent.configureEventListener(vp, this);
  }

  set setFillSettings(obj) {
    const shapes = this.#layerManager.activeLayerShapes;
    if (shapes)
      shapes.forEach((s) => {
        if (s.selected) s.setOptions = { options: obj };
      });
  }

  set setShapeSize(data) {
    const shapes = this.#layerManager.activeLayerShapes;
    if (shapes)
      shapes.forEach((s) => {
        if (s.selected) s[data.action] = data.obj;
      });
  }

  set setItemsUnselect(value) {
    const shapes = this.#layerManager.activeLayerShapes;
    if (shapes) shapes.forEach((s) => s.unselect());
  }

  /** Getters */
  get getmainCtx() {
    return this.#mainCtx;
  }

  get vpPt() {
    const { left, top } = this.#viewportElm.getBoundingClientRect();
    return (e) => new Vector({ x: e.clientX - left, y: e.clientY - top });
  }

  get getSize() {
    return this.#StageProperties.size;
  }

  get getShape() {
    const shapes = this.#layerManager.activeLayerShapes;
    return (doc) =>
      shapes ? shapes.find((s) => s.isSelected(this.#mainCtx, doc)) : null;
  }

  get getSelectedShapes() {
    const shapes = this.#layerManager.activeLayerShapes;
    return shapes ? shapes.filter((s) => s.selected) : null;
  }

  get getSelections() {
    return (doc) =>
      this.#selectedItems.length > 0
        ? this.#selectedItems.find((s) => s.isSelected(this.#mainCtx, doc))
        : null;
  }

  /** Public Method */
  appendShape(shape) {
    this.#layerManager.addShape(shape);
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
    this.#selectedItems.forEach((s) => s.draw(this.#mainCtx));
    this.#mainCtx.restore();
  }

  applySelections() {
    const shapes = this.getSelectedShapes;
    this.#selectedItems = shapes.map((s) => new ShapeSelection(s));
  }

  ShapeCallback(data) {
    if (data?.event) {
      const { name, detail } = data?.event;
      this.dispatchEvent(new CustomEvent(name, { detail }));
    }
  }

  /** Private  Method*/

  #setHistory(data) {
    const { value } = data;
    if (value == "delete") {
      this.#layerManager.removeShapes();
      this.#selectedItems = [];
      this.render();
    }
  }

  #setColor(data) {}

  #setSize(data) {}

  #setTool(data) {
    const { tool } = data;
    this.#toolActive = tool;
    this.#setMousEvents();
  }

  #setRuler(data) {
    var action = data.value ? "remove" : "add";
    this.#mainArea.classList[action]("rulers-hidden");
  }

  #setViewPortSize(data) {
    this.#StageProperties.size = data?.size
      ? ViewportSizePanel.Sizes[data?.size]
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
      this.setOffset = this._vp.getOffset;
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

  #fitToViewport() {
    this._vp.fitDoc(this.#StageProperties);
    this.setOffset = this._vp.getOffset;

    this.render();
  }

  #onWheel(e) {
    e.preventDefault();
    this._vp.handleZoom(e.deltaY, this.vpPt(e));
    this.setOffset = this._vp.getOffset;
    this.render();
  }

  #handleChanges({ detail }) {
    this.render();
    //if (detail.save) {
    //  HistoryTools.record(this.layers);
    //}
  }

  #bindEvents() {
    const vp = this.#viewportElm;
    this.#setMousEvents();
    vp.addEventListener("wheel", (e) => this.#onWheel(e), { passive: false });

    this.#customEvents();
  }

  #customEvents() {
    this.addEventListener("optionsChanged", this.#handleChanges.bind(this));
    this.addEventListener("positionChanged", this.#handleChanges.bind(this));
    this.addEventListener("sizeChanged", this.#handleChanges.bind(this));
    this.addEventListener("rotationChanged", this.#handleChanges.bind(this));
    this.addEventListener("shapeSelected", (event) => {
      this.applySelections();
      this.#handleChanges(event);
    });

    this.addEventListener("shapeUnselected", (event) => {
      this.applySelections();
      this.#handleChanges(event);
    });

    //this.addEventListener("history", PropertiesPanel.updateDisplay);
  }

  #setMousEvents() {
    const vp = this.#viewportElm;
    if (this.#toolActive == "select") {
      this.setMouseEvent = SelectTool;
      return;
    }

    if (this.#toolActive == "pan") {
      this.setItemsUnselect = false;
      this.setMouseEvent = PanTools;
      return;
    }

    if (this.#toolActive == "rect") {
      this.setItemsUnselect = false;
      this.setMouseEvent = RectTool;
      return;
    }

    if (this.#toolActive == "ellipse") {
      this.setItemsUnselect = false;
      this.setMouseEvent = EllipseTool;
      return;
    }

    if (this.#toolActive == "line") {
      this.setItemsUnselect = false;
      this.setMouseEvent = LineTool;
      return;
    }

    if (this.#toolActive == "freehand") {
      this.setItemsUnselect = false;
      this.setMouseEvent = FreeHandTool;
      return;
    }
  }
}

new DrawingBoard();
