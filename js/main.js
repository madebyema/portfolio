'use strict';
// A direct visit to a work page also counts as this tab's first site visit.
try { sessionStorage.setItem('portfolio-fv-intro-seen-v1', '1'); } catch (_) {}
const menuButton = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
if (menuButton && primaryNav) {
  const setMenu = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('.visually-hidden').textContent = open ? 'メニューを閉じる' : 'メニューを開く';
    primaryNav.classList.toggle('is-open', open);
  };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  primaryNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) setMenu(false);
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', () => setMenu(false));
}
// Wait for local fonts before the long jump so text reflow cannot move the target.
const designLink = document.querySelector('a[href="#design"]');
if (designLink) {
  designLink.addEventListener('click', async (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById('design');
    if (!target) return;
    event.preventDefault();
    if (document.fonts) await document.fonts.ready;
    history.pushState(null, '', '#design');
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  });
}
