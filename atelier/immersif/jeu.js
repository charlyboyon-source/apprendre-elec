// Atelier dépannage : menu et nouveau moteur de jeu.
// Règle d'or : un seul geste à apprendre. On touche la chose sur laquelle on veut agir, et le jeu montre ce qui se passe.
// - l'outil est choisi tout seul (une vis → le tournevis, le reste → la main) ;
// - les gestes s'animent (la vis tourne et sort, la plaque glisse, la manette bouge) ;
// - les pointes du multimètre se glissent, ou se touchent puis se posent ; elles sont attirées par la borne la plus proche ;
// - une ligne d'objectif, les étapes du dépanneur qui se cochent, un bouton « Je suis perdu » à trois niveaux ;
// - deux façons de jouer : « Guidé » ou « Comme sur le terrain ».
// Les interventions pas encore adaptées (sans « v2: true ») tournent encore sur l'ancien moteur (ancien.js).
import "../../js/page.js";
import { crediterElectrons } from "../../js/progression.js";
import { brancherBoutonSons } from "../../js/audio.js";
import { DEFS, W, H, pointes, dessinTournevis } from "./commun.js";
import { sons } from "./sons.js";

const CATALOGUE = [
  { id: "chambre", fichier: "./scenarios/chambre.js", titre: "La lumière de la chambre", lieu: "Maison", v2: true },
  { id: "bureaux", fichier: "./scenarios/bureaux.js", titre: "L'éclairage de l'open space", lieu: "Bureaux" },
  { id: "consuel", fichier: "./scenarios/consuel.js", titre: "Le contrôle avant le Consuel", lieu: "Maison neuve" },
  { id: "jardin", fichier: "./scenarios/jardin.js", titre: "La nuit, sous la pluie", lieu: "Jardin" },
  { id: "borne", fichier: "./scenarios/borne.js", titre: "La voiture qui ne charge pas", lieu: "Garage" },
  { id: "toit", fichier: "./scenarios/toit.js", titre: "Sur le toit", lieu: "Photovoltaïque" },
];
const ETAPES = [["questionner", "Écouter", "Écouter le client"], ["observer", "Observer", "Constater la panne"], ["couper", "Couper", "Couper le circuit"], ["vat", "VAT", "Vérifier l'absence de tension"], ["mesurer", "Mesurer", "Mesurer"], ["reparer", "Réparer", "Réparer"], ["essayer", "Essayer", "Essayer"]];
const TUTO = [
  ["👆", "Touche pour agir", "Une vis, une plaque, une manette, une ampoule : touche-la, le jeu fait le geste. Le bon outil est pris tout seul."],
  ["🔍", "Touche pour t'approcher", "Dans une pièce, touche un objet (l'interrupteur, le plafonnier, le tableau) pour t'en approcher. On agit dessus de près."],
  ["📟", "Le multimètre", "Glisse une pointe sur une borne, ou touche la pointe puis touche la borne. La valeur s'affiche en haut à droite de l'image."],
  ["🗄", "Le tableau", "Il est dans l'entrée. C'est là qu'on coupe le courant avant de toucher un conducteur… et qu'on vérifie l'absence de tension, sur place."],
];
const LS_TUTO = "atelier-tuto-vu";
const racine = document.querySelector(".im");
const REDUIT = matchMedia("(prefers-reduced-motion: reduce)").matches;
let S = null;        // intervention chargée
let e = null;        // état de la partie
let ancien = false;  // l'ancien moteur a la main
let occupe = false;  // une animation est en cours : on ignore les touches

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
function alimente(a, b) {
  const l = liaisons().find((x) => x.charge && ((x.a === a && x.b === b) || (x.a === b && x.b === a)));
  if (!l || !conduit(l)) return false;
  const p = potentiels();
  return (p.de(a) === 230 && p.groupe(b) === p.groupe("N")) || (p.de(b) === 230 && p.groupe(a) === p.groupe("N"));
}

