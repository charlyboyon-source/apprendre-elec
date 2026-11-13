// Intervention « Sur le toit » : une installation photovoltaïque de 4 kWc ne produit plus.
// Mécanique : préparer la montée (harnais, ancrage, échelle), lire l'onduleur, mesurer en continu (V⎓),
// manipuler les connecteurs sans jamais couper en charge, bâcher les modules pour supprimer la tension.
import { texte, vis, conducteur, cuivre, cadreCliquable } from "../commun.js";

const NOMS = {
  "dc-in-p": "entrée + du sectionneur (côté modules)", "dc-in-n": "entrée − du sectionneur (côté modules)",
  "dc-out-p": "sortie + du sectionneur (côté onduleur)", "dc-out-n": "sortie − du sectionneur (côté onduleur)",
  "ac-L": "phase côté onduleur (disjoncteur AC)", "ac-N": "neutre côté onduleur (disjoncteur AC)",
  "res-L": "phase côté réseau (disjoncteur AC)", "res-N": "neutre côté réseau (disjoncteur AC)", "pe": "barrette de terre",
};
const NOEUDS = Object.fromEntries(Object.keys(NOMS).map((k) => [k, k]));

// État électrique de l'installation
const chaineOk = (e) => e.mc4 && !(e.panne.id === "fouine" && !e.repare);
const soleil = (e) => (e.bache ? 0 : e.soleil);
const production = (e) => (e.djAC && e.sect && chaineOk(e) && soleil(e) > 0 ? Math.round(3600 * soleil(e) / 10) * 10 : 0);
const vChaine = (e) => (chaineOk(e) && soleil(e) > 0 ? Math.round(392 + 14 * soleil(e)) : 0);
const enCharge = (e) => production(e) > 0;

