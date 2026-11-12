// Vues de l'intervention « chambre ».
import { texte, vis, conducteur, cuivre, cadreCliquable } from "../commun.js";

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
      const loose = e.loose === "int-S";
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
      const lN = e.loose === "dcl-N", den = e.loose === "denude";
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

