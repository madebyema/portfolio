'use strict';
(() => {
  const root = document.documentElement;
  const copy = document.querySelector('.hero-copy');
  if (!copy) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  let observer;
  const finish = () => {
    root.classList.remove('hero-copy-pending', 'hero-copy-playing');
    observer?.disconnect();
    motion.removeEventListener('change', onMotionChange);
  };
  const onMotionChange = () => { if (motion.matches) finish(); };
  if (motion.matches || !root.classList.contains('hero-copy-pending')) {
    finish();
    return;
  }
  const start = async () => {
    if (started) return;
    started = true;
    observer?.disconnect();
    if (document.fonts) await document.fonts.ready;
    if (!motion.matches && root.classList.contains('hero-copy-pending')) {
      requestAnimationFrame(() => {
        if (!motion.matches && root.classList.contains('hero-copy-pending')) root.classList.add('hero-copy-playing');
      });
    }
  };
  motion.addEventListener('change', onMotionChange);
  copy.addEventListener('animationend', event => {
    if (event.animationName === 'hero-copy-emerge' && event.target === copy.lastElementChild) finish();
  });
  window.addEventListener('pagehide', finish, { once:true });
  // Observe completion without changing the loading screen or its timing.
  if (root.classList.contains('fv-intro-pending')) {
    observer = new MutationObserver(() => {
      if (!root.classList.contains('fv-intro-pending')) start();
    });
    observer.observe(root, { attributes:true, attributeFilter:['class'] });
  } else {
    start();
  }
})();
