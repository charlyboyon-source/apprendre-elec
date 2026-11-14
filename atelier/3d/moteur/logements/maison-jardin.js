// Logement du niveau 2 « Ça saute la nuit » : la maison de plain-pied de Mme Roux, avec son jardin.
// Deux rangées, chacune derrière son interrupteur différentiel 30 mA. La rangée du bas alimente le cellier,
// la terrasse, l'éclairage de l'allée (par une horloge mécanique sans réserve de marche) et le chauffe-eau
// (par un contacteur heures creuses). Valeurs des modules 10 à 14 et 19 : 1,5 mm² sous 16 A, 2,5 mm² sous 20 A,
// 6 mm² sous 32 A, commande du contacteur sous 2 A ; calibre des différentiels par la méthode aval.
import { chantier } from "./outils.js";

const c = chantier({ id: "maison-jardin", nom: "Maison de plain-pied avec jardin", niveau: 2, client: "Mme Roux", reperage: "complet",
  env: { heure: 16, pluie: false }, heuresCreuses: [23, 7] });
for (const [id, nom] of [["entree", "Entrée"], ["sejour", "Séjour"], ["cuisine", "Cuisine"], ["cellier", "Cellier"], ["terrasse", "Terrasse"], ["allee", "Allée du jardin"]]) c.piece(id, nom);

c.circuit("plaque", "Plaque de cuisson", "specialise", 6);
c.circuit("ll", "Lave-linge", "specialise", 2.5);
c.circuit("pr_cuis", "Prises cuisine", "prises", 2.5);
c.circuit("pr_sej", "Prises séjour", "prises", 2.5);
c.circuit("ecl", "Éclairage", "eclairage", 1.5);
c.circuit("pr_cel", "Prises cellier", "prises", 2.5);
c.circuit("pr_ter", "Prise terrasse", "prises", 2.5);
c.circuit("allee", "Éclairage allée", "eclairage", 1.5);
c.circuit("ce", "Chauffe-eau", "specialise", 2.5);
c.circuit("cmd", "Commande heures creuses", "commande", 1.5);

c.tableau("entree", {
  agcp: { id: "AGCP", calibre: 45, sensibilite: 500 },
  differentiels: [
    { id: "ID1", calibre: 63, sensibilite: 30, type: "A" },    // (32 + 20 + 20 + 20 + 16) / 2 = 54 A → 63 A
    { id: "ID2", calibre: 63, sensibilite: 30, type: "AC" },   // (20 + 20 + 16 + 2) / 2 + 20 (chauffe-eau en entier) = 49 A → 63 A
  ],
  disjoncteurs: [
    { id: "Q1", calibre: 32, courbe: "C", differentiel: "ID1", circuit: "plaque", etiquette: "Plaque de cuisson" },
    { id: "Q2", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "ll", etiquette: "Lave-linge" },
    { id: "Q3", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "pr_cuis", etiquette: "Prises cuisine" },
    { id: "Q4", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "pr_sej", etiquette: "Prises séjour" },
    { id: "Q5", calibre: 16, courbe: "C", differentiel: "ID1", circuit: "ecl", etiquette: "Éclairage" },
    { id: "Q6", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "pr_cel", etiquette: "Prises cellier" },
    { id: "Q7", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "pr_ter", etiquette: "Prise terrasse" },
    { id: "Q8", calibre: 16, courbe: "C", differentiel: "ID2", circuit: "allee", etiquette: "Éclairage allée" },
    { id: "Q9", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "ce", etiquette: "Chauffe-eau" },
    { id: "Q10", calibre: 2, courbe: "C", differentiel: "ID2", circuit: "cmd", etiquette: "Commande heures creuses" },
  ],
});

// Éclairage de la maison
c.boite("bd_ecl", "entree", "ecl", "Boîte de dérivation de l'entrée");
c.ligne("ecl", "Q5", "bd_ecl");
for (const [p, nom] of [["entree", "de l'entrée"], ["sejour", "du séjour"], ["cuisine", "de la cuisine"], ["cellier", "du cellier"]])
  c.simpleAllumage("ecl", "bd_ecl", { id: `int_${p}`, piece: p, nom: `Interrupteur ${nom}` }, { id: `pl_${p}`, piece: p, nom: `Plafonnier ${nom}` });

// Prises et circuits spécialisés
c.prises("pr_sej", "Q4", [["pc_sejour1", "sejour", "Prise de la télévision"], ["pc_sejour2", "sejour", "Prise du fauteuil"], ["pc_entree", "entree", "Prise de l'entrée"]]);
c.prises("pr_cuis", "Q3", [["pc_cuisine1", "cuisine", "Prise du plan de travail 1"], ["pc_cuisine2", "cuisine", "Prise du plan de travail 2"], ["pc_cuisine3", "cuisine", "Prise du plan de travail 3"], ["pc_cuisine4", "cuisine", "Prise du réfrigérateur"]]);
c.fixe("plaque", "Q1", "plaque", "cuisine", "Plaque de cuisson", 7200);
c.prises("ll", "Q2", [["pc_lavelinge", "cellier", "Prise du lave-linge"]]);
c.prises("pr_cel", "Q6", [["pc_congelateur", "cellier", "Prise du congélateur"], ["pc_cellier", "cellier", "Prise de l'établi"]]);
c.prises("pr_ter", "Q7", [["pc_terrasse", "terrasse", "Prise de la terrasse"]]);

