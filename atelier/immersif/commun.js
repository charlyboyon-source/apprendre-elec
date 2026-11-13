// Pièces de dessin communes à toutes les interventions (SVG, 1200 × 750).
// Chaque fonction reçoit l'état du jeu et renvoie le SVG de la vue.
// Éléments cliquables : data-aller (changer de vue), data-geste (action), data-vis (vis ou borne mesurable).

export const W = 1200, H = 750;
const C = { blanc: "#f4f4f2", phase: "#c8322a", retour: "#ec8a1d", neutre: "#2e6bc9", terre: "#3d9a3d", cuivre: "#c87b3a" };

export const DEFS = `
<defs>
  <linearGradient id="g-laiton" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc8c"/><stop offset=".55" stop-color="#cfa23f"/><stop offset="1" stop-color="#8a6416"/></linearGradient>
  <linearGradient id="g-acier" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f4f6"/><stop offset=".5" stop-color="#b9c0c7"/><stop offset="1" stop-color="#7d868f"/></linearGradient>
  <linearGradient id="g-blanc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6e7e4"/></linearGradient>
  <linearGradient id="g-module" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9eaea"/><stop offset=".12" stop-color="#ffffff"/><stop offset=".88" stop-color="#f7f7f6"/><stop offset="1" stop-color="#d9dbdb"/></linearGradient>
  <linearGradient id="g-cuivre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0b47a"/><stop offset=".5" stop-color="#c8763a"/><stop offset="1" stop-color="#8e4d1e"/></linearGradient>
  <linearGradient id="g-murfond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ebe1cd"/><stop offset="1" stop-color="#ddd0b8"/></linearGradient>
  <linearGradient id="g-murg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cdbfa5"/><stop offset="1" stop-color="#ddd1bb"/></linearGradient>
  <linearGradient id="g-murd" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#c8b99e"/><stop offset="1" stop-color="#d9ccb4"/></linearGradient>
  <linearGradient id="g-plafond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4efe6"/><stop offset="1" stop-color="#e9e2d5"/></linearGradient>
  <linearGradient id="g-parquet" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#a87a4c"/><stop offset="1" stop-color="#c39a6b"/></linearGradient>
  <linearGradient id="g-nuit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1b3a"/><stop offset="1" stop-color="#2a3d68"/></linearGradient>
  <linearGradient id="g-abat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9cdb3"/><stop offset=".5" stop-color="#f3ead6"/><stop offset="1" stop-color="#cbbd9f"/></linearGradient>
  <linearGradient id="g-coffret" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfa"/><stop offset="1" stop-color="#e8e9e8"/></linearGradient>
  <linearGradient id="g-gaine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6f777f"/><stop offset=".5" stop-color="#a3abb3"/><stop offset="1" stop-color="#6f777f"/></linearGradient>
  <linearGradient id="g-bois" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b98a5c"/><stop offset="1" stop-color="#946840"/></linearGradient>
  <radialGradient id="g-lumiere" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#fff2c4" stop-opacity=".9"/><stop offset=".45" stop-color="#ffdf8a" stop-opacity=".35"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
  <radialGradient id="g-ampoule" cx=".45" cy=".4"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#fff3b8"/><stop offset="1" stop-color="#ffd24d"/></radialGradient>
  <radialGradient id="g-trou" cx=".5" cy=".5"><stop offset="0" stop-color="#2c2925"/><stop offset=".75" stop-color="#4c463e"/><stop offset="1" stop-color="#857c6d"/></radialGradient>
  <filter id="f-ombre" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#1b1408" flood-opacity=".32"/></filter>
  <filter id="f-ombre-p" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#1b1408" flood-opacity=".35"/></filter>
  <filter id="f-grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .38  0 0 0 .07 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  <pattern id="p-crepi" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#000" opacity=".04"/><circle cx="4" cy="3.5" r=".5" fill="#fff" opacity=".18"/></pattern>
</defs>`;

