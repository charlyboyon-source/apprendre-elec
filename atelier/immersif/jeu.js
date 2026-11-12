// Atelier dépannage immersif : une intervention chez Mme Martin, à la première personne.
// On questionne la cliente, on se déplace, on manipule (plaque, mécanisme, luminaire, ampoule),
// on mesure en posant soi-même les pointes, on répare au tournevis ou avec une pièce, on facture.
import "../../js/page.js";
import { crediterElectrons } from "../../js/progression.js";
import { brancherBoutonSons } from "../../js/audio.js";
import { DEFS, W, H, vueChambre, vueEntree, vueTableau, vueInter, vuePlafonnier, pointes, RANGEE1 } from "./dessins.js";
import { sons } from "./sons.js";

const racine = document.querySelector(".im");
let sc = null, e = null;
const REPOS = { rouge: { x: 1085, y: 735 }, noir: { x: 1015, y: 735 } };
const NOEUDS = {
  "diff-L": "Ld", "diff-N": "Nd", "diff-amont-L": "L", "diff-amont-N": "N",
  "dj-L": "DjL", "dj-N": "DjN", "dj-amont-L": "Ld", "dj-amont-N": "Nd",
  "d2-L": "PrL", "d2-N": "PrN", "d2-amont-L": "Ld", "d2-amont-N": "Nd",
  "d3-L": "SjL", "d3-N": "SjN", "d3-amont-L": "Ld", "d3-amont-N": "Nd",
  "d4-L": "D4L", "d4-N": "D4N", "d4-amont-L": "Ld", "d4-amont-N": "Nd",
  "terre": "PE", "int-E": "IntE", "int-S": "IntS", "prise-terre": "PE", "prise-d": "PrL", "prise-g": "PrN",
  "dcl-L": "DclL", "dcl-N": "DclN", "dcl-T": "PE",
};
const NOMS = {
  "diff-L": "sortie phase du différentiel", "diff-N": "sortie neutre du différentiel",
  "dj-L": "sortie phase du disjoncteur Éclairage chambres", "dj-N": "sortie neutre du disjoncteur Éclairage chambres",
  "dj-amont-L": "arrivée phase du disjoncteur Éclairage chambres", "dj-amont-N": "arrivée neutre du disjoncteur Éclairage chambres",
  "d2-L": "sortie phase du disjoncteur Prises chambres", "d2-N": "sortie neutre du disjoncteur Prises chambres",
  "d3-L": "sortie phase du disjoncteur Prises séjour", "d3-N": "sortie neutre du disjoncteur Prises séjour",
  "d4-L": "sortie phase du disjoncteur Éclairage séjour", "d4-N": "sortie neutre du disjoncteur Éclairage séjour",
  "diff-amont-L": "arrivée phase du différentiel", "diff-amont-N": "arrivée neutre du différentiel",
  "d2-amont-L": "arrivée phase (Prises chambres)", "d2-amont-N": "arrivée neutre (Prises chambres)",
  "d3-amont-L": "arrivée phase (Prises séjour)", "d3-amont-N": "arrivée neutre (Prises séjour)",
  "d4-amont-L": "arrivée phase (Éclairage séjour)", "d4-amont-N": "arrivée neutre (Éclairage séjour)",
  "terre": "bornier de terre", "int-E": "borne L de l'interrupteur", "int-S": "borne 1 de l'interrupteur",
  "prise-terre": "broche de terre de la prise", "prise-d": "alvéole droite de la prise", "prise-g": "alvéole gauche de la prise",
  "dcl-L": "borne L du DCL", "dcl-N": "borne N du DCL", "dcl-T": "borne de terre du DCL",
};
const CIBLE = { DjL: "dj-L", IntS: "int-S", DclN: "dcl-N", DclL: "dcl-L" };
const MINUTES = { question: 1, aller: 1, plaque: 1, meca: 3, remonter: 3, decrocher: 3, dcl: 2, ampoule: 1, mesure: 0.5, manette: 0.5, serrer: 2, refaire: 6 };

