// Niveau 6 — la maison rénovée de M. Girard : deux rangées, deux interrupteurs différentiels.
// Rangée 1 : les éclairages. Rangée 2 : les prises. M. Girard a remplacé le plafonnier du couloir par une rampe de
// quatre spots et ajouté une boîte de dérivation dans les combles ; juste à côté passe le câble des prises du couloir.
import { chantier } from "./outils.js";

const c = chantier({ id: "maison-renovee", nom: "Maison rénovée par son propriétaire", niveau: 6, client: "M. Girard", reperage: "complet", env: { heure: 14, pluie: false } });
for (const [id, nom] of [["entree", "Entrée"], ["couloir", "Couloir"], ["sejour", "Séjour"], ["chambre1", "Chambre 1"], ["chambre2", "Chambre 2"], ["combles", "Combles"]]) c.piece(id, nom);

c.circuit("ecl_sej", "Éclairage séjour et entrée", "eclairage", 1.5);
c.circuit("ecl_cou", "Éclairage couloir", "eclairage", 1.5);
c.circuit("ecl_ch", "Éclairage chambres", "eclairage", 1.5);
c.circuit("pr_sej", "Prises séjour", "prises", 2.5);
c.circuit("pr_cou", "Prises couloir et chambres", "prises", 2.5);
c.circuit("ll", "Lave-linge", "specialise", 2.5);

c.tableau("entree", {
  agcp: { id: "AGCP", calibre: 45, sensibilite: 500 },
  differentiels: [
    { id: "ID1", calibre: 40, sensibilite: 30, type: "AC" },   // (10 + 10 + 10) / 2 = 15 A → 40 A
    { id: "ID2", calibre: 40, sensibilite: 30, type: "A" },    // (16 + 16 + 20) / 2 = 26 A → 40 A ; le lave-linge est sous un type A
  ],
  disjoncteurs: [
    { id: "Q1", calibre: 10, courbe: "C", differentiel: "ID1", circuit: "ecl_sej", etiquette: "Éclairage séjour entrée" },
    { id: "Q2", calibre: 10, courbe: "C", differentiel: "ID1", circuit: "ecl_cou", etiquette: "Éclairage couloir" },
    { id: "Q3", calibre: 10, courbe: "C", differentiel: "ID1", circuit: "ecl_ch", etiquette: "Éclairage chambres" },
    { id: "Q4", calibre: 16, courbe: "C", differentiel: "ID2", circuit: "pr_sej", etiquette: "Prises séjour" },
    { id: "Q5", calibre: 16, courbe: "C", differentiel: "ID2", circuit: "pr_cou", etiquette: "Prises couloir chambres" },
    { id: "Q6", calibre: 20, courbe: "C", differentiel: "ID2", circuit: "ll", etiquette: "Lave-linge" },
  ],
});

// éclairages (rangée 1)
c.boite("bd_sej", "sejour", "ecl_sej", "Boîte de dérivation du séjour"); c.ligne("ecl_sej", "Q1", "bd_sej");
for (const [p, nom] of [["entree", "de l'entrée"], ["sejour", "du séjour"]]) c.simpleAllumage("ecl_sej", "bd_sej", { id: `int_${p}`, piece: p, nom: `Interrupteur ${nom}` }, { id: `pl_${p}`, piece: p, nom: `Plafonnier ${nom}` });
c.boite("bd_ch", "chambre1", "ecl_ch", "Boîte de dérivation des chambres"); c.ligne("ecl_ch", "Q3", "bd_ch");
for (const [p, nom] of [["chambre1", "de la chambre 1"], ["chambre2", "de la chambre 2"]]) c.simpleAllumage("ecl_ch", "bd_ch", { id: `int_${p}`, piece: p, nom: `Interrupteur ${nom}` }, { id: `pl_${p}`, piece: p, nom: `Plafonnier ${nom}` });
// le couloir : la boîte ajoutée dans les combles, l'interrupteur, la rampe de quatre spots
c.boite("bd_combles", "combles", "ecl_cou", "Boîte de dérivation des spots (combles)");
const arrivee = c.ligne("ecl_cou", "Q2", "bd_combles");
const spots = c.simpleAllumage("ecl_cou", "bd_combles", { id: "int_couloir", piece: "couloir", nom: "Interrupteur du couloir" }, { id: "spots", piece: "couloir", nom: "Rampe de spots du couloir", puissance: 28 });

// prises (rangée 2) : le câble des prises du couloir passe par une boîte, dans les combles, à côté de celle des spots
c.prises("pr_sej", "Q4", [["pc_sejour1", "sejour", "Prise de la télévision"], ["pc_sejour2", "sejour", "Prise du canapé"], ["pc_entree", "entree", "Prise de l'entrée"]]);
c.boite("bd_prises", "combles", "pr_cou", "Boîte de dérivation des prises (combles)");
const versPrises = c.ligne("pr_cou", "Q5", "bd_prises");
c.prises("pr_cou", "bd_prises", [["pc_couloir", "couloir", "Prise du couloir"], ["pc_chambre1", "chambre1", "Prise de la chambre 1"], ["pc_chambre2", "chambre2", "Prise de la chambre 2"]]);
c.prises("ll", "Q6", [["pc_lavelinge", "entree", "Prise du lave-linge"]]);
// aucun appareil en marche à l'arrivée : M. Girard a tout débranché « pour être sûr »

const neutreTableau = c.logement.conducteurs.find((x) => x.de === "ID1.Nout" && x.vers === "Q2.Nin").id;
export const maisonRenovee = c.logement;
export const reperesMaisonRenovee = { arrivee, spots, versPrises, neutreTableau };
export const causesMaisonRenovee = {
  A: { type: "conducteur_deplace", conducteur: spots.neutre, extremite: "de", borne: "bd_prises.n", titre: "Neutre emprunté : dans les combles, les spots prennent leur neutre sur le câble des prises" },
  B: { type: "conducteur_deplace", conducteur: neutreTableau, extremite: "de", borne: "ID2.Nout", titre: "Au tableau, le neutre du circuit « Éclairage couloir » est raccordé du côté de la rangée du bas" },
  C: { type: "pont", a: "spots.N", b: "spots.PE", titre: "Dans la rampe de spots, le conducteur de neutre pincé touche la carcasse reliée à la terre" },
  D: { type: "defaut_isolement", organe: "spots", titre: "Dans la rampe de spots, la phase pincée touche la carcasse : défaut d'isolement" },
};
