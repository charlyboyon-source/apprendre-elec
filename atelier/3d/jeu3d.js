// Atelier dépannage en 3D — prototype « La lumière de la chambre » (une panne, mode guidé).
// Même règle que l'atelier 2D : un seul geste, toucher pour agir. Glisser le doigt fait tourner la tête.
// Le modèle électrique est celui de l'atelier 2D (../immersif/moteur.js) : seule la façon de voir et de toucher change.
import * as THREE from "./three.module.min.js";
import { creerMonde } from "./monde.js";
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
    poses: [], humeur: 3, minutes: 0, fautes: [], conseils: [], accident: false,
    plaque: true, vis: [true, true], mecaSorti: false, obs: false, coupe: false,
    calibre: "V", rouge: null, noir: null, enMain: null, vatPts: [], vatLecture: null, vat: { avant: false, absence: false, apres: false },
    lecture: null, mesures: [], journal: [], bulle: null, vue: "entree", rappel: false,
    aide: { cle: null, niveau: 0 }, indicesPris: 0, panneau: "client", debut: true,
  };
  for (const r of RANGEES) for (const a of r) e.app[a.cle] = true;
}
const temps = (m) => { e.minutes += m; };
const dire = (t, type = "info") => { e.bulle = { t, type }; };
const faute = (t) => { if (!e.fautes.includes(t)) e.fautes.push(t); };
const lampeAllumee = () => M().alimente("DclL", "DclN");
const pot = (n) => M().potentiels().de(n);
function vibrer(m) { try { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(m); } catch { /* rien */ } }

/* =====================================================================
   Vues et caméra
   ===================================================================== */
const VUES = {
  entree: { libre: true, pos: [0, 1.62, 3.95], yaw: 0, pitch: -0.04, parent: null, nom: "l'entrée" },
  chambre: { libre: true, pos: [0.2, 1.62, 1.0], yaw: 0, pitch: -0.12, parent: "entree", nom: "la chambre" },
  plafonnier: { parent: "chambre", nom: "le plafonnier" },
  inter: { parent: "chambre", nom: "l'interrupteur" },
  tableau: { parent: "entree", nom: "le tableau" },
  rangee1: { parent: "tableau", nom: "la rangée du haut" },
  rangee2: { parent: "tableau", nom: "la rangée du bas" },
};
const tmpCam = new THREE.PerspectiveCamera();
function cadreProche(vue) {
  // position et cible de la caméra, calculées dans le repère de l'objet regardé
  let obj, p, c;
  if (vue === "inter") {
    obj = W.appareil;
    // vues rapprochées au « téléobjectif » (champ étroit) : l'objet est grand, sans déformation
    const k = largeurVue();
    if (e.mecaSorti) { const d = 0.13 / k; p = [0.022, -0.03 - d * 0.22, 0.03 + d]; c = [0.022, -0.03, 0.03]; }
    else if (!e.plaque) { const d = 0.125 / k; p = [0.012, 0, d]; c = [0.012, 0, 0]; }
    else { const d = 0.19 / k; p = [0.0355, 0, d]; c = [0.0355, 0, 0]; }
  } else if (vue === "tableau") { obj = W.tableau; const d = 0.33 / largeurVue(); p = [0, 0, 0.1 + d]; c = [0, 0, 0.1]; }
  else if (vue === "rangee1" || vue === "rangee2") { obj = W.tableau; const y = W.rangees[vue === "rangee1" ? 0 : 1].position.y; const d = 0.125 / largeurVue(); p = [0, y - 0.008, 0.165 + d]; c = [0, y, 0.165]; }
  else if (vue === "plafonnier") return orient([0.25, 1.55, 0.75], [0, 2.05, 0]);
  obj.updateMatrixWorld(true);
  return orient(obj.localToWorld(new THREE.Vector3(...p)).toArray(), obj.localToWorld(new THREE.Vector3(...c)).toArray());
}
const FOV_PROCHE = 32;
// largeur vue à 1 m avec le champ étroit (dépend de la forme de l'écran)
function largeurVue() { return 2 * Math.tan((FOV_PROCHE / 2) * RAD) * Math.min(1.25, camera.aspect); }
let fovLibre = 66;
const fovDe = (vue) => (VUES[vue].libre ? fovLibre : FOV_PROCHE);
function orient(pos, cible) {
  const d = new THREE.Vector3(...cible).sub(new THREE.Vector3(...pos)).normalize();
  return { pos, yaw: Math.atan2(-d.x, -d.z), pitch: Math.asin(d.y) };
}
const regard = { yaw: 0, pitch: 0, base: null }; // base = cadrage d'une vue rapprochée (la tête ne bouge qu'un peu autour)
function cadrageVue(vue) { const v = VUES[vue]; return v.libre ? { pos: v.pos, yaw: v.yaw, pitch: v.pitch } : cadreProche(vue); }
let transition = null;
function allerVue(vue, { garderRegard = false } = {}) {
  const avant = e.vue;
  e.vue = vue; e.rouge = null; e.noir = null; e.vatPts = []; e.lecture = null; e.vatLecture = null; e.enMain = null;
  majSondes();
  const c = cadrageVue(vue);
  if (VUES[vue].libre && garderRegard && regard.memo && regard.memo[vue]) Object.assign(c, regard.memo[vue]);
  if (VUES[avant] && VUES[avant].libre) { regard.memo = regard.memo || {}; regard.memo[avant] = { yaw: regard.yaw, pitch: regard.pitch }; }
  let dy = c.yaw - regard.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
  transition = { t0: performance.now(), d: REDUIT ? 1 : 950, de: { pos: camera.position.clone(), yaw: regard.yaw, pitch: regard.pitch, fov: camera.fov }, a: { pos: new THREE.Vector3(...c.pos), yaw: regard.yaw + dy, pitch: c.pitch, fov: fovDe(vue) } };
  regard.base = VUES[vue].libre ? null : { yaw: regard.yaw + dy, pitch: c.pitch };
  if (vue !== avant) temps(0.5);
  ambianceSonore();
}
function recadrer() { // la vue rapprochée change (le mécanisme sort) : la caméra suit en douceur
  const c = cadrageVue(e.vue);
  transition = { t0: performance.now(), d: REDUIT ? 1 : 700, de: { pos: camera.position.clone(), yaw: regard.yaw, pitch: regard.pitch, fov: camera.fov }, a: { pos: new THREE.Vector3(...c.pos), yaw: c.yaw, pitch: c.pitch, fov: fovDe(e.vue) } };
  regard.base = { yaw: c.yaw, pitch: c.pitch };
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
// le tournevis : vient sur la vis (ou la borne), tourne, repart
let tournevis = null;
function creerTournevis() {
  const g = new THREE.Group();
  const manche = W.cyl(0.011, 0.013, 0.095, new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.5 }), 16); manche.position.y = 0.13; g.add(manche);
  const bague = W.cyl(0.0135, 0.0135, 0.018, new THREE.MeshStandardMaterial({ color: 0x1d2228, roughness: 0.6 }), 16); bague.position.y = 0.075; g.add(bague);
  const tige = W.cyl(0.0028, 0.0028, 0.075, W.M.acier, 10); tige.position.y = 0.035; g.add(tige);
  const lame = W.boite(0.0055, 0.006, 0.0012, W.M.acier); lame.position.y = 0.002; g.add(lame);
  g.visible = false; W.scene.add(g); return g;
}
async function vissage(posMonde, axe, sens) {
  // axe : direction de la vis vers l'extérieur (le tournevis arrive le long de cet axe)
  sons.vis(); vibrer(25);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axe.clone().normalize());
  tournevis.quaternion.copy(q); tournevis.visible = true;
  const loin = posMonde.clone().addScaledVector(axe, 0.07);
  await anime(260, (t) => tournevis.position.lerpVectors(loin, posMonde, t));
  const q0 = q.clone();
  await anime(560, (t) => { tournevis.quaternion.copy(q0).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (sens === "devisser" ? -1 : 1) * t * 4 * Math.PI)); });
  await anime(220, (t) => tournevis.position.lerpVectors(posMonde, loin, t));
  tournevis.visible = false;
}

