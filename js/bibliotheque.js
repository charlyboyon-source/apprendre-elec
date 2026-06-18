// Pages "bibliothèque" : liste tout le contenu d'un type (leçons / quiz / jeux),
// groupé par bloc puis par niveau. Clic → ouvre le niveau sur le bon module.

import { chargerProgression, niveauAccessible, niveauTermine } from "./progression.js";
import { demanderOuverture } from "./dialogue.js";

const JEU_NOM = { "trouve-erreur": "Trouve l'erreur", "vrai-faux-rapide": "Vrai / Faux rapide" };

const TYPES = {
  lecon: { titre: "Toutes les leçons", icone: "📖", descr: (n) => n.cours ? "Cours complet" : `${n.lecon.length} écrans` },
  quiz: { titre: "Tous les quiz", icone: "🎯", descr: (n) => n.banque ? `${Math.min(15, n.banque.length)} questions au hasard` : `${n.quiz.length} questions` },
  jeu: { titre: "Tous les jeux", icone: "🎮", descr: (n) => JEU_NOM[n.jeu.type] || "Jeu" }
};

export async function afficherBibliotheque(conteneur, type) {
  if (!TYPES[type]) type = "lecon";
  document.title = `${TYPES[type].titre} — ApprendreElec`;

  const parcours = await fetch("data/parcours.json").then((r) => r.json());

  // Charge les niveaux disponibles (blocs non "à venir") pour afficher les compteurs.
  const data = {};
  await Promise.all(
    parcours.blocs.filter((b) => !b.aVenir).flatMap((b) => b.niveaux).map(async (n) => {
      try {
        const r = await fetch(`data/niveaux/${String(n.id).padStart(2, "0")}.json`);
        if (r.ok) data[n.id] = await r.json();
      } catch { /* niveau indisponible : ignoré */ }
    })
  );

  rendre();

  function rendre() {
    const etat = chargerProgression();
    const T = TYPES[type];

    const sections = parcours.blocs.map((bloc) => {
      const lignes = bloc.niveaux.map((niveau) => ligne(niveau, bloc, T, etat)).join("");
      return `
        <section class="biblio-bloc${bloc.aVenir ? " bloc-a-venir" : ""}">
          <h2 class="biblio-bloc-titre"><span class="bloc-numero">Bloc ${bloc.id}</span> ${bloc.titre}${bloc.aVenir ? ' <span class="bloc-chip">à venir</span>' : ""}</h2>
          <div class="biblio-liste">${lignes}</div>
        </section>`;
    }).join("");

    conteneur.innerHTML = `
      <div class="biblio-entete">
        <h1 class="biblio-titre"><span class="biblio-ic">${T.icone}</span> ${T.titre}</h1>
        <p class="biblio-sous">Tout le contenu, bloc par bloc. Touche un niveau pour l'ouvrir directement sur ${type === "lecon" ? "sa leçon" : type === "quiz" ? "son quiz" : "son jeu"}.</p>
      </div>
      ${sections}`;

    // Branche les clics sur les niveaux verrouillés (confirmation d'ouverture).
    conteneur.querySelectorAll(".biblio-item.verrou").forEach((el) => {
      const id = Number(el.dataset.id);
      const niveau = trouverNiveau(parcours, id);
      el.addEventListener("click", () => demanderOuverture(niveau, () => { location.href = `niveau.html?id=${id}&module=${type}`; }));
    });
  }

  function ligne(niveau, bloc, T, etat) {
    const descr = data[niveau.id] ? T.descr(data[niveau.id]) : "";

    // Bloc à venir : non cliquable.
    if (bloc.aVenir) {
      return `
        <div class="biblio-item a-venir" aria-disabled="true">
          <span class="biblio-num">${niveau.id}</span>
          <span class="biblio-item-txt"><b>${niveau.titre}</b></span>
          <span class="biblio-tag">à venir</span>
        </div>`;
    }

    const termine = niveauTermine(niveau.id, etat);
    const accessible = niveauAccessible(niveau.id, etat);
    const indicateur = termine ? '<span class="biblio-tag ok">✓ terminé</span>'
      : accessible ? '<span class="biblio-fleche">→</span>'
      : '<span class="biblio-cadenas">🔒</span>';
    const corps = `
      <span class="biblio-num">${niveau.id}</span>
      <span class="biblio-item-txt"><b>${niveau.titre}</b>${descr ? `<small>${descr}</small>` : ""}</span>
      ${indicateur}`;

    if (accessible) {
      return `<a class="biblio-item${termine ? " terminee" : ""}" href="niveau.html?id=${niveau.id}&module=${type}">${corps}</a>`;
    }
    // Verrouillé : bouton qui déclenche la confirmation.
    return `<button class="biblio-item verrou" type="button" data-id="${niveau.id}">${corps}</button>`;
  }
}

function trouverNiveau(parcours, id) {
  for (const bloc of parcours.blocs) {
    const n = bloc.niveaux.find((x) => x.id === id);
    if (n) return n;
  }
  return { id, titre: `Niveau ${id}` };
}
