# Portfolio Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Patrik Cesnek's portfolio site — a scrub-track timeline of nine career entries across five views in three languages — as a static React app deployable free on Netlify.

**Architecture:** Vite + React 18 + react-router-dom, styled with CSS Modules over Nocturne's token sheet. Content is split into an untranslatable spine (`entries.js`) and per-locale JSON dictionaries. A post-build script prerenders all 39 routes (3 locales × 13 routes) to real HTML so crawlers and link previews see content.

**Tech Stack:** Vite 5, React 18, react-router-dom 6, CSS Modules, Vitest, sharp (build-time only), Netlify.

**Spec:** `docs/superpowers/specs/2026-08-15-portfolio-web-design.md`

## Global Constraints

- Node 20. React 18. Runtime dependencies limited to `react`, `react-dom`, `react-router-dom`. `sharp` is a devDependency used by a one-off script, never bundled.
- Nocturne's `styles.css` is copied in verbatim as `src/styles/nocturne.css` and **never edited**. Design-specific values live in `src/styles/tokens.css`.
- Never hard-code a hex, font name, or spacing value that a Nocturne token already carries. Use `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)`.
- No pure black (`#000`) or pure white (`#fff`) anywhere.
- Primary buttons are outlined — 1px accent border on transparent. Never filled.
- Headings are `font-weight: 500`. The only exception is the decorative ghost year at 600.
- Accent text at paragraph size uses `--color-accent-300`, never `--color-accent`.
- `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }` must never be removed or overridden.
- Two type families only: `var(--font-body)` (Inter) for prose, `--font-mono` (`ui-monospace, SFMono-Regular, Menlo, monospace`) for every label, kicker, caption, nav item, date, tag and counter.
- Page gutter is `56px` left and right on every view, dropping to `24px` at ≤600px.
- Every clickable card, row, and tick is a real `<button>` or `<a>`. Never a clickable `<div>`.
- Locales: `en` (default, unprefixed), `cs`, `sk`. Slugs are identical across locales.
- All outbound links carry `target="_blank" rel="noopener"`.
- Screenshots use real `<img>` with `alt`, never `<div role="img">`.
- Commit after every task on a branch off `develop`, merged back with `--no-ff`.

### Entry constants (used across many tasks)

```
T_MIN = 2019.2   T_MAX = 2026.75
position(t) = (t - T_MIN) / (T_MAX - T_MIN) * 100
```

The nine slugs, oldest first:
`independent-ios`, `matee`, `freelance`, `billdu`, `o2-slovakia`, `formcoach`, `worldwanderer`, `sideq`, `apex-ryde`

### Correction to the handoff

The handoff's interaction table says *"prev = older, i.e. index + 1"*. In its own `DATA`
array (oldest first, `t` ascending) index + 1 is **newer**, so the two halves of that
sentence contradict each other. The semantic half wins, and it matches the handoff's own
rendered example (`← Matee` on the left is older, `SideQ →` on the right is newer):

**prev (left) = older = index − 1. next (right) = newer = index + 1.** Both wrap.

---

### Task 1: Scaffold, tokens and test harness

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.nvmrc`
- Create: `src/main.jsx`, `src/App.jsx`
- Create: `src/styles/nocturne.css` (copy), `src/styles/tokens.css`, `src/styles/global.css`
- Create: `netlify.toml`
- Test: `src/lib/__tests__/smoke.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: a running `npm run dev`, a passing `npm test`, and the CSS custom properties every later task reads.

- [ ] **Step 1: Create the branch**

```bash
git checkout develop && git checkout -b feat/scaffold
```

- [ ] **Step 2: Initialise the project**

```bash
npm init -y
npm install react@^18.3.1 react-dom@^18.3.1 react-router-dom@^6.26.2
npm install -D vite@^5.4.8 @vitejs/plugin-react@^4.3.2 vitest@^2.1.2 jsdom@^25.0.1 sharp@^0.33.5
```

- [ ] **Step 3: Write `package.json` scripts**

```json
{
  "name": "portfolio-web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build && node scripts/prerender.mjs",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "assets": "node scripts/optimize-assets.mjs"
  }
}
```

- [ ] **Step 4: Write `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', assetsDir: 'assets', sourcemap: false },
  test: { environment: 'jsdom', globals: true, include: ['src/**/*.test.{js,jsx}'] },
})
```

- [ ] **Step 5: Copy Nocturne verbatim**

```bash
mkdir -p src/styles src/lib/__tests__ scripts public
cp ~/Downloads/design_handoff_portfolio/nocturne/styles.css src/styles/nocturne.css
```

- [ ] **Step 6: Write `src/styles/tokens.css`**

Design-specific values from the handoff that are *not* Nocturne tokens.

```css
:root {
  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;

  --page-bg: radial-gradient(120% 80% at 8% 0%, #1c1f31 0%, #13151f 55%, #0e1018 100%);
  --body-bg: #101220;
  --nav-bg: rgba(16, 18, 32, 0.82);
  --ghost-year: #191c2c;
  --bezel: linear-gradient(160deg, #2c2f40, #171a27);
  --placeholder-bg: #14161f;
  --placeholder-stripe: repeating-linear-gradient(115deg, #1d202e 0 10px, #14161f 10px 20px);
  --card-fill: rgba(35, 37, 50, 0.55);
  --lab-fill: rgba(35, 37, 50, 0.45);

  --gutter: 56px;
  --transition: 140ms ease-out;
}

@media (max-width: 600px) {
  :root { --gutter: 24px; }
}

@media (prefers-reduced-motion: reduce) {
  :root { --transition: 0ms; }
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
```

- [ ] **Step 7: Write `src/styles/global.css`**

```css
@import './nocturne.css';
@import './tokens.css';

html { scroll-behavior: smooth; }
body { background: var(--body-bg); }

#root {
  min-height: 100vh;
  background: var(--page-bg);
  display: flex;
  flex-direction: column;
}

main { flex: 1; }

.mono {
  font-family: var(--font-mono);
  font-variant-ligatures: none;
}

.tag { white-space: nowrap; }

button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; text-align: left; }
```

- [ ] **Step 8: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#101220" />
    <title>Patrik Cesnek — Senior iOS Developer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Write `src/main.jsx` and a placeholder `src/App.jsx`**

```jsx
// src/main.jsx
import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'

const root = document.getElementById('root')
const tree = (
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
)

if (root.hasChildNodes()) hydrateRoot(root, tree)
else createRoot(root).render(tree)
```

```jsx
// src/App.jsx
export default function App() {
  return <main style={{ padding: 56 }}><h1>Portfolio</h1></main>
}
```

- [ ] **Step 10: Write the smoke test**

```js
// src/lib/__tests__/smoke.test.js
import { describe, it, expect } from 'vitest'

describe('test harness', () => {
  it('runs', () => { expect(1 + 1).toBe(2) })
})
```

- [ ] **Step 11: Write `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

- [ ] **Step 12: Verify**

Run: `npm test`
Expected: PASS, 1 test.

Run: `npm run dev` and open the printed URL.
Expected: dark radial-gradient ground, "Portfolio" in Inter at weight 500.

- [ ] **Step 13: Commit and merge**

```bash
echo "20" > .nvmrc
git add -A && git commit -m "feat: scaffold Vite + React with Nocturne tokens and Vitest"
git checkout develop && git merge --no-ff feat/scaffold -m "merge: scaffold"
```

---

### Task 2: Content spine and slug derivation

**Files:**
- Create: `src/lib/slugify.js`
- Create: `src/content/entries.js`
- Test: `src/lib/__tests__/slugify.test.js`, `src/content/__tests__/entries.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `slugify(title: string) => string`
  - `ENTRIES: Array<{ slug, t, year, date, kind, orient?, tags: string[], images?: string[], href: string }>` — nine items, oldest first
  - `bySlug(slug: string) => Entry | undefined`
  - `T_MIN = 2019.2`, `T_MAX = 2026.75`

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/content-spine
```

- [ ] **Step 2: Write the failing slugify test**

```js
// src/lib/__tests__/slugify.test.js
import { describe, it, expect } from 'vitest'
import { slugify } from '../slugify.js'

