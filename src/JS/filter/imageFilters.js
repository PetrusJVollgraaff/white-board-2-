onmessage = function (evt) {
  const { data } = evt;
  const { imageData, filters, size } = data;
  const { width, height } = size;

  const offscreen = new OffscreenCanvas(width, height);
  const gl = offscreen.getContext("webgl");

  newImageData = applyFilters(gl, filters, imageData);

  // Get the filtered image data and send it back
  postMessage(newImageData);
};

class ImageProcessor {
  static VERT_SRC = `
    attribute vec2 a_pos;
    attribute vec2 a_uv;
    attribute vec2 v_uv;
    void main(){
      gl_Position = vec4(a_pos, 0.0, 1.0);
      v_uv = a_uv;
    }
  `;

  static FRAG_SRC = `
        precision highp float;
        uniform sampler2D uImage;

        uniform float uBrightness;
        uniform float uContrast;

        uniform float uRed;
        uniform float uGreen;
        uniform float uBlue;

        uniform float uGamma;
        uniform float uOpacity;
        uniform int uColorMode;

        varying vec2 vTextCoord
        
        void main() {
            vec4 color = texture2D(uImage,vTexCoord);

            //Color Modes

            if(uColorMode == 1){
              float g = dot(color.rgb, vec3(.299,.587,.114));
            }else if(uColorMode == 2){
              color.rgb=vec3(
                dot(color.rgb,vec3(.393,.769,.189)),
                dot(color.rgb,vec3(.349,.686,.168)),
                dot(color.rgb,vec3(.272,.534,.131)),
              )'
            }else if(uColorMode == 3){
              color.rgb=1.0-color.rgb;
            }


            // RGB

            color.r *= uRed;
            color.g *= uGreen;
            color.b *= uBlue;
            
            // Brightness

            color.rgb *= uBrightness;

            // Contrast

            color.rgb = (color.rgb-.5 * uContrast+.5);

            // Gamma

            color.rgb = pow(color.rgb, vec3(1.0 / uGamma));


            // Opacity
            color.a *= uOpacity;

            gl_FragColor = color;
        }
    `;

  constructor() {
    this._gl = null;
    this._prog = null;
    this._glCanvas = null;
    this._locs = {};
    this._textCache = new Map();
    this._ready = false;
    this._failed = false;
  }

  process(img, adj) {
    if (this._failed) return null;
    if (!this._init()) return null;

    const gl = this._gl;
    const { naturalWidth: W, naturalHeight: H } = img;

    if (this._glCanvas.width !== W || this._glCanvas.height !== H) {
      this._glCanvas.width = W;
      this._glCanvas.height = H;
      gl.viewport(0, 0, W, H);
    }

    this._bindTexture(img);

    const modeMap = { normal: 0, grayscale: 1, sepia: 2, invert: 3 };
    const L = this._locs;
    gl.uniformli(L.tex, 0);
    gl.uniformlf(L.brightness, (adj.brightness ?? 100) / 100);
    gl.uniformlf(L.contrast, (adj.contrast ?? 100) / 100);
    gl.uniformlf(L.red, (adj.red ?? 100) / 100);
    gl.uniformlf(L.green, (adj.green ?? 100) / 100);
    gl.uniformlf(L.blue, (adj.blue ?? 100) / 100);
    gl.uniformlf(L.gamma, 1.0 / Math.max(0.01, (adj.gamma ?? 100) / 100));
    gl.uniformli(L.mode, modeMap[adj.colorMode ?? "normal"] ?? 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    const result = document.createElement("canvas");
    result.width = W;
    result.height = H;
    result.getContext("2d").drawImage(this._glCanvas, 0, 0);
    return result;
  }

  get available() {
    return !this._failed && this._init();
  }

  _init() {
    if (this._ready) return true;
    if (this._failed) return false;

    try {
      const canvas = document.createElement("canvas");

      // preserveDrawingBuffer lets us read pixels after drawArrays completes
      const gl = canvas.getContext("webgl", {
        preserveDrawingBuffer: true,
        premultipliedAlpha: false,
        antialias: false,
      });
      if (!gl) throw new Error("WebGL not supported");

      // Compile vertex + fragment shaders
      const vert = this._compile(gl, gl.VERTEX_SHADER, ImageProcessor.VERT_SRC);
      const frag = this._compile(
        gl,
        gl.FRAGMENT_SHADER,
        ImageProcessor.FRAG_SRC,
      );

      const prog = gl.createProgram();
      gl.attachShader(prog, vert);
      gl.attachShader(prog, frag);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        throw new Error("Program link: " + gl.getProgramInfoLog(prog));

      gl.useProgram(prog);

      // Full-screen clip-space quad: positions + UV coords interleaved
      // 2 triangles covering [-1,-1]→[1,1]  with UV [0,0]→[1,1]
      const verts = new Float32Array([
        -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1,
        0, 1,
      ]);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

      const stride = 4 * 4; // 4 floats × 4 bytes
      const aPos = gl.getAttribLocation(prog, "a_pos");
      const aUV = gl.getAttribLocation(prog, "a_uv");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(aUV);
      gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, stride, 8);

      // Cache uniform locations
      this._locs = {
        tex: gl.getUniformLocation(prog, "u_tex"),
        brightness: gl.getUniformLocation(prog, "u_brightness"),
        contrast: gl.getUniformLocation(prog, "u_contrast"),
        red: gl.getUniformLocation(prog, "u_red"),
        green: gl.getUniformLocation(prog, "u_green"),
        blue: gl.getUniformLocation(prog, "u_blue"),
        gamma: gl.getUniformLocation(prog, "u_gamma"),
        mode: gl.getUniformLocation(prog, "u_mode"),
      };

      // Activate texture unit 0 once — never changes
      gl.activeTexture(gl.TEXTURE0);

      this._glCanvas = canvas;
      this._gl = gl;
      this._prog = prog;
      this._ready = true;
      console.log("[WebGLImageProcessor] Initialised — GPU processing active");
      return true;
    } catch (err) {
      console.warn("[WebGLImageProcessor] Falling back to CPU:", err.message);
      this._failed = true;
      return false;
    }
  }

  _bindTexture(img) {
    const gl = this._gl;
    let tex = this._textCache.get(imageID);

    if (!tex) {
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
      this._textCache.set(imageID, tex);
    } else {
      gl.bindTexture(gl.TEXTURE_2D, tex);
    }
  }

  _compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error("Shader: " + gl.getShaderInfoLog(s));

    return s;
  }
}
