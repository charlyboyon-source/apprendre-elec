// Vues de l'intervention « bureaux » : open space, boutons-poussoirs, faux plafond.
import { texte, vis, conducteur, cuivre, cadreCliquable } from "../commun.js";

/* ---------- Open space, en fin d'après-midi d'hiver ---------- */
// Faux plafond en perspective : colonnes fuyantes vers le fond, rangées de dalles.
const X = (i, y) => i * 100 + (600 + (i * 100 - 600) * 0.53 - i * 100) * (y / 170);
const RANGS = [[0, 52], [52, 92], [92, 122], [122, 146], [146, 170]];
const cellule = (i, r) => { const [y0, y1] = RANGS[r]; return [X(i, y0), y0, X(i + 1, y0), y0, X(i + 1, y1), y1, X(i, y1), y1]; };
const DALLES = {
  d1: [cellule(3, 2), cellule(5, 4), cellule(6, 3)],
  d2: [cellule(8, 2)],
  d3: [cellule(2, 0), cellule(9, 0)],
};
function dalle(pts, allumee) {
  const p = pts.join(",");
  return `<polygon points="${p}" fill="${allumee ? "#fffdf2" : "#c9ccd0"}" stroke="#9ea4aa" stroke-width="2"/>
    ${allumee ? `<polygon points="${p}" fill="#fff6c9" opacity=".6"/>` : ""}`;
}
function bureau(x, y, k, ecran = true) {
  const w = 190 * k, h = 70 * k;
  return `<g>
    <polygon points="${x},${y} ${x + w},${y} ${x + w + 30 * k},${y + h} ${x - 30 * k},${y + h}" fill="#e7e1d6" stroke="#b9b0a0"/>
    <rect x="${x - 26 * k}" y="${y + h}" width="${w + 52 * k}" height="${10 * k}" fill="#cfc6b6"/>
    <rect x="${x - 20 * k}" y="${y + h + 10 * k}" width="${8 * k}" height="${70 * k}" fill="#8d939a"/><rect x="${x + w + 12 * k}" y="${y + h + 10 * k}" width="${8 * k}" height="${70 * k}" fill="#8d939a"/>
    ${ecran ? `<rect x="${x + w * 0.3}" y="${y - 62 * k}" width="${86 * k}" height="${54 * k}" rx="${3 * k}" fill="#1b2029"/><rect x="${x + w * 0.3 + 4 * k}" y="${y - 58 * k}" width="${78 * k}" height="${44 * k}" fill="#33557d"/>
    <rect x="${x + w * 0.3 + 38 * k}" y="${y - 8 * k}" width="${10 * k}" height="${10 * k}" fill="#555"/>` : ""}
    <ellipse cx="${x + w * 0.55}" cy="${y + h + 70 * k}" rx="${34 * k}" ry="${10 * k}" fill="#2b2f36" opacity=".5"/>
    <rect x="${x + w * 0.45}" y="${y + h + 8 * k}" width="${42 * k}" height="${52 * k}" rx="${8 * k}" fill="#3b4a5e"/>
  </g>`;
}
export function vueOpenSpace(e, allume) {
  const nuit = allume.d1 || allume.d2 || allume.d3 ? 0.12 : 0.55;
  let s = `<rect width="1200" height="750" fill="#e9e6df"/>
  <polygon points="0,0 1200,0 920,170 280,170" fill="#e2e4e6"/>
  <polygon points="0,0 280,170 280,520 0,750" fill="#d9d4ca"/>
  <polygon points="1200,0 920,170 920,520 1200,750" fill="#d5d0c6"/>
  <rect x="280" y="170" width="640" height="350" fill="#ece8e0"/>
  <polygon points="0,750 1200,750 920,520 280,520" fill="#7d8691"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => `<path d="M${i * 100} 750 L${600 + (i * 100 - 600) * 0.55} 520" stroke="#6c747e" stroke-width="1.2" opacity=".6"/>`).join("")}
  ${[555, 600, 660, 740].map((y) => `<path d="M0 ${y} H1200" stroke="#6c747e" stroke-width="1" opacity=".35"/>`).join("")}
  <!-- grille du faux plafond -->
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => `<path d="M${X(i, 0)} 0 L${X(i, 170)} 170" stroke="#bfc4c9" stroke-width="2"/>`).join("")}
  ${RANGS.map(([, y]) => `<path d="M${X(0, y)} ${y} H${X(12, y)}" stroke="#bfc4c9" stroke-width="2"/>`).join("")}`;
  for (const [g, liste] of Object.entries(DALLES)) for (const p of liste) s += dalle(p, allume[g]);
  // fenêtres du fond (nuit d'hiver qui tombe)
  s += [320, 520, 720].map((x) => `<rect x="${x}" y="215" width="160" height="150" fill="#22345e"/><rect x="${x}" y="215" width="160" height="150" fill="none" stroke="#c8ccd1" stroke-width="8"/><path d="M${x + 80} 215 V365" stroke="#c8ccd1" stroke-width="5"/>`).join("");
  s += `<circle cx="438" cy="250" r="3" fill="#ffe9a8"/><circle cx="600" cy="288" r="2" fill="#ffe9a8"/><circle cx="790" cy="262" r="3" fill="#ffe9a8"/>`;
  // porte du local technique au fond
  s += `<rect x="868" y="300" width="46" height="220" fill="#9aa2aa"/><rect x="872" y="304" width="38" height="212" fill="#b4bbc2"/><rect x="876" y="330" width="30" height="16" rx="2" fill="#f6f2e4"/>${texte(891, 342, "TECH", 9, 800, "#333")}`;
  // bureaux
  s += bureau(390, 430, 0.75) + bureau(640, 430, 0.75) + bureau(200, 540, 1.05) + bureau(760, 540, 1.05, true);
  s += texte(905, 712, "bureau de Julien", 14, 800, "#2b2f34");
  // cloison vitrée de la salle de réunion (à droite)
  s += `<polygon points="1010,95 1200,0 1200,750 1010,600" fill="#bcd3e0" opacity=".45"/><path d="M1010 95 V600 M1105 47 V675" stroke="#8c99a3" stroke-width="5"/>
    ${texte(1100, 300, "Salle de réunion", 16, 800, "#2e4757", "middle", 'transform="rotate(-4 1100 300)"')}`;
  s += `<rect x="1028" y="352" width="26" height="30" rx="3" fill="#fbfaf7" stroke="#aab0b5"/><rect x="1034" y="358" width="14" height="18" rx="2" fill="#fff" stroke="#c5c8ca"/>`;
  // entrée et bouton de l'accueil (à gauche)
  s += `<polygon points="50,170 170,230 170,560 50,620" fill="#8a6a4c"/><polygon points="58,178 162,234 162,552 58,608" fill="#a07c58"/><circle cx="150" cy="400" r="7" fill="#d9c58c"/>`;
  s += `<rect x="196" y="370" width="24" height="28" rx="3" fill="#fbfaf7" stroke="#aab0b5"/><rect x="202" y="376" width="12" height="16" rx="2" fill="#fff" stroke="#c5c8ca"/>`;
  s += texte(110, 160, "Accueil", 16, 800, "#3b3f44");
  s += `<rect width="1200" height="750" fill="#0b1428" opacity="${nuit}" pointer-events="none"/>`;
  s += `<g class="zone" data-geste="bp:1" role="button" tabindex="0" aria-label="Appuyer sur le bouton de l'accueil"><rect x="190" y="364" width="36" height="40" fill="transparent"/></g>`;
  s += `<g class="zone" data-geste="bp:2" role="button" tabindex="0" aria-label="Appuyer sur le bouton de la salle de réunion"><rect x="1022" y="346" width="38" height="42" fill="transparent"/></g>`;
  s += cadreCliquable(176, 350, 64, 66, `data-aller="bp1"`, "Bouton accueil");
  s += cadreCliquable(1012, 334, 60, 66, `data-aller="bp2"`, "Bouton réunion");
  s += cadreCliquable(X(8, 92) - 6, 86, X(9, 122) - X(8, 92) + 12, 42, `data-aller="plafond"`, "Faux plafond (escabeau)");
  s += cadreCliquable(860, 292, 62, 236, `data-aller="tableau"`, "Local technique");
  return s;
}