describe('slugify', () => {
  it('maps the nine portfolio titles to their expected slugs', () => {
    const pairs = [
      ['Independent iOS', 'independent-ios'],
      ['Matee', 'matee'],
      ['Freelance', 'freelance'],
      ['Billdu', 'billdu'],
      ['O2 Slovakia', 'o2-slovakia'],
      ['FormCoach', 'formcoach'],
      ['Worldwanderer', 'worldwanderer'],
      ['SideQ', 'sideq'],
      ['Apex Ryde', 'apex-ryde'],
    ]
    for (const [title, slug] of pairs) expect(slugify(title)).toBe(slug)
  })

  it('collapses runs of punctuation and trims the ends', () => {
    expect(slugify('  Hello -- World!  ')).toBe('hello-world')
  })

  it('strips diacritics', () => {
    expect(slugify('Přehled Žánrů')).toBe('prehled-zanru')
  })
})
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/lib/__tests__/slugify.test.js`
Expected: FAIL — cannot resolve `../slugify.js`.

- [ ] **Step 4: Implement `src/lib/slugify.js`**

```js
export function slugify(title) {
  return String(title)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 5: Run it and watch it pass**

Run: `npx vitest run src/lib/__tests__/slugify.test.js`
Expected: PASS, 3 tests.

- [ ] **Step 6: Write `src/content/entries.js`**

Transcribed from the handoff's `content/content.js`. Translatable prose is deliberately
absent — it lives in the locale files. `href` for Worldwanderer and SideQ use the App
Store URLs recovered from the sibling web projects; Apex Ryde keeps its Netlify link
because it is not on the Store yet.

```js
import { slugify } from '../lib/slugify.js'

export const T_MIN = 2019.2
export const T_MAX = 2026.75

const RAW = [
  { t: 2019.4, year: '2019', date: '2019-06', title: 'Independent iOS', kind: 'own',
    tags: ['Swift', 'UIKit', 'REST', 'App Store Connect'],
    href: 'mailto:pcesnek290@gmail.com' },

  { t: 2022.1, year: '2022', date: '2022-02', title: 'Matee', kind: 'job',
    tags: ['SwiftUI', 'Kotlin Multiplatform', 'Compose MP', 'XCTest', 'Crashlytics'],
    href: 'mailto:pcesnek290@gmail.com' },

  { t: 2023.9, year: '2023', date: '2023-11', title: 'Freelance', kind: 'job',
    tags: ['Firestore', 'Auth', 'Cloud Messaging', 'SQLite', 'MongoDB', 'Analytics'],
    href: 'mailto:pcesnek290@gmail.com' },

  { t: 2024.7, year: '2024', date: '2024-09', title: 'Billdu', kind: 'job',
    tags: ['Swift', 'MVVM', 'SQLite', 'REST'],
    href: 'mailto:pcesnek290@gmail.com' },

  { t: 2025.5, year: '2025', date: '2025-06', title: 'O2 Slovakia', kind: 'job',
    tags: ['Design System', 'SPM', 'Design Tokens', 'Swift Testing', 'CI'],
    href: 'mailto:pcesnek290@gmail.com' },

  { t: 2026.05, year: '2026', date: '2026-01', title: 'FormCoach', kind: 'job',
    tags: ['SwiftUI', 'WidgetKit', 'HealthKit', 'Live Activities', 'MVVM'],
    href: 'mailto:pcesnek290@gmail.com' },

  { t: 2026.25, year: '2026', date: '2026-03', title: 'Worldwanderer', kind: 'own',
    orient: 'portrait',
    tags: ['SwiftUI', 'MapKit', 'Firebase', 'Localization'],
    images: ['ww-3', 'ww-2', 'ww-1'],
    href: 'https://apps.apple.com/app/id6772739029' },

  { t: 2026.4, year: '2026', date: '2026-05', title: 'SideQ', kind: 'own',
    orient: 'portrait',
    tags: ['Swift 6', 'Strict Concurrency', 'SwiftData', 'StoreKit 2', 'Live Activities'],
    images: ['sideq-1', 'sideq-2', 'sideq-3', 'sideq-4', 'sideq-5'],
    href: 'https://apps.apple.com/app/sideq/id6767996805' },

  { t: 2026.55, year: '2026', date: '2026-06', title: 'Apex Ryde', kind: 'own',
    tags: ['Swift', 'SceneKit', 'Physics', 'No dependencies'],
    images: ['apex-1', 'apex-2', 'apex-3'],
    href: 'https://app.netlify.com/projects/apex-ryder/' },
]

export const ENTRIES = RAW.map((e) => ({ ...e, slug: slugify(e.title) }))

export const bySlug = (slug) => ENTRIES.find((e) => e.slug === slug)
```

- [ ] **Step 7: Write the entries test**

```js
// src/content/__tests__/entries.test.js
import { describe, it, expect } from 'vitest'
import { ENTRIES, bySlug, T_MIN, T_MAX } from '../entries.js'

describe('ENTRIES', () => {
  it('holds nine entries ordered oldest first', () => {
    expect(ENTRIES).toHaveLength(9)
    const ts = ENTRIES.map((e) => e.t)
    expect([...ts].sort((a, b) => a - b)).toEqual(ts)
  })

  it('keeps every t inside the track range', () => {
    for (const e of ENTRIES) {
      expect(e.t).toBeGreaterThanOrEqual(T_MIN)
      expect(e.t).toBeLessThanOrEqual(T_MAX)
    }
  })

  it('gives every entry a unique slug', () => {
    const slugs = ENTRIES.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(9)
  })

  it('gives own projects images and jobs none', () => {
    for (const e of ENTRIES) {
      if (e.kind === 'own' && e.slug !== 'independent-ios') expect(e.images?.length).toBeGreaterThan(0)
      if (e.kind === 'job') expect(e.images).toBeUndefined()
    }
  })

  it('resolves entries by slug', () => {
    expect(bySlug('apex-ryde').title).toBe('Apex Ryde')
    expect(bySlug('nope')).toBeUndefined()
  })
})
```

- [ ] **Step 8: Run the suite**

Run: `npm test`
Expected: PASS — smoke + 3 slugify + 5 entries.

- [ ] **Step 9: Commit and merge**

```bash
git add -A && git commit -m "feat: add content spine with derived slugs and App Store links"
git checkout develop && git merge --no-ff feat/content-spine -m "merge: content spine"
```

---

### Task 3: i18n engine and the English dictionary

**Files:**
- Create: `src/i18n/locales/en.json`
- Create: `src/i18n/resolveLocale.js`, `src/i18n/LocaleProvider.jsx`, `src/i18n/index.js`
- Test: `src/i18n/__tests__/resolveLocale.test.js`

**Interfaces:**
- Consumes: `ENTRIES` from Task 2.
- Produces:
  - `LOCALES = ['en', 'cs', 'sk']`, `DEFAULT_LOCALE = 'en'`
  - `resolveLocale({ pathname, stored, navigatorLangs }) => 'en' | 'cs' | 'sk'`
  - `stripLocale(pathname) => string` — path without a locale prefix, always leading-slash
  - `localePath(locale, path) => string` — prefixes unless `en`
  - `<LocaleProvider>` and `useLocale() => { locale, setLocale, t, tEntry, dict }`
  - `t(key, params?) => string` — dot-path lookup, `{name}` interpolation, falls back to `en`
  - `tEntry(slug) => { short, blurb, notes, captions, span, cta, hrefLabel, coverNote }`

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/i18n-engine
```

- [ ] **Step 2: Write the failing locale-resolution test**

```js
// src/i18n/__tests__/resolveLocale.test.js
import { describe, it, expect } from 'vitest'
import { resolveLocale, stripLocale, localePath } from '../resolveLocale.js'

describe('resolveLocale', () => {
  it('prefers an explicit path prefix over everything else', () => {
    expect(resolveLocale({ pathname: '/cs/about', stored: 'sk', navigatorLangs: ['en-US'] })).toBe('cs')
  })

  it('falls back to the stored preference when the path is unprefixed', () => {
    expect(resolveLocale({ pathname: '/about', stored: 'sk', navigatorLangs: ['en-US'] })).toBe('sk')
  })

  it('falls back to the navigator language when nothing is stored', () => {
    expect(resolveLocale({ pathname: '/', stored: null, navigatorLangs: ['cs-CZ', 'en'] })).toBe('cs')
  })

  it('falls back to English for an unsupported navigator language', () => {
    expect(resolveLocale({ pathname: '/', stored: null, navigatorLangs: ['fr-FR'] })).toBe('en')
  })

  it('ignores an unsupported prefix rather than treating it as a locale', () => {
    expect(resolveLocale({ pathname: '/de/about', stored: null, navigatorLangs: ['fr'] })).toBe('en')
  })

  it('ignores a stored value that is not a supported locale', () => {
    expect(resolveLocale({ pathname: '/', stored: 'de', navigatorLangs: ['sk'] })).toBe('sk')
  })
})

describe('stripLocale', () => {
  it('removes a locale prefix', () => {
    expect(stripLocale('/cs/projects/sideq')).toBe('/projects/sideq')
    expect(stripLocale('/sk')).toBe('/')
  })

  it('leaves an unprefixed path alone', () => {
    expect(stripLocale('/projects/sideq')).toBe('/projects/sideq')
    expect(stripLocale('/')).toBe('/')
  })

  it('does not mistake a route for a locale', () => {
    expect(stripLocale('/cv')).toBe('/cv')
  })
})

describe('localePath', () => {
  it('leaves English unprefixed', () => {
    expect(localePath('en', '/about')).toBe('/about')
    expect(localePath('en', '/')).toBe('/')
  })

  it('prefixes the other locales', () => {
    expect(localePath('cs', '/about')).toBe('/cs/about')
    expect(localePath('sk', '/')).toBe('/sk')
  })
})
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/i18n/__tests__/resolveLocale.test.js`
Expected: FAIL — cannot resolve `../resolveLocale.js`.

- [ ] **Step 4: Implement `src/i18n/resolveLocale.js`**

```js
export const LOCALES = ['en', 'cs', 'sk']
export const DEFAULT_LOCALE = 'en'
export const PREFIXED = LOCALES.filter((l) => l !== DEFAULT_LOCALE)

const isLocale = (v) => LOCALES.includes(v)

export function localeFromPath(pathname) {
  const seg = String(pathname).split('/').filter(Boolean)[0]
  return PREFIXED.includes(seg) ? seg : null
}

export function stripLocale(pathname) {
  const segs = String(pathname).split('/').filter(Boolean)
  if (PREFIXED.includes(segs[0])) segs.shift()
  return '/' + segs.join('/')
}

export function localePath(locale, path) {
  const clean = '/' + String(path).split('/').filter(Boolean).join('/')
  if (locale === DEFAULT_LOCALE) return clean
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`
}

export function resolveLocale({ pathname = '/', stored = null, navigatorLangs = [] } = {}) {
  const fromPath = localeFromPath(pathname)
  if (fromPath) return fromPath
  if (isLocale(stored)) return stored
  for (const lang of navigatorLangs) {
    const base = String(lang).toLowerCase().split('-')[0]
    if (isLocale(base)) return base
  }
  return DEFAULT_LOCALE
}
```

- [ ] **Step 5: Run it and watch it pass**

Run: `npx vitest run src/i18n/__tests__/resolveLocale.test.js`
Expected: PASS, 11 tests.

- [ ] **Step 6: Write `src/i18n/locales/en.json`**

The full English dictionary. Prose is transcribed verbatim from the handoff's
`content.js` and the `reference/Patrik Cesnek Site.dc.html` prototype — do not rewrite it.

Shape:

```json
{
  "meta": {
    "name": "English",
    "htmlLang": "en",
    "siteTitle": "Patrik Cesnek — Senior iOS Developer",
    "siteDescription": "Senior iOS developer in Brno. SwiftUI since 2019, full release ownership, and a shelf of my own shipped apps."
  },
  "months": ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"],
  "nav": { "work": "WORK", "lab": "LAB", "about": "ABOUT", "cv": "CV", "contact": "GET IN TOUCH", "role": "SENIOR iOS DEVELOPER · BRNO", "language": "Language" },
  "kind": { "own": "OWN PROJECT", "job": "EMPLOYED", "ownShort": "OWN", "jobShort": "CONTRACT" },
  "work": { "gridHeading": "Everything, newest first", "openCase": "Open the case →", "trackHint": "DRAG TO SCRUB · {count} ENTRIES · 2019—2026", "owned": "WHAT I OWNED", "notShown": "Client work — described, not shown." },
  "project": { "back": "← BACK TO THE TIMELINE", "builtWith": "BUILT WITH", "when": "WHEN", "notShownLong": "Client work — described, not shown. Happy to walk through it in a call." },
  "lab": { "title": "The lab", "lede": "Things I build for the pleasure of understanding how they actually work. No roadmap, no stakeholders — just the part where you find out why a tire loses grip or how a quest engine should feel." },
  "about": {
    "title": "Hi — I'm Patrik.",
    "paragraphs": ["…", "…", "…"],
    "portraitAlt": "Patrik Cesnek",
    "portraitCaption": "Pompeii, somewhere between two ruins",
    "location": "Brno, CZ · remote"
  },
  "cv": { "title": "Curriculum", "download": "DOWNLOAD PDF", "education": "EDUCATION", "school": "Stredná odborná škola Ivanka pri Dunaji", "schoolNote": "Agricultural business — cynology · 2013—2017. Not a computer-science degree; the apps are the portfolio." },
  "footer": { "identity": "PATRIK CESNEK · SENIOR iOS DEVELOPER · BRNO, CZ", "email": "EMAIL" },
  "skills": [
    { "group": "SWIFT & APPLE", "note": "SwiftUI since 2019, right after its first release. Swift 6 strict concurrency on my own products before it was required at work." }
  ],
  "entries": {
    "apex-ryde": {
      "short": "A motorcycle simulator with a real gearbox and a friction-circle tire model.",
      "blurb": "A first-person iOS motorcycle simulator: friction-circle tire model, a real 1-N-2-3-4-5-6 sequential gearbox, quickshifter ignition-cut timing, wheelie mechanics. Zero third-party dependencies.",
      "span": "BUILT IN ONE TRAIN RIDE",
      "notes": ["…"],
      "captions": ["difficulty select", "third gear · 124 km/h", "40° lean · 164 km/h"],
      "coverNote": "early app icon",
      "cta": "Open Apex Ryde ↗",
      "hrefLabel": "apex-ryder"
    }
  }
}
```

Fill in **all nine entries** and **all six skill groups** with the exact copy from
`content.js`, and the three About paragraphs from the prototype (`Hi — I'm Patrik.`
section). The `skills[].items` arrays stay in the spine — see Task 12 — because they are
technical terms; only `group` and `note` are translated.

- [ ] **Step 7: Write `src/i18n/LocaleProvider.jsx`**

```jsx
import { createContext, useContext, useMemo, useCallback } from 'react'
import en from './locales/en.json'
import cs from './locales/cs.json'
import sk from './locales/sk.json'
import { DEFAULT_LOCALE } from './resolveLocale.js'

const DICTS = { en, cs, sk }
const LocaleContext = createContext(null)

function lookup(dict, key) {
  return key.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), dict)
}

export function LocaleProvider({ locale, children }) {
  const dict = DICTS[locale] ?? DICTS[DEFAULT_LOCALE]

  const t = useCallback((key, params) => {
    let value = lookup(dict, key)
    if (value === undefined) value = lookup(DICTS[DEFAULT_LOCALE], key)
    if (value === undefined) return key
    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m))
    }
    return value
  }, [dict])

  const tEntry = useCallback((slug) => {
    const fallback = DICTS[DEFAULT_LOCALE].entries[slug] ?? {}
    return { ...fallback, ...(dict.entries?.[slug] ?? {}) }
  }, [dict])

  const value = useMemo(() => ({ locale, dict, t, tEntry }), [locale, dict, t, tEntry])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside a LocaleProvider')
  return ctx
}
```

- [ ] **Step 8: Write `src/i18n/index.js` re-exporting the public surface**

```js
export { LocaleProvider, useLocale } from './LocaleProvider.jsx'
export { LOCALES, DEFAULT_LOCALE, PREFIXED, resolveLocale, stripLocale, localePath, localeFromPath } from './resolveLocale.js'
```

- [ ] **Step 9: Stub `cs.json` and `sk.json` so imports resolve**

```bash
cp src/i18n/locales/en.json src/i18n/locales/cs.json
cp src/i18n/locales/en.json src/i18n/locales/sk.json
```

These are placeholders replaced wholesale in Task 4.

- [ ] **Step 10: Run the suite and commit**

Run: `npm test`
Expected: PASS.

```bash
git add -A && git commit -m "feat: add i18n engine with locale resolution and English dictionary"
git checkout develop && git merge --no-ff feat/i18n-engine -m "merge: i18n engine"
```

---

### Task 4: Czech and Slovak dictionaries with a parity test

**Files:**
- Modify: `src/i18n/locales/cs.json`, `src/i18n/locales/sk.json` (replace stubs)
- Test: `src/i18n/__tests__/parity.test.js`

**Interfaces:**
- Consumes: `en.json` shape from Task 3.
- Produces: complete `cs` and `sk` dictionaries, structurally identical to `en`.

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/translations
```

- [ ] **Step 2: Write the parity test first**

```js
// src/i18n/__tests__/parity.test.js
import { describe, it, expect } from 'vitest'
import en from '../locales/en.json'
import cs from '../locales/cs.json'
import sk from '../locales/sk.json'
import { ENTRIES } from '../../content/entries.js'

const paths = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => {
    const p = prefix ? `${prefix}.${k}` : k
    return v && typeof v === 'object' && !Array.isArray(v) ? paths(v, p) : [p]
  })

const at = (obj, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), obj)

