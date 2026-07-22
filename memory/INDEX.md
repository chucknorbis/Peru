# Lesson index

- `lessons/commons-filenames-unreliable.md` — Hardcoded Wikimedia filenames were guessed and 404'd; always resolve through the Commons API at runtime.
- `lessons/wikimedia-blocked-in-sandbox.md` — The remote sandbox's network policy blocks all *.wikimedia.org; image URLs cannot be verified from Claude sessions.
- `lessons/weekday-labels-were-off-by-one.md` — All 2027 weekday labels were one day early (Apr 30 = Friday); weekday-gated plans (Pisac Sunday market, Huaca Pucllana Wed–Sun nights) had to move. Always verify weekdays with `date` when touching dates.
