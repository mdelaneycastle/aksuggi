/* Optional enhancements. All pages, navigation and email links work without JS. */
(() => {
  'use strict';

  // Add AK's confirmed Instagram profile URL here, or leave blank to hide it.
  const instagramURL = 'https://www.instagram.com/aksuggi/';
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

/* Scroll choreography. Native scrolling; content is never hidden to await JS. */
(() => {
  'use strict';
  if (!window.matchMedia || !('IntersectionObserver' in window)) return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1000px) and (pointer: fine)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const hero = document.querySelector('.hero-image');
  const frames = [...document.querySelectorAll(
    '.hero-image, .discipline-link .media, .work-link .media, .project-gallery .media'
  )].filter(frame => frame.dataset.fit !== 'contain' && frame.querySelector('img'));
  const visible = new Set();
  const animations = new Set();
  const revealed = new WeakSet();
  const revealTargets = [...document.querySelectorAll(
    '.home-intro .wordmark span, .intro-note, .intro-meta, .about > *, ' +
    '.statement, .discipline-link, .page-title, .section-title, .works-list > article, ' +
    '.project-heading, .project-intro, .project-gallery > *, ' +
    '.contact-section h2 span, .contact-section .button, .footer-top, .footer-brand'
  )];
  let frameRequest = 0;
  let active = false;
  let revealObserver;
  let imageObserver;

  function reveal(element, delay = 0) {
    if (revealed.has(element)) return;
    revealed.add(element);
    if (typeof element.animate !== 'function') return;
    // A focused link must be visible immediately, even while scrolling to it.
    if (element.contains(document.activeElement)) return;
    const animation = element.animate([
      { opacity: .15, transform: 'translate3d(0, 22px, 0)' },
      { opacity: 1, transform: 'translate3d(0, 0, 0)' }
    ], { duration: 780, delay, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    animations.add(animation);
    const cleanup = () => animations.delete(animation);
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
  }

  function render() {
    frameRequest = 0;
    if (!active || document.hidden || !desktop.matches) return;
    const height = window.innerHeight;
    // Read geometry together, then write transforms together to avoid layout churn.
    const positions = [...visible].map(frame => ({ frame, rect: frame.getBoundingClientRect() }));
    const heroRect = hero ? hero.getBoundingClientRect() : null;
    for (const { frame, rect } of positions) {
      if (rect.bottom < 0 || rect.top > height) continue;
      const progress = clamp((height - rect.top) / (height + rect.height));
      const offset = (progress - .5) * 4;
      const image = frame.querySelector('img');
      if (image) image.style.transform = `translate3d(0, ${offset.toFixed(3)}%, 0) scale(1.065)`;
    }
    if (heroRect && heroRect.bottom >= 0 && heroRect.top <= height) {
      const opening = clamp((height - heroRect.top) / (height * .75));
      const inset = (1 - opening) * 3;
      hero.style.clipPath = `inset(0 ${inset.toFixed(3)}% round ${((1 - opening) * 18).toFixed(2)}px)`;
    }
  }

  function schedule() {
    if (active && desktop.matches && !document.hidden && !frameRequest) {
      frameRequest = window.requestAnimationFrame(render);
    }
  }

  function resetImages() {
    frames.forEach(frame => frame.querySelector('img')?.style.removeProperty('transform'));
    if (hero) hero.style.removeProperty('clip-path');
  }

  function stop() {
    active = false;
    if (frameRequest) window.cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    revealObserver?.disconnect();
    imageObserver?.disconnect();
    visible.clear();
    [...animations].forEach(animation => animation.cancel());
    animations.clear();
    resetImages();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  }

  function start() {
    if (preference.matches || active) return;
    active = true;
    revealObserver = new IntersectionObserver(entries => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target, Math.min(order++ * 55, 165));
        revealObserver.unobserve(entry.target);
      }
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    revealTargets.forEach(element => revealObserver.observe(element));

    imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      schedule();
    }, { rootMargin: '120px 0px' });
    frames.forEach(frame => imageObserver.observe(frame));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    schedule();
  }

  preference.addEventListener('change', () => preference.matches ? stop() : start());
  desktop.addEventListener('change', () => {
    resetImages();
    schedule();
  });
  document.addEventListener('focusin', () => {
    // Never leave keyboard navigation waiting for a reveal.
    [...animations].forEach(animation => animation.finish());
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      [...animations].forEach(animation => animation.finish());
      if (frameRequest) window.cancelAnimationFrame(frameRequest);
      frameRequest = 0;
    } else schedule();
  });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', start);
  window.addEventListener('beforeprint', stop);
  window.addEventListener('afterprint', start);
  start();
})();

/* Video embeds. The still is the poster; pressing play swaps in the player
   itself, so the film runs in its own box rather than sending anyone away. */
(() => {
  'use strict';
  document.querySelectorAll('.video-embed[data-video]').forEach(figure => {
    const button = figure.querySelector('.video-play');
    if (!button) return;
    button.addEventListener('click', () => {
      const player = document.createElement('iframe');
      player.src = `https://www.youtube-nocookie.com/embed/${figure.dataset.video}?autoplay=1&rel=0`;
      player.title = figure.dataset.videoTitle || 'Video player';
      player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      player.allowFullscreen = true;
      figure.replaceChildren(player);
      player.focus();
    });
  });
})();
