const heroFeature = document.querySelector(".vb-hero__feature");
const silhouette = document.querySelector(".vb-hero__silhouette");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && (heroFeature || silhouette)) {
  let ticking = false;

  const parallax = () => {
    const y = window.scrollY || 0;
    const featureShift = Math.min(y * 0.08, 20);
    const silhouetteShift = Math.min(y * 0.14, 42);

    if (heroFeature) {
      heroFeature.style.setProperty("--vb-feature-shift", `${featureShift}px`);
    }

    if (silhouette) {
      silhouette.style.setProperty("--vb-silhouette-shift", `${silhouetteShift}px`);
    }

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(parallax);
  }, { passive: true });

  parallax();
}