/* ---------- Modèle électrique ---------- */
function liaisons() {
  return [...sc.liaisons, { a: "Ld", b: "D4L", si: "d4" }, { a: "Nd", b: "D4N", si: "d4" }];
}
function conduit(l) {
  if (l.coupePar && l.coupePar === e.panne.id && !e.repare) return false;
  if (l.si) {
    const v = l.si === "ampouleMontee" ? e.dcl === 0 && e.ampoule : e.app[l.si];
    if (!v) return false;
  }
  return true;
}
function potentiels() {
  const parent = {};
  const f = (x) => (parent[x] === undefined || parent[x] === x ? (parent[x] = x) : (parent[x] = f(parent[x])));
  const actives = liaisons().filter(conduit);
  for (const l of actives) if (!l.charge) parent[f(l.a)] = f(l.b);
  const pot = { [f("L")]: 230, [f("N")]: 0, [f("PE")]: 0 };
  let change = true;
  while (change) {
    change = false;
    for (const l of actives.filter((x) => x.charge)) {
      const a = f(l.a), b = f(l.b);
      if (pot[a] !== undefined && pot[b] === undefined) { pot[b] = pot[a]; change = true; }
      else if (pot[b] !== undefined && pot[a] === undefined) { pot[a] = pot[b]; change = true; }
    }
  }
  return { de: (n) => pot[f(n)], groupe: f };
}
function lampeAllumee() {
  const charge = liaisons().find((l) => l.a === "DclL" && l.b === "DclN");
  if (!conduit(charge)) return false;
  const p = potentiels();
  return p.de("DclL") === 230 && p.groupe("DclN") === p.groupe("N");
}
function fuite() {
  const f = e.panne.fuite;
  if (!f || e.repare || e.dcl !== 0) return false;
  return f.si.every((k) => e.app[k]);
}

/* ---------- État ---------- */
function nouvelle(id) {
  const liste = sc.pannes.map((p) => p.id);
  let pid = id && liste.includes(id) ? id : liste[Math.floor(Math.random() * liste.length)];
  if (!id && e && e.panne.id === pid) pid = liste[(liste.indexOf(pid) + 1) % liste.length];
  const panne = sc.pannes.find((p) => p.id === pid);
  const app = { inter: false };
  for (const a of RANGEE1) app[a.cle] = true;
  Object.assign(app, panne.depart || {});
  e = {
    panne, app, vue: "porte", outil: "main", calibre: "V", lecture: null,
    inter: 0, dcl: 0, ampoule: true, ampouleNeuve: false, ampouleEnMain: false,
    repare: false, fini: false, minutes: 0, pieces: [], piecesInutiles: 0,
    questions: {}, fautes: [], accident: false, verifies: new Set(), journal: [], bulle: null,
    rouge: { ...REPOS.rouge }, noir: { ...REPOS.noir }, derniere: null, panneau: "client",
  };
  e.loose = panne.visible;
}
function temps(m) { e.minutes += m; }
function facture() {
  const quarts = Math.max(1, Math.ceil(e.minutes / 15));
  const mo = quarts * 15;
  const pieces = e.pieces.reduce((s, p) => s + p.prix, 0);
  return { deplacement: 45, mo, quarts, pieces, total: 45 + mo + pieces };
}
function dire(t, type = "info") { e.bulle = { t, type }; }
function faute(t) { if (!e.fautes.includes(t)) e.fautes.push(t); }

