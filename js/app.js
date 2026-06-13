// Init de l'application : header, compteur d'électrons,
// carte sur l'accueil, hub de niveau sur niveau.html.

import {
  majCompteurElectrons, crediterElectrons, terminerNiveau,
  niveauDebloque, activiteFaite, marquerActivite, toutesActivitesFaites
} from "./progression.js";
import { afficherCarte } from "./carte.js";
import { afficherVolty, voltyReagit } from "./volty.js";
import { brancherBoutonSons } from "./audio.js";
import { demarrerLecon } from "./lecon.js";
import { demarrerQuiz } from "./quiz.js";
import { demarrerJeu as jeuTrouveErreur } from "./jeux/trouve-erreur.js";
import { demarrerJeu as jeuVraiFaux } from "./jeux/vrai-faux-rapide.js";

const JEUX = {
  "trouve-erreur": { moteur: jeuTrouveErreur, nom: "Trouve l'erreur", desc: (c) => `${c.rounds.length} installations, 1 faute à débusquer` },
  "vrai-faux-rapide": { moteur: jeuVraiFaux, nom: "Vrai / Faux rapide", desc: (c) => `${c.affirmations.length} affirmations, tranche vite` }
};

document.addEventListener("DOMContentLoaded", () => {
  majCompteurElectrons();
  brancherBoutonSons();

  const conteneurCarte = document.querySelector(".carte");
  if (conteneurCarte) afficherCarte(conteneurCarte);

  const conteneurNiveau = document.querySelector(".niveau");
  if (conteneurNiveau) initNiveau(conteneurNiveau);
});

async function initNiveau(conteneur) {
  const id = Number(new URLSearchParams(location.search).get("id"));
  if (!id || id < 1 || id > 21) { location.href = "index.html"; return; }
  if (!niveauDebloque(id)) {
    conteneur.innerHTML = `<p class="niveau-message">🔒 Ce niveau est encore verrouillé. Termine le niveau ${id - 1} d'abord !</p>`;
    return;
  }

  let niveau;
  try {
    const reponse = await fetch(`data/niveaux/${String(id).padStart(2, "0")}.json`);
    if (!reponse.ok) throw new Error();
    niveau = await reponse.json();
  } catch {
    conteneur.innerHTML = `<p class="niveau-message">Ce niveau arrive bientôt. ⚡</p>`;
    return;
  }

  afficherHub(niveau, conteneur);
}

function afficherHub(niveau, conteneur) {
  conteneur.innerHTML = `
    <div class="volty-zone"></div>
    <div class="niveau-entete">
      <div class="lecon-kicker">NIVEAU ${niveau.id} · BLOC ${niveau.bloc}</div>
      <h2>${niveau.titre}</h2>
      <p class="niveau-objectif">${niveau.objectif}</p>
    </div>
    <div class="hub-grille">
      <button class="hub-case" data-act="lecon">${coche(niveau.id, "lecon")}<span class="ic">📖</span><b>Leçon</b><small>${niveau.lecon.length} écrans visuels</small></button>
      <button class="hub-case" data-act="quiz">${coche(niveau.id, "quiz")}<span class="ic">🎯</span><b>Quiz</b><small>${niveau.quiz.length} questions · correction en fin de série</small></button>
      <button class="hub-case" data-act="jeu">${coche(niveau.id, "jeu")}<span class="ic">🎮</span><b>${JEUX[niveau.jeu.type].nom}</b><small>${JEUX[niveau.jeu.type].desc(niveau.jeu.config)}</small></button>
    </div>
    <div class="activite"></div>`;

  afficherVolty(
    conteneur.querySelector(".volty-zone"),
    toutesActivitesFaites(niveau.id)
      ? "Niveau déjà bouclé 🏆 Tu peux tout rejouer en révision libre."
      : `<b>${niveau.titre}</b> — leçon, quiz, jeu. Termine les trois pour empocher <b>${niveau.recompense.electrons} e⁻</b> et déverrouiller la suite.`
  );

  const zone = conteneur.querySelector(".activite");
  conteneur.querySelectorAll(".hub-case").forEach((btn) => {
    btn.addEventListener("click", () => lancerActivite(btn.dataset.act, niveau, zone, conteneur));
  });
}

function coche(id, act) {
  return activiteFaite(id, act) ? '<span class="fait">✓</span>' : "";
}

function lancerActivite(act, niveau, zone, conteneur, ecranDepart = 0) {
  window.scrollTo({ top: 0 });
  if (act === "lecon") {
    demarrerLecon(niveau, zone, {
      ecranDepart,
      onFin: () => {
        finActivite(niveau, "lecon", conteneur);
        voltyReagit("lecon-finie");
      }
    });
  } else if (act === "quiz") {
    demarrerQuiz(niveau, zone, {
      onFin: (score, total) => {
        finActivite(niveau, "quiz", conteneur);
        voltyReagit(score >= total * 0.7 ? "quiz-bon-score" : "quiz-a-revoir");
      },
      onRevoirLecon: (ecran) => lancerActivite("lecon", niveau, zone, conteneur, ecran)
    });
  } else if (act === "jeu") {
    JEUX[niveau.jeu.type].moteur(niveau.jeu.config, zone, {
      onFin: () => {
        finActivite(niveau, "jeu", conteneur);
        voltyReagit("jeu-fini");
      }
    });
  }
}

// Marque l'activité faite ; quand les trois sont bouclées pour la première
// fois, crédite la récompense et déverrouille le niveau suivant.
function finActivite(niveau, act, conteneur) {
  const dejaTout = toutesActivitesFaites(niveau.id);
  marquerActivite(niveau.id, act);

  if (!dejaTout && toutesActivitesFaites(niveau.id)) {
    crediterElectrons(niveau.recompense.electrons);
    terminerNiveau(niveau.id);
  }

  if (act !== "quiz") afficherHub(niveau, conteneur); // le quiz affiche d'abord ses résultats
  else mettreAJourCoches(niveau, conteneur);
}

function mettreAJourCoches(niveau, conteneur) {
  conteneur.querySelectorAll(".hub-case").forEach((btn) => {
    if (activiteFaite(niveau.id, btn.dataset.act) && !btn.querySelector(".fait")) {
      btn.insertAdjacentHTML("afterbegin", '<span class="fait">✓</span>');
    }
  });
}
