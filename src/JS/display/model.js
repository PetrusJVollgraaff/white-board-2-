class Modal {
  #settings = {
    ajaxData: null,
    ajaxUrl: null,
    title: "Modal",
    buttons: null,
    content: null,
    customClass: null,
    outsideClose: true,
    onClose: null,
    onOpen: null,
    width: 150,
    height: 100,
    autoOpen: true,
    overlayer: true,
  };

  #popupEl = null;
  constructor(options, callback = () => {}) {
    this.#settings = {
      ...this.#settings,
      ...options,
    };
    this.callback = callback;
    this.#build();

    this.OutsideClick = this.#outsideClickListener.bind(this);

    if (this.#settings.autoOpen) {
      this.open();
    }
  }

  #build() {
    this.CtnDiv = createDOMElement({ attributes: { class: "modal_ctn" } });
    const InnerCtnDiv = createDOMElement({
      attributes: { class: "modal_innerctn" },
    });

    if (this.#settings.title != "") {
      InnerCtnDiv.appendChild(
        createDOMElement({
          attributes: { class: "modal_headerctn" },
          text: this.#settings.title,
        }),
      );
    }

    const ContentDiv = createDOMElement({
      attributes: { class: "content_ctn" },
    });
    const { customClass } = this.#settings;
    const BtnDiv = createDOMElement({ attributes: { class: "btn_ctn" } });
    if (customClass) this.CtnDiv.classList.add(customClass);

    this.CtnDiv.appendChild(InnerCtnDiv);
    InnerCtnDiv.appendChild(ContentDiv);
    InnerCtnDiv.appendChild(BtnDiv);
  }

  #loadContent(fallback) {
    if (this.#popupEl) {
      const { content, ajaxUrl, ajaxData } = this.#settings;
      var contentCtn = this.#popupEl.getElementsByClassName("content_ctn");
      if (content) {
        switch (typeof content) {
          case "string":
            contentCtn[0].innerHTML = content;
            break;
          case "object":
            contentCtn[0].appendChild(content);
            break;
        }

        this.#loadButtons();

        if (typeof fallback == "function") fallback();
        this.#appendToBody();
      } else if (ajaxUrl) {
        const request = !ajaxData
          ? new Request(ajaxUrl)
          : new Request(ajaxUrl, {
              method: "POST",
              body: JSON.stringify(ajaxData),
              headers: {
                //"Content-Type": "application/x-www-form-urlencoded ",
                "Content-Type": "application/json",
              },
            });

        fetch(request)
          .then(async (response) => {
            if (response.ok) {
              return response.text();
            }

            const data = await response.json();

            // Create error manually and attach custom data
            const error = new Error(`Response status: ${response.status}`);
            error.data = data; // 👈 custom property
            throw error;
          })
          .then((response) => {
            contentCtn[0].innerHTML = response;
            this.#loadButtons();

            if (typeof fallback == "function") fallback();
            this.#appendToBody();
          })
          .catch((err) => {
            console.error(err.message);
            this.callback(err.data);
          });
      }
    }
  }

  #loadButtons() {
    const { buttons } = this.settings;
    var btnCtn = this.#popupEl.getElementsByClassName("btn_ctn");
    if (buttons && typeof buttons == "object" && buttons.length > 0) {
      buttons.forEach((btn) => {
        const { title, tooltip, form, customClass, click } = btn;

        var button = createDOMElement({
          type: "button",
          attributes: { class: "modal_ctn" },
          text: title,
        });

        if (tooltip) button.setAttribute("title", tooltip);
        if (form) button.setAttribute("form", form);
        if (customClass) button.classList.add(customClass);

        btnCtn[0].appendChild(button); //  insertAdjacentHTML("beforeend", buttonHTML);

        if (click)
          button.addEventListener("click", (evt) => {
            click(this, evt);
          });
      });
    }
  }

  open() {
    const { overlayer, OutsideClick } = this.#settings;
    if (overlayer) {
      this.OverDiv = createDOMElement({
        attributes: {
          class: "modal_overlay",
          onclick: outsideClose && overlayer ? this.OutsideClick : "",
        },
      });
      this.OverDiv.appendChild(this.CtnDiv);
      this.#popupEl = this.OverDiv;
    } else {
      this.#popupEl = this.CtnDiv;
      this.#EventListener();
    }

    this.#loadContent(() => {
      const { onOpen } = this.#settings;
      if (typeof onOpen == "function") onOpen(this);
    });
  }

  #appendToBody() {
    const body = document.getElementsByTagName("body");
    body[0].appendChild(this.#popupEl);
  }

  disablebtn() {
    var btnCtn = this.#popupEl.getElementsByClassName("btn_ctn");
    btnCtn[0].querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("disabled", true);
    });
  }

  enablebtn() {
    var btnCtn = this.#popupEl.getElementsByClassName("btn_ctn");
    btnCtn[0].querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("disabled", false);
    });
  }

  close() {
    const { onClose } = this.#settings;
    if (onClose && typeof onClose == "function") onClose();
    this.#popupEl.remove();
  }

  #EventListener() {
    const { overlayer } = this.#settings;
    if (!overlayer) document.addEventListener("click", this.OutsideClick);
  }

  #outsideClickListener(e) {
    if (!e.target.closest(".modal_ctn") && e.target != this.elem) {
      this.close();
    }
  }
}

