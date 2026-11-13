// Le décor 3D de la chambre et de l'entrée, entièrement construit par le code.
// L'appareillage (interrupteur, prise, tableau, bornes, conducteurs) est modélisé à la bonne échelle (mètres).
// Couleurs des conducteurs : rouge = phase, bleu = neutre, vert-jaune = terre, orange = retour lampe.
import * as THREE from "./three.module.min.js";

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
  g.fillStyle = "#0b1426"; g.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 128, y = Math.random() * 256, l = 8 + Math.random() * 22;
    g.strokeStyle = `rgba(170,190,230,${0.12 + Math.random() * 0.25})`; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - 1.5, y + l); g.stroke();
  }
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
    invisible: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
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
  const cible = (id, objet, vues, opts = {}) => { objet.userData.cible = id; cibles.push({ id, objet, vues, type: opts.type || "surface", rayon: opts.rayon || 0, ancre: opts.ancre || null }); return objet; };
  const hitSphere = (r) => new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), M.invisible);

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
  mur(1.38, H, M.mur, V(1.11, H / 2, 1.6), Math.PI);
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

  // fenêtre avec la pluie
  const pluie = pluieTexture(); pluie.repeat.set(2, 2);
  const vitre = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.2), new THREE.MeshBasicMaterial({ map: pluie, color: 0x8ea4d0 }));
  vitre.position.set(-1.795, 1.45, -0.2); vitre.rotation.y = Math.PI / 2; scene.add(vitre);
  for (const [w, h, y, z] of [[0.06, 1.3, 1.45, -0.72], [0.06, 1.3, 1.45, 0.32], [1.1, 0.06, 2.08, -0.2], [1.1, 0.07, 0.82, -0.2], [0.04, 1.2, 1.45, -0.2]]) {
    const f = boite(0.06, h, w, M.plastique); f.position.set(-1.78, y, z); scene.add(f);
  }
  for (const z of [-0.95, 0.55]) { const r = boite(0.05, 2.1, 0.32, new THREE.MeshStandardMaterial({ color: 0x6d7b8c, roughness: 1 })); r.position.set(-1.74, 1.2, z); ombre(r); scene.add(r); }

  // lit
  const lit = new THREE.Group();
  const cadre = boite(1.46, 0.28, 2.04, M.bois); cadre.position.y = 0.2; lit.add(cadre);
  const tete = boite(1.5, 0.9, 0.06, M.bois); tete.position.set(0, 0.55, -1.02); lit.add(tete);
  const matelas = boite(1.4, 0.2, 1.96, M.draps); matelas.position.y = 0.44; lit.add(matelas);
  const couette = boite(1.48, 0.08, 1.4, M.couette); couette.position.set(0, 0.56, 0.3); lit.add(couette);
  const retombee = boite(1.5, 0.36, 1.42, M.couette); retombee.position.set(0, 0.4, 0.3); retombee.scale.set(1, 1, 1); lit.add(retombee);
  for (const x of [-0.36, 0.36]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.3, 18, 10), M.draps); o.scale.set(1, 0.28, 0.55); o.position.set(x, 0.6, -0.78); lit.add(o); }
  lit.position.set(-0.45, 0, -0.56); ombre(lit); scene.add(lit);
  const tapis = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), M.tapis); tapis.rotation.x = -Math.PI / 2; tapis.position.set(-0.45, 0.004, 0.2); tapis.receiveShadow = true; scene.add(tapis);
  // tables de nuit et réveil (branché sur une prise de la chambre : il reste allumé tant que « Prises chambres » est en service)
  for (const x of [-1.45, 0.57]) { const t = boite(0.42, 0.5, 0.38, M.boisClair); t.position.set(x, 0.25, -1.36); ombre(t); scene.add(t); }
  const reveil = boite(0.14, 0.07, 0.07, M.noir); reveil.position.set(0.57, 0.535, -1.3); scene.add(reveil);
  const ecranReveil = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.045), new THREE.MeshBasicMaterial({ map: texte("23:47", { w: 128, h: 52, fond: "#120404", coul: "#ff3b2f", taille: 40 }) }));
  ecranReveil.position.set(0.57, 0.535, -1.264); scene.add(ecranReveil);
  const lueurReveil = new THREE.PointLight(0xff3020, 0.06, 1.2, 2); lueurReveil.position.set(0.57, 0.56, -1.2); scene.add(lueurReveil);
  // armoire
  const armoire = new THREE.Group();
  const corps = boite(0.6, 2.1, 1.2, M.boisClair); corps.position.y = 1.05; armoire.add(corps);
  for (const z of [-0.3, 0.3]) { const p = boite(0.01, 0.06, 0.012, M.acier); p.position.set(-0.305, 1.1, z * 0.12); armoire.add(p); }
  const fente = boite(0.004, 2.0, 0.006, M.noir); fente.position.set(-0.301, 1.05, 0); armoire.add(fente);
  armoire.position.set(1.49, 0, -0.65); ombre(armoire); scene.add(armoire);

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

  /* ---------- Interrupteur + prise sur support double, à côté de la porte (x = 0,62, h = 1,10 m) ----------
     Repère local : +x vers la droite vu de face, +y vers le haut, +z vers celui qui regarde. */
  const appareil = new THREE.Group();
  appareil.position.set(0.66, 1.1, 1.6); appareil.rotation.y = Math.PI; scene.add(appareil);
  const E = 0.071; // entraxe interrupteur → prise
  for (const x of [0, E]) { const t = new THREE.Mesh(new THREE.PlaneGeometry(0.076, 0.076), M.trou); t.position.set(x, 0, 0.0006); appareil.add(t); }
  // conducteurs dans la boîte : rouge (phase, arrivée), orange (retour lampe vers le plafonnier)
  const fils = new THREE.Group(); appareil.add(fils);
  // mécanisme d'interrupteur (support métallique + corps + touche) et ses deux vis
  const meca = new THREE.Group(); appareil.add(meca);
  const support = plaqueArrondie(0.071, 0.071, 0.0012, 0.004, [{ w: 0.046, h: 0.046, x: 0, y: 0 }], M.gris); meca.add(support);
  const corpsMeca = boite(0.045, 0.045, 0.026, M.plastiqueMat); corpsMeca.position.z = -0.008; meca.add(corpsMeca);
  const touche = new THREE.Group(); touche.position.z = 0.008; meca.add(touche);
  const toucheMesh = plaqueArrondie(0.043, 0.043, 0.006, 0.004, [], M.plastique); touche.add(toucheMesh);
  const repere = new THREE.Mesh(new THREE.PlaneGeometry(0.008, 0.002), new THREE.MeshBasicMaterial({ color: 0x9a9a9a })); repere.position.set(0, -0.016, 0.0095); touche.add(repere);
  // bornes sous le mécanisme (L et 1), visibles quand on le sort et qu'on le bascule
  const bornesMeca = {};
  const etiqBornes = new THREE.Mesh(new THREE.PlaneGeometry(0.044, 0.012), new THREE.MeshBasicMaterial({ map: texte(["L          1"], { w: 256, h: 64, fond: "#e6e2d8", taille: 44 }) }));
  etiqBornes.rotation.x = Math.PI / 2; etiqBornes.position.set(0, -0.0231, 0.0); meca.add(etiqBornes);
  for (const [id, x] of [["int-E", -0.012], ["int-S", 0.012]]) {
    const b = new THREE.Group(); b.position.set(x, -0.0232, -0.011); meca.add(b);
    const tete = cyl(0.0032, 0.0032, 0.002, M.laiton, 16); tete.position.y = -0.001; b.add(tete);
    const fente2 = boite(0.0055, 0.0008, 0.0008, M.noir); fente2.position.y = -0.0021; fente2.rotation.y = 25 * RAD; b.add(fente2);
    const h = hitSphere(0.0095); b.add(h); cible(id, h, ["inter"], { type: "point", rayon: 0.0095 });
    bornesMeca[id] = b;
  }
  const vis = [];
  for (const [i, x] of [[0, -0.0295], [1, 0.0295]]) {
    const v = new THREE.Group(); v.position.set(x, 0, 0.0016); meca.add(v);
    const tete = cyl(0.0028, 0.0028, 0.0018, M.acier, 16); tete.rotation.x = Math.PI / 2; v.add(tete);
    const f = boite(0.005, 0.0008, 0.001, M.noir); f.position.z = 0.0009; v.add(f);
    const tige = cyl(0.0013, 0.0013, 0.018, M.acier, 8); tige.rotation.x = Math.PI / 2; tige.position.z = -0.009; v.add(tige);
    const h = hitSphere(0.013); v.add(h); cible(`vis${i}`, h, ["inter"], { type: "point", rayon: 0.013 });
    vis.push(v);
  }
  const zoneMeca = boite(0.046, 0.046, 0.03, M.invisible); zoneMeca.position.z = 0.004; meca.add(zoneMeca); cible("meca", zoneMeca, ["inter"]);
  const zoneTouche = boite(0.044, 0.044, 0.012, M.invisible); zoneTouche.position.z = 0.012; touche.add(zoneTouche); cible("touche", zoneTouche, ["inter"]);
  // prise 2P+T : socle, deux alvéoles, broche de terre (en haut)
  const prise = new THREE.Group(); prise.position.x = E; appareil.add(prise);
  const socle = cyl(0.0225, 0.0235, 0.012, M.plastique, 40); socle.rotation.x = Math.PI / 2; socle.position.z = 0.002; prise.add(socle);
  const puits = cyl(0.019, 0.019, 0.004, M.plastiqueMat, 40); puits.rotation.x = Math.PI / 2; puits.position.z = 0.0065; prise.add(puits);
  for (const [id, x] of [["prise-g", -0.0095], ["prise-d", 0.0095]]) {
    const a = cyl(0.0025, 0.0025, 0.002, M.noir, 14); a.rotation.x = Math.PI / 2; a.position.set(x, -0.002, 0.0087); prise.add(a);
    const h = hitSphere(0.0115); h.position.copy(a.position); prise.add(h); cible(id, h, ["inter-ouvert"], { type: "point", rayon: 0.0115 });
  }
  const broche = cyl(0.0024, 0.0024, 0.013, M.acier, 14); broche.rotation.x = Math.PI / 2; broche.position.set(0, 0.0115, 0.0135); prise.add(broche);
  const hT = hitSphere(0.0115); hT.position.set(0, 0.0125, 0.016); prise.add(hT); cible("prise-terre", hT, ["inter-ouvert"], { type: "point", rayon: 0.0115 });
  // plaque double (deux fenêtres), clipsée par-dessus
  const plaque = plaqueArrondie(0.152, 0.081, 0.006, 0.008, [{ w: 0.05, h: 0.05, x: -0.0355, y: 0 }, { w: 0.05, h: 0.05, x: 0.0355, y: 0 }]);
  plaque.position.set(E / 2, 0, 0.0015); appareil.add(plaque);
  const zonePlaque = boite(0.152, 0.081, 0.012, M.invisible); zonePlaque.position.set(E / 2, 0, 0.006); appareil.add(zonePlaque);
  const repPlaque = new THREE.Object3D(); repPlaque.position.set(0.054, 0, 0.01); appareil.add(repPlaque); // loin des vis
  cible("plaque", zonePlaque, ["inter"], { ancre: repPlaque });
  const zoneInter = boite(0.22, 0.16, 0.05, M.invisible); zoneInter.position.set(E / 2, 0, 0.02); appareil.add(zoneInter); cible("approcher-inter", zoneInter, ["chambre"]);
  // bout dénudé du fil rouge quand il est sorti de sa borne
  const boutRouge = new THREE.Group(); appareil.add(boutRouge);
  const ame = cyl(0.0011, 0.0011, 0.009, M.cuivre, 8); boutRouge.add(ame);
  const hR = hitSphere(0.0095); boutRouge.add(hR); cible("fil-rouge", hR, ["inter"], { type: "point", rayon: 0.0095 });
  ombre(appareil);

  /* ---------- L'entrée : couloir x ∈ [-0.6, 0.6], z ∈ [1.6, 4.6], tableau sur le mur x = 0,6 ---------- */
  const solC = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.92), M.sol); solC.rotation.x = -Math.PI / 2; solC.position.set(0, 0.001, 3.14); solC.receiveShadow = true; scene.add(solC);
  const plafC = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.0), M.plafond); plafC.rotation.x = Math.PI / 2; plafC.position.set(0, H, 3.1); scene.add(plafC);
  mur(3.0, H, M.murCouloir, V(-0.6, H / 2, 3.1), Math.PI / 2);
  mur(3.0, H, M.murCouloir, V(0.6, H / 2, 3.1), -Math.PI / 2);
  mur(1.2, H, M.murCouloir, V(0, H / 2, 4.6), Math.PI);
  // le mur entre la chambre et l'entrée fait 8 cm d'épaisseur (la boîte d'encastrement est dedans)
  const EP = 0.08;
  mur(0.18, H, M.murCouloir, V(-0.51, H / 2, 1.6 + EP), 0); mur(0.18, H, M.murCouloir, V(0.51, H / 2, 1.6 + EP), 0);
  mur(0.84, H - 2.04, M.murCouloir, V(0, 2.04 + (H - 2.04) / 2, 1.6 + EP), 0);
  for (const x of [-0.42, 0.42]) mur(EP, 2.04, M.plastiqueMat, V(x, 1.02, 1.6 + EP / 2), x < 0 ? Math.PI / 2 : -Math.PI / 2);
  const linteau = new THREE.Mesh(new THREE.PlaneGeometry(0.84, EP), M.plastiqueMat); linteau.rotation.x = Math.PI / 2; linteau.position.set(0, 2.04, 1.6 + EP / 2); scene.add(linteau);
  const seuil = new THREE.Mesh(new THREE.PlaneGeometry(0.84, EP), M.sol); seuil.rotation.x = -Math.PI / 2; seuil.position.set(0, 0.001, 1.6 + EP / 2); scene.add(seuil);
  // porte de la cuisine entrouverte au bout, d'où vient une lumière chaude
  const ouverture = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.0), new THREE.MeshBasicMaterial({ color: 0xffc98a })); ouverture.position.set(-0.599, 1.0, 4.15); ouverture.rotation.y = Math.PI / 2; ouverture.scale.x = 0.55; scene.add(ouverture);
  const cuisine = new THREE.PointLight(0xffb36b, 1.4, 0, 2); cuisine.position.set(-0.4, 1.6, 4.15); scene.add(cuisine);
  const passageC = boite(0.84, 2.0, 0.05, M.invisible); passageC.position.set(0, 1.0, 1.62); scene.add(cible("porte-chambre", passageC, ["entree"]));

  /* ---------- Tableau électrique (coffret 2 rangées) ---------- */
  const tableau = new THREE.Group(); tableau.position.set(0.6, 1.45, 3.0); tableau.rotation.y = -Math.PI / 2; scene.add(tableau);
  const coffret = plaqueArrondie(0.3, 0.4, 0.09, 0.012, [], M.plastique); coffret.position.z = 0.0; tableau.add(coffret);
  const fondCoffret = boite(0.27, 0.37, 0.002, M.plastiqueMat); fondCoffret.position.z = 0.0935; tableau.add(fondCoffret);
  const zoneTableau = boite(0.3, 0.4, 0.12, M.invisible); zoneTableau.position.z = 0.06; tableau.add(zoneTableau); cible("approcher-tableau", zoneTableau, ["entree"]);
  const manettes = {}; const rangees = []; const MOD = 0.0178;
  function rangee(y, appareils, etiquettes) {
    const g = new THREE.Group(); g.position.set(0, y, 0.095); tableau.add(g);
    const rail = boite(0.25, 0.035, 0.008, M.acier); rail.position.z = 0.004; g.add(rail);
    const larg = appareils.reduce((s, a) => s + (a.type === "id" ? 2 : 1), 0) * MOD;
    let x = -larg / 2;
    appareils.forEach((a, i) => {
      const w = (a.type === "id" ? 2 : 1) * MOD;
      const m = new THREE.Group(); m.position.set(x + w / 2, 0, 0.012); g.add(m);
      const corps2 = boite(w - 0.0006, 0.085, 0.045, M.plastique); corps2.position.z = 0.0225; m.add(corps2);
      const face = boite(w - 0.004, 0.045, 0.012, M.plastique); face.position.z = 0.05; m.add(face);
      const lbl = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.003, 0.018), new THREE.MeshBasicMaterial({ map: texte(a.type === "id" ? [{ t: a.haut, taille: 30 }, { t: `${a.ligne2.replace("IΔn ", "")} ${a.typ}`, taille: 24 }] : [{ t: a.cal, taille: 34 }], { w: a.type === "id" ? 192 : 96, h: 96, fond: "#ffffff" }) }));
      lbl.position.set(0, -0.031, 0.0451); m.add(lbl);
      
      const levier = new THREE.Group(); levier.position.set(0, 0.009, 0.058); m.add(levier); // en haut = enclenché
      const lev = boite(Math.min(0.0105, w * 0.5), 0.012, 0.011, a.type === "id" ? M.bleu : M.manette); lev.position.z = 0.004; levier.add(lev);
      const io = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.55, 0.034), new THREE.MeshBasicMaterial({ map: texte([{ t: "I", taille: 26 }, { t: " ", taille: 10 }, { t: "O", taille: 26 }], { w: 48, h: 128, fond: "#2a2d31", coul: "#d8dadd" }) }));
      io.position.set(0, 0, 0.0565); m.add(io);
      if (a.type === "id") { const t = boite(0.006, 0.006, 0.004, M.jaune || new THREE.MeshStandardMaterial({ color: 0xf2c230 })); t.position.set(w / 2 - 0.008, 0.033, 0.05); m.add(t); }
      const zone = boite(w - 0.001, 0.085, 0.07, M.invisible); zone.position.z = 0.035; m.add(zone); cible(`manette:${a.cle}`, zone, [`rangee${rangees.length + 1}`]);
      manettes[a.cle] = levier;
      x += w;
    });
    // une étiquette par appareil, écrite à la main sur la bande
    const et = new THREE.Mesh(new THREE.PlaneGeometry(larg, 0.017), new THREE.MeshBasicMaterial({ map: bandeEtiquettes(appareils, etiquettes) }));
    et.position.set(0, 0.06, 0.012); g.add(et);
    const zoneR = boite(0.25, 0.1, 0.08, M.invisible); zoneR.position.z = 0.04; g.add(zoneR); cible(`approcher-rangee${rangees.length + 1}`, zoneR, ["tableau"]);
    rangees.push(g);
  }
  function bandeEtiquettes(appareils, etiquettes) {
    const unites = appareils.reduce((s, a) => s + (a.type === "id" ? 2 : 1), 0);
    const c = document.createElement("canvas"); c.width = 120 * unites; c.height = 100;
    const g = c.getContext("2d"); g.fillStyle = "#fffbe8"; g.fillRect(0, 0, c.width, c.height);
    let x = 0;
    appareils.forEach((a, i) => {
      const w = (a.type === "id" ? 2 : 1) * 120;
      g.strokeStyle = "#c9c2a8"; g.strokeRect(x + 1, 1, w - 2, 98);
      g.fillStyle = "#1a2a6c"; g.textAlign = "center"; g.textBaseline = "middle";
      const mots = etiquettes[i].split(" ");
      const lignes = mots.length > 1 ? [mots[0], mots.slice(1).join(" ")] : [mots[0]];
      // la taille s'adapte pour que le mot tienne dans la largeur de l'appareil
      let t = 32; const police = (n) => `italic 700 ${n}px 'Comic Sans MS', 'Segoe Print', cursive`;
      g.font = police(t); while (t > 14 && Math.max(...lignes.map((l) => g.measureText(l).width)) > w - 12) { t--; g.font = police(t); }
      if (lignes.length > 1) { g.fillText(lignes[0], x + w / 2, 32); g.fillText(lignes[1], x + w / 2, 70); } else g.fillText(lignes[0], x + w / 2, 52);
      x += w;
    });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  RANGS.forEach((r, i) => rangee(i ? -0.085 : 0.085, r, r.map((a) => ETIQ[a.cle] || a.etiquette)));
  ombre(tableau);

  /* ---------- Lumières ---------- */
  const ambiance = new THREE.HemisphereLight(0x9fb4d8, 0x1a1410, 0.18); scene.add(ambiance);
  const lune = new THREE.DirectionalLight(0x7f9cd6, 0.5); lune.position.set(-4, 2.5, -0.4); lune.target.position.set(0, 0, 0); scene.add(lune, lune.target);
  const frontale = new THREE.SpotLight(0xfff4e0, 9, 9, 26 * RAD, 0.6, 1.6);
  frontale.castShadow = true; frontale.shadow.mapSize.set(512, 512); frontale.shadow.bias = -0.0004; frontale.shadow.camera.near = 0.05;

  return {
    scene, M, cibles, appareil, meca, touche, vis, plaque, prise, fils, boutRouge, bornesMeca, tableau, rangees, manettes,
    lampe, ampouleMat, ambiance, frontale, pluie, ecranReveil, lueurReveil, E, plafonnier,
    hitSphere, cyl, boite,
  };
}
