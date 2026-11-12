// Atelier dépannage immersif : moteur commun à toutes les interventions.
// Chaque intervention (scenarios/*.js) fournit ses vues, son installation, ses gestes, ses pannes et son dialogue.
// Le moteur gère : la conversation, les déplacements, le multimètre et ses pointes, le tournevis,
// les pièces de la camionnette, les conséquences (électrisation, ohmmètre sous tension), le temps et la facture.
import "../../js/page.js";
import { crediterElectrons } from "../../js/progression.js";
import { brancherBoutonSons } from "../../js/audio.js";
import { DEFS, W, H, pointes } from "./commun.js";
import { sons } from "./sons.js";

const CATALOGUE = [
  { id: "chambre", fichier: "./scenarios/chambre.js", titre: "La lumière de la chambre", lieu: "Maison" },
  { id: "bureaux", fichier: "./scenarios/bureaux.js", titre: "L'éclairage de l'open space", lieu: "Bureaux" },
  { id: "consuel", fichier: "./scenarios/consuel.js", titre: "Le contrôle avant le Consuel", lieu: "Maison neuve" },
  { id: "jardin", fichier: "./scenarios/jardin.js", titre: "La nuit, sous la pluie", lieu: "Jardin" },
  { id: "borne", fichier: "./scenarios/borne.js", titre: "La voiture qui ne charge pas", lieu: "Garage" },
  { id: "toit", fichier: "./scenarios/toit.js", titre: "Sur le toit", lieu: "Photovoltaïque" },
];
const racine = document.querySelector(".im");
const REPOS = { rouge: { x: 1085, y: 735 }, noir: { x: 1015, y: 735 } };
let S = null;   // intervention chargée
let e = null;   // état de la partie