/* =====================================================================
   Fils dans la boîte de l'interrupteur (tubes recalculés quand le mécanisme bouge)
   ===================================================================== */
const fils = {};
function majFils() {
  const A = W.appareil;
  A.updateMatrixWorld(true);
  const versLocal = (obj) => A.worldToLocal(obj.getWorldPosition(new THREE.Vector3()));
  const bL = versLocal(W.bornesMeca["int-E"]), b1 = versLocal(W.bornesMeca["int-S"]);
  const sorti = !e.repare;
  // bout du fil rouge : sorti de sa borne (2 cm à côté) tant que la panne n'est pas réparée
  const bout = sorti ? bL.clone().add(new THREE.Vector3(-0.006, -0.02, 0.01)) : bL.clone();
  W.boutRouge.position.copy(bout);
  W.boutRouge.visible = sorti && e.mecaSorti;
  const tube = (nom, depart, arrivee, mat) => {
    const mi = depart.clone().lerp(arrivee, 0.5); mi.z = Math.max(depart.z, arrivee.z) + 0.012; mi.y -= 0.012;
    const courbe = new THREE.CatmullRomCurve3([depart, depart.clone().add(new THREE.Vector3(0, -0.006, 0.012)), mi, arrivee]);
    if (fils[nom]) { fils[nom].geometry.dispose(); W.fils.remove(fils[nom]); }
    fils[nom] = new THREE.Mesh(new THREE.TubeGeometry(courbe, 24, 0.0017, 8), mat); fils[nom].castShadow = true;
    W.fils.add(fils[nom]);
  };
  tube("rouge", new THREE.Vector3(-0.008, 0.004, -0.035), sorti ? bout.clone().add(new THREE.Vector3(0.004, -0.001, -0.002)) : bL, W.M.rouge);
  tube("orange", new THREE.Vector3(0.006, 0.006, -0.035), b1, W.M.orange);
  // le cuivre dénudé suit le fil
  W.boutRouge.children[0].rotation.z = Math.PI / 2;
}

/* =====================================================================
   Sondes (pointes du multimètre, VAT) posées dans la scène
   ===================================================================== */
const sondes = {};
function creerSonde(coul) {
  const g = new THREE.Group();
  const corps = W.cyl(0.0045, 0.0055, 0.075, new THREE.MeshStandardMaterial({ color: coul, roughness: 0.45 }), 12); corps.position.y = 0.055; g.add(corps);
  const garde = W.cyl(0.0075, 0.0075, 0.003, new THREE.MeshStandardMaterial({ color: coul, roughness: 0.45 }), 12); garde.position.y = 0.02; g.add(garde);
  const pointe = W.cyl(0.0009, 0.0016, 0.018, W.M.acier, 8); pointe.position.y = 0.009; g.add(pointe);
  g.visible = false; W.scene.add(g);
  const cordon = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: coul, roughness: 0.6 }));
  cordon.visible = false; W.scene.add(cordon);
  return { g, cordon };
}
function posePoint(id) { const c = W.cibles.find((x) => x.id === id); return c.objet.getWorldPosition(new THREE.Vector3()); }
function majSondes() {
  if (!sondes.rouge) return;
  const place = (s, idPoint, decal) => {
    if (!idPoint) { s.g.visible = false; s.cordon.visible = false; return; }
    const p = posePoint(idPoint);
    // la sonde arrive du bas de l'écran, vers la caméra
    const versCam = camera.position.clone().sub(p).normalize();
    const bas = new THREE.Vector3(0, -1, 0).applyQuaternion(camera.quaternion);
    const axe = versCam.multiplyScalar(0.8).addScaledVector(bas, 0.55).add(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(decal)).normalize();
    s.g.position.copy(p); s.g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axe); s.g.visible = true;
    const haut = p.clone().addScaledVector(axe, 0.095);
    const loin = camera.position.clone().addScaledVector(bas, 0.35).addScaledVector(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion), 0.12);
    const courbe = new THREE.CatmullRomCurve3([haut, haut.clone().addScaledVector(axe, 0.04).addScaledVector(bas, 0.02), loin]);
    s.cordon.geometry.dispose(); s.cordon.geometry = new THREE.TubeGeometry(courbe, 16, 0.0016, 6); s.cordon.visible = true;
  };
  place(sondes.rouge, e.rouge, 0.25); place(sondes.noir, e.noir, -0.25);
  place(sondes.vat1, e.vatPts[0], 0.15); place(sondes.vat2, e.vatPts[1], -0.15);
}

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
function ecranDe(p) { const r = renderer.domElement.getBoundingClientRect(); const q = p.clone().project(camera); return { x: (q.x + 1) / 2 * r.width, y: (1 - q.y) / 2 * r.height, devant: q.z < 1 }; }
function rayonEcran(c) {
  const p = c.objet.getWorldPosition(new THREE.Vector3());
  const droite = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const a = ecranDe(p), b = ecranDe(p.clone().addScaledVector(droite, c.rayon));
  return { ...a, r: Math.hypot(b.x - a.x, b.y - a.y) };
}
function cibleSous(x, y) {
  const actives = W.cibles.filter(actif);
  // d'abord les petits points (bornes, vis, alvéoles) : le plus proche du doigt
  let best = null;
  for (const c of actives.filter((k) => k.type === "point")) {
    const s = rayonEcran(c); if (!s.devant) continue;
    const d = Math.hypot(s.x - x, s.y - y);
    if (d <= Math.max(s.r, 24) && (!best || d < best.d)) best = { id: c.id, d };
  }
  if (best) return best.id;
  const r = renderer.domElement.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2((x / r.width) * 2 - 1, -(y / r.height) * 2 + 1), camera);
  const hits = ray.intersectObjects(actives.filter((k) => k.type === "surface").map((k) => k.objet), false);
  return hits.length ? hits[0].object.userData.cible : null;
}

