// Reveal-on-scroll
const revealEls = Array.from(document.querySelectorAll(".reveal"));
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("is-visible");
  }
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// Subtle parallax for hero side images
const left = document.querySelector(".vb-hero__person--left");
const right = document.querySelector(".vb-hero__person--right");

function parallax(){
  const y = window.scrollY || 0;
  const t = Math.min(y / 6, 120);

  if (left) left.style.transform = `translate3d(0, ${t * 0.35}px, 0)`;
  if (right) right.style.transform = `translate3d(0, ${t * 0.25}px, 0)`;
}

window.addEventListener("scroll", () => {
  requestAnimationFrame(parallax);
}, { passive: true });

parallax();
