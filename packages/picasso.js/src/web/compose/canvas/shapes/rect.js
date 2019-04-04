/* eslint class-methods-use-this: "off" */

import CanvasShape from './canvas-shape';

class Rect extends CanvasShape {
  renderShape({
    ctx, x = 0, y = 0, width = 0, height = 0, fill, stroke
  }) {
    if (ctx) {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      if (fill) {
        ctx.fill();
      }
      if (stroke) {
        ctx.stroke();
      }
    }
  }
}

export default Rect;