/* =====================================================================
   Gestes
   ===================================================================== */
async function agir(id) {
  if (id === "porte-chambre") { allerVue("chambre", { garderRegard: true }); if (!e.dejaChambre) { e.dejaChambre = true; dire("Noir complet. Ta frontale suit ton doigt. L'interrupteur est derrière toi."); } return; }
  if (id === "porte-entree") { allerVue("entree", { garderRegard: true }); return; }
  if (id === "approcher-inter") { allerVue("inter"); return; }
  if (id === "approcher-tableau") { allerVue("tableau"); sons.clip(); dire("Tu ouvres le tableau : deux rangées, chacune derrière son différentiel."); return; }
  if (id === "approcher-rangee1") { allerVue("rangee1"); return; }
  if (id === "approcher-rangee2") { allerVue("rangee2"); return; }
  if (id === "plafonnier") { allerVue("plafonnier"); dire(lampeAllumee() ? "Le plafonnier éclaire." : "Le plafonnier est éteint. L'ampoule est vissée, la cliente l'a déjà changée : commence par l'interrupteur."); return; }
  if (id.startsWith("manette:")) return manette(id.slice(8));
  // une sonde en main : la touche suivante la pose sur le point le plus proche
  const point = S.points[id];
  if (e.enMain && point) return poserSonde(id);
  if (e.enMain && !point) { e.enMain = null; dire("Pointe reposée. Pour mesurer : une pointe en bas, puis un cercle jaune."); }
  if (id === "touche") return toucheInter();
  if (id === "plaque") return plaqueGeste();
  if (id === "vis0" || id === "vis1") return visGeste(+id[3]);
  if (id === "meca") return mecaGeste();
  if (id === "int-E" || id === "int-S") return serrer(id);
  if (id === "fil-rouge") { dire("Le fil rouge est sorti de sa borne L. Pour le mesurer, prends d'abord une pointe."); return; }
  if (point) { dire("Pour mesurer ici, prends d'abord une pointe ou le VAT (en bas)."); }
}
function toucheInter() {
  e.app.inter = !e.app.inter; e.obs = true; sons.interrupteur(); vibrer(10); temps(0.5);
  const a = -5 * RAD, b = 5 * RAD, de = e.app.inter ? b : a, vers = e.app.inter ? a : b;
  anime(140, (t) => { W.touche.rotation.x = de + (vers - de) * t; });
  apres();
  if (e.vue === "inter") dire(!e.app.inter ? "Clic. Interrupteur sur « O »." : lampeAllumee() ? "Clic… et la lumière s'allume !" : "Clic. Interrupteur sur « I »… Dans ton dos, le plafonnier reste éteint.", e.app.inter && lampeAllumee() ? "ok" : "info");
}
async function plaqueGeste() {
  const P = W.plaque;
  if (e.plaque) {
    sons.clip(); temps(1); e.plaque = false;
    const p0 = P.position.clone();
    await anime(520, (t) => { P.position.set(p0.x + 0.02 * t, p0.y - 0.05 * t, p0.z + 0.11 * t); P.rotation.x = 20 * RAD * t; P.rotation.z = -6 * RAD * t; });
    P.visible = false; recadrer();
    dire("La plaque se déclipse. Le mécanisme est tenu par deux vis.");
  } else {
    P.visible = true; sons.clip(); temps(1); e.plaque = true; recadrer();
    const p0 = new THREE.Vector3(W.E / 2, 0, 0.0015);
    await anime(420, (t) => { const u = 1 - t; P.position.set(p0.x + 0.02 * u, p0.y - 0.05 * u, p0.z + 0.11 * u); P.rotation.x = 20 * RAD * u; P.rotation.z = -6 * RAD * u; });
    dire("Plaque reclipsée.", "ok");
  }
  apres();
}
async function visGeste(i) {
  const v = W.vis[i];
  const p = v.getWorldPosition(new THREE.Vector3());
  const axe = new THREE.Vector3(0, 0, 1).applyQuaternion(W.appareil.getWorldQuaternion(new THREE.Quaternion()));
  if (e.vis[i]) {
    e.vis[i] = false; temps(0.5);
    const z0 = v.position.z, anim = anime(800, (t) => { v.rotation.z = -t * 4 * Math.PI; v.position.z = z0 + 0.016 * t; });
    await vissage(p, axe, "devisser"); await anim;
    v.visible = false; v.position.z = z0;
    dire(e.vis.some(Boolean) ? "Une vis est sortie. Il en reste une." : "Les deux vis sont sorties : touche le mécanisme pour le tirer hors de sa boîte.", "ok");
  } else {
    v.visible = true; e.vis[i] = true; temps(0.5);
    const z0 = v.position.z; v.position.z = z0 + 0.016;
    const anim = anime(800, (t) => { v.rotation.z = t * 4 * Math.PI; v.position.z = z0 + 0.016 * (1 - t); });
    await vissage(p, axe, "serrer"); await anim;
    dire(e.vis.every(Boolean) ? "Mécanisme revissé. Tu peux reclipser la plaque." : "Une vis revissée. Il reste l'autre.", "ok");
  }
  apres();
}
async function mecaGeste() {
  const m = W.meca, sortir = !e.mecaSorti;
  e.mecaSorti = sortir; temps(1); sons.clip();
  const de = sortir ? 0 : 1;
  recadrer();
  await anime(700, (t) => { const u = de + (sortir ? t : -t); m.position.set(0, -0.024 * u, 0.05 * u); m.rotation.x = -72 * RAD * u; majFils(); });
  majFils();
  if (sortir) {
    dire("Mécanisme sorti : bornes L et 1 visibles. Le fil rouge n'est plus dans sa borne !");
    if (!e.rappel && !circuitCoupe()) { e.rappel = true; setTimeout(() => { if (!e.bulle || e.bulle.type !== "danger") { dire("Sous tension : tu ne touches que l'isolant ; seules les pointes touchent les bornes.", "alerte"); majUI(); } }, 3600); }
  } else dire("Mécanisme rentré dans sa boîte. Revisse ses deux vis.");
  apres();
}
const circuitCoupe = () => !e.app.dj || !e.app.diff;
async function serrer(id) {
  const b = W.bornesMeca[id];
  const p = b.getWorldPosition(new THREE.Vector3());
  const axe = new THREE.Vector3(0, -1, 0).applyQuaternion(b.getWorldQuaternion(new THREE.Quaternion()));
  const sousTension = id === "int-E" ? pot("DjL") === 230 || pot("IntE") === 230 : pot("IntS") === 230;
  await vissage(p, axe, "serrer");
  if (sousTension) return electrisation(id === "int-E" && !e.repare ? "en remettant le fil rouge dans sa borne" : "en serrant une borne sous tension");
  if (id === "int-E" && !e.repare) {
    e.repare = true; temps(3);
    if (!(e.vat.avant && e.vat.absence)) faute("Tu as remis le fil sans avoir vérifié l'absence de tension au VAT (testé avant sur une source connue).");
    majFils();
    dire("Fil rouge engagé à fond sous la borne L et serré. Il tient.", "ok");
  } else { temps(1); dire("Tu contrôles le serrage : cette borne était déjà bien serrée."); }
  apres();
}
async function manette(cle) {
  const ap = RANGEES.flat().find((x) => x.cle === cle);
  e.app[cle] = !e.app[cle]; sons.disjoncteur(); vibrer(30); temps(0.5);
  const lev = W.manettes[cle], de = e.app[cle] ? -0.009 : 0.009, vers = -de;
  await anime(160, (t) => { lev.position.y = de + (vers - de) * t; });
  if (!e.app[cle] && (cle === "dj" || cle === "diff")) e.coupe = true;
  dire(`${ap.etiquette} : manette ${e.app[cle] ? "remontée" : "baissée"}.${!e.app[cle] && cle === "dj" ? " Les prises restent alimentées." : ""}`, e.app[cle] ? "info" : "ok");
  apres();
}
function electrisation(ou) {
  e.accident = true; sons.zap(); vibrer([90, 40, 220]);
  faute(`Électrisation ${ou} : c'était sous tension. Avant de toucher un conducteur, on coupe le disjoncteur et on vérifie l'absence de tension au VAT, là où on travaille.`);
  dire("⚡ Décharge ! C'était sous tension. Sur un vrai chantier, c'est l'accident.", "danger");
  const f = racine.querySelector(".j-flash"); f.classList.remove("zap"); void f.offsetWidth; f.classList.add("zap");
  secousse = performance.now();
  majUI();
}
let secousse = 0;

