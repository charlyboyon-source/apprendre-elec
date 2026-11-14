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
//   { type: "pont", a, b, quand? }                                            deux bornes qui se touchent
//   { type: "connexion_chauffe", disjoncteur }      borne desserrée sur un disjoncteur : il chauffe et déclenche sous son calibre
//   { type: "mauvais_calibre", disjoncteur, calibre } un disjoncteur plus petit que celui prévu pour le circuit
// Un défaut d'isolement peut aussi partir d'une borne quelconque ({ borne }) et dépendre du temps qu'il fait :
// resistance: 1500 ou resistance: { sec: 1e6, pluie: 5000 } (en ohms ; absent = pas de fuite par ce temps-là).
// Un organe hors service peut être « collé » (mode: "colle") : bouton-poussoir enfoncé, contact soudé.
//
// Organes commandés par le temps ou par une bobine (niveaux 2 à 6) :
//   horloge        bornes L, N (moteur) et 1, 2 (contact) ; ferme entre « debut » et « fin » de SON cadran, qui
//                  n'avance que si elle est alimentée (pas de réserve de marche) ; modes auto / I / 0
//   contact_hc     bornes C1, C2 : le contact du compteur, fermé pendant les heures creuses
//   contacteur     bornes A1, A2 (bobine) et 1, 2 (contact) ; modes auto / I / 0
//   bouton_poussoir bornes 1, 2 : fermé tant qu'on appuie
//   minuterie      bornes L, N, B (commande) et S (sortie) ; modes auto / permanent
// Le temps : etat.env = { heure, pluie } ; avancer(etat, minutes) fait tourner les horloges, les minuteries,
// les heures creuses et l'échauffement des disjoncteurs (si logement.thermique est vrai : un disjoncteur en
// surcharge ne déclenche qu'au bout d'un moment, d'autant plus court que la surcharge est forte ; au-delà de
// 10 fois son calibre il déclenche tout de suite).
//
// Simplifications assumées (pédagogiques) : régime permanent, récepteurs résistifs, conducteurs sans résistance ;
// un disjoncteur déclenche dès que le courant dépasse son calibre, un différentiel dès que la fuite atteint sa
// sensibilité. Un point « en l'air » (relié à rien) se lit 0 V, comme sur un multimètre.

export const U = 230;
const R_POLE = 0.001;       // résistance d'un pôle fermé : sert à lire le courant qui le traverse
const R_FUITE = 1500;       // défaut d'isolement : environ 150 mA sous 230 V
const SEUIL_VAT = 50;       // le VAT signale une tension dangereuse à partir de 50 V
const R_FIL = 0.001;        // résistance prêtée à un conducteur quand on veut lire son courant (pince ampèremétrique)
const U_ESSAI = 500;        // tension d'essai du mesureur d'isolement
const MAGNETIQUE = 10;      // déclenchement immédiat à partir de 10 fois le calibre (courbe C : entre 5 et 10 In)
const BORNES = {
  interrupteur: ["L", "1"], va_et_vient: ["C", "1", "2"], prise: ["L", "N", "PE"],
  point_lumineux: ["L", "N", "PE"], appareil_fixe: ["L", "N", "PE"],
  horloge: ["L", "N", "1", "2"], contact_hc: ["C1", "C2"], contacteur: ["A1", "A2", "1", "2"],
  bouton_poussoir: ["1", "2"], minuterie: ["L", "N", "B", "S"],
};
const dansPlage = (h, debut, fin) => (debut <= fin ? h >= debut && h < fin : h >= debut || h < fin);
const POLES = ["Lin", "Nin", "Lout", "Nout"];
const DESSERRAGE = new Set(["connexion_desserree", "neutre_coupe_boite"]);

