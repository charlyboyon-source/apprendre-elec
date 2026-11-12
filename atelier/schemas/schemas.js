// Atelier schémas : câbler soi-même un montage sur une platine, le mettre sous tension, l'essayer, le faire vérifier.
// Fils tirés de borne à borne (couleur au choix), boîte de dérivation à connecteurs, simulation électrique,
// contrôle automatique : fonctionnement dans toutes les positions, court-circuit, défaut à la terre, phase coupée, terre, couleurs.
import "../../js/page.js";
import { crediterElectrons } from "../../js/progression.js";
import { brancherBoutonSons } from "../../js/audio.js";
import { DEFS, vis, conducteur, texte } from "../immersif/commun.js";
import { sons } from "../immersif/sons.js";
import { DEVELOPPES } from "./developpes.js";

const racine = document.querySelector(".sc");
const COULEURS = [
  ["phase", "Rouge", "#c8322a"], ["noir", "Noir", "#1f1f1f"], ["neutre", "Bleu", "#2e6bc9"],
  ["terre", "Vert-jaune", "#3d9a3d"], ["retour", "Orange", "#ec8a1d"], ["blanc", "Blanc", "#f4f4f2"],
];
const PHASES = ["phase", "noir"];

/* ---------- Composants : dessin et bornes ---------- */
// Chaque composant renvoie ses bornes { id, x, y, label } et son dessin.
const COMPOSANTS = {
  alim(c) {
    const b = [["L", 60, "phase"], ["N", 110, "neutre"], ["PE", 160, "terre"]].map(([k, dy]) => ({ id: `alim-${k}`, x: c.x + 130, y: c.y + dy, label: `arrivée ${k}` }));
    return { bornes: b, dessin: (s) => `
      <rect x="${c.x}" y="${c.y}" width="160" height="200" rx="12" fill="#e9ebec" stroke="#9aa1a8" stroke-width="2"/>
      ${texte(c.x + 80, c.y + 26, "ARRIVÉE", 13, 800, "#555")}
      <rect x="${c.x + 20}" y="${c.y + 44}" width="62" height="140" rx="6" fill="#fbfbfa" stroke="#b5b8b8"/>${texte(c.x + 51, c.y + 64, "C10", 14, 800)}
      <rect x="${c.x + 36}" y="${s.sousTension ? c.y + 82 : c.y + 124}" width="30" height="36" rx="5" fill="#f7f7f5" stroke="#7d8288"/>
      ${texte(c.x + 51, c.y + 176, s.sousTension ? "I" : "O", 13, 800, s.sousTension ? "#d23a2e" : "#7d8288")}
      ${texte(c.x + 104, c.y + 64, "L", 12, 800, "#c8322a")}${texte(c.x + 104, c.y + 114, "N", 12, 800, "#2e6bc9")}${texte(c.x + 104, c.y + 164, "⏚", 13, 800, "#3d9a3d")}` };
  },
  boite(c) {
    const b = Array.from({ length: c.n }, (_, i) => ({ id: `w${i + 1}`, x: c.x + 40 + i * ((c.w - 80) / Math.max(1, c.n - 1)), y: c.y + 90, label: `connecteur ${i + 1}` }));
    return { bornes: b, dessin: () => `
      <rect x="${c.x}" y="${c.y}" width="${c.w}" height="170" rx="14" fill="#8e969e" stroke="#6b737c" stroke-width="3"/>
      <rect x="${c.x + 10}" y="${c.y + 10}" width="${c.w - 20}" height="150" rx="10" fill="#59626b"/>
      ${texte(c.x + c.w / 2, c.y + 34, "BOÎTE DE DÉRIVATION · connecteurs", 13, 800, "#e8ecef")}
      ${b.map((x, i) => `<rect x="${x.x - 30}" y="${x.y - 22}" width="60" height="44" rx="6" fill="#e9eef2" fill-opacity=".9" stroke="#8d969e"/>
        ${[0, 1, 2].map((k) => `<rect x="${x.x - 26 + k * 18}" y="${x.y - 32}" width="14" height="12" rx="3" fill="#f28c1e"/>`).join("")}
        ${texte(x.x, x.y + 42, String(i + 1), 12, 800, "#e8ecef")}`).join("")}` };
  },
  lampe(c) {
    const b = [["L", -40], ["N", 0], ["PE", 40]].map(([k, dx]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + 92, label: `${c.nom}, borne ${k}` }));
    return { bornes: b, dessin: (s) => {
      const allume = s.resultat && s.resultat.lampes[c.id];
      return `${allume ? `<circle cx="${c.x}" cy="${c.y + 10}" r="70" fill="url(#g-lumiere)"/>` : ""}
        <circle cx="${c.x}" cy="${c.y + 10}" r="26" fill="${allume ? "url(#g-ampoule)" : "#e6e8ea"}" stroke="${allume ? "#e8b800" : "#9aa1a8"}" stroke-width="3"/>
        <path d="M${c.x - 18} ${c.y - 8} L${c.x + 18} ${c.y + 28} M${c.x + 18} ${c.y - 8} L${c.x - 18} ${c.y + 28}" stroke="${allume ? "#b38900" : "#9aa1a8"}" stroke-width="2.5"/>
        <rect x="${c.x - 62}" y="${c.y + 66}" width="124" height="44" rx="8" fill="#fbfbfa" stroke="#b5b8b8"/>
        ${texte(c.x, c.y - 26, c.nom, 13, 800, "#3b3f44")}
        ${texte(c.x - 40, c.y + 124, "L", 11, 800)}${texte(c.x, c.y + 124, "N", 11, 800)}${texte(c.x + 40, c.y + 124, "⏚", 12, 800)}`;
    } };
  },
  inter(c) {
    const b = [["L", -30], ["1", 30]].map(([k, dx]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + 70, label: `${c.nom}, borne ${k}` }));
    return { bornes: b, dessin: (s) => plaque(c, s, [[`${c.id}`, s.contacts[c.id]]]) + bornesTxt(c, ["L", "1"], [-30, 30]) };
  },
  double(c) {
    const b = [["L", -44], ["1", 0], ["2", 44]].map(([k, dx]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + 70, label: `${c.nom}, borne ${k}` }));
    return { bornes: b, dessin: (s) => plaque(c, s, [[`${c.id}:a`, s.contacts[`${c.id}:a`]], [`${c.id}:b`, s.contacts[`${c.id}:b`]]]) + bornesTxt(c, ["L", "1", "2"], [-44, 0, 44]) };
  },
  vav(c) {
    const b = [["C", -44], ["1", 0], ["2", 44]].map(([k, dx]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + 70, label: `${c.nom}, borne ${k === "C" ? "commune" : k}` }));
    return { bornes: b, dessin: (s) => plaque(c, s, [[c.id, s.contacts[c.id]]]) + bornesTxt(c, ["L", "1", "2"], [-44, 0, 44]) };
  },
  perm(c) {
    const b = [["1", -54], ["2", -18], ["3", 18], ["4", 54]].map(([k, dx]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + 70, label: `${c.nom}, borne ${k}` }));
    return { bornes: b, dessin: (s) => plaque(c, s, [[c.id, s.contacts[c.id]]], true) + bornesTxt(c, ["1", "2", "3", "4"], [-54, -18, 18, 54]) };
  },
  bp(c) {
    const b = [["1", -28], ["2", 28]].map(([k, dx]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + 70, label: `${c.nom}, borne ${k}` }));
    return { bornes: b, dessin: (s) => `
      <rect x="${c.x - 58}" y="${c.y - 58}" width="116" height="104" rx="12" fill="url(#g-blanc)" stroke="#c8c1b4"/>
      <g class="sc-inter" data-bp="${c.id}" role="button" tabindex="0" aria-label="Appuyer sur ${c.nom}">
        <circle cx="${c.x}" cy="${c.y - 6}" r="30" fill="#f4f2ec" stroke="#b9b3a7" stroke-width="3"/><circle cx="${c.x}" cy="${c.y - 6}" r="12" fill="none" stroke="#b9b3a7" stroke-width="2"/></g>
      ${texte(c.x, c.y - 70, c.nom, 13, 800, "#3b3f44")}${bornesTxt(c, ["1", "2"], [-28, 28])}` };
  },
  tl(c) {
    const b = [["A1", -26, -110], ["1", 26, -110], ["A2", -26, 110], ["2", 26, 110]].map(([k, dx, dy]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + dy, label: `${c.nom}, borne ${k}` }));
    return { bornes: b, dessin: (s) => `
      <rect x="${c.x - 60}" y="${c.y - 130}" width="120" height="260" rx="10" fill="url(#g-module)" stroke="#b5b8b8" stroke-width="2"/>
      ${texte(c.x, c.y - 60, "TL", 22, 800)}${texte(c.x, c.y - 38, "16 A", 12, 700, "#555")}
      <rect x="${c.x - 16}" y="${c.y - 20}" width="32" height="60" rx="5" fill="#2a2e33"/><rect x="${c.x - 12}" y="${s.contacts[c.id] ? c.y - 16 : c.y + 10}" width="24" height="26" rx="4" fill="#e9eef6"/>
      ${texte(c.x - 26, c.y - 82, "A1", 11, 800, "#555")}${texte(c.x + 26, c.y - 82, "1", 11, 800, "#555")}${texte(c.x - 26, c.y + 92, "A2", 11, 800, "#555")}${texte(c.x + 26, c.y + 92, "2", 11, 800, "#555")}
      ${texte(c.x, c.y + 160, c.nom, 13, 800, "#3b3f44")}` };
  },
};
Object.assign(COMPOSANTS, {
  prise(c) {
    const b = [["L", -40], ["N", 0], ["PE", 40]].map(([k, dx]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + 92, label: `${c.nom}, borne ${k}` }));
    return { bornes: b, dessin: (s) => {
      const allume = s.resultat && s.resultat.lampes[c.id];
      return `<rect x="${c.x - 50}" y="${c.y - 50}" width="100" height="100" rx="14" fill="url(#g-blanc)" stroke="#c8c1b4" stroke-width="2"/>
        <circle cx="${c.x}" cy="${c.y}" r="34" fill="#f1efea" stroke="#c4bdb0"/><circle cx="${c.x - 13}" cy="${c.y + 3}" r="5" fill="#333"/><circle cx="${c.x + 13}" cy="${c.y + 3}" r="5" fill="#333"/>
        <path d="M${c.x + 50} ${c.y + 10} C ${c.x + 90} ${c.y + 20} ${c.x + 110} ${c.y - 10} ${c.x + 130} ${c.y - 30}" stroke="#ddd" stroke-width="5" fill="none"/>
        ${allume ? `<circle cx="${c.x + 140}" cy="${c.y - 50}" r="60" fill="url(#g-lumiere)"/>` : ""}
        <path d="M${c.x + 120} ${c.y - 30} h40 l-8 -30 h-24 z" fill="${allume ? "#ffe680" : "#e8e1d0"}" stroke="#b9a988"/>
        ${texte(c.x, c.y - 62, c.nom, 13, 800, "#3b3f44")}${texte(c.x + 140, c.y - 72, "lampe de chevet branchée", 10, 600, "#555")}
        <rect x="${c.x - 62}" y="${c.y + 66}" width="124" height="44" rx="8" fill="#fbfbfa" stroke="#b5b8b8"/>
        ${texte(c.x - 40, c.y + 124, "L", 11, 800)}${texte(c.x, c.y + 124, "N", 11, 800)}${texte(c.x + 40, c.y + 124, "⏚", 12, 800)}`;
    } };
  },
  chauffeEau(c) {
    const b = [["L", -40], ["N", 0], ["PE", 40]].map(([k, dx]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + 92, label: `${c.nom}, borne ${k}` }));
    return { bornes: b, dessin: (s) => {
      const chauffe = s.resultat && s.resultat.lampes[c.id];
      return `<rect x="${c.x - 50}" y="${c.y - 70}" width="100" height="140" rx="40" fill="#f4f4f2" stroke="#b3b8bd" stroke-width="2"/>
        <circle cx="${c.x}" cy="${c.y + 30}" r="8" fill="${chauffe ? "#ff6a3d" : "#9aa1a8"}"/>${texte(c.x, c.y - 10, chauffe ? "chauffe" : "à l'arrêt", 12, 800, chauffe ? "#c8322a" : "#7d858e")}
        ${texte(c.x, c.y - 82, c.nom, 13, 800, "#3b3f44")}
        <rect x="${c.x - 62}" y="${c.y + 70}" width="124" height="40" rx="8" fill="#fbfbfa" stroke="#b5b8b8"/>
        ${texte(c.x - 40, c.y + 124, "L", 11, 800)}${texte(c.x, c.y + 124, "N", 11, 800)}${texte(c.x + 40, c.y + 124, "⏚", 12, 800)}`;
    } };
  },
  minuterie(c) {
    const b = [["L", -26, -110], ["N", 26, -110], ["BP", -26, 110], ["S", 26, 110]].map(([k, dx, dy]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + dy, label: `${c.nom}, borne ${k === "S" ? "sortie lampe" : k === "BP" ? "retour boutons" : k}` }));
    return { bornes: b, dessin: (s) => `
      <rect x="${c.x - 60}" y="${c.y - 130}" width="120" height="260" rx="10" fill="url(#g-module)" stroke="#b5b8b8" stroke-width="2"/>
      ${texte(c.x, c.y - 56, "MIN", 20, 800)}${texte(c.x, c.y - 34, "minuterie", 11, 700, "#555")}
      <circle cx="${c.x}" cy="${c.y + 14}" r="22" fill="#e9eef6" stroke="#7d8288"/><path d="M${c.x} ${c.y + 14} L${c.x + 12} ${c.y}" stroke="#333" stroke-width="3"/>
      <circle cx="${c.x}" cy="${c.y + 52}" r="6" fill="${s.contacts[c.id] ? "#3d9a3d" : "#555"}"/>
      ${texte(c.x - 26, c.y - 82, "L", 11, 800, "#555")}${texte(c.x + 26, c.y - 82, "N", 11, 800, "#555")}${texte(c.x - 26, c.y + 92, "BP", 11, 800, "#555")}${texte(c.x + 26, c.y + 92, "lampe", 10, 800, "#555")}
      ${texte(c.x, c.y + 160, c.nom, 13, 800, "#3b3f44")}` };
  },
  detecteur(c) {
    const b = [["L", -44], ["N", 0], ["S", 44]].map(([k, dx]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + 70, label: `${c.nom}, borne ${k === "S" ? "sortie lampe" : k}` }));
    return { bornes: b, dessin: (s) => `
      <rect x="${c.x - 70}" y="${c.y - 58}" width="140" height="104" rx="12" fill="url(#g-blanc)" stroke="#c8c1b4"/>
      <g class="sc-inter" data-sw="${c.id}" role="button" tabindex="0" aria-label="Passer devant le détecteur">
        <ellipse cx="${c.x}" cy="${c.y - 6}" rx="40" ry="30" fill="#f4f2ec" stroke="#b9b3a7" stroke-width="3"/><ellipse cx="${c.x}" cy="${c.y - 6}" rx="20" ry="14" fill="#d6d9de"/>
        ${s.contacts[c.id] ? `<path d="M${c.x - 54} ${c.y - 6} q-10 -12 0 -24 M${c.x + 54} ${c.y - 6} q10 -12 0 -24" stroke="#e0a800" stroke-width="3" fill="none"/>` : ""}</g>
      ${texte(c.x, c.y - 70, `${c.nom} · ${s.contacts[c.id] ? "quelqu'un passe" : "personne"}`, 13, 800, "#3b3f44")}${bornesTxt(c, ["L", "N", "lampe"], [-44, 0, 44])}` };
  },
  compteur(c) {
    const b = [["C1", -26], ["C2", 26]].map(([k, dx]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + 80, label: `${c.nom}, borne ${k}` }));
    return { bornes: b, dessin: (s) => `
      <rect x="${c.x - 70}" y="${c.y - 70}" width="140" height="130" rx="14" fill="#d5e05b" stroke="#9fa743" stroke-width="2"/>
      <rect x="${c.x - 52}" y="${c.y - 52}" width="104" height="34" rx="4" fill="#28331a"/>${texte(c.x, c.y - 29, s.contacts[c.id] ? "HEURES CREUSES" : "HEURES PLEINES", 10.5, 800, "#bde39b")}
      <g class="sc-inter" data-sw="${c.id}" role="button" tabindex="0" aria-label="Changer de période tarifaire">
        <rect x="${c.x - 52}" y="${c.y - 8}" width="104" height="30" rx="15" fill="${s.contacts[c.id] ? "#1d2228" : "#fff"}" stroke="#4b5320"/>${texte(c.x, c.y + 12, s.contacts[c.id] ? "passer en HP" : "passer en HC", 11, 800, s.contacts[c.id] ? "#fff" : "#4b5320")}</g>
      ${texte(c.x, c.y - 82, c.nom, 13, 800, "#3b3f44")}${texte(c.x - 26, c.y + 112, "C1", 11, 800, "#555")}${texte(c.x + 26, c.y + 112, "C2", 11, 800, "#555")}` };
  },
  contacteur(c) {
    const b = [["A1", -40, -110], ["1", 0, -110], ["3", 40, -110], ["A2", -40, 110], ["2", 0, 110], ["4", 40, 110]].map(([k, dx, dy]) => ({ id: `${c.id}-${k}`, x: c.x + dx, y: c.y + dy, label: `${c.nom}, borne ${k}` }));
    return { bornes: b, dessin: (s) => `
      <rect x="${c.x - 70}" y="${c.y - 130}" width="140" height="260" rx="10" fill="url(#g-module)" stroke="#b5b8b8" stroke-width="2"/>
      ${texte(c.x, c.y - 56, "KM", 20, 800)}${texte(c.x, c.y - 34, "contacteur HC", 11, 700, "#555")}
      <rect x="${c.x - 30}" y="${c.y - 14}" width="60" height="44" rx="6" fill="#2a2e33"/>${texte(c.x, c.y + 14, "AUTO", 11, 800, "#fff")}
      <circle cx="${c.x}" cy="${c.y + 50}" r="6" fill="${s.contacts[c.id] ? "#3d9a3d" : "#555"}"/>
      ${["A1", "1", "3"].map((k, i) => texte(c.x - 40 + i * 40, c.y - 82, k, 11, 800, "#555")).join("")}${["A2", "2", "4"].map((k, i) => texte(c.x - 40 + i * 40, c.y + 92, k, 11, 800, "#555")).join("")}
      ${texte(c.x, c.y + 160, c.nom, 13, 800, "#3b3f44")}` };
  },
});
function plaque(c, s, touches, perm = false) {
  const w = touches.length > 1 ? 150 : 120;
  return `<rect x="${c.x - w / 2}" y="${c.y - 58}" width="${w}" height="104" rx="12" fill="url(#g-blanc)" stroke="#c8c1b4"/>
    ${touches.map(([id, etat], i) => {
      const tx = touches.length > 1 ? c.x - 34 + i * 68 : c.x, tw = touches.length > 1 ? 58 : 80;
      return `<g class="sc-inter" data-sw="${id}" role="button" tabindex="0" aria-label="Basculer ${c.nom}">
        <rect x="${tx - tw / 2}" y="${c.y - 46}" width="${tw}" height="80" rx="8" fill="#fbfbf9" stroke="#d2ccc0" stroke-width="2"/>
        <rect x="${tx - tw / 2 + 4}" y="${etat ? c.y - 42 : c.y - 6}" width="${tw - 8}" height="36" rx="6" fill="#ecebe5"/>
        ${texte(tx, c.y + 1, perm ? (etat ? "croisé" : "droit") : c.type === "vav" ? (etat ? "2" : "1") : etat ? "I" : "O", 13, 800, "#7d8288")}</g>`;
    }).join("")}
    ${texte(c.x, c.y - 70, c.nom, 13, 800, "#3b3f44")}`;
}
const bornesTxt = (c, noms, dx) => noms.map((n, i) => texte(c.x + dx[i], c.y + 102, n, 11, 800, "#555")).join("");

