async function loadProjects() {
  const el = document.getElementById("projects");
  if (!el) return;

  try {
    const res = await fetch("/data/projects.json");
    const projects = await res.json();

    el.innerHTML = projects.map(p => `
      <article class="card">
        <h3 class="item-title">${p.title}</h3>
        <p class="muted">${p.one_liner}</p>
        <p>${p.description}</p>
        ${p.highlights?.length ? `<ul>${p.highlights.map(h => `<li>${h}</li>`).join("")}</ul>` : ""}
        ${p.links?.length ? `<p>${p.links.map(l => `<a href="${l.href}" target="_blank" rel="noreferrer">${l.label}</a>`).join(" · ")}</p>` : ""}
      </article>
    `).join("");
  } catch (e) {
    el.innerHTML = `<p class="muted">Could not load projects yet.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