/* ---------- Dessins ---------- */
function module(x, y, w, hh) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#1a2b4a" stroke="#c9ced3" stroke-width="3"/>`;
  for (let i = 1; i < 6; i++) s += `<path d="M${x + (w * i) / 6} ${y} V${y + hh}" stroke="#2c4570" stroke-width="1.2"/>`;
  for (let j = 1; j < 10; j++) s += `<path d="M${x} ${y + (hh * j) / 10} H${x + w}" stroke="#2c4570" stroke-width="1.2"/>`;
  return s + `<path d="M${x} ${y} L${x + w * 0.4} ${y + hh * 0.6}" stroke="#fff" stroke-opacity=".12" stroke-width="${w * 0.3}"/>`;
}
function vueMaison(e) {
  const nuages = e.soleil < 0.7;
  let s = `<rect width="1200" height="750" fill="${nuages ? "#a9bccb" : "#8ec5f0"}"/>
    ${nuages ? `<ellipse cx="300" cy="90" rx="160" ry="44" fill="#eef2f5"/><ellipse cx="420" cy="80" rx="120" ry="40" fill="#f4f6f8"/><ellipse cx="900" cy="120" rx="180" ry="46" fill="#e6ebef"/>` : `<circle cx="1050" cy="90" r="46" fill="#ffe27a"/>`}
    <rect y="640" width="1200" height="110" fill="#6aa04e"/>
    <rect x="160" y="330" width="760" height="310" fill="#e8dcc6"/>
    <polygon points="120,340 540,110 960,340" fill="#b5543a"/>`;
  // modules sur le pan de toit (vue de face simplifiée)
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) {
    const x = 330 + i * 86 - r * 20, y = 190 + r * 66;
    s += `<g transform="skewX(-8)">${module(x + 30, y, 80, 60)}</g>`;
  }
  s += `<path d="M120 340 H960" stroke="#8a8f94" stroke-width="10"/>
    <rect x="240" y="440" width="110" height="200" fill="#7d5a3e"/><rect x="460" y="420" width="120" height="100" fill="#cfe0ea" stroke="#fff" stroke-width="6"/>
    <rect x="700" y="470" width="190" height="170" fill="#9aa2aa"/>${texte(795, 460, "Garage", 16, 800, "#3b3f44")}
    <path d="M1000 640 L1060 300" stroke="#c9b27a" stroke-width="10"/><path d="M1040 640 L1100 300" stroke="#c9b27a" stroke-width="10"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<path d="M${1006 + k * 7} ${610 - k * 40} H${1046 + k * 7}" stroke="#c9b27a" stroke-width="6"/>`).join("")}
    ${texte(1050, 680, "échelle", 14, 700, "#2b3f22")}`;
  s += cadreCliquable(690, 450, 210, 200, `data-aller="garage"`, "Garage : onduleur");
  s += cadreCliquable(990, 290, 130, 360, `data-panneau="prepa"`, "Monter sur le toit");
  return s;
}
function vueGarage(e) {
  const prod = production(e);
  const msg = prod ? `En production : ${prod.toLocaleString("fr-FR")} W` : !e.djAC ? "Erreur : réseau absent" : !chaineOk(e) || soleil(e) === 0 ? "PV absent : tension d'entrée nulle" : !e.sect ? "PV absent : tension d'entrée nulle" : "Attente";
  let s = `<rect width="1200" height="750" fill="#d6d2c9"/><rect width="1200" height="750" fill="url(#p-crepi)"/><rect y="660" width="1200" height="90" fill="#9a958c"/>
    <g filter="url(#f-ombre)"><rect x="470" y="70" width="260" height="330" rx="14" fill="#f4f4f2" stroke="#b3b8bd" stroke-width="2"/></g>
    <rect x="500" y="110" width="200" height="70" rx="6" fill="#1d2620"/>${texte(600, 140, "ONDULEUR", 12, 800, "#9fe39b")}${texte(600, 164, msg, 12.5, 700, prod ? "#9fe39b" : "#ff8a80")}
    <circle cx="530" cy="210" r="7" fill="${prod ? "#3d9a3d" : "#555"}"/><circle cx="560" cy="210" r="7" fill="${prod ? "#555" : "#d23a2e"}"/>
    ${texte(600, 380, "entrée ⎓ continue · sortie ~ 230 V", 12, 600, "#555")}`;
  // coffret DC
  s += `<g filter="url(#f-ombre)"><rect x="80" y="120" width="320" height="440" rx="12" fill="#e9ebec" stroke="#9aa1a8" stroke-width="2"/></g>
    ${texte(240, 150, "COFFRET DC (courant continu)", 14, 800, "#b3261e")}
    <rect x="150" y="190" width="180" height="140" rx="10" fill="#c7cbce"/><circle cx="240" cy="260" r="46" fill="#f2c230" stroke="#8a6d00" stroke-width="3"/>
    <g transform="rotate(${e.sect ? 90 : 0} 240 260)"><rect x="196" y="250" width="88" height="20" rx="8" fill="#c8322a"/></g>
    ${texte(240, 350, e.sect ? "sectionneur DC : ON" : "sectionneur DC : OFF", 14, 800, e.sect ? "#14703f" : "#b3261e")}
    <rect x="300" y="380" width="70" height="100" rx="6" fill="#f4f4f2" stroke="#9aa1a8"/>${texte(335, 500, "parafoudre", 11, 700, "#555")}`;
  s += conducteur("M60 410 H140", "#c8322a", 9) + conducteur("M60 450 H140", "#151515", 9);
  s += vis(150, 410, 11, { id: "dc-in-p", label: NOMS["dc-in-p"] }) + vis(150, 450, 11, { id: "dc-in-n", label: NOMS["dc-in-n"] });
  s += vis(250, 410, 11, { id: "dc-out-p", label: NOMS["dc-out-p"] }) + vis(250, 450, 11, { id: "dc-out-n", label: NOMS["dc-out-n"] });
  s += texte(150, 486, "côté modules", 11, 700, "#555") + texte(250, 486, "côté onduleur", 11, 700, "#555");
  s += conducteur("M262 410 C 380 410 420 300 480 300", "#c8322a", 8) + conducteur("M262 450 C 390 450 430 330 480 330", "#151515", 8);
  s += `<g class="zone" data-geste="sectionneur" role="button" tabindex="0" aria-label="Tourner la poignée du sectionneur DC"><circle cx="240" cy="260" r="52" fill="transparent"/></g>`;
  s += cadreCliquable(184, 204, 112, 112, `data-geste="sectionneur"`, e.sect ? "Ouvrir (OFF)" : "Fermer (ON)", 56);
  // coffret AC
  s += `<g filter="url(#f-ombre)"><rect x="800" y="140" width="300" height="300" rx="12" fill="#e9ebec" stroke="#9aa1a8" stroke-width="2"/></g>
    ${texte(950, 170, "COFFRET AC", 14, 800, "#2e6bc9")}
    <rect x="880" y="200" width="70" height="170" rx="6" fill="#fbfbfa" stroke="#b5b8b8"/>${texte(915, 222, "C20", 15, 800)}
    <rect x="898" y="${e.djAC ? 248 : 290}" width="34" height="40" rx="5" fill="#f7f7f5" stroke="#7d8288" stroke-width="1.5"/>
    ${texte(915, 360, e.djAC ? "I" : "O", 13, 800, e.djAC ? "#d23a2e" : "#7d8288")}
    <rect x="960" y="200" width="110" height="170" rx="6" fill="#fbfbfa" stroke="#b5b8b8"/>${texte(1015, 222, "ID 30 mA", 12, 800, "#2e6bc9")}`;
  s += `<g class="manette" data-geste="djAC" role="button" tabindex="0" aria-label="Manette du disjoncteur AC"><rect x="880" y="236" width="70" height="100" fill="transparent"/></g>`;
  s += vis(895, 400, 10, { id: "ac-L", label: NOMS["ac-L"] }) + vis(935, 400, 10, { id: "ac-N", label: NOMS["ac-N"] }) + texte(915, 426, "côté onduleur", 10, 700, "#555");
  s += vis(895, 186, 10, { id: "res-L", label: NOMS["res-L"] }) + vis(935, 186, 10, { id: "res-N", label: NOMS["res-N"] }) + texte(915, 198 - 30, "", 10, 700);
  s += `<rect x="1040" y="410" width="60" height="22" rx="4" fill="url(#g-laiton)"/>` + vis(1070, 421, 9, { id: "pe", label: NOMS.pe });
  s += texte(950, 470, "réseau en haut · onduleur en bas", 12, 600, "#555");
  s += cadreCliquable(24, 660, 160, 56, `data-aller="maison"`, "Sortir");
  return s;
}
function vueToit(e) {
  const fouine = e.panne.id === "fouine" && !e.repare;
  let s = `<rect width="1200" height="750" fill="#8ec5f0"/><rect width="1200" height="750" fill="#b5543a" opacity=".9"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${i * 64} H1200" stroke="#8f3f2b" stroke-width="3"/>`).join("")}
    <path d="M0 40 H1200" stroke="#6d6f72" stroke-width="5"/>${texte(1100, 30, "ligne de vie (faîtage)", 13, 800, "#fff")}
    <path d="M600 40 C 620 120 640 150 650 210" stroke="#f2c230" stroke-width="5" fill="none"/>${texte(700, 120, "ta longe", 13, 800, "#fff3c4")}`;
  for (let i = 0; i < 5; i++) s += module(80 + i * 216, 90, 200, 260) + module(80 + i * 216, 370, 200, 260);
  if (e.bache) s += `<rect x="70" y="80" width="1080" height="560" rx="10" fill="#2f3439" opacity=".92"/>${texte(610, 360, "modules bâchés : plus de lumière, plus de tension", 22, 800, "#e8ecef")}`;
  // câbles et connecteurs sous le bord des modules (entre le 5e et le 6e module de la chaîne)
  const xc = 610, yc = 660;
  s += `<rect x="60" y="640" width="1100" height="90" fill="#7a3a28"/>`;
  s += conducteur(`M${xc - 260} 632 C ${xc - 240} 680 ${xc - 120} ${yc} ${xc - 40} ${yc}`, "#151515", 9);
  s += conducteur(`M${xc + 260} 632 C ${xc + 240} 680 ${xc + 120} ${yc} ${xc + 40} ${yc}`, "#151515", 9);
  const ecart = e.mc4 ? 0 : 26;
  s += `<rect x="${xc - 44 - ecart}" y="${yc - 13}" width="44" height="26" rx="8" fill="#2a2a2a"/><rect x="${xc}" y="${yc - 13}" width="44" height="26" rx="8" fill="#2a2a2a"/>
    ${texte(xc - 22 - ecart, yc + 4, "MC4", 10, 800, "#ddd")}${texte(xc + 22, yc + 4, "MC4", 10, 800, "#ddd")}`;
  s += `<g class="zone cible" data-cible="mc4" role="button" tabindex="0" aria-label="Connecteurs MC4"><rect x="${xc - 90}" y="${yc - 34}" width="180" height="68" rx="12" fill="#fff" fill-opacity="0" stroke="#f2c230" stroke-width="3" stroke-dasharray="9 7" class="zone-cadre"/></g>`;
  if (fouine) {
    s += `<path d="M330 632 C 310 690 210 700 150 700" stroke="#151515" stroke-width="9" fill="none" stroke-dasharray="40 8 6 10 50"/>${cuivre(266, 688, 16, 80, 5)}
      ${texte(240, 728, "gaine rongée, cuivre à nu", 13, 800, "#ffe3a8")}`;
    s += `<g class="zone cible" data-cible="cable" role="button" tabindex="0" aria-label="Câble abîmé"><rect x="130" y="660" width="210" height="56" rx="10" fill="#fff" fill-opacity="0" stroke="#f2c230" stroke-width="3" stroke-dasharray="9 7" class="zone-cadre"/></g>`;
  } else s += conducteur("M330 632 C 310 690 210 700 150 700", "#151515", 9);
  s += cadreCliquable(860, 30, 300, 50, `data-geste="bache"`, e.bache ? "Retirer la bâche" : "Bâcher les modules (bâche opaque)");
  s += cadreCliquable(24, 30, 200, 50, `data-aller="maison"`, "Redescendre");
  return s;
}

/* ---------- Intervention ---------- */
export default {
  id: "toit",
  titre: "Sur le toit",
  lieu: "Maison de M. Lefort · installation photovoltaïque de 4 kWc (10 modules de 400 Wc en série)",
  client: { nom: "M. Lefort", court: "M. Lefort", initiales: "PL", teinte: "#4f7a5d", role: "Propriétaire, panneaux posés il y a deux ans",
    humeurs: ["M. Lefort est agacé.", "M. Lefort est mitigé.", "M. Lefort est content.", "M. Lefort est ravi."] },
  accueil: "« Bonjour ! Mes panneaux ne produisent plus rien depuis quelques jours. L'application affiche zéro. »",
  merci: "« L'application remonte ! Merci, je commençais à me demander si j'avais bien fait d'investir. »",
  vueDepart: "maison",
  tempsCible: 60,
  deplacement: 90,
  calibres: [["OFF", "Arrêt"], ["V", "V~"], ["DC", "V⎓"]],
  astuce: "Courant continu : calibre V⎓. On ne débranche jamais un connecteur en charge. Une bâche opaque sur les modules supprime la tension.",
  dialogue: {
    max: 5,
    fin: "« Je vous laisse travailler. Faites attention là-haut ! »",
    questions: [
      { id: "depuis", texte: "Depuis quand ça ne produit plus ?", reponse: {
        ac: "« Depuis l'orage de mardi soir. »", sectionneur: "« Depuis jeudi. Le jour où l'entreprise est venue nettoyer les panneaux. »",
        mc4: "« Depuis la tempête du week-end dernier. »", fouine: "« Depuis une semaine environ. »" } },
      { id: "ecran", apres: "depuis", texte: "L'onduleur affiche un message ?", reponse: {
        "*": "« Il écrit « PV absent », je crois. »", ac: "« Il écrit « Réseau absent »… pourtant on a bien le courant dans la maison ! »" } },
      { id: "qui", apres: "depuis", texte: "Quelqu'un est intervenu sur l'installation ou sur le toit ?", reponse: {
        "*": "« Non, personne. »", sectionneur: "« L'entreprise de nettoyage, jeudi. Ils sont passés au garage avant de monter. »",
        mc4: "« Non… mais la tempête a fait bouger des tuiles, ça claquait toute la nuit. »", fouine: "« Non. Par contre, on entend gratter dans les combles la nuit, et le voisin a vu une fouine sur le toit. »" } },
      { id: "coffret", texte: "Dans le garage, un coffret a disjoncté ?", reponse: {
        "*": "« Je ne crois pas, je n'y ai pas touché. »", ac: "« Il y a un petit coffret avec une manette baissée. Je n'ai pas osé y toucher. »" } },
      { id: "ligne", texte: "Il y a une ligne de vie ou des crochets de sécurité sur le toit ?", reponse: { "*": "« Oui, l'installateur a posé une ligne de vie le long du faîtage. »" } },
      { id: "gouttiere", apres: "ligne", texte: "La gouttière est à quelle hauteur ?", reponse: { "*": "« Cinq mètres pile, l'installateur l'avait mesurée. »" } },
      { id: "soleil", texte: "Vous êtes sûr qu'il y a eu du soleil ces jours-ci ?", mauvaise: true, reponse: { "*": "« … Oui. Il a fait grand beau toute la semaine. Je ne suis pas idiot. »" } },
    ],
  },
  pannes: [
    { id: "ac", titre: "Disjoncteur AC de l'onduleur déclenché",
      explication: "L'onduleur affiche « réseau absent » alors que la maison a du courant : il ne voit pas le réseau de son côté. Dans le coffret AC, le disjoncteur de l'onduleur est baissé (l'orage). Côté réseau, on mesure 230 V ; côté onduleur, 0 V. Un onduleur ne produit jamais sans réseau : c'est sa protection de découplage, pour ne pas alimenter une ligne que les agents d'Enedis croient coupée. On réarme, l'onduleur se resynchronise et repart." },
    { id: "sectionneur", titre: "Sectionneur DC laissé ouvert après le nettoyage",
      explication: "L'onduleur affiche « PV absent ». Au coffret DC, on mesure environ 400 V ⎓ côté modules (la chaîne est bonne : 10 modules de 40 V environ en série), mais 0 V côté onduleur : le sectionneur est sur OFF. L'entreprise de nettoyage l'avait ouvert pour travailler en sécurité et ne l'a pas refermé. On le referme et la production reprend." },
    { id: "mc4", titre: "Connecteur MC4 déboîté sur le toit",
      explication: "« PV absent » et 0 V ⎓ côté modules : la chaîne est ouverte quelque part. Sur le toit, un connecteur MC4 entre deux modules s'est déboîté (la tempête). Avant d'y toucher, on ouvre le sectionneur DC : reconnecter une chaîne en charge peut créer un arc électrique, et en continu un arc ne s'éteint pas tout seul. Connecteur reclipsé, sectionneur refermé : 400 V ⎓ et la production repart." },
    { id: "fouine", piece: "cableSolaire", titre: "Câble solaire rongé par une fouine",
      explication: "Chaîne ouverte (0 V ⎓ côté modules). Sur le toit, sous les modules, la gaine d'un câble est rongée et le cuivre est à nu : une fouine. Danger : en plein soleil, les modules produisent leur tension tant qu'ils voient la lumière, même sectionneur ouvert. On ouvre le sectionneur DC, on bâche les modules avec une bâche opaque (ou on intervient de nuit), puis on remplace le tronçon de câble et ses connecteurs, et on protège le passage des câbles (grillage)." },
  ],
  pieces: [{ id: "cableSolaire", nom: "Câble solaire 6 mm² et 2 connecteurs MC4", prix: 32, minutes: 20 }],
  liaisons: [], noeuds: NOEUDS, noms: NOMS,
  sansTournevis: true,
  etat(p) {
    return { djAC: p.id !== "ac", sect: p.id !== "sectionneur", mc4: p.id !== "mc4", bache: false, soleil: 0.9,
      prepa: { harnais: false, casque: false, ancrage: false, pied: null, depasse: false }, prepaOk: false };
  },
  compteurs: (a) => `<span title="Ensoleillement">${a.e.soleil > 0.7 ? "☀️" : "⛅"} ${Math.round(a.e.soleil * 100)} %</span><span>⏱ ${Math.round(a.e.minutes)} min</span>`,
  vues: { maison: vueMaison, garage: vueGarage, toit: vueToit },
  entree(a) { a.dire("Grand soleil, midi. L'onduleur est dans le garage, l'échelle contre la façade."); },
  panneaux: {
    prepa: { rendu(a) {
      const p = a.e.prepa;
      const bt = (k, l) => `<button type="button" class="im-question ${p[k] ? "choisi" : ""}" data-s="prepa:${k}">${p[k] ? "✔ " : ""}${l}</button>`;
      return `<h2>Avant de monter</h2>
        <p>Toiture en pente, gouttière à 5 m, échelle de 6 m, pas d'échafaudage. Prépare-toi.</p>
        ${bt("harnais", "Harnais antichute et longe")}${bt("casque", "Casque avec jugulaire")}${bt("ancrage", "S'accrocher à la ligne de vie dès qu'on arrive sur le toit")}
        <div class="im-reglage"><span>Distance entre le pied de l'échelle et la façade</span>
        ${["0,5", "1,75", "3"].map((d) => `<button type="button" class="im-question ${p.pied === d ? "choisi" : ""}" data-s="pied:${d}">${d} m</button>`).join("")}</div>
        ${bt("depasse", "Échelle attachée, dépassant d'1 m au-dessus de la gouttière")}
        <button type="button" class="im-plein" data-s="monter">Monter sur le toit</button>`;
    } },
  },
  action(a, act, arg) {
    const e = a.e;
    if (act === "prepa") { e.prepa[arg] = !e.prepa[arg]; return; }
    if (act === "pied") { e.prepa.pied = arg; return; }
    if (act === "monter") {
      const p = e.prepa, manque = [];
      if (!p.harnais) manque.push("le harnais antichute");
      if (!p.casque) manque.push("le casque");
      if (!p.ancrage) manque.push("l'accrochage à la ligne de vie");
      if (p.pied !== "1,75") manque.push("le pied de l'échelle écarté entre le quart et le tiers de sa longueur (échelle de 6 m : entre 1,5 m et 2 m)");
      if (!p.depasse) manque.push("l'échelle attachée qui dépasse d'1 m");
      if (manque.length) {
        a.faute(`Montée refusée : il manquait ${manque.join(", ")}. Une chute de toit, c'est la première cause d'accident grave chez les électriciens qui posent du photovoltaïque.`);
        a.dire(`Ton chef t'arrête au pied de l'échelle : il manque ${manque.join(", ")}.`, "danger");
        return;
      }
      e.prepaOk = true; e.panneau = null; a.temps(8); a.aller("toit");
      a.dire("Tu montes, tu t'accroches à la ligne de vie. Les connecteurs sont sous le bord inférieur des modules.");
    }
  },
  gestes: {
    sectionneur(a) { const e = a.e; e.sect = !e.sect; a.sons.disjoncteur(); a.temps(0.5); a.dire(`Sectionneur DC sur ${e.sect ? "ON" : "OFF"}.`); },
    djAC(a) { const e = a.e; e.djAC = !e.djAC; a.sons.disjoncteur(); a.temps(0.5); a.dire(e.djAC ? "Disjoncteur AC réarmé. L'onduleur compte les secondes avant de se reconnecter au réseau…" : "Disjoncteur AC baissé."); },
    bache(a) { const e = a.e; e.bache = !e.bache; a.temps(6); a.sons.clip(); a.dire(e.bache ? "Bâche opaque posée sur les modules : sans lumière, ils ne produisent plus de tension." : "Bâche retirée."); },
  },
  utiliser(a, outil, id) {
    const e = a.e;
    if (id === "mc4") {
      if (enCharge(e)) { e.accident = true; a.sons.zap(); a.faute("Connecteur débranché en charge : arc électrique. En courant continu, un arc ne s'éteint pas tout seul. On ouvre d'abord le sectionneur DC."); a.dire("⚡ Un arc électrique jaillit du connecteur ! En courant continu, il ne s'éteint pas tout seul.", "danger"); e.mc4 = false; return; }
      if (!e.mc4 && e.sect && chaineOk({ ...e, mc4: true }) && soleil(e) > 0 && e.djAC) {
        e.accident = true; a.sons.zap(); a.faute("Chaîne reconnectée avec le sectionneur DC fermé : le courant s'établit au moment du contact, d'où un arc. On ouvre d'abord le sectionneur DC.");
        a.dire("⚡ Arc électrique au moment où les deux connecteurs se touchent ! Il fallait ouvrir le sectionneur DC avant.", "danger");
        e.mc4 = true; if (e.panne.id === "mc4") e.repare = true; return;
      }
      e.mc4 = !e.mc4; a.temps(2); a.sons.clip();
      if (e.mc4 && e.panne.id === "mc4") e.repare = true;
      a.dire(e.mc4 ? "Clic : les deux connecteurs MC4 sont bien verrouillés." : "Connecteurs MC4 séparés.");
      return;
    }
    if (id === "cable") {
      if (vChaine({ ...e, mc4: true, repare: true }) > 0 && !e.bache) { a.electrisation("en touchant le cuivre à nu : les modules au soleil sont sous tension, même sectionneur ouvert"); return; }
      a.dire("Le câble est rongé sur 5 cm, le cuivre est à nu. Il faut remplacer ce tronçon et ses connecteurs.");
    }
  },
  mesure(a, va, vb, cal) {
    const e = a.e;
    const paire = [va, vb].sort().join("|");
    const dcIn = ["dc-in-n|dc-in-p"].includes(paire), dcOut = ["dc-out-n|dc-out-p"].includes(paire);
    const acOnd = ["ac-L|ac-N", "ac-L|pe"].includes(paire), acRes = ["res-L|res-N", "pe|res-L"].includes(paire);
    if (dcIn || dcOut) {
      const u = dcIn ? vChaine(e) : e.sect ? vChaine(e) : 0;
      if (cal === "V") { a.dire("Sur du courant continu, le calibre V~ ne mesure rien d'utile : passe en V⎓."); return "0 V"; }
      if (cal === "DC") return `${u} V`;
    }
    if (acOnd || acRes) {
      const u = acRes || e.djAC ? 230 : 0;
      if (cal === "DC") { a.dire("Côté sortie de l'onduleur, c'est de l'alternatif : calibre V~."); return "0 V"; }
      if (cal === "V") return `${u} V`;
    }
    return "- - -";
  },
  apres(a) {
    const e = a.e;
    if (e.panne.id === "ac" && e.djAC) e.repare = true;
    if (e.panne.id === "sectionneur" && e.sect) e.repare = true;
  },
  poser(a, id) {
    const e = a.e;
    if (e.vue !== "toit") { a.dire("Le câble abîmé est sur le toit, sous les modules."); return false; }
    if (!e.bache && soleil(e) > 0) { a.electrisation("en manipulant le câble : au soleil, les modules gardent leur tension même sectionneur ouvert. Il fallait bâcher (ou intervenir de nuit)"); return false; }
    if (e.sect) a.faute("Tu as remplacé le câble sectionneur DC fermé. On ouvre toujours le sectionneur avant de toucher à la chaîne.");
    return true;
  },
  termine(a) {
    const e = a.e;
    return production(e) > 0 && e.vue === "garage";
  },
};