/* ---------- Outils pour les interventions ---------- */
function dire(t, type = "info") { e.bulle = { t, type }; }
const SOUS_TENSION = "Sous tension : tu ne touches que les parties isolées, seules les pointes touchent les bornes.";
function rappelTension() { if (e.rappelTension || (S.circuitCoupe && S.circuitCoupe(e))) return; e.rappelTension = true; dire(SOUS_TENSION, "alerte"); }
function temps(m) { e.minutes += m; }
function faute(t) { if (!e.fautes.includes(t)) e.fautes.push(t); }
function electrisation(ou) {
  e.accident = true; sons.zap(); vibrer([60, 40, 120]);
  faute(`Électrisation ${ou} : c'était sous tension. Avant de toucher un conducteur, on coupe et on vérifie l'absence de tension au multimètre, là où on travaille.`);
  dire(`⚡ Décharge ! Tu as pris le courant ${ou}. Sur un vrai chantier, c'est l'accident.`, "danger");
  racine.classList.remove("secousse"); void racine.offsetWidth; racine.classList.add("secousse");
}
function vibrer(m) { try { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(m); } catch { /* rien */ } }
// Animations : jouées sur l'image actuelle, puis la scène est redessinée dans son nouvel état.
let animations = [];
function anim(nom, images, ms = 420) {
  const el = nom && racine.querySelector(`.im-scene [data-anim="${nom}"]`);
  if (!el || REDUIT) return;
  animations.push(el.animate(images, { duration: ms, easing: "cubic-bezier(.3,.7,.3,1)", fill: "forwards" }).finished.catch(() => {}));
}
// Le tournevis vient sur la vis ; elle tourne (et sort si on dévisse).
function tourner(nom, sens, x, y) {
  sons.vis(); vibrer(25);
  const scene = racine.querySelector(".im-scene .im-vue");
  if (!scene || REDUIT) return;
  scene.insertAdjacentHTML("beforeend", dessinTournevis(x, y));
  const outil = scene.lastElementChild;
  const tours = sens === "devisser" ? -720 : 540;
  animations.push(outil.animate([{ opacity: 0, transform: `translate(${x + 40}px, ${y - 60}px) rotate(-28deg)` }, { opacity: 1, transform: `translate(${x}px, ${y}px) rotate(-28deg)`, offset: 0.25 }, { opacity: 1, transform: `translate(${x}px, ${y}px) rotate(-28deg)`, offset: 0.85 }, { opacity: 0, transform: `translate(${x}px, ${y}px) rotate(-28deg)` }], { duration: 620, fill: "forwards" }).finished.catch(() => {}));
  const v = nom && racine.querySelector(`.im-scene [data-anim="${nom}"]`);
  if (v) {
    const fin = sens === "devisser" ? [{ transform: "rotate(0deg) scale(1)", opacity: 1 }, { transform: `rotate(${tours}deg) scale(1)`, opacity: 1, offset: 0.75 }, { transform: `rotate(${tours}deg) scale(1.35)`, opacity: 0 }]
      : [{ transform: "rotate(0deg)" }, { transform: `rotate(${tours}deg)` }];
    animations.push(v.animate(fin, { duration: 560, delay: 120, easing: "ease-in-out", fill: "forwards" }).finished.catch(() => {}));
  }
}
const finAnimations = () => Promise.race([Promise.all(animations), new Promise((r) => setTimeout(r, 900))]);
const api = () => ({ e, pot: potentiels(), alimente, dire, temps, faute, electrisation, sons, aller, anim, tourner, rappelTension });

