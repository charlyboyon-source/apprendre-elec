// Logement 2 : un appartement des années 90 (tableau refait, repérage partiel, va-et-vient, prise commandée).
// Mêmes valeurs que les modules 10 à 14 du site (voir studio.js).
import { chantier } from "./outils.js";

const c = chantier({ id: "appartement90", nom: "Appartement des années 90", niveau: 2, client: "M. Lefèvre", reperage: "partiel" });
c.piece("entree", "Entrée"); c.piece("couloir", "Couloir"); c.piece("sejour", "Séjour"); c.piece("cuisine", "Cuisine");
c.piece("chambre1", "Chambre 1"); c.piece("chambre2", "Chambre 2"); c.piece("sdb", "Salle de bain"); c.piece("wc", "WC");

c.circuit("ecl1", "Éclairage entrée, couloir, séjour, cuisine", "eclairage", 1.5);
c.circuit("pr_sej", "Prises séjour", "prises", 2.5);
c.circuit("pr_ch", "Prises chambres et couloir", "prises", 2.5);
c.circuit("ce", "Chauffe-eau", "specialise", 2.5);
c.circuit("plaque", "Plaque de cuisson", "specialise", 6);
c.circuit("ll", "Lave-linge", "specialise", 2.5);
c.circuit("ecl2", "Éclairage chambres, salle de bain, WC", "eclairage", 1.5);
c.circuit("pr_cuis", "Prises cuisine", "prises", 2.5);
c.circuit("four", "Four", "specialise", 2.5);
c.circuit("lv", "Lave-vaisselle", "specialise", 2.5);
c.circuit("vmc", "VMC", "specialise", 1.5);

c.tableau("entree", {
  agcp: { id: "AGCP", calibre: 45, sensibilite: 500 },
  differentiels: [
    { id: "ID1", calibre: 63, sensibilite: 30, type: "AC" },   // (16 + 20 + 20) / 2 + 20 (chauffe-eau en entier) = 48 A → 63 A
    { id: "ID2", calibre: 63, sensibilite: 30, type: "A" },    // (32 + 20 + 16 + 20) / 2 = 44 A → 63 A
    { id: "ID3", calibre: 40, sensibilite: 30, type: "AC" },   // (20 + 20 + 2) / 2 = 21 A → 40 A
  ],
  disjoncteurs: [
    { id: "Q1", calibre: 16, courbe: "C", differentiel: "ID1", circuit: "ecl1", etiquette: "Éclairage" },
    { id: "Q2", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "pr_sej", etiquette: "Prises séjour" },
    { id: "Q3", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "pr_ch", etiquette: "" },
    { id: "Q4", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "ce", etiquette: "Chauffe-eau" },
    { id: "Q5", calibre: 32, courbe: "C", differentiel: "ID2", circuit: "plaque", etiquette: "Plaque" },
    { id: "Q6", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "ll", etiquette: "Lave-linge" },
    { id: "Q7", calibre: 16, courbe: "C", differentiel: "ID2", circuit: "ecl2", etiquette: "" },
    { id: "Q8", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "pr_cuis", etiquette: "Cuisine" },
    { id: "Q9", calibre: 20, courbe: "C", differentiel: "ID3", circuit: "four", etiquette: "Four" },
    { id: "Q10", calibre: 20, courbe: "C", differentiel: "ID3", circuit: "lv", etiquette: "" },
    { id: "Q11", calibre: 2, courbe: "C", differentiel: "ID3", circuit: "vmc", etiquette: "VMC" },
  ],
});

// Éclairage 1 : boîte du couloir (entrée, va-et-vient du couloir), puis boîte du séjour (séjour, prise commandée, cuisine)
c.boite("bd_couloir", "couloir", "ecl1", "Boîte de dérivation du couloir");
const arriveeCouloir = c.ligne("ecl1", "Q1", "bd_couloir");
c.simpleAllumage("ecl1", "bd_couloir", { id: "int_entree", piece: "entree", nom: "Interrupteur de l'entrée" }, { id: "pl_entree", piece: "entree", nom: "Plafonnier de l'entrée" });
const couloir = c.vaEtVient("ecl1", "bd_couloir", { id: "vv_couloir1", piece: "couloir", nom: "Va-et-vient du couloir, côté entrée" }, { id: "vv_couloir2", piece: "couloir", nom: "Va-et-vient du couloir, côté chambres" }, { id: "pl_couloir", piece: "couloir", nom: "Plafonnier du couloir" });
c.boite("bd_sejour", "sejour", "ecl1", "Boîte de dérivation du séjour");
const versSejour = c.ligne("ecl1", "bd_couloir", "bd_sejour");
const sejour = c.simpleAllumage("ecl1", "bd_sejour", { id: "int_sejour", piece: "sejour", nom: "Interrupteur du séjour" }, { id: "pl_sejour", piece: "sejour", nom: "Plafonnier du séjour" });
c.priseCommandee("ecl1", "bd_sejour", { id: "int_sejour_cmd", piece: "sejour", nom: "Interrupteur de la prise commandée" }, { id: "pc_sejour_cmd", piece: "sejour", nom: "Prise commandée du séjour" });
c.simpleAllumage("ecl1", "bd_sejour", { id: "int_cuisine", piece: "cuisine", nom: "Interrupteur de la cuisine" }, { id: "pl_cuisine", piece: "cuisine", nom: "Plafonnier de la cuisine" });

