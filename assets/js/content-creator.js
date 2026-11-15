// Subtle tilt on phone (mouse move)
const phone = document.getElementById("phoneStack");
let raf = null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

function onMove(e){
  if (!phone) return;

  const rect = phone.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const dx = (e.clientX - cx) / rect.width;
  const dy = (e.clientY - cy) / rect.height;

  const rx = clamp(-dy * 10, -10, 10);
  const ry = clamp(dx * 12, -12, 12);

  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    phone.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
  });
}

function onLeave(){
  if (!phone) return;
  phone.style.transform = "";
}

if (phone && !prefersReducedMotion && window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseleave", onLeave, { passive: true });
}

// ===== Monthly views counter =====
const counterEl = document.getElementById("viewsCounter");

function formatNumber(n){
  return n.toLocaleString("en-US");
}

if (counterEl) {
  const start = Number(counterEl.dataset.start || "45000000");

  // choose a believable rate: ~ +60 to +140 per second, with tiny variation
  let baseRate = 500; // per second
  let value = start;
  let last = performance.now();

  function tick(now){
    if (document.hidden) {
      last = now;
      requestAnimationFrame(tick);
      return;
    }

    const dt = (now - last) / 1000;
    last = now;

    // small organic wobble (keeps it “alive”)
    const wobble = 0.85 + Math.random() * 0.35; // 0.85–1.20
    value += dt * baseRate * wobble;

    counterEl.textContent = formatNumber(Math.floor(value));

    requestAnimationFrame(tick);
  }

  // Set initial text and start
  counterEl.textContent = formatNumber(start);
  requestAnimationFrame(tick);
}
