// Tests des fonctions ajoutées pour les niveaux 2 à 6 (lancés par tests.mjs).
import { creerInstallation } from "./moteur.js";
import { chantier } from "./logements/outils.js";
import { studio, reperes } from "./logements/studio.js";
import { maisonJardin, causesMaison, cadranMaison, reperesMaison } from "./logements/maison-jardin.js";

export function testsEtape0(cas, egal, vrai) {
  const maison = (cause) => { const i = creerInstallation(maisonJardin, cause ? [causesMaison[cause]] : []), e = i.etatInitial(); if (cause) e.cadrans.horloge = cadranMaison[cause]; return [i, e]; };
  const soir = (i, e, pluie = true) => { i.agir(e, { type: "meteo", env: { heure: 18.5, pluie } }); i.agir(e, { type: "regler_horloge", id: "horloge" }); };
  const proche = (a, b, tol = 0.02) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

  // ---- le logement du niveau 2 respecte les mêmes valeurs
  cas("Maison : données pures, sections et calibres", () => {
    egal(JSON.parse(JSON.stringify(maisonJardin)), maisonJardin);
    for (const q of maisonJardin.tableau.disjoncteurs) { const c = maisonJardin.circuits.find((x) => x.id === q.circuit); egal(q.calibre, { 6: 32, 2.5: 20 }[c.section] || (c.usage === "commande" ? 2 : 16), q.id); }
    for (const d of maisonJardin.tableau.differentiels) { const qs = maisonJardin.tableau.disjoncteurs.filter((q) => q.differentiel === d.id); vrai(qs.length <= 8 && d.calibre >= qs.reduce((s, q) => s + (q.circuit === "ce" ? q.calibre : q.calibre / 2), 0), d.id); }
  });
  cas("Maison saine : de jour tout fonctionne, l'allée et le chauffe-eau sont à l'arrêt", () => { const [i, e] = maison(); const r = i.calculer(e); egal(r.declenchements, []); vrai(r.alimente("pc_congelateur") && !r.allume("borne1") && !r.fonctionne("chauffe_eau")); });

  // ---- le temps qui passe : horloge, heures creuses
  cas("Horloge : l'allée s'allume à 19 h et s'éteint à 23 h 30", () => { const [i, e] = maison(); soir(i, e, false); i.avancer(e, 45); vrai([1, 2, 3].every((k) => i.calculer(e).allume(`borne${k}`)), "allumée à 19 h 15"); i.avancer(e, 280); vrai(!i.calculer(e).allume("borne1"), "éteinte à 23 h 55"); });
  cas("Horloge : marche forcée et arrêt", () => { const [i, e] = maison(); i.agir(e, { type: "mode", id: "horloge", mode: "I" }); vrai(i.calculer(e).allume("borne2")); i.agir(e, { type: "mode", id: "horloge", mode: "0" }); vrai(!i.calculer(e).allume("borne2")); });
  cas("Horloge sans réserve de marche : elle s'arrête quand le courant est coupé, et retarde ensuite", () => {
    const [i, e] = maison(); const h0 = e.cadrans.horloge;
    i.agir(e, { type: "manoeuvrer", id: "ID2", position: false }); i.avancer(e, 120); egal(e.cadrans.horloge, h0, "arrêtée");
    i.agir(e, { type: "manoeuvrer", id: "ID2", position: true }); i.avancer(e, 60);
    vrai(proche(e.cadrans.horloge, h0 + 1) && proche(e.env.heure - e.cadrans.horloge, 2), "deux heures de retard");
  });
  cas("Heures creuses : le chauffe-eau ne chauffe que la nuit, par le contacteur", () => {
    const [i, e] = maison(); vrai(!i.calculer(e).fonctionne("chauffe_eau"), "arrêté à 16 h");
    i.agir(e, { type: "meteo", env: { heure: 22.9 } }); i.avancer(e, 15); vrai(i.calculer(e).fonctionne("chauffe_eau") && e.bobines.kc, "en marche à 23 h 09");
    i.agir(e, { type: "mode", id: "kc", mode: "0" }); vrai(!i.calculer(e).fonctionne("chauffe_eau"), "contacteur sur 0");
    i.agir(e, { type: "meteo", env: { heure: 12 } }); i.agir(e, { type: "mode", id: "kc", mode: "I" }); vrai(i.calculer(e).fonctionne("chauffe_eau"), "marche forcée de jour");
  });

  // ---- résistance d'isolement (hors tension), qui dépend du temps qu'il fait
  const isoAllee = (i, e) => { i.agir(e, { type: "manoeuvrer", id: "Q8", position: false }); return i.isolement(e, "horloge.2", "bt.PE"); };
  cas("Isolement : refusé sous tension", () => { const [i, e] = maison(); egal(i.isolement(e, "pc_congelateur.L", "pc_congelateur.PE"), "tension"); });
  cas("Isolement : circuit sain, rien ne relie les conducteurs actifs à la terre", () => { const [i, e] = maison(); egal(isoAllee(i, e), Infinity); });
  cas("Isolement : boîte pleine d'eau (A), médiocre à sec, très faible sous la pluie", () => { const [i, e] = maison("A"); vrai(proche(isoAllee(i, e), 500000)); i.agir(e, { type: "meteo", env: { pluie: true } }); vrai(proche(i.isolement(e, "horloge.2", "bt.PE"), 5000)); });
  cas("Isolement : presse-étoupe fendu (B), bon à sec, mauvais sous la pluie", () => { const [i, e] = maison("B"); egal(isoAllee(i, e), Infinity); i.agir(e, { type: "meteo", env: { pluie: true } }); vrai(proche(i.isolement(e, "horloge.2", "bt.PE"), 5000)); });
  cas("Isolement : câble entaillé (C), on localise en séparant les tronçons dans la boîte", () => {
    const [i, e] = maison("C"); vrai(proche(isoAllee(i, e), 1e6));
    i.agir(e, { type: "debrancher_fil", conducteur: reperesMaison.enterre.phase, extremite: "de" });
    egal(i.isolement(e, "bd_mur.ph", "bd_mur.pe"), Infinity, "côté maison"); vrai(proche(i.isolement(e, `${reperesMaison.enterre.phase}#de`, "bd_mur.pe"), 1e6), "côté jardin");
    i.agir(e, { type: "debrancher_fil", conducteur: reperesMaison.b12.phase, extremite: "de" });
    vrai(proche(i.isolement(e, `${reperesMaison.enterre.phase}#de`, "bd_mur.pe"), 1e6), "le défaut reste sur le tronçon enterré, borne 2 séparée");
  });
  cas("Isolement : boîte pleine d'eau (A), le défaut reste côté boîte quand on sépare le jardin", () => { const [i, e] = maison("A"); isoAllee(i, e); i.agir(e, { type: "debrancher_fil", conducteur: reperesMaison.enterre.phase, extremite: "de" }); vrai(proche(i.isolement(e, "bd_mur.ph", "bd_mur.pe"), 500000)); egal(i.isolement(e, `${reperesMaison.enterre.phase}#de`, "bd_mur.pe"), Infinity); });
  cas("Isolement : chauffe-eau (D), invisible au départ du tableau, visible à la sortie de câble, dans l'appareil", () => {
    const [i, e] = maison("D"); i.agir(e, { type: "manoeuvrer", id: "Q9", position: false });
    egal(i.isolement(e, "Q9.Lout", "bt.PE"), Infinity, "contacteur ouvert"); vrai(proche(i.isolement(e, "sc_ce.ph", "sc_ce.pe"), 1500), "sortie de câble");
    i.agir(e, { type: "debrancher_fil", conducteur: reperesMaison.cordonCe.phase, extremite: "de" });
    egal(i.isolement(e, "sc_ce.ph", "sc_ce.pe"), Infinity, "côté câble"); vrai(proche(i.isolement(e, `${reperesMaison.cordonCe.phase}#de`, "sc_ce.pe"), 1500), "côté appareil");
  });

  // ---- le symptôme : le différentiel de la rangée du bas déclenche la nuit, pour la bonne raison
  for (const k of ["A", "B", "C"]) cas(`Maison, cause ${k} : de jour rien ne déclenche ; un soir de pluie, ID2 déclenche quand l'allée s'allume`, () => {
    const [i, e] = maison(k); egal(i.calculer(e).declenchements, []); soir(i, e, true);
    egal(i.avancer(e, 20).length, 0, "avant 19 h"); const ev = i.avancer(e, 20); egal(ev.map((x) => x.id), ["ID2"]); vrai(proche(ev[0].heure, 19, 0.01)); vrai(e.positions.ID1, "ID1 tient");
  });
  for (const k of ["B"]) cas(`Maison, cause ${k} : un soir sec, rien ne déclenche`, () => { const [i, e] = maison(k); soir(i, e, false); egal(i.avancer(e, 90), []); });
  cas("Maison, cause D : ID2 déclenche au début des heures creuses, pluie ou pas", () => { const [i, e] = maison("D"); soir(i, e, false); const ev = i.avancer(e, 300); egal(ev.map((x) => x.id), ["ID2"]); vrai(proche(ev[0].heure, 23, 0.01)); });
  cas("Maison, cause D : de jour, la marche forcée du contacteur fait déclencher ID2", () => { const [i, e] = maison("D"); egal(i.agir(e, { type: "mode", id: "kc", mode: "I" }).declenchements.map((x) => x.id), ["ID2"]); });
  cas("Maison : par élimination, seul le circuit en défaut fait retomber le différentiel", () => {
    const [i, e] = maison("A"); soir(i, e, true); i.avancer(e, 40);
    const bas = maisonJardin.tableau.disjoncteurs.filter((q) => q.differentiel === "ID2").map((q) => q.id), coupables = [];
    for (const q of bas) i.agir(e, { type: "manoeuvrer", id: q, position: false });
    i.agir(e, { type: "manoeuvrer", id: "ID2", position: true }); vrai(e.positions.ID2, "tout baissé : il tient");
    for (const q of bas) { i.agir(e, { type: "manoeuvrer", id: q, position: true }); if (!e.positions.ID2) { coupables.push(q); i.agir(e, { type: "manoeuvrer", id: q, position: false }); i.agir(e, { type: "manoeuvrer", id: "ID2", position: true }); } }
    egal(coupables, ["Q8"]);
  });
  cas("Maison : sans courant, le congélateur ne tourne plus", () => { const [i, e] = maison("A"); soir(i, e, true); i.avancer(e, 40); vrai(!i.calculer(e).fonctionne("congelateur")); });

  // ---- courant dans chaque conducteur (pince ampèremétrique)
  cas("Pince : le courant d'un radiateur passe dans la phase et revient par le neutre, rien dans la terre", () => {
    const i = creerInstallation(studio), e = i.etatInitial(); i.agir(e, { type: "brancher", id: "radiateur1", prise: "pc_chambre1" });
    const l = reperes.prisesChambre[0];
    vrai(proche(i.courantConducteur(e, l.phase), 2500 / 230 + 5 / 230), "phase"); vrai(proche(i.courantConducteur(e, l.neutre), 2500 / 230 + 5 / 230), "neutre"); vrai(i.courantConducteur(e, l.terre) < 1e-6, "terre");
    vrai(proche(i.courantConducteur(e, reperes.prisesChambre[1].phase), 5 / 230, 0.05), "en aval, seulement le réveil");
  });
  cas("Pince : le courant lu au disjoncteur est la somme des appareils du circuit", () => { const i = creerInstallation(studio), e = i.etatInitial(); i.agir(e, { type: "brancher", id: "radiateur1", prise: "pc_chambre3" }); vrai(proche(i.calculer(e).courant("Q2"), (2500 + 5) / 230)); });

  // ---- déclenchement thermique dans le temps, magnétique tout de suite
  const chaud = { ...studio, id: "studio-thermique", thermique: true };
  const duree = (appareils) => { const i = creerInstallation(chaud), e = i.etatInitial(); appareils.forEach((a, k) => i.agir(e, { type: "brancher", id: a, prise: ["pc_chambre1", "pc_chambre3"][k] })); egal(i.calculer(e).declenchements, [], "pas tout de suite"); for (let m = 1; m <= 600; m++) if (i.avancer(e, 1).some((x) => x.id === "Q2")) return m; return Infinity; };
  cas("Thermique : sous le calibre, le disjoncteur ne déclenche jamais", () => egal(duree(["radiateur1"]), Infinity));
  cas("Thermique : en surcharge, il déclenche au bout d'un moment", () => { const d = duree(["radiateur1", "radiateur2"]); vrai(d > 5 && d < 600, `${d} min`); });
  cas("Thermique : plus la surcharge est forte, plus il déclenche vite", () => {
    const gros = { ...chaud, id: "studio-thermique-2", appareils: chaud.appareils.map((a) => (a.id === "radiateur2" ? { ...a, puissance: 5000 } : a)) };
    const i = creerInstallation(gros), e = i.etatInitial(); i.agir(e, { type: "brancher", id: "radiateur1", prise: "pc_chambre1" }); i.agir(e, { type: "brancher", id: "radiateur2", prise: "pc_chambre3" });
    let d = Infinity; for (let m = 1; m <= 600 && d === Infinity; m++) if (i.avancer(e, 1).some((x) => x.id === "Q2")) d = m;
    vrai(d < duree(["radiateur1", "radiateur2"]), `${d} min`);
  });
  cas("Magnétique : un court-circuit fait déclencher tout de suite", () => { const i = creerInstallation(chaud, [{ type: "pont", a: "pc_chambre2.L", b: "pc_chambre2.N" }]), e = i.etatInitial(); egal(i.calculer(e).declenchements, [{ id: "Q2", raison: "court-circuit" }]); });
  cas("Court-circuit intermittent : rien tant qu'on n'appuie pas", () => { const i = creerInstallation(chaud, [{ type: "pont", a: "pc_chambre2.L", b: "pc_chambre2.N", quand: "lit" }]), e = i.etatInitial(); egal(i.calculer(e).declenchements, []); egal(i.agir(e, { type: "appuyer", id: "lit" }).declenchements.map((x) => x.id), ["Q2"]); });

  // ---- déclenchement différentiel par déséquilibre, sans défaut d'isolement
  cas("Neutre emprunté à un autre différentiel : ça déclenche à l'allumage, et l'isolement est bon", () => {
    const i = creerInstallation(studio, [{ type: "conducteur_coupe", conducteur: reperes.neutreChambre }, { type: "pont", a: "pl_chambre.N", b: "bd_sej.n" }]), e = i.etatInitial();
    egal(i.calculer(e).declenchements, [], "éteint : tout tient");
    const d = i.agir(e, { type: "basculer", id: "int_chambre" }).declenchements.map((x) => x.id); vrai(d.length >= 1 && d.every((x) => x === "ID1" || x === "ID2"), d.join());
    for (const q of ["Q1", "Q9"]) i.agir(e, { type: "manoeuvrer", id: q, position: false });
    egal(i.isolement(e, "pl_chambre.L", "pl_chambre.PE"), Infinity, "phase-terre"); egal(i.isolement(e, "pl_chambre.N", "pl_chambre.PE"), Infinity, "neutre-terre");
    egal(i.continuite(e, "pl_chambre.N", "Q9.Nout"), true, "le neutre répond sur l'autre rangée"); egal(i.continuite(e, "pl_chambre.N", "Q1.Nout"), false);
  });
  cas("Contact neutre-terre : le différentiel déclenche à l'allumage, l'isolement neutre-terre est nul", () => {
    const i = creerInstallation(studio, [{ type: "pont", a: "pl_chambre.N", b: "pl_chambre.PE" }]), e = i.etatInitial();
    egal(i.agir(e, { type: "basculer", id: "int_chambre" }).declenchements.map((x) => x.id), ["ID1"]);
    i.agir(e, { type: "manoeuvrer", id: "Q1", position: false }); egal(i.isolement(e, "pl_chambre.N", "pl_chambre.PE"), 0); vrai(proche(i.isolement(e, "int_chambre.L", "pl_chambre.PE"), 230 * 230 / 9), "phase-terre : on lit la lampe, à travers le neutre");
  });

  // ---- minuterie et boutons-poussoirs (montage 4 fils)
  const cage = (pannes = [], mode = "auto") => {
    const c = chantier({ id: `cage-${mode}-${pannes.length}`, nom: "Cage d'escalier (essai)" }); c.piece("hall", "Hall"); c.circuit("esc", "Éclairage escalier", "eclairage", 1.5);
    c.tableau("hall", { agcp: { id: "AGCP", calibre: 30, sensibilite: 500 }, differentiels: [{ id: "ID1", calibre: 40, sensibilite: 30, type: "AC" }], disjoncteurs: [{ id: "Q1", calibre: 16, courbe: "C", differentiel: "ID1", circuit: "esc", etiquette: "Éclairage escalier" }] });
    c.organe("minuterie", "mn", "hall", { nom: "Minuterie", circuit: "esc", duree: 3, mode });
    c.fil("phase", "Q1.Lout", "mn.L", "esc"); c.fil("neutre", "Q1.Nout", "mn.N", "esc");
    for (const k of [1, 2]) { c.organe("bouton_poussoir", `bp${k}`, "hall", { nom: `Bouton ${k}`, circuit: "esc" }); c.fil("phase", "Q1.Lout", `bp${k}.1`, "esc"); c.fil("retour", `bp${k}.2`, "mn.B", "esc"); c.organe("point_lumineux", `l${k}`, "hall", { nom: `Lampe ${k}`, circuit: "esc", puissance: 9 }); c.fil("retour", "mn.S", `l${k}.L`, "esc"); c.fil("neutre", "Q1.Nout", `l${k}.N`, "esc"); c.fil("terre", "bt.PE", `l${k}.PE`, "esc"); }
    const i = creerInstallation(c.logement, pannes); return [i, i.etatInitial()];
  };
  cas("Minuterie : un appui allume toutes les lampes, qui s'éteignent à la fin de la temporisation", () => {
    const [i, e] = cage(); vrai(!i.calculer(e).allume("l1"), "éteint au départ");
    vrai(i.agir(e, { type: "appuyer", id: "bp2" }).allume("l1") && i.calculer(e).allume("l2"), "allumé"); i.avancer(e, 2); vrai(i.calculer(e).allume("l1"), "encore allumé");
    i.avancer(e, 2); vrai(!i.calculer(e).allume("l1"), "éteint");
  });
  cas("Minuterie : sélecteur sur marche permanente, la lumière ne s'éteint plus", () => { const [i, e] = cage([], "permanent"); i.avancer(e, 30); vrai(i.calculer(e).allume("l1")); i.agir(e, { type: "mode", id: "mn", mode: "auto" }); i.avancer(e, 5); vrai(!i.calculer(e).allume("l1"), "remise sur automatique"); });
  cas("Minuterie : un bouton resté enfoncé la relance sans arrêt", () => { const [i, e] = cage([{ type: "organe_hs", organe: "bp2", mode: "colle" }]); i.avancer(e, 30); vrai(i.calculer(e).allume("l1")); i.agir(e, { type: "reparer", panne: 0 }); i.avancer(e, 5); vrai(!i.calculer(e).allume("l1")); });
  cas("Minuterie : contact collé, la lumière reste allumée même sans commande", () => { const [i, e] = cage([{ type: "organe_hs", organe: "mn", mode: "colle" }]); i.avancer(e, 30); vrai(i.calculer(e).allume("l2")); egal(i.calculer(e).tension("mn.B", "mn.N"), 0, "aucune commande"); });
  cas("Minuterie : le retour bouton-poussoir touche la phase, aucun bouton n'est en cause", () => { const [i, e] = cage([{ type: "pont", a: "mn.B", b: "Q1.Lout" }]); i.avancer(e, 30); vrai(i.calculer(e).allume("l1")); egal(i.calculer(e).tension("mn.B", "mn.N"), 230); });
}