/* ---------- Modèle électrique (graphe de liaisons) ---------- */
function liaisons() { return typeof S.liaisons === "function" ? S.liaisons(e) : S.liaisons; }
function conduit(l) {
  if (l.coupePar && l.coupePar === e.panne.id && !e.repare) return false;
  if (l.si && !e.app[l.si]) return false;
  if (l.sauf && e.app[l.sauf]) return false;
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
// Un récepteur (liaison « charge ») fonctionne s'il a la phase d'un côté et le neutre franc de l'autre.
function alimente(a, b) {
  const l = liaisons().find((x) => x.charge && ((x.a === a && x.b === b) || (x.a === b && x.b === a)));
  if (!l || !conduit(l)) return false;
  const p = potentiels();
  return (p.de(a) === 230 && p.groupe(b) === p.groupe("N")) || (p.de(b) === 230 && p.groupe(a) === p.groupe("N"));
}

/* ---------- Outils pour les interventions ---------- */
function dire(t, type = "info") { e.bulle = { t, type }; }
function temps(m) { e.minutes += m; }
function faute(t) { if (!e.fautes.includes(t)) e.fautes.push(t); }
function electrisation(ou) {
  e.accident = true; sons.zap();
  faute(`Électrisation ${ou} : c'était sous tension. Avant de toucher un conducteur, on coupe et on vérifie l'absence de tension au multimètre, là où on travaille.`);
  dire(`⚡ Décharge ! Tu as pris le courant ${ou}. Sur un vrai chantier, c'est l'accident.`, "danger");
  racine.classList.remove("secousse"); void racine.offsetWidth; racine.classList.add("secousse");
}
const api = () => ({ e, pot: potentiels(), alimente, dire, temps, faute, electrisation, sons, aller });

/* ---------- Partie ---------- */
function nouvelle(id) {
  const liste = S.pannes.map((p) => p.id);
  let pid = id && liste.includes(id) ? id : liste[Math.floor(Math.random() * liste.length)];
  if (!id && e && e.panne.id === pid && liste.length > 1) pid = liste[(liste.indexOf(pid) + 1) % liste.length];
  const panne = S.pannes.find((p) => p.id === pid);
  e = {
    panne, app: {}, vue: S.vueDepart, outil: "main", calibre: "V", lecture: null,
    repare: false, fini: false, minutes: 0, pieces: [], piecesInutiles: 0,
    poses: [], humeur: 3, fautes: [], accident: false, verifies: new Set(), journal: [], bulle: null,
    rouge: { ...REPOS.rouge }, noir: { ...REPOS.noir }, derniere: null, panneau: S.dialogue ? "client" : "intro", debut: true, loose: panne.visible || null,
    curseur: { x: 600, y: 375 },
  };
  for (const r of (S.tableau ? S.tableau.rangees : [])) for (const a of r) if (a.type !== "tl") e.app[a.cle] = true;
  Object.assign(e, S.etat ? S.etat(panne) : {});
  Object.assign(e.app, panne.depart || {});
  majApp();
}
function majApp() { if (S.majApp) S.majApp(e); }
function aller(v) {
  e.vue = v; temps(1); e.bulle = null; e.lecture = null; e.derniere = null;
  e.rouge = { ...REPOS.rouge }; e.noir = { ...REPOS.noir };
}

/* ---------- Conversation ---------- */
const MAX_Q = () => S.dialogue.max || 5;
function questionsVisibles() {
  return S.dialogue.questions.filter((q) => !e.poses.includes(q.id) && (!q.apres || [].concat(q.apres).some((p) => e.poses.includes(p))));
}
function reponse(q) { return q.reponse[e.panne.id] || q.reponse["*"]; }
function poser(id) {
  if (e.poses.length >= MAX_Q()) return;
  const q = S.dialogue.questions.find((x) => x.id === id);
  e.poses.push(id); temps(1);
  if (q.mauvaise) e.humeur = Math.max(0, e.humeur - 1);
}

/* ---------- Gestes, tournevis, pièces ---------- */
function geste(g) {
  const [nom, arg] = g.split(":");
  const fn = S.gestes[nom];
  if (fn) fn(api(), arg);
  majApp();
  if (S.apres) S.apres(api());
  if (e.rouge.vis && e.noir.vis) mesurer(false);
}
function tournevis(idv) {
  const n = S.noeuds[idv];
  if (!n || (S.pasDeVis || []).includes(idv)) { dire("Il n'y a rien à serrer ici.", "info"); return; }
  const pt = potentiels();
  if (pt.de(n) === 230) { electrisation(`en serrant la ${S.noms[idv]}`); return; }
  if (n !== "PE" && pt.de(n) !== undefined) faute(`Tu as serré la ${S.noms[idv]} alors que le circuit était sous tension. Même un neutre peut devenir dangereux (un neutre coupé prend la tension de la phase) : on coupe toujours avant.`);
  else if (!e.verifies.has(n)) faute(`Tu as travaillé sur la ${S.noms[idv]} sans avoir vérifié l'absence de tension.`);
  sons.vis();
  const p = e.panne;
  if (!e.repare && p.cible === idv) {
    temps(p.reparation === "refaire" ? 6 : 2);
    e.repare = true; e.loose = null;
    dire(p.texteReparation || (p.reparation === "refaire" ? "Tu recoupes l'âme abîmée, tu redénudes à la bonne longueur et tu refais la connexion." : "Tu engages bien le fil sous la vis et tu serres au bon couple. La connexion tient."), "ok");
  } else { temps(2); dire("Tu contrôles le serrage : cette vis était déjà bien serrée."); }
  majApp(); if (S.apres) S.apres(api());
}
function piece(id) {
  const p = S.pieces.find((x) => x.id === id);
  const ok = S.poser(api(), id);
  if (!ok) return;
  temps(p.minutes); e.pieces.push(p); sons.vis();
  const utile = ok !== "inutile" && [].concat(e.panne.piece || []).includes(id);
  if (utile && !e.repare) { e.repare = true; e.loose = null; } else e.piecesInutiles++;
  dire(`${p.nom} posé (${p.prix} €).`, "ok");
  e.panneau = null;
  majApp(); if (S.apres) S.apres(api());
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
function mesurer(compter = true) {
  const a = e.rouge.vis, b = e.noir.vis;
  if (!a || !b || a === b || e.calibre === "OFF") { e.lecture = null; return; }
  const pt = potentiels(), na = S.noeuds[a], nb = S.noeuds[b];
  const perso = S.mesure ? S.mesure(api(), a, b, e.calibre) : undefined;
  if (perso !== undefined) {
    if (perso === null) { e.lecture = null; return; }
    e.lecture = perso;
  } else if (e.calibre === "Ω") {
    if (pt.de(na) === 230 || pt.de(nb) === 230) {
      e.lecture = "Hi V"; sons.alarme();
      faute("Ohmmètre posé sur des bornes sous tension : une continuité se mesure circuit coupé, jamais sous tension.");
      dire("L'appareil hurle : tension détectée sur le calibre Ω ! Un multimètre bas de gamme n'y survivrait pas.", "danger");
      return;
    }
    const fil = liaisons().filter((l) => conduit(l) && !l.charge);
    const vus = new Set([na]), file = [na];
    while (file.length) { const x = file.shift(); for (const l of fil) { const y = l.a === x ? l.b : l.b === x ? l.a : null; if (y && !vus.has(y)) { vus.add(y); file.push(y); } } }
    e.lecture = vus.has(nb) ? "0,2 Ω" : "OL";
  } else {
    const va = pt.de(na), vb = pt.de(nb);
    const u = va === undefined || vb === undefined ? 0 : Math.abs(va - vb);
    e.lecture = u ? "230 V" : "0 V";
    if (!u && S.circuitCoupe && S.circuitCoupe(e)) { e.verifies.add(na); e.verifies.add(nb); }
  }
  sons.bip();
  const cle = `${a}|${b}|${e.calibre}|${e.lecture}`;
  if (compter && e.derniere !== cle) {
    e.derniere = cle; temps(0.5);
    e.journal.unshift(`${S.noms[a]} ↔ ${S.noms[b]} : <b>${e.lecture}</b>${S.contexte ? ` <small>(${S.contexte(e)})</small>` : ""}`);
    e.journal = e.journal.slice(0, 16);
  }
}

/* ---------- Fin ---------- */
function verifierFin() {
  if (e.fini || !e.repare || !S.termine(api())) return;
  e.fini = true; sons.succes();
  if (S.etoiles) { e.etoiles = S.etoiles(api()); crediterElectrons(e.etoiles * 15); e.panneau = "fin"; return; }
  let etoiles = 3;
  if (e.fautes.length) etoiles--;
  if (e.piecesInutiles) etoiles--;
  if (e.minutes > (S.tempsCible || 45)) etoiles--;
  if (e.humeur < 2) etoiles--;
  if (e.accident) etoiles = Math.min(etoiles, 1);
  e.etoiles = Math.max(1, etoiles);
  crediterElectrons(e.etoiles * 15);
  e.panneau = "fin";
}
function facture() {
  const quarts = Math.max(1, Math.ceil(e.minutes / 15));
  const pieces = e.pieces.reduce((s, p) => s + p.prix, 0);
  return { deplacement: S.deplacement || 45, quarts, mo: quarts * 15, pieces, total: (S.deplacement || 45) + quarts * 15 + pieces };
}

/* ---------- Rendu ---------- */
const lcd = () => (e.calibre === "OFF" ? "" : e.lecture || (e.calibre === "V" ? "- - -  V" : "- - -  Ω"));
function majPointes() {
  const g = racine.querySelector(".im-pointes"); if (g) g.innerHTML = pointes(e);
}
function vueSVG() {
  const fn = S.vues[e.vue];
  const contenu = fn(e, api());
  const nuit = S.frontale && S.frontale(e);
  const frontale = nuit ? `<defs><radialGradient id="g-frontale"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".93"/></radialGradient></defs>
    <g class="im-nuit" pointer-events="none"><rect width="${W}" height="${H}" fill="#02040a" opacity=".93" mask="url(#m-frontale)"/>
    <mask id="m-frontale"><rect width="${W}" height="${H}" fill="#fff"/><circle class="im-faisceau" cx="${e.curseur.x}" cy="${e.curseur.y}" r="${nuit.rayon || 170}" fill="#000"/></mask>
    <circle class="im-halo" cx="${e.curseur.x}" cy="${e.curseur.y}" r="${nuit.rayon || 170}" fill="url(#g-frontale)"/></g>${nuit.lumieres || ""}` : "";
  return `<svg class="im-scene" viewBox="0 0 ${W} ${H}" role="img" aria-label="${S.titre}">${DEFS}<g class="im-vue">${contenu}</g>${frontale}<g class="im-pointes">${S.sansMultimetre ? "" : pointes(e)}</g></svg>`;
}
const VISAGES = ["😠", "😕", "🙂", "😊"];
function panneauClient() {
  const c = S.client;
  const restantes = MAX_Q() - e.poses.length;
  const fil = e.poses.map((id) => {
    const q = S.dialogue.questions.find((x) => x.id === id);
    return `<p class="im-moi">${q.texte}</p><p class="im-r">${reponse(q)}</p>`;
  }).join("");
  const choix = restantes > 0 ? questionsVisibles().map((q) => `<button type="button" class="im-question" data-question="${q.id}">${q.texte}</button>`).join("")
    : `<p class="im-r">${S.dialogue.fin}</p>`;
  return `<div class="im-panneau im-client">
    <div class="im-client-tete"><span class="im-avatar" style="background:${c.teinte}" aria-hidden="true">${c.initiales}</span>
      <div><b>${c.nom}</b><small>${c.role}</small></div><span class="im-humeur" title="Humeur du client">${VISAGES[e.humeur]}</span></div>
    <div class="im-fil"><p class="im-r">${S.accueil}</p>${fil}</div>
    ${restantes > 0 ? `<p class="im-petit">Encore ${restantes} question${restantes > 1 ? "s" : ""} avant que ${c.court} ne te laisse travailler. Choisis bien.</p>` : ""}
    <div class="im-choix">${choix}</div>
    <button type="button" class="im-plein" data-action="fermer">${e.debut ? "Au travail" : "Retour au travail"}</button>
  </div>`;
}
function panneauCamion() {
  return `<div class="im-panneau"><h2>Dans la camionnette</h2>
    ${S.pieces.map((p) => `<button type="button" class="im-question" data-piece="${p.id}"><b>${p.nom}</b> · ${p.prix} € · ${p.minutes} min de pose</button>`).join("")}
    <p class="im-petit">Une pièce changée pour rien reste sur la facture du client.</p>
    <button type="button" class="im-lien" data-action="fermer">Refermer la camionnette</button></div>`;
}
function panneauFin() {
  if (S.finHtml) return `<div class="im-panneau im-fin"><p class="im-etoiles">${"★".repeat(e.etoiles)}${"☆".repeat(3 - e.etoiles)}</p>${S.finHtml(api())}
    <p class="im-petit">+${e.etoiles * 15} e⁻</p>
    <button type="button" class="im-plein" data-action="suivante">Rejouer (autres défauts)</button>
    <button type="button" class="im-lien" data-action="menu">Choisir une autre intervention</button></div>`;
  const f = facture();
  return `<div class="im-panneau im-fin">
    <p class="im-etoiles">${"★".repeat(e.etoiles)}${"☆".repeat(3 - e.etoiles)}</p>
    <h2>${S.merci}</h2>
    <p class="im-centre">${VISAGES[e.humeur]} ${S.client.humeurs[e.humeur]}</p>
    <table class="im-facture"><tbody>
      <tr><td>Déplacement</td><td>${f.deplacement} €</td></tr>
      <tr><td>Main d'œuvre (${f.quarts} × ¼ h, ${Math.round(e.minutes)} min)</td><td>${f.mo} €</td></tr>
      ${e.pieces.map((p) => `<tr><td>${p.nom}</td><td>${p.prix} €</td></tr>`).join("")}
      <tr class="total"><td>Total HT</td><td>${f.total} €</td></tr></tbody></table>
    <h3>${e.panne.titre}</h3>
    <p>${e.panne.explication}</p>
    ${e.piecesInutiles ? `<p class="im-alerte">${e.piecesInutiles} pièce${e.piecesInutiles > 1 ? "s" : ""} changée${e.piecesInutiles > 1 ? "s" : ""} pour rien : le client l'a payée.</p>` : ""}
    ${e.humeur < 3 ? `<p class="im-alerte">Une question maladroite a agacé ton client : on questionne pour comprendre, jamais pour accuser.</p>` : ""}
    ${e.fautes.length ? `<ul class="im-fautes">${e.fautes.map((x) => `<li>${x}</li>`).join("")}</ul>` : `<p class="im-ok">Aucune faute de sécurité.</p>`}
    <p class="im-petit">+${e.etoiles * 15} e⁻</p>
    <button type="button" class="im-plein" data-action="suivante">Autre panne ici</button>
    <button type="button" class="im-lien" data-action="menu">Choisir une autre intervention</button>
  </div>`;
}
function menu() {
  racine.innerHTML = `<div class="im-menu">
    <p class="im-kicker">ATELIER DÉPANNAGE</p>
    <h1>Choisis ton intervention</h1>
    <p>Tu arrives sur place, tu écoutes le client, tu cherches, tu mesures, tu répares… et tu factures. Chaque intervention cache plusieurs pannes possibles, tirées au hasard.</p>
    <div class="im-cartes">${CATALOGUE.map((c) => `<button type="button" class="im-carte" data-intervention="${c.id}"><span>${c.lieu}</span><b>${c.titre}</b></button>`).join("")}</div>
    <p class="im-petit"><a href="atelier-schemas.html">Et pour câbler toi-même les montages d'éclairage : l'atelier schémas →</a></p>
  </div>`;
}
function rendre() {
  if (!S) { menu(); return; }
  verifierFin();
  const f = facture();
  const perso = S.panneaux && S.panneaux[e.panneau];
  const panneau = e.panneau === "client" ? panneauClient() : e.panneau === "camion" ? panneauCamion() : e.panneau === "fin" ? panneauFin()
    : e.panneau === "intro" ? `<div class="im-panneau">${S.intro}<button type="button" class="im-plein" data-action="fermer">Commencer</button></div>`
    : perso ? `<div class="im-panneau">${perso.rendu(api())}<button type="button" class="im-lien" data-action="fermer">Fermer</button></div>` : "";
  const calibres = S.calibres || [["OFF", "Arrêt"], ["V", "V~"], ["Ω", "Ω"]];
  racine.innerHTML = `
    <div class="im-hud">
      <div class="im-titre"><b>${S.titre}</b><span>${S.lieu}</span></div>
      <div class="im-compteurs">${S.compteurs ? S.compteurs(api()) : `<span title="Temps passé">⏱ ${Math.round(e.minutes)} min</span><span title="Facture en cours">🧾 ${f.total} €</span>`}</div>
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
        ${S.sansTournevis ? "" : `<button type="button" class="${e.outil === "tournevis" ? "actif" : ""}" data-outil="tournevis">🪛 Tournevis</button>`}
        ${(S.outils || []).map((o) => `<button type="button" class="${e.outil === o.id ? "actif" : ""}" data-outil="${o.id}">${o.label}</button>`).join("")}
        ${S.dialogue ? `<button type="button" data-panneau="client">💬 ${S.client.court}</button>` : ""}
        ${S.pieces && S.pieces.length ? `<button type="button" data-panneau="camion">🚐 Camionnette</button>` : ""}
        ${Object.entries(S.panneaux || {}).filter(([, p]) => p.label).map(([id, p]) => `<button type="button" data-panneau="${id}">${p.label}</button>`).join("")}
      </div>
      ${S.sansMultimetre ? "" : `<div class="im-multimetre" aria-label="Multimètre">
        <div class="im-calibres">${calibres.map(([c, l]) => `<button type="button" class="${e.calibre === c ? "actif" : ""}" data-calibre="${c}">${l}</button>`).join("")}</div>
        <output class="im-lcd">${lcd()}</output>
      </div>`}
    </div>
    ${S.sousBarre ? S.sousBarre(api()) : ""}
    <details class="im-carnet" ${e.journal.length ? "open" : ""}><summary>Carnet de mesures (${e.journal.length})</summary>
      ${e.journal.length ? `<ol>${e.journal.map((j) => `<li>${j}</li>`).join("")}</ol>` : `<p>Glisse les pointes rouge et noire (en bas à droite de l'image) sur deux vis ou bornes : la mesure s'inscrit ici.</p>`}
    </details>
    <p class="im-astuce">${S.astuce || "Pointes : on les attrape et on les pose sur une vis. Tournevis : on touche la vis à serrer. Main : tout le reste."} <button type="button" class="im-lien" data-action="menu">Changer d'intervention</button></p>`;
}

/* ---------- Événements ---------- */
let tenue = null;
function point(ev) {
  const s = racine.querySelector(".im-scene").getBoundingClientRect();
  return { x: ((ev.clientX - s.left) * W) / s.width, y: ((ev.clientY - s.top) * H) / s.height };
}
racine.addEventListener("pointerdown", (ev) => {
  const g = ev.target.closest(".pointe");
  if (!g || !e || e.panneau) return;
  tenue = g.dataset.pointe; ev.preventDefault();
  racine.setPointerCapture(ev.pointerId);
});
racine.addEventListener("pointermove", (ev) => {
  if (!tenue && S && e && S.frontale && S.frontale(e) && ev.target.closest(".im-scene")) {
    const p = point(ev); e.curseur = p;
    racine.querySelectorAll(".im-faisceau, .im-halo").forEach((c) => { c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); });
  }
  if (!tenue) return;
  const p = point(ev);
  e[tenue] = { x: Math.max(10, Math.min(W - 10, p.x)), y: Math.max(110, Math.min(H + 20, p.y)) };
  majPointes();
});
racine.addEventListener("pointerup", () => {
  if (!tenue) return;
  const v = visSous(e[tenue]);
  e[tenue] = v ? { x: v.x, y: v.y, vis: v.id } : { ...e[tenue], vis: null };
  tenue = null; e.lecture = null;
  if (e.rouge.vis && e.noir.vis) { mesurer(); if (e.lecture) dire(`${S.noms[e.rouge.vis]} ↔ ${S.noms[e.noir.vis]} : ${e.lecture}`, "mesure"); }
  rendre();
});
racine.addEventListener("click", async (ev) => {
  if (tenue) return;
  const t = ev.target.closest("[data-aller],[data-geste],[data-vis],[data-cible],[data-s],[data-outil],[data-panneau],[data-calibre],[data-question],[data-piece],[data-action],[data-intervention]");
  if (!t) return;
  const d = t.dataset;
  if (d.intervention) { await charger(d.intervention); return; }
  if (d.action === "menu") { S = null; history.replaceState(null, "", location.pathname); rendre(); return; }
  if (e.panneau && !t.closest(".im-voile") && !t.closest(".im-barre")) return;
  if (d.aller) {
    const refus = S.peutQuitter ? S.peutQuitter(e, d.aller) : null;
    if (refus) dire(refus, "info"); else aller(d.aller);
  } else if (d.geste) {
    if (e.outil === "tournevis" && !(S.gestesTournevis || []).includes(d.geste.split(":")[0])) e.outil = "main";
    geste(d.geste);
  } else if (d.s) {
    const [act, arg] = d.s.split(":"); S.action(api(), act, arg); majApp(); if (S.apres) S.apres(api());
  } else if (d.cible || (d.vis && !["main", "tournevis"].includes(e.outil) && S.utiliser)) {
    S.utiliser(api(), e.outil, d.cible || d.vis); majApp(); if (S.apres) S.apres(api());
  } else if (d.vis) {
    if (e.outil === "tournevis") tournevis(d.vis);
    else dire("Pour mesurer, attrape une pointe du multimètre et pose-la sur la vis. Pour serrer, prends le tournevis.", "info");
  } else if (d.outil) e.outil = d.outil;
  else if (d.panneau) e.panneau = e.panneau === d.panneau ? null : d.panneau;
  else if (d.calibre) { e.calibre = d.calibre; mesurer(); }
  else if (d.question) poser(d.question);
  else if (d.piece) piece(d.piece);
  else if (d.action === "fermer") { if (e.debut) { e.debut = false; if (S.entree) S.entree(api()); } e.panneau = null; if (S.apres) S.apres(api()); }
  else if (d.action === "suivante") { nouvelle(); }
  rendre();
});
racine.addEventListener("keydown", (ev) => {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches("[role=button]")) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
});

async function charger(id) {
  const c = CATALOGUE.find((x) => x.id === id) || CATALOGUE[0];
  S = (await import(c.fichier)).default;
  const params = new URLSearchParams(location.search);
  nouvelle(params.get("panne"));
  params.set("i", c.id); params.delete("panne");
  history.replaceState(null, "", `${location.pathname}?${params}`);
  rendre();
}
brancherBoutonSons();
const depart = new URLSearchParams(location.search).get("i");
if (depart) charger(depart); else rendre();
