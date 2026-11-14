// Joueur automatique des niveaux 2 à 6 : il ne se sert que de ce qu'un joueur voit (messages, valeurs mesurées),
// jamais de la cause tirée.   Lancé par ../moteur/tests.mjs
import { creerPartie } from "./coeur.js";
import N2 from "./niveau2.js";
import N3 from "./niveau3.js";
import N4 from "./niveau4.js";

function jouerNiveau2(cause) {
  const P = creerPartie(N2, cause), F = N2.fils, A = (a) => P.action(a).retour;
  const iso = (a, b = "bt.PE") => A({ type: "mesurer", outil: "iso", a, b }), bas = (id) => A({ type: "manette", id, position: false }), haut = (id) => A({ type: "manette", id, position: true });
  const faible = (r) => r !== "tension" && r < 5e7;
  const consigner = (q, borne, terre) => { bas(q); A({ type: "mesurer", outil: "vat", a: "pc_sejour1.L", b: "pc_sejour1.N" }); A({ type: "mesurer", outil: "vat", a: borne, b: terre }); A({ type: "mesurer", outil: "vat", a: "pc_sejour1.L", b: "pc_sejour1.N" }); };
  for (const q of ["quoi", "heure", "pluie", "travaux"]) A({ type: "question", id: q });
  A({ type: "regarder", id: "horloge" });
  let diag = null;
  // 1. de jour : isolement des deux circuits qui démarrent la nuit, en aval de l'horloge et du contacteur
  bas("Q8"); const allee = iso("horloge.2");
  consigner("Q9", "sc_ce.ph", "sc_ce.pe"); A({ type: "ouvrir", id: "sc_ce" }); const ce = iso("sc_ce.ph", "sc_ce.pe");
  if (faible(ce)) {
    A({ type: "debrancher", conducteur: F.cordonCe.phase, extremite: "de" });
    if (!faible(iso("sc_ce.ph", "sc_ce.pe")) && faible(iso(`${F.cordonCe.phase}#de`, "sc_ce.pe"))) diag = "D";
  } else {
    haut("Q9");
    if (!faible(allee)) { // rien de jour : revenir quand ça saute, et chercher le circuit par élimination
      haut("Q8"); A({ type: "revenir_ce_soir" }); A({ type: "regler_horloge", id: "horloge" });
      for (let k = 0; k < 8 && P.e.positions.ID2; k++) A({ type: "attendre", minutes: 15 });
      if (P.e.positions.ID2) return { P, diag: "rien ne saute" };
      const rangee = ["Q6", "Q7", "Q8", "Q9", "Q10"]; rangee.forEach(bas); haut("ID2");
      const coupables = rangee.filter((q) => { haut(q); if (P.e.positions.ID2) return false; bas(q); haut("ID2"); return true; });
      if (coupables.join() !== "Q8") return { P, diag: `circuit ${coupables}` };
    }
    // 2. couper le circuit de l'allée en deux, à la boîte du pied de mur, puis borne par borne
    consigner("Q8", "bd_mur.ph", "bd_mur.pe"); A({ type: "ouvrir", id: "bd_mur" });
    A({ type: "debrancher", conducteur: F.enterre.phase, extremite: "de" });
    if (faible(iso("bd_mur.ph", "bd_mur.pe"))) diag = "A";
    else if (faible(iso(`${F.enterre.phase}#de`, "bd_mur.pe"))) {
      A({ type: "ouvrir", id: "borne1" }); A({ type: "debrancher", conducteur: F.b12.phase, extremite: "de" });
      if (faible(iso(`${F.enterre.phase}#de`, "bd_mur.pe"))) diag = "C";
      else if (faible(iso(`${F.b12.phase}#de`, "borne1.PE"))) { A({ type: "ouvrir", id: "borne2" }); diag = "B"; }
    }
  }
  if (diag) { A({ type: "diagnostic", id: diag }); A({ type: "securiser", id: { A: "boite", B: "presse", C: "hs_allee", D: "hs_ce" }[diag] }); }
  return { P, diag };
}

