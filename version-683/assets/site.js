(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
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

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var scopes = document.querySelectorAll("[data-filter-scope]");
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var year = scope.querySelector("[data-filter-year]");
            var type = scope.querySelector("[data-filter-type]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-filter-empty]");

            function apply() {
                var query = normalize(input && input.value);
                var yearValue = normalize(year && year.value);
                var typeValue = normalize(type && type.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    var matchType = !typeValue || normalize(card.getAttribute("data-type")) === typeValue;
                    var match = matchQuery && matchYear && matchType;
                    card.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, year, type].forEach(function (field) {
                if (field) {
                    field.addEventListener("input", apply);
                    field.addEventListener("change", apply);
                }
            });
        });
    }

    function cardTemplate(item) {
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />',
            '<span class="poster-type">' + escapeHtml(item.type) + '</span>',
            '<span class="poster-year">' + escapeHtml(item.year) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p>' + escapeHtml(item.description) + '</p>',
            '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var results = document.getElementById("searchResults");
        if (!results || !window.__SEARCH_INDEX__) {
            return;
        }
        var input = document.getElementById("searchPageInput");
        var hint = document.getElementById("searchHint");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }

        function render(value) {
            var q = normalize(value);
            var items = window.__SEARCH_INDEX__.filter(function (item) {
                var text = normalize([
                    item.title,
                    item.region,
                    item.type,
                    item.year,
                    item.category,
                    item.genre,
                    item.tags,
                    item.description
                ].join(" "));
                return !q || text.indexOf(q) !== -1;
            }).slice(0, 120);

            results.innerHTML = items.map(cardTemplate).join("");
            if (hint) {
                hint.textContent = q ? "为你呈现匹配的片库内容。" : "展示部分精选内容，可输入关键词继续筛选。";
            }
        }

        render(query);

        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }

        document.querySelectorAll("[data-search-chip]").forEach(function (button) {
            button.addEventListener("click", function () {
                var value = button.getAttribute("data-search-chip") || "";
                if (input) {
                    input.value = value;
                }
                render(value);
            });
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("moviePlayer");
        var cover = document.getElementById("playerCover");
        var toggle = document.getElementById("playerToggle");
        var mute = document.getElementById("playerMute");
        var fullscreen = document.getElementById("playerFullscreen");
        var frame = video ? video.closest(".player-frame") : null;
        var initialized = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function prepare() {
            if (initialized) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                if (cover) {
                    cover.innerHTML = '<span class="play-icon">!</span><strong>播放暂时不可用</strong>';
                }
                return;
            }
            initialized = true;
            video.setAttribute("controls", "controls");
        }

        function play() {
            prepare();
            if (!initialized) {
                return;
            }
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        function pauseOrPlay() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        if (toggle) {
            toggle.addEventListener("click", pauseOrPlay);
        }
        if (mute) {
            mute.addEventListener("click", function () {
                video.muted = !video.muted;
                mute.textContent = video.muted ? "取消静音" : "静音";
            });
        }
        if (fullscreen && frame) {
            fullscreen.addEventListener("click", function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (frame.requestFullscreen) {
                    frame.requestFullscreen();
                }
            });
        }

        video.addEventListener("play", function () {
            if (toggle) {
                toggle.textContent = "暂停";
            }
        });
        video.addEventListener("pause", function () {
            if (toggle) {
                toggle.textContent = "播放";
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
