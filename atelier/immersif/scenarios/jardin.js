// Intervention « La nuit, sous la pluie » : l'éclairage du jardin fait sauter le différentiel quand il pleut.
// Mécanique : lampe frontale dans le noir, mégohmmètre, recherche par sectionnement à la boîte, fouille à la bêche.
import { vueTableau, texte, vis, conducteur, cuivre, cadreCliquable } from "../commun.js";

const RANGEE1 = [
  { cle: "diff", type: "id", haut: "40 A", ligne2: "IΔn 30 mA", typ: "AC", etiquette: "Différentiel 1" },
  { cle: "ext", type: "dj", cal: "C10", etiquette: "Éclairage extérieur" },
  { cle: "d2", type: "dj", cal: "C20", etiquette: "Prises garage" },
  { cle: "d3", type: "dj", cal: "C16", etiquette: "Portail motorisé" },
  { cle: "d4", type: "dj", cal: "C16", etiquette: "Éclairage garage" },
];
const RANGEE2 = [
  { cle: "diff2", type: "id", haut: "40 A", ligne2: "IΔn 30 mA", typ: "A", etiquette: "Différentiel 2" },
  { cle: "d5", type: "dj", cal: "C20", etiquette: "Lave-linge" },
  { cle: "d6", type: "dj", cal: "C20", etiquette: "Congélateur" },
  { cle: "d7", type: "dj", cal: "C20", etiquette: "Chauffe-eau" },
];
const NOEUDS = {
  "diff-L": "Ld", "diff-N": "Nd", "diff-amont-L": "L", "diff-amont-N": "N",
  "ext-L": "EL", "ext-N": "EN", "ext-amont-L": "Ld", "ext-amont-N": "Nd", "terre": "PE",
  "bx-L": "Bx", "bx-T": "PE", "al-L": "AlL", "po-L": "PoL",
  "b2-L": "AlL", "b2-N": "EN", "b2-T": "PE", "pj-L": "PoL", "pj-N": "EN", "pj-T": "PE",
};
const NOMS = {
  "diff-L": "sortie phase du différentiel", "diff-N": "sortie neutre du différentiel", "diff-amont-L": "arrivée phase du différentiel", "diff-amont-N": "arrivée neutre du différentiel",
  "ext-L": "sortie phase du disjoncteur Éclairage extérieur", "ext-N": "sortie neutre du disjoncteur Éclairage extérieur",
  "ext-amont-L": "arrivée phase (Éclairage extérieur)", "ext-amont-N": "arrivée neutre (Éclairage extérieur)", "terre": "bornier de terre",
  "bx-L": "arrivée phase dans la boîte", "bx-T": "terre dans la boîte", "al-L": "phase du départ allée", "po-L": "phase du départ portail",
  "b2-L": "borne L de la borne lumineuse 2", "b2-N": "borne N de la borne lumineuse 2", "b2-T": "terre de la borne lumineuse 2",
  "pj-L": "borne L du projecteur", "pj-N": "borne N du projecteur", "pj-T": "terre du projecteur",
};
const DEFAUT = { boite: "Bx", cableAllee: "AlL", borne2: "AlL", projecteur: "PoL" };

