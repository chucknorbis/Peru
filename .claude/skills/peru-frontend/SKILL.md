---
name: peru-frontend
description: >
  Frontend conventions for the Peru 2027 expedition-guide static site (this repo).
  Use this skill whenever editing or creating HTML pages, changing style.css or
  gallery.js, adding photos/carousels, restyling components, or building any new
  page or UI element for this site — even if the user just says "add a page",
  "change the look", "add pictures", or "fix the layout". Also use it before
  debugging image-loading problems.
---

# Peru 2027 frontend

Static site, no build step: hand-written HTML + one `style.css` + one `gallery.js`.
Read `CLAUDE.md` and `memory/INDEX.md` first if you haven't this session.

## Design system — reuse, never reinvent

- Tokens live in `:root` of `style.css`: `--yellow #FFCC00`, `--ink #14120F`,
  `--paper #F7F4EC`, `--clay #A63A2B`, `--slate #44554F`, `--sand #E8E0CE`,
  `--gold #8A6B1F`; fonts `--disp` Fraunces / `--body` Source Sans 3 / `--mono`
  IBM Plex Mono. Never hardcode new colors or fonts.
- The visual idiom is "NatGeo field guide": 2px solid ink borders, square corners,
  hard offset shadows (`box-shadow:6px 6px 0 var(--yellow)`), uppercase mono
  micro-labels with letter-spacing, yellow frame accents. A component with rounded
  corners, soft shadows, or gradients is off-brand here.
- Existing components to copy from: `.datastrip`, `.box`/`.boxgrid` (+`.tone-clay`),
  `.hl` highlights band, `.tl` timeline, `.poi` list, `.card`, `.pn` prev/next,
  `.gal` gallery. Grep style.css before inventing anything.

## New day-page checklist

Copy an existing dayNN.html and keep the section order: topbar → eyebrow →
h1.disp → datastrip → hl → cols (map+poi | prose+timeline) → gallery → boxgrid →
pn → footer → Leaflet script. Update: title, eyebrow, datastrip values, POI list
AND the matching `P` array in the Leaflet script (they must stay in sync), prev/next
links on this page and its neighbors, the day card in `index.html`, and the
`GALLERY` array.

## Photos & carousels

- Every photo goes through the gallery: a `<div class="gal" data-gallery></div>`
  placeholder plus, at the end of body,
  `<script>var GALLERY=[{f:"Commons file name.jpg",c:"Caption"},…];</script>`
  `<script src="gallery.js" defer></script>`.
- Filenames are *candidates*, not facts: gallery.js resolves them through the
  Commons API at load time and silently drops missing files (see
  `memory/lessons/commons-filenames-unreliable.md` for why). So when adding a
  sight, add 2-3 plausible Commons filenames for it rather than betting on one.
  Never hardcode `<img src>` to a Commons URL directly.
- Captions ≤ 60 chars, sentence case, no trailing period.
- This repo's remote sandbox cannot reach wikimedia.org at all — do not try to
  verify filenames with curl/WebFetch; it always 403s and proves nothing
  (see `memory/lessons/wikimedia-blocked-in-sandbox.md`).

## Mobile is the primary target

Test at 390px width first. Breakpoints: 840px (two-column collapse), 700px, 640px
(main mobile pass — bigger tap targets, sticky `.pn` nav), 380px. Any new component
needs a 640px rule if its desktop sizing doesn't shrink gracefully.

## Verifying changes locally

Serve: `python3 -m http.server 8080` from the repo root.
Headless browser (Playwright is preinstalled, Node 22):
- import from `/opt/node22/lib/node_modules/playwright/index.mjs`
- `chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })`
- Mock `commons.wikimedia.org/w/api.php` and `upload.wikimedia.org` with
  `page.route` (network to them is blocked); abort cdnjs/fonts and expect a
  harmless `L is not defined` pageerror from Leaflet.
- Run the committed smoke test after touching gallery.js or page wiring:
  `node tests/gallery.smoke.mjs` (asserts slide count, counter text, and the
  all-images-fail fallback).