/* ---------- Montages ---------- */
const MONTAGES = [
  { id: "simple", titre: "Simple allumage", niveau: 1,
    consigne: "Commander la lampe du séjour depuis un interrupteur, à l'entrée de la pièce.",
    aide: "La phase va à la borne L de l'interrupteur. Sa borne 1 renvoie le retour lampe à la borne L du DCL. Le neutre va directement à la borne N du DCL, la terre à sa borne ⏚. Tout passe par la boîte de dérivation.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 300, y: 300, w: 560, n: 4 }, { type: "lampe", id: "lp", nom: "Lampe du séjour", x: 600, y: 60 }, { type: "inter", id: "s1", nom: "Interrupteur", x: 580, y: 610 }],
    essais: (s) => combinaisons(["s1"]).map((c) => ({ contacts: c, attendu: { lp: c.s1 }, texte: `interrupteur sur ${c.s1 ? "I" : "O"}` })) },
  { id: "double", titre: "Double allumage", niveau: 1,
    consigne: "Commander séparément le plafonnier et les appliques de la chambre, depuis un interrupteur double à l'entrée.",
    aide: "La phase va à la borne L (commune) de l'interrupteur double. La borne 1 part vers le plafonnier, la borne 2 vers les appliques (deux retours lampe). Neutre et terre vont directement aux deux DCL.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 300, y: 300, w: 600, n: 5 }, { type: "lampe", id: "lp1", nom: "Plafonnier", x: 470, y: 60 }, { type: "lampe", id: "lp2", nom: "Appliques", x: 820, y: 60 }, { type: "double", id: "d", nom: "Interrupteur double", x: 600, y: 610 }],
    essais: () => combinaisons(["d:a", "d:b"]).map((c) => ({ contacts: c, attendu: { lp1: c["d:a"], lp2: c["d:b"] }, texte: `touche gauche ${c["d:a"] ? "I" : "O"}, touche droite ${c["d:b"] ? "I" : "O"}` })) },
  { id: "vav", titre: "Va-et-vient", niveau: 2,
    consigne: "Commander la lampe du couloir depuis ses deux extrémités.",
    aide: "La phase arrive sur la borne commune (L) du premier va-et-vient. Ses bornes 1 et 2 sont reliées aux bornes 1 et 2 du second par deux navettes. La borne commune du second envoie le retour lampe au DCL. Neutre et terre vont directement au DCL.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 300, y: 300, w: 600, n: 5 }, { type: "lampe", id: "lp", nom: "Lampe du couloir", x: 600, y: 60 }, { type: "vav", id: "v1", nom: "Va-et-vient 1", x: 400, y: 610 }, { type: "vav", id: "v2", nom: "Va-et-vient 2", x: 820, y: 610 }],
    essais: () => combinaisons(["v1", "v2"]).map((c) => ({ contacts: c, attendu: { lp: c.v1 !== c.v2 }, texte: `va-et-vient 1 sur ${c.v1 ? 2 : 1}, va-et-vient 2 sur ${c.v2 ? 2 : 1}` })),
    inverse: true },
  { id: "perm", titre: "Va-et-vient et permutateur", niveau: 3,
    consigne: "Commander la lampe de la cage d'escalier depuis trois endroits : en bas, au palier, en haut.",
    aide: "Va-et-vient en bas : phase sur la commune, navettes vers les bornes 1 et 2 du permutateur. Bornes 3 et 4 du permutateur : navettes vers les bornes 1 et 2 du va-et-vient du haut. Commune du va-et-vient du haut : retour lampe. Neutre et terre directement au DCL.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 260, y: 300, w: 760, n: 7 }, { type: "lampe", id: "lp", nom: "Lampe de l'escalier", x: 640, y: 60 }, { type: "vav", id: "v1", nom: "Va-et-vient (bas)", x: 330, y: 610 }, { type: "perm", id: "p", nom: "Permutateur (palier)", x: 640, y: 610 }, { type: "vav", id: "v2", nom: "Va-et-vient (haut)", x: 950, y: 610 }],
    essais: () => combinaisons(["v1", "p", "v2"]).map((c) => ({ contacts: c, attendu: { lp: (c.v1 !== c.v2) !== c.p }, texte: `bas ${c.v1 ? 2 : 1}, permutateur ${c.p ? "croisé" : "droit"}, haut ${c.v2 ? 2 : 1}` })),
    inverse: true },
  { id: "tl", titre: "Télérupteur (montage 3 fils)", niveau: 3,
    consigne: "Commander l'éclairage du couloir par un télérupteur et deux boutons-poussoirs.",
    aide: "La phase va à la borne 1 du télérupteur et aux deux boutons-poussoirs. Les boutons (en parallèle) renvoient le retour bouton-poussoir à A1. A2 va au neutre. La borne 2 envoie le retour lampe au DCL. Neutre et terre directement au DCL.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 300, y: 300, w: 520, n: 6 }, { type: "lampe", id: "lp", nom: "Lampe du couloir", x: 560, y: 60 }, { type: "tl", id: "t", nom: "Télérupteur", x: 1000, y: 330 }, { type: "bp", id: "b1", nom: "Bouton 1", x: 420, y: 620 }, { type: "bp", id: "b2", nom: "Bouton 2", x: 720, y: 620 }],
    dev: () => DEVELOPPES.tl(2),
    sequence: [{ appui: "b1", attendu: { lp: true } }, { appui: "b2", attendu: { lp: false } }, { appui: "b1", attendu: { lp: true } }] },
  { id: "deuxLampes", titre: "Deux lampes sur un interrupteur", niveau: 1,
    consigne: "Allumer ensemble les deux lampes du salon depuis un seul interrupteur.",
    aide: "La phase va à la borne L de l'interrupteur. Sa borne 1 envoie le retour lampe aux bornes L des deux DCL (les deux lampes sont en parallèle). Le neutre va aux bornes N des deux DCL, la terre à leurs bornes ⏚.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 300, y: 300, w: 560, n: 4 }, { type: "lampe", id: "lp1", nom: "Lampe 1", x: 470, y: 60 }, { type: "lampe", id: "lp2", nom: "Lampe 2", x: 800, y: 60 }, { type: "inter", id: "s1", nom: "Interrupteur", x: 600, y: 610 }],
    essais: () => combinaisons(["s1"]).map((c) => ({ contacts: c, attendu: { lp1: c.s1, lp2: c.s1 }, texte: `interrupteur sur ${c.s1 ? "I" : "O"}` })) },
  { id: "prise", titre: "Prise commandée", niveau: 1,
    consigne: "Dans la chambre, l'interrupteur de l'entrée commande la prise où est branchée la lampe de chevet.",
    aide: "Comme un simple allumage, mais le récepteur est une prise : la phase va à la borne L de l'interrupteur, sa borne 1 va à la borne L de la prise. Neutre à la borne N de la prise, terre à sa borne ⏚.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 300, y: 300, w: 560, n: 4 }, { type: "prise", id: "pr", nom: "Prise commandée", x: 700, y: 70 }, { type: "inter", id: "s1", nom: "Interrupteur", x: 520, y: 610 }],
    essais: () => combinaisons(["s1"]).map((c) => ({ contacts: c, attendu: { pr: c.s1 }, texte: `interrupteur sur ${c.s1 ? "I" : "O"}` })) },
  { id: "vav2", titre: "Va-et-vient, deux lampes", niveau: 2,
    consigne: "Commander les deux lampes d'un long couloir depuis ses deux extrémités.",
    aide: "Comme le va-et-vient : phase sur la commune du premier, deux navettes vers le second. La commune du second envoie le retour lampe aux deux DCL, en parallèle. Neutre et terre aux deux DCL.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 280, y: 300, w: 640, n: 6 }, { type: "lampe", id: "lp1", nom: "Lampe 1", x: 470, y: 60 }, { type: "lampe", id: "lp2", nom: "Lampe 2", x: 800, y: 60 }, { type: "vav", id: "v1", nom: "Va-et-vient 1", x: 400, y: 610 }, { type: "vav", id: "v2", nom: "Va-et-vient 2", x: 840, y: 610 }],
    essais: () => combinaisons(["v1", "v2"]).map((c) => ({ contacts: c, attendu: { lp1: c.v1 === c.v2, lp2: c.v1 === c.v2 }, texte: `va-et-vient 1 sur ${c.v1 ? 2 : 1}, va-et-vient 2 sur ${c.v2 ? 2 : 1}` })),
    inverse: true },
  { id: "perm2", titre: "Quatre points de commande", niveau: 3,
    consigne: "Commander la lampe d'un grand couloir depuis quatre endroits : deux va-et-vient aux bouts, deux permutateurs entre eux.",
    aide: "Va-et-vient 1 : phase sur la commune, navettes vers les bornes 1 et 2 du permutateur 1. Ses bornes 3 et 4 vont aux bornes 1 et 2 du permutateur 2. Les bornes 3 et 4 du permutateur 2 vont aux bornes 1 et 2 du va-et-vient 2, dont la commune envoie le retour lampe. Neutre et terre au DCL.",
    composants: [{ type: "alim", x: 20, y: 280 }, { type: "boite", x: 210, y: 300, w: 840, n: 8 }, { type: "lampe", id: "lp", nom: "Lampe du couloir", x: 640, y: 60 }, { type: "vav", id: "v1", nom: "Va-et-vient 1", x: 270, y: 610 }, { type: "perm", id: "p1", nom: "Permutateur 1", x: 510, y: 610 }, { type: "perm", id: "p2", nom: "Permutateur 2", x: 770, y: 610 }, { type: "vav", id: "v2", nom: "Va-et-vient 2", x: 1010, y: 610 }],
    essais: () => combinaisons(["v1", "p1", "p2", "v2"]).map((c) => ({ contacts: c, attendu: { lp: ((c.v1 === c.v2) !== c.p1) !== c.p2 }, texte: `${c.v1 ? 2 : 1} · ${c.p1 ? "croisé" : "droit"} · ${c.p2 ? "croisé" : "droit"} · ${c.v2 ? 2 : 1}` })),
    inverse: true },
  { id: "tl3", titre: "Télérupteur, trois boutons", niveau: 2,
    consigne: "Un long couloir avec trois portes : un bouton-poussoir à chaque porte commande l'éclairage par télérupteur.",
    aide: "La phase va à la borne 1 du télérupteur et aux trois boutons-poussoirs. Les trois boutons, en parallèle, renvoient le retour bouton-poussoir à A1. A2 au neutre. La borne 2 envoie le retour lampe au DCL. Neutre et terre au DCL.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 260, y: 300, w: 600, n: 6 }, { type: "lampe", id: "lp", nom: "Lampe du couloir", x: 560, y: 60 }, { type: "tl", id: "t", nom: "Télérupteur", x: 1030, y: 330 }, { type: "bp", id: "b1", nom: "Bouton 1", x: 330, y: 620 }, { type: "bp", id: "b2", nom: "Bouton 2", x: 560, y: 620 }, { type: "bp", id: "b3", nom: "Bouton 3", x: 790, y: 620 }],
    dev: () => DEVELOPPES.tl(3),
    sequence: [{ appui: "b1", attendu: { lp: true } }, { appui: "b3", attendu: { lp: false } }, { appui: "b2", attendu: { lp: true } }, { appui: "b1", attendu: { lp: false } }] },
  { id: "minuterie", titre: "Minuterie de cage d'escalier", niveau: 2,
    consigne: "Dans l'escalier d'un immeuble, deux boutons-poussoirs allument la lumière, qui s'éteint toute seule après la durée réglée.",
    aide: "La minuterie s'alimente : phase sur sa borne L, neutre sur sa borne N. La phase va aussi aux deux boutons-poussoirs, dont les retours (en parallèle) reviennent sur la borne BP. La sortie « lampe » de la minuterie envoie le retour lampe au DCL. Neutre et terre au DCL.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 280, y: 300, w: 560, n: 6 }, { type: "lampe", id: "lp", nom: "Lampe de l'escalier", x: 560, y: 60 }, { type: "minuterie", id: "mn", nom: "Minuterie", x: 1030, y: 330 }, { type: "bp", id: "b1", nom: "Bouton (rez-de-chaussée)", x: 420, y: 620 }, { type: "bp", id: "b2", nom: "Bouton (1er étage)", x: 720, y: 620 }],
    sequence: [{ appui: "b1", attendu: { lp: true } }, { temps: true, attendu: { lp: false } }, { appui: "b2", attendu: { lp: true } }] },
  { id: "detecteur", titre: "Détecteur de présence", niveau: 2,
    consigne: "Le couloir s'éclaire tout seul quand quelqu'un passe, grâce à un détecteur de présence.",
    aide: "Le détecteur est un appareil électronique : il lui faut la phase (borne L) ET le neutre (borne N) pour fonctionner. Sa borne de sortie envoie le retour lampe au DCL. Neutre et terre au DCL.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 300, y: 300, w: 560, n: 4 }, { type: "lampe", id: "lp", nom: "Lampe du couloir", x: 600, y: 60 }, { type: "detecteur", id: "dt", nom: "Détecteur", x: 600, y: 610 }],
    essais: () => combinaisons(["dt"]).map((c) => ({ contacts: c, attendu: { lp: c.dt }, texte: c.dt ? "quelqu'un passe" : "personne" })) },
  { id: "hc", titre: "Contacteur heures creuses", niveau: 3,
    consigne: "Le chauffe-eau ne doit chauffer qu'en heures creuses, commandé par le contact C1-C2 du compteur.",
    aide: "Commande : la phase va à C1 du compteur (en vrai, par un disjoncteur 2 A) ; C2 va à A1 de la bobine ; A2 au neutre. Puissance (en vrai, disjoncteur 20 A et 2,5 mm²) : phase sur la borne 1 du contacteur, borne 2 vers la borne L du chauffe-eau ; neutre sur la borne 3, borne 4 vers la borne N du chauffe-eau. La terre va directement au chauffe-eau.",
    composants: [{ type: "alim", x: 30, y: 280 }, { type: "boite", x: 260, y: 300, w: 520, n: 6 }, { type: "chauffeEau", id: "ce", nom: "Chauffe-eau", x: 560, y: 90 }, { type: "compteur", id: "cpt", nom: "Compteur", x: 950, y: 110 }, { type: "contacteur", id: "km", nom: "Contacteur", x: 980, y: 520 }],
    essais: () => combinaisons(["cpt"]).map((c) => ({ contacts: c, attendu: { ce: c.cpt }, texte: c.cpt ? "heures creuses" : "heures pleines" })) },
];
MONTAGES.sort((a, b) => a.niveau - b.niveau);
const DEV_PAR_ID = { simple: "simple", double: "double", vav: "vav", perm: "perm", deuxLampes: "deuxLampes", prise: "prise", vav2: "vav2", perm2: "perm2", minuterie: "minuterie", detecteur: "detecteur", hc: "hc" };
const schemaDev = (m) => (m.dev ? m.dev() : DEVELOPPES[DEV_PAR_ID[m.id]]());
function combinaisons(cles) {
  return Array.from({ length: 2 ** cles.length }, (_, n) => Object.fromEntries(cles.map((k, i) => [k, !!(n & (1 << i))])));
}