function jouerNiveau3(cause) {
  const P = creerPartie(N3, cause), F = N3.fils, A = (a) => P.action(a).retour, U = (a, b) => A({ type: "mesurer", outil: "multi", a, b });
  for (const q of ["quand", "saute", "sdb", "tableau"]) A({ type: "question", id: q });
  // faire le tour : chaque lumière, chaque prise ; puis la vraie carte du tableau
  for (const o of N3.logement.organes) if (o.type === "interrupteur" && !P.e.positions[o.id]) A({ type: "essayer", id: o.id });
  for (const o of N3.logement.organes) if (o.type === "prise") A({ type: "essayer", id: o.id });
  for (const q of N3.logement.tableau.disjoncteurs) { A({ type: "manette", id: q.id, position: false }); A({ type: "manette", id: q.id, position: true }); }
  const consigner = () => { A({ type: "manette", id: "Q5", position: false }); A({ type: "mesurer", outil: "vat", a: "pc_sejour1.L", b: "pc_sejour1.N" }); };
  const lpe = U("pc_entree.L", "pc_entree.PE"); U("pc_entree.L", "pc_entree.N"); U("pc_entree.N", "pc_entree.PE");
  let diag = null;
  if (lpe < 50) {
    if (U("Q5.Lout", "bt.PE") < 50) { if (U("ID2.Lout", "bt.PE") >= 50) diag = "C"; }
    else { consigner(); A({ type: "ouvrir", id: "bd_plafond" }); A({ type: "mesurer", outil: "vat", a: "bd_plafond.ph", b: "bd_plafond.pe" }); if (A({ type: "regarder", id: `fil:${F.repiquage.phase}:vers` })) diag = "B"; }
  } else {
    consigner(); A({ type: "ouvrir", id: "bd_plafond" }); A({ type: "mesurer", outil: "vat", a: "bd_plafond.ph", b: "bd_plafond.pe" });
    if (A({ type: "regarder", id: `fil:${F.repiquage.neutre}:vers` })) diag = "A";
    else { vraiOuFaux(A({ type: "mesurer", outil: "ohm", a: "bd_plafond.n", b: "bd_sdb.n" }) === false); A({ type: "ouvrir", id: "bd_sdb" }); if (A({ type: "regarder", id: `fil:${F.repiquage.neutre}:de` })) diag = "D"; }
  }
  if (diag) { A({ type: "diagnostic", id: diag }); A({ type: "securiser", id: { A: "boite", B: "boite", C: "disj", D: "sdb" }[diag] }); A({ type: "etiqueter", choix: { Q4: "a", Q5: "b" } }); }
  return { P, diag };
}
function vraiOuFaux(x) { if (!x) throw new Error("la continuité aurait dû être coupée entre les deux boîtes"); }

