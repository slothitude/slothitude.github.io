/**
 * Projects Showcase — Slothitude Games Portfolio
 * Fetches projects.json, renders filterable card grid, and handles detail modals.
 */

(function () {
  "use strict";

  const GRID_CONTAINER_ID = "projects-grid";
  const FILTER_BAR_ID = "project-filters";
  const MODAL_ID = "project-modal";

  let allProjects = [];
  let activeGenre = "All";

  // --- Init ---
  async function init() {
    try {
      const res = await fetch("projects/projects.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      allProjects = await res.json();
    } catch (err) {
      console.error("Failed to load projects:", err);
      const grid = document.getElementById(GRID_CONTAINER_ID);
      if (grid) {
        grid.innerHTML =
          '<p class="projects-error">Could not load projects. Please try again later.</p>';
      }
      return;
    }

    renderFilters();
    renderGrid();
    createModal();
  }

  // --- Genre filter bar ---
  function renderFilters() {
    const bar = document.getElementById(FILTER_BAR_ID);
    if (!bar) return;

    const genres = [
      "All",
      ...new Set(allProjects.map((p) => p.genre)),
    ];

    bar.innerHTML = "";
    genres.forEach((genre) => {
      const btn = document.createElement("button");
      btn.className = "filter-btn" + (genre === activeGenre ? " active" : "");
      btn.textContent = genre;
      btn.addEventListener("click", () => {
        activeGenre = genre;
        renderFilters();
        renderGrid();
      });
      bar.appendChild(btn);
    });
  }

  // --- Card grid ---
  function renderGrid() {
    const grid = document.getElementById(GRID_CONTAINER_ID);
    if (!grid) return;

    const filtered =
      activeGenre === "All"
        ? allProjects
        : allProjects.filter((p) => p.genre === activeGenre);

    grid.innerHTML = "";

    if (filtered.length === 0) {
      grid.innerHTML =
        '<p class="projects-empty">No projects in this category yet.</p>';
      return;
    }

    filtered.forEach((project) => {
      const card = buildCard(project);
      grid.appendChild(card);
    });
  }

  function buildCard(project) {
    const card = document.createElement("article");
    card.className = "project-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View details for ${project.title}`);
    card.style.setProperty("--accent", project.color);

    const statusClass = statusToClass(project.status);

    card.innerHTML = `
      <div class="card-image">
        <img src="${project.screenshot}" alt="${project.title} screenshot" loading="lazy" />
        <span class="card-status ${statusClass}">${project.status}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${project.title}</h3>
        <p class="card-tagline">${project.tagline}</p>
        <div class="card-genres">
          <span class="genre-tag" style="--tag-color: ${project.color}">${project.genre}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => openModal(project));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(project);
      }
    });

    return card;
  }

  function statusToClass(status) {
    const map = {
      Released: "status-released",
      Active: "status-released",
      "Early Access": "status-early",
      "In Development": "status-dev",
    };
    return map[status] || "status-dev";
  }

  // --- Modal ---
  function createModal() {
    if (document.getElementById(MODAL_ID)) return;

    const overlay = document.createElement("div");
    overlay.id = MODAL_ID;
    overlay.className = "modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");

    overlay.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" aria-label="Close modal">&times;</button>
        <div class="modal-inner"></div>
      </div>
    `;

    overlay
      .querySelector(".modal-close")
      .addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    document.body.appendChild(overlay);
  }

  function openModal(project) {
    const overlay = document.getElementById(MODAL_ID);
    if (!overlay) return;

    const statusClass = statusToClass(project.status);
    const featuresHTML = project.features
      .map((f) => `<li>${f}</li>`)
      .join("");

    const storeLinksHTML = Object.entries(project.storeLinks || {})
      .map(
        ([store, url]) =>
          `<a href="${url}" target="_blank" rel="noopener noreferrer" class="store-link store-${store}">
            ${storeIcon(store)} ${capitalize(store)}
          </a>`
      )
      .join("");

    const tagsHTML = project.tags
      .map((t) => `<span class="modal-tag">${t}</span>`)
      .join("");

    overlay.querySelector(".modal-inner").innerHTML = `
      <div class="modal-image">
        <img src="${project.screenshot}" alt="${project.title}" />
      </div>
      <div class="modal-details">
        <div class="modal-header">
          <h2>${project.title}</h2>
          <span class="card-status ${statusClass}">${project.status}</span>
        </div>
        <p class="modal-tagline">${project.tagline}</p>
        <p class="modal-description">${project.description}</p>
        <h4>Features</h4>
        <ul class="modal-features">${featuresHTML}</ul>
        <div class="modal-tags">${tagsHTML}</div>
        <div class="modal-store-links">${storeLinksHTML}</div>
      </div>
    `;

    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    overlay.querySelector(".modal-close").focus();
  }

  function closeModal() {
    const overlay = document.getElementById(MODAL_ID);
    if (!overlay) return;
    overlay.classList.remove("visible");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function storeIcon(store) {
    const icons = {
      steam: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
      itch: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3.13 1.33C2.58 1.76 1.6 2.88 1.38 3.33c-.36.76-.09 1.58.35 2.27.58.9 1.37 1.58 2.05 2.4.29.35.57.72.72 1.16.12.35.08.74-.08 1.08-.3.62-.93.95-1.52 1.22-.77.35-1.6.63-2.28 1.15C.4 13.5.35 14.1.35 14.76c0 .78.13 1.56.28 2.32.15.74.32 1.48.57 2.19.28.79.7 1.51 1.35 2.03.72.57 1.65.8 2.55.76 1.03-.04 1.93-.56 2.78-1.1.65-.41 1.27-.87 1.95-1.23.36-.19.76-.34 1.17-.25.63.14 1.04.71 1.51 1.12.51.44 1.15.73 1.83.73 1.06 0 2.01-.6 2.72-1.33.71-.73 1.22-1.63 1.68-2.55.8-1.6 1.39-3.3 1.82-5.04.22-.89.4-1.8.42-2.72.02-.7-.12-1.43-.56-2-.52-.67-1.35-1-2.17-1.14-.81-.13-1.64-.1-2.46-.1h-5.9c-.58 0-1.16-.02-1.74-.02-.36 0-.72.01-1.07.07-.4.07-.79.22-1.04.54z"/></svg>`,
      epic: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
      github: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
    };
    return icons[store] || "";
  }

  function capitalize(str) {
    if (str === "itch") return "itch.io";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // --- Boot ---
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
