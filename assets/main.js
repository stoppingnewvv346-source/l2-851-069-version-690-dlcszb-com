(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 0) {
    var active = 0;
    var showSlide = function (index) {
      active = index;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === active);
      });
    };
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        showSlide(idx);
      });
    });
    showSlide(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((active + 1) % slides.length);
      }, 5200);
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));

  var normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };

  var applyFilters = function () {
    if (filterCards.length === 0) {
      return;
    }
    var query = searchInputs.map(function (input) {
      return normalize(input.value);
    }).filter(Boolean).join(' ');
    var selected = filterSelects.map(function (select) {
      return normalize(select.value);
    }).filter(Boolean);

    filterCards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year'));
      var queryOk = !query || text.indexOf(query) !== -1;
      var selectsOk = selected.every(function (item) {
        return text.indexOf(item) !== -1;
      });
      card.classList.toggle('is-hidden', !(queryOk && selectsOk));
    });
  };

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });
  filterSelects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });
})();
