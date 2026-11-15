// Sidebar toggle on mobile + ring progress animation

const burger = document.getElementById("burger");
const sidebar = document.getElementById("sidebar");

if (burger && sidebar) {
  burger.addEventListener("click", () => {
    const open = sidebar.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Close sidebar when tapping outside (mobile)
  document.addEventListener("click", (e) => {
    if (!sidebar.classList.contains("is-open")) return;
    const clickedBurger = burger.contains(e.target);
    const clickedSidebar = sidebar.contains(e.target);
    if (!clickedBurger && !clickedSidebar) {
      sidebar.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });
}

const rings = Array.from(document.querySelectorAll(".ring"));
const drawRings = () => {
  for (const ring of rings) {
    const pct = Number(ring.getAttribute("data-pct") || 0);
    const fg = ring.querySelector(".ring__fg");
    if (fg) fg.style.strokeDasharray = `${Math.max(0, Math.min(100, pct))} 100`;
  }
};

if (!rings.length) {
  // Nothing to animate.
} else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
  drawRings();
} else {
  const ringSection = rings[0].closest(".sidebar__section") || rings[0];
  const ringObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      drawRings();
      observer.disconnect();
    });
  }, { threshold: 0.35 });

  ringObserver.observe(ringSection);
}
