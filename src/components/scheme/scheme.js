const util = require('../base/util');

const schemeSwitchSel = '.js-switch-scheme';

const toggleSchemeSwitch = (e) => {
  const switchEl = e.currentTarget;
  const currentState = switchEl.getAttribute('aria-checked') === 'true';
  const newState = !currentState;

  switchEl.setAttribute('aria-checked', newState);

  util.toggleDarkScheme(newState);
};

const bindListeners = () => {
  const schemeSwitch = document.body.querySelector(schemeSwitchSel);
  schemeSwitch.addEventListener('click', toggleSchemeSwitch);
  schemeSwitch.setAttribute('aria-checked', util.isEnabledDarkScheme());
};

document.addEventListener('DOMContentLoaded', bindListeners);