/* ---------- Dessins ---------- */
const pluie = `<g pointer-events="none" class="im-pluie">${Array.from({ length: 70 }, (_, i) => {
  const x = (i * 97) % 1200, y = (i * 53) % 700;
  return `<path d="M${x} ${y} l-8 26" stroke="#9fb6d8" stroke-width="1.6" opacity=".55"/>`;
}).join("")}</g>`;
function borne(x, y, k, n) {
  return `<g><rect x="${x - 14 * k}" y="${y - 80 * k}" width="${28 * k}" height="${80 * k}" rx="${4 * k}" fill="#3d444b"/>
    <rect x="${x - 17 * k}" y="${y - 92 * k}" width="${34 * k}" height="${14 * k}" rx="${3 * k}" fill="#2c3238"/>
    <rect x="${x - 11 * k}" y="${y - 74 * k}" width="${22 * k}" height="${20 * k}" fill="#d9dde2" opacity=".7"/>
    <ellipse cx="${x}" cy="${y}" rx="${22 * k}" ry="${6 * k}" fill="#1c2a1c"/>${n ? texte(x, y + 22 * k, n, 13, 800, "#cfd8e3") : ""}</g>`;
}
function vueJardin(e) {
  return `<rect width="1200" height="750" fill="#0b1426"/>
    <rect y="520" width="1200" height="230" fill="#1f3a22"/>
    <path d="M300 560 C 500 600 700 640 1000 720 L 1100 750 L 860 750 C 640 690 460 640 300 590 Z" fill="#6f6a60"/>
    <polygon points="0,140 520,140 520,560 0,560" fill="#cbbfa8"/><polygon points="-20,140 260,40 540,140" fill="#5b3a2c"/>
    <rect x="190" y="300" width="110" height="260" fill="#6b4a32"/><rect x="196" y="306" width="98" height="250" fill="#7d5a3e"/><circle cx="282" cy="440" r="6" fill="#d9c58c"/>
    <rect x="360" y="230" width="110" height="120" fill="#24324a" stroke="#efe9de" stroke-width="7"/>
    <rect x="40" y="320" width="110" height="240" fill="#8d949b"/>${texte(95, 310, "Garage", 15, 800, "#efe9de")}
    <rect x="318" y="282" width="26" height="40" rx="6" fill="#2f3439"/><path d="M322 322 h18 l-4 12 h-10 z" fill="#d6dbe0"/>
    <rect x="410" y="400" width="64" height="56" rx="6" fill="#d8dcdf" stroke="#8a9198" stroke-width="2"/>${texte(442, 470, "boîte", 12, 700, "#efe9de")}
    <rect x="166" y="380" width="16" height="22" rx="3" fill="#efe9de"/>
    <path d="M640 560 C 690 545 830 545 900 570 C 860 610 700 615 640 600 Z" fill="#4a3424"/>
    ${[660, 700, 740, 780, 820, 860].map((x, i) => `<path d="M${x} ${578 + (i % 2) * 8} q6 -22 12 0 M${x + 4} ${572 + (i % 2) * 8} q4 -16 10 -2" stroke="#3f7a3c" stroke-width="4" fill="none"/>`).join("")}
    ${texte(770, 636, "massif refait mardi", 13, 700, "#d6cdbd")}
    ${borne(600, 610, 1, "1")}${borne(760, 660, 1.1, "2")}${borne(930, 712, 1.2, "3")}
    <rect x="1040" y="360" width="40" height="300" fill="#8a8580"/><rect x="1080" y="420" width="120" height="200" fill="#4b5157"/>
    ${Array.from({ length: 6 }, (_, i) => `<path d="M${1090 + i * 18} 420 V620" stroke="#3a3f45" stroke-width="5"/>`).join("")}
    <rect x="1030" y="330" width="56" height="36" rx="4" fill="#2f3439"/><rect x="1036" y="336" width="44" height="22" fill="${e.panne.id === "projecteur" && !e.repare ? "#7b8794" : "#c9d2da"}"/>
    ${e.panne.id === "projecteur" && !e.repare ? `<path d="M1040 340 l14 10 l-6 8 l18 2" stroke="#2b2f34" stroke-width="1.5" fill="none"/>` : ""}
    ${pluie}
    ${cadreCliquable(400, 390, 84, 76, `data-aller="boite"`, "Boîte de dérivation")}
    ${cadreCliquable(732, 560, 56, 110, `data-aller="borne"`, "Borne 2")}
    ${cadreCliquable(1018, 316, 80, 60, `data-aller="projecteur"`, "Projecteur du portail")}
    ${cadreCliquable(30, 330, 130, 120, `data-aller="garage"`, "Garage : tableau")}
    <g class="zone cible" data-cible="massif" role="button" tabindex="0" aria-label="Massif refait mardi"><path d="M640 560 C 690 545 830 545 900 570 C 860 610 700 615 640 600 Z" fill="#fff" fill-opacity="0" stroke="#f2c230" stroke-width="3" stroke-dasharray="9 7" class="zone-cadre"/></g>
    <g class="zone cible" data-cible="pelouse" role="button" tabindex="0" aria-label="Pelouse près du portail"><rect x="900" y="560" width="120" height="70" rx="10" fill="#fff" fill-opacity="0" stroke="#f2c230" stroke-width="2" stroke-dasharray="7 7" class="zone-cadre"/></g>
    <g class="zone" data-geste="interrupteur" role="button" tabindex="0" aria-label="Interrupteur de l'éclairage extérieur (dans l'entrée)"><rect x="150" y="370" width="46" height="42" fill="transparent"/></g>
    ${cadreCliquable(152, 372, 44, 38, `data-geste="interrupteur"`, "Interrupteur (entrée)", 8)}`;
}
function lumieres(e, a) {
  const app = a.alimente("AppL", "EN"), al = a.alimente("AlL", "B1"), po = a.alimente("PoL", "EN");
  const halo = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#g-lumiere)" opacity=".85"/>`;
  return `<g pointer-events="none">${app ? halo(331, 330, 140) + `<path d="M322 322 h18 l-4 12 h-10 z" fill="#fff3b8"/>` : ""}
    ${al ? [[600, 548], [760, 592], [930, 636]].map(([x, y]) => halo(x, y, 70) + `<rect x="${x - 10}" y="${y - 8}" width="20" height="18" fill="#fff3b8"/>`).join("") : ""}
    ${po ? halo(1058, 380, 220) + `<rect x="1036" y="336" width="44" height="22" fill="#fff6c9"/>` : ""}</g>`;
}
function vueBoite(e) {
  const ouverte = e.boite === 1, eau = e.panne.id === "boite" && !e.repare;
  let s = `<rect width="1200" height="750" fill="#bdb2a0"/><rect width="1200" height="750" fill="url(#p-crepi)"/>${pluie}
    <rect x="300" y="120" width="600" height="440" rx="18" fill="#d8dcdf" stroke="#8a9198" stroke-width="4" filter="url(#f-ombre)"/>
    ${texte(600, 600, e.panne.id === "boite" && !e.repare ? "étiquette du couvercle : « IP20 – usage intérieur »" : "étiquette du couvercle : « IP55 »", 15, 700, "#2b2f34")}`;
  s += conducteur("M200 330 L320 330", "phase", 10) + conducteur("M200 350 L320 350", "neutre", 10) + conducteur("M200 370 L320 370", "terre", 10);
  if (!ouverte) {
    s += `<rect x="312" y="132" width="576" height="416" rx="14" fill="#c6cbcf"/>${[0, 1, 2, 3].map((i) => `<circle cx="${i % 2 ? 860 : 340}" cy="${i < 2 ? 160 : 520}" r="9" fill="#9aa1a8"/>`).join("")}`;
    s += cadreCliquable(300, 120, 600, 440, `data-geste="ouvrirBoite"`, "Dévisser le couvercle", 18);
  } else {
    s += `<rect x="312" y="132" width="576" height="416" rx="14" fill="${eau ? "#7d8f9c" : "#5a646d"}"/>`;
    if (eau) s += `<path d="M330 500 Q 600 470 870 505 L870 540 L330 540 Z" fill="#6f9ac0" opacity=".8"/>${[380, 470, 560, 700, 800].map((x) => `<ellipse cx="${x}" cy="${200 + (x % 70)}" rx="5" ry="8" fill="#a9c8e6" opacity=".85"/>`).join("")}${texte(600, 528, "de l'eau au fond de la boîte", 14, 800, "#eaf2fa")}`;
    // arrivée + deux départs
    s += conducteur("M320 330 C 360 330 380 300 410 300", "phase", 9) + vis(430, 300, 13, { id: "bx-L", label: NOMS["bx-L"] }) + texte(430, 276, "arrivée", 13, 800, "#eef2f5");
    s += conducteur("M320 370 C 380 370 400 420 430 420", "terre", 9) + vis(450, 420, 13, { id: "bx-T", label: NOMS["bx-T"] }) + texte(450, 450, "terre", 13, 800, "#eef2f5");
    const dep = (x, nom, idv, on, geste) => `${on ? conducteur(`M443 300 C 520 300 ${x - 60} 250 ${x} 250`, "phase", 8) : cuivre(x - 30, 236, 16, 270, 6)}
      ${conducteur(`M${x} 250 C ${x + 60} 250 ${x + 80} 300 ${x + 120} 320 L 900 ${x === 640 ? 330 : 400}`, "phase", 8)}
      ${vis(x, 250, 12, { id: idv, label: NOMS[idv] })}${texte(x, 226, nom, 13, 800, "#eef2f5")}
      ${cadreCliquable(x - 90, 300, 180, 44, `data-geste="${geste}"`, on ? "Débrancher ce départ" : "Rebrancher ce départ", 10)}`;
    s += dep(640, "départ allée", "al-L", e.app.brancheAllee, "branche:allee") + dep(800, "départ portail", "po-L", e.app.branchePortail, "branche:portail");
    s += cadreCliquable(860, 30, 300, 50, `data-geste="fermerBoite"`, "Revisser le couvercle");
  }
  s += cadreCliquable(24, 660, 160, 56, `data-aller="jardin"`, "Retour au jardin");
  return s;
}
function vueBorne(e) {
  const ouverte = e.borne === 1, eau = e.panne.id === "borne2" && !e.repare;
  let s = `<rect width="1200" height="750" fill="#13202e"/><rect y="560" width="1200" height="190" fill="#24402a"/>${pluie}
    <rect x="480" y="160" width="240" height="420" rx="14" fill="#3d444b"/><ellipse cx="600" cy="580" rx="150" ry="26" fill="#1a2b1c"/>`;
  if (!ouverte) {
    s += `<rect x="460" y="120" width="280" height="60" rx="10" fill="#2c3238"/><rect x="500" y="200" width="200" height="90" fill="#d9dde2" opacity=".75"/>
      ${eau ? `<rect x="500" y="200" width="200" height="90" fill="#ffffff" opacity=".35"/>${texte(600, 250, "buée à l'intérieur", 15, 800, "#2b2f34")}` : ""}`;
    s += cadreCliquable(460, 110, 280, 190, `data-geste="ouvrirBorne"`, "Ouvrir la borne (capot)");
  } else {
    s += `<rect x="500" y="300" width="200" height="190" rx="8" fill="#22272c"/>
      ${conducteur("M560 580 C 560 520 540 470 540 430", "phase", 9)}${conducteur("M600 580 L600 430", "neutre", 9)}${conducteur("M640 580 C 640 520 660 470 660 430", "terre", 9)}
      <rect x="560" y="520" width="80" height="34" rx="6" fill="#59616a"/>${texte(600, 542, eau ? "presse-étoupe fendu" : "presse-étoupe", 11, 700, "#e8ecef")}
      ${vis(540, 400, 13, { id: "b2-L", label: NOMS["b2-L"] })}${vis(600, 400, 13, { id: "b2-N", label: NOMS["b2-N"] })}${vis(660, 400, 13, { id: "b2-T", label: NOMS["b2-T"] })}
      ${texte(540, 372, "L", 14, 800, "#eef2f5")}${texte(600, 372, "N", 14, 800, "#eef2f5")}${texte(660, 372, "⏚", 15, 800, "#eef2f5")}
      ${eau ? `<path d="M505 470 Q600 455 695 470 L695 486 L505 486 Z" fill="#6f9ac0" opacity=".85"/>${texte(600, 330, "de l'eau dans le bornier", 14, 800, "#cfe3f7")}` : ""}`;
    s += cadreCliquable(860, 30, 300, 50, `data-geste="fermerBorne"`, "Refermer la borne");
  }
  s += cadreCliquable(24, 660, 160, 56, `data-aller="jardin"`, "Retour au jardin");
  return s;
}
function vueProjecteur(e) {
  const ouvert = e.proj === 1, casse = e.panne.id === "projecteur" && !e.repare;
  let s = `<rect width="1200" height="750" fill="#101a28"/><rect x="420" y="0" width="360" height="750" fill="#8a8580"/>${pluie}`;
  s += `<rect x="440" y="160" width="320" height="220" rx="14" fill="#2f3439" filter="url(#f-ombre)"/>
    <rect x="462" y="182" width="276" height="176" rx="8" fill="${casse ? "#7b8794" : "#c9d2da"}"/>
    ${casse ? `<path d="M480 200 l60 50 l-30 40 l90 20 l40 -30 M620 270 l50 60" stroke="#2b2f34" stroke-width="3" fill="none"/>${texte(600, 336, "vitre fêlée, buée derrière", 15, 800, "#1d2228")}` : ""}
    ${texte(600, 410, "étiquette : « IP65 »", 14, 700, "#efe9de")}`;
  if (!ouvert) s += cadreCliquable(430, 150, 340, 240, `data-geste="ouvrirProj"`, "Ouvrir le boîtier de raccordement");
  else {
    s += `<rect x="470" y="440" width="260" height="140" rx="10" fill="#22272c"/>
      ${vis(540, 520, 13, { id: "pj-L", label: NOMS["pj-L"] })}${vis(600, 520, 13, { id: "pj-N", label: NOMS["pj-N"] })}${vis(660, 520, 13, { id: "pj-T", label: NOMS["pj-T"] })}
      ${texte(540, 492, "L", 14, 800, "#eef2f5")}${texte(600, 492, "N", 14, 800, "#eef2f5")}${texte(660, 492, "⏚", 15, 800, "#eef2f5")}
      ${casse ? texte(600, 566, "des gouttes sur le bornier", 13, 800, "#cfe3f7") : ""}`;
    s += cadreCliquable(860, 30, 300, 50, `data-geste="fermerProj"`, "Refermer le boîtier");
  }
  s += cadreCliquable(24, 660, 160, 56, `data-aller="jardin"`, "Retour au jardin");
  return s;
}
function vueTranchee(e) {
  const coupe = e.panne.id === "cableAllee" && !e.repare;
  const lieu = e.fouille;
  let s = `<rect width="1200" height="750" fill="#0c1220"/><rect y="120" width="1200" height="630" fill="#5a3f2a"/>
    <rect y="100" width="1200" height="30" fill="#2c4a2c"/>${pluie}
    <path d="M250 130 L950 130 L900 640 L300 640 Z" fill="#3b2a1d"/>
    ${texte(600, 90, lieu === "massif" ? "Fouille dans le massif, le long de l'allée" : "Fouille dans la pelouse, près du portail", 18, 800, "#e8e2d4")}
    <path d="M300 300 H900" stroke="#d23a2e" stroke-width="10" stroke-dasharray="${coupe && lieu === "massif" ? "160 30 900" : "0"}"/>
    ${texte(600, 286, "grillage avertisseur rouge (20 cm au-dessus du câble)", 13, 700, "#f3d2cf")}
    <rect x="290" y="450" width="620" height="44" rx="22" fill="#c8322a"/>${texte(600, 520, "fourreau rouge (TPC) à 50 cm de profondeur", 13, 700, "#f3d2cf")}
    ${[0.25, 0.5, 0.75].map((t) => `<path d="M${120} ${130 + t * 510} H1080" stroke="#6b4a32" stroke-width="2" opacity=".5"/>`).join("")}
    ${texte(170, 300, "−30 cm", 13, 700, "#d6cdbd")}${texte(170, 474, "−50 cm", 13, 700, "#d6cdbd")}`;
  if (lieu === "massif" && coupe) s += `<path d="M560 440 l40 -10 l30 20 l-20 30 z" fill="#3b2a1d"/><rect x="560" y="458" width="90" height="16" fill="#2b2f34"/>${cuivre(588, 456, 22, 135, 5)}
    ${texte(600, 420, "fourreau fendu, câble entaillé par la bêche", 15, 800, "#ffe3a8")}`;
  else s += texte(600, 420, "le fourreau est intact ici", 15, 800, "#e8e2d4");
  s += cadreCliquable(860, 660, 300, 50, `data-geste="reboucher"`, "Reboucher la fouille");
  return s;
}

