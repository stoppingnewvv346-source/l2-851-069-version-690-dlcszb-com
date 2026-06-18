(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function() {
      nav.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-site-search]").forEach(function(form) {
      form.addEventListener("submit", function(event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
        }
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      start();
    }
  }

  function setupLocalFilter() {
    var form = document.querySelector("[data-local-filter]");
    var grid = document.querySelector("[data-filter-grid]");
    if (!form || !grid) {
      return;
    }
    var input = form.querySelector("input");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    form.addEventListener("submit", function(event) {
      event.preventDefault();
    });
    input.addEventListener("input", function() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.innerText
        ].join(" ").toLowerCase();
        card.classList.toggle("is-hidden-by-filter", keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function renderSearchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-cover" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="quality">HD</span>',
      '    <span class="duration">' + escapeHtml(movie.duration) + '</span>',
      '    <span class="cover-play">▶</span>',
      '  </a>',
      '  <div class="movie-info">',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <a href="' + movie.categoryUrl + '">' + escapeHtml(movie.categoryName) + '</a>',
      '    </div>',
      '    <div class="movie-tags">',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join("\n");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var form = document.querySelector("[data-search-page-form]");
    if (!results || !status || !form || !window.SITE_MOVIES) {
      return;
    }
    var input = form.querySelector("input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim();
    if (input) {
      input.value = keyword;
    }
    function search(value) {
      var query = value.trim().toLowerCase();
      if (!query) {
        status.textContent = "输入关键词后即可浏览相关影片。";
        results.innerHTML = "";
        return;
      }
      var words = query.split(/\s+/).filter(Boolean);
      var found = window.SITE_MOVIES.filter(function(movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return words.every(function(word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 96);
      status.textContent = found.length ? "相关影片如下。" : "没有找到匹配内容，可以换一个关键词。";
      results.innerHTML = found.map(renderSearchCard).join("\n");
    }
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      var value = input ? input.value.trim() : "";
      var nextUrl = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
      window.history.replaceState(null, "", nextUrl);
      search(value);
    });
    search(keyword);
  }

  window.initMoviePlayer = function(streamUrl) {
    var card = document.querySelector("[data-player]");
    if (!card) {
      return;
    }
    var video = card.querySelector("video");
    var cover = card.querySelector(".player-cover");
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (prepared || !video || !streamUrl) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function() {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function() {
        if (video.paused) {
          play();
        }
      });
    }
    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function() {
    setupMobileNav();
    setupSearchForms();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();
