// Tests automatiques du moteur d'installation.   Lancer :   node atelier/3d/moteur/tests.mjs
import { creerInstallation, U } from "./moteur.js";
import { prouver, table } from "./solveur.js";
import { studio, pannesStudio, reperes } from "./logements/studio.js";
import { appartement90, pannesAppartement, reperesAppartement } from "./logements/appartement90.js";

let reussis = 0; const echecs = [];
function cas(nom, f) { try { const r = f(); if (r === false) throw new Error("condition fausse"); reussis++; } catch (err) { echecs.push(`${nom} : ${err.message}`); } }
const egal = (a, b, quoi = "") => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${quoi} attendu ${JSON.stringify(b)}, obtenu ${JSON.stringify(a)}`); };
const vrai = (x, quoi = "") => { if (!x) throw new Error(quoi || "faux"); };
const LOGEMENTS = [[studio, pannesStudio], [appartement90, pannesAppartement]];
const tout = (inst, e) => { for (const o of inst.logement.organes) if (o.type === "interrupteur") e.positions[o.id] = true; return inst.calculer(e); };

for (const [L, PANNES] of LOGEMENTS) {
  const T = L.tableau, nom = L.nom;
  const sain = () => { const inst = creerInstallation(L); return [inst, inst.etatInitial()]; };

  // ---- données
  cas(`${nom} : le logement n'est que des données (copiable en JSON)`, () => egal(JSON.parse(JSON.stringify(L)), L));
  cas(`${nom} : couleurs des conducteurs`, () => { const C = { phase: "rouge", neutre: "bleu", terre: "vert-jaune", retour: "orange", navette: "violet" }; for (const c of L.conducteurs) egal(c.couleur, C[c.role], c.id); });
  cas(`${nom} : la commande coupe la phase, jamais le neutre`, () => { for (const c of L.conducteurs) for (const b of [c.de, c.vers]) { const o = L.organes.find((x) => x.id === b.split(".")[0]); if (o && (o.type === "interrupteur" || o.type === "va_et_vient")) vrai(c.role !== "neutre" && c.role !== "terre", c.id); } });

  // ---- valeurs des modules 10 à 14
  cas(`${nom} : sections et calibres par usage`, () => {
    for (const q of T.disjoncteurs) {
      const c = L.circuits.find((x) => x.id === q.circuit);
      if (c.usage === "eclairage") { egal(c.section, 1.5, c.id); vrai(q.calibre <= 16, c.id); }
      else if (c.id === "plaque") { egal(c.section, 6); egal(q.calibre, 32); }
      else if (c.id === "vmc") { egal(c.section, 1.5); egal(q.calibre, 2); }
      else { egal(c.section, 2.5, c.id); egal(q.calibre, 20, c.id); }
      for (const f of L.conducteurs.filter((x) => x.circuit === c.id)) egal(f.section, c.section, f.id);
    }
  });
  cas(`${nom} : 8 points lumineux au plus par circuit d'éclairage, 12 prises au plus en 2,5 mm²`, () => {
    for (const c of L.circuits) {
      const o = L.organes.filter((x) => x.circuit === c.id);
      if (c.usage === "eclairage") vrai(o.filter((x) => x.type === "point_lumineux" || x.commandee).length <= 8, c.id);
      if (c.usage === "prises") vrai(o.filter((x) => x.type === "prise").length <= 12, c.id);
    }
  });
  cas(`${nom} : au moins deux DDR 30 mA, plaque et lave-linge sous un type A`, () => {
    vrai(T.differentiels.length >= 2 && T.differentiels.every((d) => d.sensibilite === 30));
    for (const id of ["plaque", "ll"]) egal(T.differentiels.find((d) => d.id === T.disjoncteurs.find((q) => q.circuit === id).differentiel).type, "A", id);
  });
  cas(`${nom} : éclairage et prises répartis sous au moins deux DDR, deux circuits d'éclairage`, () => {
    for (const u of ["eclairage", "prises"]) vrai(new Set(T.disjoncteurs.filter((q) => L.circuits.find((c) => c.id === q.circuit).usage === u).map((q) => q.differentiel)).size >= 2, u);
    vrai(L.circuits.filter((c) => c.usage === "eclairage").length >= 2);
  });
  cas(`${nom} : 8 disjoncteurs au plus par différentiel, calibre par la méthode aval`, () => {
    for (const d of T.differentiels) {
      const qs = T.disjoncteurs.filter((q) => q.differentiel === d.id); vrai(qs.length <= 8, d.id);
      const besoin = qs.reduce((s, q) => s + (q.circuit === "ce" ? q.calibre : q.calibre / 2), 0);
      vrai(d.calibre >= besoin, `${d.id} : ${besoin} A`);
    }
  });
  cas(`${nom} : au moins 4 circuits spécialisés, dont la plaque`, () => vrai(L.circuits.some((c) => c.id === "plaque") && L.circuits.filter((c) => c.usage === "specialise" && c.section === 2.5).length >= 3));

  // ---- logement sain
  cas(`${nom} : sain, rien ne déclenche et tout s'allume`, () => { const [i, e] = sain(); const r = tout(i, e); egal(r.declenchements, []); for (const o of L.organes) if (o.type === "point_lumineux") vrai(r.allume(o.id), o.id); });
  cas(`${nom} : sain, 230 V sur chaque prise, 0 V entre neutre et terre`, () => { const [i, e] = sain(); const r = tout(i, e); for (const o of L.organes) if (o.type === "prise") { egal(r.tension(`${o.id}.L`, `${o.id}.N`), 230, o.id); egal(r.tension(`${o.id}.L`, `${o.id}.PE`), 230, o.id); egal(r.tension(`${o.id}.N`, `${o.id}.PE`), 0, o.id); } });
  cas(`${nom} : interrupteur ouvert, la lampe est éteinte`, () => { const [i, e] = sain(); const r = i.calculer(e); for (const o of L.organes) if (o.type === "point_lumineux" && L.organes.some((x) => x.type === "interrupteur" && L.conducteurs.some((c) => c.de === `${x.id}.1` && c.vers === `${o.id}.L`))) vrai(!r.allume(o.id), o.id); });

  // ---- chaque disjoncteur coupe exactement les points de son circuit, dans toutes les pièces
  for (const q of T.disjoncteurs) cas(`${nom} : ${q.id} coupe son circuit (${q.circuit}) et lui seul`, () => {
    const [i, e] = sain(); tout(i, e); const r = i.agir(e, { type: "manoeuvrer", id: q.id, position: false });
    for (const o of i.points) egal(r.alimente(o.id), o.circuit !== q.circuit, o.id);
  });
  for (const d of T.differentiels) cas(`${nom} : ${d.id} coupe tous les circuits placés derrière lui`, () => {
    const [i, e] = sain(); tout(i, e); const r = i.agir(e, { type: "manoeuvrer", id: d.id, position: false });
    const derriere = new Set(T.disjoncteurs.filter((q) => q.differentiel === d.id).map((q) => q.circuit));
    for (const o of i.points) egal(r.alimente(o.id), !derriere.has(o.circuit), o.id);
  });
  cas(`${nom} : AGCP baissé, plus rien n'est alimenté`, () => { const [i, e] = sain(); tout(i, e); const r = i.agir(e, { type: "manoeuvrer", id: T.agcp.id, position: false }); for (const o of i.points) vrai(!r.alimente(o.id), o.id); });
  cas(`${nom} : la terre n'est jamais coupée`, () => { const [i, e] = sain(); const r = i.agir(e, { type: "manoeuvrer", id: T.agcp.id, position: false }); for (const o of i.points) vrai(i.continuite(e, `${o.id}.PE`, "terre.PE") === true, o.id); vrai(r); });

  // ---- mesures
  cas(`${nom} : continuité refusée sous tension`, () => { const [i, e] = sain(); const p = L.organes.find((o) => o.type === "prise" && !o.commandee); egal(i.continuite(e, `${p.id}.L`, `${p.id}.N`), "tension"); });
  cas(`${nom} : VAT allumé sur une prise, éteint disjoncteur baissé`, () => { const [i, e] = sain(); const p = L.organes.find((o) => o.type === "prise" && !o.commandee); vrai(i.vat(e, `${p.id}.L`, `${p.id}.N`)); i.agir(e, { type: "manoeuvrer", id: T.disjoncteurs.find((q) => q.circuit === p.circuit).id, position: false }); vrai(!i.vat(e, `${p.id}.L`, `${p.id}.N`) && !i.vat(e, `${p.id}.L`, `${p.id}.PE`)); });

  // ---- chaque type de panne : effets calculés
  cas(`${nom} : neutre coupé en boîte, tout l'aval est privé, phase présente`, () => {
    const p = PANNES.neutreCoupeBoite, i = creerInstallation(L, [p]), e = i.etatInitial(), r = tout(i, e), c = i.conducteur[p.conducteur];
    const aval = L.organes.filter((o) => o.type === "point_lumineux" && o.circuit === c.circuit).filter((o) => !r.allume(o.id));
    vrai(aval.length >= 2, "au moins deux points éteints");
    for (const o of aval) { egal(r.tension(`${o.id}.L`, `${o.id}.N`), 0, o.id); egal(r.tension(`${o.id}.L`, `${o.id}.PE`), 230, o.id); egal(r.tension(`${o.id}.N`, `${o.id}.PE`), 230, o.id); }
    egal(r.declenchements, []);
  });
  cas(`${nom} : défaut d'isolement, le bon différentiel déclenche et lui seul`, () => {
    const p = PANNES.lavelingeEnDefaut || PANNES.chauffeEauEnDefaut, i = creerInstallation(L, [p]), e = i.etatInitial(), r = i.calculer(e);
    const prise = p.appareil ? L.appareils.find((a) => a.id === p.appareil).prise : p.organe, q = T.disjoncteurs.find((x) => x.circuit === i.organe[prise].circuit);
    egal(r.declenchements, [{ id: q.differentiel, raison: "fuite" }]);
    vrai(e.positions[T.agcp.id] && T.differentiels.filter((d) => d.id !== q.differentiel).every((d) => e.positions[d.id]));
  });
  cas(`${nom} : défaut d'isolement, le différentiel retombe tant que le circuit en défaut est fermé`, () => {
    const p = PANNES.lavelingeEnDefaut || PANNES.chauffeEauEnDefaut, i = creerInstallation(L, [p]), e = i.etatInitial(); i.calculer(e);
    const prise = p.appareil ? L.appareils.find((a) => a.id === p.appareil).prise : p.organe, q = T.disjoncteurs.find((x) => x.circuit === i.organe[prise].circuit);
    i.agir(e, { type: "manoeuvrer", id: q.differentiel, position: true }); vrai(!e.positions[q.differentiel], "il retombe");
    i.agir(e, { type: "manoeuvrer", id: q.id, position: false }); i.agir(e, { type: "manoeuvrer", id: q.differentiel, position: true }); vrai(e.positions[q.differentiel], "il tient, circuit en défaut ouvert");
  });
  cas(`${nom} : surcharge, le bon disjoncteur déclenche et lui seul`, () => {
    const p = PANNES.surchargeChambre || PANNES.surchargeChambres, i = creerInstallation(L, [p]), e = i.etatInitial(), r = i.calculer(e);
    const q = T.disjoncteurs.find((x) => x.circuit === i.organe[p.branchements[0].prise].circuit);
    egal(r.declenchements, [{ id: q.id, raison: "surintensite" }]);
    i.agir(e, { type: "reparer", panne: 0 }); const r2 = i.agir(e, { type: "manoeuvrer", id: q.id, position: true }); vrai(e.positions[q.id] && r2.courant(q.id) <= q.calibre, "il tient avec un seul radiateur");
  });
  cas(`${nom} : un seul radiateur ne fait pas déclencher`, () => { const [i, e] = sain(); const pr = L.organes.find((o) => o.type === "prise" && L.circuits.find((c) => c.id === o.circuit).usage === "prises"); i.agir(e, { type: "brancher", id: "radiateur1", prise: pr.id }); const r = i.calculer(e); egal(r.declenchements, []); vrai(r.fonctionne("radiateur1")); });
  cas(`${nom} : conducteur coupé, les prises en aval sont mortes, celles en amont alimentées`, () => {
    const p = PANNES.conducteurCoupe, i = creerInstallation(L, [p]), e = i.etatInitial(), r = i.calculer(e), c = i.conducteur[p.conducteur];
    egal(r.tension(c.de, "terre.PE"), 230); egal(r.tension(c.vers, "terre.PE"), 0);
    i.agir(e, { type: "manoeuvrer", id: T.disjoncteurs.find((q) => q.circuit === c.circuit).id, position: false }); egal(i.continuite(e, c.de, c.vers), false, "continuité");
  });
  cas(`${nom} : ampoule hors service, 230 V à ses bornes et pas de lumière`, () => { const p = PANNES.ampouleGrillee, i = creerInstallation(L, [p]), e = i.etatInitial(); for (const o of L.organes) if (o.type === "va_et_vient") e.positions[o.id] = 1; const r = tout(i, e); egal(r.tension(`${p.organe}.L`, `${p.organe}.N`), 230); vrai(!r.allume(p.organe)); });
  cas(`${nom} : organe de commande hors service, la phase arrive mais ne ressort pas`, () => {
    const p = PANNES.interrupteurUse || PANNES.vaEtVientUse, i = creerInstallation(L, [p]), e = i.etatInitial(), r = tout(i, e), o = i.organe[p.organe];
    const lampe = L.organes.filter((x) => x.type === "point_lumineux" && x.circuit === o.circuit).find((x) => !r.allume(x.id)); vrai(lampe, "une lampe reste éteinte");
    egal(r.tension(`${lampe.id}.L`, "terre.PE"), 0);
  });
  cas(`${nom} : disjoncteur hors service, manette levée mais rien en sortie`, () => { const p = PANNES.disjoncteurFatigue, i = creerInstallation(L, [p]), e = i.etatInitial(), r = i.calculer(e); vrai(e.positions[p.organe]); egal(r.tension(`${p.organe}.Lin`, "terre.PE"), 230); egal(r.tension(`${p.organe}.Lout`, "terre.PE"), 0); });
  cas(`${nom} : étiquette fausse, l'étiquette lue n'est pas la vraie`, () => { const p = PANNES.etiquetteFausse, i = creerInstallation(L, [p]), e = i.etatInitial(); egal(i.etiquette(e, p.disjoncteur), p.etiquette); i.agir(e, { type: "reparer", panne: 0 }); egal(i.etiquette(e, p.disjoncteur), T.disjoncteurs.find((q) => q.id === p.disjoncteur).etiquette); });

  // ---- solveur : chaque panne est trouvable, réparable hors tension, sans état bloquant
  for (const [cle, p] of Object.entries(PANNES)) cas(`${nom} : solveur, ${p.titre}`, () => { const r = prouver(L, p); vrai(r.ok, r.raisons.join(" ; ")); });
  cas(`${nom} : aucune panne possible ne ressemble au logement sain ni à une panne d'un autre endroit`, () => {
    const t = table(L), par = new Map();
    for (const l of t.lignes) { vrai(l.sig !== t.sain, `invisible : ${l.lieu}`); (par.get(l.sig) || par.set(l.sig, new Set()).get(l.sig)).add(l.lieu); }
    for (const v of par.values()) vrai(v.size === 1, `confondues : ${[...v].join(", ")}`);
  });
}