/* ---------- Multimètre et VAT ---------- */
function prendre(outil) {
  if (!["inter"].includes(e.vue) || !e.mecaSorti) { dire(e.vue === "inter" ? "Sors d'abord le mécanisme : les bornes sont derrière." : "Rien à mesurer ici. Les points de mesure sont à l'interrupteur, une fois le mécanisme sorti."); majUI(); return; }
  if (outil === "vat") { e.enMain = e.enMain === "vat" ? null : "vat"; e.vatPts = []; e.vatLecture = null; e.rouge = null; e.noir = null; e.lecture = null; }
  else { e.enMain = e.enMain === outil ? null : outil; e.vatPts = []; e.vatLecture = null; }
  if (e.enMain) dire(e.enMain === "vat" ? "VAT en main : touche ses deux points de contact (cercles jaunes)." : `Pointe ${e.enMain === "rouge" ? "rouge" : "noire"} en main : touche le point où la poser (cercles jaunes).`, "mesure");
  majSondes(); majUI();
}
function poserSonde(id) {
  if (e.enMain === "vat") {
    e.vatPts.push(id); sons.clip(); majSondes();
    if (e.vatPts.length < 2) { dire("Touche maintenant le second point de contact du VAT."); return; }
    lireVAT(); e.enMain = null; return;
  }
  const qui = e.enMain; e[qui] = id; sons.clip();
  const autre = qui === "rouge" ? "noir" : "rouge";
  e.enMain = e[autre] ? null : autre;
  majSondes(); mesurer();
  if (!e[autre]) dire(`Pointe ${qui === "rouge" ? "rouge" : "noire"} posée. Touche le second point : la pointe ${autre === "rouge" ? "rouge" : "noire"} est en main.`, "mesure");
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
  e.vatLecture = u >= 50 ? 230 : 0;
  if (u >= 50) { sons.bip(); setTimeout(() => sons.bip(), 140); vibrer([30, 60, 30]); }
  else sons.clip();
  const surPrise = SOURCE.has(a) && SOURCE.has(b) && (a === "prise-d" || b === "prise-d");
  const surFil = a === "fil-rouge" || b === "fil-rouge" || a === "int-E" || b === "int-E";
  e.journal.unshift(`VAT ${S.points[a].nom} ↔ ${S.points[b].nom} : <b>${u >= 50 ? "voyants 230 V allumés" : "aucun voyant"}</b>`);
  if (surPrise && u >= 50) {
    if (!e.vat.absence) { e.vat.avant = true; dire("Voyant 230 V allumé : ton VAT fonctionne.", "ok"); }
    else { e.vat.apres = true; dire("Le VAT s'allume encore sur la prise : l'absence de tension est confirmée.", "ok"); }
  } else if (surFil && u === 0) {
    if (!e.vat.avant) { dire("Aucun voyant… mais VAT non testé avant sur la prise : ça ne prouve rien."); e.conseils.includes("vat") || e.conseils.push("vat"); }
    else if (!circuitCoupe()) dire("Aucun voyant sur ce point. Attention : le circuit n'est pas coupé au tableau.");
    else { e.vat.absence = true; dire("Aucun voyant sur le fil rouge. Reteste ton VAT sur la prise pour finir.", "ok"); }
  } else if (surFil && u >= 50) dire("Voyant 230 V : le fil rouge est sous tension ! Coupe « Éclairage chambres ».", "alerte");
  else dire(u >= 50 ? "Les voyants 230 V s'allument." : "Aucun voyant ne s'allume.");
  majSondes();
}

