import React, { Component } from 'react';
import PropTypes from 'prop-types';

// import enigma from 'enigma.js';
// import enigmaSchema from 'enigma.js/schemas/12.20.0.json';

import runScript from 'run-script';
import 'hammerjs';

import picasso from '../../../../picasso.js/src';
import picQ from '../../../../../plugins/q/src';
import picHammer from '../../../../../plugins/hammer/src';

import './rendering-area.css';
import debounce from '../../core/generic/debounce';
import customGenerator from '../../generators/custom-generator';
import generator from '../../generators/hypercube-generator';

// Use picasso plugins
picasso.use(picQ);
picasso.use(picHammer);

class RenderingArea extends Component {
  debouncedProcess = debounce((props) => {
    const {
      code, dataScript, chart, message, title
    } = props;

    let doRun = false;
    let data = this.prevData;
    let settings = this.prevSettings;

    if (code !== this.prevCode) {
      doRun = true;
      settings = runScript(code, {
        picasso,
        chart
      });
    }
    if (dataScript !== this.prevDataScript) {
      doRun = true;
      data = runScript(dataScript, {
        customGenerator,
        generator
      });
    }

    if (!doRun) {
      return;
    }

    if (message && message.current) {
      if (settings && settings.error) {
        message.current.innerHTML = `${title} > Settings error: ${settings.error.name}`;
      } else if (data && data.error) {
        message.current.innerHTML = `${title} > Data error: ${data.error.name}`;
      } else {
        const result = runScript('chart.update({ data, settings })', {
          data,
          settings,
          chart
        });

        if (result && result.error) {
          message.current.innerHTML = `${title} > Rendering error: ${result.error.name}`;
          throw result.error;
        } else {
          message.current.innerHTML = `${title} > Success`;
        }
      }
    }

    this.prevCode = code;
    this.prevSettings = settings;
    this.prevDataScript = dataScript;
    this.prevData = data;
  }, 200);

  debouncedResize = debounce(({ chart }) => {
    runScript('chart.update()', {
      chart
    });
  }, 20);

  constructor(...props) {
    super(...props);
    this.element = React.createRef();
    this.message = React.createRef();

    this.processPicasso = this.processPicasso.bind(this);
    this.resize = this.resize.bind(this);

    this.showChartAPI = false;
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
  }

  componentDidMount() {
    this.setupChart({ force: true });
    this.processPicasso();
    // this.element.current.addEventListener('resize', this.resize);
    this.resizeObserver.observe(this.element.current);
  }

  componentDidUpdate() {
    this.setupChart();
  }

  componentWillUnmount() {
    this.chart.destroy();
    this.chart = undefined;
    this.prevCode = null;
    this.prevDataScript = null;
    this.prevSettings = null;
    this.prevData = null;
    // this.element.current.removeEventListener('resize', this.resize);
    this.resizeObserver.disconnect();
  }

  setupChart(opts = { force: false }) {
    const { settings, showChartAPI } = this.props;
    const { force } = opts;
    if (force || showChartAPI !== this.showChartAPI) {
      this.showChartAPI = showChartAPI;
      if (showChartAPI) {
        if (this.chart) {
          this.chart.destroy();
        }
        this.chart = runScript('return picasso(settings).chart({ element })', {
          picasso,
          settings,
          element: this.element.current
        });
      } else {
        this.chart = runScript('return picasso(settings).compose({ element })', {
          picasso,
          settings,
          element: this.element.current
        });
      }
    }
  }

  prevCode;

  prevDataScript;

  prevSettings;

  prevData;

  resize() {
    this.debouncedResize({ chart: this.chart });
  }

  processPicasso() {
    if (!this.chart) {
      return;
    }

    const { code, data, title } = this.props;

    this.debouncedProcess({
      code,
      title,
      dataScript: data,
      chart: this.chart,
      message: this.message
    });
  }

  render() {
    this.processPicasso();
    return (
      <div className="rendering-wrapper">
        <div ref={this.element} className="rendering-area" />
        <div className="message-wrapper">
          <p ref={this.message}>Loading...</p>
        </div>
      </div>
    );
  }
}

RenderingArea.propTypes = {
  title: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  settings: PropTypes.shape({}).isRequired,
  showChartAPI: PropTypes.bool
};

RenderingArea.defaultProps = {
  showChartAPI: false
};

export default RenderingArea;
