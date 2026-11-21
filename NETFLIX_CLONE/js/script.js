/* ==========================================================
   NETFLIX CLONE – script.js
   One script powers all three pages (index / get_started / signin)
   The current page is read from <body data-page="...">
   ========================================================== */
(() => {
  'use strict';

  /* ---------- helpers ---------- */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

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

  /* ---------- catalogue (gradient "posters" – no external images needed) ---------- */
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

  /* ---------- auth / session ---------- */
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

  /* ---------- UI helpers ---------- */
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

  /* ---------- cinematic background ---------- */
  const posterTile = (t) =>
    `<div class="poster-tile" style="--g:${grad(t)}"><span class="pt-emoji">${t.emoji}</span><span class="pt-title">${t.title}</span></div>`;

  function buildPosterWalls() {
    const cols = window.innerWidth < 700 ? 4 : window.innerWidth < 1200 ? 6 : 9;
    $$('[data-wall]').forEach(wall => {
      wall.innerHTML = '';
      for (let i = 0; i < cols; i++) {
        const col = document.createElement('div');
        col.className = 'poster-col';
        col.style.animationDuration = (60 + Math.random() * 45) + 's';
        const tiles = shuffle(TITLES).slice(0, 8).map(posterTile).join('');
        col.innerHTML = tiles + tiles; // doubled for seamless loop
        wall.appendChild(col);
      }
    });
  }

  function initSpotlight() {
    $$('.hero, .billboard, .auth-page').forEach(sec => {
      const spot = $('.spot', sec);
      if (!spot) return;
      sec.addEventListener('mousemove', (e) => {
        const r = sec.getBoundingClientRect();
        spot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        spot.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- navbar ---------- */
  function initNav() {
    const nav = $('#nav');
    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    const session = getSession();
    document.body.classList.toggle('logged-in', !!session && document.body.dataset.page === 'home');

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
      if (state.filter !== 'all') window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  }

  /* ---------- cards / rows ---------- */
  const state = { filter: 'all', q: '' };

  function cardEl(t) {
    const inList = myList().includes(t.id);
    const d = document.createElement('article');
    d.className = 'card';
    d.tabIndex = 0;
    d.dataset.id = t.id;
    d.style.setProperty('--g', grad(t));
    d.innerHTML = `
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

    // filtered / search view (members)
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
    host.appendChild(rowEl('Sci-Fi, Fantasy & Mystery', TITLES.filter(t => /Sci-Fi|Fantasy|Mystery/.test(t.genre)), { memberOnly: true }));
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

  /* ---------- modal ---------- */
  function openModal(t) {
    let m = $('.modal');
    if (!m) {
      m = document.createElement('div');
      m.className = 'modal';
      m.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true"></div>';
      document.body.appendChild(m);
      m.addEventListener('click', (e) => { if (e.target === m) closeModal(); });
    }
    const inList = myList().includes(t.id);
    const box = $('.modal-box', m);
    box.innerHTML = `
      <div class="m-top" style="--g:${grad(t)}">
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
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    const m = $('.modal');
    if (m) m.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ---------- billboard (member home) ---------- */
  function renderBillboard() {
    const host = $('#bb-content');
    if (!host) return;
    const t = shuffle(TITLES.filter(x => x.match >= 94))[0];
    const art = $('#bb-art'); if (art) art.textContent = t.emoji;
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

  /* ---------- FAQ ---------- */
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

  /* ---------- "Get Started" email forms ---------- */
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

  /* ---------- show / hide password ---------- */
  function initPwToggles() {
    $$('.toggle-pw').forEach(b => b.addEventListener('click', () => {
      const inp = $('input', b.closest('.field'));
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      b.textContent = show ? 'Hide' : 'Show';
    }));
  }

  /* ---------- sign-in page ---------- */
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

  /* ---------- get started (2-step sign-up) ---------- */
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    buildPosterWalls();
    initSpotlight();
    initNav();
    initPwToggles();

    let resizeT;
    window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(buildPosterWalls, 250); });

    if (page === 'home') {
      renderBillboard();
      renderRows();
      initFaq();
      initEmailForms();
    }
    if (page === 'signin') initSignin();
    if (page === 'start')  initStart();
  });
})();