// Éclairage 2 : boîte du coin nuit
c.boite("bd_nuit", "couloir", "ecl2", "Boîte de dérivation du coin nuit");
c.ligne("ecl2", "Q7", "bd_nuit");
const chambre1 = c.simpleAllumage("ecl2", "bd_nuit", { id: "int_chambre1", piece: "chambre1", nom: "Interrupteur de la chambre 1" }, { id: "pl_chambre1", piece: "chambre1", nom: "Plafonnier de la chambre 1" });
c.simpleAllumage("ecl2", "bd_nuit", { id: "int_chambre2", piece: "chambre2", nom: "Interrupteur de la chambre 2" }, { id: "pl_chambre2", piece: "chambre2", nom: "Plafonnier de la chambre 2" });
c.simpleAllumage("ecl2", "bd_nuit", { id: "int_sdb", piece: "sdb", nom: "Interrupteur de la salle de bain" }, { id: "pl_sdb", piece: "sdb", nom: "Plafonnier de la salle de bain" });
c.simpleAllumage("ecl2", "bd_nuit", { id: "int_wc", piece: "wc", nom: "Interrupteur des WC" }, { id: "pl_wc", piece: "wc", nom: "Plafonnier des WC" });

// Prises
c.prises("pr_sej", "Q2", [["pc_sejour1", "sejour", "Prise de la télévision"], ["pc_sejour2", "sejour", "Prise du canapé"], ["pc_sejour3", "sejour", "Prise de la baie vitrée"], ["pc_sejour4", "sejour", "Prise du buffet"], ["pc_entree", "entree", "Prise de l'entrée"]]);
const prCh = c.prises("pr_ch", "Q3", [["pc_couloir", "couloir", "Prise du couloir"], ["pc_chambre1a", "chambre1", "Prise du lit, chambre 1"], ["pc_chambre1b", "chambre1", "Prise du bureau, chambre 1"], ["pc_chambre2a", "chambre2", "Prise du lit, chambre 2"], ["pc_chambre2b", "chambre2", "Prise de la fenêtre, chambre 2"]]);
c.prises("pr_cuis", "Q8", [["pc_cuisine1", "cuisine", "Prise du plan de travail 1"], ["pc_cuisine2", "cuisine", "Prise du plan de travail 2"], ["pc_cuisine3", "cuisine", "Prise du plan de travail 3"], ["pc_cuisine4", "cuisine", "Prise du plan de travail 4"], ["pc_cuisine5", "cuisine", "Prise du réfrigérateur"], ["pc_cuisine6", "cuisine", "Prise de la hotte"]]);

// Circuits spécialisés
c.fixe("ce", "Q4", "chauffe_eau", "sdb", "Chauffe-eau", 2000, true);
c.fixe("plaque", "Q5", "plaque", "cuisine", "Plaque de cuisson", 7200);
c.prises("ll", "Q6", [["pc_lavelinge", "sdb", "Prise du lave-linge"]]);
c.fixe("four", "Q9", "four", "cuisine", "Four", 2500);
c.prises("lv", "Q10", [["pc_lavevaisselle", "cuisine", "Prise du lave-vaisselle"]]);
c.fixe("vmc", "Q11", "vmc", "wc", "VMC", 30, true);

// Appareils mobiles
c.appareil("television", "Télévision", 100, "pc_sejour1");
c.appareil("lampadaire", "Lampadaire", 40, "pc_sejour_cmd");
c.appareil("refrigerateur", "Réfrigérateur", 150, "pc_cuisine5");
c.appareil("lavelinge", "Lave-linge", 2200, "pc_lavelinge", false);
c.appareil("lavevaisselle", "Lave-vaisselle", 1800, "pc_lavevaisselle", false);
c.appareil("radiateur1", "Radiateur d'appoint", 2500, null);
c.appareil("radiateur2", "Second radiateur d'appoint", 2500, null);

export const appartement90 = c.logement;
export const reperesAppartement = { arriveeCouloir, versSejour, couloir, sejour, chambre1, prisesChambres: prCh };

export const pannesAppartement = {
  phaseDesserreeInter: { type: "connexion_desserree", conducteur: sejour.phase, extremite: "vers", titre: "Phase desserrée sur l'interrupteur du séjour" },
  navetteDesserree: { type: "connexion_desserree", conducteur: couloir.navette1, extremite: "vers", titre: "Navette sortie de sa borne sur le va-et-vient du couloir" },
  neutreCoupeBoite: { type: "neutre_coupe_boite", conducteur: versSejour.neutre, extremite: "de", titre: "Neutre sorti de sa borne dans la boîte du couloir : séjour et cuisine sans lumière" },
  conducteurCoupe: { type: "conducteur_coupe", conducteur: prCh[2].phase, titre: "Phase coupée entre deux prises de la chambre 1" },
  chauffeEauEnDefaut: { type: "defaut_isolement", organe: "chauffe_eau", titre: "Défaut d'isolement du chauffe-eau" },
  surchargeChambres: { type: "surcharge", branchements: [{ appareil: "radiateur1", prise: "pc_chambre1a" }, { appareil: "radiateur2", prise: "pc_chambre2a" }], titre: "Deux radiateurs d'appoint sur le circuit des prises des chambres" },
  ampouleGrillee: { type: "organe_hs", organe: "pl_couloir", titre: "Ampoule du plafonnier du couloir hors service" },
  vaEtVientUse: { type: "organe_hs", organe: "vv_couloir2", titre: "Va-et-vient du couloir hors service" },
  disjoncteurFatigue: { type: "organe_hs", organe: "Q7", titre: "Disjoncteur de l'éclairage du coin nuit hors service" },
  etiquetteFausse: { type: "etiquette_fausse", disjoncteur: "Q2", etiquette: "Prises chambres", titre: "Étiquette fausse sur le disjoncteur des prises du séjour" },
};
