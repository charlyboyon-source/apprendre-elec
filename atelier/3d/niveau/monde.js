// Monde 3D des niveaux 2 à 6 : il est construit par le code à partir du plan du niveau (lieux, objets) et du
// logement du moteur. Ce qu'on voit correspond à ce qui est câblé : le tableau montre les appareils du moteur,
// une boîte ouverte montre exactement les conducteurs du moteur, à leurs couleurs.
// Couleurs : rouge = phase, bleu = neutre, vert-jaune = terre, orange = retour lampe, blanc = retour bouton-poussoir.
import * as THREE from "../three.module.min.js";
import { creerDecor } from "./decor.js";

const cieux = {}; // ciels et reflets, préparés une seule fois

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...o });
const boite = (w, h, d, m) => { const x = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); x.castShadow = true; x.receiveShadow = true; return x; };
const cyl = (r1, r2, h, m, seg = 20) => { const x = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m); x.castShadow = true; return x; };
const COULEURS = { rouge: 0xc8261e, bleu: 0x2f6fd0, "vert-jaune": 0x4a9a35, orange: 0xe8790c, violet: 0x7a4bb3, blanc: 0xeeeeee };
const MOD = 0.0178;
export const ECART = 40; // les lieux sont posés loin les uns des autres : on passe de l'un à l'autre par leurs portes

function toile(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, g: c.getContext("2d"), t }; }
function etiquette(lignes, { w = 256, h = 64, fond = "#f4f1ea", coul = "#1d2228", taille = 30 } = {}) {
  const T = toile(w, h), g = T.g; if (fond) { g.fillStyle = fond; g.fillRect(0, 0, w, h); }
  g.fillStyle = coul; g.textAlign = "center"; g.textBaseline = "middle";
  const L = [].concat(lignes); L.forEach((l, i) => { const t = typeof l === "string" ? { t: l } : l; g.font = `700 ${t.taille || taille}px system-ui, sans-serif`; g.fillText(t.t, w / 2, (h / (L.length + 1)) * (i + 1)); });
  T.t.needsUpdate = true; return T.t;
}
const panneau = (w, h, tex) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));

