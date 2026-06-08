(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupSearchZone(zone) {
        var input = zone.querySelector("[data-search-input]");
        var typeFilter = zone.querySelector("[data-filter-type]");
        var yearFilter = zone.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(zone.querySelectorAll("[data-movie-card]"));
        if (!input && !typeFilter && !yearFilter) {
            return;
        }

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var typeValue = normalize(typeFilter ? typeFilter.value : "");
            var yearValue = normalize(yearFilter ? yearFilter.value : "");
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var type = normalize(card.getAttribute("data-type"));
                var year = normalize(card.getAttribute("data-year"));
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedType = !typeValue || type === typeValue;
                var matchedYear = !yearValue || year === yearValue;
                card.hidden = !(matchedKeyword && matchedType && matchedYear);
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (typeFilter) {
            typeFilter.addEventListener("change", apply);
        }
        if (yearFilter) {
            yearFilter.addEventListener("change", apply);
        }
        apply();
    }

    function setupSearch() {
        Array.prototype.slice.call(document.querySelectorAll("[data-search-zone]")).forEach(setupSearchZone);
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupSearch();
    });
})();
