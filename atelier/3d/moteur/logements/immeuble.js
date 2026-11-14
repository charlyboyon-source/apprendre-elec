// Niveau 5 — les parties communes d'un petit immeuble de trois étages : l'éclairage de l'escalier sur minuterie.
// Montage : les boutons-poussoirs envoient la phase sur la borne de commande de la minuterie (fil blanc, retour
// bouton-poussoir) ; la minuterie alimente les lampes (fil orange, retour lampe). Une boîte de dérivation par niveau :
// y passent la phase, le neutre, la terre, le retour bouton-poussoir et le retour lampe.
import { chantier } from "./outils.js";

const c = chantier({ id: "immeuble", nom: "Parties communes d'un immeuble de trois étages", niveau: 5, client: "Syndic · Mme Costa", reperage: "complet", env: { heure: 10, pluie: false } });
for (const [id, nom] of [["hall", "Hall"], ["local", "Local technique"], ["cave", "Cave"], ["volee1", "Escalier vers le 1er"], ["palier1", "Palier du 1er"], ["volee2", "Escalier vers le 2e"], ["palier2", "Palier du 2e"], ["volee3", "Escalier vers le 3e"], ["palier3", "Palier du 3e"]]) c.piece(id, nom);

c.circuit("loc", "Éclairage local technique", "eclairage", 1.5);
c.circuit("esc", "Éclairage escalier", "eclairage", 1.5);
c.circuit("pr", "Prise du local technique", "prises", 2.5);

c.tableau("local", {
  agcp: { id: "AGCP", calibre: 30, sensibilite: 500 },
  differentiels: [{ id: "ID1", calibre: 40, sensibilite: 30, type: "AC" }],   // (10 + 10 + 16) / 2 = 18 A → 40 A
  disjoncteurs: [
    { id: "Q1", calibre: 10, courbe: "C", differentiel: "ID1", circuit: "loc", etiquette: "Éclairage local" },
    { id: "Q2", calibre: 10, courbe: "C", differentiel: "ID1", circuit: "esc", etiquette: "Éclairage escalier" },
    { id: "Q3", calibre: 16, courbe: "C", differentiel: "ID1", circuit: "pr", etiquette: "Prise local" },
  ],
});

// le local technique : son éclairage et sa prise ne dépendent pas de l'escalier (on y voit clair, et on y teste son VAT)
c.boite("bd_local", "local", "loc", "Boîte de dérivation du local");
c.ligne("loc", "Q1", "bd_local");
c.simpleAllumage("loc", "bd_local", { id: "int_local", piece: "local", nom: "Interrupteur du local technique" }, { id: "pl_local", piece: "local", nom: "Lampe du local technique" });
c.prises("pr", "Q3", [["pc_local", "local", "Prise du local technique"]]);

// la minuterie, au tableau, et le bornier de départ de la colonne (juste sous le tableau)
c.organe("minuterie", "mn", "local", { nom: "Minuterie de l'escalier", circuit: "esc", duree: 3 });
const BORNES = ["ph", "n", "pe", "bp", "lp"], ROLE = { ph: "phase", n: "neutre", pe: "terre", bp: "retour_bp", lp: "retour" };
const boite5 = (id, piece, nom) => c.organe("boite", id, piece, { nom, circuit: "esc", bornes: BORNES });
boite5("bd_tab", "local", "Bornier de départ de l'escalier");
c.fil("phase", "Q2.Lout", "mn.L", "esc"); c.fil("neutre", "Q2.Nout", "mn.N", "esc");
c.fil("phase", "Q2.Lout", "bd_tab.ph", "esc"); c.fil("neutre", "Q2.Nout", "bd_tab.n", "esc"); c.fil("terre", "bt.PE", "bd_tab.pe", "esc");
const commande = c.fil("retour_bp", "bd_tab.bp", "mn.B", "esc");   // le blanc qui arrive sur la borne de commande
const sortie = c.fil("retour", "mn.S", "bd_tab.lp", "esc");        // l'orange qui part vers les lampes

// la colonne : bornier → hall → 1er → 2e → 3e, et hall → cave
const NIVEAUX = [["hall", "hall", "du hall"], ["1", "palier1", "du 1er étage"], ["2", "palier2", "du 2e étage"], ["3", "palier3", "du 3e étage"], ["cave", "cave", "de la cave"]];
const troncons = {};
for (const [k, piece, nom] of NIVEAUX) boite5(`bd_${k}`, piece, `Boîte de dérivation ${nom}`);
const troncon = (de, vers) => { const t = {}; for (const b of BORNES) t[b] = c.fil(ROLE[b], `${de}.${b}`, `${vers}.${b}`, "esc"); troncons[`${de}>${vers}`] = t; return t; };
troncon("bd_tab", "bd_hall"); troncon("bd_hall", "bd_1"); troncon("bd_1", "bd_2"); troncon("bd_2", "bd_3"); troncon("bd_hall", "bd_cave");
// à chaque niveau : un bouton-poussoir (deux dans le hall) et un point lumineux
const boutons = {};
const bouton = (id, piece, nom, bd) => { c.organe("bouton_poussoir", id, piece, { nom, circuit: "esc" }); boutons[id] = { phase: c.fil("phase", `${bd}.ph`, `${id}.1`, "esc"), blanc: c.fil("retour_bp", `${id}.2`, `${bd}.bp`, "esc") }; };
bouton("bp_hall", "hall", "Bouton-poussoir du hall", "bd_hall"); bouton("bp_porte", "hall", "Bouton-poussoir de la porte d'entrée", "bd_hall");
bouton("bp_1", "palier1", "Bouton-poussoir du 1er étage", "bd_1"); bouton("bp_2", "palier2", "Bouton-poussoir du 2e étage", "bd_2"); bouton("bp_3", "palier3", "Bouton-poussoir du 3e étage", "bd_3"); bouton("bp_cave", "cave", "Bouton-poussoir de la cave", "bd_cave");
for (const [k, piece, nom] of NIVEAUX) {
  c.organe("point_lumineux", `l_${k}`, piece, { nom: `Lampe ${nom}`, circuit: "esc", puissance: 9 });
  c.fil("retour", `bd_${k}.lp`, `l_${k}.L`, "esc"); c.fil("neutre", `bd_${k}.n`, `l_${k}.N`, "esc"); c.fil("terre", `bd_${k}.pe`, `l_${k}.PE`, "esc");
}
c.logement.etat = { int_local: true };

export const immeuble = c.logement;
export const reperesImmeuble = { commande, sortie, troncons, boutons };
export const causesImmeuble = {
  A: { type: "usage", titre: "Le sélecteur de la minuterie est resté sur « marche permanente »" },
  B: { type: "organe_hs", organe: "bp_2", mode: "colle", titre: "Le bouton-poussoir du 2e étage est resté enfoncé, collé par la peinture" },
  C: { type: "organe_hs", organe: "mn", mode: "colle", titre: "Le contact de la minuterie est collé" },
  D: { type: "pont", a: "bd_3.bp", b: "bd_3.ph", titre: "Dans la boîte du 3e étage, le retour bouton-poussoir pincé touche la phase" },
};
