// Intervention « L'éclairage de l'open space » (bureaux, Mme Roussel).
// Éclairage commandé par télérupteur, montage 3 fils : deux boutons-poussoirs en parallèle (accueil, salle de réunion).
import { vueTableau, texte } from "../commun.js";
import { vueOpenSpace, vueBP, vuePlafond } from "./bureaux-vues.js";

const RANGEE1 = [
  { cle: "diff", type: "id", haut: "40 A", ligne2: "IΔn 30 mA", typ: "A", etiquette: "Différentiel 1" },
  { cle: "dj", type: "dj", cal: "C10", etiquette: "Éclairage open space" },
  { cle: "tl", type: "tl", cal: "16 A", etiquette: "Télérupteur open space" },
  { cle: "d2", type: "dj", cal: "C16", etiquette: "Prises bureaux" },
  { cle: "d3", type: "dj", cal: "C10", etiquette: "Éclairage couloir" },
];
const RANGEE2 = [
  { cle: "diff2", type: "id", haut: "40 A", ligne2: "IΔn 30 mA", typ: "AC", etiquette: "Différentiel 2" },
  { cle: "d4", type: "dj", cal: "C16", etiquette: "Baie informatique" },
  { cle: "d5", type: "dj", cal: "C20", etiquette: "Prises kitchenette" },
  { cle: "d6", type: "dj", cal: "C20", etiquette: "Chauffe-eau" },
  { cle: "d7", type: "dj", cal: "C2", etiquette: "VMC" },
];
const NOEUDS = {
  "diff-L": "Ld", "diff-N": "Nd", "diff-amont-L": "L", "diff-amont-N": "N",
  "dj-L": "EL", "dj-N": "EN", "dj-amont-L": "Ld", "dj-amont-N": "Nd",
  "tl-A1": "TLA1", "tl-A2": "TLA2", "tl-1": "TL1", "tl-2": "TL2",
  "d2-L": "P2L", "d2-N": "P2N", "d2-amont-L": "Ld", "d2-amont-N": "Nd",
  "d3-L": "P3L", "d3-N": "P3N", "d3-amont-L": "Ld", "d3-amont-N": "Nd",
  "terre": "PE", "bp1-E": "BP1E", "bp1-S": "Ret", "bp2-E": "BP2E", "bp2-S": "BP2S", "prise1-terre": "PE", "prise2-terre": "PE",
  "boite-L": "BoiteL", "boite-N": "BoiteN", "boite-T": "PE", "drv-L": "D2L", "drv-N": "D2N", "drv-T": "PE",
};
const NOMS = {
  "diff-L": "sortie phase du différentiel", "diff-N": "sortie neutre du différentiel",
  "diff-amont-L": "arrivée phase du différentiel", "diff-amont-N": "arrivée neutre du différentiel",
  "dj-L": "sortie phase du disjoncteur Éclairage open space", "dj-N": "sortie neutre du disjoncteur Éclairage open space",
  "dj-amont-L": "arrivée phase (Éclairage open space)", "dj-amont-N": "arrivée neutre (Éclairage open space)",
  "tl-A1": "borne A1 du télérupteur (bobine)", "tl-A2": "borne A2 du télérupteur (bobine)",
  "tl-1": "borne 1 du télérupteur (contact)", "tl-2": "borne 2 du télérupteur (contact)",
  "d2-L": "sortie phase (Prises bureaux)", "d2-N": "sortie neutre (Prises bureaux)", "d2-amont-L": "arrivée phase (Prises bureaux)", "d2-amont-N": "arrivée neutre (Prises bureaux)",
  "d3-L": "sortie phase (Éclairage couloir)", "d3-N": "sortie neutre (Éclairage couloir)", "d3-amont-L": "arrivée phase (Éclairage couloir)", "d3-amont-N": "arrivée neutre (Éclairage couloir)",
  "terre": "bornier de terre",
  "bp1-E": "arrivée du bouton de l'accueil", "bp1-S": "retour du bouton de l'accueil",
  "bp2-E": "arrivée du bouton de la salle de réunion", "bp2-S": "retour du bouton de la salle de réunion",
  "prise1-terre": "terre de la prise de l'accueil", "prise2-terre": "terre de la prise de la salle de réunion",
  "boite-L": "connecteur du retour lampe (boîte)", "boite-N": "connecteur du neutre (boîte)", "boite-T": "connecteur de terre (boîte)",
  "drv-L": "entrée L du driver de la dalle", "drv-N": "entrée N du driver de la dalle", "drv-T": "terre du driver de la dalle",
};
const DALLES = [["D1L", "D1N"], ["D2L", "D2N"], ["D3L", "D3N"]];
const allumage = (a) => ({ d1: a.alimente("D1L", "D1N"), d2: a.alimente("D2L", "D2N"), d3: a.alimente("D3L", "D3N") });

