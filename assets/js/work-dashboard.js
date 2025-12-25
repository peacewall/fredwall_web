// Sidebar toggle on mobile + reveal animations + ring progress animation

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

// Reveal cards on scroll
const revealEls = Array.from(document.querySelectorAll(".reveal"));
const revealIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("is-visible");
  }
}, { threshold: 0.15 });

revealEls.forEach(el => revealIO.observe(el));

// Animate ring progress
const rings = Array.from(document.querySelectorAll(".ring"));
for (const ring of rings) {
  const pct = Number(ring.getAttribute("data-pct") || 0);
  const fg = ring.querySelector(".ring__fg");
  // Circumference mapping in SVG units (100 is convenient for dasharray here)
  if (fg) fg.style.strokeDasharray = `${Math.max(0, Math.min(100, pct))} 100`;
}