/* ---------- Petites pièces ---------- */
export function vis(x, y, r = 14, opts = {}) {
  const { id, laiton = true, rot = 20, label } = opts;
  const g = `<circle cx="${x}" cy="${y}" r="${r + 3}" fill="#3b3f44" opacity=".35"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#g-${laiton ? "laiton" : "acier"})" stroke="${laiton ? "#6d4f12" : "#5d656d"}" stroke-width="1.6"/>
    <g transform="rotate(${rot} ${x} ${y})"><rect x="${x - r * 0.72}" y="${y - r * 0.13}" width="${r * 1.44}" height="${r * 0.26}" rx="1.5" fill="${laiton ? "#5e430c" : "#4b535b"}"/></g>
    <circle cx="${x - r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.22}" fill="#fff" opacity=".55"/>`;
  return id ? `<g class="vis" data-vis="${id}" role="button" tabindex="0" aria-label="${label || id}"><circle cx="${x}" cy="${y}" r="${Math.max(26, r + 12)}" fill="transparent"/>${g}</g>` : g;
}
// Conducteur isolé : chemin + reflet ; terre en vert/jaune.
export function conducteur(d, couleur, larg = 9) {
  if (couleur === "terre") return `<path d="${d}" fill="none" stroke="#3d9a3d" stroke-width="${larg}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="#e8cf2c" stroke-width="${larg}" stroke-dasharray="${larg * 1.6} ${larg * 1.6}" stroke-linecap="butt" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="${larg * 0.25}" transform="translate(-${larg * 0.2} -${larg * 0.2})"/>`;
  const c = C[couleur] || couleur;
  const contour = couleur === "blanc" ? `<path d="${d}" fill="none" stroke="#8c9196" stroke-width="${larg + 2}" stroke-linecap="round" stroke-linejoin="round"/>` : "";
  return contour + `<path d="${d}" fill="none" stroke="${c}" stroke-width="${larg}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="${larg * 0.25}" stroke-linecap="round" transform="translate(-${larg * 0.18} -${larg * 0.18})"/>`;
}
// Âme de cuivre dénudée (x,y = début, vers la direction donnée)
export function cuivre(x, y, long, angle = 90, larg = 6) {
  return `<g transform="rotate(${angle - 90} ${x} ${y})"><rect x="${x - larg / 2}" y="${y}" width="${larg}" height="${long}" rx="${larg / 2}" fill="url(#g-cuivre)"/></g>`;
}
export function texte(x, y, t, taille = 14, poids = 600, coul = "#2b2f34", ancre = "middle", extra = "") {
  return `<text x="${x}" y="${y}" font-size="${taille}" font-weight="${poids}" fill="${coul}" text-anchor="${ancre}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" ${extra}>${t}</text>`;
}
export function cadreCliquable(x, y, w, h, attr, label, rx = 14) {
  return `<g class="zone" ${attr} role="button" tabindex="0" aria-label="${label}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#fff" fill-opacity="0" stroke="#f2c230" stroke-width="3" stroke-dasharray="9 7" class="zone-cadre"/>
    <g class="zone-etiquette"><rect x="${x + w / 2 - label.length * 4.6 - 14}" y="${y + h + 8}" width="${label.length * 9.2 + 28}" height="30" rx="15" fill="#1d2228" fill-opacity=".9"/>
    ${texte(x + w / 2, y + h + 28, label, 15, 700, "#fff")}</g>
  </g>`;
}

