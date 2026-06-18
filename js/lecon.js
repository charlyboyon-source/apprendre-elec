// Moteur de leçon. Deux formats détectés dans le JSON :
//   - niveau.cours : cours long sur une seule page scrollable (sections titrées) ;
//   - niveau.lecon : écrans paginés avec Suivant / Précédent (format historique).
// Dans les deux cas : scroll-to-top à l'ouverture, glossaire [[…]] cliquable, mémos ◆.

import { activerTermes, brancherTermes } from "./glossaire.js";

// Options :
//   ecranDepart : index de l'écran (paginé) ou de la section (cours) d'ouverture
//   onFin()     : appelé quand la leçon est validée
export function demarrerLecon(niveau, conteneur, { ecranDepart = 0, onFin } = {}) {
  if (niveau.cours) { rendreCours(niveau.cours, conteneur, ecranDepart, onFin); return; }
  rendrePagine(niveau.lecon, conteneur, ecranDepart, onFin);
}

// ---------- Format "cours long sur une seule page" ----------
function rendreCours(cours, conteneur, sectionDepart, onFin) {
  const sections = cours.sections.map((s, i) => `
    <section class="cours-section" id="cours-sec-${i}">
      <h3 class="cours-titre">${s.titre}</h3>
      ${s.svg ? `<div class="lecon-figure"><img src="assets/svg/${s.svg}" alt=""></div>` : ""}
      <div class="cours-texte">${activerTermes(s.contenu)}</div>
      ${s.encadre ? `<aside class="cours-chantier"><b>🔧 ${s.encadre.titre || "Sur le chantier"}</b><p>${activerTermes(s.encadre.texte)}</p></aside>` : ""}
      ${s.memo ? `<div class="lecon-memo">◆ ${s.memo}</div>` : ""}
    </section>`).join("");

  conteneur.innerHTML = `
    <article class="cours">
      ${cours.intro ? `<p class="cours-intro">${activerTermes(cours.intro)}</p>` : ""}
      ${sections}
      <button class="cours-fini" type="button">J'ai terminé la leçon ✓</button>
    </article>`;

  brancherTermes(conteneur);
  conteneur.querySelector(".cours-fini").addEventListener("click", () => onFin?.());

  // Renvoi depuis le quiz : on défile jusqu'à la bonne section ; sinon, en haut.
  requestAnimationFrame(() => {
    const cible = sectionDepart > 0 ? conteneur.querySelector(`#cours-sec-${sectionDepart}`) : null;
    if (cible) cible.scrollIntoView();
    else window.scrollTo(0, 0);
  });
}

// ---------- Format paginé historique (écrans + Suivant / Précédent) ----------
function rendrePagine(ecrans, conteneur, ecranDepart, onFin) {
  let index = Math.min(ecranDepart, ecrans.length - 1);

  function rendre() {
    const ecran = ecrans[index];
    conteneur.innerHTML = `
      <div class="lecon-points">${ecrans
        .map((_, i) => `<i class="${i <= index ? "actif" : ""}"></i>`)
        .join("")}</div>
      <div class="lecon-ecran">
        <div class="lecon-kicker">${ecran.kicker || ""}</div>
        <h2>${ecran.titre}</h2>
        ${ecran.svg ? `<div class="lecon-figure"><img src="assets/svg/${ecran.svg}" alt=""></div>` : ""}
        <p class="lecon-texte">${activerTermes(ecran.contenu)}</p>
        ${ecran.memo ? `<div class="lecon-memo">◆ ${ecran.memo}</div>` : ""}
      </div>
      <div class="lecon-nav">
        <button class="lecon-prec" ${index === 0 ? 'style="visibility:hidden"' : ""}>← Précédent</button>
        <button class="lecon-suiv">${index === ecrans.length - 1 ? "Terminer la leçon ✓" : "Suivant →"}</button>
      </div>`;

    brancherTermes(conteneur);
    conteneur.querySelector(".lecon-prec").addEventListener("click", () => {
      if (index > 0) { index--; rendre(); }
    });
    conteneur.querySelector(".lecon-suiv").addEventListener("click", () => {
      if (index < ecrans.length - 1) { index++; rendre(); }
      else onFin?.();
    });

    // Chaque écran (initial, Précédent, Suivant) repart en haut de la vue.
    window.scrollTo(0, 0);
  }

  rendre();
}