// Bobine du télérupteur : à chaque nouvelle mise sous tension (front montant), le contact change d'état.
function suivreBobine(a) {
  const e = a.e;
  const en = a.alimente("TLA1", "TLA2");
  if (en && !e.bobinePrec) {
    e.app.tl = !e.app.tl;
    if (e.vue === "tableau") { a.sons.disjoncteur(); a.dire("Clac ! Le télérupteur bascule.", "info"); }
    else { setTimeout(() => a.sons.disjoncteur(), 150); a.dire("On entend un « clac » au loin, dans le local technique.", "info"); }
  }
  e.bobinePrec = en;
  e.bourdonne = en && e.app.bp2Bloque;
}

export default {
  id: "bureaux",
  titre: "L'éclairage de l'open space",
  lieu: "Cabinet comptable · open space au 1er étage · 16 h 45, en décembre",
  client: { nom: "Mme Roussel", court: "Mme Roussel", initiales: "SR", teinte: "#5d7aa8", role: "Responsable des locaux",
    humeurs: ["Mme Roussel est agacée.", "Mme Roussel est mitigée.", "Mme Roussel est contente.", "Mme Roussel est ravie."] },
  accueil: "« Bonjour ! On a un souci avec la lumière de l'open space. Avec la nuit qui tombe à 17 h, mes collègues travaillent à la lampe de leur téléphone… »",
  merci: "« Enfin de la lumière ! Merci, vous nous sauvez la fin de journée. »",
  vueDepart: "openspace",
  tempsCible: 50,
  deplacement: 60,
  dialogue: {
    max: 5,
    fin: "« Je vous laisse, j'ai une réunion. Appelez-moi à l'accueil si besoin. »",
    questions: [
      { id: "quoi", texte: "Qu'est-ce qui se passe exactement ?", reponse: {
        "*": "« Plus moyen d'allumer l'open space, quel que soit le bouton. »",
        retourBP2: "« Depuis l'accueil, on allume et on éteint sans problème. Mais depuis la salle de réunion, le bouton ne fait plus rien. »",
        bpColle: "« On appuie, il ne se passe rien. La lumière est restée éteinte depuis ce matin. »",
        dalle: "« Toutes les dalles s'allument, sauf celle au-dessus du bureau de Julien. »" } },
      { id: "boutons", apres: "quoi", texte: "Ça fait pareil avec tous les boutons ?", reponse: {
        "*": "« Oui, aucun ne marche, ni à l'accueil ni en salle de réunion. »",
        retourBP2: "« Non ! L'accueil marche, la salle de réunion non. »",
        dalle: "« Les boutons marchent très bien, c'est juste cette dalle-là. »" } },
      { id: "clac", apres: "quoi", texte: "Quand vous appuyez, vous entendez un « clac » dans le local technique ?", reponse: {
        "*": "« Oui, ça claque comme d'habitude… mais la lumière ne vient pas. »",
        bobine: "« Non, plus rien. Avant, on l'entendait même depuis le couloir, ce clac. »",
        bpColle: "« Non… Par contre, ça bourdonne là-dedans, et ça sent un peu le chaud. »",
        retourBP2: "« Depuis l'accueil, oui. Depuis la salle de réunion, rien du tout. »",
        dalle: "« Oui, normal. »" } },
      { id: "depuis", texte: "Depuis quand ? Il s'est passé quelque chose avant ?", reponse: {
        retourBP2: "« Depuis hier. La semaine dernière, un chariot a arraché le bouton de la salle de réunion. Le gardien l'a revissé lui-même. »",
        bobine: "« Ce matin en arrivant. Hier soir tout marchait. Il y a eu un gros orage cette nuit. »",
        contactTL: "« Ces derniers jours, il fallait parfois appuyer deux fois, et la lumière clignotait un peu. Ce matin, plus rien. »",
        neutreBoite: "« Ce matin. Hier, l'entreprise de climatisation a travaillé dans le faux plafond. »",
        bpColle: "« Ce matin, juste après le passage de l'entreprise de ménage. »",
        dalle: "« Elle clignotait depuis une semaine, et depuis ce matin elle reste éteinte. »" } },
      { id: "intervenu", apres: "depuis", texte: "Quelqu'un est intervenu dans le faux plafond ou sur l'installation ?", reponse: {
        "*": "« Non, personne. »",
        neutreBoite: "« Oui, les techniciens de la clim, hier. Ils ont soulevé des dalles et passé des tuyaux juste au-dessus de l'open space. »",
        retourBP2: "« Seulement le gardien, qui a revissé le bouton de la salle de réunion. »" } },
      { id: "toucher", apres: "depuis", texte: "Un des boutons vous paraît bizarre quand vous appuyez ?", reponse: {
        "*": "« Non, ils ont l'air normaux. »",
        bpColle: "« Celui de la salle de réunion reste enfoncé, il ne remonte plus depuis le ménage. Ils passent un produit collant… »",
        retourBP2: "« Celui de la salle de réunion bouge un peu dans le mur. »" } },
      { id: "odeur", apres: "clac", texte: "Ça sent le chaud, ou ça bourdonne quelque part ?", reponse: {
        "*": "« Non, rien de spécial. »",
        bpColle: "« Oui ! Dans le local technique, ça bourdonne et ça sent le chaud. Je n'ose pas ouvrir. »" } },
      { id: "tableau", texte: "Vous êtes allée voir au tableau ?", reponse: {
        "*": "« Oui, toutes les manettes sont en haut. Je n'ai touché à rien d'autre. »" } },
      { id: "savoir", texte: "Vous êtes sûre que vous savez allumer la lumière ?", mauvaise: true, reponse: {
        "*": "« … Je gère ces bureaux depuis dix ans. Merci. »" } },
      { id: "tard", texte: "Pourquoi vous n'avez pas appelé plus tôt ?", mauvaise: true, reponse: {
        "*": "« Je vous ai appelé à 9 h ce matin. Vous arrivez à 16 h 45. »" } },
    ],
  },
  pannes: [
    { id: "retourBP2", visible: "bp2-S", cible: "bp2-S", reparation: "serrer",
      titre: "Fil de retour desserré au bouton de la salle de réunion",
      explication: "Le télérupteur claque quand on appuie à l'accueil : la bobine et le contact sont bons. Seul le bouton de la salle de réunion ne commande plus rien. Bouton démonté : l'arrivée a bien la phase (230 V par rapport à la terre), mais au repos on lit 0 V entre arrivée et retour, alors qu'un bouton bien raccordé donne 230 V à ses bornes (le retour est relié au neutre à travers la bobine). Le fil blanc de retour est sorti de sa borne : le gardien l'avait mal resserré après l'arrachement." },
    { id: "bobine", piece: "remplacerTL",
      titre: "Bobine du télérupteur grillée",
      explication: "Aucun bouton ne fait claquer le télérupteur. Bouton maintenu enfoncé, on mesure 230 V entre A1 et A2 : la bobine reçoit bien sa tension, mais elle ne réagit pas. Elle est coupée (l'orage de la nuit a pu l'achever). Indice qui ne trompe pas : en basculant le télérupteur à la main, la lumière s'allume. On remplace le télérupteur, circuit consigné." },
    { id: "contactTL", piece: "remplacerTL",
      titre: "Contact du télérupteur usé",
      explication: "Le télérupteur claque normalement : la commande marche. Mais côté puissance, contact sur « I », on mesure encore 230 V entre ses bornes 1 et 2 : le contact ne se ferme plus. Il était déjà fatigué (il fallait appuyer deux fois, la lumière clignotait). On remplace le télérupteur, circuit consigné." },
    { id: "neutreBoite", visible: "boite-N", cible: "boite-N", reparation: "serrer",
      texteReparation: "Tu réenfiches le fil bleu à fond dans son connecteur, tu rabats le levier et tu tires dessus pour vérifier qu'il tient.",
      titre: "Neutre arraché dans la boîte de dérivation du faux plafond",
      explication: "Le télérupteur claque et, contact fermé, sa borne 2 envoie bien 230 V. Dans le faux plafond, le connecteur du retour lampe a 230 V par rapport à la terre, mais 0 V par rapport au connecteur du neutre : le neutre ne revient plus. Le fil bleu est sorti de son connecteur à levier : les techniciens de la climatisation l'ont arraché en passant leurs tuyaux." },
    { id: "bpColle", piece: "remplacerBP", depart: {},
      titre: "Bouton-poussoir de la salle de réunion resté enfoncé",
      explication: "Le bouton de la salle de réunion reste enfoncé (produit de ménage). Sa bobine est donc alimentée en permanence : on lit 230 V entre A1 et A2 sans toucher à rien. Le télérupteur ne reçoit plus d'impulsion, il ne bascule plus, et sa bobine, faite pour des impulsions, chauffe et bourdonne : à la longue, elle grille. On remplace le bouton défectueux, puis on vérifie que le télérupteur n'a pas souffert." },
    { id: "dalle", piece: "remplacerDriver",
      titre: "Driver de la dalle LED hors service",
      explication: "Une seule dalle reste éteinte : le circuit et le télérupteur sont bons. Dans le faux plafond, l'entrée du driver de cette dalle reçoit bien 230 V entre L et N. C'est donc le driver (le petit boîtier qui transforme le 230 V alternatif en basse tension continue pour les LED) qui est mort : il clignotait déjà depuis une semaine. On le remplace, circuit consigné." },
  ],
  pieces: [
    { id: "remplacerTL", nom: "Télérupteur 16 A", prix: 38, minutes: 15 },
    { id: "remplacerBP", nom: "Bouton-poussoir", prix: 8, minutes: 10 },
    { id: "remplacerDriver", nom: "Driver de dalle LED", prix: 29, minutes: 10 },
  ],
  liaisons: [
    { a: "L", b: "Ld", si: "diff" }, { a: "N", b: "Nd", si: "diff" },
    { a: "Ld", b: "EL", si: "dj" }, { a: "Nd", b: "EN", si: "dj" },
    // commande : deux boutons-poussoirs en parallèle vers A1, A2 au neutre
    { a: "EL", b: "BP1E" }, { a: "BP1E", b: "Ret", si: "bp1" },
    { a: "EL", b: "BP2E" }, { a: "BP2E", b: "BP2S", si: "bp2" }, { a: "BP2E", b: "BP2S", si: "bp2Bloque" },
    { a: "BP2S", b: "Ret", coupePar: "retourBP2" },
    { a: "Ret", b: "TLA1" }, { a: "TLA1", b: "TLA2", charge: 1, coupePar: "bobine" }, { a: "TLA2", b: "EN" },
    // puissance : contact 1-2, boîte de dérivation, trois groupes de dalles
    { a: "EL", b: "TL1" }, { a: "TL1", b: "TL2", si: "tl", coupePar: "contactTL" },
    { a: "TL2", b: "BoiteL" },
    { a: "BoiteL", b: "D1L" }, { a: "BoiteL", b: "D2L" }, { a: "BoiteL", b: "D3L" },
    { a: "D1L", b: "D1N", charge: 1 }, { a: "D2L", b: "D2N", charge: 1, coupePar: "dalle" }, { a: "D3L", b: "D3N", charge: 1 },
    { a: "D1N", b: "BoiteN" }, { a: "D2N", b: "BoiteN" }, { a: "D3N", b: "BoiteN" },
    { a: "BoiteN", b: "EN", coupePar: "neutreBoite" },
    { a: "Ld", b: "P2L", si: "d2" }, { a: "Nd", b: "P2N", si: "d2" }, { a: "Ld", b: "P3L", si: "d3" }, { a: "Nd", b: "P3N", si: "d3" },
  ],
  noeuds: NOEUDS, noms: NOMS,
  pasDeVis: ["prise1-terre", "prise2-terre"],
  tableau: { rangees: [RANGEE1, RANGEE2] },
  etat: (p) => ({ bp1Etape: 0, bp2Etape: 0, plafond: 0, bobinePrec: p.id === "bpColle", bourdonne: p.id === "bpColle" }),
  majApp(e) {
    if (e.app.tl === undefined) { e.app.tl = false; e.app.bp1 = false; e.app.bp2 = false; }
    e.app.bp2Bloque = e.panne.id === "bpColle" && !e.repare;
  },
  circuitCoupe: (e) => !e.app.dj || !e.app.diff,
  contexte: (e) => `télérupteur sur ${e.app.tl ? "I" : "O"}${e.app.bp1 || e.app.bp2 ? ", bouton maintenu" : ""}`,
  gestesTournevis: ["demonterBP", "remonterBP", "ouvrirBoite", "fermerBoite"],
  vues: {
    openspace: (e, a) => vueOpenSpace(e, allumage(a)),
    bp1: (e) => vueBP(e, 1),
    bp2: (e) => vueBP(e, 2),
    plafond: (e, a) => vuePlafond(e, allumage(a)),
    tableau: (e) => vueTableau(e, {
      rangees: [RANGEE1, RANGEE2], relies: ["diff", "dj", "tl", "d2", "d3"], noms: NOMS, retour: "openspace",
      extra: e.bourdonne ? `<g>${texte(378, 380, "≋ ça bourdonne, c'est chaud ≋", 14, 800, "#b3261e")}</g>` : "",
    }),
  },
  entree(a) {
    a.dire("L'open space est dans la pénombre. Boutons à l'accueil et à la salle de réunion, tableau dans le local technique au fond.");
  },
  gestes: {
    bp(a, n) {
      const e = a.e;
      a.sons.interrupteur();
      if (e.app["bp" + n]) { a.dire("Le bouton est déjà maintenu enfoncé."); return; }
      e.app["bp" + n] = true; suivreBobine(a);
      const msg = e.bulle && e.bulle.t.includes("clac") ? e.bulle : null;
      e.app["bp" + n] = false; suivreBobine(a);
      a.dire(msg ? msg.t : "Tu appuies sur le bouton. Rien ne se passe.");
    },
    maintenir(a, n) {
      const e = a.e; e.app["bp" + n] = !e.app["bp" + n]; a.sons.interrupteur();
      const demonte = e["bp" + n + "Etape"] === 1;
      if (!e.app["bp" + n]) a.dire(demonte ? "Tu relâches le bouton." : "Mme Roussel relâche le bouton.");
      else a.dire(demonte ? "Tu maintiens le bouton enfoncé." : "Mme Roussel tient le bouton enfoncé pendant que tu vas mesurer ailleurs.");
    },
    manette(a, cle) {
      const e = a.e;
      if (cle === "tl") { e.app.tl = !e.app.tl; a.sons.disjoncteur(); a.temps(0.5); a.dire(`Tu bascules le télérupteur à la main : contact sur « ${e.app.tl ? "I" : "O"} ».`); return; }
      const ap = [...RANGEE1, ...RANGEE2].find((x) => x.cle === cle);
      e.app[cle] = !e.app[cle]; a.sons.disjoncteur(); a.temps(0.5);
      a.dire(`${ap.etiquette} : manette ${e.app[cle] ? "remontée" : "baissée"}.`);
    },
    demonterBP(a, n) { a.e["bp" + n + "Etape"] = 1; a.temps(3); a.sons.vis(); a.dire("Tu déclipses l'enjoliveur et tu sors le mécanisme du bouton-poussoir : ses deux bornes sont accessibles."); },
    remonterBP(a, n) { const e = a.e; e["bp" + n + "Etape"] = 0; e.app["bp" + n] = false; a.temps(3); a.sons.vis(); a.sons.clip(); a.dire("Bouton-poussoir remis en place."); },
    souleverDalle(a) { a.e.plafond = 1; a.temps(3); a.sons.clip(); a.dire("Escabeau en place : tu soulèves la dalle de faux plafond et tu la poses à côté. La boîte de dérivation et le driver de la dalle LED sont là."); },
    reposerDalle(a) { a.e.plafond = 0; a.temps(2); a.sons.clip(); a.dire("Dalle de faux plafond reposée."); },
    ouvrirBoite(a) { a.e.plafond = 2; a.temps(2); a.sons.clip(); a.dire("Couvercle de la boîte de dérivation retiré : trois connecteurs à levier."); },
    fermerBoite(a) { a.e.plafond = 1; a.temps(2); a.sons.clip(); a.dire("Boîte de dérivation refermée."); },
  },
  apres(a) { suivreBobine(a); },
  poser(a, id) {
    const e = a.e, chaud = (...n) => n.some((x) => a.pot.de(x) === 230);
    if (id === "remplacerTL") {
      if (e.vue !== "tableau") { a.dire("Le télérupteur est au tableau, dans le local technique."); return false; }
      if (chaud("TL1", "TLA1", "TL2", "TLA2")) { a.electrisation("en débranchant le télérupteur"); return false; }
      if (!e.verifies.has("TL1")) a.faute("Tu as remplacé le télérupteur sans avoir vérifié l'absence de tension sur ses bornes.");
      e.app.tl = false; return true;
    }
    if (id === "remplacerBP") {
      const n = e.vue === "bp1" ? 1 : e.vue === "bp2" ? 2 : 0;
      if (!n || e["bp" + n + "Etape"] !== 1) { a.dire("Pour changer un bouton-poussoir, démonte-le d'abord."); return false; }
      if (chaud(`BP${n}E`)) { a.electrisation("en débranchant le bouton-poussoir"); return false; }
      if (!e.verifies.has(`BP${n}E`)) a.faute("Tu as remplacé le bouton-poussoir sans avoir vérifié l'absence de tension.");
      return n === 2 ? true : "inutile";
    }
    if (id === "remplacerDriver") {
      if (e.vue !== "plafond" || e.plafond < 1) { a.dire("Le driver est posé sur la dalle LED, dans le faux plafond."); return false; }
      if (chaud("D2L", "D2N")) { a.electrisation("en débranchant le driver"); return false; }
      if (!e.verifies.has("D2L")) a.faute("Tu as remplacé le driver sans avoir vérifié l'absence de tension.");
      return true;
    }
    return false;
  },
  termine(a) {
    const e = a.e, d = allumage(a);
    return ["diff", "dj", "d2", "d3"].every((k) => e.app[k]) && d.d1 && d.d2 && d.d3 && !e.app.bp1 && !e.app.bp2
      && e.bp1Etape === 0 && e.bp2Etape === 0 && e.plafond === 0 && e.vue === "openspace";
  },
};