describe.each([['cs', cs], ['sk', sk]])('%s dictionary', (name, dict) => {
  it('has every key English has', () => {
    const missing = paths(en).filter((p) => at(dict, p) === undefined)
    expect(missing).toEqual([])
  })

  it('has no keys English lacks', () => {
    const extra = paths(dict).filter((p) => at(en, p) === undefined)
    expect(extra).toEqual([])
  })

  it('matches every array length', () => {
    for (const p of paths(en)) {
      const a = at(en, p)
      if (Array.isArray(a)) expect(at(dict, p), p).toHaveLength(a.length)
    }
  })

  it('covers all nine entries', () => {
    for (const e of ENTRIES) expect(dict.entries[e.slug], e.slug).toBeDefined()
  })

  it('has twelve month abbreviations', () => {
    expect(dict.months).toHaveLength(12)
  })

  it('is actually translated, not a copy of English', () => {
    expect(dict.about.title).not.toBe(en.about.title)
    expect(dict.lab.lede).not.toBe(en.lab.lede)
  })
})
```

- [ ] **Step 3: Run it and watch the last assertion fail**

Run: `npx vitest run src/i18n/__tests__/parity.test.js`
Expected: FAIL on "is actually translated" — the stubs are English copies.

- [ ] **Step 4: Write `cs.json`**

Translate every string. Keep technical terms untranslated (`SwiftUI`, `Kotlin
Multiplatform`, `App Store Connect`). Keep the mono labels uppercase, matching the
design's register. Czech months: `LED ÚNO BŘE DUB KVĚ ČVN ČVC SRP ZÁŘ ŘÍJ LIS PRO`.

Key examples to set the tone — the rest follows the same voice:

```
nav.role         → "SENIOR iOS VÝVOJÁŘ · BRNO"
nav.contact      → "OZVĚTE SE"
kind.own         → "VLASTNÍ PROJEKT"
kind.job         → "ZAMĚSTNÁN"
kind.ownShort    → "VLASTNÍ"
kind.jobShort    → "KONTRAKT"
work.gridHeading → "Všechno, od nejnovějšího"
work.openCase    → "Otevřít případ →"
work.trackHint   → "TÁHNUTÍM PROCHÁZEJ · {count} ZÁZNAMŮ · 2019—2026"
work.owned       → "CO JSEM VLASTNIL"
work.notShown    → "Klientská práce — popsaná, neukázaná."
project.back     → "← ZPĚT NA ČASOVOU OSU"
project.builtWith→ "POSTAVENO Z"
project.when     → "KDY"
lab.title        → "Laboratoř"
about.title      → "Ahoj — jsem Patrik."
cv.title         → "Životopis"
cv.download      → "STÁHNOUT PDF"
cv.education     → "VZDĚLÁNÍ"
```

- [ ] **Step 5: Write `sk.json`**

Same process. Slovak months: `JAN FEB MAR APR MÁJ JÚN JÚL AUG SEP OKT NOV DEC`.

```
nav.role         → "SENIOR iOS VÝVOJÁR · BRNO"
nav.contact      → "OZVITE SA"
kind.own         → "VLASTNÝ PROJEKT"
kind.job         → "ZAMESTNANÝ"
kind.ownShort    → "VLASTNÉ"
kind.jobShort    → "KONTRAKT"
work.gridHeading → "Všetko, od najnovšieho"
work.openCase    → "Otvoriť prípad →"
work.trackHint   → "POTIAHNUTÍM PRECHÁDZAJ · {count} ZÁZNAMOV · 2019—2026"
work.owned       → "ČO SOM VLASTNIL"
work.notShown    → "Klientská práca — opísaná, neukázaná."
project.back     → "← SPÄŤ NA ČASOVÚ OS"
project.builtWith→ "POSTAVENÉ Z"
project.when     → "KEDY"
lab.title        → "Laboratórium"
about.title      → "Ahoj — som Patrik."
cv.title         → "Životopis"
cv.download      → "STIAHNUŤ PDF"
cv.education     → "VZDELANIE"
```

Note: the school name `Stredná odborná škola Ivanka pri Dunaji` is already Slovak — leave
it verbatim in all three dictionaries.

- [ ] **Step 6: Run the parity test**

Run: `npx vitest run src/i18n/__tests__/parity.test.js`
Expected: PASS, 18 tests (6 × 2 locales, plus the entry loops).

- [ ] **Step 7: Commit and merge**

```bash
git add -A && git commit -m "feat: add Czech and Slovak dictionaries with parity test"
git checkout develop && git merge --no-ff feat/translations -m "merge: cs and sk translations"
```

---

### Task 5: Asset pipeline

**Files:**
- Create: `scripts/optimize-assets.mjs`
- Create: `src/assets/manifest.js`
- Create (generated): `public/img/*.avif|webp|jpg`, `public/cv/Patrik_Cesnek_CV.pdf`

**Interfaces:**
- Consumes: raw files in `~/Downloads/design_handoff_portfolio/assets`.
- Produces: `imgSrc(name, width) => string`, `imgSrcSet(name) => string`, `PORTRAIT` — used by every media component.

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/assets
```

- [ ] **Step 2: Write `scripts/optimize-assets.mjs`**

```js
import sharp from 'sharp'
import { mkdir, readdir, copyFile } from 'node:fs/promises'
import { join, parse } from 'node:path'

const SRC = process.env.HANDOFF ?? `${process.env.HOME}/Downloads/design_handoff_portfolio/assets`
const OUT = 'public/img'
const WIDTHS = [108, 320, 500, 760, 1120]

await mkdir(OUT, { recursive: true })

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f))

for (const file of files) {
  const { name } = parse(file)
  const input = join(SRC, file)
  const meta = await sharp(input).metadata()

  if (name === 'patrik') {
    // Head-and-shoulders crop: the source is 768x1024 and mostly sky.
    // The prototype faked this with background-size: 260%; we ship a real crop.
    const side = Math.round(meta.width * 0.78)
    const left = Math.round(meta.width * 0.11)
    const top = Math.round(meta.height * 0.30)
    const base = sharp(input).extract({ left, top, width: side, height: Math.round(side * 1.25) })
    for (const w of [320, 640]) {
      await base.clone().resize(w).avif({ quality: 62 }).toFile(`${OUT}/portrait-${w}.avif`)
      await base.clone().resize(w).webp({ quality: 78 }).toFile(`${OUT}/portrait-${w}.webp`)
      await base.clone().resize(w).jpeg({ quality: 82, mozjpeg: true }).toFile(`${OUT}/portrait-${w}.jpg`)
    }
    continue
  }

  for (const w of WIDTHS) {
    if (w > meta.width) continue
    const base = sharp(input).resize(w)
    await base.clone().avif({ quality: 58 }).toFile(`${OUT}/${name}-${w}.avif`)
    await base.clone().webp({ quality: 76 }).toFile(`${OUT}/${name}-${w}.webp`)
    await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/${name}-${w}.jpg`)
  }
}

await mkdir('public/cv', { recursive: true })
await copyFile(`${process.env.HOME}/Documents/CV/Patrik_Cesnek_CV.pdf`, 'public/cv/Patrik_Cesnek_CV.pdf')

console.log(`optimised ${files.length} images`)
```

- [ ] **Step 3: Run it**

Run: `npm run assets`
Expected: `optimised 12 images`, and `public/img` populated.

Verify the total is far below the 19MB raw:

Run: `du -sh public/img`
Expected: under 3MB.

- [ ] **Step 4: Write `src/assets/manifest.js`**

```js
const WIDTHS = [108, 320, 500, 760, 1120]

export const imgSrc = (name, width = 500) => `/img/${name}-${width}.jpg`

export const imgSrcSet = (name, type = 'jpg', widths = WIDTHS) =>
  widths.map((w) => `/img/${name}-${w}.${type} ${w}w`).join(', ')

export const PORTRAIT = {
  avif: '/img/portrait-320.avif 320w, /img/portrait-640.avif 640w',
  webp: '/img/portrait-320.webp 320w, /img/portrait-640.webp 640w',
  jpg: '/img/portrait-640.jpg',
}

export const CV_PDF = '/cv/Patrik_Cesnek_CV.pdf'
```

- [ ] **Step 5: Commit and merge**

Generated images are committed so Netlify does not need sharp at build time.

```bash
git add -A && git commit -m "feat: add asset pipeline with AVIF/WebP derivatives, cropped portrait and CV PDF"
git checkout develop && git merge --no-ff feat/assets -m "merge: asset pipeline"
```

---

### Task 6: App shell — routing, nav, footer, language switcher

**Files:**
- Modify: `src/App.jsx`
- Create: `src/components/Nav.jsx` + `Nav.module.css`
- Create: `src/components/Footer.jsx` + `Footer.module.css`
- Create: `src/components/LangSwitcher.jsx` + `LangSwitcher.module.css`
- Create: `src/components/ScrollToTop.jsx`
- Create: `src/pages/{Work,ProjectPage,Lab,About,CV,NotFound}.jsx` (placeholders)

**Interfaces:**
- Consumes: `useLocale`, `localePath`, `stripLocale` from Task 3; `ENTRIES` from Task 2.
- Produces: `useLocalePath() => (path) => string` — a hook every internal link uses.

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/app-shell
```

- [ ] **Step 2: Write `src/App.jsx`**

Routes are declared once and mounted at both `/` and `/:locale`.

```jsx
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { LocaleProvider, resolveLocale, PREFIXED } from './i18n/index.js'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Work from './pages/Work.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import Lab from './pages/Lab.jsx'
import About from './pages/About.jsx'
import CV from './pages/CV.jsx'
import NotFound from './pages/NotFound.jsx'

const PAGES = (
  <>
    <Route index element={<Work />} />
    <Route path="projects/:slug" element={<ProjectPage />} />
    <Route path="lab" element={<Lab />} />
    <Route path="about" element={<About />} />
    <Route path="cv" element={<CV />} />
    <Route path="*" element={<NotFound />} />
  </>
)

export default function App() {
  const { pathname } = useLocation()
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : null
  const navigatorLangs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : []
  const locale = resolveLocale({ pathname, stored, navigatorLangs })

  return (
    <LocaleProvider locale={locale}>
      <ScrollToTop />
      <Nav />
      <Routes>
        {PREFIXED.map((l) => (
          <Route key={l} path={`/${l}`}>{PAGES}</Route>
        ))}
        <Route path="/">{PAGES}</Route>
      </Routes>
      <Footer />
    </LocaleProvider>
  )
}
```

- [ ] **Step 3: Write `src/components/ScrollToTop.jsx`**

```jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
```

- [ ] **Step 4: Write `src/hooks/useLocalePath.js`**

```js
import { useCallback } from 'react'
import { useLocale, localePath } from '../i18n/index.js'

export function useLocalePath() {
  const { locale } = useLocale()
  return useCallback((path) => localePath(locale, path), [locale])
}
```

- [ ] **Step 5: Write `Nav.jsx` and `Nav.module.css`**

Per the handoff: `position: sticky; top: 0; z-index: 20`, `padding: 20px 56px`,
`rgba(16,18,32,0.82)` + `backdrop-filter: blur(14px)`, `border-bottom: 1px solid
var(--color-neutral-900)`. Left: name at 16px / `-0.01em` plus muted mono role, the pair
being one link back to Work. Right: `WORK LAB ABOUT CV` at mono 12px / `0.1em`, `gap:
28px`, active `--color-accent-300`, inactive `--color-neutral-500`, then `LangSwitcher`,
then a `.btn.btn-primary` reading `nav.contact` linking to `mailto:pcesnek290@gmail.com`.

```jsx
import { NavLink, Link, useLocation } from 'react-router-dom'
import { useLocale, stripLocale } from '../i18n/index.js'
import { useLocalePath } from '../hooks/useLocalePath.js'
import LangSwitcher from './LangSwitcher.jsx'
import s from './Nav.module.css'

const ITEMS = [['/', 'work'], ['/lab', 'lab'], ['/about', 'about'], ['/cv', 'cv']]

export default function Nav() {
  const { t } = useLocale()
  const lp = useLocalePath()
  const here = stripLocale(useLocation().pathname)

  return (
    <header className={s.nav}>
      <Link to={lp('/')} className={s.brand}>
        <span className={s.name}>Patrik Cesnek</span>
        <span className={`mono ${s.role}`}>{t('nav.role')}</span>
      </Link>
      <nav className={s.links}>
        {ITEMS.map(([path, key]) => (
          <NavLink key={key} to={lp(path)} end={path === '/'}
            className={({ isActive }) => `mono ${s.link} ${isActive || (path !== '/' && here.startsWith(path)) ? s.active : ''}`}>
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>
      <LangSwitcher />
      <a className={`btn btn-primary mono ${s.cta}`} href="mailto:pcesnek290@gmail.com">{t('nav.contact')}</a>
    </header>
  )
}
```

- [ ] **Step 6: Write `LangSwitcher.jsx`**

Three mono links, current one in `--color-accent-300`. Swapping keeps the visitor on the
same route by rebuilding the path from `stripLocale(pathname)`, and persists the choice.

```jsx
import { Link, useLocation } from 'react-router-dom'
import { useLocale, LOCALES, localePath, stripLocale } from '../i18n/index.js'
import s from './LangSwitcher.module.css'

export default function LangSwitcher() {
  const { locale } = useLocale()
  const { pathname, hash } = useLocation()
  const bare = stripLocale(pathname)

  return (
    <div className={s.wrap} role="group" aria-label="Language">
      {LOCALES.map((l) => (
        <Link key={l} to={localePath(l, bare) + hash} hrefLang={l}
          aria-current={l === locale ? 'true' : undefined}
          onClick={() => localStorage.setItem('locale', l)}
          className={`mono ${s.item} ${l === locale ? s.active : ''}`}>
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 7: Write `Footer.jsx`**

`padding: 28px 56px 40px`, `border-top: 1px solid var(--color-neutral-900)`, mono 11px
`0.08em`. Left muted `footer.identity`; right a 22px-gap row of EMAIL, SIDEQ,
WORLDWANDERER — the latter two external with `target="_blank" rel="noopener"` pointing at
`https://sidequest-ios.netlify.app/` and `https://worldwanderer-web.netlify.app/`.

- [ ] **Step 8: Write placeholder pages**

Each returns `<main>` with the page title from the dictionary, so routing is verifiable
before the real content lands.

- [ ] **Step 9: Verify in the browser**

Run: `npm run dev`
Expected: sticky blurred nav; clicking WORK/LAB/ABOUT/CV changes the URL and the active
item; clicking CS rewrites `/about` to `/cs/about` and the nav labels turn Czech; SK
likewise; EN drops the prefix.

- [ ] **Step 10: Commit and merge**

```bash
git add -A && git commit -m "feat: add app shell with locale-prefixed routing, nav, footer and switcher"
git checkout develop && git merge --no-ff feat/app-shell -m "merge: app shell"
```

---

### Task 7: Scrub track

**Files:**
- Create: `src/lib/track.js`
- Create: `src/components/ScrubTrack.jsx` + `ScrubTrack.module.css`
- Test: `src/lib/__tests__/track.test.js`

**Interfaces:**
- Consumes: `ENTRIES`, `T_MIN`, `T_MAX` from Task 2; `useLocale` from Task 3.
- Produces:
  - `position(t) => number` — percentage 0–100
  - `tFromFraction(frac) => number`
  - `nearestIndex(t, entries) => number`
  - `indexFromPointer(clientX, rect, entries) => number`
  - `tickLabel(entry, index, entries, months) => string`
  - `<ScrubTrack activeIndex onChange />`

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/scrub-track
```

- [ ] **Step 2: Write the failing track test**

```js
// src/lib/__tests__/track.test.js
import { describe, it, expect } from 'vitest'
import { position, tFromFraction, nearestIndex, indexFromPointer, tickLabel } from '../track.js'
import { ENTRIES, T_MIN, T_MAX } from '../../content/entries.js'

const rect = { left: 100, width: 1000 }

describe('position', () => {
  it('puts the range ends at 0% and 100%', () => {
    expect(position(T_MIN)).toBeCloseTo(0)
    expect(position(T_MAX)).toBeCloseTo(100)
  })

  it('places the midpoint at 50%', () => {
    expect(position((T_MIN + T_MAX) / 2)).toBeCloseTo(50)
  })

  it('keeps every entry on the track', () => {
    for (const e of ENTRIES) {
      expect(position(e.t)).toBeGreaterThanOrEqual(0)
      expect(position(e.t)).toBeLessThanOrEqual(100)
    }
  })
})

describe('indexFromPointer', () => {
  it('snaps to the first entry at the far left', () => {
    expect(indexFromPointer(100, rect, ENTRIES)).toBe(0)
  })

  it('snaps to the last entry at the far right', () => {
    expect(indexFromPointer(1100, rect, ENTRIES)).toBe(ENTRIES.length - 1)
  })

  it('clamps rather than overflowing past either end', () => {
    expect(indexFromPointer(-500, rect, ENTRIES)).toBe(0)
    expect(indexFromPointer(9999, rect, ENTRIES)).toBe(ENTRIES.length - 1)
  })

  it('snaps to whichever entry is nearest, not the one before', () => {
    const target = ENTRIES[4]
    const x = rect.left + (position(target.t) / 100) * rect.width
    expect(indexFromPointer(x, rect, ENTRIES)).toBe(4)
  })

  it('lands on each entry when pointed straight at it', () => {
    ENTRIES.forEach((e, i) => {
      const x = rect.left + (position(e.t) / 100) * rect.width
      expect(indexFromPointer(x, rect, ENTRIES)).toBe(i)
    })
  })
})

describe('tFromFraction', () => {
  it('is the inverse of position', () => {
    expect(position(tFromFraction(0.25))).toBeCloseTo(25)
  })
})

describe('nearestIndex', () => {
  it('returns the closest entry by absolute distance', () => {
    expect(nearestIndex(2019.0, ENTRIES)).toBe(0)
    expect(nearestIndex(2030, ENTRIES)).toBe(ENTRIES.length - 1)
  })
})

describe('tickLabel', () => {
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

  it('shows the year for the first entry of that year', () => {
    expect(tickLabel(ENTRIES[0], 0, ENTRIES, months)).toBe('2019')
    expect(tickLabel(ENTRIES[5], 5, ENTRIES, months)).toBe('2026')
  })

  it('shows the month for later entries in the same year', () => {
    expect(tickLabel(ENTRIES[6], 6, ENTRIES, months)).toBe('MAR')
    expect(tickLabel(ENTRIES[7], 7, ENTRIES, months)).toBe('MAY')
    expect(tickLabel(ENTRIES[8], 8, ENTRIES, months)).toBe('JUN')
  })

  it('uses the supplied month table, so it localises', () => {
    const cs = ['LED','ÚNO','BŘE','DUB','KVĚ','ČVN','ČVC','SRP','ZÁŘ','ŘÍJ','LIS','PRO']
    expect(tickLabel(ENTRIES[6], 6, ENTRIES, cs)).toBe('BŘE')
  })
})
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/lib/__tests__/track.test.js`
Expected: FAIL — cannot resolve `../track.js`.

- [ ] **Step 4: Implement `src/lib/track.js`**

```js
import { T_MIN, T_MAX } from '../content/entries.js'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export const position = (t) => ((t - T_MIN) / (T_MAX - T_MIN)) * 100

export const tFromFraction = (frac) => T_MIN + clamp(frac, 0, 1) * (T_MAX - T_MIN)

export function nearestIndex(t, entries) {
  let best = 0
  let bestDist = Infinity
  entries.forEach((e, i) => {
    const d = Math.abs(e.t - t)
    if (d < bestDist) { bestDist = d; best = i }
  })
  return best
}

export function indexFromPointer(clientX, rect, entries) {
  const frac = clamp((clientX - rect.left) / rect.width, 0, 1)
  return nearestIndex(tFromFraction(frac), entries)
}

export function tickLabel(entry, index, entries, months) {
  const firstOfYear = entries.findIndex((e) => e.year === entry.year)
  if (firstOfYear === index) return entry.year
  const month = Number(entry.date.split('-')[1])
  return months[month - 1]
}
```

- [ ] **Step 5: Run it and watch it pass**

Run: `npx vitest run src/lib/__tests__/track.test.js`
Expected: PASS, 12 tests.

- [ ] **Step 6: Write `ScrubTrack.jsx`**

Header row: muted mono `work.trackHint` with `{count}` interpolated left, accent-300 mono
counter `09 / 09` right (zero-padded to two digits).

Track: `position: relative; height: 88px; cursor: ew-resize; touch-action: none`, with
`role="slider"`, `aria-valuemin={0}`, `aria-valuemax={n-1}`, `aria-valuenow={activeIndex}`,
`aria-valuetext={activeEntry.title}`, `tabIndex={0}`.

- Baseline: absolute, `top: 30px`, `height: 1px`, `linear-gradient(90deg, transparent, var(--color-neutral-800) 5%, var(--color-neutral-800) 95%, transparent)`.
- Progress fill: same top, `width: position(active.t)%`, `linear-gradient(90deg, transparent, var(--color-accent-500))`.
- Ticks: `<button>` absolutely placed at `left: position(e.t)%`, `transform: translateX(-50%)`, column, `align-items: center; gap: 8px`. A 1px vertical mark bottom-aligned in a 30px box — **26px** active, **14px** own, **9px** job — then a dot (7px active / 3px inactive, `border-radius: 999px`), then a mono 11px label with `margin-top: 0` on even indices and `14px` on odd.
- Colours: active mark/dot `--color-accent-400`, label `--color-accent-200`; inactive mark/dot `--color-neutral-700`, label `--color-neutral-600`. Label hover → `--color-accent-200`.

Pointer handling:

```jsx
const ref = useRef(null)
const [dragging, setDragging] = useState(false)

const setFromPointer = (clientX) => {
  const rect = ref.current.getBoundingClientRect()
  onChange(indexFromPointer(clientX, rect, ENTRIES))
}

const onPointerDown = (e) => {
  ref.current.setPointerCapture(e.pointerId)
  setDragging(true)
  setFromPointer(e.clientX)
}
const onPointerMove = (e) => { if (dragging) setFromPointer(e.clientX) }
const onPointerUp = (e) => {
  setDragging(false)
  if (ref.current.hasPointerCapture(e.pointerId)) ref.current.releasePointerCapture(e.pointerId)
}

const onKeyDown = (e) => {
  const n = ENTRIES.length
  if (e.key === 'ArrowLeft') { e.preventDefault(); onChange(Math.max(0, activeIndex - 1)) }
  if (e.key === 'ArrowRight') { e.preventDefault(); onChange(Math.min(n - 1, activeIndex + 1)) }
  if (e.key === 'Home') { e.preventDefault(); onChange(0) }
  if (e.key === 'End') { e.preventDefault(); onChange(n - 1) }
}
```

Tick buttons call `onChange(i)` and `stopPropagation` so a click does not also fire a drag
update.

- [ ] **Step 7: Verify in the browser**

Mount `ScrubTrack` temporarily in `Work.jsx` with local state.

Run: `npm run dev`
Expected: dragging moves the active tick and snaps; clicking a tick selects it; Tab
focuses the track and arrow keys step through entries; the counter tracks.

- [ ] **Step 8: Commit and merge**

```bash
git add -A && git commit -m "feat: add scrub track with pointer drag, tick clicks and keyboard slider"
git checkout develop && git merge --no-ff feat/scrub-track -m "merge: scrub track"
```

---

### Task 8: Hero and its three media states

**Files:**
- Create: `src/components/Hero.jsx` + `Hero.module.css`
- Create: `src/components/PhoneBezel.jsx` + `PhoneBezel.module.css`
- Create: `src/components/LandscapeShots.jsx` + `LandscapeShots.module.css`
- Create: `src/components/OwnedNotes.jsx` + `OwnedNotes.module.css`
- Create: `src/components/Kicker.jsx`, `src/components/Tag.jsx`, `src/components/Picture.jsx`

**Interfaces:**
- Consumes: `imgSrcSet`, `imgSrc` from Task 5; `useLocale`, `tEntry` from Task 3.
- Produces: `<Hero entry />`, `<PhoneBezel name alt width />`, `<Picture name alt sizes className />`.

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/hero
```

- [ ] **Step 2: Write `Picture.jsx` — the one image primitive**

```jsx
import { imgSrcSet, imgSrc } from '../assets/manifest.js'

export default function Picture({ name, alt, sizes = '100vw', className, style, eager = false }) {
  return (
    <picture>
      <source type="image/avif" srcSet={imgSrcSet(name, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={imgSrcSet(name, 'webp')} sizes={sizes} />
      <img src={imgSrc(name, 500)} srcSet={imgSrcSet(name, 'jpg')} sizes={sizes}
        alt={alt} className={className} style={style}
        loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </picture>
  )
}
```

- [ ] **Step 3: Write `Hero.jsx`**

Grid per the handoff: `grid-template-columns: minmax(0, 1fr) minmax(300px, 460px); gap:
56px; align-items: center; min-height: 620px; padding-top: 48px; position: relative`.

- Ghost year: `position: absolute; left: -18px; top: 46%; transform: translateY(-50%)`, `aria-hidden="true"`, `user-select: none; pointer-events: none`, colour `var(--ghost-year)`, `font-size: min(380px, 30vw)`, `line-height: 0.8`, `font-weight: 600`, `letter-spacing: -0.04em`. First in source; the text column is `position: relative`.
- Left column, `flex-direction: column; gap: 22px`:
  1. Kicker row, `gap: 10px; white-space: nowrap` — a 6px `border-radius: 999px` dot in `--color-accent`, then the kind label in `--color-accent-300`, then `span` muted. All mono 11px / `0.14em`.
  2. Title — a `<button>` styled as the heading, `clamp(54px, 6.6vw, 96px)` / 500 / `-0.035em` / 0.92, `text-wrap: balance`, navigating to the project page.
  3. Lede — `blurb`, 20px / 1.4, `--color-neutral-300`, `max-width: 620px`, `text-wrap: pretty`.
  4. Tag row — `flex-wrap: wrap; gap: 6px`, `.tag.tag-outline`.
  5. Action row, `gap: 14px` — `.btn.btn-primary` reading `work.openCase` navigating to the project page, then `hrefLabel` as muted mono 12px linking to `entry.href` in a new tab.
- Right column: `display: flex; justify-content: flex-end`, switching on state.

- [ ] **Step 4: Write `PhoneBezel.jsx`**

250px wide, `padding: 8px`, `border-radius: 36px`, `background: var(--bezel)`,
`box-shadow: var(--shadow-lg)`; inner image `border-radius: 29px`, `aspect-ratio: 360/778`,
`object-fit: cover`. Below, a `gap: 8px` row of the remaining screenshots at 54px wide,
`border-radius: 7px`, `box-shadow: var(--shadow-sm)`, `opacity: 0.85`.

- [ ] **Step 5: Write `LandscapeShots.jsx`**

A 460px column, `gap: 12px`, of figures — image `aspect-ratio: 778/360`, `border-radius:
var(--radius-md)`, `box-shadow: var(--shadow-md)` — each with a mono 11px caption under it.

- [ ] **Step 6: Write `OwnedNotes.jsx`**

A 320px block, `padding-left: 28px`, `border-left: 1px solid var(--color-neutral-800)`.
Kicker `work.owned` in mono 11px `--color-accent-300`, then each note as a row: a 4px
`--color-accent-500` dot at `margin-top: 9px` plus 15px / 1.45 text in
`--color-neutral-300`. Closes with muted mono `work.notShown`.

- [ ] **Step 7: Verify in the browser**

Run: `npm run dev`
Expected: dragging the track swaps the hero instantly — no animation. SideQ and
Worldwanderer show a phone bezel with thumbs; Apex Ryde shows stacked landscape figures;
the five job entries show the WHAT I OWNED block. The ghost year sits behind the title.

- [ ] **Step 8: Commit and merge**

```bash
git add -A && git commit -m "feat: add hero with phone bezel, landscape and owned-notes states"
git checkout develop && git merge --no-ff feat/hero -m "merge: hero"
```

---

### Task 9: Work view card grid

**Files:**
- Modify: `src/pages/Work.jsx`
- Create: `src/components/WorkCard.jsx` + `WorkCard.module.css`
- Create: `src/components/PlaceholderTile.jsx` + `PlaceholderTile.module.css`
- Create: `src/components/SectionHeading.jsx`

**Interfaces:**
- Consumes: `Hero`, `ScrubTrack`, `Picture` from Tasks 7–8.
- Produces: the complete Work route.

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/work-view
```

- [ ] **Step 2: Write `Work.jsx`**

`padding: 0 var(--gutter) 96px`. Holds `activeIndex` state defaulting to
`ENTRIES.length - 1` (newest), syncing to the URL hash so `/#sideq` opens on that entry:

```jsx
const { hash } = useLocation()
const initial = () => {
  const fromHash = ENTRIES.findIndex((e) => e.slug === hash.replace('#', ''))
  return fromHash >= 0 ? fromHash : ENTRIES.length - 1
}
const [activeIndex, setActiveIndex] = useState(initial)

const select = (i) => {
  setActiveIndex(i)
  window.history.replaceState(null, '', `#${ENTRIES[i].slug}`)
}
```

- [ ] **Step 3: Write the card grid**

`padding-top: 64px`. Heading via `SectionHeading`: mono 13px, `0.14em`, uppercase,
`--color-accent-300`, reading `work.gridHeading`. Grid: `repeat(auto-fit, minmax(300px,
1fr)); gap: 20px`, cards newest-first (`[...ENTRIES].reverse()`).

- [ ] **Step 4: Write `WorkCard.jsx`**

An `<button>` wrapping: `padding: 18px`, `border-radius: var(--radius-lg)`, `background:
var(--card-fill)`, `box-shadow: var(--shadow-md)` for own / `var(--shadow-sm)` for job,
`flex-direction: column; gap: 14px`. Hover lifts `sm` → `md` over `var(--transition)`.

- Meta row: kind label (`--color-accent-400` own / `--color-neutral-500` job) left, `date` muted right, mono 11px `0.1em`.
- Cover: 168px tall, `border-radius: var(--radius-md)`, `overflow: hidden`. Own projects use the entry's first screenshot with `object-fit: cover` and `object-position: center top` for portrait, `center` for landscape. Entries with no screenshots render `PlaceholderTile`.
- Title 22px / 500 / `-0.02em`, then `short` muted 14px / 1.45.

- [ ] **Step 5: Write `PlaceholderTile.jsx`**

`background-color: var(--placeholder-bg)`, `background-image:
var(--placeholder-stripe)`, centred muted mono label reading the entry's `coverNote`.

- [ ] **Step 6: Verify in the browser**

Run: `npm run dev`
Expected: nine cards newest-first; own projects carry screenshots, jobs carry striped
tiles with their coverNote; clicking a card routes to `/projects/<slug>` and scrolls to
top; hovering lifts the card edge.

- [ ] **Step 7: Commit and merge**

```bash
git add -A && git commit -m "feat: add Work view card grid with placeholder tiles"
git checkout develop && git merge --no-ff feat/work-view -m "merge: work view"
```

---

### Task 10: Project detail page

**Files:**
- Modify: `src/pages/ProjectPage.jsx`
- Create: `src/lib/neighbours.js`
- Test: `src/lib/__tests__/neighbours.test.js`

**Interfaces:**
- Consumes: `bySlug`, `ENTRIES`; `PhoneBezel`, `OwnedNotes`, `Picture`.
- Produces: `neighbours(index, length) => { prev, next }` where `prev` is older.

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/project-page
```

- [ ] **Step 2: Write the failing neighbours test**

```js
// src/lib/__tests__/neighbours.test.js
import { describe, it, expect } from 'vitest'
import { neighbours } from '../neighbours.js'
import { ENTRIES } from '../../content/entries.js'

describe('neighbours', () => {
  it('makes prev older and next newer', () => {
    const { prev, next } = neighbours(4, 9)
    expect(prev).toBe(3)
    expect(next).toBe(5)
    expect(ENTRIES[prev].t).toBeLessThan(ENTRIES[4].t)
    expect(ENTRIES[next].t).toBeGreaterThan(ENTRIES[4].t)
  })

  it('wraps from the oldest back to the newest', () => {
    expect(neighbours(0, 9).prev).toBe(8)
  })

  it('wraps from the newest forward to the oldest', () => {
    expect(neighbours(8, 9).next).toBe(0)
  })

  it('never returns the entry itself', () => {
    for (let i = 0; i < 9; i++) {
      const { prev, next } = neighbours(i, 9)
      expect(prev).not.toBe(i)
      expect(next).not.toBe(i)
    }
  })
})
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npx vitest run src/lib/__tests__/neighbours.test.js`
Expected: FAIL — cannot resolve `../neighbours.js`.

- [ ] **Step 4: Implement `src/lib/neighbours.js`**

```js
// prev is older (index - 1), next is newer (index + 1); both wrap.
// The handoff's "prev = index + 1" contradicts its own oldest-first data
// and its own rendered example; the semantic reading wins.
export function neighbours(index, length) {
  return {
    prev: (index - 1 + length) % length,
    next: (index + 1) % length,
  }
}
```

- [ ] **Step 5: Run it and watch it pass**

Run: `npx vitest run src/lib/__tests__/neighbours.test.js`
Expected: PASS, 4 tests.

- [ ] **Step 6: Write `ProjectPage.jsx`**

`padding: 44px var(--gutter) 110px; max-width: 1180px`. Unknown slug renders `NotFound`.

- Back affordance: muted mono `project.back`, a `<Link>` to `lp('/')`.
- Header, `padding-top: 34px; gap: 20px`: kicker row (kind + span), title at `clamp(48px, 5.4vw, 78px)` / 500 / `-0.035em` / 0.94, lede 21px / 1.45 `max-width: 760px`, then an action row with `.btn.btn-primary` reading the entry's `cta` linking out in a new tab plus the muted `hrefLabel`.
- Body: `grid-template-columns: 200px minmax(0, 1fr); gap: 40px; padding-top: 56px; align-items: start`.
  - Left rail, `position: sticky; top: 104px`: `project.builtWith` with each tag as muted mono 12px one per line, then `project.when` with the span.
  - Right column, `gap: 40px`:
    - Portrait: `grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px`, every screenshot in its own bezel (`padding: 8px`, `border-radius: 34px`, inner `27px`, `box-shadow: var(--shadow-md)`) with a mono caption.
    - Landscape: a column, `gap: 26px`, of full-width figures at `aspect-ratio: 778/360`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-lg)`, captioned.
    - Client work: `OwnedNotes` at larger scale — notes 17px / 1.5 — closing with `project.notShownLong`.
    - Footer row: `border-top: 1px solid var(--color-neutral-900); padding-top: 12px`, prev title left as `← {title}`, next right as `{title} →`, both muted mono 12px.

- [ ] **Step 7: Verify in the browser**

Run: `npm run dev`
Expected: every card opens its page; SideQ shows five bezels in a 3-column grid; Apex
Ryde shows three wide figures; O2 Slovakia shows the notes block; prev/next wrap from
Apex Ryde to Independent iOS; the rail stays put while the media scrolls.

- [ ] **Step 8: Commit and merge**

```bash
git add -A && git commit -m "feat: add project detail page with sticky rail and wrapping neighbours"
git checkout develop && git merge --no-ff feat/project-page -m "merge: project page"
```

---

### Task 11: Lab view

**Files:**
- Modify: `src/pages/Lab.jsx`
- Create: `src/components/LabRow.jsx` + `LabRow.module.css`

**Interfaces:**
- Consumes: `ENTRIES`, `Picture`, `Tag`.
- Produces: the Lab route.

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/lab-view
```

- [ ] **Step 2: Write `Lab.jsx`**

`padding: 56px var(--gutter) 110px; max-width: 1180px`. Title `lab.title` at 62px / 500 /
`-0.03em` / 1.0, then a 19px / 1.5 lede at `max-width: 640px` in `--color-neutral-300`
reading `lab.lede`. Rows in a `gap: 28px` column, filtered to `kind === 'own'` and
reversed to newest-first.

- [ ] **Step 3: Write `LabRow.jsx`**

A `<button>`: `grid-template-columns: 260px minmax(0, 1fr); gap: 28px; align-items:
center; padding: 20px; border-radius: var(--radius-lg)`, `background: var(--lab-fill)`,
`box-shadow: var(--shadow-sm)` lifting to `md` on hover. Left is a 150px-tall cover; right
is title 28px / 500 / `-0.02em`, the span in muted mono 11px, `blurb` at 16px / 1.5, and a
`.tag.tag-neutral` row.

Independent iOS is `kind: 'own'` but has no images — it renders `PlaceholderTile` as its
cover, same as the Work grid.

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`
Expected: `/lab` lists Apex Ryde, SideQ, Worldwanderer and Independent iOS, newest first;
each row routes to its project page.

- [ ] **Step 5: Commit and merge**

```bash
git add -A && git commit -m "feat: add Lab view listing own projects"
git checkout develop && git merge --no-ff feat/lab-view -m "merge: lab view"
```

---

### Task 12: About view

**Files:**
- Modify: `src/pages/About.jsx`
- Create: `src/content/skills.js`
- Create: `src/components/SkillsList.jsx` + `SkillsList.module.css`

**Interfaces:**
- Consumes: `PORTRAIT` from Task 5; `t('about.*')`, `t('skills')` from Task 3.
- Produces: `SKILL_ITEMS: string[][]` — six arrays of technical terms, index-aligned with `dict.skills`.

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/about-view
```

- [ ] **Step 2: Write `src/content/skills.js`**

The items are technical terms and stay untranslated; only `group` and `note` live in the
dictionaries, index-aligned with this array.

```js
export const SKILL_ITEMS = [
  ['Swift (7+ yrs)', 'SwiftUI (7+ yrs)', 'UIKit (7+ yrs)', 'Objective-C (2 yrs)', 'WidgetKit', 'HealthKit', 'StoreKit 2', 'SwiftData', 'Core Data'],
  ['HTML (2 yrs)', 'CSS (2 yrs)', 'JavaScript (2 yrs)', 'React (2 yrs)'],
  ['Kotlin Multiplatform (~2 yrs)', 'Compose MP (basics)', 'Kotlin (reading)', 'Gradle'],
  ['REST', 'Firebase (~2.5 yrs)', 'Firestore', 'SQLite', 'MySQL', 'MongoDB', 'Python'],
  ['App Store Connect (6+ yrs)', 'TestFlight', 'Crashlytics', 'Firebase Analytics', 'MetricKit', 'GitHub Actions', 'Swift Testing'],
  ['Code signing', 'Entitlements', 'Mach-O basics', 'Dex / Smali basics', 'Obfuscation concepts', 'Linux / shell'],
]
```

The `(7+ yrs)` suffixes are English. Add a `skills[].items` override key to each
dictionary only if a reviewer asks — noted as deliberate, not an oversight.

- [ ] **Step 3: Write `About.jsx`**

`padding: 56px var(--gutter) 110px; max-width: 1060px`, `grid-template-columns: minmax(0,
1fr) 300px; gap: 56px; align-items: start`.

Left: title `about.title` at 62px, then the three paragraphs — the first at 20px / 1.55 in
`--color-neutral-200`, the next two at 17px / 1.6 in `--color-neutral-300`, all
`text-wrap: pretty`. Then `SkillsList`.

Right, `position: sticky; top: 104px`: the portrait at `aspect-ratio: 4/5`,
`border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-md)`, `object-fit: cover`
using the pre-cropped derivative from Task 5. Caption in mono 11px reading
`about.portraitCaption`. Below, contact lines in mono 12px — `mailto:pcesnek290@gmail.com`,
`tel:+421948093464`, and muted `about.location`.

- [ ] **Step 4: Write `SkillsList.jsx`**

One row per group: `grid-template-columns: 190px minmax(0, 1fr); gap: 20px; padding-top:
16px; border-top: 1px solid var(--color-neutral-900)`. Left cell is the group name in mono
11px `0.12em` `--color-accent-300`; right cell is a `.tag.tag-neutral` row plus the muted
13px / 1.6 note.

- [ ] **Step 5: Verify in the browser**

Run: `npm run dev`
Expected: `/about` shows a properly framed head-and-shoulders portrait — no sky-heavy
crop — that stays put while the skills scroll; six skill rows; switching to CS/SK
translates the prose and the group names while the technical terms stay put.

- [ ] **Step 6: Commit and merge**

```bash
git add -A && git commit -m "feat: add About view with cropped portrait and skills list"
git checkout develop && git merge --no-ff feat/about-view -m "merge: about view"
```

---

### Task 13: CV view

**Files:**
- Modify: `src/pages/CV.jsx`
- Create: `src/components/CVRow.jsx` + `CVRow.module.css`

**Interfaces:**
- Consumes: `CV_PDF` from Task 5; `ENTRIES`; `tEntry`.
- Produces: the CV route.

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/cv-view
```

- [ ] **Step 2: Write `CV.jsx`**

`padding: 56px var(--gutter) 110px; max-width: 1060px`. Header row is
`justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 44px`:
title `cv.title` at 62px, and a `.btn.btn-secondary` in mono 12px `0.08em` reading
`cv.download`.

The button is now a real download, not the handoff's `mailto:` placeholder:

```jsx
<a className="btn btn-secondary mono" href={CV_PDF} download="Patrik_Cesnek_CV.pdf">
  {t('cv.download')}
</a>
```

Then one `CVRow` per entry, newest first, then the education block.

- [ ] **Step 3: Write `CVRow.jsx`**

A `<button>`: `grid-template-columns: 210px minmax(0, 1fr) 96px; gap: 24px; align-items:
baseline; padding: 20px 0; border-top: 1px solid var(--color-neutral-900)`. Cells are the
span in muted mono 12px `0.06em`; a stack of title 22px `-0.015em` plus `short` muted 15px
/ 1.5; and the kind in mono 11px `0.1em` using `cv`-specific labels — `kind.ownShort` in
`--color-accent-400`, `kind.jobShort` in `--color-neutral-600`. Clicking routes to the
project page.

- [ ] **Step 4: Write the education block**

Same two-column rhythm: `grid-template-columns: 210px minmax(0, 1fr); gap: 24px; padding:
34px 0 0; border-top: 1px solid var(--color-neutral-900)`. Left is `cv.education` in mono
11px `0.12em` `--color-accent-300`; right is `cv.school` at 17px over `cv.schoolNote`
muted at 14px.

- [ ] **Step 5: Verify in the browser**

Run: `npm run dev`
Expected: `/cv` lists nine rows newest first with OWN/CONTRACT in the right column;
clicking DOWNLOAD PDF saves `Patrik_Cesnek_CV.pdf`; the education block closes the page.

- [ ] **Step 6: Commit and merge**

```bash
git add -A && git commit -m "feat: add CV view with real PDF download"
git checkout develop && git merge --no-ff feat/cv-view -m "merge: cv view"
```

---

### Task 14: Responsive behaviour

**Files:**
- Modify: every `*.module.css` that needs a breakpoint
- Create: `src/components/ScrubTrack.mobile.css` (imported by `ScrubTrack.module.css`)

**Interfaces:**
- Consumes: everything built so far.
- Produces: no new API.

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/responsive
```

- [ ] **Step 2: Add the ≤900px rules**

- `Hero.module.css` — `grid-template-columns: 1fr`, media below the text, `min-height: auto`, ghost year `display: none`.
- `ProjectPage.module.css` — body to one column; the rail loses `position: sticky` and becomes a plain block above the media, laid out as a row with `gap: 32px; flex-wrap: wrap`.
- Portrait media grid — `repeat(3, …)` → `repeat(2, …)`.
- `LabRow.module.css` — `grid-template-columns: 1fr`, cover above text, cover height 200px.
- `About.module.css` — one column; the portrait moves above the prose at `max-width: 320px` and loses `sticky`.

- [ ] **Step 3: Add the ≤600px rules**

- Gutter is already handled by the `--gutter` media query in `tokens.css`.
- Portrait media grid → 1 column.
- `CVRow.module.css` — `grid-template-columns: 1fr`, the kind label moving under the title as an inline mono row.
- `Nav.module.css` — brand role line hides, the links row scrolls horizontally with `overflow-x: auto` and `scrollbar-width: none`, CTA shrinks to `GET IN TOUCH` icon-free at 11px.
- Track: replace drag with snap-scroll.

```css
@media (max-width: 600px) {
  .track {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    cursor: default;
    touch-action: pan-x;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .track::-webkit-scrollbar { display: none; }
  .inner { min-width: 720px; position: relative; height: 88px; }
  .tick { scroll-snap-align: center; }
  /* Thin the labels: keep own projects and year starts, drop the rest. */
  .tick[data-minor='true'] .label { display: none; }
}
```

`ScrubTrack.jsx` sets `data-minor={entry.kind === 'job' && !isFirstOfYear}` on each tick.
Pointer drag handlers are attached only when `window.matchMedia('(max-width: 600px)')`
does not match, checked in an effect so the prerendered HTML stays neutral.

- [ ] **Step 4: Verify at each breakpoint**

Run: `npm run dev`, then in the browser use responsive mode at 1440px, 1024px, 900px,
768px, 600px and 375px.

Expected: no horizontal page scroll at any width; hero stacks and the ghost year vanishes
below 900px; the track becomes swipeable below 600px; the CV kind label moves under the
title; gutters tighten to 24px.

- [ ] **Step 5: Commit and merge**

```bash
git add -A && git commit -m "feat: add responsive behaviour per the handoff's confirmed direction"
git checkout develop && git merge --no-ff feat/responsive -m "merge: responsive"
```

---

### Task 15: Prerender, SEO and deploy

**Files:**
- Create: `scripts/prerender.mjs`
- Create: `src/entry-server.jsx`
- Create: `src/components/Head.jsx`
- Create: `public/robots.txt`, `public/_headers`
- Modify: `vite.config.js` (SSR build input)

**Interfaces:**
- Consumes: `App`, `ENTRIES`, `LOCALES`.
- Produces: 39 prerendered HTML files in `dist/`, each with correct `<title>`, meta description, canonical, `hreflang` and `<html lang>`.

- [ ] **Step 1: Branch**

```bash
git checkout develop && git checkout -b feat/prerender
```

- [ ] **Step 2: Write `src/entry-server.jsx`**

```jsx
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App.jsx'

