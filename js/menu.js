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
  const actif = (cond) => (cond ? " actif" : "");
  const surParcours = page === "" || page === "index.html";
  const surAtelier = page === "atelier-depannage.html" || page === "atelier-schemas.html";

  drawer.innerHTML = `
    <div class="menu-tete">
      <span>Menu</span>
      <button class="menu-fermer" type="button" aria-label="Fermer">✕</button>
    </div>
    <nav class="menu-liens">
      <a class="menu-lien${actif(surParcours)}" href="index.html">⚡ Accueil et parcours</a>
      <p class="menu-titre">Cours</p>
      <a class="menu-lien${actif(page === "cours.html")}" href="cours.html">📖 Tous les cours</a>
      <a class="menu-lien${actif(page === "fiche.html")}" href="fiche.html">🖨 Fiches mémo</a>
      <a class="menu-lien${actif(page === "lexique.html")}" href="lexique.html">📚 Lexique</a>
      <p class="menu-titre">S'entraîner</p>
      <a class="menu-lien${actif(page === "qcm.html")}" href="qcm.html">✅ QCM corrigés</a>
      <a class="menu-lien${actif(page === "examen.html")}" href="examen.html">📝 Examen blanc</a>
      <a class="menu-lien${actif(page === "erreurs.html")}" href="erreurs.html">🔁 Mes erreurs</a>
      <p class="menu-titre">Ateliers</p>
      <a class="menu-lien${actif(page === "atelier-depannage.html")}" href="atelier-depannage.html">🔧 Atelier dépannage</a>
      <a class="menu-lien${actif(page === "atelier-schemas.html")}" href="atelier-schemas.html">🔌 Atelier schémas</a>
      <p class="menu-titre">Outils</p>
      <a class="menu-lien${actif(page === "calculateurs.html")}" href="calculateurs.html">🧮 Calculateurs</a>
      <a class="menu-lien${actif(page === "configurateur.html")}" href="configurateur.html">🗄 Configurateur de tableau</a>
      <a class="menu-lien${actif(page === "materiel.html")}" href="materiel.html">🧰 Le matériel de l'apprenti</a>
      <div class="menu-sep"></div>
      <a class="menu-lien${actif(page === "actualites.html")}" href="actualites.html">📰 Actualités</a>
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

  // Menu toujours visible dans l'en-tête : cinq rubriques, chacune avec son menu déroulant.
  const entete = document.querySelector(".entete");
  if (entete && !entete.querySelector(".nav-haut")) {
    const surCours = page === "cours.html" || location.pathname.includes("/cours/");
    const GROUPES = [
      { id: "cours", label: "Cours", actif: surCours || ["fiche.html", "lexique.html"].includes(page), liens: [
        ["cours.html", "📖", "Tous les cours", "21 cours illustrés, du courant au photovoltaïque"],
        ["fiche.html", "🖨", "Fiches mémo", "L'essentiel de chaque cours, à imprimer"],
        ["lexique.html", "📚", "Lexique", "Les mots du métier, de A à Z"]] },
      { id: "entrainer", label: "S'entraîner", actif: ["examen.html", "erreurs.html", "qcm.html"].includes(page) || location.pathname.includes("/qcm/"), liens: [
        ["qcm.html", "✅", "QCM corrigés", "10 questions corrigées par cours"],
        ["examen.html", "📝", "Examen blanc", "40 questions en 40 minutes"],
        ["erreurs.html", "🔁", "Mes erreurs", "Rejoue les questions ratées"]] },
      { id: "ateliers", label: "Ateliers", actif: surAtelier, liens: [
        ["atelier-depannage.html", "🔧", "Atelier dépannage", "6 interventions : trouve la panne et répare"],
        ["atelier-schemas.html", "🔌", "Atelier schémas", "13 montages à câbler toi-même"]] },
      { id: "outils", label: "Outils", actif: ["calculateurs.html", "configurateur.html", "materiel.html"].includes(page), liens: [
        ["calculateurs.html", "🧮", "Calculateurs", "Courant, section, chute de tension…"],
        ["configurateur.html", "🗄", "Configurateur de tableau", "Compose un tableau aux normes"],
        ["materiel.html", "🧰", "Le matériel de l'apprenti", "Les outils à avoir"]] },
    ];
    const haut = document.createElement("nav");
    haut.className = "nav-haut";
    haut.setAttribute("aria-label", "Rubriques");
    haut.innerHTML = GROUPES.map((g) => `
      <div class="nav-groupe">
        <button type="button" class="nav-bouton${g.actif ? " actif" : ""}" aria-expanded="false" aria-controls="nav-${g.id}">${g.label}<span aria-hidden="true">▾</span></button>
        <div class="nav-panneau" id="nav-${g.id}" hidden>
          ${g.liens.map(([href, ic, titre, sous]) => `<a href="${href}" class="${page === href ? "actif" : ""}"><i aria-hidden="true">${ic}</i><span><b>${titre}</b><small>${sous}</small></span></a>`).join("")}
        </div>
      </div>`).join("") + `<a class="nav-simple${actif(page === "actualites.html")}" href="actualites.html">Actualités</a>`;
    entete.appendChild(haut);
    const fermer = (sauf) => haut.querySelectorAll(".nav-groupe").forEach((g) => {
      if (g === sauf) return;
      g.querySelector(".nav-panneau").hidden = true; g.querySelector(".nav-bouton").setAttribute("aria-expanded", "false");
    });
    haut.addEventListener("click", (ev) => {
      const b = ev.target.closest(".nav-bouton");
      if (!b) return;
      const g = b.closest(".nav-groupe"), p = g.querySelector(".nav-panneau");
      fermer(g);
      p.hidden = !p.hidden; b.setAttribute("aria-expanded", String(!p.hidden));
      if (!p.hidden && window.matchMedia("(max-width: 980px)").matches) p.style.top = `${entete.getBoundingClientRect().bottom}px`;
    });
    // Ordinateur : ouverture au survol
    haut.querySelectorAll(".nav-groupe").forEach((g) => {
      g.addEventListener("mouseenter", () => { if (window.matchMedia("(hover: hover) and (min-width: 981px)").matches) { fermer(g); g.querySelector(".nav-panneau").hidden = false; g.querySelector(".nav-bouton").setAttribute("aria-expanded", "true"); } });
      g.addEventListener("mouseleave", () => { if (window.matchMedia("(hover: hover) and (min-width: 981px)").matches) fermer(); });
    });
    document.addEventListener("click", (ev) => { if (!ev.target.closest(".nav-haut")) fermer(); });
    document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") fermer(); });
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