/* ---------- Après chaque geste : lumière, réveil, fin ---------- */
let finPrevue = false;
function apres() {
  majLumiere();
  if (!e.fini && !finPrevue && e.repare && lampeAllumee() && e.plaque && !e.mecaSorti && e.vis.every(Boolean) && RANGEES[0].every((x) => e.app[x.cle])) {
    finPrevue = true;
    // la lumière revient : on la regarde, depuis la chambre ou depuis l'entrée (face à la porte), sans traverser de mur
    const ou = ["inter", "plafonnier", "chambre"].includes(e.vue) ? "chambre" : "entree";
    setTimeout(() => { allerVue(ou); transition.a.yaw = 0; transition.a.pitch = ou === "chambre" ? 0.4 : 0.04; dire("La lumière revient dans la chambre !", "ok"); majUI(); }, 900);
    setTimeout(finir, 4200);
  }
  majUI();
}
let lumiere = 0, lumiereCible = 0;
function majLumiere() {
  lumiereCible = lampeAllumee() ? 1 : 0;
  const reveilOn = pot("PrL") === 230;
  W.ecranReveil.visible = reveilOn; W.lueurReveil.intensity = reveilOn ? 0.06 : 0;
}
function finir() {
  e.fini = true; sons.succes();
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
   Guide (mode guidé) : la prochaine chose à faire, selon ce qui est déjà fait
   ===================================================================== */
function mesure(x, refs) { return e.mesures.some((r) => r.cal === "V" && ((r.a === x && refs.includes(r.b)) || (r.b === x && refs.includes(r.a)))); }
const T = ["prise-terre"];
function H(quoi, comment, vue, cible, extra = {}) { return { quoi, comment, vue, cible, ...extra }; }
function indice() {
  if (!e.poses.length) return H("Commence par écouter la cliente : pose-lui deux ou trois questions.", "Touche « 💬 Mme Martin » en bas de l'écran.", null, "[data-panneau=client]");
  if (e.repare) return remise();
  if (!e.obs) return H("Constate la panne toi-même : appuie sur l'interrupteur de la chambre.", "Entre dans la chambre (touche la porte), retourne-toi en glissant le doigt : l'interrupteur est à côté de la porte. Touche-le pour t'approcher, puis touche sa touche.", "inter", "touche");
  if (e.plaque) return H("Pour accéder aux bornes, déclipse la plaque.", "Touche le bord de la plaque.", "inter", "plaque");
  if (e.vis.some(Boolean) && !e.mecaSorti) return H("Dévisse les deux vis qui tiennent le mécanisme.", "Touche une vis : le tournevis la dévisse. Puis l'autre.", "inter", e.vis[0] ? "vis0" : "vis1");
  if (!e.mecaSorti) return H("Sors le mécanisme de sa boîte.", "Touche le mécanisme.", "inter", "meca");
  if (!mesure("int-E", T)) return H("La phase arrive-t-elle ? Mesure la borne L par rapport à la terre de la prise.", "Sélecteur sur V~. Touche la pointe rouge en bas, puis la borne L ; la pointe noire, puis la broche de terre de la prise.", "inter", null, { mesure: ["int-E", "prise-terre"] });
  if (!mesure("fil-rouge", T)) return H("0 V sur la borne L. Et le fil rouge, a-t-il la phase ? Mesure-le par rapport à la terre.", "Pointe rouge sur le cuivre du fil rouge, pointe noire sur la broche de terre.", "inter", null, { mesure: ["fil-rouge", "prise-terre"] });
  if (!e.coupe) return H("Le fil rouge a 230 V. Avant d'y toucher, coupe « Éclairage chambres » au tableau.", "Retourne dans l'entrée, ouvre le tableau, approche-toi de la rangée du haut et touche le 2e appareil (« Écl. chambres »).", "rangee1", "manette:dj");
  if (!e.vat.avant) return H("Vérifie l'absence de tension. D'abord, teste ton VAT sur la prise (source connue).", "Touche « VAT » en bas, puis les deux alvéoles de la prise.", "inter", null, { vat: ["prise-g", "prise-d"] });
  if (!e.vat.absence) return H("VAT sur le bout du fil rouge et la terre : aucun voyant ne doit s'allumer.", "Touche « VAT », puis le cuivre du fil rouge, puis la broche de terre.", "inter", null, { vat: ["fil-rouge", "prise-terre"] });
  if (!e.vat.apres) return H("Reteste ton VAT sur la prise : s'il s'allume encore, ta vérification est valable.", "Touche « VAT », puis les deux alvéoles de la prise.", "inter", null, { vat: ["prise-g", "prise-d"] });
  return H("Hors tension et vérifié : remets le fil rouge dans la borne L et serre.", "Touche la borne L : le tournevis vient la serrer.", "inter", "int-E");
}
function remise() {
  if (e.mecaSorti) return H("C'est réparé. Rentre le mécanisme dans sa boîte.", "Touche le mécanisme.", "inter", "meca");
  if (!e.vis.every(Boolean)) return H("Revisse le mécanisme.", "Touche chaque emplacement de vis.", "inter", e.vis[0] ? "vis1" : "vis0");
  if (!e.plaque) return H("Reclipse la plaque.", "Touche la prise : la plaque revient par-dessus.", "inter", "plaque");
  const bas = RANGEES[0].find((x) => !e.app[x.cle]);
  if (bas) return H(`Remets le courant : remonte la manette « ${bas.etiquette} ».`, "Entrée → tableau → rangée du haut → touche la manette baissée.", "rangee1", `manette:${bas.cle}`);
  if (!e.app.inter) return H("Essaie : appuie sur l'interrupteur.", "Touche la touche de l'interrupteur.", "inter", "touche");
  return H("Regarde la chambre.", "", "chambre", null);
}
const LIENS = {
  entree: [["chambre", "porte-chambre"], ["tableau", "approcher-tableau"]],
  chambre: [["entree", "porte-entree"], ["inter", "approcher-inter"], ["plafonnier", "plafonnier"]],
  inter: [["chambre", "[data-action=reculer]"]], plafonnier: [["chambre", "[data-action=reculer]"]],
  tableau: [["entree", "[data-action=reculer]"], ["rangee1", "approcher-rangee1"], ["rangee2", "approcher-rangee2"]],
  rangee1: [["tableau", "[data-action=reculer]"]], rangee2: [["tableau", "[data-action=reculer]"]],
};
function chemin(vers) {
  if (!vers || vers === e.vue) return null;
  const vus = new Set([e.vue]), file = [[e.vue, null]];
  while (file.length) {
    const [v, premier] = file.shift();
    for (const [w, sel] of LIENS[v] || []) { if (vus.has(w)) continue; const p = premier || sel; if (w === vers) return p; vus.add(w); file.push([w, p]); }
  }
  return null;
}
// ce que le guide montre maintenant : un id de la scène, ou un bouton (sélecteur CSS)
function guideCible() {
  if (e.mode === "terrain" || e.panneau || e.fini || finPrevue) return null;
  const h = indice(); if (!h) return null;
  if (h.vue && h.vue !== e.vue) return chemin(h.vue);
  if (h.mesure) {
    const [a, b] = h.mesure;
    if (e.calibre !== "V") return "[data-calibre=V]";
    if (e.rouge !== a) return e.enMain === "rouge" ? a : "[data-sonde=rouge]";
    if (e.noir !== b) return e.enMain === "noir" ? b : "[data-sonde=noir]";
    return null;
  }
  if (h.vat) {
    if (e.enMain !== "vat") return "[data-sonde=vat]";
    return e.vatPts.length ? h.vat[1] : h.vat[0];
  }
  return h.cible;
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
  const h = indice() || H("Tout est en ordre.", "", null, null);
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
  return { questionner: e.poses.length > 0, observer: e.obs, couper: e.coupe, vat: e.vat.avant && e.vat.absence, mesurer: e.mesures.length > 0, reparer: e.repare, essayer: e.fini || finPrevue };
}
function etapesHTML() {
  const fait = etapesFaites(), enCours = ETAPES.find(([k]) => !fait[k]);
  return ETAPES.map(([k, court, long]) => { const et = fait[k] ? "fait" : enCours && enCours[0] === k ? "encours" : ""; return `<li class="${et}" aria-label="${long} : ${fait[k] ? "fait" : "à faire"}">${court}</li>`; }).join("");
}
let minuterie = null;
function objectifHTML() {
  if (e.bulle) return `<span class="t-retour ${e.bulle.type}">${e.bulle.t}</span>`;
  const h = e.mode === "guide" && !e.fini ? indice() : null;
  return h ? `<span>👉 ${h.quoi}</span>` : "<b>🎯 Trouve pourquoi le plafonnier de la chambre ne s'allume plus, et répare.</b>";
}
function majUI() {
  const f = facture();
  racine.querySelector(".j-compteurs").innerHTML = `<span title="Temps passé">⏱ ${Math.round(e.minutes)} min</span><span title="Facture en cours">🧾 ${f.total} €</span>`;
  racine.querySelector(".t-etapes").innerHTML = etapesHTML();
  const o = racine.querySelector(".t-objectif"); o.innerHTML = objectifHTML();
  const h = e.mode === "guide" && !e.fini ? indice() : null; o.dataset.guide = h ? h.quoi : "";
  clearTimeout(minuterie);
  if (e.bulle) { const b = e.bulle; minuterie = setTimeout(() => { if (e.bulle === b) { e.bulle = null; majUI(); } }, b.type === "danger" ? 6500 : b.type === "alerte" ? 5000 : 3800); }
  // multimètre, VAT
  racine.querySelector(".j-lcd").innerHTML = `<small>${e.calibre === "OFF" ? "arrêt" : e.calibre === "V" ? "V~" : "Ω"}</small>${e.calibre === "OFF" ? "" : e.lecture || "- - -"}`;
  racine.querySelectorAll("[data-calibre]").forEach((b) => b.classList.toggle("actif", b.dataset.calibre === e.calibre));
  racine.querySelector(".j-molette").style.setProperty("--angle", `${{ OFF: -50, V: 0, "Ω": 50 }[e.calibre]}deg`);
  racine.querySelectorAll("[data-sonde]").forEach((b) => { b.classList.toggle("en-main", e.enMain === b.dataset.sonde); b.classList.toggle("posee", b.dataset.sonde !== "vat" && !!e[b.dataset.sonde]); });
  racine.querySelector(".j-vat-leds").className = `j-vat-leds${e.vatLecture === 230 ? " allume" : ""}`;
  racine.querySelector("[data-action=reculer]").disabled = !VUES[e.vue].parent;
  // panneaux
  const voile = racine.querySelector(".j-voile");
  const p = { client: panneauClient, aide: panneauAide, fin: panneauFin }[e.panneau];
  voile.hidden = !p; voile.innerHTML = p ? p() : "";
  // guide
  racine.querySelectorAll(".t-guide").forEach((x) => x.classList.remove("t-guide"));
  const g = guideCible();
  guide.cible = g && !g.startsWith("[") ? g : null;
  if (g && g.startsWith("[")) racine.querySelectorAll(g).forEach((x) => x.classList.add("t-guide"));
}

/* =====================================================================
   Anneaux jaunes (guide et points de mesure) et flèche hors écran
   ===================================================================== */
const guide = { cible: null };
let anneaux = [];
function anneau(couleur = 0xffc400) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 40), new THREE.MeshBasicMaterial({ color: couleur, transparent: true, opacity: 0.9, depthTest: false, side: THREE.DoubleSide }));
  m.renderOrder = 10; m.visible = false; W.scene.add(m); return m;
}
function majAnneaux(now) {
  const points = e.enMain ? W.cibles.filter((c) => c.type === "point" && actif(c) && S.points[c.id]) : [];
  while (anneaux.length < points.length + 1) anneaux.push(anneau());
  anneaux.forEach((a) => { a.visible = false; });
  const poser = (a, c, guideOn) => {
    const p = c.objet.getWorldPosition(new THREE.Vector3());
    const dist = camera.position.distanceTo(p);
    let r = c.type === "point" ? c.rayon : 0;
    if (c.ancre) { c.ancre.getWorldPosition(p); r = 0.026; }
    else if (!r) { const b = new THREE.Box3().setFromObject(c.objet); r = Math.min(0.35, b.getSize(new THREE.Vector3()).length() / 2.6); b.getCenter(p); }
    const pulse = guideOn ? 1 + 0.12 * Math.sin(now / 180) : 1;
    a.position.copy(p); a.quaternion.copy(camera.quaternion); a.scale.setScalar(Math.max(r, dist * 0.028) * pulse);
    a.material.opacity = guideOn ? 0.95 : 0.55; a.visible = true;
  };
  points.forEach((c, i) => poser(anneaux[i + 1], c, false));
  const fleche = racine.querySelector(".j-fleche");
  fleche.hidden = true;
  const gc = guide.cible && W.cibles.find((c) => c.id === guide.cible && actif(c));
  if (gc && !transition) {
    poser(anneaux[0], gc, true);
    const p = anneaux[0].position, s = ecranDe(p), r = renderer.domElement.getBoundingClientRect();
    const dehors = !s.devant || s.x < 0 || s.y < 0 || s.x > r.width || s.y > r.height;
    if (dehors) {
      // flèche au bord de l'écran, dans la direction de la cible
      const v = p.clone().applyMatrix4(camera.matrixWorldInverse);
      const ang = Math.atan2(-v.y, v.x);
      const cx = r.width / 2, cy = r.height / 2, k = Math.min((cx - 34) / Math.abs(Math.cos(ang) || 1e-6), (cy - 34) / Math.abs(Math.sin(ang) || 1e-6));
      fleche.style.transform = `translate(${cx + Math.cos(ang) * k - 22}px, ${cy + Math.sin(ang) * k - 22}px) rotate(${ang}rad)`;
      fleche.hidden = false;
    }
  }
}