// Éclairage de l'allée : horloge au tableau, boîte au pied du mur de la terrasse, puis trois bornes en repiquage
c.organe("horloge", "horloge", "entree", { nom: "Horloge de l'éclairage de l'allée", circuit: "allee", debut: 19, fin: 23.5 });
c.fil("phase", "Q8.Lout", "horloge.L", "allee"); c.fil("neutre", "Q8.Nout", "horloge.N", "allee");
c.fil("phase", "Q8.Lout", "horloge.1", "allee");
c.boite("bd_mur", "terrasse", "allee", "Boîte de dérivation au pied du mur");
const versBoite = { phase: c.fil("retour", "horloge.2", "bd_mur.ph", "allee"), neutre: c.fil("neutre", "Q8.Nout", "bd_mur.n", "allee"), terre: c.fil("terre", "bt.PE", "bd_mur.pe", "allee") };
for (const k of [1, 2, 3]) c.organe("point_lumineux", `borne${k}`, "allee", { nom: `Borne lumineuse ${k}`, circuit: "allee", puissance: 9 });
const enterre = c.ligne("allee", "bd_mur", "borne1");
const b12 = c.ligne("allee", "borne1", "borne2");
const b23 = c.ligne("allee", "borne2", "borne3");

// Chauffe-eau : contacteur heures creuses au tableau, sortie de câble dans le cellier
c.organe("contacteur", "kc", "entree", { nom: "Contacteur heures creuses", circuit: "ce" });
c.organe("contact_hc", "compteur", "entree", { nom: "Contact heures creuses du compteur", circuit: "cmd" });
c.fil("phase", "Q10.Lout", "compteur.C1", "cmd"); c.fil("retour", "compteur.C2", "kc.A1", "cmd"); c.fil("neutre", "Q10.Nout", "kc.A2", "cmd");
c.fil("phase", "Q9.Lout", "kc.1", "ce");
c.boite("sc_ce", "cellier", "ce", "Sortie de câble du chauffe-eau");
const versCe = { phase: c.fil("phase", "kc.2", "sc_ce.ph", "ce"), neutre: c.fil("neutre", "Q9.Nout", "sc_ce.n", "ce"), terre: c.fil("terre", "bt.PE", "sc_ce.pe", "ce") };
const cordonCe = c.fixe("ce", "sc_ce", "chauffe_eau", "cellier", "Chauffe-eau", 2000, true);

c.appareil("television", "Télévision", 100, "pc_sejour1");
c.appareil("refrigerateur", "Réfrigérateur", 150, "pc_cuisine4");
c.appareil("congelateur", "Congélateur", 150, "pc_congelateur");
c.appareil("lavelinge", "Lave-linge", 2200, "pc_lavelinge", false);
// Le décor branché : chaque appareil dépend de sa prise, donc de son disjoncteur
c.appareil("lampadaire", "Lampadaire du séjour", 40, "pc_sejour2", false);
c.appareil("lampe_appoint", "Lampe d'appoint", 25, "pc_sejour1", false);
c.appareil("bouilloire", "Bouilloire", 2000, "pc_cuisine1", false);
c.appareil("cafetiere", "Cafetière", 800, "pc_cuisine2", false);
c.appareil("micro_ondes", "Four à micro-ondes", 1000, "pc_cuisine3", false);

export const maisonJardin = c.logement;
export const reperesMaison = { versBoite, enterre, b12, b23, versCe, cordonCe };

// Les quatre causes possibles (une par partie). La résistance de la fuite dépend du temps qu'il fait.
export const causesMaison = {
  A: { type: "defaut_isolement", borne: "bd_mur.ph", resistance: { sec: 500000, pluie: 5000 }, titre: "La boîte de dérivation au pied du mur, un modèle d'intérieur, est pleine d'eau" },
  B: { type: "defaut_isolement", borne: "borne2.L", resistance: { pluie: 5000 }, titre: "Le presse-étoupe de la borne 2 est fendu : l'eau entre quand il pleut" },
  C: { type: "defaut_isolement", conducteur: enterre.phase, resistance: { sec: 1000000, pluie: 5000 }, titre: "Le câble enterré entre la boîte et la borne 1 a été entaillé par une bêche" },
  D: { type: "defaut_isolement", organe: "chauffe_eau", titre: "La résistance du chauffe-eau a un défaut d'isolement" },
};
// heure affichée par l'horloge à l'arrivée (16 h) : elle s'est arrêtée à la dernière coupure, réarmée à 7 h
export const cadranMaison = { A: 4, B: 4, C: 4, D: 8 };