/* ---------- Tableau modulaire générique ---------- */
// cfg.rangees : listes d'appareils { cle, type: "id" | "dj" | "tl", ... } ; cfg.relies : clés dont les vis sont mesurables.
export const MOD = 82;
const HT = 250;
const LIGNES = [96, 438];
function appareil(a, x, y, w, haut, actif = true) {
  const id = a.type === "id", tl = a.type === "tl";
  const cx = x + w / 2;
  const visH = [x + 18, x + w - 18];
  const manY = haut ? y + 92 : y + 128;
  let s = `<g filter="url(#f-ombre-p)">
    <rect x="${x}" y="${y}" width="${w}" height="${HT}" rx="7" fill="url(#g-module)" stroke="#b5b8b8" stroke-width="1.5"/>
    <rect x="${x + 4}" y="${y + 44}" width="${w - 8}" height="${HT - 88}" rx="4" fill="${tl ? "#f3f6fb" : "#fbfbfa"}" stroke="#dcdedd"/>
  </g>`;
  s += visH.map((vx) => `<rect x="${vx - 13}" y="${y + 8}" width="26" height="28" rx="4" fill="#3a3f45"/>`).join("");
  s += visH.map((vx) => `<rect x="${vx - 13}" y="${y + HT - 36}" width="26" height="28" rx="4" fill="#3a3f45"/>`).join("");
  if (id) {
    s += texte(cx, y + 64, a.haut, 17, 800, "#22262b") + texte(cx, y + 82, a.ligne2, 12, 700, "#2e6bc9");
    s += `<rect x="${x + 12}" y="${y + 176}" width="30" height="20" rx="3" fill="none" stroke="#2b2f34" stroke-width="1.5"/>${texte(x + 27, y + 191, a.typ, 13, 800)}`;
    s += `<circle cx="${x + w - 26}" cy="${y + 186}" r="11" fill="#f0c43a" stroke="#a37c09" stroke-width="1.5"/>${texte(x + w - 26, y + 191, "T", 12, 800)}`;
  } else if (tl) {
    s += texte(cx, y + 62, "TL", 18, 800, "#22262b") + texte(cx, y + 78, a.cal || "16 A", 11, 700, "#555");
    s += texte(cx, y + 186, "bobine", 9.5, 600, "#6b7178") + texte(cx, y + 198, "230V~", 9.5, 700, "#4b5157");
    s += texte(x + 18, y + 52, "A1", 10, 800, "#555") + texte(x + w - 18, y + 52, "1", 10, 800, "#555");
    s += texte(x + 18, y + HT - 42, "A2", 10, 800, "#555") + texte(x + w - 18, y + HT - 42, "2", 10, 800, "#555");
  } else {
    s += texte(cx, y + 64, a.cal, 19, 800, "#22262b");
    s += texte(cx, y + 186, "230V~", 10, 600, "#6b7178");
    s += `<rect x="${cx - 16}" y="${y + 192}" width="32" height="14" rx="2" fill="none" stroke="#6b7178"/>${texte(cx, y + 203, a.pdc || "4500", 9.5, 700, "#4b5157")}`;
    s += texte(x + 14, y + 104, "N", 11, 800, "#2e6bc9", "start");
  }
  s += `<g class="manette" ${actif ? `data-geste="manette:${a.cle}" role="button" tabindex="0" aria-label="${tl ? "Basculer à la main" : haut ? "Baisser" : "Remonter"} ${a.etiquette}"` : ""}>
    <rect x="${cx - 17}" y="${y + 86}" width="34" height="80" rx="6" fill="#2a2e33"/>
    <g class="t-levier" data-anim="man-${a.cle}"><rect x="${cx - 13}" y="${manY}" width="26" height="34" rx="5" fill="${id ? "#3567b5" : tl ? "#e9eef6" : "#f7f7f5"}" stroke="${id ? "#24497f" : "#7d8288"}" stroke-width="1.5"/></g>
    ${texte(cx, haut ? y + 160 : y + 98, haut ? "I" : "O", 11, 800, haut ? "#d23a2e" : "#7d8288")}
    ${actif ? `<rect x="${cx - 26}" y="${y + 80}" width="52" height="92" fill="transparent"/>` : ""}
  </g>`;
  if (!id) s += `<rect x="${cx - 7}" y="${y + 70}" width="14" height="5" rx="2" fill="${haut ? "#d23a2e" : "#3d9a3d"}"/>`;
  s += `<rect x="${x + 2}" y="${y - 50}" width="${w - 4}" height="40" rx="3" fill="#fffbe6" stroke="#d8cd9f"/>`;
  const mots = a.etiquette.split(" ");
  const l1 = mots.slice(0, Math.ceil(mots.length / 2)).join(" "), l2 = mots.slice(Math.ceil(mots.length / 2)).join(" ");
  s += texte(cx, y - 34, l1, 12.5, 700, "#33363a", "middle", 'font-style="italic"') + texte(cx, y - 18, l2, 12.5, 700, "#33363a", "middle", 'font-style="italic"');
  return s;
}
function fil(x, y, couleur, loose) {
  if (loose) return conducteur(`M${x + 4} ${y + 18} L${x + 6} ${y + 36} Q${x + 6} ${y + 46} ${x + 14} ${y + 50}`, couleur, 8) + cuivre(x + 3, y + 4, 14, 96, 5);
  return conducteur(`M${x} ${y + 6} L${x} ${y + 36} Q${x} ${y + 46} ${x + 8} ${y + 50}`, couleur, 8);
}
function filHaut(x, y, couleur) { return conducteur(`M${x} ${y - 6} L${x} ${y - 30} Q${x} ${y - 40} ${x - 8} ${y - 44}`, couleur, 8); }
export function vueTableau(e, cfg) {
  const relies = new Set(cfg.relies || []);
  let s = `<rect width="1200" height="750" fill="#e6dccb"/>
  <rect x="150" y="14" width="900" height="728" rx="16" fill="url(#g-coffret)" stroke="#b5b7b6" stroke-width="3" filter="url(#f-ombre)"/>
  <rect x="172" y="34" width="856" height="696" rx="8" fill="#eef0f0"/>`;
  cfg.rangees.forEach((rangee, r) => {
    const y = LIGNES[r];
    s += `<rect x="196" y="${y + HT / 2 - 9}" width="680" height="18" fill="#dde1e4"/>`;
    const largeur = rangee.reduce((t, a) => t + (a.type === "id" ? 2 * MOD : MOD) + 4, 0);
    const avecPeigne = rangee.filter((a) => a.type !== "tl");
    s += `<rect x="204" y="${y + 16}" width="${Math.min(largeur, avecPeigne.reduce((t, a) => t + (a.type === "id" ? 2 * MOD : MOD) + 4, 0)) + 16}" height="10" rx="3" fill="#c97b3d" opacity=".85"/>`;
    let x = 214;
    for (const a of rangee) {
      const w = a.type === "id" ? 2 * MOD : MOD;
      const haut = a.type === "tl" ? !!e.app[a.etat || a.cle] : e.app[a.cle] !== false;
      s += appareil(a, x, y, w, haut);
      const xs = [x + 18, x + w - 18], yb = y + HT - 22, yh = y + 22;
      const relie = relies.has(a.cle);
      const noms = a.type === "tl" ? [["A2", "neutre", "A1", "blanc"], ["2", "retour", "1", "phase"]] : [["N", "neutre"], ["L", "phase"]];
      noms.forEach(([k, coul, kh, coulh], i) => {
        const idv = `${a.cle}-${k}`;
        s += fil(xs[i], yb, coul, e.loose === idv);
        if (a.type === "tl") s += filHaut(xs[i], yh, coulh);
        s += vis(xs[i], yb, 11, { id: relie ? idv : null, rot: e.loose === idv ? 62 : 25, label: (cfg.noms && cfg.noms[idv]) || idv });
        const idh = a.type === "tl" ? `${a.cle}-${kh}` : `${a.cle}-amont-${k}`;
        s += vis(xs[i], yh, 11, { id: relie ? idh : null, rot: 25, label: (cfg.noms && cfg.noms[idh]) || idh });
      });
      x += w + 4;
    }
  });
  s += `<rect x="900" y="560" width="110" height="44" rx="6" fill="#e9ecee" stroke="#9aa1a8"/><rect x="908" y="572" width="94" height="20" rx="3" fill="url(#g-laiton)"/>`;
  s += conducteur("M1030 720 C 1020 650 1000 620 990 582", "terre", 9) + conducteur("M935 720 C 930 650 925 620 920 582", "terre", 9);
  s += vis(955, 582, 10, { id: "terre", laiton: true, label: "bornier de terre" });
  s += texte(955, 624, "bornier de terre", 13, 700, "#3b3f44");
  s += `<rect x="900" y="300" width="110" height="90" rx="8" fill="#f8f4e4" stroke="#d8cd9f"/>${texte(955, 326, "Schéma", 13, 800)}${texte(955, 346, "unifilaire", 12, 600)}${texte(955, 370, "dans la porte", 11, 500, "#666")}`;
  s += cfg.extra || "";
  s += cadreCliquable(24, 640, 110, 56, `data-aller="${cfg.retour}"`, "Refermer");
  return s;
}