export function render(url) {
  return renderToString(<StaticRouter location={url}><App /></StaticRouter>)
}
```

- [ ] **Step 3: Guard the browser-only reads in `App.jsx`**

`localStorage` and `navigator` must not be touched during SSR. Replace the direct reads:

```jsx
const isBrowser = typeof window !== 'undefined'
const stored = isBrowser ? localStorage.getItem('locale') : null
const navigatorLangs = isBrowser ? navigator.languages ?? [navigator.language] : []
```

- [ ] **Step 4: Write `scripts/prerender.mjs`**

```js
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { ENTRIES } from '../src/content/entries.js'

const LOCALES = ['en', 'cs', 'sk']
const SITE = 'https://patrikcesnek.netlify.app'

const { render } = await import('../dist/server/entry-server.js')
const template = await readFile('dist/index.html', 'utf-8')
const dicts = Object.fromEntries(await Promise.all(
  LOCALES.map(async (l) => [l, JSON.parse(await readFile(`src/i18n/locales/${l}.json`, 'utf-8'))])
))

const routes = ['/', '/lab', '/about', '/cv', ...ENTRIES.map((e) => `/projects/${e.slug}`)]
const prefix = (l, p) => (l === 'en' ? p : p === '/' ? `/${l}` : `/${l}${p}`)

