// Logement du niveau 3 « La moitié de l'appartement est morte » : le trois-pièces de M. Haddad, dans un immeuble
// des années 70 rénové par morceaux. Le tableau a été refait il y a vingt ans ; ses étiquettes, écrites à la main,
// sont en partie fausses. Le circuit étiqueté « Lumière chambres » alimente en réalité la salle de bain, puis une
// boîte de dérivation dans le faux plafond du couloir, d'où partent le couloir, la chambre 2 et la prise de l'entrée.
// Valeurs des modules 10 à 14 : 1,5 mm² sous 16 A, 2,5 mm² sous 20 A, 6 mm² sous 32 A ; différentiels par la méthode aval.
import { chantier } from "./outils.js";

const c = chantier({ id: "appartement70", nom: "Appartement des années 70", niveau: 3, client: "M. Haddad", reperage: "faux", env: { heure: 15, pluie: false } });
for (const [id, nom] of [["entree", "Entrée"], ["couloir", "Couloir"], ["sejour", "Séjour"], ["cuisine", "Cuisine"], ["chambre1", "Chambre 1"], ["chambre2", "Chambre 2"], ["sdb", "Salle de bain"], ["plafond", "Faux plafond du couloir"]]) c.piece(id, nom);

c.circuit("plaque", "Plaque de cuisson", "specialise", 6);
c.circuit("ll", "Lave-linge", "specialise", 2.5);
c.circuit("pr_cuis", "Prises cuisine", "prises", 2.5);
c.circuit("lum_a", "Éclairage séjour, cuisine, chambre 1, entrée", "eclairage", 1.5);
c.circuit("lum_b", "Éclairage salle de bain, couloir, chambre 2 et prise de l'entrée", "eclairage", 1.5);
c.circuit("pr_sej", "Prises séjour", "prises", 2.5);
c.circuit("pr_ch", "Prises chambres et couloir", "prises", 2.5);
c.circuit("pr_sdb", "Prise salle de bain", "prises", 2.5);

c.tableau("entree", {
  agcp: { id: "AGCP", calibre: 45, sensibilite: 500 },
  differentiels: [
    { id: "ID1", calibre: 63, sensibilite: 30, type: "A" },    // (32 + 20 + 20 + 16) / 2 = 44 A → 63 A
    { id: "ID2", calibre: 40, sensibilite: 30, type: "AC" },   // (16 + 20 + 20 + 20) / 2 = 38 A → 40 A
  ],
  disjoncteurs: [
    { id: "Q1", calibre: 32, courbe: "C", differentiel: "ID1", circuit: "plaque", etiquette: "Plaque" },
    { id: "Q2", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "ll", etiquette: "Machine à laver" },
    { id: "Q3", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "pr_cuis", etiquette: "Cuisine" },
    { id: "Q4", calibre: 16, courbe: "C", differentiel: "ID1", circuit: "lum_a", etiquette: "Lumière séjour" },
    { id: "Q5", calibre: 16, courbe: "C", differentiel: "ID2", circuit: "lum_b", etiquette: "Lumière chambres" },
    { id: "Q6", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "pr_sej", etiquette: "Prises séjour" },
    { id: "Q7", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "pr_ch", etiquette: "Prises chambres" },
    { id: "Q8", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "pr_sdb", etiquette: "Salle de bain" },
  ],
});

// « Lumière séjour » : en réalité séjour, cuisine, chambre 1 et entrée
c.boite("bd_a", "sejour", "lum_a", "Boîte de dérivation du séjour");
c.ligne("lum_a", "Q4", "bd_a");
for (const [p, nom] of [["sejour", "du séjour"], ["cuisine", "de la cuisine"], ["chambre1", "de la chambre 1"], ["entree", "de l'entrée"]])
  c.simpleAllumage("lum_a", "bd_a", { id: `int_${p}`, piece: p, nom: `Interrupteur ${nom}` }, { id: `pl_${p}`, piece: p, nom: `Plafonnier ${nom}` });

// « Lumière chambres » : en réalité salle de bain d'abord, puis la boîte du faux plafond (couloir, chambre 2, prise de l'entrée)
c.boite("bd_sdb", "sdb", "lum_b", "Boîte du plafonnier de la salle de bain");
c.ligne("lum_b", "Q5", "bd_sdb");
c.simpleAllumage("lum_b", "bd_sdb", { id: "int_sdb", piece: "sdb", nom: "Interrupteur de la salle de bain" }, { id: "pl_sdb", piece: "sdb", nom: "Plafonnier de la salle de bain" });
c.boite("bd_plafond", "plafond", "lum_b", "Boîte de dérivation du faux plafond");
const repiquage = c.ligne("lum_b", "bd_sdb", "bd_plafond");
c.simpleAllumage("lum_b", "bd_plafond", { id: "int_couloir", piece: "couloir", nom: "Interrupteur du couloir" }, { id: "pl_couloir", piece: "couloir", nom: "Plafonnier du couloir" });
c.simpleAllumage("lum_b", "bd_plafond", { id: "int_chambre2", piece: "chambre2", nom: "Interrupteur de la chambre 2" }, { id: "pl_chambre2", piece: "chambre2", nom: "Plafonnier de la chambre 2" });
c.prises("lum_b", "bd_plafond", [["pc_entree", "entree", "Prise de l'entrée"]]);

// Prises et circuits spécialisés
c.prises("pr_sej", "Q6", [["pc_sejour1", "sejour", "Prise de la télévision"], ["pc_sejour2", "sejour", "Prise du canapé"]]);
c.prises("pr_ch", "Q7", [["pc_couloir", "couloir", "Prise du couloir"], ["pc_chambre1", "chambre1", "Prise de la chambre 1"], ["pc_chambre2", "chambre2", "Prise de la chambre 2"]]);
c.prises("pr_sdb", "Q8", [["pc_sdb", "sdb", "Prise de la salle de bain"]]);
c.prises("pr_cuis", "Q3", [["pc_cuisine1", "cuisine", "Prise du plan de travail 1"], ["pc_cuisine2", "cuisine", "Prise du plan de travail 2"], ["pc_cuisine3", "cuisine", "Prise du réfrigérateur"]]);
c.fixe("plaque", "Q1", "plaque", "cuisine", "Plaque de cuisson", 7200);
c.prises("ll", "Q2", [["pc_lavelinge", "sdb", "Prise du lave-linge"]]);
c.appareil("television", "Télévision", 100, "pc_sejour1");
c.appareil("refrigerateur", "Réfrigérateur", 150, "pc_cuisine3");
c.appareil("lavelinge", "Lave-linge", 2200, "pc_lavelinge", false);

// M. Haddad a laissé l'interrupteur du couloir sur « allumé »
c.logement.etat = { int_couloir: true };

export const appartement70 = c.logement;
export const reperesAppartement70 = { repiquage };
export const causesAppartement70 = {
  A: { type: "neutre_coupe_boite", conducteur: repiquage.neutre, extremite: "vers", titre: "Dans la boîte du faux plafond, le neutre qui arrive est sorti de son connecteur" },
  B: { type: "connexion_desserree", conducteur: repiquage.phase, extremite: "vers", titre: "Dans la boîte du faux plafond, la phase a chauffé et s'est coupée" },
  C: { type: "organe_hs", organe: "Q5", titre: "Le disjoncteur « Lumière chambres » est hors service : manette en haut, rien en sortie" },
  D: { type: "neutre_coupe_boite", conducteur: repiquage.neutre, extremite: "de", titre: "À la salle de bain, le neutre du repiquage qui repart vers le couloir est desserré" },
};
