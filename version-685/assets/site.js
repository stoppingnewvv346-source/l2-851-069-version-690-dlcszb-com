(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const buttons = Array.from(scope.querySelectorAll('[data-filter-value]'));
    const cards = Array.from(scope.querySelectorAll('[data-card]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const value = button.getAttribute('data-filter-value') || 'all';
        buttons.forEach(function (btn) {
          btn.classList.toggle('is-active', btn === button);
        });
        cards.forEach(function (card) {
          const text = [
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-title')
          ].join(' ');
          card.style.display = value === 'all' || text.indexOf(value) !== -1 ? '' : 'none';
        });
      });
    });
  });

  const searchForms = Array.from(document.querySelectorAll('form[role="search"]'));

  const renderResults = function (panel, matches) {
    if (!panel) {
      return;
    }

    if (!matches.length) {
      panel.classList.remove('is-open');
      panel.innerHTML = '';
      return;
    }

    panel.innerHTML = matches.slice(0, 12).map(function (item) {
      return [
        '<a class="search-item" href="' + item.url + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
        '<span><strong>' + escapeHtml(item.title) + '</strong>',
        '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></span>',
        '</a>'
      ].join('');
    }).join('');
    panel.classList.add('is-open');
  };

  const escapeHtml = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  searchForms.forEach(function (form) {
    const input = form.querySelector('[data-search-input]');
    const panel = form.querySelector('[data-search-panel]');

    if (!input || !panel) {
      return;
    }

    const runSearch = function () {
      const keyword = input.value.trim().toLowerCase();
      if (!keyword || !window.SEARCH_DATA) {
        renderResults(panel, []);
        return [];
      }
      const matches = window.SEARCH_DATA.filter(function (item) {
        return item.index.indexOf(keyword) !== -1;
      });
      renderResults(panel, matches);
      return matches;
    };

    input.addEventListener('input', runSearch);

    input.addEventListener('focus', function () {
      if (input.value.trim()) {
        runSearch();
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const matches = runSearch();
      if (matches.length) {
        window.location.href = matches[0].url;
      }
    });

    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  });
})();

function createMoviePlayer(videoId, overlayId, streamUrl) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);

  if (!video || !overlay || !streamUrl) {
    return;
  }

  let ready = false;
  let hlsInstance = null;

  const attach = function () {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
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
  };

  const play = function () {
    attach();
    overlay.classList.add('is-hidden');
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  };

  overlay.addEventListener('click', play);

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });

  video.addEventListener('ended', function () {
    overlay.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
