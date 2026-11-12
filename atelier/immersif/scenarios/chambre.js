// Intervention « La lumière de la chambre » (maison, Mme Martin).
import { vueTableau } from "../commun.js";
import { vueChambre, vueEntree, vueInter, vuePlafonnier } from "./chambre-vues.js";

const RANGEE1 = [
  { cle: "diff", type: "id", haut: "40 A", ligne2: "IΔn 30 mA", typ: "AC", etiquette: "Différentiel 1" },
  { cle: "dj", type: "dj", cal: "C16", etiquette: "Éclairage chambres" },
  { cle: "d2", type: "dj", cal: "C20", etiquette: "Prises chambres" },
  { cle: "d3", type: "dj", cal: "C20", etiquette: "Prises séjour" },
  { cle: "d4", type: "dj", cal: "C16", etiquette: "Éclairage séjour" },
];
const RANGEE2 = [
  { cle: "diff2", type: "id", haut: "40 A", ligne2: "IΔn 30 mA", typ: "A", etiquette: "Différentiel 2" },
  { cle: "d5", type: "dj", cal: "C32", etiquette: "Plaque cuisson" },
  { cle: "d6", type: "dj", cal: "C20", etiquette: "Lave-linge" },
  { cle: "d7", type: "dj", cal: "C20", etiquette: "Four" },
  { cle: "d8", type: "dj", cal: "C20", etiquette: "Cuisine prises" },
];
const NOMS = {
  "diff-L": "sortie phase du différentiel", "diff-N": "sortie neutre du différentiel",
  "diff-amont-L": "arrivée phase du différentiel", "diff-amont-N": "arrivée neutre du différentiel",
  "dj-L": "sortie phase du disjoncteur Éclairage chambres", "dj-N": "sortie neutre du disjoncteur Éclairage chambres",
  "dj-amont-L": "arrivée phase du disjoncteur Éclairage chambres", "dj-amont-N": "arrivée neutre du disjoncteur Éclairage chambres",
  "d2-L": "sortie phase du disjoncteur Prises chambres", "d2-N": "sortie neutre du disjoncteur Prises chambres",
  "d2-amont-L": "arrivée phase (Prises chambres)", "d2-amont-N": "arrivée neutre (Prises chambres)",
  "d3-L": "sortie phase du disjoncteur Prises séjour", "d3-N": "sortie neutre du disjoncteur Prises séjour",
  "d3-amont-L": "arrivée phase (Prises séjour)", "d3-amont-N": "arrivée neutre (Prises séjour)",
  "d4-L": "sortie phase du disjoncteur Éclairage séjour", "d4-N": "sortie neutre du disjoncteur Éclairage séjour",
  "d4-amont-L": "arrivée phase (Éclairage séjour)", "d4-amont-N": "arrivée neutre (Éclairage séjour)",
  "terre": "bornier de terre", "int-E": "borne L de l'interrupteur", "int-S": "borne 1 de l'interrupteur",
  "prise-terre": "broche de terre de la prise", "prise-d": "alvéole droite de la prise", "prise-g": "alvéole gauche de la prise",
  "dcl-L": "borne L du DCL", "dcl-N": "borne N du DCL", "dcl-T": "borne de terre du DCL",
};
const NOEUDS = {
  "diff-L": "Ld", "diff-N": "Nd", "diff-amont-L": "L", "diff-amont-N": "N",
  "dj-L": "DjL", "dj-N": "DjN", "dj-amont-L": "Ld", "dj-amont-N": "Nd",
  "d2-L": "PrL", "d2-N": "PrN", "d2-amont-L": "Ld", "d2-amont-N": "Nd",
  "d3-L": "SjL", "d3-N": "SjN", "d3-amont-L": "Ld", "d3-amont-N": "Nd",
  "d4-L": "D4L", "d4-N": "D4N", "d4-amont-L": "Ld", "d4-amont-N": "Nd",
  "terre": "PE", "int-E": "IntE", "int-S": "IntS", "prise-terre": "PE", "prise-d": "PrL", "prise-g": "PrN",
  "dcl-L": "DclL", "dcl-N": "DclN", "dcl-T": "PE",
};

