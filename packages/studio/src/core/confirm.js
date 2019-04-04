/* global window */

export default function confirm(name, callback) {
  const result = window.confirm(name); // eslint-disable-line no-alert

  if (result !== null) {
    callback(result);
  }
}
