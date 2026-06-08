(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('[name="q"]');
      if (!input) {
        return;
      }

      var value = input.value.trim();
      if (value) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  });

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var queryInput = filterRoot.querySelector('[data-filter-query]');
    var categoryInput = filterRoot.querySelector('[data-filter-category]');
    var typeInput = filterRoot.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
    var empty = filterRoot.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function applyFilter() {
      var query = normalize(queryInput ? queryInput.value : '');
      var category = categoryInput ? categoryInput.value : '';
      var type = typeInput ? typeInput.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = true;

        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }

        if (category && card.getAttribute('data-category') !== category) {
          ok = false;
        }

        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [queryInput, categoryInput, typeInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilter);
        input.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
})();
