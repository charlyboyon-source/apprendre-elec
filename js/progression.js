// Progression du joueur : électrons, badges, niveaux terminés.
// Stockage : localStorage, clé unique versionnée.

const CLE_STOCKAGE = "apprendre-elec-v1";

const ETAT_DEFAUT = {
  electrons: 0,
  badges: [],
  niveauxTermines: [],
  activites: {},
  navigationLibre: false,      // réglage : accès direct à tous les niveaux
  deverrouillesManuels: []     // niveaux verrouillés ouverts à la demande
};

export function chargerProgression() {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (!brut) return { ...ETAT_DEFAUT };
    return { ...ETAT_DEFAUT, ...JSON.parse(brut) };
  } catch {
    return { ...ETAT_DEFAUT };
  }
}

export function sauverProgression(etat) {
  localStorage.setItem(CLE_STOCKAGE, JSON.stringify(etat));
}

export function crediterElectrons(montant) {
  const etat = chargerProgression();
  etat.electrons += montant;
  sauverProgression(etat);
  majCompteurElectrons(etat.electrons);
  return etat.electrons;
}

export function terminerNiveau(idNiveau) {
  const etat = chargerProgression();
  if (!etat.niveauxTermines.includes(idNiveau)) {
    etat.niveauxTermines.push(idNiveau);
    sauverProgression(etat);
  }
  return etat;
}

// Le niveau 1 est toujours débloqué ; ensuite, un niveau est débloqué
// si le précédent est terminé.
export function niveauDebloque(idNiveau, etat = chargerProgression()) {
  if (idNiveau === 1) return true;
  return etat.niveauxTermines.includes(idNiveau - 1);
}

export function niveauTermine(idNiveau, etat = chargerProgression()) {
  return etat.niveauxTermines.includes(idNiveau);
}

// Réglage "Navigation libre" : tous les niveaux accessibles directement.
export function navigationLibre(etat = chargerProgression()) {
  return Boolean(etat.navigationLibre);
}

export function definirNavigationLibre(actif) {
  const etat = chargerProgression();
  etat.navigationLibre = Boolean(actif);
  sauverProgression(etat);
  return etat.navigationLibre;
}

// Ouverture à la demande d'un niveau verrouillé : il reste accessible ensuite.
export function deverrouillerManuel(idNiveau) {
  const etat = chargerProgression();
  if (!etat.deverrouillesManuels.includes(idNiveau)) {
    etat.deverrouillesManuels.push(idNiveau);
    sauverProgression(etat);
  }
  return etat;
}

// Accessible = navigation libre, OU débloqué par la progression, OU terminé,
// OU ouvert manuellement.
export function niveauAccessible(idNiveau, etat = chargerProgression()) {
  return navigationLibre(etat)
    || niveauDebloque(idNiveau, etat)
    || niveauTermine(idNiveau, etat)
    || etat.deverrouillesManuels.includes(idNiveau);
}

// Activités d'un niveau : "lecon", "quiz", "jeu".
export function activiteFaite(idNiveau, activite, etat = chargerProgression()) {
  return Boolean(etat.activites[idNiveau]?.[activite]);
}

export function marquerActivite(idNiveau, activite) {
  const etat = chargerProgression();
  etat.activites[idNiveau] = etat.activites[idNiveau] || {};
  etat.activites[idNiveau][activite] = true;
  sauverProgression(etat);
  return etat;
}

export function toutesActivitesFaites(idNiveau, etat = chargerProgression()) {
  const a = etat.activites[idNiveau] || {};
  return Boolean(a.lecon && a.quiz && a.jeu);
}

export function majCompteurElectrons(valeur = chargerProgression().electrons) {
  const el = document.querySelector(".compteur-electrons");
  if (el) el.textContent = `${valeur} e⁻`;
}
