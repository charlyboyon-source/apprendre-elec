// Logement 1 : le studio neuf de Mme Martin (celui du niveau 1 « La lumière de la chambre »).
// Tableau bien repéré, un circuit par usage. Valeurs : celles des modules 10 à 14 du site
// (1,5 mm² sous 16 A pour l'éclairage, 2,5 mm² sous 20 A pour les prises et les circuits spécialisés,
// 6 mm² sous 32 A pour la plaque ; 8 points au plus par circuit d'éclairage, 12 prises au plus en 2,5 mm² ;
// au moins deux DDR 30 mA, plaque et lave-linge sous un type A, éclairage et prises répartis sous deux DDR ;
// 8 disjoncteurs au plus par différentiel ; calibre des différentiels par la méthode aval).
import { chantier } from "./outils.js";

const c = chantier({ id: "studio", nom: "Studio neuf", niveau: 1, client: "Mme Martin", reperage: "complet" });
c.piece("entree", "Entrée"); c.piece("chambre", "Chambre"); c.piece("sejour", "Séjour"); c.piece("cuisine", "Cuisine"); c.piece("sdb", "Salle de bain");

c.circuit("ecl_ch", "Éclairage chambres", "eclairage", 1.5);
c.circuit("pr_ch", "Prises chambres", "prises", 2.5);
c.circuit("pr_sej", "Prises séjour", "prises", 2.5);
c.circuit("lv", "Lave-vaisselle", "specialise", 2.5);
c.circuit("plaque", "Plaque de cuisson", "specialise", 6);
c.circuit("ll", "Lave-linge", "specialise", 2.5);
c.circuit("four", "Four", "specialise", 2.5);
c.circuit("pr_cuis", "Prises cuisine", "prises", 2.5);
c.circuit("ecl_sej", "Éclairage séjour", "eclairage", 1.5);

c.tableau("entree", {
  agcp: { id: "AGCP", calibre: 45, sensibilite: 500 },
  differentiels: [
    { id: "ID1", calibre: 40, sensibilite: 30, type: "AC" },   // (16 + 20 + 20 + 20) / 2 = 38 A → 40 A
    { id: "ID2", calibre: 63, sensibilite: 30, type: "A" },    // (32 + 20 + 20 + 20 + 16) / 2 = 54 A → 63 A
  ],
  disjoncteurs: [
    { id: "Q1", calibre: 16, courbe: "C", differentiel: "ID1", circuit: "ecl_ch", etiquette: "Éclairage chambres" },
    { id: "Q2", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "pr_ch", etiquette: "Prises chambres" },
    { id: "Q3", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "pr_sej", etiquette: "Prises séjour" },
    { id: "Q4", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "lv", etiquette: "Lave-vaisselle" },
    { id: "Q5", calibre: 32, courbe: "C", differentiel: "ID2", circuit: "plaque", etiquette: "Plaque de cuisson" },
    { id: "Q6", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "ll", etiquette: "Lave-linge" },
    { id: "Q7", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "four", etiquette: "Four" },
    { id: "Q8", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "pr_cuis", etiquette: "Prises cuisine" },
    { id: "Q9", calibre: 16, courbe: "C", differentiel: "ID2", circuit: "ecl_sej", etiquette: "Éclairage séjour" },
  ],
});

// Éclairage chambres : une boîte de dérivation, puis la chambre et l'entrée
c.boite("bd_ch", "chambre", "ecl_ch", "Boîte de dérivation de la chambre");
const arriveeCh = c.ligne("ecl_ch", "Q1", "bd_ch");
const chambre = c.simpleAllumage("ecl_ch", "bd_ch", { id: "int_chambre", piece: "chambre", nom: "Interrupteur de la chambre" }, { id: "pl_chambre", piece: "chambre", nom: "Plafonnier de la chambre" });
c.simpleAllumage("ecl_ch", "bd_ch", { id: "int_entree", piece: "entree", nom: "Interrupteur de l'entrée" }, { id: "pl_entree", piece: "entree", nom: "Plafonnier de l'entrée" });

// Prises chambres et séjour, en repiquage
const prCh = c.prises("pr_ch", "Q2", [["pc_chambre1", "chambre", "Prise près de la porte"], ["pc_chambre2", "chambre", "Prise de la table de nuit"], ["pc_chambre3", "chambre", "Prise du bureau"]]);
c.prises("pr_sej", "Q3", [["pc_sejour1", "sejour", "Prise de la télévision"], ["pc_sejour2", "sejour", "Prise du canapé"], ["pc_sejour3", "sejour", "Prise de la fenêtre"], ["pc_sejour4", "entree", "Prise de l'entrée"]]);