/* ---------- Partie ---------- */
function nouvelle(id) {
  const liste = S.pannes.map((p) => p.id);
  let pid = id && liste.includes(id) ? id : liste[Math.floor(Math.random() * liste.length)];
  if (!id && e && e.panne.id === pid && liste.length > 1) pid = liste[(liste.indexOf(pid) + 1) % liste.length];
  const panne = S.pannes.find((p) => p.id === pid);
  const mode = e ? e.mode : "guide";
  e = {
    panne, mode, app: {}, vue: S.vueDepart, vueArg: null, calibre: "V", lecture: null,
    repare: false, fini: false, minutes: 0, pieces: [], piecesInutiles: 0,
    poses: [], humeur: 3, fautes: [], accident: false, verifies: new Set(), journal: [], mesures: [], bulle: null,
    rouge: { repos: true }, noir: { repos: true }, derniere: null, panneau: "client", debut: true, loose: panne.visible || null,
    obs: false, coupe: false, aide: { cle: null, niveau: 0 }, indicesPris: 0, tuto: 0,
  };
  for (const r of (S.tableau ? S.tableau.rangees : [])) for (const a of r) if (a.type !== "tl") e.app[a.cle] = true;
  Object.assign(e, S.etat ? S.etat(panne) : {});
  Object.assign(e.app, panne.depart || {});
  majApp();
  if (!lu(LS_TUTO)) e.panneau = "tuto";
}
function lu(k) { try { return localStorage.getItem(k); } catch { return null; } }
function ecrire(k, v) { try { localStorage.setItem(k, v); } catch { /* rien */ } }
function majApp() { if (S.majApp) S.majApp(e); }
function aller(v) {
  const [vue, arg] = v.split(":");
  e.vue = vue; e.vueArg = arg || null; temps(1); e.bulle = null; e.lecture = null; e.derniere = null;
  e.rouge = { repos: true }; e.noir = { repos: true }; e.pointeChoisie = null;
}
const vueComplete = () => (e.vueArg ? `${e.vue}:${e.vueArg}` : e.vue);

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
function apres() { majApp(); if (S.apres) S.apres(api()); if (e.rouge.vis && e.noir.vis) mesurer(false); }
function geste(g) {
  const [nom, arg] = g.split(":");
  const fn = S.gestes[nom];
  if (fn) fn(api(), arg);
  apres();
}
function tournevis(idv, x, y) {
  const n = S.noeuds[idv];
  if (!n || (S.pasDeVis || []).includes(idv)) { dire("Ici, on mesure avec les pointes du multimètre : il n'y a rien à serrer.", "info"); return; }
  const pt = potentiels();
  if (pt.de(n) === 230) { tourner(`vis-${idv}`, "serrer", x, y); electrisation(`en serrant la ${S.noms[idv]}`); return; }
  if (n !== "PE" && pt.de(n) !== undefined) faute(`Tu as serré la ${S.noms[idv]} alors que le circuit était sous tension. Même un neutre peut devenir dangereux (un neutre coupé prend la tension de la phase) : on coupe toujours avant.`);
  else if (!e.verifies.has(n)) faute(`Tu as travaillé sur la ${S.noms[idv]} sans avoir vérifié l'absence de tension.`);
  tourner(`vis-${idv}`, "serrer", x, y);
  const p = e.panne;
  if (!e.repare && p.cible === idv) {
    temps(p.reparation === "refaire" ? 6 : 2);
    e.repare = true; e.loose = null;
    dire(p.texteReparation || (p.reparation === "refaire" ? "Tu recoupes l'âme abîmée, tu redénudes à la bonne longueur et tu refais la connexion." : "Tu engages bien le fil sous la vis et tu serres au bon couple. La connexion tient."), "ok");
  } else { temps(2); dire("Tu contrôles le serrage : cette vis était déjà bien serrée."); }
  apres();
}
function piece(id) {
  const p = S.pieces.find((x) => x.id === id);
  e.panneau = null;
  const ok = S.poser(api(), id);
  if (!ok) return;
  temps(p.minutes); e.pieces.push(p); sons.vis();
  const utile = ok !== "inutile" && [].concat(e.panne.piece || []).includes(id);
  if (utile && !e.repare) { e.repare = true; e.loose = null; } else e.piecesInutiles++;
  dire(`${p.nom} posé${p.feminin ? "e" : ""} (${p.prix} €).`, "ok");
  apres();
}

/* ---------- Mesures ---------- */
function bornes() {
  return [...racine.querySelectorAll(".im-scene [data-vis]")].map((g) => ({ id: g.dataset.vis, x: +g.dataset.cx, y: +g.dataset.cy }));
}
function plusProche(p, rayon = 120) {
  let best = null, dmin = rayon;
  for (const b of bornes()) { const d = Math.hypot(b.x - p.x, b.y - p.y); if (d < dmin) { dmin = d; best = b; } }
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
    e.mesures.push({ a, b, cal: e.calibre, lecture: e.lecture, coupe: !!(S.circuitCoupe && S.circuitCoupe(e)), inter: !!e.app.inter });
    e.journal.unshift(`${S.noms[a]} ↔ ${S.noms[b]} : <b>${e.lecture}</b>${S.contexte ? ` <small>(${S.contexte(e)})</small>` : ""}`);
    e.journal = e.journal.slice(0, 20);
  }
}
const NOM_P = { rouge: "rouge", noir: "noire" };
function poserPointe(id, b) {
  e[id] = { x: b.x, y: b.y, vis: b.id };
  e.lecture = null; e.pointeChoisie = null;
  const autre = id === "rouge" ? "noir" : "rouge";
  if (e[autre].vis) { e.bulle = null; mesurer(); }
  else dire(`Pointe ${NOM_P[id]} posée sur : ${S.noms[b.id]}. Pose maintenant la pointe ${NOM_P[autre]}.`, "mesure");
}