/* ---------- Pointes de touche ---------- */
export function pointes(e) {
  const p = (q, coul, id) => `<g class="pointe" data-pointe="${id}" transform="translate(${q.x} ${q.y})">
      <rect class="t-manche" x="-34" y="-114" width="68" height="100" rx="14" fill="transparent"/>
      <path d="M0 0 L-5 -18 L5 -18 Z" fill="url(#g-acier)"/>
      <rect x="-10" y="-96" width="20" height="80" rx="8" fill="${coul}"/>
      <rect x="-14" y="-40" width="28" height="9" rx="3" fill="${id === "rouge" ? "#7d1b14" : "#000"}"/>
      <rect x="-5" y="-92" width="4" height="50" rx="2" fill="#fff" opacity=".25"/>
    </g>`;
  const cordon = (q, coul, xd) => `<path d="M${xd} 760 C ${xd} 690, ${q.x} ${q.y + 40}, ${q.x} ${q.y - 96}" fill="none" stroke="${coul}" stroke-width="8" stroke-linecap="round" opacity=".95"/>`;
  return `${cordon(e.noir, "#151515", 1130)}${cordon(e.rouge, "#b82a21", 1170)}${p(e.noir, "#1c1c1c", "noir")}${p(e.rouge, "#c8322a", "rouge")}`;
}