// Éclairage séjour, cuisine, salle de bain : une boîte de dérivation
c.boite("bd_sej", "sejour", "ecl_sej", "Boîte de dérivation du séjour");
c.ligne("ecl_sej", "Q9", "bd_sej");
c.simpleAllumage("ecl_sej", "bd_sej", { id: "int_sejour", piece: "sejour", nom: "Interrupteur du séjour" }, { id: "pl_sejour", piece: "sejour", nom: "Plafonnier du séjour" });
c.simpleAllumage("ecl_sej", "bd_sej", { id: "int_cuisine", piece: "cuisine", nom: "Interrupteur de la cuisine" }, { id: "pl_cuisine", piece: "cuisine", nom: "Plafonnier de la cuisine" });
c.simpleAllumage("ecl_sej", "bd_sej", { id: "int_sdb", piece: "sdb", nom: "Interrupteur de la salle de bain" }, { id: "pl_sdb", piece: "sdb", nom: "Plafonnier de la salle de bain" });

// Cuisine et circuits spécialisés
c.prises("pr_cuis", "Q8", [["pc_cuisine1", "cuisine", "Prise du plan de travail 1"], ["pc_cuisine2", "cuisine", "Prise du plan de travail 2"], ["pc_cuisine3", "cuisine", "Prise du plan de travail 3"], ["pc_cuisine4", "cuisine", "Prise du plan de travail 4"], ["pc_cuisine5", "cuisine", "Prise du réfrigérateur"], ["pc_cuisine6", "cuisine", "Prise de la hotte"]]);
c.fixe("plaque", "Q5", "plaque", "cuisine", "Plaque de cuisson", 7200);
c.fixe("four", "Q7", "four", "cuisine", "Four", 2500);
c.prises("ll", "Q6", [["pc_lavelinge", "sdb", "Prise du lave-linge"]]);
c.prises("lv", "Q4", [["pc_lavevaisselle", "cuisine", "Prise du lave-vaisselle"]]);

// Appareils mobiles
c.appareil("reveil", "Réveil", 5, "pc_chambre2");
c.appareil("television", "Télévision", 100, "pc_sejour1");
c.appareil("refrigerateur", "Réfrigérateur", 150, "pc_cuisine5");
c.appareil("lavelinge", "Lave-linge", 2200, "pc_lavelinge", false);
c.appareil("lavevaisselle", "Lave-vaisselle", 1800, "pc_lavevaisselle", false);
c.appareil("radiateur1", "Radiateur d'appoint", 2500, null);
c.appareil("radiateur2", "Second radiateur d'appoint", 2500, null);

export const studio = c.logement;
// repères du câblage, pour décrire les pannes et pour la comparaison avec le niveau 1
export const reperes = { phaseInterChambre: chambre.phase, retourChambre: chambre.retour, neutreChambre: chambre.neutre, arriveeBoite: arriveeCh, prisesChambre: prCh };

// Les pannes du studio : une par type de la banque (la première est celle du niveau 1 en ligne)
export const pannesStudio = {
  phaseDesserreeInter: { type: "connexion_desserree", conducteur: chambre.phase, extremite: "vers", titre: "Phase desserrée sur la borne L de l'interrupteur de la chambre" },
  retourDesserreDcl: { type: "connexion_desserree", conducteur: chambre.retour, extremite: "vers", titre: "Retour lampe sorti de la borne du plafonnier de la chambre" },
  neutreCoupeBoite: { type: "neutre_coupe_boite", conducteur: arriveeCh.neutre, extremite: "vers", titre: "Neutre sorti de sa borne dans la boîte de dérivation de la chambre" },
  conducteurCoupe: { type: "conducteur_coupe", conducteur: prCh[1].phase, titre: "Phase coupée entre deux prises de la chambre" },
  lavelingeEnDefaut: { type: "defaut_isolement", appareil: "lavelinge", titre: "Défaut d'isolement du lave-linge" },
  surchargeChambre: { type: "surcharge", branchements: [{ appareil: "radiateur1", prise: "pc_chambre1" }, { appareil: "radiateur2", prise: "pc_chambre3" }], titre: "Deux radiateurs d'appoint sur le circuit des prises de la chambre" },
  ampouleGrillee: { type: "organe_hs", organe: "pl_chambre", titre: "Ampoule du plafonnier de la chambre hors service" },
  interrupteurUse: { type: "organe_hs", organe: "int_sejour", titre: "Interrupteur du séjour hors service" },
  disjoncteurFatigue: { type: "organe_hs", organe: "Q3", titre: "Disjoncteur « Prises séjour » hors service" },
  etiquetteFausse: { type: "etiquette_fausse", disjoncteur: "Q2", etiquette: "Prises séjour", titre: "Étiquette fausse sur le disjoncteur des prises de la chambre" },
};
