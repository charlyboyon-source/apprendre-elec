// Moteur d'installation de l'atelier dépannage : un logement entier, calculé à partir de son câblage réel.
// Sans dépendance : utilisable dans le navigateur et avec Node (tests : node atelier/3d/moteur/tests.mjs).
//
// Un logement est décrit en données (voir logements/) :
//   pieces       [{ id, nom }]
//   tableau      { agcp, differentiels[], disjoncteurs[] }   (appareils bipolaires : bornes Lin, Nin, Lout, Nout)
//   circuits     [{ id, nom, usage, section }]
//   organes      [{ id, type, piece, circuit, … }]            (interrupteur, va_et_vient, prise, point_lumineux,
//                                                               appareil_fixe, boite)
//   appareils    [{ id, nom, puissance, prise, marche }]       (appareils mobiles, branchés ou non sur une prise)
//   conducteurs  [{ id, de, vers, role, couleur, section, circuit }]   de borne à borne (« organe.borne »)
//   etat         positions de départ des organes de commande
// Trois bornes sont imposées par l'extérieur : reseau.L (230 V), reseau.N (0 V) et terre.PE (0 V, la prise de terre).
//
// Une panne est un défaut injecté dans ce câblage, décrit en données :
//   { type: "connexion_desserree", conducteur, extremite: "de" | "vers" }   le fil est sorti de sa borne
//   { type: "neutre_coupe_boite", conducteur, extremite }                     idem, sur un neutre dans une boîte
//   { type: "conducteur_coupe", conducteur }
//   { type: "defaut_isolement", organe | appareil }                           fuite de la phase vers la masse
//   { type: "surcharge", branchements: [{ appareil, prise }] }                trop d'appareils sur un circuit
//   { type: "organe_hs", organe }                                             ampoule, interrupteur, disjoncteur
//   { type: "etiquette_fausse", disjoncteur, etiquette }                      le repérage du tableau ment
//
// Simplifications assumées (pédagogiques) : régime permanent, récepteurs résistifs, conducteurs sans résistance ;
// un disjoncteur déclenche dès que le courant dépasse son calibre, un différentiel dès que la fuite atteint sa
// sensibilité. Un point « en l'air » (relié à rien) se lit 0 V, comme sur un multimètre.

export const U = 230;
const R_POLE = 0.001;       // résistance d'un pôle fermé : sert à lire le courant qui le traverse
const R_FUITE = 1500;       // défaut d'isolement : environ 150 mA sous 230 V
const SEUIL_VAT = 50;       // le VAT signale une tension dangereuse à partir de 50 V
const BORNES = {
  interrupteur: ["L", "1"], va_et_vient: ["C", "1", "2"], prise: ["L", "N", "PE"],
  point_lumineux: ["L", "N", "PE"], appareil_fixe: ["L", "N", "PE"],
};
const POLES = ["Lin", "Nin", "Lout", "Nout"];
const DESSERRAGE = new Set(["connexion_desserree", "neutre_coupe_boite"]);

