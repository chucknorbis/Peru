# Peru 2027 Expedition Guide

Static HTML site for a 21-day Peru trip (Apr 30 – May 20, 2027) planned by a group of
7 friends from Cluj-Napoca, Romania. Served locally / on GitHub — no build step, no
framework, no package.json. Open `index.html` in a browser to view; `python3 -m http.server`
to test like the group does on their phones.

## Purpose & audience

Trip-planning reference the group reads mostly **on phones** over home wifi/4G.
Mobile rendering and slow-network resilience matter more than desktop polish.

## Site map

| File | Role |
|---|---|
| `index.html` | Route overview: hero Leaflet map with the full loop, altitude-profile SVG, 21 day cards |
| `day01.html` … `day21.html` | One page per day, identical template (see anatomy below) |
| `summary.html` | "Field manual": budget table, booking order, health/altitude, money, documents |
| `style.css` | Single stylesheet, NatGeo-inspired design system |
| `gallery.js` | Photo-carousel component + Wikimedia Commons runtime resolver |
| `memory/` | Lesson memory for Claude sessions — read `memory/INDEX.md` at session start |

## Trip shape (for content edits)

Lima (d1-2) → fly Cusco, sleep low in Sacred Valley (d3-5) → Machu Picchu (d6) →
Cusco (d7) → Rainbow Mountain 5,036 m (d8) → Tambopata Amazon (d9-11) → bus Ruta del
Sol to Puno/Titicaca (d12-13) → bus to Arequipa (d14-15) → Colca Canyon (d16-17) →
Arequipa flex (d18) → fly Lima (d19-21, depart d21). Budget target ≤3,000 EUR/person
(detail in `summary.html` — don't duplicate it elsewhere). Acclimatisation logic
(valley-before-Cusco, no-alcohol first 48 h) is deliberate; don't reorder days casually.

## Day-page anatomy (keep this order when editing)

topbar → eyebrow (day · date · place) → h1 → `.datastrip` (altitude/difficulty/cost/
sun/weather) → `.hl` highlights band (3 items) → `.cols` (Leaflet map + POI list |
prose + timeline box) → photo gallery → `.boxgrid` (Field notes / Photo tips /
Gear / Eat here) → `.pn` prev/next → footer → Leaflet script with per-day `P` array
of `[lat, lon, label]` POIs.

## Design system (style.css)

- Palette via CSS vars: `--yellow #FFCC00` (signature frames/accents), `--ink #14120F`,
  `--paper #F7F4EC`, `--clay #A63A2B`, `--slate #44554F`, `--sand #E8E0CE`, `--gold #8A6B1F`.
- Fonts: Fraunces (display), Source Sans 3 (body), IBM Plex Mono (labels/eyebrows/captions).
- Idiom: 2px solid ink borders, hard offset shadows, mono uppercase micro-labels,
  yellow NatGeo frame. New components must reuse these tokens — no rounded-corner
  card-app styling.
- Mobile breakpoints: 840px (cols collapse), 700px, 640px (main mobile pass), 380px.
  Sticky prev/next nav on mobile.

## Images: the rules that matter

- All photos hotlink Wikimedia Commons. **Never trust a hardcoded Commons filename** —
  the original site guessed many and they 404'd (the "some pictures don't load" bug).
- `gallery.js` resolves filenames at page load through the Commons API
  (`origin=*`, `prop=imageinfo&iiurlwidth=1200`): missing files are dropped, existing
  ones get guaranteed `upload.wikimedia.org` thumb URLs. Offline/API failure falls back
  to `Special:FilePath` per-slide with `onerror` removal; if nothing loads, a styled
  striped placeholder shows.
- Day pages declare photos as `var GALLERY = [{f:"Commons filename", c:"caption"}, …]`
  before including `gallery.js`. Add/remove photos by editing that array only.
- Keep `?width=`/`iiurlwidth` at 1200 — phones on 4G, don't ship originals (Delso
  originals are 20+ MB).

## Environment constraint (this remote sandbox)

Outbound access to `*.wikimedia.org` / `*.wikipedia.org` is **blocked by network
policy** (curl and WebFetch both fail). Commons filenames therefore cannot be verified
from here — which is why the runtime resolver exists. Do not "fix" image bugs by
swapping in new unverified filenames; extend the GALLERY candidates and let the
resolver filter.

## Memory

Lesson memory lives in `memory/lessons/` (one lesson per file, indexed in
`memory/INDEX.md`). Read the index at session start; update lessons when a correction
or confirmation happens; delete lessons proven wrong.