/* ---------- Gestes ---------- */
function geste(g) {
  const [nom, arg] = g.split(":");
  switch (nom) {
    case "interrupteur":
      e.app.inter = !e.app.inter; sons.interrupteur();
      dire(e.app.inter ? "Clic. Interrupteur sur « I »." : "Clic. Interrupteur sur « O ».");
      break;
    case "manette": {
      const a = RANGEE1.find((x) => x.cle === arg);
      if (!a) { sons.disjoncteur(); dire("Ce circuit n'a rien à voir avec la chambre : tu le laisses tel quel."); break; }
      e.app[arg] = !e.app[arg]; sons.disjoncteur(); temps(MINUTES.manette);
      dire(`${a.etiquette} : manette ${e.app[arg] ? "remontée" : "baissée"}.`);
      break;
    }
    case "deposerPlaque": e.inter = 1; temps(MINUTES.plaque); sons.clip(); dire("Tu déclipses la plaque de finition. Le mécanisme est tenu par deux vis."); break;
    case "sortirMeca": e.inter = 2; temps(MINUTES.meca); sons.vis(); dire("Tu dévisses les deux vis de fixation et tu sors le mécanisme de sa boîte. Les bornes sont accessibles au dos."); break;
    case "remonterMeca": e.inter = 0; temps(MINUTES.remonter); sons.vis(); sons.clip(); dire("Mécanisme revissé, plaque reclipsée."); break;
    case "decrocher": e.dcl = 1; temps(MINUTES.decrocher); sons.clip(); dire("Tu montes sur l'escabeau et tu débranches la fiche DCL : le luminaire est décroché."); break;
    case "raccrocher": e.dcl = 0; temps(MINUTES.dcl); sons.clip(); dire("Luminaire rebranché sur sa prise DCL."); break;
    case "ouvrirDcl": e.dcl = 2; temps(MINUTES.dcl); sons.clip(); dire("Boîte DCL ouverte : les trois bornes sont devant toi."); break;
    case "fermerDcl": e.dcl = 1; temps(MINUTES.dcl); sons.clip(); dire("Boîte DCL refermée."); break;
    case "devisserAmpoule": e.ampoule = false; e.ampouleEnMain = true; temps(MINUTES.ampoule); dire("Ampoule dévissée. C'est une ampoule LED : pas de filament à regarder, et l'ohmmètre ne dit rien de fiable sur son électronique."); break;
    case "visserAmpoule": e.ampoule = true; e.ampouleEnMain = false; temps(MINUTES.ampoule); dire(e.ampouleNeuve ? "Ampoule neuve vissée." : "Ampoule revissée."); break;
  }
}
function piece(id) {
  const p = sc.pieces.find((x) => x.id === id);
  if (id === "remplacerAmpoule") {
    if (e.vue !== "plafonnier" || e.dcl !== 0 || e.ampoule) { dire("Pour changer l'ampoule, monte au plafonnier et dévisse d'abord l'ancienne.", "info"); return; }
    e.ampouleNeuve = true; e.ampoule = true; e.ampouleEnMain = false;
  }
  if (id === "remplacerInter") {
    if (e.vue !== "inter" || e.inter !== 2) { dire("Pour changer le mécanisme, sors-le d'abord de sa boîte.", "info"); return; }
    const pt = potentiels();
    if (pt.de("IntE") === 230 || pt.de("IntS") === 230) { electrisation("en débranchant les fils de l'interrupteur"); return; }
    if (!e.verifies.has("IntE")) faute("Tu as remplacé l'interrupteur sans avoir vérifié l'absence de tension sur ses bornes.");
  }
  temps(p.minutes); e.pieces.push(p); sons.vis();
  const utile = e.panne.reparation === id || (id === "remplacerInter" && e.panne.id === "sortie");
  if (utile && !e.repare) { e.repare = true; e.loose = null; }
  else e.piecesInutiles++;
  dire(`${p.nom} posé (${p.prix} €).`, "ok");
  e.panneau = null;
}
function electrisation(ou) {
  e.accident = true; sons.zap();
  faute(`Électrisation ${ou} : la borne était sous tension. Avant de toucher un conducteur, on coupe le circuit et on vérifie l'absence de tension au multimètre, là où on travaille.`);
  dire(`⚡ Décharge ! Tu as pris le courant ${ou}. Sur un vrai chantier, c'est l'accident.`, "danger");
  racine.classList.remove("secousse"); void racine.offsetWidth; racine.classList.add("secousse");
}
function tournevis(idv) {
  const n = NOEUDS[idv];
  if (!n || idv.startsWith("prise")) { dire("Il n'y a rien à serrer ici.", "info"); return; }
  const pt = potentiels();
  if (pt.de(n) === 230) { electrisation(`en serrant la ${NOMS[idv]}`); return; }
  if (n !== "PE" && pt.de(n) !== undefined) faute(`Tu as serré la ${NOMS[idv]} alors que le circuit était sous tension. Même un neutre peut devenir dangereux (un neutre coupé prend la tension de la phase) : on coupe toujours avant.`);
  if (!e.verifies.has(n)) faute(`Tu as travaillé sur la ${NOMS[idv]} sans avoir vérifié l'absence de tension.`);
  sons.vis();
  const cible = e.panne.cible && CIBLE[e.panne.cible];
  if (!e.repare && cible === idv) {
    const refaire = e.panne.reparation === "refaire";
    temps(refaire ? MINUTES.refaire : MINUTES.serrer);
    e.repare = true; e.loose = null;
    dire(refaire ? "Tu recoupes l'âme abîmée, tu redénudes à la bonne longueur et tu refais la connexion. Plus rien ne touche la terre." : "Tu engages bien le fil sous la vis et tu serres au bon couple. La connexion tient.", "ok");
  } else {
    temps(MINUTES.serrer);
    dire("Tu contrôles le serrage : cette vis était déjà bien serrée.");
  }
}

