// Petit outil pour décrire un logement sans écrire chaque conducteur à la main.
// Le résultat (chantier(...).logement) n'est que des données : il se copie tel quel en JSON.
const COULEUR = { phase: "rouge", neutre: "bleu", terre: "vert-jaune", retour: "orange", navette: "violet" };

export function chantier(infos) {
  const L = { ...infos, pieces: [], tableau: null, circuits: [], organes: [], appareils: [], conducteurs: [], etat: {} };
  const genre = {}; // id → "dj" | "boite" | type d'organe
  let n = 0;

  const piece = (id, nom) => { L.pieces.push({ id, nom }); };
  const circuit = (id, nom, usage, section) => { L.circuits.push({ id, nom, usage, section }); };
  function fil(role, de, vers, idCircuit = null) {
    const c = L.circuits.find((x) => x.id === idCircuit), id = `c${++n}`;
    L.conducteurs.push({ id, de, vers, role, couleur: COULEUR[role], section: c ? c.section : null, circuit: idCircuit });
    return id;
  }
  // tableau : AGCP, interrupteurs différentiels, disjoncteurs, peignes et bornier de terre
  function tableau(pieceId, { agcp, differentiels, disjoncteurs }) {
    L.tableau = { piece: pieceId, agcp, differentiels, disjoncteurs };
    organe("boite", "bt", pieceId, { nom: "Bornier de terre du tableau", bornes: ["PE"] });
    fil("phase", "reseau.L", `${agcp.id}.Lin`); fil("neutre", "reseau.N", `${agcp.id}.Nin`); fil("terre", "terre.PE", "bt.PE");
    for (const d of differentiels) { fil("phase", `${agcp.id}.Lout`, `${d.id}.Lin`); fil("neutre", `${agcp.id}.Nout`, `${d.id}.Nin`); }
    for (const q of disjoncteurs) { genre[q.id] = "dj"; fil("phase", `${q.differentiel}.Lout`, `${q.id}.Lin`, q.circuit); fil("neutre", `${q.differentiel}.Nout`, `${q.id}.Nin`, q.circuit); }
  }
  function organe(type, id, pieceId, opts = {}) { genre[id] = type; L.organes.push({ id, type, piece: pieceId, ...opts }); return id; }
  const boite = (id, pieceId, idCircuit, nom) => organe("boite", id, pieceId, { nom, circuit: idCircuit, bornes: ["ph", "n", "pe"] });
  const appareil = (id, nom, puissance, prise = null, marche = true) => { L.appareils.push({ id, nom, puissance, prise, marche }); };
  // bornes phase, neutre, terre d'un départ (disjoncteur), d'une boîte ou d'un point d'utilisation
  function pnt(id) {
    if (genre[id] === "dj") return [`${id}.Lout`, `${id}.Nout`, "bt.PE"];
    if (genre[id] === "boite") return [`${id}.ph`, `${id}.n`, `${id}.pe`];
    return [`${id}.L`, `${id}.N`, `${id}.PE`];
  }
  // un câble ou trois conducteurs sous conduit : phase, neutre, terre
  function ligne(idCircuit, de, vers) {
    const a = pnt(de), b = pnt(vers);
    return { phase: fil("phase", a[0], b[0], idCircuit), neutre: fil("neutre", a[1], b[1], idCircuit), terre: fil("terre", a[2], b[2], idCircuit) };
  }
  // prises en repiquage : départ → prise 1 → prise 2 → …
  function prises(idCircuit, depart, liste) {
    let avant = depart; const fils = [];
    for (const [id, pieceId, nom] of liste) { organe("prise", id, pieceId, { nom, circuit: idCircuit }); fils.push(ligne(idCircuit, avant, id)); avant = id; }
    return fils;
  }
  // simple allumage depuis une boîte : phase → interrupteur, retour lampe → point lumineux, neutre et terre → point lumineux
  function simpleAllumage(idCircuit, source, inter, point) {
    organe("interrupteur", inter.id, inter.piece, { nom: inter.nom, circuit: idCircuit });
    organe("point_lumineux", point.id, point.piece, { nom: point.nom, circuit: idCircuit, puissance: point.puissance || 9 });
    const [ph, nn, pe] = pnt(source);
    return { phase: fil("phase", ph, `${inter.id}.L`, idCircuit), retour: fil("retour", `${inter.id}.1`, `${point.id}.L`, idCircuit), neutre: fil("neutre", nn, `${point.id}.N`, idCircuit), terre: fil("terre", pe, `${point.id}.PE`, idCircuit) };
  }
  // va-et-vient : phase sur le commun du premier, deux navettes, retour lampe sur le commun du second
  function vaEtVient(idCircuit, source, v1, v2, point) {
    for (const v of [v1, v2]) organe("va_et_vient", v.id, v.piece, { nom: v.nom, circuit: idCircuit });
    organe("point_lumineux", point.id, point.piece, { nom: point.nom, circuit: idCircuit, puissance: point.puissance || 9 });
    const [ph, nn, pe] = pnt(source);
    return {
      phase: fil("phase", ph, `${v1.id}.C`, idCircuit), navette1: fil("navette", `${v1.id}.1`, `${v2.id}.1`, idCircuit), navette2: fil("navette", `${v1.id}.2`, `${v2.id}.2`, idCircuit),
      retour: fil("retour", `${v2.id}.C`, `${point.id}.L`, idCircuit), neutre: fil("neutre", nn, `${point.id}.N`, idCircuit), terre: fil("terre", pe, `${point.id}.PE`, idCircuit),
    };
  }
  // prise commandée : la phase passe par un interrupteur ; neutre et terre viennent directement
  function priseCommandee(idCircuit, source, inter, prise) {
    organe("interrupteur", inter.id, inter.piece, { nom: inter.nom, circuit: idCircuit });
    organe("prise", prise.id, prise.piece, { nom: prise.nom, circuit: idCircuit, commandee: true });
    const [ph, nn, pe] = pnt(source);
    return { phase: fil("phase", ph, `${inter.id}.L`, idCircuit), retour: fil("retour", `${inter.id}.1`, `${prise.id}.L`, idCircuit), neutre: fil("neutre", nn, `${prise.id}.N`, idCircuit), terre: fil("terre", pe, `${prise.id}.PE`, idCircuit) };
  }
  // appareil fixe raccordé directement (plaque, four, chauffe-eau, VMC)
  function fixe(idCircuit, depart, id, pieceId, nom, puissance, marche = false) {
    organe("appareil_fixe", id, pieceId, { nom, circuit: idCircuit, puissance, marche });
    return ligne(idCircuit, depart, id);
  }
  return { logement: L, piece, circuit, tableau, organe, boite, appareil, ligne, prises, simpleAllumage, vaEtVient, priseCommandee, fixe, fil, pnt };
}
