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

function loadTexture(gl, imageData) {
  // Create a WebGL texture and bind the image data to it
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Use a placeholder for the texture (can be your image data)
  const level = 0,
    internalFormat = gl.RGBA,
    format = gl.RGBA,
    type = gl.UNSIGNED_BYTE;
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, format, type, imageData);

  // Define the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // Return the created texture
  return texture;
}

function applyFilters(gl, filters, imageData) {
  // Apply each filter based on the filter options
  if (filters.mode == "grayscale") {
    loadTexture(gl, imageData);
    applyGrayscale(gl);
    imageData = getImageDataFromWebGL(gl);
  } else if (filters.mode == "black/white") {
    loadTexture(gl, imageData);
    applyBlackAndWhite(gl);
    imageData = getImageDataFromWebGL(gl);
  } else if (filters.mode == "watermark") {
    loadTexture(gl, imageData);
    //applyWatermark(gl, filters.watermark);
    imageData = getImageDataFromWebGL(gl);
  }

  loadTexture(gl, imageData);
  applyTestFilters(gl, filters);
  return getImageDataFromWebGL(gl);

  //loadTexture(gl, imageData);
  //applyRGBAdjustment(gl, filters.rgb);
  //imageData = getImageDataFromWebGL(gl);

  //loadTexture(gl, imageData);
  //applyTransparency(gl, filters.opacity);
  //imageData = getImageDataFromWebGL(gl);

  //loadTexture(gl, imageData);
  //applyBrightness(gl, filters.brightness);
  //imageData = getImageDataFromWebGL(gl);

  //loadTexture(gl, imageData);
  //applyContrast(gl, filters.contrast);
  //imageData = getImageDataFromWebGL(gl);

  //loadTexture(gl, imageData);
  //applyGammaCorrection(gl, filters.gamma);
  //imageData = getImageDataFromWebGL(gl);
}

function applyGrayscale(gl) {
  const fragmentShaderSource = `
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_texture;
        
        void main() {
            vec4 color = texture2D(u_texture, v_texCoord);
            float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            gl_FragColor = vec4(vec3(gray), color.a);
        }
    `;
  createAndApplyShader(gl, fragmentShaderSource);
}

function applyBlackAndWhite(gl) {
  const fragmentShaderSource = `
        precision mediump float;
        varying vec2 v_texCoord;
        uniform sampler2D u_texture;
        
        void main() {
            vec4 color = texture2D(u_texture, v_texCoord);
            float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
            if (gray > 0.5) {
                gray = 1.0;
            } else {
                gray = 0.0;
            }
            gl_FragColor = vec4(vec3(gray), color.a);
        }
    `;
  createAndApplyShader(gl, fragmentShaderSource);
}

function applyWatermark(gl, text) {
  // You can overlay text using another texture or by modifying the fragment shader
  // Placeholder code for overlaying text
  console.log("Applying watermark:", text);
  applyTransparency(gl, 50);
}

function applyTestFilters(gl, filters) {
  const fragmentShaderSource = `
        precision mediump float;
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
}

function applyBlur(gl, blurRadius) {
  const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_texture;
      uniform float u_blurRadius;
      
      // Blur in 9 directions
      void main() {
          vec4 sum = vec4(0.0);
          float offset = u_blurRadius / 100.0;

          sum += texture2D(u_texture, v_texCoord + vec2(-offset, -offset)) * 0.111;
          sum += texture2D(u_texture, v_texCoord + vec2( offset, -offset)) * 0.111;
          sum += texture2D(u_texture, v_texCoord + vec2(-offset,  offset)) * 0.111;
          sum += texture2D(u_texture, v_texCoord + vec2( offset,  offset)) * 0.111;
          sum += texture2D(u_texture, v_texCoord + vec2(0.0, -offset)) * 0.111;
          sum += texture2D(u_texture, v_texCoord + vec2(0.0,  offset)) * 0.111;
          sum += texture2D(u_texture, v_texCoord + vec2(-offset, 0.0)) * 0.111;
          sum += texture2D(u_texture, v_texCoord + vec2( offset, 0.0)) * 0.111;
          sum += texture2D(u_texture, v_texCoord) * 0.111;

          gl_FragColor = sum;
      }
  `;
  createAndApplyShader(gl, fragmentShaderSource, { u_blurRadius: blurRadius });
}

function createAndApplyShader(gl, fragmentShaderSource, uniforms = {}) {
  const vertexShaderSource = `
        attribute vec4 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        
        void main() {
            gl_Position = a_position;
            v_texCoord = a_texCoord;
        }
    `;

  // Create, compile, and link shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  const program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  // Set up vertices and texture coordinates
  const positionLocation = gl.getAttribLocation(program, "a_position");
  const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  const texCoords = [0, 0, 1, 0, 0, 1, 1, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // Set the texture uniform
  const textureLocation = gl.getUniformLocation(program, "u_texture");
  gl.uniform1i(textureLocation, 0); // Use texture unit 0

  // Set additional uniforms
  for (const [name, value] of Object.entries(uniforms)) {
    const location = gl.getUniformLocation(program, name);
    if (Array.isArray(value)) {
      gl.uniform3fv(location, value);
    } else {
      gl.uniform1f(location, value);
    }
  }

  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Error linking program:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function getImageDataFromWebGL(gl) {
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  return new ImageData(new Uint8ClampedArray(pixels), width, height);
}
