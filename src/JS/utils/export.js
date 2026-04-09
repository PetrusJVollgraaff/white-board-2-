import { createDOMElement } from "../display/model";

class ExportManager {
  static render({ layers, W, H }) {}

  static ExportPNG({ layers, W, H }) {
    const url = ExportManager.render().toDataURL("image/png");
    ExportManager.download(url, "drawing.png");
  }

  static ExportJPEG({ layers, W, H }) {
    const url = ExportManager.render().toDataURL("image/jpeg", 0.92);
    ExportManager.download(url, "drawing.jpeg");
  }

  static ExportSVG({ layers, W, H }) {
    const lines = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
      `<rect width="${W}" height="${H}" fill="white"/>`,
    ];

    lines.push("</svg>");
    const url = URL.createObjectURL(
      new Blob([lines.join("\n")], { type: "image/svg+xml" }),
    );
    ExportManager.download(url, "drawing.svg");
  }

  static SVGinner(s) {}

  static download(url, fn) {
    const attributes = { dowload: fn, href: url };
    const a = createDOMElement({ type: "a", attributes });
    a.click();
  }
}

export { ExportManager };
