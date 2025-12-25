// Reveal blocks on scroll
const blocks = Array.from(document.querySelectorAll(".reveal"));

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("is-visible");
  }
}, { threshold: 0.12 });

blocks.forEach(b => io.observe(b));
