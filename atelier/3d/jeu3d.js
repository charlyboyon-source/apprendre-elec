// Atelier dépannage en 3D — prototype « La lumière de la chambre » (une panne, mode guidé).
// Même règle que l'atelier 2D : un seul geste, toucher pour agir. Glisser le doigt fait tourner la tête.
// Le modèle électrique est celui de l'atelier 2D (../immersif/moteur.js) : seule la façon de voir et de toucher change.
import * as THREE from "./three.module.min.js";
import { creerMonde } from "./monde.js";
import { creerMultimetre, creerVAT, creerSonde, creerTournevis, creerPlateau } from "./materiel.js";
import S from "./scenario.js";
import { modele } from "../immersif/moteur.js";
import { sons } from "../immersif/sons.js";
import { sonsActives } from "../../js/audio.js";

const racine = document.getElementById("jeu");
const BASE = new URL("./", import.meta.url).href;
const DEBUG = new URLSearchParams(location.search).has("fps");
const REDUIT = matchMedia("(prefers-reduced-motion: reduce)").matches;
const RAD = Math.PI / 180;
const ETAPES = [["questionner", "Écouter", "Écouter la cliente"], ["observer", "Observer", "Constater la panne"], ["couper", "Couper", "Couper le circuit"], ["vat", "VAT", "Vérifier l'absence de tension"], ["mesurer", "Mesurer", "Mesurer"], ["reparer", "Réparer", "Réparer"], ["essayer", "Essayer", "Essayer"]];
const RANGEES = S.tableau.rangees;
const ETIQ = { diff: "Diff. 1", dj: "Écl. chambres", d2: "Pr. chambres", d3: "Pr. séjour", d4: "Écl. séjour", diff2: "Diff. 2", d5: "Plaque", d6: "Lave-linge", d7: "Four", d8: "Cuisine" };

let e = null, W = null, renderer = null, camera = null, occupe = false;
const M = () => modele(S, e);

/* =====================================================================
   Partie
   ===================================================================== */
function nouvellePartie() {
  e = {
    panne: S.pannes[0], app: { inter: false, ampouleMontee: true }, repare: false, fini: false,
    poses: [], humeur: 3, minutes: 0, fautes: [], accident: false,
    plaque: true, vis: [true, true], mecaSorti: false, obs: false, coupe: false,
    filEngage: false, filSerre: false, essaye: false, attenteFacture: false,
    calibre: "V", rouge: null, noir: null, dernier: null, outil: null, aideMesure: false, vatPts: [null, null], vatDernier: 0, vatLecture: null, vat: { avant: false, absence: false, apres: false },
    lecture: null, mesures: [], journal: [], bulle: null, vue: "entree", rappel: false, lieux: new Set(["entree"]),
    aide: { cle: null, niveau: 0 }, indicesPris: 0, panneau: "client", debut: true, mode: "guide",
  };
  for (const r of RANGEES) for (const a of r) e.app[a.cle] = true;
}
const temps = (m) => { e.minutes += m; };
const dire = (t, type = "info") => { e.bulle = { t, type }; };
const faute = (t) => { if (!e.fautes.includes(t)) e.fautes.push(t); };
const lampeAllumee = () => M().alimente("DclL", "DclN");
const pot = (n) => M().potentiels().de(n);
const circuitCoupe = () => !e.app.dj || !e.app.diff;
// un appareil de mesure est en main : toucher un point y pose une pointe
const mesureEnMain = () => e.outil === "multi" || e.outil === "vat";
const NOMS_OUTILS = { multi: "le multimètre", vat: "le VAT", tournevis: "le tournevis" };
function vibrer(m) { try { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(m); } catch { /* rien */ } }

/* =====================================================================
   Vues et caméra
   ===================================================================== */
const VUES = {
  entree: { libre: true, pos: [0, 1.62, 3.95], yaw: 0, pitch: -0.04, parent: null, nom: "l'entrée", court: "L'entrée", lieu: "Entrée" },
  chambre: { libre: true, pos: [0.42, 1.62, 0.32], yaw: 0, pitch: -0.1, parent: "entree", nom: "la chambre", court: "La chambre", lieu: "Chambre" },
  plafonnier: { parent: "chambre", nom: "le plafonnier", court: "Le plafonnier" },
  inter: { parent: "chambre", nom: "l'interrupteur", court: "L'interrupteur", lieu: "Interrupteur" },
  tableau: { parent: "entree", nom: "le tableau", court: "Le tableau", lieu: "Tableau" },
  rangee1: { parent: "tableau", nom: "la rangée du haut", court: "La rangée" },
  rangee2: { parent: "tableau", nom: "la rangée du bas", court: "La rangée" },
};
const FOV_PROCHE = 32;
let fovLibre = 66;
const fovDe = (vue) => (VUES[vue].libre ? fovLibre : FOV_PROCHE);
// largeur vue à 1 m avec le champ étroit (dépend de la forme de l'écran)
function largeurVue() { return 2 * Math.tan((FOV_PROCHE / 2) * RAD) * Math.min(1.25, camera.aspect); }
function cadreProche(vue) {
  // vues rapprochées au « téléobjectif » : l'objet remplit l'image, sans déformation
  let obj, p, c;
  const k = largeurVue();
  if (vue === "inter") {
    obj = W.appareil;
    if (e.mecaSorti) { const d = 0.135 / k; p = [0.028, -0.03 - d * 0.22, 0.03 + d]; c = [0.028, -0.03, 0.03]; }
    else if (!e.plaque) { const d = 0.085 / k; p = [0.004, -0.004, d]; c = [0.004, -0.004, 0]; }
    else { const d = 0.162 / k; p = [0.0355, 0, d]; c = [0.0355, 0, 0]; }
  } else if (vue === "tableau") { obj = W.tableau; const d = 0.3 / k; p = [0, 0, 0.1 + d]; c = [0, 0, 0.1]; }
  else if (vue === "rangee1" || vue === "rangee2") { obj = W.tableau; const y = W.rangees[vue === "rangee1" ? 0 : 1].position.y; const d = 0.112 / k; p = [0, y - 0.008, 0.165 + d]; c = [0, y, 0.165]; }
  else if (vue === "plafonnier") return orient([0.3, 1.55, 0.6], [0, 2.05, 0]);
  obj.updateMatrixWorld(true);
  return orient(obj.localToWorld(new THREE.Vector3(...p)).toArray(), obj.localToWorld(new THREE.Vector3(...c)).toArray());
}
function orient(pos, cible) {
  const d = new THREE.Vector3(...cible).sub(new THREE.Vector3(...pos)).normalize();
  return { pos, yaw: Math.atan2(-d.x, -d.z), pitch: Math.asin(d.y) };
}
const regard = { yaw: 0, pitch: 0, base: null, memo: {} };
function cadrageVue(vue) { const v = VUES[vue]; return v.libre ? { pos: v.pos, yaw: v.yaw, pitch: v.pitch } : cadreProche(vue); }
let transition = null;
function lancerTransition(de, a, d) {
  // un nouveau mouvement remplace le précédent : celui-ci est considéré comme terminé (personne ne reste bloqué)
  if (transition) { const ancien = transition; transition = null; ancien.res(); }
  return new Promise((res) => { transition = { t0: performance.now(), d: REDUIT ? 1 : d, de, a, res }; });
}
function allerVue(vue, { duree = 900 } = {}) {
  const avant = e.vue;
  if (VUES[avant] && VUES[avant].libre) regard.memo[avant] = { yaw: regard.yaw, pitch: regard.pitch };
  e.vue = vue; rangerOutil();
  if (VUES[vue].lieu) e.lieux.add(vue);
  const c = cadrageVue(vue);
  if (VUES[vue].libre && regard.memo[vue]) Object.assign(c, regard.memo[vue]);
  let dy = c.yaw - regard.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
  regard.base = VUES[vue].libre ? null : { yaw: regard.yaw + dy, pitch: c.pitch };
  if (vue !== avant) temps(0.5);
  ambianceSonore(); majSondes(); majUI();
  return lancerTransition({ pos: camera.position.clone(), yaw: regard.yaw, pitch: regard.pitch, fov: camera.fov }, { pos: new THREE.Vector3(...c.pos), yaw: regard.yaw + dy, pitch: c.pitch, fov: fovDe(vue) }, duree);
}
function recadrer() { // la vue rapprochée change (plaque, mécanisme) : la caméra suit en douceur
  const c = cadrageVue(e.vue);
  regard.base = { yaw: c.yaw, pitch: c.pitch };
  return lancerTransition({ pos: camera.position.clone(), yaw: regard.yaw, pitch: regard.pitch, fov: camera.fov }, { pos: new THREE.Vector3(...c.pos), yaw: c.yaw, pitch: c.pitch, fov: fovDe(e.vue) }, 650);
}
// tourner la tête (sans se déplacer) vers un point de la scène
function regarderVers(p, duree = 700) {
  const d = p.clone().sub(camera.position).normalize();
  let yaw = Math.atan2(-d.x, -d.z), dy = yaw - regard.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
  return lancerTransition({ pos: camera.position.clone(), yaw: regard.yaw, pitch: regard.pitch, fov: camera.fov }, { pos: camera.position.clone(), yaw: regard.yaw + dy, pitch: Math.max(-1, Math.min(1.1, Math.asin(d.y))), fov: camera.fov }, duree);
}
// se rendre dans une vue en passant par les pièces (vrai déplacement, une étape après l'autre)
const VOISINS = { entree: ["chambre", "tableau"], chambre: ["entree", "inter", "plafonnier"], inter: ["chambre"], plafonnier: ["chambre"], tableau: ["entree", "rangee1", "rangee2"], rangee1: ["tableau"], rangee2: ["tableau"] };
function trajet(vers) {
  const vus = new Map([[e.vue, null]]), file = [e.vue];
  while (file.length) { const v = file.shift(); if (v === vers) break; for (const w of VOISINS[v]) if (!vus.has(w)) { vus.set(w, v); file.push(w); } }
  const t = []; for (let v = vers; v && v !== e.vue; v = vus.get(v)) t.unshift(v);
  return t;
}
async function allerA(vers) {
  if (occupe || vers === e.vue) return;
  occupe = true;
  try { const t = trajet(vers); for (let i = 0; i < t.length; i++) await allerVue(t[i], { duree: t.length > 1 ? 650 : 900 }); }
  finally { occupe = false; apresArrivee(); majUI(); }
}
const lisse = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* =====================================================================
   Animations (petit moteur d'interpolation)
   ===================================================================== */
const anims = [];
function anime(ms, f) { return new Promise((res) => { if (REDUIT) ms = 1; anims.push({ t0: performance.now(), ms, f, res }); }); }
function pasAnims(now) {
  for (let i = anims.length - 1; i >= 0; i--) {
    const a = anims[i], t = Math.min(1, (now - a.t0) / a.ms);
    a.f(lisse(t), t);
    if (t >= 1) { anims.splice(i, 1); a.res(); }
  }
}
// le tournevis arrive de biais, la lame engagée dans la tête, et tourne
let tournevis = null;
async function vissage(posMonde, axe, sens, objetQuiTourne = null) {
  sons.vis(); vibrer(25);
  const bas = new THREE.Vector3(0, -1, 0).applyQuaternion(camera.quaternion), droite = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const incline = axe.clone().normalize().multiplyScalar(0.82).addScaledVector(droite, 0.42).addScaledVector(bas, 0.38).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), incline);
  tournevis.quaternion.copy(q); tournevis.visible = true;
  const loin = posMonde.clone().addScaledVector(incline, 0.06);
  await anime(240, (t) => tournevis.position.lerpVectors(loin, posMonde, t));
  const q0 = q.clone(), r0 = objetQuiTourne ? objetQuiTourne.rotation.y : 0, s = sens === "devisser" ? -1 : 1;
  await anime(620, (t) => {
    tournevis.quaternion.copy(q0).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), s * t * 3 * Math.PI));
    if (objetQuiTourne) objetQuiTourne.rotation.y = r0 + s * t * 3 * Math.PI;
  });
  await anime(200, (t) => tournevis.position.lerpVectors(posMonde, loin, t));
  tournevis.visible = false;
}