/* =====================================================================
   Boucle de rendu, images par seconde
   ===================================================================== */
const fps = { n: 0, t0: performance.now(), val: 60, bas: 0 };
function boucle(now) {
  requestAnimationFrame(boucle);
  pasAnims(now);
  if (transition) {
    const t = Math.min(1, (now - transition.t0) / transition.d), k = lisse(t);
    camera.position.lerpVectors(transition.de.pos, transition.a.pos, k);
    regard.yaw = transition.de.yaw + (transition.a.yaw - transition.de.yaw) * k;
    regard.pitch = transition.de.pitch + (transition.a.pitch - transition.de.pitch) * k;
    camera.fov = transition.de.fov + (transition.a.fov - transition.de.fov) * k; camera.updateProjectionMatrix();
    if (t >= 1) { transition = null; majSondes(); }
  }
  camera.rotation.set(regard.pitch, regard.yaw, 0, "YXZ");
  if (secousse && now - secousse < 500) { const a = (1 - (now - secousse) / 500) * 0.03; camera.rotation.x += (Math.random() - 0.5) * a; camera.rotation.y += (Math.random() - 0.5) * a; }
  // la frontale suit le doigt
  if (!appui) viseeDoigt.lerp(CENTRE, 0.02); // sans le doigt, la lampe revient où l'on regarde
  frontaleCible.lerp(viseeDoigt, 0.15);
  W.frontale.target.position.copy(frontaleCible);
  // la lumière du plafonnier monte doucement
  lumiere += (lumiereCible - lumiere) * 0.06;
  W.lampe.intensity = lumiere * 11; W.ampouleMat.emissiveIntensity = lumiere * 6; W.M.abatJour.emissiveIntensity = lumiere * 0.55; W.ambiance.intensity = 0.18 + lumiere * 0.5;
  W.frontale.intensity = (VUES[e.vue].libre ? 9 : 0.45) * (1 - lumiere * 0.7);
  W.pluie.offset.y -= 0.012;
  majAnneaux(now);
  renderer.render(W.scene, camera);
  // images par seconde (affichées avec ?fps) ; proposer la 2D si le téléphone ne suit pas
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
  const r = renderer.domElement.getBoundingClientRect();
  viseeDoigt.set(((x / r.width) * 2 - 1) * 0.55, (-(y / r.height) * 2 + 1) * 0.55, -1);
}

