// Monde 3D des niveaux 2 à 6 : il est construit par le code à partir du plan du niveau (lieux, objets) et du
// logement du moteur. Ce qu'on voit correspond à ce qui est câblé : le tableau montre les appareils du moteur,
// une boîte ouverte montre exactement les conducteurs du moteur, à leurs couleurs.
// Couleurs : rouge = phase, bleu = neutre, vert-jaune = terre, orange = retour lampe, blanc = retour bouton-poussoir.
import * as THREE from "../three.module.min.js";

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
  const tex = (f, rep) => { const t = charge.load(`${base}../textures/${f}`); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); return t; };
  const M = {
    mur: mat(0xe9e3d6, { roughness: 0.92 }), plafond: mat(0xf2efe8, { roughness: 0.95 }), plastique: mat(0xf4f4f1, { roughness: 0.35 }), gris: mat(0x8d949c), noir: mat(0x1b1d20, { roughness: 0.5 }),
    laiton: mat(0xc9a44a, { metalness: 0.85, roughness: 0.3 }), cuivre: mat(0xd98a4a, { metalness: 0.9, roughness: 0.3 }), acier: mat(0xb9bfc6, { metalness: 0.8, roughness: 0.35 }),
    invisible: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), bois: mat(0x8a6a4a), crepi: mat(0xd9cdb8, { roughness: 1 }), herbe: mat(0x3f6a35, { roughness: 1 }), dalle: mat(0xa9a59c, { roughness: 0.95 }),
    carrelage: mat(0xc9c4b8, { roughness: 0.5 }), beton: mat(0x8f8d88, { roughness: 0.95 }), terre: mat(0x4a3526, { roughness: 1 }), blanc: mat(0xfafafa, { roughness: 0.4 }), tissu: mat(0x4a5a78, { roughness: 0.95 }),
    eau: mat(0x6fa8d8, { roughness: 0.1, transparent: true, opacity: 0.6 }),
  };
  const sols = { bois: () => mat(0xffffff, { map: tex("wood_floor_diff.jpg", [3, 3]), roughness: 0.7 }), carrelage: () => M.carrelage, beton: () => M.beton, dalle: () => M.dalle, herbe: () => M.herbe };

  const cibles = []; // { id, objet, vues: [vue], type: "surface" | "point", rayon }
  const cible = (id, objet, vues, extra = {}) => { objet.userData.cible = id; cibles.push({ id, objet, vues, type: "surface", ...extra }); return objet; };
  const point = (id, objet, vues, rayon = 0.011) => { cibles.push({ id, objet, vues, type: "point", rayon }); return objet; };
  const vues = {};   // id → { lieu, parent, nom, court, libre?, cadre: () => { pos, cible } }
  const lampes = {}, voyants = {}, manettes = {}, capots = {}, interieurs = {}, cadrans = {}, selecteurs = {}, touches = {};
  const inst = P.inst, L = N.logement;

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
  function vueProche(id, lieuId, groupe, largeur, { nom, court, parent, centre = V(0, 0, 0), haut = 0 } = {}) {
    vues[id] = { lieu: lieuId, parent: parent || lieuId, nom, court: court || nom, cadre(camera) {
      groupe.updateMatrixWorld(true); const d = largeur / largeurVue(camera);
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
    const lum = new THREE.PointLight(0xffe6c0, 0, 9, 1.6); lum.position.y = -0.1; g.add(lum);
    lampes[o.id] = { lum, mats: [abat.material, amp.material], force: 7 * Math.min(1, (Math.min(...lieu.taille) / 3) ** 2) };
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
    const lum = new THREE.PointLight(0xffe2b0, 0, 6, 1.8); lum.position.y = 0.62; g.add(lum);
    lampes[o.id] = { lum, mats: [verre.material], force: 5 };
    const tete = new THREE.Group(); tete.position.set(0, 0.36, 0.05); g.add(tete);
    const capot = boite(0.085, 0.1, 0.008, mat(0x3a3f46, { metalness: 0.4, roughness: 0.5 })); capot.position.z = 0.004; tete.add(capot); capots[o.id] = capot; cible(`ouvrir:${o.id}`, capot, [`v:${o.id}`]);
    interieur(o.id, tete, `v:${o.id}`, 0.62);
    if (typeof o.buee === "function" ? o.buee(P) : o.buee) { const b = cyl(0.051, 0.051, 0.06, mat(0xffffff, { transparent: true, opacity: 0.55, roughness: 1 }), 20); b.position.y = 0.6; g.add(b); }
    const zone = boite(0.3, 0.8, 0.3, M.invisible); zone.position.y = 0.4; g.add(zone); cible(`approcher:${o.id}`, zone, [lieuId]);
    vueProche(`v:${o.id}`, lieuId, tete, 0.13, { nom: inst.organe[o.id].nom.toLowerCase(), court: inst.organe[o.id].nom, haut: 0.25 });
  }

  /* =====================  Tableau  ===================== */
  function tableau(o, lieuId, g) {
    const T = L.tableau, extras = (N.plan.tableau && N.plan.tableau.extras) || {};
    const rangs = T.differentiels.map((d) => [{ id: d.id, genre: "id", w: 2 }, ...T.disjoncteurs.filter((q) => q.differentiel === d.id).map((q) => ({ id: q.id, genre: "dj", w: 1 })), ...(extras[d.id] || []).map((x) => ({ id: x, genre: inst.organe[x].type, w: inst.organe[x].type === "horloge" ? 3 : 2 }))]);
    const larg = Math.max(...rangs.map((r) => r.reduce((s, a) => s + a.w, 0))) * MOD + 0.05, haut = rangs.length * 0.17 + 0.09;
    const coffret = boite(larg, haut, 0.09, M.plastique); coffret.position.z = 0.045; g.add(coffret);
    const fond = boite(larg - 0.03, haut - 0.03, 0.002, mat(0xe6e6e2, { roughness: 0.8 })); fond.position.z = 0.0915; g.add(fond);
    const zone = boite(larg, haut, 0.12, M.invisible); zone.position.z = 0.06; g.add(zone); cible("approcher:tableau", zone, [lieuId]);
    vueProche("v:tableau", lieuId, g, larg + 0.04, { nom: "le tableau", court: "Le tableau", centre: V(0, 0, 0.1) });
    vues["v:tableau"].lieuRaccourci = "Tableau";
    rangs.forEach((rang, r) => {
      const y = haut / 2 - 0.12 - r * 0.17, R = new THREE.Group(); R.position.set(0, y, 0.093); g.add(R);
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
          const p = inst.protections.find((k) => k.id === a.id);
          const face = boite(w - 0.004, 0.045, 0.012, M.plastique); face.position.z = 0.05; m.add(face);
          const lbl = panneau(w - 0.003, 0.018, etiquette(a.genre === "id" ? [{ t: `${p.calibre} A`, taille: 30 }, { t: `30 mA ${p.type}`, taille: 22 }] : [{ t: `C${p.calibre}`, taille: 34 }], { w: a.genre === "id" ? 160 : 96, h: 80 })); lbl.position.set(0, -0.031, 0.0456); m.add(lbl);
          const lev = boite(a.genre === "id" ? 0.012 : 0.008, 0.016, 0.014, a.genre === "id" ? mat(0x2a4fa8) : M.noir); lev.position.set(0, 0.009, 0.058); m.add(lev); manettes[a.id] = lev;
          const z = boite(w - 0.001, 0.07, 0.07, M.invisible); z.position.set(0, 0.006, 0.035); m.add(z); cible(`manette:${a.id}`, z, [vue]);
          // bornes de sortie, en bas : le neutre à gauche, la phase à droite et un peu plus bas (pour bien les distinguer)
          for (const [b, dx, dy, mm] of [["Nout", -w * 0.25, -0.05, mat(0x2f6fd0)], ["Lout", w * 0.25, -0.064, M.laiton]]) { const t = cyl(0.0032, 0.0032, 0.006, mm, 12); t.rotation.x = Math.PI / 2; t.position.set(dx, dy, 0.03); m.add(t); point(`${a.id}.${b}`, t, [vue], 0.0075); }
          etiq.push([x + w / 2, w, a.genre === "id" ? `Diff. ${r + 1}` : p.etiquette]);
        } else if (a.genre === "horloge") {
          const C = toile(256, 256), cad = panneau(0.044, 0.044, C.t); cad.position.set(0, 0.012, 0.0456); m.add(cad); cadrans[a.id] = C;
          cible(`regarder:${a.id}`, cad, [vue]);
          const sel = cyl(0.006, 0.006, 0.006, M.noir, 16); sel.rotation.x = Math.PI / 2; sel.position.set(-0.014, -0.028, 0.048); m.add(sel); selecteurs[a.id] = sel; const zs = boite(0.024, 0.022, 0.02, M.invisible); zs.position.set(-0.014, -0.028, 0.05); m.add(zs); cible(`mode:${a.id}`, zs, [vue]);
          const reg = boite(0.02, 0.014, 0.004, mat(0xe8790c)); reg.position.set(0.014, -0.028, 0.047); m.add(reg); cible(`regler:${a.id}`, reg, [vue]);
          const l = panneau(0.05, 0.008, etiquette("auto · I · 0      à l'heure", { w: 320, h: 48, taille: 24, fond: null })); l.position.set(0, -0.0395, 0.0456); m.add(l);
          for (const [b, dx] of [["1", -0.012], ["2", 0.012]]) { const t = cyl(0.0032, 0.0032, 0.006, b === "2" ? mat(0xe8790c) : M.laiton, 12); t.rotation.x = Math.PI / 2; t.position.set(dx, -0.058, 0.03); m.add(t); point(`${a.id}.${b}`, t, [vue], 0.0085); }
          etiq.push([x + w / 2, w, "Horloge allée"]);
        } else if (a.genre === "contacteur") {
          const lbl = panneau(w - 0.004, 0.02, etiquette(["HC", { t: "auto · I · 0", taille: 20 }], { w: 128, h: 80 })); lbl.position.set(0, 0.022, 0.0456); m.add(lbl);
          const sel = cyl(0.006, 0.006, 0.006, M.noir, 16); sel.rotation.x = Math.PI / 2; sel.position.set(0, -0.006, 0.048); m.add(sel); selecteurs[a.id] = sel; const zs = boite(w - 0.004, 0.03, 0.02, M.invisible); zs.position.set(0, -0.006, 0.05); m.add(zs); cible(`mode:${a.id}`, zs, [vue]);
          const t = cyl(0.0032, 0.0032, 0.006, M.laiton, 12); t.rotation.x = Math.PI / 2; t.position.set(0, -0.058, 0.03); m.add(t); point(`${a.id}.2`, t, [vue], 0.0085);
          etiq.push([x + w / 2, w, "Contacteur"]);
        }
        x += w;
      }
      // bande d'étiquettes au-dessus de la rangée
      const B = toile(1024, 96), gg = B.g; gg.fillStyle = "#fbfaf6"; gg.fillRect(0, 0, 1024, 96); gg.fillStyle = "#1d2a5a"; gg.textAlign = "center";
      for (const [cx, w, t] of etiq) { const px = ((cx + total / 2) / total) * 1024, lw = (w / total) * 1024; const mots = t.split(" "); gg.font = `600 ${lw < 90 ? 19 : 24}px "Bradley Hand", "Segoe Print", cursive`; const l1 = mots.slice(0, Math.ceil(mots.length / 2)).join(" "), l2 = mots.slice(Math.ceil(mots.length / 2)).join(" "); gg.fillText(l1, px, l2 ? 38 : 56, lw - 6); if (l2) gg.fillText(l2, px, 70, lw - 6); gg.strokeStyle = "#c9c4b8"; gg.strokeRect(px - lw / 2, 0, lw, 96); }
      B.t.needsUpdate = true; const bande = panneau(total, 0.02, B.t); bande.position.set(0, 0.058, 0.014); R.add(bande);
      // vues de la rangée
      let x0 = -total / 2;
      groupes.forEach((grp, k) => {
        const wg = grp.reduce((s, a) => s + a.w, 0) * MOD, id = `v:rangee${r + 1}${k ? "b" : ""}`;
        const z = boite(wg, 0.12, 0.08, M.invisible); z.position.set(x0 + wg / 2, 0, 0.04); R.add(z); cible(`approcher:${id.slice(2)}`, z, ["v:tableau"]);
        const tr = boite(0.03, 0.012, 0.012, mat(0x4a9a35)); tr.position.set(x0 + wg / 2, -0.088, 0.02); R.add(tr);
        const vt = cyl(0.004, 0.004, 0.006, M.laiton, 12); vt.rotation.x = Math.PI / 2; vt.position.set(x0 + wg / 2, -0.088, 0.028); R.add(vt); point("bt.PE", vt, [id], 0.0095);
        vueProche(id, lieuId, R, Math.max(0.105, wg + 0.012), { nom: k ? "l'horloge et le contacteur" : `la rangée ${r ? "du bas" : "du haut"}`, court: k ? "Horloge, contacteur" : `Rangée ${r ? "du bas" : "du haut"}`, parent: "v:tableau", centre: V(x0 + wg / 2, -0.01, 0.07) });
        x0 += wg;
      });
    });
  }

  /* =====================  Lieux  ===================== */
  const lieux = {};
  Object.entries(N.plan.lieux).forEach(([id, lieu], k) => {
    const G = new THREE.Group(); G.position.set(k * ECART, 0, 0); scene.add(G);
    const [lx, lz] = lieu.taille; lieu.h = lieu.h || 2.5;
    const sol = new THREE.Mesh(new THREE.PlaneGeometry(lieu.ext ? 30 : lx, lieu.ext ? 30 : lz), (sols[lieu.sol] || sols.bois)()); sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; G.add(sol);
    if (lieu.ext && lieu.dalle) { const d = boite(lieu.dalle[0], 0.04, lieu.dalle[1], M.dalle); d.position.set(0, 0.02, lieu.dalle[2] || 0); G.add(d); }
    if (!lieu.ext) {
      for (const m of ["N", "S", "E", "O"]) { const s = surMur(lieu, m, 0, lieu.h / 2), w = boite(m === "N" || m === "S" ? lx : lz, lieu.h, 0.06, M.mur); w.position.copy(s.p).addScaledVector(s.n, -0.03); w.rotation.y = s.r; G.add(w); }
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(lx, lz), M.plafond); pl.rotation.x = Math.PI / 2; pl.position.y = lieu.h; G.add(pl);
    }
    lieux[id] = { G, lieu, lampes: [] };
    vues[id] = { lieu: id, parent: null, libre: true, nom: lieu.nom, court: lieu.court, lieuRaccourci: lieu.raccourci, cadre: () => ({ pos: G.localToWorld(V(...(lieu.camera || [0, 1.62, lz / 2 - 0.5]))), yaw: lieu.yaw || 0, pitch: lieu.pitch || -0.12 }) };
    for (const o of lieu.objets) {
      if (o.si && !o.si(P)) continue;
      const g = new THREE.Group(); G.add(g);
      if (o.mur) { const s = surMur(lieu, o.mur, o.u || 0, o.y === undefined ? 1.2 : o.y); g.position.copy(s.p); g.rotation.y = s.r; }
      else g.position.set(o.x || 0, o.y || 0, o.z || 0), g.rotation.y = o.r || 0;
      if (o.t === "prise") prise(o, id, g);
      else if (o.t === "inter") inter(o, id, g);
      else if (o.t === "plafonnier") { G.remove(g); plafonnier(o, lieu, G, id); }
      else if (o.t === "tableau") tableau(o, id, g);
      else if (o.t === "boite") boiteDerivation(o, id, g, o);
      else if (o.t === "borne") { G.remove(g); borneJardin(o, id, G); }
      else if (o.t === "porte") {
        const cadre = boite(0.95, 2.05, 0.05, M.bois); cadre.position.set(0, 0, 0.0); g.add(cadre);
        const trou = boite(0.82, 1.96, 0.052, mat(0x0c0e12, { roughness: 1 })); trou.position.set(0, -0.03, 0.002); g.add(trou);
        const lbl = panneau(0.6, 0.15, etiquette(`${N.plan.lieux[o.vers].raccourci} →`, { w: 512, h: 128, taille: 64, fond: "#22262d", coul: "#ffe08a" })); lbl.position.set(0, 0.7, 0.03); g.add(lbl);
        cible(`aller:${o.vers}`, trou, [id]); lieux[id].portes = { ...(lieux[id].portes || {}), [o.vers]: g };
      } else if (o.t === "trappe") {
        g.userData.trappe = true; g.position.y = o.bas ? 0.01 : lieu.h - 0.01;
        const pan = boite(0.6, 0.02, 0.6, mat(o.bas ? 0x1c2026 : 0xcfc8b8, { roughness: 0.9 })); g.add(pan);
        const lbl = panneau(0.5, 0.13, etiquette(`${N.plan.lieux[o.vers].raccourci} ${o.bas ? "↓" : "↑"}`, { w: 512, h: 128, taille: 60, fond: "#22262d", coul: "#ffe08a" })); lbl.position.set(0.31, o.bas ? 0.12 : -0.1, 0); lbl.rotation.y = Math.PI / 2; g.add(lbl);
        const zone = boite(0.7, 0.3, 0.7, M.invisible); zone.position.y = o.bas ? 0.1 : -0.1; g.add(zone); cible(`aller:${o.vers}`, zone, [id]); lieux[id].portes = { ...(lieux[id].portes || {}), [o.vers]: g };
      } else if (o.t === "mur") { const w = boite(o.w, o.h, 0.2, M.crepi); w.position.set(0, o.h / 2 - (o.y || 0), -0.1); g.add(w); }
      else if (o.t === "meuble") { const w = boite(o.w, o.h, o.d, M[o.m] || mat(o.c || 0x6b5a48)); w.position.y = o.h / 2; g.add(w); if (o.voyant) { const v = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), new THREE.MeshStandardMaterial({ color: 0x1c3a1c, emissive: 0x35ff5a, emissiveIntensity: 0 })); v.position.set(o.w / 2 - 0.06, o.h - 0.08, o.d / 2 + 0.005); g.add(v); voyants[o.id] = v.material; } if (o.id) cible(`essayer:${o.id}`, w, [id]); }
      else if (o.t === "ballon") { const c = cyl(0.26, 0.26, 1.1, M.blanc, 28); c.position.set(0, 0, 0.27); g.add(c); const v = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3a2a12, emissive: 0xff8a1a, emissiveIntensity: 0 })); v.position.set(0, -0.42, 0.53); g.add(v); voyants[o.id] = v.material; cible(`essayer:${o.id}`, c, [id]); }
      else if (o.t === "terre") { const w = new THREE.Mesh(new THREE.CircleGeometry(0.45, 18), M.terre); w.rotation.x = -Math.PI / 2; w.scale.set(1, 2.4, 1); w.position.y = 0.012; g.add(w); for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.035 + (i % 3) * 0.012), M.terre); m.position.set(Math.sin(i * 2.1) * 0.3, 0.03, Math.cos(i * 1.7) * 0.8); g.add(m); } }
      else if (o.t === "bordure") { const w = boite(0.08, 0.1, o.l, M.dalle); w.position.y = 0.05; g.add(w); }
      else if (o.t === "portillon") { for (const dx of [-0.6, 0.6]) { const p = boite(0.1, 1.2, 0.1, M.bois); p.position.set(dx, 0.6, 0); g.add(p); } for (let i = 0; i < 7; i++) { const b = boite(0.07, 0.95, 0.03, M.bois); b.position.set(-0.45 + i * 0.15, 0.55, 0); g.add(b); } }
      else if (o.t === "haie") { const w = boite(o.w, 1.3, 0.5, mat(0x2f5328, { roughness: 1 })); w.position.y = 0.65; g.add(w); }
    }
    if (!lieu.ext && !lieu.sombre) { const amb = new THREE.PointLight(0xfff1e0, 0, 12, 1.4); amb.position.set(0, lieu.h - 0.4, 0); G.add(amb); lieux[id].jour = amb; }
  });

  /* =====================  Lumières, ciel, pluie  ===================== */
  const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x54493a, 1); scene.add(hemi);
  const soleil = new THREE.DirectionalLight(0xfff2dc, 1); soleil.position.set(6, 10, 4); scene.add(soleil);
  const frontale = new THREE.SpotLight(0xfff4e0, 0, 16, 0.62, 0.7, 1.4);
  const gouttes = new THREE.BufferGeometry(); { const n = 900, p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = (Math.random() - 0.5) * 16; p[i * 3 + 1] = Math.random() * 7; p[i * 3 + 2] = (Math.random() - 0.5) * 16; } gouttes.setAttribute("position", new THREE.BufferAttribute(p, 3)); }
  const pluie = new THREE.Points(gouttes, new THREE.PointsMaterial({ color: 0xaac4f0, size: 0.035, transparent: true, opacity: 0.7 })); pluie.visible = false; scene.add(pluie);

  // ---- mise à jour d'après l'état du moteur
  // un fil sorti de sa borne par la panne (tant qu'elle n'est pas réparée)
  const sorti = (cid, ext) => inst.actives(P.e).some((p) => (p.type === "connexion_desserree" || p.type === "neutre_coupe_boite") && p.conducteur === cid && p.extremite === ext);
  function maj(lieuCourant, libreVue = true) {
    const e = P.e, r = P.calc(), vraieNuit = e.env.heure >= 18 || e.env.heure < 7, nuit = vraieNuit || !!N.plan.lieux[lieuCourant].sombre, ext = !!N.plan.lieux[lieuCourant].ext;
    scene.background = new THREE.Color(nuit ? 0x05070c : ext ? 0x9fc4ea : 0x14171c);
    hemi.intensity = nuit ? (ext ? 0.24 : 0.14) : ext ? 1.5 : 0.5; soleil.intensity = nuit ? 0 : ext ? 1.6 : 0.25;
    frontale.intensity = nuit ? (lieuCourant && !libreVue ? 1.2 : 3.4) : 0;
    for (const [id, x] of Object.entries(lieux)) if (x.jour) x.jour.intensity = vraieNuit ? 0 : 3.6 * Math.min(1, (Math.min(...x.lieu.taille) / 3) ** 2);
    for (const [id, l] of Object.entries(lampes)) { const on = r.allume(id); l.lum.intensity = on ? l.force : 0; for (const m of l.mats) m.emissiveIntensity = on ? 2.4 : 0; }
    for (const [id, m] of Object.entries(voyants)) m.emissiveIntensity = r.fonctionne(id) ? 3 : 0;
    for (const [id, lev] of Object.entries(manettes)) lev.position.y = e.positions[id] ? 0.009 : -0.009;
    for (const [id, t] of Object.entries(touches)) t.rotation.x = e.positions[id] ? -0.09 : 0.09;
    for (const [id, s] of Object.entries(selecteurs)) s.rotation.y = { auto: 0, I: 0.9, 0: -0.9 }[e.modes[id]] || 0;
    for (const [id, C] of Object.entries(cadrans)) dessinerCadran(C, e.cadrans[id], inst.organe[id]);
    for (const [id, c] of Object.entries(capots)) c.visible = !P.ouverts.has(id);
    for (const [id, I] of Object.entries(interieurs)) { I.G.visible = P.ouverts.has(id); for (const f of I.fils) { const d = !!e.deconnecte[`${f.c.id}:${f.ext}`] || sorti(f.c.id, f.ext); f.fil.position.y = f.sens * (d ? 0.03 : 0.012) * I.ech; f.fil.position.z = d ? 0.024 : 0.012; f.fil.rotation.z = d ? f.sens * 0.25 : 0; } }
    pluie.visible = e.env.pluie && ext; if (pluie.visible) pluie.position.copy(lieux[lieuCourant].G.position);
  }
  function dessinerCadran(C, heure, org) {
    const g = C.g; g.fillStyle = "#f6f3ea"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#2b2f34"; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 112, 0, 7); g.stroke();
    // plage d'allumage (cavaliers), puis les heures
    g.strokeStyle = "#e8790c"; g.lineWidth = 14; g.beginPath(); g.arc(128, 128, 100, (org.debut / 24) * 2 * Math.PI - Math.PI / 2, (org.fin / 24) * 2 * Math.PI - Math.PI / 2); g.stroke();
    g.fillStyle = "#1d2228"; g.font = "700 26px system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    for (const h of [0, 6, 12, 18]) { const a = (h / 24) * 2 * Math.PI - Math.PI / 2; g.fillText(String(h), 128 + Math.cos(a) * 74, 128 + Math.sin(a) * 74); }
    const a = (heure / 24) * 2 * Math.PI - Math.PI / 2; g.strokeStyle = "#c8261e"; g.lineWidth = 8; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); g.stroke();
    const m = Math.round(heure * 60) % 1440; g.fillStyle = "#1d2228"; g.font = "700 30px ui-monospace, Menlo, monospace"; g.fillText(`${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`, 128, 176);
    C.t.needsUpdate = true;
  }
  function animer(dt) { if (!pluie.visible) return; const p = gouttes.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) - dt * 9; if (y < 0) y += 7; p.setY(i, y); } p.needsUpdate = true; }

  return { scene, cibles, vues, lieux, frontale, M, maj, animer, sorti };
}
