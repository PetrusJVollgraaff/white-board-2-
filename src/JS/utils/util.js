class ControlFlow {
  // 🔁 Debounce
  static debounce(fn, delay = 300, immediate = false) {
    let timeout;

    return function (...args) {
      const callNow = immediate && !timeout;

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) fn.apply(this, args);
      }, delay);

      if (callNow) fn.apply(this, args);
    };
  }

  // ⚡ Throttle
  static throttle(fn, limit = 300) {
    let inThrottle = false;

    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;

        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // 🎬 requestAnimationFrame throttle
  static rafThrottle(fn) {
    let ticking = false;

    return function (...args) {
      if (!ticking) {
        requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
        ticking = true;
      }
    };
  }

  // ⏳ Idle callback (with fallback)
  static idle(fn, timeout = 1000) {
    if ("requestIdleCallback" in window) {
      return requestIdleCallback(fn, { timeout });
    } else {
      return setTimeout(fn, timeout);
    }
  }

  // 🧵 Batch processing
  static batch(processFn, delay = 1000) {
    let queue = [];

    setInterval(() => {
      if (queue.length) {
        processFn(queue);
        queue = [];
      }
    }, delay);

    return function (item) {
      queue.push(item);
    };
  }

  // 🛑 Mutex / Lock (async-safe)
  static lock(fn) {
    let isRunning = false;

    return async function (...args) {
      if (isRunning) return;
      isRunning = true;

      try {
        return await fn.apply(this, args);
      } finally {
        isRunning = false;
      }
    };
  }

  // 🔄 Abortable fetch helper
  static abortableFetch() {
    let controller;

    return async function (url, options = {}) {
      if (controller) controller.abort();

      controller = new AbortController();

      try {
        const res = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        return await res.json();
      } catch (err) {
        if (err.name !== "AbortError") throw err;
      }
    };
  }

  // 🧠 Simple rate limiter (token bucket-ish)
  static rateLimit(fn, limit = 5, interval = 1000) {
    let tokens = limit;

    setInterval(() => {
      tokens = limit;
    }, interval);

    return function (...args) {
      if (tokens > 0) {
        tokens--;
        return fn.apply(this, args);
      }
    };
  }
}

export { ControlFlow };
