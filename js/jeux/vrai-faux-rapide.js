// Jeu "Vrai / Faux rapide" : une série d'affirmations, on tranche vite.
// Feedback immédiat avec explication, score final. Sons discrets désactivables.

import { sonClac, sonVictoire, sonEchec } from "../audio.js";

// Options : onFin() appelé après la dernière affirmation.
export function demarrerJeu(config, conteneur, { onFin } = {}) {
  const affirmations = config.affirmations;
  let index = 0;
  let score = 0;

  function rendre() {
    const a = affirmations[index];
    conteneur.innerHTML = `
      <div class="quiz-entete">
        <span>Affirmation ${index + 1}/${affirmations.length}</span>
        <span>vrai ou faux ?</span>
      </div>
      <div class="jeu-carte">
        <p class="jeu-consigne">${a.affirmation}</p>
        <div class="vf-boutons">
          <button class="vf-vrai">VRAI ✓</button>
          <button class="vf-faux">FAUX ✗</button>
        </div>
        <div class="jeu-retour"></div>
        <button class="jeu-suivant">${index === affirmations.length - 1 ? "Voir mon score ✓" : "Affirmation suivante →"}</button>
      </div>`;

    const retour = conteneur.querySelector(".jeu-retour");
    const suivant = conteneur.querySelector(".jeu-suivant");

    function repondre(choixVrai) {
      const ok = choixVrai === a.vrai;
      if (ok) { score++; sonClac(); setTimeout(sonVictoire, 120); }
      else sonEchec();
      retour.className = `jeu-retour visible ${ok ? "gagne" : "perdu"}`;
      retour.innerHTML = `${ok ? "✓ Exact !" : `✗ Raté — c'était <b>${a.vrai ? "VRAI" : "FAUX"}</b>.`} ${a.explication}`;
      suivant.classList.add("visible");
      conteneur.querySelectorAll(".vf-boutons button").forEach((b) => (b.disabled = true));
    }

    conteneur.querySelector(".vf-vrai").addEventListener("click", () => repondre(true));
    conteneur.querySelector(".vf-faux").addEventListener("click", () => repondre(false));

    suivant.addEventListener("click", () => {
      if (index < affirmations.length - 1) { index++; rendre(); }
      else rendreScore();
    });
  }

  function rendreScore() {
    conteneur.innerHTML = `
      <div class="quiz-score">
        <div class="grand">${score}<small> /${affirmations.length}</small></div>
        <p>${score === affirmations.length ? "Sans faute — réflexes d'électricien ⚡" :
            score >= affirmations.length * 0.7 ? "Bien joué ! Relis les explications ratées et c'est plié." :
            "Refais un tour de leçon et retente : ça va rentrer."}</p>
      </div>
      <button class="jeu-suivant visible vf-terminer">Terminer le jeu ✓</button>`;
    conteneur.querySelector(".vf-terminer").addEventListener("click", () => onFin?.());
    window.scrollTo({ top: 0 });
  }

  rendre();
}
