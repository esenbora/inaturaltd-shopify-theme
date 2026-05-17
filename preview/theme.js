/* INature UK — comprehensive interaction layer
   ============================================================
   • Cart (localStorage, drawer render, qty/remove, header count)
   • Filter pills (collection page)
   • Sort dropdown (collection page)
   • Search (header search → live filter overlay)
   • Newsletter form (validation + success)
   • Quantity stepper, variant swatches, gallery thumbs
   • Add-to-cart from card "Quick add"
   • Mobile menu hamburger
   • Dynamic product page via ?id=<slug>
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const CART_KEY = 'inature_cart_v1';
  const FREE_SHIP_THRESHOLD = 20;
  const FREE_GIFT_THRESHOLD = 12;

  // ─────── CART STATE ───────
  const cart = {
    items: [],
    load() {
      try {
        const raw = localStorage.getItem(CART_KEY);
        this.items = raw ? JSON.parse(raw) : [];
      } catch (e) { this.items = []; }
    },
    save() { localStorage.setItem(CART_KEY, JSON.stringify(this.items)); },
    add(p) {
      const ex = this.items.find((it) => it.id === p.id);
      if (ex) ex.qty += p.qty || 1;
      else this.items.push({ ...p, qty: p.qty || 1 });
      this.save(); this.afterChange();
    },
    remove(id) {
      this.items = this.items.filter((it) => it.id !== id);
      this.save(); this.afterChange();
    },
    setQty(id, qty) {
      const it = this.items.find((x) => x.id === id);
      if (!it) return;
      if (qty <= 0) return this.remove(id);
      it.qty = qty;
      this.save(); this.afterChange();
    },
    count() { return this.items.reduce((n, it) => n + it.qty, 0); },
    subtotal() { return this.items.reduce((s, it) => s + it.price * it.qty, 0); },
    afterChange() { renderDrawer(); updateHeaderCount(); },
  };

  function fmt(n) { return '£' + n.toFixed(2); }

  function updateHeaderCount() {
    const c = cart.count();
    $$('.icon-btn .count, [data-cart-count]').forEach((el) => {
      el.textContent = c;
      el.style.display = c > 0 ? '' : 'none';
    });
  }

  // ─────── DRAWER RENDER ───────
  function renderDrawer() {
    const drawer = $('[data-cart-drawer]');
    if (!drawer) return;
    const items = drawer.querySelector('.cart-drawer__items');
    const foot = drawer.querySelector('.cart-drawer__foot');
    if (!items || !foot) return;
    const subtotal = cart.subtotal();
    const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
    const giftUnlocked = subtotal >= FREE_GIFT_THRESHOLD;

    if (cart.items.length === 0) {
      items.innerHTML = `
        <div style="text-align:center;padding:48px 16px;color:var(--muted);">
          <p style="font-family:var(--font-heading);font-size:22px;margin-bottom:8px;">Your bag is empty</p>
          <p style="font-size:14px;">Add some natural skincare to get started.</p>
          <a href="collection.html" class="btn btn-primary" style="margin-top:20px;display:inline-flex;">Shop all</a>
        </div>`;
      foot.innerHTML = '';
      return;
    }

    items.innerHTML = cart.items.map((it) => `
      <div class="cart-line" data-line="${it.id}">
        <div class="cart-line__img"><img src="${it.image}" alt="${it.name}" width="200" height="250"></div>
        <div>
          <div class="cart-line__title">${it.name}</div>
          <div class="cart-line__variant">${it.variant || ''} · ${fmt(it.price)} ea</div>
          <div style="margin-top:6px;display:flex;align-items:center;gap:8px;">
            <span style="border:1px solid var(--border);border-radius:999px;display:inline-flex;align-items:center;background:var(--bg);">
              <button type="button" data-cart-dec="${it.id}" style="width:28px;height:28px;font-size:14px;">−</button>
              <span style="padding:0 10px;font-size:13px;font-weight:500;">${it.qty}</span>
              <button type="button" data-cart-inc="${it.id}" style="width:28px;height:28px;font-size:14px;">+</button>
            </span>
            <a href="#" data-cart-remove="${it.id}" style="font-size:var(--fs-xs);color:var(--muted);text-decoration:underline;">Remove</a>
          </div>
        </div>
        <div class="cart-line__price">${fmt(it.price * it.qty)}</div>
      </div>`).join('');

    if (giftUnlocked) {
      items.innerHTML += `
        <div class="cart-line" style="background:rgba(123,159,126,.08);border-radius:8px;padding:12px;margin-top:4px;">
          <div class="cart-line__img"><img src="https://static.wixstatic.com/media/bf3c53_b6212b6355fb434f9fa499b58ec5293c~mv2.webp/v1/fill/w_200,h_200,al_c,q_85/bf3c53_b6212b6355fb434f9fa499b58ec5293c~mv2.webp" alt="" width="200" height="250"></div>
          <div>
            <div class="cart-line__title">INCIA Lip Balm Coconut <span style="color:var(--primary-dark);font-size:var(--fs-xs);font-weight:600;">— FREE GIFT ✓</span></div>
            <div class="cart-line__variant">Spend £12+ unlocked · 5 ml</div>
          </div>
          <div class="cart-line__price" style="color:var(--primary-dark);">£0.00</div>
        </div>`;
    }

    const shipMsg = remaining > 0
      ? `<p style="font-size:var(--fs-xs);color:var(--muted);margin:0;">Add <strong style="color:var(--accent);">${fmt(remaining)}</strong> more for free UK shipping</p>`
      : `<p style="font-size:var(--fs-xs);color:var(--primary-dark);margin:0;">✓ Free UK shipping unlocked${giftUnlocked ? ' · ✓ Free Lip Balm added' : ''}</p>`;

    foot.innerHTML = `
      <div class="cart-totals"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      ${shipMsg}
      <a href="#" class="btn btn-primary btn-block btn-lg" data-cart-checkout>Checkout — ${fmt(subtotal)}</a>
      <a href="#" class="btn btn-ghost btn-block" data-cart-close>Keep shopping</a>`;
  }

  function setDrawer(open) {
    const d = $('[data-cart-drawer]');
    if (!d) return;
    d.classList.toggle('is-open', open);
    d.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  // ─────── EVENT DELEGATION ───────
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cart-open]')) { e.preventDefault(); setDrawer(true); return; }
    if (e.target.closest('[data-cart-close]')) { e.preventDefault(); setDrawer(false); return; }
    const inc = e.target.closest('[data-cart-inc]');
    if (inc) { e.preventDefault(); const id = inc.dataset.cartInc; const it = cart.items.find((x) => x.id === id); if (it) cart.setQty(id, it.qty + 1); return; }
    const dec = e.target.closest('[data-cart-dec]');
    if (dec) { e.preventDefault(); const id = dec.dataset.cartDec; const it = cart.items.find((x) => x.id === id); if (it) cart.setQty(id, it.qty - 1); return; }
    const rm = e.target.closest('[data-cart-remove]');
    if (rm) { e.preventDefault(); cart.remove(rm.dataset.cartRemove); return; }
    const co = e.target.closest('[data-cart-checkout]');
    if (co) { e.preventDefault(); alert(`Demo checkout — total ${fmt(cart.subtotal())}\nIn production this opens Shopify Checkout.`); return; }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });

  // ─────── PARSE & ADD-TO-CART ───────
  function parseCard(article) {
    const t = article.querySelector('.product-card__title, .pdp__title');
    const p = article.querySelector('.product-card__price .price-now, .product-card__price span:last-child, .pdp__price span:not(.pill):not([style*="line-through"])');
    const img = article.querySelector('.product-card__media img, .pdp__main img');
    const sub = article.querySelector('.product-card__sub, .pdp__subtitle, .muted[style*="margin: -10px"]');
    if (!t) return null;
    const name = t.textContent.trim();
    const price = p ? parseFloat(p.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
    return { id, name, price, image: img ? img.src : '', variant: sub ? sub.textContent.split('·').slice(-1)[0].trim() : '' };
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart], button.product-card__quick');
    if (!btn) return;
    e.preventDefault();
    let article = btn.closest('article.product-card');
    let product = null;
    if (article) product = parseCard(article);
    else {
      const pdp = $('.pdp');
      if (pdp) {
        product = parseCard(pdp);
        const qty = pdp.querySelector('[data-qty] input');
        if (qty && product) product.qty = parseInt(qty.value, 10) || 1;
      }
    }
    if (!product || !product.name) return;
    cart.add(product);
    const orig = btn.textContent;
    btn.textContent = 'Added ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
    setTimeout(() => setDrawer(true), 350);
  });

  // ─────── QUANTITY STEPPER ───────
  document.addEventListener('click', (e) => {
    const dec = e.target.closest('[data-qty-dec]');
    const inc = e.target.closest('[data-qty-inc]');
    if (!dec && !inc) return;
    const wrap = (dec || inc).closest('[data-qty]');
    if (!wrap) return;
    const input = wrap.querySelector('input');
    if (!input) return;
    let v = parseInt(input.value, 10) || 1;
    input.value = dec ? Math.max(1, v - 1) : v + 1;
  });

  // ─────── VARIANT SWATCHES ───────
  $$('[data-swatch-group]').forEach((g) => {
    g.querySelectorAll('.swatch:not(.is-disabled)').forEach((s) => {
      s.addEventListener('click', () => {
        g.querySelectorAll('.swatch').forEach((x) => x.classList.remove('is-active'));
        s.classList.add('is-active');
      });
    });
  });

  // ─────── GALLERY ───────
  $$('[data-gallery]').forEach((g) => {
    const main = g.querySelector('[data-gallery-main] img');
    g.querySelectorAll('[data-gallery-thumb]').forEach((t) => {
      t.addEventListener('click', () => {
        g.querySelectorAll('[data-gallery-thumb]').forEach((x) => x.classList.remove('is-active'));
        t.classList.add('is-active');
        if (main) main.src = t.dataset.full || t.querySelector('img').src;
      });
    });
  });

  // ─────── FILTER + SORT (collection page) ───────
  (function setupCollection() {
    const grid = $('.product-grid');
    const pillsWrap = $('.filter-pills');
    const cards = $$('article.product-card', grid || document);
    if (!grid || cards.length === 0) return;

    cards.forEach((card) => {
      const title = (card.querySelector('.product-card__title') || {}).textContent || '';
      const sub = (card.querySelector('.product-card__sub') || {}).textContent || '';
      const text = (title + ' ' + sub).toLowerCase();
      const cats = [];
      if (/baby|pregnancy|child|kids|nipple|stretch mark|diaper|newborn/.test(text)) cats.push('baby');
      if (/sun ?screen|spf/.test(text)) cats.push('sun');
      if (/laundry|dishwash|household/.test(text)) cats.push('household');
      if (/deodorant|lip balm|hair serum|toothpaste|cleanser|cream|gel|stick|wash foam|eyelash|combing|shampoo|oil/.test(text)) cats.push('personal');
      const tags = [];
      card.querySelectorAll('.pill-soft').forEach((p) => {
        const t = p.textContent.toLowerCase();
        if (/bestseller/.test(t)) tags.push('bestseller');
        if (/new/.test(t)) tags.push('new');
      });
      if (card.querySelector('.pill-accent') || card.querySelector('.price-was')) tags.push('sale');
      card.dataset.category = cats.join(',');
      card.dataset.tags = tags.join(',');
      const priceEl = card.querySelector('.product-card__price .price-now, .product-card__price span:last-child');
      card.dataset.price = priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;
    });

    function applyFilter(filter) {
      cards.forEach((card) => {
        let show = filter === 'all';
        if (['bestseller', 'new', 'sale'].includes(filter)) {
          show = (card.dataset.tags || '').split(',').includes(filter);
        } else if (['baby', 'personal', 'sun', 'household'].includes(filter)) {
          show = (card.dataset.category || '').split(',').includes(filter);
        }
        card.style.display = show ? '' : 'none';
      });
      const visible = cards.filter((c) => c.style.display !== 'none').length;
      const countLabel = $('.collection-toolbar .muted');
      if (countLabel) countLabel.textContent = `${visible} products`;
    }

    if (pillsWrap) {
      pillsWrap.querySelectorAll('.pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          pillsWrap.querySelectorAll('.pill').forEach((p) => p.classList.remove('pill-soft'));
          pill.classList.add('pill-soft');
          const t = pill.textContent.toLowerCase();
          let f = 'all';
          if (t.includes('bestseller')) f = 'bestseller';
          else if (t.includes('baby')) f = 'baby';
          else if (t.includes('personal')) f = 'personal';
          else if (t.includes('sun')) f = 'sun';
          else if (t.includes('household')) f = 'household';
          else if (t.includes('sale')) f = 'sale';
          applyFilter(f);
        });
      });
    }

    const sortSel = $('.collection-toolbar select');
    if (sortSel) {
      sortSel.addEventListener('change', () => {
        const visible = $$('article.product-card', grid);
        const val = sortSel.value.toLowerCase();
        const sorted = visible.slice().sort((a, b) => {
          const pa = parseFloat(a.dataset.price) || 0;
          const pb = parseFloat(b.dataset.price) || 0;
          if (val.includes('low')) return pa - pb;
          if (val.includes('high')) return pb - pa;
          if (val.includes('bestseller')) {
            return ((b.dataset.tags || '').includes('bestseller') ? 1 : 0) - ((a.dataset.tags || '').includes('bestseller') ? 1 : 0);
          }
          if (val.includes('new')) {
            return ((b.dataset.tags || '').includes('new') ? 1 : 0) - ((a.dataset.tags || '').includes('new') ? 1 : 0);
          }
          if (val.includes('sale')) {
            return ((b.dataset.tags || '').includes('sale') ? 1 : 0) - ((a.dataset.tags || '').includes('sale') ? 1 : 0);
          }
          return 0;
        });
        sorted.forEach((c) => grid.appendChild(c));
      });
    }

    // Load more button
    const loadMore = grid.parentElement.querySelector('.btn-outline.btn-lg, button[type="button"]');
    if (loadMore && loadMore.textContent.toLowerCase().includes('load')) {
      loadMore.addEventListener('click', () => {
        loadMore.textContent = 'All products loaded ✓';
        loadMore.disabled = true;
      });
    }
  
  // ─────── BRAND VERB CYCLER (above leaf) ───────
  const brandVerbs = ['am', 'love', 'protect', 'trust', 'choose', 'care for', 'embrace', 'return to'];
  $$('[data-brand-verb]').forEach((el) => {
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

  // ─────── SEARCH ───────
  const searchBtn = $('.site-header__actions button[aria-label="Search"]') || $$('.site-header__actions button')[0];
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if ($('[data-search-overlay]')) return;
      const overlay = document.createElement('div');
      overlay.setAttribute('data-search-overlay', '');
      Object.assign(overlay.style, {
        position: 'fixed', inset: '0', background: 'rgba(42,45,42,.4)', zIndex: '95',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh', backdropFilter: 'blur(8px)',
      });
      overlay.innerHTML = `
        <div style="background:var(--bg);width:min(640px,92vw);border-radius:20px;box-shadow:var(--shadow-lg);padding:24px;max-height:70vh;display:flex;flex-direction:column;gap:16px;">
          <div style="display:flex;gap:12px;align-items:center;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="search" data-search-input placeholder="Search natural skincare, INCIA…" autofocus style="flex:1;border:0;background:transparent;font-size:18px;font-family:var(--font-body);outline:none;">
            <button data-search-close type="button" style="font-size:14px;color:var(--muted);padding:4px 10px;">Close (Esc)</button>
          </div>
          <div data-search-results style="overflow-y:auto;max-height:50vh;display:grid;gap:8px;"></div>
        </div>`;
      document.body.appendChild(overlay);

      const products = [
        { name: 'INCIA Natural Deodorant for Sensitive Skin', price: 5.95, url: 'product.html?id=incia-natural-deodorant-for-sensitive-skin' },
        { name: 'INCIA SOS Stick', price: 9.50, url: 'product.html?id=incia-sos-stick' },
        { name: 'INCIA Natural Hair Serum', price: 10.45, url: 'product.html?id=incia-natural-hair-serum' },
        { name: 'INCIA Foaming Facial Cleanser', price: 8.00, url: 'product.html?id=incia-foaming-facial-cleanser' },
        { name: 'INCIA Natural Sunscreen for Face SPF50', price: 12.00, url: 'product.html?id=incia-natural-sunscreen-for-face-spf50' },
        { name: 'INCIA Natural Sunscreen Lotion for All Family', price: 14.00, url: 'product.html?id=incia-natural-sunscreen-lotion-for-all-family' },
        { name: 'INCIA Natural Sunscreen for Baby and Child SPF50', price: 13.00, url: 'product.html?id=incia-natural-sunscreen-for-baby-and-child-spf50' },
        { name: 'INCIA Lip Balm Coconut', price: 5.95, url: 'product.html?id=incia-lip-balm-coconut' },
        { name: 'INCIA Lip Balm Cinnamon', price: 5.95, url: 'product.html?id=incia-lip-balm-cinnamon' },
        { name: 'INCIA Lip Balm Orange', price: 5.95, url: 'product.html?id=incia-lip-balm-orange' },
        { name: 'INCIA Stretch Mark Gel Cream', price: 13.50, url: 'product.html?id=incia-stretch-mark-gel-cream' },
        { name: 'INCIA Natural Toothpaste', price: 7.00, url: 'product.html?id=incia-natural-toothpaste' },
        { name: 'INCIA Natural Easy Combing Spray', price: 8.00, url: 'product.html?id=incia-natural-easy-combing-spray' },
        { name: 'INCIA Feminine Intimate Wash Foam', price: 11.00, url: 'product.html?id=incia-feminine-intimate-wash-foam' },
        { name: 'INCIA Nipple Cream', price: 8.00, url: 'product.html?id=incia-nipple-cream' },
        { name: 'INCIA Eyelash Serum', price: 12.00, url: 'product.html?id=incia-eyelash-serum' },
        { name: 'INCIA Natural Baby Oil', price: 10.00, url: 'product.html?id=incia-natural-baby-oil' },
        { name: 'INCIA Nourishing & Hydrating Gel for Dry Skin', price: 9.00, url: 'product.html?id=incia-nourishing-hydrating-gel-for-dry-skin' },
        { name: 'INCIA Natural Herbal Shampoo', price: 9.00, url: 'product.html?id=incia-natural-herbal-shampoo' },
        { name: 'INCIA Natural Baby & Kids Shampoo', price: 11.00, url: 'product.html?id=incia-natural-baby-kids-shampoo' },
        { name: 'INCIA Intensive Repair Care Cream for Dry Skin', price: 9.00, url: 'product.html?id=incia-intensive-repair-care-cream-for-dry-skin' },
        { name: 'INCIA Natural Remedy for Insect Bites', price: 10.00, url: 'product.html?id=incia-natural-remedy-for-insect-bites' },
      ];

      const input = overlay.querySelector('[data-search-input]');
      const results = overlay.querySelector('[data-search-results]');
      function render(q) {
        const query = q.trim().toLowerCase();
        const matches = query ? products.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 12) : products.slice(0, 6);
        if (matches.length === 0) {
          results.innerHTML = `<p style="color:var(--muted);text-align:center;padding:24px;">No products match "<strong>${q}</strong>". Try "serum", "baby", "SPF50"…</p>`;
          return;
        }
        results.innerHTML = matches.map((p) => `
          <a href="${p.url}" style="display:flex;justify-content:space-between;gap:12px;padding:12px 14px;border:1px solid var(--border);border-radius:10px;background:var(--surface);">
            <span style="font-weight:500;">${p.name}</span>
            <span style="color:var(--primary-dark);font-weight:600;">${fmt(p.price)}</span>
          </a>`).join('');
      }
      input.addEventListener('input', () => render(input.value));
      render('');

      function close() { overlay.remove(); }
      overlay.querySelector('[data-search-close]').addEventListener('click', close);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
      document.addEventListener('keydown', function once(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', once); }
      });
    });
  }

  // ─────── NEWSLETTER FORM ───────
  $$('.newsletter form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type=email]');
      const btn = form.querySelector('button[type=submit]');
      if (!email || !email.value.includes('@')) { email && email.focus(); return; }
      try {
        const subs = JSON.parse(localStorage.getItem('inature_subs') || '[]');
        if (!subs.includes(email.value)) subs.push(email.value);
        localStorage.setItem('inature_subs', JSON.stringify(subs));
      } catch (e) {}
      const origText = btn.textContent;
      btn.textContent = 'Sent ✓ Check inbox';
      btn.disabled = true;
      email.value = '';
      setTimeout(() => { btn.textContent = origText; btn.disabled = false; }, 4000);
    });
  });

  // ─────── MOBILE MENU ───────
  if (window.innerWidth <= 720) {
    const header = $('.site-header__inner');
    if (header && !$('[data-mobile-toggle]')) {
      const btn = document.createElement('button');
      btn.setAttribute('data-mobile-toggle', '');
      btn.setAttribute('aria-label', 'Open menu');
      btn.className = 'icon-btn';
      btn.style.order = '-1';
      btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
      header.prepend(btn);
      btn.addEventListener('click', () => {
        const nav = $('.site-header__nav');
        if (!nav) return;
        const open = nav.classList.toggle('is-open');
        if (open) {
          Object.assign(nav.style, {
            display: 'flex', flexDirection: 'column', position: 'fixed', top: '60px', left: '0', right: '0',
            background: 'var(--bg)', padding: '24px', borderBottom: '1px solid var(--border)', zIndex: '49', gap: '16px',
          });
        } else { nav.style.cssText = ''; }
      });
    }
  }

  // ─────── PRODUCT CARD LINKS → add ?id=<slug> ───────
  $$('article.product-card a[href="product.html"]').forEach((link) => {
    const article = link.closest('article.product-card');
    const title = article.querySelector('.product-card__title')?.textContent.trim();
    if (!title) return;
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
    link.href = `product.html?id=${id}`;
  });

  // ─────── DYNAMIC PRODUCT PAGE ───────
  function bindProductPage() {
    const pdp = $('.pdp');
    if (!pdp || !window.INATURE_PRODUCTS) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;
    const product = window.INATURE_PRODUCTS[id];
    if (!product) return;

    document.title = `${product.name} | INature`;
    const titleEl = pdp.querySelector('.pdp__title');
    const subEl = pdp.querySelector('p.muted[style*="margin: -10px"]');
    const vendorEl = pdp.querySelector('.pdp__vendor');
    const priceEl = pdp.querySelector('.pdp__price');
    const shortEl = pdp.querySelector('.pdp__short');
    const mainImg = pdp.querySelector('[data-gallery-main] img');
    const thumb = pdp.querySelector('[data-gallery-thumb]');
    const ratingNum = pdp.querySelector('.pdp__rating strong');
    const reviewsEl = pdp.querySelector('.pdp__rating .muted');
    const addBtn = pdp.querySelector('[data-add-to-cart]');
    const breadcrumb = document.querySelector('main > section.wrap > nav span:last-child');
    const stickyTitle = $('.pdp-sticky strong');
    const stickyPrice = $('.pdp-sticky .muted');

    if (titleEl) titleEl.textContent = product.name;
    if (subEl) subEl.textContent = product.sub || '';
    if (vendorEl) vendorEl.textContent = product.vendor || 'INCIA · By INature UK';
    if (priceEl) {
      priceEl.innerHTML = product.was
        ? `<span style="color:var(--muted);text-decoration:line-through;font-size:var(--fs-xl);">£${product.was.toFixed(2)}</span><span>£${product.price.toFixed(2)}</span><span class="pill pill-accent">Save ${Math.round((1 - product.price / product.was) * 100)}%</span>`
        : `<span>£${product.price.toFixed(2)}</span><span class="pill pill-soft">In stock · Ships in 24h</span>`;
    }
    if (shortEl) shortEl.textContent = product.description || '';
    if (mainImg) { mainImg.src = product.image; mainImg.alt = product.name; }
    if (thumb) {
      thumb.dataset.full = product.image;
      const img = thumb.querySelector('img');
      if (img) img.src = product.image;
    }
    if (ratingNum) ratingNum.textContent = (product.rating || 4.8).toFixed(1);
    if (reviewsEl) reviewsEl.textContent = `· ${product.reviews || 0} verified reviews`;
    if (addBtn) {
      addBtn.textContent = `Add to bag — £${product.price.toFixed(2)}`;
      addBtn.dataset.label = `Add to bag — £${product.price.toFixed(2)}`;
    }
    if (stickyTitle) stickyTitle.textContent = product.name.replace('INCIA ', '');
    if (stickyPrice) stickyPrice.textContent = `${product.size || ''} · £${product.price.toFixed(2)}`;
    if (breadcrumb) breadcrumb.textContent = product.name;
  }
  bindProductPage();

  // ─────── INIT ───────
  cart.load();
  renderDrawer();
  updateHeaderCount();
})();