/* =====================================================================
   Sons d'ambiance : pluie, bourdonnement du tableau
   ===================================================================== */
const amb = {};
function demarrerAmbiance() {
  if (!sonsActives()) return;
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
   Entrées (glisser = tourner la tête ; toucher = agir)
   ===================================================================== */
let appui = null;
function brancherEntrees(canvas) {
  canvas.addEventListener("pointerdown", (ev) => {
    if (occupe || e.panneau) return;
    appui = { x: ev.clientX, y: ev.clientY, yaw: regard.yaw, pitch: regard.pitch, bouge: false };
    canvas.setPointerCapture(ev.pointerId);
    const r = canvas.getBoundingClientRect(); viser(ev.clientX - r.left, ev.clientY - r.top);
  });
  canvas.addEventListener("pointermove", (ev) => {
    const r = canvas.getBoundingClientRect(); viser(ev.clientX - r.left, ev.clientY - r.top);
    if (!appui) return;
    const dx = ev.clientX - appui.x, dy = ev.clientY - appui.y;
    if (Math.hypot(dx, dy) > 8) appui.bouge = true;
    if (!appui.bouge || transition) return;
    const k = 1.15 / Math.max(r.height, 300) * (camera.fov / 60) * Math.PI;
    let yaw = appui.yaw + dx * k * 0.9, pitch = appui.pitch + dy * k * 0.9;
    if (regard.base) { // vue rapprochée : la tête bouge un peu, pas plus
      yaw = regard.base.yaw + Math.max(-0.07, Math.min(0.07, yaw - regard.base.yaw));
      pitch = regard.base.pitch + Math.max(-0.06, Math.min(0.06, pitch - regard.base.pitch));
    } else pitch = Math.max(-1.1, Math.min(1.25, pitch));
    regard.yaw = yaw; regard.pitch = pitch;
  });
  const fin = async (ev) => {
    if (!appui) return;
    const a = appui; appui = null;
    if (a.bouge) { majSondes(); return; }
    if (occupe || e.panneau || transition) return;
    const r = canvas.getBoundingClientRect();
    const id = cibleSous(ev.clientX - r.left, ev.clientY - r.top);
    if (!id) { if (e.enMain) { e.enMain = null; dire("Pointe reposée."); majUI(); } return; }
    e.bulle = null; occupe = true;
    try { await agir(id); } finally { occupe = false; majUI(); }
  };
  canvas.addEventListener("pointerup", fin);
  canvas.addEventListener("pointercancel", () => { appui = null; });
}
function brancherBoutons() {
  racine.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-action],[data-panneau],[data-question],[data-calibre],[data-sonde]");
    if (!t || !e) return;
    const d = t.dataset;
    if (d.action === "fermer") { if (e.debut) { e.debut = false; dire("Mme Martin retourne en cuisine. La chambre est devant toi, le tableau à droite."); } e.panneau = null; }
    else if (d.action === "indice") { e.aide.niveau = Math.min(3, e.aide.niveau + 1); e.indicesPris++; temps(2); }
    else if (d.action === "rejouer") { location.reload(); return; }
    else if (d.action === "reculer") { if (VUES[e.vue].parent && !occupe) allerVue(VUES[e.vue].parent, { garderRegard: true }); }
    else if (d.panneau) e.panneau = e.panneau === d.panneau ? null : d.panneau;
    else if (d.question) poserQuestion(d.question);
    else if (d.calibre) { e.calibre = d.calibre; sons.clip(); mesurer(); }
    else if (d.sonde) { prendre(d.sonde); return; }
    majUI();
  });
}

