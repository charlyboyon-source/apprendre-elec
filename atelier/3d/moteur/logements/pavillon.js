// Logement du niveau 4 « Le disjoncteur saute tous les soirs » : le pavillon à étage de la famille Morel.
// Tableau dans le garage. Le circuit « Prises chambres » dessert les prises du palier et des trois chambres.
// Valeurs des modules 10 à 14 : 1,5 mm² sous 16 A, 2,5 mm² sous 20 A, 6 mm² sous 32 A ; différentiels par la méthode aval.
// thermique : un disjoncteur en surcharge ne déclenche qu'au bout d'un moment.
import { chantier } from "./outils.js";

const c = chantier({ id: "pavillon", nom: "Pavillon à étage", niveau: 4, client: "Famille Morel", reperage: "complet", thermique: true, env: { heure: 19.5, pluie: false } });
for (const [id, nom] of [["garage", "Garage"], ["entree", "Entrée"], ["escalier", "Escalier"], ["palier", "Palier"], ["chambre1", "Chambre des parents"], ["chambre2", "Chambre de Théo"], ["chambre3", "Chambre de Léa"]]) c.piece(id, nom);

c.circuit("plaque", "Plaque de cuisson", "specialise", 6);
c.circuit("ll", "Lave-linge", "specialise", 2.5);
c.circuit("pr_rdc", "Prises du bas", "prises", 2.5);
c.circuit("ecl_rdc", "Éclairage du bas", "eclairage", 1.5);
c.circuit("ecl_et", "Éclairage étage", "eclairage", 1.5);
c.circuit("pr_ch", "Prises chambres", "prises", 2.5);
c.circuit("sde", "Salle d'eau étage", "prises", 2.5);

c.tableau("garage", {
  agcp: { id: "AGCP", calibre: 45, sensibilite: 500 },
  differentiels: [
    { id: "ID1", calibre: 63, sensibilite: 30, type: "A" },    // (32 + 20 + 20 + 16) / 2 = 44 A → 63 A
    { id: "ID2", calibre: 40, sensibilite: 30, type: "AC" },   // (16 + 20 + 20) / 2 = 28 A → 40 A
  ],
  disjoncteurs: [
    { id: "Q1", calibre: 32, courbe: "C", differentiel: "ID1", circuit: "plaque", etiquette: "Plaque de cuisson" },
    { id: "Q2", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "ll", etiquette: "Lave-linge" },
    { id: "Q3", calibre: 20, courbe: "C", differentiel: "ID1", circuit: "pr_rdc", etiquette: "Prises du bas" },
    { id: "Q4", calibre: 16, courbe: "C", differentiel: "ID1", circuit: "ecl_rdc", etiquette: "Éclairage du bas" },
    { id: "Q5", calibre: 16, courbe: "C", differentiel: "ID2", circuit: "ecl_et", etiquette: "Éclairage étage" },
    { id: "Q6", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "pr_ch", etiquette: "Prises chambres" },
    { id: "Q7", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "sde", etiquette: "Salle d'eau étage" },
  ],
});

c.boite("bd_rdc", "entree", "ecl_rdc", "Boîte de dérivation de l'entrée");
c.ligne("ecl_rdc", "Q4", "bd_rdc");
for (const [p, nom] of [["garage", "du garage"], ["entree", "de l'entrée"], ["escalier", "de l'escalier"]]) c.simpleAllumage("ecl_rdc", "bd_rdc", { id: `int_${p}`, piece: p, nom: `Interrupteur ${nom}` }, { id: `pl_${p}`, piece: p, nom: `Plafonnier ${nom}` });
c.boite("bd_et", "palier", "ecl_et", "Boîte de dérivation du palier");
c.ligne("ecl_et", "Q5", "bd_et");
for (const [p, nom] of [["palier", "du palier"], ["chambre1", "de la chambre des parents"], ["chambre2", "de la chambre de Théo"], ["chambre3", "de la chambre de Léa"]]) c.simpleAllumage("ecl_et", "bd_et", { id: `int_${p}`, piece: p, nom: `Interrupteur ${nom}` }, { id: `pl_${p}`, piece: p, nom: `Plafonnier ${nom}` });

const prCh = c.prises("pr_ch", "Q6", [["pc_palier", "palier", "Prise du palier"], ["pc_chambre1", "chambre1", "Prise de la chambre des parents"], ["pc_chambre2a", "chambre2", "Prise du radiateur de Théo"], ["pc_chambre2b", "chambre2", "Prise du bureau de Théo"], ["pc_chambre3a", "chambre3", "Prise du radiateur de Léa"], ["pc_chambre3b", "chambre3", "Prise du lit de Léa"]]);
c.prises("pr_rdc", "Q3", [["pc_entree", "entree", "Prise de l'entrée"], ["pc_garage", "garage", "Prise de l'établi"]]);
c.prises("sde", "Q7", [["pc_sde", "palier", "Prise de la salle d'eau"]]);
c.fixe("plaque", "Q1", "plaque", "entree", "Plaque de cuisson", 7200);
c.prises("ll", "Q2", [["pc_lavelinge", "garage", "Prise du lave-linge"]]);

c.appareil("radiateur2", "Radiateur d'appoint de Théo", 2000, "pc_chambre2a", false);
c.appareil("radiateur3", "Radiateur d'appoint de Léa", 2000, "pc_chambre3a", false);
c.appareil("fer", "Fer à repasser", 2400, "pc_palier", false);
c.appareil("ordinateur", "Ordinateur de Théo", 300, "pc_chambre2b", false);
c.appareil("chargeur", "Chargeur de téléphone", 10, "pc_chambre3b", true);
c.appareil("chevet", "Lampe de chevet", 40, "pc_chambre1", false);
c.appareil("lavelinge", "Lave-linge", 2200, "pc_lavelinge", false);

// un soir d'hiver : les lumières sont allumées
c.logement.etat = Object.fromEntries(c.logement.organes.filter((o) => o.type === "interrupteur").map((o) => [o.id, true]));

export const pavillon = c.logement;
export const reperesPavillon = { prisesChambres: prCh };
export const causesPavillon = {
  A: { type: "usage", titre: "Surcharge : deux radiateurs d'appoint et le fer à repasser sur le même circuit" },
  B: { type: "connexion_chauffe", disjoncteur: "Q6", titre: "Une borne desserrée sur le disjoncteur « Prises chambres » : il chauffe et déclenche sous son calibre" },
  C: { type: "pont", a: "pc_chambre2b.L", b: "pc_chambre2b.N", quand: "lit", titre: "Court-circuit intermittent : une rallonge écrasée sous le pied du lit de Théo" },
  D: { type: "mauvais_calibre", disjoncteur: "Q6", calibre: 10, titre: "Mauvais calibre : un disjoncteur de 10 A a été posé sur un circuit prévu pour 20 A" },
};
// ce qui tourne le soir à l'étage, selon la partie
export const soireePavillon = { A: ["radiateur2", "radiateur3", "ordinateur", "fer"], B: ["radiateur2", "radiateur3", "ordinateur"], C: ["radiateur2", "radiateur3", "ordinateur"], D: ["radiateur2", "radiateur3", "ordinateur"] };
