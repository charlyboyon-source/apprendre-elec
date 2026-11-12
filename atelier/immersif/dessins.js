// Dessins détaillés de l'atelier immersif (SVG, 1200 × 750).
// Chaque fonction reçoit l'état du jeu et renvoie le SVG de la vue.
// Éléments cliquables : data-aller (changer de vue), data-geste (action), data-vis (vis ou borne mesurable).

export const W = 1200, H = 750;
const C = { phase: "#c8322a", retour: "#ec8a1d", neutre: "#2e6bc9", terre: "#3d9a3d", cuivre: "#c87b3a" };

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
  return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${larg}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="${larg * 0.25}" stroke-linecap="round" transform="translate(-${larg * 0.18} -${larg * 0.18})"/>`;
}
// Âme de cuivre dénudée (x,y = début, vers la direction donnée)
export function cuivre(x, y, long, angle = 90, larg = 6) {
  return `<g transform="rotate(${angle - 90} ${x} ${y})"><rect x="${x - larg / 2}" y="${y}" width="${larg}" height="${long}" rx="${larg / 2}" fill="url(#g-cuivre)"/></g>`;
}
function texte(x, y, t, taille = 14, poids = 600, coul = "#2b2f34", ancre = "middle", extra = "") {
  return `<text x="${x}" y="${y}" font-size="${taille}" font-weight="${poids}" fill="${coul}" text-anchor="${ancre}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" ${extra}>${t}</text>`;
}
export function cadreCliquable(x, y, w, h, attr, label, rx = 14) {
  return `<g class="zone" ${attr} role="button" tabindex="0" aria-label="${label}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#fff" fill-opacity="0" stroke="#f2c230" stroke-width="3" stroke-dasharray="9 7" class="zone-cadre"/>
    <g class="zone-etiquette"><rect x="${x + w / 2 - label.length * 4.6 - 14}" y="${y + h + 8}" width="${label.length * 9.2 + 28}" height="30" rx="15" fill="#1d2228" fill-opacity=".9"/>
    ${texte(x + w / 2, y + h + 28, label, 15, 700, "#fff")}</g>
  </g>`;
}

/* ---------- Vue 1 : la chambre, le soir ---------- */
export function vueChambre(e) {
  const allume = e.lampeAllumee;
  const vp = { x: 600, y: 330 };
  // Parquet : lames fuyantes vers le point de fuite
  const lames = [];
  for (let i = -6; i <= 21; i++) {
    const xb = i * 70;
    const xa = vp.x + (xb - vp.x) * ((560 - vp.y) / (750 - vp.y));
    lames.push(`<path d="M${xb} 750 L${xa} 560" stroke="#8a6238" stroke-width="1.4" opacity=".55"/>`);
  }
  const joints = [580, 604, 632, 666, 706, 750].map((y, k) => {
    const t = (y - vp.y) / (750 - vp.y);
    return `<path d="M${vp.x - 900 * t} ${y} H${vp.x + 900 * t}" stroke="#8a6238" stroke-width="1" opacity=".35" stroke-dasharray="${60 + k * 30} ${40 + k * 25}"/>`;
  }).join("");
  const nuit = allume ? 0.12 : 0.62;
  return `
  <rect width="1200" height="750" fill="url(#g-murfond)"/>
  <polygon points="0,0 1200,0 940,120 260,120" fill="url(#g-plafond)"/>
  <polygon points="0,0 260,120 260,560 0,750" fill="url(#g-murg)"/>
  <polygon points="1200,0 940,120 940,560 1200,750" fill="url(#g-murd)"/>
  <rect x="260" y="120" width="680" height="440" fill="url(#g-murfond)"/>
  <rect x="260" y="120" width="680" height="440" fill="url(#p-crepi)"/>
  <polygon points="0,750 1200,750 940,560 260,560" fill="url(#g-parquet)"/>
  ${lames.join("")}${joints}
  <polygon points="260,560 940,560 950,568 250,568" fill="#f4efe6"/>
  <path d="M260 560 L0 750 M940 560 L1200 750 M260 120 L0 0 M940 120 L1200 0" stroke="#bfb196" stroke-width="2"/>
  <!-- fenêtre (mur gauche) -->
  <polygon points="60,175 190,215 190,420 60,445" fill="url(#g-nuit)"/>
  <polygon points="60,175 190,215 190,420 60,445" fill="none" stroke="#f3eee4" stroke-width="10"/>
  <path d="M125 195 L125 432 M60 310 L190 318" stroke="#f3eee4" stroke-width="6"/>
  <circle cx="98" cy="240" r="9" fill="#f4f1d8" opacity=".9"/>
  <path d="M36 150 C 50 260 40 380 52 470 L 82 470 C 70 380 76 260 66 158 Z" fill="#7d4c3c"/>
  <path d="M196 196 C 206 300 200 400 210 440 L 226 436 C 216 390 220 300 214 200 Z" fill="#7d4c3c"/>
  <!-- porte (mur du fond) -->
  <rect x="292" y="146" width="184" height="414" fill="#e9e2d2"/>
  <rect x="302" y="156" width="164" height="404" fill="url(#g-bois)"/>
  <rect x="318" y="178" width="132" height="160" rx="4" fill="#a87c51" stroke="#7f5a35" stroke-width="2"/>
  <rect x="318" y="356" width="132" height="184" rx="4" fill="#a87c51" stroke="#7f5a35" stroke-width="2"/>
  <rect x="446" y="356" width="10" height="34" rx="4" fill="#d2c08f"/><circle cx="451" cy="372" r="8" fill="#e2cf9c" stroke="#9c8650"/>
  <!-- interrupteur et prise, côté poignée -->
  <g filter="url(#f-ombre-p)"><rect x="496" y="328" width="26" height="26" rx="4" fill="#fbfaf7" stroke="#c9c2b6"/><rect x="501" y="333" width="16" height="16" rx="2" fill="#fff" stroke="#d2ccc0"/></g>
  <g filter="url(#f-ombre-p)"><rect x="496" y="512" width="26" height="26" rx="4" fill="#fbfaf7" stroke="#c9c2b6"/><circle cx="509" cy="525" r="8" fill="#f0eee8" stroke="#c4bdb0"/></g>
  <!-- lit -->
  <rect x="660" y="330" width="250" height="130" rx="10" fill="#6b4a32"/>
  <rect x="672" y="342" width="226" height="108" rx="8" fill="#80593d"/>
  <polygon points="640,452 930,452 1010,640 560,640" fill="#e9e4da"/>
  <polygon points="600,520 970,520 1030,660 540,660" fill="#5d7391"/>
  <polygon points="540,660 1030,660 1030,690 540,690" fill="#4a5d78"/>
  <ellipse cx="730" cy="452" rx="56" ry="22" fill="#f7f4ee"/><ellipse cx="845" cy="452" rx="56" ry="22" fill="#f7f4ee"/>
  <!-- table de chevet et réveil -->
  <polygon points="950,470 1040,470 1060,600 935,600" fill="#8f6744"/><rect x="975" y="452" width="44" height="22" rx="4" fill="#222"/>
  ${texte(997, 469, "06:30", 13, 700, "#ff5a4f")}
  <!-- tapis -->
  <ellipse cx="420" cy="660" rx="230" ry="50" fill="#9b6f5c" opacity=".55"/>
  <!-- suspension -->
  <ellipse cx="600" cy="62" rx="26" ry="7" fill="#fbfaf7" stroke="#cfc6b6"/>
  <path d="M600 66 V170" stroke="#2c2c2c" stroke-width="2.5"/>
  ${allume ? `<ellipse cx="600" cy="420" rx="520" ry="330" fill="url(#g-lumiere)"/>` : ""}
  <path d="M548 236 L652 236 L630 172 L570 172 Z" fill="url(#g-abat)" stroke="#b9a988" stroke-width="2"/>
  <ellipse cx="600" cy="236" rx="52" ry="9" fill="${allume ? "#fff1bf" : "#a99b80"}"/>
  ${allume ? `<ellipse cx="600" cy="238" rx="22" ry="8" fill="url(#g-ampoule)"/>` : `<ellipse cx="600" cy="238" rx="18" ry="6" fill="#d8d8d4"/>`}
  <!-- obscurité de la nuit -->
  <rect width="1200" height="750" fill="#0a1022" opacity="${nuit}" pointer-events="none"/>
  ${!allume ? `<polygon points="60,175 190,215 330,690 120,700" fill="#9fb4e6" opacity=".08" pointer-events="none"/>` : ""}
  ${cadreCliquable(484, 316, 50, 50, `data-aller="inter"`, "Interrupteur")}
  ${cadreCliquable(540, 50, 120, 200, `data-aller="plafonnier"`, "Plafonnier")}
  ${cadreCliquable(300, 392, 160, 140, `data-aller="entree"`, "Sortir : tableau dans l'entrée")}
  <g class="zone" data-geste="interrupteur" role="button" tabindex="0" aria-label="Appuyer sur l'interrupteur"><rect x="490" y="322" width="38" height="38" fill="transparent"/></g>`;
}

/* ---------- Vue 2 : l'entrée et la GTL ---------- */
export function vueEntree(e) {
  return `
  <rect width="1200" height="750" fill="url(#g-murfond)"/><rect width="1200" height="750" fill="url(#p-crepi)"/>
  <rect y="640" width="1200" height="110" fill="#bfa384"/><rect y="630" width="1200" height="12" fill="#f4efe6"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<path d="M${i * 150} 642 V750" stroke="#a88b6b" stroke-width="2"/>`).join("")}
  <!-- gaine technique (GTL) -->
  <rect x="430" y="40" width="340" height="600" fill="#e3d9c6" stroke="#cbbfa8" stroke-width="3"/>
  <rect x="440" y="50" width="320" height="580" fill="#ece4d4"/>
  <!-- panneau de contrôle : compteur + AGCP -->
  <rect x="470" y="70" width="260" height="170" rx="8" fill="#f7f6f2" stroke="#c7c9c6" stroke-width="2" filter="url(#f-ombre-p)"/>
  <rect x="490" y="86" width="104" height="138" rx="10" fill="#d5e05b"/><rect x="502" y="100" width="80" height="34" rx="4" fill="#28331a"/>
  ${texte(542, 123, "006 482", 15, 700, "#bde39b", "middle", 'font-family="ui-monospace, Menlo, monospace"')}
  <rect x="512" y="150" width="60" height="10" rx="5" fill="#9fa743"/>${texte(542, 200, "compteur", 12, 700, "#4b5320")}
  <rect x="612" y="96" width="100" height="120" rx="8" fill="#e9eaeb" stroke="#9aa1a8" stroke-width="2"/>
  <rect x="640" y="118" width="44" height="58" rx="6" fill="#30353b"/><rect x="648" y="124" width="28" height="22" rx="3" fill="#d4372c"/>
  ${texte(662, 196, "AGCP 45 A", 12, 700)}${texte(662, 210, "500 mA", 11, 600, "#555")}
  <!-- tableau de répartition fermé -->
  <g filter="url(#f-ombre)">
    <rect x="470" y="262" width="260" height="330" rx="12" fill="url(#g-coffret)" stroke="#babcbb" stroke-width="2"/>
    <rect x="488" y="282" width="224" height="290" rx="8" fill="#9aa4ad" opacity=".35"/>
    ${[0, 1].map((r) => `<rect x="500" y="${300 + r * 130}" width="200" height="100" rx="4" fill="#f5f5f3" opacity=".7"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${508 + i * 32}" y="${330 + r * 130}" width="22" height="38" rx="3" fill="${i === 0 ? "#3d6fb8" : "#40454b"}" opacity=".75"/>`).join("")}`).join("")}
    <rect x="712" y="400" width="10" height="44" rx="5" fill="#cfd2d4"/>
  </g>
  <!-- porte de la chambre -->
  <rect x="890" y="150" width="210" height="490" fill="#e9e2d2"/><rect x="902" y="162" width="186" height="478" fill="url(#g-bois)"/>
  <circle cx="922" cy="410" r="9" fill="#e2cf9c" stroke="#9c8650"/>
  ${cadreCliquable(462, 254, 276, 346, `data-aller="tableau"`, "Ouvrir le tableau")}
  ${cadreCliquable(896, 156, 198, 300, `data-aller="chambre"`, "Retour à la chambre")}`;
}

/* ---------- Vue 3 : le tableau ouvert ---------- */
// Appareils de la rangée 1 (reliés au circuit) et rangée 2 (décor).
export const RANGEE1 = [
  { cle: "diff", type: "id", haut: "40 A", ligne2: "IΔn 30 mA", typ: "AC", etiquette: "Différentiel 1" },
  { cle: "dj", type: "dj", cal: "C16", etiquette: "Éclairage chambres" },
  { cle: "d2", type: "dj", cal: "C20", etiquette: "Prises chambres" },
  { cle: "d3", type: "dj", cal: "C20", etiquette: "Prises séjour" },
  { cle: "d4", type: "dj", cal: "C16", etiquette: "Éclairage séjour" },
];
export const RANGEE2 = [
  { cle: "diff2", type: "id", haut: "40 A", ligne2: "IΔn 30 mA", typ: "A", etiquette: "Différentiel 2" },
  { cle: "d5", type: "dj", cal: "C32", etiquette: "Plaque cuisson" },
  { cle: "d6", type: "dj", cal: "C20", etiquette: "Lave-linge" },
  { cle: "d7", type: "dj", cal: "C20", etiquette: "Four" },
  { cle: "d8", type: "dj", cal: "C20", etiquette: "Cuisine prises" },
];
const MOD = 82;
export function positionsTableau() {
  const pos = {};
  const placer = (rangee, y) => {
    let x = 214;
    for (const a of rangee) { const w = a.type === "id" ? MOD * 2 : MOD; pos[a.cle] = { x, y, w }; x += w + 4; }
  };
  placer(RANGEE1, 96); placer(RANGEE2, 438);
  return pos;
}
function appareil(a, p, haut, loose) {
  const { x, y, w } = p;
  const hT = 250;
  const id = a.type === "id";
  const cx = x + w / 2;
  const visH = id ? [x + 18, x + w - 18] : [x + 18, x + w - 18];
  const manY = haut ? y + 92 : y + 128;
  let s = `<g filter="url(#f-ombre-p)">
    <rect x="${x}" y="${y}" width="${w}" height="${hT}" rx="7" fill="url(#g-module)" stroke="#b5b8b8" stroke-width="1.5"/>
    <rect x="${x + 4}" y="${y + 44}" width="${w - 8}" height="${hT - 88}" rx="4" fill="#fbfbfa" stroke="#dcdedd"/>
  </g>`;
  // vis du haut (amont) et du bas (aval)
  s += visH.map((vx) => `<rect x="${vx - 13}" y="${y + 8}" width="26" height="28" rx="4" fill="#3a3f45"/>`).join("");
  s += visH.map((vx) => `<rect x="${vx - 13}" y="${y + hT - 36}" width="26" height="28" rx="4" fill="#3a3f45"/>`).join("");
  // marquages
  s += texte(cx, y + 64, id ? a.haut : a.cal, id ? 17 : 19, 800, "#22262b");
  if (id) {
    s += texte(cx, y + 82, a.ligne2, 12, 700, "#2e6bc9");
    s += `<rect x="${x + 12}" y="${y + 176}" width="30" height="20" rx="3" fill="none" stroke="#2b2f34" stroke-width="1.5"/>${texte(x + 27, y + 191, a.typ, 13, 800)}`;
    s += `<circle cx="${x + w - 26}" cy="${y + 186}" r="11" fill="#f0c43a" stroke="#a37c09" stroke-width="1.5"/>${texte(x + w - 26, y + 191, "T", 12, 800)}`;
  } else {
    s += texte(cx, y + 186, "230V~", 10, 600, "#6b7178");
    s += `<rect x="${cx - 16}" y="${y + 192}" width="32" height="14" rx="2" fill="none" stroke="#6b7178"/>${texte(cx, y + 203, "4500", 9.5, 700, "#4b5157")}`;
    s += texte(x + 14, y + 104, "N", 11, 800, "#2e6bc9", "start");
  }
  // manette
  s += `<g class="manette" data-geste="manette:${a.cle}" role="button" tabindex="0" aria-label="${haut ? "Baisser" : "Remonter"} ${a.etiquette}">
    <rect x="${cx - 17}" y="${y + 86}" width="34" height="80" rx="6" fill="#2a2e33"/>
    <rect x="${cx - 13}" y="${manY}" width="26" height="34" rx="5" fill="${id ? "#3567b5" : "#f7f7f5"}" stroke="${id ? "#24497f" : "#7d8288"}" stroke-width="1.5"/>
    ${texte(cx, haut ? y + 160 : y + 98, haut ? "I" : "O", 11, 800, haut ? "#d23a2e" : "#7d8288")}
    <rect x="${cx - 26}" y="${y + 80}" width="52" height="92" fill="transparent"/>
  </g>`;
  // voyant de position (vert/rouge)
  s += `<rect x="${cx - 7}" y="${y + 70 + (id ? 18 : 0)}" width="14" height="5" rx="2" fill="${haut ? "#d23a2e" : "#3d9a3d"}" opacity="${id ? 0 : 1}"/>`;
  // porte-étiquette
  s += `<rect x="${x + 2}" y="${y - 50}" width="${w - 4}" height="40" rx="3" fill="#fffbe6" stroke="#d8cd9f"/>`;
  const mots = a.etiquette.split(" ");
  const l1 = mots.slice(0, Math.ceil(mots.length / 2)).join(" "), l2 = mots.slice(Math.ceil(mots.length / 2)).join(" ");
  s += texte(cx, y - 34, l1, 12.5, 700, "#33363a", "middle", 'font-style="italic"') + texte(cx, y - 18, l2, 12.5, 700, "#33363a", "middle", 'font-style="italic"');
  return s;
}
export function vueTableau(e) {
  const pos = positionsTableau();
  const hT = 250;
  let s = `<rect width="1200" height="750" fill="#e6dccb"/>
  <rect x="150" y="14" width="900" height="728" rx="16" fill="url(#g-coffret)" stroke="#b5b7b6" stroke-width="3" filter="url(#f-ombre)"/>
  <rect x="172" y="34" width="856" height="696" rx="8" fill="#eef0f0"/>`;
  // goulottes et rails
  for (const y of [96, 438]) {
    s += `<rect x="196" y="${y + hT / 2 - 9}" width="680" height="18" fill="#dde1e4"/>`;
    // peigne (cuivre sous isolant)
    s += `<rect x="204" y="${y + 16}" width="${6 * MOD + 5 * 4 + 20}" height="10" rx="3" fill="#c97b3d" opacity=".85"/>`;
  }
  const visTableau = [];
  for (const [rangee, y] of [[RANGEE1, 96], [RANGEE2, 438]]) {
    for (const a of rangee) {
      const p = pos[a.cle];
      s += appareil(a, p, e.app[a.cle] !== false, false);
      // fils de sortie (bas) vers la goulotte
      const xs = [p.x + 18, p.x + p.w - 18];
      const yb = y + hT - 22;
      const relie = rangee === RANGEE1;
      const desserre = a.cle === "dj" && e.loose === "DjL";
      if (a.type === "dj") {
        s += conducteur(`M${xs[0]} ${yb + 6} L${xs[0]} ${yb + 36} Q${xs[0]} ${yb + 46} ${xs[0] + 8} ${yb + 50}`, "neutre", 8);
        if (desserre) {
          s += conducteur(`M${xs[1] + 4} ${yb + 18} L${xs[1] + 6} ${yb + 36} Q${xs[1] + 6} ${yb + 46} ${xs[1] + 14} ${yb + 50}`, "phase", 8);
          s += cuivre(xs[1] + 3, yb + 4, 14, 96, 5);
        } else {
          s += conducteur(`M${xs[1]} ${yb + 6} L${xs[1]} ${yb + 36} Q${xs[1]} ${yb + 46} ${xs[1] + 8} ${yb + 50}`, "phase", 8);
        }
      } else {
        s += conducteur(`M${xs[0]} ${yb + 6} L${xs[0]} ${yb + 46}`, "neutre", 8) + conducteur(`M${xs[1]} ${yb + 6} L${xs[1]} ${yb + 46}`, "phase", 8);
      }
      // vis
      const vb = [["N", xs[0]], ["L", xs[1]]];
      for (const [k, vx] of vb) {
        const idv = relie ? `${a.cle}-${k}` : null;
        s += vis(vx, yb, 11, { id: idv, rot: desserre && k === "L" ? 62 : 25, label: `vis de sortie ${k === "N" ? "neutre" : "phase"} de « ${a.etiquette} »` });
      }
      for (const [k, vx] of vb) s += vis(vx, y + 22, 11, { id: relie ? `${a.cle}-amont-${k}` : null, rot: 25, label: `vis d'arrivée ${k === "N" ? "neutre" : "phase"} de « ${a.etiquette} »` });
      visTableau.push(a.cle);
    }
  }
  // bornier de terre
  s += `<rect x="900" y="560" width="110" height="44" rx="6" fill="#e9ecee" stroke="#9aa1a8"/><rect x="908" y="572" width="94" height="20" rx="3" fill="url(#g-laiton)"/>`;
  s += conducteur("M1030 720 C 1020 650 1000 620 990 582", "terre", 9) + conducteur("M935 720 C 930 650 925 620 920 582", "terre", 9);
  s += vis(955, 582, 10, { id: "terre", laiton: true, label: "bornier de terre" });
  s += texte(955, 624, "bornier de terre", 13, 700, "#3b3f44");
  s += `<rect x="900" y="300" width="110" height="90" rx="8" fill="#f8f4e4" stroke="#d8cd9f"/>${texte(955, 326, "Schéma", 13, 800)}${texte(955, 346, "unifilaire", 12, 600)}${texte(955, 370, "dans la porte", 11, 500, "#666")}`;
  s += cadreCliquable(24, 640, 110, 56, `data-aller="entree"`, "Refermer");
  return s;
}

