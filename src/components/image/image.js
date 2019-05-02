const util = require('../base/util');

(async () => {
  const isSupportWebP = await util.isSupportWebP();
  document.documentElement.classList.add(isSupportWebP ? 'webp-support' : 'webp-no-support');
})();

const processPictures = (isDark) => {
  const isPictureSupported = !!window.HTMLPictureElement;
  const pictures = Array.from(document.body.querySelectorAll('picture'));
  pictures.forEach((picture) => {
    const children = Array.from(picture.children);
    const darkNodes = children.filter(n => n.getAttribute('data-scheme-dark'));

    if (isPictureSupported) {
      if (isDark) {
        darkNodes.reverse().forEach((node) => {
          picture.insertBefore(node, picture.firstChild);
          node.removeAttribute('media');
        });
      } else {
        darkNodes.forEach((node) => {
          picture.insertBefore(node, picture.lastChild);
          node.setAttribute('media', '(min-width: Infinity)');
        });
      }
    } else {
      const img = children.filter(c => c.tagName.toLowerCase() === 'img')[0];
      if (!img.getAttribute('lightSrc')) {
        img.setAttribute('lightSrc', img.getAttribute('src'));
      }
      const source = isDark
        ? darkNodes
          .map(n => n.getAttribute('srcset'))
          .filter(n => n && n.indexOf('.webp') === -1)[0]
        : img.getAttribute('lightSrc');

      if (source && img) {
        img.setAttribute('src', source);
      }
    }
  });
};

document.documentElement.addEventListener(util.eventSchemeChanged, e => processPictures(e.detail.isDark));
document.addEventListener('DOMContentLoaded', () => processPictures(util.isEnabledDarkScheme()));
