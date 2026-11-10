'use strict';
(() => {
  const root = document.documentElement;
  const loader = document.querySelector('.fv-loader');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!loader) return;
  const finish = () => {
    root.classList.remove('fv-intro-pending');
    delete root.dataset.fvIntroStart;
    loader.remove();
    motion.removeEventListener('change', onMotionChange);
  };
  const onMotionChange = () => { if (motion.matches) finish(); };
  if (!root.classList.contains('fv-intro-pending') || motion.matches) {
    finish();
    return;
  }
  motion.addEventListener('change', onMotionChange);
  window.addEventListener('pagehide', finish, { once:true });
  const hero = document.querySelector('.hero-image');
  const imageReady = hero ? hero.decode().catch(() => {}) : Promise.resolve();
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const remaining = Math.max(0, 2150 - (performance.now() - Number(root.dataset.fvIntroStart)));
  // Let critical resources load concurrently with the short visual introduction.
  Promise.all([imageReady, fontsReady, new Promise(resolve => setTimeout(resolve, remaining))])
    .then(() => {
      if (!loader.isConnected || motion.matches) return;
      loader.classList.add('is-revealing');
      loader.addEventListener('transitionend', finish, { once:true });
      setTimeout(finish, 600);
    });
})();
