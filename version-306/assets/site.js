(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    const input = document.querySelector('[data-search-input]');
    const grid = document.querySelector('[data-filter-grid]');
    const empty = document.querySelector('[data-empty-state]');
    const quickFilters = Array.from(document.querySelectorAll('[data-filter-value]'));

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter(value) {
        if (!grid) {
            return;
        }

        const keyword = normalize(value);
        const cards = Array.from(grid.querySelectorAll('[data-filter-card]'));
        let visible = 0;

        cards.forEach(function (card) {
            const text = normalize(card.getAttribute('data-filter-text'));
            const matched = !keyword || text.indexOf(keyword) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    if (input && grid) {
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';
        if (initial) {
            input.value = initial;
            applyFilter(initial);
        }

        input.addEventListener('input', function () {
            applyFilter(input.value);
        });
    }

    quickFilters.forEach(function (button) {
        button.addEventListener('click', function () {
            quickFilters.forEach(function (item) {
                item.classList.remove('is-active');
            });
            button.classList.add('is-active');
            const value = button.getAttribute('data-filter-value') || '';
            if (input) {
                input.value = value;
            }
            applyFilter(value);
        });
    });
})();