let count = 0
for (const locale of LOCALES) {
  for (const route of routes) {
    const url = prefix(locale, route)
    const html = render(url)
    const d = dicts[locale]
    const entry = ENTRIES.find((e) => `/projects/${e.slug}` === route)
    const title = entry ? `${entry.title} — Patrik Cesnek` : d.meta.siteTitle
    const desc = entry ? d.entries[entry.slug].short : d.meta.siteDescription

    const alternates = LOCALES
      .map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}${prefix(l, route)}">`)
      .join('\n    ')

    const head = `
    <title>${title}</title>
    <meta name="description" content="${desc.replace(/"/g, '&quot;')}">
    <link rel="canonical" href="${SITE}${url}">
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${SITE}${route}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">
    <meta property="og:url" content="${SITE}${url}">
    <meta name="twitter:card" content="summary_large_image">`

    const out = template
      .replace('<html lang="en">', `<html lang="${locale}">`)
      .replace('<title>Patrik Cesnek — Senior iOS Developer</title>', head)
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)

    const file = join('dist', url === '/' ? 'index.html' : `${url.replace(/^\//, '')}/index.html`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, out)
    count++
  }
}
console.log(`prerendered ${count} routes`)
```

- [ ] **Step 5: Add the SSR build to `package.json`**

```json
"build": "vite build && vite build --ssr src/entry-server.jsx --outDir dist/server && node scripts/prerender.mjs"
```

- [ ] **Step 6: Write `public/robots.txt` and a sitemap step**

```
User-agent: *
Allow: /
Sitemap: https://patrikcesnek.netlify.app/sitemap.xml
```

Extend `prerender.mjs` to emit `dist/sitemap.xml` listing all 39 URLs with `xhtml:link`
alternates.

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: `prerendered 39 routes`.

Run: `grep -c "Apex Ryde" dist/projects/apex-ryde/index.html`
Expected: at least 1 — content is in the HTML, not injected by JS.

Run: `grep -o 'hreflang="[a-z-]*"' dist/cs/about/index.html | sort -u`
Expected: `hreflang="cs"`, `hreflang="en"`, `hreflang="sk"`, `hreflang="x-default"`.

Run: `npm run preview`, then disable JavaScript in the browser and load `/cs/cv`.
Expected: the page renders fully in Czech.

- [ ] **Step 8: Run the whole suite**

Run: `npm test`
Expected: PASS, all tests.

- [ ] **Step 9: Commit, merge to develop, then merge to main**

```bash
git add -A && git commit -m "feat: prerender all 39 routes with hreflang, canonical and sitemap"
git checkout develop && git merge --no-ff feat/prerender -m "merge: prerender and SEO"
git checkout main && git merge --no-ff develop -m "release: portfolio site"
git checkout develop
```

---

## Self-review

**Spec coverage.** §2 stack → Task 1. §3 content model → Tasks 2, 5, 12. §3 app links →
Task 2. §4 i18n → Tasks 3, 4, 6. §5 routes and state → Tasks 6, 9, 10. §6 components →
Tasks 6–13. §7 styling rules → Global Constraints, applied per component task. §8
responsive → Task 14. §9 assets → Task 5. §10 tests → Tasks 2, 3, 4, 7, 10. §11 deploy →
Tasks 1, 15. §13 git workflow → every task's first and last step.

**Type consistency.** `ENTRIES`/`bySlug`/`T_MIN`/`T_MAX` (Task 2) are consumed under those
exact names in Tasks 7, 9, 10, 11, 13, 15. `t`/`tEntry`/`locale` (Task 3) are consumed
under those names throughout. `imgSrc`/`imgSrcSet`/`PORTRAIT`/`CV_PDF` (Task 5) are
consumed in Tasks 8, 9, 12, 13. `position`/`indexFromPointer`/`tickLabel` (Task 7) stay
consistent between the test and the component. `neighbours` (Task 10) returns
`{ prev, next }` and is used as such.

**Known deliberate gaps**, each stated in the task that owns it rather than left silent:

1. Skill items keep their English `(7+ yrs)` suffixes in all locales — Task 12, Step 2.
2. Apex Ryde keeps its Netlify link because it is not on the App Store — Task 2, Step 6.
3. The `_EN` / `_SK` CV PDF variants exist but only the one PDF ships — spec §12.
