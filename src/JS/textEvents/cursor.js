import { TextShape } from "../shapes/text/shape";

class TextCursor {
  static textShape = null;
  static index = 0;
  static lineIndex = 0;
  static IntervalId = null;
  static viewport = null;

  static enterEditMode(textShape, index, lineIndex, main) {
    TextCursor.textShape = textShape;
    TextCursor.index = index;
    TextCursor.lineIndex = lineIndex;
    TextCursor.viewport = main;

    TextCursor.disableKeyPressListeners();
    TextCursor.addEventListeners();

    TextCursor.startCursorBlink();
  }

  static addEventListeners() {
    document.addEventListener("keydown", TextCursor.handleKeyPress);
  }

  static disableKeyPressListeners() {
    //document.removeEventListener("keydown", handleShortCutKeysPress);
  }

  static restoreKeyPressListeners() {
    //document.addEventListener("keydown", handleShortCutKeysPress);
  }

  static handleKeyPress(e) {
    let { textShape, index, lineIndex, viewport } = TextCursor;
    let lines = textShape.parseText();
    let line = lines[lineIndex];

    switch (e.key) {
      case "CapsLock":
      case "Escape":
      case "Control":
      case "Shift":
        return;
      case "ArrowUp":
        if (lineIndex > 0) {
          lineIndex--;
          index = Math.min(index, lines[lineIndex].length);
        }
        break;

      case "ArrowDown":
        if (lineIndex < lines.length - 1) {
          lineIndex++;
          index = Math.min(index, lines[lineIndex].length);
        }
        break;

      case "ArrowLeft":
        if (index > -1) {
          index--;
        } else if (lineIndex > 0) {
          lineIndex--;
          index = lines[lineIndex].length - 1;
        }
        break;

      case "ArrowRight":
        if (index < line.length - 1) {
          index++;
        } else if (lineIndex < lines.length - 1) {
          lineIndex++;
          index = -1;
        }
        break;

      case "Backspace":
        if (index > -1) {
          line = line.slice(0, index) + line.slice(index + 1);
          lines[lineIndex] = line;
          index--;
        } else if (lineIndex > 0) {
          let previousLineLength = lines[lineIndex - 1].length;
          lines[lineIndex - 1] += line;
          lines.splice(lineIndex, 1);
          lineIndex--;
          index = previousLineLength - 1;
        }
        textShape.setText(lines.join("\n"));
        break;

      case "Delete":
        if (index + 1 < line.length) {
          line = line.slice(0, index + 1) + line.slice(index + 2);
          lines[lineIndex] = line;
        } else if (lineIndex < lines.length - 1) {
          lines[lineIndex] += lines[lineIndex + 1];
          lines.splice(lineIndex + 1, 1);
        }
        textShape.setText(lines.join("\n"));
        break;

      case "Enter":
        line = line.slice(0, index + 1) + "\n" + line.slice(index + 1);
        lines[lineIndex] = line;
        index = -1;
        lineIndex++;
        textShape.setText(lines.join("\n"));
        break;

      default:
        let keyPressedValue = e.key;
        line =
          line.slice(0, index + 1) + keyPressedValue + line.slice(index + 1);
        index++;
        lines[lineIndex] = line;
        textShape.setText(lines.join("\n"));
        break;
    }

    viewport.ShapeCallback({
      event: { name: "shapesChange", detail: { shape: textShape, save: true } },
    });
  }

  static stopEditMode() {
    if (!TextCursor.IntervalId) {
      return;
    }
    clearInterval(TextCursor.IntervalId);
    TextCursor.IntervalId = null;
    TextCursor.textShape = null;
    TextCursor.index = 0;
    TextCursor.lineIndex = 0;
    TextCursor.restoreKeyPressListeners();
    document.removeEventListener("keydown", TextCursor.handleKeyPress);
  }

  static startCursorBlink() {
    const { viewport, getCursor } = TextCursor;

    let tick = 0;
    TextCursor.IntervalId = setInterval(() => {
      tick % 2 === 0 ? viewport.render([getCursor()]) : viewport.render();
      tick++;
    }, 300);
  }

  static getCursor() {
    const { textShape, index, lineIndex } = TextCursor;

    let lines = textShape.parseText();
    let line = lines[lineIndex];
    let cursor = new TextShape({ center: textShape.center });
    cursor.properties = JSON.parse(JSON.stringify(textShape.getTextProperties));
    cursor.rotation = textShape.rotation;

    let textWithCursor = "";
    let leftPadding = textShape.getPaddingSize("", line.slice(0, +1));
    let rightPadding = textShape.getPaddingSize("", line.slice(index + 1));

    for (let i = 0; i < lines.length; i++) {
      if (i === lineIndex) {
        textWithCursor +=
          makeSpace(leftPadding) + "|" + makeSpace(rightPadding);
      }
      if (i !== lines.length - 1) textWithCursor += "\n";
    }
    cursor.setText(textWithCursor, false);
    return cursor;
  }
}

function makeSpace(length) {
  let str = "";
  for (let i = 0; i < length; i++) {
    str += String.fromCharCode(8202); // append thin space
  }
  return str;
}

export { TextCursor };
