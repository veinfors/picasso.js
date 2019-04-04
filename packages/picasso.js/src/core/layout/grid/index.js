export default () => ({
  preferredSize(components, layoutRects) {
    let mw = 0;
    let mh = 0;
    components.forEach((c) => {
      const size = c.preferredSize(layoutRects);
      mw = Math.max(mw, size.width);
      mh = Math.max(mh, size.height);
    });
    return { width: mw, height: mh };
  },
  layout(rect, components) {
    // just a simpel grid layout engine
    let rows = Math.ceil(Math.sqrt(components.length));
    let cols = rows;
    let dx = rect.width / cols;
    let dy = rect.height / cols;
    // special case
    if (components.length <= 2) {
      rows = 1;
      cols = components.length;
      dy = rect.height;
    }
    let handled = 0;
    let subRect = {
      x: rect.x,
      y: rect.y,
      width: dx,
      height: dy
    };
    // implement colspan
    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        if (handled >= components.length) {
          break;
        }
        components[handled++].resize(subRect, rect);
        subRect.x += dx;
      }
      subRect.x = 0;
      subRect.y += dy;
    }
    components.forEach((c) => {
      c.layoutComponents();
    });
  }
});