export function creerInstallation(logement, pannes = []) {
  const T = logement.tableau;
  const protections = [{ ...T.agcp, genre: "agcp" }, ...T.differentiels.map((d) => ({ ...d, genre: "differentiel" })), ...T.disjoncteurs.map((d) => ({ ...d, genre: "disjoncteur" }))];
  const prevus = {};
  for (const p of pannes) if (p.type === "mauvais_calibre") { const x = protections.find((k) => k.id === p.disjoncteur); prevus[x.id] = x.calibre; x.calibre = p.calibre; }
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
    const e = { positions: {}, branche: {}, marche: {}, repare: pannes.map(() => false), declenche: {},
      env: { heure: 12, pluie: false, ...(logement.env || {}) }, deconnecte: {}, modes: {}, cadrans: {}, minuteries: {}, appuis: {}, bobines: {}, chauffe: {}, minutes: 0 };
    for (const p of protections) e.positions[p.id] = true;
    for (const o of logement.organes) {
      if (o.type === "interrupteur") e.positions[o.id] = false;
      if (o.type === "va_et_vient") e.positions[o.id] = 1;
      if (o.type === "appareil_fixe") e.marche[o.id] = o.marche !== false;
      if (o.type === "horloge") { e.modes[o.id] = "auto"; e.cadrans[o.id] = o.cadran !== undefined ? o.cadran : e.env.heure; }
      if (o.type === "contacteur") { e.modes[o.id] = "auto"; e.bobines[o.id] = false; }
      if (o.type === "minuterie") { e.modes[o.id] = o.mode || "auto"; e.minuteries[o.id] = 0; }
    }
    Object.assign(e.modes, logement.modes || {});
    for (const a of logement.appareils || []) { e.branche[a.id] = a.prise || null; e.marche[a.id] = a.marche !== false; }
    Object.assign(e.positions, logement.etat || {});
    // une surcharge, ce sont des appareils branchés en trop : ils le sont à l'arrivée du dépanneur
    pannes.forEach((p) => { if (p.type === "surcharge") for (const b of p.branchements) { e.branche[b.appareil] = b.prise; e.marche[b.appareil] = true; } });
    return e;
  }
  const actives = (e) => pannes.filter((p, i) => !e.repare[i]);
  const etiquette = (e, idDj) => { const p = actives(e).find((x) => x.type === "etiquette_fausse" && x.disjoncteur === idDj); return p ? p.etiquette : T.disjoncteurs.find((d) => d.id === idDj).etiquette; };

  // ---- le réseau électrique dans un état donné : nœuds (bornes reliées entre elles) et éléments résistifs
  const resistanceFuite = (p, e) => { const r = p.resistance === undefined ? R_FUITE : p.resistance; return typeof r === "number" ? r : r[e.env.pluie ? "pluie" : "sec"]; };
  const heuresCreuses = (e) => { const hc = logement.heuresCreuses; return !!hc && dansPlage(e.env.heure, hc[0], hc[1]); };
  function reseau(e, avecPoles = false, detail = false) {
    const pa = new Map();
    const f = (x) => { let r = x; while (pa.has(r) && pa.get(r) !== r) r = pa.get(r); let y = x; while (pa.has(y) && pa.get(y) !== r) { const n = pa.get(y); pa.set(y, r); y = n; } if (!pa.has(r)) pa.set(r, r); return r; };
    const lier = (a, b) => { const ra = f(a), rb = f(b); if (ra !== rb) pa.set(ra, rb); };
    const act = actives(e), hs = new Set(act.filter((p) => p.type === "organe_hs" && p.mode !== "colle").map((p) => p.organe));
    const colle = new Set(act.filter((p) => p.type === "organe_hs" && p.mode === "colle").map((p) => p.organe));
    const bouts = {}, extremites = {};
    const R = []; // { a, b, g, pole?, fil? }
    for (const c of logement.conducteurs) {
      if (act.some((p) => p.type === "conducteur_coupe" && p.conducteur === c.id)) continue;
      let de = c.de, vers = c.vers;
      for (const p of act) if (DESSERRAGE.has(p.type) && p.conducteur === c.id) {
        const bout = `${c.id}#bout`; bouts[bout] = p.extremite === "de" ? c.de : c.vers;
        if (p.extremite === "de") de = bout; else vers = bout;
      }
      // un conducteur débranché par le joueur : son bout est en l'air, de son côté
      for (const ext of ["de", "vers"]) if (e.deconnecte[`${c.id}:${ext}`]) {
        const bout = `${c.id}#${ext}`; bouts[bout] = c[ext];
        if (ext === "de") de = bout; else vers = bout;
      }
      extremites[c.id] = de;
      if (detail) R.push({ a: de, b: vers, g: 1 / R_FIL, fil: c.id }); else lier(de, vers);
    }
    for (const p of act) if (p.type === "pont" && (!p.quand || e.appuis[p.quand])) lier(p.a, p.b);
    for (const o of logement.organes) {
      const ko = hs.has(o.id), soude = colle.has(o.id);
      if (o.type === "interrupteur" && !ko && (e.positions[o.id] || soude)) lier(`${o.id}.L`, `${o.id}.1`);
      if (o.type === "va_et_vient" && !ko) lier(`${o.id}.C`, `${o.id}.${e.positions[o.id]}`);
      if (o.type === "horloge" && !ko && (soude || e.modes[o.id] === "I" || (e.modes[o.id] === "auto" && dansPlage(e.cadrans[o.id], o.debut, o.fin)))) lier(`${o.id}.1`, `${o.id}.2`);
      if (o.type === "contact_hc" && heuresCreuses(e)) lier(`${o.id}.C1`, `${o.id}.C2`);
      if (o.type === "contacteur" && !ko && (soude || e.modes[o.id] === "I" || (e.modes[o.id] === "auto" && e.bobines[o.id]))) lier(`${o.id}.1`, `${o.id}.2`);
      if (o.type === "bouton_poussoir" && !ko && (soude || e.appuis[o.id])) lier(`${o.id}.1`, `${o.id}.2`);
      if (o.type === "minuterie" && !ko && (soude || e.modes[o.id] === "permanent" || e.minuteries[o.id] > 0)) lier(`${o.id}.L`, `${o.id}.S`);
    }
    for (const p of protections) {
      if (!e.positions[p.id]) continue;
      if (avecPoles) { if (!hs.has(p.id)) lier(`${p.id}.Lin`, `${p.id}.Lout`); lier(`${p.id}.Nin`, `${p.id}.Nout`); continue; }
      if (!hs.has(p.id)) R.push({ a: `${p.id}.Lin`, b: `${p.id}.Lout`, g: 1 / R_POLE, pole: [p.id, "L"] });
      R.push({ a: `${p.id}.Nin`, b: `${p.id}.Nout`, g: 1 / R_POLE, pole: [p.id, "N"] });
    }
    const charge = (b, puissance, n = "N", l = "L") => R.push({ a: `${b}.${l}`, b: `${b}.${n}`, g: puissance / (U * U) });
    const fuite = (a, b, r) => { if (r) R.push({ a, b, g: 1 / r, fuite: true }); };
    for (const o of logement.organes) {
      if (o.type === "point_lumineux" && !hs.has(o.id)) charge(o.id, o.puissance);
      if (o.type === "appareil_fixe" && e.marche[o.id] && !hs.has(o.id)) charge(o.id, o.puissance);
      if (o.type === "horloge" || o.type === "minuterie") charge(o.id, 2);
      if (o.type === "contacteur") charge(o.id, 5, "A2", "A1");
    }
    for (const a of logement.appareils || []) if (e.branche[a.id] && e.marche[a.id]) charge(e.branche[a.id], a.puissance);
    for (const p of act) if (p.type === "defaut_isolement") {
      const r = resistanceFuite(p, e);
      if (p.borne) fuite(p.borne, "terre.PE", r);
      else if (p.conducteur) { if (extremites[p.conducteur]) fuite(extremites[p.conducteur], "terre.PE", r); }
      else if (p.organe) fuite(`${p.organe}.L`, `${p.organe}.PE`, r);
      else if (e.branche[p.appareil]) fuite(`${e.branche[p.appareil]}.L`, `${e.branche[p.appareil]}.PE`, r);
    }
    return { f, R, bouts };
  }

  // ---- loi des nœuds, résolue par élimination de Gauss. V : potentiels imposés (nœud → volts), complétés au retour.
  function resoudre(R, f, V) {
    const voisins = new Map();
    for (const r of R) { const a = f(r.a), b = f(r.b); r.na = a; r.nb = b; if (a === b) continue; (voisins.get(a) || voisins.set(a, []).get(a)).push(r); (voisins.get(b) || voisins.set(b, []).get(b)).push(r); }
    // nœuds inconnus reliés (par des éléments) à un potentiel imposé ; les autres sont « en l'air »
    const inconnus = [], rang = new Map(), file = [...V.keys()], vus = new Set(file);
    while (file.length) {
      const n = file.shift();
      for (const r of voisins.get(n) || []) { const m = r.na === n ? r.nb : r.na; if (!vus.has(m)) { vus.add(m); rang.set(m, inconnus.length); inconnus.push(m); file.push(m); } }
    }
    const n = inconnus.length, A = Array.from({ length: n }, () => new Float64Array(n + 1));
    for (const r of R) {
      if (r.na === r.nb || !vus.has(r.na)) continue;
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
    return V;
  }
  function potentiels(e, detail = false) {
    const { f, R, bouts } = reseau(e, false, detail);
    const V = new Map([[f("reseau.L"), U]]);
    for (const b of ["reseau.N", "terre.PE"]) if (!V.has(f(b))) V.set(f(b), 0);
    resoudre(R, f, V);
    const courants = {}, fils = {};
    for (const r of R) {
      if (r.na === r.nb || !V.has(r.na) || !V.has(r.nb)) continue;
      const i = (V.get(r.na) - V.get(r.nb)) * r.g;
      if (r.pole) (courants[r.pole[0]] ||= {})[r.pole[1]] = i;
      if (r.fil) fils[r.fil] = i;
    }
    return { de: (b) => V.get(f(b)), courants, bouts, fils };
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
      const sur = fermes("disjoncteur").map((p) => [Math.abs(I(p.id).L || 0) / p.calibre, p]).filter(([k]) => k > (logement.thermique ? MAGNETIQUE : 1)).sort((a, b) => b[0] - a[0])[0];
      if (sur) { ouvrir(sur[1], sur[0] >= MAGNETIQUE ? "court-circuit" : "surintensite"); continue; }
      const cuit = logement.thermique && fermes("disjoncteur").find((p) => (e.chauffe[p.id] || 0) >= 1);
      if (cuit) { e.chauffe[cuit.id] = 0; ouvrir(cuit, "surintensite"); continue; }
      // 3. le disjoncteur de branchement
      const ag = fermes("agcp")[0];
      if (ag && fuiteDe(ag) >= ag.sensibilite / 1000) { ouvrir(ag, "fuite"); continue; }
      if (ag && Math.abs(I(ag.id).L || 0) > ag.calibre) { ouvrir(ag, "surintensite"); continue; }
      const u = (a, b) => { const va = P.de(a), vb = P.de(b); return va === undefined || vb === undefined ? 0 : Math.abs(va - vb); };
      const alimente = (id) => u(`${id}.L`, `${id}.N`) >= 0.9 * U;
      // 4. bobines et minuteries : leur état dépend des tensions, qui dépendent d'elles ; on recalcule si l'une change
      let change = false;
      for (const o of logement.organes) {
        if (o.type === "contacteur") { const b = u(`${o.id}.A1`, `${o.id}.A2`) >= 0.9 * U; if (b !== e.bobines[o.id]) { e.bobines[o.id] = b; if (e.modes[o.id] === "auto") change = true; } }
        if (o.type === "minuterie" && alimente(o.id) && u(`${o.id}.B`, `${o.id}.N`) >= 0.9 * U && e.minuteries[o.id] < o.duree) { const avant = e.minuteries[o.id]; e.minuteries[o.id] = o.duree; if (avant <= 0) change = true; }
      }
      if (change) continue;
      const act = actives(e), hs = new Set(act.filter((p) => p.type === "organe_hs").map((p) => p.organe));
      return {
        declenchements, potentiel: P.de, bouts: P.bouts,
        tension: (a, b) => Math.round(u(a, b)),
        enLair: (b) => P.de(b) === undefined,
        alimente,
        allume: (id) => organe[id].type === "point_lumineux" && !hs.has(id) && alimente(id),
        fonctionne: (id) => (organe[id] ? e.marche[id] && !hs.has(id) && alimente(id) : !!e.branche[id] && e.marche[id] && alimente(e.branche[id])),
        courant: (idProtection) => Math.abs(I(idProtection).L || 0),
        surcharge: (idProtection) => Math.abs(I(idProtection).L || 0) / protections.find((x) => x.id === idProtection).calibre,
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

  // résistance d'isolement entre deux points, hors tension (mesureur d'isolement). Rend "tension" si c'est sous tension,
  // sinon des ohms (Infinity si rien ne relie les deux points). La source du réseau et la terre ne font qu'un pour l'essai.
  function isolement(e, a, b) {
    const c = calculer(e);
    if (c.tension(a, b) >= SEUIL_VAT || c.tension(a, "terre.PE") >= SEUIL_VAT || c.tension(b, "terre.PE") >= SEUIL_VAT) return "tension";
    const { f, R } = reseau(e);
    const masse = new Set(["reseau.L", "reseau.N", "terre.PE"].map(f)), g = (x) => (masse.has(f(x)) ? "#masse" : f(x));
    if (g(a) === g(b)) return 0;
    const V = resoudre(R, g, new Map([[g(a), U_ESSAI], [g(b), 0]]));
    let i = 0;
    for (const r of R) { if (r.na === r.nb) continue; const [x, y] = r.na === g(a) ? [r.na, r.nb] : r.nb === g(a) ? [r.nb, r.na] : [null]; if (x && V.has(y)) i += (U_ESSAI - V.get(y)) * r.g; }
    return i < 1e-9 ? Infinity : U_ESSAI / i;
  }
  // courant dans un conducteur (pince ampèremétrique autour de CE conducteur), en ampères
  const courantConducteur = (e, id) => { calculer(e); return Math.abs(potentiels(e, true).fils[id] || 0); };
  // le temps passe : horloges (si elles sont alimentées), minuteries, heures creuses, échauffement des disjoncteurs
  function avancer(e, minutes) {
    const evenements = [];
    let reste = minutes;
    while (reste > 1e-9) {
      const dt = Math.min(1, reste); reste -= dt;
      const r = calculer(e);
      for (const o of logement.organes) {
        if (o.type === "horloge" && r.alimente(o.id)) e.cadrans[o.id] = (e.cadrans[o.id] + dt / 60) % 24;
        if (o.type === "minuterie" && e.minuteries[o.id] > 0) e.minuteries[o.id] = Math.max(0, e.minuteries[o.id] - dt);
      }
      if (logement.thermique) for (const p of protections) if (p.genre === "disjoncteur") {
        const k = (e.positions[p.id] ? r.surcharge(p.id) : 0) * (actives(e).some((x) => x.type === "connexion_chauffe" && x.disjoncteur === p.id) ? 1.6 : 1);
        e.chauffe[p.id] = k > 1 ? (e.chauffe[p.id] || 0) + dt * (k * k - 1) / 30 : Math.max(0, (e.chauffe[p.id] || 0) - dt / 20);
      }
      e.env.heure = (e.env.heure + dt / 60) % 24; e.minutes += dt;
      for (const d of calculer(e).declenchements) evenements.push({ ...d, heure: e.env.heure });
    }
    return evenements;
  }

  // ---- actions du joueur
  function agir(e, action) {
    const { type, id } = action;
    if (type === "manoeuvrer") { e.positions[id] = action.position !== undefined ? action.position : !e.positions[id]; if (e.positions[id]) delete e.declenche[id]; }
    else if (type === "basculer") { const o = organe[id]; e.positions[id] = o.type === "va_et_vient" ? (e.positions[id] === 1 ? 2 : 1) : !e.positions[id]; }
    else if (type === "brancher") { e.branche[id] = action.prise; }
    else if (type === "debrancher") { e.branche[id] = null; }
    else if (type === "marche") { e.marche[id] = action.marche !== undefined ? action.marche : !e.marche[id]; }
    else if (type === "mode") { e.modes[id] = action.mode; }
    else if (type === "appuyer") { e.appuis[id] = action.appui !== undefined ? action.appui : true; if (organe[id] && organe[id].type === "bouton_poussoir") { calculer(e); e.appuis[id] = false; } }
    else if (type === "debrancher_fil") { e.deconnecte[`${action.conducteur}:${action.extremite}`] = true; }
    else if (type === "rebrancher_fil") { delete e.deconnecte[`${action.conducteur}:${action.extremite}`]; }
    else if (type === "regler_horloge") { e.cadrans[id] = action.heure !== undefined ? action.heure : e.env.heure; }
    else if (type === "meteo") { Object.assign(e.env, action.env); }
    // bouton « test » d'un appareil différentiel : il crée une fuite interne. L'appareil ne déclenche que s'il est fermé et alimenté.
    else if (type === "test") {
      const p = protections.find((k) => k.id === id), r0 = calculer(e);
      if (!p || !p.sensibilite || !e.positions[id] || r0.tension(`${id}.Lin`, `${id}.Nin`) < SEUIL_VAT) return Object.assign(r0, { testSansEffet: true });
      e.positions[id] = false; e.declenche[id] = "test";
      const r = calculer(e); r.declenchements.unshift({ id, raison: "test" }); return r;
    }
    else if (type === "reparer") { e.repare[action.panne] = true; const p = pannes[action.panne]; if (p.type === "mauvais_calibre") protections.find((k) => k.id === p.disjoncteur).calibre = prevus[p.disjoncteur]; if (p.type === "surcharge") for (const b of p.branchements.slice(1)) e.branche[b.appareil] = null; if (p.type === "defaut_isolement" && p.appareil) e.branche[p.appareil] = null; }
    else throw new Error(`Action inconnue : ${type}`);
    return calculer(e);
  }

  // ---- repères utiles au jeu et au solveur
  const dj = (id) => T.disjoncteurs.find((d) => d.id === id);
  function circuitDe(idOrgane) { return organe[idOrgane] ? organe[idOrgane].circuit : mobile[idOrgane] ? null : null; }
  const disjoncteurDuCircuit = (idCircuit) => T.disjoncteurs.find((d) => d.circuit === idCircuit);
  const points = logement.organes.filter((o) => ["prise", "point_lumineux", "appareil_fixe"].includes(o.type));

  return { logement, pannes, protections, organe, mobile, conducteur, points, bornesFixes, etatInitial, calculer, bornes, mesurerTension, vat, continuite, isolement, courantConducteur, avancer, heuresCreuses, agir, etiquette, dj, circuitDe, disjoncteurDuCircuit, actives };
}