/* =====================================================================
   Ce que l'on tient en bas de l'image : multimètre, VAT, plaque déclipsée, plateau des vis
   ===================================================================== */
const main = {};
const MAIN = 0.07; // les objets tenus sont à 7 cm de l'œil : toujours devant le mur, même tout près
function poserEnMain(obj, fx, fy, tailleRel, rx = 0, rz = 0) {
  // fx, fy : position dans le cadre (-1 … 1) ; tailleRel : hauteur de l'objet par rapport à la demi-hauteur du cadre
  const d = MAIN, demiH = d * Math.tan((camera.fov / 2) * RAD), demiL = demiH * camera.aspect;
  obj.position.set(fx * demiL, fy * demiH, -d);
  obj.scale.setScalar((tailleRel * demiH) / obj.userData.hauteur);
  obj.rotation.set(rx, 0, rz);
}
function majMain() {
  const proche = e.vue === "inter", mesure = proche && e.mecaSorti;
  // l'appareil pris dans la caisse monte dans la main (en bas à droite de l'image)
  const k = lisse(Math.min(1, (performance.now() - (main.pris || 0)) / (REDUIT ? 1 : 380))), bas = (1 - k) * 0.9;
  main.vat.visible = mesure && e.outil === "vat"; main.multi.visible = mesure && e.outil === "multi";
  if (main.multi.visible) poserEnMain(main.multi, 0.66, -0.7 - bas, 0.6, -0.25, 0.12);
  if (main.vat.visible) poserEnMain(main.vat, 0.72, -0.64 - bas, 0.64, -0.2, 0.18);
  const molette = main.multi.userData.molette; molette.rotation.z += ((molette.userData.cible || 0) - molette.rotation.z) * 0.2;
  // plaque et vis déposées : visibles seulement devant l'interrupteur démonté (le reste du temps, dans la sacoche)
  const depose = proche && !e.mecaSorti;
  main.plateau.visible = depose && e.vis.some((v) => !v);
  if (main.plateau.visible) poserEnMain(main.plateau, 0.12, -0.84, 0.3, -0.9, 0);
  if (W.plaque.parent === camera) { W.plaque.visible = depose; if (!W.plaque.userData.enVol) poserPlaqueEnMain(); }
}
function poserPlaqueEnMain() {
  const d = MAIN, demiH = d * Math.tan((camera.fov / 2) * RAD), demiL = demiH * camera.aspect;
  W.plaque.position.set(-0.62 * demiL, -0.8 * demiH, -d);
  W.plaque.rotation.set(-0.5, 0, 0.12);
  W.plaque.scale.setScalar((0.55 * demiL) / 0.152);
}

/* =====================================================================
   Fils dans les boîtes d'encastrement (tubes recalculés quand le mécanisme bouge)
   ===================================================================== */
const fils = {};
function tube(nom, points, mat, r = 0.0017) {
  const courbe = new THREE.CatmullRomCurve3(points);
  if (fils[nom]) { fils[nom].geometry.dispose(); fils[nom].geometry = new THREE.TubeGeometry(courbe, 28, r, 8); }
  else { fils[nom] = new THREE.Mesh(new THREE.TubeGeometry(courbe, 28, r, 8), mat); fils[nom].castShadow = true; W.fils.add(fils[nom]); }
  return courbe;
}
function chemin(depart, arrivee, mou = 0.012) {
  // du fond de la boîte (gaine) vers la borne, avec du mou
  const a = depart.clone().add(new THREE.Vector3(0, 0.01, 0.006));
  const m = a.clone().lerp(arrivee, 0.55); m.z = Math.max(a.z, arrivee.z) + mou * 0.7; m.y -= mou;
  return [depart, a, m, arrivee];
}
let engage = 0; // 0 = fil rouge hors de sa borne, 1 = engagé dans la borne
function majFils() {
  const A = W.appareil; A.updateMatrixWorld(true);
  const versLocal = (obj) => A.worldToLocal(obj.getWorldPosition(new THREE.Vector3()));
  const bL = versLocal(W.bornesMeca["int-E"]), b1 = versLocal(W.bornesMeca["int-S"]);
  const g0 = W.pointsGaine[0];
  // bout du fil rouge : dans la boîte tant que le mécanisme est dedans ; sorti, à 2 cm de la borne L ; puis engagé
  const libre = e.mecaSorti ? bL.clone().add(new THREE.Vector3(-0.006, -0.02, 0.01)) : new THREE.Vector3(-0.014, -0.022, -0.02);
  const dansBorne = bL.clone().add(new THREE.Vector3(0, -0.002, 0.002));
  const k = e.repare || e.filSerre ? 1 : engage;
  const bout = libre.clone().lerp(dansBorne, k);
  const courbeR = tube("rouge", chemin(g0, bout, e.mecaSorti ? 0.006 : 0.003), W.M.rouge);
  tube("orange", chemin(g0.clone().add(new THREE.Vector3(0.004, 0, 0)), b1, e.mecaSorti ? 0.006 : 0.003), W.M.orange);
  // cuivre dénudé au bout du fil rouge
  const dir = courbeR.getTangentAt(1).normalize();
  W.boutRouge.position.copy(bout).addScaledVector(dir, 0.003);
  W.boutRouge.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  W.boutRouge.visible = e.mecaSorti;
  // l'endroit où l'on prend le fil : le bout tant qu'il est libre, puis l'isolant un peu plus loin
  W.prendreFil.position.copy(k > 0.5 ? courbeR.getPointAt(0.78) : bout);
}
function filsPrise() {
  const g = W.pointsGaine[1], E = W.E;
  tube("p-rouge", chemin(g, new THREE.Vector3(E - 0.008, -0.004, -0.03), 0.003), W.M.rouge);
  tube("p-bleu", chemin(g.clone().add(new THREE.Vector3(0.003, 0, 0)), new THREE.Vector3(E + 0.008, -0.004, -0.03), 0.003), W.M.bleu);
  const vj = new THREE.MeshStandardMaterial({ color: 0x3f9a3a, roughness: 0.45 });
  tube("p-terre", chemin(g.clone().add(new THREE.Vector3(-0.003, 0, 0)), new THREE.Vector3(E, 0.01, -0.03), 0.003), vj);
}

/* =====================================================================
   Pointes (multimètre, VAT) posées dans la scène, cordons jusqu'à l'appareil tenu
   ===================================================================== */
const sondes = {};
function nouvelleSonde(coul) {
  const g = creerSonde(coul); g.visible = false; W.scene.add(g);
  const cordon = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: coul, roughness: 0.6 }));
  cordon.visible = false; W.scene.add(cordon);
  return { g, cordon };
}
function posePoint(id) { const c = W.cibles.find((x) => x.id === id); return c.objet.getWorldPosition(new THREE.Vector3()); }
function majSondes() {
  if (!sondes.rouge) return;
  camera.updateMatrixWorld(true);
  const now = performance.now(), DUREE = REDUIT ? 1 : 320;
  const place = (s, idPoint, lat, bas, depart) => {
    const fin0 = depart.getWorldPosition(new THREE.Vector3());
    // la pointe part de l'appareil, va se poser sur le point touché, et revient à l'appareil quand on la retire
    if (idPoint !== s.id) { s.de = s.g.visible ? s.g.position.clone() : null; s.t0 = now; s.avant = s.id; s.id = idPoint; }
    const k = lisse(Math.min(1, (now - (s.t0 || 0)) / DUREE));
    s.enVol = k < 1;
    if (!idPoint && (k >= 1 || !s.de)) { s.g.visible = false; s.cordon.visible = false; s.enVol = false; return; }
    const but = idPoint ? posePoint(idPoint) : fin0, p = (s.de || fin0).clone().lerp(but, k);
    // la pointe arrive de côté (depuis l'appareil tenu en bas à droite), sans cacher le point mesuré
    const versCam = camera.position.clone().sub(p).normalize();
    const vBas = new THREE.Vector3(0, -1, 0).applyQuaternion(camera.quaternion), vDroite = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const axe = versCam.multiplyScalar(0.9).addScaledVector(vDroite, lat).addScaledVector(vBas, bas).normalize();
    s.g.position.copy(p); s.g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axe); s.g.visible = true;
    s.g.updateMatrixWorld(true);
    const haut = s.g.userData.haut.getWorldPosition(new THREE.Vector3());
    const fin = fin0;
    const courbe = new THREE.CatmullRomCurve3([haut, haut.clone().addScaledVector(axe, 0.03), haut.clone().lerp(fin, 0.5).addScaledVector(vBas, 0.03), fin]);
    s.cordon.geometry.dispose(); s.cordon.geometry = new THREE.TubeGeometry(courbe, 20, 0.0013, 6); s.cordon.visible = true;
  };
  majMain();
  const d = main.multi.userData.douilles, sv = main.vat.userData.sortie;
  place(sondes.rouge, e.rouge, 0.3, 0.12, d.rouge); place(sondes.noir, e.noir, 0.14, 0.28, d.noir);
  place(sondes.vat1, e.vatPts[0], 0.3, 0.12, sv); place(sondes.vat2, e.vatPts[1], 0.14, 0.28, sv);
}
const sondesEnVol = () => Object.values(sondes).some((s) => s.enVol);

/* =====================================================================
   Ce qui se touche
   ===================================================================== */
