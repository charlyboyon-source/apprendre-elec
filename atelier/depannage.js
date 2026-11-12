// Atelier dépannage : une intervention comme chez un vrai client.
// Bon d'intervention → tableau → mesures au multimètre → consignation → diagnostic → réparation → essai.
// Le circuit de chaque scénario est décrit dans atelier/scenarios/*.json (liaisons entre nœuds).
import "../js/page.js";
import { crediterElectrons } from "../js/progression.js";
import { brancherBoutonSons, sonClac, sonVictoire, sonEchec } from "../js/audio.js";

const SCENARIOS = [
  { fichier: "atelier/scenarios/01-point-lumineux.json", titre: "La lampe de la chambre" },
  { fichier: "atelier/scenarios/02-prise-cuisine.json", titre: "La prise du plan de travail" },
];
const racine = document.querySelector(".atelier");
let sc = null;   // scénario chargé
let e = null;    // état de l'intervention

/* ---------- Modèle électrique ---------- */
// Une liaison conduit si sa panne n'est pas active, si l'appareil qui la commande est fermé.
function conduit(l) {
  if (l.coupePar && l.coupePar === e.panne && !e.repare) return false;
  if (l.si && !e.app[l.si]) return false;
  return true;
}
// Potentiel de chaque nœud : 230 (phase), 0 (neutre ou terre), ou absent (fil isolé, « en l'air »).
function potentiels() {
  const parent = {};
  const trouve = (x) => (parent[x] === undefined || parent[x] === x ? (parent[x] = x) : (parent[x] = trouve(parent[x])));
  const unir = (a, b) => { parent[trouve(a)] = trouve(b); };
  const actives = sc.liaisons.filter(conduit);
  for (const l of actives) if (!l.charge) unir(l.a, l.b);
  const pot = {};
  const groupe = (x) => trouve(x);
  pot[groupe("L")] = 230; pot[groupe("N")] = 0; pot[groupe("PE")] = 0;
  // Un fil isolé relié par un récepteur à un fil sous tension prend sa tension (aucun courant ne passe).
  let change = true;
  while (change) {
    change = false;
    for (const l of actives.filter((x) => x.charge)) {
      const ga = groupe(l.a), gb = groupe(l.b);
      if (pot[ga] !== undefined && pot[gb] === undefined) { pot[gb] = pot[ga]; change = true; }
      else if (pot[gb] !== undefined && pot[ga] === undefined) { pot[ga] = pot[gb]; change = true; }
    }
  }
  return { de: (n) => pot[groupe(n)], groupe };
}
function recepteurAlimente() {
  const r = sc.recepteur, p = potentiels();
  const charge = sc.liaisons.find((l) => l.charge && l.a === r.a && l.b === r.b);
  if (!charge || !conduit(charge)) return false;
  return p.de(r.a) === 230 && p.groupe(r.b) === p.groupe("N");
}
function tension(n1, n2) {
  const p = potentiels(), a = p.de(n1), b = p.de(n2);
  if (a === undefined || b === undefined) return 0;
  return Math.abs(a - b);
}
// Résistance entre deux nœuds (ohmmètre) : fil direct, à travers un récepteur, ou circuit ouvert.
function resistance(n1, n2) {
  const actives = sc.liaisons.filter(conduit);
  const meilleur = { [n1]: 0 };
  const file = [n1];
  while (file.length) {
    const x = file.shift();
    for (const l of actives) {
      const y = l.a === x ? l.b : l.b === x ? l.a : null;
      if (y === null) continue;
      const r = meilleur[x] + (l.charge || 0);
      if (meilleur[y] === undefined || r < meilleur[y]) { meilleur[y] = r; file.push(y); }
    }
  }
  return meilleur[n2];
}

/* ---------- État ---------- */
function nouvelleIntervention(garderPanne) {
  const pannes = sc.pannes.map((p) => p.id);
  let panne = garderPanne || pannes[Math.floor(Math.random() * pannes.length)];
  if (!garderPanne && e && e.panne === panne && pannes.length > 1) panne = pannes[(pannes.indexOf(panne) + 1) % pannes.length];
  const app = { inter: false };
  for (const a of sc.tableau) app[a.cle] = true;
  const p = sc.pannes.find((x) => x.id === panne);
  if (p.declenche) app[p.declenche] = false;
  e = {
    panne, fiche: p, app, vue: "scene", epi: false, cadenas: false, vat: {},
    calibre: "V", rouge: null, noir: null, lecture: null,
    mesures: 0, fautes: [], erreurs: 0, carnet: [], message: null,
    diagnostic: false, repare: false, fini: false, choix: null,
  };
}
const consigne = () => !e.app[sc.circuit] && e.cadenas;
const point = (id) => sc.points.find((p) => p.id === id);
const borne = (id) => sc.points.flatMap((p) => p.bornes).find((b) => b.id === id);

function faute(texte) {
  if (!e.fautes.includes(texte)) e.fautes.push(texte);
  e.message = { type: "danger", texte };
  sonEchec();
}

