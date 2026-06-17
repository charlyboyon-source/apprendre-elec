// Init de l'application : header, compteur d'électrons,
// carte sur l'accueil, hub de niveau sur niveau.html.

import {
  majCompteurElectrons, crediterElectrons, terminerNiveau,
  niveauAccessible, deverrouillerManuel, activiteFaite, marquerActivite, toutesActivitesFaites
} from "./progression.js";
import { afficherCarte } from "./carte.js";
import { afficherBibliotheque } from "./bibliotheque.js";
import { brancherMenu } from "./menu.js";
import { afficherVolty, voltyReagit } from "./volty.js";
import { brancherBoutonSons } from "./audio.js";
import { demarrerLecon } from "./lecon.js";
import { demarrerQuiz } from "./quiz.js";
import { demarrerJeu as jeuTrouveErreur } from "./jeux/trouve-erreur.js";
import { demarrerJeu as jeuVraiFaux } from "./jeux/vrai-faux-rapide.js";

const JEUX = {
  "trouve-erreur": { moteur: jeuTrouveErreur, nom: "Trouve l'erreur", onglet: "Jeu", desc: (c) => `${c.rounds.length} installations, 1 faute à débusquer` },
  "vrai-faux-rapide": { moteur: jeuVraiFaux, nom: "Vrai / Faux rapide", onglet: "Vrai/Faux", desc: (c) => `${c.affirmations.length} affirmations, tranche vite` }
};

document.addEventListener("DOMContentLoaded", () => {
  majCompteurElectrons();
  brancherBoutonSons();
  mesurerEntete();

  const conteneurCarte = document.querySelector(".carte");
  if (conteneurCarte) {
    afficherCarte(conteneurCarte);
    brancherMenu(() => afficherCarte(conteneurCarte)); // re-rend la carte au changement de réglage
  }

  const conteneurBiblio = document.querySelector(".bibliotheque");
  if (conteneurBiblio) {
    const type = new URLSearchParams(location.search).get("type") || "lecon";
    afficherBibliotheque(conteneurBiblio, type);
    brancherMenu(() => afficherBibliotheque(conteneurBiblio, type));
  }

  const conteneurNiveau = document.querySelector(".niveau");
  if (conteneurNiveau) initNiveau(conteneurNiveau);
});

// La barre d'onglets de l'activité se cale juste sous le header du site :
// on mémorise la hauteur du header dans --entete-h pour le `top` sticky.
function mesurerEntete() {
  const entete = document.querySelector(".entete");
  if (!entete) return;
  const maj = () => document.documentElement.style.setProperty("--entete-h", entete.offsetHeight + "px");
  maj();
  window.addEventListener("resize", maj);
}

async function initNiveau(conteneur) {
  const id = Number(new URLSearchParams(location.search).get("id"));
  if (!id || id < 1 || id > 21) { location.href = "index.html"; return; }
  if (!niveauAccessible(id)) {
    conteneur.innerHTML = `
      <p class="niveau-message">🔒 Ce niveau fait partie d'un parcours progressif et n'est pas encore débloqué.</p>
      <div class="niveau-message"><button class="ouvrir-quand-meme" type="button">Ouvrir quand même</button></div>`;
    conteneur.querySelector(".ouvrir-quand-meme").addEventListener("click", () => {
      deverrouillerManuel(id);
      location.reload();
    });
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

  // Lien profond depuis les bibliothèques : ouvrir directement le bon module.
  const module = new URLSearchParams(location.search).get("module");
  if (["lecon", "quiz", "jeu"].includes(module)) afficherActivite(module, niveau, conteneur);
  else afficherHub(niveau, conteneur);
}

// Menu du niveau : Volty + les 3 modules en grosses cartes.
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
    </div>`;

  afficherVolty(
    conteneur.querySelector(".volty-zone"),
    toutesActivitesFaites(niveau.id)
      ? "Niveau déjà bouclé 🏆 Tu peux tout rejouer en révision libre."
      : `<b>${niveau.titre}</b> — leçon, quiz, jeu. Termine les trois pour empocher <b>${niveau.recompense.electrons} e⁻</b> et déverrouiller la suite.`
  );

  conteneur.querySelectorAll(".hub-case").forEach((btn) => {
    btn.addEventListener("click", () => afficherActivite(btn.dataset.act, niveau, conteneur));
  });
  window.scrollTo(0, 0);
}

function coche(id, act) {
  return activiteFaite(id, act) ? '<span class="fait">✓</span>' : "";
}

// Vue plein écran d'une activité : elle remplace le menu. Une barre sticky
// (Retour + 3 onglets) reste visible au scroll ; le moteur rend dans
// `.activite-contenu`, qui occupe toute la zone sans rien au-dessus.
function afficherActivite(act, niveau, conteneur, ecranDepart = 0) {
  const ongletJeu = JEUX[niveau.jeu.type].onglet;
  conteneur.innerHTML = `
    <div class="activite-vue">
      <div class="activite-barre">
        <button class="retour-menu">← Retour</button>
        <div class="onglets">
          <button class="onglet" data-act="lecon">Leçon${coche(niveau.id, "lecon")}</button>
          <button class="onglet" data-act="quiz">Quiz${coche(niveau.id, "quiz")}</button>
          <button class="onglet" data-act="jeu">${ongletJeu}${coche(niveau.id, "jeu")}</button>
        </div>
      </div>
      <div class="activite-contenu"></div>
    </div>`;

  conteneur.querySelector(`.onglet[data-act="${act}"]`).classList.add("actif");
  conteneur.querySelector(".retour-menu").addEventListener("click", () => afficherHub(niveau, conteneur));
  conteneur.querySelectorAll(".onglet").forEach((o) => {
    o.addEventListener("click", () => {
      if (o.dataset.act !== act) afficherActivite(o.dataset.act, niveau, conteneur);
    });
  });

  const zone = conteneur.querySelector(".activite-contenu");
  window.scrollTo(0, 0);

  if (act === "lecon") {
    demarrerLecon(niveau, zone, {
      ecranDepart,
      onFin: () => { finActivite(niveau, "lecon", conteneur); voltyReagit("lecon-finie"); }
    });
  } else if (act === "quiz") {
    demarrerQuiz(niveau, zone, {
      onFin: () => finActivite(niveau, "quiz", conteneur), // on reste sur les résultats
      onRevoirLecon: (ecran) => afficherActivite("lecon", niveau, conteneur, ecran)
    });
  } else if (act === "jeu") {
    JEUX[niveau.jeu.type].moteur(niveau.jeu.config, zone, {
      onFin: () => { finActivite(niveau, "jeu", conteneur); voltyReagit("jeu-fini"); }
    });
  }
}

// Marque l'activité faite ; quand les trois sont bouclées pour la première
// fois, crédite la récompense et déverrouille le niveau suivant.
// Leçon/jeu : on revient au menu. Quiz : on reste sur les résultats, on
// se contente de cocher l'onglet.
function finActivite(niveau, act, conteneur) {
  const dejaTout = toutesActivitesFaites(niveau.id);
  marquerActivite(niveau.id, act);

  if (!dejaTout && toutesActivitesFaites(niveau.id)) {
    crediterElectrons(niveau.recompense.electrons);
    terminerNiveau(niveau.id);
  }

  if (act === "quiz") {
    const onglet = conteneur.querySelector('.onglet[data-act="quiz"]');
    if (onglet && !onglet.querySelector(".fait")) onglet.insertAdjacentHTML("beforeend", '<span class="fait">✓</span>');
  } else {
    afficherHub(niveau, conteneur);
  }
}