/* =====================================================================
   Démarrage
   ===================================================================== */
function gabarit() {
  racine.innerHTML = `
  <div class="j-haut"><div class="j-titre"><b>${S.titre}</b><span>🧭 Guidé · prototype 3D</span></div><div class="j-compteurs"></div>
    <a class="j-quitter" href="atelier-depannage.html" aria-label="Quitter et revenir à l'atelier">✕</a></div>
  <ol class="t-etapes" aria-label="Méthode du dépanneur"></ol>
  <div class="t-objectif" role="status"></div>
  <div class="j-scene"><div class="j-fleche" hidden aria-hidden="true">➜</div><div class="j-flash"></div>
    <p class="j-lent" hidden>Ton appareil a du mal à afficher la 3D. <a href="atelier-depannage.html?i=chambre">Jouer la version 2D</a></p>
    ${DEBUG ? '<output class="j-fps">…</output>' : ""}<div class="j-voile" hidden></div></div>
  <div class="j-barre">
    <div class="j-multi" role="group" aria-label="Multimètre">
      <output class="j-lcd" aria-label="Écran du multimètre"></output>
      <div class="j-selecteur"><span class="j-molette" aria-hidden="true"></span>
        <button type="button" data-calibre="OFF">Arrêt</button><button type="button" data-calibre="V">V~</button><button type="button" data-calibre="Ω">Ω</button></div>
      <button type="button" class="j-sonde rouge" data-sonde="rouge" aria-label="Pointe rouge"><i></i></button>
      <button type="button" class="j-sonde noir" data-sonde="noir" aria-label="Pointe noire"><i></i></button>
    </div>
    <button type="button" class="j-vat" data-sonde="vat" aria-label="VAT, vérificateur d'absence de tension"><b>VAT</b><span class="j-vat-leds"><i>230</i></span></button>
    <div class="j-boutons">
      <button type="button" data-panneau="client">💬 ${S.client.court}</button>
      <button type="button" data-action="reculer">↩ Reculer</button>
      <button type="button" data-panneau="aide">🆘 Je suis perdu</button>
    </div>
  </div>`;
}
function webgl2() { try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; } }
async function demarrer() {
  nouvellePartie(); e.mode = "guide";
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
  tournevis = creerTournevis();
  sondes.rouge = creerSonde(0xc8261e); sondes.noir = creerSonde(0x1b1b1b); sondes.vat1 = creerSonde(0x3a3f45); sondes.vat2 = creerSonde(0x3a3f45);
  const v = VUES.entree; camera.position.set(...v.pos); regard.yaw = v.yaw; regard.pitch = v.pitch;
  const taille = () => {
    const r = scene.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height);
    fovLibre = camera.aspect < 0.8 ? 66 : 55; camera.fov = e && !VUES[e.vue].libre ? FOV_PROCHE : fovLibre; camera.updateProjectionMatrix();
  };
  taille(); addEventListener("resize", () => { taille(); if (transition === null && !VUES[e.vue].libre) recadrer(); });
  majFils(); majLumiere();
  brancherEntrees(renderer.domElement); brancherBoutons();
  majUI();
  requestAnimationFrame(boucle);
  demarrerAmbiance();
  // pour les contrôles automatiques
  window.__atelier3d = { e: () => e, cibles: () => W.cibles.filter(actif).map((c) => ({ id: c.id, type: c.type, ...(c.type === "point" ? rayonEcran(c) : {}) })), guide: () => guideCible(), toucher: (id) => { const c = W.cibles.find((x) => x.id === id); if (c.type === "point") { const s = rayonEcran(c); return s; } if (c.ancre) return ecranDe(c.ancre.getWorldPosition(new THREE.Vector3())); const b = new THREE.Box3().setFromObject(c.objet), p = b.getCenter(new THREE.Vector3()); return ecranDe(p); }, occupe: () => occupe || !!transition || anims.length > 0 };
}

// écran d'accueil : un appui pour entrer (il débloque aussi le son)
racine.innerHTML = `<div class="j-accueil">
  <p class="j-sur">Atelier dépannage · prototype 3D</p>
  <h1>La lumière de la chambre</h1>
  <p>Il est presque minuit, il pleut. Mme Martin t'appelle : la lumière de sa chambre ne marche plus. Tu arrives avec ta lampe frontale, ta sacoche, ton multimètre et ton VAT.</p>
  <ul><li>👉 <b>Glisse</b> le doigt pour tourner la tête.</li><li>👆 <b>Touche</b> un objet pour t'en approcher ou agir dessus.</li><li>🎧 Avec le son, c'est mieux.</li></ul>
  ${webgl2() ? `<button type="button" class="j-plein" id="entrer">Entrer chez Mme Martin</button>` : `<p class="j-alerte">Ton navigateur n'affiche pas la 3D (WebGL 2 absent).</p>`}
  <a class="j-lien" href="atelier-depannage.html?i=chambre">Jouer la version 2D</a>
</div>`;
document.getElementById("entrer")?.addEventListener("click", () => {
  racine.innerHTML = `<div class="j-accueil"><p>Chargement de la maison…</p></div>`;
  document.body.classList.add("j-plein-ecran");
  demarrer().catch((err) => { racine.innerHTML = `<div class="j-accueil"><p class="j-alerte">La 3D n'a pas pu démarrer (${err.message}).</p><a class="j-lien" href="atelier-depannage.html?i=chambre">Jouer la version 2D</a></div>`; });
});