/* ---------- Simulation ---------- */
function contactsFermes(m, contacts) {
  const ar = [];
  for (const c of m.composants) {
    const k = (s) => `${c.id}-${s}`;
    if (c.type === "inter" && contacts[c.id]) ar.push([k("L"), k("1")]);
    if (c.type === "double") { if (contacts[`${c.id}:a`]) ar.push([k("L"), k("1")]); if (contacts[`${c.id}:b`]) ar.push([k("L"), k("2")]); }
    if (c.type === "vav") ar.push(contacts[c.id] ? [k("C"), k("2")] : [k("C"), k("1")]);
    if (c.type === "perm") { if (contacts[c.id]) ar.push([k("1"), k("4")], [k("2"), k("3")]); else ar.push([k("1"), k("3")], [k("2"), k("4")]); }
    if (c.type === "bp" && contacts[c.id]) ar.push([k("1"), k("2")]);
    if (c.type === "tl" && contacts[c.id]) ar.push([k("1"), k("2")]);
    if (c.type === "minuterie" && contacts[c.id]) ar.push([k("L"), k("S")]);
    if (c.type === "compteur" && contacts[c.id]) ar.push([k("C1"), k("C2")]);
    if (c.type === "detecteur" && contacts[`${c.id}:sortie`]) ar.push([k("L"), k("S")]);
    if (c.type === "contacteur" && contacts[`${c.id}:ferme`]) ar.push([k("1"), k("2")], [k("3"), k("4")]);
  }
  return ar;
}
function charges(m) {
  return m.composants.flatMap((c) => (["lampe", "prise", "chauffeEau"].includes(c.type) ? [[`${c.id}-L`, `${c.id}-N`, c.id]]
    : ["tl", "contacteur"].includes(c.type) ? [[`${c.id}-A1`, `${c.id}-A2`, c.id + "-bobine"]]
    : c.type === "minuterie" ? [[`${c.id}-BP`, `${c.id}-N`, c.id + "-bobine"], [`${c.id}-L`, `${c.id}-N`, c.id + "-bobine-alim"]]
    : c.type === "detecteur" ? [[`${c.id}-L`, `${c.id}-N`, c.id + "-bobine"]] : []));
}
function simuler(m, fils, contacts) {
  const derive = {};
  let r = simuler1(m, fils, { ...contacts });
  for (let i = 0; i < 4; i++) {
    let change = false;
    for (const c of m.composants) {
      if (c.type === "contacteur") { const v = !!r.bobines[c.id]; if (derive[`${c.id}:ferme`] !== v) { derive[`${c.id}:ferme`] = v; change = true; } }
      if (c.type === "detecteur") { const v = !!(contacts[c.id] && r.bobines[c.id]); if (derive[`${c.id}:sortie`] !== v) { derive[`${c.id}:sortie`] = v; change = true; } }
    }
    if (!change) break;
    r = simuler1(m, fils, { ...contacts, ...derive });
  }
  r.derive = derive;
  return r;
}
function simuler1(m, fils, contacts) {
  const parent = {};
  const f = (x) => (parent[x] === undefined || parent[x] === x ? (parent[x] = x) : (parent[x] = f(parent[x])));
  for (const w of fils) parent[f(w.a)] = f(w.b);
  for (const [a, b] of contactsFermes(m, contacts)) parent[f(a)] = f(b);
  const court = f("alim-L") === f("alim-N");
  const terre = f("alim-L") === f("alim-PE");
  const pot = {};
  if (!court && !terre) {
    pot[f("alim-L")] = 230; pot[f("alim-N")] = 0; pot[f("alim-PE")] = 0;
    let change = true;
    while (change) {
      change = false;
      for (const [a, b] of charges(m)) {
        const ga = f(a), gb = f(b);
        if (pot[ga] !== undefined && pot[gb] === undefined) { pot[gb] = pot[ga]; change = true; }
        else if (pot[gb] !== undefined && pot[ga] === undefined) { pot[ga] = pot[gb]; change = true; }
      }
    }
  }
  const alim = (a, b) => !court && !terre && ((pot[f(a)] === 230 && f(b) === f("alim-N")) || (pot[f(b)] === 230 && f(a) === f("alim-N")));
  const lampes = {}, bobines = {};
  for (const [a, b, id] of charges(m)) {
    if (id.endsWith("-bobine-alim")) bobines[id.replace("-bobine-alim", "") + ":alim"] = alim(a, b);
    else (id.endsWith("-bobine") ? bobines : lampes)[id.replace("-bobine", "")] = alim(a, b);
  }
  return { court, terre, lampes, bobines, de: (n) => pot[f(n)] };
}

