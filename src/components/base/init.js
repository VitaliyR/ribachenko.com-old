/* eslint-disable no-var */
var prefersDarkScheme = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
var switchValue = localStorage.getItem('isDarkScheme');
var isDarkScheme = switchValue ? switchValue === 'true' : prefersDarkScheme;
if (isDarkScheme) {
  document.documentElement.classList.add('scheme-dark');
}
