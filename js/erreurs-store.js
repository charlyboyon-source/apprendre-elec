// Mémoire des questions ratées, dans le navigateur (localStorage).
// Forme : { "6": ["texte de la question", …], "12": […] }
const CLE = "apprendreelec-erreurs-v1";

export function lireErreurs() {
  try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch { return {}; }
}

// Bonne réponse : la question sort de la liste. Mauvaise : elle y entre.
export function noterReponse(idModule, question, juste) {
  if (!idModule) return;
  const erreurs = lireErreurs();
  const cle = String(idModule);
  const liste = new Set(erreurs[cle] || []);
  if (juste) liste.delete(question); else liste.add(question);
  if (liste.size) erreurs[cle] = [...liste]; else delete erreurs[cle];
  try { localStorage.setItem(CLE, JSON.stringify(erreurs)); } catch { /* stockage indisponible */ }
}

export function nombreErreurs() {
  return Object.values(lireErreurs()).reduce((n, l) => n + l.length, 0);
}
