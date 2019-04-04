import { h, Component } from 'preact';
import {
  Circle, Line, Path, Rect, Text, Container
} from './shapes';
import { extendAndTransformAttributes } from '../../../core/scene-graph/attributes';

function dpiScale(ctx) {
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const backingStorePixelRatio = ctx.webkitBackingStorePixelRatio
    || ctx.mozBackingStorePixelRatio
    || ctx.msBackingStorePixelRatio
    || ctx.oBackingStorePixelRatio
    || ctx.backingStorePixelRatio
    || 1;
  return dpr / backingStorePixelRatio;
}

const renderShapes = (nodes, ctx) => {
  const shapes = [];
  if (ctx) {
    nodes.forEach((node) => {
      let vNode;
      const { type, ...attrs } = node;
      const props = extendAndTransformAttributes(attrs);
      switch (type) {
        case 'circle':
          vNode = <Circle ctx={ctx} {...props} />;
          break;
        case 'line':
          vNode = <Line ctx={ctx} {...props} />;
          break;
        case 'path':
          vNode = <Path ctx={ctx} {...props} />;
          break;
        case 'rect':
          vNode = <Rect ctx={ctx} {...props} />;
          break;
        case 'text':
          vNode = <Text ctx={ctx} {...props} />;
          break;
        case 'container':
          vNode = (
            <Container ctx={ctx} {...props}>
              {renderShapes(node.children, ctx)}
            </Container>
          );
          break;
        default:
          throw new Error(`unknown shape type: ${type}`);
      }
      shapes.push(vNode);
    });
  }
  return shapes;
};

class Canvas extends Component {
  constructor() {
    super();
    this.prevWidth = 0;
    this.prevHeight = 0;
    this.state = {
      ctx: undefined
    };
  }

  componentDidMount() {
    if (this.canvas) {
      const ctx = this.canvas.getContext('2d');
      // this.setupCanvas(this.props, ctx);
      this.setState({
        ctx
      });
    }
  }

  render({ rect, style, nodes = [] }, { ctx }) {
    const [width, height] = [rect.computedPhysical.width, rect.computedPhysical.height];
    if (this.canvas && (width !== this.prevHeight || height !== this.prevWidth)) {
      this.prevWidth = width;
      this.prevHeight = height;
      // this will clear the canvas
      const dpiRatio = dpiScale(ctx);
      this.canvas.width = Math.round(width * dpiRatio);
      this.canvas.height = Math.round(height * dpiRatio);

      const scaleX = rect.scaleRatio.x;
      const scaleY = rect.scaleRatio.y;
      if (rect.edgeBleed.bool) {
        ctx.translate(
          rect.edgeBleed.left * dpiRatio * scaleX,
          rect.edgeBleed.top * dpiRatio * scaleY
        );
      }
      if (dpiRatio !== 1 || scaleX !== 1 || scaleY !== 1) {
        ctx.scale(dpiRatio * scaleX, dpiRatio * scaleY);
      }
    }
    return (
      <canvas ref={canvas => (this.canvas = canvas)} style={style}>
        {ctx ? renderShapes(nodes, ctx) : ''}
      </canvas>
    );
  }
}

export default Canvas;
