// Intervention « La lumière de la chambre » (maison, Mme Martin).
import { vueTableau2, vueModule2 } from "../commun.js";
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
  v2: true,
  titre: "La lumière de la chambre",
  lieu: "Maison individuelle · chambre du rez-de-chaussée",
  client: { nom: "Mme Martin", court: "Mme Martin", initiales: "MM", teinte: "#c98f6b", role: "Propriétaire de la maison",
    humeurs: ["Mme Martin est agacée.", "Mme Martin est mitigée.", "Mme Martin est contente.", "Mme Martin est ravie."] },
  accueil: "« Bonsoir ! Merci d'être venu si vite. C'est la lumière de la chambre, elle ne marche plus. »",
  merci: "« La lumière ! Merci beaucoup. »",
  vueDepart: "chambre",
  rapprochees: ["inter", "plafonnier", "module"],
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
    { id: "ampoule", visible: null, piece: "remplacerAmpoule", inutiles: ["couper", "vat"],
      titre: "Ampoule grillée",
      explication: "Toutes les tensions sont bonnes : au plafonnier, interrupteur sur « I », L ↔ N = 230 V. Le circuit amène bien la tension jusqu'à la lampe : c'est le récepteur qui ne marche plus. Une ampoule LED ne se teste pas à l'ohmmètre (son électronique interne fausse la mesure) : on essaie une ampoule neuve, et la lumière revient. La cliente n'avait pas d'ampoule de rechange : elle n'avait donc rien essayé. Une LED qui clignote puis s'éteint, c'est souvent son alimentation interne qui lâche." },
    { id: "isolement", visible: "denude", cible: "dcl-L", reparation: "refaire", depart: { diff: false },
      fuite: ["diff", "dj", "inter"],
      titre: "Défaut d'isolement au plafonnier : le différentiel déclenche",
      explication: "Le différentiel 30 mA déclenche dès qu'on allume la chambre : un courant fuit vers la terre sur ce circuit, et seulement quand le retour lampe est alimenté. Au plafonnier, on trouve le fil orange (retour lampe) dénudé trop long, écrasé contre le fil de terre quand le peintre a remis le lustre. Le courant part à la terre au lieu de revenir par le neutre : le différentiel voit la différence et coupe." },
  ],
  pieces: [
    { id: "remplacerInter", nom: "Mécanisme d'interrupteur", prix: 9, minutes: 10 },
    { id: "remplacerAmpoule", nom: "Ampoule LED E27", feminin: true, prix: 6, minutes: 2 },
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
  etat: () => ({ plaque: true, visMeca: [true, true], mecaSorti: false, luminaire: true, capot: true, ampoule: true, ampouleNeuve: false }),
  majApp(e) {
    if (e.app.inter === undefined) e.app.inter = false;
    e.app.ampouleMontee = e.luminaire && e.ampoule;
  },
  circuitCoupe: (e) => !e.app.dj || !e.app.diff,
  contexte: (e) => `interrupteur sur ${e.app.inter ? "I" : "O"}`,
  voisins(vue) {
    const z = (v) => `[data-aller="${v}"]`;
    if (vue === "chambre") return [["inter", z("inter")], ["plafonnier", z("plafonnier")], ["entree", z("entree")]];
    if (vue === "entree") return [["tableau", z("tableau")], ["chambre", z("chambre")]];
    if (vue === "tableau") return [["entree", z("entree")], ...[...RANGEE1, ...RANGEE2].map((x) => [`module:${x.cle}`, z(`module:${x.cle}`)])];
    if (vue.startsWith("module:")) return [["tableau", z("tableau")]];
    return [["chambre", z("chambre")]];
  },
  vues: {
    chambre: (e, a) => { e.lampeAllumee = a.alimente("DclL", "DclN"); return vueChambre(e); },
    entree: () => vueEntree(),
    tableau: (e) => vueTableau2(e, { rangees: [RANGEE1, RANGEE2], retour: "entree" }),
    module: (e, a, cle) => vueModule2(e, { rangees: [RANGEE1, RANGEE2], relies: ["diff", "dj", "d2", "d3", "d4"], noms: NOMS }, cle),
    inter: (e, a) => { e.lampeAllumee = a.alimente("DclL", "DclN"); return vueInter(e); },
    plafonnier: (e, a) => { e.lampeAllumee = a.alimente("DclL", "DclN"); return vuePlafonnier(e); },
  },
  entree(a) { a.dire("La chambre est dans la pénombre. L'interrupteur est à côté de la porte, le tableau dans l'entrée."); },
  gestes: {
    interrupteur(a) {
      const e = a.e; e.app.inter = !e.app.inter; e.obs = true; e.verifLumiere = true; a.sons.interrupteur();
      a.anim("touche", [{ transform: "translateY(0)" }, { transform: `translateY(${e.app.inter ? -10 : 10}px)` }], 160);
    },
    manette(a, cle) {
      const e = a.e; const ap = [...RANGEE1, ...RANGEE2].find((x) => x.cle === cle);
      e.app[cle] = !e.app[cle]; a.sons.disjoncteur(); a.temps(0.5);
      a.anim(`man-${cle}`, [{ transform: "translateY(0)" }, { transform: `translateY(${e.app[cle] ? -36 : 36}px)` }], 180);
      if (!e.app[cle] && (cle === "dj" || cle === "diff")) e.coupe = true;
      a.dire(`${ap.etiquette} : manette ${e.app[cle] ? "remontée" : "baissée"}.`);
    },
    plaque(a) {
      const e = a.e;
      if (e.plaque) {
        a.anim("plaque", [{ transform: "none", opacity: 1 }, { transform: "translate(150px, 280px) rotate(-8deg) scale(.47)", opacity: 0.5 }], 480);
        e.plaque = false; a.temps(1); a.sons.clip();
        a.dire("Tu glisses le tournevis plat dans l'encoche : la plaque se déclipse. Le mécanisme est tenu par deux vis.");
      } else if (e.mecaSorti || !e.visMeca.every(Boolean)) a.dire("Revisse d'abord le mécanisme dans sa boîte avant de remettre la plaque.");
      else { e.plaque = true; a.temps(1); a.sons.clip(); a.dire("Plaque reclipsée."); }
    },
    visMeca(a, i) {
      const e = a.e; i = Number(i);
      if (e.mecaSorti) { a.dire("Rentre d'abord le mécanisme dans sa boîte."); return; }
      const x = i ? 566 : 374;
      if (e.visMeca[i]) {
        a.tourner(`vismeca-${i}`, "devisser", x, 270); e.visMeca[i] = false; a.temps(0.5);
        a.dire(e.visMeca.some(Boolean) ? "Une vis est sortie. Il en reste une." : "Les deux vis sont sorties : touche le mécanisme pour le tirer hors de sa boîte.", "ok");
      } else {
        a.tourner(null, "serrer", x, 270); e.visMeca[i] = true; a.temps(0.5);
        a.dire(e.visMeca.every(Boolean) ? "Mécanisme revissé. Tu peux reclipser la plaque." : "Une vis revissée. Il reste l'autre.", "ok");
      }
    },
    meca(a) {
      const e = a.e;
      if (!e.mecaSorti) {
        if (e.visMeca.some(Boolean)) { a.dire("Le mécanisme est encore tenu : touche chacune de ses deux vis pour la dévisser."); return; }
        a.anim("meca", [{ transform: "none" }, { transform: "translate(220px, -40px)" }], 450);
        e.mecaSorti = true; a.temps(1); a.sons.clip();
        a.dire("Tu tires le mécanisme hors de sa boîte : ses bornes L et 1 sont accessibles.");
        a.rappelTension();
      } else {
        a.anim("meca", [{ transform: "none", opacity: 1 }, { transform: "translate(-200px, 40px) scale(.75)", opacity: 0.6 }], 450);
        e.mecaSorti = false; a.temps(1); a.sons.clip();
        a.dire("Mécanisme rentré dans sa boîte. Revisse ses deux vis.");
      }
    },
    ampoule(a) {
      const e = a.e;
      if (e.ampoule) {
        a.anim("ampoule", [{ transform: "none", opacity: 1 }, { transform: "rotate(-300deg) translateY(30px)", opacity: 0.2 }], 520);
        e.ampoule = false; a.temps(1);
        a.dire("Ampoule dévissée. C'est une LED : pas de filament à regarder, et l'ohmmètre ne dirait rien de fiable sur son électronique.");
      } else { e.ampoule = true; a.temps(1); a.dire(e.ampouleNeuve ? "Ampoule neuve vissée." : "Ampoule revissée."); }
    },
    luminaire(a) {
      const e = a.e;
      if (e.luminaire) {
        a.anim("luminaire", [{ transform: "none", opacity: 1 }, { transform: "translate(130px, 200px) scale(.6)", opacity: 0.3 }], 520);
        e.luminaire = false; a.temps(2); a.sons.clip();
        a.dire("Tu débranches la fiche DCL : le luminaire est décroché. Le capot de la boîte DCL protège encore les bornes.");
      } else if (!e.capot) a.dire("Remets d'abord le capot de la boîte DCL.");
      else { e.luminaire = true; a.temps(2); a.sons.clip(); a.dire("Luminaire rebranché sur sa fiche DCL."); }
    },
    capot(a) {
      const e = a.e;
      if (e.capot) {
        a.anim("capot", [{ transform: "none", opacity: 1 }, { transform: "translate(-180px, 240px) rotate(12deg) scale(.5)", opacity: 0.5 }], 480);
        e.capot = false; a.temps(1); a.sons.clip();
        a.dire("Capot retiré : les trois bornes L, N et terre sont devant toi.");
        a.rappelTension();
      } else { e.capot = true; a.temps(1); a.sons.clip(); a.dire("Capot remis en place."); }
    },
  },
  apres(a) {
    const e = a.e, f = e.panne.fuite;
    let declenche = false;
    if (f && !e.repare && e.luminaire && e.capot && f.every((k) => e.app[k])) {
      e.app.diff = false; declenche = true; setTimeout(() => a.sons.disjoncteur(), 120);
      a.dire("Clac ! Dans l'entrée, le différentiel vient de déclencher. La chambre et le séjour sont dans le noir.", "alerte");
    }
    if (e.verifLumiere) {
      e.verifLumiere = false;
      if (!declenche) a.dire(!e.app.inter ? "Clic. Interrupteur sur « O »." : a.alimente("DclL", "DclN") ? "Clic. La lumière s'allume !" : "Clic. Interrupteur sur « I »… le plafonnier reste éteint.", e.app.inter && a.alimente("DclL", "DclN") ? "ok" : "info");
    }
  },
  poser(a, id) {
    const e = a.e;
    if (id === "remplacerAmpoule") {
      if (e.vue !== "plafonnier" || !e.luminaire || e.ampoule) { a.dire("Pour changer l'ampoule : monte au plafonnier et dévisse d'abord l'ancienne."); return false; }
      e.ampouleNeuve = true; e.ampoule = true; return true;
    }
    if (id === "remplacerInter") {
      if (e.vue !== "inter" || !e.mecaSorti) { a.dire("Pour changer le mécanisme : sors-le d'abord de sa boîte."); return false; }
      if (a.pot.de("IntE") === 230 || a.pot.de("IntS") === 230) { a.electrisation("en débranchant les fils de l'interrupteur"); return false; }
      if (!e.verifies.has("IntE")) a.faute("Tu as remplacé l'interrupteur sans avoir vérifié l'absence de tension sur ses bornes.");
      return true;
    }
    return false;
  },
  termine(a) {
    const e = a.e;
    return RANGEE1.every((x) => e.app[x.cle]) && a.alimente("DclL", "DclN") && e.plaque && !e.mecaSorti && e.visMeca.every(Boolean) && e.luminaire && e.capot && e.ampoule;
  },
  objectif: "Trouve pourquoi le plafonnier de la chambre ne s'allume plus, et répare.",
  indices,
};

