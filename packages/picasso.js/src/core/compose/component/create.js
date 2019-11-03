import extend from 'extend';
import linkInstances, { createLinkFn } from './link';
import bindEvents from './events';
import getLocalContext from './local-context';
import getInteractions from './interactions';
import { testRectPoint } from '../../math/narrow-phase-collision';
import { getShapeType } from '../../geometry/util';

// TODO: re-use existing functionality
function addComponentDelta(shape, containerBounds, componentBounds) {
  const dx = containerBounds.left - componentBounds.left;
  const dy = containerBounds.top - componentBounds.top;
  const type = getShapeType(shape);
  const deltaShape = extend(true, {}, shape);

  switch (type) {
    case 'circle':
      deltaShape.cx += dx;
      deltaShape.cy += dy;
      break;
    case 'polygon':
      for (let i = 0, num = deltaShape.vertices.length; i < num; i++) {
        const v = deltaShape.vertices[i];
        v.x += dx;
        v.y += dy;
      }
      break;
    case 'line':
      deltaShape.x1 += dx;
      deltaShape.y1 += dy;
      deltaShape.x2 += dx;
      deltaShape.y2 += dy;
      break;
    case 'point':
    case 'rect':
      deltaShape.x += dx;
      deltaShape.y += dy;
      break;
    default:
      break;
  }

  return deltaShape;
}

const createInstances = (userDef, { registries }) => {
  let componentDef;
  let type = userDef.type || 'layout'; // default to layout component if undefined
  componentDef = registries.component(type) || {};
  // set defaults
  const userSettings = extend(true, { settings: {}, show: true }, componentDef.defaultSettings, userDef);
  userSettings.type = type;

  const userInstance = extend({}, userSettings);
  const componentInstance = extend({}, componentDef);

  return {
    userSettings,
    userInstance,
    componentInstance
  };
};

// eslint-disable-next-line no-undef
const createElement = document.createElement.bind(document);

