const layoutComponent = {
  defaultSettings: {
    settings: {
      strategy: {
        type: 'dock'
      },
      components: []
    }
  },
  require: ['registries'],

  created() {
    const strategy = this.settings.settings.strategy;
    this.layoutStrategy = this.registries.layout(strategy.type)(strategy);
  },

  settingsUpdated(newUserSettings) {
    const strategy = newUserSettings.settings.strategy;
    this.layoutStrategy = this.registries.layout(strategy.type)(strategy);
  },

  preferredSize(layoutRects) {
    const components = this.getChildren().filter(c => c.settings.show);
    return this.layoutStrategy.preferredSize(components, layoutRects);
  },

  layoutComponents() {
    const components = this.getChildren().filter(c => c.settings.show);
    this.layoutStrategy.layout(this.rect, components);
  }
};

export default layoutComponent;