function actif(c) {
  const v = e.vue, id = c.id;
  if (v === "inter") {
    if (id === "plaque") return e.plaque || (!e.mecaSorti && e.vis.every(Boolean));
    if (id === "touche") return !e.mecaSorti && (e.plaque || e.vis.some(Boolean));
    if (id === "vis0" || id === "vis1") return !e.plaque && !e.mecaSorti;
    if (id === "meca") return !e.plaque && (e.mecaSorti || !e.vis.some(Boolean));
    if (id === "int-E" || id === "int-S") return e.mecaSorti;
    if (id === "fil-rouge") return e.mecaSorti && !e.repare;
  }
  if (c.vues.includes("inter-ouvert")) return v === "inter" && e.mecaSorti;
  return c.vues.includes(v);
}
const ray = new THREE.Raycaster();
function ecranDe(p) { const r = renderer.domElement.getBoundingClientRect(); const q = p.clone().project(camera); return { x: (q.x + 1) / 2 * r.width, y: (1 - q.y) / 2 * r.height, devant: q.z < 1 && q.z > -1 }; }
function rayonEcranDe(p, rayon) {
  const droite = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const a = ecranDe(p), b = ecranDe(p.clone().addScaledVector(droite, rayon));
  return { ...a, r: Math.hypot(b.x - a.x, b.y - a.y) };
}
const rayonEcran = (c) => rayonEcranDe(c.objet.getWorldPosition(new THREE.Vector3()), c.rayon);
function cibleSous(x, y) {
  const actives = W.cibles.filter(actif);
  let best = null;
  for (const c of actives.filter((k) => k.type === "point")) {
    const s = rayonEcran(c); if (!s.devant) continue;
    const d = Math.hypot(s.x - x, s.y - y);
    if (d <= Math.max(s.r, 24) && (!best || d < best.d)) best = { id: c.id, d };
  }
  if (best) return best.id;
  const r = renderer.domElement.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2((x / r.width) * 2 - 1, -(y / r.height) * 2 + 1), camera);
  const hits = ray.intersectObjects(actives.filter((k) => k.type === "surface").map((k) => k.objet), true);
  for (const h of hits) { let o = h.object; while (o && !o.userData.cible) o = o.parent; if (o && o.visible !== false) return o.userData.cible; }
  return null;
}

/* =====================================================================
   Gestes
   ===================================================================== */
async function agir(id) {
  if (id === "porte-chambre") { await allerVue("chambre"); if (!e.dejaChambre) { e.dejaChambre = true; dire("Noir complet. Ta frontale suit ton doigt. L'interrupteur est derrière toi."); } apresArrivee(); return; }
  if (id === "porte-entree") { await allerVue("entree"); apresArrivee(); return; }
  if (id === "approcher-inter") return allerVue("inter");
  if (id === "approcher-tableau") { sons.clip(); dire("Tu ouvres le tableau : deux rangées, chacune derrière son différentiel."); return allerVue("tableau"); }
  if (id === "approcher-rangee1") return allerVue("rangee1");
  if (id === "approcher-rangee2") return allerVue("rangee2");
  if (id === "plafonnier") { dire(lampeAllumee() ? "Le plafonnier éclaire." : "Le plafonnier est éteint. L'ampoule est neuve : commence par l'interrupteur."); return allerVue("plafonnier"); }
  if (id.startsWith("manette:")) return manette(id.slice(8));
  const point = S.points[id];
  if (mesureEnMain() && point) return poserPointe(id);
  if (id === "touche") return toucheInter();
  if (id === "plaque") return plaqueGeste();
  if (id === "vis0" || id === "vis1") return visGeste(+id[3]);
  if (id === "meca") return mecaGeste();
  if (id === "int-E" || id === "int-S") return serrer(id);
  if (id === "fil-rouge") return filRouge();
  if (point) dire("Pour mesurer ici, prends d'abord le multimètre ou le VAT dans la caisse à outils (en bas).");
}
async function toucheInter() {
  e.app.inter = !e.app.inter; e.obs = true; sons.interrupteur(); vibrer(10); temps(0.5);
  const a = -5 * RAD, b = 5 * RAD, de = e.app.inter ? b : a, vers = e.app.inter ? a : b;
  await anime(140, (t) => { W.touche.rotation.x = de + (vers - de) * t; });
  const allumee = e.app.inter && lampeAllumee();
  dire(!e.app.inter ? "Clic. Interrupteur sur « O »." : allumee ? "Clic… et la lumière s'allume !" : "Clic. Interrupteur sur « I »… Dans ton dos, le plafonnier reste éteint.", allumee ? "ok" : "info");
  apres();
  if (allumee && e.repare && !e.essaye) recompense();
}
async function plaqueGeste() {
  const P = W.plaque;
  if (e.plaque) {
    // déclipsée : elle vient dans la main (en bas à gauche de l'image)
    sons.clip(); temps(1); e.plaque = false; P.userData.enVol = true;
    camera.attach(P);
    const p0 = P.position.clone(), q0 = P.quaternion.clone(), s0 = P.scale.x;
    recadrer();
    await anime(600, (t) => { /* suivi dans majMain une fois arrivé */ P.position.lerpVectors(p0, cibleMainPlaque().p, t); P.quaternion.slerpQuaternions(q0, cibleMainPlaque().q, t); P.scale.setScalar(s0 + (cibleMainPlaque().s - s0) * t); });
    P.userData.enVol = false;
    dire("La plaque se déclipse. Le mécanisme est tenu par deux vis.");
  } else {
    sons.clip(); temps(1); e.plaque = true; P.userData.enVol = true; P.visible = true;
    W.groupePlaque.attach(P);
    const p0 = P.position.clone(), q0 = P.quaternion.clone(), s0 = P.scale.x;
    recadrer();
    await anime(520, (t) => { P.position.lerpVectors(p0, new THREE.Vector3(), t); P.quaternion.slerpQuaternions(q0, new THREE.Quaternion(), t); P.scale.setScalar(s0 + (1 - s0) * t); });
    P.userData.enVol = false;
    dire("Plaque reclipsée.", "ok");
  }
  apres();
}
function cibleMainPlaque() {
  const d = MAIN, demiH = d * Math.tan((camera.fov / 2) * RAD), demiL = demiH * camera.aspect;
  return { p: new THREE.Vector3(-0.62 * demiL, -0.8 * demiH, -d), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0, 0.12)), s: (0.55 * demiL) / 0.152 };
}
async function visGeste(i) {
  const v = W.vis[i];
  const axe = new THREE.Vector3(0, 0, 1).applyQuaternion(W.appareil.getWorldQuaternion(new THREE.Quaternion()));
  const place = new THREE.Vector3(i ? 0.0295 : -0.0295, 0, 0.0038);
  if (e.vis[i]) {
    // la vis tourne et sort, puis va sur le plateau aimanté
    e.vis[i] = false; temps(0.5);
    const p = v.getWorldPosition(new THREE.Vector3());
    const anim = anime(860, (t) => { v.rotation.z = -t * 3 * Math.PI; v.position.z = place.z + 0.012 * t; });
    await vissage(p, axe, "devisser"); await anim;
    main.plateau.visible = true; majMain(); main.plateau.updateMatrixWorld(true);
    const slot = main.plateau.userData.places[i];
    slot.attach(v);
    const p0 = v.position.clone(), q0 = v.quaternion.clone(), s0 = v.scale.x;
    await anime(380, (t) => { v.position.lerpVectors(p0, new THREE.Vector3(), t); v.quaternion.slerpQuaternions(q0, new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), t); v.scale.setScalar(s0 + (1 - s0) * t); });
    dire(e.vis.some(Boolean) ? "Une vis est sortie, posée sur le plateau. Il en reste une." : "Les deux vis sont sorties : touche le mécanisme pour le tirer hors de sa boîte.", "ok");
  } else {
    // la vis revient du plateau, se pose dans son trou, et se visse
    e.vis[i] = true; temps(0.5);
    W.meca.attach(v);
    const p0 = v.position.clone(), q0 = v.quaternion.clone(), s0 = v.scale.x, haut = place.clone().add(new THREE.Vector3(0, 0, 0.012));
    await anime(380, (t) => { v.position.lerpVectors(p0, haut, t); v.quaternion.slerpQuaternions(q0, new THREE.Quaternion(), t); v.scale.setScalar(s0 + (1 - s0) * t); });
    const p = W.appareil.localToWorld(place.clone());
    const anim = anime(860, (t) => { v.rotation.z = t * 3 * Math.PI; v.position.z = place.z + 0.012 * (1 - t); });
    await vissage(p, axe, "serrer"); await anim;
    dire(e.vis.every(Boolean) ? "Mécanisme revissé. Tu peux reclipser la plaque." : "Une vis revissée. Il reste l'autre.", "ok");
  }
  apres();
}
async function mecaGeste() {
  const m = W.meca, sortir = !e.mecaSorti;
  if (!sortir) { rangerOutil(); majSondes(); }
  e.mecaSorti = sortir; temps(1); sons.clip();
  const de = sortir ? 0 : 1;
  const cam = recadrer();
  await anime(800, (t) => { const u = de + (sortir ? t : -t); m.position.set(0, -0.022 * u, 0.045 * u); m.rotation.x = -72 * RAD * u; majFils(); });
  await cam; majFils();
  if (sortir) {
    dire("Mécanisme sorti : bornes L et 1 visibles. Le fil rouge n'est plus dans sa borne !");
    if (!e.rappel && !circuitCoupe()) { e.rappel = true; setTimeout(() => { if (!e.bulle || e.bulle.type !== "danger") { dire("Sous tension : tu ne touches que l'isolant ; seules les pointes touchent les bornes.", "alerte"); majUI(); } }, 3600); }
  } else dire("Mécanisme rentré dans sa boîte. Revisse ses deux vis.");
  apres();
}
// la réparation, geste par geste : prendre le fil, l'engager, serrer la vis, tirer pour vérifier
async function filRouge() {
  if (mesureEnMain()) return;
  if (!e.filEngage) {
    if (pot("DjL") === 230) return electrisation("en prenant le cuivre du fil rouge");
    if (!(e.vat.avant && e.vat.absence)) faute("Tu as pris le fil sans avoir vérifié l'absence de tension au VAT (testé avant sur une source connue).");
    e.filEngage = true; temps(1); sons.clip();
    await anime(650, (t) => { engage = t; majFils(); });
    dire("Cuivre redressé et engagé à fond sous la borne L. Serre la vis maintenant.");
  } else if (!e.filSerre) dire("Le fil n'est pas serré : serre d'abord la vis de la borne L.");
  else {
    // on tire doucement : il tient
    sons.clip(); temps(0.5);
    await anime(420, (t) => { const k = Math.sin(t * Math.PI * 3) * (1 - t) * 0.0015; W.fils.position.set(0, -k, k); });
    W.fils.position.set(0, 0, 0);
    e.repare = true; temps(0.5); majFils();
    dire("Tu tires doucement sur le fil : il tient. C'est réparé.", "ok");
  }
  apres();
}
async function serrer(id) {
  const b = W.bornesMeca[id];
  const p = b.getWorldPosition(new THREE.Vector3());
  const axe = new THREE.Vector3(0, -1, 0).applyQuaternion(b.getWorldQuaternion(new THREE.Quaternion()));
  const sousTension = pot(id === "int-E" ? "IntE" : "IntS") === 230 || (id === "int-E" && e.filEngage && pot("DjL") === 230);
  await vissage(p, axe, "serrer", b.userData.tete);
  if (sousTension) return electrisation("en serrant une borne sous tension");
  if (id === "int-E" && e.filEngage && !e.filSerre) { e.filSerre = true; temps(1); majFils(); dire("Vis de la borne L serrée. Tire légèrement sur le fil pour vérifier qu'il tient.", "ok"); }
  else if (id === "int-E" && !e.filEngage) { temps(0.5); dire("Tu serres la borne à vide : le fil rouge n'est pas dedans."); }
  else { temps(0.5); dire("Tu contrôles le serrage : cette borne était déjà bien serrée."); }
  apres();
}
async function manette(cle) {
  const ap = RANGEES.flat().find((x) => x.cle === cle);
  e.app[cle] = !e.app[cle]; sons.disjoncteur(); vibrer(30); temps(0.5);
  const lev = W.manettes[cle], de = e.app[cle] ? -0.009 : 0.009, vers = -de;
  await anime(160, (t) => { lev.position.y = de + (vers - de) * t; });
  if (!e.app[cle] && (cle === "dj" || cle === "diff")) e.coupe = true;
  dire(`${ap.etiquette} : manette ${e.app[cle] ? "remontée (I)" : "baissée (O)"}.${!e.app[cle] && cle === "dj" ? " Les prises restent alimentées." : ""}`, e.app[cle] ? "info" : "ok");
  apres();
}
let secousse = 0;
function electrisation(ou) {
  e.accident = true; sons.zap(); vibrer([90, 40, 220]);
  faute(`Électrisation ${ou} : c'était sous tension. Avant de toucher un conducteur, on coupe le disjoncteur et on vérifie l'absence de tension au VAT, là où on travaille.`);
  dire("⚡ Décharge ! C'était sous tension. Sur un vrai chantier, c'est l'accident.", "danger");
  const f = racine.querySelector(".j-flash"); f.classList.remove("zap"); void f.offsetWidth; f.classList.add("zap");
  secousse = performance.now();
  majUI();
}