export default {
  id: "chambre",
  titre: "La lumière de la chambre",
  lieu: "Maison individuelle · chambre du rez-de-chaussée",
  client: { nom: "Mme Martin", court: "Mme Martin", initiales: "MM", teinte: "#c98f6b", role: "Propriétaire de la maison",
    humeurs: ["Mme Martin est agacée.", "Mme Martin est mitigée.", "Mme Martin est contente.", "Mme Martin est ravie."] },
  accueil: "« Bonsoir ! Merci d'être venu si vite. C'est la lumière de la chambre, elle ne marche plus. »",
  merci: "« La lumière ! Merci beaucoup. »",
  vueDepart: "chambre",
  tempsCible: 45,
  dialogue: {
    max: 5,
    fin: "« Bon, je vous laisse travailler. Je suis dans la cuisine si vous avez besoin. »",
    questions: [
      { id: "quoi", texte: "Qu'est-ce qui ne marche plus, exactement ?", reponse: {
        "*": "« La lampe du plafond de la chambre. »",
        isolement: "« Dès que j'allume la chambre, tout s'éteint : la lumière, les prises de la chambre et celles du salon. »" } },
      { id: "prises", apres: "quoi", texte: "Et les prises de la chambre, elles marchent ?", reponse: {
        "*": "« Oui, mon réveil est branché dessus, il marche très bien. »",
        isolement: "« Tant que je n'allume pas la chambre, oui. »" } },
      { id: "reste", apres: "quoi", texte: "Le reste de la maison fonctionne normalement ?", reponse: {
        "*": "« Oui, tout le reste marche. »",
        isolement: "« Oui, sauf quand j'allume la chambre : là, une bonne partie de la maison s'éteint d'un coup. »" } },
      { id: "comment", texte: "Comment ça s'est passé ?", reponse: {
        fildj: "« Elle clignotait depuis quelques jours, et hier soir elle s'est éteinte d'un coup. »",
        contact: "« Depuis un moment, il fallait appuyer plusieurs fois sur l'interrupteur. Ce matin, plus rien du tout. »",
        sortie: "« Hier soir, ça a grésillé du côté de l'interrupteur quand j'ai allumé, et puis plus rien. »",
        neutre: "« Elle clignotait de temps en temps, surtout quand on claquait la porte. Ce matin, plus rien. »",
        ampoule: "« Elle a clignoté un moment, puis elle s'est éteinte. L'interrupteur fait toujours son petit clic. »",
        isolement: "« Hier soir, j'ai allumé la chambre et clac, tout s'est éteint. Depuis, ça recommence à chaque fois. »" } },
      { id: "inter", apres: "comment", texte: "Et l'interrupteur, il se comporte comment quand vous appuyez ?", reponse: {
        "*": "« Normalement, il fait son petit clic comme d'habitude. »",
        contact: "« Il est tout mou, il ne fait plus son clic franc. Comme s'il était cassé à l'intérieur. »",
        sortie: "« Il fait son clic normal. Mais hier, j'ai entendu un petit grésillement derrière la plaque. »" } },
      { id: "odeur", apres: "comment", texte: "Vous avez senti une odeur de chaud, de plastique brûlé ?", reponse: {
        "*": "« Non, rien de spécial. »",
        fildj: "« Maintenant que vous le dites… dans l'entrée, près du tableau, ça sentait un peu le chaud ces derniers jours. »",
        sortie: "« Un peu, oui, près de l'interrupteur, hier soir. »" } },
      { id: "travaux", texte: "Quelqu'un a fait des travaux ou touché à l'électricité récemment ?", reponse: {
        "*": "« Non, personne n'a touché à rien. »",
        fildj: "« Mon fils a ajouté un circuit au tableau le mois dernier, pour le garage. Il s'y connaît un peu. »",
        isolement: "« Oui, le peintre est venu hier refaire le plafond de la chambre. »" } },
      { id: "luminaire", apres: "travaux", texte: "Le luminaire du plafond, quelqu'un l'a décroché récemment ?", reponse: {
        "*": "« Non, il n'a pas bougé depuis des années. »",
        isolement: "« Oui, le peintre, hier. Il l'a remis tout seul. Ça avait l'air de marcher… jusqu'à ce que j'allume. »",
        neutre: "« Non… mais il bouge un peu quand on claque la porte, il n'a jamais été très bien fixé. »" } },
      { id: "tableau", apres: "travaux", texte: "Quelqu'un a ouvert le tableau électrique ces derniers temps ?", reponse: {
        "*": "« Non, personne n'y a touché. »",
        fildj: "« Oui, mon fils, pour ajouter son disjoncteur juste à côté de celui des chambres. Il a dû desserrer des fils pour passer le sien. »",
        isolement: "« Le peintre a juste baissé la grosse manette pendant qu'il travaillait au plafond, puis il l'a remontée. »" } },
      { id: "essaye", texte: "Vous avez déjà essayé quelque chose ?", reponse: {
        "*": "« J'ai changé l'ampoule avec une neuve : rien. »",
        ampoule: "« Non, je n'avais pas d'ampoule de rechange à la maison. »",
        isolement: "« Je remonte la grosse manette bleue au tableau. Ça tient, jusqu'à ce que j'allume la chambre. »" } },
      { id: "manette", apres: "essaye", texte: "Au tableau, une manette était baissée ?", reponse: {
        "*": "« Non, je suis allée voir : tout était en haut. »",
        isolement: "« Oui, la grosse avec le bouton « T ». Les petites restent en haut. »" } },
      { id: "facture", texte: "Vous avez bien payé votre facture d'électricité ?", mauvaise: true, reponse: {
        "*": "« Évidemment ! Le reste de la maison marche, vous voyez bien. »" } },
      { id: "accuse", texte: "Vous êtes sûre que vous n'avez rien cassé ?", mauvaise: true, reponse: {
        "*": "« … Non. Je vous ai appelé pour réparer, pas pour m'accuser. »" } },
    ],
  },
  pannes: [
    { id: "fildj", visible: "dj-L", cible: "dj-L", reparation: "serrer",
      titre: "Phase desserrée à la sortie du disjoncteur « Éclairage chambres »",
      explication: "Au tableau, la vis de sortie du disjoncteur donne 230 V par rapport à la terre, mais à l'interrupteur, la borne d'entrée ne reçoit plus rien. La phase se perd entre les deux : en regardant de près, le fil rouge est mal engagé sous la vis de sortie du disjoncteur. Le fils de la cliente a desserré cette borne en ajoutant son circuit. Un serrage qui lâche fait d'abord clignoter la lampe, puis la coupe, et il chauffe (l'odeur près du tableau) : c'est un vrai risque d'incendie." },
    { id: "contact", visible: null, piece: "remplacerInter",
      titre: "Interrupteur usé : son contact ne se ferme plus",
      explication: "La phase arrive bien sur l'entrée de l'interrupteur (230 V par rapport à la terre de la prise). Interrupteur sur « I », on mesure encore 230 V entre son entrée et sa sortie : son contact reste ouvert alors qu'il devrait être fermé. Le mécanisme est usé (il était « tout mou »), il faut le remplacer." },
    { id: "sortie", visible: "int-S", cible: "int-S", reparation: "serrer", piece: "remplacerInter",
      titre: "Retour lampe desserré à la sortie de l'interrupteur",
      explication: "L'entrée de l'interrupteur a la phase, et sur « I », entrée ↔ sortie donne 0 V : le contact est bon. Mais la phase n'arrive pas au plafonnier. En sortant le mécanisme, on voit le fil orange (retour lampe) à moitié sorti de sa borne : il ne serre plus que l'isolant. Le grésillement et l'odeur venaient de ce mauvais contact." },
    { id: "neutre", visible: "dcl-N", cible: "dcl-N", reparation: "serrer",
      titre: "Neutre desserré dans la boîte du plafonnier",
      explication: "Au plafonnier, interrupteur sur « I » : L ↔ terre = 230 V, la phase arrive bien. Mais L ↔ N = 0 V : le neutre ne revient plus au tableau. Dans la boîte DCL, le fil bleu est sorti de sa borne (le luminaire mal fixé bougeait à chaque claquement de porte). Attention : quand le luminaire est branché et l'interrupteur sur « I », ce neutre coupé prend la tension de la phase à travers l'ampoule. Un neutre coupé peut être dangereux." },
    { id: "ampoule", visible: null, piece: "remplacerAmpoule",
      titre: "Ampoule grillée",
      explication: "Toutes les tensions sont bonnes : au plafonnier, interrupteur sur « I », L ↔ N = 230 V. Le circuit amène bien la tension jusqu'à la lampe : c'est le récepteur qui ne marche plus. Une ampoule LED ne se teste pas à l'ohmmètre (son électronique interne fausse la mesure) : on essaie une ampoule neuve, et la lumière revient. La cliente n'avait pas d'ampoule de rechange : elle n'avait donc rien essayé. Une LED qui clignote puis s'éteint, c'est souvent son alimentation interne qui lâche." },
    { id: "isolement", visible: "denude", cible: "dcl-L", reparation: "refaire", depart: { diff: false },
      fuite: ["diff", "dj", "inter"],
      titre: "Défaut d'isolement au plafonnier : le différentiel déclenche",
      explication: "Le différentiel 30 mA déclenche dès qu'on allume la chambre : un courant fuit vers la terre sur ce circuit, et seulement quand le retour lampe est alimenté. Au plafonnier, on trouve le fil orange (retour lampe) dénudé trop long, écrasé contre le fil de terre quand le peintre a remis le lustre. Le courant part à la terre au lieu de revenir par le neutre : le différentiel voit la différence et coupe." },
  ],
  pieces: [
    { id: "remplacerInter", nom: "Mécanisme d'interrupteur", prix: 9, minutes: 10 },
    { id: "remplacerAmpoule", nom: "Ampoule LED E27", prix: 6, minutes: 2 },
  ],
  liaisons: [
    { a: "L", b: "Ld", si: "diff" }, { a: "N", b: "Nd", si: "diff" },
    { a: "Ld", b: "DjL", si: "dj" }, { a: "Nd", b: "DjN", si: "dj" },
    { a: "DjL", b: "IntE", coupePar: "fildj" },
    { a: "IntE", b: "IntS", si: "inter", coupePar: "contact" },
    { a: "IntS", b: "DclL", coupePar: "sortie" },
    { a: "DclL", b: "DclN", charge: 70, si: "ampouleMontee", coupePar: "ampoule" },
    { a: "DclN", b: "DjN", coupePar: "neutre" },
    { a: "Ld", b: "PrL", si: "d2" }, { a: "Nd", b: "PrN", si: "d2" },
    { a: "Ld", b: "SjL", si: "d3" }, { a: "Nd", b: "SjN", si: "d3" },
    { a: "Ld", b: "D4L", si: "d4" }, { a: "Nd", b: "D4N", si: "d4" },
  ],
  noeuds: NOEUDS, noms: NOMS,
  pasDeVis: ["prise-terre", "prise-d", "prise-g"],
  tableau: { rangees: [RANGEE1, RANGEE2] },
  etat: () => ({ inter: 0, dcl: 0, ampoule: true, ampouleNeuve: false }),
  majApp(e) {
    if (e.app.inter === undefined) e.app.inter = false;
    e.app.ampouleMontee = e.dcl === 0 && e.ampoule;
  },
  circuitCoupe: (e) => !e.app.dj || !e.app.diff,
  contexte: (e) => `interrupteur sur ${e.app.inter ? "I" : "O"}`,
  gestesTournevis: ["sortirMeca", "remonterMeca", "ouvrirDcl", "fermerDcl"],
  vues: {
    chambre: (e, a) => { e.lampeAllumee = a.alimente("DclL", "DclN"); return vueChambre(e); },
    entree: (e) => vueEntree(e),
    tableau: (e) => vueTableau(e, { rangees: [RANGEE1, RANGEE2], relies: ["diff", "dj", "d2", "d3", "d4"], noms: NOMS, retour: "entree" }),
    inter: (e) => vueInter(e),
    plafonnier: (e, a) => { e.lampeAllumee = a.alimente("DclL", "DclN"); return vuePlafonnier(e); },
  },
  entree(a) { a.dire("La chambre est dans la pénombre. L'interrupteur est à côté de la porte, le tableau dans l'entrée."); },
  gestes: {
    interrupteur(a) { const e = a.e; e.app.inter = !e.app.inter; a.sons.interrupteur(); a.dire(e.app.inter ? "Clic. Interrupteur sur « I »." : "Clic. Interrupteur sur « O »."); },
    manette(a, cle) {
      const e = a.e; const tout = [...RANGEE1, ...RANGEE2]; const ap = tout.find((x) => x.cle === cle);
      e.app[cle] = !e.app[cle]; a.sons.disjoncteur(); a.temps(0.5);
      a.dire(`${ap.etiquette} : manette ${e.app[cle] ? "remontée" : "baissée"}.`);
    },
    deposerPlaque(a) { a.e.inter = 1; a.temps(1); a.sons.clip(); a.dire("Tu déclipses la plaque de finition. Le mécanisme est tenu par deux vis."); },
    sortirMeca(a) { a.e.inter = 2; a.temps(3); a.sons.vis(); a.dire("Tu dévisses les deux vis de fixation et tu sors le mécanisme de sa boîte : les bornes sont accessibles en bas."); },
    remonterMeca(a) { a.e.inter = 0; a.temps(3); a.sons.vis(); a.sons.clip(); a.dire("Mécanisme revissé, plaque reclipsée."); },
    decrocher(a) { a.e.dcl = 1; a.temps(3); a.sons.clip(); a.dire("Tu montes sur l'escabeau et tu débranches la fiche DCL : le luminaire est décroché."); },
    raccrocher(a) { a.e.dcl = 0; a.temps(2); a.sons.clip(); a.dire("Luminaire rebranché sur sa prise DCL."); },
    ouvrirDcl(a) { a.e.dcl = 2; a.temps(2); a.sons.clip(); a.dire("Boîte DCL ouverte : les trois bornes sont devant toi."); },
    fermerDcl(a) { a.e.dcl = 1; a.temps(2); a.sons.clip(); a.dire("Boîte DCL refermée."); },
    devisserAmpoule(a) { a.e.ampoule = false; a.temps(1); a.dire("Ampoule dévissée. C'est une ampoule LED : pas de filament à regarder, et l'ohmmètre ne dirait rien de fiable sur son électronique."); },
    visserAmpoule(a) { a.e.ampoule = true; a.temps(1); a.dire(a.e.ampouleNeuve ? "Ampoule neuve vissée." : "Ampoule revissée."); },
  },
  apres(a) {
    const e = a.e, f = e.panne.fuite;
    if (f && !e.repare && e.dcl === 0 && f.every((k) => e.app[k])) {
      e.app.diff = false; setTimeout(() => a.sons.disjoncteur(), 120);
      a.dire("Clac ! Dans l'entrée, le différentiel vient de déclencher. La chambre et le séjour sont dans le noir.", "alerte");
    }
  },
  poser(a, id) {
    const e = a.e;
    if (id === "remplacerAmpoule") {
      if (e.vue !== "plafonnier" || e.dcl !== 0 || e.ampoule) { a.dire("Pour changer l'ampoule, monte au plafonnier et dévisse d'abord l'ancienne."); return false; }
      e.ampouleNeuve = true; e.ampoule = true; return true;
    }
    if (id === "remplacerInter") {
      if (e.vue !== "inter" || e.inter !== 2) { a.dire("Pour changer le mécanisme, sors-le d'abord de sa boîte."); return false; }
      if (a.pot.de("IntE") === 230 || a.pot.de("IntS") === 230) { a.electrisation("en débranchant les fils de l'interrupteur"); return false; }
      if (!e.verifies.has("IntE")) a.faute("Tu as remplacé l'interrupteur sans avoir vérifié l'absence de tension sur ses bornes.");
      return true;
    }
    return false;
  },
  termine(a) {
    const e = a.e;
    return RANGEE1.every((x) => e.app[x.cle]) && a.alimente("DclL", "DclN") && e.inter === 0 && e.dcl === 0 && e.vue === "chambre";
  },
};
