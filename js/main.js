/* =====================================================================
   ÉPILTHERM — main.js
   Hero canvas scrubé (technique Apple) · Lenis · GSAP/ScrollTrigger ·
   reveals & count-up en IntersectionObserver · marquee · accordéon · footer
   ===================================================================== */
(() => {
  'use strict';

  /* ───────── FAILSAFE — armé tout en haut, déverrouille quoi qu'il arrive */
  const html = document.documentElement;
  const body = document.body;
  html.classList.add('js');
  let unlocked = false;
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    html.classList.remove('is-locked');
    body.classList.remove('is-locked');
    const pre = document.getElementById('preloader');
    if (pre) pre.classList.add('is-done');
  };
  setTimeout(unlock, 7000);

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onReady = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn)
      : fn();

  /* ════════════════════════════════════════════════════════════════════
     1. HERO — préchargement des frames + scrub sur canvas
     ════════════════════════════════════════════════════════════════════ */
  const FRAME_COUNT = 165;                 // frame_001.webp → frame_165.jpg (coupe au contact du stylet)
  const PAD = 3;                           // frame_%03d.webp
  const isMobile =
    window.innerWidth < 768 ||
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const frameDir = isMobile ? 'frames/mobile' : 'frames/desktop';
  const framePath = (i) =>
    `${frameDir}/frame_${String(i + 1).padStart(PAD, '0')}.webp`;

  /* Indices réels des frames à charger/afficher.
     Desktop : toutes les frames (0…FRAME_COUNT-1).
     Mobile  : une frame sur deux pour alléger le décodage, mais on inclut
               TOUJOURS la dernière frame réelle (FRAME_COUNT-1 = contact stylet)
               pour que la fin du scroll arrive bien sur ce point. */
  const frameIndices = [];
  if (isMobile) {
    for (let i = 0; i < FRAME_COUNT; i += 2) frameIndices.push(i);
    if (frameIndices[frameIndices.length - 1] !== FRAME_COUNT - 1) {
      frameIndices.push(FRAME_COUNT - 1);
    }
  } else {
    for (let i = 0; i < FRAME_COUNT; i++) frameIndices.push(i);
  }
  const FRAMES = frameIndices.length; // nb de frames réellement utilisées

  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;

  const images = [];
  let loadedCount = 0;
  let framesReady = false;
  const frameState = { i: 0 };

  const preFill = document.getElementById('preloaderFill');
  const prePct = document.getElementById('preloaderPct');
  const setProgress = (p) => {
    const v = Math.round(p * 100);
    if (preFill) preFill.style.width = v + '%';
    if (prePct) prePct.textContent = v;
  };

  /* renvoie l'image chargée la plus proche d'une position échantillonnée */
  function nearestLoaded(pos) {
    for (let d = 0; d < FRAMES; d++) {
      const a = images[pos - d];
      if (a && a.complete && a.naturalWidth) return a;
      const b = images[pos + d];
      if (b && b.complete && b.naturalWidth) return b;
    }
    return null;
  }

  let requestedPos = 0; // position échantillonnée actuellement visée

  /* dessine une frame (par position échantillonnée 0…FRAMES-1) en mode « cover » */
  function drawFrame(pos) {
    if (!canvas) { unlock(); return; }
    if (!ctx) { unlock(); return; }
    pos = Math.max(0, Math.min(FRAMES - 1, pos | 0));
    requestedPos = pos;
    // si la frame visée n'est pas prête, on affiche la plus proche déjà chargée
    const img = nearestLoaded(pos);
    if (!img || !img.complete || !img.naturalWidth) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
    }
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max((cw * dpr) / iw, (ch * dpr) / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw * dpr - dw) / 2;
    const dy = (ch * dpr - dh) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function preloadFrames(done) {
    if (!canvas) { done(false); return; }
    let settled = false;
    const finish = (ok) => { if (!settled) { settled = true; done(ok); } };

    /* une frame est prête : on met à jour la progression, on débloque l'entrée
       dès la PREMIÈRE frame dessinable, et on rafraîchit l'affichage si la
       frame chargée correspond à celle actuellement visée par le scrub. */
    const markReady = (pos, img) => {
      loadedCount++;
      setProgress(loadedCount / FRAMES);
      const drawable = img.complete && img.naturalWidth;
      if (drawable && !settled) {
        drawFrame(requestedPos); // dessine la frame visée (ou la plus proche)
        finish(true);            // entrée immédiate, sans attendre le 100 %
      } else if (drawable && pos === requestedPos) {
        drawFrame(pos);          // « upgrade » : remplace un fallback par la bonne frame
      }
      if (loadedCount >= FRAMES) framesReady = true;
    };

    for (let pos = 0; pos < FRAMES; pos++) {
      const img = new Image();
      img.decoding = 'async';
      images[pos] = img;
      const onDone = () => markReady(pos, img);
      img.onload = () => {
        // décodage asynchrone : ne bloque pas le thread principal
        if (typeof img.decode === 'function') {
          img.decode().then(onDone).catch(onDone);
        } else {
          onDone();
        }
      };
      img.onerror = onDone; // une frame en échec ne casse pas la séquence
      img.src = framePath(frameIndices[pos]);
    }
    // filet de sécurité : si vraiment rien n'est dessinable, on débloque quand même
    setTimeout(() => finish(images.some((im) => im && im.complete && im.naturalWidth)), 3000);
  }

  /* ════════════════════════════════════════════════════════════════════
     2. LENIS — smooth scroll branché à ScrollTrigger (retry borné)
     ════════════════════════════════════════════════════════════════════ */
  let lenis = null;
  function initLenis() {
    if (REDUCED || typeof Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let tries = 0;
    const bind = () => {
      if (window.ScrollTrigger && window.gsap) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
        ScrollTrigger.refresh();
        return;
      }
      if (tries++ < 40) requestAnimationFrame(bind);
      else {
        // pas de GSAP : Lenis tourne seul
        const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
    };
    bind();
  }

  /* ════════════════════════════════════════════════════════════════════
     3. HERO scrub via ScrollTrigger (pin)
     ════════════════════════════════════════════════════════════════════ */
  function initHeroScrub() {
    if (!canvas) { unlock(); return; }
    const pin = document.getElementById('heroPin');
    if (!pin) { unlock(); return; }

    const cues = Array.from(document.querySelectorAll('[data-hero-cue]'));
    const words = Array.from(document.querySelectorAll('[data-hero-word]'));
    const setCue = (active) => {
      if (!cues.length) return;
      cues.forEach((el) => {
        const grp = +el.getAttribute('data-hero-cue');
        el.classList.toggle('is-in', grp <= active);
      });
    };
    const setWord = (idx) => {
      if (!words.length) return;
      words.forEach((el, k) => el.classList.toggle('is-active', k === idx));
    };

    /* prefers-reduced-motion : ni pin ni scrub — dernière frame en image fixe */
    if (REDUCED || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      drawFrame(REDUCED ? FRAMES - 1 : 0);
      setCue(1);
      setWord(2);
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') unlock();
      window.addEventListener('resize', () => drawFrame(REDUCED ? FRAMES - 1 : 0));
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    drawFrame(0);
    setCue(0);
    setWord(0);

    let lastDrawn = -1; // ne redessine que si l'index change
    gsap.to(frameState, {
      i: FRAMES - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: '+=600%',
        scrub: 0.8,
        pin: pin,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.round(self.progress * (FRAMES - 1));
          if (idx !== lastDrawn) { drawFrame(idx); lastDrawn = idx; }
          const p = self.progress;
          // fenêtres : 0-0.33 / 0.33-0.66 / 0.66-1
          setCue(p < 0.33 ? 0 : 1);
          setWord(p < 0.33 ? 0 : p < 0.66 ? 1 : 2);
        },
      },
    });

    // redraw au resize + refresh
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        lastDrawn = -1;
        drawFrame(Math.round(frameState.i));
        ScrollTrigger.refresh();
      }, 150);
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     4. SplitText line-reveal (titres) — courbe signature
     ════════════════════════════════════════════════════════════════════ */
  function initLineReveals() {
    if (REDUCED || typeof gsap === 'undefined') return;

    // hero title : déjà découpé en .line>span dans le HTML
    const heroSpans = document.querySelectorAll('.hero__title .line > span');
    if (heroSpans.length) {
      gsap.set(heroSpans, { yPercent: 115 });
      gsap.to(heroSpans, {
        yPercent: 0,
        duration: 1.1,
        ease: 'cubic-bezier(.22,1,.36,1)',
        stagger: 0.09,
        delay: 0.15,
      });
      // failsafe : si l'intro ne joue pas, le titre reste visible quoi qu'il arrive
      setTimeout(() => gsap.set(heroSpans, { yPercent: 0, clearProps: 'transform' }), 2600);
    }

    // titres .r-line dans le flux : reveal au scroll via ScrollTrigger
    if (typeof ScrollTrigger === 'undefined') return;
    document.querySelectorAll('.manifesto__lead, .story__title, .quote__text, .cta-final__title').forEach((blk) => {
      const lines = blk.querySelectorAll('.r-line');
      if (!lines.length) return;
      gsap.set(lines, { yPercent: 110 });
      ScrollTrigger.create({
        trigger: blk,
        start: 'top 82%',
        once: true,
        onEnter: () =>
          gsap.to(lines, {
            yPercent: 0,
            duration: 1,
            ease: 'cubic-bezier(.22,1,.36,1)',
            stagger: 0.08,
          }),
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     5. REVEALS & COUNT-UP — IntersectionObserver (PAS ScrollTrigger : pin)
     ════════════════════════════════════════════════════════════════════ */
  function initObservers() {
    // reveal-up
    const revealEls = document.querySelectorAll('.reveal-up');
    if (REDUCED) {
      revealEls.forEach((el) => el.classList.add('is-in'));
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-in');
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-in'));
    }

    // count-up — rAF auto-arrêté
    const counters = document.querySelectorAll('.count');
    const runCount = (el) => {
      const to = parseFloat(el.getAttribute('data-to')) || 0;
      if (REDUCED) { el.textContent = to; return; }
      const dur = 1400;
      let start = null;
      const tick = (ts) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = to;
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) { runCount(e.target); obs.unobserve(e.target); }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((el) => cio.observe(el));
    } else {
      counters.forEach(runCount);
    }
  }

  /* ════════════════════════════════════════════════════════════════════
     6. NAV — apparition après le hero + fond solide ; menu mobile
     ════════════════════════════════════════════════════════════════════ */
  function initNav() {
    const nav = document.getElementById('nav');
    // on observe la 1re section APRÈS le hero : le hero étant pinné (~600vh),
    // son ratio d'intersection est inexploitable. Quand le manifeste entre dans
    // le viewport, le hero est terminé → on affiche la nav (et inversement).
    const afterHero = document.getElementById('methode');
    if (nav && afterHero && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        ([e]) => {
          const show = e.isIntersecting || e.boundingClientRect.top < 0;
          nav.classList.toggle('is-visible', show);
          nav.classList.toggle('is-solid', show);
        },
        { rootMargin: '-12% 0px 0px 0px', threshold: 0 }
      );
      io.observe(afterHero);
    } else if (nav) {
      nav.classList.add('is-visible', 'is-solid');
    }

    // menu mobile
    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu');
    if (burger && menu) {
      const toggle = (open) => {
        const willOpen = open ?? !menu.classList.contains('is-open');
        menu.classList.toggle('is-open', willOpen);
        burger.classList.toggle('is-open', willOpen);
        burger.setAttribute('aria-expanded', String(willOpen));
        menu.setAttribute('aria-hidden', String(!willOpen));
        if (lenis) willOpen ? lenis.stop() : lenis.start();
        // index pour stagger
        menu.querySelectorAll('.menu__links a').forEach((a, k) =>
          a.style.setProperty('--d', k)
        );
      };
      burger.addEventListener('click', () => toggle());
      menu.querySelectorAll('a').forEach((a) =>
        a.addEventListener('click', () => toggle(false))
      );
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggle(false);
      });
    }

    // ancrages doux via Lenis
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -70 });
        else target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     7. FAQ — accordéon : un seul ouvert + animation hauteur
     ════════════════════════════════════════════════════════════════════ */
  function initFaq() {
    const list = document.getElementById('faqList');
    if (!list) return;
    const items = Array.from(list.querySelectorAll('.qa'));

    // enveloppe le body pour l'animation grid-rows
    items.forEach((qa) => {
      const bodyEl = qa.querySelector('.qa__body');
      if (bodyEl && !bodyEl.parentElement.classList.contains('qa__bodyWrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'qa__bodyWrap';
        bodyEl.parentNode.insertBefore(wrap, bodyEl);
        wrap.appendChild(bodyEl);
      }
    });

    items.forEach((qa) => {
      const summary = qa.querySelector('summary');
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = qa.hasAttribute('open');
        items.forEach((o) => { if (o !== qa) o.removeAttribute('open'); });
        if (isOpen) qa.removeAttribute('open');
        else qa.setAttribute('open', '');
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     8. MARQUEE — défilement continu (rAF, auto-stop hors écran)
     ════════════════════════════════════════════════════════════════════ */
  function initMarquee() {
    const track = document.getElementById('marqueeTrack');
    if (!track || REDUCED) return;

    // duplique le contenu pour une boucle sans couture
    const originals = Array.from(track.children);
    originals.forEach((node) => track.appendChild(node.cloneNode(true)));

    let half = track.scrollWidth / 2;
    let x = 0;
    const speed = 0.4; // px / frame
    let running = true;
    let raf = null;

    const step = () => {
      if (!running) return;
      x -= speed;
      if (-x >= half) x += half;
      track.style.transform = `translate3d(${x}px,0,0)`;
      raf = requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        running = e.isIntersecting;
        if (running) { if (!raf) raf = requestAnimationFrame(step); }
        else if (raf) { cancelAnimationFrame(raf); raf = null; }
      });
      io.observe(track);
    } else {
      raf = requestAnimationFrame(step);
    }
    window.addEventListener('resize', () => { half = track.scrollWidth / 2; });
  }

  /* ════════════════════════════════════════════════════════════════════
     9. FOOTER — « épiltherm » géant qui se remplit au scroll
     ════════════════════════════════════════════════════════════════════ */
  function initFooterFill() {
    const giant = document.getElementById('footerGiant');
    if (!giant) return;
    const update = () => {
      const r = giant.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 quand il entre par le bas, 100 quand il a traversé
      const p = 1 - Math.max(0, Math.min(1, (r.top - vh * 0.2) / (vh * 0.8)));
      giant.style.setProperty('--fill', (p * 100).toFixed(1) + '%');
    };
    if (REDUCED) { giant.style.setProperty('--fill', '100%'); return; }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ════════════════════════════════════════════════════════════════════
     BOOT
     ════════════════════════════════════════════════════════════════════ */
  onReady(() => {
    initLenis();
    initHeroScrub();
    initLineReveals();
    initObservers();
    initNav();
    initFaq();
    initMarquee();
    initFooterFill();

    // préchargement → unlock une fois prêt
    if (canvas) {
      preloadFrames((ok) => {
        drawFrame(REDUCED ? FRAMES - 1 : Math.round(frameState.i));
        unlock();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    } else {
      unlock();
    }

    // refresh global après chargement complet
    window.addEventListener('load', () => {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
})();
