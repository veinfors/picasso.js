/* global window */

export default function prompt(name, value, callback) {
  const result = window.prompt(name, value); // eslint-disable-line no-alert

  if (result !== null) {
    callback(result);
  }
}
