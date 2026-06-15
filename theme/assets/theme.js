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

  // Mobile menu
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const mobileMenuOpenBtns = document.querySelectorAll('[data-mobile-menu-open]');
  const mobileMenuCloseEls = document.querySelectorAll('[data-mobile-menu-close]');
  function setMobileMenu(open) {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  mobileMenuOpenBtns.forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); setMobileMenu(true); }));
  mobileMenuCloseEls.forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); setMobileMenu(false); }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setDrawer(false); setMobileMenu(false); } });

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

  // Animated accordion (PDP sub-sections) — smooth height expand/collapse on native <details>
  function initAccordions(root) {
    (root || document).querySelectorAll('.accordion details').forEach((d) => {
      if (d.dataset.accInit) return;
      d.dataset.accInit = '1';
      const summary = d.querySelector('summary');
      const body = summary && summary.nextElementSibling;
      if (!summary || !body) return;
      body.style.overflow = 'hidden';
      body.style.willChange = 'height';
      if (!d.open) body.style.height = '0px';
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        if (d.dataset.animating === '1') return;
        d.dataset.animating = '1';
        if (d.open) {
          body.style.height = body.scrollHeight + 'px';
          requestAnimationFrame(() => {
            body.style.transition = 'height .3s ease';
            body.style.height = '0px';
          });
          const done = () => {
            d.open = false;
            body.style.transition = '';
            d.dataset.animating = '0';
            body.removeEventListener('transitionend', done);
          };
          body.addEventListener('transitionend', done);
        } else {
          d.open = true;
          body.style.height = '0px';
          const target = body.scrollHeight;
          requestAnimationFrame(() => {
            body.style.transition = 'height .3s ease';
            body.style.height = target + 'px';
          });
          const done = () => {
            body.style.height = 'auto';
            body.style.transition = '';
            d.dataset.animating = '0';
            body.removeEventListener('transitionend', done);
          };
          body.addEventListener('transitionend', done);
        }
      });
    });
  }
  initAccordions();
  // re-init in Shopify theme editor when a section reloads
  document.addEventListener('shopify:section:load', (e) => initAccordions(e.target));

  // Welcome promo popup — first visit (7s delay or exit-intent), once per visitor
  (function () {
    const popup = document.querySelector('[data-promo-popup]');
    if (!popup) return;
    const KEY = 'inature_promo_seen';
    const open = () => {
      popup.hidden = false;
      requestAnimationFrame(() => popup.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      popup.classList.remove('is-open');
      document.body.style.overflow = '';
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      setTimeout(() => { popup.hidden = true; }, 320);
    };
    popup.querySelectorAll('[data-promo-close]').forEach((b) => b.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !popup.hidden) close(); });
    // form just submitted → show immediately with the thank-you state
    if (popup.querySelector('.promo-popup__ok')) { open(); return; }
    let seen = false;
    try { seen = localStorage.getItem(KEY) === '1'; } catch (e) {}
    if (seen) return;
    let shown = false;
    const trigger = () => { if (shown) return; shown = true; open(); };
    const timer = setTimeout(trigger, 7000);
    document.addEventListener('mouseout', (e) => { if (e.clientY <= 0) { clearTimeout(timer); trigger(); } });
  })();

})();
