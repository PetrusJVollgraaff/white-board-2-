import { createDOMElement } from "./model";

class Layer {
  #id = Layer._uid();
  #name = null;
  #visible = true;
  #opacity = 100;
  #shapes = [];
  #mergeHistory = null;
  #elm = null;
  #viewElm = null;
  #selected = false;
  #callback;

  constructor({ name, opts = null, callback = () => {} }) {
    this.#name = name;
    this.#callback = callback;

    if (opts) {
      this.#visible = opts.visible ?? true;
      this.#opacity = opts.opacity ?? 100;
      this.#shapes = (opts.shapes ?? []).map((s) =>
        s instanceof Shape ? s : Shape.fromJSON(s),
      );
      // mergeHistory: array of layer snapshots that were merged to create this layer
      // Allows full unmerge back to original layers
      this.#mergeHistory = opts.mergeHistory ?? null; // null = not merged
    }
    this.#init();
  }

  #init() {
    this.#build();
    this.#eventListener();
  }

  #build() {
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

  get isMerged() {
    return Array.isArray(this.#mergeHistory) && this.#mergeHistory.length > 0;
  }

  get shapeCount() {
    return this.#shapes.length;
  }

  get getShapes() {
    return this.#visible ? this.#shapes : [];
  }

  set addShape(shape) {
    this.#shapes.push(shape);
  }

  set setActive(val) {
    this.#selected = val;
    const active = this.#selected ? "add" : "remove";
    this.#elm.classList[active]("active");
  }

  draw(selectedId, { w, h }) {
    this.setActive = selectedId == this.#id;
    this.#elm.innerHTML = "";

    this.#elm.appendChild(
      createDOMElement({
        type: "span",
        attributes: { class: "layer-drag-grip", title: "Drag to reorder" },
        text: "⠿",
      }),
    );
    this.#elm.appendChild(this.#viewElm);

    const newThumb = this.renderThumb(w, h);

    this.thumb = createDOMElement({
      type: "img",
      attributes: {
        class: "modal-pick-thumb",
      },
    });

    newThumb.then((blob) => {
      const url = URL.createObjectURL(blob);
      this.thumb.src = url;
    });

    this.#elm.appendChild(this.thumb);

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

    if (!this.#shapes.length) return offcanvas.convertToBlob();

    const scale = Math.min(34 / docW, 26 / docH);
    ctx.save();
    ctx.scale(scale, scale);
    ctx.globalAlpha = this.#opacity / 100;
    for (const s of this.#shapes) s.draw(ctx, false);
    ctx.restore();

    return offcanvas.convertToBlob();
  }

  clone() {
    return new Layer(this.#name + " copy", {
      visible: this.#visible,
      opacity: this.#opacity,
      shapes: this.#shapes.map((s) => s.clone()),
      mergeHistory: this.#mergeHistory
        ? JSON.parse(JSON.stringify(this.#mergeHistory))
        : null,
    });
  }

  toJSON() {}

  static fromJSON(o) {}

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
  }

  render() {}
}

export { Layer };