/* ---------- Mesures ---------- */
function visSous(p) {
  let best = null, dmin = 40;
  racine.querySelectorAll(".im-scene [data-vis]").forEach((g) => {
    const c = g.querySelector("circle"); const x = +c.getAttribute("cx"), y = +c.getAttribute("cy");
    const d = Math.hypot(x - p.x, y - p.y);
    if (d < dmin) { dmin = d; best = { id: g.dataset.vis, x, y }; }
  });
  return best;
}
function mesurer() {
  const a = e.rouge.vis, b = e.noir.vis;
  if (!a || !b || a === b) { e.lecture = null; return; }
  const cle = `${a}|${b}|${e.calibre}`;
  if (e.calibre === "OFF") { e.lecture = null; return; }
  const pt = potentiels();
  const na = NOEUDS[a], nb = NOEUDS[b];
  if (e.calibre === "Ω") {
    if (pt.de(na) === 230 || pt.de(nb) === 230) {
      e.lecture = "Hi V"; sons.alarme();
      faute("Ohmmètre posé sur des bornes sous tension : une continuité se mesure circuit coupé, jamais sous tension.");
      dire("L'appareil hurle : tension détectée sur le calibre Ω ! Un multimètre bas de gamme n'y survivrait pas.", "danger");
      return;
    }
    // Fil direct = continuité ; à travers une ampoule LED, la mesure ne veut rien dire.
    const fil = liaisons().filter((l) => conduit(l) && !l.charge);
    const vus = new Set([na]), file = [na];
    while (file.length) { const x = file.shift(); for (const l of fil) { const y = l.a === x ? l.b : l.b === x ? l.a : null; if (y && !vus.has(y)) { vus.add(y); file.push(y); } } }
    e.lecture = vus.has(nb) ? "0,2 Ω" : "OL";
  } else {
    const va = pt.de(na), vb = pt.de(nb);
    const u = va === undefined || vb === undefined ? 0 : Math.abs(va - vb);
    e.lecture = u ? "230 V" : "0 V";
    if (!u && (!e.app.dj || !e.app.diff)) { e.verifies.add(na); e.verifies.add(nb); }
  }
  sons.bip();
  if (e.derniere !== cle) {
    e.derniere = cle; temps(MINUTES.mesure);
    const etat = `interrupteur sur ${e.app.inter ? "I" : "O"}`;
    e.journal.unshift(`${NOMS[a]} ↔ ${NOMS[b]} : <b>${e.lecture}</b> <small>(${etat})</small>`);
    e.journal = e.journal.slice(0, 14);
  }
}

/* ---------- Fin ---------- */
function verifierFin() {
  if (e.fini || !e.repare) return;
  const tout = RANGEE1.every((a) => e.app[a.cle]);
  if (tout && lampeAllumee() && e.inter === 0 && e.dcl === 0 && e.vue === "chambre") {
    e.fini = true; sons.succes();
    let etoiles = 3;
    if (e.fautes.length) etoiles--;
    if (e.piecesInutiles) etoiles--;
    if (e.minutes > 45) etoiles--;
    if (e.accident) etoiles = Math.min(etoiles, 1);
    e.etoiles = Math.max(1, etoiles);
    crediterElectrons(e.etoiles * 15);
    e.panneau = "fin";
  }
}

/* ---------- Rendu ---------- */
function vueSVG() {
  e.lampeAllumee = lampeAllumee();
  const v = { porte: vueChambre, chambre: vueChambre, entree: vueEntree, tableau: vueTableau, inter: vueInter, plafonnier: vuePlafonnier }[e.vue];
  return `<svg class="im-scene" viewBox="0 0 ${W} ${H}" role="img" aria-label="Vue : ${e.vue}">${DEFS}<g class="im-vue">${v(e)}</g><g class="im-pointes">${e.vue === "porte" ? "" : pointes(e)}</g></svg>`;
}
function majPointes() {
  const g = racine.querySelector(".im-pointes"); if (g) g.innerHTML = pointes(e);
  const l = racine.querySelector(".im-lcd"); if (l) l.textContent = lcd();
}
const lcd = () => (e.calibre === "OFF" ? "" : e.lecture || (e.calibre === "V" ? "- - -  V" : "- - -  Ω"));

