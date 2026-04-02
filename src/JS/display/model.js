class Modal {
  constructor(options, callback = () => {}) {
    this.settings = {
      ...{
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
      },
      ...options,
    };
    this.callback = callback;
    this.#build();
    this.popupEl = null;

    this.OutsideClick = this.#outsideClickListener.bind(this);

    if (this.settings.autoOpen) {
      this.open();
    }
  }

  #build() {
    this.CtnDiv = createDOMElement({ attributes: { class: "modal_ctn" } });
    const InnerCtnDiv = createDOMElement({
      attributes: { class: "modal_innerctn" },
    });

    if (this.settings.title != "") {
      InnerCtnDiv.appendChild(
        createDOMElement({
          attributes: { class: "modal_headerctn" },
          text: this.settings.title,
        }),
      );
    }

    const ContentDiv = createDOMElement({
      attributes: { class: "content_ctn" },
    });
    const BtnDiv = createDOMElement({ attributes: { class: "btn_ctn" } });
    if (this.settings.customClass != undefined) {
      this.CtnDiv.classList.add(this.settings.customClass);
    }

    this.CtnDiv.appendChild(InnerCtnDiv);
    InnerCtnDiv.appendChild(ContentDiv);
    InnerCtnDiv.appendChild(BtnDiv);
  }

  #loadContent(fallback) {
    if (this?.popupEl) {
      var contentCtn = this.popupEl.getElementsByClassName("content_ctn");
      if (this.settings.content) {
        switch (typeof this.settings.content) {
          case "string":
            contentCtn[0].innerHTML = this.settings.content;
            break;
          case "object":
            contentCtn[0].appendChild(this.settings.content);
            break;
        }

        this.#loadButtons();

        if (typeof fallback == "function") fallback();
        this.#appendToBody();
      } else if (this.settings.ajaxUrl) {
        const request = !this.settings.ajaxData
          ? new Request(this.settings.ajaxUrl)
          : new Request(this.settings.ajaxUrl, {
              method: "POST",
              body: JSON.stringify(this.settings.ajaxData),
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
    var btnCtn = this.popupEl.getElementsByClassName("btn_ctn");
    if (
      this.settings?.buttons &&
      typeof this.settings?.buttons == "object" &&
      this.settings.buttons.length > 0
    ) {
      this.settings.buttons.forEach((btn) => {
        var button = createDOMElement({
          type: "button",
          attributes: { class: "modal_ctn" },
          text: btn?.title,
        });

        if (btn?.tooltip) {
          button.setAttribute("title", btn.tooltip);
        }
        if (btn?.form) {
          button.setAttribute("form", btn.form);
        }

        if (btn?.customClass) {
          button.classList.add(btn.customClass);
        }

        btnCtn[0].appendChild(button); //  insertAdjacentHTML("beforeend", buttonHTML);

        if (btn?.click)
          button.addEventListener("click", (evt) => {
            btn.click(this, evt);
          });
      });
    }
  }

  open() {
    if (this.settings.overlayer) {
      this.OverDiv = createDOMElement({
        attributes: {
          class: "modal_overlay",
          onclick:
            this.settings?.outsideClose && this.settings.overlayer
              ? this.OutsideClick
              : "",
        },
      });
      this.OverDiv.appendChild(this.CtnDiv);
      this.popupEl = this.OverDiv;
    } else {
      this.popupEl = this.CtnDiv;
      this.#EventListener();
    }

    this.#loadContent(() => {
      if (typeof this.settings.onOpen == "function") {
        this.settings.onOpen(this);
      }
    });
  }

  #appendToBody() {
    const body = document.getElementsByTagName("body");
    body[0].appendChild(this.popupEl);
  }

  disablebtn() {
    var btnCtn = this.popupEl.getElementsByClassName("btn_ctn");
    btnCtn[0].querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("disabled", true);
    });
  }

  enablebtn() {
    var btnCtn = this.popupEl.getElementsByClassName("btn_ctn");
    btnCtn[0].querySelectorAll("button").forEach((btn) => {
      btn.setAttribute("disabled", false);
    });
  }

  close() {
    if (this.settings?.onClose && typeof this.settings?.onClose == "function") {
      this.settings.onClose();
    }

    this.popupEl.remove();
  }

  #EventListener() {
    if (!this.settings.overlayer) {
      document.addEventListener("click", this.OutsideClick);
    }
  }

  #outsideClickListener(e) {
    if (!e.target.closest(".modal_ctn") && e.target != this.elem) {
      this.close();
    }
  }
}

