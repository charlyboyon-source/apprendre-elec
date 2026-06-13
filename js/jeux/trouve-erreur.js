// Jeu "Trouve l'erreur" : une scène SVG de salle de bain, 4 équipements,
// un seul est non conforme. Sons discrets (uniquement ici, désactivables).

import { sonClac, sonVictoire, sonEchec } from "../audio.js";

// Scène de fond : soit un SVG statique (config.fond), soit la coupe
// de salle de bain par défaut. Les items cliquables sont superposés.
function sceneSVG(items, fond) {
  if (fond) {
    return `<svg width="100%" viewBox="0 0 300 178" role="img">
    <image href="assets/svg/${fond}" x="0" y="0" width="300" height="178"/>
    ${itemsSVG(items)}
    </svg>`;
  }
  return `<svg width="100%" viewBox="0 0 300 178" role="img" aria-label="Coupe d'une salle de bain avec ses volumes">
  <line x1="8" y1="146" x2="292" y2="146" stroke="#5b6775" stroke-width="2.5"/>
  <line x1="14" y1="146" x2="14" y2="12" stroke="#5b6775" stroke-width="2.5"/>
  <rect x="14" y="34" width="92" height="112" rx="3" fill="#e8744f" opacity="1"/>
  <rect x="106" y="34" width="50" height="112" rx="3" fill="#e9c50e" opacity="1"/>
  <path d="M22 100 q4 -10 14 -10 h44 q10 0 14 10 v38 q0 6 -6 6 h-60 q-6 0 -6 -6 z" fill="#e85b50" stroke="#b03a31" stroke-width="2"/>
  <text x="58" y="122" text-anchor="middle" font-size="9.5" fill="#fff" font-weight="bold">VOLUME 0</text>
  <text x="60" y="58" text-anchor="middle" font-size="9.5" fill="#14181d" font-weight="bold">VOLUME 1</text>
  <text x="131" y="58" text-anchor="middle" font-size="9.5" fill="#14181d" font-weight="bold">VOLUME 2</text>
  <text x="216" y="80" font-size="8.5" fill="#7e8a98">HORS VOLUME</text>
  ${itemsSVG(items)}
  </svg>`;
}

function itemsSVG(items) {
  return items.map((it) => `
    <g class="jeu-item" data-id="${it.id}" role="button" aria-label="${it.label}">
      <circle class="cible" cx="${it.x}" cy="${it.y}" r="15" fill="#1f2630" stroke="#3a4250" stroke-width="1.4"/>
      <text x="${it.x}" y="${it.y + 5}" text-anchor="middle" font-size="13">${it.emoji}</text>
      <text x="${it.x}" y="${it.y + 27}" text-anchor="middle" font-size="7" fill="#9aa6b3">${it.label}</text>
    </g>`).join("");
}

// Options : onFin() appelé après la dernière installation.
export function demarrerJeu(config, conteneur, { onFin } = {}) {
  const rounds = config.rounds;
  let index = 0;

  function rendre() {
    const round = rounds[index];
    conteneur.innerHTML = `
      <div class="quiz-entete">
        <span>Installation ${index + 1}/${rounds.length}</span>
        <span>touche l'élément NON conforme</span>
      </div>
      <div class="jeu-carte">
        <p class="jeu-consigne">${round.consigne}</p>
        <div class="jeu-scene">${sceneSVG(round.items, config.fond)}</div>
        <div class="jeu-retour"></div>
        <button class="jeu-suivant">${index === rounds.length - 1 ? "Terminer le jeu ✓" : "Installation suivante →"}</button>
      </div>`;

    const retour = conteneur.querySelector(".jeu-retour");
    const suivant = conteneur.querySelector(".jeu-suivant");

    conteneur.querySelectorAll(".jeu-item").forEach((g) => {
      g.addEventListener("click", () => {
        const item = round.items.find((x) => x.id === g.dataset.id);
        if (item.bad) {
          retour.className = "jeu-retour visible gagne";
          retour.innerHTML = "✓ " + round.win;
          sonClac();
          setTimeout(sonVictoire, 150);
          suivant.classList.add("visible");
          conteneur.querySelectorAll(".jeu-item").forEach((x) => (x.style.pointerEvents = "none"));
        } else {
          retour.className = "jeu-retour visible perdu";
          retour.innerHTML = `✗ Non — <b>${item.label}</b> est conforme ici. Cherche encore : qui n'a rien à faire dans son volume ?`;
          sonEchec();
        }
      });
    });

    suivant.addEventListener("click", () => {
      if (index < rounds.length - 1) { index++; rendre(); }
      else onFin?.();
    });
  }

  rendre();
}
