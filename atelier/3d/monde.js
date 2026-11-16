// Le décor 3D de la chambre et de l'entrée du niveau 1.
// L'appareillage (interrupteur, prise, tableau, bornes, conducteurs) est construit par le code, à la bonne échelle (mètres).
// Les meubles et les objets sont de vrais modèles 3D libres (Poly Haven, CC0), posés par ./niveau/decor.js comme au niveau 2 :
// voir CREDITS.md.
// Couleurs des conducteurs : rouge = phase, bleu = neutre, vert-jaune = terre, orange = retour lampe.
import * as THREE from "./three.module.min.js";
import { creerDecor } from "./niveau/decor.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const RAD = Math.PI / 180;

/* ---------- Matériaux ---------- */
function texte(lignes, { w = 256, h = 64, fond = "#f4f1ea", coul = "#1d2228", taille = 30, gras = true, align = "center" } = {}) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d");
  if (fond) { g.fillStyle = fond; g.fillRect(0, 0, w, h); }
  g.fillStyle = coul; g.textAlign = align; g.textBaseline = "middle";
  const L = [].concat(lignes);
  L.forEach((l, i) => {
    const t = typeof l === "string" ? { t: l } : l;
    g.font = `${t.gras ?? gras ? "700" : "500"} ${t.taille || taille}px system-ui, sans-serif`;
    g.fillText(t.t, align === "center" ? w / 2 : 8, (h / (L.length + 1)) * (i + 1));
  });
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
  return tx;
}
function trouTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d");
  const r = g.createRadialGradient(64, 64, 10, 64, 64, 64);
  r.addColorStop(0, "#050505"); r.addColorStop(0.72, "#1a1a1a"); r.addColorStop(0.86, "#5d5d5d"); r.addColorStop(0.93, "#8a8a8a"); r.addColorStop(1, "rgba(120,120,120,0)");
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function pluieTexture() {
  const c = document.createElement("canvas"); c.width = 128; c.height = 256;
  const g = c.getContext("2d");
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 128, y = Math.random() * 256, l = 8 + Math.random() * 22;
    g.strokeStyle = `rgba(190,208,240,${0.14 + Math.random() * 0.3})`; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - 1.5, y + l); g.stroke();
  }
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(200,215,245,${0.12 + Math.random() * 0.2})`; g.beginPath(); g.ellipse(Math.random() * 128, Math.random() * 256, 1.2, 2.2, 0, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

export function creerMonde(renderer, base = "", { rangees: RANGS = [], etiquettes: ETIQ = {} } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020306);
  scene.fog = new THREE.Fog(0x020306, 6, 14);
  const charge = new THREE.TextureLoader();
  const tex = (f, repeat, srgb = true) => {
    const t = charge.load(base + f); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return t;
  };
  const M = {
    sol: new THREE.MeshStandardMaterial({ map: tex("textures/wood_floor_diff.jpg", [3, 3]), normalMap: tex("textures/wood_floor_nor_gl.jpg", [3, 3], false), roughnessMap: tex("textures/wood_floor_rough.jpg", [3, 3], false), roughness: 1 }),
    mur: new THREE.MeshStandardMaterial({ map: tex("textures/beige_wall_001_diff.jpg", [2, 2]), normalMap: tex("textures/beige_wall_001_nor_gl.jpg", [2, 2], false), color: 0xf3ece0, roughness: 0.92 }),
    murCouloir: new THREE.MeshStandardMaterial({ map: tex("textures/beige_wall_001_diff.jpg", [2, 2]), normalMap: tex("textures/beige_wall_001_nor_gl.jpg", [2, 2], false), color: 0xdfe6ea, roughness: 0.92 }),
    plafond: new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.95 }),
    plastique: new THREE.MeshStandardMaterial({ color: 0xf7f5f0, roughness: 0.28, metalness: 0 }),
    plastiqueMat: new THREE.MeshStandardMaterial({ color: 0xe9e6df, roughness: 0.55 }),
    gris: new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.45, metalness: 0.6 }),
    acier: new THREE.MeshStandardMaterial({ color: 0xc9ccd0, roughness: 0.3, metalness: 0.9 }),
    laiton: new THREE.MeshStandardMaterial({ color: 0xc8a14a, roughness: 0.32, metalness: 0.95 }),
    cuivre: new THREE.MeshStandardMaterial({ color: 0xd2804a, roughness: 0.3, metalness: 0.95 }),
    rouge: new THREE.MeshStandardMaterial({ color: 0xc8261e, roughness: 0.45 }),
    orange: new THREE.MeshStandardMaterial({ color: 0xe8771a, roughness: 0.45 }),
    bleu: new THREE.MeshStandardMaterial({ color: 0x1f5fbf, roughness: 0.45 }),
    noir: new THREE.MeshStandardMaterial({ color: 0x151618, roughness: 0.5 }),
    bois: new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.7 }),
    boisClair: new THREE.MeshStandardMaterial({ color: 0xb08a62, roughness: 0.65 }),
    draps: new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 0.95 }),
    couette: new THREE.MeshStandardMaterial({ color: 0x4f6a8a, roughness: 0.95 }),
    tapis: new THREE.MeshStandardMaterial({ color: 0x8a3f3a, roughness: 1 }),
    abatJour: new THREE.MeshStandardMaterial({ color: 0xe8dcc4, roughness: 0.9, side: THREE.DoubleSide, emissive: 0xffb866, emissiveIntensity: 0 }),
    trou: new THREE.MeshBasicMaterial({ map: trouTexture(), transparent: true, depthWrite: false }),
    manette: new THREE.MeshStandardMaterial({ color: 0xe9ebee, roughness: 0.35 }),
    invisible: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false, visible: false }),
    blanc: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.4 }),
  };
  const ombre = (o) => { o.traverse((m) => { if (m.isMesh && m.material !== M.invisible) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
  const boite = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const cyl = (rt, rb, h, mat, seg = 24) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  // plaque arrondie (forme extrudée avec arrondi), éventuellement percée
  function rrShape(w, h, r, cx = 0, cy = 0) {
    const s = new THREE.Shape(), x = cx - w / 2, y = cy - h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  function plaqueArrondie(w, h, ep, r, trous = [], mat = M.plastique) {
    const s = rrShape(w, h, r);
    for (const t of trous) s.holes.push(rrShape(t.w, t.h, t.r || 0.004, t.x, t.y));
    const g = new THREE.ExtrudeGeometry(s, { depth: ep, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.0025, bevelSegments: 3, curveSegments: 6 });
    return new THREE.Mesh(g, mat);
  }

  const cibles = [];   // tout ce qui se touche : { id, objet, rayon (m) pour un point, type: "point" | "surface", vues }
  const cible = (id, objet, vues, opts = {}) => { objet.userData.cible = id; cibles.push({ id, objet, vues, type: opts.type || "surface", rayon: opts.rayon || 0, ancre: opts.ancre || null, rayonAncre: opts.rayonAncre || 0 }); return objet; };
  const hitSphere = (r) => new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), M.invisible);

  /* ---------- Le décor commun aux niveaux (modèles 3D libres, tissus, lampes) ---------- */
  const matD = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });
  const boiteD = (w, h, d, m) => { const x = boite(w, h, d, m); x.castShadow = true; x.receiveShadow = true; return x; };
  const cylD = (r1, r2, h, m, seg = 20) => { const x = cyl(r1, r2, h, m, seg); x.castShadow = true; return x; };
  const texD = (f, rep, srgb = true) => tex(`textures/${f}`, rep, srgb);
  const pbr = { tex: texD, m: (nom, rep, o = {}) => matD(0xffffff, { map: texD(`${nom}_diff.jpg`, rep), normalMap: texD(`${nom}_nor.jpg`, rep, false), roughnessMap: texD(`${nom}_rough.jpg`, rep, false), roughness: 1, ...o }) };
  const sources = [], temoins = [];
  const decor = creerDecor({ base: `${base}niveau/`, M, mat: matD, boite: boiteD, cyl: cylD, cible, pbr, P: null, inst: null, sources, temoins, mouillables: [], depart: "entree" });
  // pose un objet du décor : au sol (x, y, z, angle) ; « avec » = objets posés dessus, dans son repère
  const pose = (lieuId, spec, x, y, z, ry = 0) => { const g = new THREE.Group(); g.userData.decor = spec.f || spec.t; g.position.set(x, y, z); g.rotation.y = ry; scene.add(g); decor.poser(spec, lieuId, null, scene, g); return g; };

  /* ---------- La chambre : x ∈ [-1.8, 1.8], z ∈ [-1.6, 1.6], hauteur 2,50 m ---------- */
  const H = 2.5;
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.2), M.sol); sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; scene.add(sol);
  const plafond = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.2), M.plafond); plafond.rotation.x = Math.PI / 2; plafond.position.y = H; scene.add(plafond);
  function mur(w, h, mat, pos, rotY) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.copy(pos); m.rotation.y = rotY; m.receiveShadow = true; scene.add(m); return m; }
  mur(3.6, H, M.mur, V(0, H / 2, -1.6), 0);                       // mur du lit
  mur(3.2, H, M.mur, V(-1.8, H / 2, 0), Math.PI / 2);             // mur de la fenêtre
  mur(3.2, H, M.mur, V(1.8, H / 2, 0), -Math.PI / 2);             // mur de l'armoire
  // mur de la porte (z = 1.6), percé d'une ouverture x ∈ [-0.42, 0.42], hauteur 2,04
  mur(1.38, H, M.mur, V(-1.11, H / 2, 1.6), Math.PI);
  { // pan de mur à droite de la porte, percé pour les deux boîtes d'encastrement (repère local : x local = -(x monde - 1,11))
    const f = new THREE.Shape(); f.moveTo(-0.69, -H / 2); f.lineTo(0.69, -H / 2); f.lineTo(0.69, H / 2); f.lineTo(-0.69, H / 2); f.lineTo(-0.69, -H / 2);
    for (const xm of [0.66, 0.66 - 0.071]) { const t = new THREE.Path(); t.absarc(-(xm - 1.11), 1.1 - H / 2, 0.0335, 0, Math.PI * 2, true); f.holes.push(t); }
    const g = new THREE.ShapeGeometry(f, 24);
    const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, (uv.getX(k) + 0.69) / 1.38, (uv.getY(k) + H / 2) / H);
    const m = new THREE.Mesh(g, M.mur); m.position.set(1.11, H / 2, 1.6); m.rotation.y = Math.PI; m.receiveShadow = true; scene.add(m);
  }
  mur(0.84, H - 2.04, M.mur, V(0, 2.04 + (H - 2.04) / 2, 1.6), Math.PI);
  // plinthes
  for (const [w, x, z, r] of [[3.6, 0, -1.59, 0], [3.2, -1.79, 0, Math.PI / 2], [3.2, 1.79, 0, -Math.PI / 2]]) { const p = boite(w, 0.07, 0.012, M.plastiqueMat); p.position.set(x, 0.035, z); p.rotation.y = r; scene.add(p); }
  // encadrement et porte ouverte
  const chambranle = new THREE.Group();
  for (const [w, h, x, y] of [[0.06, 2.07, -0.45, 1.035], [0.06, 2.07, 0.45, 1.035], [0.96, 0.06, 0, 2.07]]) { const b = boite(w, h, 0.03, M.plastiqueMat); b.position.set(x, y, 1.585); chambranle.add(b); }
  scene.add(chambranle);
  const porte = boite(0.83, 2.02, 0.04, M.boisClair); porte.geometry.translate(0.415, 1.01, 0);
  porte.position.set(-0.42, 0, 1.56); porte.rotation.y = 100 * RAD; ombre(porte); scene.add(porte);
  const poignee = cyl(0.009, 0.009, 0.11, M.acier); poignee.rotation.z = Math.PI / 2; poignee.position.set(0.74, 1.02, 0.035); porte.add(poignee);
  // passage vers l'entrée (zone à toucher dans le cadre de la porte)
  const passage = boite(0.84, 2.0, 0.05, M.invisible); passage.position.set(0, 1.0, 1.6);
  scene.add(cible("porte-entree", passage, ["chambre"]));

  // fenêtre sur la rue, une nuit de pluie : cadre, rideaux longs, vue de nuit, et la pluie qui coule devant
  const pluie = pluieTexture(); pluie.repeat.set(2, 2);
  const fen = pose("chambre", { t: "fenetre", w: 1.0, h: 1.2, y: 1.45, vue: "nuit", rideaux: 0x9a4f3f, rideauxLongs: true }, -1.8, 1.45, -0.2, Math.PI / 2);
  const vitre = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.2), new THREE.MeshBasicMaterial({ map: pluie, transparent: true, depthWrite: false }));
  vitre.position.z = 0.016; fen.add(vitre);

  // le lit fait (couette, oreillers, coussins, plaid), le tapis
  pose("chambre", { t: "lit", w: 1.5, couette: 0x49627f, plaid: 0xc9a24a }, -0.45, 0, -0.555);
  pose("chambre", { t: "tapis", w: 2.3, d: 1.5, couleurs: ["#7a2f2a", "#e2d3ae", "#2f3f55"] }, -0.35, 0, 0.42);
  // tables de chevet : chacune sa lampe (branchée sur les prises de la chambre) ; des livres à gauche, le réveil à droite
  const HN = 0.55;
  pose("chambre", { t: "modele", f: "painted_wooden_nightstand", h: HN, avec: [{ t: "lampeChevet", id: "chevet-g", x: -0.06, y: HN, z: -0.05, c: 0x2f5a6b }, { t: "livre", x: 0.11, y: HN, z: 0.08, r: 0.3, c: 0x6b2a26 }, { t: "livre", x: 0.115, y: HN + 0.028, z: 0.085, r: 0.05, c: 0x3f5a3a }] }, -1.48, 0, -1.32);
  pose("chambre", { t: "modele", f: "painted_wooden_nightstand", h: HN, avec: [{ t: "lampeChevet", id: "chevet-d", x: 0.07, y: HN, z: -0.05, c: 0x2f5a6b }] }, 0.6, 0, -1.32);
  // réveil (branché sur une prise de la chambre : il reste allumé tant que « Prises chambres » est en service)
  const reveil = boite(0.14, 0.07, 0.07, M.noir); reveil.position.set(0.5, HN + 0.035, -1.2); reveil.rotation.y = 0.25; scene.add(reveil);
  const ecranReveil = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.045), new THREE.MeshBasicMaterial({ map: texte("23:47", { w: 128, h: 52, fond: "#120404", coul: "#ff3b2f", taille: 40 }) }));
  ecranReveil.position.set(0, 0, 0.0352); reveil.add(ecranReveil);
  // armoire, commode garnie, fauteuil avec un gilet, plante, cadres
  pose("chambre", { t: "modele", f: "GothicCabinet_01", h: 1.9, e: [0.92, 1, 0.62] }, 1.5, 0, -0.9, -Math.PI / 2);
  pose("chambre", { t: "modele", f: "GothicCommode_01", h: 0.95, avec: [
    { t: "modele", f: "mantel_clock_01", x: 0.02, y: 0.95, z: -0.03, s: 0.9 }, { t: "modele", f: "standing_picture_frame_02", x: -0.3, y: 0.95, z: 0, r: 0.35 + Math.PI, s: 0.8 },
    { t: "modele", f: "ceramic_vase_01", x: 0.34, y: 0.95, z: -0.02, s: 0.75 }, { t: "livre", x: 0.3, y: 0.95, z: 0.12, r: 1.3, c: 0x2f4a6b } ] }, 1.565, 0, 0.85, -Math.PI / 2);
  pose("chambre", { t: "modele", f: "fancy_picture_frame_02", auMur: true, s: 0.8 }, 1.795, 1.62, 0.85, -Math.PI / 2);
  pose("chambre", { t: "modele", f: "hanging_picture_frame_03", auMur: true, s: 0.95 }, -0.45, 1.98, -1.595, 0);
  pose("chambre", { t: "modele", f: "fancy_picture_frame_01", auMur: true, s: 0.62 }, -1.795, 1.6, 1.05, Math.PI / 2);
  pose("chambre", { t: "modele", f: "GreenChair_01", h: 1.0, avec: [{ t: "vetement", x: 0.02, y: 0.985, z: -0.27, r: 0.1, w: 0.46, l: 0.95, c: 0x7a3f55 }] }, -1.32, 0, 0.8, 1.9);
  pose("chambre", { t: "modele", f: "potted_plant_02", h: 0.55, sansOmbre: true }, 1.5, 0, 0.06, 2.4);

  /* ---------- Plafonnier : boîte DCL, cordon, abat-jour, ampoule ---------- */
  const plafonnier = new THREE.Group();
  const dcl = cyl(0.045, 0.045, 0.02, M.plastique); dcl.position.y = -0.01; plafonnier.add(dcl);
  const cordon = cyl(0.003, 0.003, 0.38, M.plastiqueMat, 8); cordon.position.y = -0.2; plafonnier.add(cordon);
  const abat = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.2, 0.2, 32, 1, true), M.abatJour); abat.position.y = -0.48; plafonnier.add(abat);
  const douille = cyl(0.016, 0.016, 0.05, M.plastiqueMat); douille.position.y = -0.41; plafonnier.add(douille);
  const ampouleMat = new THREE.MeshStandardMaterial({ color: 0xf6f1e6, roughness: 0.2, emissive: 0xffd49a, emissiveIntensity: 0 });
  const ampoule = new THREE.Mesh(new THREE.SphereGeometry(0.03, 20, 14), ampouleMat); ampoule.scale.y = 1.25; ampoule.position.y = -0.47; plafonnier.add(ampoule);
  plafonnier.position.set(0, H, 0); ombre(plafonnier); abat.castShadow = false; scene.add(plafonnier);
  const lampe = new THREE.PointLight(0xffd2a0, 0, 0, 2); lampe.position.set(0, H - 0.5, 0); scene.add(lampe);
  const zonePlaf = hitSphere(0.28); zonePlaf.position.set(0, H - 0.35, 0); scene.add(cible("plafonnier", zonePlaf, ["chambre"]));

  /* ---------- Interrupteur + prise sur support double, à côté de la porte (x = 0,66, h = 1,10 m) ----------
     Repère local : +x vers la droite vu de face, +y vers le haut, +z vers celui qui regarde. */
  const appareil = new THREE.Group();
  appareil.position.set(0.66, 1.1, 1.6); appareil.rotation.y = Math.PI; scene.add(appareil);
  const E = 0.071; // entraxe interrupteur → prise
  const RB = 0.0335; // rayon intérieur d'une boîte d'encastrement (Ø 67 mm), profondeur 40 mm
  const plastBoite = new THREE.MeshStandardMaterial({ color: 0x5c6670, roughness: 0.8, side: THREE.BackSide, emissive: 0x39424c, emissiveIntensity: 0.55 });
  const gaineMat = new THREE.MeshStandardMaterial({ color: 0xb9bfc6, roughness: 0.6, emissive: 0x565c62, emissiveIntensity: 0.5 });
  const pointsGaine = [];
  for (const x of [0, E]) {
    // boîte : paroi (vue de l'intérieur), fond, entrée de gaine ICTA en bas
    const paroi = new THREE.Mesh(new THREE.CylinderGeometry(RB, RB, 0.04, 40, 1, true), plastBoite);
    paroi.rotation.x = Math.PI / 2; paroi.position.set(x, 0, -0.02); appareil.add(paroi);
    const fond = new THREE.Mesh(new THREE.CircleGeometry(RB, 40), new THREE.MeshStandardMaterial({ color: 0x4a535c, roughness: 0.85, emissive: 0x2c343c, emissiveIntensity: 0.55 }));
    fond.position.set(x, 0, -0.0399); appareil.add(fond);
    const bord = new THREE.Mesh(new THREE.RingGeometry(RB, RB + 0.004, 40), new THREE.MeshStandardMaterial({ color: 0xaab1b8, roughness: 0.7 }));
    bord.position.set(x, 0, 0.0003); appareil.add(bord);
    // les deux pattes où se vissent les vis du mécanisme, à gauche et à droite de la boîte
    for (const sx of [-1, 1]) { const patte = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.03, 12), new THREE.MeshStandardMaterial({ color: 0x7d8790, roughness: 0.7, emissive: 0x39424c, emissiveIntensity: 0.4 })); patte.rotation.x = Math.PI / 2; patte.position.set(x + sx * 0.0295, 0, -0.0155); appareil.add(patte); const trouP = new THREE.Mesh(new THREE.CircleGeometry(0.0016, 10), new THREE.MeshBasicMaterial({ color: 0x0c0c0c })); trouP.position.set(x + sx * 0.0295, 0, -0.0003); appareil.add(trouP); }
    // la gaine annelée (ICTA) entre par le bas de la boîte : on en voit le bout, d'où sortent les conducteurs
    const gaine = new THREE.Group(); gaine.position.set(x - 0.006, -RB + 0.017, -0.026); appareil.add(gaine);
    for (let k = 0; k < 8; k++) { const anneau = new THREE.Mesh(new THREE.TorusGeometry(0.0078, 0.0018, 6, 18), gaineMat); anneau.rotation.x = Math.PI / 2; anneau.position.y = -k * 0.0035; gaine.add(anneau); }
    const bouche = new THREE.Mesh(new THREE.CircleGeometry(0.0062, 18), new THREE.MeshBasicMaterial({ color: 0x0c0c0c })); bouche.rotation.x = -Math.PI / 2; bouche.position.y = 0.0016; gaine.add(bouche);
    pointsGaine.push(new THREE.Vector3(x - 0.006, -RB + 0.019, -0.026));
  }
  // conducteurs (tubes recalculés par le jeu quand le mécanisme bouge)
  const fils = new THREE.Group(); appareil.add(fils);
  // mécanisme d'interrupteur : support métallique avec ses trous, corps, touche ; deux vis de fixation
  const meca = new THREE.Group(); appareil.add(meca);
  const platine = new THREE.MeshStandardMaterial({ color: 0xc3c7cc, roughness: 0.35, metalness: 0.85 });
  const support = plaqueArrondie(0.071, 0.071, 0.0012, 0.003, [{ w: 0.046, h: 0.046, x: 0, y: 0 }], platine); meca.add(support);
  for (const x of [-0.0295, 0.0295]) { // trous oblongs des vis (visibles quand la vis est enlevée)
    const trou = new THREE.Mesh(new THREE.CircleGeometry(0.0022, 14), new THREE.MeshStandardMaterial({ color: 0x33373c, roughness: 0.9 })); trou.position.set(x, 0, 0.0039); meca.add(trou);
  }
  // griffes de la platine : deux pattes d'acier repliées vers l'arrière, en haut et en bas
  for (const y of [0.031, -0.031]) { const g2 = boite(0.012, 0.0012, 0.014, M.acier); g2.position.set(0, y, -0.0075); meca.add(g2); }
  const corpsMeca = boite(0.045, 0.045, 0.026, M.plastiqueMat); corpsMeca.position.z = -0.008; meca.add(corpsMeca);
  const touche = new THREE.Group(); touche.position.z = 0.008; meca.add(touche);
  const toucheMesh = plaqueArrondie(0.043, 0.043, 0.006, 0.004, [], M.plastique); touche.add(toucheMesh);
  const repere = new THREE.Mesh(new THREE.PlaneGeometry(0.008, 0.002), new THREE.MeshBasicMaterial({ color: 0x9a9a9a })); repere.position.set(0, -0.016, 0.0095); touche.add(repere);
  // bornes sous le mécanisme (L et 1), repères gravés, visibles quand on le sort et qu'on le bascule
  const bornesMeca = {};
  const etiqBornes = new THREE.Mesh(new THREE.PlaneGeometry(0.044, 0.012), new THREE.MeshBasicMaterial({ map: texte([{ t: "L             1", taille: 56 }], { w: 256, h: 72, fond: "#e9e5db", coul: "#1d2228" }) }));
  etiqBornes.rotation.x = Math.PI / 2; etiqBornes.position.set(0, -0.02255, 0.004); meca.add(etiqBornes);
  for (const [id, x] of [["int-E", -0.012], ["int-S", 0.012]]) {
    const b = new THREE.Group(); b.position.set(x, -0.0232, -0.008); meca.add(b);
    const puitsB = cyl(0.0042, 0.0042, 0.0006, M.noir, 16); puitsB.position.y = 0.0002; b.add(puitsB);
    const teteB = new THREE.Group(); b.add(teteB);
    const tete = cyl(0.0032, 0.0032, 0.002, M.laiton, 16); tete.position.y = -0.001; teteB.add(tete);
    const fente2 = boite(0.0058, 0.0008, 0.0008, M.noir); fente2.position.y = -0.0021; fente2.rotation.y = 25 * RAD; teteB.add(fente2);
    const h = hitSphere(0.0095); b.add(h); cible(id, h, ["inter"], { type: "point", rayon: 0.0095 });
    b.userData.tete = teteB;
    bornesMeca[id] = b;
  }
  // vis de fixation à tête cruciforme, vissées dans les griffes, posées sur le support
  const vis = [], creerVis = () => {
    const v = new THREE.Group();
    const tete = cyl(0.0034, 0.0034, 0.0016, M.acier, 18); tete.rotation.x = Math.PI / 2; tete.position.z = 0.0008; v.add(tete);
    for (const r of [0, Math.PI / 2]) { const c = boite(0.0046, 0.0009, 0.0006, M.noir); c.rotation.z = r; c.position.z = 0.0017; v.add(c); }
    const tige = cyl(0.0014, 0.0014, 0.016, M.acier, 8); tige.rotation.x = Math.PI / 2; tige.position.z = -0.008; v.add(tige);
    return v;
  };
  for (const [i, x] of [[0, -0.0295], [1, 0.0295]]) {
    const v = creerVis(); v.position.set(x, 0, 0.0038); meca.add(v);
    const h = hitSphere(0.012); h.position.set(x, 0, 0.004); meca.add(h); cible(`vis${i}`, h, ["inter"], { type: "point", rayon: 0.012 });
    vis.push(v);
  }
  const zoneMeca = boite(0.046, 0.046, 0.03, M.invisible); zoneMeca.position.z = 0.004; meca.add(zoneMeca); cible("meca", zoneMeca, ["inter"]);
  const zoneTouche = boite(0.04, 0.04, 0.012, M.invisible); zoneTouche.position.z = 0.012; touche.add(zoneTouche); cible("touche", zoneTouche, ["inter"]);
  // prise 2P+T sur son support métallique : socle, deux alvéoles, broche de terre (en haut)
  const prise = new THREE.Group(); prise.position.x = E; appareil.add(prise);
  const supportP = plaqueArrondie(0.071, 0.071, 0.0012, 0.003, [{ w: 0.05, h: 0.05, x: 0, y: 0 }], platine); prise.add(supportP);
  const corpsP = cyl(0.0245, 0.0245, 0.03, M.plastiqueMat, 32); corpsP.rotation.x = Math.PI / 2; corpsP.position.z = -0.012; prise.add(corpsP);
  const socle = cyl(0.0225, 0.0235, 0.012, M.plastique, 40); socle.rotation.x = Math.PI / 2; socle.position.z = 0.002; prise.add(socle);
  const puits = cyl(0.019, 0.019, 0.004, M.plastiqueMat, 40); puits.rotation.x = Math.PI / 2; puits.position.z = 0.0065; prise.add(puits);
  for (const [id, x] of [["prise-g", -0.0095], ["prise-d", 0.0095]]) {
    const a = cyl(0.0025, 0.0025, 0.002, M.noir, 14); a.rotation.x = Math.PI / 2; a.position.set(x, -0.002, 0.0087); prise.add(a);
    const h = hitSphere(0.0115); h.position.copy(a.position); prise.add(h); cible(id, h, ["inter-ouvert"], { type: "point", rayon: 0.0115 });
  }
  const broche = cyl(0.0024, 0.0024, 0.013, M.acier, 14); broche.rotation.x = Math.PI / 2; broche.position.set(0, 0.0115, 0.0135); prise.add(broche);
  const hT = hitSphere(0.0115); hT.position.set(0, 0.0125, 0.016); prise.add(hT); cible("prise-terre", hT, ["inter-ouvert"], { type: "point", rayon: 0.0115 });
  // plaque double (deux fenêtres) avec son encoche de déclipsage sous l'interrupteur
  const plaque = plaqueArrondie(0.0705, 0.081, 0.006, 0.006, [{ w: 0.05, h: 0.05, x: 0, y: 0 }]); plaque.geometry.translate(-0.0355, 0, 0);
  { const pleine = boite(0.05, 0.05, 0.002, M.invisible); pleine.castShadow = false; pleine.position.set(-0.0355, 0, 0.003); plaque.add(pleine); } // la plaque se touche aussi par sa fenêtre (quand on la tient)
  const plaquePrise = plaqueArrondie(0.0705, 0.081, 0.006, 0.006, [{ w: 0.05, h: 0.05, x: 0, y: 0 }]); plaquePrise.position.set(E, 0, 0.0015); appareil.add(plaquePrise);
  const encoche = boite(0.012, 0.0022, 0.004, M.noir); encoche.position.set(-0.0355, -0.0405, 0.004); plaque.add(encoche);
  const groupePlaque = new THREE.Group(); groupePlaque.position.set(E / 2, 0, 0.0015); appareil.add(groupePlaque); groupePlaque.add(plaque);
  plaque.position.set(0, 0, 0);
  const repPlaque = new THREE.Object3D(); repPlaque.position.set(-0.0355, -0.04, 0.008); groupePlaque.add(repPlaque); // l'encoche
  cible("plaque", plaque, ["inter"], { ancre: repPlaque, rayonAncre: 0.009 });
  const zoneInter = boite(0.22, 0.16, 0.05, M.invisible); zoneInter.position.set(E / 2, 0, 0.02); appareil.add(zoneInter); cible("approcher-inter", zoneInter, ["chambre"]);
  // bout dénudé du fil rouge (sorti de sa borne), et l'endroit où l'on prend le fil
  const boutRouge = new THREE.Group(); appareil.add(boutRouge);
  const ame = cyl(0.0011, 0.0011, 0.009, M.cuivre, 8); boutRouge.add(ame);
  const prendreFil = new THREE.Group(); appareil.add(prendreFil);
  const hR = hitSphere(0.0095); prendreFil.add(hR); cible("fil-rouge", hR, ["inter"], { type: "point", rayon: 0.0095 });
  ombre(appareil);

  /* ---------- L'entrée : x ∈ [XG, 0.6], z ∈ [1.6, 4.6], tableau sur le mur x = 0,6 ---------- */
  const XG = -1.3, LE = 0.6 - XG, CX = (0.6 + XG) / 2;
  const solC = new THREE.Mesh(new THREE.PlaneGeometry(LE, 2.92), M.sol); solC.rotation.x = -Math.PI / 2; solC.position.set(CX, 0.001, 3.14); solC.receiveShadow = true; scene.add(solC);
  const plafC = new THREE.Mesh(new THREE.PlaneGeometry(LE, 3.0), M.plafond); plafC.rotation.x = Math.PI / 2; plafC.position.set(CX, H, 3.1); scene.add(plafC);
  mur(3.0, H, M.murCouloir, V(XG, H / 2, 3.1), Math.PI / 2);
  mur(3.0, H, M.murCouloir, V(0.6, H / 2, 3.1), -Math.PI / 2);
  mur(LE, H, M.murCouloir, V(CX, H / 2, 4.6), Math.PI);
  // le mur entre la chambre et l'entrée fait 8 cm d'épaisseur (la boîte d'encastrement est dedans)
  const EP = 0.08;
  mur(-0.42 - XG, H, M.murCouloir, V((XG - 0.42) / 2, H / 2, 1.6 + EP), 0); mur(0.18, H, M.murCouloir, V(0.51, H / 2, 1.6 + EP), 0);
  mur(0.84, H - 2.04, M.murCouloir, V(0, 2.04 + (H - 2.04) / 2, 1.6 + EP), 0);
  for (const x of [-0.42, 0.42]) mur(EP, 2.04, M.plastiqueMat, V(x, 1.02, 1.6 + EP / 2), x < 0 ? Math.PI / 2 : -Math.PI / 2);
  const linteau = new THREE.Mesh(new THREE.PlaneGeometry(0.84, EP), M.plastiqueMat); linteau.rotation.x = Math.PI / 2; linteau.position.set(0, 2.04, 1.6 + EP / 2); scene.add(linteau);
  const seuil = new THREE.Mesh(new THREE.PlaneGeometry(0.84, EP), M.sol); seuil.rotation.x = -Math.PI / 2; seuil.position.set(0, 0.001, 1.6 + EP / 2); scene.add(seuil);
  for (const [w, x, z, r] of [[3.0, XG + 0.006, 3.1, Math.PI / 2], [3.0, 0.594, 3.1, -Math.PI / 2]]) { const pl = boite(w, 0.07, 0.012, M.plastiqueMat); pl.position.set(x, 0.035, z); pl.rotation.y = r; scene.add(pl); }
  // porte de la cuisine entrouverte au bout, d'où vient une lumière chaude (tant que son éclairage est alimenté)
  const ouverture = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.0), new THREE.MeshBasicMaterial({ color: 0xffc98a })); ouverture.position.set(XG + 0.001, 1.0, 4.18); ouverture.rotation.y = Math.PI / 2; ouverture.scale.x = 0.55; scene.add(ouverture);
  for (const [w, h, y, z] of [[0.06, 2.06, 1.03, 3.93], [0.06, 2.06, 1.03, 4.43], [0.56, 0.06, 2.06, 4.18]]) { const c = boite(0.03, h, w, M.plastiqueMat); c.position.set(XG + 0.015, y, z); scene.add(c); }
  const cuisine = new THREE.PointLight(0xffb36b, 1.4, 0, 2); cuisine.position.set(XG + 0.25, 1.6, 4.18); scene.add(cuisine);
  const passageC = boite(0.84, 2.0, 0.05, M.invisible); passageC.position.set(0, 1.0, 1.62); scene.add(cible("porte-chambre", passageC, ["entree"]));

  // l'entrée habitée : console et miroir, patères avec les manteaux au-dessus d'un banc, bottes, porte d'entrée et paillasson, tapis de couloir.
  // Le mur d'en face du tableau reste libre : c'est de là qu'on le regarde.
  pose("entree", { t: "tapis", w: 0.95, d: 2.3, couleurs: ["#2f3f55", "#d9c9a3", "#7a2f2a"] }, -0.3, 0, 3.05);
  pose("entree", { t: "modele", f: "ClassicConsole_01", s: 0.62, avec: [
    { t: "cles", x: -0.3, y: 0.59, z: 0.03 }, { t: "courrier", x: -0.02, y: 0.59, z: 0.02 }, { t: "modele", f: "standing_picture_frame_01", x: 0.3, y: 0.59, z: -0.03, r: -0.3, s: 0.85 }, { t: "modele", f: "potted_plant_04", x: 0.14, y: 0.59, z: 0.03 } ] }, XG + 0.16, 0, 2.15, Math.PI / 2);
  pose("entree", { t: "modele", f: "ornate_mirror_01", auMur: true, s: 1.05 }, XG + 0.005, 1.5, 2.15, Math.PI / 2);
  pose("entree", { t: "portemanteau" }, XG + 0.005, 1.74, 3.32, Math.PI / 2);
  pose("entree", { t: "modele", f: "rubber_boots", s: 0.9, e: [0.55, 1, 1] }, XG + 0.17, 0, 3.84, Math.PI / 2 - 0.2);
  pose("entree", { t: "modele", f: "painted_wooden_bench", s: 0.72 }, 0.41, 0, 3.98, -Math.PI / 2);
  pose("entree", { t: "modele", f: "fancy_picture_frame_01", auMur: true, s: 0.62 }, 0.595, 1.6, 2.25, -Math.PI / 2);
  pose("entree", { t: "modele", f: "potted_plant_01", h: 0.85, sansOmbre: true }, 0.36, 0, 1.98, 0.8);
  pose("entree", { t: "porteEntree" }, CX, 0, 4.598, Math.PI);

  /* ---------- Tableau électrique (coffret 2 rangées) ---------- */
  // Même standard qu'au niveau 2 : goulotte de la GTL, coffret avec sa porte, manettes qui basculent, fenêtre I / O,
  // bouton test sur chaque interrupteur différentiel. Tout ce qui est dessiné s'actionne.
  const tableau = new THREE.Group(); tableau.position.set(0.6, 1.45, 3.0); tableau.rotation.y = -Math.PI / 2; scene.add(tableau);
  const goulotte = boite(0.27, H, 0.05, new THREE.MeshStandardMaterial({ color: 0xf1f0ec, roughness: 0.5 })); goulotte.position.set(0, H / 2 - 1.45, 0.025); tableau.add(goulotte);
  const jointG = boite(0.003, H, 0.002, new THREE.MeshStandardMaterial({ color: 0xb9b6ae })); jointG.position.set(0.09, H / 2 - 1.45, 0.0505); tableau.add(jointG);
  const coffret = plaqueArrondie(0.3, 0.4, 0.09, 0.012, [], M.plastique); coffret.position.z = 0.0; tableau.add(coffret);
  const fondCoffret = boite(0.27, 0.37, 0.002, M.plastiqueMat); fondCoffret.position.z = 0.0935; tableau.add(fondCoffret);
  for (const [w, h, x, y] of [[0.3, 0.012, 0, 0.194], [0.3, 0.012, 0, -0.194], [0.012, 0.4, -0.144, 0], [0.012, 0.4, 0.144, 0]]) { const b = boite(w, h, 0.1, M.plastique); b.position.set(x, y, 0.14); tableau.add(b); }
  const zoneTableau = boite(0.3, 0.4, 0.2, M.invisible); zoneTableau.position.z = 0.1; tableau.add(zoneTableau); cible("approcher-tableau", zoneTableau, ["entree"]);
  // la porte du coffret : fermée quand on est dans l'entrée, elle s'ouvre quand on s'approche
  const pivotPorte = new THREE.Group(); pivotPorte.position.set(-0.15, 0, 0.192); tableau.add(pivotPorte);
  const vitrePorte = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.004), new THREE.MeshStandardMaterial({ color: 0x39424d, transparent: true, opacity: 0.45, roughness: 0.08 })); vitrePorte.position.set(0.15, 0, 0); pivotPorte.add(vitrePorte);
  for (const [w, h, x, y] of [[0.3, 0.014, 0.15, 0.193], [0.3, 0.014, 0.15, -0.193], [0.014, 0.4, 0.007, 0], [0.014, 0.4, 0.293, 0]]) { const b = boite(w, h, 0.008, M.plastique); b.position.set(x, y, 0); pivotPorte.add(b); }
  const poigneeP = boite(0.012, 0.05, 0.012, M.gris); poigneeP.position.set(0.288, 0, 0.008); pivotPorte.add(poigneeP);
  const porteTableau = { pivot: pivotPorte, a: 0, vers: 0 };
  const io = (t, fond) => new THREE.MeshBasicMaterial({ map: texte([{ t, taille: 26 }], { w: 32, h: 32, fond, coul: "#ffffff" }) });
  const matIO = { I: io("I", "#c8261e"), O: io("O", "#2f8a3a") }, fenetresIO = {}, boutonsTest = {};
  const jaune = new THREE.MeshStandardMaterial({ color: 0xe9b400, roughness: 0.4 }), bleuManette = new THREE.MeshStandardMaterial({ color: 0x2a4fa8, roughness: 0.4 });
  const manettes = {}; const rangees = []; const MOD = 0.0178;
  function rangee(y, appareils, etiquettes) {
    const g = new THREE.Group(); g.position.set(0, y, 0.095); tableau.add(g);
    const rail = boite(0.25, 0.035, 0.008, M.acier); rail.position.z = 0.004; g.add(rail);
    const larg = appareils.reduce((s, a) => s + (a.type === "id" ? 2 : 1), 0) * MOD;
    const vue = `rangee${rangees.length + 1}`;
    let x = -larg / 2;
    appareils.forEach((a) => {
      const estId = a.type === "id", w = (estId ? 2 : 1) * MOD;
      const m = new THREE.Group(); m.position.set(x + w / 2, 0, 0.012); g.add(m);
      const corps2 = boite(w - 0.0006, 0.085, 0.045, M.plastique); corps2.position.z = 0.0225; m.add(corps2);
      const face = boite(w - 0.004, 0.045, 0.012, M.plastique); face.position.z = 0.05; m.add(face);
      const lbl = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.003, 0.018), new THREE.MeshBasicMaterial({ map: texte(estId ? [{ t: a.haut, taille: 30 }, { t: `${a.ligne2.replace("IΔn ", "")} ${a.typ}`, taille: 24 }] : [{ t: a.cal, taille: 34 }], { w: estId ? 192 : 96, h: 96, fond: "#ffffff" }) }));
      lbl.position.set(0, -0.031, 0.0451); m.add(lbl);
      // la manette bascule autour de son axe : en haut = I (fermé), en bas = O (ouvert)
      const mx = estId ? 0.006 : 0, mw = estId ? 0.013 : 0.0085;
      const levier = new THREE.Group(); levier.position.set(mx, 0.011, 0.0565); levier.rotation.x = -0.62; m.add(levier);
      const lev = boite(mw, 0.009, 0.02, estId ? bleuManette : M.noir); lev.position.z = 0.01; levier.add(lev);
      const axe = cyl(0.005, 0.005, mw + 0.002, M.gris, 10); axe.rotation.z = Math.PI / 2; levier.add(axe);
      const fen = new THREE.Mesh(new THREE.PlaneGeometry(0.0075, 0.0075), matIO.I); fen.position.set(mx, 0.011 - 0.0185, 0.0571); m.add(fen); fenetresIO[a.cle] = fen;
      const zone = boite(w - 0.001, 0.085, 0.07, M.invisible); zone.position.z = 0.035; m.add(zone); cible(`manette:${a.cle}`, zone, [vue]);
      if (estId) { // bouton test : il fait déclencher l'interrupteur différentiel
        const b = cyl(0.0042, 0.0042, 0.004, jaune, 14); b.rotation.x = Math.PI / 2; b.position.set(-0.0105, 0.014, 0.058); m.add(b); boutonsTest[a.cle] = { b, z: 0.058 };
        const lt = new THREE.Mesh(new THREE.PlaneGeometry(0.0143, 0.0063), new THREE.MeshBasicMaterial({ map: texte([{ t: "TEST", taille: 28 }], { w: 96, h: 40, fond: "#f7f5f0" }) })); lt.position.set(-0.0105, 0.0056, 0.0564); m.add(lt);
        const zt = boite(0.0143, 0.0185, 0.02, M.invisible); zt.position.set(-0.0105, 0.0115, 0.08); m.add(zt); cible(`test:${a.cle}`, zt, [vue]);
      }
      manettes[a.cle] = levier;
      x += w;
    });
    // une étiquette par appareil sur la bande : écrite gros, debout sur les modules étroits, pour être lisible au téléphone
    const et = new THREE.Mesh(new THREE.PlaneGeometry(larg, 0.036), new THREE.MeshBasicMaterial({ map: bandeEtiquettes(appareils, etiquettes) }));
    et.position.set(0, 0.064, 0.012); g.add(et);
    const zoneR = boite(0.25, 0.1, 0.08, M.invisible); zoneR.position.z = 0.04; g.add(zoneR); cible(`approcher-rangee${rangees.length + 1}`, zoneR, ["tableau"]);
    rangees.push(g);
  }
  function bandeEtiquettes(appareils, etiquettes) {
    const unites = appareils.reduce((s, a) => s + (a.type === "id" ? 2 : 1), 0), U = 128, HB = Math.round(U * 0.036 / MOD);
    const c = document.createElement("canvas"); c.width = U * unites; c.height = HB;
    const g = c.getContext("2d"); g.fillStyle = "#fbfaf6"; g.fillRect(0, 0, c.width, c.height); g.textAlign = "center"; g.textBaseline = "middle";
    // chaque étiquette tient sur deux lignes au plus (coupure à l'espace ou après le trait d'union) ; une seule taille par rangée
    const cases = appareils.map((a, i) => {
      const lw = (a.type === "id" ? 2 : 1) * U, t = etiquettes[i], mots = t.replace("-", "- ").split(" "), deux = t.length > 7 && mots.length > 1, k = Math.ceil(mots.length / 2);
      const lignes = deux ? [mots.slice(0, k).join(" "), mots.slice(k).join(" ")] : [t], debout = a.type !== "id", long = (debout ? HB : lw) - 14, travers = (debout ? lw : HB) - 10;
      return { lw, lignes, debout, taille: Math.floor(Math.min(travers / lignes.length / 1.12, long / (Math.max(...lignes.map((l) => l.length)) * 0.56))) };
    });
    const commune = Math.min(...cases.filter((k) => k.debout).map((k) => k.taille));
    let x = 0;
    for (const k of cases) {
      const taille = k.debout ? commune : Math.min(k.taille, Math.round(commune * 1.5));
      g.strokeStyle = "#b9b4a8"; g.lineWidth = 2; g.strokeRect(x, 0, k.lw, HB); g.fillStyle = "#0d1640"; g.font = `700 ${taille}px system-ui, -apple-system, "Segoe UI", sans-serif`;
      g.save(); g.translate(x + k.lw / 2, HB / 2); if (k.debout) g.rotate(-Math.PI / 2); k.lignes.forEach((l, n) => g.fillText(l, 0, (n - (k.lignes.length - 1) / 2) * taille * 1.12)); g.restore();
      x += k.lw;
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  RANGS.forEach((r, i) => rangee(i ? -0.085 : 0.085, r, r.map((a) => ETIQ[a.cle] || a.etiquette)));
  ombre(tableau);

  /* ---------- Lumières ---------- */
  // les lampes de chevet : une vraie lumière par lampe, allumée par le jeu si la lampe est sur « I » et sa prise alimentée
  scene.updateMatrixWorld(true);
  const lampesChevet = sources.map((src) => { const l = new THREE.PointLight(src.couleur, 0, src.portee, 1.6); src.obj.getWorldPosition(l.position); scene.add(l); return { id: src.id, lumiere: l, mats: src.mats, force: src.force, k: src.k }; });
  for (const t of temoins) t(null, null, "chambre", true);
  const ambiance = new THREE.HemisphereLight(0x9fb4d8, 0x1a1410, 0.18); scene.add(ambiance);
  const lune = new THREE.DirectionalLight(0x7f9cd6, 0.65); lune.position.set(-4, 2.5, -0.4); lune.target.position.set(0, 0, 0); scene.add(lune, lune.target);
  const frontale = new THREE.SpotLight(0xfff4e0, 9, 9, 26 * RAD, 0.6, 1.6);
  frontale.castShadow = true; frontale.shadow.mapSize.set(512, 512); frontale.shadow.bias = -0.0004; frontale.shadow.camera.near = 0.05;

  return {
    scene, M, cibles, appareil, meca, touche, vis, plaque, prise, fils, boutRouge, bornesMeca, tableau, rangees, manettes,
    lampe, ampouleMat, ambiance, frontale, pluie, vitrePluie: vitre, ecranReveil, E, decor, sources, lampesChevet, cuisine, ouverture, porteTableau, fenetresIO, matIO, boutonsTest, plafonnier, pointsGaine, groupePlaque, prendreFil, creerVis, texte,
    hitSphere, cyl, boite,
  };
}
