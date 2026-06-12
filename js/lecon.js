// Moteur de leçon : écrans successifs avec points d'étape, navigation,
// termes de glossaire cliquables.

import { activerTermes, brancherTermes } from "./glossaire.js";

// Lance la leçon dans `conteneur`. Options :
//   ecranDepart : index de l'écran d'ouverture (renvoi depuis le quiz)
//   onFin()     : appelé quand le dernier écran est validé
export function demarrerLecon(niveau, conteneur, { ecranDepart = 0, onFin } = {}) {
  const ecrans = niveau.lecon;
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
      if (index < ecrans.length - 1) { index++; rendre(); window.scrollTo({ top: 0 }); }
      else onFin?.();
    });
  }

  rendre();
}
