/* AK SUGGI — NFC card page.
   Optional enhancements only. Every detail and link on the page is written
   into card.html, so the page works with JavaScript disabled. */
(() => {
  'use strict';

  // Native sharing is offered only where the browser supports it.
  if (navigator.share) {
    document.querySelectorAll('[data-share]').forEach(button => {
      button.hidden = false;
      button.addEventListener('click', () => {
        navigator.share({
          title: 'AK Suggi — Design, Photo & Film',
          text: 'AK Suggi — websites, art direction, photography and film.',
          url: location.href
        }).catch(() => {});
      });
    });
  }

  // Arrival reveals, staggered once. The inline script in card.html hides
  // these only when scripting is available; reduced motion skips the movement.
  const targets = [...document.querySelectorAll('[data-reveal]')];
  const show = () => targets.forEach((element, index) => {
    setTimeout(() => element.classList.add('is-in'), 110 + index * 90);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', show, { once: true });
  } else {
    show();
  }

  // Failsafe: if anything above is interrupted, the page must not stay hidden.
  setTimeout(() => targets.forEach(element => element.classList.add('is-in')), 1600);
})();
