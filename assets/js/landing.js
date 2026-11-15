// Home page: live numbers, light video handling, the photo strip, the contact form,
// and the volleyball that flies as you scroll.
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const hasIO = "IntersectionObserver" in window;
  const tryPlay = (video) => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };

  // ---- numbers ------------------------------------------------------------
  // 86648 -> "86.6k", 20602503 -> "20.6M", 229000000 -> "229M". Rounded down, never up.
  const short = (n) => {
    if (n >= 1e8) return Math.floor(n / 1e6) + "M";
    if (n >= 1e6) return (Math.floor(n / 1e5) / 10).toFixed(1) + "M";
    if (n >= 1e4) return (Math.floor(n / 100) / 10).toFixed(1) + "k";
    return Math.round(n).toLocaleString("en");
  };
  const pick = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

  const countUp = (el, target) => {
    if (reduceMotion || !hasIO) { el.textContent = short(target); return; }
    const run = () => {
      const t0 = performance.now(), dur = 1100;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = short(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step); else el.textContent = short(target);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); run(); }
    }, { threshold: 0.4 });
    io.observe(el);
  };

  fetch("/assets/data/stats.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : null))
    .then((stats) => {
      if (!stats) return;
      document.querySelectorAll("[data-stat]").forEach((el) => {
        const v = Number(pick(stats, el.dataset.stat));
        if (Number.isFinite(v) && v > 0) countUp(el, v);
      });
      const d = stats.updated && new Date(stats.updated + "T12:00:00");
      if (d && !isNaN(d)) {
        const txt = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        document.querySelectorAll("[data-stat-date]").forEach((el) => { el.textContent = txt; });
      }
    })
    .catch(() => { /* the numbers written into the page stay */ });

  // ---- background video ------------------------------------------------------
  // A still picture is always there (the poster). The video itself only loads and plays on wide
  // screens, and only while the top of the page is on screen; further down the last frame stays.
  const bg = document.querySelector(".home__bg");
  if (bg && !reduceMotion && !saveData && window.matchMedia("(min-width: 701px)").matches) {
    let playing = false;
    const sync = () => {
      const want = !document.hidden && window.scrollY < window.innerHeight * 0.7;
      if (want === playing) return;
      playing = want;
      if (want) tryPlay(bg); else bg.pause();
    };
    window.addEventListener("scroll", sync, { passive: true });
    document.addEventListener("visibilitychange", sync);
    sync();
  }

  // ---- reels: one clip plays at a time, and only while the row is on screen --
  const reels = Array.from(document.querySelectorAll(".reel video"));
  const row = document.querySelector(".reels");
  if (reels.length && row && !reduceMotion && hasIO) {
    let current = 0, inView = false;
    const stopAll = () => reels.forEach((v) => v.pause());
    const playOnly = (i) => {
      current = i;
      reels.forEach((v, k) => { if (k !== i) v.pause(); });
      tryPlay(reels[i]);
    };
    reels.forEach((v, i) => {
      v.addEventListener("ended", () => {
        v.currentTime = 0;
        if (inView && !document.hidden) playOnly((i + 1) % reels.length);
      });
      v.closest(".reel").addEventListener("pointerenter", () => { if (inView) playOnly(i); });
    });
    new IntersectionObserver((entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      if (inView && !document.hidden) playOnly(current); else stopAll();
    }, { threshold: 0.25 }).observe(row);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopAll(); else if (inView) playOnly(current);
    });
  }

  // ---- photo strip: stands still while it is off screen ------------------------
  const strip = document.querySelector(".strip");
  if (strip && hasIO) {
    new IntersectionObserver((entries) => {
      strip.classList.toggle("is-paused", !entries[entries.length - 1].isIntersecting);
    }).observe(strip);
  }

  // ---- contact form: send without leaving the page -------------------------
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("contactStatus");
  if (form && formStatus) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      formStatus.textContent = "Sending...";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          form.reset();
          formStatus.textContent = "Sent. I will get back to you soon.";
        } else {
          formStatus.textContent = "That did not go through. Please email me instead.";
        }
      } catch {
        formStatus.textContent = "No connection. Please email me instead.";
      }
    });
  }

  // ---- volleyball ----------------------------------------------------------
  // One pass over the screen per screen-height of scrolling, left to right, then back,
  // on an arc like a ball going over a net. Position depends only on scroll: it stops when you stop.
  const ball = document.querySelector(".ball");
  if (!ball || reduceMotion) return;

  let vw = 0, vh = 0, max = 1, size = 160, queued = false;
  const measure = () => {
    vw = window.innerWidth; vh = window.innerHeight;
    max = Math.max(1, document.documentElement.scrollHeight - vh);
    size = ball.getBoundingClientRect().width || 160;
  };
  const place = () => {
    queued = false;
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    const passes = Math.max(2, Math.round(max / vh));
    const t = p * passes;
    const i = Math.min(passes - 1, Math.floor(t));
    const f = t - i;                                   // 0..1 within this pass
    const along = i % 2 === 0 ? f : 1 - f;             // alternate direction
    const x = -size + along * (vw + size);
    const y = vh * 0.78 - 4 * f * (1 - f) * vh * 0.56 - size / 2;
    ball.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(t * 320).toFixed(1)}deg)`;
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(place); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { measure(); onScroll(); });
  window.addEventListener("load", () => { measure(); onScroll(); });
  measure();
  place();
})();
