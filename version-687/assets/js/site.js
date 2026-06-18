(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-filter-query]");
    var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var matches = true;
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        if (query && text.indexOf(query) === -1) {
          matches = false;
        }
        selects.forEach(function (select) {
          var field = select.getAttribute("data-filter");
          var value = select.value;
          if (value && card.getAttribute("data-" + field) !== value) {
            matches = false;
          }
        });
        card.hidden = !matches;
        if (matches) {
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

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-src]");
      var startButton = player.querySelector("[data-player-start]");
      var proxyButtons = Array.prototype.slice.call(document.querySelectorAll("[data-player-proxy]"));
      if (!video) {
        return;
      }

      function playVideo() {
        var source = video.getAttribute("data-src");
        if (!source) {
          return;
        }
        player.classList.add("is-playing");
        video.controls = true;

        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          if (!video._siteHls) {
            video._siteHls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            video._siteHls.loadSource(source);
            video._siteHls.attachMedia(video);
            if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
              video._siteHls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
              });
            }
          }
          video.play().catch(function () {});
          return;
        }

        if (!video.getAttribute("src")) {
          video.setAttribute("src", source);
        }
        video.play().catch(function () {});
      }

      if (startButton) {
        startButton.addEventListener("click", function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      player.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        if (event.target.closest("[data-player-start]")) {
          return;
        }
        playVideo();
      });

      proxyButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          playVideo();
          player.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
