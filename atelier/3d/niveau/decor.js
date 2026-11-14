// Décor habité des niveaux 2 à 6. Les meubles et les objets sont de vrais modèles 3D (glTF) pris dans des banques
// libres (voir ../CREDITS.md) ; seuls l'appareillage électrique, les appareils branchés et le bâti (fenêtres, portes,
// cuisine) sont construits par le code. Chaque appareil branché dépend du moteur : il ne marche que si sa prise est alimentée.
import * as THREE from "../three.module.min.js";
import { GLTFLoader } from "../libs/GLTFLoader.js";
import { MeshoptDecoder } from "../libs/meshopt_decoder.module.js";

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cache = {}; // un modèle n'est téléchargé qu'une fois, même si on rejoue
let chargeur = null;

function toile(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, g: c.getContext("2d"), t }; }

export function creerDecor({ base, M, mat, boite, cyl, cible, pbr, P, inst, sources, temoins, mouillables }) {
  chargeur = chargeur || new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const suivi = { total: 0, faits: 0, parLieu: {} };
  const charger = (f) => cache[f] || (cache[f] = new Promise((res, rej) => chargeur.load(`${base}../modeles/${f}.glb`, (g) => { g.scene.traverse((o) => {
    if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true;
    // un verre « à transmission » oblige à dessiner toute la scène deux fois : une simple transparence suffit ici
    // un objet plein n'a pas besoin d'être dessiné des deux côtés (deux fois moins de travail) ; les feuillages, si
    for (const m of [].concat(o.material)) if (m.side === THREE.DoubleSide && !m.alphaTest && !m.transparent && !/plant|leaf|leaves|fern|calathea|fringe|hat|glove|hose/i.test(m.name)) m.side = THREE.FrontSide;
    for (const m of [].concat(o.material)) if (m.transmission > 0) { m.transmission = 0; m.transparent = true; m.opacity = 0.22; m.roughness = 0.05; m.depthWrite = false; o.castShadow = false; }
  }); res(g.scene); }, undefined, rej)));
  // pose un modèle dans le groupe g : au sol (centré, pieds à y = 0) ou au mur (centré, dos contre le mur)
  function modele(g, f, o = {}, lieuId = "") {
    suivi.total++;
    const p = charger(f).then((src) => {
      const m = src.clone(true), b = new THREE.Box3().setFromObject(m), t = b.getSize(V(0, 0, 0)), c = b.getCenter(V(0, 0, 0));
      let s = o.s || 1; if (o.h) s = o.h / t.y; if (o.w) s = o.w / Math.max(t.x, t.z);
      const e = o.e || [1, 1, 1], H = new THREE.Group(); H.add(m);
      m.position.set(-c.x, o.auMur ? -c.y : -b.min.y, o.auMur ? -b.min.z : -c.z);
      H.scale.set(s * e[0], s * e[1], s * e[2]); H.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0); g.add(H);
      if (o.sansOmbre) m.traverse((x) => { x.castShadow = false; });
      if (o.apres) o.apres(H, m);
    }).catch((err) => console.warn(`Modèle absent : ${f} (${err.message})`)).finally(() => { suivi.faits++; });
    (suivi.parLieu[lieuId] = suivi.parLieu[lieuId] || []).push(p);
    return p;
  }
  const tissu = (c, o = {}) => mat(c, { roughness: 1, normalMap: pbr.tex("fabric_pattern_07_nor.jpg", o.rep || [3, 3], false), side: THREE.DoubleSide, ...o.m });
  const emissif = (color, emissive) => new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 0, roughness: 0.4 });
  const led = (g, x, y, z, coul = 0x35ff5a, r = 0.008) => { const v = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), emissif(0x202a20, coul)); v.position.set(x, y, z); g.add(v); return v.material; };
  const zone = (g, w, h, d, y, id, lieuId) => { const z = boite(w, h, d, M.invisible); z.position.y = y; z.castShadow = false; g.add(z); cible(`essayer:${id}`, z, [lieuId]); return z; };
  // un écran à texte (four à micro-ondes, lave-linge, compteur) : on redessine quand le texte change
  function ecran(g, w, h, x, y, z, coul = "#7dffb0") {
    const T = toile(128, 48), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: T.t, toneMapped: false })); m.position.set(x, y, z); g.add(m);
    let dernier = null; return (txt) => { if (txt === dernier) return; dernier = txt; T.g.fillStyle = "#06090a"; T.g.fillRect(0, 0, 128, 48); if (txt) { T.g.fillStyle = coul; T.g.font = "700 30px ui-monospace, Menlo, monospace"; T.g.textAlign = "center"; T.g.textBaseline = "middle"; T.g.fillText(txt, 64, 26); } T.t.needsUpdate = true; };
  }
  // ce qu'on voit par les fenêtres : le jardin (ciel photographié, haie, pelouse, allée et sa borne), dessiné une fois
  let jardin = null;
  function vueJardin() {
    if (jardin) return jardin;
    const T = (jardin = toile(512, 512)), g = T.g, img = (f) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = `${base}../textures/${f}`; });
    g.fillStyle = "#cfe3f7"; g.fillRect(0, 0, 512, 512);
    Promise.all([img("ciel_jour.jpg"), img("pelouse_diff.jpg"), img("gravel_floor_diff.jpg")]).then(([ciel, herbe, gravier]) => {
      if (ciel) g.drawImage(ciel, 80, 120, 330, 150, 0, 0, 512, 300); else { g.fillStyle = "#bfe0ff"; g.fillRect(0, 0, 512, 300); }
      // la haie du fond, la clôture, puis la pelouse en perspective
      g.fillStyle = "#6b5a48"; g.fillRect(0, 232, 512, 40); g.fillStyle = "#57493a"; for (let x = 0; x < 512; x += 14) g.fillRect(x, 232, 2, 40);
      g.fillStyle = "#1f3a1a"; g.beginPath(); g.moveTo(0, 262); for (let x = 0; x <= 512; x += 16) g.lineTo(x, 236 + Math.sin(x * 0.07) * 5 + ((x * 7) % 9)); g.lineTo(512, 300); g.lineTo(0, 300); g.fill();
      for (let i = 0; i < 1400; i++) { g.fillStyle = `hsl(${100 + (i % 30)}, 40%, ${14 + (i % 14)}%)`; g.beginPath(); g.ellipse((i * 131) % 512, 240 + ((i * 53) % 58), 3.5, 2, i, 0, 7); g.fill(); }
      if (herbe) { for (let r = 0; r < 7; r++) { const y = 296 + r * r * 4.6, h = 10 + r * 9.2, k = 0.35 + r * 0.25; g.save(); g.translate(0, y); g.scale(k, k * 0.45); g.fillStyle = g.createPattern(herbe, "repeat"); g.fillRect(0, 0, 512 / k, h / (k * 0.45) + 2); g.restore(); } } else { g.fillStyle = "#3f6a35"; g.fillRect(0, 296, 512, 216); }
      g.save(); g.beginPath(); g.moveTo(300, 296); g.lineTo(330, 296); g.lineTo(470, 512); g.lineTo(250, 512); g.closePath(); g.clip(); if (gravier) { g.fillStyle = g.createPattern(gravier, "repeat"); g.fillRect(0, 290, 512, 230); } else { g.fillStyle = "#b9ad98"; g.fillRect(0, 290, 512, 230); } g.restore();
      const om = g.createLinearGradient(0, 296, 0, 512); om.addColorStop(0, "rgba(255,255,255,0.18)"); om.addColorStop(1, "rgba(0,0,0,0.22)"); g.fillStyle = om; g.fillRect(0, 296, 512, 216);
      g.fillStyle = "#23272c"; g.fillRect(412, 372, 9, 52); g.fillStyle = "#f2efe2"; g.fillRect(410, 362, 13, 12); g.fillStyle = "#23272c"; g.fillRect(408, 358, 17, 5);
      T.t.needsUpdate = true;
    });
    return T;
  }
  const hhmm = (h) => { const m = Math.round(h * 60) % 1440; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };

  const poseurs = {
    modele(o, lieuId, lieu, G, g) {
      modele(g, o.f, o, lieuId);
      if (o.id) { const [zw, zh, zd] = o.zone || [0.5, 0.9, 0.6]; zone(g, zw, zh, zd, zh / 2, o.id, lieuId); if (o.voyant) { const v = led(g, ...o.voyant, 0xff3b2f, 0.009); temoins.push((r) => { v.emissiveIntensity = r.fonctionne(o.id) ? 4 : 0; }); } }
    },
    linge(o, lieuId, lieu, G, g) { for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), tissu([0xf2f0ea, 0x9fb8d8, 0xe9d9c2][i], { rep: [2, 2] })); m.scale.set(1.2, 0.5, 1); m.position.set(-0.08 + i * 0.08, 0.04 + i * 0.03, (i - 1) * 0.05); m.castShadow = true; g.add(m); } },
    // fenêtre : cadre, vitrage lumineux le jour, rideaux, et la lumière du jour qui entre dans la pièce
    fenetre(o, lieuId, lieu, G, g) {
      const w = o.w || 1.1, h = o.h || 1.2, pvc = mat(0xf3f1ec, { roughness: 0.45 });
      for (const [bw, bh, x, y] of [[w + 0.1, 0.06, 0, h / 2 + 0.02], [w + 0.1, 0.06, 0, -h / 2 - 0.02], [0.06, h, -w / 2 - 0.02, 0], [0.06, h, w / 2 + 0.02, 0], [0.04, h, 0, 0]]) { const b = boite(bw, bh, 0.05, pvc); b.position.set(x, y, 0.02); g.add(b); }
      const appui = boite(w + 0.24, 0.03, 0.14, pvc); appui.position.set(0, -h / 2 - 0.06, 0.06); g.add(appui);
      const T = vueJardin();
      const vitre = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: T.t })); vitre.position.z = 0.012; g.add(vitre);
      temoins.push((r, e, lc, nuit) => { vitre.material.color.setScalar(nuit ? 0.035 : 1.7); });
      if (o.rideaux !== false) {
        const tr = cyl(0.012, 0.012, w + 0.7, M.laiton, 10); tr.rotation.z = Math.PI / 2; tr.position.set(0, h / 2 + 0.16, 0.1); g.add(tr);
        const mr = tissu(o.rideaux || 0xb9a58a, { rep: [2, 5] });
        for (const s of [-1, 1]) {
          const geo = new THREE.PlaneGeometry(0.42, h + 0.42, 14, 1), p = geo.attributes.position;
          for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 46) * 0.028);
          geo.computeVertexNormals(); const r = new THREE.Mesh(geo, mr); r.position.set(s * (w / 2 + 0.16), -0.06, 0.1); r.receiveShadow = true; g.add(r);
        }
      }
      // la lumière du jour entre par la fenêtre (c'est elle qui porte les ombres dans la pièce)
      g.updateMatrixWorld(true);
      if (!lieu.cle) lieu.cle = { pos: g.localToWorld(V(0, 0.25, 0.22)).sub(G.position), vers: V(0, 0.1, 0), force: 55, angle: 1.15 };
    },
    tapis(o, lieuId, lieu, G, g) {
      const T = toile(256, 256), c = o.couleurs || ["#6b2a26", "#d9c9a3", "#2f3f55"], gg = T.g;
      gg.fillStyle = c[0]; gg.fillRect(0, 0, 256, 256); gg.strokeStyle = c[1]; gg.lineWidth = 6; gg.strokeRect(14, 14, 228, 228); gg.lineWidth = 2; gg.strokeRect(26, 26, 204, 204);
      gg.fillStyle = c[2]; gg.fillRect(40, 40, 176, 176); gg.fillStyle = c[1];
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { gg.save(); gg.translate(55 + i * 29, 55 + j * 29); gg.rotate(Math.PI / 4); gg.fillRect(-5, -5, 10, 10); gg.restore(); }
      gg.fillStyle = c[0]; gg.beginPath(); gg.ellipse(128, 128, 46, 46, 0, 0, 7); gg.fill(); gg.strokeStyle = c[1]; gg.lineWidth = 3; gg.stroke(); T.t.needsUpdate = true;
      const t = new THREE.Mesh(new THREE.BoxGeometry(o.w, 0.012, o.d), mat(0xffffff, { map: T.t, roughness: 1, normalMap: pbr.tex("fabric_pattern_07_nor.jpg", [6, 4], false) })); t.position.y = 0.006; t.receiveShadow = true; g.add(t);
    },
    // un plaid posé sur l'accoudoir : une étoffe pliée qui retombe
    plaid(o, lieuId, lieu, G, g) {
      const geo = new THREE.PlaneGeometry(0.55, 1.0, 10, 14), p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i); const yy = y > 0.1 ? 0 : -(0.1 - y) * 0.92; const zz = y > 0.1 ? y - 0.1 : Math.sin(Math.min(1, (0.1 - y) * 3)) * 0.06; p.setXYZ(i, x + Math.sin(y * 9) * 0.012, yy + Math.sin(x * 20) * 0.006, -zz); }
      geo.computeVertexNormals(); const m = new THREE.Mesh(geo, tissu(o.c || 0x9a3b2e, { rep: [4, 6] })); m.castShadow = true; g.add(m);
    },
    livre(o, lieuId, lieu, G, g) { const c = boite(0.15, 0.028, 0.21, mat(o.c || 0x2f4a6b, { roughness: 0.8 })); c.position.y = 0.014; g.add(c); const p = boite(0.142, 0.022, 0.2, mat(0xf2ead8)); p.position.set(0.004, 0.014, 0); g.add(p); },
    telecommande(o, lieuId, lieu, G, g) { const c = boite(0.045, 0.014, 0.17, mat(0x15171a, { roughness: 0.4 })); c.position.y = 0.007; g.add(c); for (let i = 0; i < 8; i++) { const b = boite(0.008, 0.003, 0.008, mat(i ? 0x5a5f66 : 0xc8261e)); b.position.set((i % 2 ? 1 : -1) * 0.009, 0.0155, -0.06 + Math.floor(i / 2) * 0.03); g.add(b); } },
    // rangées de livres (posées sur les tablettes d'une bibliothèque)
    livres(o, lieuId, lieu, G, g) {
      const teintes = [0x6b2a26, 0x2f4a6b, 0x3f5a3a, 0xa9843f, 0x4a3526, 0x22262d, 0x8a2f4a, 0xd9c9a3], n = o.n || 22, im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat(0xffffff, { roughness: 0.85 }), n), d = new THREE.Object3D();
      let x = -o.w / 2; for (let i = 0; i < n; i++) { const ep = 0.018 + ((i * 7) % 5) * 0.007, hh = 0.17 + ((i * 5) % 6) * 0.012; if (x + ep > o.w / 2) { d.scale.set(0, 0, 0); } else { d.position.set(x + ep / 2, hh / 2, ((i * 3) % 4) * 0.004); d.scale.set(ep, hh, 0.13); d.rotation.z = i % 9 === 8 ? 0.12 : 0; } d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, new THREE.Color(teintes[(i * 3 + (o.g || 0)) % teintes.length])); x += ep + 0.002; }
      im.castShadow = true; g.add(im);
    },
    cadreTexte(o, lieuId, lieu, G, g) { // un petit cadre dessiné (calendrier, liste de courses) pour les murs
      const T = toile(128, 160), gg = T.g; gg.fillStyle = "#fbfaf4"; gg.fillRect(0, 0, 128, 160); gg.fillStyle = "#c8261e"; gg.fillRect(0, 0, 128, 34); gg.fillStyle = "#fff"; gg.font = "700 20px system-ui"; gg.textAlign = "center"; gg.fillText(o.titre || "NOVEMBRE", 64, 24); gg.fillStyle = "#333"; gg.font = "11px system-ui"; for (let i = 0; i < 30; i++) gg.fillText(String(i + 1), 14 + (i % 7) * 17, 56 + Math.floor(i / 7) * 22); T.t.needsUpdate = true;
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.275), new THREE.MeshStandardMaterial({ map: T.t, roughness: 0.9 })); p.position.z = 0.006; g.add(p);
    },

    /* ----- appareils branchés : ils dépendent de leur prise, donc de leur disjoncteur ----- */
    lampadaire(o, lieuId, lieu, G, g) {
      const noir = mat(0x1b1d20, { roughness: 0.45, metalness: 0.6 });
      const pied = cyl(0.14, 0.15, 0.025, noir, 28); pied.position.y = 0.0125; g.add(pied); const tige = cyl(0.011, 0.011, 1.45, M.laiton, 12); tige.position.y = 0.75; g.add(tige);
      const abat = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.21, 0.28, 28, 1, true), new THREE.MeshStandardMaterial({ color: 0xf2e6cf, side: THREE.DoubleSide, roughness: 0.9, emissive: 0xffd9a0, emissiveIntensity: 0 })); abat.position.y = 1.55; g.add(abat);
      const amp = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 10), emissif(0xf6f1e6, 0xffd49a)); amp.position.y = 1.52; g.add(amp);
      const inter = boite(0.02, 0.03, 0.02, noir); inter.position.set(0.02, 0.9, 0); g.add(inter);
      sources.push({ id: o.id, lieu: lieuId, obj: amp, couleur: 0xffd9a8, force: 5.5, portee: 7, on: (r) => r.fonctionne(o.id), mats: [abat.material, amp.material], k: 1.6 });
      zone(g, 0.5, 1.75, 0.5, 0.88, o.id, lieuId);
    },
    lampe(o, lieuId, lieu, G, g) {
      modele(g, "desk_lamp_arm_01", { h: o.h || 0.5, ry: o.ry || 0 }, lieuId);
      const amp = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), emissif(0xf6f1e6, 0xffd49a)); amp.position.set(0, (o.h || 0.5) * 0.82, 0.12); g.add(amp);
      sources.push({ id: o.id, lieu: lieuId, obj: amp, couleur: 0xffe0b0, force: 2.2, portee: 4, on: (r) => r.fonctionne(o.id), mats: [amp.material], k: 3 });
      zone(g, 0.35, 0.6, 0.4, 0.3, o.id, lieuId);
    },