/* =====================================================================
   Nouveau moteur (jeu.js) : des cibles faites pour le doigt.
   Règles : toute zone touchable fait au moins CIBLE × CIBLE unités
   (≈ 46 px sur un téléphone de 390 px, où l'on montre une bande de
   540 unités de large) ; jamais une zone dans une autre ; ce qui compte
   est dessiné entre x = 330 et x = 870 (la bande visible sur téléphone).
   ===================================================================== */
export const CIBLE = 68;
// Zone touchable : cadre visible (pointillés), zone invisible agrandie au minimum, étiquette.
export function zone(x, y, w, h, attrs, label, opts = {}) {
  const lw = Math.max(w, CIBLE), lh = Math.max(h, CIBLE);
  const X = x - (lw - w) / 2, Y = y - (lh - h) / 2;
  const { etiquette = label, pos = "bas", rx = 14, cadre = true } = opts;
  let etiq = "";
  if (etiquette) {
    const lg = etiquette.length * 8.4 + 28;
    const ey = pos === "haut" ? y - 40 : pos === "dedans" ? y + h / 2 - 15 : y + h + 8;
    etiq = `<g class="t-etiq" pointer-events="none"><rect x="${x + w / 2 - lg / 2}" y="${ey}" width="${lg}" height="30" rx="15" fill="#1d2228" fill-opacity=".86"/>${texte(x + w / 2, ey + 20, etiquette, 14.5, 700, "#fff")}</g>`;
  }
  return `<g class="t-zone" ${attrs} role="button" tabindex="0" aria-label="${label}">
    ${cadre ? `<rect class="t-cadre" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>` : ""}
    <rect class="t-hit" x="${X}" y="${Y}" width="${lw}" height="${lh}" rx="${Math.min(rx, lw / 2)}" fill="transparent"/>${etiq}</g>`;
}
// Borne mesurable et serrable : la vis tourne quand on la serre (data-anim), grande zone ronde autour.
export function borne(x, y, r, id, label, opts = {}) {
  const { rot = 25, laiton = true } = opts;
  return `<g class="t-borne" data-vis="${id}" data-cx="${x}" data-cy="${y}" role="button" tabindex="0" aria-label="${label}">
    <circle class="t-hit" cx="${x}" cy="${y}" r="${Math.max(CIBLE / 2, r + 14)}" fill="transparent"/>
    <g class="t-tourne" data-anim="vis-${id}">${vis(x, y, r, { laiton, rot })}</g></g>`;
}
// Point de mesure sans vis (alvéole, broche) : même cible, pas de tournevis.
export function point(x, y, id, label) {
  return `<g class="t-borne" data-vis="${id}" data-cx="${x}" data-cy="${y}" role="button" tabindex="0" aria-label="${label}">
    <circle class="t-hit" cx="${x}" cy="${y}" r="${CIBLE / 2}" fill="transparent"/></g>`;
}
// Vis de fixation (geste) : on la touche, elle tourne et sort.
export function visFixation(x, y, r, geste, anim, label, presente = true) {
  return `<g class="t-zone" data-geste="${geste}" data-cx="${x}" data-cy="${y}" role="button" tabindex="0" aria-label="${label}">
    <circle class="t-hit" cx="${x}" cy="${y}" r="${CIBLE / 2}" fill="transparent"/>
    ${presente ? `<g class="t-tourne" data-anim="${anim}">${vis(x, y, r, { laiton: false, rot: 35 })}</g>` : `<circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="#3a3530"/><circle class="t-cadre" cx="${x}" cy="${y}" r="${r + 8}"/>`}</g>`;
}
// Le tournevis qu'on voit arriver sur la vis.
export function dessinTournevis(x, y) {
  return `<g class="t-outil" pointer-events="none" transform="translate(${x} ${y}) rotate(-28)">
    <rect x="-3.5" y="-92" width="7" height="88" rx="2" fill="url(#g-acier)"/>
    <rect x="-13" y="-178" width="26" height="90" rx="11" fill="#e4b51a" stroke="#7a5d05" stroke-width="2"/>
    <rect x="-13" y="-150" width="26" height="12" fill="#1d2228" opacity=".8"/></g>`;
}

