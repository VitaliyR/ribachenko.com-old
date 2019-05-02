const shareButtonSel = '.js-share-button';
const socialButtonsSel = '.js-share-social';
const hiddenClass = 'u-hidden';

const shareAction = () => {
  navigator.share({
    title: document.title,
    url: window.location.href
  });
};

const initializeShare = () => {
  const shareButton = document.body.querySelector(shareButtonSel);
  const socialButtons = document.body.querySelectorAll(socialButtonsSel);

  if (!navigator || !navigator.share) {
    return;
  }

  [...socialButtons].forEach(b => b.classList.add(hiddenClass));
  shareButton.classList.remove(hiddenClass);

  shareButton.addEventListener('click', shareAction);
};

document.addEventListener('DOMContentLoaded', initializeShare);
