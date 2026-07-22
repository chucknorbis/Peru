Hardcoded Wikimedia Commons filenames in this project were partly guessed and 404'd; never trust one without runtime resolution.

What happened: the original day pages each hotlinked one Commons photo via
`Special:FilePath/<name>?width=1200`. On the group's phones some photos loaded and
others showed the striped fallback (reported 2026-07-22 with screenshots: day04's
"Salineras de Maras … DD 12" loaded, day03's "Ollantaytambo … DD 86-88 HDR" did not).
Initial suspicion was a mobile/encoding bug — wrong: both URLs had the same "Perú"
accent, and the failures reproduced on any device. The real cause: the filenames were
invented when the site was generated, and the invented ones don't exist on Commons.

Correct approach: treat every Commons filename as a *candidate*. `gallery.js` resolves
candidates through the Commons API (`action=query&prop=imageinfo&origin=*`) at page
load; files that exist get guaranteed thumb URLs, missing ones are dropped, and each
slide still self-removes on `onerror`. To change photos, edit a page's `GALLERY` array
— add several candidates per sight and let the resolver filter.

Why it matters: model-remembered or human-remembered Commons names are wrong often
enough that any hardcoded-src approach will silently break again as pages are added.
