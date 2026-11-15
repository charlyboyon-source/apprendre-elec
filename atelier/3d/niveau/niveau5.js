// Niveau 5 — « La lumière de l'escalier ne s'éteint plus » : les parties communes d'un petit immeuble.
// Minuterie et boutons-poussoirs : séparer la commande de la puissance, chercher par moitiés au lieu de tout démonter.
// Câblage : ../moteur/logements/immeuble.js
import { CAGE, monter, descendre } from "./cage.js";
import { immeuble, causesImmeuble, reperesImmeuble as F } from "../moteur/logements/immeuble.js";

const porte = (vers, mur, u, y = 1.025) => ({ t: "porte", vers, mur, u, y });
// les quatre niveaux de la cage : le hall, puis un palier par étage, empilés dans le même espace
const LP = 2.6, LH = 4.0, cage = (k) => ({ ensemble: "cage", coque: false, pos: [0, k * CAGE.H, k ? -LH / 2 + LP / 2 : 0], taille: [3.8, LP], h: 2.6, sombre: true, teinte: 0xf1eee6, camera: [0, 1.62, LP / 2 - 0.9], pitch: -0.06 });
const TEMPO = 3; // minutes : le réglage de cette minuterie (une donnée de l'histoire, pas une valeur de norme)
const allume = (P) => P.calc().allume("l_hall");
const alimente = (P) => P.calc().tension("Q2.Lout", "Q2.Nout") >= 50;
const blancsOtes = (P) => Object.keys(P.e.deconnecte).filter((k) => P.inst.conducteur[k.split(":")[0]].role === "retour_bp");
const commandeOtee = (P) => blancsOtes(P).some((k) => k.startsWith(`${F.commande}:`));
const X = (P) => P.x5 || (P.x5 = { lit: true, sig: "", depuis: 0, dit: "" });
const NOMS = { bp_hall: "du hall", bp_porte: "de la porte d'entrée", bp_1: "du 1er étage", bp_2: "du 2e étage", bp_3: "du 3e étage", bp_cave: "de la cave" };

// appuyer sur un bouton-poussoir
const appui = (id) => (P, o) => {
  const x = X(P); P.essais.add(id);
  if (P.cause === "B" && id === "bp_2" && !P.e.repare[0]) {
    P.vus.add("colle:bp_2");
    o.dire("Tu appuies sur le bouton du 2e : la touche ne bouge pas. Elle est déjà enfoncée, collée par une coulure de peinture fraîche : ce bouton « appuie » en permanence.", "alerte");
    o.noter("indices", "2e étage : la touche du bouton-poussoir est restée enfoncée, collée par la peinture."); return true;
  }
  const avant = allume(P), tension = P.calc().tension(`${id}.1`, "terre.PE") >= 50;
  P.inst.agir(P.e, { type: "appuyer", id }); const apres = allume(P); x.lit = apres;
  let t = `Bouton-poussoir ${NOMS[id]} : `;
  t += !tension ? "clic… rien. Le circuit de l'escalier n'est pas sous tension." : avant ? "clic. La lumière était déjà allumée : rien ne change." : apres ? "clic : toute la cage d'escalier s'allume." : "clic… rien ne s'allume.";
  if (id === "bp_cave") { P.vus.add("voyant:cave"); t += " Son voyant ne s'allume plus : il est grillé. C'est sans rapport avec la panne, mais à signaler au syndic."; }
  o.dire(t, !tension || (!avant && !apres) ? "alerte" : "info");
  o.noter("constats", `Bouton-poussoir ${NOMS[id]} : ${!tension ? "sans tension" : avant ? "lumière déjà allumée" : apres ? "il allume l'escalier" : "sans effet"}.`);
  return apres;
};
const lampe = (id, nom) => (P, o) => { const on = P.calc().allume(id); o.dire(on ? `${nom} : elle éclaire.` : alimente(P) ? `${nom} : éteinte. La minuterie ne l'alimente pas en ce moment.` : `${nom} : éteinte, le circuit est coupé.`, "info"); return on; };
const boiteSaine = (nom) => () => ({ texte: `${nom} : ouverte. Cinq bornes : phase (rouge), neutre (bleu), terre, retour bouton-poussoir (blanc) et retour lampe (orange). Les connexions sont propres.` });