tele(o, lieuId, lieu, G, g) { // écran plat sur pied
      const noir = mat(0x0d0f12, { roughness: 0.35 }), L = o.l || 1.0, H = L * 0.58;
      const pied = boite(0.34, 0.016, 0.2, noir); pied.position.y = 0.008; g.add(pied); const col = boite(0.06, 0.09, 0.03, noir); col.position.set(0, 0.06, -0.01); g.add(col);
      const dalle = boite(L, H, 0.028, noir); dalle.position.set(0, 0.1 + H / 2, 0); g.add(dalle); const dos = boite(L * 0.5, H * 0.5, 0.03, noir); dos.position.set(0, 0.1 + H * 0.42, -0.025); g.add(dos);
      const T = toile(256, 144), gg = T.g, gr = gg.createLinearGradient(0, 0, 0, 144); gr.addColorStop(0, "#7fb2e6"); gr.addColorStop(0.55, "#dfeaf2"); gr.addColorStop(0.56, "#5f8a4a"); gr.addColorStop(1, "#2f5a2a"); gg.fillStyle = gr; gg.fillRect(0, 0, 256, 144);
      gg.fillStyle = "#e9e2d2"; gg.fillRect(150, 52, 60, 40); gg.fillStyle = "#8a3a2a"; gg.beginPath(); gg.moveTo(142, 54); gg.lineTo(180, 28); gg.lineTo(218, 54); gg.fill(); gg.fillStyle = "rgba(10,20,40,0.85)"; gg.fillRect(0, 118, 256, 26); gg.fillStyle = "#fff"; gg.font = "700 13px system-ui"; gg.fillText("MÉTÉO · pluie en soirée", 10, 136); gg.fillStyle = "#c8261e"; gg.fillRect(206, 122, 40, 16); gg.fillStyle = "#fff"; gg.fillText("19:00", 209, 135); T.t.needsUpdate = true;
      const im = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.03, H - 0.03), new THREE.MeshBasicMaterial({ map: T.t })); im.position.set(0, 0.1 + H / 2, 0.0146); g.add(im);
      const veille = led(g, L / 2 - 0.03, 0.108, 0.015, 0xff3b2f, 0.004);
      const src = new THREE.Object3D(); src.position.set(0, 0.1 + H / 2, 0.5); g.add(src);
      sources.push({ id: o.id, lieu: lieuId, obj: src, couleur: 0x9fc4ff, force: 1.4, portee: 3.5, on: (r) => r.fonctionne(o.id), mats: [], k: 0 });
      temoins.push((r) => { const on = r.fonctionne(o.id); im.visible = on; veille.emissiveIntensity = !on && r.alimente(inst.mobile[o.id].prise) ? 3 : 0; });
      zone(g, L, H + 0.1, 0.25, (H + 0.1) / 2, o.id, lieuId);
    },
    bouilloire(o, lieuId, lieu, G, g) { modele(g, "vintage_electric_kettle", { h: 0.24, ry: o.ry || 0 }, lieuId); const v = led(g, 0.085, 0.03, 0.06, 0xff5a2a); temoins.push((r) => { v.emissiveIntensity = r.fonctionne(o.id) ? 4 : 0; }); zone(g, 0.28, 0.3, 0.26, 0.15, o.id, lieuId); },
    cafetiere(o, lieuId, lieu, G, g) {
      const noir = mat(0x17191c, { roughness: 0.35 });
      const socle = boite(0.2, 0.03, 0.26, noir); socle.position.y = 0.015; g.add(socle); const dos = boite(0.2, 0.32, 0.09, noir); dos.position.set(0, 0.19, -0.085); g.add(dos); const haut = boite(0.2, 0.07, 0.26, noir); haut.position.y = 0.315; g.add(haut);
      const verse = cyl(0.062, 0.07, 0.13, new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.05, transparent: true, opacity: 0.8 }), 20); verse.position.set(0, 0.1, 0.035); g.add(verse);
      const anse = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 8, 14, Math.PI), noir); anse.rotation.z = -Math.PI / 2; anse.position.set(0.07, 0.1, 0.035); g.add(anse);
      const v = led(g, 0.07, 0.05, 0.132, 0xff5a2a, 0.007); temoins.push((r) => { v.emissiveIntensity = r.fonctionne(o.id) ? 4 : 0; }); zone(g, 0.26, 0.38, 0.3, 0.19, o.id, lieuId);
    },
    microondes(o, lieuId, lieu, G, g) {
      modele(g, "vintage_microwave", { w: 0.5 }, lieuId);
      const aff = ecran(g, 0.07, 0.026, 0.185, 0.2, 0.19); const src = new THREE.Object3D(); src.position.set(-0.05, 0.13, 0.3); g.add(src);
      sources.push({ id: o.id, lieu: lieuId, obj: src, couleur: 0xffe6a8, force: 0.5, portee: 1.5, on: (r) => r.fonctionne(o.id), mats: [], k: 0 });
      temoins.push((r, e) => aff(r.alimente(inst.mobile[o.id].prise) ? (r.fonctionne(o.id) ? "1:30" : hhmm(e.env.heure)) : "")); zone(g, 0.52, 0.3, 0.4, 0.15, o.id, lieuId);
    },
    frigo(o, lieuId, lieu, G, g) {
      const inox = mat(0xc9ccd0, { metalness: 0.75, roughness: 0.32 }), w = 0.6, d = 0.62;
      const bas = boite(w, 1.08, d, inox); bas.position.y = 0.59; g.add(bas); const hautF = boite(w, 0.62, d, inox); hautF.position.y = 1.46; g.add(hautF); const socle = boite(w - 0.04, 0.05, d - 0.06, M.noir); socle.position.y = 0.025; g.add(socle);
      for (const y of [0.95, 1.3]) { const p = boite(0.025, 0.3, 0.03, M.acier); p.position.set(-w / 2 + 0.06, y, d / 2 + 0.02); g.add(p); }
      const aff = ecran(g, 0.07, 0.026, 0.12, 1.66, d / 2 + 0.002, "#9fd8ff"); temoins.push((r) => aff(r.fonctionne(o.id) ? "4°C" : ""));
      for (let i = 0; i < 3; i++) { const a = boite(0.05, 0.05, 0.002, mat([0xe9b400, 0xc8261e, 0x2f6fd0][i])); a.position.set(-0.1 + i * 0.12, 1.4 - i * 0.07, d / 2 + 0.002); a.rotation.z = (i - 1) * 0.12; g.add(a); }
      zone(g, w, 1.8, d, 0.9, o.id, lieuId);
    },
