(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function resolvePath(path) {
    var root = document.body ? document.body.getAttribute('data-root') || '' : '';
    return root + path;
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var isHidden = menu.hasAttribute('hidden');
      if (isHidden) {
        menu.removeAttribute('hidden');
      } else {
        menu.setAttribute('hidden', 'hidden');
      }
    });
  }

  function initHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
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
        dot.classList.toggle('bg-amber-500', dotIndex === current);
        dot.classList.toggle('bg-gray-200', dotIndex !== current);
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function initHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-header-search]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var url = resolvePath('search.html');
        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function createSearchCard(movie) {
    var article = document.createElement('article');
    article.className = 'movie-card group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all';
    article.innerHTML = [
      '<a href="' + movie.url + '" class="block h-full">',
      '  <div class="cover-frame aspect-square" data-title="' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy" onerror="this.style.display='none'; this.parentElement.classList.add('cover-fallback');">',
      '  </div>',
      '  <div class="p-4">',
      '    <div class="flex items-center justify-between mb-2">',
      '      <span class="tag-pill">' + escapeHtml(movie.type) + '</span>',
      '      <span class="text-sm text-amber-600 font-bold">★ ' + escapeHtml(movie.rating) + '</span>',
      '    </div>',
      '    <h3 class="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">' + escapeHtml(movie.title) + '</h3>',
      '    <p class="text-gray-600 text-sm line-clamp-2 mb-3">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="text-xs text-gray-500 flex items-center justify-between">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.category) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('');
    return article;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var container = document.querySelector('[data-search-results]');
    if (!container || !window.MOVIE_INDEX) {
      return;
    }
    var keywordInput = document.querySelector('[data-search-keyword]');
    var categorySelect = document.querySelector('[data-search-category]');
    var typeSelect = document.querySelector('[data-search-type]');
    var count = document.querySelector('[data-search-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (keywordInput) {
      keywordInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function render() {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var category = categorySelect ? categorySelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var results = window.MOVIE_INDEX.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.oneLine,
          movie.genre,
          movie.region,
          movie.type,
          movie.category,
          (movie.tags || []).join(' ')
        ].join(' '));
        return (!keyword || text.indexOf(keyword) !== -1) &&
          (!category || movie.category === category) &&
          (!type || movie.type === type);
      });

      container.innerHTML = '';
      var limited = results.slice(0, 240);
      limited.forEach(function (movie) {
        container.appendChild(createSearchCard(movie));
      });
      if (count) {
        count.textContent = '找到 ' + results.length + ' 部影片' + (results.length > limited.length ? '，当前显示前 ' + limited.length + ' 部' : '');
      }
      if (!limited.length) {
        container.innerHTML = '<div class="bg-white rounded-2xl shadow-md p-8 text-center text-gray-600">没有匹配结果，请换一个关键词或筛选条件。</div>';
      }
    }

    [keywordInput, categorySelect, typeSelect].forEach(function (field) {
      if (field) {
        field.addEventListener('input', render);
        field.addEventListener('change', render);
      }
    });
    render();
  }

  function initPlayer() {
    var shell = document.querySelector('[data-video-url]');
    var video = document.querySelector('[data-video-player]');
    var button = document.querySelector('[data-player-start]');
    var status = document.querySelector('[data-player-status]');
    if (!shell || !video || !button) {
      return;
    }
    var source = shell.getAttribute('data-video-url');
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      button.classList.add('is-hidden');
      setStatus('正在加载高清播放源…');

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪，正在开始播放。');
          video.play().catch(function () {
            setStatus('播放源已加载，请点击播放器上的播放按钮继续。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus('当前播放源加载失败，请刷新页面或稍后重试。');
          }
        });
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {
            setStatus('播放源已加载，请点击播放器上的播放按钮继续。');
          });
        }, { once: true });
        return;
      }

      setStatus('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Safari 或移动端浏览器。');
      button.classList.remove('is-hidden');
    }

    button.addEventListener('click', playVideo);
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initHeaderSearch();
    initSearchPage();
    initPlayer();
  });
})();
