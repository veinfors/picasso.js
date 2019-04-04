/* eslint class-methods-use-this: "off" */

import CanvasShape from './canvas-shape';

class Path extends CanvasShape {
  renderShape({
    ctx, d, fill, stroke
  }) {
    if (ctx) {
      const p = new Path2D(d);
      if (fill) {
        ctx.fill(p);
      }
      if (stroke) {
        ctx.stroke(p);
      }
    }
  }
}

export default Path;
