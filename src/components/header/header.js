const headerSel = '.c-header';
const currentLocSel = '.c-header__place-button';
const mapToggledClass = 'c-header--show-map';

let header;

const toggleHeaderMap = (state) => {
  const action = state ? 'add' : 'remove';
  header.classList[action](mapToggledClass, state);
};

const bindHeader = () => {
  header = document.body.querySelector(headerSel);

  const currentLocationEl = header.querySelector(currentLocSel);
  const hideMapFn = toggleHeaderMap.bind(null, false);

  currentLocationEl.addEventListener('click', toggleHeaderMap.bind(null, true));
  currentLocationEl.addEventListener('blur', hideMapFn);

  header.addEventListener('mouseleave', hideMapFn);
  document.addEventListener('scroll', hideMapFn);
};

document.addEventListener('DOMContentLoaded', bindHeader);
