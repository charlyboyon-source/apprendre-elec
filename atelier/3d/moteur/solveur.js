// Solveur de l'atelier dépannage : pour un logement et une panne, il prouve trois choses.
//  1. TROUVABLE : en essayant (interrupteurs), en coupant (disjoncteurs), en débranchant et en mesurant toutes les
//     bornes, le joueur obtient des observations que seule cette panne explique. On compare la panne à toutes les
//     pannes possibles du logement (les « hypothèses ») : celles qui donnent exactement les mêmes observations
//     doivent se trouver au même endroit (le même conducteur, le même organe), où un coup d'œil ou un essai de
//     continuité les départage.
//  2. RÉPARABLE : il existe une coupure au tableau qui met l'endroit hors tension (vérifiable au VAT, avec une
//     source connue pour le tester avant et après) ; après réparation et réarmement, le logement se comporte
//     exactement comme le logement sain.
//  3. SANS BLOCAGE : dans tous les états que le joueur peut atteindre (manœuvres, déclenchements, réparation),
//     il reste un chemin vers « réparé, tout réarmé ».
import { creerInstallation } from "./moteur.js";

const COMMANDES = new Set(["interrupteur", "va_et_vient"]);

// ---- toutes les pannes possibles d'un logement, avec l'endroit où elles se trouvent
export function lieuDe(logement, p) {
  if (p.conducteur && p.type !== "defaut_isolement") return `conducteur:${p.conducteur}`;
  if (p.type === "organe_hs") return `organe:${p.organe}`;
  if (p.type === "defaut_isolement") return `appareil:${p.organe || p.appareil}`;
  if (p.type === "surcharge") return `surcharge:${logement.organes.find((o) => o.id === p.branchements[0].prise).circuit}`;
  if (p.type === "etiquette_fausse") return `etiquette:${p.disjoncteur}`;
  return "?";
}
export function hypotheses(logement) {
  const H = [];
  for (const c of logement.conducteurs) H.push({ type: "connexion_desserree", conducteur: c.id, extremite: "de" }, { type: "connexion_desserree", conducteur: c.id, extremite: "vers" }, { type: "conducteur_coupe", conducteur: c.id });
  for (const o of logement.organes) {
    if (o.type === "point_lumineux" || COMMANDES.has(o.type)) H.push({ type: "organe_hs", organe: o.id });
    if (o.type === "appareil_fixe") H.push({ type: "defaut_isolement", organe: o.id });
  }
  for (const q of logement.tableau.disjoncteurs) H.push({ type: "organe_hs", organe: q.id });
  for (const a of logement.appareils) if (a.prise) H.push({ type: "defaut_isolement", appareil: a.id });
  const radiateurs = logement.appareils.filter((a) => !a.prise && a.puissance >= 2000).map((a) => a.id);
  if (radiateurs.length >= 2) for (const c of logement.circuits.filter((x) => x.usage === "prises")) {
    const pr = logement.organes.filter((o) => o.type === "prise" && o.circuit === c.id);
    if (pr.length >= 2) H.push({ type: "surcharge", branchements: [{ appareil: radiateurs[0], prise: pr[0].id }, { appareil: radiateurs[1], prise: pr[1].id }] });
  }
  return H;
}

// ---- les situations dans lesquelles le joueur observe le logement
export function situations(logement) {
  const S = [{ nom: "à l'arrivée", actions: [] }];
  const T = logement.tableau;
  for (const o of logement.organes) if (COMMANDES.has(o.type)) S.push({ nom: `${o.id} actionné`, actions: [{ type: "basculer", id: o.id }] });
  S.push({ nom: "tout allumé", actions: logement.organes.filter((o) => o.type === "interrupteur").map((o) => ({ type: "basculer", id: o.id })) });
  for (const q of T.disjoncteurs) S.push({ nom: `${q.id} coupé`, actions: [{ type: "manoeuvrer", id: q.id, position: false }] });
  // recherche par sectionnement : un seul disjoncteur fermé derrière son différentiel, que l'on réarme
  for (const q of T.disjoncteurs) S.push({ nom: `${q.id} seul sous ${q.differentiel}`, actions: T.disjoncteurs.filter((x) => x.differentiel === q.differentiel && x.id !== q.id).map((x) => ({ type: "manoeuvrer", id: x.id, position: false })) });
  for (const a of logement.appareils) if (a.prise) S.push({ nom: `${a.id} débranché`, actions: [{ type: "debrancher", id: a.id }] });
  return S;
}
const classe = (v) => (v === undefined ? "f" : String(Math.round(v / 10) * 10));
// ce que le joueur constate dans une situation : appareils déclenchés, lampes, tension de chaque borne
export function observation(inst, actions, extra = []) {
  const e = inst.etatInitial();
  for (const a of [...extra, ...actions]) inst.agir(e, a);
  // un appareil qui a déclenché se réarme une fois : s'il retombe, le défaut est toujours là
  for (const p of inst.protections) if (!e.positions[p.id] && e.declenche[p.id]) { inst.agir(e, { type: "manoeuvrer", id: p.id, position: true }); }
  const r = inst.calculer(e);
  const ouverts = inst.protections.filter((p) => !e.positions[p.id]).map((p) => p.id).join(",");
  const lampes = inst.logement.organes.filter((o) => o.type === "point_lumineux").map((o) => (r.allume(o.id) ? 1 : 0)).join("");
  return `${ouverts}/${lampes}/${inst.bornesFixes.map((b) => classe(r.potentiel(b))).join(" ")}`;
}
export function signature(logement, pannes, S = situations(logement)) {
  const inst = creerInstallation(logement, pannes);
  return S.map((s) => observation(inst, s.actions)).join("|");
}

