// Reveal animations
const revealEls = Array.from(document.querySelectorAll(".reveal"));
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add("is-visible");
  }
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// Filtering
const chips = Array.from(document.querySelectorAll(".chip"));
const cards = Array.from(document.querySelectorAll(".pr-card"));

function setActiveChip(btn){
  chips.forEach(c => c.classList.toggle("is-active", c === btn));
}

function applyFilter(tag){
  cards.forEach(card => {
    const tags = (card.dataset.tags || "").split(/\s+/).filter(Boolean);
    const show = (tag === "all") || tags.includes(tag);
    card.style.display = show ? "" : "none";
  });
}

chips.forEach(btn => {
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter || "all";
    setActiveChip(btn);
    applyFilter(f);
  });
});

// Modal
const modal = document.getElementById("prModal");
const modalImg = document.getElementById("prModalImg");
const modalTitle = document.getElementById("prModalTitle");
const modalSub = document.getElementById("prModalSub");
const modalText = document.getElementById("prModalText");

function openModal(card){
  const title = card.dataset.title || "Project";
  const sub = card.dataset.subtitle || "";
  const body = card.dataset.body || "";
  const img = card.dataset.img || "";

  modalTitle.textContent = title;
  modalSub.textContent = sub;
  modalText.textContent = body;

  if (img) {
    modalImg.style.backgroundImage = `url('${img}')`;
  } else {
    modalImg.style.backgroundImage = "";
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(){
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

cards.forEach(card => {
  card.addEventListener("click", () => openModal(card));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(card);
    }
  });
  // make card keyboard-focusable
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
});

modal.addEventListener("click", (e) => {
  const close = e.target && e.target.dataset && e.target.dataset.close;
  if (close) closeModal();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});
