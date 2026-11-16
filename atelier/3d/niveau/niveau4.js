// Niveau 4 — « Le disjoncteur saute tous les soirs » : le pavillon de la famille Morel.
// Surcharge ou court-circuit ? Pince ampèremétrique, et un client qui veut « mettre plus gros ».
import { CAGE, monter, descendre } from "./cage.js";
import { pavillon, causesPavillon, soireePavillon, reperesPavillon as F } from "../moteur/logements/pavillon.js";

const porte = (vers, mur, u, y = 1.025) => ({ t: "porte", vers, mur, u, y });
const LE = 1.8, LPA = 2.6; // profondeur du pied de l'escalier et du palier
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
    theo(P, o) { o.dire("Théo retire son casque : « Ouais ? Si c'est pour le courant, c'est le soir que ça saute. Demandez-moi ce qui est allumé, je sais. »", "client"); return true; },
    lea(P, o) { o.dire("Léa lève les yeux de son téléphone : « Ça saute tous les soirs vers cette heure-ci. J'ai froid dans ma chambre, alors j'ai un radiateur. Posez-moi vos questions si vous voulez. »", "client"); return true; },
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
    { id: "repartir", ou: ["fer"], pour: ["A"], effet: (P) => { P.e.branche.fer = "pc_entree"; }, texte: "Ne rien changer au tableau : repasser en bas, sur une prise d'un autre circuit, et proposer un circuit dédié", fait: "Aucune pièce changée. Tu expliques : le disjoncteur a fait son travail, il protège les conducteurs. Le fer à repasser ira sur une prise du bas, qui dépend d'un autre circuit, et tu proposes un circuit dédié pour les radiateurs. Le soir même, tout est allumé et le disjoncteur tient.", non: "Il n'y a pas de surcharge : le courant du soir reste sous le calibre prévu." },
    { id: "identique", ou: ["Q6"], pour: ["B"], repare: true, texte: "Remplacer le disjoncteur par le même calibre, 20 A, et serrer correctement ses bornes", fait: "Tu remplaces le disjoncteur abîmé par un neuf du même calibre, 20 A pour ces conducteurs en 2,5 mm², et tu serres ses bornes. Le soir même, tout est allumé et il tient.", non: "Ce disjoncteur n'est pas abîmé : le changer à l'identique ne règle rien." },
    { id: "rallonge", ou: ["rallonge"], pour: ["C"], repare: true, texte: "Retirer la rallonge écrasée et brancher la lampe de Théo autrement", fait: "Tu retires la rallonge écrasée, tu la montres à Théo et à son père, et tu branches la lampe directement. Théo se jette sur son lit : le disjoncteur tient.", non: "Aucune rallonge n'est en cause ici." },
    { id: "calibre", ou: ["Q6"], pour: ["D"], repare: true, texte: "Remettre un disjoncteur de 20 A, le calibre prévu pour des conducteurs en 2,5 mm²", fait: "Tu remplaces le disjoncteur de 10 A par un 20 A : c'est le calibre prévu pour des conducteurs en 2,5 mm² (module 12). Le soir même, tout est allumé et il tient.", non: "Le disjoncteur a déjà le calibre prévu pour ces conducteurs." },
    { id: "gros", ou: ["Q6"], pour: [], faute: "Tu as accepté de poser un disjoncteur de 32 A sur des conducteurs en 2,5 mm². Le calibre protège les conducteurs : avec un calibre trop fort, ce sont les fils qui chauffent dans le mur. C'est l'erreur grave de ce dépannage.", texte: "Faire ce que demande M. Morel : poser un disjoncteur de 32 A", non: "« Ah, enfin ! » Non. Le calibre protège les conducteurs : en 2,5 mm², c'est 20 A au plus. Un 32 A laisserait les fils chauffer dans le mur. Tu dois refuser et l'expliquer." },
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
      // Le pavillon des Morel, un soir d'hiver : lumières allumées partout, nuit aux fenêtres. Les deux radiateurs d'appoint,
      // l'ordinateur, le fer et sa table sont de vrais objets : on lit leur plaque, on les allume, le courant suit.
      garage: { nom: "le garage", court: "Le garage", raccourci: "Garage", taille: [4.2, 3.6], sol: "beton", teinte: 0xd9d6cc, objets: [
        { t: "tableau", mur: "N", u: 0, y: 1.45 }, { t: "inter", id: "int_garage", mur: "N", u: -1.5, y: 1.1 }, { t: "plafonnier", id: "pl_garage" }, { t: "prise", id: "pc_garage", mur: "O", u: 0.4, y: 1.15 }, { t: "prise", id: "pc_lavelinge", mur: "E", u: -0.8, y: 1.15 },
        porte("entree", "E", 0.9),
        { t: "etabli", mur: "O", u: 0.35, y: 0, w: 1.5 }, { t: "modele", f: "metal_toolbox", x: -1.75, y: 0.9, z: 0.0, r: Math.PI / 2 + 0.2 }, { t: "modele", f: "oil_tin", x: -1.8, y: 0.9, z: -0.75 },
        { t: "lavelinge", id: "lavelinge", x: 1.8, z: -0.8, r: -Math.PI / 2 },
        { t: "modele", f: "wicker_basket_02", x: 1.78, z: -0.1, h: 0.42, e: [0.62, 1, 0.62], avec: [{ t: "linge", y: 0.36 }] },
        { t: "etagereChargee", mur: "N", u: 1.42, y: 0 }, { t: "porteGarage", mur: "S", u: 0.3, y: 0, w: 2.5 },
        { t: "modele", f: "cardboard_box_01", x: -1.6, z: 1.25, r: 0.3 }, { t: "modele", f: "cardboard_box_01", x: -1.55, y: 0.3, z: 1.22, r: -0.25, s: 0.8 }, { t: "modele", f: "wooden_crate_02", x: -1.0, z: 1.4, r: 0.2 },
        { t: "modele", f: "rusted_spade_01", x: -1.98, z: 0.85, rx: -0.14, r: 1.6 }, { t: "balai", x: -1.95, z: 1.05, r: 1.4 }, { t: "modele", f: "watering_can_metal_01", x: 0.95, z: -1.45, r: 0.6 } ] },
      entree: { nom: "l'entrée", court: "L'entrée", raccourci: "Entrée", taille: [3.6, 3], sol: "carrelage", camera: [1.2, 1.62, 1.0], yaw: 0.72, pitch: -0.08, objets: [
        // murs du côté opposé à l'arrivée (tâche 13.2) : ils ne sont plus nus
        { t: "modele", f: "hanging_picture_frame_02", mur: "S", u: -1.45, y: 1.6, auMur: true, s: 0.42 }, { t: "cadreTexte", mur: "E", u: 0.95, y: 1.6 },
        { t: "inter", id: "int_entree", mur: "S", u: 1.2, y: 1.1 }, { t: "plafonnier", id: "pl_entree" }, { t: "prise", id: "pc_entree", mur: "E", u: 0.4, y: 0.75 }, { t: "boite", id: "bd_rdc", mur: "E", u: -0.8, y: 2.2 },
        porte("garage", "O", 0.5), porte("escalier", "N", 1.15), porte("sejour", "N", -0.95),
        { t: "porteEntree", mur: "S", u: -0.5, y: 0, teinte: 0xb9c9bd }, { t: "portemanteau", mur: "O", u: -0.78, y: 1.74 }, { t: "chaussures", mur: "O", u: -0.78, y: 0 },
        { t: "tapis", x: 0, z: 0.2, w: 1.7, d: 1.2, couleurs: ["#6b2a26", "#d9c9a3", "#2f3f55"] },
        { t: "modele", f: "ClassicConsole_01", x: 1.63, z: -0.7, r: -Math.PI / 2, s: 0.62, avec: [ { t: "cles", x: -0.28, y: 0.59, z: 0.03 }, { t: "courrier", x: 0.02, y: 0.59, z: 0.02 }, { t: "modele", f: "potted_plant_04", x: 0.28, y: 0.59, z: 0.02 } ] },
        { t: "modele", f: "ornate_mirror_01", mur: "E", u: -0.7, y: 1.45, auMur: true, s: 0.9 }, { t: "modele", f: "fancy_picture_frame_01", mur: "N", u: 0.1, y: 1.62, auMur: true, s: 0.5 },
        { t: "modele", f: "rubber_boots", x: 0.85, z: 1.22, s: 0.9, e: [0.55, 1, 1], r: Math.PI } ] },
      // le séjour et la cuisine : la famille vit en bas ; la plaque de cuisson du tableau est ici
      sejour: { nom: "le séjour", court: "Le séjour", raccourci: "Séjour", taille: [4.6, 4], sol: "bois", camera: [0.45, 1.62, 1.85], yaw: 0.12, pitch: -0.1, objets: [
        // murs du côté opposé à l'arrivée (tâche 13.2) : ils ne sont plus nus
        { t: "modele", f: "fancy_picture_frame_01", mur: "S", u: -0.45, y: 1.52, auMur: true, s: 0.4 }, { t: "modele", f: "hanging_picture_frame_02", mur: "S", u: -0.98, y: 1.6, auMur: true, s: 0.6 },
        { t: "inter", id: "int_sejour", mur: "S", u: -1.4, y: 1.1 }, { t: "plafonnier", id: "pl_sejour" }, { t: "prise", id: "pc_sejour", mur: "N", u: -1.9, y: 0.75 },
        porte("entree", "S", 0.8), porte("cuisine", "O", 0.6),
        { t: "fenetre", mur: "N", u: 0.6, y: 1.45, w: 1.2, h: 1.15, vue: "nuit", rideaux: 0x8a5a3a },
        { t: "tapis", x: -0.45, z: -0.35, w: 2.6, d: 1.9, couleurs: ["#7a2f2a", "#e2d3ae", "#2f3f55"] },
        { t: "modele", f: "modern_wooden_cabinet", x: -1.05, z: -1.76, e: [0.8, 1, 1], avec: [ { t: "tele", id: "television", x: 0.3, y: 0.68, z: -0.02 }, { t: "modele", f: "standing_picture_frame_02", x: -0.55, y: 0.68, z: 0.02, r: 0.3, s: 0.8 } ] },
        { t: "modele", f: "Sofa_01", x: -0.45, z: 0.4, r: Math.PI, s: 1.2, avec: [ { t: "plaid", x: 0.86, y: 0.72, z: 0.1, r: Math.PI / 2, c: 0xa8553f }, { t: "modele", f: "throw_pillows_01", x: -0.75, y: 0.5, z: -0.02, s: 0.7 } ] },
        { t: "modele", f: "coffee_table_round_01", x: -0.45, z: -0.6, s: 0.62, avec: [ { t: "tasse", x: 0.12, y: 0.303, z: 0.1, c: 0xa8553f }, { t: "telecommande", x: -0.16, y: 0.303, z: 0.05, r: -0.4 }, { t: "livre", x: -0.05, y: 0.303, z: -0.2, r: 0.4 } ] },
        { t: "modele", f: "wooden_bookshelf_worn", x: 2.1, z: -0.8, r: -Math.PI / 2, avec: [
          { t: "livres", y: 0.39, w: 1.1, z: 0.02, g: 3 }, { t: "livres", y: 0.67, w: 1.1, z: 0.02, g: 5 }, { t: "livres", x: -0.2, y: 0.96, w: 0.7, z: 0.02, g: 2, n: 14 }, { t: "modele", f: "ceramic_vase_01", x: 0.38, y: 0.96, z: 0.03, s: 0.6 },
          { t: "modele", f: "wicker_basket_02", x: 0.2, y: 1.66, z: 0.02 }, { t: "modele", f: "wicker_basket_01", x: -0.25, y: 0.11, z: 0.05, s: 1.5 } ] },
        { t: "modele", f: "fancy_picture_frame_02", mur: "E", u: 1.2, y: 1.62, auMur: true, s: 0.8 }, { t: "modele", f: "wall_clock", mur: "S", u: -0.45, y: 1.95, auMur: true },
        { t: "modele", f: "potted_plant_02", x: -1.95, z: 1.6, h: 0.85, sansOmbre: true } ] },
      cuisine: { nom: "la cuisine", court: "La cuisine", raccourci: "Cuisine", taille: [3.2, 2.8], sol: "carrelage", camera: [1.0, 1.62, 1.05], yaw: 0.25, pitch: -0.1, objets: [
        // murs du côté opposé à l'arrivée (tâche 13.2) : ils ne sont plus nus
        { t: "cadreTexte", mur: "S", u: -0.64, y: 1.6, titre: "JANVIER" }, { t: "modele", f: "hanging_picture_frame_02", mur: "S", u: -1.1, y: 1.6, auMur: true, s: 0.5 },
        { t: "inter", id: "int_cuisine", mur: "E", u: -0.3, y: 1.1 }, { t: "plafonnier", id: "pl_cuisine" }, { t: "prise", id: "pc_cuisine", mur: "O", u: 0.55, y: 1.15 },
        porte("sejour", "E", 0.7),
        { t: "cuisine", mur: "N", u: 0, y: 0, x0: -1.6, segments: [{ k: "bas", w: 0.6, haut: true }, { k: "evier", w: 0.8 }, { k: "tiroirs", w: 0.6, haut: true }, { k: "vide", w: 0.6, hotte: true }, { k: "bas", w: 0.6, haut: true }] },
        { t: "fenetre", mur: "N", u: -0.6, y: 1.8, w: 0.7, h: 0.55, rideaux: false, vue: "nuit" },
        { t: "modele", f: "electric_stove", id: "plaque", x: 0.7, z: -1.07, s: 1.05, zone: [0.55, 0.95, 0.7], voyant: [0.2, 0.8, 0.345] },
        { t: "frigo", id: "refrigerateur", x: -1.28, z: 0.42, r: Math.PI / 2 },
        { t: "modele", f: "round_wooden_table_01", x: -0.3, z: 0.85, e: [0.62, 0.75, 0.62], avec: [ { t: "tasse", x: 0.12, y: 0.753, z: 0.05, c: 0xa8553f }, { t: "modele", f: "wooden_bowl_02", x: -0.1, y: 0.753, z: 0.12, s: 1.2 }, { t: "livre", x: 0.05, y: 0.753, z: -0.2, r: 0.5, c: 0x3f5a8a } ] },
        { t: "modele", f: "painted_wooden_chair_02", x: 0.3, z: 0.95, r: -Math.PI / 2 - 0.3, s: 0.74 }, { t: "modele", f: "painted_wooden_chair_02", x: -0.4, z: 0.25, r: 0.2, s: 0.74 },
        { t: "modele", f: "pot_enamel_01", x: 0.62, y: 0.93, z: -1.1 }, { t: "modele", f: "jug_01", x: -1.35, y: 0.92, z: -1.15, r: 0.6 }, { t: "torchon", x: -0.5, y: 0.62, z: -0.785 } ] },
      // l'escalier de la maison : une vraie cage à deux volées, de l'entrée au palier (cage.js) ; on la monte marche après marche
      escalier: { nom: "le pied de l'escalier", court: "L'escalier", raccourci: "Escalier", ensemble: "cage", coque: false, pos: [0, 0, 0], taille: [2.6, LE], h: 2.6, teinte: 0xe9dfce, camera: [0, 1.62, LE / 2 - 0.45], pitch: 0.05, objets: [
        { t: "cageEtage", sol: "bois", marches: "bois", soubassement: false, sousEscalier: true }, monter("palier", LE),
        { t: "inter", id: "int_escalier", mur: "O", u: -0.35, y: 1.1 }, { t: "plafonnier", id: "pl_escalier", z: -0.2 }, porte("entree", "S", 0),
        { t: "modele", f: "hanging_picture_frame_03", mur: "E", u: 0.3, y: 1.65, auMur: true, s: 0.7 }, { t: "modele", f: "fancy_picture_frame_01", x: 1.2, y: 1.95, z: -LE / 2 - 0.7, r: -Math.PI / 2, auMur: true, s: 0.5 }, { t: "modele", f: "hanging_picture_frame_03", x: 1.2, y: 2.55, z: -LE / 2 - 1.5, r: -Math.PI / 2, auMur: true, s: 0.7 },
        { t: "modele", f: "potted_plant_01", x: -1.05, z: 0.55, h: 0.7, sansOmbre: true },
        // sous l'escalier : un banc, les photos de famille au mur
        { t: "modele", f: "painted_wooden_bench", x: -0.6, z: -0.66, r: 0, h: 0.5 }, { t: "modele", f: "fancy_picture_frame_02", x: -0.85, y: 1.6, z: -LE / 2, auMur: true, s: 0.5 }, { t: "modele", f: "hanging_picture_frame_03", x: -0.3, y: 1.75, z: -LE / 2, auMur: true, s: 0.55 }, { t: "modele", f: "fancy_picture_frame_01", x: -0.4, y: 1.3, z: -LE / 2, auMur: true, s: 0.4 },
        { t: "tapis", x: -0.1, z: 0.25, w: 1.6, d: 0.8, couleurs: ["#6b2a26", "#d9c9a3", "#2f3f55"] } ] },
      palier: { nom: "le palier", court: "Le palier", raccourci: "Palier", ensemble: "cage", coque: false, pos: [0, CAGE.H, -LE / 2 + LPA / 2], taille: [3.8, LPA], h: 2.6, teinte: 0xe9dfce, camera: [0, 1.62, LPA / 2 - 0.9], pitch: -0.08, objets: [
        { t: "cageEtage", sol: "bois", marches: "bois", soubassement: false, arrive: true, monte: false, dernier: true }, descendre("escalier", LPA),
        { t: "inter", id: "int_palier", mur: "N", u: 1.55, y: 1.1 }, { t: "plafonnier", id: "pl_palier" }, { t: "prise", id: "pc_palier", mur: "S", u: -1.35, y: 0.75 }, { t: "prise", id: "pc_sde", mur: "E", u: 0.85, y: 1.15 }, { t: "boite", id: "bd_et", mur: "N", u: -1.55, y: 2.25 },
        porte("chambre1", "O", 0.2), porte("chambre2", "S", 0.2), porte("chambre3", "E", -0.3),
        // la table à repasser de Mme Morel, le fer branché sur la prise du palier
        { t: "repassage", id: "fer", x: 1.15, z: 0.62 },
        { t: "modele", f: "wicker_basket_02", x: 1.62, z: 1.05, h: 0.42, e: [0.62, 1, 0.62], avec: [{ t: "linge", y: 0.36 }] },
        { t: "tapis", x: -0.2, z: 0.1, w: 1.8, d: 0.9, couleurs: ["#3f5a4a", "#e2d3ae", "#7a2f2a"] },
        { t: "modele", f: "fancy_picture_frame_02", mur: "O", u: -0.85, y: 1.7, auMur: true, s: 0.6 }, { t: "modele", f: "potted_plant_01", x: -1.6, z: 1.0, h: 0.75, sansOmbre: true },
        // au fond de la cage, au-dessus du palier intermédiaire : deux cadres
        { t: "modele", f: "hanging_picture_frame_03", x: -0.5, y: 0.75, z: -LPA / 2 - 3.3, auMur: true, s: 0.8 }, { t: "modele", f: "fancy_picture_frame_02", x: 0.5, y: 0.8, z: -LPA / 2 - 3.3, auMur: true, s: 0.7 },
        { t: "modele", f: "wall_clock", mur: "N", u: 1.55, y: 1.85, auMur: true }, { t: "modele", f: "painted_wooden_nightstand", x: -1.6, z: -0.95, h: 0.55, r: Math.PI / 2, avec: [{ t: "modele", f: "ceramic_vase_01", x: 0, y: 0.55, z: 0, s: 0.7 }] } ] },
      chambre1: { nom: "la chambre des parents", court: "La chambre des parents", raccourci: "Parents", taille: [3.4, 3.2], sol: "bois", camera: [1.45, 1.62, 1.35], yaw: 0.73, pitch: -0.1, objets: [
        // murs du côté opposé à l'arrivée (tâche 13.2) : ils ne sont plus nus
        { t: "modele", f: "hanging_picture_frame_03", mur: "S", u: -1.38, y: 1.6, auMur: true, s: 0.5 }, { t: "modele", f: "fancy_picture_frame_02", mur: "E", u: 1.33, y: 1.62, auMur: true, s: 0.4 },
        { t: "inter", id: "int_chambre1", mur: "E", u: 1.0, y: 1.1 }, { t: "plafonnier", id: "pl_chambre1" }, { t: "prise", id: "pc_chambre1", mur: "N", u: 1.2, y: 0.75 }, porte("palier", "E", -0.6),
        { t: "lit", x: -0.15, z: -0.49, w: 1.6, couette: 0x7a4a55, plaid: 0xd9c9a3 },
        { t: "modele", f: "painted_wooden_nightstand", x: 0.95, z: -1.33, h: 0.55, avec: [ { t: "lampeChevet", id: "chevet", x: -0.06, y: 0.55, z: -0.03, c: 0x8a6a44 } ] },
        { t: "modele", f: "painted_wooden_nightstand", x: -1.25, z: -1.33, h: 0.55, avec: [ { t: "lampeChevet", x: 0.05, y: 0.55, z: -0.03, c: 0x8a6a44 }, { t: "livre", x: -0.1, y: 0.55, z: 0.1, r: 0.4 } ] },
        { t: "fenetre", mur: "O", u: 0.7, y: 1.45, w: 1.0, h: 1.15, vue: "nuit", rideaux: 0x7a4a55 },
        { t: "modele", f: "GothicCabinet_01", x: -1.38, z: 0.85, r: Math.PI / 2, h: 1.9, e: [0.8, 1, 0.6] },
        { t: "modele", f: "GothicCommode_01", x: 0.2, z: 1.36, r: Math.PI, h: 0.9, avec: [ { t: "modele", f: "standing_picture_frame_02", x: -0.3, y: 0.9, z: 0, r: 0.3, s: 0.8 }, { t: "modele", f: "ceramic_vase_01", x: 0.3, y: 0.9, z: 0, s: 0.7 } ] },
        { t: "tapis", x: -0.15, z: 0.75, w: 2.0, d: 0.9, couleurs: ["#7a2f2a", "#e2d3ae", "#2f3f55"] },
        { t: "modele", f: "hanging_picture_frame_03", mur: "N", u: -0.15, y: 2.0, auMur: true, s: 0.8 } ] },
      chambre2: { nom: "la chambre de Théo", court: "La chambre de Théo", raccourci: "Théo", taille: [3.2, 3.2], sol: "bois", camera: [0.4, 1.62, 1.32], yaw: 0.15, pitch: -0.1, objets: [
        // murs du côté opposé à l'arrivée (tâche 13.2) : ils ne sont plus nus
        { t: "affiche", mur: "S", u: -0.42, y: 1.64, w: 0.45, h: 0.62, texte: "SKATE", couleurs: ["#44222a", "#f2efe6", "#e8790c"] }, { t: "affiche", mur: "S", u: -1.32, y: 1.66, w: 0.4, h: 0.56, texte: "LIVE", couleurs: ["#1f3a44", "#e9b400", "#22262d"] },
        { t: "inter", id: "int_chambre2", mur: "S", u: -0.9, y: 1.1 }, { t: "plafonnier", id: "pl_chambre2" }, { t: "prise", id: "pc_chambre2a", mur: "O", u: 0.6, y: 0.75 }, { t: "prise", id: "pc_chambre2b", mur: "N", u: 1.0, y: 0.75 }, porte("palier", "S", 0.6),
        { t: "lit", id: "lit", x: -0.88, z: -0.56, w: 1.0, l: 2.0, couette: 0x2f4a6b, plaid: false, coussins: false },
        // la rallonge qui alimente la lampe du bureau : elle part de la prise, longe le mur et passe sous le pied du lit
        { t: "rallonge", id: "rallonge", x: 0, z: 0, points: [[-0.42, 0.006, -1.5], [-0.2, 0.006, -1.42], [0.2, 0.006, -1.46], [0.55, 0.006, -1.4]] },
        { t: "radiateur", id: "radiateur2", x: -1.36, z: 0.95, r: Math.PI / 2 },
        { t: "modele", f: "wooden_table_02", x: 1.22, z: -0.3, r: -Math.PI / 2, avec: [ { t: "ordinateur", id: "ordinateur", x: -0.1, y: 0.8, z: 0.02 }, { t: "modele", f: "desk_lamp_arm_01", x: -0.45, y: 0.8, z: -0.18, h: 0.42, r: 0.6 } ] },
        { t: "modele", f: "painted_wooden_chair_02", x: 0.6, z: -0.3, r: Math.PI / 2, s: 0.74 },
        { t: "personne", id: "theo", x: 0.6, z: -0.3, r: Math.PI / 2, assise: 0.4, haut: 0x2f3f55, bas: 0x3a3f46, cheveux: 0x3a2a1c, casque: true, manches: true },
        { t: "fenetre", mur: "E", u: -0.95, y: 1.6, w: 0.8, h: 0.9, vue: "nuit", rideaux: false },
        { t: "affiche", mur: "N", u: -0.1, y: 1.65, texte: "TOURNÉE" }, { t: "affiche", mur: "O", u: -0.6, y: 1.65, w: 0.45, h: 0.62, texte: "FINALE", couleurs: ["#3f5a3a", "#f2efe6", "#1f2a44"] },
        { t: "tapis", x: 0.2, z: 0.45, w: 1.5, d: 1.0, couleurs: ["#22262d", "#8d949c", "#c8261e"] }, { t: "linge", x: -0.2, y: 0.02, z: 0.75 },
        { t: "modele", f: "cardboard_box_01", x: 1.3, z: 1.25, r: 0.4, h: 0.3 } ] },
      chambre3: { nom: "la chambre de Léa", court: "La chambre de Léa", raccourci: "Léa", taille: [3.2, 3], sol: "bois", camera: [-1.15, 1.62, 1.05], yaw: -0.5, pitch: -0.1, objets: [
        // murs du côté opposé à l'arrivée (tâche 13.2) : ils ne sont plus nus
        { t: "affiche", mur: "S", u: 1.15, y: 1.64, w: 0.45, h: 0.62, texte: "DANSE", couleurs: ["#5a2a4a", "#f2d9e2", "#b86a7a"] },
        { t: "inter", id: "int_chambre3", mur: "O", u: 0.9, y: 1.1 }, { t: "plafonnier", id: "pl_chambre3" }, { t: "prise", id: "pc_chambre3a", mur: "N", u: -1.0, y: 0.75 }, { t: "prise", id: "pc_chambre3b", mur: "E", u: 0.2, y: 0.75 }, porte("palier", "O", -0.5),
        { t: "lit", x: 0.4, z: -0.48, w: 1.0, l: 2.0, couette: 0xb86a7a, plaid: 0xf2efe6 },
        { t: "personne", id: "lea", x: -0.02, z: -0.75, r: -Math.PI / 2, assise: 0.5, haut: 0xb86a7a, bas: 0x2f3f55, cheveux: 0x5a3a22, longs: true, penchee: true, telephone: true, manches: true },
        { t: "radiateur", id: "radiateur3", x: -1.0, z: -1.3 },
        { t: "modele", f: "painted_wooden_nightstand", x: 1.32, z: 0.45, r: -Math.PI / 2, h: 0.5 }, { t: "chargeur", id: "chargeur", mur: "E", u: 0.2, y: 0.75 },
        { t: "fenetre", mur: "N", u: 0.4, y: 1.75, w: 0.9, h: 0.7, vue: "nuit", rideaux: 0xb86a7a },
        { t: "modele", f: "wooden_table_02", x: -0.2, z: 1.14, r: Math.PI, e: [0.9, 1, 0.8], avec: [ { t: "livre", x: 0.2, y: 0.8, z: 0, r: 0.3, c: 0x8a2f4a }, { t: "livre", x: 0.2, y: 0.828, z: 0.01, r: -0.1, c: 0x2f4a6b }, { t: "modele", f: "potted_plant_04", x: -0.3, y: 0.8, z: -0.05 }, { t: "tasse", x: -0.05, y: 0.8, z: 0.1, c: 0xb86a7a } ] },
        { t: "modele", f: "painted_wooden_chair_02", x: -0.2, z: 0.6, r: 0.2, s: 0.74 },
        { t: "affiche", mur: "E", u: -0.9, y: 1.65, w: 0.45, h: 0.62, texte: "DANSE", couleurs: ["#7a2f55", "#f2c2d0", "#2f3f55"] },
        { t: "tapis", x: -0.3, z: 0.1, w: 1.3, d: 0.9, couleurs: ["#b86a7a", "#f2efe6", "#7a2f55"] } ] },
    },
  },
};
