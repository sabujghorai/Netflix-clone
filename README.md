# Netflix Clone (HTML + CSS + JavaScript)

A front-end Netflix clone with a cinematic animated background, a landing page, a 2-step sign-up flow, a sign-in page and a logged-in "browse" experience. No frameworks, no build step, no external images.

## Project structure

```
.
├── NETFLIX_CLONE
│   ├── css
│   │   └── style.css        # all styling, animations, responsive rules
│   ├── get_started.html     # 2-step sign-up (account → plan)
│   ├── index.html           # landing page (guests) + browse page (members)
│   ├── js
│   │   └── script.js        # background, rows, modal, auth, forms
│   └── signin.html          # sign-in page
└── README.md
```

## How to run

Just open `NETFLIX_CLONE/index.html` in your browser (double-click it).

Or serve it locally:

```bash
cd NETFLIX_CLONE
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Features

- **Cinematic background**: a tilted, endlessly scrolling poster wall, a drifting red glow, a mouse-following spotlight, a vignette, and the glowing curved edge from the Netflix landing page.
- **Landing page**: hero with email form, feature blocks, FAQ accordion, footer.
- **Sign-up** (`get_started.html`): validation, show/hide password, plan picker, progress bar.
- **Sign-in** (`signin.html`): validation, remember me, friendly errors.
- **Browse mode** (after sign-in): billboard, horizontal rows with arrows, Top 10 row, hover cards, detail modal, **My List**, TV Shows / Movies filters and live search.
- Fully responsive and respects `prefers-reduced-motion`.

## Demo login

| Email | Password |
|-------|----------|
| `demo@netflix.com` | `123456` |

Or create your own account via **Get Started**. Accounts and session are stored in your browser's `localStorage`. This is a demo: passwords are stored in plain text locally and there is no real backend. Never reuse a real password here.

To reset everything, run this in the browser console:

```js
localStorage.clear()
```

## Customising

- **Titles / posters**: edit the `TITLES` array at the top of `js/script.js` (title, genre, emoji, two gradient colours).
- **Use real poster images**: add an `img` field to a title and set it as the card's `background-image` in `cardEl()` and `posterTile()`.
- **Brand colour**: change `--red` in `:root` inside `css/style.css`.
- **Background speed**: change the `75s` in `.poster-col` (CSS) and the duration range in `buildPosterWalls()` (JS).

## Disclaimer

Educational project. Not affiliated with, endorsed by, or connected to Netflix, Inc. All titles are placeholders.