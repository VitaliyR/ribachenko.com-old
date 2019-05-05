const util = require('../base/util');

const headerSel = '.c-header';
const currentLocSel = '.c-header__place-button';
const mapToggledClass = 'c-header--show-map';
const schemeSwitchSel = '.js-switch-scheme';

let header;

const toggleHeaderMap = (state) => {
  const action = state ? 'add' : 'remove';
  header.classList[action](mapToggledClass, state);
};

const toggleSchemeSwitch = (e) => {
  const switchEl = e.currentTarget;
  const currentState = switchEl.getAttribute('aria-checked') === 'true';
  const newState = !currentState;

  switchEl.setAttribute('aria-checked', newState);

  util.toggleDarkScheme(newState);
};

const bindHeader = () => {
  header = document.body.querySelector(headerSel);

  const currentLocationEl = header.querySelector(currentLocSel);
  const hideMapFn = toggleHeaderMap.bind(null, false);

  currentLocationEl.addEventListener('click', toggleHeaderMap.bind(null, true));
  currentLocationEl.addEventListener('blur', hideMapFn);

  header.addEventListener('mouseleave', hideMapFn);
  document.addEventListener('scroll', hideMapFn);

  const schemeSwitch = header.querySelector(schemeSwitchSel);
  schemeSwitch.addEventListener('click', toggleSchemeSwitch);
  schemeSwitch.setAttribute('aria-checked', util.isEnabledDarkScheme());
};

document.addEventListener('DOMContentLoaded', bindHeader);
