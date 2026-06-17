// Rendu de la carte : bandeau de progression, en-têtes de bloc (icône +
// titre + description), bulles avec verrouillage et état "à venir".

import { chargerProgression, niveauDebloque, niveauTermine, niveauAccessible } from "./progression.js";
import { demanderOuverture } from "./dialogue.js";

// Petites icônes au trait (24×24), couleur héritée via currentColor.
const ICONES_BLOC = {
  1: '<circle cx="12" cy="12" r="2.2"/><ellipse cx="12" cy="12" rx="10" ry="4.4"/><ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.4" transform="rotate(120 12 12)"/>',
  2: '<path d="M12 3 L20 6 V11 C20 16 16.5 19.5 12 21 C7.5 19.5 4 16 4 11 V6 Z"/><path d="M8.8 12 l2.2 2.2 l4.2 -4.4"/>',
  3: '<rect x="4" y="3" width="16" height="18" rx="2"/><line x1="4" y1="9.5" x2="20" y2="9.5"/><rect x="7" y="5.4" width="3.2" height="2.2"/><rect x="13.8" y="5.4" width="3.2" height="2.2"/><rect x="7" y="12.4" width="3.2" height="2.2"/><rect x="13.8" y="12.4" width="3.2" height="2.2"/>',
  4: '<path d="M9.5 18.5 h5"/><path d="M10.5 21 h3"/><path d="M12 3 a6 6 0 0 1 4 10.2 c-0.9 0.9 -1.4 1.9 -1.5 2.8 h-5 c-0.1 -0.9 -0.6 -1.9 -1.5 -2.8 a6 6 0 0 1 4 -10.2 Z"/>',
  5: '<path d="M4 11 L12 4 L20 11"/><path d="M6 10 V20 H18 V10"/><path d="M13 11.5 l-3 4.2 h2.3 l-0.9 3 3.6 -4.7 h-2.3 z"/>'
};

function iconeBloc(id) {
  return `<svg class="bloc-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES_BLOC[id] || ""}</svg>`;
}

export async function afficherCarte(conteneur) {
  const reponse = await fetch("data/parcours.json");
  const parcours = await reponse.json();
  const etat = chargerProgression();

  majBandeauProgression(parcours, etat);

  conteneur.innerHTML = "";

  for (const bloc of parcours.blocs) {
    const sectionBloc = document.createElement("section");
    sectionBloc.className = "bloc" + (bloc.aVenir ? " bloc-a-venir" : "");

    const entete = document.createElement("div");
    entete.className = "bloc-entete";
    entete.innerHTML = `
      <span class="bloc-icone">${iconeBloc(bloc.id)}</span>
      <div class="bloc-texte">
        <h2 class="bloc-titre"><span class="bloc-numero">Bloc ${bloc.id}</span> ${bloc.titre}${bloc.aVenir ? ' <span class="bloc-chip">à venir</span>' : ""}</h2>
        ${bloc.description ? `<p class="bloc-desc">${bloc.description}</p>` : ""}
      </div>`;
    sectionBloc.appendChild(entete);

    const bulles = document.createElement("div");
    bulles.className = "bulles";
    for (const niveau of bloc.niveaux) {
      const ligne = document.createElement("div");
      ligne.className = "bulle-ligne";
      ligne.appendChild(creerBulle(niveau, etat, bloc.aVenir));
      bulles.appendChild(ligne);
    }
    sectionBloc.appendChild(bulles);
    conteneur.appendChild(sectionBloc);
  }
}

function majBandeauProgression(parcours, etat) {
  const bandeau = document.querySelector(".progression-bandeau");
  if (!bandeau) return;
  const total = parcours.blocs.reduce((n, b) => n + b.niveaux.length, 0);
  const faits = etat.niveauxTermines.filter((id) => id >= 1 && id <= total).length;
  const pct = total ? Math.round((faits / total) * 100) : 0;
  bandeau.innerHTML = `
    <div class="progression-ligne">Ta progression : <b>${faits} / ${total}</b> niveaux · <b class="prog-e">${etat.electrons} e⁻</b></div>
    <div class="progression-barre"><span style="width:${pct}%"></span></div>`;
}

function cadenasEl() {
  const s = document.createElement("span");
  s.className = "cadenas";
  s.textContent = "🔒";
  return s;
}

// Renvoie un .bulle-item = la bulle + un libellé centré dessous.
function creerBulle(niveau, etat, aVenir) {
  let bulle, etatCls, label;

  if (aVenir) {
    // Blocs à venir : bulle verrouillée non interactive, libellé discret "à venir".
    bulle = document.createElement("div");
    bulle.className = "bulle verrouillee a-venir";
    bulle.textContent = niveau.id;
    bulle.setAttribute("aria-label", `Niveau ${niveau.id} (à venir)`);
    bulle.appendChild(cadenasEl());
    etatCls = "est-avenir";
    label = "à venir";
  } else {
    const termine = niveauTermine(niveau.id, etat);
    const prochain = niveauDebloque(niveau.id, etat); // étape naturelle suivante
    const accessible = niveauAccessible(niveau.id, etat);

    if (accessible) {
      // terminé (vert) · prochain à jouer (jaune lumineux) · simplement ouvert (contour)
      const etatClasse = termine ? "terminee" : prochain ? "debloquee" : "ouvert";
      bulle = document.createElement("a");
      bulle.className = "bulle " + etatClasse;
      bulle.href = `niveau.html?id=${niveau.id}`;
      bulle.textContent = niveau.id;
      bulle.setAttribute("aria-label", `Niveau ${niveau.id} — ${niveau.titre}${termine ? " (terminé)" : ""}`);
      etatCls = termine ? "est-terminee" : prochain ? "est-prochain" : "est-ouvert";
    } else {
      // Verrouillé : cadenas conservé, mais ouvrable via une confirmation.
      bulle = document.createElement("button");
      bulle.type = "button";
      bulle.className = "bulle verrouillee";
      bulle.textContent = niveau.id;
      bulle.setAttribute("aria-label", `Niveau ${niveau.id} — ${niveau.titre} (verrouillé — ouvrir quand même ?)`);
      bulle.appendChild(cadenasEl());
      bulle.addEventListener("click", () => demanderOuverture(niveau, () => { location.href = `niveau.html?id=${niveau.id}`; }));
      etatCls = "est-verrou";
    }
    label = niveau.titre;
  }

  const item = document.createElement("div");
  item.className = "bulle-item " + etatCls;
  item.appendChild(bulle);
  const libelle = document.createElement("span");
  libelle.className = "bulle-label";
  libelle.textContent = label;
  item.appendChild(libelle);
  return item;
}
