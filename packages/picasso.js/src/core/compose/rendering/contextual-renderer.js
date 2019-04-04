import { h } from 'preact';
import Canvas from '../../../web/compose/canvas';
import SVG from '../../../web/compose/svg';


function ContextualRenderer({ context, rect, nodes }) {
  const { renderer } = context;
  const style = {
    position: 'absolute',
    left: `${rect.computedPhysical.x}px`,
    top: `${rect.computedPhysical.y}px`,
    width: `${rect.computedPhysical.width}px`,
    height: `${rect.computedPhysical.height}px`,
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'antialiased'
  };

  if (renderer === 'canvas') {
    return <Canvas nodes={nodes} rect={rect} style={style} />;
  }
  if (renderer === 'svg') {
    return <SVG nodes={nodes} context={context} rect={rect} style={style} />;
  }
  // assume dom renderer
  return <div style={style}>Dom Renderer</div>;
}

export default ContextualRenderer;
