export const DEFAULT_LIFECYCLE = [
  'created',
  'settingsUpdated',
  'componentWillMount',
  'componentDidMount',
  'shouldComponentUpdate',
  'componentWillReceiveProps',
  'componentWillUpdate',
  'render',
  'componentDidUpdate',
  'componentWillUnmount',
  'destroyed'
];
export const LEGACY_LIFECYCLE = [
  'beforeMount',
  'mounted',
  'beforeUnmount',
  'beforeUpdate',
  'updated',
  'beforeRender',
  'beforeDestroy'
];

export function createLinkFn(fnName, { instance, userInstance, componentInstance }) {
  const baseFn = instance[fnName];
  return function fn(...args) {
    let val;
    if (baseFn) {
      val = baseFn.call(instance, ...args);
    }
    if (componentInstance[fnName]) {
      val = componentInstance[fnName].call(componentInstance, ...args);
    }
    if (userInstance[fnName]) {
      val = userInstance[fnName].call(userInstance, ...args);
    }
    return val;
  };
}

function linkFunction(fnName, instance, { userInstance, componentInstance }) {
  instance[fnName] = createLinkFn(fnName, { instance, userInstance, componentInstance });
}

export function linkOverride(fnName, instance, componentInstance) {
  const original = instance[fnName];
  instance[fnName] = (...args) => {
    if (componentInstance[fnName]) {
      return componentInstance[fnName].call(componentInstance, ...args);
    }
    if (original) {
      return original.call(instance, ...args);
    }
    return undefined;
  };
}

function linkGetter(propName, { source, target }, value) {
  if (!Array.isArray(source)) {
    source = [source];
  }
  if (!Array.isArray(target)) {
    target = [target];
  }
  target.forEach((t) => {
    if (value) {
      Object.defineProperty(t, propName, {
        get() {
          return value;
        }
      });
    } else {
      source.forEach((s) => {
        if (s[propName]) {
          Object.defineProperty(t, propName, {
            get() {
              return s[propName];
            }
          });
        }
      });
    }
  });
}

export default function linkInstances({
  instance,
  userInstance,
  componentInstance,
  chartContext,
  localContext,
  userSettings
}) {
  // link lifecycle methods from sattelites to base
  DEFAULT_LIFECYCLE.forEach((fnName) => {
    linkFunction(fnName, instance, { userInstance, componentInstance });
  });
  LEGACY_LIFECYCLE.forEach((fnName) => {
    linkFunction(fnName, instance, { userInstance, componentInstance });
  });

  // link getters from base to both sattelites
  ['rect', 'visible'].forEach(propName => linkGetter(propName, {
    source: instance,
    target: [userInstance, componentInstance]
  }));
  // link getters from base only to component instance
  ['settings'].forEach(propName => linkGetter(propName, {
    source: instance,
    target: componentInstance
  }));

  // link getters from base only to user instance
  linkGetter('key', {
    source: instance,
    target: userInstance
  });

  // link required chart properties from base to both user and component instance
  const linkRequire = (targetInstance) => {
    let { require = [] } = targetInstance;
    require.forEach((req) => {
      if (chartContext[req]) {
        linkGetter(req, { target: targetInstance }, chartContext[req]);
      }
      if (req === 'renderer') {
        linkGetter(req, { target: targetInstance }, instance.renderer);
      }
      if (req === 'chart') {
        linkGetter(req, { target: targetInstance }, chartContext);
      }
    });
  };
  [componentInstance, userInstance].forEach(inst => linkRequire(inst));

  // link getters from rendering context to both sattelites
  ['data', 'formatter', 'scale', 'style'].forEach((prop) => {
    linkGetter(prop, {
      source: localContext,
      target: [userInstance, componentInstance]
    });
  });

  // overrides
  ['preferredSize'].forEach((fnName) => {
    linkOverride(fnName, instance, componentInstance);
  });

  if (userSettings.type === 'layout') {
    linkGetter('getChildren', {
      source: instance,
      target: componentInstance
    });
    linkOverride('layoutComponents', instance, componentInstance);
  }
}
