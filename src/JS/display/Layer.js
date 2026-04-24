import { ShapeFactory } from "../utils/shapeFactory";
import { Vector } from "../utils/vector";
import { createDOMElement } from "./model";

class Layer extends EventTarget {
  #id = null;
  #name = null;
  #visible = true;
  #opacity = 100;
  #shapes = [];
  #mergeHistory = null;
  #elm = null;
  #viewElm = null;
  #dragElm = null;
  #thumbElm = null;
  #selected = false;
  #callback;
  #size = { w: 0, h: 0 };
  #main = null;
  order = 0;
  #dragged = false;

  constructor({
    name,
    size,
    main,
    id = null,
    opts = null,
    callback = () => {},
  }) {
    super();
    this.#name = name;
    this.#size = size;
    this.#main = main;
    this.#id = id ?? Layer._uid();
    this.#callback = callback;

    if (opts) {
      this.#visible = opts.visible ?? true;
      this.#opacity = opts.opacity ?? 100;
      this.#shapes = ShapeFactory.loadShapes(
        opts.shapes ?? [],
        this.#main.ShapeCallback.bind(this.#main),
      );
      // mergeHistory: array of layer snapshots that were merged to create this layer
      // Allows full unmerge back to original layers
      this.#mergeHistory = opts.mergeHistory ?? null; // null = not merged
    }
    this.#init();
  }

  static load(data) {
    const layer = new Layer(data);
    layer.setActive = data.selected;
    return layer;
  }

  #init() {
    this.#build();
    this.#eventListener();
  }

  #build() {
    const { w, h } = this.#size;
    this.#elm = createDOMElement({
      attributes: {
        class: "layer-item",
        "data-id": this.#id,
      },
    });

    this.#viewElm = createDOMElement({
      type: "span",
      attributes: {
        class: "layer-vis",
        title: this.#visible ? "Click to hide" : "Click to show",
      },
      text: this.#visible ? "👁" : "⊘",
    });

    this.#dragElm = createDOMElement({
      type: "span",
      attributes: { class: "layer-drag-grip", title: "Drag to reorder" },
      text: "⠿",
    });

    this.#thumbElm = createDOMElement({
      type: "img",
      attributes: {
        class: "modal-pick-thumb",
      },
    });

    this.renderThumb(w, h);
  }

  static _uid() {
    return "L" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  get getName() {
    return this.#name;
  }

  get getId() {
    return this.#id;
  }

  get getShapes() {
    return this.#visible ? this.#shapes : [];
  }

  set setOrder(order) {
    this.order = order;
  }

  set addShape(shape) {
    this.#shapes.push(shape);
  }

  set removeShapes(value) {
    this.#shapes = this.#shapes.filter((s) => !s.selected);
  }

  set setActive(val) {
    this.#selected = val;
    const active = this.#selected ? "add" : "remove";
    this.#elm.classList[active]("active");
  }

  set setOpacity(val) {
    this.#opacity = Number(val);
  }

  set setElmClass({ action, className }) {
    this.#elm.classList[action](className);
  }

  sendToBack() {
    const selShapes = this.#shapes.map((s) => s.selected);
    const unselShapes = this.#shapes.map((s) => !s.selected);

    this.#shapes = selShapes.concat(unselShapes);

    this.#main.dispatchEvent(
      new CustomEvent("shapesReordered", { detail: { save: true } }),
    );
  }

  sendBackward() {
    const indices = this.#getSelectedShapeIndices();

    for (const index of indices) {
      const newIndex = index - 1;
      const shape = this.#shapes[newIndex];
      if (newIndex >= 0 && !shape.selected) {
        this.#swapShapes(index, newIndex);
      }
    }

    this.#main.dispatchEvent(
      new CustomEvent("shapesReordered", { detail: { save: true } }),
    );
  }

  bringToFront() {
    const selShapes = this.#shapes.map((s) => s.selected);
    const unselShapes = this.#shapes.map((s) => !s.selected);

    this.#shapes = unselShapes.concat(selShapes);

    this.#main.dispatchEvent(
      new CustomEvent("shapesReordered", { detail: { save: true } }),
    );
  }

  bringForward() {
    const indices = this.#getSelectedShapeIndices();
    const total = this.#shapes.length;

    for (const index of indices) {
      const newIndex = index + 1;
      const shape = this.#shapes[newIndex];
      if (newIndex < total && !shape.selected) {
        this.#swapShapes(index, newIndex);
      }
    }

    this.#main.dispatchEvent(
      new CustomEvent("shapesReordered", { detail: { save: true } }),
    );
  }

  render(selectedId, { w, h }) {
    this.setActive = selectedId == this.#id;
    this.#elm.innerHTML = "";
    this.renderThumb(w, h);

    this.#elm.appendChild(this.#dragElm);
    this.#elm.appendChild(this.#viewElm);
    this.#elm.appendChild(this.#thumbElm);

    const info = createDOMElement({ attributes: { class: "layer-info" } });
    const meta = createDOMElement({ attributes: { class: "layer-meta" } });
    info.appendChild(
      createDOMElement({
        type: "span",
        attributes: {
          class: "layer-name",
          title: this.#name,
        },
        text: this.#name,
      }),
    );

    info.appendChild(
      createDOMElement({
        type: "span",
        text: this.#shapes.length
          ? `${this.#shapes.length} shape${this.#shapes.length !== 1 ? "s" : ""}`
          : "empty",
      }),
    );

    info.appendChild(meta);

    this.#elm.appendChild(info);

    return this.#elm;
  }

  renderThumb(docW, docH) {
    const offcanvas = new OffscreenCanvas(34, 26);
    const ctx = offcanvas.getContext("2d");
    ctx.clearRect(0, 0, 34, 26);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 34, 26);

    let thumb = null;
    if (!this.#shapes.length) {
      thumb = offcanvas.convertToBlob();
    } else {
      const scale = Math.min(34 / docW, 26 / docH);
      ctx.save();
      ctx.scale(scale, scale);
      ctx.globalAlpha = this.#opacity / 100;
      for (const s of this.#shapes) {
        s.draw(ctx, false);
      }
      ctx.restore();

      thumb = offcanvas.convertToBlob();
    }

    thumb.then((blob) => {
      const url = URL.createObjectURL(blob);

      this.#thumbElm.src = url;
    });
  }

  serialize() {
    const shapes = this.#shapes.map((s) => s.serialize());
    const mergeHistory = this.#mergeHistory
      ? JSON.parse(JSON.stringify(this.#mergeHistory))
      : null;

    return {
      id: this.#id,
      name: this.#name,
      size: this.#size,
      main: this.#main,
      selected: this.#selected,
      opts: {
        visible: this.#visible,
        opacity: this.#opacity,
        shapes,
        mergeHistory,
      },
    };
  }

  getDetails({ newName = null, callback }) {
    const shapes = this.#shapes.map((s) => s.serialize());
    const mergeHistory = this.#mergeHistory
      ? JSON.parse(JSON.stringify(this.#mergeHistory))
      : null;

    return {
      name: newName ?? this.#name,
      size: this.#size,
      main: this.#main,
      callback,
      opts: {
        visible: this.#visible,
        opacity: this.#opacity,
        shapes,
        mergeHistory,
      },
    };
  }

  clone(callback) {
    const obj = this.getDetails({ newName: this.#name + " copy", callback });
    return Layer.load(obj);
  }

  #getSelectedShapeIndices() {
    const indices = [];
    this.#shapes.forEach((s, i) => {
      if (s.selected) {
        indices.push(i);
      }
    });
    return indices;
  }

  #swapShapes(index1, index2) {
    const temp = this.#shapes[index1];
    this.#shapes[index1] = this.#shapes[index2];
    this.#shapes[index2] = temp;
  }

  #eventListener() {
    this.#elm.addEventListener("click", (evt) => {
      if (this.#selected) return;
      this.#callback({ action: "active", id: this.#id });
    });

    this.#viewElm.addEventListener("click", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.#visible = !this.#visible;
      this.#viewElm.innerHTML = this.#visible ? "👁" : "⊘";

      this.#callback({ action: "view" });
    });

    this.#elm.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      this.#callback({ action: "dragsover", id: this.#id });

      this.setElmClass = { className: "drag-over", action: "add" };
    });

    this.#elm.addEventListener(
      "dragleave",
      () => (this.setElmClass = { className: "drag-over", action: "remove" }),
    );

    this.#elm.addEventListener("drop", (e) => {
      e.preventDefault();
      this.setElmClass = { className: "drag-over", action: "remove" };
      this.#callback({ action: "dragend", id: this.#id });
      this.dispatchEvent(new CustomEvent("endDrag", { detail: {} }));
    });

    this.#dragElm.addEventListener("pointerdown", (evt) => {
      this.dispatchEvent(new CustomEvent("startDrag", { detail: {} }));
    });

    this.#dragElm.addEventListener("pointerup", (evt) => {
      this.dispatchEvent(new CustomEvent("endDrag", { detail: {} }));
    });

    this.#customEvents();
  }

  #customEvents() {
    this.addEventListener("startDrag", () => {
      this.#elm.draggable = true;
      this.#dragged = true;
      this.#elm.addEventListener("dragstart", (e) => {
        this.#callback({ action: "dragstart", id: this.#id });
        this.setElmClass = { className: "dragging", action: "add" };

        e.dataTransfer.effectAllowed = "move";
      });
    });

    this.addEventListener("endDrag", () => {
      this.#dragged = false;
      this.#elm.draggable = false;
      this.setElmClass = { className: "dragging", action: "remove" };
    });
  }

  renderShapes(ctx, shape = []) {
    if (!this.#visible) return;
    ctx.save();
    ctx.globalAlpha = this.#opacity / 100;
    for (const s of [...this.#shapes, ...shape]) s.draw(ctx);
    ctx.restore();
  }
}

export { Layer };
