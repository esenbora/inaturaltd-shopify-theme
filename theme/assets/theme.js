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

  // Search overlay → submits to Shopify's /search results page
  const search = document.querySelector('[data-search]');
  const searchInput = search ? search.querySelector('[data-search-input]') : null;
  function setSearch(open) {
    if (!search) return;
    search.hidden = false;
    requestAnimationFrame(() => search.classList.toggle('is-open', open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && searchInput) { searchInput.focus(); }
    if (!open) { setTimeout(() => { if (!search.classList.contains('is-open')) search.hidden = true; }, 280); }
  }
  document.querySelectorAll('[data-search-open]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); setSearch(true); }));
  document.querySelectorAll('[data-search-close]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); setSearch(false); }));

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setDrawer(false); setMobileMenu(false); setSearch(false); } });

  // Quantity selector
  document.querySelectorAll('[data-qty]').forEach((wrap) => {
    const input = wrap.querySelector('input');
    // Per-order cap, set from the product's metafield. The note only appears
    // once the shopper actually reaches it, otherwise the stepper looks broken
    // for no visible reason.
    const max = parseInt(input?.dataset.max || '0', 10) || Infinity;
    const note = document.querySelector('[data-qty-limit]');
    const showNote = (atLimit) => { if (note) note.hidden = !atLimit; };

    wrap.querySelector('[data-qty-dec]')?.addEventListener('click', () => {
      input.value = Math.max(1, parseInt(input.value || '1', 10) - 1);
      showNote(false);
    });
    wrap.querySelector('[data-qty-inc]')?.addEventListener('click', () => {
      const next = parseInt(input.value || '1', 10) + 1;
      input.value = Math.min(max, next);
      showNote(next > max);
    });
    // Typing straight into the field bypasses the buttons, so clamp there too.
    input?.addEventListener('change', () => {
      const typed = parseInt(input.value || '1', 10);
      const safe = Number.isFinite(typed) && typed > 0 ? typed : 1;
      input.value = Math.min(max, safe);
      showNote(safe > max);
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
      // Rebind controls inside new content
      drawer.querySelectorAll('[data-cart-close]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); setDrawer(false); }));
      drawer.querySelectorAll('[data-cart-remove]').forEach((a) => a.addEventListener('click', removeFromCart));
      bindDrawerQty();
    }
  }

  // Cart DRAWER quantity steppers — AJAX update then re-render the drawer
  async function changeDrawerLine(key, quantity) {
    const r = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ id: key, quantity: quantity }),
    });
    if (r.ok) { const cart = await r.json(); updateCount(cart.item_count); await refreshDrawer(); }
  }
  function bindDrawerQty() {
    if (!drawer) return;
    drawer.querySelectorAll('[data-drawer-qty]').forEach((wrap) => {
      const key = wrap.dataset.lineKey;
      const input = wrap.querySelector('[data-drawer-qty-input]');
      wrap.querySelector('[data-drawer-qty-dec]')?.addEventListener('click', () => changeDrawerLine(key, Math.max(0, parseInt(input.value || '1', 10) - 1)));
      // Cap increases at the product's per-order limit, same number the product
      // page enforces. Without this the basket is a way round the cap.
      const dMax = parseInt(wrap.dataset.max || '0', 10) || Infinity;
      wrap.querySelector('[data-drawer-qty-inc]')?.addEventListener('click', () => changeDrawerLine(key, Math.min(dMax, parseInt(input.value || '1', 10) + 1)));
      input?.addEventListener('change', () => changeDrawerLine(key, Math.max(0, parseInt(input.value || '0', 10))));
    });
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

  // Personalisation fields inside a product card sit within the card's link, so
  // a click or a space keypress would otherwise navigate away mid-typing.
  document.querySelectorAll('.product-card [data-personalisation]').forEach((field) => {
    ['click', 'mousedown', 'keydown', 'keyup'].forEach((evt) => {
      field.addEventListener(evt, (e) => e.stopPropagation());
    });
  });

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
      // Respect the quantity stepper. It used to be decorative: the stepper
      // updated its own input while the request always sent 1, so a shopper who
      // asked for three received one.
      const qtyInput = document.querySelector('[data-qty] input');
      const parsedQty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
      let quantity = Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : 1;

      // Per-order cap. The stepper already clamps, but the basket may already
      // hold some of this variant, so the real check is existing + requested.
      // Without this a shopper could add three, then three again.
      const maxPerOrder = parseInt(btn.dataset.max || '0', 10) || Infinity;
      if (maxPerOrder !== Infinity) {
        let alreadyInCart = 0;
        try {
          const cart = await (await fetch('/cart.js', { credentials: 'same-origin' })).json();
          alreadyInCart = (cart.items || [])
            .filter((i) => String(i.id) === String(variantId))
            .reduce((sum, i) => sum + i.quantity, 0);
        } catch (_) {
          // Cart unreadable: fall through on the stepper's clamp alone rather
          // than blocking a legitimate add.
        }
        const room = maxPerOrder - alreadyInCart;
        if (room <= 0) {
          const note = document.querySelector('[data-qty-limit]');
          if (note) note.hidden = false;
          // Same pattern the sold-out path uses: say it on the button, then
          // put the label back rather than leaving the shopper stuck.
          const label = btn.dataset.label || btn.textContent;
          btn.textContent = `Max ${maxPerOrder} in your bag`;
          setTimeout(() => { btn.textContent = label; }, 2400);
          return;
        }
        if (quantity > room) {
          quantity = room;
          const note = document.querySelector('[data-qty-limit]');
          if (note) note.hidden = false;
        }
      }

      // Personalisation, when the product asks for it. Validated here because a
      // blank or unusable name only surfaces after the order is placed otherwise.
      // Scope to the clicked card, otherwise every quick add on a collection
      // page would read the first card's field. On the product page there is no
      // card ancestor, so this falls back to the page-level block.
      const ownCard = btn.closest('.product-card');
      const personaliseWrap = ownCard
        ? ownCard.querySelector('[data-personalise]')
        : document.querySelector('[data-personalise]');
      const properties = {};
      if (personaliseWrap) {
        const field = personaliseWrap.querySelector('[data-personalisation]');
        const errorEl = personaliseWrap.querySelector('[data-personalisation-error]');
        const value = (field ? field.value : '').trim();
        const showError = (message) => {
          if (!errorEl) return;
          errorEl.textContent = message;
          errorEl.hidden = false;
          if (field) {
            field.setAttribute('aria-invalid', 'true');
            field.focus();
          }
        };
        if (errorEl) { errorEl.hidden = true; }
        if (field) field.removeAttribute('aria-invalid');

        if (value.length === 0) {
          showError('Please add the name for personalisation.');
          return;
        }
        if (!/^[\p{L} '-]+$/u.test(value)) {
          showError('Please use letters, spaces, apostrophes or hyphens only.');
          return;
        }
        properties[field.dataset.propertyName || 'Name'] = value;
      }

      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = 'Adding…';
      try {
        const line = { id: variantId, quantity: quantity };
        if (Object.keys(properties).length > 0) line.properties = properties;
        const r = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ items: [line] }),
        });
        if (!r.ok) {
          // Distinguish "out of stock" from a generic failure so we can tell the customer clearly
          let soldOut = false;
          try {
            const e = await r.json();
            const desc = ((e && (e.description || e.message)) || '').toLowerCase();
            soldOut = r.status === 422 || desc.indexOf('sold out') > -1 || desc.indexOf('out of stock') > -1 || desc.indexOf('stock') > -1 || desc.indexOf('unavailable') > -1;
          } catch (_) {}
          const fail = new Error('add failed'); fail.soldOut = soldOut; throw fail;
        }
        const cart = await fetchCart();
        updateCount(cart.item_count);
        await refreshDrawer();
        btn.textContent = 'Added ✓';
        setTimeout(() => setDrawer(true), 200);
        setTimeout(() => { btn.textContent = btn.dataset.label || originalText; btn.disabled = false; }, 1600);
      } catch (err) {
        if (err && err.soldOut) {
          // Out of stock — show a clear message and keep it disabled (retrying won't help until restocked)
          btn.textContent = 'Out of stock';
          btn.disabled = true;
          btn.setAttribute('aria-disabled', 'true');
          setTimeout(() => { btn.textContent = btn.dataset.label || originalText; btn.disabled = false; btn.removeAttribute('aria-disabled'); }, 2600);
        } else {
          btn.textContent = 'Try again';
          setTimeout(() => { btn.textContent = btn.dataset.label || originalText; btn.disabled = false; }, 1600);
        }
      }
    });
  });

  // "Complete the set" — add every remaining set member in one /cart/add.js call.
  // Multi-item add is atomic: if any line is sold out the whole request 422s and
  // nothing is added, so we surface that clearly rather than silently no-op.
  document.querySelectorAll('[data-add-set]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const ids = (btn.dataset.variantIds || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (!ids.length) { setDrawer(true); return; }
      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = 'Adding…';
      try {
        const r = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ items: ids.map((id) => ({ id: id, quantity: 1 })) }),
        });
        if (!r.ok) {
          let soldOut = false;
          try {
            const e = await r.json();
            const desc = ((e && (e.description || e.message)) || '').toLowerCase();
            soldOut = r.status === 422 || desc.indexOf('sold out') > -1 || desc.indexOf('out of stock') > -1 || desc.indexOf('stock') > -1 || desc.indexOf('unavailable') > -1;
          } catch (_) {}
          const fail = new Error('add failed'); fail.soldOut = soldOut; throw fail;
        }
        const cart = await fetchCart();
        updateCount(cart.item_count);
        await refreshDrawer();
        btn.textContent = 'Added ✓';
        setTimeout(() => setDrawer(true), 200);
        setTimeout(() => { btn.textContent = btn.dataset.label || originalText; btn.disabled = false; }, 1600);
      } catch (err) {
        btn.textContent = (err && err.soldOut) ? 'Some items unavailable' : 'Please try again';
        setTimeout(() => { btn.textContent = btn.dataset.label || originalText; btn.disabled = false; }, 2200);
      }
    });
  });

  // Also wire any existing remove links on initial page-load drawer state
  document.querySelectorAll('[data-cart-remove]').forEach((a) => a.addEventListener('click', removeFromCart));
  bindDrawerQty();

  // Cart PAGE: quantity steppers + remove. Uses a distinct [data-cart-line-remove]
  // (not the drawer's [data-cart-remove]) so the wiring above never double-fires here.
  // Reloads after each change so line prices + the Summary totals stay in sync.
  const cartPage = document.querySelector('[data-cart-page]');
  if (cartPage) {
    const changeLine = async (key, quantity) => {
      try {
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ id: key, quantity: quantity }),
        });
      } catch (err) { /* fall through to reload so the UI never desyncs */ }
      window.location.reload();
    };
    cartPage.querySelectorAll('[data-cart-qty]').forEach((wrap) => {
      const key = wrap.dataset.lineKey;
      const input = wrap.querySelector('[data-cart-qty-input]');
      wrap.querySelector('[data-cart-qty-dec]')?.addEventListener('click', () => changeLine(key, Math.max(0, parseInt(input.value || '1', 10) - 1)));
      const cMax = parseInt(wrap.dataset.max || '0', 10) || Infinity;
      wrap.querySelector('[data-cart-qty-inc]')?.addEventListener('click', () => changeLine(key, Math.min(cMax, parseInt(input.value || '1', 10) + 1)));
      input?.addEventListener('change', () => changeLine(key, Math.max(0, parseInt(input.value || '0', 10))));
    });
    cartPage.querySelectorAll('[data-cart-line-remove]').forEach((btn) => btn.addEventListener('click', (e) => { e.preventDefault(); changeLine(btn.dataset.lineKey, 0); }));
  }
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
    // form just submitted → mark as subscribed so it never nags again, show the thank-you state once
    if (popup.querySelector('[data-promo-success]')) {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      open();
      return;
    }
    let seen = false;
    try { seen = localStorage.getItem(KEY) === '1'; } catch (e) {}
    if (seen) return;
    let shown = false;
    const trigger = () => { if (shown) return; shown = true; open(); };
    const timer = setTimeout(trigger, 7000);
    document.addEventListener('mouseout', (e) => { if (e.clientY <= 0) { clearTimeout(timer); trigger(); } });
  })();

})();