/* ---------- Aide : la prochaine étape du dépanneur, selon ce qui a déjà été fait ---------- */
const T = ["prise-terre", "terre", "dcl-T"];
function H(ou, quoi, comment, vue, cible) { return { ou, quoi, comment, vue, cible }; }
const POINTE = '.pointe[data-pointe="rouge"]';
function indices(a) {
  const h = indice(a);
  // sur l'escabeau, on dit d'abord d'en descendre si la suite se passe ailleurs
  if (h && a.e.vue === "plafonnier" && h.vue && h.vue !== "plafonnier") h.quoi = `Descends de l'escabeau. ${h.quoi}`;
  return h;
}
function indice(a) {
  const e = a.e, p = e.panne.id;
  // a-t-on mesuré x ↔ (une des refs), circuit sous tension (ou coupé) ?
  const m = (x, refs, { lecture, sousTension = true, inter } = {}) => e.mesures.some((r) =>
    ((r.a === x && refs.includes(r.b)) || (r.b === x && refs.includes(r.a))) && r.cal === "V" && (!lecture || r.lecture === lecture)
    && (sousTension ? !r.coupe : r.coupe) && (inter === undefined || r.inter === inter));
  const couperDj = (pourquoi) => H("Le tableau, dans l'entrée", `${pourquoi} Avant de toucher quoi que ce soit, coupe le disjoncteur « Éclairage chambres ».`,
    "Entrée → Ouvrir le tableau → touche la manette du disjoncteur « Éclairage chambres » (2e appareil de la rangée du haut) pour la baisser.", "tableau", '[data-geste="manette:dj"]');
  if (!e.poses.length) return H("Mme Martin (bouton en bas de l'écran)", "Commence par écouter la cliente : pose-lui deux ou trois questions.", "Touche « 💬 Mme Martin », puis choisis une question. Évite celles qui accusent.", null, '[data-panneau="client"]');
  if (e.repare) return remise(a);
  if (!e.obs) return H("L'interrupteur de la chambre", "Constate la panne toi-même : appuie sur l'interrupteur et regarde si le plafonnier s'allume.", "Dans la chambre, touche l'interrupteur pour t'en approcher, puis touche sa touche.", "inter", '[data-geste="interrupteur"]');
  if (p === "isolement") {
    if (!e.coupe) return couperDj("Le différentiel déclenche dès qu'on allume : un courant fuit vers la terre sur ce circuit.");
    const o = ouvrirPlafonnier(e); if (o) return o;
    if (!e.verifies.has("DclL")) return H("La boîte DCL du plafonnier", "Vérifie l'absence de tension avant de toucher : mesure L ↔ terre.", "Calibre V~. Pointe rouge sur la borne L, pointe noire sur la borne de terre : tu dois lire 0 V.", "plafonnier", POINTE);
    return H("La borne L du DCL", "Regarde le fil orange : il est dénudé trop long et touche le fil de terre. Refais la connexion.", "Touche la borne L : tu recoupes le cuivre abîmé, tu redénudes à la bonne longueur et tu resserres.", "plafonnier", '[data-vis="dcl-L"]');
  }
  if (!m("int-E", T)) {
    const o = accesInter(e); if (o) return o;
    return H("Les bornes de l'interrupteur", "La phase arrive-t-elle à l'interrupteur ? Mesure entre sa borne L et la terre de la prise.", "Calibre V~ en bas. Pointe rouge sur la borne L, pointe noire sur la broche de terre de la prise. Glisse une pointe, ou touche-la puis touche la borne.", "inter", POINTE);
  }
  if (p === "fildj") {
    if (!m("dj-L", T)) return H("Le disjoncteur « Éclairage chambres »", "Rien n'arrive à l'interrupteur. Remonte au tableau : la sortie du disjoncteur donne-t-elle 230 V ?", "Entrée → tableau → touche le bas du disjoncteur « Éclairage chambres » pour t'en approcher. Mesure sa borne de sortie L (en bas à droite) par rapport au bornier de terre.", "module:dj", POINTE);
    if (!e.coupe) return couperDj("Le disjoncteur donne 230 V, l'interrupteur rien : la liaison entre les deux est en cause. Regarde la vis de sortie : le fil rouge est mal engagé.");
    if (!e.verifies.has("DjL")) return H("Le disjoncteur « Éclairage chambres »", "Vérifie l'absence de tension sur sa sortie L avant de serrer.", "Pointe rouge sur la borne de sortie L, pointe noire sur le bornier de terre : 0 V attendu.", "module:dj", POINTE);
    return H("La borne de sortie L du disjoncteur", "Resserre le fil rouge sous sa vis.", "Touche la borne de sortie L : le tournevis vient serrer.", "module:dj", '[data-vis="dj-L"]');
  }
  if (!m("int-E", ["int-S"], { inter: true })) {
    if (!e.app.inter) return H("La touche de l'interrupteur", "La phase arrive bien. Mets l'interrupteur sur « I » pour tester son contact.", "Touche la touche du mécanisme.", "inter", '[data-geste="interrupteur"]');
    return H("Les bornes L et 1 de l'interrupteur", "Sur « I », mesure entre ses deux bornes : 0 V, le contact est fermé ; 230 V, il reste ouvert.", "Pointe rouge sur la borne L, pointe noire sur la borne 1.", "inter", POINTE);
  }
  if (p === "contact") {
    if (!e.coupe) return couperDj("Sur « I », il reste 230 V entre L et 1 : le contact ne se ferme plus, le mécanisme est usé.");
    if (!e.verifies.has("IntE")) return H("Les bornes de l'interrupteur", "Vérifie l'absence de tension avant de débrancher : L ↔ terre de la prise.", "Pointe rouge sur la borne L, pointe noire sur la broche de terre : 0 V attendu.", "inter", POINTE);
    return H("La camionnette", "Remplace le mécanisme d'interrupteur.", "Touche « 🚐 Camionnette » et choisis le mécanisme d'interrupteur.", null, '[data-panneau="camion"]');
  }
  if (p === "sortie") {
    if (!e.coupe) return couperDj("Le contact est bon (0 V entre L et 1), mais regarde la borne 1 : le fil orange est à moitié sorti.");
    if (!e.verifies.has("IntS")) return H("La borne 1 de l'interrupteur", "Vérifie l'absence de tension sur la borne 1 avant de serrer.", "Pointe rouge sur la borne 1, pointe noire sur la broche de terre : 0 V attendu.", "inter", POINTE);
    return H("La borne 1 de l'interrupteur", "Engage bien le fil orange sous la vis et resserre.", "Touche la borne 1 : le tournevis vient serrer.", "inter", '[data-vis="int-S"]');
  }
  // neutre ou ampoule : on monte au plafonnier
  if (!m("dcl-L", ["dcl-N"], { inter: true })) {
    if (!e.app.inter) return H("La touche de l'interrupteur", "Laisse l'interrupteur sur « I » pour mesurer au plafonnier.", "Touche la touche de l'interrupteur.", "inter", '[data-geste="interrupteur"]');
    const o = ouvrirPlafonnier(e, "Le contact de l'interrupteur est bon : la phase repart vers le plafonnier. Va voir là-haut."); if (o) return o;
    return H("Les bornes du DCL", "Interrupteur sur « I », mesure L ↔ N, puis L ↔ terre.", "Pointe rouge sur la borne L, pointe noire sur la borne N, puis sur la terre.", "plafonnier", POINTE);
  }
  if (p === "neutre") {
    if (!e.coupe) return couperDj("La phase arrive (L ↔ terre = 230 V) mais pas le retour : L ↔ N = 0 V. Le neutre est coupé : regarde la borne N.");
    if (!e.verifies.has("DclN")) return H("La borne N du DCL", "Vérifie l'absence de tension sur la borne N avant de serrer.", "Pointe rouge sur la borne N, pointe noire sur la terre : 0 V attendu.", "plafonnier", POINTE);
    return H("La borne N du DCL", "Rengage le fil bleu sous sa vis et resserre.", "Touche la borne N : le tournevis vient serrer.", "plafonnier", '[data-vis="dcl-N"]');
  }
  // ampoule
  if (!e.capot) return H("La boîte DCL", "L ↔ N = 230 V : la tension arrive jusqu'au luminaire. Le circuit est bon, c'est la lampe. Remets le capot.", "Touche le capot posé à gauche.", "plafonnier", '[data-geste="capot"]');
  if (!e.luminaire) return H("Le luminaire", "Raccroche le luminaire.", "Touche le luminaire posé à droite.", "plafonnier", '[data-geste="luminaire"]');
  if (e.ampoule) return H("L'ampoule", "Dévisse l'ampoule qui ne marche plus.", "Touche l'ampoule.", "plafonnier", '[data-geste="ampoule"]');
  return H("La camionnette", "Pose une ampoule neuve.", "Touche « 🚐 Camionnette » et choisis l'ampoule LED.", null, '[data-panneau="camion"]');
}
function accesInter(e) {
  if (e.plaque) return H("L'interrupteur de la chambre", "Pour mesurer, il faut accéder aux bornes : commence par déclipser la plaque.", "Approche-toi de l'interrupteur et touche l'encoche sous la plaque.", "inter", '[data-geste="plaque"]');
  if (!e.mecaSorti && e.visMeca.some(Boolean)) return H("Les vis du mécanisme", "Dévisse les deux vis qui tiennent le mécanisme.", "Touche une vis : le tournevis la dévisse. Puis l'autre.", "inter", `[data-geste="visMeca:${e.visMeca[0] ? 0 : 1}"]`);
  if (!e.mecaSorti) return H("Le mécanisme", "Sors le mécanisme de sa boîte.", "Touche le mécanisme.", "inter", '[data-geste="meca"]');
  return null;
}
function ouvrirPlafonnier(e, pourquoi = "") {
  if (e.luminaire) return H("Le plafonnier", `${pourquoi} Décroche le luminaire.`.trim(), "Dans la chambre, touche le plafonnier pour monter sur l'escabeau, puis touche la fiche DCL en haut.", "plafonnier", '[data-geste="luminaire"]');
  if (e.capot) return H("La boîte DCL", "Retire le capot de la boîte DCL pour voir les bornes.", "Touche le capot.", "plafonnier", '[data-geste="capot"]');
  return null;
}
function remise(a) {
  const e = a.e;
  const ok = (q, c, vue, cible) => H("Remise en état", q, c, vue, cible);
  if (!e.capot) return ok("C'est réparé. Remets le capot de la boîte DCL.", "Touche le capot posé à gauche.", "plafonnier", '[data-geste="capot"]');
  if (!e.luminaire) return ok("Raccroche le luminaire.", "Touche le luminaire posé à droite.", "plafonnier", '[data-geste="luminaire"]');
  if (!e.ampoule) return ok("Revisse l'ampoule.", "Touche la douille de l'ampoule.", "plafonnier", '[data-geste="ampoule"]');
  if (e.mecaSorti) return ok("C'est réparé. Rentre le mécanisme dans sa boîte.", "Touche « Rentrer le mécanisme ».", "inter", '[data-geste="meca"]');
  if (!e.visMeca.every(Boolean)) return ok("Revisse le mécanisme.", "Touche chaque trou de vis.", "inter", `[data-geste="visMeca:${e.visMeca[0] ? 1 : 0}"]`);
  if (!e.plaque) return ok("Reclipse la plaque.", "Touche la plaque posée à côté.", "inter", '[data-geste="plaque"]');
  const bas = RANGEE1.find((x) => !e.app[x.cle]);
  if (bas) return ok(`Remets le courant : remonte la manette « ${bas.etiquette} ».`, "Entrée → tableau → touche la manette baissée.", "tableau", `[data-geste="manette:${bas.cle}"]`);
  if (!e.app.inter) return ok("Essaie : allume la lumière.", "Touche la touche de l'interrupteur.", "inter", '[data-geste="interrupteur"]');
  return ok("Regarde si le plafonnier éclaire.", "Retourne dans la chambre.", "chambre", null);
}
