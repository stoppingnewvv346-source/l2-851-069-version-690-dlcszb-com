(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-dot]"),
    );
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        schedule();
      });
    }

    schedule();
  }

  function getSearchParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name) || "";
    } catch (error) {
      return "";
    }
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector("[data-card-search]");
    var cards = Array.prototype.slice.call(
      list.querySelectorAll(".movie-card"),
    );
    var typeButtons = Array.prototype.slice.call(
      panel.querySelectorAll("[data-type-filter]"),
    );
    var categoryButtons = Array.prototype.slice.call(
      panel.querySelectorAll("[data-category-filter]"),
    );
    var currentType = "all";
    var currentCategory = "all";
    var initialQuery = getSearchParam("q");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function markActive(buttons, attr, value) {
      buttons.forEach(function (button) {
        button.classList.toggle("active", button.getAttribute(attr) === value);
      });
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
        ]
          .join(" ")
          .toLowerCase();
        var typeMatch =
          currentType === "all" ||
          card.getAttribute("data-type") === currentType;
        var categoryMatch =
          currentCategory === "all" ||
          card.getAttribute("data-category") === currentCategory;
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle(
          "is-hidden",
          !(typeMatch && categoryMatch && queryMatch),
        );
      });
    }

    typeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentType = button.getAttribute("data-type-filter") || "all";
        markActive(typeButtons, "data-type-filter", currentType);
        apply();
      });
    });

    categoryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentCategory = button.getAttribute("data-category-filter") || "all";
        markActive(categoryButtons, "data-category-filter", currentCategory);
        apply();
      });
    });

    if (input) {
      input.addEventListener("input", apply);
    }

    markActive(typeButtons, "data-type-filter", currentType);
    markActive(categoryButtons, "data-category-filter", currentCategory);
    apply();
  }

  function initPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var cover = player.querySelector("[data-play-cover]");
    if (!video || !cover) {
      return;
    }
    var source = video.getAttribute("data-hls");
    var loaded = false;
    var instance = null;

    function attach() {
      if (loaded || !source) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        instance.loadSource(source);
        instance.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function play() {
      attach();
      cover.hidden = true;
      player.classList.add("is-playing");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          cover.hidden = false;
          player.classList.remove("is-playing");
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      cover.hidden = true;
      player.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        cover.hidden = false;
        player.classList.remove("is-playing");
      }
    });
    window.addEventListener("pagehide", function () {
      if (instance && typeof instance.destroy === "function") {
        instance.destroy();
      }
    });
  }

  onReady(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
