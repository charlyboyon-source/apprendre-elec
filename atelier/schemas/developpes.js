// Schémas développés des montages : phase en haut, neutre en bas, appareils dessinés au repos (symboles normalisés).
const ROUGE = "#c8322a", BLEU = "#2e6bc9", ENCRE = "#1d2228";
const t = (x, y, s, taille = 13, poids = 700, coul = ENCRE, ancre = "middle") =>
  `<text x="${x}" y="${y}" font-size="${taille}" font-weight="${poids}" fill="${coul}" text-anchor="${ancre}" font-family="system-ui, sans-serif">${s}</text>`;
const fil = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${ENCRE}" stroke-width="2.4" fill="none"/>`;
const point = (x, y) => `<circle cx="${x}" cy="${y}" r="4" fill="${ENCRE}"/>`;
// Contact à fermeture (interrupteur) entre y et y + 70, dessiné ouvert
const contact = (x, y, rep, bp = false) => `${fil(x, y, x, y + 22)}<path d="M${x} ${y + 48} L${x - 16} ${y + 22}" stroke="${ENCRE}" stroke-width="2.4"/>${fil(x, y + 48, x, y + 70)}
  ${bp ? `<path d="M${x - 8} ${y + 35} H${x - 34} M${x - 34} ${y + 27} V${y + 43}" stroke="${ENCRE}" stroke-width="2" stroke-dasharray="${bp === "lien" ? "4 3" : "0"}"/>` : ""}
  ${t(x + 12, y + 40, rep, 12, 800, ENCRE, "start")}`;
// Inverseur (va-et-vient) : commune en haut (y), sorties 1 et 2 en bas (y + 70) à x - 22 et x + 22
const inverseur = (x, y, rep, haut = true) => {
  if (haut) return `${fil(x, y, x, y + 26)}<path d="M${x} ${y + 26} L${x - 20} ${y + 48}" stroke="${ENCRE}" stroke-width="2.4"/>${fil(x - 22, y + 50, x - 22, y + 70)}${fil(x + 22, y + 50, x + 22, y + 70)}
    <path d="M${x + 22} ${y + 50} h-6" stroke="${ENCRE}" stroke-width="2.4"/>${t(x + 34, y + 30, rep, 12, 800, ENCRE, "start")}`;
  return `${fil(x - 22, y, x - 22, y + 20)}${fil(x + 22, y, x + 22, y + 20)}<path d="M${x} ${y + 44} L${x - 20} ${y + 22}" stroke="${ENCRE}" stroke-width="2.4"/>${fil(x, y + 44, x, y + 70)}${t(x + 34, y + 40, rep, 12, 800, ENCRE, "start")}`;
};
// Permutateur : deux entrées en haut, deux sorties en bas, liaisons droites au repos
const permutateur = (x, y, rep) => `<rect x="${x - 40}" y="${y + 14}" width="80" height="42" rx="4" fill="#fff" stroke="${ENCRE}" stroke-width="2"/>
  ${fil(x - 22, y, x - 22, y + 14)}${fil(x + 22, y, x + 22, y + 14)}${fil(x - 22, y + 56, x - 22, y + 70)}${fil(x + 22, y + 56, x + 22, y + 70)}
  <path d="M${x - 22} ${y + 14} V${y + 56} M${x + 22} ${y + 14} V${y + 56}" stroke="${ENCRE}" stroke-width="2"/><path d="M${x - 22} ${y + 18} L${x + 22} ${y + 52} M${x + 22} ${y + 18} L${x - 22} ${y + 52}" stroke="${ENCRE}" stroke-width="1.5" stroke-dasharray="4 3"/>
  ${t(x + 50, y + 40, rep, 12, 800, ENCRE, "start")}`;