/* ---------- Intervention ---------- */
export default {
  id: "jardin",
  titre: "La nuit, sous la pluie",
  lieu: "Maison de M. Garnier · jardin, 21 h, il pleut",
  client: { nom: "M. Garnier", court: "M. Garnier", initiales: "MG", teinte: "#7a6a4f", role: "Propriétaire, retraité",
    humeurs: ["M. Garnier est agacé.", "M. Garnier est mitigé.", "M. Garnier est content.", "M. Garnier est ravi."] },
  accueil: "« Bonsoir ! Désolé de vous faire venir sous cette pluie. Chaque fois que j'allume l'éclairage du jardin, tout saute. »",
  merci: "« Le jardin est éclairé, et rien ne saute ! Merci, et séchez-vous un peu avant de partir. »",
  vueDepart: "jardin",
  tempsCible: 75,
  deplacement: 70,
  calibres: [["OFF", "Arrêt"], ["V", "V~"], ["ISO", "MΩ 500 V"]],
  outils: [{ id: "beche", label: "⛏️ Bêche" }],
  astuce: "La frontale suit ta souris (ou ton doigt). Mégohmmètre (MΩ 500 V) : circuit coupé, une pointe sur la terre, l'autre sur un conducteur. Bêche : touche l'endroit à creuser.",
  dialogue: {
    max: 5,
    fin: "« Je vous laisse, je vais vous faire un café. »",
    questions: [
      { id: "quand", texte: "Ça saute à quel moment exactement ?", reponse: { "*": "« Dès que j'appuie sur l'interrupteur de l'éclairage extérieur. Éteint, ça tient. »" } },
      { id: "sec", apres: "quand", texte: "Et quand il fait sec, ça marche ?", reponse: {
        "*": "« Oui ! Hier, avec le soleil, aucun souci. C'est quand il pleut. »",
        boite: "« Oui. Ça fait ça à chaque grosse pluie depuis cet été. Par temps sec, rien. »" } },
      { id: "lampes", apres: "quand", texte: "Vous avez remarqué quelque chose sur une des lampes ?", reponse: {
        "*": "« Non… ça saute avant que quoi que ce soit s'allume. »",
        borne2: "« La deuxième borne de l'allée avait de la buée à l'intérieur, l'autre jour. »",
        projecteur: "« Le projecteur du portail a la vitre fêlée depuis un coup de ballon des petits-enfants. »" } },
      { id: "travaux", texte: "Quelqu'un a travaillé dans le jardin ou sur l'éclairage ?", reponse: {
        "*": "« Non, personne. »",
        cableAllee: "« Le jardinier a refait le massif le long de l'allée mardi. Il a bêché assez profond. »",
        boite: "« Mon beau-frère a ajouté l'éclairage du portail cet été. Il a fait une dérivation sur la façade. »" } },
      { id: "depuis", apres: "travaux", texte: "Depuis quand ça arrive ?", reponse: {
        boite: "« Depuis cet été, depuis que mon beau-frère a fait sa dérivation. Pas à chaque fois : quand il pleut fort. »",
        cableAllee: "« Depuis mardi soir. Il pleuvait. »",
        borne2: "« Depuis cet hiver, de temps en temps. »",
        projecteur: "« Depuis la semaine dernière. »" } },
      { id: "tableau", texte: "Qu'est-ce qui saute au tableau ?", reponse: { "*": "« La grosse manette bleue, dans le garage. Celle avec le petit bouton T. »" } },
      { id: "attendre", texte: "Vous ne pouviez pas attendre qu'il arrête de pleuvoir ?", mauvaise: true, reponse: { "*": "« Je vous appelle justement parce que ça ne marche pas quand il pleut… »" } },
    ],
  },
  pannes: [
    { id: "boite", piece: "boiteIP55",
      titre: "Boîte de dérivation d'intérieur posée dehors, pleine d'eau",
      explication: "Circuit coupé, le mégohmmètre entre phase et terre donne 0,04 MΩ au lieu de plusieurs centaines : l'isolement est mauvais. En débranchant les deux départs dans la boîte, il reste mauvais à l'arrivée de la boîte : le défaut est dans la boîte elle-même. Elle est marquée IP20, usage intérieur : posée dehors par le beau-frère, elle se remplit d'eau à chaque grosse pluie, et le courant fuit vers la terre. On la remplace par une boîte étanche adaptée à l'extérieur (IP55 par exemple), on sèche et on refait les connexions." },
    { id: "cableAllee", piece: "jonction",
      titre: "Câble de l'allée entaillé par la bêche du jardinier",
      explication: "Circuit coupé, le départ portail seul est sain, mais le départ allée donne 0,04 MΩ entre phase et terre. Le jardinier a refait le massif le long de l'allée : en creusant, on trouve le grillage avertisseur déchiré, le fourreau rouge fendu et le câble entaillé. L'eau du sol mouillé y entre et le courant part à la terre. On refait une jonction étanche (kit à résine), on remet un fourreau et le grillage avertisseur, puis on rebouche." },
    { id: "borne2", piece: "presseEtoupe",
      titre: "Eau dans la borne lumineuse 2 (presse-étoupe fendu)",
      explication: "Le départ allée est en défaut d'isolement (0,04 MΩ), le départ portail est sain. La borne 2 avait de la buée : ouverte, son bornier baigne dans l'eau, entrée par un presse-étoupe fendu. On sèche, on change le presse-étoupe et le joint, on contrôle l'isolement, puis on remet en service." },
    { id: "projecteur", piece: "projecteurNeuf",
      titre: "Projecteur du portail à la vitre fêlée, plein d'eau",
      explication: "Le départ portail est en défaut d'isolement (0,04 MΩ), le départ allée est sain. Le projecteur a la vitre fêlée par un ballon : il n'est plus étanche, l'eau coule sur son bornier et le courant part à la terre. On le remplace par un projecteur étanche (IP65)." },
  ],
  pieces: [
    { id: "boiteIP55", nom: "Boîte de dérivation étanche IP55", prix: 14, minutes: 15 },
    { id: "jonction", nom: "Kit de jonction enterrée à résine + fourreau", prix: 26, minutes: 25 },
    { id: "presseEtoupe", nom: "Presse-étoupe et joint neufs", prix: 6, minutes: 15 },
    { id: "projecteurNeuf", nom: "Projecteur LED IP65", prix: 45, minutes: 15 },
  ],
  liaisons: [
    { a: "L", b: "Ld", si: "diff" }, { a: "N", b: "Nd", si: "diff" },
    { a: "Ld", b: "EL", si: "ext" }, { a: "Nd", b: "EN", si: "ext" },
    { a: "EL", b: "AppL", si: "inter" }, { a: "AppL", b: "EN", charge: 1 },
    { a: "AppL", b: "Bx" },
    { a: "Bx", b: "AlL", si: "brancheAllee" }, { a: "AlL", b: "B1", charge: 1 }, { a: "B1", b: "EN" },
    { a: "Bx", b: "PoL", si: "branchePortail" }, { a: "PoL", b: "EN", charge: 1 },
    { a: "Ld", b: "G2", si: "d2" }, { a: "Ld", b: "G3", si: "d3" }, { a: "Ld", b: "G4", si: "d4" },
  ],
  noeuds: NOEUDS, noms: NOMS,
  tableau: { rangees: [RANGEE1, RANGEE2] },
  etat: () => ({ boite: 0, borne: 0, proj: 0, fouille: null }),
  majApp(e) {
    if (e.app.inter === undefined) { e.app.inter = true; e.app.brancheAllee = true; e.app.branchePortail = true; e.app.diff = false; }
  },
  frontale: (e) => (["jardin", "tranchee"].includes(e.vue) ? { rayon: 170, lumieres: e._lumieres || "" } : false),
  circuitCoupe: (e) => !e.app.ext || !e.app.diff || !e.app.inter,
  contexte: (e) => `éclairage ${e.app.inter ? "allumé" : "éteint"} à l'interrupteur`,
  gestesTournevis: ["ouvrirBoite", "fermerBoite", "ouvrirBorne", "fermerBorne", "ouvrirProj", "fermerProj"],
  vues: {
    jardin: (e, a) => { e._lumieres = lumieres(e, a); return vueJardin(e); },
    garage: (e) => vueTableau(e, { rangees: [RANGEE1, RANGEE2], relies: ["diff", "ext"], noms: NOMS, retour: "jardin" }),
    boite: vueBoite, borne: vueBorne, projecteur: vueProjecteur,
    tranchee: (e) => { e._lumieres = ""; return vueTranchee(e); },
  },
  entree(a) { a.dire("Il pleut, il fait nuit noire. Ta frontale éclaire là où tu regardes."); },
  gestes: {
    interrupteur(a) { const e = a.e; e.app.inter = !e.app.inter; a.sons.interrupteur(); a.dire(`Tu ${e.app.inter ? "allumes" : "éteins"} l'éclairage du jardin à l'interrupteur de l'entrée.`); },
    manette(a, cle) {
      const e = a.e, ap = [...RANGEE1, ...RANGEE2].find((x) => x.cle === cle);
      e.app[cle] = !e.app[cle]; a.sons.disjoncteur(); a.temps(0.5);
      a.dire(`${ap.etiquette} : manette ${e.app[cle] ? "remontée" : "baissée"}.`);
    },
    ouvrirBoite(a) { a.e.boite = 1; a.temps(3); a.sons.vis(); a.dire("Couvercle dévissé. Tu éclaires l'intérieur de la boîte."); },
    fermerBoite(a) { a.e.boite = 0; a.temps(3); a.sons.vis(); a.dire("Couvercle revissé."); },
    branche(a, k) {
      const e = a.e, cle = k === "allee" ? "brancheAllee" : "branchePortail", n = k === "allee" ? "AlL" : "PoL";
      if (a.pot.de("Bx") === 230 || a.pot.de(n) === 230) { a.electrisation("en manipulant les connexions de la boîte"); return; }
      e.app[cle] = !e.app[cle]; a.temps(2); a.sons.clip();
      a.dire(`Départ ${k === "allee" ? "allée" : "portail"} ${e.app[cle] ? "rebranché" : "débranché : il est isolé du reste du circuit"}.`);
    },
    ouvrirBorne(a) { a.e.borne = 1; a.temps(3); a.sons.vis(); a.dire("Capot de la borne 2 retiré."); },
    fermerBorne(a) { a.e.borne = 0; a.temps(3); a.sons.vis(); a.dire("Borne refermée."); },
    ouvrirProj(a) { a.e.proj = 1; a.temps(3); a.sons.vis(); a.dire("Boîtier de raccordement du projecteur ouvert."); },
    fermerProj(a) { a.e.proj = 0; a.temps(3); a.sons.vis(); a.dire("Boîtier refermé."); },
    reboucher(a) { a.e.fouille = null; a.e.vue = "jardin"; a.temps(10); a.dire("Tu rebouches la fouille et tu tasses la terre."); },
  },
  utiliser(a, outil, id) {
    if (outil !== "beche") { a.dire(id === "massif" ? "Un massif fraîchement retourné, le long de l'allée. Pour voir ce qu'il y a dessous, il faut creuser." : "De la pelouse détrempée."); return; }
    const e = a.e;
    e.fouille = id; a.temps(20); a.sons.clip(); a.aller("tranchee");
    a.dire(id === "massif" ? "Tu creuses prudemment à la bêche le long de l'allée, jusqu'au grillage rouge, puis jusqu'au fourreau." : "Tu creuses dans la pelouse près du portail, jusqu'au fourreau.");
  },
  mesure(a, va, vb, cal) {
    if (cal !== "ISO") return undefined;
    const e = a.e, na = NOEUDS[va], nb = NOEUDS[vb];
    if (a.pot.de(na) === 230 || a.pot.de(nb) === 230) {
      a.faute("Mégohmmètre branché sur un circuit sous tension : l'essai d'isolement se fait toujours circuit coupé et vérifié hors tension.");
      a.dire("L'appareil refuse : tension présente ! On coupe le circuit avant un essai d'isolement.", "danger");
      return "U > 50 V";
    }
    if (na !== "PE" && nb !== "PE") { a.dire("Un essai d'isolement se fait entre un conducteur et la terre (les lampes branchées fausseraient une mesure entre phase et neutre)."); return "- - -"; }
    let x = na === "PE" ? nb : na;
    if (x === "EN") x = "EL"; // le neutre est relié à la phase à travers les lampes : il voit le même défaut
    const d = DEFAUT[e.panne.id];
    const touche = !e.repare && (x === d || reliePar(a, x, d));
    return touche ? "0,04 MΩ" : "> 500 MΩ";
  },
  apres(a) {
    const e = a.e;
    const d = DEFAUT[e.panne.id];
    if (!e.repare && e.app.diff && e.app.ext && e.app.inter && reliePar(a, "EL", d)) {
      e.app.diff = false; setTimeout(() => a.sons.disjoncteur(), 150);
      a.dire("Clac ! Dans le garage, le différentiel vient de sauter. Le jardin replonge dans le noir.", "alerte");
    }
  },
  poser(a, id) {
    const e = a.e, chaud = (...n) => n.some((x) => a.pot.de(x) === 230);
    const lieu = { boiteIP55: ["boite", e.boite === 1], jonction: ["tranchee", e.fouille === "massif"], presseEtoupe: ["borne", e.borne === 1], projecteurNeuf: ["projecteur", e.proj === 1] }[id];
    if (e.vue !== lieu[0] || !lieu[1]) { a.dire("Cette pièce se pose ailleurs, ou il faut d'abord ouvrir (ou dégager) l'endroit."); return false; }
    if (chaud("Bx", "AlL", "PoL")) { a.electrisation("en raccordant la pièce"); return false; }
    if (!e.verifies.size) a.faute("Tu as remplacé une pièce sans avoir vérifié l'absence de tension.");
    return true;
  },
  termine(a) {
    const e = a.e;
    return e.app.diff && e.app.ext && e.app.inter && e.app.brancheAllee && e.app.branchePortail && e.boite === 0 && e.borne === 0 && e.proj === 0 && !e.fouille
      && e.vue === "jardin" && a.alimente("AlL", "B1") && a.alimente("PoL", "EN");
  },
};
// Un nœud est-il relié au défaut par des liaisons qui conduisent (interrupteur, départs) ?
function reliePar(a, depart, cible) {
  if (depart === cible) return true;
  const e = a.e;
  const lignes = [["EL", "AppL", "inter"], ["AppL", "Bx"], ["Bx", "AlL", "brancheAllee"], ["Bx", "PoL", "branchePortail"]];
  const vus = new Set([depart]), file = [depart];
  while (file.length) {
    const x = file.shift();
    for (const [p, q, si] of lignes) {
      if (si && !e.app[si]) continue;
      const y = p === x ? q : q === x ? p : null;
      if (y && !vus.has(y)) { if (y === cible) return true; vus.add(y); file.push(y); }
    }
  }
  return false;
}
