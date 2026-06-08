(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initNavigation() {
    var button = qs('[data-nav-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var stage = qs('[data-hero-slider]');
    if (!stage) {
      return;
    }
    var slides = qsa('.hero-slide', stage);
    var dots = qsa('.hero-dot', stage);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var input = qs('[data-filter-input]', panel);
      var type = qs('[data-filter-type]', panel);
      var region = qs('[data-filter-region]', panel);
      var scope = panel.parentElement || document;
      var cards = qsa('.movie-card, .rank-row', scope);
      var empty = qs('[data-empty-state]', scope);

      function apply() {
        var query = normalize(input && input.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year')
          ].join(' '));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (typeValue && normalize(card.getAttribute('data-type')) !== typeValue) {
            ok = false;
          }
          if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
            ok = false;
          }
          card.classList.toggle('is-hidden-by-filter', !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, type, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initSearchPage() {
    var root = qs('[data-search-page]');
    if (!root || !Array.isArray(window.MOVIE_SEARCH_DATA)) {
      return;
    }
    var form = qs('[data-search-form]', root);
    var input = qs('[data-search-query]', root);
    var results = qs('[data-search-results]', root);
    var empty = qs('[data-empty-state]', root);
    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function render(items) {
      results.innerHTML = items.slice(0, 120).map(function (item) {
        return [
          '<article class="rank-row">',
          '<a class="rank-number" href="./' + item.file + '">热</a>',
          '<a class="rank-thumb" href="./' + item.file + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>',
          '<div class="rank-info">',
          '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>',
          '<p>' + escapeHtml(item.one_line) + '</p>',
          '<div class="card-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type + ' · ' + item.genre) + '</div>',
          '</div>',
          '<a class="outline-link" href="./' + item.file + '">立即观看</a>',
          '</article>'
        ].join('');
      }).join('');
      if (empty) {
        empty.classList.toggle('is-visible', items.length === 0);
      }
    }

    function run() {
      var query = normalize(input.value);
      var items = window.MOVIE_SEARCH_DATA.filter(function (item) {
        return !query || normalize([item.title, item.region, item.type, item.genre, item.tags, item.year, item.one_line].join(' ')).indexOf(query) > -1;
      });
      render(items);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var params = new URLSearchParams(window.location.search);
      params.set('q', input.value);
      history.replaceState(null, '', './search.html?' + params.toString());
      run();
    });
    input.addEventListener('input', run);
    run();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.initMoviePlayer = function (source) {
    var box = qs('[data-player]');
    if (!box) {
      return;
    }
    var video = qs('video', box);
    var cover = qs('.player-cover', box);
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
      video.controls = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
