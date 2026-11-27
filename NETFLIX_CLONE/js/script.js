/* ==========================================================
   NETFLIX CLONE – script.js  (3D / scroll-driven edition)

   Sections
   1. helpers + data + auth
   2. UI: toast, modal, cards, rows, billboard, genres
   3. 3D scene (Three.js): logo, poster tunnel, particles, camera flight
   4. Scroll engine: smooth scroll, pinned chapters, 3D gallery
   5. Effects: loader, cursor, tilt, magnetic, reveal, counters
   6. Pages: sign-in, sign-up, boot

   Needs (loaded by each HTML page from a CDN):
     three.js r128  – 3D scene   (optional: falls back to CSS background)
     Lenis          – smooth scroll (optional: falls back to native)
   ========================================================== */
(() => {
  'use strict';

  const html = document.documentElement;
  html.classList.add('js');

  /* ==========================================================
     1. HELPERS + DATA + AUTH
     ========================================================== */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* storage blocked */ } }
  };

  const KEYS = { users: 'nf_users', session: 'nf_session', email: 'nf_email', list: 'nf_mylist', remember: 'nf_remember' };
  const DEMO = { email: 'demo@netflix.com', password: '123456', name: 'Demo' };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^\+?\d{10,13}$/;

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /* catalogue (gradient "posters" – no external images needed) */
  const TITLES = [
    { id: 1,  title: 'Stranger Nights',   type: 'series', genre: 'Sci-Fi · Horror',    year: 2024, rating: '16+', match: 98, emoji: '🔦', c: ['#8a0020', '#14062e'], desc: 'When a boy vanishes after a power surge, a group of friends uncovers a hidden world beneath their quiet town.' },
    { id: 2,  title: 'Money Vault',       type: 'series', genre: 'Crime · Thriller',   year: 2023, rating: '18+', match: 97, emoji: '🎭', c: ['#b30000', '#2b0000'], desc: 'A mastermind recruits eight strangers for the most daring heist in history. Nothing goes to plan.' },
    { id: 3,  title: 'Squid Arena',       type: 'series', genre: 'Survival · Drama',   year: 2024, rating: '18+', match: 96, emoji: '🦑', c: ['#ff2d87', '#1a0a2e'], desc: 'Hundreds of players in deep debt accept a mysterious invitation to compete in deadly children’s games.' },
    { id: 4,  title: 'The Wizard Hunter', type: 'series', genre: 'Fantasy · Action',   year: 2023, rating: '16+', match: 94, emoji: '⚔️', c: ['#3a3a3a', '#0a1a2a'], desc: 'A solitary monster hunter struggles to find his place in a world where people often prove more wicked than beasts.' },
    { id: 5,  title: 'Dark Signal',       type: 'series', genre: 'Mystery · Sci-Fi',   year: 2022, rating: '16+', match: 95, emoji: '⏳', c: ['#0f2b3d', '#050a10'], desc: 'Four families, one missing child and a secret that stretches across generations and time itself.' },
    { id: 6,  title: 'Royal Season',      type: 'series', genre: 'Romance · Period',   year: 2024, rating: '16+', match: 92, emoji: '👑', c: ['#d89a2b', '#3a0f2e'], desc: 'In glittering high society, scandal and secrets decide who wins hearts, and who loses reputations.' },
    { id: 7,  title: 'Gentleman Thief',   type: 'series', genre: 'Crime · Mystery',    year: 2023, rating: '16+', match: 93, emoji: '🎩', c: ['#12396b', '#050b17'], desc: 'Inspired by the legend of a master of disguise, a charming thief takes on the rich and powerful of Paris.' },
    { id: 8,  title: 'Cartel Kings',      type: 'series', genre: 'Crime · Biopic',     year: 2022, rating: '18+', match: 91, emoji: '💼', c: ['#1d4d2a', '#050f08'], desc: 'The rise and fall of a notorious drug empire, told through the agents who hunted it.' },
    { id: 9,  title: 'Ozark Lake',        type: 'series', genre: 'Crime · Drama',      year: 2022, rating: '18+', match: 90, emoji: '🌊', c: ['#12485a', '#04121a'], desc: 'A family relocates to a quiet lake town to launder money for a dangerous cartel, and their lives unravel.' },
    { id: 10, title: 'Wednesday Rain',    type: 'series', genre: 'Comedy · Fantasy',   year: 2024, rating: '13+', match: 96, emoji: '🕷️', c: ['#2a1a4a', '#07020f'], desc: 'A dry-witted teen with a gift for the macabre investigates a string of mysteries at her new school.' },
    { id: 11, title: 'Extraction Zero',   type: 'movie',  genre: 'Action · Thriller',  year: 2024, rating: '16+', match: 95, emoji: '🚁', c: ['#a33a00', '#1a0a00'], desc: 'A fearless black-market mercenary takes on the deadliest rescue mission of his career.' },
    { id: 12, title: 'Red Alert',         type: 'movie',  genre: 'Action · Comedy',    year: 2023, rating: '13+', match: 89, emoji: '🚨', c: ['#c0121c', '#2a0508'], desc: 'An FBI agent is forced to team up with the world’s greatest art thief to catch an even bigger criminal.' },
    { id: 13, title: 'Glass Mystery',     type: 'movie',  genre: 'Mystery · Comedy',   year: 2023, rating: '13+', match: 92, emoji: '🔍', c: ['#2e8bc0', '#071826'], desc: 'A detective travels to a billionaire’s private island where a murder game turns real.' },
    { id: 14, title: 'The Grey Agent',    type: 'movie',  genre: 'Action · Spy',       year: 2023, rating: '16+', match: 88, emoji: '🕶️', c: ['#4a4a4a', '#0c0c0c'], desc: 'When the CIA’s most skilled operative uncovers dark agency secrets, a psychopathic former colleague is unleashed.' },
    { id: 15, title: 'Don’t Look Down',   type: 'movie',  genre: 'Satire · Sci-Fi',    year: 2022, rating: '13+', match: 87, emoji: '☄️', c: ['#ff7a18', '#240a2e'], desc: 'Two astronomers go on a media tour to warn mankind of an approaching comet that will destroy Earth.' },
    { id: 16, title: 'Army of Ashes',     type: 'movie',  genre: 'Horror · Action',    year: 2022, rating: '18+', match: 86, emoji: '🧟', c: ['#5a1a1a', '#0a0505'], desc: 'After a zombie outbreak in Las Vegas, a group of mercenaries plan the ultimate heist.' },
    { id: 17, title: 'Midnight Express',  type: 'movie',  genre: 'Thriller · Drama',   year: 2024, rating: '16+', match: 90, emoji: '🚆', c: ['#1a3a6b', '#04070f'], desc: 'Trapped on a night train with a killer on board, one passenger has until dawn to find the truth.' },
    { id: 18, title: 'Desert Storm Run',  type: 'movie',  genre: 'Adventure · Action', year: 2023, rating: '13+', match: 85, emoji: '🏜️', c: ['#c98a2b', '#2a1405'], desc: 'A race across the dunes becomes a fight for survival when a rival crew plays dirty.' },
    { id: 19, title: 'Neon Samurai',      type: 'series', genre: 'Anime · Sci-Fi',     year: 2024, rating: '16+', match: 94, emoji: '🗡️', c: ['#7a1aff', '#0a0224'], desc: 'In a rain-soaked cyber city, a lone ronin hunts the corporation that erased his past.' },
    { id: 20, title: 'Last Orbit',        type: 'movie',  genre: 'Sci-Fi · Drama',     year: 2024, rating: '13+', match: 93, emoji: '🚀', c: ['#1a2a6b', '#02040f'], desc: 'The final crew leaving a dying Earth must make an impossible choice at the edge of the solar system.' }
  ];
  const byId = (id) => TITLES.find(t => t.id === Number(id));
  const grad = (t) => `linear-gradient(160deg, ${t.c[0]} 0%, ${t.c[1]} 100%)`;

  /* ---------- THUMBNAILS ----------
     1) your own file first:  images/<id>.jpg  (poster, 2:3)   and  images/banner-<id>.jpg (wide)
     2) otherwise a photo from picsum.photos (needs internet)
     3) otherwise the gradient + emoji card stays as the fallback                         */
  const posterUrl = (t) => `images/${t.id}.jpg`;
  const posterFallback = (t) => `https://picsum.photos/seed/nfclone${t.id}/400/600`;
  const bannerUrl = (t) => `images/banner-${t.id}.jpg`;
  const bannerFallback = (t) => `https://picsum.photos/seed/nfclone${t.id}/1600/900`;
  window.__imgErr = (img, id, kind) => {
    const t = byId(id);
    if (t && !img.dataset.f) { img.dataset.f = '1'; img.src = kind === 'b' ? bannerFallback(t) : posterFallback(t); }
    else img.remove();                                   // gradient + emoji show through
  };
  const posterImg = (t, cls) =>
    `<img class="${cls}" src="${posterUrl(t)}" alt="" loading="lazy" decoding="async" draggable="false" onerror="__imgErr(this,${t.id},'p')">`;

  const GENRES = [
    { name: 'Action',   emoji: '💥', c: ['#b30000', '#2b0000'] },
    { name: 'Comedy',   emoji: '😂', c: ['#d89a2b', '#3a1a00'] },
    { name: 'Horror',   emoji: '👻', c: ['#4a0a5a', '#050008'] },
    { name: 'Sci-Fi',   emoji: '🛸', c: ['#0f3b6b', '#02060f'] },
    { name: 'Romance',  emoji: '💘', c: ['#d6336c', '#3a0a1e'] },
    { name: 'Thriller', emoji: '🔪', c: ['#3a3a3a', '#000000'] },
    { name: 'Anime',    emoji: '🍥', c: ['#7a1aff', '#0a0224'] },
    { name: 'Mystery',  emoji: '🕵️', c: ['#1d4d2a', '#050f08'] }
  ];

  /* auth / session */
  const getUsers = () => store.get(KEYS.users, []);
  const getSession = () => store.get(KEYS.session, null);
  const myList = () => store.get(KEYS.list, []);
  const normId = (v) => v.trim().toLowerCase();
  const isValidId = (v) => EMAIL_RE.test(v) || PHONE_RE.test(v.replace(/[\s-]/g, ''));

  function findUser(id, pw) {
    id = normId(id);
    if (id === DEMO.email && pw === DEMO.password) return { email: DEMO.email, name: DEMO.name, plan: 'Premium' };
    return getUsers().find(u => u.email === id && u.password === pw) || null;
  }
  const userExists = (id) => normId(id) === DEMO.email || getUsers().some(u => u.email === normId(id));

  /* ==========================================================
     2. UI : toast, errors, background fallback, cards, rows, modal
     ========================================================== */
  const state = { filter: 'all', q: '' };
  const scroll = { y: 0, max: 1, p: 0, vel: 0, lenis: null };
  const mouse = { x: 0, y: 0, px: innerWidth / 2, py: innerHeight / 2 };

  function goTop() {
    if (scroll.lenis) scroll.lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function setError(field, msg) {
    if (!field) return;
    field.classList.toggle('invalid', !!msg);
    const err = $('.err', field);
    if (err) err.textContent = msg || '';
  }

  /* CSS poster wall – used as the fallback background if WebGL is unavailable */
  const posterTile = (t) =>
    `<div class="poster-tile" style="--g:${grad(t)}">${posterImg(t, 'pt-img')}<span class="pt-emoji">${t.emoji}</span><span class="pt-title">${t.title}</span></div>`;

  function buildPosterWalls() {
    const cols = window.innerWidth < 700 ? 4 : window.innerWidth < 1200 ? 6 : 9;
    $$('[data-wall]').forEach(wall => {
      wall.innerHTML = '';
      for (let i = 0; i < cols; i++) {
        const col = document.createElement('div');
        col.className = 'poster-col';
        col.style.animationDuration = (60 + Math.random() * 45) + 's';
        const tiles = shuffle(TITLES).slice(0, 8).map(posterTile).join('');
        col.innerHTML = tiles + tiles;
        wall.appendChild(col);
      }
    });
  }

  function cardEl(t) {
    const inList = myList().includes(t.id);
    const d = document.createElement('article');
    d.className = 'card';
    d.tabIndex = 0;
    d.dataset.id = t.id;
    d.style.setProperty('--g', grad(t));
    d.innerHTML = `
      ${posterImg(t, 'card-img')}
      <span class="card-emoji">${t.emoji}</span>
      <span class="card-title">${t.title}</span>
      <div class="card-hover">
        <div class="ch-btns">
          <button class="ch-btn play" data-act="play" aria-label="Play ${t.title}">▶</button>
          <button class="ch-btn" data-act="list" aria-label="Toggle My List">${inList ? '✓' : '+'}</button>
        </div>
        <div class="ch-meta"><span class="match">${t.match}% Match</span><span class="age">${t.rating}</span><span>${t.year}</span></div>
        <div class="ch-genre">${t.genre}</div>
      </div>`;
    d.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (act && act.dataset.act === 'play') { e.stopPropagation(); return playTitle(t); }
      if (act && act.dataset.act === 'list') { e.stopPropagation(); return toggleList(t); }
      openModal(t);
    });
    d.addEventListener('keydown', (e) => { if (e.key === 'Enter') openModal(t); });
    return d;
  }

  function rowEl(title, items, opts = {}) {
    const sec = document.createElement('section');
    sec.className = 'row' + (opts.memberOnly ? ' member-only' : '');
    sec.innerHTML = `<h2>${title}</h2><div class="row-wrap"><button class="arrow prev" aria-label="Scroll left">‹</button><div class="row-track"></div><button class="arrow next" aria-label="Scroll right">›</button></div>`;
    const track = $('.row-track', sec);
    items.forEach((t, i) => {
      if (opts.top10) {
        const w = document.createElement('div');
        w.className = 'rank-item';
        w.innerHTML = `<span class="rank-num">${i + 1}</span>`;
        w.appendChild(cardEl(t));
        track.appendChild(w);
      } else {
        track.appendChild(cardEl(t));
      }
    });
    $('.prev', sec).addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * .85, behavior: 'smooth' }));
    $('.next', sec).addEventListener('click', () => track.scrollBy({ left: track.clientWidth * .85, behavior: 'smooth' }));
    return sec;
  }

  function gridEl(title, items, emptyMsg) {
    const sec = document.createElement('section');
    sec.className = 'row';
    sec.style.paddingTop = '110px';
    sec.style.minHeight = '80vh';
    sec.innerHTML = `<h2>${title}</h2>`;
    if (!items.length) { sec.insertAdjacentHTML('beforeend', `<div class="empty">${emptyMsg}</div>`); return sec; }
    const g = document.createElement('div');
    g.className = 'grid';
    items.forEach(t => g.appendChild(cardEl(t)));
    sec.appendChild(g);
    return sec;
  }

  function renderRows() {
    const host = $('#rows');
    if (!host) return;
    const logged = !!getSession();
    host.innerHTML = '';

    if (logged && (state.q || state.filter !== 'all')) {
      let pool = TITLES;
      if (state.filter === 'series') pool = pool.filter(t => t.type === 'series');
      if (state.filter === 'movie')  pool = pool.filter(t => t.type === 'movie');
      if (state.filter === 'list')   pool = pool.filter(t => myList().includes(t.id));
      if (state.q) pool = pool.filter(t => (t.title + ' ' + t.genre).toLowerCase().includes(state.q));
      const heading = state.q ? `Results for “${state.q}”` : ({ series: 'TV Shows', movie: 'Movies', list: 'My List' })[state.filter];
      const empty = state.filter === 'list' && !state.q ? 'Your list is empty. Hover a title and press + to add it.' : 'No titles found. Try another search.';
      host.appendChild(gridEl(heading, pool, empty));
      return;
    }

    const list = myList().map(byId).filter(Boolean);
    if (logged && list.length) host.appendChild(rowEl('My List', list, { memberOnly: true }));
    host.appendChild(rowEl('Trending Now', shuffle(TITLES).slice(0, 14)));
    host.appendChild(rowEl('Top 10 in India Today', shuffle(TITLES).slice(0, 10), { top10: true }));
    host.appendChild(rowEl('Popular on Netflix', shuffle(TITLES), { memberOnly: true }));
    host.appendChild(rowEl('Binge-Worthy TV Shows', TITLES.filter(t => t.type === 'series'), { memberOnly: true }));
    host.appendChild(rowEl('Blockbuster Movies', TITLES.filter(t => t.type === 'movie'), { memberOnly: true }));
    host.appendChild(rowEl('Action & Adventure', TITLES.filter(t => /Action|Adventure/.test(t.genre)), { memberOnly: true }));
    host.appendChild(rowEl('Because You Watched Last Orbit', shuffle(TITLES.filter(t => /Sci-Fi|Drama/.test(t.genre))), { memberOnly: true }));
    host.appendChild(rowEl('Sci-Fi, Fantasy & Mystery', TITLES.filter(t => /Sci-Fi|Fantasy|Mystery/.test(t.genre)), { memberOnly: true }));
    host.appendChild(rowEl('Crime & Thriller', TITLES.filter(t => /Crime|Thriller/.test(t.genre)), { memberOnly: true }));
    host.appendChild(rowEl('Anime & Animation', TITLES.filter(t => /Anime/.test(t.genre)).concat(shuffle(TITLES).slice(0, 8)), { memberOnly: true }));
    host.appendChild(rowEl('Critically Acclaimed', TITLES.filter(t => t.match >= 94), { memberOnly: true }));
    host.appendChild(rowEl('Coming Soon', shuffle(TITLES).slice(0, 12), { memberOnly: true }));
    host.appendChild(rowEl('Short & Sweet: Under 2 Hours', shuffle(TITLES.filter(t => t.type === 'movie')), { memberOnly: true }));
  }

  function renderGenres() {
    const grid = $('#genre-grid');
    if (!grid) return;
    grid.innerHTML = '';
    GENRES.forEach(g => {
      const d = document.createElement('div');
      d.className = 'genre tilt';
      d.style.setProperty('--g', `linear-gradient(135deg, ${g.c[0]}, ${g.c[1]})`);
      d.innerHTML = `<span class="ge">${g.emoji}</span>${g.name}<i class="glare"></i>`;
      d.addEventListener('click', () => {
        const search = $('.search');
        if (search) { search.classList.add('open'); $('input', search).value = g.name; }
        state.q = g.name.toLowerCase();
        renderRows();
        goTop();
      });
      grid.appendChild(d);
    });
    initTilt(grid);
  }

  function toggleList(t) {
    const l = myList();
    const i = l.indexOf(t.id);
    if (i >= 0) { l.splice(i, 1); toast(`Removed “${t.title}” from My List`); }
    else { l.push(t.id); toast(`Added “${t.title}” to My List`); }
    store.set(KEYS.list, l);
    renderRows();
    const mb = $('#modal-list'); if (mb) mb.textContent = l.includes(t.id) ? '✓ In My List' : '+ My List';
  }

  function playTitle(t) {
    if (!getSession()) { toast('Sign in to start watching'); setTimeout(() => (location.href = 'signin.html'), 900); return; }
    toast(`▶  Now playing “${t.title}” (demo)`);
  }

  /* modal */
  function openModal(t) {
    let m = $('.modal');
    if (!m) {
      m = document.createElement('div');
      m.className = 'modal'; m.setAttribute('data-lenis-prevent', '');
      m.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true"></div>';
      document.body.appendChild(m);
      m.addEventListener('click', (e) => { if (e.target === m) closeModal(); });
    }
    const inList = myList().includes(t.id);
    const box = $('.modal-box', m);
    box.innerHTML = `
      <div class="m-top" style="--g:${grad(t)}">
        ${`<img class="m-img" src="${bannerUrl(t)}" alt="" decoding="async" onerror="__imgErr(this,${t.id},'b')">`}
        <button class="m-close" aria-label="Close">✕</button>
        <span class="m-emoji">${t.emoji}</span>
        <div class="m-head">
          <h2>${t.title}</h2>
          <div class="bb-btns">
            <button class="btn btn-white" id="modal-play">▶ Play</button>
            <button class="btn btn-ghost" id="modal-list">${inList ? '✓ In My List' : '+ My List'}</button>
          </div>
        </div>
      </div>
      <div class="m-body">
        <div>
          <div class="m-meta"><span class="match">${t.match}% Match</span><span>${t.year}</span><span class="age">${t.rating}</span><span>${t.type === 'series' ? 'TV Series' : 'Movie'}</span><span class="age">HD</span></div>
          <p>${t.desc}</p>
        </div>
        <div class="m-side">
          <div><b>Genres:</b> ${t.genre}</div>
          <div><b>This is:</b> ${t.type === 'series' ? 'Binge-worthy' : 'Exciting'}, Cinematic</div>
          <div><b>Audio:</b> English, Hindi, Bengali</div>
        </div>
      </div>`;
    $('.m-close', box).addEventListener('click', closeModal);
    $('#modal-play', box).addEventListener('click', () => { closeModal(); playTitle(t); });
    $('#modal-list', box).addEventListener('click', () => {
      if (!getSession()) { toast('Sign in to use My List'); return; }
      toggleList(t);
    });
    requestAnimationFrame(() => m.classList.add('open'));
    if (scroll.lenis) scroll.lenis.stop();
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    const m = $('.modal');
    if (m) m.classList.remove('open');
    if (scroll.lenis) scroll.lenis.start();
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* billboard (member home) */
  function renderBillboard() {
    const host = $('#bb-content');
    if (!host) return;
    const t = shuffle(TITLES.filter(x => x.match >= 94))[0];
    const art = $('#bb-art'); if (art) art.textContent = t.emoji;
    const bg = $('#billboard .hero-bg');
    if (bg) {
      $$('.bb-img', bg).forEach(i => i.remove());
      bg.insertAdjacentHTML('afterbegin', `<img class="bb-img" src="${bannerUrl(t)}" alt="" decoding="async" onerror="__imgErr(this,${t.id},'b')">`);
      if (art) art.style.display = 'none';
    }
    host.innerHTML = `
      <div class="bb-tag">N &nbsp;${t.type === 'series' ? 'SERIES' : 'FILM'}</div>
      <h1>${t.title}</h1>
      <div class="bb-meta"><span class="match">${t.match}% Match</span><span>${t.year}</span><span class="age">${t.rating}</span><span>${t.genre}</span></div>
      <p class="bb-desc">${t.desc}</p>
      <div class="bb-btns">
        <button class="btn btn-white btn-lg" id="bb-play">▶ Play</button>
        <button class="btn btn-ghost btn-lg" id="bb-info">ⓘ More Info</button>
      </div>`;
    $('#bb-play').addEventListener('click', () => playTitle(t));
    $('#bb-info').addEventListener('click', () => openModal(t));
  }

  /* navbar */
  function initNav() {
    const nav = $('#nav');
    const session = getSession();
    document.body.classList.toggle('logged-in', !!session && document.body.dataset.page === 'home');

    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (session) {
      const av = $('#avatar'); if (av) av.textContent = (session.name || session.email || 'U').charAt(0).toUpperCase();
      const who = $('#menu-who'); if (who) who.textContent = session.email;
    }

    const profile = $('.profile');
    if (profile) {
      $('#avatar-btn').addEventListener('click', (e) => { e.stopPropagation(); $('.menu', profile).classList.toggle('open'); });
      document.addEventListener('click', () => $('.menu', profile).classList.remove('open'));
    }
    const out = $('#signout');
    if (out) out.addEventListener('click', () => { store.del(KEYS.session); location.href = 'index.html'; });

    const search = $('.search');
    if (search) {
      const input = $('input', search);
      $('button', search).addEventListener('click', () => {
        search.classList.toggle('open');
        if (search.classList.contains('open')) input.focus();
        else { input.value = ''; state.q = ''; renderRows(); }
      });
      input.addEventListener('input', () => { state.q = input.value.trim().toLowerCase(); renderRows(); });
    }
    $$('.nav-links button').forEach(b => b.addEventListener('click', () => {
      $$('.nav-links button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.filter = b.dataset.filter;
      renderRows();
      if (state.filter !== 'all') goTop();
    }));
  }

  function initFaq() {
    $$('.faq-item').forEach(item => {
      const q = $('.faq-q', item), a = $('.faq-a', item);
      q.addEventListener('click', () => {
        const open = item.classList.contains('open');
        $$('.faq-item.open').forEach(o => { o.classList.remove('open'); $('.faq-a', o).style.maxHeight = null; });
        if (!open) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
      });
    });
  }

  function initEmailForms() {
    $$('.email-form').forEach(form => {
      const input = $('input', form), err = $('.form-err', form);
      const saved = store.get(KEYS.email, '');
      if (saved && !input.value) input.value = saved;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = input.value.trim();
        if (!isValidId(v)) { err.textContent = 'Please enter a valid email address or mobile number.'; input.focus(); return; }
        err.textContent = '';
        store.set(KEYS.email, normId(v));
        location.href = 'get_started.html';
      });
      input.addEventListener('input', () => { err.textContent = ''; });
    });
  }
  function initPwToggles() {
    $$('.toggle-pw').forEach(b => b.addEventListener('click', () => {
      const inp = $('input', b.closest('.field'));
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      b.textContent = show ? 'Hide' : 'Show';
    }));
  }

  /* ==========================================================
     3. THREE.JS SCENE
        – 3D "N" logo that flies at you as you leave the hero
        – a long tunnel of floating movie posters
        – glowing rings, light streaks and dust particles
        – camera flies through it all, driven by scroll
     ========================================================== */
  const TUNNEL_LEN = 440;

  function posterTexture(T, t) {
    const W = 300, H = 450;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    const rr = (r) => { x.beginPath(); x.moveTo(r, 0); x.arcTo(W, 0, W, H, r); x.arcTo(W, H, 0, H, r); x.arcTo(0, H, 0, 0, r); x.arcTo(0, 0, W, 0, r); x.closePath(); };

    x.save();
    rr(26); x.clip();
    const g = x.createLinearGradient(0, 0, W * .6, H);
    g.addColorStop(0, t.c[0]); g.addColorStop(1, t.c[1]);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const rg = x.createRadialGradient(W / 2, H * .38, 6, W / 2, H * .38, W * .7);
    rg.addColorStop(0, 'rgba(255,255,255,.34)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = rg; x.fillRect(0, 0, W, H);
    const sh = x.createLinearGradient(0, 0, W, H);
    sh.addColorStop(.35, 'rgba(255,255,255,0)'); sh.addColorStop(.5, 'rgba(255,255,255,.13)'); sh.addColorStop(.65, 'rgba(255,255,255,0)');
    x.fillStyle = sh; x.fillRect(0, 0, W, H);
    x.font = '150px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(t.emoji, W / 2, H * .38);
    const bg = x.createLinearGradient(0, H * .6, 0, H);
    bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(1, 'rgba(0,0,0,.88)');
    x.fillStyle = bg; x.fillRect(0, H * .6, W, H * .4);
    x.fillStyle = '#e50914'; x.font = '900 34px Arial,sans-serif'; x.textAlign = 'left'; x.textBaseline = 'top';
    x.fillText('N', 18, 14);
    x.fillStyle = '#fff'; x.font = '800 30px Inter,Arial,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    const words = t.title.toUpperCase().split(' ');
    const lines = []; let cur = '';
    words.forEach(w => {
      const test = cur ? cur + ' ' + w : w;
      if (x.measureText(test).width > W - 44 && cur) { lines.push(cur); cur = w; } else cur = test;
    });
    lines.push(cur);
    let y = H - 30 - (lines.length - 1) * 34;
    lines.forEach(l => { x.fillText(l, W / 2, y); y += 34; });
    x.restore();

    rr(26); x.lineWidth = 3; x.strokeStyle = 'rgba(255,255,255,.28)'; x.stroke();

    const tex = new T.CanvasTexture(c);
    tex.generateMipmaps = false;
    tex.minFilter = T.LinearFilter;
    tex.magFilter = T.LinearFilter;
    return tex;
  }

  function glowTexture(T, inner, outer) {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner); g.addColorStop(1, outer);
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c);
  }

  function createScene(mode) {
    const T = window.THREE;
    if (!T) { html.classList.add('no-webgl'); return null; }

    const canvas = document.createElement('canvas');
    canvas.id = 'gl';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    let renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: (window.devicePixelRatio || 1) < 2, alpha: true, powerPreference: 'high-performance' });
    } catch (err) {
      canvas.remove(); html.classList.add('no-webgl'); return null;
    }
    html.classList.add('gl');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new T.Scene();
    scene.fog = new T.Fog(0x070707, 16, 105);
    const camera = new T.PerspectiveCamera(60, 1, 0.1, 260);
    camera.position.set(0, 0, 10);

    /* lights (used by the 3D logo) */
    scene.add(new T.AmbientLight(0xffffff, 0.55));
    const key = new T.DirectionalLight(0xffffff, 1.1); key.position.set(5, 8, 10); scene.add(key);
    const redLight = new T.PointLight(0xe50914, 2.2, 40); scene.add(redLight);

    /* ---------- poster tunnel ---------- */
    const texs = TITLES.map(t => posterTexture(T, t));
    const planeGeo = new T.PlaneGeometry(3, 4.5);
    const COUNT = 84;
    const posters = [];
    for (let i = 0; i < COUNT; i++) {
      const mat = new T.MeshBasicMaterial({ map: texs[i % texs.length], transparent: true, side: T.DoubleSide, depthWrite: false });
      const m = new T.Mesh(planeGeo, mat);
      const a = i * 2.399963 + Math.random() * 0.4;
      const r = 6 + Math.random() * 5 + (i % 3) * 1.2;
      const px = Math.cos(a) * r * 1.35, py = Math.sin(a) * r * 0.7;
      const pz = -16 - i * (TUNNEL_LEN / COUNT);
      m.position.set(px, py, pz);
      m.rotation.y = -px * 0.05;
      m.rotation.x = py * 0.015;
      m.scale.setScalar(0.8 + Math.random() * 0.55);
      m.userData = { y: py, z: pz, ph: Math.random() * 6.28 };
      scene.add(m);
      posters.push(m);
    }

    /* ---------- glowing rings ---------- */
    const rings = [];
    for (let i = 0; i < 16; i++) {
      const geo = new T.TorusGeometry(13 + Math.random() * 2.5, 0.025, 6, 140);
      const mat = new T.MeshBasicMaterial({ color: i % 3 ? 0xe50914 : 0xffffff, transparent: true, opacity: 0.28, blending: T.AdditiveBlending, depthWrite: false });
      const m = new T.Mesh(geo, mat);
      m.position.z = -10 - i * 28;
      m.userData.spin = (Math.random() - 0.5) * 0.3;
      scene.add(m);
      rings.push(m);
    }

    /* ---------- dust particles ---------- */
    const PC = 2600;
    const pos = new Float32Array(PC * 3), col = new Float32Array(PC * 3);
    for (let i = 0; i < PC; i++) {
      const a = Math.random() * 6.283, r = 3 + Math.random() * 16;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r * 0.7;
      pos[i * 3 + 2] = 20 - Math.random() * (TUNNEL_LEN + 80);
      const red = Math.random() < 0.55, v = 0.6 + Math.random() * 0.4;
      col[i * 3] = red ? 1 : v; col[i * 3 + 1] = red ? 0.12 : v; col[i * 3 + 2] = red ? 0.12 : v;
    }
    const pg = new T.BufferGeometry();
    pg.setAttribute('position', new T.BufferAttribute(pos, 3));
    pg.setAttribute('color', new T.BufferAttribute(col, 3));
    const dust = new T.Points(pg, new T.PointsMaterial({
      size: 0.15, map: glowTexture(T, 'rgba(255,255,255,1)', 'rgba(255,255,255,0)'), vertexColors: true,
      transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: 0.9
    }));
    scene.add(dust);

    /* ---------- light streaks (stretch when you scroll fast) ---------- */
    const streaks = [];
    const sGeo = new T.BoxGeometry(0.025, 0.025, 1);
    for (let i = 0; i < 70; i++) {
      const m = new T.Mesh(sGeo, new T.MeshBasicMaterial({ color: Math.random() < 0.6 ? 0xff2a35 : 0xffffff, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false }));
      const a = Math.random() * 6.283, r = 4 + Math.random() * 11;
      m.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.7, 10 - Math.random() * (TUNNEL_LEN + 60));
      m.userData.base = 3 + Math.random() * 6;
      scene.add(m);
      streaks.push(m);
    }

    /* ---------- 3D "N" logo (landing hero only) ---------- */
    let logo = null, logoMats = [], logoGlow = null;
    if (mode === 'hero') {
      logo = new T.Group();
      const W = 4.2, H = 6, B = 1.3, D = 1.1;
      const mk = (shape, color) => {
        const geo = new T.ExtrudeGeometry(shape, { depth: D, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.1, bevelSegments: 4, curveSegments: 2 });
        const mat = new T.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.3, emissive: 0x6a0208, emissiveIntensity: 0.45, transparent: true });
        logoMats.push(mat);
        const mesh = new T.Mesh(geo, mat);
        mesh.position.set(-W / 2, -H / 2, -D / 2);
        return mesh;
      };
      const left = new T.Shape(); left.moveTo(0, 0); left.lineTo(B, 0); left.lineTo(B, H); left.lineTo(0, H); left.closePath();
      const right = new T.Shape(); right.moveTo(W - B, 0); right.lineTo(W, 0); right.lineTo(W, H); right.lineTo(W - B, H); right.closePath();
      const diag = new T.Shape(); diag.moveTo(0, H); diag.lineTo(B, H); diag.lineTo(W, 0); diag.lineTo(W - B, 0); diag.closePath();
      logo.add(mk(left, 0xb1060f), mk(right, 0xb1060f), mk(diag, 0xe50914));
      scene.add(logo);

      logoGlow = new T.Sprite(new T.SpriteMaterial({
        map: glowTexture(T, 'rgba(229,9,19,.85)', 'rgba(229,9,19,0)'), transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0.7
      }));
      logoGlow.scale.set(20, 20, 1);
      scene.add(logoGlow);
    }

    /* ---------- sizing ---------- */
    let wide = true;
    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      wide = w > 900;
    }
    resize();
    window.addEventListener('resize', resize);

    /* ---------- frame ---------- */
    let fov = 60, roll = 0;
    function render(time, drift) {
      const y = scroll.y;
      const vh = window.innerHeight;

      /* how far through the hero / the rest of the page are we? */
      const heroPx = mode === 'hero' ? vh : 0;
      const ph = heroPx ? clamp(y / heroPx) : 0;
      let rest = clamp((y - heroPx) / Math.max(1, scroll.max - heroPx));
      let camZ;
      if (drift) {
        /* pages that don't scroll (sign-in / sign-up): slow automatic flight */
        rest = 0.18 + 0.18 * Math.sin(time * 0.00007);
        camZ = 10 - rest * TUNNEL_LEN;
      } else {
        camZ = 10 - ph * 4 - rest * TUNNEL_LEN;
      }

      /* camera drift + mouse parallax */
      const tx = mouse.x * 1.5 + Math.sin(rest * 18) * 0.9;
      const ty = -mouse.y * 1.0 + Math.cos(rest * 14) * 0.55;
      camera.position.x += (tx - camera.position.x) * 0.05;
      camera.position.y += (ty - camera.position.y) * 0.05;
      camera.position.z = camZ;
      camera.lookAt(camera.position.x * 0.35, camera.position.y * 0.35, camZ - 30);
      roll += ((-mouse.x * 0.05 + Math.sin(rest * 10) * 0.06) - roll) * 0.05;
      camera.rotateZ(roll);

      /* speed "warp": widen the FOV and stretch streaks while scrolling fast */
      const speed = reduced ? 0 : Math.abs(scroll.vel);
      fov += ((60 + Math.min(speed * 0.35, 18)) - fov) * 0.08;
      if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
      const stretch = 1 + Math.min(speed * 0.08, 9);

      /* logo */
      if (logo) {
        logo.visible = logoGlow.visible = ph < 0.995;
        const gx = wide ? 3.7 : 0, gy = wide ? 0 : 1.9;
        const base = wide ? 1 : 0.62;
        logo.position.set(gx + camera.position.x * 0.2, gy, 0);
        logo.rotation.y = mouse.x * 0.5 + Math.sin(time * 0.0005) * 0.3 + ph * 2.6;
        logo.rotation.x = -mouse.y * 0.25 + Math.sin(time * 0.0007) * 0.06;
        logo.scale.setScalar(base * (1 + ph * 1.8));
        const a = clamp(1 - ph * 1.15);
        logoMats.forEach(m => { m.opacity = a; });
        logoGlow.position.set(logo.position.x, gy, -3);
        logoGlow.material.opacity = 0.55 * a + 0.1 * Math.sin(time * 0.002);
        redLight.position.set(gx - 2 + Math.cos(time * 0.001) * 3, 2 + Math.sin(time * 0.0013) * 2, 5);
      } else {
        redLight.position.set(camera.position.x, camera.position.y, camZ - 8);
      }

      /* posters: float, fade in/out */
      for (let i = 0; i < posters.length; i++) {
        const m = posters[i], d = camZ - m.userData.z;
        const o = d < 2.5 ? 0 : d < 12 ? (d - 2.5) / 9.5 : 1;
        m.visible = o > 0.01 && d < 125;
        if (!m.visible) continue;
        m.material.opacity = o;
        m.position.y = m.userData.y + Math.sin(time * 0.0006 + m.userData.ph) * 0.35;
        m.rotation.z = Math.sin(time * 0.0004 + m.userData.ph) * 0.05;
      }
      rings.forEach(r => { r.rotation.z += r.userData.spin * 0.004; });
      streaks.forEach(s => { s.scale.z = s.userData.base * stretch; });
      dust.rotation.z = time * 0.00003;

      renderer.render(scene, camera);
    }

    return { render, resize };
  }

  /* ==========================================================
     4. SCROLL ENGINE : smooth scroll, pinned chapters, gallery
     ========================================================== */
  const pins = [];

  function splitWords(el) {
    const raw = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    raw.forEach(tok => {
      const s = document.createElement('span');
      s.className = 'w' + (tok.includes('*') ? ' red' : '');
      s.textContent = tok.replace(/\*/g, '') + ' ';
      el.appendChild(s);
    });
    return $$('.w', el);
  }

  function buildGallery() {
    const track = $('.h-track');
    if (!track) return;
    track.innerHTML = '';
    TITLES.forEach(t => {
      const c = document.createElement('div');
      c.className = 'h-card';
      c.style.setProperty('--g', grad(t));
      c.innerHTML = `${posterImg(t, 'hc-img')}<span class="hc-emoji">${t.emoji}</span><div class="hc-info"><b>${t.title}</b><small>${t.genre} · ${t.year}</small></div>`;
      c.addEventListener('click', () => openModal(t));
      track.appendChild(c);
    });
  }

  function measureGallery(pin) {
    pin.centers = pin.cards.map(c => c.offsetLeft + c.offsetWidth / 2);
    pin.maxShift = Math.max(0, pin.track.scrollWidth - window.innerWidth);
  }

  function initPins() {
    pins.length = 0;
    $$('.pin-text').forEach(sec => {
      pins.push({ sec, type: 'words', words: splitWords($('[data-split]', sec)), last: -1 });
    });
    const hs = $('.hscroll');
    if (hs) {
      buildGallery();
      const pin = { sec: hs, type: 'h', track: $('.h-track', hs), bar: $('.h-bar i', hs), cards: $$('.h-card', hs) };
      measureGallery(pin);
      pins.push(pin);
    }
    const tn = $('.tunnel');
    if (tn) pins.push({ sec: tn, type: 'tunnel', caps: $$('.t-cap', tn), bar: $('.t-bar i', tn), num: $('.t-num', tn), last: -1 });
  }

  /* layout is measured only on load / resize / content change (never per frame) */
  function measurePin(pin) {
    pin.hidden = pin.sec.offsetParent === null;
    pin.h = pin.sec.offsetHeight;
    pin.top = pin.sec.getBoundingClientRect().top + window.scrollY;
  }
  function measureScroll() {
    scroll.max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }
  function remeasure() {
    measureScroll();
    pins.forEach(p => { if (p.type === 'h') measureGallery(p); measurePin(p); });
  }

  function updatePins() {
    const vh = window.innerHeight, vw = window.innerWidth;
    for (const pin of pins) {
      if (pin.top === undefined) measurePin(pin);
      if (pin.hidden) continue;                          // hidden (member view)
      const top = pin.top - scroll.y;
      if (top + pin.h < -60 || top > vh + 60) continue;
      const p = clamp(-top / Math.max(1, pin.h - vh));

      if (pin.type === 'words') {
        const n = pin.words.length;
        const k = Math.round(clamp(p / 0.82) * n);
        if (k !== pin.last) { pin.words.forEach((w, i) => w.classList.toggle('lit', i < k)); pin.last = k; }
      } else if (pin.type === 'h') {
        const shift = p * pin.maxShift;
        pin.track.style.transform = `translate3d(${-shift}px,-50%,0)`;
        for (let i = 0; i < pin.cards.length; i++) {
          const k = (pin.centers[i] - shift - vw / 2) / (vw / 2);          // -1 … 1 across the screen
          const ry = clamp(k, -1.3, 1.3) * -28;
          const s = 1 - Math.min(1, Math.abs(k)) * 0.15;
          pin.cards[i].style.transform = `perspective(1300px) translateZ(${(1 - Math.abs(k)) * 40}px) rotateY(${ry}deg) scale(${s})`;
        }
        pin.bar.style.transform = `scaleX(${p})`;
      } else if (pin.type === 'tunnel') {
        const n = pin.caps.length;
        const idx = Math.min(n - 1, Math.floor(p * n * 0.999));
        if (idx !== pin.last) {
          pin.caps.forEach((c, i) => c.classList.toggle('on', i === idx));
          if (pin.num) pin.num.textContent = String(idx + 1).padStart(2, '0');
          pin.last = idx;
        }
        pin.bar.style.transform = `scaleX(${p})`;
      }
    }
  }

  /* progress bar + percentage */
  function initProgressUI() {
    const bar = document.createElement('div'); bar.className = 'progress-top';
    const ui = document.createElement('div'); ui.className = 'scroll-ui';
    ui.innerHTML = '<span id="sp-pct">0%</span><i><b></b></i>';
    document.body.append(bar, ui);
    scroll.bar = bar; scroll.pct = $('#sp-pct', ui); scroll.pbar = $('b', ui);
  }

  /* master loop: smooth scroll → 3D scene → DOM effects */
  function startLoop(sceneObj) {
    let frame = 0, prevY = window.scrollY, rx = mouse.px, ry = mouse.py;
    const ring = $('.cursor-ring'), dot = $('.cursor-dot');
    const drift = () => scroll.max < 60;

    function loop(time) {
      if (scroll.lenis) scroll.lenis.raf(time);

      /* dt = 1 at 60fps, 0.5 at 120fps – keeps the feel identical on every screen */
      const dt = Math.min(3, (time - (loop._t || time)) / 16.667 || 1);
      loop._t = time;

      if (frame % 120 === 0) measureScroll();
      scroll.y = (scroll.lenis && typeof scroll.lenis.scroll === 'number') ? scroll.lenis.scroll : window.scrollY;
      scroll.vel += ((scroll.y - prevY) / dt - scroll.vel) * (1 - Math.pow(0.82, dt));
      prevY = scroll.y;
      scroll.p = clamp(scroll.y / scroll.max);

      const mk = 1 - Math.pow(0.94, dt);
      mouse.x += (mouse.tx - mouse.x) * mk || 0;
      mouse.y += (mouse.ty - mouse.y) * mk || 0;

      if (scroll.bar && Math.abs(scroll.p - (scroll._lp ?? -1)) > 0.0004) {
        scroll._lp = scroll.p;
        const sx = `scaleX(${scroll.p})`;
        scroll.bar.style.transform = sx;
        scroll.pbar.style.transform = sx;
        const pc = Math.round(scroll.p * 100);
        if (pc !== scroll._pc) { scroll._pc = pc; scroll.pct.textContent = pc + '%'; }
      }

      if (ring) {
        rx += (mouse.px - rx) * 0.17; ry += (mouse.py - ry) * 0.17;
        ring.style.transform = `translate(${rx}px,${ry}px)`;
        dot.style.transform = `translate(${mouse.px}px,${mouse.py}px)`;
      }

      updatePins();
      if (sceneObj) sceneObj.render(time, drift());
      frame++;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function initSmoothScroll() {
    if (window.Lenis && !reduced) {
      try {
        scroll.lenis = new window.Lenis({
          lerp: 0.075,            // lower = floatier / more inertia (0.05 – 0.12 is the sweet spot)
          wheelMultiplier: 0.9,
          smoothWheel: true
        });
      } catch (e) { scroll.lenis = null; }
    }
    $$('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
  }

  /* ==========================================================
     5. EFFECTS : loader, cursor, tilt, magnetic, reveal, counters
     ========================================================== */
  function initLoader() {
    let first = true;
    try { first = !sessionStorage.getItem('nf_loaded'); sessionStorage.setItem('nf_loaded', '1'); } catch (e) { /* ignore */ }
    html.classList.add('loading');

    const ld = document.createElement('div');
    ld.className = 'loader';
    ld.innerHTML = `<div class="ld-logo">${'NETFLIX'.split('').map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div><div class="ld-bar"><i></i></div><div class="ld-num">0%</div>`;
    document.body.appendChild(ld);

    const dur = first ? 2000 : 600, t0 = performance.now();
    const bar = $('.ld-bar i', ld), num = $('.ld-num', ld);
    (function tick(now) {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      bar.style.width = (e * 100) + '%';
      num.textContent = Math.round(e * 100) + '%';
      if (k < 1) requestAnimationFrame(tick);
      else {
        ld.classList.add('done');
        html.classList.remove('loading');
        document.body.classList.add('ready');
        setTimeout(() => ld.remove(), 1000);
      }
    })(t0);
  }

  function initCursor() {
    // Use the native browser cursor.
    // Custom cursor effects have been removed to improve performance.
    document.documentElement.classList.remove('has-cursor');

    document.querySelectorAll('.cursor-dot, .cursor-ring').forEach(el => el.remove());
}

  function initMouse() {
    mouse.tx = 0; mouse.ty = 0;
    window.addEventListener('mousemove', (e) => {
      mouse.px = e.clientX; mouse.py = e.clientY;
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  function initTilt(root = document) {
    $$('.tilt', root).forEach(el => {
      if (el._tilt) return;
      el._tilt = true;
      const max = +(el.dataset.tilt || 12);
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max * 1.4}deg) translateZ(12px)`;
        el.style.setProperty('--gx', (px * 100) + '%');
        el.style.setProperty('--gy', (py * 100) + '%');
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  function initMagnetic() {
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.32}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  function initReveal() {
    const items = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    items.forEach(el => { if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay + 's'); io.observe(el); });
  }

  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1800;
        (function tick(now) {
          const k = clamp((now - t0) / dur), e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
          el.textContent = Math.round(end * e) + suf;
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
  }

  function initMarquee() {
    $$('.mq-track').forEach(t => { t.innerHTML = t.innerHTML + t.innerHTML; });
  }

  /* ==========================================================
     6. PAGES
     ========================================================== */
  function initSignin() {
    if (getSession()) { location.replace('index.html'); return; }
    const form = $('#signin-form');
    if (!form) return;
    const idF = $('#f-id'), pwF = $('#f-pw'), banner = $('#banner');
    const id = $('#si-id'), pw = $('#si-pw'), rem = $('#si-remember');

    const params = new URLSearchParams(location.search);
    if (params.get('registered')) { banner.className = 'banner ok'; banner.textContent = '🎉 Membership created! Sign in to start watching.'; }

    const remembered = store.get(KEYS.remember, '') || store.get(KEYS.email, '');
    if (remembered) id.value = remembered;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      banner.className = 'banner hidden';
      let ok = true;
      if (!isValidId(id.value)) { setError(idF, 'Please enter a valid email or phone number.'); ok = false; } else setError(idF, '');
      if (pw.value.length < 4 || pw.value.length > 60) { setError(pwF, 'Your password must contain between 4 and 60 characters.'); ok = false; } else setError(pwF, '');
      if (!ok) return;

      const user = findUser(id.value, pw.value);
      if (!user) {
        banner.className = 'banner bad';
        banner.textContent = 'Incorrect email or password. Try again, or create a new account.';
        return;
      }
      store.set(KEYS.session, { email: user.email, name: user.name || user.email.split('@')[0], plan: user.plan || 'Standard', at: Date.now() });
      if (rem.checked) store.set(KEYS.remember, user.email); else store.del(KEYS.remember);
      const btn = $('button[type=submit]', form);
      btn.textContent = 'Signing in…'; btn.disabled = true;
      setTimeout(() => (location.href = 'index.html'), 650);
    });
    [id, pw].forEach(i => i.addEventListener('input', () => setError(i.closest('.field'), '')));

    const demo = $('#fill-demo');
    if (demo) demo.addEventListener('click', (e) => { e.preventDefault(); id.value = DEMO.email; pw.value = DEMO.password; });
  }

  function initStart() {
    const s1 = $('#step1'), s2 = $('#step2');
    if (!s1 || !s2) return;
    const email = $('#su-email'), pass = $('#su-pass');
    const eF = $('#f-email'), pF = $('#f-pass');
    const label = $('#step-label'), prog = $('#progress'), banner = $('#banner');
    email.value = store.get(KEYS.email, '') || '';

    s1.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      if (!EMAIL_RE.test(email.value.trim())) { setError(eF, 'Please enter a valid email address.'); ok = false; } else setError(eF, '');
      if (pass.value.length < 6) { setError(pF, 'Use at least 6 characters for your password.'); ok = false; } else setError(pF, '');
      if (!ok) return;
      if (userExists(email.value)) {
        banner.className = 'banner bad';
        banner.innerHTML = 'This email is already registered. <a href="signin.html" style="text-decoration:underline">Sign in instead</a>.';
        return;
      }
      banner.className = 'banner hidden';
      s1.classList.add('hidden'); s2.classList.remove('hidden');
      label.textContent = 'STEP 2 OF 2'; prog.classList.add('full');
      goTop();
    });
    [email, pass].forEach(i => i.addEventListener('input', () => setError(i.closest('.field'), '')));

    $('#back-link').addEventListener('click', (e) => {
      e.preventDefault();
      s2.classList.add('hidden'); s1.classList.remove('hidden');
      label.textContent = 'STEP 1 OF 2'; prog.classList.remove('full');
    });

    s2.addEventListener('submit', (e) => {
      e.preventDefault();
      const plan = ($('input[name=plan]:checked', s2) || {}).value || 'Standard';
      const users = getUsers();
      const id = normId(email.value);
      users.push({ email: id, password: pass.value, plan, name: id.split('@')[0] });
      store.set(KEYS.users, users);
      store.set(KEYS.email, id);
      const btn = $('button[type=submit]', s2);
      btn.textContent = 'Creating your account…'; btn.disabled = true;
      setTimeout(() => (location.href = 'signin.html?registered=1'), 900);
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;

    initLoader();
    initMouse();
    initCursor();
    buildPosterWalls();                 // CSS fallback background
    initNav();
    initPwToggles();

    if (page === 'home') {
      renderBillboard();
      renderRows();
      renderGenres();
      initFaq();
      initEmailForms();
      initMarquee();
      initPins();
    }
    if (page === 'signin') initSignin();
    if (page === 'start')  initStart();

    initTilt();
    initMagnetic();
    initReveal();
    initCounters();
    initSmoothScroll();
    initProgressUI();

    /* build the 3D scene (after fonts, so poster titles use Inter) */
    const mode = (page === 'home' && !getSession()) ? 'hero' : 'ambient';
    const go = () => {
      let sceneObj = null;
      try { sceneObj = createScene(mode); } catch (err) { console.error('3D scene failed, using CSS fallback:', err); html.classList.remove('gl'); html.classList.add('no-webgl'); const c = $('#gl'); if (c) c.remove(); }
      startLoop(sceneObj);
    };
    let started = false;
    const once = () => { if (!started) { started = true; go(); } };
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(once); setTimeout(once, 1200); } else once();

    let resizeT;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        buildPosterWalls();
        remeasure();
      }, 250);
    });
    window.addEventListener('load', remeasure);
    if ('ResizeObserver' in window) {
      let roT;
      new ResizeObserver(() => { clearTimeout(roT); roT = setTimeout(remeasure, 120); }).observe(document.body);
    }
  });
})();