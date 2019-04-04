/* eslint class-methods-use-this: "off" */

import { ellipsText, measureText } from '../../../text-manipulation';
import baselineHeuristic from '../../../text-manipulation/baseline-heuristic';
import { detectTextDirection, flipTextAnchor } from '../../../../core/utils/rtl-util';

import CanvasShape from './canvas-shape';

class Text extends CanvasShape {
  renderShape({
    ctx, x = 0, dx = 0, y = 0, dy = 0, ...attrs
  }) {
    if (ctx) {
      const t = {
        x,
        dx,
        y,
        dy,
        ...attrs
      };
      const text = ellipsText(t, measureText);

      ctx.font = `${t['font-size']} ${t['font-family']}`;
      ctx.canvas.dir = detectTextDirection(t.text);
      const textAlign = t['text-anchor'] === 'middle' ? 'center' : t['text-anchor'];
      ctx.textAlign = flipTextAnchor(textAlign, ctx.canvas.dir);

      const bdy = baselineHeuristic(t);

      ctx.fillText(text, t.x + t.dx, t.y + t.dy + bdy);
    }
  }
}

export default Text;