export default {
  id: "niveau5", numero: 5, titre: "La lumière de l'escalier ne s'éteint plus", page: "atelier-3d-5.html",
  logement: immeuble, causes: causesImmeuble, fils: F, filParFil: true,
  nomsDifferentiels: { ID1: "du tableau" },
  nomsBornes: { "bt.PE": "bornier de terre du tableau" },
  outils: ["vat", "multi", "ohm"],
  client: { nom: "Mme Costa", court: "Mme Costa", initiales: "MC", teinte: "#5a6fa8", role: "Gestionnaire du syndic · immeuble de trois étages, sans ascenseur" },
  accroche: "« Merci d'être venu. La lumière de l'escalier reste allumée jour et nuit depuis lundi : les copropriétaires râlent pour la facture. Ah, et les peintres ont fini la cage d'escalier la semaine dernière. Je vous ouvre le local technique, je n'ai que dix minutes. »",
  mission: "Trouve pourquoi la lumière de l'escalier ne s'éteint plus, prouve-le, répare, puis vérifie chaque bouton et l'extinction.",
  depart: "hall",
  pitch: "Dix heures du matin, un petit immeuble de trois étages sans ascenseur. Dans la cage d'escalier, sans fenêtre, toutes les lampes sont allumées. Mme Costa, du syndic, t'attend dans le hall avec la clé du local technique.",
  entrer: "Entrer dans l'immeuble",
  debut: "Mme Costa t'a ouvert le local technique, à droite du hall. Le tableau des parties communes est dedans, avec la minuterie et son schéma. L'escalier monte au fond.",
  preparer(e, cause) { if (cause === "A") e.modes.mn = "permanent"; },
  humeurs: [{ apres: 10, texte: "Mme Costa regarde sa montre : « Je dois filer, j'ai une assemblée générale. Vous m'appelez quand c'est réglé ? Le local reste ouvert. »" }],
  questions: [
    { id: "depuis", texte: "Depuis quand reste-t-elle allumée ?", reponse: () => "« Depuis lundi matin. Avant, elle s'éteignait toute seule au bout de trois minutes, comme il faut. »" },
    { id: "travaux", texte: "Les peintres ont travaillé où, exactement ?", reponse: () => "« Toute la cage d'escalier, du hall au troisième : murs, plafonds, et ils ont démonté puis remonté les couvercles des boîtes pour peindre derrière. Ils ont fini vendredi. »" },
    { id: "local", texte: "Qui a la clé du local technique ?", reponse: () => "« Le gardien, moi… et les peintres l'ont eue toute la semaine, pour brancher leurs outils et avoir de la lumière. »" },
    { id: "couper", texte: "Je peux couper l'éclairage de l'escalier pendant que je cherche ?", reponse: () => "« Oui, mais prévenez les habitants : il y a une affichette « intervention en cours » sur le panneau du hall, mettez-la bien en vue. Sans fenêtre, c'est le noir complet. »" },
    { id: "lampes", texte: "Vous avez fait changer les ampoules ?", reponse: () => "« Non. Elles marchent, c'est bien le problème : elles marchent tout le temps. »" },
  ],
  regards: {
    schema: (P) => { P.vus.add("lu:schema"); return { texte: "Le schéma collé près du tableau : chaque bouton-poussoir envoie la phase, par le fil blanc, sur la borne B de la minuterie. La minuterie ferme alors son contact et alimente toutes les lampes par la borne S et le fil orange, pendant trois minutes. La commande (le blanc) et la puissance (l'orange) sont deux chemins séparés.", indice: "Schéma : boutons → fil blanc → borne B de la minuterie (commande) ; borne S → fil orange → lampes (puissance)." }; },
    mn: (P) => { const perm = P.e.modes.mn === "permanent"; P.vus.add(perm ? "lu:mn:permanent" : "lu:mn:auto");
      return { texte: `La minuterie : son sélecteur est sur « ${perm ? "marche permanente" : "auto"} », la temporisation est réglée sur trois minutes.${perm ? " En marche permanente, elle alimente les lampes sans jamais couper." : ""}`, type: perm ? "alerte" : "info", valeur: perm, indice: perm ? "Au tableau : le sélecteur de la minuterie est sur « marche permanente »." : undefined }; },
  },
  gestes: {
    bp_hall: appui("bp_hall"), bp_porte: appui("bp_porte"), bp_1: appui("bp_1"), bp_2: appui("bp_2"), bp_3: appui("bp_3"), bp_cave: appui("bp_cave"),
    l_hall: lampe("l_hall", "Lampe du hall"), l_1: lampe("l_1", "Lampe du 1er étage"), l_2: lampe("l_2", "Lampe du 2e étage"), l_3: lampe("l_3", "Lampe du 3e étage"), l_cave: lampe("l_cave", "Lampe de la cave"),
    affichette(P, o) { const deja = P.vus.has("affichette"); P.vus.add("affichette"); o.dire(deja ? "L'affichette « intervention en cours » est déjà en place sur la porte du hall." : "Tu poses l'affichette « intervention en cours — éclairage coupé par moments » bien en vue sur la porte du hall. Les habitants sont prévenus.", "ok"); return true; },
  },
  ouvertures: {
    bd_tab: boiteSaine("Bornier de départ de l'escalier"), bd_hall: boiteSaine("Boîte du hall"), bd_1: boiteSaine("Boîte du 1er étage"), bd_2: boiteSaine("Boîte du 2e étage"), bd_cave: boiteSaine("Boîte de la cave"),
    bd_3: (P) => (P.cause === "D" && !P.e.repare[0]
      ? (P.vus.add("pince:bd_3"), { texte: "Boîte du 3e étage : en la refermant, quelqu'un a pincé les conducteurs sous le couvercle. L'isolant du fil blanc est entaillé, et son cuivre touche la borne de phase.", type: "alerte", indice: "3e étage : dans la boîte, le fil blanc (retour bouton-poussoir) pincé touche la phase." })
      : boiteSaine("Boîte du 3e étage")()),
  },
  // ce que le jeu constate après chaque geste : l'escalier qui s'éteint ou se rallume, la temporisation dépassée
  apresAction(P, a, o) {
    const x = X(P), lit = allume(P), alim = alimente(P), blancs = blancsOtes(P), auto = P.e.modes.mn === "auto";
    const sig = `${alim}|${P.e.modes.mn}|${blancs.sort().join(",")}`;
    if (sig !== x.sig) { x.sig = sig; x.depuis = P.minutes; }
    if (a.type === "deplacer" && a.lieu === "palier2" && !P.vus.has("voisin")) { P.vus.add("voisin"); o.dire("Une porte s'entrouvre, un voisin passe la tête : « Ah, c'est pour la lumière ? Moi je croyais que c'était fait exprès. »", "client"); }
    if (a.type === "manette" && a.id === "Q2" && !P.e.positions.Q2 && !P.vus.has("affichette") && !P.vus.has("conseil:affichette")) { P.vus.add("conseil:affichette"); P.conseils.push("Avant de plonger une cage d'escalier dans le noir, on prévient : l'affichette « intervention en cours » se pose dans le hall avant de couper."); o.dire("L'escalier est dans le noir, et personne n'est prévenu : l'affichette est restée sur le panneau du hall.", "alerte"); }
    const change = lit !== x.lit; x.lit = lit;
    if (change && alim) o.dire(lit ? "Les lampes de l'escalier se rallument." : "La temporisation est finie : les lampes de l'escalier s'éteignent.", lit ? "info" : "ok");
    // l'escalier est éteint, sous tension et en « auto » : c'est un constat (une fois par situation)
    if (alim && auto && !lit && x.eteint !== sig) {
      x.eteint = sig;
      if (blancs.length) { P.vus.add("extinction:isolee"); if (!change) o.dire("Le courant est revenu et l'escalier reste éteint : avec ce fil blanc séparé, plus rien ne commande la minuterie.", "ok"); o.noter("constats", `Fil blanc séparé (${blancs.map((k) => P.nomBorne(P.inst.conducteur[k.split(":")[0]][k.split(":")[1]])).join(" ; ")}) : l'escalier s'éteint.`); }
      else { P.vus.add("extinction:auto"); o.noter("constats", "Minuterie sur « auto », tout raccordé : l'escalier s'éteint à la fin de la temporisation."); }
    }
    if (lit && alim && auto && P.minutes - x.depuis >= TEMPO + 1 && x.dit !== sig) {
      x.dit = sig; P.vus.add("reste:auto");
      if (commandeOtee(P)) { P.vus.add("reste:sans_commande"); o.dire("Plus de trois minutes ont passé. Le fil blanc est débranché de la minuterie : plus rien ne la commande, et pourtant les lampes restent allumées.", "alerte"); o.noter("indices", "Fil blanc débranché de la borne de commande de la minuterie : les lampes restent allumées après la temporisation."); }
      else if (blancs.length) { o.dire("Plus de trois minutes ont passé et les lampes restent allumées : ce qui commande la minuterie n'est pas du côté que tu viens de séparer.", "info"); o.noter("constats", `Fil blanc séparé (${blancs.map((k) => P.nomBorne(P.inst.conducteur[k.split(":")[0]][k.split(":")[1]])).join(" ; ")}) : l'escalier reste allumé après la temporisation.`); }
      else o.noter("constats", "Minuterie sur « auto » : l'escalier reste allumé bien après les trois minutes de temporisation.");
    }
  },
  apresMesure(P, m) {
    if (m.outil !== "multi") return null;
    const pts = [m.a, m.b], blanc = pts.find((p) => p.endsWith(".bp") || p === "mn.B" || (p.includes("#") && P.inst.conducteur[p.split("#")[0]].role === "retour_bp"));
    if (!blanc || !pts.some((p) => p !== blanc && /\.(n|N|pe|PE|Nout)$/.test(p))) return null;
    if (m.valeur >= 200) { P.vus.add("m:blanc"); return { texte: "230 V sur le fil blanc alors que personne n'appuie sur un bouton : quelque chose envoie la phase en permanence sur la commande de la minuterie.", type: "alerte", indice: "230 V en permanence sur le retour bouton-poussoir (fil blanc)." }; }
    if (blanc === "mn.B" || blanc.startsWith("bd_tab.")) P.vus.add("m:B0");
    return { texte: "0 V sur le fil blanc : aucune commande n'arrive ici en ce moment.", type: "info" };
  },
  attente: (P) => (alimente(P) ? (allume(P) ? "Les lampes de l'escalier sont allumées." : "L'escalier est éteint.") : "Le circuit de l'escalier est coupé : il fait noir dans la cage."),
  preuve(P) {
    const v = (k) => P.vus.has(k);
    if (P.cause === "A" && (v("lu:mn:permanent") || v("mode:mn:auto")) && v("extinction:auto")) return "Le sélecteur de la minuterie était sur « marche permanente ». Remis sur « auto », l'escalier s'éteint à la fin de la temporisation.";
    if (P.cause === "B" && v("colle:bp_2") && (v("extinction:isolee") || v("m:blanc"))) return v("extinction:isolee") ? "En séparant le fil blanc par étage, l'escalier s'éteint dès que le 2e est isolé ; et la touche du bouton du 2e est collée, enfoncée." : "230 V en permanence sur le fil blanc, et la touche du bouton du 2e est collée, enfoncée : il commande la minuterie sans arrêt.";
    if (P.cause === "C" && (v("reste:sans_commande") || (v("m:B0") && v("reste:auto")))) return v("reste:sans_commande") ? "Fil blanc débranché de la borne de commande, sélecteur sur « auto » : les lampes restent allumées après la temporisation. Le contact de la minuterie est collé." : "0 V sur la borne de commande de la minuterie, sélecteur sur « auto », et les lampes restent allumées après la temporisation : son contact est collé.";
    if (P.cause === "D" && v("pince:bd_3") && (v("extinction:isolee") || v("m:blanc"))) return v("extinction:isolee") ? "En séparant le fil blanc par étage, le défaut est au-dessus du 2e ; dans la boîte du 3e, le fil blanc pincé touche la phase." : "230 V en permanence sur le fil blanc sans qu'aucun bouton soit enfoncé ; dans la boîte du 3e, le fil blanc pincé touche la phase.";
    return null;
  },
  indices(P) {
    const v = (k) => P.vus.has(k), methode = "Une minuterie, c'est deux chemins : la commande (les boutons et le fil blanc) et la puissance (le contact et le fil orange). Commence par le plus simple, au tableau, puis décide lequel des deux chemins est en cause.";
    let zone, mesure;
    if (!v("lu:mn:permanent") && !v("lu:mn:auto") && !v("mode:mn:auto") && !v("mode:mn:permanent")) { zone = "Le local technique : la minuterie elle-même, au tableau."; mesure = "Approche-toi de la rangée et touche l'étiquette de la minuterie : tu lis la position de son sélecteur."; }
    else if (P.e.modes.mn === "permanent") { zone = "Le sélecteur de la minuterie."; mesure = "Remets-le sur « auto », puis attends plus de trois minutes (bouton « Temps ») et regarde si l'escalier s'éteint."; }
    else if (!v("m:blanc") && !v("m:B0") && !blancsOtes(P).length && !v("extinction:auto")) { zone = "Toujours au tableau : la borne B de la minuterie, là où arrive le fil blanc."; mesure = "Multimètre entre la borne B et le neutre (ou la terre). 230 V sans que personne n'appuie : la commande est en cause. 0 V et les lampes allumées : c'est la minuterie."; }
    else if (v("m:blanc") && !v("extinction:isolee") && !v("colle:bp_2") && !v("pince:bd_3")) { zone = "La ligne des boutons. Cherche par moitiés : la boîte du 1er étage coupe la colonne en deux."; mesure = "Pose l'affichette, coupe « Éclairage escalier », vérifie l'absence de tension au VAT, ouvre la boîte du 1er, débranche le fil blanc qui monte, remets le courant et attends. Éteint : le défaut est plus haut. Recommence au 2e."; }
    else if (!v("colle:bp_2") && !v("pince:bd_3") && P.cause !== "C" && P.cause !== "A") { zone = "Tu sais à quel étage chercher. Il n'y a que deux choses sur un palier : le bouton et la boîte."; mesure = "Appuie sur le bouton. Puis, circuit coupé et vérifié, ouvre la boîte et regarde les conducteurs."; }
    else { zone = "Tu as de quoi conclure."; mesure = "Touche « J'ai trouvé »."; }
    return [methode, zone, mesure];
  },
  diagnostics: [
    { id: "A", texte: "Le sélecteur de la minuterie est sur « marche permanente »", non: "Regarde-le : il est bien sur « auto »." },
    { id: "B", texte: "Un bouton-poussoir est resté enfoncé", non: "Tu les as tous essayés ? Chaque touche revient normalement." },
    { id: "C", texte: "Le contact de la minuterie est collé", non: "Sépare la commande : fil blanc débranché de la minuterie, l'escalier s'éteint à la fin de la temporisation. La minuterie fait son travail." },
    { id: "D", texte: "Le fil blanc touche la phase dans une boîte de palier", non: "Les boîtes que tu as ouvertes sont saines, et rien ne prouve un contact entre conducteurs." },
    { id: "lampes", texte: "Les lampes sont défectueuses", non: "Elles éclairent, toutes. Le problème, c'est ce qui les commande." },
    { id: "cave", texte: "Le bouton de la cave, dont le voyant est éteint", non: "Son voyant est grillé, c'est tout : la touche revient et il allume l'escalier normalement." },
  ],
  remedes: [
    { id: "auto", ou: ["mn"], pour: ["A"], effet: (P) => { P.e.modes.mn = "auto"; }, texte: "Remettre le sélecteur sur « auto », l'étiqueter, et le dire franchement au syndic", fait: "Rien à réparer : le sélecteur est remis sur « auto » et tu colles une étiquette « ne pas toucher — auto ». Tu le dis franchement à Mme Costa : quelqu'un l'avait basculé pendant les travaux. Tu essaies chaque bouton, de la cave au 3e : l'escalier s'allume, puis s'éteint au bout de trois minutes.", non: "Le sélecteur est déjà sur « auto »." },
    { id: "bouton", ou: ["bp_2"], pour: ["B"], repare: true, texte: "Nettoyer ou remplacer le bouton-poussoir du 2e étage", fait: "Circuit coupé et vérifié, tu démontes le bouton du 2e : la peinture a collé la touche. Tu le remplaces. Tu essaies chaque bouton, de la cave au 3e : l'escalier s'allume, puis s'éteint au bout de trois minutes.", non: "Ce bouton n'est pas en cause : sa touche revient normalement." },
    { id: "minuterie", ou: ["mn"], pour: ["C"], repare: true, texte: "Remplacer la minuterie par un modèle équivalent et régler la temporisation", fait: "Circuit coupé et vérifié, tu remplaces la minuterie par un modèle équivalent, tu règles la temporisation sur trois minutes. Tu essaies chaque bouton, de la cave au 3e : l'escalier s'allume, puis s'éteint.", non: "La minuterie fait son travail : la remplacer d'emblée ne règle rien, et le syndic paie une pièce pour rien." },
    { id: "boite", ou: ["bd_3"], pour: ["D"], repare: true, texte: "Refaire les connexions de la boîte du 3e étage et la refermer sans pincer les conducteurs", fait: "Circuit coupé et vérifié, tu refais la connexion du fil blanc dans la boîte du 3e, tu ranges les conducteurs et tu refermes sans les pincer. Tu essaies chaque bouton, de la cave au 3e : l'escalier s'allume, puis s'éteint au bout de trois minutes.", non: "Cette boîte est saine." },
    { id: "ampoules", ou: ["l_hall", "l_1", "l_2", "l_3", "l_cave"], pour: [], texte: "Changer toutes les ampoules de l'escalier", non: "Des ampoules neuves resteraient allumées jour et nuit, elles aussi." },
  ],
  // après le remède : chaque bouton allume, et l'escalier s'éteint tout seul
  verifier(P) {
    const e = P.e, i = P.inst;
    i.avancer(e, TEMPO + 2); if (i.calculer(e).allume("l_hall")) return "Le lendemain, Mme Costa rappelle : « C'est toujours allumé ! » Ce n'était pas la bonne réponse.";
    for (const b of Object.keys(NOMS)) { i.agir(e, { type: "appuyer", id: b }); if (!i.calculer(e).allume("l_3")) return `Le bouton ${NOMS[b]} n'allume plus l'escalier.`; i.avancer(e, TEMPO + 2); if (i.calculer(e).allume("l_hall")) return "L'escalier ne s'éteint toujours pas."; }
    X(P).lit = false; return null;
  },
  explications: {
    A: "Le sélecteur de la minuterie était sur « marche permanente » : dans cette position, elle alimente les lampes sans jamais couper. Les peintres, qui avaient la clé du local, l'ont sans doute basculé pour avoir de la lumière en continu, et ne l'ont pas remis. C'est la première chose à regarder, et la plus simple.",
    B: "La touche du bouton-poussoir du 2e étage est restée enfoncée, collée par la peinture. Un bouton enfoncé envoie la phase en permanence sur la borne de commande de la minuterie : elle est relancée sans arrêt et ne coupe jamais.",
    C: "La commande n'y est pour rien : fil blanc débranché, sélecteur sur « auto », les lampes restent allumées. C'est le contact de puissance de la minuterie qui est collé : il ne s'ouvre plus à la fin de la temporisation. Ici, et ici seulement, il fallait la remplacer.",
    D: "Aucun bouton n'est en cause. Dans la boîte du 3e étage, un couvercle refermé de travers a pincé les conducteurs : le fil blanc (retour bouton-poussoir) touche la phase. Pour la minuterie, c'est comme un bouton enfoncé en permanence.",
  },
  demarches: {
    A: ["Écouter le syndic : les peintres ont eu la clé du local.", "Au tableau, lire le schéma et regarder le sélecteur de la minuterie : « marche permanente ».", "Le remettre sur « auto » et attendre la fin de la temporisation : l'escalier s'éteint.", "Essayer chaque bouton, de la cave au 3e, et vérifier l'extinction.", "Le dire franchement au syndic, étiqueter le sélecteur."],
    B: ["Au tableau : sélecteur sur « auto », pourtant ça ne s'éteint pas.", "Mesurer sur la borne B : 230 V sans que personne n'appuie. La commande est en cause.", "Chercher par moitiés : séparer le fil blanc au 1er, puis au 2e. Le défaut est au 2e.", "Sur le palier du 2e : la touche du bouton est collée par la peinture.", "Remplacer le bouton, essayer tous les autres, vérifier l'extinction."],
    C: ["Au tableau : sélecteur sur « auto ».", "Mesurer sur la borne B : 0 V. Rien ne commande la minuterie.", "Pour en être sûr : couper, vérifier, débrancher le fil blanc de la borne B, remettre le courant, attendre.", "Les lampes restent allumées : le contact de la minuterie est collé.", "La remplacer par un modèle équivalent, régler la temporisation, essayer."],
    D: ["Au tableau : sélecteur sur « auto », 230 V en permanence sur la borne B.", "Chercher par moitiés : séparer le fil blanc au 1er (ça reste allumé en dessous, donc le défaut est plus haut), puis au 2e : toujours plus haut.", "Au 3e : le bouton revient normalement. Reste la boîte.", "Circuit coupé et vérifié, ouvrir la boîte du 3e : le fil blanc pincé touche la phase.", "Refaire la connexion, refermer sans pincer, essayer chaque bouton, vérifier l'extinction."],
  },
  conseilsFin: ["Sur une minuterie, on sépare toujours la commande (boutons, fil blanc) de la puissance (contact, fil orange) avant de changer quoi que ce soit."],
  inutile(P) {
    const l = [], ouv = (id) => P.ouverts.has(id);
    if (P.cause === "A") { for (const id of ["bd_hall", "bd_1", "bd_2", "bd_3", "bd_cave", "bd_tab"]) if (ouv(id)) { l.push("Les boîtes ouvertes : le sélecteur, au tableau, suffisait."); break; } }
    if (P.cause === "C" && ["bd_1", "bd_2", "bd_3", "bd_cave"].some(ouv)) l.push("Les boîtes de palier : la commande n'était pas en cause.");
    if (P.vus.has("voyant:cave")) l.push("Le bouton de la cave : voyant grillé, sans rapport avec la panne (à signaler au syndic).");
    return l;
  },
  plan: {
    tableau: { extras: { ID1: ["mn"] } },
    lieux: {
      // Une cage d'escalier sans fenêtre, fraîchement repeinte : une seule cage continue, du hall au 3e (cage.js).
      // Tout est éclairé par les lampes de la minuterie (ou par la frontale).
      hall: { ...cage(0), nom: "le hall", court: "Le hall", raccourci: "Hall", taille: [3.8, LH], h: 2.6, camera: [0, 1.62, 1.0], objets: [
        { t: "cageEtage", sousEscalier: true }, monter("palier1", LH),
        { t: "plafonnier", id: "l_hall", hublot: true, z: 0.2, portee: 7, force: 9 }, { t: "bp", id: "bp_hall", mur: "N", u: 1.55, y: 1.1, lampe: "l_hall" }, { t: "bp", id: "bp_porte", mur: "S", u: 1.2, y: 1.1, lampe: "l_hall" }, { t: "boite", id: "bd_hall", mur: "E", u: -1.55, y: 2.3 },
        porte("local", "E", 0.2), porte("cave", "N", -0.62),
        { t: "porteVitree", mur: "S", u: 0, y: 0 }, { t: "interphone", mur: "S", u: -1.15, y: 1.35 }, { t: "boitesLettres", mur: "O", u: 0.3, y: 1.25 }, { t: "panneauHall", id: "affichette", mur: "E", u: -0.9, y: 1.5 },
        { t: "plaqueEtage", mur: "N", u: 1.55, y: 1.75, texte: "RDC", sous: "escalier ↑" }, { t: "extincteur", mur: "O", u: -1.35, y: 1.0 },
        { t: "tapis", x: 0, z: 1.35, w: 1.5, d: 0.8, couleurs: ["#3a3530", "#57504a", "#22262d"] },
        { t: "velo", x: -1.72, z: -1.05, r: 0 }, { t: "modele", f: "potted_plant_01", x: 1.55, z: 1.65, h: 0.9, sansOmbre: true } ] },
      local: { nom: "le local technique", court: "Le local technique", raccourci: "Local", taille: [2.6, 2.4], sol: "beton", sombre: true, teinte: 0xe6e4de, peint: true, camera: [0.1, 1.62, 0.75], objets: [
        { t: "tableau", mur: "N", u: -0.2, y: 1.5 }, { t: "boite", id: "bd_tab", mur: "N", u: 0.75, y: 1.15 }, { t: "schema", id: "schema", mur: "N", u: 0.75, y: 1.62 },
        { t: "inter", id: "int_local", mur: "S", u: -0.9, y: 1.1 }, { t: "plafonnier", id: "pl_local" }, { t: "prise", id: "pc_local", mur: "E", u: -0.3, y: 1.15 }, { t: "boite", id: "bd_local", mur: "E", u: 0.6, y: 2.2 },
        porte("hall", "S", 0.3),
        { t: "tuyaux", mur: "N", u: -1.05, y: 1.2 }, { t: "etagere", mur: "O", u: -0.35, y: 0, w: 0.9 },
        { t: "balai", x: -1.12, z: 0.75, r: 1.5 }, { t: "modele", f: "wooden_bucket_01", x: -0.75, z: 0.85, h: 0.32 }, { t: "modele", f: "multi_cleaner_5_litre", x: 1.05, z: 0.2 }, { t: "modele", f: "multi_cleaner_5_litre", x: 1.08, z: 0.45, r: 0.6 }, { t: "modele", f: "cardboard_box_01", x: 1.0, z: 0.9, r: 0.3, h: 0.3 } ] },
      cave: { nom: "la cave", court: "La cave", raccourci: "Cave", taille: [3.4, 3], h: 2.2, sol: "beton", teinte: 0xb9b6ae, sombre: true, camera: [0.1, 1.62, 1.3], objets: [
        { t: "plafonnier", id: "l_cave" }, { t: "bp", id: "bp_cave", mur: "S", u: -0.85, y: 1.1, lampe: "l_cave", voyantMort: true }, { t: "boite", id: "bd_cave", mur: "S", u: -1.35, y: 1.9 },
        porte("hall", "S", 0.2),
        { t: "cloture", mur: "N", u: 0, y: 0, w: 3.3, h: 1.9 }, { t: "modele", f: "wooden_crate_02", x: -1.2, z: 0.2, r: 0.3 }, { t: "modele", f: "cardboard_box_01", x: 1.2, z: 0.6, r: -0.2 }, { t: "modele", f: "wine_bottles_01", x: 1.25, z: -0.6 }, { t: "modele", f: "wooden_bucket_01", x: -1.25, z: -0.8, h: 0.36 }, { t: "modele", f: "cardboard_box_01", x: -0.6, z: -1.0, r: 0.5, h: 0.3 },
        // ce qu'on trouve dans une cave d'immeuble : une étagère chargée, un vieux vélo, des cartons empilés, la tuyauterie
        { t: "etagere", mur: "E", u: -0.5, y: 0, w: 1.0 }, { t: "velo", x: -0.55, z: -1.28, r: Math.PI / 2, teinte: 0x8a3a2a }, { t: "tuyaux", mur: "O", u: 0.9, y: 1.2 },
        { t: "modele", f: "cardboard_box_01", x: 0.45, z: -1.15, r: 0.15, h: 0.34 }, { t: "modele", f: "cardboard_box_01", x: 0.47, y: 0.34, z: -1.13, r: -0.3, h: 0.28 }, { t: "modele", f: "wooden_crate_02", x: 0.95, z: -1.1, r: 0.1 } ] },
      palier1: { ...cage(1), nom: "le palier du 1er", court: "Le palier du 1er", raccourci: "1er", objets: [
        { t: "cageEtage", arrive: true }, monter("palier2", LP), descendre("hall", LP),
        { t: "plafonnier", id: "l_1", hublot: true, portee: 7, force: 9 }, { t: "bp", id: "bp_1", mur: "N", u: 1.55, y: 1.1, lampe: "l_1" }, { t: "boite", id: "bd_1", mur: "N", u: -1.55, y: 2.25 },
        { t: "porteAppart", mur: "O", u: 0.35, y: 0, nom: "Durand", mot: "BONJOUR", sonnette: "gauche" }, { t: "porteAppart", mur: "E", u: -0.35, y: 0, nom: "Nguyen", teinte: 0x4a5a4a, paillasson: "#3f4a3a" },
        { t: "plaqueEtage", mur: "N", u: 1.55, y: 1.75, texte: "1er" }, { t: "extincteur", mur: "E", u: 0.95, y: 1.0 }, { t: "planEvacuation", mur: "S", u: -0.55, y: 1.5, etage: "1er étage" }, { t: "colonne", mur: "S", u: 0.15, y: 1.0 },
        { t: "trottinette", x: -1.55, z: 0.95, r: 1.3 }, { t: "modele", f: "potted_plant_01", x: -1.5, z: -0.95, h: 0.75, sansOmbre: true } ] },
      palier2: { ...cage(2), nom: "le palier du 2e", court: "Le palier du 2e", raccourci: "2e", objets: [
        { t: "cageEtage", arrive: true }, monter("palier3", LP), descendre("palier1", LP),
        { t: "plafonnier", id: "l_2", hublot: true, portee: 7, force: 9 }, { t: "bp", id: "bp_2", mur: "N", u: 1.55, y: 1.1, lampe: "l_2", enfonce: (P) => P.cause === "B", peinture: (P) => P.cause === "B" }, { t: "boite", id: "bd_2", mur: "N", u: -1.55, y: 2.25 },
        { t: "porteAppart", mur: "O", u: 0.35, y: 0, nom: "Petit", teinte: 0x6a4a3a, sonnette: "gauche" }, { t: "porteAppart", mur: "E", u: -0.35, y: 0, nom: "Benali", mot: "WELCOME", paillasson: "#6b4a2a" },
        { t: "plaqueEtage", mur: "N", u: 1.55, y: 1.75, texte: "2e" }, { t: "extincteur", mur: "E", u: 0.95, y: 1.0 }, { t: "planEvacuation", mur: "S", u: -0.55, y: 1.5, etage: "2e étage" }, { t: "colonne", mur: "S", u: 0.15, y: 1.0 },
        { t: "ruban", mur: "N", u: 1.55, y: 1.1, bandes: [[-0.08, 0.075, 0.2, 0.05], [0.075, -0.02, 0.16, 1.5]] },
        { t: "modele", f: "rubber_boots", x: 1.6, z: 0.5, s: 0.9, e: [0.55, 1, 1], r: -Math.PI / 2 }, { t: "peintres", x: -1.35, z: 0.9, r: 1.9 } ] },
      palier3: { ...cage(3), nom: "le palier du 3e", court: "Le palier du 3e", raccourci: "3e", objets: [
        { t: "cageEtage", arrive: true, monte: false, dernier: true }, descendre("palier2", LP),
        { t: "plafonnier", id: "l_3", hublot: true, portee: 7, force: 9 }, { t: "bp", id: "bp_3", mur: "N", u: 1.55, y: 1.1, lampe: "l_3" }, { t: "boite", id: "bd_3", mur: "N", u: -1.55, y: 2.25 },
        { t: "porteAppart", mur: "O", u: 0.35, y: 0, nom: "Roche", sonnette: "gauche", paillasson: "#4a3f5a" }, { t: "porteAppart", mur: "E", u: -0.35, y: 0, nom: "Lopez", teinte: 0x3f4f5f, mot: "HOLA" },
        { t: "plaqueEtage", mur: "N", u: 1.55, y: 1.75, texte: "3e" }, { t: "extincteur", mur: "E", u: 0.95, y: 1.0 }, { t: "planEvacuation", mur: "S", u: -0.55, y: 1.5, etage: "3e étage" }, { t: "colonne", mur: "S", u: 0.15, y: 1.0 },
        { t: "ruban", mur: "N", u: -1.55, y: 2.25, bandes: [[0, 0.09, 0.26, -0.04], [-0.11, 0, 0.2, 1.57], [0.05, -1.2, 0.3, 0.1]] }, { t: "ruban", mur: "O", u: 0.35, y: 1.0, bandes: [[0.56, 0.4, 0.5, 1.57], [0.56, -0.3, 0.4, 1.6]] },
        { t: "escabeau", x: -1.25, z: 0.85, r: 0.5 }, { t: "peintres", x: 1.1, z: -0.85, r: -0.5 } ] },
    },
  },
};