/* ---------- La caisse à outils : je prends l'appareil, je touche deux points ---------- */
function rangerOutil() {
  e.outil = null; e.rouge = null; e.noir = null; e.dernier = null; e.lecture = null;
  e.vatPts = [null, null]; e.vatDernier = 0; e.vatLecture = null;
  if (main.vat) main.vat.userData.maj(0);
}
function prendre(outil) {
  // retoucher l'appareil que l'on tient le range : les pointes reviennent
  if (e.outil === outil) { rangerOutil(); sons.clip(); dire(`Tu ranges ${NOMS_OUTILS[outil]} dans la caisse.`); majSondes(); majUI(); return; }
  if (outil === "tournevis") {
    rangerOutil(); e.outil = "tournevis"; sons.clip();
    dire(e.vue === "inter" ? "Tournevis en main : touche une vis ou une borne, il la visse ou la dévisse." : "Tournevis en main. Il sert à l'interrupteur : vis du mécanisme, bornes.");
    majSondes(); majUI(); return;
  }
  if (e.vue !== "inter" || !e.mecaSorti) { dire(e.vue === "inter" ? "Sors d'abord le mécanisme : les bornes sont derrière." : "Rien à mesurer ici. On mesure à l'interrupteur, mécanisme sorti."); majUI(); return; }
  rangerOutil(); e.outil = outil; main.pris = performance.now(); sons.clip();
  const nom = outil === "vat" ? "VAT en main" : "Multimètre en main, réglé sur V~";
  dire(e.aideMesure ? `${nom}. Touche deux points.` : `${nom}. Touche les deux points entre lesquels tu veux mesurer.`, "mesure");
  e.aideMesure = true;
  majSondes(); majUI();
}
// Premier point : la pointe rouge. Second point : la pointe noire. Ensuite, seule la dernière pointe posée se déplace
// (l'autre garde la référence). Toucher un point déjà occupé retire sa pointe.
function poserPointe(id) {
  sons.clip();
  if (e.outil === "vat") {
    const v = e.vatPts, occ = v.indexOf(id);
    if (occ >= 0) { v[occ] = null; e.vatLecture = null; main.vat.userData.maj(0); dire("Pointe retirée. Touche un point pour la reposer."); }
    else {
      const k = v[0] === null ? 0 : v[1] === null ? 1 : e.vatDernier;
      v[k] = id; e.vatDernier = k;
      if (v[0] !== null && v[1] !== null) lireVAT();
      else { e.vatLecture = null; main.vat.userData.maj(0); dire("Première pointe du VAT posée. Touche le second point."); }
    }
    majSondes(); return;
  }
  if (e.rouge === id || e.noir === id) {
    const qui = e.rouge === id ? "rouge" : "noir"; e[qui] = null; e.lecture = null;
    dire(`Pointe ${qui === "rouge" ? "rouge" : "noire"} retirée. Touche un point pour la reposer.`);
  } else {
    const qui = !e.rouge ? "rouge" : !e.noir ? "noir" : e.dernier;
    e[qui] = id; e.dernier = qui;
    if (e.rouge && e.noir) { mesurer(); dire(`${S.points[e.rouge].nom} ↔ ${S.points[e.noir].nom} : ${e.lecture}.`, "mesure"); }
    else { e.lecture = null; dire(`Pointe ${qui === "rouge" ? "rouge" : "noire"} posée. Touche le second point.`, "mesure"); }
  }
  majSondes();
}
function mesurer() {
  const a = e.rouge, b = e.noir;
  if (!a || !b || a === b || e.calibre === "OFF") { e.lecture = null; return; }
  const na = S.points[a].noeud, nb = S.points[b].noeud;
  if (e.calibre === "Ω") {
    if (pot(na) === 230 || pot(nb) === 230) {
      e.lecture = "Hi V"; sons.alarme(); vibrer([40, 40, 40]);
      faute("Ohmmètre posé sur des bornes sous tension : une continuité se mesure circuit coupé, jamais sous tension.");
      dire("L'appareil hurle : tension sur le calibre Ω ! On mesure Ω hors tension.", "danger");
      return;
    }
    e.lecture = M().continuite(na, nb) ? "0,2 Ω" : "OL";
  } else e.lecture = M().tension(na, nb) ? "230 V" : "0 V";
  sons.bip(); temps(0.5);
  e.mesures.push({ a, b, cal: e.calibre, lecture: e.lecture, coupe: circuitCoupe() });
  e.journal.unshift(`${S.points[a].nom} ↔ ${S.points[b].nom} : <b>${e.lecture}</b>`);
}
const SOURCE = new Set(["prise-d", "prise-g", "prise-terre"]);
function lireVAT() {
  const [a, b] = e.vatPts; temps(0.5);
  const u = a === b ? 0 : M().tension(S.points[a].noeud, S.points[b].noeud);
  e.vatLecture = u >= 50 ? u : 0; main.vat.userData.maj(e.vatLecture);
  if (u >= 50) { sons.bip(); setTimeout(() => sons.bip(), 140); vibrer([30, 60, 30]); } else sons.clip();
  const surPrise = SOURCE.has(a) && SOURCE.has(b) && (a === "prise-d" || b === "prise-d");
  const surFil = a === "fil-rouge" || b === "fil-rouge" || a === "int-E" || b === "int-E";
  e.journal.unshift(`VAT ${S.points[a].nom} ↔ ${S.points[b].nom} : <b>${u >= 50 ? "voyants allumés jusqu'à 230 V" : "aucun voyant"}</b>`);
  if (surPrise && u >= 50) {
    if (!e.vat.absence) { e.vat.avant = true; dire("Voyants allumés jusqu'à 230 V : ton VAT fonctionne.", "ok"); }
    else { e.vat.apres = true; dire("Le VAT s'allume encore sur la prise : l'absence de tension est confirmée.", "ok"); }
  } else if (surFil && u === 0) {
    if (!e.vat.avant) dire("Aucun voyant… mais VAT non testé avant sur la prise : ça ne prouve rien.");
    else if (!circuitCoupe()) dire("Aucun voyant sur ce point. Attention : le circuit n'est pas coupé au tableau.");
    else { e.vat.absence = true; dire("Aucun voyant sur le fil rouge. Reteste ton VAT sur la prise pour finir.", "ok"); }
  } else if (surFil && u >= 50) dire("Voyants allumés : le fil rouge est sous tension ! Coupe « Éclairage chambres ».", "alerte");
  else dire(u >= 50 ? "Les voyants s'allument." : "Aucun voyant ne s'allume.");
}

/* ---------- Après chaque geste ; la récompense ---------- */
function apres() { majLumiere(); majUI(); }
let lumiere = 0, lumiereCible = 0;
function majLumiere() {
  lumiereCible = lampeAllumee() ? 1 : 0;
  const reveilOn = pot("PrL") === 230;
  W.ecranReveil.visible = reveilOn; W.lueurReveil.intensity = reveilOn ? 0.06 : 0;
}
async function recompense() {
  // le joueur a lui-même allumé : il recule et regarde la chambre éclairée, puis la facture
  e.essaye = true; majUI();
  await new Promise((r) => setTimeout(r, 700));
  occupe = true;
  try {
    await allerVue("chambre", { duree: 1100 });
    // on recule jusqu'à la porte pour voir toute la chambre éclairée
    const de = new THREE.Vector3(0.22, 1.6, 1.28), vise = new THREE.Vector3(-0.55, 1.5, -1.3), dir = vise.clone().sub(de).normalize();
    let yaw = Math.atan2(-dir.x, -dir.z), dy = yaw - regard.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    await lancerTransition({ pos: camera.position.clone(), yaw: regard.yaw, pitch: regard.pitch, fov: camera.fov }, { pos: de, yaw: regard.yaw + dy, pitch: Math.asin(dir.y), fov: fovLibre }, 1300);
  } finally { occupe = false; }
  dire("La lumière est revenue dans la chambre !", "ok"); majUI();
  setTimeout(() => { e.attenteFacture = true; e.bulle = null; majUI(); }, 2600);
}
function finir() {
  e.fini = true; e.attenteFacture = false; sons.succes();
  let etoiles = 3;
  if (e.fautes.length) etoiles--;
  if (e.minutes > (S.tempsCible || 45)) etoiles--;
  if (e.humeur < 2) etoiles--;
  if (e.accident) etoiles = Math.min(etoiles, 1);
  e.etoiles = Math.max(1, etoiles);
  e.panneau = "fin"; majUI();
}
function facture() {
  const quarts = Math.max(1, Math.ceil(e.minutes / 15));
  return { deplacement: S.deplacement || 45, quarts, mo: quarts * 15, total: (S.deplacement || 45) + quarts * 15 };
}

