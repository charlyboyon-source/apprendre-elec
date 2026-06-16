// Rendu de la carte en bulles : 5 blocs, 21 niveaux, verrouillage.

import { chargerProgression, niveauDebloque, niveauTermine, niveauAccessible, deverrouillerManuel } from "./progression.js";

export async function afficherCarte(conteneur) {
  const reponse = await fetch("data/parcours.json");
  const parcours = await reponse.json();
  const etat = chargerProgression();

  conteneur.innerHTML = "";

  for (const bloc of parcours.blocs) {
    const sectionBloc = document.createElement("section");
    sectionBloc.className = "bloc";

    const titre = document.createElement("h2");
    titre.className = "bloc-titre";
    titre.innerHTML = `<span class="bloc-numero">Bloc ${bloc.id}</span> ${bloc.titre}`;
    sectionBloc.appendChild(titre);

    const bulles = document.createElement("div");
    bulles.className = "bulles";

    for (const niveau of bloc.niveaux) {
      const ligne = document.createElement("div");
      ligne.className = "bulle-ligne";
      ligne.appendChild(creerBulle(niveau, etat));
      bulles.appendChild(ligne);
    }

    sectionBloc.appendChild(bulles);
    conteneur.appendChild(sectionBloc);
  }
}

function creerBulle(niveau, etat) {
  const termine = niveauTermine(niveau.id, etat);
  const prochain = niveauDebloque(niveau.id, etat); // étape naturelle suivante
  const accessible = niveauAccessible(niveau.id, etat);

  if (accessible) {
    // terminé (vert) · prochain à jouer (jaune lumineux) · simplement ouvert (contour)
    const etatClasse = termine ? "terminee" : prochain ? "debloquee" : "ouvert";
    const lien = document.createElement("a");
    lien.className = "bulle " + etatClasse;
    lien.href = `niveau.html?id=${niveau.id}`;
    lien.textContent = niveau.id;
    lien.setAttribute("aria-label", `Niveau ${niveau.id}${termine ? " (terminé)" : ""}`);
    return lien;
  }

  // Verrouillé : cadenas conservé, mais ouvrable via une confirmation.
  const bulle = document.createElement("button");
  bulle.type = "button";
  bulle.className = "bulle verrouillee";
  bulle.textContent = niveau.id;
  bulle.setAttribute("aria-label", `Niveau ${niveau.id} (verrouillé — ouvrir quand même ?)`);
  const cadenas = document.createElement("span");
  cadenas.className = "cadenas";
  cadenas.textContent = "🔒";
  bulle.appendChild(cadenas);
  bulle.addEventListener("click", () => demanderOuverture(niveau));
  return bulle;
}

// Confirmation avant d'ouvrir un niveau hors progression.
function demanderOuverture(niveau) {
  fermerDialogue();
  const fond = document.createElement("div");
  fond.className = "dialogue-fond";
  fond.innerHTML = `
    <div class="dialogue" role="dialog" aria-modal="true" aria-labelledby="dlg-titre">
      <h5 id="dlg-titre">Niveau ${niveau.id} — ${niveau.titre}</h5>
      <p>Ce niveau fait partie d'un parcours progressif. L'ouvrir quand même ?</p>
      <div class="dialogue-actions">
        <button class="dialogue-annuler" type="button">Annuler</button>
        <button class="dialogue-ouvrir" type="button">Ouvrir</button>
      </div>
    </div>`;

  fond.querySelector(".dialogue-annuler").addEventListener("click", fermerDialogue);
  fond.addEventListener("click", (e) => { if (e.target === fond) fermerDialogue(); });
  fond.querySelector(".dialogue-ouvrir").addEventListener("click", () => {
    deverrouillerManuel(niveau.id);
    location.href = `niveau.html?id=${niveau.id}`;
  });
  document.body.appendChild(fond);
}

function fermerDialogue() {
  document.querySelector(".dialogue-fond")?.remove();
}