/* ---------- Bouton-poussoir, de près ---------- */
export function vueBP(e, n) {
  const etape = e["bp" + n + "Etape"];
  const appuye = e.app["bp" + n] || (n === 2 && e.app.bp2Bloque);
  const vitre = n === 2;
  let s = vitre
    ? `<rect width="1200" height="750" fill="#c9dbe6"/><rect x="0" y="0" width="420" height="750" fill="#e6e2da"/><rect x="408" y="0" width="22" height="750" fill="#8c99a3"/>
       <rect x="440" y="0" width="760" height="750" fill="#bcd3e0" opacity=".6"/>${texte(820, 120, "Salle de réunion", 28, 800, "#2e4757")}`
    : `<rect width="1200" height="750" fill="#e8e3da"/><rect x="0" y="0" width="140" height="750" fill="#a07c58"/>`;
  // prise de courant voisine (référence de terre)
  const px = 270, py = 520;
  s += `<g filter="url(#f-ombre)"><rect x="${px - 95}" y="${py - 95}" width="190" height="190" rx="22" fill="url(#g-blanc)" stroke="#cfc9bd" stroke-width="2"/>
    <circle cx="${px}" cy="${py}" r="66" fill="#f1efea" stroke="#c8c1b4" stroke-width="2"/></g>
    <circle cx="${px - 27}" cy="${py + 7}" r="10" fill="#2d2d2d"/><circle cx="${px + 27}" cy="${py + 7}" r="10" fill="#2d2d2d"/>
    <rect x="${px - 9}" y="${py - 53}" width="18" height="30" rx="5" fill="url(#g-acier)" stroke="#6d757d"/>
    <g class="vis" data-vis="prise${n}-terre" role="button" tabindex="0" aria-label="broche de terre de la prise voisine"><circle cx="${px}" cy="${py - 38}" r="24" fill="transparent"/></g>`;
  if (etape === 0) {
    s += `<g filter="url(#f-ombre)"><rect x="170" y="140" width="200" height="200" rx="20" fill="url(#g-blanc)" stroke="#cfc9bd" stroke-width="2"/>
      <rect x="215" y="${appuye ? 192 : 185}" width="110" height="110" rx="12" fill="${appuye ? "#ecebe6" : "#fff"}" stroke="#d6d0c4" stroke-width="2"/>
      <circle cx="270" cy="${appuye ? 247 : 240}" r="16" fill="none" stroke="#b9b3a7" stroke-width="3"/><path d="M262 ${appuye ? 247 : 240} h16 M270 ${appuye ? 239 : 232} v16" stroke="#b9b3a7" stroke-width="3"/></g>`;
    s += `<g class="zone" data-geste="bp:${n}" role="button" tabindex="0" aria-label="Appuyer sur le bouton"><rect x="215" y="185" width="110" height="110" fill="transparent"/></g>`;
    s += cadreCliquable(160, 130, 220, 220, `data-geste="demonterBP:${n}"`, "Déclipser et sortir le bouton-poussoir", 24);
    s += cadreCliquable(860, 250, 310, 56, `data-geste="maintenir:${n}"`, e.app["bp" + n] ? "Dire à Mme Roussel de relâcher" : "Faire tenir le bouton par Mme Roussel");
  } else {
    const loose = e.loose === `bp${n}-S`;
    s += `<circle cx="270" cy="240" r="96" fill="#cfc4ae"/><circle cx="270" cy="240" r="84" fill="url(#g-trou)"/>
      <path d="M252 190 C 250 230 256 262 262 290" stroke="url(#g-gaine)" stroke-width="28" fill="none" stroke-linecap="round"/>`;
    s += `<g filter="url(#f-ombre)"><rect x="560" y="150" width="300" height="380" rx="16" fill="#ecebe7" stroke="#a9adb1" stroke-width="2"/>
      <rect x="600" y="${appuye ? 196 : 186}" width="220" height="190" rx="12" fill="${appuye ? "#ecebe6" : "#fbfbf9"}" stroke="#c9cbcc" stroke-width="2"/>
      ${texte(710, appuye ? 300 : 290, appuye ? "enfoncé" : "au repos", 18, 800, "#9aa0a6")}
      <rect x="580" y="410" width="260" height="100" rx="10" fill="#dcdcd7" stroke="#b9bbbd"/>
      <rect x="604" y="426" width="72" height="54" rx="6" fill="#c9c9c3"/><rect x="744" y="426" width="72" height="54" rx="6" fill="#c9c9c3"/></g>`;
    s += conducteur("M248 286 C 250 470 610 620 640 540 L640 480", "phase", 10) + cuivre(640, 466, 16, 90, 6);
    s += loose ? conducteur("M262 290 C 330 470 800 650 790 548 L784 508", "blanc", 10) + cuivre(784, 492, 18, 100, 6)
               : conducteur("M262 290 C 330 470 790 640 780 540 L780 480", "blanc", 10) + cuivre(780, 466, 16, 90, 6);
    s += vis(640, 453, 15, { id: `bp${n}-E`, rot: 30, label: "borne d'arrivée du bouton-poussoir" });
    s += vis(780, 453, 15, { id: `bp${n}-S`, rot: loose ? 75 : 30, label: "borne de retour du bouton-poussoir" });
    s += texte(640, 540, "arrivée", 14, 800) + texte(780, 540, "retour", 14, 800);
    s += `<g class="zone" data-geste="bp:${n}" role="button" tabindex="0" aria-label="Appuyer sur le bouton"><rect x="600" y="186" width="220" height="190" fill="transparent"/></g>`;
    s += cadreCliquable(900, 250, 270, 56, `data-geste="maintenir:${n}"`, e.app["bp" + n] ? "Relâcher le bouton" : "Maintenir le bouton enfoncé");
    s += cadreCliquable(900, 30, 270, 50, `data-geste="remonterBP:${n}"`, "Remettre le bouton en place");
  }
  s += cadreCliquable(24, 640, 170, 56, `data-aller="openspace"`, "Retour à l'open space");
  return s;
}

