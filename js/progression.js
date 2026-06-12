// Progression du joueur : électrons, badges, niveaux terminés.
// Stockage : localStorage, clé unique versionnée.

const CLE_STOCKAGE = "apprendre-elec-v1";

const ETAT_DEFAUT = {
  electrons: 0,
  badges: [],
  niveauxTermines: []
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

export function majCompteurElectrons(valeur = chargerProgression().electrons) {
  const el = document.querySelector(".compteur-electrons");
  if (el) el.textContent = `${valeur} e⁻`;
}