/* ---------- État ---------- */
let m = null, s = null;
function ouvrir(id) {
  m = MONTAGES.find((x) => x.id === id) || MONTAGES[0];
  const contacts = {};
  for (const c of m.composants) {
    if (["inter", "vav", "perm", "bp", "tl", "minuterie", "detecteur", "compteur", "contacteur"].includes(c.type)) contacts[c.id] = false;
    if (c.type === "double") { contacts[`${c.id}:a`] = false; contacts[`${c.id}:b`] = false; }
  }
  s = { fils: [], couleur: "phase", choix: null, outil: "fil", sousTension: false, contacts, resultat: null, bobinePrec: {}, aide: 0, verif: null, fautes: [], debut: Date.now(), message: null };
}
const bornes = () => m.composants.flatMap((c) => COMPOSANTS[c.type](c).bornes);
const borne = (id) => bornes().find((b) => b.id === id);
function dire(t, type = "info") { s.message = { t, type }; }
function actualiser() {
  if (!s.sousTension) { s.resultat = null; return; }
  let r = simuler(m, s.fils, s.contacts);
  // télérupteur : front montant de la bobine
  for (const c of m.composants.filter((x) => x.type === "tl" || x.type === "minuterie")) {
    const en = r.bobines[c.id] && (c.type === "tl" || r.bobines[c.id + ":alim"]);
    if (en && !s.bobinePrec[c.id]) { s.contacts[c.id] = c.type === "tl" ? !s.contacts[c.id] : true; sons.disjoncteur(); r = simuler(m, s.fils, s.contacts); }
    s.bobinePrec[c.id] = r.bobines[c.id];
  }
  for (const c of m.composants.filter((x) => x.type === "contacteur")) {
    const v = !!(r.derive && r.derive[`${c.id}:ferme`]);
    if (v !== !!s.contacts[c.id]) sons.disjoncteur();
    s.contacts[c.id] = v;
  }
  s.resultat = r;
  if (r.court) { s.sousTension = false; s.resultat = null; sons.disjoncteur(); dire("Clac ! Court-circuit : la phase touche directement le neutre. Le disjoncteur a déclenché.", "danger"); }
  else if (r.terre) { s.sousTension = false; s.resultat = null; sons.disjoncteur(); dire("Clac ! La phase est reliée à la terre : le différentiel a déclenché.", "danger"); }
}

