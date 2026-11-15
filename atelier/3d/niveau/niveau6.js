// Niveau 6 — « Depuis mes travaux, ça saute dès que j'allume le couloir » : la maison rénovée de M. Girard.
// Un déclenchement différentiel sans défaut d'isolement : chaque circuit doit garder sa phase ET son neutre.
// Câblage : ../moteur/logements/maison-renovee.js
import { maisonRenovee, causesMaisonRenovee, reperesMaisonRenovee as F } from "../moteur/logements/maison-renovee.js";

const porte = (vers, mur, u, y = 1.025) => ({ t: "porte", vers, mur, u, y });
const X = (P) => P.x6 || (P.x6 = { n: 0 });
const NEUTRES_HAUT = ["Q2.Nout", "ID1.Nout", "bd_combles.n"], NEUTRES_BAS = ["Q5.Nout", "ID2.Nout", "bd_prises.n", "Q4.Nout", "Q6.Nout"];
const estNeutreSpots = (b) => b === "spots.N" || b === `${F.spots.neutre}#de` || b === `${F.spots.neutre}#vers`;
const boiteSaine = (nom, quoi) => () => ({ texte: `${nom} : ouverte. ${quoi}` });

export default {
  id: "niveau6", numero: 6, titre: "Ça saute dès que j'allume le couloir", page: "atelier-3d-6.html",
  logement: maisonRenovee, causes: causesMaisonRenovee, fils: F,
  nomsDifferentiels: { ID1: "de la rangée du haut (éclairages)", ID2: "de la rangée du bas (prises)" },
  nomsBornes: { "bt.PE": "bornier de terre du tableau", "spots.N": "borne de neutre de la rampe de spots", "spots.L": "borne de phase de la rampe de spots", "spots.PE": "borne de terre de la rampe de spots" },
  outils: ["vat", "multi", "iso", "ohm"],
  client: { nom: "M. Girard", court: "M. Girard", initiales: "PG", teinte: "#8a6a3f", role: "Propriétaire bricoleur, fier et un peu vexé · maison qu'il rénove lui-même" },
  accroche: "« J'ai juste ajouté des spots dans le couloir, proprement. Depuis, dès que j'allume, ça saute. Des fois un différentiel, des fois l'autre, des fois les deux. Votre collègue a tout mesuré : il dit que l'isolement est bon partout. »",
  mission: "Trouve pourquoi un interrupteur différentiel déclenche dès qu'on allume le couloir, prouve-le, et remets l'installation en ordre.",
  depart: "entree",
  pitch: "Début d'après-midi, dans une maison que son propriétaire rénove lui-même. M. Girard t'attend dans l'entrée, devant son tableau, les bras croisés : depuis qu'il a posé des spots dans le couloir, un différentiel saute dès qu'il allume.",
  entrer: "Entrer chez M. Girard",
  debut: "M. Girard te laisse faire, mais il reste dans l'entrée. Le couloir est au fond ; la trappe des combles est dans son plafond.",
  humeurs: [{ apres: 50, texte: "M. Girard : « Franchement, ce différentiel est trop sensible. On le remplace par un moins sensible, et on n'en parle plus, non ? »" }],
  questions: [
    { id: "quoi", texte: "Qu'avez-vous changé, exactement ?", reponse: () => "« J'ai retiré le vieux plafonnier du couloir et posé une rampe de quatre spots. Et j'ai ajouté une boîte de dérivation dans les combles, juste au-dessus : c'est plus propre. »" },
    { id: "lequel", texte: "C'est toujours le même différentiel qui saute ?", reponse: (P) => (P.cause === "A" || P.cause === "B" ? "« Non, justement ! Des fois celui du haut, des fois celui du bas, des fois les deux d'un coup. C'est ça que je ne comprends pas. »" : "« Maintenant que vous le dites… oui. Toujours celui du haut. »") },
    { id: "cable", si: (P) => P.poses.includes("quoi"), texte: "Dans les combles, où avez-vous repris le courant pour les spots ?", reponse: (P) => (P.cause === "A" ? "« Sur ce qu'il y avait là-haut. Il y a deux boîtes côte à côte, avec des fils qui passent… J'ai pris ce qui tombait le mieux. Un bleu, c'est un bleu, non ? »" : "« Sur l'ancien câble du plafonnier, tout simplement. Rouge avec rouge, bleu avec bleu. »") },
    { id: "tableau", si: (P) => P.poses.includes("quoi"), texte: "Et le tableau, vous y avez touché ?", reponse: (P) => (P.cause === "B" ? "« … J'ai refait un peu d'ordre, oui. Les fils bleus étaient en vrac, je les ai rangés proprement. Mais je n'ai rien changé ! »" : "« Non. J'ai juste coupé le courant pour travailler, quand même. »") },
    { id: "collegue", texte: "Votre collègue, il a mesuré quoi ?", reponse: () => "« L'isolement, avec son appareil : entre la phase et la terre, sur chaque circuit. Bon partout, il a dit. Il n'a rien trouvé et il est reparti. »" },
    { id: "sensible", texte: "Pourquoi voulez-vous un différentiel moins sensible ?", reponse: () => "« Parce que celui-là saute pour rien ! Un 300 milliampères, ça ne sauterait pas. »" },
  ],
  regards: {
    Q2: (P) => { const b = P.cause === "B" && !P.e.repare[0]; P.vus.add("lu:Q2"); if (b) P.vus.add("neutre:tableau");
      return { texte: `Disjoncteur « Éclairage couloir », rangée du haut : calibre 10 A.${b ? " Sa phase vient bien de la rangée du haut. Mais le fil bleu qui l'alimente ne vient pas de l'interrupteur différentiel du haut : il descend, bien rangé, se raccorder à la sortie de celui du bas." : " Sa phase et son neutre viennent tous les deux de l'interrupteur différentiel du haut."}`, type: b ? "alerte" : "info", valeur: b, indice: b ? "Au tableau : le neutre du disjoncteur « Éclairage couloir » est raccordé du côté de la rangée du bas." : undefined }; },
  },
  ouvertures: {
    bd_combles: (P) => (P.cause === "A" && !P.e.repare[0]
      ? (P.vus.add("emprunt:combles"), { texte: "Boîte des spots, dans les combles : le câble du tableau arrive bien ici, et la phase repart vers l'interrupteur. Mais le fil bleu des spots n'est pas sur la borne de neutre de cette boîte : il part dans la boîte voisine, celle des prises.", type: "alerte", indice: "Combles : le neutre des spots est pris dans la boîte des prises, pas dans celle de l'éclairage." })
      : boiteSaine("Boîte des spots, dans les combles", "Le câble du tableau arrive ; la phase repart vers l'interrupteur, le neutre et la terre vers les spots. Chaque fil est sur sa borne.")()),
    bd_prises: (P) => (P.cause === "A" && !P.e.repare[0]
      ? (P.vus.add("emprunt:combles"), { texte: "Boîte des prises, dans les combles : sur la borne de neutre, un fil bleu en trop. Il ne va pas vers une prise : il part vers la rampe de spots du couloir.", type: "alerte", indice: "Combles : un fil bleu des spots est raccordé sur le neutre du circuit des prises." })
      : boiteSaine("Boîte des prises, dans les combles", "Le câble des prises du couloir et des chambres passe ici. Rien d'autre n'y est raccordé.")()),
    spots: (P) => (P.cause === "C" && !P.e.repare[0] ? (P.vus.add("pince:N"), { texte: "Boîtier de raccordement de la rampe de spots : le conducteur bleu est pincé entre le boîtier et la carcasse métallique de la rampe, son isolant est entaillé. Le neutre touche la masse, reliée à la terre.", type: "alerte", indice: "Rampe de spots : le neutre (bleu) pincé touche la carcasse reliée à la terre." })
      : P.cause === "D" && !P.e.repare[0] ? (P.vus.add("pince:L"), { texte: "Boîtier de raccordement de la rampe de spots : le conducteur orange (retour lampe, la phase quand c'est allumé) est pincé contre la carcasse métallique, son isolant est entaillé.", type: "alerte", indice: "Rampe de spots : la phase (fil orange) pincée touche la carcasse reliée à la terre." })
      : boiteSaine("Boîtier de raccordement de la rampe de spots", "Phase, neutre et terre sont sur leurs bornes, les isolants sont intacts.")()),
    bd_sej: boiteSaine("Boîte de dérivation du séjour", "Rien d'anormal."), bd_ch: boiteSaine("Boîte de dérivation des chambres", "Rien d'anormal."),
  },
  gestes: {
    // allumer ou éteindre le couloir. En A et B, les deux interrupteurs différentiels voient le même déséquilibre :
    // c'est tantôt l'un, tantôt l'autre, tantôt les deux qui lâche le premier.
    int_couloir(P, o) {
      const e = P.e, on = !e.positions.int_couloir, deuxFermes = e.positions.ID1 && e.positions.ID2; P.essais.add("int_couloir");
      const r = P.inst.agir(e, { type: "basculer", id: "int_couloir" }); let ev = r.declenchements;
      if (on && ev.some((d) => d.id === "ID1") && deuxFermes && (P.cause === "A" || P.cause === "B") && !e.repare[0]) {
        const tour = X(P).n++ % 3;
        if (tour === 1) { e.positions.ID1 = true; delete e.declenche.ID1; e.positions.ID2 = false; e.declenche.ID2 = "fuite"; ev = [{ id: "ID2", raison: "fuite" }]; }
        if (tour === 2) { e.positions.ID2 = false; e.declenche.ID2 = "fuite"; ev = [...ev, { id: "ID2", raison: "fuite" }]; }
      }
      const lit = P.calc().allume("spots");
      if (!on) o.dire("Tu éteins le couloir.");
      else if (ev.length) { o.dire("Tu allumes le couloir : les spots s'allument une fraction de seconde…", "info"); for (const d of ev) P.vus.add(`saute:${d.id}`); if (P.vus.has("saute:ID1") && P.vus.has("saute:ID2") && !P.vus.has("deux")) { P.vus.add("deux"); o.noter("indices", "En allumant le couloir, ce n'est pas toujours le même interrupteur différentiel qui déclenche : celui du haut, celui du bas, ou les deux."); } }
      else if (lit) { o.dire("Tu allumes le couloir : les quatre spots éclairent, et rien ne saute.", "ok"); }
      else {
        const u = P.calc().tension("spots.L", "bt.PE") >= 50, n = P.calc().tension("spots.N", "bt.PE") >= 50;
        if (u && n) { P.vus.add("r2:neutre"); o.dire("Tu allumes le couloir : les spots restent éteints, et rien ne saute. Leur phase est là, mais leur neutre ne revient plus : il passait donc par ce que tu viens de couper, du côté des prises.", "alerte"); o.noter("indices", "Rangée du bas coupée : les spots du couloir ne s'allument plus. Leur neutre passe par la rangée des prises."); }
        else o.dire("Tu allumes le couloir : les spots restent éteints. Le circuit n'est pas sous tension.", "info");
      }
      o.declenchements(ev);
      o.noter("constats", `Couloir ${on ? "allumé" : "éteint"} : ${ev.length ? ev.map((d) => P.nomProt(d.id)).join(" et ") + " déclenche" + (ev.length > 1 ? "nt" : "") : lit ? "les spots éclairent" : on ? "les spots restent éteints, rien ne saute" : "tout tient"}.`);
      return lit;
    },
    spots(P, o) { const on = P.calc().allume("spots"); o.dire(on ? "La rampe de spots éclaire." : "La rampe de quatre spots posée par M. Girard : éteinte. Les ampoules sont neuves et bien en place.", "info"); return on; },
  },
  apresMesure(P, m) {
    const pts = [m.a, m.b], terre = pts.find((p) => /(\.pe|\.PE)$/.test(p)), autre = pts.find((p) => p !== terre);
    if (m.outil === "iso" && terre && autre && m.valeur !== "tension") {
      const circuit = P.circuitBorne(autre), role = P.roleBorne(autre);
      if (circuit !== "ecl_cou") return null;
      if (m.valeur > 5e7) { P.vus.add(`iso:bon:${role === "neutre" ? "N" : "L"}`); return role === "neutre" ? { texte: "Isolement du neutre du couloir par rapport à la terre : bon. Aucun contact entre ce circuit et la terre.", type: "info" } : { texte: "Isolement de la phase du couloir par rapport à la terre : bon. Pense à mesurer aussi le neutre par rapport à la terre.", type: "info" }; }
      P.vus.add("iso:mauvais"); P.vus.add(`iso:mauvais:${role === "neutre" ? "N" : "L"}`);
      return { texte: `Isolement mauvais entre ${role === "neutre" ? "le neutre" : "la phase"} du circuit du couloir et la terre : un conducteur touche une masse quelque part sur ce circuit.`, type: "alerte", indice: `Circuit « Éclairage couloir » : isolement mauvais entre ${role === "neutre" ? "le neutre" : "la phase"} et la terre.` };
    }
    if (m.outil === "ohm" && m.valeur !== "tension") {
      const spotsN = pts.find(estNeutreSpots), tab = pts.find((p) => p === "Q2.Nout");
      if (spotsN) { const o2 = pts.find((p) => p !== spotsN);
        if (NEUTRES_BAS.includes(o2) && m.valeur === true) { P.vus.add("r2:neutre"); return { texte: "Ça passe : le neutre des spots est relié au neutre de la rangée des prises. Il ne devrait avoir de continuité qu'avec le neutre de son propre circuit.", type: "alerte", indice: "Continuité entre le neutre des spots et le neutre de la rangée du bas (prises)." }; }
        if (NEUTRES_HAUT.includes(o2) && m.valeur === false && !P.e.positions.Q2) { P.vus.add("r1:coupe"); return { texte: "Ça ne passe pas : disjoncteur du couloir ouvert, le neutre des spots n'a aucune continuité avec le neutre de son propre circuit.", type: "alerte" }; } }
      if (tab) { const o2 = pts.find((p) => p !== tab);
        if (o2 === "ID2.Nout" && m.valeur === true && !P.e.positions.ID1 && !P.e.positions.ID2) { P.vus.add("r2:neutre"); return { texte: "Ça passe, les deux interrupteurs différentiels ouverts : le neutre du disjoncteur « Éclairage couloir » est relié à la rangée du bas.", type: "alerte", indice: "Continuité entre le neutre du disjoncteur du couloir et la sortie de l'interrupteur différentiel du bas." }; } }
    }
    return null;
  },
  preuve(P) {
    const v = (k) => P.vus.has(k);
    if (P.cause === "A" && v("r2:neutre") && v("emprunt:combles")) return "Le neutre des spots revient par la rangée des prises (les spots ne s'allument plus quand elle est coupée, ou continuité mesurée avec son neutre) ; dans les combles, leur fil bleu est raccordé dans la boîte des prises.";
    if (P.cause === "B" && v("r2:neutre") && v("neutre:tableau")) return "Le neutre du circuit du couloir revient par la rangée des prises ; au tableau, le fil bleu du disjoncteur « Éclairage couloir » est raccordé à la sortie de l'interrupteur différentiel du bas.";
    if (P.cause === "C" && v("iso:mauvais") && v("pince:N")) return "Isolement mauvais entre le circuit du couloir et la terre ; dans la rampe de spots, le conducteur de neutre pincé touche la carcasse.";
    if (P.cause === "D" && v("iso:mauvais") && v("pince:L")) return "Isolement mauvais entre le circuit du couloir et la terre ; dans la rampe de spots, le conducteur de phase pincé touche la carcasse.";
    return null;
  },
  indices(P) {
    const v = (k) => P.vus.has(k), methode = "Un interrupteur différentiel compare le courant qui part par la phase et celui qui revient par le neutre. Il déclenche dès que les deux ne sont plus égaux : parce qu'une partie fuit vers la terre… ou parce qu'elle revient par un autre chemin.";
    let zone, mesure;
    if (!P.essais.has("int_couloir")) { zone = "Le couloir : reproduis la panne."; mesure = "Allume le couloir, regarde quel interrupteur différentiel tombe, réarme, recommence deux ou trois fois. Est-ce toujours le même ?"; }
    else if (!v("iso:bon:L") && !v("iso:bon:N") && !v("iso:mauvais")) { zone = "Au tableau, sur le départ « Éclairage couloir », circuit coupé."; mesure = "Mesureur d'isolement entre la sortie phase et la terre, puis entre la sortie neutre et la terre. Les deux, pas seulement la phase."; }
    else if (v("iso:mauvais") && !v("pince:N") && !v("pince:L")) { zone = "Un conducteur de ce circuit touche une masse. Ce qui est neuf et métallique, sur ce circuit, c'est la rampe de spots."; mesure = "Circuit coupé et vérifié au VAT, ouvre le boîtier de raccordement de la rampe, dans le couloir."; }
    else if (!v("iso:mauvais") && !v("r2:neutre")) { zone = "L'isolement est bon et pourtant un différentiel tombe : le courant ne fuit pas, il revient par un autre chemin. Lequel des deux interrupteurs différentiels est concerné… ou les deux ?"; mesure = "Baisse l'interrupteur différentiel de la rangée du bas, réarme celui du haut et allume le couloir. Ou, hors tension, cherche à l'ohmmètre avec quel neutre celui des spots a une continuité."; }
    else if (v("r2:neutre") && !v("neutre:tableau") && !v("emprunt:combles")) { zone = "Le neutre du couloir passe par la rangée des prises. Il n'y a que deux endroits où M. Girard a touché des fils bleus."; mesure = "Au tableau, regarde de près le disjoncteur « Éclairage couloir ». Puis monte dans les combles et ouvre les deux boîtes, circuit coupé et vérifié."; }
    else { zone = "Tu as de quoi conclure."; mesure = "Touche « J'ai trouvé »."; }
    return [methode, zone, mesure];
  },
  diagnostics: [
    { id: "A", texte: "Dans les combles, les spots prennent leur neutre sur le circuit des prises", non: "Dans les combles, chaque fil est sur la borne de sa propre boîte." },
    { id: "B", texte: "Au tableau, le neutre du circuit du couloir est raccordé du côté de l'autre rangée", non: "Au tableau, la phase et le neutre de ce disjoncteur viennent bien de la même rangée." },
    { id: "C", texte: "Dans la rampe de spots, le neutre touche la carcasse reliée à la terre", non: "L'isolement entre le neutre et la terre est bon, et le boîtier de la rampe est propre." },
    { id: "D", texte: "Dans la rampe de spots, la phase touche la carcasse : défaut d'isolement", non: "L'isolement entre la phase et la terre est bon, et le boîtier de la rampe est propre." },
    { id: "ampoules", texte: "Une ampoule de spot est défectueuse", non: "Les quatre ampoules sont neuves, et une ampoule grillée ne fait pas déclencher un différentiel." },
    { id: "sensible", texte: "L'interrupteur différentiel est trop sensible", non: "« Ah, vous voyez ! » Non : ses 30 mA sont là pour protéger les personnes. Il déclenche parce qu'il voit un vrai déséquilibre." },
  ],
  remedes: [
    { id: "neutreSpots", pour: ["A"], repare: true, texte: "Dans les combles, remettre le neutre des spots sur le neutre du circuit d'éclairage", fait: "Circuits coupés et vérifiés, tu remets le fil bleu des spots sur la borne de neutre de leur propre boîte. Tu allumes le couloir : les quatre spots éclairent et les deux interrupteurs différentiels tiennent. Tu appuies sur chaque bouton test : ils déclenchent tous les deux. Tu montres le schéma à M. Girard : « ça marchait presque », parce que le courant trouvait bien un neutre… mais pas le sien.", non: "Dans les combles, le neutre des spots est déjà sur la bonne borne." },
    { id: "neutreTableau", pour: ["B"], repare: true, texte: "Au tableau, remettre le neutre du circuit du couloir du côté de sa rangée", fait: "Installation coupée et vérifiée, tu remets le fil bleu du disjoncteur « Éclairage couloir » du côté de l'interrupteur différentiel du haut, avec sa phase. Tu allumes le couloir : les spots éclairent et les deux interrupteurs différentiels tiennent. Tu appuies sur chaque bouton test : ils déclenchent tous les deux. Tu expliques à M. Girard : un tableau « bien rangé » où le bleu n'est plus avec son rouge, c'est un piège.", non: "Au tableau, ce neutre est déjà du bon côté." },
    { id: "degagerN", pour: ["C"], repare: true, texte: "Dégager le conducteur de neutre pincé dans la rampe de spots et refaire son isolant", fait: "Circuit coupé et vérifié, tu dégages le fil bleu pincé, tu refais la connexion avec un conducteur sain et tu refermes le boîtier sans rien coincer. Isolement refait : bon, phase et neutre. Tu allumes : les spots éclairent, les différentiels tiennent, et chacun déclenche à son bouton test.", non: "Le neutre n'est pas pincé dans cette rampe." },
    { id: "degagerL", pour: ["D"], repare: true, texte: "Dégager le conducteur de phase pincé dans la rampe de spots et refaire son isolant", fait: "Circuit coupé et vérifié, tu dégages le fil orange pincé, tu refais la connexion avec un conducteur sain et tu refermes le boîtier sans rien coincer. Isolement refait : bon. Tu allumes : les spots éclairent, les différentiels tiennent, et chacun déclenche à son bouton test.", non: "La phase n'est pas pincée dans cette rampe." },
    { id: "moinsSensible", pour: [], faute: "Tu as accepté de remplacer un interrupteur différentiel 30 mA par un moins sensible. Ce différentiel protège les personnes : le « désensibiliser » pour qu'il ne saute plus, c'est retirer la protection et laisser le défaut en place.", texte: "Faire ce que demande M. Girard : remplacer le différentiel par un moins sensible", non: "« Enfin ! » Non. Un 30 mA protège les personnes ; il déclenche parce qu'il voit un vrai déséquilibre. On cherche pourquoi, on ne l'empêche pas de le voir." },
    { id: "ampoules", pour: [], texte: "Changer les quatre ampoules des spots", non: "Des ampoules neuves feraient sauter le différentiel exactement de la même façon." },
  ],
  // après le remède : on allume, rien ne doit tomber ; puis chaque bouton test doit faire déclencher son différentiel
  verifier(P) {
    const e = P.e, i = P.inst;
    e.positions.int_couloir = false; let r = i.agir(e, { type: "basculer", id: "int_couloir" });
    if (r.declenchements.length || !i.calculer(e).allume("spots")) return "M. Girard allume le couloir : clac. « Vous voyez bien que ça saute encore ! » Ce n'était pas la bonne réponse.";
    for (const d of ["ID1", "ID2"]) { r = i.agir(e, { type: "test", id: d }); if (r.testSansEffet) return "Un bouton test ne fait plus déclencher son différentiel."; i.agir(e, { type: "manoeuvrer", id: d, position: true }); }
    return null;
  },
  explications: {
    A: "Dans les combles, M. Girard a raccordé la phase des spots sur le circuit d'éclairage (rangée du haut) et leur neutre sur le câble des prises qui passait à côté (rangée du bas). Le courant des spots part par un interrupteur différentiel et revient par l'autre : chacun voit ce qui part différent de ce qui revient, et déclenche. Il n'y a aucune fuite vers la terre : c'est pour cela que l'isolement est bon partout.",
    B: "En « rangeant » son tableau, M. Girard a raccordé le fil bleu du disjoncteur « Éclairage couloir » du côté de la rangée du bas. La phase du circuit passe par l'interrupteur différentiel du haut, son neutre par celui du bas : chacun voit un déséquilibre égal au courant des spots. Aucun défaut d'isolement : la faute est dans le tableau.",
    C: "Dans la rampe métallique, le conducteur de neutre pincé touche la carcasse, reliée à la terre. Une partie du courant revient par la terre au lieu de repasser par l'interrupteur différentiel, qui voit un déséquilibre. L'isolement entre la phase et la terre peut sembler correct : il faut mesurer aussi le neutre par rapport à la terre. Ce défaut concerne toute la rangée : en allumant plusieurs autres éclairages à la fois, le même différentiel finit aussi par tomber.",
    D: "Le cas que tout le monde attendait : dans la rampe métallique, la phase pincée touche la carcasse reliée à la terre. Dès qu'on allume, un courant fuit vers la terre et l'interrupteur différentiel du haut déclenche. Le collègue n'avait pas mesuré interrupteur fermé.",
  },
  demarches: {
    A: ["Faire parler M. Girard : des spots, une boîte ajoutée dans les combles, et « un bleu, c'est un bleu ».", "Reproduire : ce n'est pas toujours le même interrupteur différentiel qui tombe. Deux différentiels pour un seul circuit.", "Mesurer l'isolement, phase et neutre : bon. Le courant ne fuit pas, il revient ailleurs.", "Le montrer : rangée du bas coupée, les spots ne s'allument plus ; ou continuité entre leur neutre et celui des prises.", "Monter dans les combles, ouvrir les boîtes : le fil bleu des spots est dans la boîte des prises. Le remettre à sa place, vérifier, tester les deux différentiels."],
    B: ["Faire parler M. Girard : il a « refait de l'ordre » dans le tableau.", "Reproduire : tantôt un différentiel, tantôt l'autre.", "Mesurer l'isolement, phase et neutre : bon.", "Montrer que le neutre du couloir passe par la rangée du bas (elle coupée, plus de lumière ; ou continuité à l'ohmmètre).", "Regarder de près le disjoncteur du couloir : son fil bleu vient de l'autre rangée. Le remettre avec sa phase, vérifier, tester les deux différentiels."],
    C: ["Reproduire : c'est toujours l'interrupteur différentiel du haut qui tombe.", "Mesurer l'isolement, circuit coupé : la phase, et aussi le neutre par rapport à la terre. Le neutre est mauvais.", "Ce qui est neuf et métallique sur ce circuit : la rampe de spots.", "Circuit coupé et vérifié, ouvrir son boîtier : le fil bleu est pincé contre la carcasse.", "Dégager, refaire l'isolant, remesurer, allumer, tester le différentiel."],
    D: ["Reproduire : toujours l'interrupteur différentiel du haut.", "Mesurer l'isolement, circuit coupé, interrupteur du couloir fermé : mauvais.", "Aller à ce qui est neuf : la rampe de spots.", "Circuit coupé et vérifié, ouvrir son boîtier : la phase est pincée contre la carcasse.", "Dégager, refaire l'isolant, remesurer, allumer, tester le différentiel."],
  },
  conseilsFin: ["Chaque circuit garde sa phase ET son neutre : on ne prend jamais le neutre d'un autre circuit, et encore moins d'une autre rangée."],
  inutile(P) {
    const l = [];
    if ((P.cause === "C" || P.cause === "D") && (P.ouverts.has("bd_combles") || P.ouverts.has("bd_prises"))) l.push("Les boîtes des combles : le défaut était dans la rampe.");
    if ((P.cause === "A" || P.cause === "B") && P.ouverts.has("spots")) l.push("Le boîtier de la rampe de spots : l'isolement était bon.");
    if (P.ouverts.has("bd_sej") || P.ouverts.has("bd_ch")) l.push("Les boîtes du séjour et des chambres : ces circuits ne sont pas en cause.");
    return l;
  },
  plan: {
    tableau: { regards: ["Q2"] },
    lieux: {
      // Une maison en cours de rénovation : M. Girard fait tout lui-même, proprement… presque.
      entree: { nom: "l'entrée", court: "L'entrée", raccourci: "Entrée", taille: [3, 3], sol: "carrelage", objets: [
        { t: "tableau", mur: "N", u: 0.3, y: 1.45 }, { t: "inter", id: "int_entree", mur: "N", u: -0.95, y: 1.1 }, { t: "plafonnier", id: "pl_entree" }, { t: "prise", id: "pc_entree", mur: "O", u: 0.4, y: 0.75 }, { t: "prise", id: "pc_lavelinge", mur: "O", u: -0.75, y: 1.15 },
        porte("couloir", "E", 0.3),
        { t: "porteEntree", mur: "S", u: 0, y: 0 },
        { t: "portemanteau", mur: "E", u: -0.85, y: 1.74 }, { t: "tapis", x: 0.1, z: 0.3, w: 1.6, d: 1.1, couleurs: ["#3f5a4a", "#e2d3ae", "#6b2a26"] },
        { t: "modele", f: "metal_toolbox", x: 0.9, z: -1.2, r: 0.4 }, { t: "modele", f: "cardboard_box_01", x: 1.15, z: 1.15, r: 0.3, h: 0.32 } ] },
      couloir: { nom: "le couloir", court: "Le couloir", raccourci: "Couloir", taille: [5, 1.6], sol: "bois", camera: [2.0, 1.62, 0], yaw: Math.PI / 2, pitch: 0.02, objets: [
        { t: "inter", id: "int_couloir", mur: "N", u: 1.85, y: 1.1 }, { t: "rampeSpots", id: "spots", x: 0, z: 0 }, { t: "boite", id: "spots", mur: "S", u: 0.6, y: 2.25 }, { t: "prise", id: "pc_couloir", mur: "S", u: -1.5, y: 0.75 }, { t: "trappe", vers: "combles", x: -1.5, z: 0 },
        porte("entree", "E", 0), porte("sejour", "N", 0.5), porte("chambre1", "N", -1.0), porte("chambre2", "O", 0),
        { t: "tapis", x: -0.1, z: 0, w: 3.6, d: 0.72, couleurs: ["#2f3f55", "#d9c9a3", "#7a2f2a"] }, { t: "peintres", x: 2.05, z: 0.55, r: 2.2 },
        { t: "modele", f: "fancy_picture_frame_02", mur: "S", u: 1.6, y: 1.62, auMur: true, s: 0.45 }, { t: "modele", f: "cardboard_box_01", x: -2.2, z: 0.55, r: 0.2, h: 0.3 } ] },
      sejour: { nom: "le séjour", court: "Le séjour", raccourci: "Séjour", taille: [4.4, 3.8], sol: "bois", camera: [1.4, 1.62, 1.4], yaw: 0.6, pitch: -0.22, objets: [
        { t: "inter", id: "int_sejour", mur: "S", u: -1.3, y: 1.1 }, { t: "plafonnier", id: "pl_sejour" }, { t: "prise", id: "pc_sejour1", mur: "N", u: -1.2, y: 0.75 }, { t: "prise", id: "pc_sejour2", mur: "E", u: 0.8, y: 0.75 }, { t: "boite", id: "bd_sej", mur: "N", u: 1.5, y: 2.2 },
        porte("couloir", "S", 0.8),
        { t: "fenetre", mur: "N", u: 0.4, y: 1.45, w: 1.05, h: 1.15, rideaux: 0x8a6a44 },
        { t: "tapis", x: -0.45, z: -0.3, w: 2.5, d: 1.8, couleurs: ["#6b2a26", "#d9c9a3", "#2f3f55"] },
        { t: "modele", f: "modern_wooden_cabinet", x: -1.05, z: -1.66, e: [0.8, 1, 1], avec: [ { t: "modele", f: "ceramic_vase_01", x: 0.5, y: 0.68, z: 0, s: 0.8 }, { t: "livre", x: 0.1, y: 0.68, z: 0.05, r: 0.3 } ] },
        { t: "modele", f: "sofa_03", x: -0.45, z: 0.5, r: Math.PI, avec: [ { t: "plaid", x: 1.22, y: 0.7, z: 0.1, r: Math.PI / 2, c: 0x8a6a44 } ] },
        { t: "modele", f: "modern_coffee_table_01", x: -0.45, z: -0.55, r: Math.PI / 2, avec: [ { t: "tasse", x: 0.05, y: 0.39, z: 0.2 }, { t: "modele", f: "binder_notebook", x: 0, y: 0.39, z: -0.2, s: 0.8, r: 0.3 } ] },
        { t: "modele", f: "wooden_bookshelf_worn", x: 2.0, z: -0.8, r: -Math.PI / 2, avec: [ { t: "livres", y: 0.39, w: 1.1, z: 0.02, g: 1 }, { t: "livres", y: 0.67, w: 1.1, z: 0.02, g: 5 }, { t: "modele", f: "metal_toolbox", x: 0, y: 0.96, z: 0.02, s: 0.7 }, { t: "modele", f: "wicker_basket_02", x: 0.2, y: 1.66, z: 0.02 } ] },
        { t: "modele", f: "potted_plant_02", x: -1.85, z: 1.5, h: 0.85, sansOmbre: true } ] },
      chambre1: { nom: "la chambre 1", court: "La chambre 1", raccourci: "Chambre 1", taille: [3.2, 3.2], sol: "bois", camera: [0.85, 1.62, 1.1], yaw: 0.4, pitch: -0.2, objets: [
        { t: "inter", id: "int_chambre1", mur: "S", u: 0.6, y: 1.1 }, { t: "plafonnier", id: "pl_chambre1" }, { t: "prise", id: "pc_chambre1", mur: "N", u: 0.9, y: 0.75 }, { t: "boite", id: "bd_ch", mur: "E", u: 0.9, y: 2.2 }, porte("couloir", "S", -0.7),
        { t: "fenetre", mur: "O", u: 0.25, y: 1.45, w: 1.0, h: 1.15, rideaux: 0x5d6f5a },
        { t: "lit", x: -0.6, z: -0.62, w: 1.4, couette: 0x8a6a44, plaid: 0x3f5a4a },
        { t: "modele", f: "painted_wooden_nightstand", x: 0.38, z: -1.33, h: 0.55, avec: [ { t: "lampeChevet", x: -0.06, y: 0.55, z: -0.05, c: 0x3f5a4a }, { t: "livre", x: 0.1, y: 0.55, z: 0.08, r: 0.2 } ] },
        { t: "modele", f: "vintage_wooden_drawer_01", x: 1.33, z: -0.45, r: -Math.PI / 2, e: [0.62, 0.78, 0.5] }, { t: "tapis", x: 0.45, z: 0.3, w: 1.5, d: 1.0, couleurs: ["#3f5a4a", "#e2d3ae", "#7a2f2a"] } ] },
      chambre2: { nom: "la chambre 2", court: "La chambre 2", raccourci: "Chambre 2", taille: [3, 3.2], sol: "bois", objets: [
        { t: "inter", id: "int_chambre2", mur: "E", u: 0.9, y: 1.1 }, { t: "plafonnier", id: "pl_chambre2" }, { t: "prise", id: "pc_chambre2", mur: "N", u: -0.8, y: 0.75 }, porte("couloir", "E", -0.2),
        // la chambre en travaux : bâche, pots, escabeau remplacé par une table de tapissier, cartons
        { t: "fenetre", mur: "N", u: 0.45, y: 1.55, w: 0.9, h: 0.95, rideaux: false },
        { t: "modele", f: "wooden_table_02", x: 0.4, z: -1.0, avec: [ { t: "modele", f: "metal_toolbox", x: -0.25, y: 0.8, z: 0 }, { t: "modele", f: "oil_tin", x: 0.3, y: 0.8, z: 0.05 } ] },
        { t: "peintres", x: -0.9, z: 0.4, r: 0.6 }, { t: "peintres", x: 0.9, z: 0.8, r: -1.2 }, { t: "modele", f: "cardboard_box_01", x: -1.15, z: -1.2, r: 0.3 }, { t: "modele", f: "cardboard_box_01", x: -1.1, y: 0.3, z: -1.22, r: -0.2, s: 0.8 },
        { t: "modele", f: "steel_frame_shelves_03", x: -1.26, z: 0.9, r: Math.PI / 2, s: 0.6 } ] },
      combles: { nom: "les combles", court: "Les combles", raccourci: "Combles", taille: [3.4, 1.8], h: 1.3, sol: "beton", murs: "beton", sombre: true, camera: [1.1, 0.55, 0], yaw: Math.PI / 2, pitch: -0.12, objets: [
        { t: "boite", id: "bd_combles", x: -0.35, y: 0.16, z: -0.3, r: Math.PI / 2, incline: true }, { t: "boite", id: "bd_prises", x: -0.35, y: 0.16, z: 0.3, r: Math.PI / 2, incline: true }, { t: "trappe", vers: "couloir", x: 1.1, z: 0, bas: true },
        { t: "fauxPlafond", x: 0, y: 0, z: 0, bois: true, laine: [[-1.7, -0.75, -0.9, 0.9], [-0.75, 0.5, -0.9, -0.62], [-0.75, 0.5, 0.62, 0.9], [1.5, 1.7, -0.9, 0.9]],
          gaines: [ [[-0.4, 0.12, -0.42], [-0.6, 0.06, -0.6], [-1.2, 0.06, -0.7], [-1.7, 0.07, -0.72]], [[-0.4, 0.12, 0.42], [-0.6, 0.06, 0.6], [-1.2, 0.06, 0.7], [-1.7, 0.07, 0.72]],
            [[-0.3, 0.12, -0.22], [0.1, 0.06, -0.3], [0.7, 0.06, -0.6], [1.7, 0.07, -0.7]], [[-0.3, 0.12, 0.22], [0.1, 0.06, 0.3], [0.7, 0.06, 0.62], [1.7, 0.07, 0.72]] ],
          carton: [0.35, 0, 0.62] } ] },
    },
  },
};
