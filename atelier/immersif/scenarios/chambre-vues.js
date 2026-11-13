// Vues de l'intervention « La lumière de la chambre » (nouveau moteur).
// Tout ce qui se touche est dessiné entre x = 330 et x = 870 : c'est la bande visible sur un téléphone.
import { texte, vis, conducteur, cuivre, zone, borne, point, visFixation } from "../commun.js";

const MUR = `<rect width="1200" height="750" fill="url(#g-murfond)"/><rect width="1200" height="750" fill="url(#p-crepi)"/>`;
// Lueur du plafonnier, vue depuis une vue rapprochée : on voit tout de suite si la lampe s'allume.
const lueur = (allume) => (allume
  ? `<ellipse cx="600" cy="-40" rx="760" ry="330" fill="url(#g-lumiere)" pointer-events="none"/>${texte(600, 34, "☀ le plafonnier éclaire", 15, 700, "#8a6a12")}`
  : `<rect width="1200" height="750" fill="#0a1022" opacity=".28" pointer-events="none"/>${texte(600, 34, "plafonnier éteint", 15, 700, "#e9eef8")}`);

/* ---------- La chambre, le soir ---------- */
export function vueChambre(e) {
  const allume = e.lampeAllumee;
  const vp = { x: 600, y: 330 };
  const lames = [];
  for (let i = -6; i <= 21; i++) {
    const xb = i * 70, xa = vp.x + (xb - vp.x) * ((560 - vp.y) / (750 - vp.y));
    lames.push(`<path d="M${xb} 750 L${xa} 560" stroke="#8a6238" stroke-width="1.4" opacity=".55"/>`);
  }
  return `
  <rect width="1200" height="750" fill="url(#g-murfond)"/>
  <polygon points="0,0 1200,0 940,120 260,120" fill="url(#g-plafond)"/>
  <polygon points="0,0 260,120 260,560 0,750" fill="url(#g-murg)"/>
  <polygon points="1200,0 940,120 940,560 1200,750" fill="url(#g-murd)"/>
  <rect x="260" y="120" width="680" height="440" fill="url(#g-murfond)"/><rect x="260" y="120" width="680" height="440" fill="url(#p-crepi)"/>
  <polygon points="0,750 1200,750 940,560 260,560" fill="url(#g-parquet)"/>${lames.join("")}
  <path d="M260 560 L0 750 M940 560 L1200 750 M260 120 L0 0 M940 120 L1200 0" stroke="#bfb196" stroke-width="2"/>
  <polygon points="60,175 190,215 190,420 60,445" fill="url(#g-nuit)" stroke="#f3eee4" stroke-width="10"/>
  <path d="M125 195 L125 432 M60 310 L190 318" stroke="#f3eee4" stroke-width="6"/>
  <rect x="292" y="146" width="184" height="414" fill="#e9e2d2"/><rect x="302" y="156" width="164" height="404" fill="url(#g-bois)"/>
  <rect x="318" y="178" width="132" height="160" rx="4" fill="#a87c51" stroke="#7f5a35" stroke-width="2"/>
  <rect x="318" y="356" width="132" height="184" rx="4" fill="#a87c51" stroke="#7f5a35" stroke-width="2"/>
  <circle cx="451" cy="372" r="8" fill="#e2cf9c" stroke="#9c8650"/>
  <g filter="url(#f-ombre-p)"><rect x="494" y="326" width="30" height="30" rx="4" fill="#fbfaf7" stroke="#c9c2b6"/>
    <rect x="500" y="${e.app.inter ? 331 : 339}" width="18" height="12" rx="2" fill="#fff" stroke="#d2ccc0"/></g>
  <g filter="url(#f-ombre-p)"><rect x="496" y="512" width="26" height="26" rx="4" fill="#fbfaf7" stroke="#c9c2b6"/><circle cx="509" cy="525" r="8" fill="#f0eee8" stroke="#c4bdb0"/></g>
  <rect x="660" y="330" width="250" height="130" rx="10" fill="#6b4a32"/><rect x="672" y="342" width="226" height="108" rx="8" fill="#80593d"/>
  <polygon points="640,452 930,452 1010,640 560,640" fill="#e9e4da"/><polygon points="600,520 970,520 1030,660 540,660" fill="#5d7391"/>
  <polygon points="540,660 1030,660 1030,690 540,690" fill="#4a5d78"/>
  <ellipse cx="730" cy="452" rx="56" ry="22" fill="#f7f4ee"/><ellipse cx="845" cy="452" rx="56" ry="22" fill="#f7f4ee"/>
  <polygon points="950,470 1040,470 1060,600 935,600" fill="#8f6744"/><rect x="975" y="452" width="44" height="22" rx="4" fill="#222"/>${texte(997, 469, "06:30", 13, 700, "#ff5a4f")}
  <ellipse cx="600" cy="62" rx="26" ry="7" fill="#fbfaf7" stroke="#cfc6b6"/><path d="M600 66 V170" stroke="#2c2c2c" stroke-width="2.5"/>
  ${allume ? `<ellipse cx="600" cy="420" rx="520" ry="330" fill="url(#g-lumiere)"/>` : ""}
  <path d="M548 236 L652 236 L630 172 L570 172 Z" fill="url(#g-abat)" stroke="#b9a988" stroke-width="2"/>
  <ellipse cx="600" cy="236" rx="52" ry="9" fill="${allume ? "#fff1bf" : "#a99b80"}"/>
  ${allume ? `<ellipse cx="600" cy="238" rx="22" ry="8" fill="url(#g-ampoule)"/>` : `<ellipse cx="600" cy="238" rx="18" ry="6" fill="#d8d8d4"/>`}
  <rect width="1200" height="750" fill="#0a1022" opacity="${allume ? 0.1 : 0.55}" pointer-events="none"/>
  ${zone(476, 306, 70, 70, `data-aller="inter"`, "S'approcher de l'interrupteur", { etiquette: "Interrupteur" })}
  ${zone(540, 52, 120, 196, `data-aller="plafonnier"`, "Monter au plafonnier", { etiquette: "Plafonnier" })}
  ${zone(334, 392, 122, 140, `data-aller="entree"`, "Sortir dans l'entrée, vers le tableau", { etiquette: "Entrée · tableau" })}`;
}

