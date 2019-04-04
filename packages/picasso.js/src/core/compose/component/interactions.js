const getInteractions = (currentInteractions = [], { globalContext, settings, chartContext }) => {
  const interactions = settings.settings.interactions || [];
  const current = {};
  const newKeys = interactions.filter(it => !!it.key).map(it => it.key);
  currentInteractions.forEach((cit) => {
    if (cit.key && newKeys.indexOf(cit.key) !== -1) { // keep old instance
      current[cit.key] = cit;
    } else {
      cit.destroy();
    }
  });
  return interactions.map((intSettings) => {
    const intDefinition = intSettings.key && current[intSettings.key]
      ? current[intSettings.key]
      : globalContext.registries.interaction(intSettings.type)(chartContext, null, chartContext.element);
    intDefinition.set(intSettings);
    return intDefinition;
  });
};

export default getInteractions;
