import extend from 'extend';
import docker from './docker';

const dockStrategy = (strategySettings) => {
  const d = docker(strategySettings);
  return {
    preferredSize(components, layoutRects) {
      let width = 0;
      let height = 0;
      const defaultLayoutSettings = {
        dock: 'center',
        prioOrder: 0,
        displayOrder: 0
      };
      components.forEach((c) => {
        const size = c.preferredSize(layoutRects);
        const layoutSettings = extend(defaultLayoutSettings, c.settings.layout);
        if (layoutSettings.dock === 'top' || layoutSettings.dock === 'bottom') {
          height += size.height;
        } else if (layoutSettings.dock === 'left' || layoutSettings.dock === 'right') {
          width += size.width;
        } else {
          height += size.height;
          width += size.width;
        }
      });
      return { width, height };
    },
    layout(rect, components) {
      const { visible, hidden } = d.layout(rect, components);
      visible.forEach((c) => {
        c.layoutComponents();
      });
      return { visible, hidden };
    }
  };
};

export default dockStrategy;