/* ---------- Actions ---------- */
function ouvrir(id) {
  const p = point(id);
  if (p.consignee && !consigne()) {
    e.message = { type: "info", texte: "Pour déposer et tester l'ampoule, consigne d'abord le circuit au tableau : disjoncteur ouvert, cadenas posé." };
    return;
  }
  if (p.demontage && !consigne() && !e.epi) {
    faute("Démonter un appareillage sous tension sans gants isolants ni écran facial : mets tes EPI avant d'ouvrir.");
    return;
  }
  e.vue = id; e.rouge = null; e.noir = null; e.lecture = null; e.message = null;
}
function manette(cle) {
  const a = sc.tableau.find((x) => x.cle === cle);
  if (cle === sc.circuit && e.cadenas) { e.message = { type: "info", texte: "Le disjoncteur est condamné par ton cadenas. Retire-le d'abord." }; return; }
  if (e.app[cle]) { e.app[cle] = false; if (cle === sc.circuit) e.vat = {}; sonClac(); e.message = null; return; }
  e.app[cle] = true; sonClac();
  // Défaut d'isolement : le différentiel redéclenche tant que le circuit en défaut est fermé.
  const f = e.fiche;
  if (!e.repare && f.declenche === "diff" && e.app.diff && e.app[f.defautSur]) {
    e.app.diff = false;
    e.message = { type: "alerte", texte: a.type === "id"
      ? "Le différentiel redéclenche aussitôt : un courant fuit vers la terre quelque part en aval."
      : `Le différentiel vient de redéclencher en remontant « ${a.etiquette} ».` };
    return;
  }
  e.message = null;
  if (cle === sc.circuit) e.vat = {};
}
function cadenas() {
  if (e.cadenas) { e.cadenas = false; e.vat = {}; e.message = null; return; }
  if (e.app[sc.circuit]) { e.message = { type: "info", texte: "On ne condamne qu'un appareil ouvert : baisse d'abord le disjoncteur du circuit." }; return; }
  e.cadenas = true;
  e.message = { type: "ok", texte: "Circuit séparé et condamné. Il reste à vérifier l'absence de tension sur place avant de toucher." };
}
function cliquerBorne(id) {
  if (!e.rouge || (e.rouge && e.noir)) { e.rouge = id; e.noir = null; e.lecture = null; return; }
  if (id === e.rouge) return;
  e.noir = id; mesurer();
}
function mesurer() {
  const b1 = borne(e.rouge), b2 = borne(e.noir), p = point(e.vue);
  if (e.calibre === "OFF") { e.lecture = "OFF"; e.message = { type: "info", texte: "Le multimètre est éteint : tourne le sélecteur sur V~ ou Ω." }; return; }
  e.mesures++;
  if (e.calibre === "V") {
    const u = tension(b1.noeud, b2.noeud);
    e.lecture = u ? "230 V" : "0 V";
    if (consigne() && u === 0 && p.id !== "tableau") e.vat[p.id] = true;
    noter(`${p.label} : ${b1.label} ↔ ${b2.label} = ${e.lecture}`);
    e.message = null;
  } else {
    const pot = potentiels();
    if (pot.de(b1.noeud) === 230 || pot.de(b2.noeud) === 230) {
      e.lecture = "!!";
      faute("Ohmmètre branché sur des bornes sous tension : on ne mesure une continuité que sur un circuit consigné.");
      return;
    }
    if (p.id !== "ampoule" && (!consigne() || !e.vat[p.id])) {
      faute("Mesure de continuité sans consignation complète : sépare, condamne, puis vérifie l'absence de tension sur place.");
      e.lecture = null; e.mesures--; return;
    }
    const r = resistance(b1.noeud, b2.noeud);
    e.lecture = r === undefined ? "OL" : r === 0 ? "0,2 Ω" : `${r} Ω`;
    noter(`${p.label} : ${b1.label} ↔ ${b2.label} = ${e.lecture}${e.lecture === "OL" ? " (circuit ouvert)" : ""}`);
    e.message = null;
  }
}
function noter(t) {
  const etat = sc.commande ? ` (${sc.commande.label} ${e.app.inter ? "allumé" : "éteint"})` : "";
  e.carnet.unshift(t + etat);
  e.carnet = e.carnet.slice(0, 12);
}
function diagnostiquer(id) {
  if (id === e.panne) {
    e.diagnostic = true; e.choix = null; sonVictoire();
    if (e.fiche.sansConsignation) reparer();
    else e.message = { type: "ok", texte: "Bon diagnostic ! Pour réparer, consigne le circuit : disjoncteur ouvert, cadenas posé, absence de tension vérifiée là où tu interviens. Puis clique « Réparer »." };
  } else {
    e.erreurs++; e.choix = null; sonEchec();
    e.message = { type: "alerte", texte: "Ce n'est pas ça. Reprends tes mesures : de la source vers le récepteur, et compare ce que tu lis à ce que tu attends." };
  }
}
function reparer() {
  if (!e.fiche.sansConsignation && (!consigne() || !Object.keys(e.vat).length)) {
    faute("Réparation sur un circuit non consigné : sépare, condamne et vérifie l'absence de tension avant de toucher aux conducteurs.");
    return;
  }
  e.repare = true;
  e.message = { type: "ok", texte: e.fiche.sansConsignation
    ? "Bon diagnostic ! Remets le circuit en service et vérifie que ça marche."
    : "Panne réparée. Retire le cadenas, remonte les disjoncteurs et le différentiel, puis vérifie que ça marche." };
}
function verifierFin() {
  if (!e.repare || e.fini) return;
  if (e.repare && !e.cadenas && recepteurAlimente()) {
    e.fini = true;
    const etoiles = Math.max(1, 3 - (e.fautes.length ? 1 : 0) - (e.erreurs ? 1 : 0) - (e.mesures > 14 ? 1 : 0));
    e.etoiles = etoiles;
    crediterElectrons(etoiles * 10);
  }
}

