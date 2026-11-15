// Niveau 3 — « La moitié de l'appartement est morte » : l'appartement de M. Haddad.
// Installation inconnue à repérer, étiquettes fausses, neutre coupé. Câblage : ../moteur/logements/appartement70.js
import { appartement70, causesAppartement70, reperesAppartement70 as F } from "../moteur/logements/appartement70.js";

const AVAL = ["bd_plafond", "pl_couloir", "pl_chambre2", "pc_entree", "int_couloir", "int_chambre2"]; // ce qui est après le repiquage
const org = (b) => (b.includes("#") ? null : b.split(".")[0]);
const filVu = (P, ext) => P.vus.has(`indice:fil:${F.repiquage[P.cause === "B" ? "phase" : "neutre"]}:${ext}`);
const porte = (vers, mur, u) => ({ t: "porte", vers, mur, u, y: 1.025 });

export default {
  id: "niveau3", numero: 3, titre: "La moitié de l'appartement est morte", page: "atelier-3d-3.html",
  logement: appartement70, causes: causesAppartement70, fils: F,
  nomsDifferentiels: { ID1: "de la rangée du haut", ID2: "de la rangée du bas" },
  nomsBornes: { "bt.PE": "bornier de terre du tableau" },
  outils: ["vat", "multi", "ohm"],
  client: { nom: "M. Haddad", court: "M. Haddad", initiales: "KH", teinte: "#3f7a6b", role: "Infirmier de nuit · trois-pièces, immeuble des années 70" },
  accroche: "« Ah, vous voilà. Je viens de me lever, je repars travailler ce soir. Depuis hier soir, plus de lumière dans le couloir ni dans la chambre du fond, et la prise de l'entrée ne marche plus. Mais rien n'a sauté, j'ai regardé. »",
  mission: "Trouve pourquoi une partie de l'appartement de M. Haddad n'a plus de courant, prouve-le par une mesure, répare et refais le repérage du tableau.",
  depart: "entree",
  pitch: "Milieu d'après-midi, dans un immeuble des années 70. M. Haddad, infirmier de nuit, t'ouvre en robe de chambre : la moitié de son appartement est morte depuis hier soir, et aucun disjoncteur n'a sauté.",
  entrer: "Entrer chez M. Haddad",
  debut: "M. Haddad part se faire un café. Tu ne connais pas cette installation : fais le tour, essaie tout, le carnet dessine la carte pour toi.",
  humeurs: [{ apres: 75, texte: "« Vous en avez encore pour longtemps ? Je prends mon service à 19 h. »" }],
  questions: [
    { id: "quand", texte: "Ça s'est arrêté comment ?", reponse: (P) => ({ A: "« D'un coup, hier soir vers 22 h. Sans bruit. »", D: "« D'un coup, hier soir vers 22 h. Sans bruit. »", B: "« Hier soir, la lumière du couloir a vacillé, il y a eu une odeur de chaud, et plus rien. »", C: "« Hier soir. J'ai entendu comme un petit claquement vers l'entrée, mais tout est resté en haut. »" }[P.cause]) },
    { id: "saute", texte: "Rien n'a sauté, vous êtes sûr ?", reponse: () => "« Sûr. Tous les boutons du tableau sont en haut, j'ai regardé deux fois. »" },
    { id: "sdb", texte: "La salle de bain fonctionne ?", reponse: (P) => (P.cause === "C" ? "« Je ne me suis pas encore douché… Attendez. Ah non, tiens : ça ne s'allume pas non plus ! »" : "« Oui, j'en sors. »") },
    { id: "tableau", texte: "Qui a fait ce tableau ?", reponse: () => "« L'ancien propriétaire, il y a vingt ans. Les étiquettes, c'est son écriture. La prise de l'entrée, c'est un copain qui me l'a ajoutée plus tard. »" },
    { id: "travaux", texte: "Des travaux récemment ?", reponse: () => "« Pas chez moi. Le voisin du dessus a refait sa salle de bain le mois dernier, ça a tapé pendant des semaines. »" },
    { id: "plafond", si: (P) => P.carnet.tableau.length > 0, texte: "Il y a un faux plafond dans le couloir ?", reponse: () => "« Oui, avec une trappe, juste après la porte de la salle de bain. Je ne l'ai jamais ouverte. »" },
  ],
  regards: {
    bd_plafond: () => ({ texte: "Une boîte de dérivation, posée sur les suspentes du faux plafond. Plusieurs câbles en partent." }),
    bd_sdb: () => ({ texte: "La boîte de raccordement du plafonnier de la salle de bain. Deux câbles y entrent : l'un arrive du tableau, l'autre repart dans le plafond." }),
    [`fil:${F.repiquage.neutre}:vers`]: (P) => (P.cause === "A" ? { texte: "Le fil bleu qui arrive dans la boîte est sorti de son connecteur : le neutre est coupé ici.", type: "alerte", indice: "Faux plafond du couloir : le neutre (bleu) qui arrive est sorti de son connecteur.", valeur: true } : { texte: "Ce fil bleu est bien serré dans son connecteur.", valeur: false }),
    [`fil:${F.repiquage.phase}:vers`]: (P) => (P.cause === "B" ? { texte: "Le fil rouge qui arrive dans la boîte est sorti d'un connecteur bruni : la phase a chauffé et s'est coupée ici.", type: "alerte", indice: "Faux plafond du couloir : connecteur bruni, la phase (rouge) qui arrive est coupée.", valeur: true } : { texte: "Ce fil rouge est bien serré dans son connecteur.", valeur: false }),
    [`fil:${F.repiquage.neutre}:de`]: (P) => (P.cause === "D" ? { texte: "Le fil bleu qui repart vers le couloir est sorti de sa borne : le neutre est coupé ici, à la salle de bain.", type: "alerte", indice: "Boîte du plafonnier de la salle de bain : le neutre (bleu) du repiquage vers le couloir est desserré.", valeur: true } : { texte: "Ce fil bleu est bien serré dans sa borne.", valeur: false }),
  },
  ouvertures: {
    bd_plafond: (P) => ({ texte: P.cause === "A" ? "Tu ouvres la boîte : un fil bleu pend hors de son connecteur." : P.cause === "B" ? "Tu ouvres la boîte : un connecteur est bruni, un fil rouge en est sorti." : "Tu ouvres la boîte : tout est en place, les connecteurs sont propres et serrés." }),
    bd_sdb: (P) => ({ texte: P.cause === "D" ? "Tu ouvres la boîte du plafonnier : un fil bleu est sorti de sa borne." : "Tu ouvres la boîte du plafonnier : tout est serré." }),
  },
  // la surprise du neutre coupé, calculée par le moteur ; et ce que chaque mesure établit
  apresMesure(P, m) {
    if (m.outil !== "multi" && m.outil !== "vat") return null;
    const u = m.outil === "vat" ? (m.valeur ? 230 : 0) : m.valeur, r = [P.roleBorne(m.a), P.roleBorne(m.b)], o = [org(m.a), org(m.b)];
    const aval = o.some((x) => AVAL.includes(x)), ferme = P.e.positions.Q5 && P.e.positions.ID2;
    const paire = (x, y) => (r[0] === x && r[1] === y) || (r[0] === y && r[1] === x);
    if (aval && paire("neutre", "terre") && u >= 50) { const deja = P.vus.has("m:neutre230"); P.vus.add("m:neutre230"); return deja ? null : { texte: "230 V entre un fil bleu et la terre ! Le neutre est coupé en amont : il est « remonté » à la tension de la phase à travers une lampe restée allumée. Entre phase et neutre on lit 0 V, et pourtant c'est sous tension.", indice: "Sur les points morts : 230 V entre le neutre et la terre. Un neutre coupé peut être sous tension." }; }
    if (aval && ferme && paire("phase", "terre") && u >= 50) P.vus.add("m:phase230");
    if (aval && ferme && paire("phase", "neutre") && u < 50) P.vus.add("m:pn0");
    if (aval && ferme && paire("phase", "terre") && u < 50) P.vus.add("m:phase0");
    if (ferme && (m.a === "Q5.Lout" || m.b === "Q5.Lout") && u < 50) P.vus.add("m:q5aval0");
    if ((m.a === "ID2.Lout" || m.b === "ID2.Lout") && u >= 50) P.vus.add("m:amont230");
    return null;
  },
  preuve(P) {
    const neutre = P.vus.has("m:neutre230") || (P.vus.has("m:pn0") && P.vus.has("m:phase230"));
    if (P.cause === "A" && neutre && filVu(P, "vers")) return "Phase présente et 0 V entre phase et neutre sur un point mort (ou 230 V entre neutre et terre) : neutre coupé. Dans la boîte du faux plafond, le fil bleu est sorti de son connecteur.";
    if (P.cause === "D" && neutre && filVu(P, "de")) return "Neutre coupé constaté sur les points morts ; la boîte du faux plafond est saine ; à la salle de bain, le neutre du repiquage est sorti de sa borne.";
    if (P.cause === "B" && P.vus.has("m:phase0") && filVu(P, "vers")) return "0 V entre phase et terre sur un point mort, disjoncteur fermé : la phase n'arrive plus. Dans la boîte du faux plafond, le connecteur de phase est bruni et le fil en est sorti.";
    if (P.cause === "C" && P.vus.has("m:q5aval0") && P.vus.has("m:amont230")) return "230 V à la sortie de l'interrupteur différentiel, 0 V à la sortie du disjoncteur « Lumière chambres », manette en haut : le disjoncteur ne conduit plus.";
    return null;
  },
  indices(P) {
    const methode = "Tu ne connais pas cette installation : essaie chaque lumière et chaque prise, puis baisse les disjoncteurs un par un pour voir ce que chacun coupe vraiment. La panne est entre le dernier point qui marche et le premier point mort du même circuit.";
    const carte = P.carnet.tableau.some((t) => t.includes("Lumière chambres"));
    let zone, mesure;
    if (!carte) { zone = "Au tableau, dans l'entrée : ne te fie pas aux étiquettes. Allume d'abord les lumières qui marchent, puis baisse « Lumière chambres » et regarde ce qui s'éteint."; mesure = "Le carnet, onglet « Le tableau », note pour toi ce que chaque disjoncteur coupe."; }
    else if (!["m:neutre230", "m:pn0", "m:phase0", "m:q5aval0"].some((k) => P.vus.has(k))) { zone = "Va sur un point mort facile d'accès : la prise de l'entrée."; mesure = "Au multimètre : mesure entre la phase et la terre, puis entre la phase et le neutre, puis entre le neutre et la terre. 230 V puis 0 V : c'est le neutre qui manque. 0 V et 0 V : c'est la phase."; }
    else if (P.vus.has("m:phase0") && !P.vus.has("m:q5aval0") && P.cause === "C") { zone = "La phase n'arrive pas. Remonte à la source : le disjoncteur du circuit, au tableau."; mesure = "Mesure à la sortie du disjoncteur, puis à la sortie de l'interrupteur différentiel de la rangée, par rapport au bornier de terre."; }
    else if (!P.ouverts.has("bd_plafond")) { zone = "Les points morts ont une jonction commune. Demande à M. Haddad s'il y a un faux plafond, et cherche la trappe dans le couloir."; mesure = "Avant d'ouvrir la boîte : baisse le disjoncteur du circuit et vérifie l'absence de tension au VAT (testé avant et après sur une prise qui marche)."; }
    else if (!P.aPreuve()) { zone = "La boîte du faux plafond est-elle en cause ? Si tout y est serré, remonte d'un cran : d'où vient le câble qui l'alimente ? Du dernier point qui marche."; mesure = "Touche le fil qui te paraît sorti de sa borne pour le constater. Hors tension, le multimètre en Ω te dit si deux points sont encore reliés."; }
    else { zone = "Tu as ta preuve."; mesure = "Touche « J'ai trouvé »."; }
    return [methode, zone, mesure];
  },
  diagnostics: [
    { id: "A", texte: "Le neutre est coupé dans la boîte du faux plafond du couloir", non: "« Dans le plafond ? Vous l'avez vu ? » Ce n'est pas ce que tu as constaté." },
    { id: "B", texte: "La phase est coupée dans la boîte du faux plafond du couloir", non: "« Dans le plafond ? Vous l'avez vu ? » Ce n'est pas ce que tu as constaté." },
    { id: "C", texte: "Le disjoncteur « Lumière chambres » ne conduit plus", non: "Tu as mesuré sa sortie ? La salle de bain, qui est sur ce disjoncteur, s'allume. Ce n'est pas lui." },
    { id: "D", texte: "Le neutre est desserré à la salle de bain, au départ vers le couloir", non: "« À la salle de bain ? Mais elle marche ! » Tu n'as rien qui le prouve." },
    { id: "ampoule", texte: "L'ampoule du couloir est grillée", non: "Une ampoule grillée n'éteint pas la chambre du fond ni la prise de l'entrée." },
    { id: "inter", texte: "L'interrupteur du couloir est hors service", non: "Un interrupteur en panne n'éteint que sa lampe : la chambre du fond et la prise de l'entrée sont mortes aussi." },
  ],
  remedes: [
    { id: "boite", ou: ["bd_plafond"], pour: ["A", "B"], repare: true, texte: "Refaire la connexion dans la boîte du faux plafond, avec un connecteur neuf", fait: "Disjoncteur baissé et absence de tension vérifiée, tu refais la connexion avec un connecteur neuf, tu tires sur chaque fil, tu refermes la boîte. Tu remets sous tension et tu essaies chaque point : tout fonctionne.", non: "Ce n'est pas là qu'est le défaut." },
    { id: "sdb", ou: ["bd_sdb"], pour: ["D"], repare: true, texte: "Resserrer le neutre du repiquage, à la boîte du plafonnier de la salle de bain", fait: "Disjoncteur baissé et absence de tension vérifiée, tu réengages le fil bleu dans sa borne, tu serres, tu tires dessus. Tu remets sous tension et tu essaies chaque point : tout fonctionne.", non: "Ce n'est pas là qu'est le défaut." },
    { id: "disj", ou: ["Q5"], pour: ["C"], repare: true, texte: "Remplacer le disjoncteur « Lumière chambres » par le même calibre", fait: "Tu remplaces le disjoncteur par un neuf du même calibre, 16 A pour ce circuit en 1,5 mm². Tu remets sous tension et tu essaies chaque point : tout fonctionne.", non: "Le disjoncteur conduit : la salle de bain, qu'il alimente, s'allume." },
    { id: "gros", ou: ["Q5"], pour: [], texte: "Remplacer le disjoncteur par un 20 A, plus solide", non: "Jamais : ce circuit est en 1,5 mm². Le calibre protège les conducteurs, 16 A au plus." },
    { id: "pont", ou: ["bd_plafond", "bd_sdb"], pour: [], texte: "Reprendre un neutre sur le circuit des prises, qui passe à côté", non: "Jamais : chaque circuit garde sa phase ET son neutre. Un neutre emprunté fait déclencher les différentiels et surcharge un conducteur." },
  ],
  verifier(P) { const e = P.e; for (const id of ["int_couloir", "int_chambre2", "int_sdb"]) e.positions[id] = true; const r = P.calc(); return ["pl_couloir", "pl_chambre2", "pl_sdb"].every((x) => r.allume(x)) && r.alimente("pc_entree") ? null : "Tu remets sous tension : le couloir reste dans le noir. Ce n'était pas ça."; },
  // geste de fin : refaire le repérage avec ce que le carnet a établi
  etiquettes: [
    { dj: "Q4", ancienne: "Lumière séjour", bonne: "a", choix: [["a", "Lumière séjour, cuisine, chambre 1, entrée"], ["b", "Lumière séjour seulement"], ["c", "Lumière couloir et chambres"]] },
    { dj: "Q5", ancienne: "Lumière chambres", bonne: "b", choix: [["a", "Lumière chambres 1 et 2"], ["b", "Lumière salle de bain, couloir, chambre 2 + prise de l'entrée"], ["c", "Lumière couloir seulement"]] },
  ],
  explications: {
    A: "Le circuit étiqueté « Lumière chambres » alimente d'abord la salle de bain, puis une boîte dans le faux plafond du couloir. Dans cette boîte, le neutre qui arrive est sorti de son connecteur : tout ce qui est après n'a plus de neutre. La phase, elle, arrive toujours : avec l'interrupteur du couloir resté sur « allumé », le fil bleu en aval est à 230 V par rapport à la terre.",
    B: "Dans la boîte du faux plafond du couloir, la connexion de phase était mal serrée : elle a chauffé, bruni son connecteur, puis s'est coupée. Tout ce qui part de cette boîte (couloir, chambre 2, prise de l'entrée) n'a plus de phase. La salle de bain, alimentée avant la boîte, marche encore.",
    C: "Le disjoncteur « Lumière chambres » est hors service : sa manette est en haut, il y a 230 V à son entrée et rien à sa sortie. Tout son circuit est mort, salle de bain comprise : M. Haddad ne l'avait pas remarqué.",
    D: "Le câble qui alimente la boîte du faux plafond repart de la boîte du plafonnier de la salle de bain. C'est là que son neutre s'est desserré : la salle de bain marche, tout ce qui est après est mort. La boîte du faux plafond est saine : il fallait remonter d'un cran.",
  },
  demarches: {
    A: ["Faire le tour, essayer chaque lumière et chaque prise.", "Baisser les disjoncteurs un par un : « Lumière chambres » alimente la salle de bain, le couloir, la chambre 2 et la prise de l'entrée.", "Sur la prise de l'entrée : 230 V entre phase et terre, 0 V entre phase et neutre : neutre coupé, entre la salle de bain et les points morts.", "Couper, vérifier l'absence de tension, ouvrir la trappe et la boîte du faux plafond : le bleu est sorti.", "Refaire la connexion, tout essayer, refaire les étiquettes."],
    B: ["Faire le tour, essayer chaque lumière et chaque prise.", "Baisser les disjoncteurs un par un pour dessiner la vraie carte.", "Sur la prise de l'entrée : 0 V entre phase et terre : la phase n'arrive plus. À la sortie du disjoncteur, elle est là.", "Couper, vérifier l'absence de tension, ouvrir la boîte du faux plafond : connecteur bruni.", "Refaire la connexion avec un connecteur neuf, tout essayer, refaire les étiquettes."],
    C: ["Faire le tour : la salle de bain est morte aussi, M. Haddad ne l'avait pas vu.", "Tous les points morts sont sur le même disjoncteur, et aucun point de ce circuit ne marche.", "Mesurer au tableau : 230 V à la sortie de l'interrupteur différentiel, 0 V à la sortie du disjoncteur, manette en haut.", "Remplacer le disjoncteur par le même calibre.", "Tout essayer, refaire les étiquettes."],
    D: ["Faire le tour, dessiner la vraie carte en baissant les disjoncteurs.", "Sur un point mort : phase présente, 0 V entre phase et neutre : neutre coupé.", "Ouvrir la boîte du faux plafond : elle est saine, mais son neutre d'arrivée est mort.", "Remonter au dernier point qui marche : la boîte du plafonnier de la salle de bain. Le bleu du repiquage est sorti.", "Resserrer, tout essayer, refaire les étiquettes."],
  },
  conseilsFin: ["Signale à M. Haddad que ce circuit mélange de l'éclairage et une prise, et que le repérage de son tableau était faux."],
  inutile(P) {
    const l = [], utiles = { A: ["bd_plafond"], B: ["bd_plafond"], C: [], D: ["bd_plafond", "bd_sdb"] }[P.cause];
    const trop = [...P.ouverts].filter((id) => !utiles.includes(id)); if (trop.length) l.push(`Ouvert sans que ce soit nécessaire : ${trop.map((id) => P.nomOrgane(id, true)).join(", ")}.`);
    if (P.essais.has("pl_couloir") || P.essais.has("pl_chambre2")) l.push("Une ampoule changée pour rien : plusieurs points étaient morts en même temps, ce n'était pas une ampoule.");
    return l;
  },
  plan: {
    lieux: {
      // L'appartement de M. Haddad, infirmier de nuit : il dort le jour (volets à moitié baissés), sa tenue attend sur une chaise,
      // sa tasse de café traîne. Les prises, interrupteurs, boîtes et portes sont là où le câblage les met.
      entree: { nom: "l'entrée", court: "L'entrée", raccourci: "Entrée", taille: [2.6, 2.6], sol: "bois", camera: [0.8, 1.62, 0.85], yaw: 0.8, pitch: -0.08, objets: [
        { t: "tableau", mur: "N", u: 0.2, y: 1.45 }, { t: "inter", id: "int_entree", mur: "N", u: -0.9, y: 1.1 }, { t: "plafonnier", id: "pl_entree" }, { t: "prise", id: "pc_entree", mur: "O", u: -0.85, y: 0.75 }, porte("couloir", "E", 0.2),
        { t: "porteEntree", mur: "S", u: 0, y: 0 }, { t: "portemanteau", mur: "O", u: 0.2, y: 1.74 }, { t: "chaussures", mur: "O", u: 0.2, y: 0 },
        { t: "tapis", x: 0, z: 0.1, w: 1.5, d: 1.1, couleurs: ["#3f5a4a", "#e2d3ae", "#2f3f55"] },
        { t: "modele", f: "ClassicConsole_01", x: 1.14, z: -0.82, r: -Math.PI / 2, s: 0.6, avec: [
          { t: "cles", x: -0.28, y: 0.572, z: 0.03 }, { t: "courrier", x: 0, y: 0.572, z: 0.02 }, { t: "modele", f: "standing_picture_frame_01", x: 0.28, y: 0.572, z: -0.03, r: -0.3, s: 0.85 } ] },
        { t: "modele", f: "ornate_mirror_01", mur: "E", u: -0.82, y: 1.5, auMur: true, s: 1.0 },
        { t: "modele", f: "hanging_picture_frame_03", mur: "N", u: -0.38, y: 1.78, auMur: true, s: 0.7 } ] },
      couloir: { nom: "le couloir", court: "Le couloir", raccourci: "Couloir", taille: [5.2, 1.6], sol: "bois", camera: [2.1, 1.62, 0], yaw: Math.PI / 2, pitch: -0.05, objets: [
        { t: "inter", id: "int_couloir", mur: "N", u: 1.9, y: 1.1 }, { t: "plafonnier", id: "pl_couloir", x: 0.3 }, { t: "prise", id: "pc_couloir", mur: "S", u: -1.5, y: 0.75 }, { t: "trappe", vers: "plafond", x: -1.2, z: 0 },
        porte("entree", "E", 0), porte("sejour", "N", 0.6), porte("chambre1", "N", -0.9), porte("sdb", "S", 0.2), porte("chambre2", "O", 0),
        { t: "tapis", x: -0.1, z: 0, w: 3.9, d: 0.72, couleurs: ["#6b2a26", "#d9c9a3", "#2f3f55"] },
        { t: "modele", f: "fancy_picture_frame_02", mur: "N", u: 1.32, y: 1.62, auMur: true, s: 0.45 }, { t: "modele", f: "fancy_picture_frame_01", mur: "S", u: 1.45, y: 1.62, auMur: true, s: 0.5 },
        { t: "modele", f: "hanging_picture_frame_03", mur: "N", u: -2.0, y: 1.62, auMur: true, s: 0.75 }, { t: "modele", f: "potted_plant_01", x: -2.32, z: 0.6, h: 0.7, sansOmbre: true } ] },
      sejour: { nom: "le séjour", court: "Le séjour", raccourci: "Séjour", taille: [4.6, 4], sol: "bois", camera: [0.45, 1.62, 1.7], yaw: 0.12, pitch: -0.1, objets: [
        { t: "inter", id: "int_sejour", mur: "S", u: -1.4, y: 1.1 }, { t: "plafonnier", id: "pl_sejour" }, { t: "prise", id: "pc_sejour1", mur: "N", u: -1.2, y: 0.75 }, { t: "prise", id: "pc_sejour2", mur: "E", u: 0.8, y: 0.75 }, { t: "boite", id: "bd_a", mur: "N", u: 1.5, y: 2.2 },
        porte("couloir", "S", 0.8), porte("cuisine", "O", 0.6),
        { t: "fenetre", mur: "N", u: 0.42, y: 1.45, w: 1.05, h: 1.15, vue: "ville", volet: 0.45, rideaux: 0x6f7f8f },
        { t: "tapis", x: -0.45, z: -0.35, w: 2.6, d: 1.9, couleurs: ["#2f3f55", "#d9c9a3", "#7a2f2a"] },
        { t: "modele", f: "modern_wooden_cabinet", x: -1.05, z: -1.76, e: [0.8, 1, 1], avec: [ { t: "tele", id: "television", x: 0.56, y: 0.68, z: -0.02 } ] },
        { t: "modele", f: "Sofa_01", x: -0.45, z: 0.55, r: Math.PI, s: 1.2, avec: [ { t: "plaid", x: 0.86, y: 0.72, z: 0.1, r: Math.PI / 2, c: 0x3f7a6b }, { t: "modele", f: "throw_pillows_01", x: -0.75, y: 0.5, z: -0.02, s: 0.7 } ] },
        { t: "modele", f: "coffee_table_round_01", x: -0.45, z: -0.6, s: 0.62, avec: [
          { t: "tasse", x: 0.12, y: 0.303, z: 0.1 }, { t: "telecommande", x: -0.16, y: 0.303, z: 0.05, r: -0.4 }, { t: "livre", x: -0.05, y: 0.303, z: -0.2, r: 0.4 } ] },
        { t: "modele", f: "wooden_bookshelf_worn", x: 2.1, z: -0.8, r: -Math.PI / 2, avec: [
          { t: "livres", y: 0.39, w: 1.1, z: 0.02, g: 2 }, { t: "livres", y: 0.67, w: 1.1, z: 0.02, g: 4 }, { t: "livres", x: -0.2, y: 0.96, w: 0.7, z: 0.02, g: 1, n: 14 }, { t: "modele", f: "standing_picture_frame_02", x: 0.38, y: 0.96, z: 0.05, r: -0.3, s: 0.8 },
          { t: "livres", x: 0.2, y: 1.28, w: 0.7, z: 0.02, g: 6, n: 14 }, { t: "modele", f: "ceramic_vase_01", x: -0.38, y: 1.28, z: 0.03, s: 0.6 }, { t: "modele", f: "wicker_basket_02", x: 0.2, y: 1.66, z: 0.02 }, { t: "modele", f: "wicker_basket_01", x: -0.25, y: 0.11, z: 0.05, s: 1.5 } ] },
        { t: "modele", f: "fancy_picture_frame_02", mur: "O", u: -1.0, y: 1.62, auMur: true, s: 0.8 }, { t: "modele", f: "wall_clock", mur: "S", u: -0.45, y: 1.95, auMur: true },
        { t: "modele", f: "potted_plant_02", x: -1.95, z: 1.6, h: 0.85, sansOmbre: true } ] },
      cuisine: { nom: "la cuisine", court: "La cuisine", raccourci: "Cuisine", taille: [3, 2.8], sol: "carrelage", camera: [0.3, 1.62, 1.1], yaw: 0, pitch: -0.1, objets: [
        { t: "inter", id: "int_cuisine", mur: "E", u: -0.3, y: 1.1 }, { t: "plafonnier", id: "pl_cuisine" }, { t: "prise", id: "pc_cuisine1", mur: "N", u: -0.9, y: 1.15 }, { t: "prise", id: "pc_cuisine2", mur: "N", u: -0.2, y: 1.15 }, { t: "prise", id: "pc_cuisine3", mur: "O", u: 0.6, y: 1.15 },
        porte("sejour", "E", 0.7),
        { t: "cuisine", mur: "N", u: 0, y: 0, x0: -1.5, segments: [{ k: "bas", w: 0.6, haut: true }, { k: "evier", w: 0.8 }, { k: "tiroirs", w: 0.6, haut: true }, { k: "vide", w: 0.55, hotte: true }] },
        { t: "fenetre", mur: "N", u: -0.5, y: 1.8, w: 0.7, h: 0.55, rideaux: false, vue: "ville", volet: 0.35 },
        { t: "modele", f: "electric_stove", id: "plaque", x: 0.775, z: -1.07, s: 1.05, zone: [0.55, 0.95, 0.7], voyant: [0.2, 0.8, 0.345] },
        { t: "frigo", id: "refrigerateur", x: -1.18, z: 0.42, r: Math.PI / 2 },
        { t: "modele", f: "round_wooden_table_01", x: -0.42, z: 1.0, e: [0.5, 0.75, 0.5], avec: [ { t: "tasse", x: 0.08, y: 0.753, z: 0.05, c: 0x2f5a6b }, { t: "modele", f: "plastic_thermos", x: -0.12, y: 0.753, z: -0.08, s: 0.9 }, { t: "modele", f: "wooden_bowl_02", x: -0.05, y: 0.753, z: 0.16, s: 1.2 } ] },
        { t: "modele", f: "painted_wooden_chair_02", x: 0.02, z: 1.12, r: -Math.PI / 2 - 0.3, s: 0.74 },
        { t: "modele", f: "pot_enamel_01", x: 0.2, y: 0.93, z: -1.1 }, { t: "modele", f: "jug_01", x: -1.25, y: 0.92, z: -1.15, r: 0.6 }, { t: "torchon", x: -0.6, y: 0.62, z: -0.785 } ] },
      chambre1: { nom: "la chambre 1", court: "La chambre 1", raccourci: "Chambre 1", taille: [3.2, 3.2], sol: "bois", camera: [0.85, 1.62, 1.1], yaw: 0.4, pitch: -0.2, objets: [
        { t: "inter", id: "int_chambre1", mur: "S", u: 0.6, y: 1.1 }, { t: "plafonnier", id: "pl_chambre1" }, { t: "prise", id: "pc_chambre1", mur: "N", u: 0.9, y: 0.75 }, porte("couloir", "S", -0.7),
        { t: "fenetre", mur: "O", u: 0.25, y: 1.45, w: 1.0, h: 1.15, vue: "ville", volet: 0.7, rideaux: 0x4f5d73 },
        { t: "lit", x: -0.6, z: -0.62, w: 1.4, couette: 0x5d6f5a, plaid: false },
        { t: "modele", f: "painted_wooden_nightstand", x: 0.38, z: -1.33, h: 0.55, avec: [ { t: "lampeChevet", x: -0.06, y: 0.55, z: -0.05, c: 0x6b5a48 }, { t: "tasse", x: 0.12, y: 0.55, z: 0.1, vide: true }, { t: "livre", x: 0.08, y: 0.55, z: -0.1, r: 0.2 } ] },
        { t: "tapis", x: 0.45, z: 0.3, w: 1.5, d: 1.0, couleurs: ["#3f5a4a", "#e2d3ae", "#7a2f2a"] },
        { t: "modele", f: "vintage_wooden_drawer_01", x: 1.33, z: -0.45, r: -Math.PI / 2, e: [0.62, 0.78, 0.5], avec: [ { t: "modele", f: "standing_picture_frame_01", x: -0.25, y: 0.85, z: 0, r: 0.3 }, { t: "modele", f: "binder_notebook", x: 0.12, y: 0.85, z: 0.02, r: 0.2, s: 0.8 } ] },
        // la tenue de travail de M. Haddad, prête sur une chaise
        { t: "modele", f: "painted_wooden_chair_02", x: 1.15, z: 0.75, r: -2.0, s: 0.74, avec: [ { t: "vetement", x: 0, y: 0.94, z: -0.2, w: 0.44, l: 1.0, c: 0xdfe9f2 } ] },
        { t: "modele", f: "hanging_picture_frame_03", mur: "N", u: -0.6, y: 1.92, auMur: true, s: 0.8 } ] },
      chambre2: { nom: "la chambre 2", court: "La chambre du fond", raccourci: "Chambre 2", taille: [3, 3.2], sol: "bois", objets: [
        { t: "inter", id: "int_chambre2", mur: "E", u: 0.9, y: 1.1 }, { t: "plafonnier", id: "pl_chambre2" }, { t: "prise", id: "pc_chambre2", mur: "N", u: -0.8, y: 0.75 }, porte("couloir", "E", -0.2),
        { t: "fenetre", mur: "N", u: 0.45, y: 1.55, w: 0.9, h: 0.95, vue: "ville", volet: 0.3, rideaux: 0x8a6a44 },
        // la chambre du fond sert de bureau et de débarras
        { t: "modele", f: "wooden_table_02", x: 0.45, z: -1.22, avec: [ { t: "modele", f: "desk_lamp_arm_01", x: 0.38, y: 0.8, z: -0.12, h: 0.45, r: -0.6 }, { t: "modele", f: "binder_notebook", x: -0.2, y: 0.8, z: 0.05, r: -0.1, s: 0.8 }, { t: "livre", x: 0.1, y: 0.8, z: 0.1, r: 0.5, c: 0x6b2a26 }, { t: "tasse", x: -0.42, y: 0.8, z: -0.1, vide: true, c: 0xd9a441 } ] },
        { t: "modele", f: "painted_wooden_chair_02", x: 0.4, z: -0.62, r: Math.PI - 0.25, s: 0.74 },
        { t: "modele", f: "steel_frame_shelves_03", x: -1.26, z: 0.45, r: Math.PI / 2, s: 0.6, avec: [ { t: "modele", f: "cardboard_box_01", x: -0.3, y: 0.88, z: 0, h: 0.26 }, { t: "modele", f: "wicker_basket_02", x: 0.35, y: 0.88, z: 0 }, { t: "livres", x: 0.25, y: 0.53, w: 0.6, z: 0, g: 3, n: 12 }, { t: "modele", f: "metal_toolbox", x: -0.3, y: 0.53, z: 0, s: 0.7 } ] },
        { t: "modele", f: "cardboard_box_01", x: -1.15, z: -1.2, r: 0.3 }, { t: "modele", f: "cardboard_box_01", x: -1.1, y: 0.3, z: -1.22, r: -0.2, s: 0.8 },
        { t: "tapis", x: 0.25, z: 0.2, w: 1.5, d: 1.1, couleurs: ["#2f3f55", "#d9c9a3", "#3f5a4a"] },
        { t: "modele", f: "fancy_picture_frame_01", mur: "S", u: 0.3, y: 1.62, auMur: true, s: 0.55 } ] },
      sdb: { nom: "la salle de bain", court: "La salle de bain", raccourci: "Salle de bain", taille: [2.4, 2.4], sol: "carrelage", teinte: 0xdce8ea, camera: [-0.45, 1.62, -0.85], yaw: -2.25, pitch: -0.1, objets: [
        { t: "inter", id: "int_sdb", mur: "N", u: 0.9, y: 1.1 }, { t: "plafonnier", id: "pl_sdb" }, { t: "boite", id: "bd_sdb", mur: "S", u: 0, y: 2.25, w: 0.1, h: 0.1 }, { t: "prise", id: "pc_sdb", mur: "E", u: 0.5, y: 1.2 }, { t: "prise", id: "pc_lavelinge", mur: "O", u: -0.6, y: 1.2 },
        porte("couloir", "N", -0.2),
        // la douche est au milieu du mur du fond, à distance des deux prises
        { t: "douche", mur: "S", u: 0, y: 0, c: 0.9 },
        { t: "lavelinge", id: "lavelinge", x: -0.9, z: 0.6, r: Math.PI / 2 },
        { t: "lavabo", mur: "E", u: -0.15, y: 0, w: 0.65 },
        { t: "serviettes", mur: "O", u: 0.45, y: 1.3, couleurs: [0x3f7a6b, 0xf2efe6] },
        { t: "tapis", x: 0, z: -0.05, w: 0.8, d: 0.5, couleurs: ["#3f7a6b", "#f2efe6", "#2f5a6b"] },
        { t: "modele", f: "wicker_basket_02", x: -0.92, z: -0.5, h: 0.42, e: [0.62, 1, 0.62], avec: [{ t: "linge", y: 0.36 }] } ] },
      plafond: { nom: "le faux plafond du couloir", court: "Le faux plafond", raccourci: "Faux plafond", taille: [3, 1.6], h: 0.6, sol: "beton", murs: "beton", sombre: true, camera: [0.9, 0.35, 0], yaw: Math.PI / 2, pitch: -0.1, objets: [
        { t: "boite", id: "bd_plafond", x: -0.3, y: 0.12, z: 0, r: Math.PI / 2, incline: true }, { t: "trappe", vers: "couloir", x: 0.9, z: 0, bas: true },
        // sous la dalle : plaques de plâtre vues de dessus, rails et suspentes, laine de verre, gaines qui arrivent à la boîte
        { t: "fauxPlafond", x: 0, y: 0, z: 0, laine: [[-1.5, -0.72, -0.8, -0.3], [-1.5, -0.72, 0.3, 0.8], [-0.72, 0.4, -0.8, -0.4], [-0.72, 0.4, 0.4, 0.8], [1.25, 1.5, -0.8, 0.8]],
          gaines: [ [[-0.34, 0.09, 0.14], [-0.55, 0.045, 0.24], [-1.0, 0.045, 0.26], [-1.5, 0.05, 0.2]], [[-0.34, 0.09, -0.14], [-0.5, 0.045, -0.3], [-0.42, 0.05, -0.55], [-0.4, 0.06, -0.79]],
            [[-0.4, 0.09, -0.12], [-0.2, 0.045, -0.36], [0.45, 0.045, -0.5], [1.0, 0.05, -0.64], [1.5, 0.06, -0.66]], [[-0.44, 0.09, 0], [-0.8, 0.045, -0.04], [-1.15, 0.045, -0.14], [-1.5, 0.05, -0.2]] ],
          carton: [0.3, 0, 0.56] } ] },
    },
  },
};
