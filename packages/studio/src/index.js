/* eslint-disable react/jsx-filename-extension */
/* global document */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

ReactDOM.render(<App location={document.location} />, document.getElementById('root'));