// ---- table des signatures d'un logement (calculée une fois, réutilisée pour toutes ses pannes)
const tables = new Map();
export function table(logement) {
  if (tables.has(logement.id)) return tables.get(logement.id);
  const S = situations(logement), t = { S, sain: signature(logement, [], S), lignes: [] };
  for (const h of hypotheses(logement)) t.lignes.push({ panne: h, lieu: lieuDe(logement, h), sig: signature(logement, [h], S) });
  tables.set(logement.id, t);
  return t;
}

// ---- les bornes de l'endroit à réparer, et la coupure qui les met hors tension
function bornesDuLieu(inst, p) {
  const L = inst.logement;
  if (p.conducteur) { const c = inst.conducteur[p.conducteur]; return [c.de, c.vers, ...(p.extremite ? [`${c.id}#bout`] : [])]; }
  const id = p.organe || (p.appareil && L.appareils.find((a) => a.id === p.appareil).prise);
  if (!id) return [];
  const q = L.tableau.disjoncteurs.find((d) => d.id === id);
  if (q) return ["Lin", "Nin", "Lout", "Nout"].map((b) => `${id}.${b}`);
  const o = inst.organe[id], noms = o.bornes || { interrupteur: ["L", "1"], va_et_vient: ["C", "1", "2"] }[o.type] || ["L", "N", "PE"];
  return noms.map((b) => `${id}.${b}`);
}
function coupuresPossibles(inst, p) {
  const L = inst.logement, T = L.tableau;
  const idCircuit = p.conducteur ? inst.conducteur[p.conducteur].circuit : p.organe && inst.organe[p.organe] ? inst.organe[p.organe].circuit
    : p.appareil ? inst.organe[L.appareils.find((a) => a.id === p.appareil).prise].circuit : null;
  const q = T.disjoncteurs.find((d) => d.circuit === idCircuit) || T.disjoncteurs.find((d) => d.id === p.organe);
  return [...(q && q.id !== p.organe ? [q.id] : []), ...(q ? [q.differentiel] : []), T.agcp.id];
}