/* ---------- Faux plafond : boîte de dérivation et driver de la dalle ---------- */
function wago(x, y, id, coul, label, sorti) {
  return `<g filter="url(#f-ombre-p)"><rect x="${x - 42}" y="${y - 26}" width="84" height="52" rx="6" fill="#e9eef2" fill-opacity=".85" stroke="#8d969e" stroke-width="1.5"/>
    ${[0, 1, 2].map((i) => `<rect x="${x - 36 + i * 26}" y="${y - 36}" width="20" height="16" rx="3" fill="#f28c1e" stroke="#b05d07"/>`).join("")}</g>
    ${[0, 2].map((i) => (sorti && i === 2 ? "" : `<rect x="${x - 32 + i * 26}" y="${y - 8}" width="12" height="22" rx="3" fill="url(#g-cuivre)" opacity=".85"/>`)).join("")}
    ${vis(x, y + 40, 10, { id, laiton: false, rot: 0, label })}`;
}
export function vuePlafond(e, allume) {
  const etape = e.plafond;
  let s = `<rect width="1200" height="750" fill="#d9dcdf"/>`;
  // grille de dalles vue d'en dessous
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
    const x = i * 200, y = j * 200 - 20;
    s += `<rect x="${x + 4}" y="${y + 4}" width="192" height="192" fill="#eceeef" stroke="#b3b8bd" stroke-width="8"/>`;
    s += `<rect x="${x + 4}" y="${y + 4}" width="192" height="192" fill="url(#p-crepi)"/>`;
  }
  // la dalle LED au-dessus du bureau de Julien
  s += `<rect x="604" y="384" width="192" height="192" fill="${allume.d2 ? "#fffdf2" : "#d4d7da"}" stroke="#9aa1a8" stroke-width="8"/>${texte(700, 600, "dalle LED (bureau de Julien)", 14, 700, "#3b3f44")}`;
  if (etape === 0) {
    s += cadreCliquable(404, 184, 192, 192, `data-geste="souleverDalle"`, "Soulever la dalle de faux plafond", 4);
  } else {
    // ouverture dans le faux plafond : le plénum
    s += `<rect x="200" y="140" width="800" height="440" rx="6" fill="#2f3439"/>
      <rect x="200" y="140" width="800" height="40" fill="#3b4147"/>
      <rect x="230" y="200" width="740" height="24" fill="#6f7780"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<rect x="${240 + i * 62}" y="200" width="6" height="24" fill="#59616a"/>`).join("")}`;
    s += texte(600, 170, "plénum du faux plafond (au-dessus des dalles)", 14, 700, "#cfd5da");
    // boîte de dérivation
    const ouverte = etape === 2;
    s += `<g filter="url(#f-ombre)"><rect x="260" y="260" width="380" height="260" rx="10" fill="#9aa1a8"/><rect x="272" y="272" width="356" height="236" rx="8" fill="${ouverte ? "#55606a" : "#b3bac1"}"/></g>`;
    // arrivée dans la boîte : retour lampe, neutre, terre
    s += `<rect x="226" y="290" width="40" height="52" rx="6" fill="#7d858e"/>`;
    if (ouverte) {
      const nSorti = e.loose === "boite-N";
      s += conducteur("M246 300 C 300 300 334 300 334 346", "retour", 8);
      s += conducteur("M246 316 C 380 316 444 300 444 346", "neutre", 8);
      s += conducteur("M246 332 C 480 332 554 300 554 346", "terre", 8);
      s += wago(360, 380, "boite-L", "retour", "connecteur du retour lampe", false);
      s += wago(470, 380, "boite-N", "neutre", "connecteur du neutre", nSorti);
      s += wago(580, 380, "boite-T", "terre", "connecteur de terre", false);
      s += conducteur("M386 410 C 400 480 700 480 830 382", "retour", 8);
      s += nSorti ? conducteur("M520 446 C 600 490 760 490 860 382", "neutre", 8) + cuivre(519, 446, 16, 210, 6)
                  : conducteur("M496 410 C 520 490 760 490 860 382", "neutre", 8);
      s += conducteur("M606 410 C 640 500 820 500 890 382", "terre", 8);
      s += texte(470, 304, "connecteurs à levier", 13, 700, "#e8ecef");
      s += texte(470, 476, "points de test sous les connecteurs", 11, 600, "#cfd5da");
      s += cadreCliquable(860, 30, 300, 50, `data-geste="fermerBoite"`, "Refermer la boîte");
    } else {
      s += texte(450, 400, "boîte de dérivation", 16, 800, "#4b5157");
      s += conducteur("M600 450 C 680 470 760 470 830 382", "retour", 8) + conducteur("M600 462 C 690 482 790 482 860 382", "neutre", 8) + conducteur("M600 474 C 700 494 820 494 890 382", "terre", 8);
      s += cadreCliquable(262, 262, 376, 256, `data-geste="ouvrirBoite"`, "Ouvrir la boîte de dérivation", 8);
      s += cadreCliquable(860, 30, 300, 50, `data-geste="reposerDalle"`, "Reposer la dalle");
    }
    s += `<g filter="url(#f-ombre)"><rect x="790" y="300" width="180" height="110" rx="8" fill="#f4f4f1" stroke="#a7acb0" stroke-width="2"/></g>
      ${texte(880, 324, "DRIVER LED", 13, 800)}${texte(880, 340, "entrée 230 V~", 11, 600, "#555")}${texte(880, 354, "sortie 36 V⎓", 11, 600, "#555")}`;
    s += vis(830, 388, 11, { id: "drv-L", rot: 30, label: "entrée L du driver" }) + vis(860, 388, 11, { id: "drv-N", rot: 30, label: "entrée N du driver" }) + vis(890, 388, 11, { id: "drv-T", rot: 30, label: "terre du driver" });
    s += texte(830, 412, "L", 11, 800) + texte(860, 412, "N", 11, 800) + texte(890, 412, "⏚", 12, 800);
  }
  s += cadreCliquable(24, 640, 200, 56, `data-aller="openspace"`, "Descendre de l'escabeau");
  return s;
}
