import { h } from 'preact';
import ChartComponent from './ChartComponent';
import create from './component/create';

function getSubComponentUserDefs(userDef) {
  return userDef.settings ? userDef.settings.components || [] : [];
}

function synthesize(userDef, globalContext, chartContext) {
  let children = [];
  const instance = create(userDef, globalContext, chartContext);

  const subComponentUserDefs = getSubComponentUserDefs(userDef);

  const synthesizeLocal = (subComponentUserDef) => {
    const oneLevelDeeper = synthesize(subComponentUserDef, globalContext, chartContext);
    instance.addChild(oneLevelDeeper);
    children.push(oneLevelDeeper.vdom);
  };

  subComponentUserDefs.forEach(synthesizeLocal);

  instance.vdom = <ChartComponent instance={instance}>{children}</ChartComponent>;
  return instance;
}

function findComponent(components, key) {
  for (let i = 0; i < components.length; ++i) {
    if (components[i].key === key) {
      return components[i];
    }
  }
  return undefined;
}

function syntheticUpdate(component, userDef, context, chartContext) {
  component.update(userDef);
  const children = component.getChildren();

  // shallow copy children and leave it empty to refill it later
  const components = children.splice(0, children.length);

  // vdom children
  const vChildren = [];
  const syntheticUpdateLocal = (sc) => {
    let c;
    if (sc.key) {
      c = findComponent(components, sc.key);
      if (c) {
        syntheticUpdate(c, sc, context, chartContext);
      } else {
        c = synthesize(sc, context, chartContext);
      }
    } else {
      c = synthesize(sc, context, chartContext);
    }
    children.push(c);
    vChildren.push(c.vdom);
  };

  getSubComponentUserDefs(userDef).forEach(syntheticUpdateLocal);
  component.vdom = <ChartComponent instance={component}>{vChildren}</ChartComponent>;
}

function syntheticDataUpdate(component) {
  component.update();
  const syntheticDataUpdateRecursive = (sc) => {
    syntheticDataUpdate(sc);
  };
  component.getChildren().forEach(syntheticDataUpdateRecursive);
}

export { synthesize, syntheticUpdate, syntheticDataUpdate };
