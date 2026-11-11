// Chargement de tous les modules (pour l'examen blanc, les erreurs, les fiches).
export async function chargerModules() {
  const parcours = await fetch("data/parcours.json").then((r) => r.json());
  const ids = parcours.blocs.flatMap((b) => b.niveaux).filter((n) => !n.aVenir).map((n) => n.id);
  const modules = await Promise.all(ids.map(async (id) => {
    try {
      const r = await fetch(`data/niveaux/${String(id).padStart(2, "0")}.json`);
      return r.ok ? await r.json() : null;
    } catch { return null; }
  }));
  return modules.filter(Boolean);
}

export function melanger(tableau) {
  for (let i = tableau.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tableau[i], tableau[j]] = [tableau[j], tableau[i]];
  }
  return tableau;
}