/* ---------- Vue 4 : l'interrupteur, de près ---------- */
export function vueInter(e) {
  const etape = e.inter; // 0 plaque posée, 1 plaque retirée, 2 mécanisme sorti
  const on = e.app.inter;
  let s = `<rect width="1200" height="750" fill="url(#g-murfond)"/><rect width="1200" height="750" fill="url(#p-crepi)"/>
  <rect x="0" y="0" width="150" height="750" fill="url(#g-bois)" opacity=".9"/><rect x="150" y="0" width="22" height="750" fill="#e9e2d2"/>`;
  // prise de courant en dessous (référence de terre)
  s += `<g filter="url(#f-ombre)"><rect x="372" y="520" width="190" height="190" rx="22" fill="url(#g-blanc)" stroke="#cfc9bd" stroke-width="2"/>
    <circle cx="467" cy="615" r="66" fill="#f1efea" stroke="#c8c1b4" stroke-width="2"/><circle cx="467" cy="615" r="56" fill="#ebe8e1"/></g>
    <circle cx="440" cy="622" r="10" fill="#2d2d2d"/><circle cx="494" cy="622" r="10" fill="#2d2d2d"/>
    <rect x="458" y="562" width="18" height="30" rx="5" fill="url(#g-acier)" stroke="#6d757d"/>`;
  s += `<g class="vis" data-vis="prise-terre" role="button" tabindex="0" aria-label="broche de terre de la prise"><circle cx="467" cy="577" r="24" fill="transparent"/></g>`;
  s += `<g class="vis" data-vis="prise-g" role="button" tabindex="0" aria-label="alvéole gauche de la prise"><circle cx="440" cy="622" r="22" fill="transparent"/></g>`;
  s += `<g class="vis" data-vis="prise-d" role="button" tabindex="0" aria-label="alvéole droite de la prise"><circle cx="494" cy="622" r="22" fill="transparent"/></g>`;
  if (etape === 0) {
    s += `<g filter="url(#f-ombre)"><rect x="362" y="150" width="210" height="210" rx="22" fill="url(#g-blanc)" stroke="#cfc9bd" stroke-width="2"/>
      <rect x="402" y="190" width="130" height="130" rx="12" fill="#fff" stroke="#d6d0c4" stroke-width="2"/>
      <path d="M408 ${on ? 196 : 314} L526 ${on ? 196 : 314}" stroke="#e3ded3" stroke-width="10" stroke-linecap="round"/>
      <rect x="402" y="${on ? 190 : 255}" width="130" height="65" rx="12" fill="#f4f2ec" opacity=".8"/></g>`;
    s += `<g class="zone" data-geste="interrupteur" role="button" tabindex="0" aria-label="Appuyer sur l'interrupteur"><rect x="402" y="190" width="130" height="130" fill="transparent"/></g>`;
    s += cadreCliquable(352, 140, 230, 230, `data-geste="deposerPlaque"`, "Déclipser la plaque", 24);
  } else {
    // boîte d'encastrement + mécanisme
    s += `<circle cx="467" cy="255" r="98" fill="#cfc4ae"/><circle cx="467" cy="255" r="86" fill="url(#g-trou)"/>`;
    if (etape === 1) {
      s += `<g filter="url(#f-ombre)"><rect x="377" y="165" width="180" height="180" rx="10" fill="#e9e9e6" stroke="#a9adb1" stroke-width="2"/>
        <rect x="412" y="200" width="110" height="110" rx="8" fill="#fbfbf9" stroke="#c9cbcc"/>
        <path d="M418 ${on ? 210 : 300} L516 ${on ? 210 : 300}" stroke="#dfdcd4" stroke-width="10" stroke-linecap="round"/></g>
        ${vis(392, 180, 9, { laiton: false })}${vis(542, 330, 9, { laiton: false })}`;
      s += `<g class="zone" data-geste="interrupteur" role="button" tabindex="0" aria-label="Appuyer sur l'interrupteur"><rect x="412" y="200" width="110" height="110" fill="transparent"/></g>`;
      s += cadreCliquable(366, 154, 202, 202, `data-geste="sortirMeca"`, "Dévisser et sortir le mécanisme", 14);
    } else {
      // gaine qui sort de la boîte, fils vers le mécanisme sorti
      s += `<path d="M445 210 C 440 240 445 270 452 300" stroke="url(#g-gaine)" stroke-width="30" fill="none" stroke-linecap="round"/>`;
      s += [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${432 + i * 2} ${222 + i * 14} h28" stroke="#596068" stroke-width="2" opacity=".6"/>`).join("");
      const loose = e.loose === "IntS";
      // mécanisme sorti de sa boîte, vu de face : touche en haut, bornes à vis en bas
      s += `<g filter="url(#f-ombre)">
        <rect x="640" y="150" width="300" height="400" rx="16" fill="#ecebe7" stroke="#a9adb1" stroke-width="2"/>
        <rect x="680" y="182" width="220" height="220" rx="12" fill="#fbfbf9" stroke="#c9cbcc" stroke-width="2"/>
        <rect x="684" y="${on ? 186 : 294}" width="212" height="104" rx="10" fill="#f1efe9"/>
        <path d="M694 ${on ? 196 : 386} L886 ${on ? 196 : 386}" stroke="#d4d0c6" stroke-width="12" stroke-linecap="round"/>
        ${texte(790, 300, on ? "I" : "O", 24, 800, "#9aa0a6")}
        <rect x="660" y="430" width="260" height="100" rx="10" fill="#dcdcd7" stroke="#b9bbbd"/>
        <rect x="684" y="446" width="72" height="54" rx="6" fill="#c9c9c3"/><rect x="804" y="446" width="72" height="54" rx="6" fill="#c9c9c3"/>
      </g>`;
      s += texte(720, 552, "L", 18, 800) + texte(840, 552, "1", 18, 800);
      // fils : de la boîte vers les bornes, par le bas
      s += conducteur("M446 296 C 446 470 690 640 720 560 L720 500", "phase", 10) + cuivre(720, 486, 16, 90, 6);
      s += loose
        ? conducteur("M458 296 C 520 470 880 650 868 566 L862 528", "retour", 10) + cuivre(862, 512, 18, 100, 6)
        : conducteur("M458 296 C 520 470 860 640 840 560 L840 500", "retour", 10) + cuivre(840, 486, 16, 90, 6);
      s += vis(720, 473, 15, { id: "int-E", rot: 30, label: "borne d'entrée L de l'interrupteur" });
      s += vis(840, 473, 15, { id: "int-S", rot: loose ? 75 : 30, label: "borne de sortie 1 de l'interrupteur" });
      s += `<g class="zone" data-geste="interrupteur" role="button" tabindex="0" aria-label="Basculer l'interrupteur"><rect x="680" y="182" width="220" height="220" fill="transparent"/></g>`;
      s += texte(790, 140, "touche la touche pour basculer", 14, 600, "#6b7178");
      s += cadreCliquable(860, 30, 310, 50, `data-geste="remonterMeca"`, "Remettre le mécanisme et la plaque");
    }
  }
  s += cadreCliquable(28, 660, 160, 56, `data-aller="chambre"`, "Retour à la chambre");
  return s;
}

/* ---------- Vue 5 : le plafonnier (escabeau) ---------- */
export function vuePlafonnier(e) {
  const etape = e.dcl; // 0 luminaire en place, 1 luminaire décroché (fiche DCL retirée), 2 boîte ouverte
  let s = `<rect width="1200" height="750" fill="url(#g-plafond)"/><rect width="1200" height="750" fill="url(#p-crepi)"/>
  <rect y="690" width="1200" height="60" fill="#e5dccb"/>`;
  if (etape === 0) {
    const allume = e.lampeAllumee;
    s += `<ellipse cx="600" cy="70" rx="70" ry="22" fill="#fbfaf7" stroke="#cfc6b6" stroke-width="2" filter="url(#f-ombre-p)"/>
      <path d="M600 88 V250" stroke="#2c2c2c" stroke-width="5"/>
      ${allume ? `<ellipse cx="600" cy="420" rx="420" ry="300" fill="url(#g-lumiere)"/>` : ""}
      <path d="M440 470 L760 470 L700 250 L500 250 Z" fill="url(#g-abat)" stroke="#b9a988" stroke-width="3"/>
      <ellipse cx="600" cy="470" rx="160" ry="26" fill="${allume ? "#fff1bf" : "#b1a487"}"/>
      ${e.ampoule ? `<ellipse cx="600" cy="452" rx="38" ry="44" fill="${allume ? "url(#g-ampoule)" : "#eceae4"}" stroke="#bdb8ac" stroke-width="2"/><rect x="584" y="398" width="32" height="18" rx="3" fill="url(#g-acier)"/>` : `<rect x="584" y="398" width="32" height="22" rx="3" fill="#3a3a3a"/>`}`;
    s += e.ampoule
      ? cadreCliquable(548, 392, 104, 116, `data-geste="devisserAmpoule"`, "Dévisser l'ampoule")
      : cadreCliquable(548, 392, 104, 60, `data-geste="visserAmpoule"`, e.ampouleNeuve ? "Visser l'ampoule neuve" : "Revisser l'ampoule");
    s += cadreCliquable(520, 40, 160, 70, `data-geste="decrocher"`, "Décrocher le luminaire (fiche DCL)");
  } else {
    // DCL au plafond
    s += `<circle cx="600" cy="260" r="170" fill="#e8e1d3"/>`;
    s += `<path d="M560 40 C 565 120 575 160 585 200" stroke="url(#g-gaine)" stroke-width="34" fill="none"/>`;
    if (etape === 1) {
      s += `<g filter="url(#f-ombre)"><circle cx="600" cy="260" r="120" fill="url(#g-blanc)" stroke="#c9c3b6" stroke-width="2"/>
        <rect x="540" y="230" width="120" height="60" rx="12" fill="#f3f2ee" stroke="#b8b3a6"/>
        <rect x="560" y="246" width="16" height="28" rx="3" fill="#2d2d2d"/><rect x="592" y="246" width="16" height="28" rx="3" fill="#2d2d2d"/><rect x="624" y="246" width="16" height="28" rx="3" fill="#2d2d2d"/></g>
        ${texte(600, 410, "prise DCL (luminaire décroché)", 16, 700, "#6b7178")}`;
      s += cadreCliquable(470, 130, 260, 260, `data-geste="ouvrirDcl"`, "Ouvrir la boîte DCL", 130);
      s += cadreCliquable(860, 30, 300, 50, `data-geste="raccrocher"`, "Raccrocher le luminaire");
    } else {
      const lN = e.loose === "DclN", den = e.loose === "denude";
      s += `<g filter="url(#f-ombre)"><circle cx="600" cy="260" r="150" fill="#f5f4f0" stroke="#c9c3b6" stroke-width="2"/></g>`;
      s += `<rect x="470" y="300" width="260" height="96" rx="12" fill="#e4e3de" stroke="#b8b3a6"/>`;
      // fils
      s += den ? conducteur("M575 205 C 560 240 520 270 520 300", "retour", 11) + cuivre(520, 298, 34, 112, 7)
               : conducteur("M575 205 C 560 240 520 270 520 318", "retour", 11) + cuivre(520, 316, 12, 90, 7);
      s += lN ? conducteur("M587 205 C 590 240 600 262 606 286", "neutre", 11) + cuivre(606, 284, 16, 70, 7)
              : conducteur("M587 205 C 592 250 600 280 600 318", "neutre", 11) + cuivre(600, 316, 12, 90, 7);
      s += conducteur("M598 205 C 630 250 680 280 680 318", "terre", 11) + cuivre(680, 316, 12, 90, 7);
      s += vis(520, 348, 15, { id: "dcl-L", rot: 30, label: "borne L du DCL (retour lampe)" }) + texte(520, 386, "L", 17, 800);
      s += vis(600, 348, 15, { id: "dcl-N", rot: lN ? 70 : 30, label: "borne N du DCL" }) + texte(600, 386, "N", 17, 800);
      s += vis(680, 348, 15, { id: "dcl-T", rot: 30, label: "borne de terre du DCL" }) + texte(680, 386, "⏚", 19, 800);
      if (den) s += `<circle cx="${528}" cy="${300}" r="26" fill="none" stroke="#ff3b30" stroke-width="0" class="indice"/>`;
      s += cadreCliquable(860, 30, 300, 50, `data-geste="fermerDcl"`, "Refermer la boîte DCL");
    }
  }
  s += cadreCliquable(28, 660, 160, 56, `data-aller="chambre"`, "Descendre de l'escabeau");
  return s;
}

/* ---------- Pointes de touche ---------- */
export function pointes(e) {
  const p = (q, coul, id) => `<g class="pointe" data-pointe="${id}" transform="translate(${q.x} ${q.y})">
      <circle r="40" fill="transparent"/>
      <path d="M0 0 L-5 -18 L5 -18 Z" fill="url(#g-acier)"/>
      <rect x="-10" y="-96" width="20" height="80" rx="8" fill="${coul}"/>
      <rect x="-14" y="-40" width="28" height="9" rx="3" fill="${id === "rouge" ? "#7d1b14" : "#000"}"/>
      <rect x="-5" y="-92" width="4" height="50" rx="2" fill="#fff" opacity=".25"/>
    </g>`;
  const cordon = (q, coul, xd) => `<path d="M${xd} 760 C ${xd} 690, ${q.x} ${q.y + 40}, ${q.x} ${q.y - 96}" fill="none" stroke="${coul}" stroke-width="8" stroke-linecap="round" opacity=".95"/>`;
  return `${cordon(e.noir, "#151515", 1130)}${cordon(e.rouge, "#b82a21", 1170)}${p(e.noir, "#1c1c1c", "noir")}${p(e.rouge, "#c8322a", "rouge")}`;
}