lavelinge(o, lieuId, lieu, G, g) {
      const tole = mat(0xf6f6f4, { roughness: 0.3, metalness: 0.1 }), gris = mat(0xdadcde, { roughness: 0.35 }), chrome = mat(0xcfd3d8, { metalness: 0.95, roughness: 0.18 });
      const corps = boite(0.595, 0.8, 0.56, tole); corps.position.y = 0.44; g.add(corps); const dessus = boite(0.6, 0.03, 0.58, gris); dessus.position.y = 0.855; g.add(dessus);
      for (const [x, z] of [[-0.25, -0.23], [0.25, -0.23], [-0.25, 0.23], [0.25, 0.23]]) { const p = cyl(0.022, 0.026, 0.04, M.noir, 12); p.position.set(x, 0.02, z); g.add(p); }
      const plinthe = boite(0.595, 0.09, 0.012, gris); plinthe.position.set(0, 0.09, 0.283); g.add(plinthe); const trappe = boite(0.09, 0.06, 0.006, tole); trappe.position.set(0.2, 0.09, 0.291); g.add(trappe);
      const bandeau = boite(0.595, 0.13, 0.016, gris); bandeau.position.set(0, 0.775, 0.284); g.add(bandeau);
      const tiroir = boite(0.17, 0.085, 0.01, tole); tiroir.position.set(-0.19, 0.775, 0.294); g.add(tiroir); const creux = boite(0.09, 0.018, 0.012, mat(0xb9bdc2)); creux.position.set(-0.19, 0.75, 0.296); g.add(creux);
      const bouton = cyl(0.036, 0.036, 0.022, chrome, 28); bouton.rotation.x = Math.PI / 2; bouton.position.set(0.205, 0.775, 0.302); g.add(bouton); const rep = boite(0.004, 0.026, 0.004, M.noir); rep.position.set(0.205, 0.787, 0.314); g.add(rep);
      for (let i = 0; i < 4; i++) { const b = boite(0.016, 0.01, 0.006, mat(0x8d949c)); b.position.set(0.05 + i * 0.026, 0.752, 0.294); g.add(b); }
      const joint = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.022, 12, 40), gris); joint.position.set(0, 0.42, 0.283); g.add(joint);
      const cercle = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.02, 12, 40), chrome); cercle.position.set(0, 0.42, 0.297); g.add(cercle);
      const verre = new THREE.Mesh(new THREE.SphereGeometry(0.15, 28, 14, 0, 7, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x1a222c, roughness: 0.04, metalness: 0.4, transparent: true, opacity: 0.82 })); verre.rotation.x = Math.PI / 2; verre.scale.z = 0.35; verre.position.set(0, 0.42, 0.292); g.add(verre);
      const tambour = new THREE.Mesh(new THREE.CircleGeometry(0.13, 28), mat(0x9aa0a8, { metalness: 0.9, roughness: 0.35 })); tambour.position.set(0, 0.42, 0.284); g.add(tambour);
      for (let i = 0; i < 18; i++) { const a = (i / 18) * 6.283, t = new THREE.Mesh(new THREE.CircleGeometry(0.006, 8), M.noir); t.position.set(Math.cos(a) * (0.05 + (i % 3) * 0.03), 0.42 + Math.sin(a) * (0.05 + (i % 3) * 0.03), 0.2845); g.add(t); }
      const poignee = boite(0.022, 0.09, 0.02, chrome); poignee.position.set(0.19, 0.42, 0.305); g.add(poignee);
      const aff = ecran(g, 0.085, 0.03, 0.02, 0.79, 0.2925, "#ffb84a"); temoins.push((r) => aff(r.alimente(inst.mobile[o.id].prise) ? (r.fonctionne(o.id) ? "0:45" : "- - -") : ""));
      const tuyau = cyl(0.014, 0.014, 0.5, mat(0x8d949c, { roughness: 0.6 }), 10); tuyau.position.set(-0.2, 0.6, -0.3); g.add(tuyau);
      zone(g, 0.6, 0.87, 0.6, 0.435, o.id, lieuId);
    },
    // congélateur coffre : voyant vert, et il ronronne tant que son circuit est alimenté
    congelateur(o, lieuId, lieu, G, g) {
      const w = o.w || 0.8, tole = mat(0xf4f4f1, { roughness: 0.32, metalness: 0.1 }), gris = mat(0xd2d5d8, { roughness: 0.4 }), chrome = mat(0xcfd3d8, { metalness: 0.95, roughness: 0.2 });
      const corps = boite(w, 0.74, 0.6, tole); corps.position.y = 0.43; g.add(corps); const socle = boite(w - 0.03, 0.05, 0.56, M.noir); socle.position.y = 0.035; g.add(socle);
      for (const x of [-w / 2 + 0.08, w / 2 - 0.08]) for (const z of [-0.22, 0.22]) { const r = cyl(0.02, 0.02, 0.03, M.noir, 12); r.rotation.z = Math.PI / 2; r.position.set(x, 0.02, z); g.add(r); }
      const jointC = boite(w - 0.01, 0.012, 0.59, mat(0x3a3f46, { roughness: 0.9 })); jointC.position.y = 0.806; g.add(jointC);
      const couv = boite(w + 0.012, 0.06, 0.615, tole); couv.position.y = 0.842; g.add(couv); const bord = boite(w + 0.016, 0.014, 0.62, gris); bord.position.y = 0.816; g.add(bord);
      for (const x of [-w / 2 + 0.12, w / 2 - 0.12]) { const ch = boite(0.05, 0.07, 0.025, gris); ch.position.set(x, 0.82, -0.312); g.add(ch); }
      const poignee = boite(0.2, 0.03, 0.035, chrome); poignee.position.set(0, 0.835, 0.322); g.add(poignee); const serrure = cyl(0.012, 0.012, 0.012, chrome, 12); serrure.rotation.x = Math.PI / 2; serrure.position.set(0, 0.78, 0.304); g.add(serrure);
      const platine = boite(0.2, 0.075, 0.006, gris); platine.position.set(w / 2 - 0.14, 0.69, 0.302); g.add(platine);
      const thermo = cyl(0.018, 0.018, 0.014, M.noir, 18); thermo.rotation.x = Math.PI / 2; thermo.position.set(w / 2 - 0.2, 0.69, 0.31); g.add(thermo); const tr = boite(0.003, 0.014, 0.003, M.blanc); tr.position.set(w / 2 - 0.2, 0.697, 0.318); g.add(tr);
      for (let i = 0; i < 7; i++) { const l = boite(0.2, 0.006, 0.004, mat(0x2b2f34)); l.position.set(w / 2 - 0.14, 0.09 + i * 0.016, 0.302); g.add(l); }
      const v = led(g, w / 2 - 0.1, 0.69, 0.306, 0x35ff5a, 0.009); const jaune = led(g, w / 2 - 0.07, 0.69, 0.306, 0xffc400, 0.006);
      temoins.push((r) => { const on = r.fonctionne(o.id); v.emissiveIntensity = on ? 4 : 0; jaune.emissiveIntensity = on ? 1.5 : 0; });
      const pan = new THREE.Group(); pan.position.set(-w / 2 + 0.2, 0.872, 0.02); g.add(pan); modele(pan, "wicker_basket_02", { ry: 0.3 }, lieuId);
      zone(g, w, 0.9, 0.62, 0.45, o.id, lieuId);
    },
    // chauffe-eau vertical mural : cuve, tuyaux d'eau froide et d'eau chaude, groupe de sécurité, voyant de chauffe
    ballon(o, lieuId, lieu, G, g) {
      const c = cyl(0.26, 0.26, 1.02, M.blanc, 32); c.position.set(0, 0, 0.28); g.add(c);
      for (const s of [-1, 1]) { const cal = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 12, 0, 7, 0, Math.PI / 2), M.blanc); cal.scale.y = 0.3; cal.position.set(0, s * 0.51, 0.28); if (s < 0) cal.rotation.x = Math.PI; g.add(cal); }
      for (const y of [0.3, -0.3]) { const pat = boite(0.4, 0.03, 0.05, M.acier); pat.position.set(0, y, 0.025); g.add(pat); }
      const capot = cyl(0.1, 0.1, 0.03, mat(0xdfe2e4, { roughness: 0.4 }), 24); capot.position.set(0, -0.6, 0.28); g.add(capot);
      for (const [x, coul] of [[-0.09, 0x2f6fd0], [0.09, 0xc8261e]]) {
        const t = cyl(0.011, 0.011, 0.75, M.cuivre, 10); t.position.set(x, -0.98, 0.28); g.add(t); const bague = cyl(0.016, 0.016, 0.03, mat(coul), 12); bague.position.set(x, -0.66, 0.28); g.add(bague);
        const coude = cyl(0.011, 0.011, 0.26, M.cuivre, 10); coude.rotation.x = Math.PI / 2; coude.position.set(x, -1.35, 0.15); g.add(coude);
      }
      const gs = boite(0.06, 0.07, 0.05, M.laiton); gs.position.set(-0.09, -0.76, 0.28); g.add(gs); const vid = cyl(0.008, 0.008, 0.5, mat(0xe8e8e4), 8); vid.position.set(-0.13, -1.05, 0.28); g.add(vid);
      const plaque = boite(0.12, 0.07, 0.002, mat(0xdfe2e4)); plaque.position.set(0, 0.1, 0.541); g.add(plaque);
      const v = led(g, 0, -0.42, 0.54, 0xff8a1a, 0.014); temoins.push((r) => { v.emissiveIntensity = r.fonctionne(o.id) ? 4 : 0; });
      const z = boite(0.56, 1.2, 0.56, M.invisible); z.position.z = 0.28; g.add(z); cible(`essayer:${o.id}`, z, [lieuId]);
    },

    /* ----- cuisine : meubles bas et hauts, plan de travail, évier, crédence ----- */
    cuisine(o, lieuId, lieu, G, g) {
      const bois = pbr.m("kitchen_wood", [1, 1], { roughness: 0.6 }), plan = mat(0x2a2c30, { roughness: 0.25, metalness: 0.1 }), poignee = M.acier;
      let x = o.x0; const prof = 0.6;
      for (const s of o.segments) {
        const cx = x + s.w / 2;
        if (s.k !== "vide") {
          const caisson = boite(s.w - 0.004, 0.76, prof - 0.04, bois); caisson.position.set(cx, 0.5, prof / 2 - 0.02); g.add(caisson);
          const plinthe = boite(s.w, 0.12, prof - 0.1, M.noir); plinthe.position.set(cx, 0.06, prof / 2 - 0.05); g.add(plinthe);
          const n = s.w > 0.7 ? 2 : 1; for (let i = 0; i < n; i++) { const pw = s.w / n, px = x + pw * (i + 0.5); const porte = boite(pw - 0.012, s.k === "tiroirs" ? 0.2 : 0.72, 0.018, bois); porte.position.set(px, s.k === "tiroirs" ? 0.76 : 0.5, prof - 0.012); g.add(porte); const pg = boite(s.k === "tiroirs" ? 0.14 : 0.012, s.k === "tiroirs" ? 0.012 : 0.14, 0.02, poignee); pg.position.set(px + (s.k === "tiroirs" ? 0 : (i ? -1 : 1) * (pw / 2 - 0.05)), s.k === "tiroirs" ? 0.76 : 0.74, prof + 0.006); g.add(pg); }
          if (s.k === "tiroirs") for (const yy of [0.52, 0.27]) { const t = boite(s.w - 0.012, 0.23, 0.018, bois); t.position.set(cx, yy, prof - 0.012); g.add(t); const pg = boite(0.14, 0.012, 0.02, poignee); pg.position.set(cx, yy + 0.07, prof + 0.006); g.add(pg); }
          const pt = boite(s.w, 0.04, prof + 0.02, plan); pt.position.set(cx, 0.9, prof / 2); g.add(pt);
        }
        if (s.k === "evier") {
          const cuve = boite(0.44, 0.012, 0.38, mat(0xb9bfc6, { metalness: 0.9, roughness: 0.25 })); cuve.position.set(cx - 0.08, 0.922, prof / 2); g.add(cuve);
          const fond = boite(0.38, 0.004, 0.32, mat(0x70767d, { metalness: 0.9, roughness: 0.35 })); fond.position.set(cx - 0.08, 0.93, prof / 2); g.add(fond);
          const egout = boite(0.24, 0.008, 0.38, mat(0xb9bfc6, { metalness: 0.9, roughness: 0.3 })); egout.position.set(cx + 0.27, 0.924, prof / 2); g.add(egout);
          const col = cyl(0.012, 0.014, 0.26, M.acier, 12); col.position.set(cx - 0.08, 1.05, 0.08); g.add(col); const bec = cyl(0.01, 0.01, 0.16, M.acier, 10); bec.rotation.x = Math.PI / 2 - 0.25; bec.position.set(cx - 0.08, 1.17, 0.15); g.add(bec);
        }
        if (s.haut) { const hh = boite(s.w - 0.004, 0.62, 0.33, bois); hh.position.set(cx, 1.78, 0.165); g.add(hh); const n = s.w > 0.7 ? 2 : 1; for (let i = 0; i < n; i++) { const pw = s.w / n, px = x + pw * (i + 0.5); const porte = boite(pw - 0.012, 0.6, 0.016, bois); porte.position.set(px, 1.78, 0.338); g.add(porte); const pg = boite(0.012, 0.12, 0.018, poignee); pg.position.set(px + (i ? -1 : 1) * (pw / 2 - 0.05), 1.56, 0.352); g.add(pg); } }
        if (s.hotte) { const ht = boite(s.w, 0.08, 0.45, M.acier); ht.position.set(cx, 1.6, 0.225); g.add(ht); const ch = boite(0.22, 0.5, 0.2, M.acier); ch.position.set(cx, 1.88, 0.12); g.add(ch); }
        x += s.w;
      }
      const L = x - o.x0, cr = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.56), pbr.m("floor_tiles_06", [L / 0.4, 1.4], { roughness: 0.25 })); cr.position.set(o.x0 + L / 2, 1.2, 0.004); g.add(cr);
    },
    torchon(o, lieuId, lieu, G, g) { const geo = new THREE.PlaneGeometry(0.2, 0.42, 6, 8), p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 40) * 0.006 + (p.getY(i) > 0.18 ? (p.getY(i) - 0.18) * -1.2 : 0)); geo.computeVertexNormals(); const T = toile(32, 64); T.g.fillStyle = "#f4f1ea"; T.g.fillRect(0, 0, 32, 64); T.g.fillStyle = "#c8261e"; for (const x of [4, 9, 23, 28]) T.g.fillRect(x, 0, 2, 64); T.t.needsUpdate = true; const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: T.t, roughness: 1, side: THREE.DoubleSide })); m.castShadow = true; g.add(m); },

    /* ----- entrée ----- */
    porteEntree(o, lieuId, lieu, G, g) {
      const bois = pbr.m("rough_pine_door", [1, 1], { color: 0x6f8a7a, roughness: 0.6 }), cadre = mat(0xefece4, { roughness: 0.5 });
      for (const [w, h, x, y] of [[1.06, 0.07, 0, 2.1], [0.07, 2.12, -0.5, 1.06], [0.07, 2.12, 0.5, 1.06]]) { const b = boite(w, h, 0.08, cadre); b.position.set(x, y, 0.03); g.add(b); }
      const vantail = boite(0.92, 2.05, 0.045, bois); vantail.position.set(0, 1.035, 0.03); g.add(vantail);
      for (const [y, h] of [[0.5, 0.7], [1.3, 0.55]]) { const p = boite(0.66, h, 0.012, bois); p.position.set(0, y, 0.056); g.add(p); }
      const im = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.26), new THREE.MeshBasicMaterial({ color: 0xcfe4ff })); im.position.set(0, 1.83, 0.055); g.add(im); temoins.push((r, e, lc, nuit) => im.material.color.setScalar(nuit ? 0.03 : 1.5));
      const pg = cyl(0.012, 0.012, 0.13, M.laiton, 10); pg.rotation.z = Math.PI / 2; pg.position.set(0.33, 1.02, 0.09); g.add(pg); const ros = boite(0.04, 0.18, 0.012, M.laiton); ros.position.set(0.38, 1.0, 0.058); g.add(ros);
      const T = toile(128, 64), gg = T.g; gg.fillStyle = "#5a4630"; gg.fillRect(0, 0, 128, 64); gg.strokeStyle = "#2b2014"; gg.lineWidth = 4; gg.strokeRect(4, 4, 120, 56); gg.fillStyle = "#2b2014"; gg.font = "700 22px system-ui"; gg.textAlign = "center"; gg.fillText("Bienvenue", 64, 40); T.t.needsUpdate = true;
      const pail = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.015, 0.45), mat(0xffffff, { map: T.t, roughness: 1 })); pail.position.set(0, 0.008, 0.42); pail.receiveShadow = true; g.add(pail);
    },