function panneauClient() {
  const qs = sc.questions.map((q) => e.questions[q.id]
    ? `<div class="im-qr"><p class="im-q">${q.texte}</p><p class="im-r">« ${e.panne.reponses[q.id]} »</p></div>`
    : `<button type="button" class="im-question" data-question="${q.id}">${q.texte}</button>`).join("");
  return `<div class="im-panneau im-client">
    <div class="im-client-tete"><span class="im-avatar" aria-hidden="true">MM</span><div><b>${sc.client}</b><small>${sc.adresse}</small></div></div>
    <p class="im-r">« ${sc.accueil} »</p>${qs}
    <button type="button" class="im-plein" data-action="fermer">${e.vue === "porte" ? "Aller voir dans la chambre" : "Retour au travail"}</button>
  </div>`;
}
function panneauCamion() {
  return `<div class="im-panneau"><h2>Dans la camionnette</h2>
    ${sc.pieces.map((p) => `<button type="button" class="im-question" data-piece="${p.id}"><b>${p.nom}</b> · ${p.prix} € · ${p.minutes} min de pose</button>`).join("")}
    <p class="im-petit">Une pièce changée pour rien reste sur la facture du client.</p>
    <button type="button" class="im-lien" data-action="fermer">Refermer la camionnette</button></div>`;
}
function panneauFin() {
  const f = facture();
  return `<div class="im-panneau im-fin">
    <p class="im-etoiles">${"★".repeat(e.etoiles)}${"☆".repeat(3 - e.etoiles)}</p>
    <h2>« La lumière ! Merci beaucoup. »</h2>
    <table class="im-facture"><tbody>
      <tr><td>Déplacement</td><td>${f.deplacement} €</td></tr>
      <tr><td>Main d'œuvre (${f.quarts} × ¼ h, ${Math.round(e.minutes)} min)</td><td>${f.mo} €</td></tr>
      ${e.pieces.map((p) => `<tr><td>${p.nom}</td><td>${p.prix} €</td></tr>`).join("")}
      <tr class="total"><td>Total</td><td>${f.total} €</td></tr></tbody></table>
    <h3>${e.panne.titre}</h3>
    <p>${e.panne.explication}</p>
    ${e.piecesInutiles ? `<p class="im-alerte">${e.piecesInutiles} pièce${e.piecesInutiles > 1 ? "s" : ""} changée${e.piecesInutiles > 1 ? "s" : ""} pour rien : la cliente l'a payée.</p>` : ""}
    ${e.fautes.length ? `<ul class="im-fautes">${e.fautes.map((x) => `<li>${x}</li>`).join("")}</ul>` : `<p class="im-ok">Aucune faute de sécurité.</p>`}
    <p class="im-petit">+${e.etoiles * 15} e⁻</p>
    <button type="button" class="im-plein" data-action="suivante">Intervention suivante</button>
  </div>`;
}
function rendre() {
  verifierFin();
  const f = facture();
  const panneau = e.panneau === "client" ? panneauClient() : e.panneau === "camion" ? panneauCamion() : e.panneau === "fin" ? panneauFin() : "";
  racine.innerHTML = `
    <div class="im-hud">
      <div class="im-titre"><b>${sc.titre}</b><span>${sc.adresse}</span></div>
      <div class="im-compteurs"><span title="Temps passé">⏱ ${Math.round(e.minutes)} min</span><span title="Facture en cours">🧾 ${f.total} €</span></div>
    </div>
    <p class="im-paysage">📱 Tourne ton téléphone pour jouer en grand.</p>
    <div class="im-cadre ${e.outil === "tournevis" ? "outil-tournevis" : ""}">
      ${vueSVG()}
      ${e.bulle ? `<p class="im-bulle ${e.bulle.type}" role="status">${e.bulle.t}</p>` : ""}
      ${panneau ? `<div class="im-voile">${panneau}</div>` : ""}
    </div>
    <div class="im-barre">
      <div class="im-outils" role="group" aria-label="Outils">
        <button type="button" class="${e.outil === "main" ? "actif" : ""}" data-outil="main">✋ Main</button>
        <button type="button" class="${e.outil === "tournevis" ? "actif" : ""}" data-outil="tournevis">🪛 Tournevis</button>
        <button type="button" data-panneau="client">💬 ${sc.client}</button>
        <button type="button" data-panneau="camion">🚐 Camionnette</button>
      </div>
      <div class="im-multimetre" aria-label="Multimètre">
        <div class="im-calibres">${[["OFF", "Arrêt"], ["V", "V~"], ["Ω", "Ω"]].map(([c, l]) => `<button type="button" class="${e.calibre === c ? "actif" : ""}" data-calibre="${c}">${l}</button>`).join("")}</div>
        <output class="im-lcd">${lcd()}</output>
      </div>
    </div>
    <details class="im-carnet" ${e.journal.length ? "open" : ""}><summary>Carnet de mesures (${e.journal.length})</summary>
      ${e.journal.length ? `<ol>${e.journal.map((j) => `<li>${j}</li>`).join("")}</ol>` : `<p>Glisse les pointes rouge et noire (en bas à droite de l'image) sur deux vis ou bornes : la mesure s'inscrit ici.</p>`}
    </details>
    <p class="im-astuce">Pointes : on les attrape et on les pose sur une vis. Tournevis : on touche la vis à serrer. Main : manettes, interrupteur, plaque, luminaire, ampoule.</p>`;
}

/* ---------- Événements ---------- */
let tenue = null;
function point(ev) {
  const s = racine.querySelector(".im-scene").getBoundingClientRect();
  return { x: ((ev.clientX - s.left) * W) / s.width, y: ((ev.clientY - s.top) * H) / s.height };
}
racine.addEventListener("pointerdown", (ev) => {
  const g = ev.target.closest(".pointe");
  if (!g || e.panneau) return;
  tenue = g.dataset.pointe; ev.preventDefault();
  racine.setPointerCapture(ev.pointerId);
});
racine.addEventListener("pointermove", (ev) => {
  if (!tenue) return;
  const p = point(ev);
  e[tenue] = { x: Math.max(10, Math.min(W - 10, p.x)), y: Math.max(110, Math.min(H + 20, p.y)) };
  majPointes();
});
racine.addEventListener("pointerup", () => {
  if (!tenue) return;
  const v = visSous(e[tenue]);
  e[tenue] = v ? { x: v.x, y: v.y, vis: v.id } : { ...e[tenue], vis: null };
  tenue = null;
  e.lecture = null;
  if (e.rouge.vis && e.noir.vis) { mesurer(); if (e.lecture) dire(`${NOMS[e.rouge.vis]} ↔ ${NOMS[e.noir.vis]} : ${e.lecture}`, "mesure"); }
  rendre();
});
racine.addEventListener("click", (ev) => {
  if (tenue) return;
  const t = ev.target.closest("[data-aller],[data-geste],[data-vis],[data-outil],[data-panneau],[data-calibre],[data-question],[data-piece],[data-action]");
  if (!t) return;
  const d = t.dataset;
  if (e.panneau && !t.closest(".im-voile") && !t.closest(".im-barre")) return;
  if (d.aller) {
    if (e.vue === "inter" && e.inter > 0 && d.aller !== "inter") { dire("Remets d'abord le mécanisme et la plaque : on ne laisse pas des bornes accessibles derrière soi.", "info"); }
    else { e.vue = d.aller; temps(MINUTES.aller); e.bulle = null; e.rouge = { ...REPOS.rouge }; e.noir = { ...REPOS.noir }; e.lecture = null; e.derniere = null; }
  } else if (d.geste) {
    const g = d.geste;
    if (e.outil === "tournevis" && !g.startsWith("manette") && g !== "interrupteur" && !["sortirMeca", "remonterMeca", "ouvrirDcl", "fermerDcl"].includes(g)) { e.outil = "main"; }
    geste(g);
    if (fuite()) { e.app.diff = false; setTimeout(() => sons.disjoncteur(), 120); dire("Clac ! Dans l'entrée, le différentiel vient de déclencher. Toute la chambre et le séjour sont dans le noir.", "alerte"); }
    if (e.rouge.vis && e.noir.vis) mesurer();
  } else if (d.vis) {
    if (e.outil === "tournevis") tournevis(d.vis);
    else dire("Pour mesurer, attrape une pointe du multimètre et pose-la sur la vis. Pour serrer, prends le tournevis.", "info");
  } else if (d.outil) e.outil = d.outil;
  else if (d.panneau) e.panneau = e.panneau === d.panneau ? null : d.panneau;
  else if (d.calibre) { e.calibre = d.calibre; e.derniere = null; mesurer(); }
  else if (d.question) { e.questions[d.question] = true; temps(MINUTES.question); }
  else if (d.piece) piece(d.piece);
  else if (d.action === "fermer") { if (e.vue === "porte") { e.vue = "chambre"; dire("La chambre est dans la pénombre. L'interrupteur est à côté de la porte."); } e.panneau = null; }
  else if (d.action === "suivante") { nouvelle(); }
  rendre();
});
racine.addEventListener("keydown", (ev) => {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches("[role=button]")) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
});

async function demarrer() {
  sc = await fetch("atelier/immersif/chambre.json").then((r) => r.json());
  nouvelle(new URLSearchParams(location.search).get("panne"));
  rendre();
}
brancherBoutonSons();
demarrer();
