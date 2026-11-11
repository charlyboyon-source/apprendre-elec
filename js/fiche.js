// Fiches mémo : l'essentiel d'un module sur une page, à imprimer.
import "./page.js";
import { chargerModules } from "./donnees.js";

const zone = document.querySelector(".fiche-zone");
const sansTermes = (t) => t.replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, "$1");

async function init() {
  const modules = await chargerModules();
  const id = Number(new URLSearchParams(location.search).get("id"));
  const module = modules.find((m) => m.id === id);
  if (module) afficherFiche(module, modules); else afficherListe(modules);
}

function afficherListe(modules) {
  document.title = "Fiches mémo d'électricité à imprimer — ApprendreElec";
  zone.innerHTML = `
    <h1>Fiches mémo</h1>
    <p class="niveau-objectif">L'essentiel de chaque cours sur une page. À relire avant un contrôle, ou à imprimer.</p>
    <section class="outil-carte">
      <ul class="liste-modules">${modules.map((m) => `
        <li><span><span class="num">${m.id}</span><a href="fiche.html?id=${m.id}">${m.titre}</a></span>
        <span class="droite">${m.cours.sections.length} points</span></li>`).join("")}</ul>
    </section>`;
}

function afficherFiche(m, modules) {
  document.title = `Fiche mémo : ${m.titre} — ApprendreElec`;
  const i = modules.indexOf(m);
  zone.innerHTML = `
    <p class="lecon-kicker">FICHE MÉMO · MODULE ${m.id}</p>
    <h1>${m.titre}</h1>
    <p class="niveau-objectif">${m.objectif}</p>
    <div class="page-actions">
      <button class="bouton-plein fiche-imprimer" type="button">🖨 Imprimer ou enregistrer en PDF</button>
      <a class="bouton-creux" href="niveau.html?id=${m.id}&module=lecon&libre=1">📖 Lire le cours</a>
      <a class="bouton-creux" href="fiche.html">Toutes les fiches</a>
    </div>
    ${m.cours.sections.map((s) => `
      <section class="fiche-section">
        <h2>${s.titre}</h2>
        <p>${sansTermes(s.memo || "")}</p>
      </section>`).join("")}
    <nav class="page-voisins non-imprime">
      ${i > 0 ? `<a href="fiche.html?id=${modules[i - 1].id}">← ${modules[i - 1].titre}</a>` : "<span></span>"}
      ${i < modules.length - 1 ? `<a href="fiche.html?id=${modules[i + 1].id}">${modules[i + 1].titre} →</a>` : "<span></span>"}
    </nav>`;
  zone.querySelector(".fiche-imprimer").addEventListener("click", () => window.print());
  window.scrollTo(0, 0);
}

init();
