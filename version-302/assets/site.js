(function () {
  const navButton = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      navButton.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('no-scroll', isOpen);
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));

  if (slides.length > 1) {
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  const filterForm = document.querySelector('[data-filter-form]');

  if (filterForm) {
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const empty = document.querySelector('[data-empty]');

    const applyFilter = function () {
      const formData = new FormData(filterForm);
      const keyword = String(formData.get('keyword') || '').trim().toLowerCase();
      const year = String(formData.get('year') || '').trim();
      const region = String(formData.get('region') || '').trim();
      const type = String(formData.get('type') || '').trim();
      let visibleCount = 0;

      cards.forEach(function (card) {
        const title = String(card.dataset.title || '').toLowerCase();
        const cardYear = String(card.dataset.year || '');
        const cardRegion = String(card.dataset.region || '');
        const cardType = String(card.dataset.type || '');
        const matched = (!keyword || title.includes(keyword)) && (!year || cardYear.includes(year)) && (!region || cardRegion.includes(region)) && (!type || cardType.includes(type));
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visibleCount === 0);
      }
    };

    filterForm.addEventListener('input', applyFilter);
    filterForm.addEventListener('change', applyFilter);
    filterForm.addEventListener('reset', function () {
      window.setTimeout(applyFilter, 0);
    });
    applyFilter();
  }

  const quickSearch = document.querySelector('[data-quick-search]');

  if (quickSearch) {
    quickSearch.addEventListener('submit', function (event) {
      const input = quickSearch.querySelector('input');
      const value = input ? input.value.trim() : '';
      if (value) {
        event.preventDefault();
        window.location.href = 'category-all.html?keyword=' + encodeURIComponent(value);
      }
    });
  }

  const params = new URLSearchParams(window.location.search);
  const urlKeyword = params.get('keyword');

  if (urlKeyword && filterForm) {
    const input = filterForm.querySelector('input[name="keyword"]');
    if (input) {
      input.value = urlKeyword;
      filterForm.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  const video = document.getElementById('movieVideo');
  const overlay = document.getElementById('playOverlay');

  if (video && overlay && typeof playerStream !== 'undefined') {
    let loaded = false;
    let hlsInstance = null;

    const loadVideo = function () {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playerStream;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true });
        hlsInstance.loadSource(playerStream);
        hlsInstance.attachMedia(video);
        return new Promise(function (resolve) {
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
        });
      }

      video.src = playerStream;
      return Promise.resolve();
    };

    const startVideo = function () {
      overlay.classList.add('is-hidden');
      loadVideo().then(function () {
        const action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      });
    };

    overlay.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
