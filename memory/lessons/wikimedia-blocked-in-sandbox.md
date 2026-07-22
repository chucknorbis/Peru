The remote Claude sandbox for this repo cannot reach *.wikimedia.org at all — do not attempt to verify Commons files from a session.

What happened: while debugging broken photos (2026-07-22), every check against
commons.wikimedia.org / upload.wikimedia.org / en.wikipedia.org failed — curl got
"CONNECT tunnel failed, response 403" from the agent proxy and WebFetch got HTTP 403.
The proxy status endpoint confirmed `connect_rejected` policy denials. This is the
environment's network allowlist, not a transient failure and not a TLS/CA issue.

Correct approach: don't burn time retrying or "fixing" TLS; design so correctness
doesn't depend on sandbox-side verification (runtime resolver in `gallery.js`), and
test image behavior by asking the user to load a page on their phone/laptop. curl to
tile.openstreetmap.org etc. may be similarly blocked — check
`curl -sS "$HTTPS_PROXY/__agentproxy/status"` before concluding a site is down.

Why it matters: a "000"/403 from this sandbox says nothing about whether a URL works
for the users; drawing conclusions from it produced a false lead once already.
