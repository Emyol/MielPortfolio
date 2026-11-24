// Keeps an element's bounding rect up to date so hot paths (e.g. Liquid's
// pointermove handler) can read it without calling getBoundingClientRect()
// on every event, which can force a synchronous layout.
export function createRectCache(element: Element) {
  let current = element.getBoundingClientRect();

  const refresh = () => {
    current = element.getBoundingClientRect();
  };

  // ResizeObserver catches size changes of the element itself; the window
  // listeners below cover position changes it does not report.
  const observer = new ResizeObserver(refresh);
  observer.observe(element);
  window.addEventListener("resize", refresh, { passive: true });
  // Capture phase so scrolling in any ancestor container (scroll events do
  // not bubble) also refreshes the cached position, not just window scroll.
  window.addEventListener("scroll", refresh, {
    capture: true,
    passive: true,
  });

  return {
    get current() {
      return current;
    },
    destroy() {
      observer.disconnect();
      window.removeEventListener("resize", refresh);
      // The capture flag must match the one used in addEventListener, or the
      // listener is not removed.
      window.removeEventListener("scroll", refresh, true);
    },
  };
}
