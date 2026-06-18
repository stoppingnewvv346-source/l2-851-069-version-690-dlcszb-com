function activateMobileNav() {
  var toggle = document.querySelector(".mobile-toggle");
  var nav = document.querySelector(".site-nav");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", function () {
    nav.classList.toggle("open");
  });
}

function activateHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  if (!slides.length) {
    return;
  }
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var index = 0;
  var timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
      restart();
    });
  });

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

  restart();
}

function activateFilters() {
  var input = document.querySelector(".filter-input");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
  var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
  var empty = document.querySelector(".empty-state");
  if (!cards.length) {
    return;
  }

  var query = new URLSearchParams(window.location.search).get("q") || "";
  if (input && query) {
    input.value = query;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function apply() {
    var term = normalize(input ? input.value : "");
    var visible = 0;
    cards.forEach(function (card) {
      var matched = true;
      var searchText = normalize(card.getAttribute("data-search"));
      if (term && searchText.indexOf(term) === -1) {
        matched = false;
      }
      selects.forEach(function (select) {
        var key = select.getAttribute("data-filter");
        var value = normalize(select.value);
        if (value && normalize(card.getAttribute("data-" + key)) !== value) {
          matched = false;
        }
      });
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  if (input) {
    input.addEventListener("input", apply);
  }
  selects.forEach(function (select) {
    select.addEventListener("change", apply);
  });
  apply();
}

document.addEventListener("DOMContentLoaded", function () {
  activateMobileNav();
  activateHero();
  activateFilters();
});