export function creerInstallation(logement, pannes = []) {
  const T = logement.tableau;
  const protections = [{ ...T.agcp, genre: "agcp" }, ...T.differentiels.map((d) => ({ ...d, genre: "differentiel" })), ...T.disjoncteurs.map((d) => ({ ...d, genre: "disjoncteur" }))];
  const organe = Object.fromEntries(logement.organes.map((o) => [o.id, o]));
  const mobile = Object.fromEntries((logement.appareils || []).map((a) => [a.id, a]));
  const conducteur = Object.fromEntries(logement.conducteurs.map((c) => [c.id, c]));

  // toutes les bornes du logement
  const bornesFixes = ["reseau.L", "reseau.N", "terre.PE"];
  for (const p of protections) for (const b of POLES) bornesFixes.push(`${p.id}.${b}`);
  for (const o of logement.organes) for (const b of o.bornes || BORNES[o.type]) bornesFixes.push(`${o.id}.${b}`);
  const connues = new Set(bornesFixes);
  for (const c of logement.conducteurs) for (const b of [c.de, c.vers]) if (!connues.has(b)) throw new Error(`Conducteur ${c.id} : borne inconnue ${b}`);

  function etatInitial() {
    const e = { positions: {}, branche: {}, marche: {}, repare: pannes.map(() => false), declenche: {} };
    for (const p of protections) e.positions[p.id] = true;
    for (const o of logement.organes) {
      if (o.type === "interrupteur") e.positions[o.id] = false;
      if (o.type === "va_et_vient") e.positions[o.id] = 1;
      if (o.type === "appareil_fixe") e.marche[o.id] = o.marche !== false;
    }
    for (const a of logement.appareils || []) { e.branche[a.id] = a.prise || null; e.marche[a.id] = a.marche !== false; }
    Object.assign(e.positions, logement.etat || {});
    // une surcharge, ce sont des appareils branchés en trop : ils le sont à l'arrivée du dépanneur
    pannes.forEach((p) => { if (p.type === "surcharge") for (const b of p.branchements) { e.branche[b.appareil] = b.prise; e.marche[b.appareil] = true; } });
    return e;
  }
  const actives = (e) => pannes.filter((p, i) => !e.repare[i]);
  const etiquette = (e, idDj) => { const p = actives(e).find((x) => x.type === "etiquette_fausse" && x.disjoncteur === idDj); return p ? p.etiquette : T.disjoncteurs.find((d) => d.id === idDj).etiquette; };

  // ---- le réseau électrique dans un état donné : nœuds (bornes reliées entre elles) et éléments résistifs
  function reseau(e, avecPoles = false) {
    const pa = new Map();
    const f = (x) => { let r = x; while (pa.has(r) && pa.get(r) !== r) r = pa.get(r); let y = x; while (pa.has(y) && pa.get(y) !== r) { const n = pa.get(y); pa.set(y, r); y = n; } if (!pa.has(r)) pa.set(r, r); return r; };
    const lier = (a, b) => { const ra = f(a), rb = f(b); if (ra !== rb) pa.set(ra, rb); };
    const act = actives(e), hs = new Set(act.filter((p) => p.type === "organe_hs").map((p) => p.organe));
    const bouts = {};
    for (const c of logement.conducteurs) {
      if (act.some((p) => p.type === "conducteur_coupe" && p.conducteur === c.id)) continue;
      let de = c.de, vers = c.vers;
      for (const p of act) if (DESSERRAGE.has(p.type) && p.conducteur === c.id) {
        const bout = `${c.id}#bout`; bouts[bout] = p.extremite === "de" ? c.de : c.vers;
        if (p.extremite === "de") de = bout; else vers = bout;
      }
      lier(de, vers);
    }
    for (const o of logement.organes) {
      if (hs.has(o.id)) continue;
      if (o.type === "interrupteur" && e.positions[o.id]) lier(`${o.id}.L`, `${o.id}.1`);
      if (o.type === "va_et_vient") lier(`${o.id}.C`, `${o.id}.${e.positions[o.id]}`);
    }
    const R = []; // { a, b, g, pole? }
    for (const p of protections) {
      if (!e.positions[p.id]) continue;
      if (avecPoles) { if (!hs.has(p.id)) lier(`${p.id}.Lin`, `${p.id}.Lout`); lier(`${p.id}.Nin`, `${p.id}.Nout`); continue; }
      if (!hs.has(p.id)) R.push({ a: `${p.id}.Lin`, b: `${p.id}.Lout`, g: 1 / R_POLE, pole: [p.id, "L"] });
      R.push({ a: `${p.id}.Nin`, b: `${p.id}.Nout`, g: 1 / R_POLE, pole: [p.id, "N"] });
    }
    const charge = (b, puissance) => R.push({ a: `${b}.L`, b: `${b}.N`, g: puissance / (U * U) });
    const fuite = (b) => R.push({ a: `${b}.L`, b: `${b}.PE`, g: 1 / R_FUITE });
    for (const o of logement.organes) {
      if (o.type === "point_lumineux" && !hs.has(o.id)) charge(o.id, o.puissance);
      if (o.type === "appareil_fixe" && e.marche[o.id] && !hs.has(o.id)) charge(o.id, o.puissance);
    }
    for (const a of logement.appareils || []) if (e.branche[a.id] && e.marche[a.id]) charge(e.branche[a.id], a.puissance);
    for (const p of act) if (p.type === "defaut_isolement") {
      if (p.organe) fuite(p.organe); else if (e.branche[p.appareil]) fuite(e.branche[p.appareil]);
    }
    return { f, R, bouts };
  }

  // ---- potentiels : loi des nœuds, résolue par élimination de Gauss
  function potentiels(e) {
    const { f, R, bouts } = reseau(e);
    const V = new Map([[f("reseau.L"), U]]);
    for (const b of ["reseau.N", "terre.PE"]) if (!V.has(f(b))) V.set(f(b), 0);
    const voisins = new Map();
    for (const r of R) { const a = f(r.a), b = f(r.b); if (a === b) continue; r.na = a; r.nb = b; (voisins.get(a) || voisins.set(a, []).get(a)).push(r); (voisins.get(b) || voisins.set(b, []).get(b)).push(r); }
    // nœuds inconnus reliés (par des éléments) à un potentiel imposé ; les autres sont « en l'air »
    const inconnus = [], rang = new Map(), file = [...V.keys()], vus = new Set(file);
    while (file.length) {
      const n = file.shift();
      for (const r of voisins.get(n) || []) { const m = r.na === n ? r.nb : r.na; if (!vus.has(m)) { vus.add(m); rang.set(m, inconnus.length); inconnus.push(m); file.push(m); } }
    }
    const n = inconnus.length, A = Array.from({ length: n }, () => new Float64Array(n + 1));
    for (const r of R) {
      if (r.na === undefined || !vus.has(r.na)) continue;
      for (const [x, y] of [[r.na, r.nb], [r.nb, r.na]]) {
        if (!rang.has(x)) continue;
        const i = rang.get(x); A[i][i] += r.g;
        if (rang.has(y)) A[i][rang.get(y)] -= r.g; else A[i][n] += r.g * V.get(y);
      }
    }
    for (let c = 0; c < n; c++) {
      let p = c; for (let l = c + 1; l < n; l++) if (Math.abs(A[l][c]) > Math.abs(A[p][c])) p = l;
      [A[c], A[p]] = [A[p], A[c]];
      const piv = A[c][c]; if (Math.abs(piv) < 1e-12) continue;
      for (let l = 0; l < n; l++) { if (l === c) continue; const k = A[l][c] / piv; if (k) for (let j = c; j <= n; j++) A[l][j] -= k * A[c][j]; }
    }
    inconnus.forEach((m, i) => V.set(m, Math.abs(A[i][i]) < 1e-12 ? 0 : A[i][n] / A[i][i]));
    const courants = {};
    for (const r of R) if (r.pole && r.na !== undefined && V.has(r.na) && V.has(r.nb)) (courants[r.pole[0]] ||= {})[r.pole[1]] = (V.get(r.na) - V.get(r.nb)) * r.g;
    return { de: (b) => V.get(f(b)), courants, bouts };
  }

  // ---- calcul complet : les protections déclenchent, puis on lit l'état (l'état « e » est mis à jour)
  function calculer(e) {
    const declenchements = [];
    for (let tour = 0; tour < 40; tour++) {
      const P = potentiels(e);
      const I = (id) => P.courants[id] || {};
      const fuiteDe = (p) => Math.abs((I(p.id).L || 0) + (I(p.id).N || 0));
      const ouvrir = (p, raison) => { e.positions[p.id] = false; e.declenche[p.id] = raison; declenchements.push({ id: p.id, raison }); };
      const fermes = (genre) => protections.filter((p) => p.genre === genre && e.positions[p.id]);
      // 1. les différentiels 30 mA, les plus rapides
      const diff = fermes("differentiel").find((p) => fuiteDe(p) >= p.sensibilite / 1000);
      if (diff) { ouvrir(diff, "fuite"); continue; }
      // 2. les disjoncteurs divisionnaires : celui qui dépasse le plus son calibre
      const sur = fermes("disjoncteur").map((p) => [Math.abs(I(p.id).L || 0) / p.calibre, p]).filter(([k]) => k > 1).sort((a, b) => b[0] - a[0])[0];
      if (sur) { ouvrir(sur[1], "surintensite"); continue; }
      // 3. le disjoncteur de branchement
      const ag = fermes("agcp")[0];
      if (ag && fuiteDe(ag) >= ag.sensibilite / 1000) { ouvrir(ag, "fuite"); continue; }
      if (ag && Math.abs(I(ag.id).L || 0) > ag.calibre) { ouvrir(ag, "surintensite"); continue; }
      const u = (a, b) => { const va = P.de(a), vb = P.de(b); return va === undefined || vb === undefined ? 0 : Math.abs(va - vb); };
      const alimente = (id) => u(`${id}.L`, `${id}.N`) >= 0.9 * U;
      const act = actives(e), hs = new Set(act.filter((p) => p.type === "organe_hs").map((p) => p.organe));
      return {
        declenchements, potentiel: P.de, bouts: P.bouts,
        tension: (a, b) => Math.round(u(a, b)),
        enLair: (b) => P.de(b) === undefined,
        alimente,
        allume: (id) => organe[id].type === "point_lumineux" && !hs.has(id) && alimente(id),
        fonctionne: (id) => (organe[id] ? e.marche[id] && !hs.has(id) && alimente(id) : !!e.branche[id] && e.marche[id] && alimente(e.branche[id])),
        courant: (idProtection) => Math.abs(I(idProtection).L || 0),
        fuite: (idProtection) => { const p = protections.find((x) => x.id === idProtection); return fuiteDe(p); },
      };
    }
    throw new Error("Le calcul des déclenchements ne se stabilise pas");
  }

  // ---- mesures (toujours calculées, jamais écrites à la main)
  const bornes = (e) => [...bornesFixes, ...Object.keys(reseau(e).bouts)];
  const mesurerTension = (e, a, b) => calculer(e).tension(a, b);
  const vat = (e, a, b) => calculer(e).tension(a, b) >= SEUIL_VAT;
  function continuite(e, a, b) {
    // se mesure hors tension : sous tension, l'appareil signale une tension (et le joueur a fait une faute)
    const c = calculer(e);
    if (c.tension(a, b) >= SEUIL_VAT || c.tension(a, "terre.PE") >= SEUIL_VAT || c.tension(b, "terre.PE") >= SEUIL_VAT) return "tension";
    const { f } = reseau(e, true);
    return f(a) === f(b);
  }

  // ---- actions du joueur
  function agir(e, action) {
    const { type, id } = action;
    if (type === "manoeuvrer") { e.positions[id] = action.position !== undefined ? action.position : !e.positions[id]; if (e.positions[id]) delete e.declenche[id]; }
    else if (type === "basculer") { const o = organe[id]; e.positions[id] = o.type === "va_et_vient" ? (e.positions[id] === 1 ? 2 : 1) : !e.positions[id]; }
    else if (type === "brancher") { e.branche[id] = action.prise; }
    else if (type === "debrancher") { e.branche[id] = null; }
    else if (type === "marche") { e.marche[id] = action.marche !== undefined ? action.marche : !e.marche[id]; }
    else if (type === "reparer") { e.repare[action.panne] = true; const p = pannes[action.panne]; if (p.type === "surcharge") for (const b of p.branchements.slice(1)) e.branche[b.appareil] = null; if (p.type === "defaut_isolement" && p.appareil) e.branche[p.appareil] = null; }
    else throw new Error(`Action inconnue : ${type}`);
    return calculer(e);
  }

  // ---- repères utiles au jeu et au solveur
  const dj = (id) => T.disjoncteurs.find((d) => d.id === id);
  function circuitDe(idOrgane) { return organe[idOrgane] ? organe[idOrgane].circuit : mobile[idOrgane] ? null : null; }
  const disjoncteurDuCircuit = (idCircuit) => T.disjoncteurs.find((d) => d.circuit === idCircuit);
  const points = logement.organes.filter((o) => ["prise", "point_lumineux", "appareil_fixe"].includes(o.type));

  return { logement, pannes, protections, organe, mobile, conducteur, points, bornesFixes, etatInitial, calculer, bornes, mesurerTension, vat, continuite, agir, etiquette, dj, circuitDe, disjoncteurDuCircuit, actives };
}