/* ---------- L'entrée et la GTL ---------- */
export function vueEntree() {
  return `${MUR}
  <rect y="640" width="1200" height="110" fill="#bfa384"/><rect y="630" width="1200" height="12" fill="#f4efe6"/>
  <rect x="340" y="150" width="150" height="490" fill="#e9e2d2"/><rect x="350" y="160" width="130" height="480" fill="url(#g-bois)"/>
  <circle cx="466" cy="410" r="8" fill="#e2cf9c" stroke="#9c8650"/>
  <rect x="530" y="30" width="330" height="610" fill="#e3d9c6" stroke="#cbbfa8" stroke-width="3"/><rect x="540" y="40" width="310" height="590" fill="#ece4d4"/>
  <rect x="560" y="56" width="270" height="170" rx="8" fill="#f7f6f2" stroke="#c7c9c6" stroke-width="2" filter="url(#f-ombre-p)"/>
  <rect x="576" y="72" width="104" height="138" rx="10" fill="#d5e05b"/><rect x="588" y="86" width="80" height="34" rx="4" fill="#28331a"/>
  ${texte(628, 109, "006 482", 15, 700, "#bde39b", "middle", 'font-family="ui-monospace, Menlo, monospace"')}${texte(628, 186, "compteur", 12, 700, "#4b5320")}
  <rect x="704" y="82" width="104" height="120" rx="8" fill="#e9eaeb" stroke="#9aa1a8" stroke-width="2"/>
  <rect x="734" y="104" width="44" height="58" rx="6" fill="#30353b"/><rect x="742" y="110" width="28" height="22" rx="3" fill="#d4372c"/>
  ${texte(756, 182, "AGCP 45 A", 12, 700)}${texte(756, 196, "500 mA", 11, 600, "#555")}
  <g filter="url(#f-ombre)"><rect x="560" y="250" width="270" height="340" rx="12" fill="url(#g-coffret)" stroke="#babcbb" stroke-width="2"/>
    <rect x="578" y="270" width="234" height="300" rx="8" fill="#9aa4ad" opacity=".35"/>
    ${[0, 1].map((r) => `<rect x="590" y="${290 + r * 136}" width="210" height="104" rx="4" fill="#f5f5f3" opacity=".7"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${598 + i * 33}" y="${320 + r * 136}" width="23" height="40" rx="3" fill="${i === 0 ? "#3d6fb8" : "#40454b"}" opacity=".75"/>`).join("")}`).join("")}</g>
  ${zone(560, 250, 270, 340, `data-aller="tableau"`, "Ouvrir le tableau électrique", { etiquette: "Ouvrir le tableau" })}
  ${zone(350, 200, 130, 300, `data-aller="chambre"`, "Retourner dans la chambre", { etiquette: "Chambre" })}`;
}

/* ---------- L'interrupteur, de près ---------- */
// États : e.plaque (posée ou non), e.visMeca [gauche, droite] (vissées ou non), e.mecaSorti.
const BX = 470, BY = 270; // centre de la boîte d'encastrement
export function vueInter(e) {
  const on = e.app.inter;
  let s = `${MUR}<rect x="0" y="0" width="150" height="750" fill="url(#g-bois)" opacity=".9"/><rect x="150" y="0" width="22" height="750" fill="#e9e2d2"/>`;
  // prise de courant en dessous : sa broche de terre sert de référence pour mesurer
  s += `<g filter="url(#f-ombre)"><rect x="378" y="488" width="184" height="184" rx="24" fill="url(#g-blanc)" stroke="#cfc9bd" stroke-width="2"/>
    <circle cx="470" cy="580" r="72" fill="#f1efea" stroke="#c8c1b4" stroke-width="2"/><circle cx="470" cy="580" r="62" fill="#ebe8e1"/></g>
    <circle cx="432" cy="592" r="11" fill="#2d2d2d"/><circle cx="508" cy="592" r="11" fill="#2d2d2d"/>
    <rect x="460" y="522" width="20" height="30" rx="5" fill="url(#g-acier)" stroke="#6d757d"/>`;
  s += point(470, 530, "prise-terre", "broche de terre de la prise") + point(432, 594, "prise-g", "alvéole gauche de la prise") + point(508, 594, "prise-d", "alvéole droite de la prise");
  // la plaque, quand elle est retirée, posée à côté
  const plaquePosee = `<g filter="url(#f-ombre-p)" transform="rotate(-8 660 560)"><rect x="604" y="504" width="112" height="112" rx="14" fill="url(#g-blanc)" stroke="#cfc9bd" stroke-width="2"/><rect x="630" y="530" width="60" height="60" rx="8" fill="none" stroke="#d6d0c4" stroke-width="2"/></g>`;
  if (e.plaque) {
    s += `<g data-anim="plaque" class="t-glisse"><g filter="url(#f-ombre)"><rect x="350" y="150" width="240" height="240" rx="24" fill="url(#g-blanc)" stroke="#cfc9bd" stroke-width="2"/>
      <rect x="400" y="200" width="140" height="140" rx="12" fill="#fff" stroke="#d6d0c4" stroke-width="2"/>
      <g data-anim="touche"><rect x="404" y="${on ? 204 : 270}" width="132" height="66" rx="10" fill="#f1efe9"/>
      ${texte(470, on ? 244 : 312, on ? "I" : "O", 20, 800, "#a4a9ae")}</g></g>
      <rect x="440" y="384" width="60" height="8" rx="3" fill="#bdb6a8"/></g>`;
    s += zone(410, 210, 120, 120, `data-geste="interrupteur"`, "Appuyer sur l'interrupteur", { etiquette: "", cadre: false });
    s += zone(405, 394, 130, 64, `data-geste="plaque"`, "Déclipser la plaque (encoche du bas)", { etiquette: "Déclipser la plaque", pos: "dedans" });
  } else {
    s += `<circle cx="${BX}" cy="${BY}" r="104" fill="#cfc4ae"/><circle cx="${BX}" cy="${BY}" r="92" fill="url(#g-trou)"/>`;
    s += plaquePosee;
    if (!e.mecaSorti) {
      const [vg, vd] = e.visMeca;
      s += `<g data-anim="meca" class="t-glisse"><g filter="url(#f-ombre)"><rect x="352" y="174" width="236" height="192" rx="10" fill="#c7cbcf" stroke="#8e959c" stroke-width="2"/>
        <rect x="400" y="200" width="140" height="140" rx="10" fill="#fbfbf9" stroke="#c9cbcc" stroke-width="2"/>
        <g data-anim="touche"><rect x="404" y="${on ? 204 : 270}" width="132" height="66" rx="9" fill="#f1efe9"/></g></g></g>`;
      s += visFixation(374, 270, 13, "visMeca:0", "vismeca-0", vg ? "Dévisser la vis de gauche du mécanisme" : "Revisser la vis de gauche", vg);
      s += visFixation(566, 270, 13, "visMeca:1", "vismeca-1", vd ? "Dévisser la vis de droite du mécanisme" : "Revisser la vis de droite", vd);
      if (vg || vd) s += zone(424, 214, 92, 112, `data-geste="interrupteur"`, "Appuyer sur l'interrupteur", { etiquette: "", cadre: false });
      else s += zone(414, 204, 112, 132, `data-geste="meca"`, "Sortir le mécanisme de sa boîte", { etiquette: "Sortir le mécanisme", pos: "dedans" });
      if (vg && vd) s += zone(604, 504, 112, 112, `data-geste="plaque"`, "Reclipser la plaque", { etiquette: "Reclipser" });
    } else {
      const loose = e.loose === "int-S";
      s += `<path d="M${BX - 18} ${BY - 50} C ${BX - 24} ${BY - 10} ${BX - 18} ${BY + 30} ${BX - 6} ${BY + 50}" stroke="url(#g-gaine)" stroke-width="30" fill="none" stroke-linecap="round"/>`;
      s += conducteur(`M${BX - 14} ${BY + 46} C ${BX} 470 640 470 680 440 L680 432`, "phase", 10) + cuivre(680, 416, 16, 90, 6);
      s += loose
        ? conducteur(`M${BX - 2} ${BY + 50} C ${BX + 40} 490 820 500 812 456 L808 452`, "retour", 10) + cuivre(806, 436, 18, 100, 6)
        : conducteur(`M${BX - 2} ${BY + 50} C ${BX + 40} 490 780 480 800 440 L800 432`, "retour", 10) + cuivre(800, 416, 16, 90, 6);
      s += `<g data-anim="meca" class="t-glisse"><g filter="url(#f-ombre)"><rect x="612" y="140" width="250" height="330" rx="16" fill="#ecebe7" stroke="#a9adb1" stroke-width="2"/>
        <rect x="640" y="164" width="194" height="170" rx="12" fill="#fbfbf9" stroke="#c9cbcc" stroke-width="2"/>
        <g data-anim="touche"><rect x="644" y="${on ? 168 : 252}" width="186" height="78" rx="10" fill="#f1efe9"/></g>
        ${texte(737, on ? 214 : 298, on ? "I" : "O", 22, 800, "#9aa0a6")}
        <rect x="630" y="370" width="214" height="86" rx="10" fill="#dcdcd7" stroke="#b9bbbd"/></g></g>`;
      s += texte(680, 470, "L", 17, 800) + texte(800, 470, "1", 17, 800);
      s += borne(680, 404, 16, "int-E", "borne L de l'interrupteur (arrivée de phase)") + borne(800, 404, 16, "int-S", "borne 1 de l'interrupteur (départ retour lampe)", { rot: loose ? 75 : 25 });
      s += zone(650, 180, 174, 140, `data-geste="interrupteur"`, "Basculer l'interrupteur", { etiquette: "", cadre: false });
      s += zone(620, 64, 236, 54, `data-geste="meca"`, "Rentrer le mécanisme dans sa boîte", { etiquette: "Rentrer le mécanisme", pos: "dedans" });
    }
  }
  s += lueur(e.lampeAllumee);
  return s + zone(340, 690, 150, 46, `data-aller="chambre"`, "Retour dans la chambre", { etiquette: "← Chambre", pos: "dedans" });
}

/* ---------- Le plafonnier, sur l'escabeau ---------- */
// États : e.luminaire (accroché ou non), e.capot (fermé ou non), e.ampoule (vissée ou non).
export function vuePlafonnier(e) {
  let s = `<rect width="1200" height="750" fill="url(#g-plafond)"/><rect width="1200" height="750" fill="url(#p-crepi)"/><rect y="700" width="1200" height="50" fill="#e5dccb"/>`;
  if (e.luminaire) {
    const allume = e.lampeAllumee;
    s += `<g data-anim="luminaire" class="t-glisse">
      <ellipse cx="600" cy="80" rx="74" ry="24" fill="#fbfaf7" stroke="#cfc6b6" stroke-width="2" filter="url(#f-ombre-p)"/>
      <rect x="572" y="70" width="56" height="34" rx="6" fill="#f3f2ee" stroke="#b8b3a6"/>
      <path d="M600 104 V250" stroke="#2c2c2c" stroke-width="5"/>
      ${allume ? `<ellipse cx="600" cy="420" rx="420" ry="300" fill="url(#g-lumiere)"/>` : ""}
      <path d="M440 470 L760 470 L700 250 L500 250 Z" fill="url(#g-abat)" stroke="#b9a988" stroke-width="3"/>
      <ellipse cx="600" cy="470" rx="160" ry="26" fill="${allume ? "#fff1bf" : "#b1a487"}"/>
      <rect x="584" y="396" width="32" height="22" rx="3" fill="#3a3a3a"/>
      <g data-anim="ampoule" class="t-tourne">${e.ampoule ? `<ellipse cx="600" cy="454" rx="38" ry="44" fill="${allume ? "url(#g-ampoule)" : "#eceae4"}" stroke="#bdb8ac" stroke-width="2"/><rect x="584" y="398" width="32" height="18" rx="3" fill="url(#g-acier)"/>` : ""}</g></g>`;
    if (!e.ampoule) s += `<g transform="translate(720 610)"><ellipse rx="34" ry="40" fill="${e.ampouleNeuve ? "#fffdf2" : "#eceae4"}" stroke="#bdb8ac" stroke-width="2"/><rect x="-14" y="-56" width="28" height="18" rx="3" fill="url(#g-acier)"/></g>${texte(720, 680, "ampoule dévissée", 13, 700, "#6b7178")}`;
    s += zone(546, 400, 108, 108, `data-geste="ampoule"`, e.ampoule ? "Dévisser l'ampoule" : "Revisser l'ampoule", { etiquette: e.ampoule ? "Ampoule" : "Revisser l'ampoule" });
    s += zone(530, 48, 140, 72, `data-geste="luminaire"`, "Décrocher le luminaire (fiche DCL)", { etiquette: "Fiche DCL", pos: "dedans" });
  } else {
    s += `<circle cx="600" cy="250" r="160" fill="#e8e1d3"/><path d="M560 30 C 565 110 575 150 585 190" stroke="url(#g-gaine)" stroke-width="34" fill="none"/>`;
    const lN = e.loose === "dcl-N", den = e.loose === "denude";
    s += `<g filter="url(#f-ombre)"><circle cx="600" cy="260" r="150" fill="#f5f4f0" stroke="#c9c3b6" stroke-width="2"/></g>
      <rect x="452" y="300" width="296" height="86" rx="12" fill="#e4e3de" stroke="#b8b3a6"/>`;
    s += den ? conducteur("M575 196 C 560 236 506 270 500 296", "retour", 11) + cuivre(500, 286, 40, 128, 7)
             : conducteur("M575 196 C 560 236 500 270 500 312", "retour", 11) + cuivre(500, 304, 12, 90, 7);
    s += lN ? conducteur("M588 196 C 592 240 606 262 616 282", "neutre", 11) + cuivre(616, 278, 16, 66, 7)
            : conducteur("M588 196 C 594 250 600 280 600 312", "neutre", 11) + cuivre(600, 304, 12, 90, 7);
    s += conducteur("M600 196 C 640 240 700 270 700 312", "terre", 11) + cuivre(700, 304, 12, 90, 7);
    if (!e.capot) {
      s += borne(500, 340, 16, "dcl-L", "borne L du DCL (retour lampe)") + texte(500, 378, "L", 17, 800);
      s += borne(600, 340, 16, "dcl-N", "borne N du DCL", { rot: lN ? 70 : 25 }) + texte(600, 378, "N", 17, 800);
      s += borne(700, 340, 16, "dcl-T", "borne de terre du DCL") + texte(700, 378, "⏚", 19, 800);
    }
    if (e.capot) {
      s += `<g data-anim="capot" class="t-glisse"><g filter="url(#f-ombre)"><circle cx="600" cy="300" r="118" fill="url(#g-blanc)" stroke="#c9c3b6" stroke-width="2"/>
        <rect x="540" y="270" width="120" height="60" rx="12" fill="#f3f2ee" stroke="#b8b3a6"/>
        <rect x="560" y="286" width="16" height="28" rx="3" fill="#2d2d2d"/><rect x="592" y="286" width="16" height="28" rx="3" fill="#2d2d2d"/><rect x="624" y="286" width="16" height="28" rx="3" fill="#2d2d2d"/></g></g>`;
      s += zone(490, 190, 220, 220, `data-geste="capot"`, "Retirer le capot de la boîte DCL", { etiquette: "Retirer le capot", rx: 110 });
    } else {
      s += `<g transform="translate(420 540) rotate(12)" filter="url(#f-ombre-p)"><circle r="62" fill="url(#g-blanc)" stroke="#c9c3b6" stroke-width="2"/><rect x="-36" y="-18" width="72" height="36" rx="8" fill="#f3f2ee" stroke="#b8b3a6"/></g>`;
      s += zone(356, 480, 128, 120, `data-geste="capot"`, "Remettre le capot de la boîte DCL", { etiquette: "Remettre le capot" });
    }
    // le luminaire décroché, posé sur le lit
    s += `<g transform="translate(730 520)"><path d="M-110 70 L110 70 L70 -50 L-70 -50 Z" fill="url(#g-abat)" stroke="#b9a988" stroke-width="3"/>
      ${e.ampoule ? `<ellipse cx="0" cy="56" rx="22" ry="26" fill="#eceae4" stroke="#bdb8ac"/>` : ""}<rect x="-24" y="-82" width="48" height="30" rx="6" fill="#f3f2ee" stroke="#b8b3a6"/></g>`;
    s += zone(610, 430, 240, 170, `data-geste="luminaire"`, "Raccrocher le luminaire", { etiquette: "Raccrocher le luminaire", pos: "haut", cadre: !e.capot ? false : true });
  }
  return s + zone(340, 690, 180, 46, `data-aller="chambre"`, "Descendre de l'escabeau", { etiquette: "↓ Descendre", pos: "dedans" });
}