class AlertPopup {
  #settings = {
    title: "Alert",
    buttons: [
      {
        title: "Cancel",
        click: (modal) => {
          modal.close();
        },
      },
    ],
    content: null,
    customClass: null,
    outsideClose: false,
    onClose: null,
    onOpen: null,
    width: 150,
    height: 100,
    autoOpen: true,
    overlayer: false,
    position: "center",
    autoClose: false,
    timer: 1000,
  };
  #popupEl = null;
  constructor(options) {
    this.#settings = {
      ...this.#settings,
      ...options,
    };

    this.#build();
    this.open();
  }

  #build() {
    this.CtnDiv = createDOMElement({ attributes: { class: "alert_ctn" } });
    const InnerCtnDiv = createDOMElement({
      attributes: { class: "alert_innerctn" },
    });

    if (this.#settings.title != "") {
      InnerCtnDiv.appendChild(
        createDOMElement({
          attributes: { class: "alert_headerctn" },
          text: this.#settings.title,
        }),
      );
    }

    const ContentDiv = createDOMElement({
      attributes: { class: "content_ctn" },
    });
    const BtnDiv = createDOMElement({ attributes: { class: "btn_ctn" } });
    if (this.#settings?.customClass) {
      this.CtnDiv.classList.add(this.#settings.customClass);
    }

    this.CtnDiv.appendChild(InnerCtnDiv);
    InnerCtnDiv.appendChild(ContentDiv);
    InnerCtnDiv.appendChild(BtnDiv);
  }

  #loadContent(fallback) {
    if (!this.#popupEl) return;
    const { content } = this.#settings;
    var contentCtn = this.#popupEl.getElementsByClassName("content_ctn");
    switch (typeof content) {
      case "string":
        contentCtn[0].innerHTML = content;
        break;
      case "object":
        contentCtn[0].appendChild(content);
        break;
    }

    this.#loadButtons();

    if (typeof fallback == "function") fallback();
  }

  #loadButtons() {
    const { buttons } = this.#settings;
    var btnCtn = this.#popupEl.getElementsByClassName("btn_ctn");
    if (buttons && typeof buttons == "object" && buttons.length > 0) {
      buttons.forEach((btn) => {
        const { title, tooltip, form, customClass, click } = btn;

        var button = createDOMElement({
          type: "button",
          attributes: { class: "modal_ctn" },
          text: title,
        });

        if (tooltip) button.setAttribute("title", tooltip);
        if (form) button.setAttribute("form", form);
        if (customClass) button.classList.add(customClass);

        btnCtn[0].appendChild(button); //  insertAdjacentHTML("beforeend", buttonHTML);

        if (typeof click == "function")
          button.addEventListener("click", (evt) => {
            click(this, evt);
          });
      });
    }
  }

  open() {
    const { overlayer, outsideClose, onOpen, autoClose, timer } =
      this.#settings;
    const body = document.getElementsByTagName("body");
    if (overlayer) {
      this.OverDiv = createDOMElement({
        attributes: {
          class: "alert_overlay",
          onclick: outsideClose && overlayer ? this.OutsideClick : () => {},
        },
      });
      this.OverDiv.appendChild(this.CtnDiv);
      this.#popupEl = this.OverDiv;
    } else {
      this.#popupEl = this.CtnDiv;
    }

    body[0].appendChild(this.#popupEl);
    this.#popupEl.style.zIndex =
      10 + document.querySelectorAll(".modal_ctn, .alert_ctn").length;

    this.#loadContent(() => {
      if (typeof onOpen == "function") {
        onOpen(this);
      }
    });

    if (autoClose) {
      setTimeout(() => {
        this.close();
      }, timer);
    }
  }

  close() {
    const { onClose } = this.#settings;
    if (onClose && typeof onClose == "function") onClose();
    this.#popupEl.remove();
  }
}

/** Create a DOM Element
 * @param {string} type - Type of DOM element, eg. 'div', 'input', etc...
 * @param {Array<{ key: string, value: string }>} attributes - Attributes of the element, eg. 'onchange', 'title', etc...
 * @param {string} text - Text for inside the element
 * @returns {HTMLElement} - The created DOM element.
 */
function createDOMElement(
  { type = "div", attributes = null, text = null } = { type: "div" },
) {
  const element = document.createElement(type);
  if (text) element.innerText = text;

  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (key.indexOf("on") !== 0) element.setAttribute(key, value);
      //element.addEventListener(key.substring(2), value);
    });
  }
  return element;
}

async function fetchWithProgress(url, options, onProgress) {
  const response = await fetch(url, options);

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  // Get total size if server sent Content-Length
  const contentLength = response.headers.get("Content-Length");
  if (!contentLength)
    console.warn("No Content-Length header, cannot show accurate progress");

  const reader = response.body.getReader();
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let received = 0;
  let chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    received += value.length;

    if (total) {
      const percent = Math.round((received / total) * 100);
      onProgress(percent);
    } else {
      // If no total size, just pulse from 0-90%
      const percent = Math.min(90, Math.round(received / 1000));
      onProgress(percent);
    }
  }

  // Reconstruct body
  const fullBody = new Uint8Array(received);
  let position = 0;
  for (let chunk of chunks) {
    fullBody.set(chunk, position);
    position += chunk.length;
  }

  return new TextDecoder().decode(fullBody);
}
