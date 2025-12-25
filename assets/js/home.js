// Simple reveal-on-load (and still works if you later add sections below)
const els = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("is-visible");
  });
}, { threshold: 0.2 });

els.forEach(el => io.observe(el));
