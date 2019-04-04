/* eslint class-methods-use-this: "off" */

import CanvasShape from './canvas-shape';

class Line extends CanvasShape {
  renderShape({
    ctx, x1 = 0, x2 = 0, y1 = 0, y2 = 0, stroke
  }) {
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      if (stroke) {
        ctx.stroke();
      }
    }
  }
}

export default Line;