/* ---------- Dessins ---------- */
const COUL = { phase: "#d23a2e", retour: "#ef8a1e", neutre: "#2f6fd0", terre: "#3a9b3a" };
const svg = (vb, corps, label, cadre) => `<svg viewBox="${cadre || vb}" role="img" aria-label="${label}" class="dp-svg">${corps}</svg>`;
function vis(x, y, id, label, fil) {
  const actif = e.rouge === id ? "rouge" : e.noir === id ? "noir" : "";
  const anneau = fil === "terre"
    ? `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${COUL.terre}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#e5c935" stroke-width="4" stroke-dasharray="6 6"/>`
    : `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${COUL[fil] || "#8a929b"}" stroke-width="4"/>`;
  return `<g class="dp-borne ${actif}" data-borne="${id}" tabindex="0" role="button" aria-label="Mesurer sur ${label}">
    <circle cx="${x}" cy="${y}" r="24" fill="transparent"/>${anneau}<circle cx="${x}" cy="${y}" r="8.5" fill="#d9dde2" stroke="#6b737c" stroke-width="1.5"/>
    <path d="M${x - 5} ${y} H${x + 5}" stroke="#4b525a" stroke-width="2"/>
    ${actif ? `<circle cx="${x}" cy="${y}" r="19" fill="none" stroke="${actif === "rouge" ? "#d23a2e" : "#1d2228"}" stroke-width="3"/>` : ""}
  </g>`;
}
function texte(x, y, t, taille = 13, gras = false, ancre = "middle", coul = "#1d2228") {
  return `<text x="${x}" y="${y}" font-size="${taille}" font-weight="${gras ? 700 : 500}" text-anchor="${ancre}" fill="${coul}">${t}</text>`;
}
function zone(x, y, w, h, action, id, label) {
  return `<g class="dp-zone" data-${action}="${id}" tabindex="0" role="button" aria-label="${label}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="transparent" stroke="#f2c230" stroke-width="3" stroke-dasharray="7 6"/>
    <rect x="${x + w / 2 - 70}" y="${y + h + 6}" width="140" height="26" rx="13" fill="#1d2228"/>
    ${texte(x + w / 2, y + h + 24, label, 13, true, "middle", "#fff")}
  </g>`;
}

function sceneChambre() {
  const allume = recepteurAlimente();
  return svg("0 0 640 420", `
    <defs><radialGradient id="halo"><stop offset="0" stop-color="#fff3b0" stop-opacity=".95"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient>
    <linearGradient id="mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe6d6"/><stop offset="1" stop-color="#e4d8c4"/></linearGradient></defs>
    <rect width="640" height="420" fill="url(#mur)"/>
    <rect y="0" width="640" height="36" fill="#f7f2e9"/><path d="M0 36 H640" stroke="#d6cab5" stroke-width="2"/>
    <rect y="330" width="640" height="90" fill="#c9a77c"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M0 ${340 + i * 12} H640" stroke="#b8946a" stroke-width="1"/>`).join("")}
    <rect y="322" width="640" height="10" fill="#f7f2e9" stroke="#d6cab5"/>
    <rect x="40" y="110" width="110" height="222" fill="#a07a52" stroke="#7d5c3b" stroke-width="3"/>
    <rect x="52" y="122" width="86" height="90" fill="#b38a5f"/><rect x="52" y="222" width="86" height="96" fill="#b38a5f"/>
    <circle cx="136" cy="228" r="5" fill="#d8c08a"/>
    <rect x="164" y="196" width="40" height="52" rx="6" fill="#fbfaf7" stroke="#c9c2b6" stroke-width="2"/>
    <rect x="173" y="206" width="22" height="32" rx="3" fill="#fff" stroke="#b9b1a4" stroke-width="1.5"/>
    <path d="M173 ${e.app.inter ? 214 : 230} H195" stroke="#9c9488" stroke-width="2"/>
    <rect x="420" y="90" width="150" height="110" fill="#d7e7f2" stroke="#f7f2e9" stroke-width="8"/><path d="M495 90 V200 M420 145 H570" stroke="#f7f2e9" stroke-width="5"/>
    <rect x="300" y="255" width="250" height="70" rx="8" fill="#7c8ea3"/><rect x="300" y="240" width="250" height="26" rx="8" fill="#e9eef3"/><rect x="520" y="200" width="34" height="125" rx="6" fill="#6a5a49"/>
    ${allume ? `<circle cx="330" cy="130" r="120" fill="url(#halo)"/>` : ""}
    <ellipse cx="330" cy="40" rx="24" ry="6" fill="#fbfaf7" stroke="#c9c2b6"/>
    <path d="M330 44 V94" stroke="#3b3b3b" stroke-width="2"/>
    <path d="M308 94 H352 L344 112 H316 Z" fill="#2f2f2f"/>
    <circle cx="330" cy="122" r="13" fill="${allume ? "#ffe680" : "#dfe2e6"}" stroke="${allume ? "#e8b800" : "#9aa1a9"}" stroke-width="2"/>
    ${zone(150, 182, 68, 80, "interrupteur", "inter", "Interrupteur")}
    ${zone(280, 30, 100, 116, "ouvrir", "dcl", "Plafonnier")}
    <g class="dp-zone" data-ouvrir="tableau" tabindex="0" role="button" aria-label="Aller au tableau">
      <rect x="585" y="230" width="44" height="64" rx="6" fill="#fbfaf7" stroke="#8a929b" stroke-width="2"/><rect x="592" y="242" width="30" height="8" fill="#3a3f46"/><rect x="592" y="262" width="30" height="8" fill="#3a3f46"/>
      <rect x="560" y="300" width="74" height="26" rx="13" fill="#1d2228"/>${texte(597, 318, "Tableau", 13, true, "middle", "#fff")}
    </g>`, `Chambre : ${allume ? "la lampe est allumée" : "la lampe est éteinte"}`);
}
function sceneCuisine() {
  const allume = recepteurAlimente();
  const prise = (x, n) => `<rect x="${x - 22}" y="196" width="44" height="44" rx="7" fill="#fbfaf7" stroke="#c9c2b6" stroke-width="2"/><circle cx="${x}" cy="218" r="14" fill="#f1efea" stroke="#b9b1a4"/><circle cx="${x - 6}" cy="220" r="2.6" fill="#555"/><circle cx="${x + 6}" cy="220" r="2.6" fill="#555"/><rect x="${x - 2}" y="207" width="4" height="6" fill="#999"/>${texte(x, 190, n, 12, true)}`;
  return svg("0 0 640 420", `
    <rect width="640" height="420" fill="#efe6d6"/>
    <rect y="150" width="640" height="110" fill="#f3f5f6"/>
    ${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 40} 150 V260" stroke="#dde2e6"/>`).join("")}<path d="M0 205 H640" stroke="#dde2e6"/>
    <rect x="0" y="40" width="640" height="110" fill="#e8dcc8"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${110 + i * 120}" y="48" width="112" height="96" rx="4" fill="#fbfaf7" stroke="#d6cab5"/><rect x="${160 + i * 120}" y="126" width="14" height="4" rx="2" fill="#a59c8e"/>`).join("")}
    <rect y="258" width="640" height="16" fill="#8b6a4a"/><rect y="274" width="640" height="146" fill="#e5ddd0"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${110 + i * 120}" y="284" width="112" height="126" rx="4" fill="#f5efe6" stroke="#d6cab5"/>`).join("")}
    <rect x="0" y="0" width="104" height="420" fill="#e9dfcd"/><path d="M104 0 V420" stroke="#cbbfa8" stroke-width="5"/><rect x="0" y="380" width="104" height="40" fill="#c9a77c"/>
    ${prise(170, "Prise 1")}${prise(330, "Prise 2")}${prise(520, "Prise 3")}
    <rect x="390" y="226" width="64" height="32" rx="4" fill="#5d6670"/><rect x="398" y="232" width="40" height="20" rx="2" fill="#222"/>
    <path d="M555 258 C 555 236 560 230 540 222" stroke="#2b2b2b" stroke-width="3" fill="none"/>
    <path d="M565 258 L575 196 H615 L625 258 Z" fill="#c0c7ce" stroke="#7f8890" stroke-width="2"/><path d="M615 210 C640 212 640 240 620 244" fill="none" stroke="#7f8890" stroke-width="5"/>
    <circle cx="582" cy="246" r="5" fill="${allume ? "#ff3b30" : "#5a5f66"}"/>${allume ? `<circle cx="582" cy="246" r="10" fill="#ff3b30" opacity=".3"/>` : ""}
    ${zone(286, 180, 88, 66, "ouvrir", "p2", "Prise 2")}
    ${zone(484, 180, 72, 66, "ouvrir", "p3face", "Prise 3")}
    <g class="dp-zone" data-ouvrir="tableau" tabindex="0" role="button" aria-label="Aller au tableau">
      <rect x="22" y="80" width="64" height="86" rx="6" fill="#fbfaf7" stroke="#8a929b" stroke-width="2"/><rect x="31" y="96" width="46" height="9" fill="#3a3f46"/><rect x="31" y="120" width="46" height="9" fill="#3a3f46"/>
      <rect x="17" y="170" width="74" height="26" rx="13" fill="#1d2228"/>${texte(54, 188, "Tableau", 13, true, "middle", "#fff")}
    </g>`, `Cuisine : ${allume ? "le voyant de la bouilloire est allumé" : "le voyant de la bouilloire est éteint"}`);
}

function coupe(t, n) {
  const lignes = [];
  for (const m of t.split(" ")) {
    const l = lignes[lignes.length - 1];
    if (l !== undefined && (l + " " + m).length <= n) lignes[lignes.length - 1] = l + " " + m; else lignes.push(m);
  }
  return lignes;
}
function vueTableau(p) {
  const larg = (a) => (a.type === "id" ? 116 : 74);
  let x = 62; const pos = {};
  const apps = sc.tableau.map((a) => {
    const w = larg(a); pos[a.cle] = { x, w }; const haut = e.app[a.cle];
    const g = `<g>
      <rect x="${x}" y="90" width="${w}" height="140" rx="6" fill="#fbfbfa" stroke="#9aa2ab" stroke-width="2"/>
      <rect x="${x + 6}" y="98" width="${w - 12}" height="22" rx="3" fill="#eef0f2"/>
      ${texte(x + w / 2, 115, a.haut, 16, true)}
      ${a.bas ? texte(x + w / 2, 222, a.bas, 12, true, "middle", "#2f6fd0") : ""}
      ${a.type === "id" ? `<circle cx="${x + w - 18}" cy="200" r="8" fill="#f2c230" stroke="#b88f00"/>${texte(x + w - 18, 204, "T", 10, true)}` : ""}
      <g class="dp-manette" data-manette="${a.cle}" tabindex="0" role="button" aria-label="${haut ? "Baisser" : "Remonter"} ${a.etiquette}">
        <rect x="${x + w / 2 - 15}" y="130" width="30" height="62" rx="5" fill="#2d3238"/>
        <rect x="${x + w / 2 - 11}" y="${haut ? 134 : 162}" width="22" height="26" rx="4" fill="${a.type === "id" ? "#2f6fd0" : "#fdfdfc"}" stroke="#555" stroke-width="1.5"/>
        ${texte(x + w / 2, haut ? 128 : 205, haut ? "I" : "O", 11, true, "middle", "#555")}
      </g>
      ${a.cle === sc.circuit && e.cadenas ? `<g transform="translate(${x + w / 2 - 14} 236)"><rect x="0" y="12" width="28" height="22" rx="4" fill="#d23a2e"/><path d="M6 12 V6 A8 8 0 0 1 22 6 V12" fill="none" stroke="#777" stroke-width="4"/></g>` : ""}
      <rect x="${x}" y="276" width="${w}" height="34" rx="4" fill="#fff8d6" stroke="#d9c98a"/>
      ${coupe(a.etiquette, w > 90 ? 15 : 10).slice(0, 2).map((l, i) => texte(x + w / 2, 290 + i * 14, l, 12, true)).join("")}
    </g>`;
    x += w + 10; return g;
  }).join("");
  const xb = (b) => (b.sous === "terre" ? 560 : pos[b.sous].x + pos[b.sous].w / 2 + (b.fil === "neutre" ? 14 : b.sous === "diff" ? 0 : -14));
  const bornes = p.bornes.map((b) => {
    const bx = xb(b), by = b.sous === "terre" ? 200 : 254;
    const fil = b.sous === "terre" ? "" : `<path d="M${bx} ${by} V${by + 12}" stroke="${COUL[b.fil]}" stroke-width="4"/>`;
    return fil + vis(bx, by, b.id, b.label, b.fil);
  }).join("");
  return svg("0 0 640 360", `
    <rect x="40" y="40" width="580" height="300" rx="14" fill="#f4f5f6" stroke="#9aa2ab" stroke-width="3"/>
    <rect x="52" y="152" width="440" height="10" fill="#c3c8ce"/>
    ${apps}
    <rect x="530" y="170" width="70" height="60" rx="6" fill="#e8ecef" stroke="#9aa2ab"/>${texte(565, 250, "barrette", 12, true)}${texte(565, 264, "de terre", 12, true)}
    <rect x="538" y="194" width="54" height="12" rx="3" fill="#c9a43a"/>
    ${bornes}
`, "Tableau électrique", "30 30 590 320");
}
function vueInter(p) {
  const b = Object.fromEntries(p.bornes.map((x) => [x.slot, x]));
  return svg("0 0 640 360", `
    <rect x="0" y="0" width="640" height="360" fill="#efe6d6"/>
    <rect x="150" y="60" width="220" height="250" rx="110" fill="#d0c6b4" stroke="#b5a990" stroke-width="3"/>
    <rect x="185" y="95" width="150" height="180" rx="10" fill="#fdfdfb" stroke="#9aa2ab" stroke-width="2"/>
    <rect x="235" y="140" width="50" height="90" rx="6" fill="#eceae4" stroke="#9aa2ab"/>
    <path d="M240 ${e.app.inter ? 150 : 220} L280 ${e.app.inter ? 168 : 202}" stroke="#555" stroke-width="5" stroke-linecap="round"/>
    ${texte(260, 255, e.app.inter ? "contact : allumé" : "contact : éteint", 12, true)}
    <path d="M215 20 V120" stroke="${COUL.phase}" stroke-width="6" fill="none"/><path d="M305 20 V120" stroke="${COUL.retour}" stroke-width="6" fill="none"/>
    ${vis(215, 135, b.gauche.id, b.gauche.label, "phase")}${vis(305, 135, b.droite.id, b.droite.label, "retour")}
    ${texte(215, 165, "entrée", 12, true)}${texte(305, 165, "sortie", 12, true)}
    ${texte(215, 16, "phase", 11, true, "middle", COUL.phase)}${texte(305, 16, "retour lampe", 11, true, "middle", COUL.retour)}
    <rect x="450" y="150" width="90" height="90" rx="12" fill="#fbfaf7" stroke="#c9c2b6" stroke-width="2"/><circle cx="495" cy="195" r="28" fill="#f1efea" stroke="#b9b1a4"/>
    <circle cx="483" cy="198" r="4" fill="#555"/><circle cx="507" cy="198" r="4" fill="#555"/>
    ${vis(495, 176, b.terre.id, b.terre.label, "terre")}
    ${texte(495, 262, "prise voisine :", 12, true)}${texte(495, 278, "broche de terre", 12, true)}
    <g class="dp-bouton" data-basculer="1" tabindex="0" role="button" aria-label="Basculer l'interrupteur">
      <rect x="190" y="318" width="140" height="32" rx="16" fill="#1d2228"/>${texte(260, 339, "Basculer", 13, true, "middle", "#fff")}
    </g>`, "Interrupteur démonté");
}
function vueDcl(p) {
  const b = p.bornes;
  const allume = recepteurAlimente();
  return svg("0 0 640 360", `
    <rect width="640" height="360" fill="#f3efe7"/>
    <circle cx="320" cy="170" r="120" fill="#fbfaf7" stroke="#c9c2b6" stroke-width="3"/>
    <rect x="215" y="135" width="210" height="70" rx="10" fill="#fff" stroke="#9aa2ab" stroke-width="2"/>
    ${texte(452, 120, "boîte DCL,", 12, true, "start", "#555")}${texte(452, 136, "vue de dessous", 12, true, "start", "#555")}
    ${[["retour", 255], ["neutre", 320], ["terre", 385]].map(([c, x], i) => `<path d="M${x} 20 V150" stroke="${COUL[c]}" stroke-width="6"/>${c === "terre" ? `<path d="M${x} 20 V150" stroke="#e5c935" stroke-width="6" stroke-dasharray="9 9"/>` : ""}${vis(x, 170, b[i].id, b[i].label, b[i].fil)}${texte(x, 200, ["L", "N", "⏚"][i], 15, true)}`).join("")}
    <path d="M320 205 V262" stroke="#333" stroke-width="2"/><path d="M300 262 H340 L333 280 H307 Z" fill="#2f2f2f"/>
    <circle cx="320" cy="292" r="13" fill="${allume ? "#ffe680" : "#dfe2e6"}" stroke="${allume ? "#e8b800" : "#9aa1a9"}" stroke-width="2"/>
    ${texte(255, 16, "retour lampe", 11, true, "middle", COUL.retour)}${texte(320, 16, "neutre", 11, true, "middle", COUL.neutre)}${texte(385, 16, "terre", 11, true, "middle", COUL.terre)}
    ${consigne() ? `<g class="dp-bouton" data-ouvrir="ampoule" tabindex="0" role="button" aria-label="Déposer l'ampoule"><rect x="460" y="290" width="160" height="34" rx="17" fill="#1d2228"/>${texte(540, 312, "Déposer l'ampoule", 13, true, "middle", "#fff")}</g>` : ""}`, "Plafonnier ouvert");
}
function vueAmpoule(p) {
  const b = Object.fromEntries(p.bornes.map((x) => [x.slot, x]));
  return svg("0 0 640 360", `
    <rect width="640" height="360" fill="#f3efe7"/>
    <ellipse cx="250" cy="180" rx="120" ry="90" fill="#eef1f4" stroke="#9aa1a9" stroke-width="3"/>
    <path d="M190 180 C 220 150 280 150 310 180" fill="none" stroke="#777" stroke-width="2"/>
    <rect x="365" y="140" width="80" height="80" fill="#c8ccd1" stroke="#7f878f" stroke-width="2"/>
    ${[0, 1, 2, 3].map((i) => `<path d="M${375 + i * 18} 140 V220" stroke="#9aa1a9" stroke-width="2"/>`).join("")}
    <rect x="445" y="165" width="22" height="30" rx="4" fill="#4a4f55"/>
    ${vis(405, 250, b.culot.id, b.culot.label, "")}${vis(490, 180, b.plot.id, b.plot.label, "")}
    ${texte(405, 285, "culot", 13, true)}${texte(520, 184, "plot", 13, true, "start")}
    ${texte(320, 330, "Ampoule à filament, déposée : on teste sa continuité à l'ohmmètre (sélecteur sur Ω).", 13, false, "middle", "#555")}`, "Ampoule déposée");
}
function vuePrise(p) {
  const b = Object.fromEntries(p.bornes.map((x) => [x.slot, x]));
  const rep = p.repiquage;
  const fil = (x, c) => `<path d="M${x} 20 V140" stroke="${COUL[c]}" stroke-width="6"/>${c === "terre" ? `<path d="M${x} 20 V140" stroke="#e5c935" stroke-width="6" stroke-dasharray="9 9"/>` : ""}${rep ? `<path d="M${x + 8} 340 V176" stroke="${COUL[c]}" stroke-width="6"/>${c === "terre" ? `<path d="M${x + 8} 340 V176" stroke="#e5c935" stroke-width="6" stroke-dasharray="9 9"/>` : ""}` : ""}`;
  return svg("0 0 640 360", `
    <rect width="640" height="360" fill="#efe6d6"/>
    <rect x="180" y="110" width="280" height="140" rx="12" fill="#fdfdfb" stroke="#9aa2ab" stroke-width="2"/>
    ${fil(250, "phase")}${fil(320, "terre")}${fil(390, "neutre")}
    ${vis(250, 160, b.L.id, b.L.label, "phase")}${vis(320, 160, b.T.id, b.T.label, "terre")}${vis(390, 160, b.N.id, b.N.label, "neutre")}
    ${texte(250, 200, "L", 15, true)}${texte(320, 200, "⏚", 15, true)}${texte(390, 200, "N", 15, true)}
    ${texte(320, 236, "mécanisme de prise, vu de derrière", 12, false, "middle", "#555")}
    ${rep ? texte(470, 300, "fils repiqués vers la prise 3", 12, true, "start", "#555") : ""}
    ${p.id === "p3" ? "" : ""}`, p.label);
}
function vueFace(p) {
  const b = Object.fromEntries(p.bornes.map((x) => [x.slot, x]));
  return svg("0 0 640 360", `
    <rect width="640" height="360" fill="#f3f5f6"/>
    <rect x="200" y="60" width="240" height="240" rx="26" fill="#fbfaf7" stroke="#c9c2b6" stroke-width="3"/>
    <circle cx="320" cy="180" r="90" fill="#f1efea" stroke="#b9b1a4" stroke-width="2"/>
    <circle cx="282" cy="190" r="9" fill="#444"/><circle cx="358" cy="190" r="9" fill="#444"/>
    <rect x="312" y="108" width="16" height="30" rx="4" fill="#b9bfc5" stroke="#7f878f"/>
    ${vis(282, 190, b.g.id, b.g.label, "")}${vis(358, 190, b.d.id, b.d.label, "")}${vis(320, 123, b.t.id, b.t.label, "terre")}
    ${texte(282, 232, "alvéole", 12, true)}${texte(358, 232, "alvéole", 12, true)}${texte(320, 96, "broche de terre", 12, true)}
    ${texte(320, 330, "Mesure dans les alvéoles, sans démonter la prise.", 13, false, "middle", "#555")}
    <g class="dp-bouton" data-ouvrir="p3" tabindex="0" role="button" aria-label="Démonter la prise 3"><rect x="470" y="40" width="150" height="34" rx="17" fill="#1d2228"/>${texte(545, 62, "Démonter la prise", 13, true, "middle", "#fff")}</g>`, "Prise 3, face avant");
}
function multimetre() {
  const pos = { OFF: -60, V: 0, "Ω": 60 };
  const ang = pos[e.calibre];
  return svg("0 0 220 300", `
    <rect x="10" y="6" width="200" height="288" rx="26" fill="#2b2f34"/>
    <rect x="22" y="18" width="176" height="264" rx="18" fill="#f2c230"/>
    <rect x="38" y="34" width="144" height="70" rx="8" fill="#2b2f34"/>
    <rect x="46" y="42" width="128" height="54" rx="4" fill="#c8d4b4"/>
    <text x="166" y="82" font-size="30" font-weight="700" text-anchor="end" fill="#1d2620" font-family="ui-monospace, Menlo, monospace">${e.calibre === "OFF" ? "" : e.lecture ?? (e.calibre === "V" ? "– – –" : "– – –")}</text>
    <text x="52" y="56" font-size="10" fill="#3d4a40" font-weight="700">${e.calibre === "OFF" ? "" : e.calibre === "V" ? "V~" : "Ω"}</text>
    <circle cx="110" cy="176" r="46" fill="#2b2f34"/><circle cx="110" cy="176" r="36" fill="#454b52"/>
    <g transform="rotate(${ang} 110 176)"><rect x="104" y="136" width="12" height="44" rx="5" fill="#e9ecef"/></g>
    ${[["OFF", -60], ["V", 0], ["Ω", 60]].map(([c, a]) => {
      const r = 60, x = 110 + r * Math.sin((a * Math.PI) / 180), y = 176 - r * Math.cos((a * Math.PI) / 180);
      return `<g class="dp-calibre ${e.calibre === c ? "actif" : ""}" data-calibre="${c}" tabindex="0" role="button" aria-label="Sélecteur sur ${c === "V" ? "tension alternative" : c === "Ω" ? "ohmmètre" : "arrêt"}"><circle cx="${x}" cy="${y}" r="17" fill="${e.calibre === c ? "#1d2228" : "#fff7d1"}"/>${texte(x, y + 5, c === "V" ? "V~" : c, 12, true, "middle", e.calibre === c ? "#fff" : "#1d2228")}</g>`;
    }).join("")}
    <circle cx="70" cy="258" r="11" fill="#1d2228"/><circle cx="150" cy="258" r="11" fill="#d23a2e"/>
    ${texte(70, 284, "COM", 10, true)}${texte(150, 284, "V Ω", 10, true)}`, `Multimètre : ${e.lecture || "pas de mesure"}`);
}

/* ---------- Rendu ---------- */
function bloc(titre, corps, classe = "") { return `<section class="dp-carte ${classe}"><h2>${titre}</h2>${corps}</section>`; }

function rendre() {
  verifierFin();
  const f = e.fiche;
  const vues = { tableau: vueTableau, inter: vueInter, dcl: vueDcl, ampoule: vueAmpoule, prise: vuePrise, face: vueFace };
  const vue = e.vue === "scene" ? (sc.decor === "cuisine" ? sceneCuisine() : sceneChambre()) : vues[point(e.vue).vue](point(e.vue));
  const lieux = [["scene", "La pièce"], ...sc.points.filter((p) => !p.consignee && !(p.id === "p3")).map((p) => [p.id, p.label])];
  const b1 = e.rouge && borne(e.rouge), b2 = e.noir && borne(e.noir);
  racine.innerHTML = `
    <header class="dp-entete">
      <p class="dp-kicker">ATELIER DÉPANNAGE</p>
      <h1>Une vraie intervention, du bon d'intervention à l'essai final</h1>
      <div class="dp-scenarios">${SCENARIOS.map((s, i) => `<button type="button" class="dp-chip ${sc.titre === s.titre ? "actif" : ""}" data-scenario="${i}">${s.titre}</button>`).join("")}</div>
    </header>
    <section class="dp-bon">
      <div class="dp-bon-tete"><span>BON D'INTERVENTION</span><span>${sc.lieu}</span></div>
      <p class="dp-bon-client"><b>${sc.client} :</b> « ${f.client} »</p>
      <p class="dp-bon-etat">${recepteurAlimente() ? "✅ " + sc.recepteur.allume : "⛔ " + sc.recepteur.eteint}</p>
    </section>
    ${e.message ? `<p class="dp-message ${e.message.type}" role="status">${e.message.texte}</p>` : ""}
    ${e.fini ? `<section class="dp-fin" role="status">
        <p class="dp-etoiles">${"★".repeat(e.etoiles)}${"☆".repeat(3 - e.etoiles)}</p>
        <h2>Intervention terminée</h2>
        <p>${e.mesures} mesure${e.mesures > 1 ? "s" : ""} · ${e.fautes.length} faute${e.fautes.length > 1 ? "s" : ""} de sécurité · ${e.erreurs} mauvais diagnostic${e.erreurs > 1 ? "s" : ""} · +${e.etoiles * 10} e⁻</p>
        <p class="dp-explication"><b>Ce qu'il fallait voir :</b> ${f.explication}</p>
        <p class="dp-explication"><b>La réparation :</b> ${f.reparation}</p>
        ${e.fautes.length ? `<p class="dp-explication"><b>À retenir pour la sécurité :</b> ${e.fautes.join(" ")}</p>` : ""}
        <button type="button" class="dp-bouton-plein" data-action="nouvelle">Intervention suivante</button>
      </section>` : ""}
    <div class="dp-grille">
      <div class="dp-col">
        <nav class="dp-lieux" aria-label="Où aller">${lieux.map(([id, l]) => `<button type="button" class="dp-chip ${e.vue === id || (id === "p3face" && e.vue === "p3") ? "actif" : ""}" data-${id === "scene" ? "scene" : "ouvrir"}="${id}">${l}</button>`).join("")}</nav>
        <div class="dp-vue">${vue}</div>
        ${e.vue !== "scene" ? `<div class="dp-lecture">
          <div class="dp-calibres">${[["OFF", "Arrêt"], ["V", "V~"], ["Ω", "Ω"]].map(([c, l]) => `<button type="button" class="dp-chip ${e.calibre === c ? "actif" : ""}" data-calibre="${c}">${l}</button>`).join("")}</div>
          <p class="dp-lcd" aria-live="polite">${e.calibre === "OFF" ? "—" : e.lecture ?? "– – –"}</p>
          <p class="dp-pointes"><span class="pastille rouge"></span> ${b1 ? b1.label : "touche une borne"}<br><span class="pastille noire"></span> ${b2 ? b2.label : b1 ? "touche une deuxième borne" : "—"}</p>
        </div>
        ${e.vue === "tableau" ? `<p class="dp-aide">Touche une manette pour la baisser ou la remonter, et une borne pour y poser une pointe de touche.</p>` : ""}` : ""}
        ${sc.commande && e.vue === "scene" ? `<p class="dp-aide">Clique l'interrupteur pour l'actionner, puis va mesurer. Les cadres jaunes sont les endroits où tu peux intervenir.</p>` : ""}
        ${e.vue === "scene" && !sc.commande ? `<p class="dp-aide">Les cadres jaunes sont les endroits où tu peux intervenir.</p>` : ""}
      </div>
      <aside class="dp-col dp-outils">
        ${bloc("Sécurité", `
          <button type="button" class="dp-interrupteur ${e.epi ? "on" : ""}" data-action="epi" aria-pressed="${e.epi}">🧤 Gants isolants + écran facial : <b>${e.epi ? "portés" : "non portés"}</b></button>
          <p class="dp-ligne">Circuit : <b>${consigne() ? "🔒 consigné" : e.app[sc.circuit] ? "⚡ sous tension" : "disjoncteur ouvert, pas de cadenas"}</b></p>
          ${e.vue === "tableau" ? `<button type="button" class="dp-bouton" data-action="cadenas">${e.cadenas ? "Retirer le cadenas" : "Poser le cadenas sur le disjoncteur du circuit"}</button>` : ""}`)}
        ${bloc("Multimètre", `
          <div class="dp-mm">${multimetre()}</div>
          <p class="dp-ligne"><span class="pastille rouge"></span> Pointe rouge : <b>${b1 ? b1.label : "clique une borne"}</b></p>
          <p class="dp-ligne"><span class="pastille noire"></span> Pointe noire : <b>${b2 ? b2.label : b1 ? "clique une deuxième borne" : "—"}</b></p>`, "dp-carte-mm")}
        ${bloc("Carnet de mesures", e.carnet.length ? `<ol class="dp-carnet">${e.carnet.map((c) => `<li>${c}</li>`).join("")}</ol>` : `<p class="dp-ligne">Tes mesures s'inscrivent ici.</p>`)}
        ${bloc("Diagnostic", e.diagnostic && !e.repare ? `<p class="dp-ligne">✔ Panne trouvée. Consigne le circuit, vérifie l'absence de tension, puis répare.</p><button type="button" class="dp-bouton-plein" data-action="reparer">Réparer</button>` : e.repare ? `<p class="dp-ligne">✔ Panne trouvée et réparée. ${e.fini ? "" : "Remets sous tension et vérifie."}</p>` : e.choix
          ? `<p class="dp-ligne">Quelle est la panne ?</p>${sc.pannes.map((p) => `<button type="button" class="dp-bouton dp-choix" data-diagnostic="${p.id}">${p.label}</button>`).join("")}<button type="button" class="dp-lien" data-action="annuler">Revenir aux mesures</button>`
          : `<button type="button" class="dp-bouton-plein" data-action="choisir">J'ai trouvé la panne</button>`)}
        <details class="dp-methode"><summary>La méthode</summary><ol>
          <li>Écoute le client : ce qui marche et ce qui ne marche plus situe déjà la panne.</li>
          <li>Regarde le tableau : un différentiel ou un disjoncteur en bas ?</li>
          <li>Mesure de la source vers le récepteur, en V~, toujours par rapport à une référence (neutre ou terre).</li>
          <li>Pour démonter un appareillage sous tension : gants isolants et écran facial.</li>
          <li>Pour une continuité (Ω) : disjoncteur ouvert, cadenas posé, absence de tension vérifiée sur place.</li>
        </ol></details>
        <button type="button" class="dp-lien" data-action="nouvelle">Autre panne au hasard</button>
      </aside>
    </div>`;
}

/* ---------- Événements ---------- */
racine.addEventListener("click", async (ev) => {
  const c = ev.target.closest("[data-borne],[data-manette],[data-ouvrir],[data-scene],[data-interrupteur],[data-basculer],[data-calibre],[data-action],[data-diagnostic],[data-scenario]");
  if (!c) return;
  const d = c.dataset;
  if (d.scenario !== undefined) { await charger(Number(d.scenario)); return; }
  if (d.borne) cliquerBorne(d.borne);
  else if (d.manette) manette(d.manette);
  else if (d.ouvrir) ouvrir(d.ouvrir);
  else if (d.scene) { e.vue = "scene"; e.rouge = e.noir = e.lecture = null; e.message = null; }
  else if (d.interrupteur || d.basculer) { e.app.inter = !e.app.inter; sonClac(); if (e.rouge && e.noir) mesurer(); }
  else if (d.calibre) { e.calibre = d.calibre; e.lecture = null; if (e.rouge && e.noir) mesurer(); }
  else if (d.diagnostic) diagnostiquer(d.diagnostic);
  else if (d.action === "epi") e.epi = !e.epi;
  else if (d.action === "cadenas") cadenas();
  else if (d.action === "choisir") e.choix = true;
  else if (d.action === "reparer") reparer();
  else if (d.action === "annuler") e.choix = null;
  else if (d.action === "nouvelle") { nouvelleIntervention(); }
  rendre();
  if (d.action === "nouvelle") racine.scrollIntoView({ behavior: "smooth" });
});
racine.addEventListener("keydown", (ev) => {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches("[role=button]")) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
});

async function charger(i) {
  sc = await fetch(SCENARIOS[i].fichier).then((r) => r.json());
  const imposee = new URLSearchParams(location.search).get("panne");
  nouvelleIntervention(sc.pannes.some((p) => p.id === imposee) ? imposee : undefined);
  rendre();
}
brancherBoutonSons();
const depart = Number(new URLSearchParams(location.search).get("s")) || 0;
charger(Math.min(depart, SCENARIOS.length - 1));
