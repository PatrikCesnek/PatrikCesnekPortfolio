# Portfolio web — design spec

**Date:** 2026-08-15
**Source:** `~/Downloads/design_handoff_portfolio` (README, `content/content.js`, `nocturne/`, `reference/`)
**Status:** approved in chat, 2026-08-15

## 1. What this is

A personal portfolio site for Patrik Cesnek, senior iOS developer (Brno, CZ), aimed at
hiring managers, recruiters and prospective clients. Its organising idea is a single
merged chronology, 2019 → 2026, in which contract work and his own shipped apps sit on
one timeline. The homepage hero is driven by a horizontal scrub track: dragging it, or
clicking a tick, changes which entry the hero shows. Own projects carry real App Store
screenshots; client work is described in words only, never shown.

Five views: Work (home), Project detail, Lab, About, CV. Three locales: en, cs, sk.

The design handoff is high fidelity — colours, type sizes, spacing, radii and shadows
are final and are recreated faithfully. The one area the handoff deliberately left
undesigned is responsive behaviour below ~900px; the direction it proposed was
confirmed and is specified in §8.

## 2. Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Build | Vite 5 | Static output, no server, deploys free on Netlify. |
| UI | React 18 | Requested. The design needs only local component state. |
| Routing | react-router-dom 6 | Real URLs so entries are linkable and shareable. |
| Styling | CSS Modules over Nocturne's `styles.css` | Nocturne ports in untouched as the global token sheet; the tokens are the contract. |
| i18n | Custom `LocaleProvider` + `t()` | ~250 strings, no plurals, no interpolation. i18next is not worth its weight here. |
| Prerender | Post-build script using `react-dom/server` | Real HTML per URL for crawlers and link previews. |
| Tests | Vitest | Pure logic and locale parity only. |
| Images | sharp, one-off script | Raw assets are 19MB; `ww-2.png` alone is 6MB. |

Rejected: a plain SPA with no prerender (a portfolio link pasted into Slack or LinkedIn
would render blank); Next.js static export (a lot of framework for five static pages,
and static export cripples `next/image` anyway).

## 3. Content model

The handoff's `content.js` is split into an untranslatable spine and per-locale copy.

