import { h } from 'preact';
import { extendAndTransformAttributes } from '../../../core/scene-graph/attributes';
import { maybeAddGradients } from './svg-gradient';
import { detectTextDirection, flipTextAnchor } from '../../../core/utils/rtl-util';
import { ellipsText, measureText } from '../../text-manipulation';

function renderNode(node, vDefs) {
  let vNode;
  const { type, ...attrs } = node;
  const props = extendAndTransformAttributes(attrs);
  maybeAddGradients(props, vDefs);
  if (type === 'container') {
    const vChildren = [];
    node.children.forEach((c) => {
      const vC = renderNode(c, vDefs);
      vChildren.push(vC);
    });
    vNode = <g {...props}>{vChildren}</g>;
  } else if (type === 'text') {
    const { text, dominantBaseline, ...textProps } = props;
    const style = { whiteSpace: 'pre' };
    const textContent = ellipsText(props, measureText);
    const dir = detectTextDirection(text);
    if (dir === 'rtl') {
      textProps.direction = 'rtl';
      textProps.dir = 'rtl';
      textProps['text-anchor'] = flipTextAnchor(props['text-anchor'], dir);
    }
    vNode = <text {...textProps} style={style}>{textContent}</text>;
  } else {
    const SvgNode = type;
    vNode = <SvgNode {...props} />;
  }
  return vNode;
}

function SVG({
  rect, context, nodes = [], style
}) {
  const vNodes = [];
  const vDefs = [];
  nodes.forEach((node) => {
    const vNode = renderNode(node);
    vNodes.push(vNode);
  });

  const scaleX = rect.scaleRatio.x;
  const scaleY = rect.scaleRatio.y;
  let transform = rect.edgeBleed.bool
    ? `translate(${rect.edgeBleed.left * scaleX}, ${rect.edgeBleed.top * scaleY})`
    : '';
  if (scaleX !== 1 || scaleY !== 1) {
    transform += `scale(${scaleX}, ${scaleY})`;
  }
  context.ns = context.ns || 'http://www.w3.org/2000/svg';
  return (
    <svg
      xmlns={context.ns}
      style={style}
      width={rect.computedPhysical.width}
      height={rect.computedPhysical.height}
    >
      <defs>{vDefs}</defs>
      <g style="pointer-events: auto" transform={transform}>
        {vNodes}
      </g>
    </svg>
  );
}

export default SVG;