// ---- propres à l'appartement : va-et-vient et prise commandée
cas("Appartement : va-et-vient, table de vérité complète", () => {
  const i = creerInstallation(appartement90), e = i.etatInitial();
  for (const a of [1, 2]) for (const b of [1, 2]) { e.positions.vv_couloir1 = a; e.positions.vv_couloir2 = b; egal(i.calculer(e).allume("pl_couloir"), a === b, `${a}${b}`); }
});
cas("Appartement : la prise commandée suit son interrupteur, neutre et terre toujours présents", () => {
  const i = creerInstallation(appartement90), e = i.etatInitial(); let r = i.calculer(e);
  egal(r.tension("pc_sejour_cmd.L", "pc_sejour_cmd.N"), 0); vrai(!r.fonctionne("lampadaire"));
  r = i.agir(e, { type: "basculer", id: "int_sejour_cmd" }); egal(r.tension("pc_sejour_cmd.L", "pc_sejour_cmd.N"), 230); vrai(r.fonctionne("lampadaire"));
});
cas("Appartement : neutre coupé dans la boîte du couloir, le couloir marche encore, séjour et cuisine non", () => {
  const i = creerInstallation(appartement90, [pannesAppartement.neutreCoupeBoite]), e = i.etatInitial(), r = tout(i, e);
  vrai(r.allume("pl_entree") && r.allume("pl_couloir") && !r.allume("pl_sejour") && !r.allume("pl_cuisine"));
});
cas("Appartement : navette desserrée, le va-et-vient ne marche que dans une position sur deux", () => {
  const i = creerInstallation(appartement90, [pannesAppartement.navetteDesserree]), e = i.etatInitial(), etats = [];
  for (const a of [1, 2]) for (const b of [1, 2]) { e.positions.vv_couloir1 = a; e.positions.vv_couloir2 = b; etats.push(i.calculer(e).allume("pl_couloir")); }
  egal(etats, [false, false, false, true]);
});