/* ---------- Vérification complète ---------- */
const RECEPTEURS = ["lampe", "prise", "chauffeEau"];
// Joue une séquence d'actions (appuis sur boutons, temps qui passe, réglages) comme un vrai essai.
function jouerSequence(etapes, contactsDepart) {
  const contacts = { ...contactsDepart };
  const prec = {};
  const resultats = [];
  const regler = () => {
    let r = simuler(m, s.fils, contacts);
    for (const c of m.composants.filter((x) => x.type === "tl" || x.type === "minuterie")) {
      const en = r.bobines[c.id] && (c.type === "tl" || r.bobines[c.id + ":alim"]);
      if (en && !prec[c.id]) { contacts[c.id] = c.type === "tl" ? !contacts[c.id] : true; r = simuler(m, s.fils, contacts); }
      prec[c.id] = r.bobines[c.id];
    }
    return r;
  };
  resultats.push({ e: { debut: true }, r: regler() });
  for (const e of etapes) {
    let r;
    if (e.appui) { contacts[e.appui] = true; r = regler(); if (r.court || r.terre) { resultats.push({ e, r }); break; } contacts[e.appui] = false; r = regler(); }
    else if (e.temps) { for (const c of m.composants.filter((x) => x.type === "minuterie")) contacts[c.id] = false; r = regler(); }
    else { Object.assign(contacts, e.contacts || {}); r = regler(); }
    resultats.push({ e, r });
  }
  return resultats;
}
const texteEtape = (e) => (e.appui ? `Appui sur « ${nomDe(e.appui)} »` : e.temps ? "Après la durée réglée" : e.texte);
function verifier() {
  const lignes = [], fautes = [], remarques = [];
  s.incomplet = false;
  let fonctionne = true;
  const controlePhase = (r, attendu) => {
    for (const id of Object.keys(attendu)) if (!r.lampes[id] && r.de(`${id}-L`) === 230 && !fautes.some((f) => f.startsWith(nomDe(id))))
      fautes.push(`${nomDe(id)} : à l'arrêt, sa borne L reste sous tension. La commande coupe le neutre au lieu de la phase : danger pour qui intervient dessus.`);
  };
  const decrire = (r, attendu) => Object.keys(attendu).map((id) => `${nomDe(id)} : ${m.composants.find((c) => c.id === id).type === "chauffeEau" ? (r.lampes[id] ? "chauffe" : "à l'arrêt") : `lumière ${r.lampes[id] ? "allumée" : "éteinte"}`}`).join(", ");
  if (m.sequence) {
    // Télérupteur et minuterie : chaque bouton raccordé est essayé à part, quel que soit l'état de départ de la lampe.
    const tl = m.composants.some((c) => c.type === "tl");
    const lampe = m.composants.find((c) => c.type === "lampe").id;
    const cable = (c) => s.fils.some((w) => [w.a, w.b].some((x) => x.startsWith(`${c.id}-`)));
    const bps = m.composants.filter((c) => c.type === "bp");
    const raccordes = bps.filter(cable);
    if (!raccordes.length) { fonctionne = false; lignes.push([false, "Aucun bouton-poussoir n'est raccordé."]); }
    for (const bp of bps.filter((c) => !cable(c))) { remarques.push(`« ${bp.nom} » n'est pas raccordé : la consigne en demande ${bps.length}.`); s.incomplet = true; }
    for (const bp of raccordes) {
      const etapes = tl ? [{ appui: bp.id }, { appui: bp.id }] : [{ temps: true }, { appui: bp.id }, { temps: true }];
      const res = jouerSequence(etapes, s.contacts);
      const panne = res.find(({ r }) => r.court || r.terre);
      if (panne) { fonctionne = false; lignes.push([false, `« ${bp.nom} » : ${panne.r.court ? "court-circuit" : "phase reliée à la terre"}`]); continue; }
      const etats = res.map(({ r }) => r.lampes[lampe]);
      const ok = tl ? etats[1] !== etats[0] && etats[2] === etats[0] : !etats[1] && etats[2] && !etats[3];
      if (!ok) fonctionne = false;
      lignes.push([ok, tl
        ? `« ${bp.nom} » : ${ok ? "un appui allume, l'appui suivant éteint" : `la lampe ${etats[1] === etats[0] ? "ne change pas d'état quand on appuie" : "ne revient pas à son état au deuxième appui"}`}`
        : `« ${bp.nom} » : ${ok ? "un appui allume, la lampe s'éteint seule après la durée réglée" : etats[2] ? "la lampe reste allumée après la durée réglée" : "un appui n'allume pas la lampe"}`]);
      for (const { r } of res) controlePhase(r, { [lampe]: true });
    }
  } else {
    const essais = m.essais(s);
    // Va-et-vient : deux sens de navettes sont justes ; on accepte la logique inverse si elle est cohérente.
    if (m.inverse) {
      const inverse = essais.every((e) => { const r = simuler(m, s.fils, e.contacts); return !r.court && !r.terre && Object.entries(e.attendu).every(([id, v]) => r.lampes[id] === !v); });
      if (inverse) for (const e of essais) for (const k of Object.keys(e.attendu)) e.attendu[k] = !e.attendu[k];
    }
    for (const e of essais) {
      const r = simuler(m, s.fils, e.contacts);
      if (r.court || r.terre) { fonctionne = false; lignes.push([false, `${e.texte} : ${r.court ? "court-circuit" : "phase reliée à la terre"}`]); continue; }
      const ok = Object.entries(e.attendu).every(([id, v]) => r.lampes[id] === v);
      if (!ok) fonctionne = false;
      lignes.push([ok, `${e.texte} : ${decrire(r, e.attendu)}`]);
      controlePhase(r, e.attendu);
    }
  }
  // groupes reliés par les fils (et, pour les rôles, par les pôles neutres des contacteurs)
  const groupes = (avecPoles) => {
    const g = {}; const f = (x) => (g[x] === undefined || g[x] === x ? (g[x] = x) : (g[x] = f(g[x])));
    for (const w of s.fils) g[f(w.a)] = f(w.b);
    if (avecPoles) for (const c of m.composants.filter((x) => x.type === "contacteur")) g[f(`${c.id}-3`)] = f(`${c.id}-4`);
    return f;
  };
  const fFils = groupes(false), fRole = groupes(true);
  for (const c of m.composants.filter((x) => RECEPTEURS.includes(x.type)))
    if (fFils(`${c.id}-PE`) !== fFils("alim-PE")) fautes.push(`${c.nom} : sa borne de terre n'est pas reliée au conducteur de protection.`);
  const role = (w) => fRole(w.a) === fRole("alim-N") ? "neutre" : fRole(w.a) === fRole("alim-PE") ? "terre" : fRole(w.a) === fRole("alim-L") ? "phase" : "commande";
  const lampesL = m.composants.filter((x) => x.type === "lampe").map((x) => `${x.id}-L`);
  for (const w of s.fils) {
    const r = role(w);
    if (r === "neutre" && w.couleur !== "neutre") fautes.push("Un fil du neutre n'est pas bleu : le bleu clair est réservé au neutre, et le neutre se repère toujours en bleu.");
    if (r !== "neutre" && w.couleur === "neutre") fautes.push("Un fil bleu sert à autre chose que le neutre : le bleu clair est réservé au neutre.");
    if (r === "terre" && w.couleur !== "terre") fautes.push("Un fil de terre n'est pas vert-jaune : le vert-jaune est obligatoire pour la protection.");
    if (r !== "terre" && w.couleur === "terre") fautes.push("Un fil vert-jaune sert à autre chose que la terre : c'est interdit.");
    if (r === "commande" && lampesL.some((l) => fFils(w.a) === fFils(l)) && w.couleur !== "retour") remarques.push("Retour lampe : sur ce site, on le câble en orange pour le reconnaître (convention, pas obligation de la norme).");
    if (r === "commande" && m.composants.some((c) => (c.type === "tl" && fFils(w.a) === fFils(`${c.id}-A1`)) || (c.type === "minuterie" && fFils(w.a) === fFils(`${c.id}-BP`))) && w.couleur !== "blanc") remarques.push("Retour bouton-poussoir : sur ce site, on le câble en blanc pour le reconnaître (convention).");
  }
  for (const c of m.composants.filter((x) => x.type === "contacteur"))
    if (!s.fils.some((w) => [w.a, w.b].includes(`${c.id}-3`)) || !s.fils.some((w) => [w.a, w.b].includes(`${c.id}-4`)))
      remarques.push("Le neutre du chauffe-eau devrait lui aussi traverser le contacteur (bornes 3 et 4), comme la phase : le contacteur coupe alors les deux conducteurs (voir le module 19).");
  const uniques = (t) => [...new Set(t)];
  s.verif = { lignes, fonctionne, fautes: uniques(fautes), remarques: uniques(remarques) };
  if (fonctionne && !s.verif.fautes.length) {
    const etoiles = Math.max(1, 3 - s.aide - (s.fautes.length ? 1 : 0) - (s.incomplet ? 1 : 0));
    s.verif.etoiles = etoiles; sons.succes(); crediterElectrons(etoiles * 10);
  } else sons.rate();
}
const nomDe = (id) => m.composants.find((c) => c.id === id).nom;