**`src/content/entries.js`** — nine entries, order preserved (oldest first, matching the
handoff's `DATA`; the card grid, Lab and CV render the reverse):

```
{ slug, t, year, date, kind, orient?, tags[], images[]?, href }
```

- `t` — fractional year, used only for horizontal position on the track:
  `left = (t - 2019.2) / (2026.75 - 2019.2) * 100%`
- `kind` — `"own"` (taller tick, accent label, screenshots, `--shadow-md` card) or
  `"job"` (short tick, neutral label, notes instead of screenshots, `--shadow-sm` card)
- `orient: "portrait"` — phone screenshots at 360×778. Absent means landscape at
  778×360 (Apex Ryde only).
- `slug` — derived from title, stable across locales:
  `independent-ios`, `matee`, `freelance`, `billdu`, `o2-slovakia`, `formcoach`,
  `worldwanderer`, `sideq`, `apex-ryde`
- `tags` are treated as untranslatable technical terms (`Swift 6`, `StoreKit 2`,
  `Kotlin Multiplatform`) and stay in the spine.
- Titles stay untranslated — they are proper nouns.

**`src/content/locales/{en,cs,sk}.json`** — everything a human reads:

- per entry: `short`, `blurb`, `notes[]`, `captions[]`, `span`, `cta`, `hrefLabel`,
  `coverNote`
- page copy: About's three paragraphs and portrait caption, Lab's title and lede, CV's
  title and education block, the Work grid heading
- chrome: nav items, buttons, track header, footer, prev/next, back affordance
- `months` — a 12-entry abbreviation table (`MAR` / `BŘE` / `MAR`) so track tick labels
  localise correctly

Labels are `kind === "own" ? "OWN PROJECT" : "EMPLOYED"` everywhere except the CV table,
which uses `OWN` / `CONTRACT`. Both pairs are locale strings.

### App links resolved

The handoff flagged two gaps. Both were chased down in the sibling web projects:

| Entry | Link | Source |
| --- | --- | --- |
| Worldwanderer | `https://apps.apple.com/app/id6772739029` | `landmarky-website/index.html` |
| SideQ | `https://apps.apple.com/app/sideq/id6767996805` | `sidequest-website/index.html` |
| Apex Ryde | unchanged — still a placeholder `idXXXXXXXXX` in `apex-web`, so not yet on the Store | `apex-web/index.html` |

The CV PDF is real: `Patrik_Cesnek_CV.pdf` ships in `public/` and the CV page's button
downloads it instead of opening email.

## 4. i18n

Path-prefixed URLs. English is the default and unprefixed; `cs` and `sk` are prefixed.

```
/                    /cs                    /sk
/projects/:slug      /cs/projects/:slug     /sk/projects/:slug
/lab                 /cs/lab                /sk/lab
/about               /cs/about              /sk/about
/cv                  /cs/cv                 /sk/cv
```

- `LocaleProvider` resolves the locale from the path prefix, falling back to `navigator.language`
  on first visit and then to `en`. The choice persists to `localStorage`.
- `t(key)` reads the active dictionary and falls back to `en` for any missing key, so a
  partial translation degrades to English rather than to a raw key.
- The nav's language switcher swaps the prefix and keeps the visitor on the same route
  and the same timeline entry.
- Each prerendered page emits `<link rel="alternate" hreflang="...">` for all three
  locales plus `x-default`, and `<html lang>` is set correctly.

Slugs are identical across locales — they are mostly proper nouns, and stable slugs keep
the switcher trivial.

## 5. Routes and state

Four pieces of state, all local, no store:

```
i        // active timeline index driving the hero (default: last = newest)
dragging // pointer is down on the track
```

`view` and `open` from the prototype become the route. The hero's active index reflects
in the URL hash (`/#sideq`) so a specific entry is linkable, as the handoff suggested.

Behaviour, per the handoff's interaction table:

| Trigger | Result |
| --- | --- |
| Drag the track | Maps pointer X to a fractional year, snaps to the nearest entry. `touch-action: none`. |
| Click a tick | Sets active index, no navigation. |
| Click hero title or "Open the case →" | Navigates to that project page, scrolls to top. |
| Click a Work card / Lab row / CV row | Navigates to that project page, scrolls to top. |
| Prev / next on a project page | Moves through the entry array with wraparound; prev = older, i.e. index + 1. |
| Any outbound link | New tab, `rel="noopener"`. |

## 6. Components

```
App
├── Nav            name + role, view links, LangSwitcher, GET IN TOUCH
├── Footer         identity line, EMAIL / SIDEQ / WORLDWANDERER
└── routes
    ├── Work       Hero + ScrubTrack + card grid
    │   ├── Hero          three mutually exclusive media states
    │   │   ├── PhoneBezel     portrait projects (SideQ, Worldwanderer)
    │   │   ├── LandscapeShots Apex Ryde
    │   │   └── OwnedNotes     client work — "What I owned"
    │   ├── ScrubTrack    baseline, progress fill, ticks, labels
    │   └── WorkCard      ×9, newest first
    ├── ProjectPage sticky rail + media grid + prev/next footer
    ├── Lab        own projects only, LabRow ×4
    ├── About      prose + SkillsList + sticky portrait
    └── CV         CVRow ×9 + education block
```

Shared: `Tag`, `Kicker`, `Figure`, `PlaceholderTile`, `SectionHeading`.

Every clickable card, row and tick is a real `<button>` or `<a>`. The handoff calls the
prototype's clickable `<div>`s a defect to fix, not a pattern to copy. The track carries
`role="slider"` with `aria-valuenow` / `aria-valuetext` (the entry title) and arrow-key
stepping, giving the whole navigation a non-pointer path.

## 7. Styling rules that must survive the port

From Nocturne's guide, all load-bearing:

- Primary buttons are outlined — 1px accent border on transparent, never filled.
- The accent never floods a large area; it appears as lines, dots, marks and small text.
- No pure black or pure white — every value comes from the ramps.
- Elevation is a hairline edge plus ambient darkness, never stacked shadows.
- Headings stay at weight 500; hierarchy is size and space.
- Freestanding rules fade to transparent at their ends.
- Accent text at paragraph size uses `--color-accent-300`, never `--color-accent` — the
  accent/ground pair only reaches ~3:1.
- `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }` is
  never lost.

Two families only: Inter for prose, a system mono stack for every label, kicker, caption,
nav item, date, tag and counter. That sans/mono split is the design's signature.

Page gutter is 56px on every view. Exact colour, type and spacing values are transcribed
from the handoff's tables into `src/styles/tokens.css` and are not re-derived.

Transitions: the hero swap is instant, never animated. Any hover transition stays
120–180ms `ease-out` and is limited to opacity, transform and border colour. Restrained
hovers are added per the handoff: card shadow `sm` → `md`, tick label to
`--color-accent-200`, nav item to `--color-accent-300`.

`prefers-reduced-motion` disables the snap-scroll smoothing and any transition.

## 8. Responsive

Confirmed direction, from the handoff's proposal:

| Breakpoint | Change |
| --- | --- |
| ≤ 900px | Hero stacks to one column, media below the text; ghost year drops. Project page's sticky rail collapses to a plain block above the media. Portrait grid `repeat(3,…)` → `repeat(2,…)`. Lab rows stack cover over text. |
| ≤ 600px | Track drag is replaced by horizontal snap-scroll; tick labels thin to own-projects plus year starts. Portrait grid → 1 column. CV rows go two-column with the kind label moving under the title. Gutters 56px → 24px. |

Above 900px the design is untouched from the handoff.

## 9. Assets

Raw assets total ~19MB. A one-off `scripts/optimize-assets.mjs` (sharp) emits AVIF +
WebP + a JPEG/PNG fallback at the widths actually used — 54px thumb, 250px bezel, 168px
card cover, and a full-size cap — wired up as `srcset`. Screenshots get real `alt` text
seeded from their captions ("SideQ — quest of the day") and `loading="lazy"` below the
fold.

The portrait needs special handling: the source is 768×1024 and mostly sky, which the
prototype worked around with `background-size: 260%`. Per the handoff's own preferred
fix, the script cuts a head-and-shoulders derivative so About can use plain
`object-fit: cover`.

Real `<img>` elements throughout — the prototype's `<div role="img">` was a workaround
for its runtime, not design intent.

## 10. Tests

Vitest, over the parts with actual logic:

- `trackPosition` — fractional year → percentage, and pointer X → nearest entry snapping,
  including the clamped ends.
- `neighbours` — prev/next wraparound, asserting prev is older.
- `slugify` — the nine known titles map to the nine expected slugs.
- `resolveLocale` — path prefix wins, then stored preference, then `navigator.language`,
  then `en`; unknown prefixes fall back rather than 404.
- **locale parity** — every key in `en.json` exists in `cs.json` and `sk.json`, with
  matching `notes` and `captions` array lengths per entry. This is the test that stops a
  three-locale site rotting silently.

Not unit-tested: presentational components with no branching, which would only assert
that CSS Modules class names exist.

## 11. Deploy

`netlify.toml` — build `npm run build`, publish `dist/`, Node 20. Prerendered files mean
every URL is a real file; a `/*  /index.html  200` fallback catches client-side
navigation only. Security headers and long-lived immutable caching on hashed assets.

## 12. Out of scope

- Analytics, contact form, blog, CMS.
- Dark/light toggle — Nocturne is a dark system by definition.
- The Apex Ryde App Store link, until the app ships.
- The `Patrik_Cesnek_CV_EN.pdf` / `_SK.pdf` variants that exist alongside the chosen PDF;
  a per-locale CV download is a trivial follow-up if wanted.

## 13. Git workflow

`main` holds reviewed work. `develop` branches from it, and each task takes a short-lived
branch off `develop` (`feat/scaffold`, `feat/design-system`, `feat/work-view`, …) merged
back with `--no-ff`. `main` receives `develop` when the site is running and reviewed.