/* ---------- Étapes, aide, fin ---------- */
function etapesFaites() {
  return {
    questionner: e.poses.length > 0, observer: e.obs, couper: e.coupe, vat: e.verifies.size > 0,
    mesurer: e.journal.length > 0, reparer: e.repare, essayer: e.fini,
  };
}
function aideActuelle() { return S.indices ? S.indices(api()) : null; }
function cheminVers(cible) {
  // première zone à toucher, depuis la vue actuelle, pour aller vers la vue « cible »
  const depart = vueComplete();
  if (!cible || cible === depart || !S.voisins) return null;
  const vus = new Set([depart]), file = [[depart, null]];
  while (file.length) {
    const [v, premier] = file.shift();
    for (const [w, sel] of S.voisins(v)) {
      if (vus.has(w)) continue;
      const p = premier || sel;
      if (w === cible) return p;
      vus.add(w); file.push([w, p]);
    }
  }
  return null;
}
function verifierFin() {
  if (e.fini || !e.repare || !S.termine(api())) return;
  e.fini = true; sons.succes();
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
const VISAGES = ["😠", "😕", "🙂", "😊"];
function panneauClient() {
  const c = S.client, restantes = MAX_Q() - e.poses.length;
  const fil = e.poses.map((id) => { const q = S.dialogue.questions.find((x) => x.id === id); return `<p class="im-moi">${q.texte}</p><p class="im-r">${reponse(q)}</p>`; }).join("");
  const choix = restantes > 0 ? questionsVisibles().map((q) => `<button type="button" class="im-question" data-question="${q.id}">${q.texte}</button>`).join("") : `<p class="im-r">${S.dialogue.fin}</p>`;
  return `<div class="im-panneau im-client">
    <div class="im-client-tete"><span class="im-avatar" style="background:${c.teinte}" aria-hidden="true">${c.initiales}</span>
      <div><b>${c.nom}</b><small>${c.role}</small></div><span class="im-humeur" title="Humeur du client">${VISAGES[e.humeur]}</span></div>
    <div class="im-fil"><p class="im-r">${S.accueil}</p>${fil}</div>
    ${restantes > 0 ? `<p class="im-petit">Encore ${restantes} question${restantes > 1 ? "s" : ""} avant que ${c.court} ne te laisse travailler. Choisis bien.</p>` : ""}
    <div class="im-choix">${choix}</div>
    <button type="button" class="im-plein" data-action="fermer">${e.debut ? "Au travail" : "Retour au travail"}</button></div>`;
}
function panneauCamion() {
  return `<div class="im-panneau"><h2>Dans la camionnette</h2>
    ${S.pieces.map((p) => `<button type="button" class="im-question" data-piece="${p.id}"><b>${p.nom}</b> · ${p.prix} € · ${p.minutes} min de pose</button>`).join("")}
    <p class="im-petit">Une pièce changée pour rien reste sur la facture du client.</p>
    <button type="button" class="im-plein" data-action="fermer">Refermer la camionnette</button></div>`;
}
function panneauCarnet() {
  return `<div class="im-panneau"><h2>Carnet de mesures</h2>
    ${e.journal.length ? `<ol class="t-journal">${e.journal.map((j) => `<li>${j}</li>`).join("")}</ol>` : `<p>Aucune mesure pour l'instant. Pose les deux pointes du multimètre sur deux bornes : la mesure s'inscrit ici.</p>`}
    <button type="button" class="im-plein" data-action="fermer">Fermer le carnet</button></div>`;
}
function panneauAide() {
  const h = aideActuelle();
  if (!h) return `<div class="im-panneau"><p>Pas d'indice ici.</p><button type="button" class="im-plein" data-action="fermer">Fermer</button></div>`;
  const n = e.aide.niveau;
  const lignes = [["📍 Où aller", h.ou], ["🎯 Quoi faire", h.quoi], ["✋ Comment faire", h.comment]];
  return `<div class="im-panneau t-aide"><h2>Je suis perdu</h2>
    ${lignes.slice(0, n).map(([t, x]) => `<p><b>${t}</b><br>${x}</p>`).join("")}
    ${n < 3 ? `<button type="button" class="im-question" data-action="indice">${n === 0 ? "Un indice : où aller ?" : n === 1 ? "Encore un indice : quoi faire ?" : "Dernier indice : comment faire ?"} <small>(+2 min au compteur)</small></button>` : ""}
    <button type="button" class="im-plein" data-action="fermer">Retour au travail</button></div>`;
}
function panneauTuto() {
  const [ic, titre, txt] = TUTO[e.tuto];
  return `<div class="im-panneau t-tuto"><p class="t-tuto-ic" aria-hidden="true">${ic}</p><h2>${titre}</h2><p>${txt}</p>
    <p class="im-petit">${e.tuto + 1} / ${TUTO.length}</p>
    <button type="button" class="im-plein" data-action="tuto">${e.tuto < TUTO.length - 1 ? "Suivant" : "J'ai compris"}</button></div>`;
}
function panneauFin() {
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
    <h3>${e.panne.titre}</h3><p>${e.panne.explication}</p>
    ${e.piecesInutiles ? `<p class="im-alerte">${e.piecesInutiles} pièce${e.piecesInutiles > 1 ? "s" : ""} changée${e.piecesInutiles > 1 ? "s" : ""} pour rien : le client l'a payée.</p>` : ""}
    ${e.humeur < 3 ? `<p class="im-alerte">Une question maladroite a agacé ton client : on questionne pour comprendre, jamais pour accuser.</p>` : ""}
    ${e.indicesPris ? `<p class="im-petit">${e.indicesPris} indice${e.indicesPris > 1 ? "s" : ""} demandé${e.indicesPris > 1 ? "s" : ""}.</p>` : ""}
    ${e.fautes.length ? `<ul class="im-fautes">${e.fautes.map((x) => `<li>${x}</li>`).join("")}</ul>` : `<p class="im-ok">Aucune faute de sécurité.</p>`}
    <p class="im-petit">+${e.etoiles * 15} e⁻</p>
    <button type="button" class="im-plein" data-action="suivante">Autre panne ici</button>
    <button type="button" class="im-lien" data-action="menu">Choisir une autre intervention</button></div>`;
}
function menu() {
  racine.classList.remove("im2"); document.body.classList.remove("atelier-plein");
  racine.innerHTML = `<div class="im-menu">
    <p class="im-kicker">ATELIER DÉPANNAGE</p>
    <h2>Choisis ton intervention</h2>
    <p>Tu arrives sur place, tu écoutes le client, tu cherches, tu mesures, tu répares… et tu factures. Chaque intervention cache plusieurs pannes possibles, tirées au hasard.</p>
    <div class="im-cartes">${CATALOGUE.map((c) => `<button type="button" class="im-carte" data-intervention="${c.id}"><span>${c.lieu}${c.v2 ? " · nouvelle version" : ""}</span><b>${c.titre}</b></button>`).join("")}</div>
    <p class="im-petit"><a href="atelier-schemas.html">Et pour câbler toi-même les montages d'éclairage : l'atelier schémas →</a></p></div>`;
}
function choixMode(id) {
  const c = CATALOGUE.find((x) => x.id === id);
  racine.classList.remove("im2");
  racine.innerHTML = `<div class="im-menu t-modes">
    <p class="im-kicker">${c.lieu.toUpperCase()}</p><h2>${c.titre}</h2><p>Comment veux-tu jouer ?</p>
    <div class="im-cartes">
      <button type="button" class="im-carte" data-mode="guide" data-pour="${id}"><span>Conseillé la première fois</span><b>🧭 Guidé</b><small>Le jeu t'indique l'étape suivante et te montre où toucher.</small></button>
      <button type="button" class="im-carte" data-mode="terrain" data-pour="${id}"><span>Pour s'évaluer</span><b>🔧 Comme sur le terrain</b><small>Aucune aide affichée. Le bouton « Je suis perdu » reste là, mais chaque indice coûte du temps.</small></button>
    </div>
    <button type="button" class="im-lien" data-action="menu">← Les autres interventions</button></div>`;
}
function chargement(txt = "Chargement de l'intervention…") {
  racine.classList.remove("im2");
  racine.innerHTML = `<div class="t-charge" role="status"><span class="t-spin" aria-hidden="true"></span>${txt}</div>`;
}
// Bande visible de l'image : toute la largeur sur un écran large, une bande de 540 de large (au moins) sur un téléphone.
function cadrage() {
  const cadre = racine.querySelector(".t-ecran");
  const r = cadre.getBoundingClientRect();
  const A = r.width / Math.max(1, r.height);
  const vw = A >= W / H ? W : Math.max(540, Math.min(W, H * A));
  const cx = (S.cadrage && S.cadrage[e.vue]) || 600;
  const vx = Math.max(0, Math.min(W - vw, cx - vw / 2));
  const zoom = (S.rapprochees || []).includes(e.vue) && boiteUtile();
  if (!zoom) return { x: vx, y: 0, w: vw, h: H };
  // vue rapprochée : on cadre serré autour de tout ce qui se touche, l'objet au centre et en grand
  const m = 26, bw = zoom.x1 - zoom.x0 + 2 * m, bh = zoom.y1 - zoom.y0 + 2 * m;
  const w = Math.min(vw, Math.max(400, bw, bh * A));
  const h = Math.min(H, w / A); // si l'image est plus haute que la scène, le cadre garde des bandes (comme sans zoom)
  const x = Math.max(0, Math.min(W - w, (zoom.x0 + zoom.x1) / 2 - w / 2));
  const y = Math.max(0, Math.min(H - h, (zoom.y0 + zoom.y1) / 2 - h / 2));
  return { x, y, w, h };
}
// Boîte (coordonnées de la scène) qui contient toutes les zones à toucher de la vue
function zonesMonde() {
  const svg = racine.querySelector(".im-scene");
  const inv = svg.getScreenCTM().inverse();
  return [...svg.querySelectorAll(".im-vue .t-hit, .im-vue .t-etiq")].map((el) => {
    const r = el.getBoundingClientRect(); if (!r.width) return null;
    const a = new DOMPoint(r.left, r.top).matrixTransform(inv), b = new DOMPoint(r.right, r.bottom).matrixTransform(inv);
    return { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
  }).filter(Boolean);
}
function boiteUtile() {
  const z = zonesMonde(); if (!z.length) return null;
  return { x0: Math.min(...z.map((b) => b.x0)), y0: Math.min(...z.map((b) => b.y0)), x1: Math.max(...z.map((b) => b.x1)), y1: Math.max(...z.map((b) => b.y1)) };
}
// Place les deux pointes au repos en bas de l'image, là où elles ne cachent aucune zone à toucher
function placeRepos(vb) {
  const zones = zonesMonde();
  const libre = (x, y, autres) => zones.concat(autres).every((b) => x + 40 < b.x0 || x - 40 > b.x1 || y + 4 < b.y0 || y - 118 > b.y1);
  const pos = [];
  // d'abord le long du bas, de droite à gauche, puis en remontant
  for (let y = vb.y + vb.h - 24; y > vb.y + 160 && pos.length < 2; y -= 20)
    for (let x = vb.x + vb.w - 50; x > vb.x + 50 && pos.length < 2; x -= 8) {
      const deja = pos.map(([px, py]) => ({ x0: px - 40, x1: px + 40, y0: py - 118, y1: py + 4 }));
      if (libre(x, y, deja)) pos.push([x, y]);
    }
  while (pos.length < 2) pos.push([vb.x + vb.w - 52 - 76 * pos.length, vb.y + vb.h - 24]);
  return pos;
}
function placerPointes() {
  const svg = racine.querySelector(".im-scene");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const vb = cadrage();
  svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  const mesurable = !!racine.querySelector(".im-scene [data-vis]");
  const g = racine.querySelector(".im-pointes");
  if (!mesurable || S.sansMultimetre) { g.innerHTML = ""; return; }
  const [pr, pn] = placeRepos(vb);
  for (const [id, [x, y]] of [["rouge", pr], ["noir", pn]]) if (e[id].repos) e[id] = { repos: true, x, y };
  g.innerHTML = pointes(e);
  if (e.pointeChoisie) g.querySelector(`[data-pointe="${e.pointeChoisie}"]`)?.classList.add("t-choisie");
  if (e.pointeChoisie || tenue) montrerCibles(true);
}
function montrerCibles(oui) {
  const g = racine.querySelector(".t-cibles"); if (!g) return;
  g.innerHTML = oui ? bornes().map((b) => `<circle class="t-cible" data-cible="${b.id}" cx="${b.x}" cy="${b.y}" r="34"/>`).join("") : "";
}
function surligner() {
  racine.querySelectorAll(".t-guide").forEach((x) => x.classList.remove("t-guide"));
  if (e.mode !== "guide" || e.panneau || e.fini) return;
  const h = aideActuelle(); if (!h) return;
  // une pointe est toujours là : elle ne compte que si on est dans la bonne vue
  const ici = h.cible && !h.cible.startsWith(".pointe") && racine.querySelector(h.cible);
  const sel = ici || !h.vue || h.vue === vueComplete() ? h.cible : cheminVers(h.vue);
  if (sel) racine.querySelectorAll(sel).forEach((x) => x.classList.add("t-guide"));
}
// Bande d'objectif : le dernier retour s'y affiche quelques secondes, puis l'objectif revient.
// Aucun texte n'est posé sur l'image.
let minuterieRetour = null;
function objectifHTML(h) {
  if (e.bulle) return `<span class="t-retour ${e.bulle.type}">${e.bulle.t}</span>`;
  return h ? `<span>👉 ${h.quoi}</span>` : `<b>🎯 ${S.objectif}</b>`;
}
function programmerRetour(h) {
  clearTimeout(minuterieRetour);
  if (!e.bulle) return;
  const b = e.bulle;
  minuterieRetour = setTimeout(() => {
    if (!e || e.bulle !== b) return;
    e.bulle = null;
    const o = racine.querySelector(".t-objectif"); if (o) o.innerHTML = objectifHTML(h);
  }, b.type === "danger" ? 6000 : b.type === "alerte" ? 5000 : 3500);
}
function etapesHTML() {
  const fait = etapesFaites(), inutiles = e.panne.inutiles || [];
  const enCours = ETAPES.find(([k]) => !fait[k] && !inutiles.includes(k));
  return ETAPES.map(([k, court, long]) => {
    const etat = fait[k] ? "fait" : inutiles.includes(k) ? "inutile" : enCours && enCours[0] === k ? "encours" : "";
    const dit = fait[k] ? "fait" : etat === "inutile" ? "pas nécessaire ici" : etat === "encours" ? "en cours" : "à faire";
    return `<li class="${etat}" title="${long} : ${dit}" aria-label="${long} : ${dit}">${court}</li>`;
  }).join("");
}
function rendre() {
  if (!S) { menu(); return; }
  verifierFin();
  racine.classList.add("im2"); document.body.classList.add("atelier-plein");
  const f = facture();
  const vue = S.vues[e.vue](e, api(), e.vueArg);
  const h = e.mode === "guide" && !e.fini ? aideActuelle() : null;
  const panneau = { client: panneauClient, camion: panneauCamion, carnet: panneauCarnet, aide: panneauAide, tuto: panneauTuto, fin: panneauFin }[e.panneau];
  const calibres = S.calibres || [["OFF", "Arrêt"], ["V", "V~"], ["Ω", "Ω"]];
  racine.innerHTML = `
    <div class="t-hud">
      <div class="t-titre"><b>${S.titre}</b><span>${e.mode === "guide" ? "🧭 Guidé" : "🔧 Comme sur le terrain"}</span></div>
      <div class="t-compteurs"><span title="Temps passé">⏱ ${Math.round(e.minutes)} min</span><span title="Facture en cours">🧾 ${f.total} €</span></div>
      <button type="button" class="t-quitter" data-action="menu" aria-label="Quitter l'intervention">✕</button>
    </div>
    <ol class="t-etapes" aria-label="Méthode du dépanneur">${etapesHTML()}</ol>
    <div class="t-objectif" role="status" data-guide="${h ? h.quoi.replace(/"/g, "&quot;") : ""}">${objectifHTML(h)}</div>
    <div class="t-ecran">
      <svg class="im-scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${S.titre}">${DEFS}<g class="im-vue">${vue}</g><g class="t-cibles"></g><g class="im-pointes"></g></svg>
      ${panneau ? `<div class="im-voile">${panneau()}</div>` : ""}
    </div>
    <div class="t-barre">
      ${S.sansMultimetre ? "" : `<div class="t-calibres" role="group" aria-label="Sélecteur du multimètre"><output class="t-lcd" aria-label="Écran du multimètre"><small>${e.calibre === "OFF" ? "arrêt" : e.calibre === "V" ? "V~" : "Ω"}</small>${e.calibre === "OFF" ? "" : e.lecture || "- - -"}</output>${calibres.map(([c, l]) => `<button type="button" class="${e.calibre === c ? "actif" : ""}" data-calibre="${c}">${l}</button>`).join("")}</div>`}
      <div class="t-boutons">
        ${S.dialogue ? `<button type="button" data-panneau="client">💬 ${S.client.court}</button>` : ""}
        ${S.pieces && S.pieces.length ? `<button type="button" data-panneau="camion">🚐 Camionnette</button>` : ""}
        <button type="button" data-panneau="carnet">📒 Carnet${e.journal.length ? ` (${e.journal.length})` : ""}</button>
        <button type="button" data-panneau="aide">🆘 Je suis perdu</button>
      </div>
    </div>`;
  placerPointes();
  surligner();
  programmerRetour(h);
}
addEventListener("resize", () => { if (S && e && !ancien) { placerPointes(); } });

/* ---------- Événements ---------- */
let tenue = null; // { id, depart, bouge }
function versSVG(ev) {
  const svg = racine.querySelector(".im-scene");
  const m = svg.getScreenCTM().inverse();
  const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m);
  return { x: p.x, y: p.y };
}
function montrerOutil(ev, icone) {
  const cadre = racine.querySelector(".t-ecran"); if (!cadre || !icone) return;
  const r = cadre.getBoundingClientRect();
  const el = document.createElement("span");
  el.className = "t-outil-puce"; el.textContent = icone;
  el.style.left = `${ev.clientX - r.left + 14}px`; el.style.top = `${ev.clientY - r.top - 40}px`;
  cadre.appendChild(el); setTimeout(() => el.remove(), 800);
}
racine.addEventListener("pointerdown", (ev) => {
  ignorerClic = false;
  if (ancien || !e || e.panneau || occupe) return;
  const g = ev.target.closest(".pointe");
  if (!g) return;
  ev.preventDefault();
  tenue = { id: g.dataset.pointe, depart: { x: ev.clientX, y: ev.clientY }, bouge: false };
  racine.setPointerCapture(ev.pointerId);
  montrerCibles(true);
});
racine.addEventListener("pointermove", (ev) => {
  if (!tenue) return;
  if (Math.hypot(ev.clientX - tenue.depart.x, ev.clientY - tenue.depart.y) > 8) tenue.bouge = true;
  if (!tenue.bouge) return;
  const p = versSVG(ev);
  e[tenue.id] = { x: p.x, y: Math.max(110, Math.min(H + 20, p.y)) };
  racine.querySelector(".im-pointes").innerHTML = pointes(e);
  const b = plusProche(p);
  racine.querySelectorAll(".t-cible").forEach((c) => c.classList.toggle("proche", !!b && c.dataset.cible === b.id));
});
let ignorerClic = false;
racine.addEventListener("pointerup", (ev) => {
  if (!tenue) return;
  const t = tenue; tenue = null; ignorerClic = true;
  if (!t.bouge) {
    // pointe touchée sans la glisser : on la « prend », la prochaine borne touchée la reçoit
    e.pointeChoisie = e.pointeChoisie === t.id ? null : t.id;
    if (e.pointeChoisie) dire(`Pointe ${NOM_P[t.id]} en main : touche la borne où la poser (cercles jaunes).`, "mesure"); else e.bulle = null;
    rendre(); return;
  }
  const b = plusProche(versSVG(ev));
  if (b) poserPointe(t.id, b);
  else { e[t.id] = { repos: true }; dire("Pose la pointe sur une borne : les cercles jaunes montrent où mesurer.", "info"); }
  rendre();
});
racine.addEventListener("click", async (ev) => {
  if (ignorerClic) { ignorerClic = false; return; }
  if (occupe) return;
  const t = ev.target.closest("[data-aller],[data-geste],[data-vis],[data-panneau],[data-calibre],[data-question],[data-piece],[data-action],[data-intervention],[data-mode]");
  if (ancien) return;
  // une pointe est en main : la touche suivante dans l'image la pose sur la borne la plus proche
  if (e && e.pointeChoisie && !e.panneau && ev.target.closest(".im-scene")) {
    const b = plusProche(versSVG(ev), 130);
    if (b) { poserPointe(e.pointeChoisie, b); rendre(); return; }
    e.pointeChoisie = null;
    if (!t || !(t.dataset.aller || t.dataset.geste)) { dire("Pointe reposée. Pour mesurer, touche une pointe puis une borne (cercles jaunes).", "info"); rendre(); return; }
  }
  if (!t) return;
  const d = t.dataset;
  if (d.intervention) { lancer(d.intervention); return; }
  if (d.mode) { await charger(d.pour, d.mode); return; }
  if (d.action === "menu") { S = null; e = null; history.replaceState(null, "", location.pathname); menu(); return; }
  if (!e) return;
  if (e.panneau && !t.closest(".im-voile") && !t.closest(".t-barre")) return;
  if (d.aller || d.geste || d.vis || d.calibre || d.piece) e.bulle = null;
  const avant = e.vue;
  if (d.aller) { aller(d.aller); montrerOutil(ev, "🚶"); }
  else if (d.geste) {
    montrerOutil(ev, d.geste.startsWith("visMeca") ? "🪛" : "✋");
    occupe = true; animations = [];
    geste(d.geste);
    await finAnimations(); occupe = false;
  } else if (d.vis) {
    montrerOutil(ev, (S.pasDeVis || []).includes(d.vis) ? "" : "🪛");
    occupe = true; animations = [];
    tournevis(d.vis, +t.dataset.cx, +t.dataset.cy);
    await finAnimations(); occupe = false;
  } else if (d.panneau) {
    e.panneau = e.panneau === d.panneau ? null : d.panneau;
    if (e.panneau === "aide") { const h = aideActuelle(); if (h && e.aide.cle !== h.quoi) e.aide = { cle: h.quoi, niveau: 0 }; }
  }
  else if (d.calibre) { e.calibre = d.calibre; mesurer(); }
  else if (d.question) poser(d.question);
  else if (d.piece) piece(d.piece);
  else if (d.action === "indice") { e.aide.niveau = Math.min(3, e.aide.niveau + 1); e.indicesPris++; temps(2); }
  else if (d.action === "tuto") { if (e.tuto < TUTO.length - 1) e.tuto++; else { ecrire(LS_TUTO, "1"); e.panneau = "client"; } }
  else if (d.action === "fermer") { if (e.debut && e.panneau === "client") { e.debut = false; if (S.entree) S.entree(api()); } e.panneau = null; apres(); }
  else if (d.action === "suivante") { nouvelle(); e.panneau = "client"; }
  rendre();
});
racine.addEventListener("keydown", (ev) => {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches("[role=button]")) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
});

/* ---------- Démarrage ---------- */
function lancer(id) {
  const c = CATALOGUE.find((x) => x.id === id) || CATALOGUE[0];
  if (c.v2) { choixMode(c.id); return; }
  chargement(); location.href = `${location.pathname}?i=${c.id}`;
}
async function charger(id, mode) {
  const c = CATALOGUE.find((x) => x.id === id) || CATALOGUE[0];
  chargement();
  S = (await import(c.fichier)).default;
  const params = new URLSearchParams(location.search);
  e = null; nouvelle(params.get("panne")); e.mode = mode;
  params.set("i", c.id); params.delete("panne");
  history.replaceState(null, "", `${location.pathname}?${params}`);
  rendre();
  const haut = racine.getBoundingClientRect().top + scrollY;
  scrollTo({ top: Math.max(0, haut), behavior: "auto" });
}
brancherBoutonSons();
const depart = new URLSearchParams(location.search).get("i");
const entree = CATALOGUE.find((x) => x.id === depart);
if (entree && !entree.v2) { ancien = true; chargement(); import("./ancien.js"); }
else if (entree) choixMode(entree.id);
else menu();
