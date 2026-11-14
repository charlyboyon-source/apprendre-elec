// Niveau 4 — « Le disjoncteur saute tous les soirs » : le pavillon de la famille Morel.
// Surcharge ou court-circuit ? Pince ampèremétrique, et un client qui veut « mettre plus gros ».
import { pavillon, causesPavillon, soireePavillon, reperesPavillon as F } from "../moteur/logements/pavillon.js";

const porte = (vers, mur, u, y = 1.025) => ({ t: "porte", vers, mur, u, y });
const enHaut = (P) => ["palier", "chambre1", "chambre2", "chambre3"].some((l) => P.vus.has(`lieu:${l}`));
const calibreLu = (P) => P.vus.has("indice:Q6") || P.vus.has("lu:Q6");
const SOIR = (P) => soireePavillon[P.cause];
const total = (P, ids) => ids.reduce((s, id) => s + P.inst.mobile[id].puissance, 0);

export default {
  id: "niveau4", numero: 4, titre: "Le disjoncteur saute tous les soirs", page: "atelier-3d-4.html",
  logement: pavillon, causes: causesPavillon, fils: F, soiree: soireePavillon,
  nomsDifferentiels: { ID1: "de la rangée du haut", ID2: "de la rangée du bas" },
  nomsBornes: { "bt.PE": "bornier de terre du tableau", "Q6.Lout": "sortie phase du disjoncteur « Prises chambres »", "Q6.Nout": "sortie neutre du disjoncteur « Prises chambres »" },
  outils: ["vat", "multi", "pince"],
  commutables: ["radiateur2", "radiateur3", "fer", "ordinateur", "chargeur", "chevet"],
  client: { nom: "M. Morel", court: "Les Morel", initiales: "FM", teinte: "#a8553f", role: "Le père, sûr de lui · pavillon à étage, deux adolescents" },
  accroche: "« Ah, l'électricien. C'est simple : c'est le disjoncteur des chambres qui est fatigué. Il saute tous les soirs. Vous me le changez, vous mettez plus gros, et on n'en parle plus. »",
  mission: "Trouve pourquoi le disjoncteur « Prises chambres » saute le soir, prouve-le, et règle le problème sans mettre personne en danger.",
  depart: "garage",
  pitch: "Un soir d'hiver, 19 h 30. M. Morel t'attend dans son garage, devant le tableau : le disjoncteur des chambres saute tous les soirs, et il a déjà son idée sur ce qu'il faut faire.",
  entrer: "Entrer chez les Morel",
  debut: "M. Morel te laisse le tableau. Pour l'instant le disjoncteur est en haut et tout marche. Théo et Léa sont dans leurs chambres, à l'étage.",
  humeurs: [{ apres: 60, texte: "« Alors, vous me le changez, ce disjoncteur ? Un 32 ampères, ça tiendra. »" }],
  questions: [
    { id: "comment", texte: "Il saute tout de suite quand on branche quelque chose, ou au bout d'un moment ?", reponse: (P) => (P.cause === "C" ? "« D'un coup ! Des fois les enfants sont à peine montés dans leurs chambres. »" : "« Au bout d'un moment. On mange, et vers le milieu de la soirée : clac. »") },
    { id: "depuis", texte: "Depuis quand ?", reponse: (P) => ({ A: "« Depuis qu'il fait froid. »", B: "« Trois semaines. Et de plus en plus souvent. »", C: "« Depuis les vacances. Théo a tout changé de place dans sa chambre. »", D: "« Depuis cet été. Un dépanneur est passé pour une prise qui avait grillé. Avant, jamais. »" }[P.cause]) },
    { id: "gros", texte: "Pourquoi voulez-vous un disjoncteur plus gros ?", reponse: () => "« Parce que celui-là ne tient pas ! Un 32 ampères, et il ne sautera plus. C'est logique, non ? »" },
    { id: "soir", si: enHaut, texte: "(à Théo et Léa) Qu'est-ce qui est allumé le soir, là-haut ?", reponse: (P) => ({
      A: "« Ben… mon radiateur. Léa a le sien aussi. Et l'ordi. » Léa ajoute : « Et maman repasse sur le palier, presque tous les soirs. »",
      B: "« Mon radiateur, celui de Léa, l'ordi. C'est tout. » Léa confirme : « Rien d'autre. »",
      C: "« Mon radiateur, celui de Léa, l'ordi. C'est tout. D'ailleurs c'est bizarre : ça saute souvent pile quand je me jette sur mon lit. »",
      D: "« Mon radiateur, celui de Léa, l'ordi. C'est tout. » Léa confirme : « Rien d'autre. »" }[P.cause]) },
    { id: "rallonge", si: (P) => P.vus.has("indice:rallonge") || P.vus.has("vu:rallonge"), texte: "(à Théo) Cette rallonge sous ton lit, elle est là depuis longtemps ?", reponse: () => "« Depuis que j'ai bougé mon lit, pendant les vacances. Elle alimente ma lampe de bureau. »" },
  ],
  regards: {
    Q6(P) { const cal = P.inst.dj("Q6") ? P.inst.protections.find((x) => x.id === "Q6").calibre : 20; P.vus.add("lu:Q6");
      return { texte: `Disjoncteur « Prises chambres » : calibre ${cal} A, courbe C. Les conducteurs qui en partent sont en 2,5 mm².${P.cause === "B" && !P.e.repare[0] ? " Son boîtier est bruni autour de la borne du bas, il sent le chaud et il est tiède au toucher." : " Boîtier propre, froid au toucher."}`,
        type: P.cause === "B" ? "alerte" : "info", valeur: { calibre: cal, bruni: P.cause === "B" }, indice: `Disjoncteur « Prises chambres » : ${cal} A, conducteurs en 2,5 mm².${P.cause === "B" ? " Boîtier bruni et tiède autour d'une borne." : ""}` }; },
    rallonge(P) { P.vus.add("vu:rallonge"); return P.cause === "C" && !P.e.repare[0] ? { texte: "Une rallonge passe sous le lit de Théo : le pied du lit est posé dessus, la gaine est écrasée et fendue.", type: "alerte", valeur: true, indice: "Chambre de Théo : une rallonge écrasée sous un pied du lit, gaine fendue." } : { texte: "Une rallonge longe le mur derrière le lit de Théo. Elle est en bon état.", valeur: false }; },
  },
  // s'asseoir sur le lit de Théo
  gestes: {
    lit(P, o) { const e = P.e; e.appuis.lit = true; const r = P.inst.calculer(e); e.appuis.lit = false; o.dire(r.declenchements.length ? "Tu t'assois sur le lit de Théo…" : "Tu t'assois sur le lit de Théo. Rien ne se passe.", "info"); o.declenchements(r.declenchements); if (r.declenchements.length) { P.vus.add("lit:declenche"); o.noter("indices", "En s'asseyant sur le lit de Théo, le disjoncteur « Prises chambres » déclenche d'un coup."); } return r.declenchements.length > 0; },
  },
  apresMesure(P, m) {
    if (m.outil !== "pince" || !["Q6.Lout", "Q6.Nout"].includes(m.a)) return null;
    const cal = P.inst.protections.find((x) => x.id === "Q6").calibre, i = m.valeur;
    if (i > cal) P.vus.add("m:au-dessus"); else if (i > 12) P.vus.add("m:en-dessous");
    P.pince = i;
    return i > 1 && !P.vus.has("lu:Q6") ? { texte: "Compare ce courant au calibre écrit sur le disjoncteur : touche son étiquette pour le lire.", type: "info" } : null;
  },
  preuve(P) {
    const lu = calibreLu(P);
    if (P.cause === "A" && P.vus.has("m:au-dessus") && lu) return "À la pince, le courant du circuit dépasse nettement le calibre de 20 A lu sur le disjoncteur quand tout ce qui tourne le soir est allumé. Le disjoncteur fait son travail.";
    if (P.cause === "B" && P.vus.has("m:en-dessous") && lu && P.vus.has("thermique:Q6")) return "À la pince, le courant reste sous le calibre de 20 A, et pourtant le disjoncteur déclenche : son boîtier est bruni et chaud autour d'une borne desserrée.";
    if (P.cause === "C" && P.vus.has("lit:declenche") && P.vus.has("indice:rallonge")) return "Le disjoncteur déclenche d'un coup, quelle que soit la charge, quand on s'assoit sur le lit : la rallonge écrasée sous le pied du lit fait court-circuit.";
    if (P.cause === "D" && P.vus.has("m:au-dessus") && lu) return "Le disjoncteur porte 10 A alors que les conducteurs sont en 2,5 mm², prévus pour 20 A. À la pince, le courant du soir est normal pour ce circuit mais dépasse ce petit calibre.";
    return null;
  },
  indices(P) {
    const methode = "Un disjoncteur qui déclenche fait peut-être simplement son travail. Demande d'abord COMMENT il saute : tout de suite (court-circuit) ou au bout d'un moment (surcharge ou échauffement). Puis reproduis la soirée et mesure.";
    let zone, mesure;
    if (!P.poses.includes("comment")) { zone = "Commence par M. Morel : il y a une question qui trie tout."; mesure = "« Il saute tout de suite, ou au bout d'un moment ? »"; }
    else if (!P.poses.includes("soir")) { zone = "Monte à l'étage et parle à Théo et Léa : ce sont eux qui savent ce qui est branché le soir."; mesure = "Une fois en haut, une nouvelle question apparaît dans la liste."; }
    else if (!calibreLu(P)) { zone = "Le disjoncteur lui-même, dans le garage : regarde-le de près."; mesure = "Touche son étiquette de calibre : tu lis le calibre, la section des conducteurs, et tu vois son état."; }
    else if (P.cause === "C" && !P.vus.has("lit:declenche")) { zone = "Un déclenchement immédiat, c'est un court-circuit. Cherche dans les chambres ce qui peut se toucher par moments : prises, multiprises, rallonges, et ce que Théo t'a dit."; mesure = "Refais le geste qui fait sauter. Puis regarde ce qu'il y a dessous."; }
    else if (!P.pince) { zone = "Au tableau, avec tout ce qui tourne le soir allumé à l'étage."; mesure = "Allume les appareils du soir (touche-les : tu lis leur plaque), puis prends la pince ampèremétrique et serre le conducteur de phase à la sortie du disjoncteur « Prises chambres ». Compare au calibre."; }
    else if (!P.vus.has("thermique:Q6") && !P.vus.has("cc:Q6") && P.cause !== "C") { zone = "Tu as le courant. Reste à voir ce que fait le disjoncteur dans le temps."; mesure = "Laisse tout allumé et attends (bouton « Temps »). Il déclenche ? Au bout de combien de temps, et le courant était-il au-dessus ou en dessous de son calibre ?"; }
    else { zone = "Tu as de quoi conclure."; mesure = "Touche « J'ai trouvé »."; }
    return [methode, zone, mesure];
  },
  diagnostics: [
    { id: "A", texte: "Surcharge : trop d'appareils puissants en même temps sur ce circuit", non: "Fais le total des plaques et mesure à la pince : le courant du soir ne dépasse pas le calibre prévu pour ce circuit." },
    { id: "B", texte: "Le disjoncteur chauffe à cause d'une borne desserrée", non: "Tu l'as regardé et touché ? Son boîtier est propre et froid." },
    { id: "C", texte: "Un court-circuit par moments, dans une chambre", non: "Un court-circuit fait déclencher d'un coup. Ici, il déclenche au bout d'un moment." },
    { id: "D", texte: "Le disjoncteur n'a pas le bon calibre pour ce circuit", non: "Relis son étiquette : 20 A pour des conducteurs en 2,5 mm², c'est le bon calibre." },
    { id: "fatigue", texte: "Le disjoncteur est simplement « fatigué »", non: "« Je vous l'avais dit ! » Sauf que rien ne le prouve : un disjoncteur qui déclenche n'est pas forcément en panne." },
    { id: "chargeur", texte: "Le chargeur de téléphone de Léa", non: "10 W, c'est quelques centièmes d'ampère. Ce n'est pas lui." },
  ],
  remedes: [
    { id: "repartir", pour: ["A"], effet: (P) => { P.e.branche.fer = "pc_entree"; }, texte: "Ne rien changer au tableau : repasser en bas, sur une prise d'un autre circuit, et proposer un circuit dédié", fait: "Aucune pièce changée. Tu expliques : le disjoncteur a fait son travail, il protège les conducteurs. Le fer à repasser ira sur une prise du bas, qui dépend d'un autre circuit, et tu proposes un circuit dédié pour les radiateurs. Le soir même, tout est allumé et le disjoncteur tient.", non: "Il n'y a pas de surcharge : le courant du soir reste sous le calibre prévu." },
    { id: "identique", pour: ["B"], repare: true, texte: "Remplacer le disjoncteur par le même calibre, 20 A, et serrer correctement ses bornes", fait: "Tu remplaces le disjoncteur abîmé par un neuf du même calibre, 20 A pour ces conducteurs en 2,5 mm², et tu serres ses bornes. Le soir même, tout est allumé et il tient.", non: "Ce disjoncteur n'est pas abîmé : le changer à l'identique ne règle rien." },
    { id: "rallonge", pour: ["C"], repare: true, texte: "Retirer la rallonge écrasée et brancher la lampe de Théo autrement", fait: "Tu retires la rallonge écrasée, tu la montres à Théo et à son père, et tu branches la lampe directement. Théo se jette sur son lit : le disjoncteur tient.", non: "Aucune rallonge n'est en cause ici." },
    { id: "calibre", pour: ["D"], repare: true, texte: "Remettre un disjoncteur de 20 A, le calibre prévu pour des conducteurs en 2,5 mm²", fait: "Tu remplaces le disjoncteur de 10 A par un 20 A : c'est le calibre prévu pour des conducteurs en 2,5 mm² (module 12). Le soir même, tout est allumé et il tient.", non: "Le disjoncteur a déjà le calibre prévu pour ces conducteurs." },
    { id: "gros", pour: [], faute: "Tu as accepté de poser un disjoncteur de 32 A sur des conducteurs en 2,5 mm². Le calibre protège les conducteurs : avec un calibre trop fort, ce sont les fils qui chauffent dans le mur. C'est l'erreur grave de ce dépannage.", texte: "Faire ce que demande M. Morel : poser un disjoncteur de 32 A", non: "« Ah, enfin ! » Non. Le calibre protège les conducteurs : en 2,5 mm², c'est 20 A au plus. Un 32 A laisserait les fils chauffer dans le mur. Tu dois refuser et l'expliquer." },
  ],
  // on rejoue la soirée après le remède : tout ce qui tourne le soir, et Théo sur son lit
  verifier(P) {
    const e = P.e; for (const id of SOIR(P)) e.marche[id] = true;
    e.appuis.lit = true; const r = P.inst.calculer(e); e.appuis.lit = false;
    const ev = [...r.declenchements, ...P.inst.avancer(e, 180)];
    return ev.length ? "Le soir même, clac : le disjoncteur saute encore. Ce n'était pas la bonne réponse." : null;
  },
  explications: {
    A: "Le soir, deux radiateurs d'appoint de 2 000 W, l'ordinateur et le fer à repasser tournent ensemble sur le circuit « Prises chambres » : 6 700 W, soit environ 29 A sous 230 V, pour un disjoncteur de 20 A. Il déclenche au bout d'un moment : c'est son déclencheur thermique, et il fait exactement son travail.",
    B: "Le courant du soir (environ 19 A) reste sous le calibre de 20 A. Mais une borne du disjoncteur est mal serrée : la connexion chauffe, le boîtier a bruni, et cette chaleur fait déclencher le thermique sous le calibre. Ici, le disjoncteur est vraiment abîmé.",
    C: "Une rallonge passe sous un pied du lit de Théo. Sa gaine est écrasée : quand quelqu'un s'assoit, les conducteurs se touchent. C'est un court-circuit : le déclencheur magnétique coupe d'un coup, quelle que soit la charge.",
    D: "Un ancien dépannage a laissé un disjoncteur de 10 A sur ce circuit en 2,5 mm², prévu pour 20 A. Le courant du soir, environ 19 A, est normal pour le circuit mais dépasse largement ce petit calibre.",
  },
  demarches: {
    A: ["Écouter M. Morel, puis lui demander comment ça saute : au bout d'un moment, donc thermique.", "Monter, parler à Théo et Léa : deux radiateurs, l'ordinateur, et le fer à repasser.", "Lire les plaques, faire le total : 6 700 W, environ 29 A.", "Reproduire la soirée et mesurer à la pince sur la phase du circuit : bien au-dessus des 20 A du disjoncteur.", "Refuser le « plus gros », répartir les appareils, proposer un circuit dédié."],
    B: ["Demander comment ça saute : au bout d'un moment.", "Reproduire la soirée : deux radiateurs et l'ordinateur, environ 19 A.", "Mesurer à la pince : sous le calibre. Il ne devrait pas déclencher.", "Regarder et toucher le disjoncteur : bruni, chaud, borne desserrée. Attendre : il déclenche quand même.", "Le remplacer par le même calibre, serrer, vérifier."],
    C: ["Demander comment ça saute : d'un coup. C'est le magnétique, donc un court-circuit.", "Monter, écouter Théo : ça saute quand il se jette sur son lit.", "S'asseoir sur le lit : déclenchement immédiat, quelle que soit la charge.", "Regarder sous le lit : une rallonge écrasée.", "La retirer, l'expliquer, vérifier."],
    D: ["Demander comment ça saute : au bout d'un moment. Et depuis quand : depuis le passage d'un dépanneur.", "Lire le disjoncteur : 10 A, pour des conducteurs en 2,5 mm².", "Reproduire la soirée et mesurer à la pince : environ 19 A, normal pour ce circuit.", "Comparer : le circuit est prévu pour 20 A, le disjoncteur posé est trop petit.", "Remettre un 20 A, surtout pas plus."],
  },
  conseilsFin: ["Le calibre d'un disjoncteur se choisit d'après la section des conducteurs qu'il protège, jamais d'après ce que le client veut brancher."],
  inutile(P) {
    const l = [];
    if (P.essais.has("chargeur")) l.push("Le chargeur de téléphone : 10 W, sans effet sur ce circuit.");
    if (P.cause !== "C" && P.vus.has("vu:rallonge")) l.push("La rallonge de Théo, en bon état.");
    if (P.cause === "C" && P.pince) l.push("La mesure à la pince : sur un court-circuit, le déclenchement ne dépend pas de la charge.");
    return l;
  },
  plan: {
    tableau: { cables: ["Q6"], regards: ["Q6"] },
    lieux: {
      garage: { nom: "le garage", court: "Le garage", raccourci: "Garage", taille: [4.2, 3.6], sol: "beton", objets: [
        { t: "tableau", mur: "N", u: 0, y: 1.45 }, { t: "inter", id: "int_garage", mur: "N", u: -1.5, y: 1.1 }, { t: "plafonnier", id: "pl_garage" }, { t: "prise", id: "pc_garage", mur: "O", u: 0.4, y: 1.15 }, { t: "prise", id: "pc_lavelinge", mur: "E", u: -0.8, y: 1.15 },
        { t: "meuble", x: -1.75, z: -0.3, w: 0.6, h: 0.9, d: 1.6 }, { t: "meuble", x: 1.75, z: -0.8, w: 0.6, h: 0.85, d: 0.6, m: "blanc" }, porte("entree", "E", 0.9) ] },
      entree: { nom: "l'entrée", court: "L'entrée", raccourci: "Entrée", taille: [3, 3], sol: "carrelage", objets: [
        { t: "inter", id: "int_entree", mur: "S", u: 0.9, y: 1.1 }, { t: "plafonnier", id: "pl_entree" }, { t: "prise", id: "pc_entree", mur: "E", u: 0.4, y: 0.75 }, { t: "boite", id: "bd_rdc", mur: "E", u: -0.8, y: 2.2 },
        porte("garage", "O", 0.5), porte("escalier", "N", 0.4) ] },
      escalier: { nom: "l'escalier", court: "L'escalier", raccourci: "Escalier", taille: [1.5, 4.4], h: 5.3, sol: "bois", camera: [0, 1.62, 1.8], pitch: 0.28, objets: [
        { t: "marches", n: 14, haut: 2.8 }, { t: "inter", id: "int_escalier", mur: "O", u: -1.6, y: 1.1 }, { t: "plafonnier", id: "pl_escalier" }, porte("entree", "S", 0), porte("palier", "N", 0, 3.825) ] },
      palier: { nom: "le palier", court: "Le palier", raccourci: "Palier", taille: [3.4, 2.4], sol: "bois", objets: [
        { t: "inter", id: "int_palier", mur: "S", u: 1.2, y: 1.1 }, { t: "plafonnier", id: "pl_palier" }, { t: "prise", id: "pc_palier", mur: "N", u: -0.2, y: 0.75 }, { t: "prise", id: "pc_sde", mur: "E", u: 0.7, y: 1.15 }, { t: "boite", id: "bd_et", mur: "N", u: 1.3, y: 2.2 },
        { t: "meuble", x: -0.2, z: -0.75, w: 1.2, h: 0.85, d: 0.38 }, { t: "meuble", id: "fer", x: -0.2, z: -0.72, y: 0.85, w: 0.24, h: 0.13, d: 0.12, c: 0x3b6fb0, voyant: true },
        porte("escalier", "S", -0.2), porte("chambre1", "O", 0), porte("chambre2", "N", -1.2), porte("chambre3", "E", -0.4) ] },
      chambre1: { nom: "la chambre des parents", court: "La chambre des parents", raccourci: "Parents", taille: [3.4, 3.2], sol: "bois", objets: [
        { t: "inter", id: "int_chambre1", mur: "E", u: 1.0, y: 1.1 }, { t: "plafonnier", id: "pl_chambre1" }, { t: "prise", id: "pc_chambre1", mur: "N", u: 1.2, y: 0.75 },
        { t: "meuble", x: 0, z: -0.5, w: 1.6, h: 0.5, d: 2, m: "tissu" }, { t: "meuble", id: "chevet", x: 1.15, z: -1.3, w: 0.3, h: 0.75, d: 0.3, voyant: true }, porte("palier", "E", -0.6) ] },
      chambre2: { nom: "la chambre de Théo", court: "La chambre de Théo", raccourci: "Théo", taille: [3.2, 3.2], sol: "bois", objets: [
        { t: "inter", id: "int_chambre2", mur: "S", u: -0.9, y: 1.1 }, { t: "plafonnier", id: "pl_chambre2" }, { t: "prise", id: "pc_chambre2a", mur: "O", u: 0.6, y: 0.75 }, { t: "prise", id: "pc_chambre2b", mur: "N", u: 1.0, y: 0.75 },
        { t: "meuble", id: "lit", x: -0.55, z: -0.55, w: 1.0, h: 0.5, d: 2, m: "tissu" }, { t: "indice", id: "rallonge", x: 0.05, z: -1.3, w: 0.9, d: 0.05 },
        { t: "meuble", id: "radiateur2", x: -1.35, z: 0.9, w: 0.2, h: 0.6, d: 0.5, m: "blanc", voyant: true }, { t: "meuble", x: 1.0, z: -1.25, w: 1.0, h: 0.75, d: 0.5 }, { t: "meuble", id: "ordinateur", x: 1.0, z: -1.3, y: 0.75, w: 0.5, h: 0.32, d: 0.05, c: 0x0b0d10, voyant: true },
        porte("palier", "S", 0.6) ] },
      chambre3: { nom: "la chambre de Léa", court: "La chambre de Léa", raccourci: "Léa", taille: [3.2, 3], sol: "bois", objets: [
        { t: "inter", id: "int_chambre3", mur: "O", u: 0.9, y: 1.1 }, { t: "plafonnier", id: "pl_chambre3" }, { t: "prise", id: "pc_chambre3a", mur: "N", u: -1.0, y: 0.75 }, { t: "prise", id: "pc_chambre3b", mur: "E", u: 0.2, y: 0.75 },
        { t: "meuble", x: 0.5, z: -0.4, w: 1.0, h: 0.5, d: 2, m: "tissu" }, { t: "meuble", id: "radiateur3", x: -1.0, z: -1.2, w: 0.5, h: 0.6, d: 0.2, m: "blanc", voyant: true }, { t: "meuble", id: "chargeur", x: 1.35, z: 0.2, y: 0.5, w: 0.08, h: 0.05, d: 0.06, m: "blanc", voyant: true },
        porte("palier", "O", -0.5) ] },
    },
  },
};
