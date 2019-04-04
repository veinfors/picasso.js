import extend from 'extend';
import linkInstances, { createLinkFn } from './link';
import bindEvents from './events';
import getLocalContext from './local-context';
import getInteractions from './interactions';


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

const create = (userDef, globalContext, chartContext) => {
  const instance = {};
  let { userSettings, userInstance, componentInstance } = createInstances(userDef, globalContext);
  const rect = {};
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
      element = el;
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
      return {
        emit: (...args) => {
          componentInstance.emit(...args);
          userInstance.emit(...args);
        }
      };
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
          element: () => element,
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