portemanteau(o, lieuId, lieu, G, g) {
      const bois = pbr.m("kitchen_wood", [1, 0.2], {}); const planche = boite(0.95, 0.12, 0.025, bois); planche.position.z = 0.0125; g.add(planche);
      // un manteau suspendu : le tissu tombe en plis (plus marqués vers le bas), épaules arrondies, manches, col, boutons
      const manteau = (x, coul, lg, ouvert) => {
        const mt = tissu(coul, { rep: [5, 7] }), V3 = new THREE.Group(); V3.position.set(x, -0.03, 0.07); g.add(V3);
        const geo = new THREE.CylinderGeometry(0.115, 0.2, lg, 36, 14, true), p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) { const px = p.getX(i), py = p.getY(i), pz = p.getZ(i), a = Math.atan2(pz, px), bas = 0.5 - py / lg, k = 1 + (0.03 + bas * 0.13) * Math.sin(a * 7 + py * 4) + bas * 0.05 * Math.sin(a * 13); p.setXYZ(i, px * k, py + 0.012 * Math.sin(a * 5) * bas, pz * k * 0.5 + (pz > 0 ? 0.01 : 0)); }
        geo.computeVertexNormals(); const corps = new THREE.Mesh(geo, mt); corps.position.y = -lg / 2 - 0.04; corps.castShadow = true; V3.add(corps);
        const ep = new THREE.Mesh(new THREE.SphereGeometry(0.125, 24, 12, 0, 7, 0, Math.PI / 2), mt); ep.scale.set(1.25, 0.42, 0.56); ep.position.y = -0.045; V3.add(ep);
        for (const sx of [-1, 1]) { const gm = new THREE.CylinderGeometry(0.045, 0.058, lg * 0.74, 14, 8), q = gm.attributes.position; for (let i = 0; i < q.count; i++) { const y = q.getY(i); q.setX(i, q.getX(i) * (1 + 0.1 * Math.sin(y * 34)) + 0.012 * Math.sin(y * 9)); } gm.computeVertexNormals(); const m = new THREE.Mesh(gm, mt); m.scale.z = 0.62; m.rotation.z = sx * 0.09; m.position.set(sx * 0.165, -0.1 - lg * 0.37, 0); m.castShadow = true; V3.add(m); }
        const col = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.026, 8, 18), mt); col.rotation.x = Math.PI / 2 - 0.35; col.scale.z = 0.7; col.position.set(0, -0.02, 0.012); V3.add(col);
        const patte = boite(0.012, lg * 0.86, 0.004, mat(new THREE.Color(coul).multiplyScalar(0.55).getHex(), { roughness: 1 })); patte.position.set(0, -lg / 2 - 0.02, 0.098); patte.rotation.x = -0.065; V3.add(patte);
        if (!ouvert) for (let i = 0; i < 4; i++) { const b = cyl(0.011, 0.011, 0.005, mat(0x1b1d20, { roughness: 0.4 }), 12); b.rotation.x = Math.PI / 2; b.position.set(0.022, -0.2 - i * lg * 0.17, 0.092 + i * 0.011); V3.add(b); }
        const att = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.003, 6, 12), mt); att.position.set(0, 0.012, -0.02); V3.add(att);
      };
      for (let i = 0; i < 5; i++) { const x = -0.38 + i * 0.19, pat = cyl(0.008, 0.008, 0.075, M.laiton, 8); pat.rotation.x = Math.PI / 2 - 0.4; pat.position.set(x, -0.01, 0.05); g.add(pat); const bout = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), M.laiton); bout.position.set(x, 0.004, 0.085); g.add(bout); }
      manteau(-0.38, 0x2f3f55, 0.98, false); manteau(0, 0x8a6a44, 0.8, true); manteau(0.38, 0x7a2f2a, 1.02, false);
      // une écharpe sur la quatrième patère
      const eg = new THREE.PlaneGeometry(0.11, 0.9, 4, 16), ep = eg.attributes.position; for (let i = 0; i < ep.count; i++) ep.setZ(i, Math.sin(ep.getY(i) * 14) * 0.012 + Math.sin(ep.getX(i) * 50) * 0.006); eg.computeVertexNormals(); const ech = new THREE.Mesh(eg, tissu(0xc9b37a, { rep: [2, 8] })); ech.position.set(0.19, -0.47, 0.075); ech.castShadow = true; g.add(ech);
      const etag = boite(0.95, 0.02, 0.2, bois); etag.position.set(0, 0.16, 0.1); g.add(etag);
      const ch = new THREE.Group(); ch.position.set(0.2, 0.17, 0.1); g.add(ch); modele(ch, "fishermans_hat", { ry: 0.4 }, lieuId);
    },
    chaussures(o, lieuId, lieu, G, g) {
      const bois = pbr.m("kitchen_wood", [1, 1], { roughness: 0.6 });
      const m = boite(0.8, 0.5, 0.3, bois); m.position.set(0, 0.27, 0.15); g.add(m); const top = boite(0.84, 0.025, 0.33, bois); top.position.set(0, 0.53, 0.155); g.add(top);
      for (const x of [-0.2, 0.2]) { const p = boite(0.38, 0.44, 0.012, bois); p.position.set(x, 0.27, 0.306); g.add(p); const pg = cyl(0.01, 0.01, 0.02, M.laiton, 10); pg.rotation.x = Math.PI / 2; pg.position.set(x * 0.4, 0.4, 0.32); g.add(pg); }
      const paire = (x, z, c, bot) => { for (const s of [-0.055, 0.055]) { const sem = boite(0.085, 0.02, 0.26, mat(0x1b1d20)); sem.position.set(x + s, 0.01, z); g.add(sem); const tige = boite(0.08, bot ? 0.2 : 0.06, 0.24, mat(c, { roughness: 0.7 })); tige.position.set(x + s, bot ? 0.12 : 0.05, z - (bot ? 0.0 : 0.0)); g.add(tige); if (!bot) { const bout = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), mat(c, { roughness: 0.7 })); bout.scale.set(1, 0.6, 1.3); bout.position.set(x + s, 0.05, z + 0.09); g.add(bout); } } };
      paire(-0.6, 0.2, 0x3f5a3a, true); paire(0.62, 0.2, 0x7a5a3a, false);
    },
    cles(o, lieuId, lieu, G, g) { const an = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0018, 6, 16), M.acier); an.rotation.x = Math.PI / 2; an.position.y = 0.003; g.add(an); for (let i = 0; i < 3; i++) { const c = boite(0.008, 0.002, 0.05, i ? M.acier : M.laiton); c.position.set(0.012 + i * 0.006, 0.002, 0.03); c.rotation.y = -0.3 + i * 0.35; g.add(c); } const pc = boite(0.03, 0.006, 0.04, mat(0xc8261e)); pc.position.set(-0.03, 0.003, 0.01); g.add(pc); },
    courrier(o, lieuId, lieu, G, g) { for (let i = 0; i < 4; i++) { const e = boite(0.22, 0.002, 0.11, mat(i === 2 ? 0xdfe9f2 : 0xfbfaf4, { roughness: 0.9 })); e.position.set(i * 0.012, 0.001 + i * 0.0022, i * 0.01); e.rotation.y = -0.2 + i * 0.13; g.add(e); } },

    /* ----- cellier ----- */
