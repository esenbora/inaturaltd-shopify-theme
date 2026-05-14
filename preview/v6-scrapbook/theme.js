/* INature UK — minimal interaction layer (mock) */
(function () {
  'use strict';

  // Cart drawer
  const drawer = document.querySelector('[data-cart-drawer]');
  const openBtns = document.querySelectorAll('[data-cart-open]');
  const closeEls = document.querySelectorAll('[data-cart-close]');

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  openBtns.forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); setDrawer(true); }));
  closeEls.forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); setDrawer(false); }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });

  // Quantity selector
  document.querySelectorAll('[data-qty]').forEach((wrap) => {
    const input = wrap.querySelector('input');
    wrap.querySelector('[data-qty-dec]')?.addEventListener('click', () => {
      input.value = Math.max(1, parseInt(input.value || '1', 10) - 1);
    });
    wrap.querySelector('[data-qty-inc]')?.addEventListener('click', () => {
      input.value = parseInt(input.value || '1', 10) + 1;
    });
  });

  // Variant swatch active state
  document.querySelectorAll('[data-swatch-group]').forEach((group) => {
    group.querySelectorAll('.swatch').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        group.querySelectorAll('.swatch').forEach((s) => s.classList.remove('is-active'));
        swatch.classList.add('is-active');
      });
    });
  });

  // Product gallery thumb switching
  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const main = gallery.querySelector('[data-gallery-main] img');
    const thumbs = gallery.querySelectorAll('[data-gallery-thumb]');
    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        thumbs.forEach((t) => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
        if (main) main.src = thumb.dataset.full || thumb.querySelector('img').src;
      });
    });
  });

  // Mock add-to-cart
  document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.textContent = 'Added ✓';
      setTimeout(() => setDrawer(true), 300);
      setTimeout(() => { btn.textContent = btn.dataset.label || 'Add to bag'; }, 1800);
    });
  });
})();
