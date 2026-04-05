// Restores the URL encoded by 404.html before React Router initialises.
(function (l) {
  if (l.search[1] === '/') {
    var parts = l.search.slice(1).split('&').map(function (s) {
      return s.replace(/~and~/g, '&');
    });
    window.history.replaceState(
      null,
      null,
      l.pathname.slice(0, -1) +
        parts[0] +
        (parts.slice(1).join('&') ? '?' + parts.slice(1).join('&') : '') +
        l.hash
    );
  }
})(window.location);