bocaux(o, lieuId, lieu, G, g) { // bocaux de conserves : verre, contenu, couvercle
      const verre = new THREE.MeshStandardMaterial({ color: 0xdfeee6, roughness: 0.05, transparent: true, opacity: 0.3 }), teintes = [0x8a1f1a, 0xc9741a, 0x4a6a2a, 0xd9b84a, 0x6b2a4a, 0xb8482a];
      for (let i = 0; i < (o.n || 6); i++) { const h = 0.13 + (i % 3) * 0.02, r = 0.04 + (i % 2) * 0.006, x = (i - ((o.n || 6) - 1) / 2) * 0.1, z = (i % 2) * 0.03;
        const c = cyl(r - 0.004, r - 0.004, h * 0.8, mat(teintes[i % 6], { roughness: 0.6 }), 16); c.position.set(x, h * 0.4 + 0.003, z); g.add(c); const v = cyl(r, r, h, verre, 18); v.position.set(x, h / 2, z); v.castShadow = false; g.add(v);
        const cv = cyl(r + 0.002, r + 0.002, 0.012, i % 2 ? M.laiton : mat(0xc8261e, { metalness: 0.5, roughness: 0.4 }), 18); cv.position.set(x, h + 0.006, z); g.add(cv); }
    },
    etagereChargee(o, lieuId, lieu, G, g) {
      modele(g, "steel_frame_shelves_01", { h: 1.9 }, lieuId);
      const sur = (f, x, y, z, opt = {}) => { const s = new THREE.Group(); s.position.set(x, y, z); s.rotation.y = opt.r || 0; g.add(s); if (poseurs[f]) poseurs[f](opt, lieuId, lieu, G, s); else modele(s, f, opt, lieuId); };
      // en bas : le lourd (caisses, bidons, boîte à outils)
      sur("wooden_crate_02", -0.24, 0.125, 0, { r: Math.PI / 2, s: 0.62 }); sur("multi_cleaner_5_litre", 0.1, 0.125, 0.05); sur("plastic_bottle_gallon", 0.26, 0.125, 0.02, { r: 0.5 }); sur("oil_tin", 0.4, 0.125, 0.06);
      sur("metal_toolbox", -0.27, 0.575, 0.02, { r: 0.1 }); sur("bleach_bottle", 0.0, 0.575, 0.06); sur("all_purpose_cleaner", 0.1, 0.575, 0.03, { r: 0.4 }); sur("cleaner_tin_01", 0.2, 0.575, 0.08); sur("wooden_bucket_01", 0.36, 0.575, 0, { h: 0.3 });
      // à hauteur des yeux : les bocaux, les conserves, les bouteilles
      sur("bocaux", -0.2, 1.025, 0.02, { n: 6 }); sur("russian_food_cans_01", 0.2, 1.025, 0.08, { s: 1.6 }); sur("russian_food_cans_01", 0.22, 1.025, -0.06, { s: 1.6, r: 0.5 }); sur("long_life_food", 0.33, 1.025, 0.0, { s: 0.7, r: -0.2 });
      sur("wine_bottles_01", -0.38, 1.475, 0.0, { s: 0.85 }); sur("bocaux", 0.25, 1.475, 0.05, { n: 4 }); sur("cardboard_box_01", 0.3, 1.475, -0.08, { r: 0.3, e: [0.8, 0.6, 0.8] });
      sur("cardboard_box_01", -0.22, 1.9, 0, { r: 0.2 }); sur("plastic_crate_02", 0.24, 1.9, 0, { r: -0.1 });
    },
    balai(o, lieuId, lieu, G, g) { modele(g, "wooden_broom", { rx: -0.12, rz: 0.06 }, lieuId); },

    /* ----- jardin ----- */
