import extractData from '../../data/extractor';

const localContext = ({ globalContext, settings, chartContext }) => {
  let renderer = settings.renderer;
  if (!renderer && globalContext.renderer && globalContext.renderer.prio) {
    renderer = globalContext.renderer.prio[0];
  }
  renderer = renderer || 'svg';

  let scale,
    data,
    formatter,
    style;

  if (settings.scale) {
    scale = chartContext.scale(settings.scale);
  }

  if (settings.data) {
    data = extractData(
      settings.data,
      { dataset: chartContext.dataset, collection: chartContext.dataCollection },
      { logger: chartContext.logger },
      chartContext.dataCollection
    );
  } else if (scale) {
    data = scale.data();
  } else {
    data = [];
  }

  if (typeof settings.formatter === 'string') {
    formatter = chartContext.formatter(settings.formatter);
  } else if (typeof settings.formatter === 'object') {
    formatter = chartContext.formatter(settings.formatter);
  } else if (scale && scale.data().fields) {
    formatter = scale.data().fields[0].formatter();
  }

  style = chartContext.theme.style(settings.style || {});
  const ctx = {
    renderer,
    data,
    formatter,
    style,
    scale,
    logger: chartContext.logger
  };
  return ctx;
};

export default localContext;