/* =====================================================================
   Guide : la prochaine chose à faire (et l'étape du dépanneur en cours)
   ===================================================================== */
function mesure(x, refs) { return e.mesures.some((r) => r.cal === "V" && ((r.a === x && refs.includes(r.b)) || (r.b === x && refs.includes(r.a)))); }
const T = ["prise-terre"];
function H(etape, quoi, comment, vue, cible, extra = {}) { return { etape, quoi, comment, vue, cible, ...extra }; }
function indice() {
  if (!e.poses.length) return H("questionner", "Commence par écouter la cliente : pose-lui deux ou trois questions.", "Touche « 💬 Mme Martin » en bas de l'écran.", null, "[data-panneau=client]");
  if (e.repare) return remise();
  if (!e.obs) return H("observer", "Constate la panne toi-même : appuie sur l'interrupteur de la chambre.", "Entre dans la chambre, retourne-toi : l'interrupteur est à côté de la porte. Touche-le pour t'approcher, puis touche sa touche.", "inter", "touche");
  if (e.plaque) return H("mesurer", "Pour accéder aux bornes, déclipse la plaque.", "Touche l'encoche sous l'interrupteur.", "inter", "plaque");
  if (e.vis.some(Boolean) && !e.mecaSorti) return H("mesurer", "Dévisse les deux vis qui tiennent le mécanisme.", "Touche une vis : le tournevis la dévisse. Puis l'autre.", "inter", e.vis[0] ? "vis0" : "vis1");
  if (!e.mecaSorti) return H("mesurer", "Sors le mécanisme de sa boîte.", "Touche le mécanisme.", "inter", "meca");
  if (!mesure("int-E", T)) return H("mesurer", "La phase arrive-t-elle ? Mesure la borne L par rapport à la terre de la prise.", "Touche « Multimètre » dans la caisse, en bas. Touche d'abord la broche de terre de la prise (elle servira de référence), puis la borne L.", "inter", null, { mesure: ["prise-terre", "int-E"] });
  if (!mesure("fil-rouge", T)) return H("mesurer", "0 V sur la borne L. Et le fil rouge, a-t-il la phase ? Mesure-le par rapport à la terre.", "Laisse la pointe sur la broche de terre et touche le cuivre du fil rouge : l'autre pointe s'y déplace.", "inter", null, { mesure: ["prise-terre", "fil-rouge"] });
  if (!e.coupe) return H("couper", "Le fil rouge a 230 V. Avant d'y toucher, coupe « Éclairage chambres » au tableau.", "Touche « Tableau » en bas, puis la rangée du haut, puis le 2e appareil (« Écl. chambres »).", "rangee1", "manette:dj");
  if (!e.vat.avant) return H("vat", "Vérifie l'absence de tension. D'abord, teste ton VAT sur la prise (source connue).", "Touche « VAT » dans la caisse, en bas, puis les deux alvéoles de la prise.", "inter", null, { vat: ["prise-g", "prise-d"] });
  if (!e.vat.absence) return H("vat", "VAT sur le bout du fil rouge et la terre : aucun voyant ne doit s'allumer.", "VAT en main : touche la broche de terre, retire la pointe restée sur la prise en touchant son alvéole, puis touche le cuivre du fil rouge.", "inter", null, { vat: ["prise-terre", "fil-rouge"] });
  if (!e.vat.apres) return H("vat", "Reteste ton VAT sur la prise : s'il s'allume encore, ta vérification est valable.", "VAT en main : touche les deux alvéoles de la prise.", "inter", null, { vat: ["prise-g", "prise-d"] });
  if (!e.filEngage) return H("reparer", "Hors tension et vérifié : prends le fil rouge et engage son cuivre dans la borne L.", "Range le VAT (retouche-le dans la caisse), puis touche le bout du fil rouge.", "inter", "fil-rouge");
  if (!e.filSerre) return H("reparer", "Serre la vis de la borne L sur le fil.", "Touche la borne L : le tournevis vient la serrer.", "inter", "int-E");
  return H("reparer", "Tire légèrement sur le fil pour vérifier qu'il tient.", "Touche le fil rouge.", "inter", "fil-rouge");
}
function remise() {
  if (e.mecaSorti) return H("reparer", "C'est réparé. Rentre le mécanisme dans sa boîte.", "Touche le mécanisme.", "inter", "meca");
  if (!e.vis.every(Boolean)) return H("reparer", "Revisse le mécanisme.", "Touche chaque trou de vis.", "inter", e.vis[0] ? "vis1" : "vis0");
  if (!e.plaque) return H("reparer", "Reclipse la plaque.", "Touche la plaque que tu tiens, en bas de l'image.", "inter", "plaque");
  const bas = RANGEES[0].find((x) => !e.app[x.cle]);
  if (bas && e.app.inter) return H("reparer", "Avant de remettre le courant, mets l'interrupteur sur « O ».", "Touche la touche de l'interrupteur.", "inter", "touche");
  if (bas) return H("reparer", `Remets le courant : remonte la manette « ${bas.etiquette} ».`, "Touche « Tableau » en bas, puis la rangée du haut, puis la manette baissée.", "rangee1", `manette:${bas.cle}`);
  return H("essayer", "Essaie : appuie toi-même sur l'interrupteur.", "Touche « Interrupteur » en bas, puis sa touche.", "inter", "touche");
}
// ce que le guide montre maintenant : un id de la scène, ou un bouton (sélecteur CSS)
function guideCible() {
  if (e.mode !== "guide" || e.panneau || e.fini || e.essaye) return null;
  const h = indice(); if (!h) return null;
  if (h.vue && h.vue !== e.vue) {
    const t = trajet(h.vue);
    // un lieu déjà visité et loin : le raccourci en bas ; sinon, la porte ou l'objet le plus proche
    const lieu = [...t].reverse().find((v) => VUES[v].lieu && e.lieux.has(v));
    if (t.length > 1 && lieu && lieu !== t[0]) return `[data-lieu=${lieu}]`;
    const prochaine = t[0];
    if (VUES[e.vue].parent === prochaine) return "[data-action=reculer]";
    return { chambre: e.vue === "entree" ? "porte-chambre" : null, entree: "porte-entree", inter: "approcher-inter", tableau: "approcher-tableau", rangee1: "approcher-rangee1", rangee2: "approcher-rangee2", plafonnier: "plafonnier" }[prochaine];
  }
  if (h.mesure) return e.outil !== "multi" ? "[data-outil=multi]" : prochainPoint(e.rouge, e.noir, e.dernier === "noir" ? 1 : 0, h.mesure);
  if (h.vat) return e.outil !== "vat" ? "[data-outil=vat]" : prochainPoint(e.vatPts[0], e.vatPts[1], e.vatDernier, h.vat);
  // un geste à la main sur un point mesurable : il faut d'abord ranger l'appareil de mesure (ou prendre le tournevis)
  if (mesureEnMain() && S.points[h.cible]) return h.cible === "int-E" || h.cible === "int-S" ? "[data-outil=tournevis]" : `[data-outil=${e.outil}]`;
  return h.cible;
}
// le prochain point à toucher pour que les deux pointes (p0, p1) soient sur la paire voulue ; « dernier » = la pointe mobile
function prochainPoint(p0, p1, dernier, voulu) {
  const [a, b] = voulu, dans = (x) => x === a || x === b, autre = (x) => (x === a ? b : a);
  if (!p0 && !p1) return a;
  if (!p0 || !p1) { const pose = p0 || p1; return dans(pose) ? autre(pose) : pose; }
  const mobile = dernier ? p1 : p0, fixe = dernier ? p0 : p1;
  if (dans(fixe)) return mobile === autre(fixe) ? null : autre(fixe);
  if (dans(mobile)) return fixe;
  return a;
}
// en mode guidé, en arrivant dans une pièce, la tête se tourne d'elle-même vers l'objet demandé
function apresArrivee() {
  if (e.mode !== "guide" || !VUES[e.vue].libre) return;
  const g = guideCible(); const c = g && !g.startsWith("[") && W.cibles.find((x) => x.id === g && actif(x));
  if (!c) return;
  const s = ecranDe(centreCible(c)), r = renderer.domElement.getBoundingClientRect();
  const vue = e.vue;
  if (!s.devant || s.x < 30 || s.x > r.width - 30 || s.y < 30 || s.y > r.height - 30) setTimeout(() => { if (e.vue === vue && !transition && !occupe) regarderVers(centreCible(c)); }, 350);
}
// la plaque tenue en main se touche n'importe où : son repère (l'encoche) ne vaut que posée au mur
const ancreDe = (c) => (c.ancre && !(c.id === "plaque" && W.plaque.parent === camera) ? c.ancre : null);
function centreCible(c) {
  if (ancreDe(c)) return c.ancre.getWorldPosition(new THREE.Vector3());
  if (c.type === "point") return c.objet.getWorldPosition(new THREE.Vector3());
  return new THREE.Box3().setFromObject(c.objet).getCenter(new THREE.Vector3());
}

/* =====================================================================
   Interface
   ===================================================================== */
