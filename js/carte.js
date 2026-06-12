// Rendu de la carte en bulles : 5 blocs, 21 niveaux, verrouillage.

import { chargerProgression, niveauDebloque, niveauTermine } from "./progression.js";

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
  const debloque = niveauDebloque(niveau.id, etat);

  if (termine || debloque) {
    const lien = document.createElement("a");
    lien.className = "bulle " + (termine ? "terminee" : "debloquee");
    lien.href = `niveau.html?id=${niveau.id}`;
    lien.textContent = niveau.id;
    lien.setAttribute("aria-label", `Niveau ${niveau.id}${termine ? " (terminé)" : ""}`);
    return lien;
  }

  const bulle = document.createElement("div");
  bulle.className = "bulle verrouillee";
  bulle.textContent = niveau.id;
  bulle.setAttribute("aria-label", `Niveau ${niveau.id} (verrouillé)`);
  const cadenas = document.createElement("span");
  cadenas.className = "cadenas";
  cadenas.textContent = "🔒";
  bulle.appendChild(cadenas);
  return bulle;
}
