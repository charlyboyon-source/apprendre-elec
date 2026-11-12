// Atelier schémas : câbler soi-même un montage sur une platine, le mettre sous tension, l'essayer, le faire vérifier.
// Fils tirés de borne à borne (couleur au choix), boîte de dérivation à connecteurs, simulation électrique,
// contrôle automatique : fonctionnement dans toutes les positions, court-circuit, défaut à la terre, phase coupée, terre, couleurs.
import "../../js/page.js";
import { crediterElectrons } from "../../js/progression.js";
import { brancherBoutonSons } from "../../js/audio.js";
import { DEFS, vis, conducteur, texte } from "../immersif/commun.js";
import { sons } from "../immersif/sons.js";

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
    sequence: true },
];
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
  }
  return ar;
}
function charges(m) {
  return m.composants.flatMap((c) => (c.type === "lampe" ? [[`${c.id}-L`, `${c.id}-N`, c.id]] : c.type === "tl" ? [[`${c.id}-A1`, `${c.id}-A2`, c.id + "-bobine"]] : []));
}
function simuler(m, fils, contacts) {
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
  for (const [a, b, id] of charges(m)) (id.endsWith("-bobine") ? bobines : lampes)[id.replace("-bobine", "")] = alim(a, b);
  return { court, terre, lampes, bobines, de: (n) => pot[f(n)] };
}

/* ---------- État ---------- */
let m = null, s = null;
function ouvrir(id) {
  m = MONTAGES.find((x) => x.id === id) || MONTAGES[0];
  const contacts = {};
  for (const c of m.composants) {
    if (["inter", "vav", "perm", "bp", "tl"].includes(c.type)) contacts[c.id] = false;
    if (c.type === "double") { contacts[`${c.id}:a`] = false; contacts[`${c.id}:b`] = false; }
  }
  s = { fils: [], couleur: "phase", choix: null, outil: "fil", sousTension: false, contacts, resultat: null, bobinePrec: {}, aide: false, verif: null, fautes: [], debut: Date.now(), message: null };
}
const bornes = () => m.composants.flatMap((c) => COMPOSANTS[c.type](c).bornes);
const borne = (id) => bornes().find((b) => b.id === id);
function dire(t, type = "info") { s.message = { t, type }; }
function actualiser() {
  if (!s.sousTension) { s.resultat = null; return; }
  let r = simuler(m, s.fils, s.contacts);
  // télérupteur : front montant de la bobine
  for (const c of m.composants.filter((x) => x.type === "tl")) {
    const en = r.bobines[c.id];
    if (en && !s.bobinePrec[c.id]) { s.contacts[c.id] = !s.contacts[c.id]; sons.disjoncteur(); r = simuler(m, s.fils, s.contacts); }
    s.bobinePrec[c.id] = r.bobines[c.id];
  }
  s.resultat = r;
  if (r.court) { s.sousTension = false; s.resultat = null; sons.disjoncteur(); dire("Clac ! Court-circuit : la phase touche directement le neutre. Le disjoncteur a déclenché.", "danger"); }
  else if (r.terre) { s.sousTension = false; s.resultat = null; sons.disjoncteur(); dire("Clac ! La phase est reliée à la terre : le différentiel a déclenché.", "danger"); }
}