function jouerNiveau4(cause) {
  const P = creerPartie(N4, cause), A = (a) => P.action(a).retour;
  const comment = A({ type: "question", id: "comment" }); A({ type: "question", id: "depuis" });
  for (const l of ["entree", "escalier", "palier", "chambre2"]) A({ type: "deplacer", lieu: l });
  const soir = A({ type: "question", id: "soir" });
  const lu = A({ type: "regarder", id: "Q6" });
  for (const id of ["radiateur2", "radiateur3", "ordinateur", ...(/repasse/.test(soir) ? ["fer"] : [])]) A({ type: "essayer", id });
  let diag = null;
  if (/D'un coup/.test(comment)) { if (A({ type: "geste", id: "lit" }) && A({ type: "regarder", id: "rallonge" })) diag = "C"; }
  else {
    const i = A({ type: "mesurer", outil: "pince", a: "Q6.Lout", b: null }); egalite(A({ type: "mesurer", outil: "pince", a: "Q6.cable", b: null }), 0);
    let saute = false; for (let k = 0; k < 8 && !saute; k++) { A({ type: "attendre", minutes: 15 }); saute = !P.e.positions.Q6; }
    if (saute) diag = lu.calibre < 20 ? "D" : i > lu.calibre ? "A" : lu.bruni ? "B" : null;
  }
  if (diag) { A({ type: "diagnostic", id: diag }); A({ type: "securiser", id: { A: "repartir", B: "identique", C: "rallonge", D: "calibre" }[diag] }); }
  return { P, diag };
}
function egalite(a, b) { if (a !== b) throw new Error(`attendu ${b}, obtenu ${a}`); }

export function testsNiveaux(cas, egal, vrai) {
  for (const cause of ["A", "B", "C", "D"]) cas(`Niveau 4, cause ${cause} : le joueur automatique questionne, reproduit la soirée, mesure, trouve et règle`, () => {
    const { P, diag } = jouerNiveau4(cause);
    egal(diag, cause, "diagnostic"); vrai(P.fini, "partie finie"); vrai(!!P.bilan.preuve, "preuve"); egal(P.fautes, [], "fautes"); egal(P.bilan.etoiles, 3, "étoiles");
  });
  cas("Niveau 4 : à l'arrivée, le disjoncteur est en haut et tout marche", () => { for (const c of ["A", "B", "C", "D"]) { const P = creerPartie(N4, c); egal(P.calc().declenchements, []); vrai(P.e.positions.Q6 && P.calc().alimente("pc_chambre2a"), c); } });
  cas("Niveau 4 : pince, le courant du soir vaut le total des plaques divisé par 230 V", () => {
    for (const c of ["A", "B"]) { const P = creerPartie(N4, c); let w = 10; for (const id of N4.soiree[c]) { P.action({ type: "essayer", id }); w += P.inst.mobile[id].puissance; } const i = P.action({ type: "mesurer", outil: "pince", a: "Q6.Lout", b: null }).retour; vrai(Math.abs(i - w / 230) < 0.2, `${i} A pour ${w} W`); }
  });
  cas("Niveau 4 : surcharge, plus elle est forte, plus le disjoncteur déclenche vite ; court-circuit, tout de suite", () => {
    const duree = (c) => { const P = creerPartie(N4, c); for (const id of N4.soiree[c]) P.action({ type: "essayer", id }); for (let m = 1; m <= 240; m++) { P.inst.avancer(P.e, 1); if (!P.e.positions.Q6) return m; } return Infinity; };
    const a = duree("A"), d = duree("D"), b = duree("B"); vrai(a > 5 && a < 120 && d < a && b < 240, `A ${a} min, D ${d} min, B ${b} min`);
    const P = creerPartie(N4, "C"); for (const id of N4.soiree.C) P.action({ type: "essayer", id }); egal(P.inst.avancer(P.e, 120), [], "la charge seule ne fait rien"); vrai(P.action({ type: "geste", id: "lit" }).retour, "le lit fait sauter"); vrai(P.vus.has("cc:Q6"));
  });
  cas("Niveau 4 : sans défaut, la soirée ordinaire (deux radiateurs et l'ordinateur) tient", () => { const P = creerPartie(N4, "A"); for (const id of ["radiateur2", "radiateur3", "ordinateur"]) P.action({ type: "essayer", id }); egal(P.inst.avancer(P.e, 240), []); });
  cas("Niveau 4 : accepter de « mettre plus gros » est l'erreur grave, et ne termine pas la partie", () => {
    const P = creerPartie(N4, "A"); P.action({ type: "diagnostic", id: "A" }); const r = P.action({ type: "securiser", id: "gros" }); vrai(!r.retour && !P.fini); egal(P.fautes.length, 1); vrai(/32 A/.test(P.fautes[0]));
    vrai(!P.action({ type: "securiser", id: "identique" }).retour, "changer le disjoncteur ne règle pas une surcharge"); vrai(P.action({ type: "securiser", id: "repartir" }).retour && P.fini); vrai(P.bilan.etoiles <= 1);
  });
  cas("Niveau 4 : la question qui trie n'apparaît pas toute seule, et celle des adolescents demande de monter", () => { const P = creerPartie(N4, "A"); vrai(!N4.questions.find((q) => q.id === "soir").si(P)); P.action({ type: "deplacer", lieu: "palier" }); vrai(N4.questions.find((q) => q.id === "soir").si(P)); });
  cas("Niveau 4 : les indices ne donnent jamais la cause", () => { for (const c of ["A", "B", "C", "D"]) { const P = creerPartie(N4, c); for (const t of N4.indices(P)) vrai(!/rallonge écrasée|borne desserrée|10 A|fer à repasser/.test(t), t); } });

  for (const cause of ["A", "B", "C", "D"]) cas(`Niveau 3, cause ${cause} : le joueur automatique repère, trouve, prouve, répare et refait les étiquettes`, () => {
    const { P, diag } = jouerNiveau3(cause);
    egal(diag, cause, "diagnostic"); vrai(P.fini && P.etiquettesFaites, "partie finie"); vrai(!!P.bilan.preuve, "preuve"); egal(P.fautes, [], "fautes"); egal(P.bilan.etoiles, 3, "étoiles");
  });
  cas("Niveau 3 : symptôme commun, couloir, chambre 2 et prise de l'entrée morts, rien n'a sauté", () => { for (const c of ["A", "B", "C", "D"]) { const P = creerPartie(N3, c), r = P.calc(); egal(r.declenchements, []); vrai(!r.allume("pl_couloir") && !r.alimente("pc_entree"), c); P.e.positions.int_sdb = true; egal(P.calc().allume("pl_sdb"), c !== "C", `salle de bain ${c}`); vrai(N3.logement.tableau.disjoncteurs.every((q) => P.e.positions[q.id])); } });
  cas("Niveau 3 : neutre coupé, 0 V entre phase et neutre mais 230 V entre le bleu et la terre, et le jeu l'explique", () => {
    for (const c of ["A", "D"]) { const P = creerPartie(N3, c); egal(P.action({ type: "mesurer", outil: "multi", a: "pc_entree.L", b: "pc_entree.N" }).retour, 0); const r = P.action({ type: "mesurer", outil: "multi", a: "pc_entree.N", b: "pc_entree.PE" }); egal(r.retour, 230); vrai(r.messages.some((m) => /neutre est coupé/.test(m.t)), "explication"); vrai(P.carnet.indices.length === 1); }
  });
  cas("Niveau 3 : le carnet établit la vraie carte, différente des étiquettes", () => {
    const P = creerPartie(N3, "A"); P.action({ type: "essayer", id: "int_sdb" }); P.action({ type: "essayer", id: "int_chambre1" });
    P.action({ type: "manette", id: "Q5", position: false }); vrai(P.carnet.tableau.some((t) => t.includes("Lumière chambres") && t.includes("salle de bain")), P.carnet.tableau.join(" / "));
    P.action({ type: "manette", id: "Q5", position: true }); P.action({ type: "manette", id: "Q4", position: false }); vrai(P.carnet.tableau.some((t) => t.includes("Lumière séjour") && t.includes("chambre 1")), P.carnet.tableau.join(" / "));
  });
  cas("Niveau 3 : changer l'ampoule du couloir ne sert à rien, et c'est noté", () => { const P = creerPartie(N3, "B"); vrai(!P.action({ type: "essayer", id: "pl_couloir" }).retour); vrai(P.carnet.constats.some((t) => t.includes("ampoule neuve"))); });
  cas("Niveau 3 : la continuité se mesure hors tension", () => { const P = creerPartie(N3, "D"); egal(P.action({ type: "mesurer", outil: "ohm", a: "pc_entree.L", b: "pc_entree.N" }).retour, "tension"); egal(P.fautes.length, 1); });
  cas("Niveau 3 : mauvaises étiquettes, mauvais remèdes : la partie ne se termine pas", () => {
    const P = creerPartie(N3, "A"); P.action({ type: "diagnostic", id: "A" }); vrai(!P.action({ type: "securiser", id: "pont" }).retour); vrai(!P.action({ type: "securiser", id: "sdb" }).retour, "mauvais endroit");
    vrai(P.action({ type: "securiser", id: "boite" }).retour && !P.fini); vrai(!P.action({ type: "etiqueter", choix: { Q4: "b", Q5: "b" } }).retour && !P.fini); vrai(P.action({ type: "etiqueter", choix: { Q4: "a", Q5: "b" } }).retour && P.fini);
  });
  cas("Niveau 3 : les indices ne donnent jamais la cause", () => { for (const c of ["A", "B", "C", "D"]) { const P = creerPartie(N3, c); for (const t of N3.indices(P)) vrai(!/sorti de son connecteur|bruni|hors service|desserré/.test(t), t); } });

  cas("Niveau 2 : le bouton test fait déclencher pour de vrai chaque interrupteur différentiel et le disjoncteur de branchement", () => {
    const P = creerPartie(N2, "A");
    for (const id of ["ID1", "ID2", "AGCP"]) {
      vrai(P.action({ type: "test", id }).retour, `${id} : le test déclenche`); vrai(!P.e.positions[id], `${id} ouvert`);
      vrai(!P.action({ type: "test", id }).retour, `${id} déjà ouvert : sans effet`); P.action({ type: "manette", id, position: true }); vrai(P.e.positions[id], `${id} réarmé`);
    }
    P.action({ type: "manette", id: "AGCP", position: false }); vrai(!P.action({ type: "test", id: "ID1" }).retour, "sans tension, le bouton test ne fait rien"); vrai(P.e.positions.ID1, "ID1 reste fermé");
  });
  cas("Niveau 2 : chaque disjoncteur coupe exactement son circuit, et le décor branché en dépend", () => {
    const P = creerPartie(N2, "A"), A = (a) => P.action(a);
    for (const i of ["int_entree", "int_sejour", "int_cuisine", "int_cellier", "lampadaire", "lampe_appoint", "bouilloire", "cafetiere", "micro_ondes"]) A({ type: "essayer", id: i });
    A({ type: "mode", id: "horloge", mode: "I" }); A({ type: "mode", id: "kc", mode: "I" }); P.inst.agir(P.e, { type: "marche", id: "lavelinge", marche: true });
    const vis = () => { const r = P.calc(), v = {}; for (const p of P.inst.points) v[p.id] = p.type === "prise" ? r.alimente(p.id) : p.type === "point_lumineux" ? r.allume(p.id) : r.fonctionne(p.id); for (const a of N2.logement.appareils) v[a.id] = r.fonctionne(a.id); return v; };
    vrai(Object.entries(vis()).every(([k, x]) => x || k === "plaque"), `tout marche au départ : ${Object.entries(vis()).filter(([, x]) => !x).map(([k]) => k)}`);
    // tout allumer en même temps, plaque comprise, dépasse le calibre du disjoncteur de branchement (45 A) : il déclenche
    A({ type: "essayer", id: "plaque" }); vrai(!P.e.positions.AGCP, "le disjoncteur de branchement déclenche en surcharge"); for (const i of ["bouilloire", "cafetiere", "micro_ondes"]) A({ type: "essayer", id: i }); P.inst.agir(P.e, { type: "marche", id: "lavelinge", marche: false }); A({ type: "mode", id: "kc", mode: "0" }); A({ type: "manette", id: "AGCP", position: true });
    vrai(P.e.positions.AGCP && P.calc().fonctionne("plaque"), "plaque en marche, gros appareils arrêtés");
    { const av = vis(); A({ type: "manette", id: "Q1", position: false }); const ap = vis(); egal(Object.keys(av).filter((k) => av[k] && !ap[k]), ["plaque"], "Q1 coupe"); A({ type: "manette", id: "Q1", position: true }); A({ type: "essayer", id: "plaque" }); for (const i of ["bouilloire", "cafetiere", "micro_ondes"]) A({ type: "essayer", id: i }); P.inst.agir(P.e, { type: "marche", id: "lavelinge", marche: true }); A({ type: "mode", id: "kc", mode: "I" }); }
    const attendu = { Q2: ["pc_lavelinge", "lavelinge"], Q3: ["pc_cuisine1", "pc_cuisine2", "pc_cuisine3", "pc_cuisine4", "bouilloire", "cafetiere", "micro_ondes", "refrigerateur"], Q4: ["pc_sejour1", "pc_sejour2", "pc_entree", "television", "lampadaire", "lampe_appoint"],
      Q5: ["pl_entree", "pl_sejour", "pl_cuisine", "pl_cellier"], Q6: ["pc_congelateur", "pc_cellier", "congelateur"], Q7: ["pc_terrasse"], Q8: ["borne1", "borne2", "borne3"], Q9: ["chauffe_eau"], Q10: [] };
    for (const [q, liste] of Object.entries(attendu)) {
      const av = vis(); A({ type: "manette", id: q, position: false }); const ap = vis();
      egal(Object.keys(av).filter((k) => av[k] && !ap[k]).sort(), [...liste].sort(), `${q} coupe`); A({ type: "manette", id: q, position: true }); egal(vis(), av, `${q} remonté`);
    }
    // la commande heures creuses : en automatique, à 23 h 30, elle met le chauffe-eau en marche ; son disjoncteur l'arrête
    A({ type: "mode", id: "kc", mode: "auto" }); vrai(!P.calc().fonctionne("chauffe_eau"), "de jour, en auto : arrêt"); P.e.env.heure = 23.5; vrai(P.calc().fonctionne("chauffe_eau"), "heures creuses : marche");
    A({ type: "manette", id: "Q10", position: false }); vrai(!P.calc().fonctionne("chauffe_eau"), "Q10 baissé : arrêt"); A({ type: "mode", id: "kc", mode: "0" }); A({ type: "manette", id: "Q10", position: true }); vrai(!P.calc().fonctionne("chauffe_eau"), "sélecteur sur 0 : arrêt");
  });
  for (const cause of ["A", "B", "C", "D"]) cas(`Niveau 2, cause ${cause} : le joueur automatique trouve, prouve et sécurise`, () => {
    const { P, diag } = jouerNiveau2(cause);
    egal(diag, cause, "diagnostic"); vrai(P.fini && P.securise, "partie finie"); vrai(P.preuves.length > 0, "preuve par une mesure");
    egal(P.fautes, [], "fautes de sécurité"); egal(P.bilan.etoiles, 3, "étoiles");
  });
  cas("Niveau 2 : à l'arrivée, de jour, tout fonctionne quelle que soit la cause", () => { for (const c of ["A", "B", "C", "D"]) { const P = creerPartie(N2, c); egal(P.calc().declenchements, []); vrai(P.action({ type: "essayer", id: "pc_congelateur" }).retour && P.action({ type: "essayer", id: "congelateur" }).retour, c); } });
  cas("Niveau 2 : l'horloge donne l'heure de la coupure (19 h pour l'allée, 23 h pour le chauffe-eau)", () => { for (const [c, h] of [["A", 19], ["B", 19], ["C", 19], ["D", 23]]) { const P = creerPartie(N2, c); const cadran = P.action({ type: "regarder", id: "horloge" }).retour; egal((7 - (16 - cadran) + 24) % 24, h, c); vrai(P.carnet.indices.length === 1, "noté au carnet"); } });
  cas("Niveau 2 : un mauvais diagnostic ou un mauvais remède ne termine pas la partie", () => {
    const P = creerPartie(N2, "C"); vrai(!P.action({ type: "diagnostic", id: "congelateur" }).retour); egal(P.mauvaisDiagnostics, 1);
    P.action({ type: "diagnostic", id: "C" }); vrai(!P.action({ type: "securiser", id: "moins_sensible" }).retour && !P.fini); vrai(!P.action({ type: "securiser", id: "presse" }).retour && !P.fini);
    vrai(P.action({ type: "securiser", id: "hs_allee" }).retour && P.fini); egal(P.bilan.etoiles, 1, "sans preuve, avec erreurs");
  });
  cas("Niveau 2 : ouvrir ou débrancher sous tension est noté comme une faute, sans bloquer", () => {
    const P = creerPartie(N2, "A"); P.action({ type: "mode", id: "horloge", mode: "I" }); P.action({ type: "ouvrir", id: "bd_mur" }); egal(P.fautes.length, 1);
    vrai(P.action({ type: "debrancher", conducteur: N2.fils.enterre.phase, extremite: "de" }).retour === false); egal(P.fautes.length, 2);
    egal(P.action({ type: "mesurer", outil: "iso", a: "bd_mur.ph", b: "bd_mur.pe" }).retour, "tension"); egal(P.fautes.length, 3);
  });
  cas("Niveau 2 : une mesure sur tout le circuit ne prouve rien ; il faut isoler le tronçon", () => { const P = creerPartie(N2, "C"); P.action({ type: "manette", id: "Q8", position: false }); P.action({ type: "mesurer", outil: "iso", a: "horloge.2", b: "bt.PE" }); egal(P.preuves, []); });
  cas("Niveau 2 : le carnet note ce que chaque disjoncteur coupe, et le client réagit pour son congélateur", () => {
    const P = creerPartie(N2, "B"); P.action({ type: "manette", id: "Q6", position: false }); vrai(P.carnet.tableau.some((t) => t.includes("Prises cellier") && t.includes("congélateur")), P.carnet.tableau.join());
    const m = []; for (let k = 0; k < 8; k++) m.push(...P.action({ type: "attendre", minutes: 15 }).messages); vrai(m.some((x) => x.type === "client"), "reproche"); vrai(P.conseils.length === 1);
  });
  cas("Niveau 2 : les indices ne donnent jamais la cause", () => { for (const c of ["A", "B", "C", "D"]) { const P = creerPartie(N2, c); for (const t of N2.indices(P)) vrai(!/pleine d'eau|presse-étoupe|entaill|résistance du chauffe-eau/.test(t), t); } });
}
