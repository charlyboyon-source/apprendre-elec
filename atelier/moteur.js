// Atelier dépannage — moteur unique, data-driven.
// Lit un scénario JSON (contrat fixe) et fait tourner toute la recherche de panne :
// scène -> inspection -> multimètre -> journal -> diagnostic.
// Régime TT. Aucun framework : vanilla DOM + Web Audio (sons existants).

import { majCompteurElectrons } from "../js/progression.js";
import { brancherBoutonSons, sonClac, sonVictoire, sonEchec } from "../js/audio.js";
import { brancherMenu } from "../js/menu.js";
import { activerTermes, brancherTermes } from "../js/glossaire.js";

const SCENARIO = "atelier/scenarios/01-point-lumineux.json";

/* ============================================================
   MODÈLE ÉLECTRIQUE (régime TT) — solveur de graphe générique
   Aucune topologie codée en dur : le circuit est entièrement décrit
   dans le scénario (scenario.circuit).
   - segmentsL / segmentsN : arêtes orientées {de, a, coupePar} ;
     un segment reste praticable tant que sa panne (coupePar) n'est
     pas active.
   - sourceL / sourceN : nœuds d'origine.
   - continuite : test hors tension entre deux bornes.
   Phase vivante  = il existe un chemin sourceL  -> nœud (segments non coupés).
   Neutre référence = il existe un chemin sourceN -> nœud (segments non coupés).
   Terre (PE) = toujours "ref".
   ============================================================ */

// Existe-t-il un chemin de `source` à `cible` en n'empruntant que les
// segments non coupés par la panne `p` ? (parcours en largeur)
function cheminExiste(segments, source, cible, p) {
  if (cible === source) return true;
  const vus = new Set([source]);
  const file = [source];
  while (file.length) {
    const courant = file.shift();
    for (const seg of segments) {
      if (seg.coupePar === p || seg.de !== courant || vus.has(seg.a)) continue;
      if (seg.a === cible) return true;
      vus.add(seg.a);
      file.push(seg.a);
    }
  }
  return false;
}

function phaseVivante(node, p) {
  const c = scenario.circuit;
  return cheminExiste(c.segmentsL, c.sourceL, node, p);
}
function neutreReference(node, p) {
  const c = scenario.circuit;
  return cheminExiste(c.segmentsN, c.sourceN, node, p);
}
// Catégorie d'une borne : "hot" (phase vivante), "ref" (référence valide) ou "dead".
function categorie(borne, p) {
  if (borne.conducteur === "PE") return "ref";
  if (borne.conducteur === "N")  return neutreReference(borne.node, p) ? "ref" : "dead";
  return phaseVivante(borne.node, p) ? "hot" : "dead";   // L
}
// Tension entre 2 bornes = 230 V si l'une est "hot" ET l'autre "ref", sinon 0 V.
function mesureTension(b1, b2, p, sousTension) {
  if (!sousTension) return 0;                            // consigné : plus aucune tension
  const c1 = categorie(b1, p), c2 = categorie(b2, p);
  const couple = (c1 === "hot" && c2 === "ref") || (c1 === "ref" && c2 === "hot");
  return couple ? 230 : 0;
}
// Continuité (hors tension) : ∞ Ω si la panne déclarée est active, sinon 0 Ω.
function mesureContinuite(p) {
  return p === scenario.circuit.continuite.coupeSi ? Infinity : 0;
}

/* ============================================================
   ÉTAT
   ============================================================ */
let scenario = null;
const etat = {
  panneActive: null,   // id de la panne réellement présente
  sousTension: true,   // false = installation consignée
  pointActif: null,    // point d'intervention en cours d'inspection
  mode: "OFF",         // OFF | V | Ohm
  sondeRouge: null,    // id de borne (point courant)
  sondeNoir: null,
  journal: [],         // mesures relevées
  diagnostic: null,    // id de panne choisi
  resolu: false,
  note: ""             // message transitoire
};

const racine = () => document.querySelector(".atelier");
function pointCourant() { return scenario.pointsIntervention.find((p) => p.id === etat.pointActif); }
function borneDe(id) { return pointCourant()?.bornes.find((b) => b.id === id) || null; }

/* ============================================================
   ACTIONS
   ============================================================ */
