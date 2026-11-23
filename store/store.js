/* Lynette's Dhara Collection — shop, matched to the client's reference video.
   Motion follows the video frame by frame: smooth scroll; headings, colour words and pills
   fade up as they enter; craft tiles and product cards fade in one after another, left to right,
   and fade back out as they leave; a gold Quick view chip appears on the hovered card. */
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
  var TONES = ['aubergine', 'burgundy', 'crimson', 'vermilion', 'wine', 'mulberry', 'plum', 'mauve', 'lavender', 'violet', 'purple', 'navy', 'cobalt', 'sapphire', 'turquoise', 'teal', 'petrol',
    'olive', 'moss', 'sage', 'green', 'mustard', 'yellow', 'amber', 'apricot', 'orange', 'gold', 'champagne', 'ivory', 'white', 'rose', 'taupe', 'chocolate', 'bronze', 'brown', 'charcoal', 'slate', 'silver', 'grey', 'black'];
  var SW = window.SWATCH || {};
  var CAT = (window.CATALOG || []).map(function (p) { p.swatch = SW[p.id] || '#3a2027'; p.craft = craftOf(p); p.tone = toneOf(p); return p; });
  var byId = {}; CAT.forEach(function (p) { byId[p.id] = p; });

  // crafts follow how the boutique itself grouped and labelled its posts
  var CRAFTS = [
    { id: 'gold', name: 'Gold border', cover: 'Dfpt_6_Evtj-12' },
    { id: 'new', name: 'New arrivals', cover: 'DfzonKjmInI-08' },
    { id: 'pairs', name: 'Shade pairs', cover: 'Df2H1rtD5Wd-02-left', coverImg: 1 },
    { id: 'ryndia', name: 'Ryndia', cover: 'DfE3EgpmPrS-01' },
    { id: 'halfkhor', name: 'Half Khor', cover: 'DfpJqH9GMYd-01' },
    { id: 'premium', name: 'Premium Dhara', cover: 'DfUHpwdoBqU-01' },
    { id: 'more', name: 'More pieces', cover: 'DfRfTn1oIFv-01' },
    { id: 'all', name: 'All pieces', cover: 'Dfpt_6_Evtj-05' }
  ];
  var LABEL = { gold: 'Gold border · sizes 42–44', 'new': 'New arrivals', pairs: 'Shade pairs', ryndia: 'Ryndia', halfkhor: 'Half Khor', premium: 'Premium Dhara', more: 'Khasi wear' };
  var FEATURED = ['DfUHpwdoBqU-01', 'DfpJqH9GMYd-01', 'DfKyiHCPVgK-01', 'DfE3EgpmPrS-02'];
  function craftOf(p) {
    if (p.range === 'Premium') return 'premium';
    if (p.range === 'Half Khor') return 'halfkhor';
    if (p.fabric === 'Ryndia') return 'ryndia';
    if (p.id.indexOf('Dfpt_6_Evtj') === 0) return 'gold';
    if (p.id.indexOf('DfzonKjmInI') === 0) return 'new';
    if (p.id.indexOf('Df2H1rtD5Wd') === 0) return 'pairs';
    return 'more';
  }
  // one colour word per piece, from its own colour name (like the video's colour list)

  function toneOf(p) {
    var n = (p.name.split(' with ')[0] + ' ' + (p.colors || []).join(' ')).toLowerCase();
    for (var i = 0; i < TONES.length; i++) if (n.indexOf(TONES[i]) > -1) return TONES[i];
    return 'ivory';
  }
  function img(p, i, sizes, eager) {
    var im = p.images[i || 0];
    return '<img src="' + up(im.small) + '" srcset="' + up(im.small) + ' 480w, ' + up(im.src) + ' ' + im.width + 'w" sizes="' + (sizes || '(max-width:760px) 50vw, 25vw') + '" alt="' + esc(im.alt) + '" width="' + im.width + '" height="' + im.height + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async">';
  }
  var enquiry = function (p) { return 'Hello Lynette, I’d like to enquire about “' + p.name + '” (ref ' + p.id + '). Photo: ' + p.url; };

  // ---------- choose your craft ----------
  $('#crafts-grid').innerHTML = CRAFTS.map(function (c) {
    var n = c.id === 'all' ? CAT.length : CAT.filter(function (p) { return p.craft === c.id; }).length;
    return '<button type="button" class="craft" data-craft="' + c.id + '"><span class="craft__img">' + img(byId[c.cover], c.coverImg || 0) + '</span>' +
      '<span class="craft__name">' + c.name + '</span><span class="craft__n">' + n + (n === 1 ? ' piece' : ' pieces') + '</span></button>';
  }).join('');

  // ---------- featured ----------
  $('#featured-row').innerHTML = FEATURED.map(function (id) {
    var p = byId[id];
    return '<button type="button" class="feat" data-qv="' + id + '" aria-label="' + esc(p.name) + ', quick view">' + img(p, 0, '(max-width:760px) 72vw, 25vw') + '<span>' + esc(p.name) + '</span></button>';
  }).join('');

  // ---------- colour words + craft pills ----------
  var state = { tone: 'all', craft: 'all', shown: 12 };
  var tones = TONES.filter(function (t) { return CAT.some(function (p) { return p.tone === t; }); });
  $('#colour-list').innerHTML = ['all'].concat(tones).map(function (t) {
    return '<button type="button" class="cword" role="radio" data-tone="' + t + '" aria-checked="' + (t === 'all') + '">' + (t === 'all' ? 'All colours' : t) + '</button>';
  }).join('');
  $('#type-list').innerHTML = [['all', 'All products']].concat(CRAFTS.filter(function (c) { return c.id !== 'all'; }).map(function (c) { return [c.id, c.name]; })).map(function (t) {
    return '<button type="button" class="pill" role="radio" data-type="' + t[0] + '" aria-checked="' + (t[0] === 'all') + '">' + t[1] + '</button>';
  }).join('');

  // ---------- products ----------
  var grid = $('#shop'), more = $('#more');
  CAT.forEach(function (p) {
    var el = document.createElement('article');
    el.className = 'card'; el.dataset.id = p.id;
    el.innerHTML = '<div class="card__img" data-qv="' + p.id + '">' + img(p, 0) + '<button type="button" class="card__qv" data-qv="' + p.id + '" aria-label="Quick view: ' + esc(p.name) + '">Quick view +</button></div>' +
      '<p class="label">' + LABEL[p.craft] + '</p><h3 class="card__name" data-qv="' + p.id + '">' + esc(p.name) + '</h3>' +
      '<div class="card__row"><span class="card__price">Price on enquiry</span><button type="button" class="card__add" data-add="' + p.id + '" aria-pressed="false">Add to bag +</button></div>';
    p.el = el;
  });
  function list() { return CAT.filter(function (p) { return (state.tone === 'all' || p.tone === state.tone) && (state.craft === 'all' || p.craft === state.craft); }); }
  function render(animate) {
    var items = list(), keep = items.slice(0, state.shown);
    grid.innerHTML = '';
    keep.forEach(function (p) { grid.appendChild(p.el); });
    if (!items.length) grid.innerHTML = '<p class="grid__empty">Nothing photographed in this mix yet. <a target="_blank" rel="noopener" href="' + wa('Hello Lynette, do you have anything in this colour or craft?') + '">Ask Lynette ↗</a></p>';
    more.parentNode.hidden = items.length <= state.shown;
    $('#shop-count').textContent = items.length + (items.length === 1 ? ' piece' : ' pieces');
    syncBag();
    if (window.__cards) window.__cards(animate);
  }
  function choose(group, attr, val) { $$('[' + attr + ']', group).forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute(attr) === val)); }); }
  $('#colour-list').addEventListener('click', function (e) { var b = e.target.closest('[data-tone]'); if (!b) return; state.tone = b.dataset.tone; state.shown = 12; choose($('#colour-list'), 'data-tone', state.tone); render(true); });
  $('#type-list').addEventListener('click', function (e) { var b = e.target.closest('[data-type]'); if (!b) return; state.craft = b.dataset.type; state.shown = 12; choose($('#type-list'), 'data-type', state.craft); render(true); });
  $('#crafts-grid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-craft]'); if (!b) return;
    state.craft = b.dataset.craft; state.tone = 'all'; state.shown = 12;
    choose($('#type-list'), 'data-type', state.craft); choose($('#colour-list'), 'data-tone', 'all'); render(true);
    go($('#colour'));
  });
  more.addEventListener('click', function () { state.shown += 12; render(true); });

  // ---------- bag ----------
  var bag = [];
  try { bag = JSON.parse(localStorage.getItem('ldc-bag') || '[]').filter(function (id) { return byId[id]; }); } catch (e) { bag = []; }
  function saveBag() { try { localStorage.setItem('ldc-bag', JSON.stringify(bag)); } catch (e) {} syncBag(); }
  function toggleBag(id, add) {
    var i = bag.indexOf(id);
    if (i > -1 && !add) { bag.splice(i, 1); toast('Removed from your bag'); }
    else if (i < 0) { bag.push(id); toast('Added to bag · ' + bag.length + (bag.length === 1 ? ' piece' : ' pieces')); }
    saveBag();
  }
  function syncBag() {
    $('#bag-count').textContent = bag.length;
    $$('[data-add]').forEach(function (b) { var on = bag.indexOf(b.dataset.add) > -1; b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'In your bag ✓' : 'Add to bag +'; });
    var qa = $('#qv-add'); if (qa.dataset.id) qa.textContent = bag.indexOf(qa.dataset.id) > -1 ? 'In your bag ✓' : 'Add to bag +';
    $('#bag-items').innerHTML = bag.map(function (id) { var p = byId[id]; return '<li><img src="' + up(p.images[0].small) + '" alt=""><div><p>' + esc(p.name) + '</p><small>' + LABEL[p.craft] + ' · Price on enquiry</small></div><button type="button" data-remove="' + id + '" aria-label="Remove ' + esc(p.name) + '">×</button></li>'; }).join('');
    $('#bag-empty').hidden = bag.length > 0;
    $('#bag-sum').textContent = bag.length;
    var s = $('#bag-send');
    s.setAttribute('aria-disabled', String(!bag.length));
    s.href = wa('Hello Lynette, I’d like to order these pieces:\n' + bag.map(function (id, i) { var p = byId[id]; return (i + 1) + '. ' + p.name + ' (ref ' + p.id + ') ' + p.url; }).join('\n') + '\n\nPlease confirm price, size and availability.');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-add]'); if (a) { toggleBag(a.dataset.add); return; }
    var r = e.target.closest('[data-remove]'); if (r) { toggleBag(r.dataset.remove); return; }
    var q = e.target.closest('[data-qv]'); if (q && !q.closest('dialog')) openQV(q.dataset.qv);
  });
  $('#open-bag').addEventListener('click', function () { openDialog($('#bag')); });
  var tt;
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2200); }

  // ---------- dialogs ----------
  var lenis = null, lastFocus = null, qvItem = null;
  function openDialog(d) { lastFocus = document.activeElement; if (lenis) lenis.stop(); d.showModal ? d.showModal() : d.setAttribute('open', ''); }
  $$('dialog').forEach(function (d) {
    d.addEventListener('close', function () { if (lenis) lenis.start(); $('#qv-zoom').classList.remove('zoom'); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); });
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
  });
  function showImg(i) { var im = qvItem.images[i], el = $('#qv-img'); el.src = up(im.src); el.alt = im.alt; $$('#qv-thumbs button').forEach(function (b, j) { b.setAttribute('aria-current', String(i === j)); }); }
  function openQV(id) {
    var p = byId[id]; if (!p) return; qvItem = p;
    $('#qv-cat').textContent = LABEL[p.craft] + ' · ref ' + p.id;
    $('#qv-title').textContent = p.name;
    $('#qv-dot').style.background = p.swatch;
    $('#qv-colour').textContent = (p.colors || []).join(' & ') || p.name;
    $('#qv-notes').textContent = p.notes || '';
    $('#qv-wa').href = wa(enquiry(p)); $('#qv-src').href = p.url; $('#qv-add').dataset.id = p.id;
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
  function setMenu(o) { mb.setAttribute('aria-expanded', String(o)); menu.hidden = !o; mb.textContent = o ? 'Close' : 'Menu'; if (lenis) o ? lenis.stop() : lenis.start(); }
  mb.addEventListener('click', function () { setMenu(mb.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  // ---------- anchors ----------
  var headH = function () { return $('#head').offsetHeight; };
  function go(el) { if (lenis) lenis.scrollTo(el, { offset: -headH() + 1, duration: 1.3 }); else window.scrollTo(0, el.getBoundingClientRect().top + scrollY - headH()); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); var t = id === '#top' ? null : $(id); if (id !== '#top' && !t) return;
    e.preventDefault();
    if (id === '#top') { if (lenis) lenis.scrollTo(0, { duration: 1.3 }); else window.scrollTo(0, 0); } else go(t);
  });

  render(false);

  // ================= MOTION (as seen in the video) =================
  if (!window.gsap || !window.ScrollTrigger) { $$('[data-fade]').forEach(function (el) { el.style.opacity = 1; }); return; }
  gsap.registerPlugin(ScrollTrigger); if (window.Flip) gsap.registerPlugin(Flip);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (window.Lenis) {
    lenis = new Lenis({ lerp: .1, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // page load: the hero settles in, its text fades up line by line
  gsap.fromTo('.hero__media img', { scale: 1.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: 'power2.out' });
  gsap.fromTo('.hero [data-fade]', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.1, stagger: .14, delay: .25, ease: 'power3.out' });

  // fade up on enter, fade back out on leave (both directions, like the video)
  function fadeIO(el, opts) {
    opts = opts || {};
    gsap.set(el, { opacity: 0, y: opts.y == null ? 24 : opts.y });
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', end: 'bottom 6%',
      onEnter: function () { gsap.to(el, { opacity: 1, y: 0, duration: .9, delay: opts.delay || 0, ease: 'power3.out', overwrite: true }); },
      onEnterBack: function () { gsap.to(el, { opacity: 1, y: 0, duration: .7, ease: 'power3.out', overwrite: true }); },
      onLeave: function () { gsap.to(el, { opacity: 0, duration: .6, ease: 'power2.out', overwrite: true }); },
      onLeaveBack: function () { gsap.to(el, { opacity: 0, y: opts.y == null ? 24 : opts.y, duration: .5, ease: 'power2.out', overwrite: true }); }
    });
  }
  $$('[data-fade]').forEach(function (el) { if (!el.closest('.hero')) fadeIO(el); });

  // rows: items fade in one after another, left to right
  function rowFade(selector) {
    ScrollTrigger.batch(selector, {
      start: 'top 92%', end: 'bottom 4%', interval: .08, batchMax: 4,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .8, stagger: .14, ease: 'power3.out', overwrite: true }); },
      onEnterBack: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: 'power3.out', overwrite: true }); },
      onLeave: function (b) { gsap.to(b, { opacity: 0, duration: .5, stagger: .05, overwrite: true }); },
      onLeaveBack: function (b) { gsap.to(b, { opacity: 0, y: 20, duration: .45, stagger: .05, overwrite: true }); }
    });
  }
  gsap.set('.craft, .feat', { opacity: 0, y: 20 });
  rowFade('.craft'); rowFade('.feat');

  // product cards: same left-to-right fade, re-armed whenever filters change the grid
  var cardTriggers = [];
  window.__cards = function (animate) {
    cardTriggers.forEach(function (t) { t.kill(); }); cardTriggers = [];
    var cards = $$('#shop .card');
    if (animate) {
      gsap.fromTo(cards, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .7, stagger: .06, ease: 'power3.out', overwrite: true });
    } else gsap.set(cards, { opacity: 0, y: 20 });
    cardTriggers = ScrollTrigger.batch(cards, {
      start: 'top 92%', end: 'bottom 4%', interval: .08, batchMax: 4,
      onEnter: function (b) { if (!animate) gsap.to(b, { opacity: 1, y: 0, duration: .8, stagger: .14, ease: 'power3.out', overwrite: true }); },
      onEnterBack: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .6, stagger: .08, ease: 'power3.out', overwrite: true }); },
      onLeave: function (b) { gsap.to(b, { opacity: 0, duration: .5, stagger: .05, overwrite: true }); },
      onLeaveBack: function (b) { gsap.to(b, { opacity: 0, y: 20, duration: .45, stagger: .05, overwrite: true }); }
    });
    animate = false;
    ScrollTrigger.refresh();
  };
  window.__cards(false);

  // header: hides while scrolling down, returns on the way up; active link
  var head = $('#head'), lastY = 0;
  function onScroll() { var y = window.scrollY; if (y > lastY + 6 && y > 300) head.classList.add('up'); else if (y < lastY - 6) head.classList.remove('up'); lastY = y; }
  if (lenis) lenis.on('scroll', onScroll); else addEventListener('scroll', onScroll, { passive: true });
  $$('.nav a').forEach(function (a) {
    var t = $(a.getAttribute('href')); if (!t) return;
    ScrollTrigger.create({ trigger: t, start: 'top 50%', end: 'bottom 50%', onToggle: function (s) { a.classList.toggle('on', s.isActive); } });
  });
  ScrollTrigger.refresh();
});
