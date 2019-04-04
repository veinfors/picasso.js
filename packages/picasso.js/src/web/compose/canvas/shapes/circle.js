/* eslint class-methods-use-this: "off" */

import CanvasShape from './canvas-shape';

class Circle extends CanvasShape {
  renderShape({
    ctx, cx = 0, cy = 0, r = 0, fill, stroke
  }) {
    if (ctx) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
      if (fill) {
        ctx.fill();
      }
      if (stroke) {
        ctx.stroke();
      }
    }
  }
}

export default Circle;