function nouvellePanne() {
  const ids = scenario.pannes.map((p) => p.id);
  let choix;
  do { choix = ids[Math.floor(Math.random() * ids.length)]; } while (ids.length > 1 && choix === etat.panneActive);
  etat.panneActive = choix;
  etat.sousTension = true;
  etat.pointActif = null;
  etat.mode = "OFF";
  etat.sondeRouge = etat.sondeNoir = null;
  etat.journal = [];
  etat.diagnostic = null;
  etat.resolu = false;
  etat.note = "";
  sonClac();
  rendre();
}

function ouvrirPoint(id) {
  etat.pointActif = id;
  etat.sondeRouge = etat.sondeNoir = null;   // sondes propres à chaque élément
  etat.note = "";
  rendre();
}
function revenirScene() {
  etat.pointActif = null;
  etat.sondeRouge = etat.sondeNoir = null;
  rendre();
}

function choisirMode(m) {
  etat.mode = m;
  etat.note = "";
  rendre();
}
function basculerTension() {
  etat.sousTension = !etat.sousTension;
  etat.note = "";
  sonClac();
  rendre();
}
function reinitSondes() {
  etat.sondeRouge = etat.sondeNoir = null;
  etat.note = "";
  rendre();
}

function cliquerBorne(id) {
  etat.note = "";
  if (etat.mode === "OFF") { etat.note = "Tourne d'abord le sélecteur sur V~ ou Ω."; rendre(); return; }
  if (!etat.sondeRouge) {
    etat.sondeRouge = id;
  } else if (!etat.sondeNoir) {
    if (id === etat.sondeRouge) { rendre(); return; }
    etat.sondeNoir = id;
    const m = mesureCourante();
    if (m && (m.type === "V" || m.type === "Ohm")) ajouterJournal(m);
  } else {
    etat.sondeRouge = id;     // nouvelle paire
    etat.sondeNoir = null;
  }
  rendre();
}

function mesureCourante() {
  if (etat.mode === "OFF" || !etat.sondeRouge || !etat.sondeNoir) return null;
  const b1 = borneDe(etat.sondeRouge), b2 = borneDe(etat.sondeNoir);
  if (!b1 || !b2) return null;
  if (etat.mode === "V") {
    const v = mesureTension(b1, b2, etat.panneActive, etat.sousTension);
    return { type: "V", b1, b2, texte: `${v} V` };
  }
  // Ω — continuité
  if (etat.sousTension) {
    return { type: "bloque", b1, b2, texte: "⚠", message: "On ne mesure JAMAIS la continuité sous tension. Consigne d'abord l'installation (bouton ci-dessus)." };
  }
  const cont = scenario.circuit.continuite;
  const bonnesBornes = (b1.id === cont.bornes[0] && b2.id === cont.bornes[1]) || (b1.id === cont.bornes[1] && b2.id === cont.bornes[0]);
  if (!bonnesBornes) {
    return { type: "na", b1, b2, texte: "—", message: `En Ω, place les deux sondes sur les deux bornes de « ${cont.label} » pour tester la continuité.` };
  }
  const r = mesureContinuite(etat.panneActive);
  return { type: "Ohm", b1, b2, texte: r === Infinity ? "∞ Ω" : "0 Ω" };
}

function ajouterJournal(m) {
  const ligne = `${pointCourant().label} — ${m.b1.label} ↔ ${m.b2.label} : ${m.texte}`;
  if (etat.journal[etat.journal.length - 1] === ligne) return;  // pas de doublon consécutif
  etat.journal.push(ligne);
}

function diagnostiquer(id) {
  etat.diagnostic = id;
  if (id === etat.panneActive) { etat.resolu = true; sonVictoire(); }
  else { etat.resolu = false; sonEchec(); }
  rendre();
}

/* ============================================================
   RENDU
   ============================================================ */
function rendre() {
  const c = racine();
  if (!scenario) { c.innerHTML = `<p class="at-message">Chargement du scénario…</p>`; return; }

  c.innerHTML = `
    <section class="at-entete">
      <p class="at-kicker">ATELIER DÉPANNAGE · ${etat.panneActive ? "RÉGIME TT" : ""}</p>
      <h1>${scenario.titre}</h1>
      <p class="at-enonce">${scenario.enonce}</p>
    </section>

    <div class="at-controls">
      <button class="at-bouton at-bouton--plein" type="button" data-action="nouvelle">🎲 Nouvelle panne</button>
      <button class="at-toggle ${etat.sousTension ? "" : "is-consigne"}" type="button" data-action="toggle-tension" role="switch" aria-checked="${!etat.sousTension}">
        <span class="at-toggle-etat">${etat.sousTension ? "⚡ Sous tension" : "🔒 Consigné"}</span>
      </button>
    </div>

    <div class="at-grid">
      <div class="at-col at-col--visuel">
        ${carteVisuel()}
      </div>
      <div class="at-col at-col--outils">
        ${carteMultimetre()}
        ${carteJournal()}
        ${carteDiagnostic()}
      </div>
    </div>`;

  brancherTermes(c);
}

