/* Photo carousel + Wikimedia Commons runtime resolver.
   Pages declare:  var GALLERY = [{f:"Commons file name", c:"caption"}, ...]
   and include a <div class="gal" data-gallery></div> placeholder.

   Commons filenames can never be fully trusted (guessed names 404), so the list
   is resolved through the Commons API at load time: files that exist come back
   with a guaranteed thumb URL, missing ones are silently dropped. If the API is
   unreachable, slides fall back to Special:FilePath and remove themselves on
   error. Zero surviving slides -> striped placeholder. */
(function () {
  'use strict';
  var host = document.querySelector('[data-gallery]');
  if (!host || typeof GALLERY === 'undefined' || !GALLERY.length) return;

  var API = 'https://commons.wikimedia.org/w/api.php';
  var WIDTH = 1200;

  function filePath(name) {
    return 'https://commons.wikimedia.org/wiki/Special:FilePath/' +
      encodeURIComponent(name.replace(/ /g, '_')) + '?width=' + WIDTH;
  }

  /* ---------- carousel ---------- */
  function build(items) {
    if (!items.length) return showFallback();
    host.innerHTML =
      '<div class="gal-track"></div>' +
      '<button class="gal-btn prev" aria-label="Previous photo">&#8592;</button>' +
      '<button class="gal-btn next" aria-label="Next photo">&#8594;</button>' +
      '<div class="gal-bar"><span class="gal-cap"></span>' +
      '<span class="gal-count"></span></div>' +
      '<div class="gal-dots" role="tablist"></div>';
    var track = host.querySelector('.gal-track');
    var dots = host.querySelector('.gal-dots');

    items.forEach(function (it, i) {
      var slide = document.createElement('figure');
      slide.className = 'gal-slide';
      var img = document.createElement('img');
      img.alt = it.c;
      img.decoding = 'async';
      if (i > 0) img.loading = 'lazy';
      img.onerror = function () { drop(slide); };
      img.src = it.src;
      slide.appendChild(img);
      slide.dataset.cap = it.c;
      track.appendChild(slide);
      var dot = document.createElement('button');
      dot.className = 'gal-dot';
      dot.setAttribute('aria-label', 'Photo ' + (i + 1));
      dot.onclick = function () {
        var s = slides().indexOf(slide);
        if (s > -1) track.scrollTo({ left: s * track.clientWidth, behavior: 'smooth' });
      };
      slide._dot = dot;
      dots.appendChild(dot);
    });

    function slides() { return [].slice.call(track.children); }
    function drop(slide) {
      if (slide._dot) slide._dot.remove();
      slide.remove();
      if (!slides().length) showFallback(); else sync();
    }
    function current() {
      return Math.min(slides().length - 1,
        Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
    }
    function sync() {
      var list = slides(), i = current();
      if (!list.length) return;
      host.querySelector('.gal-cap').textContent = list[i].dataset.cap;
      host.querySelector('.gal-count').textContent = (i + 1) + ' / ' + list.length;
      list.forEach(function (s, j) {
        if (s._dot) s._dot.classList.toggle('on', j === i);
      });
      host.querySelector('.gal-btn.prev').disabled = i === 0;
      host.querySelector('.gal-btn.next').disabled = i === list.length - 1;
      var one = list.length < 2;
      host.querySelector('.gal-btn.prev').style.display = one ? 'none' : '';
      host.querySelector('.gal-btn.next').style.display = one ? 'none' : '';
      dots.style.display = one ? 'none' : '';
    }
    function step(d) {
      track.scrollTo({ left: (current() + d) * track.clientWidth, behavior: 'smooth' });
    }
    host.querySelector('.gal-btn.prev').onclick = function () { step(-1); };
    host.querySelector('.gal-btn.next').onclick = function () { step(1); };
    var t;
    track.addEventListener('scroll', function () {
      clearTimeout(t); t = setTimeout(sync, 80);
    }, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  function showFallback() {
    host.innerHTML =
      '<div class="gal-fallback">' + (document.title.split('|')[0] || 'Photos') + '</div>' +
      '<div class="gal-bar"><span class="gal-cap">Photos load online &middot; Wikimedia Commons</span></div>';
  }

  /* ---------- resolver ---------- */
  function fallbackDirect() {
    build(GALLERY.map(function (g) { return { src: filePath(g.f), c: g.c }; }));
  }

  var titles = GALLERY.map(function (g) { return 'File:' + g.f.replace(/_/g, ' '); });
  var url = API + '?action=query&format=json&origin=*&prop=imageinfo' +
    '&iiprop=url&iiurlwidth=' + WIDTH + '&titles=' + encodeURIComponent(titles.join('|'));

  var ctrl = ('AbortController' in window) ? new AbortController() : null;
  var timer = ctrl && setTimeout(function () { ctrl.abort(); }, 8000);

  fetch(url, ctrl ? { signal: ctrl.signal } : {})
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      clearTimeout(timer);
      var q = data.query || {};
      var norm = {};
      (q.normalized || []).forEach(function (n) { norm[n.from] = n.to; });
      (q.redirects || []).forEach(function (n) { norm[n.from] = n.to; });
      var byTitle = {};
      Object.keys(q.pages || {}).forEach(function (id) {
        var p = q.pages[id];
        if (!p.missing && p.imageinfo && p.imageinfo[0]) {
          byTitle[p.title] = p.imageinfo[0].thumburl || p.imageinfo[0].url;
        }
      });
      var items = [];
      GALLERY.forEach(function (g, i) {
        var t = titles[i];
        t = norm[t] || t;
        t = norm[t] || t; /* normalized then redirected */
        if (byTitle[t]) items.push({ src: byTitle[t], c: g.c });
      });
      build(items);
    })
    .catch(function () { clearTimeout(timer); fallbackDirect(); });
})();
