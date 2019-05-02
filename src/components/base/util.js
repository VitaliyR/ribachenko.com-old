const eventSchemeChanged = 'schemeChanged';

module.exports = {
  async isSupportWebP() {
    if (!window.createImageBitmap) return false;

    const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    const blob = await fetch(webpData).then(r => r.blob());

    return createImageBitmap(blob).then(() => true, () => false);
  },

  isEnabledDarkScheme() {
    const prefersDarkScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const switchValue = window.localStorage.getItem('isDarkScheme');
    return switchValue ? switchValue === 'true' : prefersDarkScheme;
  },

  eventSchemeChanged,

  toggleDarkScheme(state) {
    document.documentElement.classList.toggle('scheme-dark', state);
    localStorage.setItem('isDarkScheme', state);

    const event = new CustomEvent(eventSchemeChanged, {
      detail: {
        isDark: state
      }
    });
    document.documentElement.dispatchEvent(event);
  }
};