const lampe = (x, y, rep) => `${fil(x, y, x, y + 14)}<circle cx="${x}" cy="${y + 35}" r="21" fill="#fff" stroke="${ENCRE}" stroke-width="2.4"/>
  <path d="M${x - 15} ${y + 20} L${x + 15} ${y + 50} M${x + 15} ${y + 20} L${x - 15} ${y + 50}" stroke="${ENCRE}" stroke-width="2"/>${fil(x, y + 56, x, y + 70)}${t(x + 30, y + 40, rep, 12, 800, ENCRE, "start")}`;
const bobine = (x, y, rep) => `${fil(x, y, x, y + 16)}<rect x="${x - 20}" y="${y + 16}" width="40" height="38" fill="#fff" stroke="${ENCRE}" stroke-width="2.4"/>${fil(x, y + 54, x, y + 70)}
  ${t(x - 26, y + 22, "A1", 10, 700, ENCRE, "end")}${t(x - 26, y + 58, "A2", 10, 700, ENCRE, "end")}${t(x + 28, y + 40, rep, 12, 800, ENCRE, "start")}`;
const resistance = (x, y, rep) => `${fil(x, y, x, y + 12)}<rect x="${x - 12}" y="${y + 12}" width="24" height="46" fill="#fff" stroke="${ENCRE}" stroke-width="2.4"/>${fil(x, y + 58, x, y + 70)}${t(x + 22, y + 40, rep, 12, 800, ENCRE, "start")}`;
const prise = (x, y, rep) => `${fil(x, y, x, y + 30)}<path d="M${x - 22} ${y + 30} H${x + 22}" stroke="${ENCRE}" stroke-width="2.4"/><path d="M${x - 20} ${y + 36} A20 20 0 0 0 ${x + 20} ${y + 36}" fill="none" stroke="${ENCRE}" stroke-width="2.4"/>${t(x + 30, y + 42, rep, 12, 800, ENCRE, "start")}`;
function cadre(contenu, titre, legende) {
  return `<svg viewBox="0 0 900 520" class="sc-dev" role="img" aria-label="Schéma développé : ${titre}">
    <rect width="900" height="520" fill="#fffdf7"/>
    <path d="M40 50 H860" stroke="${ROUGE}" stroke-width="4"/>${t(44, 40, "L (phase)", 13, 800, ROUGE, "start")}
    <path d="M40 470 H860" stroke="${BLEU}" stroke-width="4"/>${t(44, 492, "N (neutre)", 13, 800, BLEU, "start")}
    ${contenu}
    ${t(856, 40, titre, 13, 800, ENCRE, "end")}
    ${legende ? t(856, 510, legende, 11, 600, "#555", "end") : ""}
  </svg>`;
}
// Branche verticale : éléments empilés entre la phase (y=50) et le neutre (y=470)
function branche(x, elements) {
  const h = 420 / elements.length;
  let s = point(x, 50), y = 50;
  for (const el of elements) { const marge = (h - 70) / 2; s += fil(x, y, x, y + marge) + el(x, y + marge) + fil(x, y + marge + 70, x, y + h); y += h; }
  return s + point(x, 470);
}
export const DEVELOPPES = {
  simple: () => cadre(branche(450, [(x, y) => contact(x, y, "S1"), (x, y) => lampe(x, y, "E1")]), "Simple allumage"),
  double: () => cadre(`${point(330, 120)}${fil(330, 50, 330, 120)}${fil(330, 120, 570, 120)}
    ${fil(330, 120, 330, 170)}${contact(330, 170, "S1 (gauche)")}${fil(330, 240, 330, 300)}${lampe(330, 300, "E1 plafonnier")}${fil(330, 370, 330, 470)}
    ${fil(570, 120, 570, 170)}${contact(570, 170, "S1 (droite)")}${fil(570, 240, 570, 300)}${lampe(570, 300, "E2 appliques")}${fil(570, 370, 570, 470)}${point(330, 470)}${point(570, 470)}`, "Double allumage", "les deux contacts de l'interrupteur double partent de la même borne commune (L)"),
  deuxLampes: () => cadre(`${fil(450, 50, 450, 110)}${contact(450, 110, "S1")}${fil(450, 180, 450, 240)}${point(450, 240)}${fil(330, 240, 570, 240)}
    ${fil(330, 240, 330, 280)}${lampe(330, 280, "E1")}${fil(330, 350, 330, 470)}${fil(570, 240, 570, 280)}${lampe(570, 280, "E2")}${fil(570, 350, 570, 470)}${point(450, 50)}${point(330, 470)}${point(570, 470)}`, "Deux lampes, un interrupteur", "les deux lampes sont en parallèle, derrière le même interrupteur"),
  prise: () => cadre(branche(450, [(x, y) => contact(x, y, "S1"), (x, y) => prise(x, y, "X1 prise commandée")]), "Prise commandée"),
  vav: () => cadre(`${point(450, 50)}${fil(450, 50, 450, 90)}${inverseur(450, 90, "S1")}${fil(428, 160, 428, 200)}${fil(472, 160, 472, 200)}
    ${t(400, 190, "navettes", 11, 700, "#555", "end")}${inverseur(450, 200, "S2", false)}${fil(450, 270, 450, 320)}${lampe(450, 320, "E1")}${fil(450, 390, 450, 470)}${point(450, 470)}`, "Va-et-vient"),
  vav2: () => cadre(`${point(450, 50)}${fil(450, 50, 450, 90)}${inverseur(450, 90, "S1")}${fil(428, 160, 428, 200)}${fil(472, 160, 472, 200)}${inverseur(450, 200, "S2", false)}
    ${fil(450, 270, 450, 300)}${point(450, 300)}${fil(330, 300, 570, 300)}${fil(330, 300, 330, 330)}${lampe(330, 330, "E1")}${fil(330, 400, 330, 470)}${fil(570, 300, 570, 330)}${lampe(570, 330, "E2")}${fil(570, 400, 570, 470)}${point(330, 470)}${point(570, 470)}`, "Va-et-vient, deux lampes"),
  perm: () => cadre(`${point(450, 50)}${fil(450, 50, 450, 70)}${inverseur(450, 70, "S1")}${fil(428, 140, 428, 160)}${fil(472, 140, 472, 160)}${permutateur(450, 160, "S2")}
    ${fil(428, 230, 428, 250)}${fil(472, 230, 472, 250)}${inverseur(450, 250, "S3", false)}${fil(450, 320, 450, 350)}${lampe(450, 350, "E1")}${fil(450, 420, 450, 470)}${point(450, 470)}`, "Va-et-vient et permutateur"),
  perm2: () => cadre(`${point(450, 50)}${fil(450, 50, 450, 60)}${inverseur(450, 60, "S1")}${fil(428, 130, 428, 140)}${fil(472, 130, 472, 140)}${permutateur(450, 140, "S2")}
    ${fil(428, 210, 428, 220)}${fil(472, 210, 472, 220)}${permutateur(450, 220, "S3")}${fil(428, 290, 428, 300)}${fil(472, 290, 472, 300)}${inverseur(450, 300, "S4", false)}
    ${fil(450, 370, 450, 385)}${lampe(450, 385, "E1")}${fil(450, 455, 450, 470)}${point(450, 470)}`, "Deux permutateurs : quatre points de commande"),
  tl: (n = 2) => {
    const xs = n === 2 ? [180, 300] : [140, 240, 340];
    let s = `${xs.map((x, i) => `${point(x, 50)}${fil(x, 50, x, 120)}${contact(x, 120, `S${i + 1}`, true)}${fil(x, 190, x, 250)}`).join("")}
      ${fil(xs[0], 250, xs[xs.length - 1], 250)}${xs.map((x) => point(x, 250)).join("")}${fil(xs[0], 250, xs[0], 290)}${t(xs[0] + 40, 244, "en parallèle", 11, 700, "#555", "start")}
      ${bobine(xs[0], 290, "KA1 bobine")}${fil(xs[0], 360, xs[0], 470)}${point(xs[0], 470)}
      ${point(640, 50)}${fil(640, 50, 640, 160)}${contact(640, 160, "KA1 (1-2)", "lien")}${fil(640, 230, 640, 300)}${lampe(640, 300, "E1")}${fil(640, 370, 640, 470)}${point(640, 470)}
      <path d="M${xs[0] + 20} 325 C 400 325 560 200 618 195" stroke="${ENCRE}" stroke-width="1.5" stroke-dasharray="5 4" fill="none"/>`;
    return cadre(s, `Télérupteur, ${n} boutons-poussoirs`, "la bobine A1-A2 commande le contact 1-2 (liaison en pointillé)");
  },
  minuterie: () => cadre(`${[180, 300].map((x, i) => `${point(x, 50)}${fil(x, 50, x, 120)}${contact(x, 120, `S${i + 1}`, true)}${fil(x, 190, x, 250)}`).join("")}
    ${fil(180, 250, 300, 250)}${point(180, 250)}${point(300, 250)}${fil(180, 250, 180, 290)}
    <rect x="150" y="290" width="580" height="80" rx="8" fill="#fff" stroke="${ENCRE}" stroke-width="2.4"/>${t(440, 322, "MINUTERIE KA1", 14, 800)}${t(440, 344, "bornes : L, N, BP (retour boutons), sortie lampe", 11, 600, "#555")}
    ${point(640, 50)}${fil(640, 50, 640, 290)}${t(650, 160, "L", 12, 800, ROUGE, "start")}${fil(720, 370, 720, 470)}${t(730, 420, "N", 12, 800, BLEU, "start")}
    ${fil(560, 370, 560, 400)}${lampe(560, 400, "E1")}<path d="M560 470 V470" />${point(720, 470)}
    ${t(568, 386, "sortie", 10, 700, "#555", "start")}`, "Minuterie", "la minuterie a besoin de la phase et du neutre ; elle ferme sa sortie pendant la durée réglée"),
  detecteur: () => cadre(`${point(450, 50)}${fil(450, 50, 450, 120)}
    <rect x="370" y="120" width="160" height="90" rx="8" fill="#fff" stroke="${ENCRE}" stroke-width="2.4"/>${t(450, 150, "DÉTECTEUR B1", 13, 800)}${t(450, 172, "L · N · sortie", 11, 600, "#555")}
    ${fil(510, 210, 510, 470)}${t(520, 330, "N (alimentation du détecteur)", 11, 700, BLEU, "start")}${point(510, 470)}
    ${fil(400, 210, 400, 300)}${lampe(400, 300, "E1")}${fil(400, 370, 400, 470)}${point(400, 470)}${t(392, 250, "sortie", 10, 700, "#555", "end")}`, "Détecteur de présence", "le détecteur s'alimente entre L et N, sa sortie renvoie la phase à la lampe"),
  hc: () => cadre(`${point(200, 50)}${fil(200, 50, 200, 120)}${contact(200, 120, "C1-C2 (compteur)")}${fil(200, 190, 200, 250)}${bobine(200, 250, "KM1 bobine")}${fil(200, 320, 200, 470)}${point(200, 470)}
    ${t(200, 100, "commande (2 A)", 11, 700, "#555")}
    ${point(600, 50)}${fil(600, 50, 600, 120)}${contact(600, 120, "KM1 (1-2)", "lien")}${fil(600, 190, 600, 250)}${resistance(600, 250, "chauffe-eau")}${fil(600, 320, 600, 360)}
    ${contact(600, 360, "KM1 (3-4)", "lien").replace(/y=/g, "y=")}${fil(600, 430, 600, 470)}${point(600, 470)}${t(600, 100, "puissance (20 A)", 11, 700, "#555")}
    <path d="M220 285 C 380 285 480 160 578 155" stroke="${ENCRE}" stroke-width="1.5" stroke-dasharray="5 4" fill="none"/>`, "Contacteur heures creuses", "la phase et le neutre du chauffe-eau traversent les deux contacts de puissance"),
};
