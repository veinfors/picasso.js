import { h, Component } from 'preact';
import ContextualRenderer from './rendering/contextual-renderer';
import createRendererBox from '../../web/renderer/renderer-box';

class ChartComponent extends Component {
  constructor({ instance }) {
    super();
    this.instance = instance;
    this.state = {
      nodes: []
    };
    this.instance.renderCallback = this.renderCallback.bind(this);
  }

  renderCallback(nodes) {
    this.setState({ nodes });
  }

  componentWillMount(...args) {
    this.instance.componentWillMount(...args);
    this.instance.beforeMount();
  }

  componentDidMount(...args) {
    this.instance.componentDidMount(...args);
    this.instance.mounted(this.base);
  }

  componentWillReceiveProps(...args) {
    this.instance.componentWillReceiveProps(...args);
  }

  shouldComponentUpdate(...args) {
    this.instance.shouldComponentUpdate(...args);
  }

  componentWillUpdate(...args) {
    this.instance.componentWillUpdate(...args);
  }

  render({ children, instance }, { nodes }) {
    // props, state
    if (!instance.visible) {
      return undefined;
    }
    if (children && children[0]) {
      return <div>{children}</div>;
    }
    const context = instance.localContext;
    const renderRect = createRendererBox(instance.renderRect);
    if (nodes && nodes.length) {
      return <ContextualRenderer context={context} rect={renderRect} nodes={nodes} />;
    }
    if (instance.render) {
      instance.beforeRender();
      const renderNodes = instance.render(context, h);
      return <ContextualRenderer ref={c => this.renderElememt = c} context={context} rect={renderRect} nodes={renderNodes} />;
    }
    return undefined;
  }

  componentDidUpdate(...args) {
    this.instance.componentDidUpdate(...args);
  }

  componentWillUnmount(...args) {
    this.instance.componentWillUnmount(...args);
    this.instance.beforeUnmount();
    this.instance.unmount();
  }
}

export default ChartComponent;