export function prouver(logement, panne) {
  const t = table(logement), lieu = lieuDe(logement, panne), inst = creerInstallation(logement, [panne]);
  const res = { lieu, trouvable: false, confondues: [], reparable: false, coupure: null, source: null, sansBlocage: false, etats: 0, raisons: [] };

  // 1. trouvable
  if (panne.type === "etiquette_fausse") {
    // l'étiquette ment : en coupant ce disjoncteur, ce qui s'éteint n'est pas ce que l'étiquette annonce
    const q = logement.tableau.disjoncteurs.find((d) => d.id === panne.disjoncteur);
    const annonce = logement.tableau.disjoncteurs.find((d) => d.etiquette === panne.etiquette && d.id !== q.id);
    const e = inst.etatInitial(); inst.agir(e, { type: "manoeuvrer", id: q.id, position: false }); const r = inst.calculer(e);
    const eteints = inst.points.filter((o) => !r.alimente(o.id) && o.type === "prise" && !o.commandee).map((o) => o.id);
    const annonces = annonce ? inst.points.filter((o) => o.circuit === annonce.circuit).map((o) => o.id) : [];
    res.trouvable = eteints.length > 0 && !eteints.some((id) => annonces.includes(id));
    if (!res.trouvable) res.raisons.push("couper le disjoncteur ne contredit pas son étiquette");
  } else {
    const sig = signature(logement, [panne], t.S);
    if (sig === t.sain) res.raisons.push("aucune observation ne distingue cette panne du logement sain");
    res.confondues = [...new Set(t.lignes.filter((l) => l.sig === sig && l.lieu !== lieu).map((l) => l.lieu))];
    if (res.confondues.length) res.raisons.push(`mêmes observations que : ${res.confondues.join(", ")}`);
    res.trouvable = sig !== t.sain && res.confondues.length === 0;
  }

  // 2. réparable, hors tension
  const bornes = bornesDuLieu(inst, panne);
  if (panne.type === "surcharge" || panne.type === "etiquette_fausse" || (panne.type === "defaut_isolement" && panne.appareil)) res.coupure = "aucune (on débranche ou on corrige le repérage)";
  else for (const id of coupuresPossibles(inst, panne)) {
    const e = inst.etatInitial(); inst.agir(e, { type: "manoeuvrer", id, position: false }); const r = inst.calculer(e);
    const morte = bornes.every((b) => r.tension(b, "terre.PE") < 50 && bornes.every((b2) => r.tension(b, b2) < 50));
    if (!morte) continue;
    const prise = inst.points.find((o) => o.type === "prise" && !o.commandee && r.tension(`${o.id}.L`, `${o.id}.N`) >= 207);
    res.coupure = id; res.source = prise ? prise.id : "bornes amont du disjoncteur de branchement";
    break;
  }
  if (!res.coupure) res.raisons.push("aucune coupure ne met l'endroit hors tension");
  {
    const e = inst.etatInitial(); inst.agir(e, { type: "reparer", panne: 0 });
    for (const p of inst.protections) inst.agir(e, { type: "manoeuvrer", id: p.id, position: true });
    const r = inst.calculer(e);
    const sain = creerInstallation(logement, []), es = sain.etatInitial(), rs = sain.calculer(es);
    const pareil = r.declenchements.length === 0 && inst.bornesFixes.every((b) => classe(r.potentiel(b)) === classe(rs.potentiel(b)));
    res.reparable = !!res.coupure && pareil;
    if (!pareil) res.raisons.push("après réparation, le logement ne se comporte pas comme le logement sain");
  }

  // 3. sans blocage : parcours de tous les états atteignables avec les organes concernés par la panne
  {
    const T = logement.tableau;
    const idCircuit = panne.conducteur ? inst.conducteur[panne.conducteur].circuit : panne.type === "surcharge" ? lieu.split(":")[1]
      : (inst.organe[panne.organe] || {}).circuit || (panne.appareil ? inst.organe[logement.appareils.find((a) => a.id === panne.appareil).prise].circuit : null);
    const q = T.disjoncteurs.find((d) => d.circuit === idCircuit) || T.disjoncteurs.find((d) => d.id === (panne.organe || panne.disjoncteur)) || T.disjoncteurs[0];
    const prot = [T.agcp.id, q.differentiel, q.id];
    const cmd = logement.organes.filter((o) => COMMANDES.has(o.type) && o.circuit === q.circuit).slice(0, 4).map((o) => o.id);
    const actions = [...prot.map((id) => ({ type: "manoeuvrer", id })), ...cmd.map((id) => ({ type: "basculer", id })), { type: "reparer", panne: 0 }];
    const cle = (e) => [...prot, ...cmd].map((id) => +e.positions[id]).join("") + (e.repare[0] ? "R" : "-");
    const but = (e) => e.repare[0] && prot.every((id) => e.positions[id]);
    const copie = (e) => structuredClone(e);
    const e0 = inst.etatInitial(); inst.calculer(e0);
    const vus = new Map([[cle(e0), e0]]), file = [e0], arcs = new Map(), buts = new Set();
    while (file.length) {
      const e = file.shift(), k = cle(e);
      if (but(e)) buts.add(k);
      for (const a of actions) {
        if (a.type === "reparer" && e.repare[0]) continue;
        const n = copie(e); inst.agir(n, a); const kn = cle(n);
        (arcs.get(kn) || arcs.set(kn, []).get(kn)).push(k);
        if (!vus.has(kn)) { vus.set(kn, n); file.push(n); }
      }
    }
    const ok = new Set(buts), pile = [...buts];
    while (pile.length) for (const k of arcs.get(pile.pop()) || []) if (!ok.has(k)) { ok.add(k); pile.push(k); }
    res.etats = vus.size; res.sansBlocage = buts.size > 0 && ok.size === vus.size;
    if (!res.sansBlocage) res.raisons.push(`${vus.size - ok.size} état(s) sans issue sur ${vus.size}`);
  }
  res.ok = res.trouvable && res.reparable && res.sansBlocage;
  return res;
}