// ---- le moteur redonne exactement les mesures du niveau 1 en ligne (ancien modèle : atelier/immersif/moteur.js)
{
  const { modele } = await import("../../immersif/moteur.js");
  const S = (await import("../scenario.js")).default;
  const bout = `${reperes.phaseInterChambre}#bout`;
  const borne = (id, repare) => ({ "int-E": "int_chambre.L", "int-S": "int_chambre.1", "fil-rouge": repare ? "int_chambre.L" : bout, "prise-terre": "pc_chambre1.PE", "prise-d": "pc_chambre1.L", "prise-g": "pc_chambre1.N" }[id]);
  const ids = Object.keys(S.points);
  let compares = 0;
  cas("Niveau 1 : mêmes tensions, même plafonnier, dans tous les états du tableau et de l'interrupteur", () => {
    for (let m = 0; m < 32; m++) {
      const [diff, dj, d2, inter, repare] = [0, 1, 2, 3, 4].map((k) => !!(m & (1 << k)));
      const ancien = { panne: S.pannes[0], repare, app: { inter, ampouleMontee: true, diff, dj, d2, d3: true, d4: true, diff2: true, d5: true, d6: true, d7: true, d8: true } };
      const A = modele(S, ancien);
      const inst = creerInstallation(studio, [pannesStudio.phaseDesserreeInter]), e = inst.etatInitial();
      Object.assign(e.positions, { ID1: diff, Q1: dj, Q2: d2, int_chambre: inter }); e.repare[0] = repare;
      const r = inst.calculer(e);
      egal(r.allume("pl_chambre"), A.alimente("DclL", "DclN"), `plafonnier, état ${m}`);
      for (const a of ids) for (const b of ids) { egal(r.tension(borne(a, repare), borne(b, repare)), A.tension(S.points[a].noeud, S.points[b].noeud), `${a} ↔ ${b}, état ${m}`); compares++; }
    }
  });
  cas("Niveau 1 : les mesures du guide (0 V sur la borne L, 230 V sur le fil rouge, puis 0 V disjoncteur baissé)", () => {
    const inst = creerInstallation(studio, [pannesStudio.phaseDesserreeInter]), e = inst.etatInitial();
    inst.agir(e, { type: "basculer", id: "int_chambre" });
    egal(inst.mesurerTension(e, "pc_chambre1.PE", "int_chambre.L"), 0); egal(inst.mesurerTension(e, "pc_chambre1.PE", bout), 230);
    vrai(inst.vat(e, "pc_chambre1.N", "pc_chambre1.L"), "VAT testé sur la prise");
    inst.agir(e, { type: "manoeuvrer", id: "Q1", position: false });
    vrai(!inst.vat(e, bout, "pc_chambre1.PE"), "absence de tension sur le fil rouge"); vrai(inst.vat(e, "pc_chambre1.N", "pc_chambre1.L"), "VAT retesté");
    inst.agir(e, { type: "reparer", panne: 0 }); inst.agir(e, { type: "manoeuvrer", id: "Q1", position: true });
    vrai(inst.calculer(e).allume("pl_chambre"), "la lumière revient");
  });
  console.log(`Niveau 1 : ${compares} mesures comparées à l'ancien modèle.`);
}

{ const { testsEtape0 } = await import("./tests-etape0.mjs"); testsEtape0(cas, egal, vrai); }
{ const { testsNiveaux } = await import("../niveau/tests-niveaux.mjs"); testsNiveaux(cas, egal, vrai); }

console.log(`${reussis} cas réussis, ${echecs.length} échec(s).`);
for (const x of echecs) console.log("  ✗ " + x);
process.exit(echecs.length ? 1 : 0);
