(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(
      root.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      root.querySelectorAll("[data-hero-dot]"),
    );
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });
    play();
  }

  function setupFilter() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-genre-select]");
    var list = document.querySelector("[data-card-list]");
    var empty = document.querySelector("[data-empty-state]");
    if (!list || (!input && !select)) {
      return;
    }
    var cards = Array.prototype.slice.call(
      list.querySelectorAll(".movie-card"),
    );
    function apply() {
      var query = normalize(input ? input.value : "");
      var genre = normalize(select ? select.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedGenre =
          !genre ||
          cardGenre.indexOf(genre) !== -1 ||
          text.indexOf(genre) !== -1;
        var matched = matchedQuery && matchedGenre;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    if (input) {
      input.addEventListener("input", apply);
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  window.initMoviePlayer = function (url) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !overlay || !url) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      attached = true;
    }
    function start() {
      attach();
      overlay.classList.add("hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    overlay.addEventListener("click", start);
    var button = overlay.querySelector("button");
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilter();
  });
})();