function carte(num, titre, corps, classe = "") {
  return `<section class="at-carte ${classe}">
    <header class="at-carte-tete"><span class="at-num">${num}</span><h2>${titre}</h2></header>
    <div class="at-carte-corps">${corps}</div>
  </section>`;
}

function carteVisuel() {
  if (!etat.pointActif) {
    return carte(1, "La scène — clique un point d'intervention", `
      <div class="at-scene">${sceneSVG()}</div>
      <p class="at-aide">3 endroits à inspecter : le tableau, l'interrupteur déposé, le plafonnier.</p>`);
  }
  const pt = pointCourant();
  return carte(2, `Inspection — ${pt.label}`, `
    <button class="at-bouton at-bouton--lien" type="button" data-action="scene">← Revenir à la pièce</button>
    <div class="at-inspection">${inspectionSVG(pt)}</div>
    <p class="at-aide">Touche une borne pour y poser la sonde 🔴, puis une seconde pour la sonde ⚫. La mesure s'affiche au multimètre et s'inscrit au journal.</p>
    ${legendeConducteurs()}`);
}

function carteMultimetre() {
  const m = mesureCourante();
  const ecran = etat.mode === "OFF" ? "OFF" : (m ? m.texte : "– – –");
  const rouge = etat.sondeRouge ? borneDe(etat.sondeRouge)?.label : "—";
  const noir  = etat.sondeNoir ? borneDe(etat.sondeNoir)?.label : "—";
  const message = etat.note || (m && m.message) || "";
  const dispo = !!etat.pointActif;
  return carte(3, "Multimètre", `
    <div class="multi">
      <div class="multi-ecran ${etat.mode === "Ohm" ? "is-ohm" : ""}"><span class="multi-valeur">${ecran}</span></div>
      <div class="multi-select" role="radiogroup" aria-label="Sélecteur">
        ${["OFF", "V", "Ohm"].map((mo) => `
          <button type="button" class="${etat.mode === mo ? "is-actif" : ""}" data-mode="${mo}" role="radio" aria-checked="${etat.mode === mo}">${mo === "V" ? "V~" : mo === "Ohm" ? "Ω" : "OFF"}</button>`).join("")}
      </div>
      <div class="multi-sondes">
        <span class="sonde sonde--rouge">🔴 ${rouge}</span>
        <span class="sonde sonde--noir">⚫ ${noir}</span>
        <button class="at-bouton at-bouton--mini" type="button" data-action="reset-sondes" ${etat.sondeRouge ? "" : "disabled"}>Réinitialiser</button>
      </div>
    </div>
    ${message ? `<p class="multi-message">${message}</p>` : ""}
    ${dispo ? "" : `<p class="at-aide">Ouvre un point d'intervention pour brancher les sondes.</p>`}`);
}

function carteJournal() {
  const corps = etat.journal.length
    ? `<ul class="journal">${etat.journal.map((l) => `<li>${l}</li>`).join("")}</ul>`
    : `<p class="journal-vide">Aucune mesure pour l'instant.</p>`;
  return carte(4, "Journal de mesures", corps);
}

function carteDiagnostic() {
  const choix = scenario.pannes.map((p) => {
    let cls = "";
    if (etat.diagnostic === p.id) cls = etat.resolu ? "is-bon" : "is-mauvais";
    return `<button type="button" class="diag-choix ${cls}" data-diag="${p.id}">${p.label}</button>`;
  }).join("");

  let feedback = "";
  if (etat.diagnostic) {
    const ok = etat.resolu;
    const intro = ok
      ? "✓ Exact. Panne identifiée."
      : "✗ Pas tout à fait — reprends tes mesures. Pour cette piste :";
    const panne = scenario.pannes.find((p) => p.id === etat.diagnostic);
    feedback = `<div class="diag-feedback ${ok ? "ok" : "ko"}">
        <p class="diag-verdict">${intro}</p>
        <p class="diag-raison">${activerTermes(panne?.explication || "")}</p>
      </div>`;
  }
  return carte(5, "Diagnostic — quelle est la cause ?", `<div class="diag-choix-zone">${choix}</div>${feedback}`);
}

function legendeConducteurs() {
  return `<ul class="at-legende">
    <li><span class="pastille pastille--L"></span> Phase (L)</li>
    <li><span class="pastille pastille--N"></span> Neutre (N)</li>
    <li><span class="pastille pastille--PE"></span> Terre (PE)</li>
  </ul>`;
}

/* ============================================================
   SVG — scène et inspections
   ============================================================ */
function sceneSVG() {
  // Chambre en perspective iso, 3 hotspots cliquables.
  return `<svg viewBox="0 0 400 300" role="img" aria-label="La chambre">
    <!-- sol et murs -->
    <polygon points="200,250 55,185 200,120 345,185" class="sol"/>
    <polygon points="55,185 200,120 200,25 55,90" class="mur"/>
    <polygon points="200,120 345,185 345,90 200,25" class="mur mur--droit"/>
    <!-- plafonnier suspendu -->
    <line x1="200" y1="25" x2="200" y2="70" class="fil"/>
    ${hotspot(200, 80, "plafonnier", "Plafonnier")}
    <path d="M186 80 h28 l-6 16 h-16 z" class="abat-jour"/>
    <circle cx="200" cy="100" r="6" class="ampoule-off"/>
    <!-- tableau sur le mur gauche -->
    ${hotspot(110, 118, "tableau", "Tableau")}
    <rect x="92" y="100" width="36" height="40" rx="3" class="objet"/>
    <line x1="100" y1="112" x2="120" y2="112" class="objet-trait"/>
    <line x1="100" y1="122" x2="120" y2="122" class="objet-trait"/>
    <!-- interrupteur sur le mur droit -->
    ${hotspot(280, 150, "interrupteur", "Interrupteur")}
    <rect x="272" y="138" width="16" height="24" rx="2" class="objet"/>
  </svg>`;
}
function hotspot(x, y, id, label) {
  return `<g class="hotspot" data-point="${id}" role="button" tabindex="0" aria-label="Inspecter : ${label}">
    <circle cx="${x}" cy="${y}" r="16" class="hotspot-halo"/>
    <circle cx="${x}" cy="${y}" r="7" class="hotspot-coeur"/>
    <text x="${x}" y="${y - 22}" text-anchor="middle" class="hotspot-label">${label}</text>
  </g>`;
}

function borneSVG(b, x, y, lx, ly, anchor = "middle") {
  const sel = etat.sondeRouge === b.id ? "sel-rouge" : etat.sondeNoir === b.id ? "sel-noir" : "";
  return `<g class="borne borne--${b.conducteur} ${sel}" data-borne="${b.id}" role="button" tabindex="0" aria-label="Borne ${b.label}">
    <circle cx="${x}" cy="${y}" r="12"/>
    <text x="${x + lx}" y="${y + ly}" text-anchor="${anchor}">${b.label}</text>
  </g>`;
}

function inspectionSVG(pt) {
  const b = (id) => pt.bornes.find((x) => x.id === id);
  if (pt.id === "tableau") {
    const manetteDiff = etat.panneActive === "diff" ? "is-bas" : "";
    const manetteDisj = etat.panneActive === "disj" ? "is-bas" : "";
    return `<svg viewBox="0 0 360 250" role="img" aria-label="Tableau électrique">
      <line x1="40" y1="46" x2="320" y2="46" class="rail"/>
      <!-- module différentiel -->
      <rect x="60" y="40" width="74" height="74" rx="4" class="module"/>
      <text x="97" y="60" text-anchor="middle" class="module-txt">Inter. diff.</text>
      <text x="97" y="72" text-anchor="middle" class="module-txt">30 mA</text>
      <rect x="88" y="${manetteDiff ? 92 : 80}" width="18" height="16" rx="2" class="manette ${manetteDiff}"/>
      <line x1="97" y1="114" x2="97" y2="140" class="liaison"/>
      <!-- module disjoncteur -->
      <rect x="150" y="40" width="60" height="74" rx="4" class="module"/>
      <text x="180" y="60" text-anchor="middle" class="module-txt">Disj. écl.</text>
      <text x="180" y="72" text-anchor="middle" class="module-txt">16 A</text>
      <rect x="171" y="${manetteDisj ? 92 : 80}" width="18" height="16" rx="2" class="manette ${manetteDisj}"/>
      <line x1="180" y1="114" x2="180" y2="140" class="liaison"/>
      <!-- répartiteurs (barre + borne-terminal ; le libellé vient de la borne) -->
      <rect x="246" y="64" width="80" height="16" rx="3" class="barre barre--N"/>
      <rect x="246" y="150" width="80" height="16" rx="3" class="barre barre--PE"/>
      ${borneSVG(b("Ldiff"), 97, 152, 0, 26)}
      ${borneSVG(b("Lecl"), 180, 152, 0, 42)}
      ${borneSVG(b("N"), 286, 72, 0, 26)}
      ${borneSVG(b("PE"), 286, 158, 0, 26)}
    </svg>`;
  }
  if (pt.id === "interrupteur") {
    return `<svg viewBox="0 0 360 220" role="img" aria-label="Interrupteur déposé">
      <rect x="135" y="70" width="90" height="80" rx="8" class="boitier"/>
      <line x1="160" y1="110" x2="200" y2="92" class="bascule"/>
      <circle cx="160" cy="110" r="3" class="vis"/>
      <text x="180" y="62" text-anchor="middle" class="boitier-txt">Interrupteur simple</text>
      <line x1="95" y1="110" x2="135" y2="110" class="liaison"/>
      <line x1="225" y1="110" x2="265" y2="110" class="liaison"/>
      ${borneSVG(b("in"), 80, 110, 0, -20)}
      ${borneSVG(b("out"), 280, 110, 0, -20)}
      ${borneSVG(b("Nb"), 120, 185, 0, 28)}
      ${borneSVG(b("PEb"), 240, 185, 0, 28)}
    </svg>`;
  }
  // plafonnier
  return `<svg viewBox="0 0 360 240" role="img" aria-label="Plafonnier, boîte DCL">
    <circle cx="180" cy="80" r="42" class="dcl"/>
    <text x="180" y="34" text-anchor="middle" class="boitier-txt">Boîte DCL</text>
    <line x1="180" y1="122" x2="180" y2="150" class="fil"/>
    <path d="M163 150 h34 l-7 20 h-20 z" class="abat-jour"/>
    <circle cx="180" cy="178" r="14" class="ampoule-off"/>
    <text x="180" y="218" text-anchor="middle" class="at-aide-svg">ampoule éteinte</text>
    ${borneSVG(b("Lp"), 130, 78, 0, -18)}
    ${borneSVG(b("Np"), 230, 78, 0, -18)}
    ${borneSVG(b("PEp"), 180, 92, 28, 4, "start")}
  </svg>`;
}

/* ============================================================
   ÉVÉNEMENTS (délégation : survit aux rendus)
   ============================================================ */
function brancherEvenements() {
  const c = racine();
  c.addEventListener("click", (e) => {
    const hot = e.target.closest("[data-point]");
    if (hot) return ouvrirPoint(hot.dataset.point);
    const borne = e.target.closest(".borne");
    if (borne) return cliquerBorne(borne.dataset.borne);
    const mode = e.target.closest("[data-mode]");
    if (mode) return choisirMode(mode.dataset.mode);
    const diag = e.target.closest("[data-diag]");
    if (diag) return diagnostiquer(diag.dataset.diag);
    const act = e.target.closest("[data-action]");
    if (!act) return;
    switch (act.dataset.action) {
      case "nouvelle": return nouvellePanne();
      case "toggle-tension": return basculerTension();
      case "scene": return revenirScene();
      case "reset-sondes": return reinitSondes();
    }
  });
  // Accessibilité clavier sur les éléments SVG cliquables.
  c.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const cible = e.target.closest("[data-point], .borne, [data-diag], [data-mode]");
    if (cible) { e.preventDefault(); cible.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", async () => {
  majCompteurElectrons();
  brancherBoutonSons();
  brancherMenu();
  brancherEvenements();
  try {
    const r = await fetch(SCENARIO);
    if (!r.ok) throw new Error();
    scenario = await r.json();
  } catch {
    racine().innerHTML = `<p class="at-message">Impossible de charger le scénario. ⚡</p>`;
    return;
  }
  nouvellePanne();  // tire une première panne et rend l'atelier
});
