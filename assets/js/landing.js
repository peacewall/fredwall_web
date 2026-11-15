// Home page: live numbers from /assets/data/stats.json, and the volleyball that flies as you scroll.
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    if (reduceMotion || !("IntersectionObserver" in window)) { el.textContent = short(target); return; }
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

  let queued = false;
  const place = () => {
    queued = false;
    const vw = window.innerWidth, vh = window.innerHeight;
    const max = Math.max(1, document.documentElement.scrollHeight - vh);
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    const passes = Math.max(2, Math.round(max / vh));
    const t = p * passes;
    const i = Math.min(passes - 1, Math.floor(t));
    const f = t - i;                                   // 0..1 within this pass
    const size = ball.getBoundingClientRect().width || 160;
    const along = i % 2 === 0 ? f : 1 - f;             // alternate direction
    const x = -size + along * (vw + size);
    const y = vh * 0.78 - 4 * f * (1 - f) * vh * 0.56 - size / 2;
    ball.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${(t * 320).toFixed(1)}deg)`;
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(place); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  place();
})();