const create = (userDef, globalContext, chartContext) => {
  const instance = {};
  let { userSettings, userInstance, componentInstance } = createInstances(userDef, globalContext);
  let rect = {};
  const renderRect = {};
  const resize = createLinkFn('resize', { instance, userInstance, componentInstance });

  const unbindEvents = bindEvents({ userInstance, componentInstance });
  const children = [];
  let localContext;
  let interactions;
  let element;

  function set(settings) {
    const args = { globalContext, settings, chartContext };
    localContext = getLocalContext(args);
    interactions = getInteractions(interactions, args);
  }

  set(userSettings);

  instance.key = userSettings.key;

  /**
   * Adds sub-component to this component, use index to decide the placement
   */
  instance.addChild = (c, index) => {
    if (typeof index === 'undefined') {
      children.push(c);
    } else {
      children.splice(index, 0, c);
    }
  };

  /**
   * Gets sub-components from this component
   * @returns {Array} sub-components
   */
  instance.getChildren = () => children;

  instance.mounted = (el) => {
    if (el) {
      instance.element = element = el;
    }
  };

  instance.preferredSize = () => ({ width: 0, height: 0 }); // auto size

  instance.update = (newUserDef) => {
    if (!chartContext.isOnlyDataUpdate()) {
      userSettings = extend(true, {}, componentInstance.defaultSettings, newUserDef);
    }
    instance.beforeUpdate({ settings: userSettings });
    set(userSettings);
    instance.settingsUpdated(userSettings);
  };

  instance.visible = true;

  instance.reset = () => {
    instance.visible = true;
    children.forEach(c => c.reset());
  };

  // TODO: re-use existing functionality
  instance.componentsFromPoint = (p) => {
    const br = chartContext.element.getBoundingClientRect();
    const x = 'clientX' in p ? p.clientX : p.x;
    const y = 'clientY' in p ? p.clientY : p.y;
    const tp = { x: x - br.left, y: y - br.top };
    const comps = [];

    if (testRectPoint(instance.rect, tp)) {
      comps.push(instance);
    } else {
      return comps;
    }

    children.forEach((c) => {
      comps.push(...c.componentsFromPoint(p));
    });
    return comps;
  };

  // TODO: re-use existing functionality
  instance.shapesAtt = (shape, opts = {}) => {
    const shapes = [];
    const containerBounds = element.getBoundingClientRect();

    // if (Array.isArray(opts.components) && opts.components.length > 0) {
    //   const compKeys = opts.components.map(c => c.key);
    //   comps = visibleComponents
    //     .filter(c => compKeys.indexOf(c.key) !== -1)
    //     .map(c => ({
    //       instance: c.instance,
    //       opts: opts.components[compKeys.indexOf(c.key)]
    //     }));
    // }

    for (let i = children.length - 1; i >= 0; i--) {
      const c = children[i];
      const componentBounds = c.renderer.element().getBoundingClientRect();
      const deltaShape = addComponentDelta(shape, containerBounds, componentBounds);
      shapes.push(...c.shapesAt(deltaShape, c.opts));
      const stopPropagation = shapes.length > 0 && opts.propagation === 'stop';

      shapes.push(...shapes);

      if (shapes.length > 0 && stopPropagation) {
        return shapes;
      }
    }
    return shapes;
  };

  // const appendComponentMeta = (node) => {
  //   node.key = settings.key;
  //   node.element = rend.element();
  // };

  instance.shapesAt = (shape, opts = {}) => {
    const items = instance.renderer.vdom.itemsAt(shape);
    const shapes = [];

    if (items) {
      shapes.push(...items);
    } else {
      return shapes;
    }

    children.forEach((c) => {
      shapes.push(...c.shapesAt(shape, opts));
    });

    console.log(shapes);

    return shapes;
  };

  instance.resize = (inner = {}, outer = {}) => {
    let newSize = resize({ inner, outer });
    let size = newSize || inner;
    extend(
      true,
      rect,
      {
        computedPhysical: size.computedPhysical,
        computedOuter: outer.computed,
        computedInner: inner.computed
      },
      inner
    );
    extend(
      true,
      renderRect,
      {
        computedOuter: outer.computed,
        computedInner: inner.computed
      },
      size
    );
  };

  instance.findComponent = (key) => {
    if (key === instance.key) {
      // return {
      //   emit: (...args) => {
      //     componentInstance.emit(...args);
      //     userInstance.emit(...args);
      //   }
      // };
      return componentInstance;
    }
    for (let i = 0; i < children.length; ++i) {
      const lookFor = children[i].findComponent(key);
      if (lookFor) {
        return lookFor;
      }
    }
    return undefined;
  };

  // specific for layout components
  instance.layoutComponents = () => {};

  // method to trigger a render on renderer
  instance.triggerRender = (nodes) => {
    if (instance.renderCallback) {
      instance.renderCallback(nodes);
    }
  };

  // tear down
  instance.unmount = () => {
    interactions.forEach((it) => {
      it.destroy();
    });
    interactions = [];
    unbindEvents();
  };

  instance.destroy = () => {
    if (userInstance.destroyed) {
      userInstance.destroyed();
    }
    if (componentInstance.destroyed) {
      componentInstance.destroyed();
    }
  };

  // add internal getters
  Object.defineProperties(instance, {
    rect: {
      get() {
        return rect;
      }
    },
    renderRect: {
      get() {
        return renderRect;
      }
    },
    settings: {
      get() {
        return userSettings;
      }
    },
    localContext: {
      get() {
        return localContext;
      }
    },
    interactions: {
      get() {
        return interactions;
      }
    },
    renderer: {
      get() {
        return {
          render: instance.triggerRender,
          destroy: () => {
            if (element && element.parentElement) {
              element.parentElement.removeChild(element);
            }
            element = null;
          },
          size: (inner) => {
            if (inner) {
              rect = inner;
            }
            return rect;
          },
          appendTo: (el) => {
            if (!element) {
              element = createElement('div');
              element.style.position = 'absolute';
              element.style['-webkit-font-smoothing'] = 'antialiased';
              element.style['-moz-osx-font-smoothing'] = 'antialiased';
              element.style.pointerEvents = 'none';
            }

            el.appendChild(element);

            return element;
          },
          element: () => instance.element,
          ...chartContext.renderTools
        };
      }
    }
  });

  linkInstances({
    instance,
    userInstance,
    componentInstance,
    chartContext,
    localContext,
    userSettings
  });

  instance.created();

  return instance;
};

export default create;
