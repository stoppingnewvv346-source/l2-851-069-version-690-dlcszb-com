(() => {
  const select = (query, root = document) => root.querySelector(query);
  const selectAll = (query, root = document) => Array.from(root.querySelectorAll(query));
  const normalize = (value) => String(value || "").trim().toLowerCase();

  const applySearchForms = () => {
    selectAll(".js-site-search").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = select("input[name='q']", form);
        const query = input ? input.value.trim() : "";
        const target = query ? `./search.html?q=${encodeURIComponent(query)}` : "./search.html";
        window.location.href = target;
      });
    });
  };

  const applyMobileMenu = () => {
    const button = select(".menu-toggle");
    const panel = select("#mobilePanel");
    if (!button || !panel) return;
    button.addEventListener("click", () => {
      const open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    });
  };

  const applyHero = () => {
    const slides = selectAll(".hero-slide");
    const dots = selectAll(".hero-dot");
    const prev = select(".hero-prev");
    const next = select(".hero-next");
    if (!slides.length) return;
    let index = 0;
    let timer = 0;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    };

    const restart = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        restart();
      });
    }

    restart();
  };

  const applyFilters = () => {
    const list = select(".js-filter-list");
    if (!list) return;
    const keywordInput = select(".js-filter-keyword");
    const regionSelect = select(".js-filter-region");
    const typeSelect = select(".js-filter-type");
    const urlQuery = new URLSearchParams(window.location.search).get("q") || "";
    if (keywordInput && urlQuery) keywordInput.value = urlQuery;

    const items = selectAll(".movie-card, .rank-row", list);
    const filter = () => {
      const keyword = normalize(keywordInput ? keywordInput.value : "");
      const region = normalize(regionSelect ? regionSelect.value : "");
      const type = normalize(typeSelect ? typeSelect.value : "");
      items.forEach((item) => {
        const haystack = normalize([
          item.dataset.title,
          item.dataset.region,
          item.dataset.type,
          item.dataset.genre,
          item.dataset.year,
          item.dataset.category
        ].join(" "));
        const regionMatch = !region || normalize(item.dataset.region) === region;
        const typeMatch = !type || normalize(item.dataset.type) === type;
        const keywordMatch = !keyword || haystack.includes(keyword);
        item.classList.toggle("is-hidden", !(regionMatch && typeMatch && keywordMatch));
      });
    };

    [keywordInput, regionSelect, typeSelect].forEach((control) => {
      if (!control) return;
      control.addEventListener("input", filter);
      control.addEventListener("change", filter);
    });

    filter();
  };

  document.addEventListener("DOMContentLoaded", () => {
    applySearchForms();
    applyMobileMenu();
    applyHero();
    applyFilters();
  });
})();
