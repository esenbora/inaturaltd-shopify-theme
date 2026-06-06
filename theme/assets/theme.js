/* INature UK — minimal interaction layer */
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

  // Real Shopify Ajax cart
  async function fetchCart() {
    const r = await fetch('/cart.js', { credentials: 'same-origin' });
    return r.json();
  }

  async function refreshDrawer() {
    // Refetch current page and extract fresh cart-drawer markup
    const r = await fetch(window.location.pathname, { credentials: 'same-origin' });
    const html = await r.text();
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const newDrawer = tmp.querySelector('[data-cart-drawer]');
    if (newDrawer && drawer) {
      drawer.innerHTML = newDrawer.innerHTML;
      // Rebind close buttons inside new content
      drawer.querySelectorAll('[data-cart-close]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); setDrawer(false); }));
      drawer.querySelectorAll('[data-cart-remove]').forEach((a) => a.addEventListener('click', removeFromCart));
    }
  }

  function updateCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = count; });
  }

  async function removeFromCart(e) {
    e.preventDefault();
    const key = e.currentTarget.dataset.lineKey;
    const r = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ id: key, quantity: 0 }),
    });
    if (r.ok) {
      const cart = await r.json();
      updateCount(cart.item_count);
      await refreshDrawer();
    }
  }

  // Real add-to-cart
  document.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const variantId = btn.dataset.variantId;
      if (!variantId) {
        // No variant context — preview/mock card → just open drawer
        setDrawer(true);
        return;
      }
      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = 'Adding…';
      try {
        const r = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] }),
        });
        if (!r.ok) throw new Error('add failed');
        const cart = await fetchCart();
        updateCount(cart.item_count);
        await refreshDrawer();
        btn.textContent = 'Added ✓';
        setTimeout(() => setDrawer(true), 200);
        setTimeout(() => { btn.textContent = btn.dataset.label || originalText; btn.disabled = false; }, 1600);
      } catch (err) {
        btn.textContent = 'Try again';
        setTimeout(() => { btn.textContent = btn.dataset.label || originalText; btn.disabled = false; }, 1600);
      }
    });
  });

  // Also wire any existing remove links on initial page-load drawer state
  document.querySelectorAll('[data-cart-remove]').forEach((a) => a.addEventListener('click', removeFromCart));
  // Brand verb cycler (above leaf)
  const brandVerbs = ['am', 'love', 'protect', 'trust', 'choose', 'care for', 'embrace', 'return to'];
  document.querySelectorAll('[data-brand-verb]').forEach((el) => {
    let i = 0;
    setInterval(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-30%) translateY(4px)';
      setTimeout(() => {
        i = (i + 1) % brandVerbs.length;
        el.textContent = brandVerbs[i];
        el.style.opacity = '1';
        el.style.transform = 'translateX(-30%) translateY(0)';
      }, 380);
    }, 2400);
  });

})();
