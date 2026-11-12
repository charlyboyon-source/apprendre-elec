// Menu : onglets visibles dans l'en-tête + tiroir ☰ (autres pages et réglage "Navigation libre").

import { navigationLibre, definirNavigationLibre } from "./progression.js";
import "./mesure.js";

// onChangement() : appelé quand un réglage change (pour rafraîchir la carte).
export function brancherMenu(onChangement) {
  const burger = document.querySelector(".bouton-burger");
  if (!burger) return;

  const dimmer = document.createElement("div");
  dimmer.className = "menu-dimmer";

  const drawer = document.createElement("nav");
  drawer.className = "menu-drawer";
  drawer.setAttribute("aria-label", "Menu");
  const page = location.pathname.split("/").pop() || "index.html";
  const type = new URLSearchParams(location.search).get("type");
  const actif = (cond) => (cond ? " actif" : "");
  const surParcours = page === "" || page === "index.html";
  const surBiblio = page === "bibliotheque.html";
  const surAtelier = page === "atelier-depannage.html" || page === "atelier-schemas.html";

  drawer.innerHTML = `
    <div class="menu-tete">
      <span>Menu</span>
      <button class="menu-fermer" type="button" aria-label="Fermer">✕</button>
    </div>
    <nav class="menu-liens">
      <a class="menu-lien${actif(surParcours)}" href="index.html">⚡ Le parcours</a>
      <a class="menu-lien${actif(surBiblio && type === "lecon")}" href="bibliotheque.html?type=lecon">📖 Toutes les leçons</a>
      <a class="menu-lien${actif(surBiblio && type === "quiz")}" href="bibliotheque.html?type=quiz">🎯 Tous les quiz</a>
      <a class="menu-lien${actif(surBiblio && type === "jeu")}" href="bibliotheque.html?type=jeu">🎮 Tous les jeux</a>
      <div class="menu-sep"></div>
      <a class="menu-lien${actif(page === "examen.html")}" href="examen.html">📝 Examen blanc</a>
      <a class="menu-lien${actif(page === "erreurs.html")}" href="erreurs.html">🔁 Mes erreurs</a>
      <a class="menu-lien${actif(page === "fiche.html")}" href="fiche.html">🖨 Fiches mémo</a>
      <a class="menu-lien${actif(page === "lexique.html")}" href="lexique.html">📚 Lexique</a>
      <a class="menu-lien${actif(page === "atelier-depannage.html")}" href="atelier-depannage.html">🔧 Atelier dépannage</a>
      <a class="menu-lien${actif(page === "atelier-schemas.html")}" href="atelier-schemas.html">🔌 Atelier schémas</a>
      <div class="menu-sep"></div>
      <a class="menu-lien${actif(page === "calculateurs.html")}" href="calculateurs.html">🧮 Calculateurs</a>
      <a class="menu-lien${actif(page === "configurateur.html")}" href="configurateur.html">🗄 Configurateur de tableau</a>
      <a class="menu-lien${actif(page === "actualites.html")}" href="actualites.html">📰 Actualités</a>
      <a class="menu-lien${actif(page === "materiel.html")}" href="materiel.html">🧰 Le matériel de l'apprenti</a>
      <a class="menu-lien${actif(page === "a-propos.html")}" href="a-propos.html">ℹ️ À propos</a>
    </nav>
    <div class="menu-sep"></div>
    <label class="menu-reglage">
      <span class="menu-reglage-txt">
        <b>Navigation libre</b>
        <small>Accède à tous les niveaux sans suivre l'ordre. Désactivée, la progression par cadenas reste active.</small>
      </span>
      <input type="checkbox" class="menu-bascule" role="switch">
    </label>`;

  document.body.appendChild(dimmer);
  document.body.appendChild(drawer);

  // Menu toujours visible dans l'en-tête : les mêmes onglets sur toutes les pages.
  const entete = document.querySelector(".entete");
  if (entete && !entete.querySelector(".nav-haut")) {
    const surCours = page === "cours.html" || location.pathname.includes("/cours/") || (surBiblio && type === "lecon");
    const haut = document.createElement("nav");
    haut.className = "nav-haut";
    haut.setAttribute("aria-label", "Rubriques");
    haut.innerHTML = `
      <a class="${actif(surParcours).trim()}" href="index.html">Accueil</a>
      <a class="${actif(surCours).trim()}" href="cours.html">Cours</a>
      <a class="${actif(surBiblio && type === "quiz").trim()}" href="bibliotheque.html?type=quiz">Quiz</a>
      <a class="${actif(page === "examen.html").trim()}" href="examen.html">Examen blanc</a>
      <a class="${actif(page === "fiche.html").trim()}" href="fiche.html">Fiches mémo</a>
      <a class="${actif(surAtelier).trim()}" href="atelier-depannage.html">Atelier</a>
      <a class="${actif(page === "lexique.html").trim()}" href="lexique.html">Lexique</a>`;
    entete.appendChild(haut);
    haut.querySelector(".actif")?.scrollIntoView({ block: "nearest", inline: "center" });
  }

  const bascule = drawer.querySelector(".menu-bascule");
  bascule.checked = navigationLibre();

  const ouvrir = (o) => {
    drawer.classList.toggle("ouvert", o);
    dimmer.classList.toggle("ouvert", o);
  };

  burger.addEventListener("click", () => ouvrir(true));
  drawer.querySelector(".menu-fermer").addEventListener("click", () => ouvrir(false));
  dimmer.addEventListener("click", () => ouvrir(false));

  bascule.addEventListener("change", () => {
    definirNavigationLibre(bascule.checked);
    onChangement?.();
  });
}
