(() => {
  const normalizePath = (path) => {
    if (!path) return "/";
    return path.replace(/index\.html$/, "").replace(/\/+$/, "") || "/";
  };

  const currentPath = normalizePath(window.location.pathname);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.documentElement.classList.toggle("reduced-motion", prefersReducedMotion.matches);

  document.querySelectorAll(".nav__links a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const url = new URL(href, window.location.origin);
    const isActive = !url.hash && normalizePath(url.pathname) === currentPath;

    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  revealEls.forEach((el, index) => {
    el.style.setProperty("--reveal-delay", `${(index % 5) * 70}ms`);
  });

  const showAllReveals = () => {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  };

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    showAllReveals();
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    });

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  document.querySelectorAll("img").forEach((img) => {
    if (!img.hasAttribute("decoding")) {
      img.decoding = "async";
    }

    const isPriorityImage = img.closest(
      ".home__center, .vb-hero, .hero, .contact__panel, .phoneWrap, .sidebar__top"
    );

    if (!isPriorityImage && !img.hasAttribute("loading")) {
      img.loading = "lazy";
    }
  });

  const autoplayVideos = Array.from(document.querySelectorAll("video[data-bg-video], video[autoplay]"));

  const safePlay = (video) => {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  if (prefersReducedMotion.matches) {
    autoplayVideos.forEach((video) => video.pause());
    return;
  }

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (document.hidden) return;
        if (entry.isIntersecting) {
          safePlay(entry.target);
        } else {
          entry.target.pause();
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "200px 0px",
    });

    autoplayVideos.forEach((video) => videoObserver.observe(video));
  } else {
    autoplayVideos.forEach((video) => safePlay(video));
  }

  document.addEventListener("visibilitychange", () => {
    autoplayVideos.forEach((video) => {
      if (document.hidden) {
        video.pause();
      } else {
        safePlay(video);
      }
    });
  });
})();