haie(o, lieuId, lieu, G, g) {
      // haie taillée : un volume sombre couvert de feuilles (petites cartes découpées), pas des boules
      if (!poseurs.haie.tex) {
        const T = toile(256, 256), gg = T.g; gg.fillStyle = "#132310"; gg.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 3200; i++) { gg.fillStyle = `hsl(${96 + (i % 26)}, ${32 + (i % 20)}%, ${11 + ((i * 7) % 15)}%)`; gg.beginPath(); gg.ellipse((i * 131) % 256, (i * 197 + 61 * (i % 7)) % 256, 3.4 + (i % 3), 2 + (i % 2), (i % 12) * 0.52, 0, 7); gg.fill(); }
        T.t.wrapS = T.t.wrapT = THREE.RepeatWrapping; T.t.needsUpdate = true; poseurs.haie.tex = T.t;
        const F = toile(128, 128), f = F.g; f.clearRect(0, 0, 128, 128);
        for (let i = 0; i < 7; i++) { const x = 22 + (i * 37) % 84, y = 22 + (i * 53) % 84, a = i * 0.9; f.save(); f.translate(x, y); f.rotate(a); f.fillStyle = `hsl(${100 + i * 4}, 45%, ${22 + (i % 4) * 5}%)`; f.beginPath(); f.moveTo(-20, 0); f.quadraticCurveTo(0, -11, 20, 0); f.quadraticCurveTo(0, 11, -20, 0); f.fill(); f.strokeStyle = "rgba(190,220,150,0.5)"; f.lineWidth = 1; f.beginPath(); f.moveTo(-18, 0); f.lineTo(18, 0); f.stroke(); f.restore(); }
        F.t.needsUpdate = true; poseurs.haie.feuilles = new THREE.MeshStandardMaterial({ map: F.t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.75 });
      }
      const ht = o.h || 1.5, ep = 0.62, tx = poseurs.haie.tex.clone(); tx.repeat.set(o.w * 1.6, ht * 1.6); tx.needsUpdate = true;
      const coeur = boite(o.w, ht, ep, mat(0xffffff, { roughness: 1, map: tx })); coeur.position.y = ht / 2; g.add(coeur);
      const n = Math.round(o.w * (ht * 2 + ep) * 60), im = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.2, 0.2), poseurs.haie.feuilles, n), d = new THREE.Object3D();
      for (let i = 0; i < n; i++) { const a = (i * 0.61803) % 1, b = (i * 0.754877) % 1, c = (i * 0.569840) % 1, face = i % 5; // deux faces sur cinq cartes chacune, une sur cinq pour le dessus
        if (face === 4) { d.position.set((a - 0.5) * o.w, ht + 0.02 + c * 0.05, (b - 0.5) * ep); d.rotation.set(-Math.PI / 2 + (c - 0.5) * 0.9, 0, a * 6.3); }
        else { const sg = face % 2 ? 1 : -1; d.position.set((a - 0.5) * o.w, 0.06 + b * ht, sg * (ep / 2 + 0.015 + c * 0.05)); d.rotation.set((c - 0.5) * 0.9, (sg < 0 ? Math.PI : 0) + (a - 0.5) * 0.9, b * 6.3); }
        const sc = 0.75 + c * 0.7; d.scale.set(sc, sc, sc); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, new THREE.Color().setHSL(0.28, 0.25, 0.5 + b * 0.5)); }
      im.castShadow = false; im.receiveShadow = true; g.add(im);
    },
    // touffes d'herbe plus hautes au pied des bordures et des haies : la pelouse n'est pas un tapis
    herbe(o, lieuId, lieu, G, g) {
      if (!poseurs.herbe.m) { const F = toile(128, 128), f = F.g; for (let i = 0; i < 38; i++) { const x = 6 + (i * 29) % 116, h = 50 + (i * 17) % 70; f.strokeStyle = `hsl(${88 + (i % 24)}, ${45 + (i % 20)}%, ${20 + (i % 5) * 5}%)`; f.lineWidth = 2.2 + (i % 3); f.beginPath(); f.moveTo(x, 128); f.quadraticCurveTo(x + ((i % 7) - 3) * 3, 128 - h * 0.6, x + ((i % 9) - 4) * 5, 128 - h); f.stroke(); } F.t.needsUpdate = true; poseurs.herbe.m = new THREE.MeshStandardMaterial({ map: F.t, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 1 }); }
      const n = o.n || 300, geo = new THREE.PlaneGeometry(0.3, 0.2); geo.translate(0, 0.1, 0); const im = new THREE.InstancedMesh(geo, poseurs.herbe.m, n), d = new THREE.Object3D();
      for (let i = 0; i < n; i++) { const a = (i * 0.61803) % 1, b = (i * 0.754877) % 1, c = (i * 0.569840) % 1; d.position.set((a - 0.5) * o.w, 0, (b - 0.5) * o.d); d.rotation.set(0, c * 6.3, 0); const sc = 0.28 + c * 0.34; d.scale.set(sc, sc * (0.7 + a * 0.6), sc); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, new THREE.Color().setHSL(0.27, 0.3, 0.45 + a * 0.4)); }
      im.castShadow = false; im.receiveShadow = true; g.add(im);
    },
    cloture(o, lieuId, lieu, G, g) { const bois = mat(0x6b5a48, { roughness: 0.9 }); const n = Math.round(o.w / 0.14); for (let i = 0; i < n; i++) { const b = boite(0.11, o.h || 1.5, 0.02, bois); b.position.set(-o.w / 2 + (i + 0.5) * (o.w / n), (o.h || 1.5) / 2, 0); g.add(b); } for (const y of [0.35, 1.15]) { const l = boite(o.w, 0.07, 0.04, bois); l.position.set(0, y, -0.03); g.add(l); } },
    flaques(o, lieuId, lieu, G, g) { const m = new THREE.MeshStandardMaterial({ color: 0x0b0e12, roughness: 0.03, metalness: 0.2, transparent: true, opacity: 0.72 }); for (const [x, z, rx, rz] of o.liste) { const f = new THREE.Mesh(new THREE.CircleGeometry(1, 20), m); f.rotation.x = -Math.PI / 2; f.scale.set(rx, rz, 1); f.position.set(x, o.y || 0.047, z); g.add(f); } g.visible = false; temoins.push((r, e) => { g.visible = !!e.env.pluie; }); },
    facade(o, lieuId, lieu, G, g) { // débord de toit et gouttière au-dessus du mur de la maison
      const toit = boite(o.w, 0.12, 0.7, mat(0xe2dccd, { roughness: 0.9 })); toit.position.set(0, o.h, 0.25); g.add(toit); const gout = cyl(0.05, 0.05, o.w, mat(0x5a5f66, { metalness: 0.6, roughness: 0.4 }), 12); gout.rotation.z = Math.PI / 2; gout.position.set(0, o.h - 0.08, 0.6); g.add(gout);
      const desc = cyl(0.035, 0.035, o.h, mat(0x5a5f66, { metalness: 0.6, roughness: 0.4 }), 10); desc.position.set(-o.w / 2 + 0.4, o.h / 2, 0.06); g.add(desc);
    },
  };

  return {
    suivi,
    pret: (lieuId) => Promise.all(suivi.parLieu[lieuId] || []),
    tout: () => Promise.all(Object.values(suivi.parLieu).flat()),
    // rend vrai si l'objet a été posé ; « avec » : des objets posés dessus, dans le repère du premier
    poser(o, lieuId, lieu, G, g) {
      const f = poseurs[o.t]; if (!f) return false;
      f(o, lieuId, lieu, G, g);
      for (const a of o.avec || []) { const s = new THREE.Group(); s.position.set(a.x || 0, a.y || 0, a.z || 0); s.rotation.y = a.r || 0; g.add(s); this.poser(a, lieuId, lieu, G, s); }
      return true;
    },
  };
}
