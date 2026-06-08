(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var button = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-result]');
    if (!inputs.length || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    inputs.forEach(function (input) {
      if (query && input.hasAttribute('data-query-input')) {
        input.value = query;
      }
    });

    function filterCards(value) {
      var term = normalize(value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-keywords'),
          card.textContent
        ].join(' '));
        var matched = !term || haystack.indexOf(term) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        inputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        filterCards(input.value);
      });
    });

    if (query) {
      filterCards(query);
    }
  }

  function initPlayer() {
    var video = document.querySelector('.movie-video');
    var trigger = document.querySelector('[data-player-trigger]');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var attached = false;
    var hls = null;

    function attachStream() {
      if (attached || !stream) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      attached = true;
    }

    function play() {
      attachStream();
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (trigger) {
            trigger.classList.remove('is-hidden');
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (trigger && video.currentTime === 0) {
        trigger.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayer();
  });
})();
