/* eslint class-methods-use-this: "off" */

import { h, Fragment } from 'preact';
import CanvasShape from './canvas-shape';

class Container extends CanvasShape {
  renderShape({ children }) {
    return <Fragment>{children}</Fragment>;
  }
}

export default Container;
