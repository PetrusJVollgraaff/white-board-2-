class DataReader {
  static BitmapToUint8ClampedArray(imageBitmap, size) {
    const offscreen = DataReader.BitmapToCanvas(imageBitmap, size);
    // Get the ImageData object containing the pixel data
    const imageData = offscreen.ctx.getImageData(0, 0, size.width, size.height);
    // Extract the Uint8ClampedArray (pixel data)
    return imageData;
  }

  static BitmapToCanvas(imageBitmap, size) {
    const canvas = new OffscreenCanvas(size.width, size.height);
    const offscreen = { canvas, ctx: canvas.getContext("2d") };

    // Draw the ImageBitmap onto the canvas
    offscreen.ctx.drawImage(imageBitmap, 0, 0, size.width, size.height);

    return offscreen;
  }

  static async uint8ClampedArrayToImageBitmap(pixelData, size) {
    const offscreen = DataReader.uint8ClampedArrayToCanvas(pixelData, size);

    // Convert the canvas back to an ImageBitmap
    return await createImageBitmap(offscreen.canvas);
  }

  static uint8ClampedArrayToCanvas(pixelData, size) {
    const canvas = new OffscreenCanvas(size.width, size.height);
    const offscreen = { canvas, ctx: canvas.getContext("2d") };

    offscreen.ctx.putImageData(pixelData, 0, 0);

    // Convert the canvas back to an ImageBitmap
    return offscreen;
  }

  static createImageData(size, data) {
    let imageData = new ImageData(size.width, size.height);

    imageData.data.set(data);
    return imageData;
  }

  static base64ToBlob(base64Data, contentType = "") {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  static base64ToUint8Array(base64Data) {
    const raw = atob(base64Data);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));

    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }

    return array;
  }

  static base64ToUint8ClampedArray(base64) {
    // Decode base64 to a binary string
    let binaryString = atob(base64);

    // Get the length of the binary string
    let len = binaryString.length;

    // Create a Uint8ClampedArray with the same length
    let uint8ClampedArray = new Uint8ClampedArray(len);

    // Assign binary data to the Uint8ClampedArray
    for (let i = 0; i < len; i++) {
      uint8ClampedArray[i] = binaryString.charCodeAt(i);
    }

    return uint8ClampedArray;
  }

  static setImageData(img) {
    const { data, width, height } = img;
    return DataReader.createImageData({ width, height }, data);
  }
}

export { DataReader };
