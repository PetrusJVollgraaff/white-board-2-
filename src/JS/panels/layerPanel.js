import { createDOMElement } from "../display/model";

class LayerPanel {
  #elmP = null;
  #elm = null;
  #callback = () => {};
  constructor(elmP, callback) {
    this.#elmP = elmP;
    this.#callback = callback;

    this.#init();
  }

  #init() {
    this.#build();
    /*this.addBtn = this.#elmP.querySelector("#lp-add");
    this.dupBtn = this.#elmP.querySelector("#lp-dup");
    this.upBtn = this.#elmP.querySelector("#lp-up");
    this.downBtn = this.#elmP.querySelector("#lp-down");
    this.delBtn = this.#elmP.querySelector("#lp-del");

    this.layerList = this.#elmP.querySelector("#layer-list");
    this.OpInput = this.#elmP.querySelector("#lp-opacity");

    this.mergedownBtn = this.#elmP.querySelector("#btn-merge-down");
    this.mergetoBtn = this.#elmP.querySelector("#btn-merge-to");
    this.unmerge = this.#elmP.querySelector("#btn-unmerge");
    this.mergemodeBtn = this.#elmP.querySelector("#btn-merge-mode");
    this.mergecancelBtn = this.#elmP.querySelector("#btn-cancel-merge");
    this.flattenBtn = this.#elmP.querySelector("#btn-flatten");
    */
    this.#eventListener();
  }

  #buildTop() {
    const header = createDOMElement({ attributes: { id: "lp-header" } });
    const btnsCtn = createDOMElement({ attributes: { class: "lp-hbtns" } });

    header.appendChild(
      createDOMElement({
        type: "span",
        attributes: { id: "lp-header-title" },
        text: "Layers",
      }),
    );
    header.appendChild(btnsCtn);

    this.addBtn = createDOMElement({
      type: "button",
      attributes: { class: "lp-hbtn", title: "New Layer (Ctrl+Shift+N)" },
      text: "+",
    });
    this.dupBtn = createDOMElement({
      type: "button",
      attributes: { class: "lp-hbtn", title: "Duplicate Layer" },
      text: "⧉",
    });
    this.upBtn = createDOMElement({
      type: "button",
      attributes: { class: "lp-hbtn", title: "Move Layer Up" },
      text: "↑",
    });
    this.downBtn = createDOMElement({
      type: "button",
      attributes: { class: "lp-hbtn", title: "Move Layer Down" },
      text: "↓",
    });
    this.delBtn = createDOMElement({
      type: "button",
      attributes: { class: "lp-hbtn danger", title: "Delete Layer" },
      text: "✕",
    });

    btnsCtn.appendChild(this.addBtn);
    btnsCtn.appendChild(this.dupBtn);
    btnsCtn.appendChild(this.upBtn);
    btnsCtn.appendChild(this.downBtn);
    btnsCtn.appendChild(this.delBtn);

    this.#elm.appendChild(header);
  }

  #buildMiddle() {
    const optElm = createDOMElement({ attributes: { id: "lp-opacity-row" } });
    this.layerList = createDOMElement({ attributes: { id: "layer-list" } });
    this.OpInput = createDOMElement({
      type: "input",
      attributes: { type: "range", min: "0", max: "100", value: "100" },
    });

    optElm.appendChild(createDOMElement({ type: "label", text: "Opacity" }));
    optElm.appendChild(this.OpInput);
    optElm.appendChild(
      createDOMElement({
        type: "span",
        attributes: { id: "lp-opacity-val" },
        text: "100%",
      }),
    );

    this.#elm.appendChild(this.layerList);
    this.#elm.appendChild(optElm);
  }

  #buildBottom() {
    this.ActionElm = createDOMElement({ attributes: { id: "lp-actions" } });
    this.#elm.appendChild(this.ActionElm);

    this.mergedownBtn = createDOMElement({
      type: "button",
      attributes: { class: "lp-action-btn" },
      text: "⬇ Merge Down",
    });

    this.mergetoBtn = createDOMElement({
      type: "button",
      attributes: { class: "lp-action-btn" },
      text: "⊕ Merge Into…",
    });

    this.unmerge = createDOMElement({
      type: "button",
      attributes: { class: "lp-action-btn" },
      text: "↩ Unmerge Layer",
    });

    this.mergemodeBtn = createDOMElement({
      type: "button",
      attributes: { class: "lp-action-btn" },
      text: "⊞ Multi-Select Merge",
    });

    this.mergeSelectedBtn = createDOMElement({
      type: "button",
      attributes: { class: "lp-action-btn" },
      text: "✔ Merge Selected (0)",
    });

    this.mergecancelBtn = createDOMElement({
      type: "button",
      attributes: { class: "lp-action-btn" },
      text: "✕ Cancel",
    });

    this.flattenBtn = createDOMElement({
      type: "button",
      attributes: { class: "lp-action-btn danger" },
      text: "⊟ Flatten All Layers",
    });

    this.ActionElm.append(this.mergedownBtn);
    this.ActionElm.append(this.mergetoBtn);
    this.ActionElm.append(this.unmerge);
    this.ActionElm.append(this.mergemodeBtn);
    this.ActionElm.append(this.flattenBtn);
  }

  #build() {
    this.#elm = createDOMElement({ attributes: { id: "layer_ctn" } });
    this.#elmP.appendChild(this.#elm);

    this.#buildTop();
    this.#buildMiddle();
    this.#buildBottom();
  }

  #eventListener() {
    this.addBtn.addEventListener("click", () => {});
    this.dupBtn.addEventListener("click", () => {});
    this.upBtn.addEventListener("click", () => {});
    this.downBtn.addEventListener("click", () => {});
    this.delBtn.addEventListener("click", () => {});

    this.OpInput.addEventListener("change", () => {});

    this.mergedownBtn.addEventListener("click", () => {});
    this.mergetoBtn.addEventListener("click", () => {});
    this.unmerge.addEventListener("click", () => {});
    this.mergemodeBtn.addEventListener("click", () => {});
    this.mergecancelBtn.addEventListener("click", () => {});
    this.flattenBtn.addEventListener("click", () => {});
  }
}

export { LayerPanel };
