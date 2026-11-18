// Pages « schéma » : le menu, et le schéma ouvert en grand par-dessus la page (une croix, Échap ou un toucher à côté le referment).
import "./page.js";

let voile = null, origine = null;
function fermer() {
  if (!voile) return;
  voile.remove(); voile = null; document.documentElement.classList.remove("zoom-ouvert");
  if (origine) origine.focus();
}
function ouvrir(lien) {
  origine = lien;
  const petite = lien.querySelector("img");
  voile = document.createElement("div");
  voile.className = "zoom-voile"; voile.setAttribute("role", "dialog"); voile.setAttribute("aria-modal", "true"); voile.setAttribute("aria-label", "Schéma en grand");
  const croix = document.createElement("button");
  croix.type = "button"; croix.className = "zoom-fermer"; croix.setAttribute("aria-label", "Fermer le schéma"); croix.textContent = "✕";
  const cadre = document.createElement("div"); cadre.className = "zoom-cadre";
  const grande = document.createElement("img");
  grande.src = lien.href; grande.alt = petite ? petite.alt : "";
  cadre.appendChild(grande); voile.append(croix, cadre);
  voile.addEventListener("click", (ev) => { if (ev.target !== grande) fermer(); });
  document.body.appendChild(voile); document.documentElement.classList.add("zoom-ouvert");
  croix.focus();
}
document.addEventListener("click", (ev) => {
  const lien = ev.target.closest ? ev.target.closest("a.schema-zoom") : null;
  if (!lien || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
  ev.preventDefault(); ouvrir(lien);
});
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") fermer(); });