const LIGNES2 = [86, 392];
// Vue d'ensemble du tableau : on touche une manette pour la basculer, le haut ou le bas d'un appareil pour s'en approcher.
export function vueTableau2(e, cfg) {
  let s = `<rect width="1200" height="750" fill="#e6dccb"/>
  <rect x="322" y="12" width="556" height="650" rx="16" fill="url(#g-coffret)" stroke="#b5b7b6" stroke-width="3" filter="url(#f-ombre)"/>
  <rect x="332" y="22" width="536" height="630" rx="8" fill="#eef0f0"/>`;
  let zones = "";
  cfg.rangees.forEach((rangee, r) => {
    const y = LIGNES2[r];
    s += `<rect x="336" y="${y + HT / 2 - 9}" width="528" height="18" fill="#dde1e4"/>`;
    s += `<rect x="342" y="${y + 16}" width="516" height="10" rx="3" fill="#c97b3d" opacity=".85"/>`;
    let x = 344;
    for (const a of rangee) {
      const w = a.type === "id" ? 2 * MOD : MOD;
      const haut = e.app[a.cle] !== false;
      s += appareil(a, x, y, w, haut, false);
      [[x + 18, "neutre"], [x + w - 18, "phase"]].forEach(([vx, coul]) => {
        s += conducteur(`M${vx} ${y + HT - 16} L${vx} ${y + HT + 6}`, coul, 8) + vis(vx, y + HT - 22, 11, { rot: 25 }) + vis(vx, y + 22, 11, { rot: 25 });
      });
      const nom = a.etiquette;
      zones += zone(x, y, w, 70, `data-aller="module:${a.cle}"`, `S'approcher de : ${nom}`, { etiquette: "", cadre: false, rx: 6 });
      zones += zone(x, y + 72, w, 112, `data-geste="manette:${a.cle}"`, `${haut ? "Baisser" : "Remonter"} la manette : ${nom}`, { etiquette: "", cadre: false, rx: 6 });
      zones += zone(x, y + 186, w, 64, `data-aller="module:${a.cle}"`, `S'approcher de : ${nom}`, { etiquette: "", cadre: false, rx: 6 });
      x += w + 4;
    }
  });
  s += texte(600, 668, "touche une manette pour la basculer · le haut ou le bas d'un appareil pour t'en approcher", 13.5, 600, "#5b6168");
  return s + zones + zone(340, 700, 170, 40, `data-aller="${cfg.retour}"`, "Refermer le tableau", { pos: "dedans" });
}
// Gros plan d'un appareil du tableau : ses quatre bornes, sa manette, et le bornier de terre à côté.
export function vueModule2(e, cfg, cle) {
  const a = cfg.rangees.flat().find((x) => x.cle === cle);
  const id = a.type === "id", base = id ? 2 * MOD : MOD;
  const k = id ? 1.7 : 2.2, x0 = id ? 360 : 400, y0 = id ? 160 : 130;
  const haut = e.app[a.cle] !== false;
  const relie = (cfg.relies || []).includes(cle);
  const X = (v) => x0 + v * k, Y = (v) => y0 + v * k;
  let s = `<rect width="1200" height="750" fill="#e6dccb"/><rect x="330" y="30" width="540" height="690" rx="14" fill="#eef0f0" stroke="#c9cccc" stroke-width="2"/>
  <g transform="translate(${x0} ${y0}) scale(${k})">${appareil(a, 0, 0, base, haut, false)}`;
  [[18, "N", "neutre"], [base - 18, "L", "phase"]].forEach(([vx, kk, coul]) => {
    const idv = `${cle}-${kk}`;
    s += (e.loose === idv
      ? conducteur(`M${vx + 4} ${HT - 4} L${vx + 6} ${HT + 30} Q${vx + 6} ${HT + 46} ${vx + 16} ${HT + 52}`, coul, 7) + cuivre(vx + 3, HT - 18, 14, 96, 5)
      : conducteur(`M${vx} ${HT - 16} L${vx} ${HT + 30} Q${vx} ${HT + 46} ${vx + 8} ${HT + 52}`, coul, 7));
    s += conducteur(`M${vx} 16 L${vx} -10`, coul, 7);
  });
  s += `</g>`;
  const noms = cfg.noms || {};
  [[18, "N"], [base - 18, "L"]].forEach(([vx, kk]) => {
    const bas = `${cle}-${kk}`, hautId = `${cle}-amont-${kk}`;
    s += relie ? borne(X(vx), Y(HT - 22), 24, bas, noms[bas] || bas, { rot: e.loose === bas ? 70 : 25 }) : vis(X(vx), Y(HT - 22), 24, { rot: 25 });
    s += relie ? borne(X(vx), Y(22), 24, hautId, noms[hautId] || hautId) : vis(X(vx), Y(22), 24, { rot: 25 });
  });
  const cx = base / 2;
  s += zone(X(cx - 26), Y(80), 52 * k, 92 * k, `data-geste="manette:${cle}"`, `${haut ? "Baisser" : "Remonter"} la manette : ${a.etiquette}`, { etiquette: haut ? "Baisser" : "Remonter", pos: "dedans", cadre: false });
  // bornier de terre
  s += `<rect x="690" y="380" width="160" height="70" rx="8" fill="#e9ecee" stroke="#9aa1a8"/><rect x="702" y="398" width="136" height="32" rx="4" fill="url(#g-laiton)"/>`;
  s += conducteur("M820 560 C 818 500 812 470 806 430", "terre", 10) + conducteur("M730 560 C 732 500 736 470 740 430", "terre", 10);
  s += borne(770, 414, 18, "terre", noms.terre || "bornier de terre") + texte(770, 478, "bornier de terre", 15, 700, "#3b3f44");
  return s + zone(340, 684, 190, 48, `data-aller="tableau"`, "Retour au tableau", { pos: "dedans" });
}
