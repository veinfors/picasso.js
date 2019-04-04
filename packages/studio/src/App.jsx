import React, { Component } from 'react';
import extend from 'extend';
import { Tab, Checkbox } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import MonacoEditor from 'react-monaco-editor';
import list from './examples';
import localList from './core/local-repo';
import ExampleList from './components/example-list/example-list';
import RenderingArea from './components/rendering-area/rendering-area';
import SettingsPanel from './components/settings/settings';
import './App.css';

function getLocalStorage(key, deffault) {
  let item = localStorage.getItem(key);
  if (item) {
    item = JSON.parse(item);
  } else {
    item = deffault;
  }
  return item;
}

class App extends Component {
  constructor(...props) {
    super(...props);
    const { location } = this.props;
    const activeItem = location.hash.replace('#', '') || list[0].id;
    const codeObject = {
      id: activeItem,
      title: activeItem,
      code: '',
      data: ''
    };
    const compose = getLocalStorage('compose', true);
    const chart = getLocalStorage('chart', false);
    this.state = {
      activeItem,
      codeObject,
      compose,
      chart,
      updatingPicassoSettings: false,
      picassoSettings: {
        renderer: { prio: ['svg'] },
        logger: { level: 2 }
      }
    };
  }

  componentDidMount() {
    const { activeItem } = this.state;
    this.onItemSelect(activeItem);
  }

  componentDidUpdate() {
    const { updatingPicassoSettings } = this.state;
    if (updatingPicassoSettings) {
      this.setState({ updatingPicassoSettings: false }); // eslint-disable-line
    }
  }

  onItemSelect = (id) => {
    const { location } = this.props;
    let newCodeObject;
    let newId = id;

    if (!id) {
      newId = '';
      newCodeObject = {
        id: newId,
        title: newId,
        code: '',
        data: ''
      };
    } else if (id.indexOf('@local/') === 0) {
      newCodeObject = localList.get(id.replace('@local/', ''));
    } else {
      newCodeObject = list.reduce((o, c) => (c.id === id ? c : o));
    }

    location.hash = `#${newId}`;
    this.setState({ activeItem: newId, codeObject: newCodeObject });
  }

  handleShowRenderAPIChange = (e, { value, checked }) => {
    localStorage.setItem(value, checked);
    const newState = {};
    newState[value] = checked;
    this.setState(newState);
  }

  onEditorChange = ({ code: inputCode, data: inputData }) => {
    const { activeItem, codeObject } = this.state;
    const { code, data } = {
      code: inputCode || codeObject.code,
      data: inputData || codeObject.data
    };
    if (activeItem.indexOf('@local/') === 0) {
      localList.update({ id: activeItem.replace('@local/', ''), code, data });
      this.setState({
        codeObject: {
          ...codeObject,
          code,
          data
        }
      });
    } else {
      const result = localList.fork(codeObject);
      if (result && result.id) {
        this.onItemSelect(`@local/${result.id}`);
      }
    }
  };

  onSettingsChange = (setting) => {
    this.setState(state => ({
      updatingPicassoSettings: true,
      picassoSettings: extend(state.picassoSettings, setting)
    }));
  };

  editorDidMount = (editor) => {
    editor.getModel().updateOptions({ tabSize: 2 });
    editor.focus();
  }

  render() {
    const {
      activeItem, compose, chart, codeObject, picassoSettings, updatingPicassoSettings
    } = this.state;

    const renderingAreas = [];
    if (compose) {
      renderingAreas.push(
        <div key="compose" className="flex-item-grow flex-container">
          { updatingPicassoSettings ? (
            <React.Fragment />
          ) : (
            <RenderingArea
              title="Compose"
              code={codeObject.code}
              data={codeObject.data}
              settings={picassoSettings}
            />
          ) }
        </div>
      );
    }
    if (chart) {
      renderingAreas.push(
        <div key="chart" className="flex-item-grow flex-container">
          { updatingPicassoSettings ? (
            <React.Fragment />
          ) : (
            <RenderingArea
              title="Chart"
              code={codeObject.code}
              data={codeObject.data}
              settings={picassoSettings}
              showChartAPI
            />
          ) }
        </div>
      );
    }
    if (!compose && !chart) {
      renderingAreas.push(
        <div key="placeholder" className="flex-item-grow">
          Rendering Area
        </div>
      );
    }

    const settings = [
      {
        id: 'r01',
        subProperties: [
          {
            title: 'Renderer',
            id: 'renderer',
            type: 'radio',
            default: 'svg',
            change: (e) => {
              this.onSettingsChange({ renderer: { prio: [e.target.value] } });
            },
            options: [{ value: 'svg', name: 'Svg' }, { value: 'canvas', name: 'Canvas' }]
          }
        ]
      },
      {
        id: 'r02',
        subProperties: [
          {
            title: 'Logger',
            id: 'logger',
            type: 'dropdown',
            default: 2,
            change: (e, { value }) => {
              this.onSettingsChange({ logger: { level: value } });
            },
            options: ['off', 'error', 'warn', 'info', 'debug']
          }
        ]
      }
    ];

    const panes = [
      {
        menuItem: 'Code',
        render: () => (
          <MonacoEditor
            height="calc(100% - 40px)"
            language="javascript"
            theme="vs-dark"
            options={{
              selectOnLineNumbers: true,
              automaticLayout: true
            }}
            value={codeObject.code}
            onChange={newCode => this.onEditorChange({ code: newCode })}
            editorDidMount={this.editorDidMount}
          />
        )
      },
      {
        menuItem: 'Data',
        render: () => (
          <MonacoEditor
            height="calc(100% - 40px)"
            language="javascript"
            theme="vs-dark"
            options={{
              selectOnLineNumbers: true,
              automaticLayout: true
            }}
            value={codeObject.data}
            onChange={newCode => this.onEditorChange({ data: newCode })}
            editorDidMount={this.editorDidMount}
          />
        )
      },
      {
        menuItem: 'Settings',
        render: () => (
          <div className="flex-item-grow">
            <SettingsPanel settings={settings} />
          </div>
        )
      }
    ];

    return (
      <div className="flex-item-grow flex-container">
        <div className="flex-item-shrink flex-container-column">
          <div className="flex-item-shrink flex-container logo"><img src="./logo/picasso-logo.svg" alt="picasso.js" /></div>
          <div className="flex-item-shrink" style={{ overflowY: 'auto' }}>
            <ExampleList
              list={list}
              localList={localList}
              activeItem={activeItem}
              onItemSelect={this.onItemSelect}
            />
          </div>
          <div className="flex-item-grow" />
          <div className="flex-item-shrink flex-container-column checkboxes">
            <Checkbox onChange={this.handleShowRenderAPIChange} checked={compose} value="compose" label="Compose" />
            <Checkbox onChange={this.handleShowRenderAPIChange} checked={chart} value="chart" label="Chart" />
          </div>
        </div>
        <div className="flex-item-grow flex-container">
          <Tab
            className="flex-item-shrink flex-container-column code-tabs"
            menu={{
              secondary: true, inverted: true, attached: 'bottom', pointing: true
            }}
            panes={panes}
          />
          <div className="flex-item-grow flex-container-column">
            {renderingAreas}
          </div>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  location: PropTypes.shape({
    hash: PropTypes.string.isRequired,
    assign: PropTypes.func.isRequired
  }).isRequired
};

export default App;