/* ---------- Vérification complète ---------- */
function verifier() {
  const lignes = [], fautes = [], remarques = [];
  let fonctionne = true;
  if (m.sequence) {
    // télérupteur : appuis successifs sur les boutons
    const contacts = { ...s.contacts, t: false, b1: false, b2: false };
    let prec = false, ok = true;
    const etapes = [["b1", true], ["b2", false], ["b1", true]];
    for (const [bp, attendu] of etapes) {
      contacts[bp] = true; let r = simuler(m, s.fils, contacts);
      if (r.court || r.terre) { ok = false; lignes.push([false, `Appui sur ${bp === "b1" ? "le bouton 1" : "le bouton 2"} : ${r.court ? "court-circuit" : "phase à la terre"}`]); break; }
      if (r.bobines.t && !prec) contacts.t = !contacts.t;
      prec = r.bobines.t; contacts[bp] = false; r = simuler(m, s.fils, contacts); prec = r.bobines.t;
      const allume = r.lampes.lp;
      lignes.push([allume === attendu, `Appui sur ${bp === "b1" ? "le bouton 1" : "le bouton 2"} : lampe ${allume ? "allumée" : "éteinte"} (attendu : ${attendu ? "allumée" : "éteinte"})`]);
      if (allume !== attendu) ok = false;
    }
    fonctionne = ok;
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
      lignes.push([ok, `${e.texte} : ${Object.keys(e.attendu).map((id) => `${nomDe(id)} : lumière ${r.lampes[id] ? "allumée" : "éteinte"}`).join(", ")}`]);
      // phase coupée : une lampe éteinte ne doit pas garder la phase sur sa borne L
      for (const id of Object.keys(e.attendu)) if (!r.lampes[id] && r.de(`${id}-L`) === 230 && !fautes.some((f) => f.includes(nomDe(id))))
        fautes.push(`${nomDe(id)} : éteinte, sa borne L reste sous tension. La commande coupe le neutre au lieu de la phase : danger pour qui change l'ampoule.`);
    }
  }
  // terre des DCL
  const groupe = (a, b) => { const g = {}; const f = (x) => (g[x] === undefined || g[x] === x ? (g[x] = x) : (g[x] = f(g[x]))); for (const w of s.fils) g[f(w.a)] = f(w.b); return f(a) === f(b); };
  for (const c of m.composants.filter((x) => x.type === "lampe")) if (!groupe(`${c.id}-PE`, "alim-PE")) fautes.push(`${c.nom} : la borne de terre du DCL n'est pas reliée au conducteur de protection.`);
  // couleurs
  const role = (w) => groupe(w.a, "alim-N") ? "neutre" : groupe(w.a, "alim-PE") ? "terre" : groupe(w.a, "alim-L") ? "phase" : "commande";
  const lampesL = m.composants.filter((x) => x.type === "lampe").map((x) => `${x.id}-L`);
  for (const w of s.fils) {
    const r = role(w);
    if (r === "neutre" && w.couleur !== "neutre") fautes.push(`Un fil du neutre n'est pas bleu : le bleu clair est réservé au neutre, et le neutre se repère toujours en bleu.`);
    if (r !== "neutre" && w.couleur === "neutre") fautes.push(`Un fil bleu sert à autre chose que le neutre : le bleu clair est réservé au neutre.`);
    if (r === "terre" && w.couleur !== "terre") fautes.push(`Un fil de terre n'est pas vert-jaune : le vert-jaune est obligatoire pour la protection.`);
    if (r !== "terre" && w.couleur === "terre") fautes.push(`Un fil vert-jaune sert à autre chose que la terre : c'est interdit.`);
    if (r === "commande" && lampesL.some((l) => groupe(w.a, l)) && w.couleur !== "retour") remarques.push("Retour lampe : sur ce site, on le câble en orange pour le reconnaître (convention, pas obligation de la norme).");
    if (r === "commande" && m.composants.some((c) => c.type === "tl" && groupe(w.a, `${c.id}-A1`)) && w.couleur !== "blanc") remarques.push("Retour bouton-poussoir : sur ce site, on le câble en blanc pour le reconnaître (convention).");
  }
  const uniques = (t) => [...new Set(t)];
  s.verif = { lignes, fonctionne, fautes: uniques(fautes), remarques: uniques(remarques) };
  if (fonctionne && !s.verif.fautes.length) {
    const etoiles = s.aide ? 2 : s.fautes.length ? 2 : 3;
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
    <p class="im-paysage">📱 Tourne ton téléphone pour câbler en grand.</p>
    <div class="im-cadre sc-cadre">${svg}${s.message ? `<p class="im-bulle ${s.message.type}" role="status">${s.message.t}</p>` : ""}</div>
    <div class="im-barre">
      <div class="sc-palette" role="group" aria-label="Couleur du fil">${COULEURS.map(([k, l, c]) => `<button type="button" class="sc-bobine ${s.couleur === k && s.outil === "fil" ? "actif" : ""}" data-couleur="${k}" title="${l}"><span style="background:${k === "terre" ? "repeating-linear-gradient(90deg,#3d9a3d 0 6px,#e8cf2c 6px 12px)" : c}"></span>${l}</button>`).join("")}</div>
      <div class="im-outils">
        <button type="button" class="${s.outil === "couper" ? "actif" : ""}" data-action="couper">✂️ Couper un fil</button>
        <button type="button" data-action="annuler">↩ Annuler</button>
        <button type="button" class="${s.sousTension ? "actif" : ""}" data-action="tension">${s.sousTension ? "🔒 Couper le courant" : "⚡ Mettre sous tension"}</button>
        <button type="button" data-action="verifier">🔍 Faire vérifier</button>
        <button type="button" data-action="aide">${s.aide ? "📄 Masquer l'aide" : "📄 Aide (coûte une étoile)"}</button>
      </div>
    </div>
    ${s.aide ? `<p class="sc-aide">${m.aide}</p>` : ""}
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
  racine.innerHTML = `<div class="im-menu"><p class="im-kicker">ATELIER SCHÉMAS</p><h1>Câble le montage</h1>
    <p>Comme à l'épreuve : une platine, une boîte de dérivation, des fils de couleur. Tu câbles hors tension, tu mets sous tension, tu essaies… et le contrôleur vérifie tout.</p>
    <div class="im-cartes">${MONTAGES.map((x) => `<button type="button" class="im-carte" data-montage="${x.id}"><span>${"●".repeat(x.niveau)}${"○".repeat(3 - x.niveau)} niveau ${x.niveau}${faits[x.id] ? ` · ${"★".repeat(faits[x.id])}` : ""}</span><b>${x.titre}</b></button>`).join("")}</div>
    <p class="im-petit"><a href="atelier-depannage.html">Et pour chercher des pannes : l'atelier dépannage →</a></p></div>`;
}
const CLE = "apprendreelec-schemas-v1";
function lireFaits() { try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch { return {}; } }
function noterFait(id, n) { try { const f = lireFaits(); f[id] = Math.max(f[id] || 0, n); localStorage.setItem(CLE, JSON.stringify(f)); } catch { /* stockage indisponible */ } }

/* ---------- Événements ---------- */
racine.addEventListener("click", (ev) => {
  const t = ev.target.closest("[data-b],[data-fil],[data-sw],[data-bp],[data-couleur],[data-action],[data-montage]");
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
  else if (d.action === "aide") s.aide = !s.aide;
  else if (d.action === "suivant") { const i = MONTAGES.indexOf(m); ouvrir(MONTAGES[(i + 1) % MONTAGES.length].id); history.replaceState(null, "", `?m=${m.id}`); }
  rendre();
  if (d.action === "verifier") racine.querySelector(".sc-verif")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
racine.addEventListener("keydown", (ev) => {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches("[role=button]")) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
});
brancherBoutonSons();
const depart = new URLSearchParams(location.search).get("m");
if (depart) ouvrir(depart);
rendre();