const VISAGES = ["😠", "😕", "🙂", "😊"];
function questionsVisibles() { return S.dialogue.questions.filter((q) => !e.poses.includes(q.id) && (!q.apres || e.poses.includes(q.apres))); }
const reponse = (q) => q.reponse[e.panne.id] || q.reponse["*"];
function parler(t) {
  if (!sonsActives() || !("speechSynthesis" in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t.replace(/[«»]/g, "").trim()); u.lang = "fr-FR"; u.rate = 1.03; u.pitch = 1.08;
    const v = speechSynthesis.getVoices().filter((x) => x.lang && x.lang.startsWith("fr"));
    const f = v.find((x) => /amélie|amelie|audrey|marie|aurélie|julie|virginie|female|femme/i.test(x.name)) || v[0];
    if (f) u.voice = f;
    speechSynthesis.speak(u);
  } catch { /* rien */ }
}
function poserQuestion(id) {
  const q = S.dialogue.questions.find((x) => x.id === id);
  e.poses.push(id); temps(1);
  if (q.mauvaise) e.humeur = Math.max(0, e.humeur - 1);
  parler(reponse(q));
}
function panneauClient() {
  const c = S.client, restantes = S.dialogue.max - e.poses.length;
  const fil = e.poses.map((id) => { const q = S.dialogue.questions.find((x) => x.id === id); return `<p class="j-moi">${q.texte}</p><p class="j-r">${reponse(q)}</p>`; }).join("");
  const choix = restantes > 0 ? questionsVisibles().map((q) => `<button type="button" class="j-question" data-question="${q.id}">${q.texte}</button>`).join("") : `<p class="j-r">${S.dialogue.fin}</p>`;
  return `<div class="j-panneau j-client">
    <div class="j-client-tete"><span class="j-avatar" style="background:${c.teinte}" aria-hidden="true">${c.initiales}</span><div><b>${c.nom}</b><small>${c.role}</small></div><span class="j-humeur" title="Humeur de la cliente">${VISAGES[e.humeur]}</span></div>
    <div class="j-fil"><p class="j-r">« Bonsoir ! Merci d'être venu malgré la pluie. C'est la lumière de la chambre, elle ne marche plus. Je vous laisse regarder, je suis dans la cuisine. »</p>${fil}</div>
    ${restantes > 0 ? `<p class="j-petit">Encore ${restantes} question${restantes > 1 ? "s" : ""} avant que ${c.court} ne te laisse travailler.</p>` : ""}
    <div class="j-choix">${choix}</div>
    <button type="button" class="j-plein" data-action="fermer">${e.debut ? "Au travail" : "Retour au travail"}</button></div>`;
}
function panneauAide() {
  const h = indice() || H("", "Tout est en ordre.", "", null, null);
  if (e.aide.cle !== h.quoi) e.aide = { cle: h.quoi, niveau: 0 };
  const n = e.aide.niveau, ou = h.vue ? VUES[h.vue].nom : "en bas de l'écran";
  const niveaux = [`<p><b>Où ?</b> Va voir ${ou}.</p>`, `<p><b>Quoi ?</b> ${h.quoi}</p>`, `<p><b>Comment ?</b> ${h.comment}</p>`];
  return `<div class="j-panneau"><h2>Je suis perdu</h2>${niveaux.slice(0, n).join("") || "<p>Chaque indice ajoute 2 minutes au compteur.</p>"}
    ${n < 3 ? `<button type="button" class="j-question" data-action="indice">${["Où chercher ?", "Que faire ?", "Comment faire ?"][n]} (+2 min)</button>` : ""}
    <button type="button" class="j-plein" data-action="fermer">Retour au travail</button></div>`;
}
function panneauFin() {
  const f = facture();
  const conseils = e.vat.apres ? [] : ["Après une vérification d'absence de tension, on reteste toujours le VAT sur une source connue."];
  return `<div class="j-panneau j-fin"><p class="j-etoiles">${"★".repeat(e.etoiles)}${"☆".repeat(3 - e.etoiles)}</p>
    <h2>${S.merci}</h2><h3>${e.panne.titre}</h3><p>${e.panne.explication}</p>
    ${e.fautes.length ? `<div class="j-fautes"><b>Fautes de sécurité</b><ul>${e.fautes.map((x) => `<li>${x}</li>`).join("")}</ul></div>` : `<p class="j-ok">Aucune faute de sécurité.</p>`}
    ${conseils.map((c) => `<p class="j-conseil">💡 ${c}</p>`).join("")}
    <table class="j-facture"><tr><td>Déplacement</td><td>${f.deplacement} €</td></tr><tr><td>Main-d'œuvre (${f.quarts} × ¼ h)</td><td>${f.mo} €</td></tr><tr><th>Total</th><th>${f.total} €</th></tr></table>
    <p class="j-petit">Temps passé : ${Math.round(e.minutes)} min. Prototype 3D : une seule panne pour l'instant.</p>
    <button type="button" class="j-plein" data-action="rejouer">Rejouer</button>
    <a class="j-lien" href="atelier-depannage.html?i=chambre">Les autres pannes de la chambre (atelier 2D)</a></div>`;
}
function etapesFaites() {
  return { questionner: e.poses.length > 0, observer: e.obs, couper: e.coupe, vat: e.vat.avant && e.vat.absence, mesurer: e.mesures.length > 0, reparer: e.repare && e.plaque && !e.mecaSorti && RANGEES[0].every((x) => e.app[x.cle]), essayer: e.essaye };
}
function etapesHTML() {
  const fait = etapesFaites(), h = !e.essaye && e.mode === "guide" ? indice() : null;
  const enCours = h ? h.etape : (ETAPES.find(([k]) => !fait[k]) || [])[0];
  return ETAPES.map(([k, court, long]) => { const et = fait[k] && k !== enCours ? "fait" : enCours === k ? "encours" : ""; return `<li class="${et}" aria-label="${long} : ${fait[k] ? "fait" : enCours === k ? "en cours" : "à faire"}">${court}</li>`; }).join("");
}
let minuterie = null;
function objectifHTML() {
  if (e.attenteFacture) return `<span class="t-retour ok">💡 La chambre est éclairée.</span><button type="button" class="j-facture-btn" data-action="facture">Voir la facture</button>`;
  if (e.bulle) return `<span class="t-retour ${e.bulle.type}">${e.bulle.t}</span>`;
  const h = e.mode === "guide" && !e.fini && !e.essaye ? indice() : null;
  return h ? `<span>👉 ${h.quoi}</span>` : "<b>🎯 Trouve pourquoi le plafonnier de la chambre ne s'allume plus, et répare.</b>";
}
function majUI() {
  if (!e) return;
  const f = facture();
  racine.querySelector(".j-compteurs").innerHTML = `<span title="Temps passé">⏱ ${Math.round(e.minutes)} min</span><span title="Facture en cours">🧾 ${f.total} €</span>`;
  racine.querySelector(".t-etapes").innerHTML = etapesHTML();
  const o = racine.querySelector(".t-objectif"); o.innerHTML = objectifHTML();
  const h = e.mode === "guide" && !e.fini ? indice() : null; o.dataset.guide = h ? h.quoi : "";
  clearTimeout(minuterie);
  if (e.bulle) { const b = e.bulle; minuterie = setTimeout(() => { if (e.bulle === b) { e.bulle = null; majUI(); } }, b.type === "danger" ? 6500 : b.type === "alerte" ? 5000 : 3800); }
  // multimètre, VAT
  main.multi.userData.maj(e.calibre, e.lecture);
  racine.querySelectorAll("[data-outil]").forEach((b) => { const pris = e.outil === b.dataset.outil; b.classList.toggle("en-main", pris); b.setAttribute("aria-pressed", pris); });
  // la valeur mesurée, en gros, en haut de l'image (loin des points mesurés)
  const lec = racine.querySelector(".j-lecture"), deux = e.outil === "vat" ? e.vatPts[0] !== null && e.vatPts[1] !== null : !!(e.rouge && e.noir);
  lec.hidden = !mesureEnMain();
  if (e.outil === "multi") { lec.className = "j-lecture"; lec.innerHTML = `<small>Multimètre · V~</small><b>${deux ? e.lecture : "– – –"}</b>`; }
  else if (e.outil === "vat") { lec.className = `j-lecture vat${deux && e.vatLecture ? " allume" : ""}`; lec.innerHTML = `<small>VAT</small><b>${!deux ? "– – –" : e.vatLecture ? "Tension : 230 V" : "Aucun voyant"}</b>`; }
  // reculer (dit où il mène) et raccourcis de lieux
  const parent = VUES[e.vue].parent, rec = racine.querySelector("[data-action=reculer]");
  rec.disabled = !parent; rec.textContent = parent ? `↩ ${VUES[parent].court}` : "↩ Reculer";
  racine.querySelector(".j-lieux").innerHTML = ["entree", "chambre", "inter", "tableau"].filter((v) => e.lieux.has(v) && v !== e.vue && v !== parent)
    .map((v) => `<button type="button" data-lieu="${v}">${VUES[v].lieu}</button>`).join("");
  // panneaux
  const voile = racine.querySelector(".j-voile");
  const p = { client: panneauClient, aide: panneauAide, fin: panneauFin }[e.panneau];
  voile.hidden = !p; if (p) voile.innerHTML = p();
  // guide
  racine.querySelectorAll(".t-guide").forEach((x) => x.classList.remove("t-guide"));
  const g = guideCible();
  guide.cible = g && !g.startsWith("[") ? g : null;
  if (g && g.startsWith("[")) racine.querySelectorAll(g).forEach((x) => x.classList.add("t-guide"));
}

/* =====================================================================
   Cercles jaunes (à la taille de la cible, jamais deux qui se touchent) et flèche hors écran
   ===================================================================== */
const guide = { cible: null };
let poolAnneaux = [];
function dessinerAnneaux(now) {
  const couche = racine.querySelector(".j-anneaux"), r = renderer.domElement.getBoundingClientRect();
  const liste = [];
  const gc = guide.cible && !transition && W.cibles.find((c) => c.id === guide.cible && actif(c));
  const points = mesureEnMain() ? W.cibles.filter((c) => c.type === "point" && actif(c) && S.points[c.id]) : [];
  const tous = new Map();
  for (const c of points) tous.set(c.id, { c, guide: false });
  if (gc) tous.set(gc.id, { c: gc, guide: true });
  const pts = [...tous.values()].filter((x) => x.c.type === "point").map((x) => ({ ...x, s: rayonEcran(x.c) }));
  for (const x of pts) {
    if (!x.s.devant) continue;
    let rr = x.s.r;
    for (const y of pts) if (y !== x) rr = Math.min(rr, Math.hypot(y.s.x - x.s.x, y.s.y - x.s.y) / 2 - 3);
    liste.push({ x: x.s.x, y: x.s.y, w: Math.max(14, rr) * 2, h: Math.max(14, rr) * 2, rond: true, guide: x.guide, id: x.c.id });
  }
  for (const x of tous.values()) {
    if (x.c.type === "point") continue;
    if (ancreDe(x.c)) { const s = rayonEcranDe(x.c.ancre.getWorldPosition(new THREE.Vector3()), x.c.rayonAncre || 0.02); liste.push({ x: s.x, y: s.y, w: Math.max(30, s.r * 2), h: Math.max(30, s.r * 2), rond: true, guide: x.guide, id: x.c.id }); continue; }
    const b = new THREE.Box3().setFromObject(x.c.objet); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, devant = false;
    for (let k = 0; k < 8; k++) { const p = new THREE.Vector3(k & 1 ? b.max.x : b.min.x, k & 2 ? b.max.y : b.min.y, k & 4 ? b.max.z : b.min.z); const s = ecranDe(p); if (s.devant) devant = true; x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x); y1 = Math.max(y1, s.y); }
    if (devant) liste.push({ x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: Math.min(x1 - x0, r.width * 0.9), h: Math.min(y1 - y0, r.height * 0.9), rond: false, guide: x.guide, id: x.c.id });
  }
  while (poolAnneaux.length < liste.length) { const d = document.createElement("div"); d.className = "j-anneau"; couche.appendChild(d); poolAnneaux.push(d); }
  poolAnneaux.forEach((d, i) => {
    const a = liste[i]; if (!a) { d.hidden = true; return; }
    d.hidden = false; d.className = `j-anneau${a.rond ? " rond" : ""}${a.guide ? " guide" : ""}`; d.dataset.id = a.id;
    d.style.cssText = `left:${a.x - a.w / 2}px;top:${a.y - a.h / 2}px;width:${a.w}px;height:${a.h}px`;
  });
  window.__anneaux = liste;
  // flèche au bord de l'écran quand la cible demandée n'est pas visible ; la toucher tourne la tête
  const fleche = racine.querySelector(".j-fleche");
  fleche.hidden = true;
  if (gc) {
    const p = centreCible(gc), s = ecranDe(p);
    const dehors = !s.devant || s.x < 0 || s.y < 0 || s.x > r.width || s.y > r.height;
    if (dehors) {
      const v = p.clone().applyMatrix4(camera.matrixWorldInverse);
      const ang = Math.atan2(-v.y, v.x);
      const cx = r.width / 2, cy = r.height / 2, k = Math.min((cx - 34) / Math.abs(Math.cos(ang) || 1e-6), (cy - 34) / Math.abs(Math.sin(ang) || 1e-6));
      fleche.style.transform = `translate(${cx + Math.cos(ang) * k - 26}px, ${cy + Math.sin(ang) * k - 26}px) rotate(${ang}rad)`;
      fleche.hidden = false; fleche.dataset.vers = gc.id;
    }
  }
}

