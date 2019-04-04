/* eslint class-methods-use-this: "off" */

import { Component } from 'preact';
import createCanvasGradient from '../../../renderer/canvas-renderer/canvas-gradient';
import resolveTransform from '../../../../core/scene-graph/transform-resolver';
import Matrix from '../../../../core/math/matrix';

function toLineDash(p) {
  if (Array.isArray(p)) {
    return p;
  }
  if (typeof p === 'string') {
    if (p.indexOf(',') !== -1) {
      return p.split(',');
    }
    return p.split(' ');
  }
  return [];
}

const propsToCanvasMap = {
  opacity: { cmd: 'globalAlpha' },
  globalAlpha: { cmd: 'globalAlpha' },
  'stroke-width': { cmd: 'lineWidth' },
  'stroke-linejoin': { cmd: 'lineJoin' },
  'stroke-dasharray': { cmd: 'setLineDash', convert: toLineDash }
};

function applyTransform(ctx, transform) {
  if (transform) {
    const matrix = new Matrix();
    resolveTransform(transform, matrix);
    const p = matrix.elements;
    ctx.transform(p[0][0], p[1][0], p[0][1], p[1][1], p[0][2], p[1][2]);
  }
}

class CanvasShape extends Component {
  render(props) {
    let shapes = null;
    if (props.ctx) {
      const ctx = props.ctx;
      ctx.save();
      // Gradient check
      if (props.fill && typeof props.fill === 'object' && props.fill.type === 'gradient') {
        ctx.fillStyle = createCanvasGradient(ctx, props, props.fill);
      } else if (props.fill) {
        ctx.fillStyle = props.fill;
      }
      if (props.stroke && typeof props.stroke === 'object' && props.stroke.type === 'gradient') {
        ctx.strokeStyle = createCanvasGradient(ctx, props, props.stroke);
      } else if (props.stroke) {
        ctx.strokeStyle = props.stroke;
      }

      Object.keys(props).forEach((key) => {
        if (propsToCanvasMap[key]) {
          const { cmd, convert } = propsToCanvasMap[key];
          const val = convert ? convert(props[key]) : props[key];
          if (typeof ctx[cmd] === 'function') {
            ctx[cmd](val);
          } else {
            ctx[cmd] = val;
          }
        }
      });
      applyTransform(ctx, props.transform);
      shapes = this.renderShape(props);
      ctx.restore();
    }
    return shapes;
  }

  renderShape() {
    throw new Error('renderShape method is not implemented in sub class');
  }
}

export default CanvasShape;
