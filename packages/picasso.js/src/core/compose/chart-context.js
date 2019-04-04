import settingsResolver from '../component/settings-resolver';
import datasources from '../data/data';
import dataCollections from '../data/collections';
import { collection as formatterCollection } from '../chart/formatter';
import { collection as scaleCollection } from '../chart/scales';
import themeFn from '../theme';
import { measureText, textBounds } from '../../web/text-manipulation';
import symbolFactory from '../symbols';

const UPD_DATA = 0x0001;
const UPD_SETTINGS = 0x0010;

const createChartContext = (context, element) => {
  const { registries, logger, palettes } = context;
  const theme = themeFn(context.style, palettes);
  const symbol = () => symbolFactory;

  let updateMask = 0;
  const isDataUpdate = () => updateMask & UPD_DATA;
  const isSettingsUpdate = () => updateMask & UPD_SETTINGS;
  const isOnlyDataUpdate = () => updateMask === UPD_DATA;

  let settings,
    data,
    dataset,
    dataCollection,
    currentScales,
    currentFormatters,
    rootInstance;

  function update(newUserDef) {
    updateMask = 0;
    if (newUserDef.settings) {
      settings = newUserDef.settings;
      updateMask |= UPD_SETTINGS;
    }
    if (newUserDef.data) {
      data = newUserDef.data;
      updateMask |= UPD_DATA;
    }
    settings = settings || {};
    data = data || [];

    const { formatters = {}, scales = {} } = settings;

    if (isSettingsUpdate() && settings.palettes) {
      theme.setPalettes(settings.palettes);
    }
    if (isDataUpdate()) {
      dataset = datasources(data, {
        logger,
        types: registries.data
      });
    }

    dataCollection = dataCollections(settings.collections, { dataset }, { logger });

    const deps = {
      theme,
      logger
    };

    currentScales = scaleCollection(
      scales,
      { dataset, collection: dataCollection },
      { ...deps, scale: registries.scale }
    );
    currentFormatters = formatterCollection(
      formatters,
      { dataset, collection: dataCollection },
      { ...deps, formatter: registries.formatter }
    );
  }

  const chartContext = {};
  chartContext.update = update;
  chartContext.isOnlyDataUpdate = isOnlyDataUpdate;
  chartContext.setRootInstance = (cmp) => { rootInstance = cmp; };
  chartContext.component = key => rootInstance.findComponent(key);

  chartContext.dataset = key => dataset(key);
  chartContext.dataCollection = key => dataCollection(key);
  chartContext.scale = v => currentScales.get(v);
  chartContext.formatter = v => currentFormatters.get(v);
  chartContext.logger = logger;
  chartContext.theme = theme;
  chartContext.registries = registries;
  chartContext.resolver = settingsResolver({
    chart: chartContext
  });
  chartContext.shapesAt = () => {};
  chartContext.brushFromShapes = () => {};
  chartContext.symbol = symbol;
  chartContext.element = element;

  const notImplemented = (fnName) => {
    throw new Error(`${fnName}: not implemented in server environment`);
  };
  const measure = context.noBrowser ? notImplemented : measureText;
  const bounds = context.noBrowser ? notImplemented : textBounds;

  chartContext.renderTools = {
    measureText: measure,
    textBounds: bounds
  };

  return chartContext;
};

export default createChartContext;