/* =====================================================================
   Boucle de rendu, images par seconde
   ===================================================================== */
const fps = { n: 0, t0: performance.now(), val: 60, bas: 0 };
let attente = null; // une touche faite pendant une animation est gardée et jouée juste après
function boucle(now) { requestAnimationFrame(boucle); image(now); }
function image(now) {
  pasAnims(now);
  if (transition) {
    const t = Math.min(1, (now - transition.t0) / transition.d), k = lisse(t), tr = transition;
    camera.position.lerpVectors(tr.de.pos, tr.a.pos, k);
    regard.yaw = tr.de.yaw + (tr.a.yaw - tr.de.yaw) * k;
    regard.pitch = tr.de.pitch + (tr.a.pitch - tr.de.pitch) * k;
    camera.fov = tr.de.fov + (tr.a.fov - tr.de.fov) * k; camera.updateProjectionMatrix();
    if (t >= 1) { transition = null; majSondes(); tr.res(); }
  }
  camera.rotation.set(regard.pitch, regard.yaw, 0, "YXZ");
  if (secousse && now - secousse < 500) { const a = (1 - (now - secousse) / 500) * 0.03; camera.rotation.x += (Math.random() - 0.5) * a; camera.rotation.y += (Math.random() - 0.5) * a; }
  camera.updateMatrixWorld(true);
  // la frontale suit le doigt dans les pièces ; dans une vue rapprochée, elle reste droit devant
  if (!appui || !VUES[e.vue].libre) viseeDoigt.lerp(CENTRE, VUES[e.vue].libre ? 0.02 : 0.2);
  frontaleCible.lerp(viseeDoigt, 0.15);
  W.frontale.target.position.copy(frontaleCible);
  lumiere += (lumiereCible - lumiere) * 0.06;
  W.lampe.intensity = lumiere * 11; W.ampouleMat.emissiveIntensity = lumiere * 6; W.M.abatJour.emissiveIntensity = lumiere * 0.22; W.ambiance.intensity = 0.3 + lumiere * 0.45;
  W.frontale.intensity = (VUES[e.vue].libre ? 9 : 0.45) * (1 - lumiere * 0.7);
  W.pluie.offset.y -= 0.012;
  if (sondesEnVol()) majSondes(); else majMain();
  if (attente && !occupe && !transition && !anims.length) { const a = attente; attente = null; toucherEcran(a.x, a.y); }
  renderer.render(W.scene, camera);
  dessinerAnneaux(now);
  fps.n++;
  if (now - fps.t0 >= 1000) {
    fps.val = Math.round((fps.n * 1000) / (now - fps.t0)); fps.n = 0; fps.t0 = now;
    if (DEBUG) racine.querySelector(".j-fps").textContent = `${fps.val} i/s`;
    if (document.visibilityState === "visible" && fps.val < 20) fps.bas++; else fps.bas = 0;
    if (fps.bas >= 5 && !fps.propose) { fps.propose = true; racine.querySelector(".j-lent").hidden = false; }
    window.__fps = fps.val;
  }
}
const viseeDoigt = new THREE.Vector3(0, 0, -1), frontaleCible = new THREE.Vector3(0, 0, -1), CENTRE = new THREE.Vector3(0, 0, -1);
function viser(x, y) {
  if (!VUES[e.vue].libre) return;
  const r = renderer.domElement.getBoundingClientRect();
  viseeDoigt.set(((x / r.width) * 2 - 1) * 0.55, (-(y / r.height) * 2 + 1) * 0.55, -1);
}

/* =====================================================================
   Sons d'ambiance : pluie, bourdonnement du tableau
   ===================================================================== */
const amb = {};
function demarrerAmbiance() {
  if (!sonsActives() || amb.ctx) return;
  try {
    const c = amb.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const n = c.sampleRate * 2, buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    let b0 = 0; for (let i = 0; i < n; i++) { b0 = 0.97 * b0 + 0.03 * (Math.random() * 2 - 1); d[i] = b0 * 3 + (Math.random() < 0.0006 ? (Math.random() - 0.5) * 1.5 : 0); }
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 250;
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
    amb.pluie = c.createGain(); amb.pluie.gain.value = 0;
    src.connect(hp); hp.connect(lp); lp.connect(amb.pluie); amb.pluie.connect(c.destination); src.start();
    const o = c.createOscillator(); o.type = "sine"; o.frequency.value = 100;
    const o2 = c.createOscillator(); o2.type = "triangle"; o2.frequency.value = 200;
    amb.bzz = c.createGain(); amb.bzz.gain.value = 0;
    o.connect(amb.bzz); o2.connect(amb.bzz); amb.bzz.connect(c.destination); o.start(); o2.start();
    ambianceSonore();
  } catch { /* pas de son */ }
}
function ambianceSonore() {
  if (!amb.ctx) return;
  const t = amb.ctx.currentTime, v = e.vue;
  const pluie = v === "chambre" || v === "plafonnier" ? 0.09 : v === "inter" ? 0.05 : 0.035;
  const bzz = v === "tableau" ? 0.006 : v.startsWith("rangee") ? 0.012 : 0;
  amb.pluie.gain.setTargetAtTime(pluie, t, 0.6); amb.bzz.gain.setTargetAtTime(bzz, t, 0.4);
}

/* =====================================================================
   Entrées : glisser = tourner la tête ; glisser vers le bas en vue rapprochée = reculer ; toucher = agir
   ===================================================================== */
let appui = null;
async function toucherEcran(x, y) {
  if (occupe || transition || e.panneau) { attente = { x, y }; return; }
  const id = cibleSous(x, y);
  if (!id) return;
  e.bulle = null; occupe = true;
  try { await agir(id); } finally { occupe = false; majUI(); }
}
function reculer() { const p = VUES[e.vue].parent; if (p && !occupe) { occupe = true; allerVue(p).then(() => { occupe = false; apresArrivee(); majUI(); }); } }
function brancherEntrees(canvas) {
  canvas.addEventListener("pointerdown", (ev) => {
    if (e.panneau) return;
    appui = { x: ev.clientX, y: ev.clientY, yaw: regard.yaw, pitch: regard.pitch, bouge: false };
    canvas.setPointerCapture(ev.pointerId);
    const r = canvas.getBoundingClientRect(); viser(ev.clientX - r.left, ev.clientY - r.top);
  });
  canvas.addEventListener("pointermove", (ev) => {
    if (!appui) return;
    const r = canvas.getBoundingClientRect(); viser(ev.clientX - r.left, ev.clientY - r.top);
    const dx = ev.clientX - appui.x, dy = ev.clientY - appui.y;
    if (Math.hypot(dx, dy) > 8) appui.bouge = true;
    if (!appui.bouge || transition || occupe) return;
    // un glissement sur toute la largeur = un demi-tour
    const k = (camera.fov / fovLibre);
    let yaw = appui.yaw + (dx / r.width) * Math.PI * k, pitch = appui.pitch + (dy / r.height) * (Math.PI / 2) * k;
    if (regard.base) {
      yaw = regard.base.yaw + Math.max(-0.07, Math.min(0.07, yaw - regard.base.yaw));
      pitch = regard.base.pitch + Math.max(-0.06, Math.min(0.06, pitch - regard.base.pitch));
    } else pitch = Math.max(-1.1, Math.min(1.25, pitch));
    regard.yaw = yaw; regard.pitch = pitch;
  });
  canvas.addEventListener("pointerup", (ev) => {
    if (!appui) return;
    const a = appui; appui = null;
    const dx = ev.clientX - a.x, dy = ev.clientY - a.y;
    if (a.bouge) {
      if (!VUES[e.vue].libre && dy > 70 && Math.abs(dx) < dy * 0.8) { regard.yaw = a.yaw; regard.pitch = a.pitch; reculer(); }
      return;
    }
    const r = canvas.getBoundingClientRect();
    toucherEcran(ev.clientX - r.left, ev.clientY - r.top);
  });
  canvas.addEventListener("pointercancel", () => { appui = null; });
}
function brancherBoutons() {
  racine.addEventListener("click", async (ev) => {
    const t = ev.target.closest("[data-action],[data-panneau],[data-question],[data-outil],[data-lieu],.j-fleche");
    if (!t || !e) return;
    const d = t.dataset;
    if (t.classList.contains("j-fleche")) { const c = W.cibles.find((x) => x.id === d.vers); if (c && !transition) regarderVers(centreCible(c)); return; }
    if (d.action === "fermer") { if (e.debut) { e.debut = false; dire("Mme Martin retourne en cuisine. La chambre est devant toi, le tableau à droite."); } e.panneau = null; }
    else if (d.action === "indice") { e.aide.niveau = Math.min(3, e.aide.niveau + 1); e.indicesPris++; temps(2); }
    else if (d.action === "rejouer") { rejouer(); return; }
    else if (d.action === "facture") { finir(); return; }
    else if (d.action === "reculer") { reculer(); return; }
    else if (d.lieu) { allerA(d.lieu); return; }
    else if (d.panneau) e.panneau = e.panneau === d.panneau ? null : d.panneau;
    else if (d.question) poserQuestion(d.question);
    else if (d.outil) { prendre(d.outil); return; }
    majUI();
  });
}

/* =====================================================================
   Démarrage, nouvelle partie
   ===================================================================== */
