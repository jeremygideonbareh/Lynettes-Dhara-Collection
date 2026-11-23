/* Lynette's Dhara Collection — boutique shop. Catalogue, crafts, colour finder, quick view,
   a bag that sends one WhatsApp order, and calm editorial motion (GSAP + Lenis). */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var PHONE = '917005366288';
  var html = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var wa = function (t) { return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(t); };
  var up = function (p) { return '../' + p; };

  // ---------- data ----------
  var SW = window.SWATCH || {};
  var CAT = (window.CATALOG || []).map(function (p) { p.swatch = SW[p.id] || '#3a2027'; p.family = family(p.name); p.craft = craftOf(p); return p; });
  var byId = {}; CAT.forEach(function (p) { byId[p.id] = p; });

  // crafts follow how the boutique itself grouped and labelled its posts (no invented ranges)
  var CRAFTS = [
    { id: 'gold', name: 'Gold border', note: 'sizes 42–44', cover: 'Dfpt_6_Evtj-05' },
    { id: 'new', name: 'New arrivals', cover: 'DfzonKjmInI-08' },
    { id: 'pairs', name: 'Shade pairs', cover: 'Df2H1rtD5Wd-04-left', coverImg: 1 },
    { id: 'ryndia', name: 'Ryndia', cover: 'DfE3EgpmPrS-01' },
    { id: 'halfkhor', name: 'Half Khor', cover: 'DfpJqH9GMYd-01' },
    { id: 'premium', name: 'Premium', cover: 'DfUHpwdoBqU-01' }
  ];
  var CRAFT_LABEL = { gold: 'Gold border · 42–44', 'new': 'New arrivals', pairs: 'Shade pairs', ryndia: 'Ryndia', halfkhor: 'Half Khor', premium: 'Premium Dhara', more: 'Khasi wear' };
  function craftOf(p) {
    if (p.range === 'Premium') return 'premium';
    if (p.range === 'Half Khor') return 'halfkhor';
    if (p.fabric === 'Ryndia') return 'ryndia';
    if (p.id.indexOf('Dfpt_6_Evtj') === 0) return 'gold';
    if (p.id.indexOf('DfzonKjmInI') === 0) return 'new';
    if (p.id.indexOf('Df2H1rtD5Wd') === 0) return 'pairs';
    return 'more';
  }
  function family(name) {
    var n = name.toLowerCase().split(' with ')[0];
    var rules = [['purple', /purple|lavender|violet|aubergine|plum|mauve/], ['earth', /rose taupe|taupe|brown|chocolate|bronze|ivory|white|champagne|ryndia|dusty rose|half khor/],
      ['grey', /grey|gray|charcoal|slate|black|silver/], ['red', /crimson|vermilion|wine|burgundy|maroon|mulberry|\bred\b/],
      ['gold', /yellow|mustard|golden|amber|apricot|butter|orange|gold/], ['blue', /teal|blue|turquoise|sapphire|petrol|cobalt|navy|peacock/], ['green', /green|sage|olive|moss/]];
    for (var i = 0; i < rules.length; i++) if (rules[i][1].test(n)) return rules[i][0];
    return 'earth';
  }
  var FAMILIES = [['all', 'All colours', 'conic-gradient(#842427,#edba07,#0486aa,#104626,#5e5181,#842427)'], ['red', 'Red & wine', '#842427'], ['gold', 'Gold & amber', '#d9a43a'],
    ['blue', 'Blue & teal', '#0486aa'], ['green', 'Green', '#2f5a35'], ['purple', 'Purple', '#5e5181'], ['earth', 'Ivory & brown', '#b79277'], ['grey', 'Grey & black', '#6d6a64']];

  function img(p, i, sizes, eager) {
    var im = p.images[i || 0];
    return '<img src="' + up(im.small) + '" srcset="' + up(im.small) + ' 480w, ' + up(im.src) + ' ' + im.width + 'w" sizes="' + (sizes || '(max-width:760px) 50vw, 25vw') + '" alt="' + esc(im.alt) + '" width="' + im.width + '" height="' + im.height + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async">';
  }
  var enquiry = function (p) { return 'Hello Lynette, I’d like to enquire about “' + p.name + '” (ref ' + p.id + '). Photo: ' + p.url; };

  // ---------- crafts ----------
  $('#crafts-row').innerHTML = CRAFTS.map(function (c) {
    var n = CAT.filter(function (p) { return p.craft === c.id; }).length;
    var p = byId[c.cover];
    return '<button type="button" class="craft" data-craft="' + c.id + '"><span class="craft__img">' + img(p, c.coverImg || 0, '(max-width:760px) 50vw, 16vw') + '</span>' +
      '<span class="craft__name">' + c.name + '</span><span class="craft__n">' + n + (n === 1 ? ' piece' : ' pieces') + (c.note ? ' · ' + c.note : '') + '</span></button>';
  }).join('');

  // ---------- just in ----------
  $('#new-row').innerHTML = CAT.filter(function (p) { return p.craft === 'new'; }).map(function (p) {
    return '<button type="button" class="tall" data-qv="' + p.id + '" aria-label="' + esc(p.name) + ', quick view">' + img(p, 0, '(max-width:760px) 68vw, 23vw') + '<span>' + esc(p.name) + '</span></button>';
  }).join('');

  // ---------- colour + type filters ----------
  var state = { family: 'all', craft: 'all', shown: 12 };
  $('#colour-list').innerHTML = FAMILIES.map(function (f) {
    var n = f[0] === 'all' ? CAT.length : CAT.filter(function (p) { return p.family === f[0]; }).length;
    return '<button type="button" class="cchip" role="radio" data-family="' + f[0] + '" aria-checked="' + (f[0] === 'all') + '"><i style="background:' + f[2] + '"></i>' + f[1] + ' <small>' + n + '</small></button>';
  }).join('');
  $('#type-list').innerHTML = [['all', 'All products']].concat(CRAFTS.map(function (c) { return [c.id, c.name]; })).map(function (t) {
    return '<button type="button" class="tpill" role="radio" data-type="' + t[0] + '" aria-checked="' + (t[0] === 'all') + '">' + t[1] + '</button>';
  }).join('');

  // ---------- product grid ----------
  var grid = $('#shop'), more = $('#more');
  CAT.forEach(function (p) {
    var el = document.createElement('article');
    el.className = 'card'; el.dataset.id = p.id;
    el.innerHTML = '<div class="card__img" data-qv="' + p.id + '">' + img(p, 0) + '<button type="button" class="card__qv" data-qv="' + p.id + '" aria-label="Quick view: ' + esc(p.name) + '">Quick view</button></div>' +
      '<p class="label">' + CRAFT_LABEL[p.craft] + '</p><h3 class="card__name" data-qv="' + p.id + '">' + esc(p.name) + '</h3>' +
      '<div class="card__row"><span class="card__price">Price on enquiry</span><button type="button" class="card__add" data-add="' + p.id + '" aria-pressed="false">Add to bag +</button></div>';
    p.el = el;
  });
  function list() { return CAT.filter(function (p) { return (state.family === 'all' || p.family === state.family) && (state.craft === 'all' || p.craft === state.craft); }); }
  function render(animate) {
    var items = list(), keep = items.slice(0, state.shown);
    var flip = animate && window.Flip ? Flip.getState(grid.children) : null;
    grid.innerHTML = '';
    keep.forEach(function (p) { grid.appendChild(p.el); });
    if (!items.length) grid.innerHTML = '<p class="grid__empty">Nothing photographed in this mix yet. <a target="_blank" rel="noopener" href="' + wa('Hello Lynette, do you have anything in this colour or craft?') + '">Ask Lynette ↗</a></p>';
    more.parentNode.hidden = items.length <= state.shown;
    $('#shop-count').textContent = items.length + (items.length === 1 ? ' piece' : ' pieces');
    if (flip) {
      Flip.from(flip, { duration: .7, ease: 'expo.out', absolute: true, scale: true, stagger: .015,
        onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .7, stagger: .03, ease: 'expo.out' }); },
        onLeave: function (els) { return gsap.set(els, { opacity: 0 }); },
        onComplete: function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); } });
    }
    if (window.__afterRender) window.__afterRender();
    syncBag();
  }
  function choose(group, attr, val) { $$('[' + attr + ']', group).forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute(attr) === val)); }); }
  $('#colour-list').addEventListener('click', function (e) { var b = e.target.closest('[data-family]'); if (!b) return; state.family = b.dataset.family; state.shown = 12; choose($('#colour-list'), 'data-family', state.family); render(true); });
  $('#type-list').addEventListener('click', function (e) { var b = e.target.closest('[data-type]'); if (!b) return; state.craft = b.dataset.type; state.shown = 12; choose($('#type-list'), 'data-type', state.craft); render(true); });
  $('#crafts-row').addEventListener('click', function (e) {
    var b = e.target.closest('[data-craft]'); if (!b) return;
    state.craft = b.dataset.craft; state.family = 'all'; state.shown = 12;
    choose($('#type-list'), 'data-type', state.craft); choose($('#colour-list'), 'data-family', 'all'); render(false);
    scrollToEl($('#colour'));
  });
  more.addEventListener('click', function () { state.shown += 12; render(true); });

  // ---------- bag ----------
  var bag = [];
  try { bag = JSON.parse(localStorage.getItem('ldc-bag') || '[]').filter(function (id) { return byId[id]; }); } catch (e) { bag = []; }
  function saveBag() { try { localStorage.setItem('ldc-bag', JSON.stringify(bag)); } catch (e) {} syncBag(); }
  function toggleBag(id, forceAdd) {
    var i = bag.indexOf(id);
    if (i > -1 && !forceAdd) { bag.splice(i, 1); toast('Removed from your bag'); }
    else if (i < 0) { bag.push(id); toast('Added to bag · ' + bag.length + (bag.length === 1 ? ' piece' : ' pieces')); bump(); }
    saveBag();
  }
  function bump() { if (window.gsap) gsap.fromTo('#bag-count', { scale: 1.6 }, { scale: 1, duration: .8, ease: 'elastic.out(1,.4)' }); }
  function syncBag() {
    $('#bag-count').textContent = bag.length;
    $$('[data-add]').forEach(function (b) { var on = bag.indexOf(b.dataset.add) > -1; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'In your bag ✓' : 'Add to bag +'; });
    var qa = $('#qv-add'); if (qa.dataset.id) qa.textContent = bag.indexOf(qa.dataset.id) > -1 ? 'In your bag ✓' : 'Add to bag +';
    $('#bag-items').innerHTML = bag.map(function (id) { var p = byId[id]; return '<li><img src="' + up(p.images[0].small) + '" alt=""><div><p>' + esc(p.name) + '</p><small>' + CRAFT_LABEL[p.craft] + ' · Price on enquiry</small></div><button type="button" data-remove="' + id + '" aria-label="Remove ' + esc(p.name) + '">×</button></li>'; }).join('');
    $('#bag-empty').hidden = bag.length > 0;
    $('#bag-sum').textContent = bag.length;
    var send = $('#bag-send');
    send.setAttribute('aria-disabled', String(!bag.length));
    send.href = wa('Hello Lynette, I’d like to order these pieces:\n' + bag.map(function (id, i) { var p = byId[id]; return (i + 1) + '. ' + p.name + ' (ref ' + p.id + ') ' + p.url; }).join('\n') + '\n\nPlease confirm price, size and availability.');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-add]'); if (a) { toggleBag(a.dataset.add); return; }
    var r = e.target.closest('[data-remove]'); if (r) { toggleBag(r.dataset.remove); return; }
    var q = e.target.closest('[data-qv]'); if (q && !q.closest('dialog')) openQV(q.dataset.qv);
  });
  $('#open-bag').addEventListener('click', function () { openDialog($('#bag')); });

  // ---------- toast ----------
  var tt;
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2200); }

  // ---------- dialogs + quick view ----------
  var lenis = null, last = null, cur = null;
  function openDialog(d) { last = document.activeElement; if (lenis) lenis.stop(); d.showModal ? d.showModal() : d.setAttribute('open', ''); }
  $$('dialog').forEach(function (d) {
    d.addEventListener('close', function () { if (lenis) lenis.start(); $('#qv-zoom').classList.remove('zoom'); if (last && last.focus) last.focus({ preventScroll: true }); });
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  });
  function showImg(i) {
    var im = cur.images[i];
    var el = $('#qv-img'); el.src = up(im.src); el.alt = im.alt;
    $$('#qv-thumbs button').forEach(function (b, j) { b.setAttribute('aria-current', String(i === j)); });
  }
  function openQV(id) {
    var p = byId[id]; if (!p) return; cur = p;
    $('#qv-cat').textContent = CRAFT_LABEL[p.craft] + ' · ref ' + p.id;
    $('#qv-title').textContent = p.name;
    $('#qv-dot').style.background = p.swatch;
    $('#qv-colour').textContent = (p.colors || []).join(' & ') || p.name;
    $('#qv-notes').textContent = p.notes || '';
    $('#qv-wa').href = wa(enquiry(p));
    $('#qv-src').href = p.url;
    $('#qv-add').dataset.id = p.id;
    $('#qv-thumbs').innerHTML = p.images.length > 1 ? p.images.map(function (im, i) { return '<button type="button" data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + up(im.small) + '" alt=""></button>'; }).join('') : '';
    showImg(0); syncBag(); openDialog($('#qv'));
  }
  $('#qv-thumbs').addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) showImg(+b.dataset.i); });
  $('#qv-add').addEventListener('click', function () { toggleBag(this.dataset.id, true); });
  var zoom = $('#qv-zoom');
  zoom.addEventListener('click', function (e) { zoom.classList.toggle('zoom'); pan(e); });
  zoom.addEventListener('pointermove', pan);
  zoom.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === 'z') zoom.classList.toggle('zoom'); });
  function pan(e) { if (!zoom.classList.contains('zoom')) return; var r = zoom.getBoundingClientRect(); $('#qv-img').style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%'; }

  // ---------- menu ----------
  var mb = $('#menu-btn'), menu = $('#menu');
  function setMenu(open) { mb.setAttribute('aria-expanded', String(open)); menu.hidden = !open; mb.textContent = open ? 'Close' : 'Menu'; if (lenis) open ? lenis.stop() : lenis.start(); }
  mb.addEventListener('click', function () { setMenu(mb.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  render(false);

  // ---------- smooth scroll + anchors ----------
  function scrollToEl(el) { if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 }); else el.scrollIntoView(); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); var t = id === '#top' ? document.body : $(id); if (!t) return;
    e.preventDefault(); scrollToEl(t);
  });

  if (!window.gsap || !window.ScrollTrigger) { $('#intro').remove(); $$('[data-rise]').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger); if (window.Flip) gsap.registerPlugin(Flip);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .09, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- split headings ----------
  $$('[data-words]').forEach(function (el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'); o.className = 'word'; o.setAttribute('aria-hidden', 'true');
            var i = document.createElement('span'); i.textContent = w; o.appendChild(i); f.appendChild(o);
          });
          n.parentNode.replaceChild(f, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
  });

  // ================= MOTION =================
  var fine = matchMedia('(pointer: fine)').matches, touch = html.classList.contains('touch');
  var Hgl = window.__hero || null;

  // ---------- intro: counter follows real loading (fonts, page, hero texture), min 1.6s ----------
  var got = { fonts: 0, load: document.readyState === 'complete' ? 1 : 0, hero: Hgl ? 0 : 1 };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { got.fonts = 1; }); else got.fonts = 1;
  addEventListener('load', function () { got.load = 1; });
  document.addEventListener('hero:ready', function () { got.hero = 1; });
  setTimeout(function () { got.fonts = got.load = got.hero = 1; }, 4500);
  var shown = 0, t0 = performance.now(), lastT = t0, cnt = $('.intro__count'), bar = $('.intro__bar i'), introDone = false;
  gsap.from('.intro__a, .intro__b', { yPercent: 110, duration: 1, stagger: .12, ease: 'expo.out' });
  (function tick(now) {
    var dt = Math.min(100, now - lastT); lastT = now;
    var real = (got.fonts + got.load + got.hero) / 3, time = Math.min(1, (now - t0) / 1600);
    var target = Math.min(time, .15 + .85 * real);
    shown += (target - shown) * (1 - Math.pow(.9, dt / 16.7)); if (target >= 1 && shown > .994) shown = 1;
    cnt.textContent = String(Math.round(shown * 100)).padStart(2, '0'); bar.style.transform = 'scaleX(' + shown + ')';
    if (shown >= 1) exitIntro(); else requestAnimationFrame(tick);
  })(t0);
  setTimeout(exitIntro, 7000);
  if (lenis) lenis.stop();

  function exitIntro() {
    if (introDone) return; introDone = true;
    var tl = gsap.timeline({ onComplete: function () { $('#intro').remove(); if (lenis) lenis.start(); } });
    tl.to('.intro__in', { y: -30, opacity: 0, duration: .5, ease: 'power3.in' }, .1)
      .to('.intro__panel', { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, .35);
    if (Hgl) tl.to(Hgl, { reveal: 1, duration: 2.2, ease: 'power2.out' }, .5);
    else tl.fromTo('.hero__media img', { scale: 1.18 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, .5);
    tl.from('.hero__title .word > span', { yPercent: 115, rotate: 4, duration: 1.3, stagger: .06, ease: 'expo.out' }, .75)
      .to('.hero [data-rise]', { opacity: 1, y: 0, duration: 1.1, stagger: .1, ease: 'expo.out' }, .95)
      .from('.nav__in > *', { y: -24, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', clearProps: 'transform,opacity' }, .9)
      .from('.hero__note', { opacity: 0, duration: 1 }, 1.4);
  }

  // ---------- hero on scroll: fabric zooms (WebGL), words lift apart at different speeds ----------
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: function (s) { if (Hgl) Hgl.scroll = s.progress; } });
  if (!Hgl) gsap.to('.hero__media', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  $$('.hero__title .word').forEach(function (w, i) {
    gsap.to(w, { yPercent: -60 - (i % 4) * 45, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '80% top', scrub: true } });
  });
  // wrapper fades (not the [data-rise] elements the intro animates), so the two never fight
  gsap.fromTo('.hero__in', { y: 0, opacity: 1 }, { y: -70, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.hero', start: '25% top', end: '85% top', scrub: true } });

  // ---------- ticker: speed and skew follow scroll velocity ----------
  (function () {
    var t = $('.ticker__track'); t.innerHTML += t.innerHTML + t.innerHTML;
    var x = 0, w = 0, on = false, sk = 0, dir = -1, setX = gsap.quickSetter(t, 'x', 'px'), setS = gsap.quickSetter(t, 'skewX', 'deg');
    ScrollTrigger.create({ trigger: '.ticker', start: 'top bottom', end: 'bottom top', onToggle: function (s) { on = s.isActive; w = t.scrollWidth / 3; } });
    gsap.ticker.add(function () {
      if (lenis && Hgl) Hgl.vel = gsap.utils.clamp(-1, 1, lenis.velocity / 40);
      if (!on) return;
      var v = lenis ? lenis.velocity : 0; if (v > .5) dir = -1; else if (v < -.5) dir = 1;
      x += dir * (.7 + Math.min(Math.abs(v) * .5, 16)); if (x < -w) x += w; if (x > 0) x -= w;
      sk += (gsap.utils.clamp(-10, 10, -v * .4) - sk) * .12; setX(x); setS(sk);
    });
  })();

  // ---------- headings: words rise, letter-spacing settles as they travel ----------
  $$('.section .title, .about .title').forEach(function (h) {
    gsap.from($$('.word > span', h), { yPercent: 115, rotate: 3, duration: 1.2, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
    gsap.fromTo(h, { letterSpacing: '.04em' }, { letterSpacing: '-.01em', ease: 'none', scrollTrigger: { trigger: h, start: 'top 95%', end: 'top 35%', scrub: true } });
  });
  $$('.head__note, .head .link').forEach(function (el) { gsap.from(el, { opacity: 0, y: 16, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } }); });

  // ---------- crafts: tiles flip up in 3D, then tilt toward the pointer ----------
  gsap.from('.craft', { rotateX: -70, y: 80, opacity: 0, transformOrigin: '50% 100%', duration: 1.3, stagger: .09, ease: 'expo.out', scrollTrigger: { trigger: '.crafts__row', start: 'top 85%' } });
  gsap.from('.craft__img img', { scale: 1.35, duration: 1.8, stagger: .09, ease: 'expo.out', scrollTrigger: { trigger: '.crafts__row', start: 'top 85%' } });
  function tilt(el, max) {
    if (!fine) return;
    var rx = gsap.quickTo(el, 'rotateX', { duration: .6, ease: 'power3' }), ry = gsap.quickTo(el, 'rotateY', { duration: .6, ease: 'power3' });
    gsap.set(el, { transformPerspective: 900 });
    el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * max); rx(-((e.clientY - r.top) / r.height - .5) * max); });
    el.addEventListener('pointerleave', function () { rx(0); ry(0); });
  }
  $$('.craft__img').forEach(function (el) { tilt(el, 14); });

  // ---------- just in: pinned horizontal rail (desktop), native swipe on phones ----------
  var mm = gsap.matchMedia();
  mm.add('(min-width: 761px) and (pointer: fine)', function () {
    var row = $('#new-row'), cards = $$('.tall', row);
    var dist = function () { return Math.max(0, row.scrollWidth - (window.innerWidth - parseFloat(getComputedStyle($('.new')).paddingLeft) * 2)); };
    var move = gsap.to(row, { x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: { trigger: '.new', pin: true, start: 'top top+=10', end: function () { return '+=' + dist() * 1.1; }, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
    cards.forEach(function (c, i) {
      gsap.fromTo(c.querySelector('img'), { xPercent: -10, scale: 1.15 }, { xPercent: 10, scale: 1.15, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } });
      gsap.fromTo(c, { rotateY: -18, transformPerspective: 1000 }, { rotateY: 0, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: move, start: 'left right', end: 'center 60%', scrub: true } });
    });
  });
  gsap.from('.tall', { clipPath: 'inset(100% 0 0 0)', duration: 1.3, stagger: .08, ease: 'expo.inOut', scrollTrigger: { trigger: '.new__row', start: 'top 85%' } });
  gsap.from('.tall span', { y: 24, opacity: 0, duration: 1, stagger: .08, delay: .5, ease: 'expo.out', scrollTrigger: { trigger: '.new__row', start: 'top 85%' } });

  // ---------- range names slide in opposite directions ----------
  gsap.fromTo('.words__row--a', { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: { trigger: '.words', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.fromTo('.words__row--b', { xPercent: -35 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.words', start: 'top bottom', end: 'bottom top', scrub: 1 } });

  // ---------- colour finder: chips cascade in, the glow takes the picked colour ----------
  gsap.from('.cchip, .tpill', { y: 18, opacity: 0, duration: .8, stagger: .025, ease: 'expo.out', scrollTrigger: { trigger: '.colours', start: 'top 90%' } });
  var famColour = {}; FAMILIES.forEach(function (f) { famColour[f[0]] = f[0] === 'all' ? '#842427' : f[2]; });
  function glowTo(c, o) { gsap.to(html, { '--glow': c, '--glow-o': o, duration: .9, overwrite: 'auto' }); }
  $$('.cchip').forEach(function (b) {
    b.addEventListener('mouseenter', function () { glowTo(famColour[b.dataset.family], .3); });
    b.addEventListener('mouseleave', function () { glowTo(famColour[state.family], .2); });
    b.addEventListener('click', function () { glowTo(famColour[b.dataset.family], .26); gsap.fromTo(b, { scale: .9 }, { scale: 1, duration: .6, ease: 'back.out(3)' }); });
  });

  // ---------- product grid: fabric-fold reveals, inner parallax, tilt ----------
  var FOLD_FROM = 'polygon(0% 0%, 100% 0%, 100% 0%, 75% 8%, 50% 0%, 25% 8%, 0% 0%)';
  var FOLD_TO = 'polygon(0% 0%, 100% 0%, 100% 100%, 75% 100%, 50% 100%, 25% 100%, 0% 100%)';
  function revealCards() {
    $$('#shop .card').forEach(function (card, i) {
      if (card.dataset.shown) return; card.dataset.shown = '1';
      var box = card.querySelector('.card__img'), im = box.querySelector('img');
      gsap.set(card, { opacity: 1 }); gsap.set(box, { clipPath: FOLD_FROM }); gsap.set(card.querySelectorAll('.label, .card__name, .card__row'), { opacity: 0, y: 20 });
      var go = function () {
        var d = (i % 4) * .08;
        gsap.to(box, { clipPath: FOLD_TO, duration: 1.3, delay: d, ease: 'expo.inOut', onComplete: function () { box.style.clipPath = 'none'; } });
        gsap.fromTo(im, { scale: 1.4 }, { scale: 1, duration: 1.8, delay: d, ease: 'expo.out', clearProps: 'scale' });
        gsap.to(card.querySelectorAll('.label, .card__name, .card__row'), { opacity: 1, y: 0, duration: .9, stagger: .06, delay: d + .35, ease: 'expo.out' });
      };
      if (card.getBoundingClientRect().top < innerHeight * .95) go();
      else ScrollTrigger.create({ trigger: card, start: 'top 95%', once: true, onEnter: go });
      tilt(box, 8);
    });
  }
  revealCards();
  // re-run after filters / show more (shop render calls this hook)
  window.__afterRender = function () { revealCards(); };

  // ---------- about ----------
  gsap.from('.about__media img', { clipPath: 'inset(100% 0 0 0)', duration: 1.5, stagger: .18, ease: 'expo.inOut', scrollTrigger: { trigger: '.about', start: 'top 75%' } });
  gsap.to('.about__media img:first-child', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.about__media img:last-child', { yPercent: -16, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.about__copy > p, .steps li', { y: 26, opacity: 0, duration: 1, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: '.about__copy', start: 'top 75%' } });
  gsap.from('.steps b', { scale: 0, rotate: -90, duration: .9, stagger: .1, ease: 'back.out(2)', scrollTrigger: { trigger: '.steps', start: 'top 80%' } });

  // ---------- footer: name rises letter by letter ----------
  (function () {
    var w = $('.footer__word'), t = w.textContent; w.textContent = '';
    t.split('').forEach(function (c) { var s = document.createElement('span'); s.style.display = 'inline-block'; s.textContent = c; w.appendChild(s); });
    gsap.fromTo(w.children, { yPercent: 100, rotate: function (i) { return i % 2 ? 10 : -10; }, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: .6 } });
  })();

  // ---------- nav, progress, active link ----------
  var nav = $('#nav'), prog = $('.progress i'), lastY = 0;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('is-solid', y > 40);
    if (y > lastY + 6 && y > 500) nav.classList.add('is-hidden'); else if (y < lastY - 6) nav.classList.remove('is-hidden');
    prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    lastY = y;
  }
  if (lenis) lenis.on('scroll', onScroll); else addEventListener('scroll', onScroll, { passive: true });
  $$('.nav__links a').forEach(function (a) {
    var t = $(a.getAttribute('href')); if (!t) return;
    ScrollTrigger.create({ trigger: t, start: 'top 50%', end: 'bottom 50%', onToggle: function (s) { a.classList.toggle('on', s.isActive); } });
  });

  // ---------- cursor + magnetic buttons ----------
  if (fine) {
    var cursorEl = $('.cursor'), ring = $('.cursor__ring'), dot = $('.cursor__dot'), lab = $('.cursor__label');
    cursorEl.classList.add('off');
    var rx2 = gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' }), ry2 = gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' });
    var dx = gsap.quickTo(dot, 'x', { duration: .1 }), dy = gsap.quickTo(dot, 'y', { duration: .1 });
    addEventListener('pointermove', function (e) { cursorEl.classList.remove('off'); rx2(e.clientX); ry2(e.clientY); dx(e.clientX); dy(e.clientY); }, { passive: true });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-cursor], .card__img, .tall, .craft');
      if (!t) { cursorEl.classList.remove('big'); return; }
      lab.textContent = t.dataset.cursor || (t.classList.contains('craft') ? 'Browse' : 'View');
      cursorEl.classList.add('big');
    });
    document.addEventListener('mouseleave', function () { cursorEl.classList.add('off'); });
    $$('.magnetic, .nav__bag').forEach(function (b) {
      var qx = gsap.quickTo(b, 'x', { duration: .8, ease: 'elastic.out(1,.4)' }), qy = gsap.quickTo(b, 'y', { duration: .8, ease: 'elastic.out(1,.4)' });
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .3); qy((e.clientY - r.top - r.height / 2) * .4); });
      b.addEventListener('mouseleave', function () { qx(0); qy(0); });
    });
  }

  ScrollTrigger.refresh();
});
