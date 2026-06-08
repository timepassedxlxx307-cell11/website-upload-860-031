(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    if (toggle) {
      toggle.addEventListener("click", function () {
        document.body.classList.toggle("nav-open");
      });
    }

    document.querySelectorAll("[data-site-nav] a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    });

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function start() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      show(0);
      start();
    });

    document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var root = scope.parentElement || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
      var empty = root.querySelector("[data-empty-state]");

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function runFilter() {
        var q = normalize(input ? input.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-keywords") || card.textContent);
          var ctype = normalize(card.getAttribute("data-type"));
          var cyear = normalize(card.getAttribute("data-year"));
          var matchQuery = !q || text.indexOf(q) !== -1;
          var matchType = !type || ctype.indexOf(type) !== -1 || text.indexOf(type) !== -1;
          var matchYear = !year || cyear.indexOf(year) !== -1;
          var show = matchQuery && matchType && matchYear;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", runFilter);
          control.addEventListener("change", runFilter);
        }
      });
    });
  });
})();