function gabarit() {
  racine.innerHTML = `
  <div class="j-haut"><div class="j-titre"><b>${S.titre}</b><span>🧭 Guidé · prototype 3D</span></div><div class="j-compteurs"></div>
    <a class="j-quitter" href="atelier-depannage.html" aria-label="Quitter et revenir à l'atelier">✕</a></div>
  <ol class="t-etapes" aria-label="Méthode du dépanneur"></ol>
  <div class="t-objectif" role="status"></div>
  <div class="j-scene"><div class="j-anneaux" aria-hidden="true"></div><button type="button" class="j-fleche" hidden aria-label="Tourner la tête vers l'objet demandé">➜</button><div class="j-flash"></div><output class="j-lecture" hidden aria-live="polite" aria-label="Valeur mesurée"></output>
    <p class="j-lent" hidden>Ton appareil a du mal à afficher la 3D. <a href="atelier-depannage.html?i=chambre">Jouer la version 2D</a></p>
    ${DEBUG ? '<output class="j-fps">…</output>' : ""}<div class="j-voile" hidden></div></div>
  <div class="j-barre">
    <div class="j-caisse" role="group" aria-label="Caisse à outils">
      <button type="button" data-outil="vat" aria-pressed="false"><svg viewBox="0 0 48 40" aria-hidden="true"><rect x="17" y="2" width="14" height="30" rx="4" fill="#e9b400" stroke="#1d2228" stroke-width="2"/><rect x="20" y="5" width="8" height="3" rx="1" fill="#ff3b2f"/><rect x="20" y="10" width="8" height="3" rx="1" fill="#6b7480"/><rect x="20" y="15" width="8" height="3" rx="1" fill="#6b7480"/><rect x="20" y="20" width="8" height="3" rx="1" fill="#6b7480"/><path d="M24 32v6" stroke="#9aa3ad" stroke-width="2.5" stroke-linecap="round"/><path d="M17 26C8 26 8 12 8 6" fill="none" stroke="#1d2228" stroke-width="2"/><rect x="5" y="2" width="6" height="12" rx="2" fill="#2f6fb8" stroke="#1d2228" stroke-width="1.5"/><path d="M8 14v5" stroke="#9aa3ad" stroke-width="2" stroke-linecap="round"/></svg><b>VAT</b></button>
      <button type="button" data-outil="multi" aria-pressed="false"><svg viewBox="0 0 48 40" aria-hidden="true"><rect x="14" y="1" width="20" height="34" rx="4" fill="#f2c230" stroke="#1d2228" stroke-width="2"/><rect x="17" y="4" width="14" height="9" rx="1.5" fill="#c8d4b4" stroke="#1d2228" stroke-width="1.2"/><circle cx="24" cy="23" r="6" fill="#2b2f34"/><path d="M24 23l3-4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M19 35c-6 4-12 0-12-8" fill="none" stroke="#c8261e" stroke-width="2.2"/><path d="M29 35c6 4 12 0 12-8" fill="none" stroke="#1b1b1b" stroke-width="2.2"/><path d="M7 27V14" stroke="#c8261e" stroke-width="3.5" stroke-linecap="round"/><path d="M41 27V14" stroke="#1b1b1b" stroke-width="3.5" stroke-linecap="round"/></svg><b>Multimètre</b></button>
      <button type="button" data-outil="tournevis" aria-pressed="false"><svg viewBox="0 0 48 40" aria-hidden="true"><g transform="rotate(-38 24 20)"><rect x="3" y="14" width="19" height="12" rx="5" fill="#e9b400" stroke="#1d2228" stroke-width="2"/><rect x="6" y="14" width="3" height="12" fill="#c8261e"/><rect x="22" y="17.5" width="20" height="5" rx="1" fill="#c9ced4" stroke="#1d2228" stroke-width="1.2"/><path d="M42 17.5l4 2.5-4 2.5z" fill="#6b7480" stroke="#1d2228" stroke-width="1"/></g></svg><b>Tournevis</b></button>
    </div>
    <div class="j-deplacer"><button type="button" class="j-reculer" data-action="reculer">↩ Reculer</button><div class="j-lieux" aria-label="Aller directement à"></div></div>
    <div class="j-boutons">
      <button type="button" data-panneau="client">💬 ${S.client.court}</button>
      <button type="button" data-panneau="aide">🆘 Je suis perdu</button>
    </div>
  </div>`;
}
function remettreScene() {
  // la scène revient comme à l'arrivée (pour « Rejouer » sans recharger la page)
  W.meca.position.set(0, 0, 0); W.meca.rotation.set(0, 0, 0); W.touche.rotation.set(0, 0, 0);
  W.vis.forEach((v, i) => { W.meca.attach(v); v.position.set(i ? 0.0295 : -0.0295, 0, 0.0038); v.rotation.set(0, 0, 0); v.scale.set(1, 1, 1); v.visible = true; });
  W.groupePlaque.attach(W.plaque); W.plaque.position.set(0, 0, 0); W.plaque.rotation.set(0, 0, 0); W.plaque.scale.set(1, 1, 1); W.plaque.visible = true;
  for (const lev of Object.values(W.manettes)) lev.position.y = 0.009;
  for (const b of Object.values(W.bornesMeca)) b.userData.tete.rotation.y = 0;
  engage = 0; lumiere = 0; main.vat.userData.maj(0); for (const s of Object.values(sondes)) { s.id = undefined; s.de = null; s.g.visible = false; s.cordon.visible = false; }
  const v = VUES.entree; camera.position.set(...v.pos); regard.yaw = v.yaw; regard.pitch = v.pitch; regard.base = null; regard.memo = {};
  camera.fov = fovLibre; camera.updateProjectionMatrix();
}
function rejouer() {
  nouvellePartie(); remettreScene(); majFils(); majLumiere(); majSondes(); ambianceSonore(); majUI();
}
function webgl2() { try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; } }
async function demarrer() {
  nouvellePartie();
  gabarit();
  const scene = racine.querySelector(".j-scene");
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.prepend(renderer.domElement);
  W = creerMonde(renderer, BASE, { rangees: RANGEES, etiquettes: ETIQ });
  camera = new THREE.PerspectiveCamera(60, 1, 0.01, 30);
  camera.rotation.order = "YXZ";
  W.scene.add(camera);
  camera.add(W.frontale); W.frontale.position.set(0.04, 0.05, 0.02);
  camera.add(W.frontale.target); W.frontale.target.position.set(0, 0, -1);
  tournevis = creerTournevis(); tournevis.visible = false; W.scene.add(tournevis);
  main.multi = creerMultimetre(); main.vat = creerVAT(); main.plateau = creerPlateau();
  for (const o of [main.multi, main.vat, main.plateau]) { o.visible = false; camera.add(o); }
  // lumière douce sur ce que l'on tient en main (le reflet de la frontale)
  const lumMain = new THREE.PointLight(0xfff1dc, 0.06, 0.11, 2); lumMain.position.set(0, -0.005, -0.02); camera.add(lumMain);
  sondes.rouge = nouvelleSonde(0xc8261e); sondes.noir = nouvelleSonde(0x1b1b1b); sondes.vat1 = nouvelleSonde(0x2f6fb8); sondes.vat2 = nouvelleSonde(0x2f6fb8);
  const taille = () => {
    const r = scene.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height);
    fovLibre = camera.aspect < 0.8 ? 66 : 55; camera.fov = e && !VUES[e.vue].libre ? FOV_PROCHE : fovLibre; camera.updateProjectionMatrix();
  };
  taille();
  addEventListener("resize", () => { taille(); if (!transition && !VUES[e.vue].libre) recadrer(); });
  remettreScene(); majFils(); filsPrise(); majLumiere();
  brancherEntrees(renderer.domElement); brancherBoutons();
  majUI();
  requestAnimationFrame(boucle);
  demarrerAmbiance();
  // pour les contrôles automatiques
  window.__atelier3d = {
    e: () => e, guide: () => guideCible(), cam: () => camera, image: () => image(performance.now()),
    cibles: () => W.cibles.filter(actif).map((c) => ({ id: c.id, type: c.type, ...(c.type === "point" ? rayonEcran(c) : {}) })),
    toucher: (id) => { const c = W.cibles.find((x) => x.id === id); return c.type === "point" ? rayonEcran(c) : ecranDe(centreCible(c)); },
    occupe: () => occupe || !!transition || anims.length > 0 || !!attente || sondesEnVol(),
    // jouer une touche sur l'image (coordonnées dans la scène), comme un doigt
    toucherEcran: (x, y) => toucherEcran(x, y),
    lecture: () => { const o = racine.querySelector(".j-lecture"); return o.hidden ? null : { texte: o.textContent, ...(({ left, top, right, bottom }) => ({ x0: left, y0: top, x1: right, y1: bottom }))(o.getBoundingClientRect()), scene: renderer.domElement.getBoundingClientRect().toJSON() }; },
    debug: () => ({ occupe, transition: !!transition, anims: anims.length, attente }),
    W: () => W, main: () => main,
    // boîtes à l'écran des objets tenus (multimètre, VAT, plaque, plateau) : ils ne doivent cacher aucune cible
    tenus: () => [main.multi, main.vat, main.plateau, W.plaque].filter((o) => o.visible && (o.parent === camera)).map((o) => {
      const b = new THREE.Box3().setFromObject(o); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let k = 0; k < 8; k++) { const s = ecranDe(new THREE.Vector3(k & 1 ? b.max.x : b.min.x, k & 2 ? b.max.y : b.min.y, k & 4 ? b.max.z : b.min.z)); x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x); y1 = Math.max(y1, s.y); }
      return { x0, y0, x1, y1 };
    }),
  };
}

// écran d'accueil : un appui pour entrer (il débloque aussi le son)
racine.innerHTML = `<div class="j-accueil">
  <p class="j-sur">Atelier dépannage · prototype 3D</p>
  <h1>La lumière de la chambre</h1>
  <p>Il est presque minuit, il pleut. Mme Martin t'appelle : la lumière de sa chambre ne marche plus. Tu arrives avec ta lampe frontale, ta sacoche, ton multimètre et ton VAT.</p>
  <ul><li>👉 <b>Glisse</b> le doigt pour tourner la tête (vers le bas, de près : tu recules).</li><li>👆 <b>Touche</b> un objet pour t'en approcher ou agir dessus.</li><li>🎧 Avec le son, c'est mieux.</li></ul>
  ${webgl2() ? `<button type="button" class="j-plein" id="entrer">Entrer chez Mme Martin</button>` : `<p class="j-alerte">Ton navigateur n'affiche pas la 3D (WebGL 2 absent).</p>`}
  <a class="j-lien" href="atelier-depannage.html?i=chambre">Jouer la version 2D</a>
</div>`;
document.getElementById("entrer")?.addEventListener("click", () => {
  racine.innerHTML = `<div class="j-accueil"><p>Chargement de la maison…</p></div>`;
  document.body.classList.add("j-plein-ecran");
  demarrer().catch((err) => { racine.innerHTML = `<div class="j-accueil"><p class="j-alerte">La 3D n'a pas pu démarrer (${err.message}).</p><a class="j-lien" href="atelier-depannage.html?i=chambre">Jouer la version 2D</a></div>`; });
});
