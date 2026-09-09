/* Optional enhancements. All pages, navigation and email links work without JS. */
(() => {
  'use strict';

  // Add AK's confirmed Instagram profile URL here, or leave blank to hide it.
  const instagramURL = '';
  if (/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._]+\/?$/.test(instagramURL)) {
    document.querySelectorAll('[data-instagram]').forEach(link => {
      link.href = instagramURL;
      link.hidden = false;
    });
  }

  const menu = document.querySelector('.menu');
  if (!menu) return;
  const summary = menu.querySelector('summary');
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      summary.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { menu.open = false; });
  });
  document.addEventListener('focusin', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
})();