class AlertPopup {
  constructor(options) {
    this.settings = {
      ...{
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
      },
      ...options,
    };
    this.popupEl = null;
    this.#build();
    this.open();
  }

  #build() {
    this.CtnDiv = createDOMElement({ attributes: { class: "alert_ctn" } });
    const InnerCtnDiv = createDOMElement({
      attributes: { class: "alert_innerctn" },
    });

    if (this.settings.title != "") {
      InnerCtnDiv.appendChild(
        createDOMElement({
          attributes: { class: "alert_headerctn" },
          text: this.settings.title,
        }),
      );
    }

    const ContentDiv = createDOMElement({
      attributes: { class: "content_ctn" },
    });
    const BtnDiv = createDOMElement({ attributes: { class: "btn_ctn" } });
    if (this.settings.customClass != undefined) {
      this.CtnDiv.classList.add(this.settings.customClass);
    }

    this.CtnDiv.appendChild(InnerCtnDiv);
    InnerCtnDiv.appendChild(ContentDiv);
    InnerCtnDiv.appendChild(BtnDiv);
  }

  #loadContent(fallback) {
    if (this?.popupEl) {
      var contentCtn = this.popupEl.getElementsByClassName("content_ctn");
      switch (typeof this.settings.content) {
        case "string":
          contentCtn[0].innerHTML = this.settings.content;
          break;
        case "object":
          contentCtn[0].appendChild(this.settings.content);
          break;
      }

      this.#loadButtons();

      if (typeof fallback == "function") fallback();
    }
  }

  #loadButtons() {
    var btnCtn = this.popupEl.getElementsByClassName("btn_ctn");
    if (
      this.settings?.buttons &&
      typeof this.settings?.buttons == "object" &&
      this.settings.buttons.length > 0
    ) {
      this.settings.buttons.forEach((btn) => {
        var button = createDOMElement({
          type: "button",
          attributes: { class: "modal_ctn" },
          text: btn?.title,
        });

        if (btn?.tooltip) {
          button.setAttribute("title", btn.tooltip);
        }
        if (btn?.form) {
          button.setAttribute("form", btn.form);
        }

        if (btn?.customClass) {
          button.classList.add(btn.customClass);
        }

        btnCtn[0].appendChild(button); //  insertAdjacentHTML("beforeend", buttonHTML);

        if (btn?.click)
          button.addEventListener("click", (evt) => {
            btn.click(this, evt);
          });
      });
    }
  }

  open() {
    const body = document.getElementsByTagName("body");
    if (this.settings.overlayer) {
      this.OverDiv = createDOMElement({
        attributes: {
          class: "alert_overlay",
          onclick:
            this.settings?.outsideClose && this.settings.overlayer
              ? this.OutsideClick
              : () => {},
        },
      });
      this.OverDiv.appendChild(this.CtnDiv);
      this.popupEl = this.OverDiv;
    } else {
      this.popupEl = this.CtnDiv;
    }

    body[0].appendChild(this.popupEl);
    this.popupEl.style.zIndex =
      10 + document.querySelectorAll(".modal_ctn, .alert_ctn").length;

    this.#loadContent(() => {
      if (typeof this.settings.onOpen == "function") {
        this.settings.onOpen(this);
      }
    });

    if (this.settings.autoClose) {
      setTimeout(() => {
        this.close();
      }, this.settings.timer);
    }
  }

  close() {
    if (this.settings?.onClose && typeof this.settings?.onClose == "function") {
      this.settings.onClose();
    }

    this.popupEl.remove();
  }
}
