/* Motion system for Lynette's Dhara Collection — "the thread".
   Story: a cloth unrolls (hero) → the boutique (manifesto) → twenty shades on a rail (horizontal)
   → pairs side by side → named fabrics stack up → new arrivals stream past → a lookbook turns
   → ranges and prices → the full collection → how to order → visit. A gold thread runs through all of it. */
// Modules (cloth.js) execute after classic deferred scripts, so wait for DOMContentLoaded.
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // Reading pauses and travel lengths, in viewport heights. Declared first so initMotion can read it.
  var SCROLL_MAP = {
    heroHold: 0.75,     // hero pinned while the cloth unfurls and the name drifts apart
    storyHold: 1.5,     // manifesto pinned while its words light up
    trackLead: 0.22,    // pause before the colour rail starts moving
    trackTail: 0.15,    // pause after the last card
    trackSpeed: 1.15,   // scroll distance per px of rail travel
    pairsPer: 0.8,      // scroll per pair swap
    lookTurn: 2.0,      // lookbook pinned while the ring makes one full turn
    tonesBlend: 0.55    // background blend zone around each section boundary
  };

  var html = document.documentElement;
  var reduced = html.classList.contains('reduced');
  var touch = html.classList.contains('touch');
  var fine = matchMedia('(pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var vh = function () { return window.innerHeight; };
  var lenis = null;

  // motion toggle (footer)
  var toggle = $('#motion-toggle');
  if (toggle) {
    toggle.textContent = reduced ? 'Motion: Off' : 'Motion: On';
    toggle.setAttribute('aria-pressed', String(!reduced));
    toggle.addEventListener('click', function () {
      try { localStorage.setItem('ldc-motion', reduced ? 'on' : 'off'); } catch (e) {}
      location.reload();
    });
  }

  if (!window.gsap || !window.ScrollTrigger) { html.classList.add('reduced'); hideLoader(); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (window.Flip) gsap.registerPlugin(Flip);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // ---------- splitting helpers ----------
  function splitWords(el) {
    if (el.dataset.done) return $$('.word > span', el);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'word'; w.setAttribute('aria-hidden', 'true');
            var i = document.createElement('span'); i.textContent = part; w.appendChild(i); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    el.dataset.done = '1';
    return $$('.word > span', el);
  }
  function splitChars(el) {
    var text = el.textContent; el.textContent = '';
    return text.split('').map(function (c) {
      var s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
      s.textContent = c === ' ' ? ' ' : c; el.appendChild(s); return s;
    });
  }
  function splitStoryWords(el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w'; w.textContent = part; frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    return $$('.w', el);
  }

  // ---------- smooth scroll ----------
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.95 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); if (id.length < 2 && id !== '#') return;
    var target = id === '#top' || id === '#' ? 0 : $(id); if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: 0 });
    else if (target === 0) window.scrollTo(0, 0); else target.scrollIntoView();
  });

  // ---------- preloader ----------
  var cloth = window.__cloth || null;
  document.addEventListener('cloth:ready', function () { cloth = window.__cloth; });
  function hideLoader() { var l = $('#loader'); if (l) l.style.display = 'none'; }
  var heroChars = [];
  $$('[data-letters]').forEach(function (el) { heroChars.push(splitChars(el)); });

  if (reduced) { hideLoader(); initMotion(); return; }

  // The loading animation itself starts from an inline script at first paint (index.html) and
  // tracks real loading; here we play its exit — the curtains part like cloth — and the hero intro.
  var loader = $('#loader');
  var introDone = false;
  function runIntro() { if (introDone) return; introDone = true; heroIntro(); }
  initMotion();
  if (!loader) runIntro();
  else {
    if (lenis) lenis.stop();
    var exited = false;
    var exit = function () {
      if (exited) return; exited = true;
      var ltl = gsap.timeline({ onComplete: function () { hideLoader(); if (lenis) lenis.start(); } });
      ltl.to('.loader__skip', { opacity: 0, duration: .2 }, 0)
        .to('.loader__inner', { y: -40, opacity: 0, scale: .96, duration: .55, ease: 'power3.in' }, .15)
        .add(runIntro, .55)
        .to('.loader__panel--l', { xPercent: -101, skewY: 4, duration: 1, ease: 'expo.inOut' }, .5)
        .to('.loader__panel--r', { xPercent: 101, skewY: -4, duration: 1, ease: 'expo.inOut' }, .5);
    };
    if (window.__loaderDone) exit(); else document.addEventListener('loader:done', exit);
    setTimeout(function () { if (window.__loaderFinish) window.__loaderFinish(); exit(); }, 7000); // failsafe
  }

  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(heroChars[0], { yPercent: 115, rotate: 8, opacity: 0, duration: 1.4, stagger: .045 }, 0)
      .from(heroChars[1].concat(heroChars[2]), { yPercent: 110, opacity: 0, duration: 1.2, stagger: .03 }, .25)
      .from('.hero__kicker', { opacity: 0, y: 16, duration: 1 }, .3)
      .from('.hero__kicker .kicker__line', { scaleX: 0, duration: 1.2 }, .4)
      .to('.hero [data-reveal]', { opacity: 1, y: 0, duration: 1.1, stagger: .1 }, .7)
      .from('.hero__scroll, .hero__caption', { opacity: 0, duration: 1 }, 1)
      // animate the nav's children, never the bar itself (the bar owns the hide-on-scroll transform)
      .from('.nav > *', { yPercent: -120, autoAlpha: 0, stagger: .06, duration: 1, clearProps: 'transform,opacity,visibility' }, .5);
    var P = window.__cloth;
    if (P) { tl.fromTo(P, { reveal: 0 }, { reveal: 1, duration: 2.6, ease: 'power2.inOut' }, 0); tl.fromTo(P, { wind: 2.2 }, { wind: 1, duration: 3.2, ease: 'power2.out' }, 0.4); }
    else gsap.from('.hero__poster', { clipPath: 'inset(0 0 100% 0)', duration: 1.6, ease: 'expo.inOut' });
  }

  // ---------- motion ----------
  function initMotion() {
    $$('[data-split]').forEach(splitWords);
    $$('.section-title').forEach(splitWords);
    var storyWords = splitStoryWords($('.story__text'));

    if (reduced) { buildLook(false); return; }

    var mm = gsap.matchMedia();

    // HERO: pinned hold — the cloth unfurls toward you, the name drifts apart like loose threads
    (function hero() {
      var P = window.__cloth;
      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      var all = heroChars[0].concat(heroChars[1], heroChars[2]);
      all.forEach(function (c, i) {
        var mid = all.length / 2;
        tl.to(c, { x: (i - mid) * (touch ? 8 : 26), y: (i % 2 ? -1 : 1) * (40 + (i % 5) * 26), rotate: (i - mid) * 3, opacity: 0, duration: 1 }, 0.05 + (i % 7) * 0.025);
      });
      tl.to('.hero__kicker, .hero__foot, .hero__caption, .hero__scroll', { y: -50, opacity: 0, duration: .6 }, 0);
      if (P) tl.to(P, { unfurl: 1, duration: 1 }, 0).to(P, { fade: 0, duration: .14 }, .9);
      tl.to('.hero__poster', { rotateX: 32, scale: 1.25, opacity: 0, duration: 1 }, 0);
      ScrollTrigger.create({
        trigger: '.hero', start: 'top top', end: function () { return '+=' + vh() * (touch ? 1 : SCROLL_MAP.heroHold + 1) * 0.75; },
        pin: !touch, scrub: touch ? 0.6 : 1, animation: tl,
        onUpdate: function (self) { var p = window.__cloth; if (!p) return; if (self.progress > .98 && p.sleep) p.sleep(); else if (p.wake) p.wake(); }
      });
    })();

    // MARQUEE: velocity-reactive, flips direction with scroll
    (function marquee() {
      var track = $('.marquee__track'); if (!track) return;
      track.innerHTML += track.innerHTML + track.innerHTML;
      var x = 0, dir = -1, skew = 0, setX = gsap.quickSetter(track, 'x', 'px'), setSkew = gsap.quickSetter(track, 'skewX', 'deg'), on = false;
      ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onToggle: function (s) { on = s.isActive; } });
      gsap.ticker.add(function () {
        if (!on) return;
        var v = lenis ? lenis.velocity : 0;
        if (v > 0.5) dir = -1; else if (v < -0.5) dir = 1;
        x += dir * (1.1 + Math.min(Math.abs(v) * 0.6, 22));
        var w = track.scrollWidth / 3;
        if (x < -w) x += w; if (x > 0) x -= w;
        skew += ((Math.max(-12, Math.min(12, -v * 0.5))) - skew) * 0.12;
        setX(x); setSkew(skew);
      });
    })();

    // STORY: words light up while pinned, photos float at different depths
    (function story() {
      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl.to(storyWords, { opacity: 1, stagger: .12, duration: .5 }, 0);
      $$('.story__float').forEach(function (f) {
        var d = parseFloat(f.dataset.depth) || 1;
        var amp = innerWidth < 760 ? .2 : 1;
        tl.fromTo(f, { y: 140 * d * amp, rotate: (d - .8) * 14 }, { y: -160 * d * amp, rotate: -(d - .8) * 10, duration: storyWords.length * .12 + .5 }, 0);
        tl.fromTo(f.querySelector('img'), { yPercent: -8 }, { yPercent: 0, duration: storyWords.length * .12 + .5 }, 0);
      });
      ScrollTrigger.create({
        trigger: '.story', start: touch ? 'top 75%' : 'top top',
        end: function () { return touch ? 'bottom 55%' : '+=' + vh() * SCROLL_MAP.storyHold; },
        pin: touch ? false : '.story__pin', scrub: .8, animation: tl
      });
      gsap.from('.story .kicker__line', { scaleX: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.story', start: 'top 70%' } });
      $$('.story__float').forEach(function (f, i) {
        gsap.from(f, { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.out', delay: i * .12, scrollTrigger: { trigger: '.story', start: 'top 60%' } });
      });
    })();

    // COLOURS: pinned horizontal rail, cards arc and turn as they pass centre, glow takes each fabric's colour
    var glow = $('.glow');
    (function colours() {
      var section = $('.colours'), rail = $('#colour-rail'), head = $('.colours__head');
      var cards = $$('.shade:not(.shade--end)', rail), imgs = cards.map(function (c) { return c.querySelector('img'); });
      var bar = $('#colour-bar'), idx = $('#colour-index');
      var dist = function () { return Math.max(0, rail.scrollWidth - window.innerWidth); };
      var lead = SCROLL_MAP.trackLead, tail = SCROLL_MAP.trackTail;
      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      var rs = lead * .8; // rail starts as the heading finishes fading, so there is no empty beat
      tl.to({}, { duration: rs });
      // the heading clears out before the rail reaches it (it stays on phones, where it has its own row)
      if (!touch) tl.to(head, { x: -140, opacity: 0, duration: lead * .6 }, lead * .2);
      tl.to(rail, { x: function () { return -dist(); }, duration: 1 }, rs)
        .to({}, { duration: tail });
      var span = rs + 1 + tail;
      var active = false, current = -1, n = cards.length;
      function setCurrent(bi) {
        if (bi === current) return;
        current = bi;
        idx.textContent = String(bi + 1).padStart(2, '0');
        gsap.to(html, { '--glow': cards[bi].style.getPropertyValue('--shade'), duration: .9, overwrite: true });
      }
      var st = ScrollTrigger.create({
        trigger: section, pin: true, start: 'top top', scrub: 1, animation: tl, invalidateOnRefresh: true, anticipatePin: 1,
        end: function () { return '+=' + (dist() * SCROLL_MAP.trackSpeed + vh() * (lead + tail)); },
        onToggle: function (s) { active = s.isActive; gsap.to(html, { '--glow-o': s.isActive ? .32 : 0, duration: .8 }); },
        onUpdate: function (s) {
          var p = gsap.utils.clamp(0, 1, s.progress * span - rs);
          bar.style.transform = 'scaleX(' + p + ')';
          setCurrent(Math.round(p * (n - 1)));
        }
      });
      gsap.from(cards.slice(0, 4), { y: 120, rotateY: -30, opacity: 0, duration: 1.4, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 65%' } });
      // card centres cached on refresh (no layout reads per frame)
      var cx = window.innerWidth / 2, centres = [], lastX = null, turn = touch ? 8 : 16;
      function measure() { cx = window.innerWidth / 2; centres = cards.map(function (c) { return c.offsetLeft + c.offsetWidth / 2; }); lastX = null; }
      measure();
      ScrollTrigger.addEventListener('refresh', measure);
      gsap.ticker.add(function () {
        if (!active) return;
        var x = gsap.getProperty(rail, 'x');
        if (x === lastX) return; lastX = x;
        for (var i = 0; i < n; i++) {
          var c = (centres[i] + x - cx) / cx;
          if (c < -1.6 || c > 1.6) continue;
          cards[i].style.transform = 'perspective(1000px) translateY(' + (c * c * 46).toFixed(1) + 'px) rotateY(' + (c * -turn).toFixed(2) + 'deg) scale(' + (1 - Math.min(Math.abs(c), 1) * .07).toFixed(3) + ')';
          imgs[i].style.transform = 'translateX(' + (c * -9).toFixed(2) + '%)';
        }
      });
      // keyboard: focusing a shade scrolls the page to the point where that card is centred
      $('.colours__pin').addEventListener('scroll', function () { this.scrollLeft = 0; this.scrollTop = 0; });
      rail.addEventListener('focusin', function (e) {
        var card = e.target.closest('.shade'); if (!card) return;
        var i = cards.indexOf(card); if (i < 0) i = n - 1;
        var p = (rs + i / (n - 1)) / span;
        var y = st.start + (st.end - st.start) * p;
        if (lenis) lenis.scrollTo(y, { duration: .8 }); else window.scrollTo(0, y);
      });
    })();

    // PAIRS: halves wipe in from opposite edges, one pair at a time
    (function pairs() {
      var pairs = $$('.pair'), dots = $$('#pairs-dots li');
      if (touch) {
        pairs.forEach(function (p) {
          var l = p.querySelector('.pair__half--l'), r = p.querySelector('.pair__half--r');
          var tl = gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 95%', end: 'top 62%', scrub: .5 } });
          tl.fromTo(l, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none' }, 0)
            .fromTo(r, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', ease: 'none' }, .1)
            .fromTo(p.querySelectorAll('img'), { scale: 1.3 }, { scale: 1, ease: 'none' }, 0);
        });
        return;
      }
      pairs.forEach(function (p, i) {
        if (!i) return;
        gsap.set(p.querySelector('.pair__half--l'), { clipPath: 'inset(100% 0 0 0)' });
        gsap.set(p.querySelector('.pair__half--r'), { clipPath: 'inset(0 0 100% 0)' });
      });
      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      pairs.forEach(function (p, i) {
        if (!i) return;
        // short wipe, long hold: each pair sits still for most of its scroll so it can be read
        var prev = pairs[i - 1], at = i - 1 + .2;
        tl.to(prev.querySelectorAll('img'), { scale: 1.12, yPercent: -5, duration: .5 }, at)
          .to(p.querySelector('.pair__half--l'), { clipPath: 'inset(0% 0 0 0)', duration: .42, ease: 'power2.inOut' }, at)
          .to(p.querySelector('.pair__half--r'), { clipPath: 'inset(0 0 0% 0)', duration: .42, ease: 'power2.inOut' }, at + .08)
          .fromTo(p.querySelectorAll('img'), { scale: 1.35 }, { scale: 1, duration: .6 }, at)
          .fromTo(p.querySelectorAll('.pair__name'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .3, stagger: .08 }, at + .35);
      });
      tl.to({}, { duration: .5 });
      var cur = -1;
      function setPair(n) {
        if (n === cur) return; cur = n;
        dots.forEach(function (d, i) { d.classList.toggle('on', i === n); });
        var sw = pairs[n].querySelector('.pair__half--r').style.getPropertyValue('--shade');
        gsap.to(html, { '--glow': sw, duration: .9, overwrite: true });
      }
      setPair(0);
      ScrollTrigger.create({
        trigger: '.pairs', pin: true, start: 'top top', scrub: 1, animation: tl, anticipatePin: 1,
        end: function () { return '+=' + vh() * SCROLL_MAP.pairsPer * (pairs.length - .4); },
        onToggle: function (s) { gsap.to(html, { '--glow-o': s.isActive ? .32 : 0, duration: .8 }); },
        onUpdate: function () { setPair(Math.min(pairs.length - 1, Math.max(0, Math.floor(tl.time() + .55)))); }
      });
      var first = pairs[0];
      gsap.timeline({ scrollTrigger: { trigger: '.pairs', start: 'top 90%', end: 'top top', scrub: .8 } })
        .fromTo(first.querySelector('.pair__half--l'), { xPercent: -60, rotate: -5, opacity: 0 }, { xPercent: 0, rotate: 0, opacity: 1, ease: 'power2.out' }, 0)
        .fromTo(first.querySelector('.pair__half--r'), { xPercent: 60, rotate: 5, opacity: 0 }, { xPercent: 0, rotate: 0, opacity: 1, ease: 'power2.out' }, 0);
    })();

    // STACK: sticky cards — each one settles back as the next arrives
    (function stack() {
      var cards = $$('.scard');
      cards.forEach(function (c, i) {
        gsap.from(c.querySelectorAll('figure'), { clipPath: 'inset(100% 0 0 0)', duration: 1.3, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 80%' } });
        gsap.from(c.querySelectorAll('figure img'), { scale: 1.35, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 80%' } });
        gsap.from(c.querySelectorAll('.scard__copy > *'), { y: 40, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 70%' } });
        if (i < cards.length - 1) {
          gsap.to(c, { scale: .9, '--dim': .7, rotateX: 6, ease: 'none', transformPerspective: 1400,
            scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true } });
        }
      });
    })();

    // REELS: two rows of fabric stream in opposite directions (native swipe on phones)
    if (!touch) {
      var ra = $('.reels__row--a'), rb = $('.reels__row--b');
      var travel = function (el) { return Math.max(0, el.scrollWidth - window.innerWidth); };
      gsap.fromTo(ra, { x: 0 }, { x: function () { return -travel(ra); }, ease: 'none', scrollTrigger: { trigger: '.reels', start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true } });
      gsap.fromTo(rb, { x: function () { return -travel(rb); } }, { x: 0, ease: 'none', scrollTrigger: { trigger: '.reels', start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true } });
    }
    gsap.from('.reel', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, stagger: .04, ease: 'expo.out', scrollTrigger: { trigger: '.reels__row--a', start: 'top 85%' } });

    // LOOKBOOK
    buildLook(true);

    // RANGES: rows rise, a preview follows the cursor, the background weaves itself in
    (function ranges() {
      $$('.rrow').forEach(function (r, i) {
        gsap.from(r.querySelector('.rrow__name'), { yPercent: 100, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 90%' } });
        gsap.from(r, { borderBottomColor: 'rgba(244,234,219,0)', duration: 1.2, delay: i * .04, scrollTrigger: { trigger: r, start: 'top 90%' } });
      });
      gsap.from('.price', { y: 30, opacity: 0, scale: .9, stagger: .07, duration: .9, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.prices', start: 'top 85%' } });
      var pv = $('.ranges__preview'), pimg = pv.querySelector('img');
      if (fine) {
        var qx = gsap.quickTo(pv, 'x', { duration: .6, ease: 'power3' }), qy = gsap.quickTo(pv, 'y', { duration: .6, ease: 'power3' });
        $$('.rrow a').forEach(function (a) {
          a.addEventListener('mouseenter', function () { pimg.src = a.dataset.img; gsap.to(pv, { opacity: 1, scale: 1, rotate: 0, duration: .5, ease: 'expo.out' }); });
          a.addEventListener('mouseleave', function () { gsap.to(pv, { opacity: 0, scale: .6, rotate: -8, duration: .4 }); });
          a.addEventListener('mousemove', function (e) { qx(e.clientX + 40); qy(e.clientY - 75); });
        });
      }
    })();
    $$('.weave').forEach(weave);

    // COLLECTION: fabric-fold clip reveals, re-run whenever the grid changes
    revealGrid();
    document.addEventListener('grid:render', function (e) { if (e.detail.animate) $$('.pcard__frame').forEach(function (f) { f.style.clipPath = 'none'; }); revealGrid(); });
    gsap.from('.chip', { y: 20, opacity: 0, stagger: .03, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.filters', start: 'top 90%' } });

    // ORDER: the thread stitches the four steps together
    (function order() {
      var path = $('.order__thread path'), stitch = $('.order__stitch');
      if (path && getComputedStyle($('.order__thread')).display !== 'none') {
        var len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.order__body', start: 'top 80%', end: 'bottom 55%', scrub: 1 } });
        gsap.to(stitch, { strokeDashoffset: -320, ease: 'none', scrollTrigger: { trigger: '.order__body', start: 'top bottom', end: 'bottom top', scrub: true } });
      }
      $$('.step').forEach(function (s, i) {
        var tl = gsap.timeline({ scrollTrigger: { trigger: touch || innerWidth < 760 ? s : '.order__body', start: touch || innerWidth < 760 ? 'top 85%' : 'top ' + (70 - i * 7) + '%' } });
        tl.from(s.querySelector('.step__n'), { scale: 0, rotate: -120, duration: .9, ease: 'back.out(2)' })
          .from(s.querySelectorAll('h3, p'), { y: 30, opacity: 0, duration: .9, stagger: .08, ease: 'expo.out' }, '-=.5');
      });
      gsap.timeline({ scrollTrigger: { trigger: '.policy', start: 'top 85%' } })
        .from('.policy', { y: 40, opacity: 0, scale: .96, duration: 1, ease: 'expo.out' })
        .from('.policy__mark', { rotate: -360, scale: 0, duration: 1, ease: 'back.out(1.6)' }, '-=.8');
    })();

    // VISIT
    gsap.from('.visit__card', { y: 80, opacity: 0, rotate: 2, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.visit', start: 'top 70%' } });
    gsap.from('.visit__links li', { x: 40, opacity: 0, duration: .9, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: '.visit__card', start: 'top 80%' } });

    // FOOTER: her name rises letter by letter
    (function footer() {
      var el = $('[data-footer-letters]'); if (!el) return;
      var ch = splitChars(el);
      gsap.fromTo(ch, { yPercent: 105, rotate: function (i) { return i % 2 ? 12 : -12; }, opacity: 0 },
        { yPercent: 0, rotate: 0, opacity: 1, stagger: .05, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: .8 } });
    })();

    // HEADINGS: words rise, then the weight swells as they travel up the screen
    $$('[data-split]:not(.hero__title)').forEach(function (h) {
      if (h.closest('.hero')) return;
      var words = $$('.word > span', h);
      gsap.from(words, { yPercent: 115, rotate: 4, duration: 1.2, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
      gsap.fromTo(h, { fontWeight: 300 }, { fontWeight: 520, ease: 'none', scrollTrigger: { trigger: h, start: 'top 95%', end: 'top 25%', scrub: true } });
    });
    $$('.kicker').forEach(function (k) {
      if (k.closest('.hero') || k.closest('dialog') || k.closest('.story')) return;
      gsap.from(k.querySelector('.kicker__line'), { scaleX: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: k, start: 'top 90%' } });
      gsap.from(k, { x: -20, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: k, start: 'top 92%' } });
    });
    $$('[data-reveal]').forEach(function (el) {
      if (el.closest('.hero')) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // created after every pin so their positions include pin spacing
    afterPins();
    cursor();
    magnetic();
    ScrollTrigger.refresh();
  }

  // ---------- grid reveal ----------
  var FOLD_FROM = 'polygon(0% 0%, 100% 0%, 100% 0%, 75% 9%, 50% 0%, 25% 9%, 0% 0%)';
  var FOLD_TO = 'polygon(0% 0%, 100% 0%, 100% 100%, 75% 100%, 50% 100%, 25% 100%, 0% 100%)';
  function revealGrid() {
    if (reduced) return;
    $$('#grid .pcard').forEach(function (card, i) {
      if (card.dataset.shown) return;
      card.dataset.shown = '1';
      var f = card.querySelector('.pcard__frame'), im = f.querySelector('img');
      gsap.set(f, { clipPath: FOLD_FROM });
      var go = function () {
        var d = (i % 4) * .08;
        gsap.to(f, { clipPath: FOLD_TO, duration: 1.3, delay: d, ease: 'expo.inOut', onComplete: function () { f.style.clipPath = 'none'; } });
        gsap.from(im, { scale: 1.4, yPercent: -6, duration: 1.8, delay: d, ease: 'expo.out' });
        gsap.fromTo(card.querySelector('.pcard__meta'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: d + .3, ease: 'expo.out' });
      };
      // already on screen (or above it) after a filter change: reveal now instead of waiting for a trigger
      if (card.getBoundingClientRect().top < window.innerHeight * .94) go();
      else ScrollTrigger.create({ trigger: card, start: 'top 94%', once: true, onEnter: go });
    });
  }

  // ---------- woven background ----------
  function weave(el) {
    var h = touch ? 8 : 14, v = touch ? 6 : 18, frag = '';
    for (var i = 0; i < h; i++) frag += '<i class="h" style="top:' + ((i + .5) / h * 100).toFixed(2) + '%"></i>';
    for (var j = 0; j < v; j++) frag += '<i class="v" style="left:' + ((j + .5) / v * 100).toFixed(2) + '%"></i>';
    el.innerHTML = frag;
    if (reduced) return;
    var hs = $$('.h', el), vs = $$('.v', el);
    hs.forEach(function (l, i) { l.style.transformOrigin = i % 2 ? 'right' : 'left'; });
    vs.forEach(function (l, i) { l.style.transformOrigin = i % 2 ? 'bottom' : 'top'; });
    var tl = gsap.timeline({ scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'top 10%', scrub: 1 } });
    tl.fromTo(hs, { scaleX: 0 }, { scaleX: 1, stagger: .06, ease: 'none' }, 0)
      .fromTo(vs, { scaleY: 0 }, { scaleY: 1, stagger: .05, ease: 'none' }, .15);
  }

  // ---------- lookbook ring ----------
  function buildLook(animated) {
    var scene = $('#look-scene'), ring = $('#look-ring'); if (!ring) return;
    var cards = $$('.lcard', ring), n = cards.length, step = 360 / n, label = $('#look-label');
    var r = 0, lw = 0;
    function layout() {
      lw = window.innerWidth < 760 ? 180 : Math.min(210, window.innerWidth * .14);
      r = (lw / 2) / Math.tan(Math.PI / n) + (window.innerWidth < 760 ? 10 : 30);
      ring.style.setProperty('--lw', lw + 'px'); painted = false;
      cards.forEach(function (c, i) { c.style.setProperty('--lw', lw + 'px'); c.style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + r + 'px)'; });
    }
    layout(); addEventListener('resize', layout);
    var scrollRot = 0, drag = 0, vel = 0, cur = 0, front = -1, dragging = false, startX = 0, lastX = 0, moved = 0;
    scene.addEventListener('pointerdown', function (e) { dragging = true; moved = 0; startX = lastX = e.clientX; scene.classList.add('is-drag'); });
    addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
      drag += dx * .28; vel = dx * .28;
      if (moved > 6) html.dataset.dragging = '1';
    });
    function endDrag() {
      if (!dragging) return; dragging = false; scene.classList.remove('is-drag');
      setTimeout(function () { html.dataset.dragging = '0'; }, 30);
    }
    addEventListener('pointerup', endDrag);
    addEventListener('pointercancel', endDrag);
    scene.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { drag -= step; e.preventDefault(); }
      if (e.key === 'ArrowLeft') { drag += step; e.preventDefault(); }
    });
    if (animated) {
      ScrollTrigger.create({
        trigger: '.look', start: touch ? 'top bottom' : 'top top', end: function () { return touch ? 'bottom top' : '+=' + vh() * SCROLL_MAP.lookTurn; },
        pin: touch ? false : '.look__pin', scrub: 1,
        onUpdate: function (s) { scrollRot = -s.progress * (touch ? 140 : 360); }
      });
      gsap.from(ring, { scale: .55, rotateX: 50, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.look', start: 'top 60%' } });
    }
    var tilt = window.innerWidth < 760 ? -4 : -8, painted = false;
    function tick() {
      if (!dragging) { drag += vel; vel *= .94; if (Math.abs(vel) < .01) vel = 0; }
      var target = scrollRot + drag;
      // idle: nothing moved since the last frame, so skip the style writes
      if (painted && !dragging && vel === 0 && Math.abs(target - cur) < .01) return;
      painted = true;
      cur += (target - cur) * (reduced ? 1 : .09);
      ring.style.transform = 'translateZ(' + (-r * .55) + 'px) rotateX(' + tilt + 'deg) rotateY(' + cur.toFixed(2) + 'deg)';
      var best = 1e9, bi = 0;
      for (var i = 0; i < n; i++) {
        var a = ((i * step + cur) % 360 + 540) % 360 - 180;
        var cos = Math.cos(a * Math.PI / 180);
        cards[i].style.setProperty('--sheen', Math.max(0, Math.pow(Math.max(cos, 0), 6)).toFixed(3));
        cards[i].style.filter = 'brightness(' + (0.45 + Math.max(cos, 0) * .55).toFixed(3) + ')';
        if (Math.abs(a) < best) { best = Math.abs(a); bi = i; }
      }
      if (bi !== front) { front = bi; label.textContent = window.SHOP ? SHOP.byId[cards[bi].dataset.id].name : ''; }
    }
    if (reduced) { tick(); addEventListener('pointermove', function () { if (dragging) tick(); }); return; }
    var lookOn = false;
    ScrollTrigger.create({ trigger: '.look', start: 'top bottom', end: 'bottom top', onToggle: function (s) { lookOn = s.isActive; } });
    gsap.ticker.add(function () { if (lookOn || dragging) tick(); });
    tick();
  }

  // ---------- after pins: tones, active links, thread, nav ----------
  function afterPins() {
    var main = $('#main'), body = document.body, nav = $('#nav'), prog = $('.progress i'), fab = $('#fab'), fabSince = 0;
    // the thread steps out of the way where products fill the screen
    var busy = 0, svgEl = $('#thread');
    // trigger on the pin-spacer for pinned sections, or the end fires as soon as the pin starts
    ['.colours', '.pairs', '.reels', '.look', '#grid', '.prices'].forEach(function (sel) {
      var el = $(sel); if (!el) return;
      ScrollTrigger.create({ trigger: flow(el), start: 'top 85%', end: 'bottom 15%', onToggle: function (s) { busy += s.isActive ? 1 : -1; gsap.to(svgEl, { opacity: busy > 0 ? 0 : 1, duration: .5, overwrite: true }); } });
    });
    var toneEls = $$('[data-tone]');
    var tones = [];
    function flow(el) { return el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el; }
    function measure() {
      tones = toneEls.map(function (el) { var f = flow(el), r = f.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, c: el.dataset.tone }; });
      buildThread();
    }
    // the page thread
    var svg = $('#thread'), line = $('.thread__line', svg), shadow = $('.thread__shadow', svg), needle = $('.thread__needle', svg);
    var samples = [], total = 0, mainTop = 0;
    function buildThread() {
      var W = main.clientWidth, H = main.scrollHeight, mr = main.getBoundingClientRect();
      mainTop = mr.top + scrollY;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.style.height = H + 'px'; svg.setAttribute('width', W); svg.setAttribute('height', H);
      var secs = $$('main > section, main > .pin-spacer').slice(1);
      var m = W < 760 ? 10 : W * .03;
      var pts = secs.map(function (s, i) { var y = s.getBoundingClientRect().top - mr.top; return [i % 2 ? W - m : m, y]; });
      pts.push([W / 2, H - 4]);
      var d = 'M' + pts[0][0] + ' ' + (pts[0][1] - 40);
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], dy = b[1] - a[1];
        // run down the margin, cross the page only near the section boundary (where there is no copy)
        var cross = Math.min(dy * .14, vh() * .5);
        d += ' L' + a[0] + ' ' + (b[1] - cross) + ' C' + a[0] + ' ' + (b[1] - cross * .35) + ' ' + b[0] + ' ' + (b[1] - cross * .65) + ' ' + b[0] + ' ' + b[1];
        if (i < pts.length - 1) { var s = b[0] < W / 2 ? 1 : -1; d += ' c' + (s * 26) + ' -10 ' + (s * 30) + ' 26 ' + (s * 6) + ' 26 c' + (-s * 18) + ' 0 ' + (-s * 14) + ' -22 ' + (-s * 6) + ' -26'; }
      }
      line.setAttribute('d', d); shadow.setAttribute('d', d);
      total = line.getTotalLength();
      line.style.strokeDasharray = shadow.style.strokeDasharray = total;
      samples = [];
      for (var k = 0; k <= 600; k++) { var p = line.getPointAtLength(total * k / 600); samples.push([total * k / 600, p.y, p.x]); }
      update();
    }
    function threadAt(y) {
      var lo = 0;
      for (var k = 0; k < samples.length; k++) { if (samples[k][1] >= y) { lo = k; break; } lo = k; }
      return samples[lo] || [0, 0, 0];
    }
    var lastY = 0, navHidden = false;
    function update() {
      var y = scrollY, h = vh();
      // tones: blend across each boundary
      var mid = y + h * .5, half = h * SCROLL_MAP.tonesBlend / 2, col = tones.length ? tones[0].c : '#1a0b10';
      for (var i = 0; i < tones.length; i++) {
        var t = tones[i];
        if (mid >= t.top && mid < t.bottom) {
          col = t.c;
          var nx = tones[i + 1];
          if (nx && mid > t.bottom - half) col = gsap.utils.interpolate(t.c, nx.c, (mid - (t.bottom - half)) / (half * 2));
          var pv = tones[i - 1];
          if (pv && mid < t.top + half) col = gsap.utils.interpolate(pv.c, t.c, .5 + (mid - t.top) / (half * 2));
          break;
        }
      }
      body.style.backgroundColor = col; html.style.setProperty('--bg', col);
      // thread
      if (samples.length) {
        var s = threadAt(y + h * .62 - mainTop);
        line.style.strokeDashoffset = shadow.style.strokeDashoffset = (total - s[0]);
        needle.setAttribute('cx', s[2]); needle.setAttribute('cy', s[1]);
      }
      // progress + nav
      var max = document.documentElement.scrollHeight - h;
      prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      nav.classList.toggle('is-solid', y > 60);
      if (y > lastY + 6 && y > 400 && !navHidden) { navHidden = true; nav.classList.add('is-hidden'); html.classList.add('nav-up'); }
      else if (y < lastY - 6 && navHidden) { navHidden = false; nav.classList.remove('is-hidden'); html.classList.remove('nav-up'); }
      // mobile: a WhatsApp pill appears once the hero is behind you
      if (fab) {
        var fabOn = y > h * .8 && y < max - h * .9;
        if (fabOn && !fabSince) fabSince = Date.now(); if (!fabOn) fabSince = 0;
        fab.classList.toggle('on', fabOn);
        // after a moment it shrinks to an icon so it covers less of the page
        fab.classList.toggle('mini', fabOn && Date.now() - fabSince > 2500);
      }
      lastY = y;
    }
    ScrollTrigger.addEventListener('refresh', measure);
    if (lenis) lenis.on('scroll', update); else addEventListener('scroll', update, { passive: true });
    measure();
    // active nav links
    $$('.nav__links a').forEach(function (a) {
      var target = $(a.getAttribute('href')); if (!target) return;
      ScrollTrigger.create({ trigger: target, start: 'top 50%', end: 'bottom 50%', onToggle: function (s) { a.classList.toggle('is-active', s.isActive); } });
    });
  }

  // ---------- cursor + magnetic ----------
  function cursor() {
    if (!fine) return;
    var c = $('.cursor'), ring = $('.cursor__ring'), dot = $('.cursor__dot'), label = $('.cursor__label');
    var rx = gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' });
    var dx = gsap.quickTo(dot, 'x', { duration: .12 }), dy = gsap.quickTo(dot, 'y', { duration: .12 });
    c.classList.add('is-hidden'); // until the first real mouse move, so it never sits at (0,0)
    addEventListener('pointermove', function (e) { c.classList.remove('is-hidden'); rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); }, { passive: true });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-cursor], a, button');
      c.classList.remove('is-label', 'is-needle');
      if (!t) return;
      var v = t.getAttribute('data-cursor');
      if (v === 'needle') { c.classList.add('is-needle'); label.textContent = ''; }
      else if (v) { c.classList.add('is-label'); label.textContent = v; }
    });
    document.addEventListener('mouseleave', function () { c.classList.add('is-hidden'); });
    document.addEventListener('mouseenter', function () { c.classList.remove('is-hidden'); });
  }
  function magnetic() {
    if (!fine) return;
    $$('.magnetic').forEach(function (b) {
      var qx = gsap.quickTo(b, 'x', { duration: .8, ease: 'elastic.out(1,.4)' }), qy = gsap.quickTo(b, 'y', { duration: .8, ease: 'elastic.out(1,.4)' });
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .3); qy((e.clientY - r.top - r.height / 2) * .4); });
      b.addEventListener('mouseleave', function () { qx(0); qy(0); });
    });
  }
});