/* ---------- Rendu ---------- */
function filSVG(w, i) {
  const a = borne(w.a), b = borne(w.b);
  const creux = Math.min(140, 40 + Math.hypot(a.x - b.x, a.y - b.y) * 0.18);
  const d = `M${a.x} ${a.y} C ${a.x} ${a.y + creux}, ${b.x} ${b.y + creux}, ${b.x} ${b.y}`;
  return `<g class="sc-fil ${s.outil === "couper" ? "coupable" : ""}" data-fil="${i}">${conducteur(d, w.couleur === "noir" ? "#1f1f1f" : w.couleur, 7)}<path d="${d}" stroke="transparent" stroke-width="20" fill="none"/></g>`;
}
function rendre() {
  if (!m) { menu(); return; }
  const lesBornes = bornes();
  const nbParBorne = {}; for (const w of s.fils) { nbParBorne[w.a] = (nbParBorne[w.a] || 0) + 1; nbParBorne[w.b] = (nbParBorne[w.b] || 0) + 1; }
  const svg = `<svg class="sc-platine" viewBox="0 0 1200 750" role="img" aria-label="Platine de câblage : ${m.titre}">${DEFS}
    <rect width="1200" height="750" fill="#c9ab84"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${i * 64 + 20} H1200" stroke="#b8976d" stroke-width="2" opacity=".5"/>`).join("")}
    ${m.composants.map((c) => COMPOSANTS[c.type](c).dessin(s)).join("")}
    ${s.fils.map(filSVG).join("")}
    ${lesBornes.map((b) => `<g class="sc-borne ${s.choix === b.id ? "choisie" : ""}" data-b="${b.id}" role="button" tabindex="0" aria-label="${b.label}">
      <circle cx="${b.x}" cy="${b.y}" r="22" fill="transparent"/>${vis(b.x, b.y, b.id.startsWith("w") ? 9 : 11, { rot: 25 })}
      ${s.choix === b.id ? `<circle cx="${b.x}" cy="${b.y}" r="18" fill="none" stroke="#f2c230" stroke-width="4"/>` : ""}
      ${nbParBorne[b.id] > 2 && !b.id.startsWith("w") ? `<circle cx="${b.x + 14}" cy="${b.y - 14}" r="9" fill="#d23a2e"/>${texte(b.x + 14, b.y - 10, String(nbParBorne[b.id]), 11, 800, "#fff")}` : ""}</g>`).join("")}
  </svg>`;
  const v = s.verif;
  racine.innerHTML = `
    <div class="im-hud"><div class="im-titre"><b>${m.titre}</b><span>${m.consigne}</span></div>
      <div class="im-compteurs"><span>${s.fils.length} fil${s.fils.length > 1 ? "s" : ""}</span><span>${s.sousTension ? "⚡ sous tension" : "🔒 hors tension"}</span></div></div>
    <div class="sc-zone">
    <div class="im-cadre sc-cadre">${svg}${s.message ? `<p class="im-bulle ${s.message.type}" role="status">${s.message.t}</p>` : ""}</div>
    <div class="im-barre sc-colonne">
      ${s.hesitation ? `<div class="sc-hesite" role="group" aria-label="Quelle borne ?"><b>Quelle borne ?</b>${s.hesitation.map((id) => `<button type="button" data-hesite="${id}">${borne(id).label}</button>`).join("")}<button type="button" data-hesite="">Aucune</button></div>` : ""}
      <div class="sc-palette" role="group" aria-label="Couleur du fil">${COULEURS.map(([k, l, c]) => `<button type="button" class="sc-bobine ${s.couleur === k && s.outil === "fil" ? "actif" : ""}" data-couleur="${k}" title="${l}"><span style="background:${k === "terre" ? "repeating-linear-gradient(90deg,#3d9a3d 0 6px,#e8cf2c 6px 12px)" : c}"></span>${l}</button>`).join("")}</div>
      <div class="im-outils">
        <button type="button" class="${s.outil === "couper" ? "actif" : ""}" data-action="couper">✂️ Couper un fil</button>
        <button type="button" data-action="annuler">↩ Annuler</button>
        <button type="button" class="${s.sousTension ? "actif" : ""}" data-action="tension">${s.sousTension ? "🔒 Couper le courant" : "⚡ Mettre sous tension"}</button>
        <button type="button" data-action="verifier">🔍 Faire vérifier</button>
        ${m.composants.some((c) => c.type === "minuterie") ? `<button type="button" data-action="temps">⏱ Laisser passer 3 minutes</button>` : ""}
        <button type="button" data-action="aide">${s.aide === 0 ? "📐 Schéma développé (−1 ★)" : s.aide === 1 ? "📝 Câblage pas à pas (−1 ★)" : "Aide complète affichée ↓"}</button>
      </div>
    </div>
    </div>
    ${s.aide >= 1 ? `<div class="sc-aide"><b>Schéma développé</b> : phase en haut, neutre en bas, appareils au repos. Lis-le de haut en bas, comme le chemin du courant.${schemaDev(m)}</div>` : ""}
    ${s.aide >= 2 ? `<p class="sc-aide"><b>Câblage pas à pas :</b> ${m.aide}</p>` : ""}
    ${v ? `<section class="sc-verif">
      <h2>${v.etoiles ? `${"★".repeat(v.etoiles)}${"☆".repeat(3 - v.etoiles)} Montage validé` : v.fonctionne ? "Ça fonctionne, mais il reste des fautes" : "Le montage ne fonctionne pas encore"}</h2>
      <ul>${v.lignes.map(([ok, t]) => `<li class="${ok ? "ok" : "ko"}">${ok ? "✔" : "✘"} ${t}</li>`).join("")}</ul>
      ${v.fautes.length ? `<h3>Fautes</h3><ul>${v.fautes.map((t) => `<li class="ko">${t}</li>`).join("")}</ul>` : ""}
      ${v.remarques.length ? `<h3>Remarques</h3><ul>${v.remarques.map((t) => `<li>${t}</li>`).join("")}</ul>` : ""}
      ${s.fautes.length ? `<p class="im-alerte">${s.fautes.join(" ")}</p>` : ""}
      ${v.etoiles ? `<button type="button" class="im-plein" data-action="suivant">Montage suivant</button>` : ""}</section>` : ""}
    <p class="im-astuce">Choisis une couleur, touche une borne puis une autre : le fil se pose. Les connecteurs de la boîte acceptent plusieurs fils. Câble hors tension, puis mets sous tension et actionne les interrupteurs. <button type="button" class="im-lien" data-action="menu">Changer de montage</button></p>`;
}
function menu() {
  const faits = lireFaits();
  racine.innerHTML = `<div class="im-menu"><p class="im-kicker">ATELIER SCHÉMAS</p><h2>Câble le montage</h2>
    <p>Comme à l'épreuve : une platine, une boîte de dérivation, des fils de couleur. Tu câbles hors tension, tu mets sous tension, tu essaies… et le contrôleur vérifie tout.</p>
    <div class="im-cartes">${MONTAGES.map((x) => `<button type="button" class="im-carte" data-montage="${x.id}"><span>${"●".repeat(x.niveau)}${"○".repeat(3 - x.niveau)} niveau ${x.niveau}${faits[x.id] ? ` · ${"★".repeat(faits[x.id])}` : ""}</span><b>${x.titre}</b></button>`).join("")}</div>
    <p class="im-petit"><a href="atelier-depannage.html">Et pour chercher des pannes : l'atelier dépannage →</a></p></div>`;
}
const CLE = "apprendreelec-schemas-v1";
function lireFaits() { try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch { return {}; } }
function noterFait(id, n) { try { const f = lireFaits(); f[id] = Math.max(f[id] || 0, n); localStorage.setItem(CLE, JSON.stringify(f)); } catch { /* stockage indisponible */ } }

