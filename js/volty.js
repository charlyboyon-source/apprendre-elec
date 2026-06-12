// Volty, le disjoncteur vivant : bulle de dialogue + réactions aux événements.

const SVG_VOLTY = `
<svg width="64" height="78" viewBox="0 0 64 78" aria-hidden="true" class="volty-svg">
  <rect x="10" y="6" width="44" height="64" rx="7" fill="#dfe5ea" stroke="#9aa6b3" stroke-width="2"/>
  <rect x="10" y="6" width="44" height="14" rx="7" fill="#c8d1d9"/>
  <rect x="26" y="22" width="12" height="18" rx="3" fill="#3a4250"/>
  <rect x="28" y="20" width="8" height="9" rx="2" fill="#ffd23f" class="volty-levier"/>
  <circle cx="23" cy="50" r="4" fill="#1d2733"/><circle cx="41" cy="50" r="4" fill="#1d2733"/>
  <circle cx="24.5" cy="48.5" r="1.4" fill="#fff"/><circle cx="42.5" cy="48.5" r="1.4" fill="#fff"/>
  <path d="M25 60 Q32 65 39 60" stroke="#1d2733" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <text x="32" y="16" text-anchor="middle" font-size="6.5" fill="#5d6b7a" font-weight="bold">VOLTY C16</text>
</svg>`;

const REACTIONS = {
  "lecon-finie": "Leçon terminée 💪 Enchaîne sur le <b>quiz</b> pendant que c'est chaud — correction en fin de série, comme au code.",
  "quiz-bon-score": "Beau score ! Le <b>jeu</b> t'attend pour finir le niveau.",
  "quiz-a-revoir": "Utilise les boutons 📖 pour retourner pile sur l'écran de cours concerné, puis retente la série.",
  "jeu-fini": "Niveau bouclé 🏆 Tes électrons sont crédités — le niveau suivant est déverrouillé !",
  "echec": "Pas grave, on disjoncte et on réarme. Réessaie !"
};

// Insère Volty + sa bulle dans un conteneur.
export function afficherVolty(conteneur, message) {
  conteneur.innerHTML = `
    <div class="volty-barre">
      ${SVG_VOLTY}
      <div class="volty-bulle">${message}</div>
    </div>`;
}

// Fait réagir Volty à un événement (réussite, échec, badge…).
export function voltyReagit(evenement, messagePerso) {
  const bulle = document.querySelector(".volty-bulle");
  const message = messagePerso || REACTIONS[evenement];
  if (!bulle || !message) return;
  bulle.innerHTML = message;
  const svg = document.querySelector(".volty-svg");
  if (svg) {
    svg.classList.remove("volty-saute", "volty-disjoncte");
    void svg.getBoundingClientRect(); // relance l'animation CSS
    svg.classList.add(evenement === "echec" ? "volty-disjoncte" : "volty-saute");
  }
}