export function creerMonde(renderer, base, N, P) {
  const scene = new THREE.Scene();
  const charge = new THREE.TextureLoader();
  const tex = (f, rep, srgb = true) => { const t = charge.load(`${base}../textures/${f}`); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 4; return t; };
  // matériau complet (couleur, relief, rugosité) à partir d'une texture libre du dossier ../textures
  const pbr = { tex, m: (nom, rep, o = {}) => mat(0xffffff, { map: tex(`${nom}_diff.jpg`, rep), normalMap: tex(`${nom}_nor.jpg`, rep, false), roughnessMap: tex(`${nom}_rough.jpg`, rep, false), roughness: 1, ...o }) };
  const mouillables = [];   // sols d'extérieur : ils brillent quand il pleut
  const sources = [];       // tout ce qui éclaire : { id, lieu, obj, couleur, force, portee, on(r), mats, plafond }
  const temoins = [];       // voyants, écrans, vitres : fonctions (r, e, lieuCourant, nuit)
  const solExt = (nom, rep) => { const m = pbr.m(nom, rep); mouillables.push({ m, c: m.color.clone() }); return m; };
  const M = {
    mur: mat(0xffffff, { roughness: 0.95, map: tex("beige_wall_001_diff.jpg", [2.5, 1.4]), normalMap: tex("beige_wall_001_nor_gl.jpg", [2.5, 1.4], false) }), plafond: mat(0xf2efe8, { roughness: 0.95 }), plastique: mat(0xf4f4f1, { roughness: 0.35 }), gris: mat(0x8d949c), noir: mat(0x1b1d20, { roughness: 0.5 }),
    laiton: mat(0xc9a44a, { metalness: 0.85, roughness: 0.3 }), cuivre: mat(0xd98a4a, { metalness: 0.9, roughness: 0.3 }), acier: mat(0xb9bfc6, { metalness: 0.8, roughness: 0.35 }),
    invisible: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), bois: mat(0x8a6a4a), crepi: mat(0xefe6d2, { roughness: 1 }), herbe: mat(0x3f6a35, { roughness: 1 }), dalle: mat(0xa9a59c, { roughness: 0.95 }),
    carrelage: mat(0xc9c4b8, { roughness: 0.5 }), beton: mat(0x8f8d88, { roughness: 0.95 }), terre: mat(0x4a3526, { roughness: 1 }), blanc: mat(0xfafafa, { roughness: 0.4 }), tissu: mat(0x4a5a78, { roughness: 0.95 }),
    eau: mat(0x6fa8d8, { roughness: 0.1, transparent: true, opacity: 0.6 }),
  };
  const sols = {
    bois: (l) => { const r = [l.taille[0] / 1.7, l.taille[1] / 1.7]; return mat(0xffffff, { map: tex("wood_floor_diff.jpg", r), normalMap: tex("wood_floor_nor_gl.jpg", r, false), roughnessMap: tex("wood_floor_rough.jpg", r, false), roughness: 0.85 }); },
    carrelage: (l) => pbr.m("floor_tiles_06", [l.taille[0] / 1.3, l.taille[1] / 1.3], { roughness: 0.55 }), beton: (l) => pbr.m("concrete_floor_02", [l.taille[0] / 2, l.taille[1] / 2]),
    dalle: () => M.dalle, herbe: () => solExt("pelouse", [26, 26]), patio_tiles: (l, d) => solExt("patio_tiles", [d[0] / 1.2, d[1] / 1.2]), gravel_floor: (l, d) => solExt("gravel_floor", [d[0] / 1.1, d[1] / 1.1]),
  };

  const cibles = []; // { id, objet, vues: [vue], type: "surface" | "point", rayon }
  const cible = (id, objet, vues, extra = {}) => { objet.userData.cible = id; cibles.push({ id, objet, vues, type: "surface", ...extra }); return objet; };
  const point = (id, objet, vues, rayon = 0.011) => { cibles.push({ id, objet, vues, type: "point", rayon }); return objet; };
  const vues = {};   // id → { lieu, parent, nom, court, libre?, cadre: () => { pos, cible } }
  const voyants = {}, manettes = {}, capots = {}, interieurs = {}, cadrans = {}, selecteurs = {}, touches = {}, fenetresIO = {}, boutonsTest = {}, voyantsTension = [];
  let porteTableau = null, afficheCompteur = null;
  const inst = P.inst, L = N.logement;
  const decor = creerDecor({ base, M, mat, boite, cyl, cible, pbr, P, inst, sources, temoins, mouillables });

  // ---- repère d'un mur : position et orientation d'un objet posé dessus
  function surMur(lieu, mur, u = 0, y = 1.2) {
    const [lx, lz] = lieu.taille;
    if (mur === "N") return { p: V(u, y, -lz / 2), n: V(0, 0, 1), r: 0 };
    if (mur === "S") return { p: V(-u, y, lz / 2), n: V(0, 0, -1), r: Math.PI };
    if (mur === "E") return { p: V(lx / 2, y, u), n: V(-1, 0, 0), r: -Math.PI / 2 };
    return { p: V(-lx / 2, y, -u), n: V(1, 0, 0), r: Math.PI / 2 };
  }
  const largeurVue = (camera) => 2 * Math.tan((32 / 2) * Math.PI / 180) * Math.min(1.25, camera.aspect);
  // vue rapprochée d'un objet : la caméra se place devant, à la distance où « largeur » remplit l'image
  function vueProche(id, lieuId, groupe, largeur, { nom, court, parent, centre = V(0, 0, 0), haut = 0, hauteur = 0 } = {}) {
    vues[id] = { lieu: lieuId, parent: parent || lieuId, nom, court: court || nom, cadre(camera) {
      groupe.updateMatrixWorld(true); const d = Math.max(largeur / largeurVue(camera), hauteur / (2 * Math.tan(16 * Math.PI / 180))); // tout doit tenir, en largeur comme en hauteur
      return { pos: groupe.localToWorld(centre.clone().add(V(0, haut * d, d))), cible: groupe.localToWorld(centre.clone()) };
    } };
  }

  /* =====================  Appareillage  ===================== */
  function prise(o, lieuId, g) {
    const org = inst.organe[o.id];
    g.add(boite(0.082, 0.082, 0.008, M.plastique));
    const puits = cyl(0.02, 0.02, 0.006, M.blanc, 28); puits.rotation.x = Math.PI / 2; puits.position.z = 0.004; g.add(puits);
    const pts = { L: V(0.0095, 0, 0.008), N: V(-0.0095, 0, 0.008), PE: V(0, 0.013, 0.01) };
    for (const [b, p] of Object.entries(pts)) { const t = cyl(b === "PE" ? 0.0024 : 0.003, b === "PE" ? 0.0024 : 0.003, 0.006, b === "PE" ? M.laiton : M.noir, 12); t.rotation.x = Math.PI / 2; t.position.copy(p); g.add(t); point(`${o.id}.${b}`, t, [`v:${o.id}`], 0.0075); }
    const zone = boite(0.11, 0.11, 0.03, M.invisible); zone.position.z = 0.012; g.add(zone);
    cible(`approcher:${o.id}`, zone, [lieuId]); cible(`essayer:${o.id}`, boite(0.082, 0.02, 0.012, M.invisible), [`v:${o.id}`]).position.set(0, -0.034, 0.006); g.add(cibles[cibles.length - 1].objet);
    vueProche(`v:${o.id}`, lieuId, g, 0.15, { nom: org.nom.toLowerCase(), court: org.nom });
  }
  function inter(o, lieuId, g) {
    g.add(boite(0.082, 0.082, 0.008, M.plastique));
    const t = boite(0.05, 0.05, 0.006, M.blanc); t.position.z = 0.007; g.add(t); touches[o.id] = t;
    const zone = boite(0.12, 0.12, 0.03, M.invisible); zone.position.z = 0.012; g.add(zone); cible(`essayer:${o.id}`, zone, [lieuId]);
  }
  function plafonnier(o, lieu, G, lieuId) {
    const g = new THREE.Group(); g.position.set(o.x || 0, lieu.h - 0.28, o.z || 0); G.add(g);
    const fil = cyl(0.004, 0.004, 0.28, M.noir, 8); fil.position.y = 0.14; g.add(fil);
    const abat = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.16, 28, 1, true), new THREE.MeshStandardMaterial({ color: 0xf2ead8, side: THREE.DoubleSide, roughness: 0.8, emissive: 0xffe2b0, emissiveIntensity: 0 })); g.add(abat);
    const amp = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), new THREE.MeshStandardMaterial({ color: 0xf6f1e6, emissive: 0xffd49a, emissiveIntensity: 0 })); amp.position.y = -0.06; g.add(amp);
    sources.push({ id: o.id, lieu: lieuId, obj: amp, couleur: 0xffe6c0, force: 6 * Math.min(1, (Math.min(...lieu.taille) / 3) ** 2), portee: 9, on: (r) => r.allume(o.id), mats: [abat.material, amp.material], plafond: true });
    const zone = boite(0.5, 0.4, 0.5, M.invisible); zone.position.y = -0.02; g.add(zone); cible(`essayer:${o.id}`, zone, [lieuId]);
  }
  // boîte, sortie de câble : un couvercle ; ouverte, on voit les bornes du moteur et tous les conducteurs qui y arrivent
  function interieur(id, g, vue, ech = 1) {
    const org = inst.organe[id], bornes = org.bornes || ["L", "N", "PE"], G = new THREE.Group(); G.visible = false; g.add(G);
    const fond = boite(0.13 * ech, 0.11 * ech, 0.004, M.gris); fond.position.z = 0.002; G.add(fond);
    const fils = [];
    bornes.forEach((b, i) => {
      const x = (i - (bornes.length - 1) / 2) * 0.036 * ech, nom = `${id}.${b}`;
      const bloc = boite(0.02 * ech, 0.016 * ech, 0.014, b.toLowerCase().startsWith("p") && b.toLowerCase() !== "ph" ? mat(0x4a9a35) : b.toLowerCase().startsWith("n") ? mat(0x2f6fd0) : mat(0x8a8f96)); bloc.position.set(x, 0, 0.011); G.add(bloc);
      const vis = cyl(0.0045 * ech, 0.0045 * ech, 0.004, M.laiton, 12); vis.rotation.x = Math.PI / 2; vis.position.set(x, 0, 0.019); G.add(vis); point(nom, vis, [vue], 0.011 * ech);
      const lies = L.conducteurs.filter((c) => c.de === nom || c.vers === nom);
      lies.forEach((c, k) => {
        const ext = c.de === nom ? "de" : "vers", haut = ext === "vers"; // ce qui arrive vient du haut, ce qui repart sort par le bas
        const rang = lies.filter((x, j) => j < k && (x.de === nom ? "de" : "vers") === ext).length;
        const dx = (rang - 0.5 * (lies.filter((x) => (x.de === nom ? "de" : "vers") === ext).length - 1)) * 0.011 * ech, sens = haut ? 1 : -1;
        const m = mat(COULEURS[c.couleur] || 0x888888, { roughness: 0.45 });
        const fil = new THREE.Group(); fil.position.set(x + dx, sens * 0.012 * ech, 0.012); G.add(fil);
        const gaine = cyl(0.0022 * ech, 0.0022 * ech, 0.05 * ech, m, 10); gaine.position.y = sens * 0.03 * ech; fil.add(gaine);
        const ame = cyl(0.0011 * ech, 0.0011 * ech, 0.008 * ech, M.cuivre, 8); ame.position.y = sens * 0.002 * ech; fil.add(ame);
        const prise0 = boite(0.012 * ech, 0.03 * ech, 0.012, M.invisible); prise0.position.y = sens * 0.036 * ech; fil.add(prise0); cible(`fil:${c.id}:${ext}`, prise0, [vue], { ancre: prise0 });
        const bout = new THREE.Object3D(); bout.position.y = sens * 0.002 * ech; fil.add(bout); point(`${c.id}#${ext}`, bout, [vue], 0.009 * ech); point(`${c.id}#bout`, bout, [vue], 0.009 * ech); cibles[cibles.length - 1].ext = ext;
        if (inst.pannes.some((p) => p.type === "connexion_desserree" && p.conducteur === c.id && p.extremite === ext && c.role === "phase")) bloc.material = mat(0x3a2a1c, { roughness: 1 });
        fils.push({ c, ext, fil, sens, x: x + dx });
      });
    });
    interieurs[id] = { G, fils, ech };
    return G;
  }
  function boiteDerivation(o, lieuId, g, { w = 0.14, h = 0.12, nomVue } = {}) {
    const org = inst.organe[o.id], vue = `v:${o.id}`, ext = typeof o.ext === "function" ? o.ext(P) : !!o.ext;
    const corps = boite(w, h, 0.05, ext ? mat(0x9aa0a6, { roughness: 0.6 }) : M.plastique); corps.position.z = -0.022; g.add(corps);
    const capot = boite(w + 0.006, h + 0.006, 0.008, ext ? mat(0xb3b9c0, { roughness: 0.5 }) : M.blanc); capot.position.z = 0.008; g.add(capot); capots[o.id] = capot;
    cible(`ouvrir:${o.id}`, capot, [vue]);
    const I = interieur(o.id, g, vue);
    if (o.eau && o.eau(P)) { const eau = boite(0.128, 0.04, 0.02, M.eau); eau.position.set(0, -0.035, 0.012); I.add(eau); }
    const zone = boite(w + 0.1, h + 0.1, 0.08, M.invisible); zone.position.z = 0.02; g.add(zone); cible(`approcher:${o.id}`, zone, [lieuId]);
    vueProche(vue, lieuId, g, 0.2, { nom: nomVue || org.nom.toLowerCase(), court: org.nom });
    return corps;
  }
  function borneJardin(o, lieuId, G) {
    const g = new THREE.Group(); g.position.set(o.x, 0, o.z); g.rotation.y = o.r || 0; G.add(g);
    const fut = cyl(0.045, 0.05, 0.55, mat(0x2b2f34, { roughness: 0.5, metalness: 0.4 }), 20); fut.position.y = 0.275; g.add(fut);
    const verre = cyl(0.05, 0.05, 0.12, new THREE.MeshStandardMaterial({ color: 0xf2f2ea, emissive: 0xffe2b0, emissiveIntensity: 0, roughness: 0.2, transparent: true, opacity: 0.9 }), 20); verre.position.y = 0.61; g.add(verre);
    const chapeau = cyl(0.062, 0.062, 0.02, mat(0x2b2f34, { metalness: 0.4 }), 20); chapeau.position.y = 0.68; g.add(chapeau);
    sources.push({ id: o.id, lieu: lieuId, obj: verre, couleur: 0xffe2b0, force: 4.5, portee: 6.5, on: (r) => r.allume(o.id), mats: [verre.material] });
    const tete = new THREE.Group(); tete.position.set(0, 0.36, 0.05); g.add(tete);
    const capot = boite(0.085, 0.1, 0.008, mat(0x3a3f46, { metalness: 0.4, roughness: 0.5 })); capot.position.z = 0.004; tete.add(capot); capots[o.id] = capot; cible(`ouvrir:${o.id}`, capot, [`v:${o.id}`]);
    interieur(o.id, tete, `v:${o.id}`, 0.62);
    if (typeof o.buee === "function" ? o.buee(P) : o.buee) { const b = cyl(0.051, 0.051, 0.06, mat(0xffffff, { transparent: true, opacity: 0.55, roughness: 1 }), 20); b.position.y = 0.6; g.add(b); }
    const zone = boite(0.3, 0.8, 0.3, M.invisible); zone.position.y = 0.4; g.add(zone); cible(`approcher:${o.id}`, zone, [lieuId]);
    vueProche(`v:${o.id}`, lieuId, tete, 0.13, { nom: inst.organe[o.id].nom.toLowerCase(), court: inst.organe[o.id].nom, haut: 0.25 });
  }

  /* =====================  Tableau  ===================== */
  // Tout ce qui est dessiné ici s'actionne : manettes, boutons test, sélecteurs, horloge, porte. L'effet vient du moteur.
  const texIO = { I: etiquette("I", { w: 32, h: 32, taille: 26, fond: "#c8261e", coul: "#fff" }), O: etiquette("O", { w: 32, h: 32, taille: 26, fond: "#2f8a3a", coul: "#fff" }) };
  const texNL = (() => { const T = toile(128, 32), g = T.g; g.fillStyle = "#d9dbd6"; g.fillRect(0, 0, 128, 32); g.font = "700 24px system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#1f4fb0"; g.fillText("N", 32, 17); g.fillStyle = "#1d2228"; g.fillText("L", 96, 17); T.t.needsUpdate = true; return T.t; })();
  const matIO = { I: new THREE.MeshBasicMaterial({ map: texIO.I }), O: new THREE.MeshBasicMaterial({ map: texIO.O }) };
  // une manette qui bascule autour de son axe : en haut = I (fermé), en bas = O (ouvert)
  function manette(m, id, x, y, z, w, coul, long = 0.02) {
    const piv = new THREE.Group(); piv.position.set(x, y, z); m.add(piv);
    const lev = boite(w, 0.009, long, coul); lev.position.z = long / 2; piv.add(lev);
    const axe = cyl(0.005, 0.005, w + 0.002, M.gris, 10); axe.rotation.z = Math.PI / 2; piv.add(axe);
    manettes[id] = { piv, a: 0.62 };
    const io = new THREE.Mesh(new THREE.PlaneGeometry(0.0075, 0.0075), matIO.O); io.position.set(x, y - 0.0185, z + 0.0006); m.add(io); fenetresIO[id] = io;
  }
  function boutonTest(m, id, x, y, z, vue, r = 0.0042) {
    const b = cyl(r, r, 0.004, mat(0xe9b400, { roughness: 0.4 }), 14); b.rotation.x = Math.PI / 2; b.position.set(x, y, z + 0.002); m.add(b); boutonsTest[id] = { b, z: z + 0.002, t: 0 };
    const l = panneau(r * 3.4, r * 1.5, etiquette("TEST", { w: 96, h: 40, taille: 28, fond: null })); l.position.set(x, y - r * 2, z + 0.0004); m.add(l);
    const zt = boite(r * 3.4, r * 4.4, 0.02, M.invisible); zt.position.set(x, y - r * 0.6, z + 0.024); m.add(zt); cible(`test:${id}`, zt, [vue]);
  }
  function selecteur(m, id, x, y, z, vue, wz) {
    const kn = new THREE.Group(); kn.position.set(x, y, z); m.add(kn);
    const c = cyl(0.0065, 0.0065, 0.006, M.noir, 18); c.rotation.x = Math.PI / 2; kn.add(c);
    const trait = boite(0.0016, 0.0062, 0.002, M.blanc); trait.position.set(0, 0.0034, 0.0035); kn.add(trait);
    selecteurs[id] = kn; const zs = boite(wz, 0.024, 0.02, M.invisible); zs.position.set(x, y, z + 0.004); m.add(zs); cible(`mode:${id}`, zs, [vue]);
  }
  const voyantTension = (m, borne, x, y, z, coul = 0xff3b2f) => { const v = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 10, 8), new THREE.MeshStandardMaterial({ color: 0x2a1c1c, emissive: coul, emissiveIntensity: 0 })); v.position.set(x, y, z); m.add(v); voyantsTension.push({ m: v.material, borne }); };

  function tableau(o, lieuId, g, lieu) {
    const T = L.tableau, extras = (N.plan.tableau && N.plan.tableau.extras) || {};
    const rangs = T.differentiels.map((d) => [{ id: d.id, genre: "id", w: 2 }, ...T.disjoncteurs.filter((q) => q.differentiel === d.id).map((q) => ({ id: q.id, genre: "dj", w: 1 })), ...(extras[d.id] || []).map((x) => ({ id: x, genre: inst.organe[x].type, w: inst.organe[x].type === "horloge" ? 3 : 2 }))]);
    const larg = Math.max(...rangs.map((r) => r.reduce((s, a) => s + a.w, 0))) * MOD + 0.05, haut = rangs.length * 0.2 + 0.09, y0 = o.y === undefined ? 1.2 : o.y;
    // la goulotte de la GTL, du sol au plafond, derrière le tableau et le panneau de contrôle
    const gou = boite(0.27, lieu.h, 0.05, mat(0xf1f0ec, { roughness: 0.5 })); gou.position.set(0, lieu.h / 2 - y0, 0.025); g.add(gou);
    const joint = boite(0.003, lieu.h, 0.002, mat(0xb9b6ae)); joint.position.set(0.09, lieu.h / 2 - y0, 0.0505); g.add(joint);
    const coffret = boite(larg, haut, 0.09, M.plastique); coffret.position.z = 0.045; g.add(coffret);
    const fond = boite(larg - 0.03, haut - 0.03, 0.002, mat(0xe6e6e2, { roughness: 0.8 })); fond.position.z = 0.0915; g.add(fond);
    for (const [w, h, x, y] of [[larg, 0.012, 0, haut / 2 - 0.006], [larg, 0.012, 0, -haut / 2 + 0.006], [0.012, haut, -larg / 2 + 0.006, 0], [0.012, haut, larg / 2 - 0.006, 0]]) { const b = boite(w, h, 0.1, M.plastique); b.position.set(x, y, 0.14); g.add(b); }
    const zone = boite(larg, haut, 0.2, M.invisible); zone.position.z = 0.1; g.add(zone); cible("approcher:tableau", zone, [lieuId]);
    vueProche("v:tableau", lieuId, g, larg + 0.04, { nom: "le tableau", court: "Le tableau", centre: V(0, 0, 0.1), hauteur: haut + 0.05 });
    vues["v:tableau"].lieuRaccourci = "Tableau";
    // la porte du coffret : fermée quand on est dans la pièce, elle s'ouvre quand on s'approche
    const pivot = new THREE.Group(); pivot.position.set(-larg / 2, 0, 0.192); g.add(pivot);
    const vitre = new THREE.Mesh(new THREE.BoxGeometry(larg - 0.02, haut - 0.02, 0.004), new THREE.MeshStandardMaterial({ color: 0x39424d, transparent: true, opacity: 0.45, roughness: 0.08 })); vitre.position.set(larg / 2, 0, 0); pivot.add(vitre);
    for (const [w, h, x, y] of [[larg, 0.014, larg / 2, haut / 2 - 0.007], [larg, 0.014, larg / 2, -haut / 2 + 0.007], [0.014, haut, 0.007, 0], [0.014, haut, larg - 0.007, 0]]) { const b = boite(w, h, 0.008, M.plastique); b.position.set(x, y, 0); pivot.add(b); }
    const pg = boite(0.012, 0.05, 0.012, M.gris); pg.position.set(larg - 0.012, 0, 0.008); pivot.add(pg);
    porteTableau = { pivot, a: 0, vers: 0 };

    rangs.forEach((rang, r) => {
      const y = haut / 2 - 0.15 - r * 0.2, R = new THREE.Group(); R.position.set(0, y, 0.093); g.add(R);
      const rail = boite(larg - 0.04, 0.035, 0.008, M.acier); rail.position.z = 0.004; R.add(rail);
      const total = rang.reduce((s, a) => s + a.w, 0) * MOD; let x = -total / 2;
      // deux vues par rangée si elle est longue : les appareils de protection, puis les appareils de commande
      const groupes = [rang.filter((a) => a.genre === "id" || a.genre === "dj"), rang.filter((a) => a.genre !== "id" && a.genre !== "dj")].filter((k) => k.length);
      const vueDe = (a) => `v:rangee${r + 1}${groupes.length > 1 && a.genre !== "id" && a.genre !== "dj" ? "b" : ""}`;
      const etiq = [];
      for (const a of rang) {
        const w = a.w * MOD, m = new THREE.Group(); m.position.set(x + w / 2, 0, 0.012); R.add(m); const vue = vueDe(a);
        const corps = boite(w - 0.0006, 0.085, 0.045, M.plastique); corps.position.z = 0.0225; m.add(corps);
        if (a.genre === "id" || a.genre === "dj") {
          const p = inst.protections.find((k) => k.id === a.id), estId = a.genre === "id";
          const face = boite(w - 0.004, 0.045, 0.012, M.plastique); face.position.z = 0.05; m.add(face);
          const lbl = panneau(w - 0.003, 0.018, etiquette(estId ? [{ t: `${p.calibre} A`, taille: 30 }, { t: `30 mA ${p.type}`, taille: 22 }] : [{ t: `C${p.calibre}`, taille: 34 }], { w: estId ? 160 : 96, h: 80 })); lbl.position.set(0, -0.031, 0.0456); m.add(lbl);
          manette(m, a.id, estId ? 0.006 : 0, 0.011, 0.0565, estId ? 0.013 : 0.0085, estId ? mat(0x2a4fa8, { roughness: 0.4 }) : M.noir);
          const z = boite(w - 0.001, 0.07, 0.07, M.invisible); z.position.set(0, 0.006, 0.035); m.add(z); cible(`manette:${a.id}`, z, [vue]);
          if (estId) boutonTest(m, a.id, -0.0105, 0.014, 0.056, vue);
          // bornes de sortie, en bas : le neutre à gauche, la phase à droite et un peu plus bas (pour bien les distinguer), sur un socle repéré N et L
          const socle = boite(w - 0.0012, 0.034, 0.02, mat(0xd9dbd6, { roughness: 0.6 })); socle.position.set(0, -0.0595, 0.017); m.add(socle);
          const rp = panneau(w - 0.003, 0.0075, texNL); rp.position.set(0, -0.0395, 0.0272); m.add(rp);
          for (const [b, dx, dy, mm] of [["Nout", -w * 0.25, -0.05, mat(0x2f6fd0)], ["Lout", w * 0.25, -0.064, M.laiton]]) { const t = cyl(0.0032, 0.0032, 0.006, mm, 12); t.rotation.x = Math.PI / 2; t.position.set(dx, dy, 0.03); m.add(t); point(`${a.id}.${b}`, t, [vue], 0.0075); }
          if (a.genre === "dj" && ((N.plan.tableau && N.plan.tableau.regards) || []).includes(a.id)) { const zl = boite(w - 0.001, 0.02, 0.01, M.invisible); zl.position.set(0, -0.031, 0.05); m.add(zl); cible(`regarder:${a.id}`, zl, [vue]); }
          if (((N.plan.tableau && N.plan.tableau.cables) || []).includes(a.id)) { const cb = cyl(0.0045, 0.0045, 0.012, mat(0x6b7178), 12); cb.position.set(0, -0.082, 0.03); m.add(cb); point(`${a.id}.cable`, cb, [vue], 0.0075); }
          etiq.push([x + w / 2, w, estId ? `Diff. ${r + 1}` : p.etiquette]);
        } else if (a.genre === "horloge") {
          const C = toile(256, 256), cad = panneau(0.044, 0.044, C.t); cad.position.set(0, 0.012, 0.0456); m.add(cad); cadrans[a.id] = C;
          cible(`regarder:${a.id}`, cad, [vue]);
          selecteur(m, a.id, -0.014, -0.027, 0.048, vue, 0.024);
          const reg = boite(0.02, 0.014, 0.004, mat(0xe8790c)); reg.position.set(0.014, -0.028, 0.047); m.add(reg); cible(`regler:${a.id}`, reg, [vue]);
          const l = panneau(0.05, 0.008, etiquette("auto · I · 0      à l'heure", { w: 320, h: 48, taille: 24, fond: null })); l.position.set(0, -0.0395, 0.0456); m.add(l);
          voyantTension(m, `${a.id}.2`, 0.022, 0.036, 0.046, 0xff8a1a);
          for (const [b, dx] of [["1", -0.012], ["2", 0.012]]) { const t = cyl(0.0032, 0.0032, 0.006, b === "2" ? mat(0xe8790c) : M.laiton, 12); t.rotation.x = Math.PI / 2; t.position.set(dx, -0.058, 0.03); m.add(t); point(`${a.id}.${b}`, t, [vue], 0.0085); }
          etiq.push([x + w / 2, w, "Horloge allée"]);
        } else if (a.genre === "contacteur") {
          const lbl = panneau(w - 0.004, 0.02, etiquette(["HC", { t: "auto · I · 0", taille: 20 }], { w: 128, h: 80 })); lbl.position.set(0, 0.022, 0.0456); m.add(lbl);
          selecteur(m, a.id, 0, -0.006, 0.048, vue, w - 0.004);
          voyantTension(m, `${a.id}.2`, 0.011, 0.037, 0.046);
          const t = cyl(0.0032, 0.0032, 0.006, M.laiton, 12); t.rotation.x = Math.PI / 2; t.position.set(0, -0.058, 0.03); m.add(t); point(`${a.id}.2`, t, [vue], 0.0085);
          etiq.push([x + w / 2, w, "Contacteur"]);
        }
        x += w;
      }
      // bande d'étiquettes au-dessus de la rangée : haute, écrite gros. Sur un module étroit, le texte est écrit debout
      // (de bas en haut), comme sur les porte-étiquettes : c'est ce qui le rend lisible au téléphone.
      const ech = 2048 / total, HB = Math.round(0.052 * ech), B = toile(2048, HB), gg = B.g; gg.fillStyle = "#fbfaf6"; gg.fillRect(0, 0, 2048, HB); gg.textAlign = "center"; gg.textBaseline = "middle";
      for (const [cx, w, t] of etiq) {
        const px = (cx + total / 2) * ech, lw = w * ech, mots = t.split(" "), deux = t.length > 9 && mots.length > 1, k = Math.ceil(mots.length / 2);
        const lignes = deux ? [mots.slice(0, k).join(" "), mots.slice(k).join(" ")] : [t], debout = w < MOD * 1.5, long = (debout ? HB : lw) - 14, larg2 = (debout ? lw : HB) - 10;
        const taille = Math.floor(Math.min(larg2 / lignes.length / 1.12, long / (Math.max(...lignes.map((l) => l.length)) * 0.56)));
        gg.strokeStyle = "#b9b4a8"; gg.lineWidth = 2; gg.strokeRect(px - lw / 2, 0, lw, HB); gg.fillStyle = "#0d1640"; gg.font = `700 ${taille}px system-ui, -apple-system, "Segoe UI", sans-serif`;
        gg.save(); gg.translate(px, HB / 2); if (debout) gg.rotate(-Math.PI / 2); lignes.forEach((l, n) => gg.fillText(l, 0, (n - (lignes.length - 1) / 2) * taille * 1.12)); gg.restore();
      }
      B.t.anisotropy = 8; B.t.needsUpdate = true; const bande = panneau(total, 0.052, B.t); bande.position.set(0, 0.0715, 0.014); R.add(bande);
      // vues de la rangée
      let x0 = -total / 2;
      groupes.forEach((grp, k) => {
        const wg = grp.reduce((s, a) => s + a.w, 0) * MOD, id = `v:rangee${r + 1}${k ? "b" : ""}`;
        const z = boite(wg, 0.12, 0.08, M.invisible); z.position.set(x0 + wg / 2, 0, 0.04); R.add(z); cible(`approcher:${id.slice(2)}`, z, ["v:tableau"]);
        const tr = boite(0.03, 0.012, 0.012, mat(0x4a9a35)); tr.position.set(x0 + wg / 2, -0.088, 0.02); R.add(tr);
        const vt = cyl(0.004, 0.004, 0.006, M.laiton, 12); vt.rotation.x = Math.PI / 2; vt.position.set(x0 + wg / 2, -0.088, 0.028); R.add(vt); point("bt.PE", vt, [id], 0.0095);
        vueProche(id, lieuId, R, Math.max(0.105, wg + 0.012), { nom: k ? "l'horloge et le contacteur" : `la rangée ${r ? "du bas" : "du haut"}`, court: k ? "Horloge, contacteur" : `Rangée ${r ? "du bas" : "du haut"}`, parent: "v:tableau", centre: V(x0 + wg / 2, 0.002, 0.07), hauteur: 0.206 });
        x0 += wg;
      });
    });

    // le panneau de contrôle, sous le tableau : compteur communicant et disjoncteur de branchement
    const Bp = new THREE.Group(); Bp.position.set(0, -haut / 2 - 0.275, 0.05); g.add(Bp);
    const platine = boite(0.25, 0.47, 0.012, mat(0xdcd8cc, { roughness: 0.7 })); platine.position.z = 0.006; Bp.add(platine);
    const cpt = boite(0.14, 0.19, 0.055, mat(0xb9d232, { roughness: 0.5 })); cpt.position.set(0, 0.125, 0.04); Bp.add(cpt);
    const TC = toile(192, 64), lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.078, 0.026), new THREE.MeshBasicMaterial({ map: TC.t, toneMapped: false })); lcd.position.set(0, 0.165, 0.0682); Bp.add(lcd);
    let dernierTexte = null; afficheCompteur = (txt) => { if (txt === dernierTexte) return; dernierTexte = txt; TC.g.fillStyle = "#c8d4b4"; TC.g.fillRect(0, 0, 192, 64); TC.g.fillStyle = "#1d2620"; TC.g.font = "700 24px ui-monospace, Menlo, monospace"; TC.g.textAlign = "center"; TC.g.fillText(txt, 96, 40); TC.t.needsUpdate = true; };
    for (const dx of [-0.02, 0.02]) { const b = boite(0.016, 0.012, 0.004, M.gris); b.position.set(dx, 0.125, 0.069); Bp.add(b); }
    const plomb = boite(0.12, 0.05, 0.004, mat(0xd9e58a, { roughness: 0.6 })); plomb.position.set(0, 0.065, 0.069); Bp.add(plomb);
    if (N.regards && N.regards.compteur) cible("regarder:compteur", cpt, ["v:branchement"]);
    const ag = T.agcp, dj = boite(0.105, 0.2, 0.065, mat(0xe9e7e0, { roughness: 0.45 })); dj.position.set(0, -0.125, 0.044); Bp.add(dj);
    const lb = panneau(0.095, 0.03, etiquette([{ t: "Disjoncteur de branchement", taille: 17 }, { t: `${ag.calibre} A · ${ag.sensibilite} mA`, taille: 24 }], { w: 256, h: 80 })); lb.position.set(0, -0.055, 0.0768); Bp.add(lb);
    manette(Bp, ag.id, 0.012, -0.115, 0.077, 0.03, M.noir, 0.03);
    const zm = boite(0.06, 0.09, 0.05, M.invisible); zm.position.set(0.02, -0.12, 0.1); Bp.add(zm); cible(`manette:${ag.id}`, zm, ["v:branchement"]);
    boutonTest(Bp, ag.id, -0.032, -0.105, 0.0768, "v:branchement", 0.007);
    const reg = panneau(0.07, 0.014, etiquette(`Réglé sur ${ag.calibre} A`, { w: 224, h: 44, taille: 24, fond: null })); reg.position.set(0, -0.2, 0.0768); Bp.add(reg);
    const zb = boite(0.27, 0.47, 0.12, M.invisible); zb.position.z = 0.06; Bp.add(zb); cible("approcher:branchement", zb, [lieuId, "v:tableau"]);
    vueProche("v:branchement", lieuId, Bp, 0.3, { hauteur: 0.5, nom: "le compteur et le disjoncteur de branchement", court: "Compteur, disj. de branchement", centre: V(0, 0, 0.08) });
  }

  /* =====================  Lieux  ===================== */
  const lieux = {};
  const blancMat = mat(0xf3f1ec, { roughness: 0.5 });
  Object.entries(N.plan.lieux).forEach(([id, lieu], k) => {
    const G = new THREE.Group(); G.position.set(k * ECART, 0, 0); G.updateMatrixWorld(true); scene.add(G);
    const [lx, lz] = lieu.taille; lieu.h = lieu.h || 2.5; lieu.cle = null;
    const sol = new THREE.Mesh(new THREE.PlaneGeometry(lieu.ext ? 60 : lx, lieu.ext ? 60 : lz), (sols[lieu.sol] || sols.bois)(lieu)); sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; G.add(sol);
    if (lieu.ext && lieu.dalle) { const d = boite(lieu.dalle[0], 0.04, lieu.dalle[1], lieu.dalle[3] ? sols[lieu.dalle[3]](lieu, lieu.dalle) : M.dalle); d.castShadow = false; d.position.set(0, 0.02, lieu.dalle[2] || 0); G.add(d); }
    if (!lieu.ext) {
      for (const m of ["N", "S", "E", "O"]) {
        const s = surMur(lieu, m, 0, lieu.h / 2), lg = m === "N" || m === "S" ? lx : lz, w = boite(lg, lieu.h, 0.06, M.mur); w.position.copy(s.p).addScaledVector(s.n, -0.03); w.rotation.y = s.r; G.add(w);
        const pl = boite(lg, 0.08, 0.012, blancMat); pl.castShadow = false; pl.position.copy(s.p).setY(0.04).addScaledVector(s.n, 0.006); pl.rotation.y = s.r; G.add(pl);
      }
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(lx, lz), M.plafond); pl.rotation.x = Math.PI / 2; pl.position.y = lieu.h; G.add(pl);
    }
    lieux[id] = { G, lieu, lampes: [] };
    vues[id] = { lieu: id, parent: null, libre: true, nom: lieu.nom, court: lieu.court, lieuRaccourci: lieu.raccourci, cadre: () => ({ pos: G.localToWorld(V(...(lieu.camera || [0, 1.62, lz / 2 - 0.5]))), yaw: lieu.yaw || 0, pitch: lieu.pitch || -0.12 }) };
    for (const o of lieu.objets) {
      if (o.si && !o.si(P)) continue;
      const g = new THREE.Group(); G.add(g);
      if (o.mur) { const s = surMur(lieu, o.mur, o.u || 0, o.y === undefined ? 1.2 : o.y); g.position.copy(s.p); g.rotation.y = s.r; }
      else g.position.set(o.x || 0, o.y || 0, o.z || 0), g.rotation.y = o.r || 0;
      if (decor.poser(o, id, lieu, G, g)) continue;
      if (o.t === "prise") prise(o, id, g);
      else if (o.t === "inter") inter(o, id, g);
      else if (o.t === "plafonnier") { G.remove(g); plafonnier(o, lieu, G, id); }
      else if (o.t === "tableau") tableau(o, id, g, lieu);
      else if (o.t === "boite") boiteDerivation(o, id, g, o);
      else if (o.t === "borne") { G.remove(g); borneJardin(o, id, G); }
      else if (o.t === "porte") {
        const nomVers = `${N.plan.lieux[o.vers].raccourci} →`;
        if (lieu.ext && !o.facade) { // dehors, sans mur : un poteau et sa pancarte
          const pot = boite(0.07, 1.5, 0.07, M.bois); pot.position.set(0, -0.275, 0); g.add(pot);
          const lbl = panneau(0.7, 0.2, etiquette(nomVers, { w: 512, h: 144, taille: 64, fond: "#22262d", coul: "#ffe08a" })); lbl.position.set(0, 0.35, 0.04); g.add(lbl);
          const z = boite(0.9, 1.7, 0.2, M.invisible); z.position.set(0, -0.1, 0.02); g.add(z); cible(`aller:${o.vers}`, z, [id]);
        } else {
          for (const [w, h, x, y] of [[1.0, 0.07, 0, 1.035], [0.07, 2.07, -0.465, 0], [0.07, 2.07, 0.465, 0]]) { const b = boite(w, h, 0.07, blancMat); b.position.set(x, y, 0.005); g.add(b); }
          const vant = boite(0.86, 2.0, 0.04, o.facade ? mat(0x39424d, { roughness: 0.15, metalness: 0.3 }) : mat(0xf1ede3, { roughness: 0.55 })); vant.position.set(0, -0.02, 0.012); g.add(vant);
          if (!o.facade) for (const [y, h] of [[-0.55, 0.75], [0.42, 0.95]]) { const p = boite(0.62, h, 0.006, mat(0xe4dfd3, { roughness: 0.6 })); p.position.set(0, y, 0.034); p.castShadow = false; g.add(p); }
          const bq = cyl(0.011, 0.011, 0.12, M.acier, 10); bq.rotation.z = Math.PI / 2; bq.position.set(0.3, -0.03, 0.07); g.add(bq);
          const lbl = panneau(0.5, 0.125, etiquette(nomVers, { w: 512, h: 128, taille: 64, fond: "#22262d", coul: "#ffe08a" })); lbl.position.set(0, 0.62, 0.042); g.add(lbl);
          cible(`aller:${o.vers}`, vant, [id]);
        }
        lieux[id].portes = { ...(lieux[id].portes || {}), [o.vers]: g };
      } else if (o.t === "marches") {
        const [lx2, lz2] = lieu.taille, pas = (lz2 - 1.2) / o.n;
        for (let i = 0; i < o.n; i++) { const hm = (o.haut / o.n) * (i + 1), s = boite(lx2 - 0.1, hm, pas, M.bois); s.position.set(0, hm / 2, lz2 / 2 - 1.0 - pas * (i + 0.5)); g.add(s); }
        const pal = boite(lx2 - 0.1, 0.06, 0.25, M.bois); pal.position.set(0, o.haut, -lz2 / 2 + 0.12); g.add(pal);
      } else if (o.t === "indice") {
        const w = boite(o.w, 0.012, o.d, mat(0xf2f2ee, { roughness: 0.6 })); w.position.y = 0.008; g.add(w);
        const z = boite(o.w + 0.2, 0.25, o.d + 0.3, M.invisible); z.position.y = 0.1; g.add(z); cible(`regarder:${o.id}`, z, [id]);
      } else if (o.t === "trappe") {
        g.userData.trappe = true; g.position.y = o.bas ? 0.01 : lieu.h - 0.01;
        const pan = boite(0.6, 0.02, 0.6, mat(o.bas ? 0x1c2026 : 0xcfc8b8, { roughness: 0.9 })); g.add(pan);
        const lbl = panneau(0.5, 0.13, etiquette(`${N.plan.lieux[o.vers].raccourci} ${o.bas ? "↓" : "↑"}`, { w: 512, h: 128, taille: 60, fond: "#22262d", coul: "#ffe08a" })); lbl.position.set(0.31, o.bas ? 0.12 : -0.1, 0); lbl.rotation.y = Math.PI / 2; g.add(lbl);
        const zone = boite(0.7, 0.3, 0.7, M.invisible); zone.position.y = o.bas ? 0.1 : -0.1; g.add(zone); cible(`aller:${o.vers}`, zone, [id]); lieux[id].portes = { ...(lieux[id].portes || {}), [o.vers]: g };
      } else if (o.t === "mur") { const w = boite(o.w, o.h, 0.2, M.crepi); w.position.set(0, o.h / 2 - (o.y || 0), -0.1); g.add(w); }
      else if (o.t === "meuble") { const w = boite(o.w, o.h, o.d, M[o.m] || mat(o.c || 0x6b5a48)); w.position.y = o.h / 2; g.add(w); if (o.voyant) { const v = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), new THREE.MeshStandardMaterial({ color: 0x1c3a1c, emissive: 0x35ff5a, emissiveIntensity: 0 })); v.position.set(o.w / 2 - 0.06, o.h - 0.08, o.d / 2 + 0.005); g.add(v); voyants[o.id] = v.material; } if (o.id) cible(`essayer:${o.id}`, w, [id]); }
      else if (o.t === "terre") { const w = new THREE.Mesh(new THREE.CircleGeometry(0.45, 18), M.terre); w.rotation.x = -Math.PI / 2; w.scale.set(1, 2.4, 1); w.position.y = 0.012; g.add(w); for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.035 + (i % 3) * 0.012), M.terre); m.position.set(Math.sin(i * 2.1) * 0.3, 0.03, Math.cos(i * 1.7) * 0.8); g.add(m); } }
      else if (o.t === "bordure") { const w = boite(0.08, 0.1, o.l, M.dalle); w.position.y = 0.05; g.add(w); }
      else if (o.t === "portillon") { for (const dx of [-0.6, 0.6]) { const p = boite(0.1, 1.2, 0.1, M.bois); p.position.set(dx, 0.6, 0); g.add(p); } for (let i = 0; i < 7; i++) { const b = boite(0.07, 0.95, 0.03, M.bois); b.position.set(-0.45 + i * 0.15, 0.55, 0); g.add(b); } }
    }
    // une pièce sans fenêtre : le jour y arrive par le haut (porte vitrée, pièces voisines)
    if (!lieu.ext && !lieu.cle) lieu.cle = { pos: V(0, lieu.h + 1.3, 0), vers: V(0, 0, 0), force: 30, angle: 1.0 };
  });

  /* =====================  Lumières, ciel, pluie  ===================== */
  // Le nombre de lumières ne change jamais (une lumière clé qui porte les ombres, quatre lampes, le ciel, la frontale) :
  // on les déplace dans le lieu où se trouve le joueur. C'est ce qui garde le jeu fluide au téléphone.
  const petit = Math.min(innerWidth, innerHeight) < 600;
  const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x54493a, 1); scene.add(hemi);
  const soleil = new THREE.DirectionalLight(0xfff2dc, 1); soleil.castShadow = true; soleil.shadow.mapSize.set(petit ? 1024 : 2048, petit ? 1024 : 2048); Object.assign(soleil.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 }); soleil.shadow.bias = -0.0006; soleil.shadow.normalBias = 0.03; scene.add(soleil); scene.add(soleil.target);
  const cle = new THREE.SpotLight(0xfff4e6, 0, 16, 1.2, 0.6, 1.2); cle.castShadow = true; cle.shadow.mapSize.set(petit ? 512 : 1024, petit ? 512 : 1024); cle.shadow.camera.near = 0.25; cle.shadow.camera.far = 12; cle.shadow.bias = -0.0008; cle.shadow.normalBias = 0.02; scene.add(cle); scene.add(cle.target);
  const bassin = [0, 1, 2, 3].map(() => { const p = new THREE.PointLight(0xffe6c0, 0, 8, 1.6); scene.add(p); return p; });
  const frontale = new THREE.SpotLight(0xfff4e0, 0, 16, 0.62, 0.7, 1.4);
  // pluie : des traits qui tombent, autour du joueur
  const NG = 1100, gouttes = new THREE.BufferGeometry(); { const p = new Float32Array(NG * 6); for (let i = 0; i < NG; i++) { const x = (Math.random() - 0.5) * 16, y = Math.random() * 7, z = (Math.random() - 0.5) * 16; p.set([x, y, z, x + 0.02, y - 0.22, z], i * 6); } gouttes.setAttribute("position", new THREE.BufferAttribute(p, 3)); }
  const pluie = new THREE.LineSegments(gouttes, new THREE.LineBasicMaterial({ color: 0xb8cdf0, transparent: true, opacity: 0.42 })); pluie.visible = false; pluie.frustumCulled = false; scene.add(pluie);
  // ciels (photos libres) : fond dehors, reflets partout
  let dernier = null;
  if (renderer) for (const nom of ["interieur", "jour", "nuit"]) if (!cieux[nom]) {
    cieux[nom] = {}; charge.load(`${base}../textures/ciel_${nom}.jpg`, (t) => { t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; const pm = new THREE.PMREMGenerator(renderer); cieux[nom] = { fond: t, env: pm.fromEquirectangular(t).texture }; pm.dispose(); if (monde.rafraichir) monde.rafraichir(); });
  }

  // ---- mise à jour d'après l'état du moteur
  // un fil sorti de sa borne par la panne (tant qu'elle n'est pas réparée)
  const sorti = (cid, ext) => inst.actives(P.e).some((p) => (p.type === "connexion_desserree" || p.type === "neutre_coupe_boite") && p.conducteur === cid && p.extremite === ext);
  const fondSombre = new THREE.Color(0x0b0d11), tmp = V(0, 0, 0);
  function maj(lieuCourant, libreVue = true, vue = lieuCourant) {
    dernier = [lieuCourant, libreVue, vue];
    const e = P.e, r = P.calc(), vraieNuit = e.env.heure >= 18 || e.env.heure < 7, pl = N.plan.lieux[lieuCourant], nuit = vraieNuit || !!pl.sombre, ext = !!pl.ext, X = lieux[lieuCourant], O = X.G.position;
    scene.updateMatrixWorld(true);
    const ciel = ext ? (nuit ? cieux.nuit : cieux.jour) : cieux.interieur;
    scene.environment = (ciel && ciel.env) || null; scene.environmentIntensity = ext ? (nuit ? 0.55 : 0.85) : nuit ? 0.04 : 0.95;
    scene.background = ext && ciel && ciel.fond ? ciel.fond : fondSombre; scene.backgroundIntensity = ext && nuit ? 0.6 : 1;
    hemi.intensity = nuit ? (ext ? 0.12 : 0.05) : ext ? 0.55 : 0.75;
    soleil.intensity = ext ? (nuit ? 0.28 : 2.3) : 0; soleil.color.set(nuit ? 0x8fa8d8 : 0xfff2dc); soleil.position.copy(O).add(tmp.set(6, 10, 4)); soleil.target.position.copy(O);
    frontale.intensity = nuit ? (lieuCourant && !libreVue ? 1.2 : 3.4) : 0;
    // la lumière clé d'une pièce : le jour par la fenêtre ; la nuit, le plafonnier s'il est allumé
    const plaf = sources.find((s) => s.lieu === lieuCourant && s.plafond && s.on(r)), K = pl.cle;
    if (ext || (!K && !plaf)) cle.intensity = 0;
    else if (!nuit && K) { cle.position.copy(O).add(K.pos); cle.target.position.copy(O).add(K.vers); cle.color.set(0xfff4e6); cle.intensity = K.force; cle.angle = K.angle; }
    else if (plaf) { plaf.obj.getWorldPosition(cle.position); cle.target.position.copy(cle.position).setY(0); cle.position.y += 1.6; cle.color.set(0xffdcae); cle.intensity = 26; cle.angle = 1.0; }
    else cle.intensity = 0;
    // les lampes du lieu où l'on se trouve (les autres pièces sont loin)
    const ici = sources.filter((s) => s.lieu === lieuCourant);
    bassin.forEach((p, i) => { const s = ici[i]; if (!s) { p.intensity = 0; return; } s.obj.getWorldPosition(p.position); p.color.set(s.couleur); p.distance = s.portee; p.intensity = s.on(r) ? s.force * (s.plafond && nuit ? 0.6 : 1) : 0; });
    for (const s of sources) { const on = s.on(r); for (const m of s.mats) m.emissiveIntensity = on ? (s.k || 2.4) : 0; }
    for (const t of temoins) t(r, e, lieuCourant, nuit);
    for (const [id, m] of Object.entries(voyants)) m.emissiveIntensity = r.fonctionne(id) ? 3 : 0;
    for (const v of voyantsTension) v.m.emissiveIntensity = r.tension(v.borne, "terre.PE") >= 50 ? 4 : 0;
    for (const [id, x] of Object.entries(manettes)) x.vers = e.positions[id] ? -0.62 : 0.62;
    for (const [id, io] of Object.entries(fenetresIO)) io.material = e.positions[id] ? matIO.I : matIO.O;
    for (const [id, t] of Object.entries(touches)) t.rotation.x = e.positions[id] ? -0.09 : 0.09;
    for (const [id, s] of Object.entries(selecteurs)) s.rotation.z = { auto: 0.9, I: 0, 0: -0.9 }[e.modes[id]] || 0;
    for (const [id, C] of Object.entries(cadrans)) dessinerCadran(C, e.cadrans[id], inst.organe[id]);
    if (afficheCompteur) afficheCompteur(r.tension(`${L.tableau.agcp.id}.Lin`, `${L.tableau.agcp.id}.Nin`) >= 50 ? (inst.heuresCreuses(e) ? "H CREUSES" : "H PLEINES") : "");
    if (porteTableau) porteTableau.vers = vue === "v:tableau" || String(vue).startsWith("v:rangee") ? -1.95 : 0;
    for (const [id, c] of Object.entries(capots)) c.visible = !P.ouverts.has(id);
    for (const [id, I] of Object.entries(interieurs)) { I.G.visible = P.ouverts.has(id); for (const f of I.fils) { const d = !!e.deconnecte[`${f.c.id}:${f.ext}`] || sorti(f.c.id, f.ext); f.fil.position.y = f.sens * (d ? 0.03 : 0.012) * I.ech; f.fil.position.z = d ? 0.024 : 0.012; f.fil.rotation.z = d ? f.sens * 0.25 : 0; } }
    // sous la pluie, les sols d'extérieur brillent et les flaques apparaissent
    for (const w of mouillables) { w.m.roughness = e.env.pluie ? 0.3 : 1; w.m.color.copy(w.c).multiplyScalar(e.env.pluie ? 0.5 : 1); }
    pluie.visible = !!e.env.pluie && ext; if (pluie.visible) pluie.position.copy(O);
    if (renderer) renderer.shadowMap.needsUpdate = true;
    monde.ambiance = { pluie: !!e.env.pluie, dehors: ext, ronron: (N.plan.ronrons || []).some((x) => x.lieu === lieuCourant && r.fonctionne(x.id)) };
  }
  function dessinerCadran(C, heure, org) {
    const g = C.g; g.fillStyle = "#f6f3ea"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#2b2f34"; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 112, 0, 7); g.stroke();
    // plage d'allumage (cavaliers), puis les heures
    g.strokeStyle = "#e8790c"; g.lineWidth = 14; g.beginPath(); g.arc(128, 128, 100, (org.debut / 24) * 2 * Math.PI - Math.PI / 2, (org.fin / 24) * 2 * Math.PI - Math.PI / 2); g.stroke();
    g.fillStyle = "#1d2228"; g.font = "700 26px system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    for (const h of [0, 6, 12, 18]) { const a = (h / 24) * 2 * Math.PI - Math.PI / 2; g.fillText(String(h), 128 + Math.cos(a) * 74, 128 + Math.sin(a) * 74); }
    g.strokeStyle = "#8d949c"; g.lineWidth = 2; for (let h = 0; h < 24; h++) { const a = (h / 24) * 2 * Math.PI - Math.PI / 2; g.beginPath(); g.moveTo(128 + Math.cos(a) * 104, 128 + Math.sin(a) * 104); g.lineTo(128 + Math.cos(a) * 110, 128 + Math.sin(a) * 110); g.stroke(); }
    const a = (heure / 24) * 2 * Math.PI - Math.PI / 2; g.strokeStyle = "#c8261e"; g.lineWidth = 8; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); g.stroke();
    const m = Math.round(heure * 60) % 1440; g.fillStyle = "#1d2228"; g.font = "700 30px ui-monospace, Menlo, monospace"; g.fillText(`${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`, 128, 176);
    C.t.needsUpdate = true;
  }
  // ce qui bouge d'une image à l'autre : manettes, porte du tableau, boutons, pluie
  let enCharge = true;
  function animer(dt) {
    const k = Math.min(1, dt * 22);
    for (const x of Object.values(manettes)) if (x.a !== x.vers) { x.a += (x.vers - x.a) * k; if (Math.abs(x.vers - x.a) < 0.01) x.a = x.vers; x.piv.rotation.x = x.a; }
    if (porteTableau && porteTableau.a !== porteTableau.vers) { const p = porteTableau; p.a += (p.vers - p.a) * Math.min(1, dt * 7); if (Math.abs(p.vers - p.a) < 0.01) p.a = p.vers; p.pivot.rotation.y = p.a; }
    for (const b of Object.values(boutonsTest)) if (b.t > 0) { b.t = Math.max(0, b.t - dt * 5); b.b.position.z = b.z - 0.0025 * Math.sin(b.t * Math.PI); }
    if (pluie.visible) { const p = gouttes.attributes.position; for (let i = 0; i < NG; i++) { let y = p.getY(i * 2) - dt * 11; if (y < 0.2) y += 7; p.setY(i * 2, y); p.setY(i * 2 + 1, y - 0.22); } p.needsUpdate = true; }
    // tant que des modèles arrivent, les ombres sont recalculées
    if (enCharge && renderer) { renderer.shadowMap.needsUpdate = true; if (decor.suivi.faits >= decor.suivi.total) enCharge = false; }
  }
  const monde = { scene, cibles, vues, lieux, frontale, M, maj, animer, sorti, decor, ambiance: {}, appuyerTest: (id) => { if (boutonsTest[id]) boutonsTest[id].t = 1; }, rafraichir: () => { if (dernier) maj(...dernier); },
    // pour les contrôles automatiques : ce que montre le tableau (angle des manettes, fenêtres I/O, porte, sélecteurs, voyants)
    controle: () => ({ manettes: Object.fromEntries(Object.entries(manettes).map(([k, x]) => [k, +x.a.toFixed(2)])), io: Object.fromEntries(Object.entries(fenetresIO).map(([k, x]) => [k, x.material === matIO.I ? "I" : "O"])), porte: porteTableau ? +porteTableau.a.toFixed(2) : null, selecteurs: Object.fromEntries(Object.entries(selecteurs).map(([k, x]) => [k, +x.rotation.z.toFixed(2)])), voyants: Object.fromEntries(voyantsTension.map((v) => [v.borne, v.m.emissiveIntensity > 0])) }) };
  return monde;
}
