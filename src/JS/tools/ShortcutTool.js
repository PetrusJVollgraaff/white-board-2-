class ShortCutTool {
  static Shortcuts = [];

  static handleShortCutKeysPress(e) {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if (this.isShortcut(e.ctrlKey, e.key)) {
      this.executeShortcut(e.ctrlKey, e.key);
      e.preventDefault();
    }
  }

  static isShortcut(ctrl, k_down) {
    return this.shortcuts.find((s) => s.k_down === k_down && s.ctrl === ctrl);
  }

  static executeShortcut(ctrl, k_down) {
    const shortcut = this.isShortcut(ctrl, k_down);
    if (shortcut) shortcut.action();
  }
}

export { ShortCutTool };