/* ---------- Événements ---------- */
// Sur la platine, un toucher près d'une borne la choisit (la plus proche) : pas besoin de viser la vis au millimètre.
function bornePres(ev) {
  const svg = racine.querySelector(".sc-platine");
  if (!svg || !m || s.outil !== "fil") return null;
  const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  const echelle = 1200 / svg.getBoundingClientRect().width;
  const portee = Math.max(30, 24 * echelle);
  const proches = bornes().map((b) => ({ id: b.id, d: Math.hypot(b.x - p.x, b.y - p.y) })).filter((b) => b.d < portee).sort((a, b) => a.d - b.d);
  if (!proches.length) return null;
  // Une seule borne sous le doigt, ou une nettement plus proche : on la prend. Sinon, on demande laquelle.
  if (proches.length === 1 || proches[0].d < 0.5 * proches[1].d) return proches[0].id;
  s.hesitation = proches.slice(0, 4).map((b) => b.id);
  return "?";
}
racine.addEventListener("click", (ev) => {
  let t = ev.target.closest("[data-b],[data-fil],[data-sw],[data-bp],[data-couleur],[data-action],[data-montage],[data-hesite]");
  if (t && t.dataset.hesite !== undefined) { const id = t.dataset.hesite; s.hesitation = null; t = id ? { dataset: { b: id } } : null; if (!t) { rendre(); return; } }
  if ((!t || t.dataset.fil !== undefined) && ev.target.closest(".sc-platine") && s && s.outil === "fil") {
    const id = bornePres(ev);
    if (id === "?") { rendre(); return; }
    if (id) t = { dataset: { b: id } };
  }
  if (!t) return;
  const d = t.dataset;
  if (d.montage) { ouvrir(d.montage); history.replaceState(null, "", `?m=${d.montage}`); rendre(); racine.scrollIntoView({ block: "start" }); return; }
  if (d.action === "menu") { m = null; history.replaceState(null, "", location.pathname); rendre(); return; }
  s.message = null;
  if (d.couleur) { s.couleur = d.couleur; s.outil = "fil"; }
  else if (d.b && s.outil === "fil") {
    if (!s.choix) { s.choix = d.b; sons.clip(); }
    else if (s.choix === d.b) s.choix = null;
    else {
      if (s.sousTension) {
        if (!s.fautes.includes("Tu as câblé sous tension.")) s.fautes.push("Tu as câblé sous tension.");
        sons.zap(); dire("⚡ On ne câble jamais sous tension ! Coupe le courant d'abord.", "danger"); s.choix = null;
      } else {
        s.fils.push({ a: s.choix, b: d.b, couleur: s.couleur }); s.choix = null; sons.vis(); s.verif = null;
      }
    }
  } else if (d.fil !== undefined && s.outil === "couper") {
    if (s.sousTension) { sons.zap(); dire("⚡ Couper un fil sous tension ? Jamais. Coupe le courant d'abord.", "danger"); if (!s.fautes.includes("Tu as voulu couper un fil sous tension.")) s.fautes.push("Tu as voulu couper un fil sous tension."); }
    else { s.fils.splice(Number(d.fil), 1); sons.clip(); s.verif = null; }
  } else if (d.sw) { s.contacts[d.sw] = !s.contacts[d.sw]; sons.interrupteur(); actualiser(); }
  else if (d.bp) {
    s.contacts[d.bp] = true; sons.interrupteur(); actualiser();
    if (s.sousTension) { s.contacts[d.bp] = false; actualiser(); }
    else s.contacts[d.bp] = false;
  } else if (d.action === "couper") { s.outil = s.outil === "couper" ? "fil" : "couper"; s.choix = null; }
  else if (d.action === "annuler") { if (s.sousTension) dire("Coupe le courant avant de toucher au câblage.", "info"); else { s.fils.pop(); s.verif = null; } }
  else if (d.action === "tension") { s.sousTension = !s.sousTension; sons.disjoncteur(); actualiser(); if (s.sousTension && !s.message) dire("Sous tension. Actionne les interrupteurs pour essayer.", "ok"); }
  else if (d.action === "verifier") { verifier(); if (s.verif.etoiles) noterFait(m.id, s.verif.etoiles); }
  else if (d.action === "aide") s.aide = Math.min(2, s.aide + 1);
  else if (d.action === "temps") { for (const c of m.composants.filter((x) => x.type === "minuterie")) s.contacts[c.id] = false; actualiser(); dire("Trois minutes plus tard…", "info"); }
  else if (d.action === "suivant") { const i = MONTAGES.indexOf(m); ouvrir(MONTAGES[(i + 1) % MONTAGES.length].id); history.replaceState(null, "", `?m=${m.id}`); }
  rendre();
  if (d.action === "verifier") racine.querySelector(".sc-verif")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (d.action === "aide") racine.querySelector(".sc-aide:last-of-type")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
racine.addEventListener("keydown", (ev) => {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches("[role=button]")) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
});
brancherBoutonSons();
const depart = new URLSearchParams(location.search).get("m");
if (depart) ouvrir(depart);
rendre();
