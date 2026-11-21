/* Shop layer: renders every product surface and owns quick view, wishlist and WhatsApp links.
   Motion lives in main.js; this file works with or without it. */
(function () {
  'use strict';
  var PHONE = '917005366288';
  var CAT = (window.CATALOG || []).slice();
  var SW = window.SWATCH || {};
  var byId = {};
  CAT.forEach(function (p) { byId[p.id] = p; p.swatch = SW[p.id] || '#3a2027'; p.family = family(p.name); });

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function wa(text) { return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text); }
  function kind(p) { return p.range || p.fabric || ''; }
  function enquiry(p) { return 'Hello Lynette, I’d like to enquire about “' + p.name + '” (ref ' + p.id + '). Photo: ' + p.url; }

  function family(name) {
    // judge the ground colour only: "Petrol blue with a gold border" is blue, not gold
    var n = name.toLowerCase().split(' with ')[0];
    var rules = [
      ['purple', /purple|lavender|violet|aubergine|plum|mauve/],
      ['earth', /rose taupe|taupe|brown|chocolate|bronze|ivory|white|champagne|ryndia|dusty rose|half khor/],
      ['grey', /grey|gray|charcoal|slate|black|silver/],
      ['red', /crimson|vermilion|wine|burgundy|maroon|mulberry|\bred\b/],
      ['gold', /yellow|mustard|golden|amber|apricot|butter|orange|gold/],
      ['blue', /teal|blue|turquoise|sapphire|petrol|cobalt|navy|peacock/],
      ['green', /green|sage|olive|moss/]
    ];
    for (var i = 0; i < rules.length; i++) if (rules[i][1].test(n)) return rules[i][0];
    return 'earth';
  }
  var FAMILIES = [
    ['all', 'All colours', 'conic-gradient(#842427,#edba07,#0486aa,#104626,#5e5181,#842427)'],
    ['red', 'Reds & wines', '#842427'], ['gold', 'Golds & ambers', '#d9a43a'], ['blue', 'Blues & teals', '#0486aa'],
    ['green', 'Greens', '#2f5a35'], ['purple', 'Purples', '#5e5181'], ['earth', 'Earth & ivory', '#b79277'], ['grey', 'Greys & black', '#6d6a64']
  ];
  var KINDS = [['all', 'Everything'], ['Premium', 'Premium'], ['Half Khor', 'Half Khor'], ['Ryndia', 'Ryndia']];
  var RANGES = [
    ['Dep Thaiñ', 'dep-thain'], ['Full Khor', 'full-khor'], ['Mukhla', 'mukhla'], ['Mukhli', 'mukhli'], ['Premium', 'premium']
  ];
  var PRICES = ['₹2,999', '₹3,500', '₹4,500', '₹7,500', '₹8,500'];

  function img(p, i, cls, eager) {
    var im = p.images[i || 0];
    return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + im.small + '" srcset="' + im.small + ' 480w, ' + im.src + ' ' + im.width + 'w" sizes="(max-width:760px) 60vw, 25vw" alt="' + esc(im.alt) + '" width="' + im.width + '" height="' + im.height + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async">';
  }
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5S3 14.8 3 8.9C3 4.2 9.2 2.8 12 7.4 14.8 2.8 21 4.2 21 8.9c0 5.9-9 11.6-9 11.6Z"/></svg>';

  /* ---------- colour rail ---------- */
  var rail = $('#colour-rail');
  var shades = CAT.filter(function (p) { return p.id.indexOf('Dfpt_6_Evtj') === 0; });
  if (rail) {
    rail.innerHTML = shades.map(function (p, i) {
      var name = p.name.replace(/ with a gold border$/i, '');
      return '<button type="button" class="shade" data-id="' + p.id + '" data-cursor="needle" style="--shade:' + p.swatch + '" aria-label="' + esc(p.name) + ', open details">' +
        '<span class="shade__frame"><span class="shade__num">' + String(i + 1).padStart(2, '0') + '</span>' + img(p, 0, '', i < 3) + '</span>' +
        '<span class="shade__name">' + esc(name) + '</span><span class="shade__sub"><i></i>Gold border · sizes 42–44</span></button>';
    }).join('') +
      '<div class="shade shade--end"><h3>Found <em>your</em> shade?</h3><p>Send the name and Lynette will confirm price and availability.</p><a class="btn btn--gold magnetic" data-cursor="Chat" target="_blank" rel="noopener" href="' + wa('Hello Lynette, I saw the gold-border colours for sizes 42–44. Which shades are available?') + '"><span>Ask about these shades</span></a></div>';
  }

  /* ---------- pairs ---------- */
  var stage = $('#pairs-stage');
  var pairIds = [1, 2, 3, 4, 5].map(function (n) { return ['Df2H1rtD5Wd-0' + n + '-left', 'Df2H1rtD5Wd-0' + n + '-right']; });
  if (stage) {
    stage.innerHTML = pairIds.map(function (pr, i) {
      return '<div class="pair" data-i="' + i + '">' + pr.map(function (id, side) {
        var p = byId[id];
        return '<div class="pair__half pair__half--' + (side ? 'r' : 'l') + '" style="--shade:' + p.swatch + '">' + img(p, 0, '', i === 0) +
          '<p class="pair__name"><small>' + (side ? 'Right' : 'Left') + ' · pair ' + (i + 1) + '</small>' + esc(p.name) + '</p>' +
          '<button type="button" data-id="' + id + '" data-cursor="needle" aria-label="' + esc(p.name) + ', open details"></button></div>';
      }).join('') + '</div>';
    }).join('');
    $('#pairs-dots').innerHTML = pairIds.map(function () { return '<li></li>'; }).join('');
  }

  /* ---------- stack ---------- */
  var cards = $('#stack-cards');
  var STACK = [
    { title: 'Ryndia', em: 'cloth', count: '6 pieces photographed', text: 'Posted on 29 October and 9 November: ivory Ryndia with rust, blue and brown borders, and Ryndia with printed pads.', ids: ['DfE3EgpmPrS-01', 'DfhS11kmEnP-01', 'DfE3EgpmPrS-02'], ask: 'Hello Lynette, I’d like to ask about your Ryndia pieces.' },
    { title: 'Half', em: 'Khor', count: '4 pieces photographed', text: 'Labelled Half Khor by the boutique: chocolate brown with a golden zari pad, white with orange and gold, dark florals and champagne with maroon motifs.', ids: ['DfpJqH9GMYd-01', 'DfpJqH9GMYd-02', 'DfpJqH9GMYd-04'], ask: 'Hello Lynette, I’d like to ask about your Half Khor pieces.' },
    { title: 'Premium', em: 'Dhara', count: 'From the Premium reel', text: 'An ivory Dhara with a maroon pad, shown in size 38–39. Ask Lynette what else sits in the Premium range today.', ids: ['DfUHpwdoBqU-01', 'DfE3EgpmPrS-03', 'DfpJqH9GMYd-03'], premium: true, ask: 'Hello Lynette, I’d like to ask about your Premium Dhara range.' }
  ];
  if (cards) {
    cards.innerHTML = STACK.map(function (s) {
      var ids = s.premium ? [s.ids[0]] : s.ids;
      return '<article class="scard"><div class="scard__media' + (s.premium ? ' scard__media--single' : '') + '">' + ids.map(function (id, i) {
        var p = byId[id];
        return '<figure data-id="' + id + '" data-cursor="needle" role="button" tabindex="0" aria-label="' + esc(p.name) + ', open details">' + img(p, 0) + '</figure>';
      }).join('') + '</div><div class="scard__copy"><p class="scard__count">' + s.count + '</p><h3>' + s.title + ' <em>' + s.em + '</em></h3><p>' + s.text + '</p>' +
        '<a class="btn btn--gold magnetic" data-cursor="Chat" target="_blank" rel="noopener" href="' + wa(s.ask) + '"><span>Ask about ' + s.title + (s.premium ? '' : ' ' + s.em) + '</span></a></div></article>';
    }).join('');
  }

  /* ---------- reels ---------- */
  var rowA = $('.reels__row--a'), rowB = $('.reels__row--b');
  function reel(id, imgIndex, label) {
    var p = byId[id]; if (!p) return '';
    var i = Math.min(imgIndex || 0, p.images.length - 1);
    return '<button type="button" class="reel" data-id="' + id + '" data-cursor="needle" style="--shade:' + p.swatch + '" aria-label="' + esc(p.name) + ', open details">' + img(p, i) + '<span>' + esc(label || p.name) + '</span></button>';
  }
  if (rowA) rowA.innerHTML = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'].map(function (n) { return reel('DfzonKjmInI-' + n); }).join('');
  if (rowB) rowB.innerHTML = [
    reel('Df2H1rtD5Wd-01-left', 1, 'Golden Mustard & Golden Yellow'), reel('DfhS11kmEnP-02'), reel('Df2H1rtD5Wd-02-left', 1, 'Deep Teal & Peacock Teal'),
    reel('DfE3EgpmPrS-03'), reel('Df2H1rtD5Wd-03-left', 1, 'Turquoise & Sapphire'), reel('DfRfTn1oIFv-01'), reel('Df2H1rtD5Wd-04-left', 1, 'Plum Wine & Burgundy Maroon'),
    reel('DfhS11kmEnP-03'), reel('Df2H1rtD5Wd-05-left', 1, 'Dusty Lavender & Royal Purple'), reel('DfKyiHCPVgK-01')
  ].join('');

  /* ---------- lookbook ---------- */
  var ring = $('#look-ring');
  // opens on pieces the earlier chapters didn't lead with
  var LOOK = ['DfpJqH9GMYd-04', 'DfUHpwdoBqU-01', 'DfhS11kmEnP-03', 'DfzonKjmInI-05', 'Dfpt_6_Evtj-07', 'DfKyiHCPVgK-01', 'DfzonKjmInI-03', 'Dfpt_6_Evtj-19',
    'DfE3EgpmPrS-02', 'DfRfTn1oIFv-01', 'Dfpt_6_Evtj-13', 'DfzonKjmInI-06', 'DfpJqH9GMYd-02', 'Dfpt_6_Evtj-16', 'DfhS11kmEnP-01', 'DfzonKjmInI-09'];
  if (ring) {
    ring.innerHTML = LOOK.map(function (id, i) {
      var p = byId[id];
      return '<button type="button" class="lcard" data-id="' + id + '" data-i="' + i + '" style="--shade:' + p.swatch + '" aria-label="' + esc(p.name) + ', open details" data-cursor="needle">' + img(p, 0, '', true) + '</button>';
    }).join('');
  }

  /* ---------- ranges + prices ---------- */
  var rlist = $('#range-list');
  if (rlist) rlist.innerHTML = RANGES.map(function (r, i) {
    return '<li class="rrow"><a href="' + wa('Hello Lynette, what do you have in the ' + r[0] + ' range today?') + '" target="_blank" rel="noopener" data-img="assets/ranges/' + r[1] + '.webp" data-cursor="Ask">' +
      '<span class="rrow__n">0' + (i + 1) + '</span><span class="rrow__name">' + r[0] + '</span><span class="rrow__go"><span>Ask on WhatsApp ↗</span><img src="assets/ranges/' + r[1] + '.webp" alt="" loading="lazy" width="52" height="52"></span></a></li>';
  }).join('');
  var prow = $('#price-row');
  if (prow) prow.innerHTML = PRICES.map(function (pr) {
    return '<a class="price magnetic" target="_blank" rel="noopener" href="' + wa('Hello Lynette, which pieces are in your ' + pr + ' highlight?') + '" aria-label="Ask which pieces are ' + pr + '">' + pr + '</a>';
  }).join('');

  /* ---------- collection grid + filters ---------- */
  var grid = $('#grid'), more = $('#more'), total = $('#total');
  var state = { family: 'all', kind: 'all', shown: 16 };
  var famEl = $('#filter-family'), kindEl = $('#filter-kind');
  famEl.innerHTML = FAMILIES.map(function (f) {
    var count = f[0] === 'all' ? CAT.length : CAT.filter(function (p) { return p.family === f[0]; }).length;
    return '<button type="button" class="chip" role="radio" data-family="' + f[0] + '" aria-checked="' + (f[0] === 'all') + '"><i style="background:' + f[2] + '"></i>' + f[1] + ' <small>' + count + '</small></button>';
  }).join('');
  kindEl.innerHTML = KINDS.map(function (k) {
    return '<button type="button" class="chip" role="radio" data-kind="' + k[0] + '" aria-checked="' + (k[0] === 'all') + '">' + k[1] + '</button>';
  }).join('');
  CAT.forEach(function (p) {
    var el = document.createElement('article');
    el.className = 'pcard'; el.dataset.id = p.id; el.dataset.flip = p.id;
    el.style.setProperty('--shade', p.swatch);
    el.innerHTML = '<button type="button" class="pcard__open" data-id="' + p.id + '" data-cursor="needle" aria-label="' + esc(p.name) + ', open details"><span class="pcard__frame">' + img(p, 0) + '</span></button>' +
      '<button type="button" class="pcard__save" data-save="' + p.id + '" aria-pressed="false" aria-label="Save ' + esc(p.name) + ' to wishlist">' + HEART + '</button>' +
      '<div class="pcard__meta"><div><p class="pcard__name">' + esc(p.name) + '</p><span class="pcard__kind">' + esc(kind(p) || 'Price on enquiry') + '</span>' +
      '<a class="pcard__wa" href="' + wa(enquiry(p)) + '" target="_blank" rel="noopener" data-cursor="Chat">Enquire on WhatsApp ↗</a></div></div>';
    p.el = el;
  });
  function matches(p) {
    return (state.family === 'all' || p.family === state.family) && (state.kind === 'all' || kind(p) === state.kind);
  }
  function renderGrid(animate) {
    var list = CAT.filter(matches);
    var flipState = animate && window.Flip && !document.documentElement.classList.contains('reduced') ? Flip.getState(grid.children) : null;
    var keep = list.slice(0, state.shown);
    grid.innerHTML = '';
    keep.forEach(function (p) { grid.appendChild(p.el); var m = p.el.querySelector('.pcard__meta'); if (m) m.style.opacity = ''; });
    if (!list.length) {
      var empty = document.createElement('p');
      empty.className = 'grid__empty';
      empty.innerHTML = 'No photographed pieces match both filters yet. <a href="' + wa('Hello Lynette, do you have anything in ' + (state.kind === 'all' ? 'this colour' : state.kind) + '?') + '" target="_blank" rel="noopener">Ask Lynette what she has ↗</a>';
      grid.appendChild(empty);
    }
    more.parentNode.hidden = list.length <= state.shown;
    total.textContent = list.length + (list.length === 1 ? ' piece' : ' pieces');
    if (flipState) {
      Flip.from(flipState, { duration: .8, ease: 'expo.out', stagger: .02, absolute: true, scale: true,
        onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, y: 40, rotate: 2 }, { opacity: 1, y: 0, rotate: 0, duration: .8, stagger: .03, ease: 'expo.out' }); },
        onLeave: function (els) { return gsap.set(els, { opacity: 0 }); },
        onComplete: function () { window.ScrollTrigger && ScrollTrigger.refresh(); } });
    } else if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 50);
    document.dispatchEvent(new CustomEvent('grid:render', { detail: { animate: !!animate } }));
  }
  function pick(group, attr, val) {
    group.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-checked', String(c.dataset[attr] === val)); });
  }
  famEl.addEventListener('click', function (e) { var c = e.target.closest('.chip'); if (!c) return; state.family = c.dataset.family; state.shown = 16; pick(famEl, 'family', state.family); renderGrid(true); });
  kindEl.addEventListener('click', function (e) { var c = e.target.closest('.chip'); if (!c) return; state.kind = c.dataset.kind; state.shown = 16; pick(kindEl, 'kind', state.kind); renderGrid(true); });
  more.addEventListener('click', function () { state.shown += 16; renderGrid(true); });
  renderGrid(false);

  /* ---------- wishlist ---------- */
  var wish = [];
  try { wish = JSON.parse(localStorage.getItem('ldc-wish') || '[]').filter(function (id) { return byId[id]; }); } catch (e) { wish = []; }
  function saveWish() { try { localStorage.setItem('ldc-wish', JSON.stringify(wish)); } catch (e) {} syncWish(); }
  function toggleWish(id) {
    var i = wish.indexOf(id);
    if (i > -1) { wish.splice(i, 1); toast('Removed from your wishlist'); } else { wish.push(id); toast('Saved · ' + wish.length + ' in your wishlist'); }
    saveWish();
    var btn = $('#open-wishlist');
    if (window.gsap && !document.documentElement.classList.contains('reduced')) gsap.fromTo(btn, { scale: 1.35 }, { scale: 1, duration: .8, ease: 'elastic.out(1,.4)' });
  }
  function syncWish() {
    $('#saved-count').textContent = wish.length;
    $('#open-wishlist').classList.toggle('has-items', wish.length > 0);
    document.querySelectorAll('[data-save]').forEach(function (b) { b.setAttribute('aria-pressed', String(wish.indexOf(b.dataset.save) > -1)); });
    var qs = $('#quick-save'); if (qs && qs.dataset.id) qs.querySelector('span').textContent = wish.indexOf(qs.dataset.id) > -1 ? 'Saved ✓' : 'Save to wishlist';
    var items = $('#wish-items');
    items.innerHTML = wish.map(function (id) {
      var p = byId[id];
      return '<li><img src="' + p.images[0].small + '" alt=""><div><p style="margin:0;font-family:var(--serif);font-size:1.2rem;line-height:1.1">' + esc(p.name) + '</p><small style="color:var(--mute)">ref ' + p.id + '</small></div><button type="button" data-remove="' + id + '" aria-label="Remove ' + esc(p.name) + '">×</button></li>';
    }).join('');
    $('#wish-empty').hidden = wish.length > 0;
    var link = $('#wish-wa');
    link.setAttribute('aria-disabled', String(!wish.length));
    link.href = wa('Hello Lynette, I’d like to enquire about these pieces:\n' + wish.map(function (id, i) { var p = byId[id]; return (i + 1) + '. ' + p.name + ' (ref ' + p.id + ') ' + p.url; }).join('\n'));
  }
  document.addEventListener('click', function (e) {
    var s = e.target.closest('[data-save]'); if (s) { e.preventDefault(); toggleWish(s.dataset.save); return; }
    var r = e.target.closest('[data-remove]'); if (r) { toggleWish(r.dataset.remove); return; }
  });
  $('#open-wishlist').addEventListener('click', function () { openDialog($('#wishlist')); });
  syncWish();

  /* ---------- toast ---------- */
  var tt;
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2200); }

  /* ---------- quick view ---------- */
  var quick = $('#quick'), qImg = $('#quick-img'), qZoom = $('#quick-zoom'), cur = null, curImg = 0, lastFocus = null;
  function openDialog(d) {
    lastFocus = document.activeElement;
    if (window.__lenis) window.__lenis.stop();
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }
  function closeDialog(d) { d.close ? d.close() : d.removeAttribute('open'); }
  [quick, $('#wishlist')].forEach(function (d) {
    d.addEventListener('close', function () { if (window.__lenis) window.__lenis.start(); setZoom(false); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); });
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) closeDialog(d); });
  });
  function showImg() {
    var im = cur.images[curImg];
    qImg.src = im.src; qImg.alt = im.alt; qImg.width = im.width; qImg.height = im.height;
    $('#quick-count').textContent = (curImg + 1) + ' / ' + cur.images.length;
    $('#quick-prev').hidden = $('#quick-next').hidden = cur.images.length < 2;
  }
  function openQuick(id) {
    var p = byId[id]; if (!p) return;
    cur = p; curImg = 0; showImg();
    $('#quick-title').textContent = p.name;
    $('#quick-kind').textContent = (kind(p) || 'Khasi wear') + ' · ref ' + p.id;
    $('#quick-dot').style.background = p.swatch;
    $('#quick-colour').textContent = (p.colors || []).join(' & ') || p.name;
    $('#quick-price').textContent = p.price ? '₹' + p.price.toLocaleString('en-IN') : 'Price on enquiry';
    $('#quick-notes').textContent = p.notes || '';
    $('#quick-wa').href = wa(enquiry(p));
    $('#quick-src').href = p.url;
    var qs = $('#quick-save'); qs.dataset.id = p.id; qs.dataset.save = p.id; syncWish();
    openDialog(quick);
  }
  function setZoom(on) { qZoom.classList.toggle('is-zoom', on); $('#quick-zoom-btn').setAttribute('aria-pressed', String(on)); $('#quick-zoom-btn').textContent = on ? 'Zoom −' : 'Zoom +'; if (!on) qImg.style.transformOrigin = '50% 50%'; }
  qZoom.addEventListener('click', function (e) { setZoom(!qZoom.classList.contains('is-zoom')); pan(e); });
  qZoom.addEventListener('pointermove', pan);
  function pan(e) {
    if (!qZoom.classList.contains('is-zoom') || e.clientX === undefined) return;
    var r = qZoom.getBoundingClientRect();
    qImg.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
  }
  qZoom.addEventListener('keydown', function (e) { if (e.key === 'z' || e.key === 'Enter') setZoom(!qZoom.classList.contains('is-zoom')); });
  $('#quick-zoom-btn').addEventListener('click', function () { setZoom(!qZoom.classList.contains('is-zoom')); });
  $('#quick-prev').addEventListener('click', function () { curImg = (curImg - 1 + cur.images.length) % cur.images.length; showImg(); });
  $('#quick-next').addEventListener('click', function () { curImg = (curImg + 1) % cur.images.length; showImg(); });
  quick.addEventListener('keydown', function (e) {
    if (!cur || cur.images.length < 2) return;
    if (e.key === 'ArrowRight') $('#quick-next').click(); if (e.key === 'ArrowLeft') $('#quick-prev').click();
  });

  // any element with data-id opens quick view (unless the lookbook is being dragged)
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-id]');
    if (!t || t.closest('dialog') || t.matches('.pcard')) return;
    if (document.documentElement.dataset.dragging === '1') return;
    openQuick(t.dataset.id);
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('figure[data-id]')) { e.preventDefault(); openQuick(e.target.dataset.id); }
  });

  /* ---------- mobile menu ---------- */
  var menuBtn = $('#menu-btn'), menu = $('#menu');
  menuBtn.addEventListener('click', function () {
    var open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; menuBtn.textContent = open ? 'Close' : 'Menu';
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]') || e.target.closest('#menu-close')) menuBtn.click(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) menuBtn.click(); });

  window.SHOP = { byId: byId, catalog: CAT, openQuick: openQuick, look: LOOK, toast: toast };
})();
