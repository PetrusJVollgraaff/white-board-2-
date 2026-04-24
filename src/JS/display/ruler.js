class RulerRenderer {
  #hrulerElm = null;
  #vrulerElm = null;
  #hrulerCtx = null;
  #vrulerCtx = null;
  constructor(hRulerElm, vRulerElm) {
    this.#hrulerElm = hRulerElm;
    this.#vrulerElm = vRulerElm;

    this.#hrulerCtx = this.#hrulerElm.getContext("2d");
    this.#vrulerCtx = this.#vrulerElm.getContext("2d");
  }

  /** */
  syncSizes(StageProperties) {
    const { width, height } = StageProperties;
    this.#hrulerElm.width = width;
    this.#hrulerElm.height = 22;
    this.#vrulerElm.width = 22;
    this.#vrulerElm.height = height;
  }

  draw(viewport, StageProperties) {
    const zoom = viewport.getZoom;
    const { offset, size } = StageProperties;

    this.#drawH(offset.x, zoom, size.w);
    this.#drawV(offset.y, zoom, size.h);
  }

  #tickStep(zoom) {
    const steps = [
      1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000,
    ];
    for (const s of steps) if (s * zoom >= 40) return { step: s, sub: s / 5 };
    return { step: 5000, sub: 1000 };
  }

  #clearCtx(ctx, { width, height }, { x, y, w, h }) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#5d5d5d";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#ffffff";
  }

  #ctxFont(ctx, pos) {
    ctx.font = "9px monospace";
    ctx.textBaseline = pos;
  }

  #ctxFillRect(ctx, { x, y, w, h }) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, w, h);
  }

  #ctxText(ctx, { v1, v2 = 0, v3 = 0 }) {
    ctx.fillStyle = "#ffffff";
    ctx.fillText(v1, v2, v3);
  }

  #drawH(x, z, size) {
    const { width, height } = this.#hrulerElm;
    const { step, sub } = this.#tickStep(z);
    const ws = -x / z;
    const we = (width - x) / z;

    this.#clearCtx(
      this.#hrulerCtx,
      { width, height },
      { x, y: 0, w: size * z, h: height },
    );

    for (let w = Math.floor(ws / sub) * sub; w <= we + sub; w += sub) {
      const sx = Math.round(x + w * z);
      if (sx < 0 || sx > width) continue;
      this.#hrulerCtx.fillRect(sx, height - 4, 1, 4);
    }

    this.#ctxFont(this.#hrulerCtx, "top");
    for (let w = Math.floor(ws / step) * step; w <= we + step; w += step) {
      const sx = Math.round(x + w * z);
      if (sx < -20 || sx > width + 20) continue;
      this.#ctxFillRect(this.#hrulerCtx, {
        x: sx,
        y: height - 10,
        w: 1,
        h: 10,
      });
      this.#ctxText(this.#hrulerCtx, {
        v1: String(Math.round(w)),
        v2: sx + 2,
        v3: 1,
      });
    }
  }

  #drawV(y, z, size) {
    const { width, height } = this.#vrulerElm;
    const { step, sub } = this.#tickStep(z);
    const ws = -y / z;
    const we = (height - y) / z;

    this.#clearCtx(
      this.#vrulerCtx,
      { width, height },
      { x: 0, y, w: width, h: size * z },
    );

    for (let w = Math.floor(ws / sub) * sub; w <= we + sub; w += sub) {
      const sy = Math.round(y + w * z);
      if (sy < 0 || sy > height) continue;
      this.#vrulerCtx.fillRect(width - 4, sy, 4, 1);
    }

    this.#ctxFont(this.#vrulerCtx, "middle");
    for (let w = Math.floor(ws / step) * step; w <= we + step; w += step) {
      const sy = Math.round(y + w * z);
      if (sy < -20 || sy > height + 20) continue;
      this.#ctxFillRect(this.#vrulerCtx, { x: width - 10, y: sy, w: 10, h: 1 });
      this.#vrulerCtx.save();
      this.#vrulerCtx.translate(width - 12, sy);
      this.#vrulerCtx.rotate(-Math.PI / 2);
      this.#ctxText(this.#vrulerCtx, { v1: String(Math.round(w)) });
      this.#vrulerCtx.restore();
    }
  }
}

export { RulerRenderer };
