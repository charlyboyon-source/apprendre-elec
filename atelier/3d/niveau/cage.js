// Cage d'escalier et parties communes (niveaux 4 et 5) : une vraie cage à deux volées par étage, avec palier
// intermédiaire, limon, rampe et main courante, et ce qu'on trouve sur un palier d'immeuble.
// Tout est construit par le code, aux cotes ci-dessous ; les lieux d'un même « ensemble » s'emboîtent étage par étage.
import * as THREE from "../three.module.min.js";

export const CAGE = { H: 2.8, demi: 1.2, long: 3.3, course: 2.0, n: 8, volee: 1.1 }; // hauteur d'étage, demi-largeur, longueur, longueur d'une volée, marches par volée, largeur d'une volée
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// chemins de marche d'un palier à l'autre, dans le repère du palier de départ (lz = profondeur de ce palier)
export function monter(vers, lz) {
  const zs = -lz / 2, { H, course } = CAGE;
  return { t: "passage", vers, x: 0.65, y: 1.0, z: zs - course / 2, w: 1.0, h: 2.0, d: course, chemin: [[0.65, 1.62, zs + 0.3], [0.65, 1.62 + H / 2, zs - course - 0.3], [-0.65, 1.62 + H / 2, zs - course - 0.3], [-0.65, 1.62 + H, zs + 0.15]] };
}
export function descendre(vers, lz) {
  const zs = -lz / 2, { H, course } = CAGE;
  return { t: "passage", vers, x: -0.65, y: -0.35, z: zs - course / 2 + 0.1, w: 1.0, h: 1.5, d: course - 0.2, chemin: [[-0.65, 1.62, zs + 0.2], [-0.65, 1.62 - H / 2, zs - course - 0.3], [0.65, 1.62 - H / 2, zs - course - 0.3], [0.65, 1.62 - H, zs + 0.3]] };
}

export function poseursCage({ M, mat, boite, cyl, cible, pbr, toile, temoins }) {
  const fer = mat(0x2b2f34, { metalness: 0.6, roughness: 0.45 }), nez = mat(0x3a3f46, { roughness: 0.7 }), pierre = mat(0xb9b3a6, { roughness: 0.75 });
  const plat = (w, d, m) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); p.rotation.x = -Math.PI / 2; p.receiveShadow = true; return p; };
  const image = (w, h, T, o = {}) => { T.t.needsUpdate = true; return new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.lumineux ? new THREE.MeshBasicMaterial({ map: T.t }) : new THREE.MeshStandardMaterial({ map: T.t, roughness: o.r || 0.8 })); };
  const barre = (a, b, r, m) => { const d = b.clone().sub(a), c = cyl(r, r, d.length(), m, 10); c.position.copy(a).addScaledVector(d, 0.5); c.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return c; };

  return {
    // un étage de la cage : le palier (sol, murs, soubassement peint), le puits de l'escalier, et les deux volées qui montent
    cageEtage(o, lieuId, lieu, G, g) {
      const [lx, lz] = lieu.taille, { H, demi, long, course, n, volee } = CAGE, zs = -lz / 2, zn = zs - long, hm = H / 2 / n, gir = course / n, monte = o.monte !== false;
      const peint = mat(lieu.teinte || 0xf1eee6, { roughness: 0.92, normalMap: M.mur.normalMap }), soub = mat(o.soubassement || 0x6f8794, { roughness: 0.75 }), lisere = mat(0x2f3f4a, { roughness: 0.6 });
      const sol = o.sol === "bois" ? mat(0xffffff, { map: pbr.tex("wood_floor_diff.jpg", [lx / 1.7, lz / 1.7]), normalMap: pbr.tex("wood_floor_nor_gl.jpg", [lx / 1.7, lz / 1.7], false), roughness: 0.85 }) : pbr.m("floor_tiles_06", [lx / 1.3, lz / 1.3], { roughness: 0.55 });
      // mur dont la face visible est dans le plan donné ; « s » = côté où part l'épaisseur
      const murX = (x, z0, z1, y0, y1, s, m = peint) => { const w = boite(0.1, y1 - y0, Math.abs(z1 - z0), m); w.position.set(x + s * 0.05, (y0 + y1) / 2, (z0 + z1) / 2); g.add(w); return w; };
      const murZ = (z, x0, x1, y0, y1, s, m = peint) => { const w = boite(Math.abs(x1 - x0), y1 - y0, 0.1, m); w.position.set((x0 + x1) / 2, (y0 + y1) / 2, z + s * 0.05); g.add(w); return w; };
      const soubX = (x, z0, z1, s) => { if (o.soubassement === false) return; const w = boite(0.008, 1.1, Math.abs(z1 - z0), soub); w.castShadow = false; w.position.set(x - s * 0.004, 0.55, (z0 + z1) / 2); g.add(w); const l = boite(0.01, 0.03, Math.abs(z1 - z0), lisere); l.castShadow = false; l.position.set(x - s * 0.005, 1.115, (z0 + z1) / 2); g.add(l); };
      const soubZ = (z, x0, x1, s) => { if (o.soubassement === false) return; const w = boite(Math.abs(x1 - x0), 1.1, 0.008, soub); w.castShadow = false; w.position.set((x0 + x1) / 2, 0.55, z - s * 0.004); g.add(w); const l = boite(Math.abs(x1 - x0), 0.03, 0.01, lisere); l.castShadow = false; l.position.set((x0 + x1) / 2, 1.115, z - s * 0.005); g.add(l); };
      // palier : dalle, revêtement, murs
      const dalle = boite(lx + 0.2, 0.18, lz + 0.1, M.plafond); dalle.castShadow = false; dalle.position.set(0, -0.11, 0.05); g.add(dalle);
      const rev = plat(lx, lz, sol); rev.position.y = 0.002; g.add(rev);
      murZ(lz / 2, -lx / 2, lx / 2, 0, H, 1); soubZ(lz / 2, -lx / 2, lx / 2, 1);
      murX(lx / 2, zs, lz / 2, 0, H, 1); soubX(lx / 2, zs, lz / 2, 1); murX(-lx / 2, zs, lz / 2, 0, H, -1); soubX(-lx / 2, zs, lz / 2, -1);
      if (lx / 2 > demi + 0.05) { murZ(zs, demi, lx / 2, 0, H, -1); soubZ(zs, demi, lx / 2, -1); murZ(zs, -lx / 2, -demi, 0, H, -1); soubZ(zs, -lx / 2, -demi, -1); }
      // puits de l'escalier : trois murs
      murX(demi, zn, zs, 0, H, 1); murX(-demi, zn, zs, 0, H, -1); murZ(zn, -demi, demi, 0, H, -1);
      if (!o.dernier) { const pf = new THREE.Mesh(new THREE.PlaneGeometry(lx, lz), M.plafond); pf.rotation.x = Math.PI / 2; pf.position.y = H - 0.205; g.add(pf); }
      if (o.dernier) { const toit = boite(lx + 0.2, 0.2, lz + 0.1, M.plafond); toit.castShadow = false; toit.position.set(0, H - 0.1, 0.05); g.add(toit); const toit2 = boite(2 * demi + 0.2, 0.2, long + 0.1, M.plafond); toit2.castShadow = false; toit2.position.set(0, H - 0.1, zs - long / 2); g.add(toit2); }
      // sous la première volée, au rez-de-chaussée : le mur de la descente de cave et le mur d'échiffre
      if (o.sousEscalier) { murZ(zs, -demi, 0.08, 0, H - 0.2, -1); soubZ(zs, -demi, 0.08, -1); murX(0.08, zs - course, zs, 0, H / 2, -1); }
      const bois = pbr.m("kitchen_wood", [1, 4], { roughness: 0.5 }), marche = o.marches === "bois" ? pbr.m("kitchen_wood", [2, 0.5], { roughness: 0.6 }) : pierre;
      const rampe = (x, z0, y0, z1, y1) => { // balustres, lisse basse et main courante le long d'une volée
        g.add(barre(V(x, y0 + 0.92, z0), V(x, y1 + 0.92, z1), 0.024, bois)); g.add(barre(V(x, y0 + 0.12, z0), V(x, y1 + 0.12, z1), 0.012, fer));
        const k = Math.round(Math.hypot(z1 - z0, y1 - y0) / 0.13); for (let i = 0; i <= k; i++) { const f = i / k, b = cyl(0.007, 0.007, 0.8, fer, 6); b.castShadow = false; b.position.set(x, y0 + (y1 - y0) * f + 0.52, z0 + (z1 - z0) * f); g.add(b); }
      };
      const poteau = (x, y, z) => { const p = cyl(0.022, 0.022, 1.0, fer, 10); p.position.set(x, y + 0.5, z); g.add(p); const b = new THREE.Mesh(new THREE.SphereGeometry(0.034, 12, 10), bois); b.position.set(x, y + 1.01, z); g.add(b); };
      const courante = (x, z0, y0, z1, y1) => { g.add(barre(V(x, y0 + 0.9, z0), V(x, y1 + 0.9, z1), 0.02, bois)); for (const f of [0.08, 0.5, 0.92]) { const s = cyl(0.007, 0.007, 0.06, fer, 6); s.rotation.z = Math.PI / 2; s.castShadow = false; s.position.set(x + Math.sign(x) * 0.03, y0 + (y1 - y0) * f + 0.88, z0 + (z1 - z0) * f); g.add(s); } };
      if (monte) {
        const a = Math.atan2(H / 2, course), L = Math.hypot(course, H / 2), dec = hm * Math.cos(a) + 0.07;
        for (const [cx, sens, yb, zb] of [[0.65, -1, 0, zs], [-0.65, 1, H / 2, zs - course]]) {
          for (let i = 0; i < n; i++) {
            const m = boite(volee, hm, gir, marche); m.position.set(cx, yb + (i + 0.5) * hm, zb + sens * (i + 0.5) * gir); g.add(m);
            const nz = boite(volee, 0.012, 0.035, nez); nz.castShadow = false; nz.position.set(cx, yb + (i + 1) * hm + 0.004, zb + sens * i * gir + sens * 0.02); g.add(nz);
          }
          // la paillasse (dessous de la volée) et le limon côté vide
          const pa = boite(volee, 0.14, L, M.plafond); pa.rotation.x = -sens * a; pa.position.set(cx, yb + H / 4 - dec * Math.cos(a), zb + sens * (course / 2 + dec * Math.sin(a))); g.add(pa);
          const li = boite(0.04, 0.3, L + 0.1, mat(0xf1ede3, { roughness: 0.6 })); li.rotation.x = -sens * a; li.position.set(cx - Math.sign(cx) * (volee / 2 + 0.005), yb + H / 4 - 0.02, zb + sens * course / 2); g.add(li);
          rampe(Math.sign(cx) * 0.13, zb + sens * 0.1, yb + hm, zb + sens * (course - 0.02), yb + H / 2);
          courante(Math.sign(cx) * (demi - 0.06), zb + sens * 0.1, yb + hm, zb + sens * (course - 0.02), yb + H / 2);
        }
        // palier intermédiaire
        const pi = boite(2 * demi, 0.16, long - course, M.plafond); pi.position.set(0, H / 2 - 0.08, zn + (long - course) / 2); g.add(pi);
        const rp = plat(2 * demi, long - course, sol); rp.position.set(0, H / 2 + 0.002, zn + (long - course) / 2); g.add(rp);
        poteau(0.13, 0, zs + 0.06); poteau(0.13, H / 2, zs - course - 0.04); poteau(-0.13, H / 2, zs - course - 0.04);
        g.add(barre(V(0.13, H / 2 + 0.92, zs - course - 0.04), V(-0.13, H / 2 + 0.92, zs - course - 0.04), 0.024, bois));
      }
      if (o.arrive) { // en haut de la volée qui vient d'en dessous : le poteau d'arrivée, et le garde-corps devant le vide si rien ne monte plus haut
        poteau(-0.13, 0, zs + 0.06);
        if (monte) g.add(barre(V(-0.13, 0.92, zs + 0.06), V(0.13, 0.92, zs + 0.06), 0.024, bois));
        else { g.add(barre(V(-0.13, 0.95, zs + 0.06), V(demi, 0.95, zs + 0.06), 0.024, bois)); g.add(barre(V(-0.13, 0.12, zs + 0.06), V(demi, 0.12, zs + 0.06), 0.012, fer)); for (let x = 0; x < demi; x += 0.12) { const b = cyl(0.007, 0.007, 0.83, fer, 6); b.castShadow = false; b.position.set(x, 0.535, zs + 0.06); g.add(b); } }
      }
    },
    // porte d'appartement sur un palier : nom, numéro, judas, sonnette et paillasson
    porteAppart(o, lieuId, lieu, G, g) {
      const bois = pbr.m("rough_pine_door", [1, 1], { color: o.teinte || 0x5d4a3a, roughness: 0.55 }), cadre = mat(0xf1ede3, { roughness: 0.5 });
      for (const [w, h, x, y] of [[1.06, 0.07, 0, 2.1], [0.07, 2.12, -0.5, 1.06], [0.07, 2.12, 0.5, 1.06]]) { const b = boite(w, h, 0.07, cadre); b.position.set(x, y, 0.025); g.add(b); }
      const v = boite(0.92, 2.05, 0.04, bois); v.position.set(0, 1.035, 0.02); g.add(v);
      for (const [y, h] of [[0.52, 0.72], [1.42, 0.8]]) { const p = boite(0.66, h, 0.01, bois); p.castShadow = false; p.position.set(0, y, 0.044); g.add(p); }
      const pg = cyl(0.028, 0.028, 0.05, M.laiton, 14); pg.rotation.x = Math.PI / 2; pg.position.set(0.36, 1.02, 0.07); g.add(pg); const ser = boite(0.04, 0.12, 0.008, M.laiton); ser.position.set(0.36, 1.18, 0.044); g.add(ser);
      const judas = cyl(0.012, 0.012, 0.01, M.laiton, 12); judas.rotation.x = Math.PI / 2; judas.position.set(0, 1.55, 0.05); g.add(judas);
      const T = toile(192, 64), gg = T.g; gg.fillStyle = "#c9a44a"; gg.fillRect(0, 0, 192, 64); gg.fillStyle = "#2b2014"; gg.textAlign = "center"; gg.font = "700 26px system-ui"; gg.fillText(o.nom || "", 96, 42);
      const pl = image(0.18, 0.06, T, { r: 0.4 }); pl.position.set(0, 1.42, 0.0505); g.add(pl);
      // la sonnette, à côté de l'huisserie, avec son étiquette
      const sx = o.sonnette === "gauche" ? -0.66 : 0.66, bs = boite(0.06, 0.09, 0.018, M.plastique); bs.position.set(sx, 1.2, 0.009); g.add(bs); const bt = cyl(0.014, 0.014, 0.008, M.laiton, 14); bt.rotation.x = Math.PI / 2; bt.position.set(sx, 1.215, 0.02); g.add(bt);
      const S = toile(96, 32); S.g.fillStyle = "#fbfaf4"; S.g.fillRect(0, 0, 96, 32); S.g.fillStyle = "#1d2228"; S.g.textAlign = "center"; S.g.font = "700 15px system-ui"; S.g.fillText(o.nom || "", 48, 21); const se = image(0.05, 0.017, S); se.position.set(sx, 1.172, 0.0185); g.add(se);
      // le paillasson
      const P2 = toile(128, 64), p2 = P2.g; p2.fillStyle = o.paillasson || "#5a4630"; p2.fillRect(0, 0, 128, 64); p2.strokeStyle = "rgba(0,0,0,0.45)"; p2.lineWidth = 4; p2.strokeRect(4, 4, 120, 56); p2.fillStyle = "rgba(0,0,0,0.5)"; p2.font = "700 20px system-ui"; p2.textAlign = "center"; p2.fillText(o.mot || "", 64, 39);
      P2.t.needsUpdate = true; const pa = boite(0.7, 0.015, 0.42, mat(0xffffff, { map: P2.t, roughness: 1 })); pa.castShadow = false; pa.position.set(0, 0.009, 0.36); g.add(pa);
    },
    // porte vitrée de l'immeuble : cadre métallique, deux vitrages, la rue en plein jour derrière, bâton de maréchal
    porteVitree(o, lieuId, lieu, G, g) {
      const alu = mat(0x3a4048, { metalness: 0.6, roughness: 0.4 });
      const T = toile(256, 512), gg = T.g, ciel = gg.createLinearGradient(0, 0, 0, 200); ciel.addColorStop(0, "#bcd9f5"); ciel.addColorStop(1, "#eaf2fa"); gg.fillStyle = ciel; gg.fillRect(0, 0, 256, 512);
      gg.fillStyle = "#cfc4ae"; gg.fillRect(0, 90, 256, 250); for (let y = 0; y < 3; y++) for (let x = 0; x < 4; x++) { gg.fillStyle = "#5d6b7a"; gg.fillRect(14 + x * 62, 108 + y * 74, 36, 50); gg.fillStyle = "#e9e2d0"; gg.fillRect(12 + x * 62, 160 + y * 74, 40, 4); }
      gg.fillStyle = "#8d949c"; gg.fillRect(0, 340, 256, 40); gg.fillStyle = "#5a5f66"; gg.fillRect(0, 380, 256, 132); gg.fillStyle = "#e6e2d6"; for (let x = 0; x < 256; x += 60) gg.fillRect(x, 438, 34, 6);
      gg.fillStyle = "#2f5a36"; gg.beginPath(); gg.arc(200, 300, 34, 0, 7); gg.fill(); gg.fillStyle = "#4a3526"; gg.fillRect(196, 320, 8, 44);
      for (const [w, h, x, y] of [[1.5, 0.08, 0, 2.2], [0.08, 2.24, -0.75, 1.12], [0.08, 2.24, 0.75, 1.12], [0.06, 2.2, 0, 1.1], [1.5, 0.1, 0, 0.05]]) { const b = boite(w, h, 0.08, alu); b.position.set(x, y, 0.03); g.add(b); }
      for (const x of [-0.37, 0.37]) { const im = image(0.68, 2.08, T, { lumineux: true }); im.position.set(x, 1.13, 0.02); g.add(im); temoins.push(() => im.material.color.setScalar(1.25)); const vit = boite(0.68, 2.08, 0.01, new THREE.MeshStandardMaterial({ color: 0xcfe0ea, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.18 })); vit.castShadow = false; vit.position.set(x, 1.13, 0.04); g.add(vit);
        const bat = cyl(0.016, 0.016, 0.9, M.acier, 10); bat.position.set(x * 0.25, 1.1, 0.1); g.add(bat); for (const y of [0.75, 1.45]) { const s = cyl(0.008, 0.008, 0.06, M.acier, 6); s.rotation.x = Math.PI / 2; s.position.set(x * 0.25, y, 0.07); g.add(s); } }
      const ff = cyl(0.03, 0.03, 0.3, alu, 10); ff.rotation.z = Math.PI / 2; ff.position.set(0.45, 2.28, 0.1); g.add(ff); // ferme-porte
    },
    // platine d'interphone et bouton de sortie
    interphone(o, lieuId, lieu, G, g) {
      const pl = boite(0.16, 0.3, 0.02, mat(0xc5c9ce, { metalness: 0.8, roughness: 0.3 })); pl.position.z = 0.01; g.add(pl);
      const T = toile(128, 240), gg = T.g; gg.fillStyle = "#c5c9ce"; gg.fillRect(0, 0, 128, 240); gg.fillStyle = "#3a3f46"; for (let y = 0; y < 5; y++) for (let x = 0; x < 9; x++) { gg.beginPath(); gg.arc(24 + x * 10, 18 + y * 9, 2.4, 0, 7); gg.fill(); }
      ["Durand", "Nguyen", "Petit", "Benali", "Roche", "Lopez"].forEach((nom, i) => { const y = 74 + i * 27; gg.fillStyle = "#fbfaf4"; gg.fillRect(12, y, 78, 20); gg.fillStyle = "#1d2228"; gg.font = "700 13px system-ui"; gg.fillText(nom, 17, y + 15); gg.fillStyle = "#8d949c"; gg.beginPath(); gg.arc(108, y + 10, 8, 0, 7); gg.fill(); });
      const f = image(0.15, 0.285, T, { r: 0.35 }); f.position.z = 0.0205; g.add(f);
      const bp = boite(0.07, 0.07, 0.02, M.plastique); bp.position.set(0, -0.26, 0.01); g.add(bp); const b = cyl(0.02, 0.02, 0.01, mat(0x2f8a3a, { roughness: 0.4 }), 16); b.rotation.x = Math.PI / 2; b.position.set(0, -0.26, 0.024); g.add(b);
      const E = toile(96, 32); E.g.fillStyle = "#fbfaf4"; E.g.fillRect(0, 0, 96, 32); E.g.fillStyle = "#1d2228"; E.g.font = "700 18px system-ui"; E.g.textAlign = "center"; E.g.fillText("PORTE", 48, 23); const e = image(0.07, 0.023, E); e.position.set(0, -0.315, 0.002); g.add(e);
    },
    extincteur(o, lieuId, lieu, G, g) {
      const rouge = mat(0xc8201a, { roughness: 0.35, metalness: 0.2 });
      const c = cyl(0.07, 0.07, 0.42, rouge, 20); c.position.set(0, 0, 0.09); g.add(c); const d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 10, 0, 7, 0, Math.PI / 2), rouge); d.position.set(0, 0.21, 0.09); g.add(d);
      const t = cyl(0.02, 0.02, 0.07, M.noir, 10); t.position.set(0, 0.3, 0.09); g.add(t); const p = boite(0.1, 0.02, 0.03, M.noir); p.position.set(0.02, 0.34, 0.09); g.add(p); const man = cyl(0.014, 0.014, 0.01, M.laiton, 10); man.rotation.x = Math.PI / 2; man.position.set(0, 0.29, 0.115); g.add(man);
      const tu = cyl(0.01, 0.01, 0.34, M.noir, 8); tu.position.set(-0.085, 0.1, 0.09); g.add(tu);
      const E = toile(64, 96); E.g.fillStyle = "#f4f1ea"; E.g.fillRect(0, 0, 64, 96); E.g.fillStyle = "#1d2228"; E.g.font = "700 11px system-ui"; E.g.textAlign = "center"; E.g.fillText("EAU + ADDITIF", 32, 22); E.g.fillText("6 L", 32, 40); E.g.fillStyle = "#666"; for (let i = 0; i < 4; i++) E.g.fillRect(8, 52 + i * 10, 48, 3);
      const et = image(0.07, 0.1, E); et.position.set(0, 0, 0.1605); g.add(et);
      const S = toile(96, 96), s = S.g; s.fillStyle = "#c8201a"; s.fillRect(0, 0, 96, 96); s.fillStyle = "#fff"; s.fillRect(38, 26, 20, 46); s.fillRect(34, 18, 28, 10); s.fillRect(58, 20, 16, 5); s.strokeStyle = "#fff"; s.lineWidth = 4; s.strokeRect(5, 5, 86, 86);
      const pan = image(0.15, 0.15, S); pan.position.set(0, 0.62, 0.004); g.add(pan);
    },
    planEvacuation(o, lieuId, lieu, G, g) {
      const T = toile(256, 192), gg = T.g; gg.fillStyle = "#fbfaf4"; gg.fillRect(0, 0, 256, 192); gg.fillStyle = "#2f8a3a"; gg.fillRect(0, 0, 256, 26); gg.fillStyle = "#fff"; gg.font = "700 15px system-ui"; gg.fillText(`PLAN D'ÉVACUATION — ${o.etage || ""}`, 8, 18);
      gg.strokeStyle = "#1d2228"; gg.lineWidth = 3; gg.strokeRect(20, 44, 150, 120); gg.strokeRect(70, 44, 50, 50); gg.lineWidth = 2; for (let i = 0; i < 6; i++) { gg.beginPath(); gg.moveTo(74 + i * 8, 46); gg.lineTo(74 + i * 8, 92); gg.stroke(); }
      gg.strokeStyle = "#2f8a3a"; gg.lineWidth = 5; gg.beginPath(); gg.moveTo(95, 140); gg.lineTo(95, 100); gg.stroke(); gg.fillStyle = "#2f8a3a"; gg.beginPath(); gg.moveTo(95, 90); gg.lineTo(86, 104); gg.lineTo(104, 104); gg.fill();
      gg.fillStyle = "#c8201a"; gg.beginPath(); gg.arc(95, 146, 6, 0, 7); gg.fill(); gg.fillStyle = "#1d2228"; gg.font = "700 11px system-ui"; gg.fillText("VOUS ÊTES ICI", 106, 150);
      gg.font = "11px system-ui"; ["Gardez votre calme", "Fermez les portes", "Descendez par", "l'escalier"].forEach((t, i) => gg.fillText(t, 178, 60 + i * 16));
      const cadre = boite(0.36, 0.28, 0.012, M.noir); cadre.position.z = 0.006; g.add(cadre); const im = image(0.34, 0.255, T); im.position.z = 0.0125; g.add(im);
    },
    // trappe de la colonne montante électrique (les compteurs et le câble de l'immeuble sont derrière)
    colonne(o, lieuId, lieu, G, g) {
      const gris = mat(0xb9bfc6, { metalness: 0.5, roughness: 0.5 });
      const p = boite(0.5, 1.5, 0.02, gris); p.position.set(0, 0, 0.012); g.add(p); for (const [w, h, x, y] of [[0.56, 0.04, 0, 0.77], [0.56, 0.04, 0, -0.77], [0.04, 1.58, -0.27, 0], [0.04, 1.58, 0.27, 0]]) { const b = boite(w, h, 0.03, mat(0x8d949c, { metalness: 0.5, roughness: 0.5 })); b.position.set(x, y, 0.015); g.add(b); }
      const car = boite(0.03, 0.03, 0.012, M.noir); car.position.set(0.2, 0, 0.028); g.add(car);
      const T = toile(160, 112), gg = T.g; gg.fillStyle = "#e9b400"; gg.fillRect(0, 0, 160, 112); gg.fillStyle = "#1d2228"; gg.beginPath(); gg.moveTo(80, 8); gg.lineTo(118, 62); gg.lineTo(42, 62); gg.fill(); gg.fillStyle = "#e9b400"; gg.beginPath(); gg.moveTo(84, 22); gg.lineTo(72, 42); gg.lineTo(81, 42); gg.lineTo(76, 56); gg.lineTo(90, 36); gg.lineTo(81, 36); gg.fill();
      gg.fillStyle = "#1d2228"; gg.font = "700 15px system-ui"; gg.textAlign = "center"; gg.fillText("COLONNE ÉLECTRIQUE", 80, 84); gg.font = "700 11px system-ui"; gg.fillText("accès réservé", 80, 102);
      const et = image(0.2, 0.14, T); et.position.set(0, 0.35, 0.023); g.add(et);
    },
    plaqueEtage(o, lieuId, lieu, G, g) {
      const T = toile(160, 96), gg = T.g; gg.fillStyle = "#1f3f66"; gg.fillRect(0, 0, 160, 96); gg.strokeStyle = "#fff"; gg.lineWidth = 4; gg.strokeRect(6, 6, 148, 84); gg.fillStyle = "#fff"; gg.textAlign = "center"; gg.font = "700 40px system-ui"; gg.fillText(o.texte, 80, 50); gg.font = "700 16px system-ui"; gg.fillText(o.sous || "étage", 80, 76);
      const im = image(0.2, 0.12, T, { r: 0.4 }); im.position.z = 0.004; g.add(im);
    },
    // ce que les peintres ont oublié sur le mur : des bandes de ruban de masquage
    ruban(o, lieuId, lieu, G, g) {
      const m = mat(0xe8d9a0, { roughness: 0.9 });
      for (const [x, y, l, r] of o.bandes || [[0, 0, 0.3, 0]]) { const b = boite(l, 0.025, 0.002, m); b.castShadow = false; b.position.set(x, y, 0.002); b.rotation.z = r; g.add(b); }
    },
    escabeau(o, lieuId, lieu, G, g) {
      const alu = mat(0xcfd3d8, { metalness: 0.8, roughness: 0.35 }), h = 1.1;
      for (const s of [-1, 1]) { g.add(barre(V(s * 0.22, 0, 0.3), V(s * 0.17, h, 0), 0.016, alu)); g.add(barre(V(s * 0.22, 0, -0.32), V(s * 0.17, h, 0), 0.014, alu)); }
      for (let i = 1; i <= 3; i++) { const f = i / 4, m = boite(0.4 - f * 0.08, 0.02, 0.09, alu); m.position.set(0, h * f, 0.3 * (1 - f)); g.add(m); }
      const pl = boite(0.36, 0.025, 0.24, alu); pl.position.set(0, h, 0); g.add(pl);
    },
    velo(o, lieuId, lieu, G, g) {
      const cadre = mat(o.teinte || 0x2f6f8a, { roughness: 0.35, metalness: 0.4 }), pneu = mat(0x16181b, { roughness: 0.9 });
      g.rotation.z = 0.1; // appuyé contre le mur
      for (const z of [-0.52, 0.52]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.018, 8, 28), pneu); r.rotation.y = Math.PI / 2; r.position.set(0, 0.35, z); r.castShadow = true; g.add(r); const j = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.006, 6, 28), M.acier); j.rotation.y = Math.PI / 2; j.position.set(0, 0.35, z); g.add(j);
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI; g.add(barre(V(0, 0.35 + Math.sin(a) * 0.31, z + Math.cos(a) * 0.31), V(0, 0.35 - Math.sin(a) * 0.31, z - Math.cos(a) * 0.31), 0.0015, M.acier)); } }
      const ped = V(0, 0.32, 0.02), selle = V(0, 0.82, -0.2), dir = V(0, 0.78, 0.38), ar = V(0, 0.35, -0.52), av = V(0, 0.35, 0.52);
      for (const [a, b] of [[ped, selle], [ped, dir], [selle, dir], [ped, ar], [selle, ar], [dir, av]]) g.add(barre(a, b, 0.014, cadre));
      const s = boite(0.1, 0.03, 0.22, M.noir); s.position.set(0, 0.9, -0.22); g.add(s); g.add(barre(selle, V(0, 0.9, -0.21), 0.01, M.acier));
      g.add(barre(dir, V(0, 0.95, 0.34), 0.01, M.acier)); g.add(barre(V(-0.24, 0.96, 0.34), V(0.24, 0.96, 0.34), 0.011, M.acier)); for (const x of [-0.2, 0.2]) { const p = cyl(0.016, 0.016, 0.09, M.noir, 8); p.rotation.z = Math.PI / 2; p.position.set(x, 0.96, 0.34); g.add(p); }
      const pl = cyl(0.09, 0.09, 0.006, M.acier, 18); pl.rotation.z = Math.PI / 2; pl.position.set(0.03, 0.32, 0.02); g.add(pl); g.add(barre(V(0.05, 0.32, 0.02), V(0.1, 0.2, 0.1), 0.008, M.acier)); const pe = boite(0.08, 0.015, 0.05, M.noir); pe.position.set(0.13, 0.2, 0.1); g.add(pe);
    },
    trottinette(o, lieuId, lieu, G, g) {
      const c = mat(o.teinte || 0xd9463a, { roughness: 0.4 });
      const pl = boite(0.1, 0.02, 0.42, c); pl.position.set(0, 0.07, 0); g.add(pl);
      for (const z of [-0.24, 0.27]) { const r = cyl(0.05, 0.05, 0.03, M.noir, 14); r.rotation.z = Math.PI / 2; r.position.set(0, 0.05, z); g.add(r); }
      g.add(barre(V(0, 0.07, 0.24), V(0, 0.72, 0.2), 0.012, M.acier)); g.add(barre(V(-0.16, 0.72, 0.2), V(0.16, 0.72, 0.2), 0.011, M.acier)); for (const x of [-0.14, 0.14]) { const p = cyl(0.015, 0.015, 0.07, c, 8); p.rotation.z = Math.PI / 2; p.position.set(x, 0.72, 0.2); g.add(p); }
    },
    // tuyauterie apparente d'un local technique : deux colonnes, une vanne, un collier
    tuyaux(o, lieuId, lieu, G, g) {
      const cu = mat(0xb87a4a, { metalness: 0.8, roughness: 0.35 }), pvc = mat(0x8d949c, { roughness: 0.6 }), h = lieu.h, y0 = -(o.y === undefined ? 1.2 : o.y);
      const a = cyl(0.014, 0.014, h, cu, 10); a.position.set(-0.08, y0 + h / 2, 0.04); g.add(a); const b = cyl(0.05, 0.05, h, pvc, 14); b.position.set(0.1, y0 + h / 2, 0.07); g.add(b);
      const c = cyl(0.014, 0.014, 0.5, cu, 10); c.rotation.z = Math.PI / 2; c.position.set(-0.33, y0 + 0.5, 0.04); g.add(c);
      const v = cyl(0.035, 0.035, 0.012, mat(0xc8201a, { roughness: 0.5 }), 14); v.rotation.x = Math.PI / 2; v.position.set(-0.08, y0 + 1.1, 0.075); g.add(v); const vc = boite(0.04, 0.05, 0.04, M.laiton); vc.position.set(-0.08, y0 + 1.1, 0.045); g.add(vc);
      for (const y of [0.4, 1.7]) { const col = boite(0.14, 0.02, 0.03, M.acier); col.position.set(0.1, y0 + y, 0.06); g.add(col); }
    },
    etagere(o, lieuId, lieu, G, g) {
      const w = o.w || 0.9, d = 0.32, h = 1.7, alu = mat(0x8d949c, { metalness: 0.6, roughness: 0.45 });
      for (const x of [-w / 2, w / 2]) for (const z of [0.02, d]) { const m = boite(0.03, h, 0.03, alu); m.position.set(x, h / 2, z); g.add(m); }
      [0.25, 0.72, 1.2, 1.66].forEach((y, k) => { const t = boite(w, 0.02, d, alu); t.position.set(0, y, d / 2 + 0.01); g.add(t);
        for (let i = 0; i < 3; i++) { if ((i + k) % 4 === 3) continue; const bw = 0.16 + ((i * 7 + k * 3) % 4) * 0.035, bh = 0.12 + ((i + k * 2) % 3) * 0.06, obj = (i + k) % 2 ? cyl(bw / 2.4, bw / 2.4, bh, mat([0x2f6fd0, 0xe9b400, 0xf1ede3, 0x4a9a35][(i + k) % 4], { roughness: 0.5 }), 14) : boite(bw, bh, 0.2, mat([0xb08a5a, 0x8a6a4a, 0xc9b28a][(i + k) % 3], { roughness: 0.95 })); obj.position.set(-w / 2 + 0.17 + i * 0.28, y + 0.01 + bh / 2, d / 2 + 0.01); g.add(obj); } });
    },
    // silhouette d'une personne assise (un adolescent à son bureau ou sur son lit) : elle ne bouge pas, elle habite la pièce
    personne(o, lieuId, lieu, G, g) {
      const peau = mat(o.peau || 0xd9a983, { roughness: 0.8 }), haut = mat(o.haut || 0x3f5a8a, { roughness: 0.95 }), bas = mat(o.bas || 0x2b3440, { roughness: 0.95 }), chev = mat(o.cheveux || 0x2b1d14, { roughness: 1 });
      const a = o.assise === undefined ? 0.46 : o.assise; // hauteur de l'assise
      const bassin = boite(0.32, 0.16, 0.24, bas); bassin.position.set(0, a + 0.08, 0); g.add(bassin);
      for (const s of [-1, 1]) { const cu = boite(0.13, 0.12, 0.42, bas); cu.position.set(s * 0.09, a + 0.07, 0.24); g.add(cu); const ja = boite(0.11, a, 0.12, bas); ja.position.set(s * 0.09, a / 2, 0.42); g.add(ja); const pi = boite(0.1, 0.07, 0.24, mat(0xf1ede3, { roughness: 0.7 })); pi.position.set(s * 0.09, 0.035, 0.48); g.add(pi); }
      const tronc = boite(0.36, 0.5, 0.2, haut); tronc.position.set(0, a + 0.4, 0.03); tronc.rotation.x = 0.16; g.add(tronc);
      const cou = cyl(0.045, 0.05, 0.08, peau, 10); cou.position.set(0, a + 0.69, 0.08); g.add(cou);
      const tete = new THREE.Mesh(new THREE.SphereGeometry(0.105, 18, 14), peau); tete.scale.set(0.92, 1.1, 1); tete.position.set(0, a + 0.83, 0.1); tete.castShadow = true; g.add(tete);
      const ch = new THREE.Mesh(new THREE.SphereGeometry(0.112, 18, 12, 0, 7, 0, Math.PI * 0.58), chev); ch.scale.set(0.95, 1.1, 1.04); ch.position.set(0, a + 0.845, 0.085); g.add(ch);
      if (o.longs) { const q = boite(0.2, 0.3, 0.06, chev); q.position.set(0, a + 0.66, -0.02); g.add(q); }
      for (const s of [-1, 1]) { const br = boite(0.09, 0.3, 0.1, haut); br.position.set(s * 0.225, a + 0.47, 0.08); br.rotation.x = -0.5; g.add(br); const av = boite(0.075, 0.075, 0.3, o.manches ? haut : peau); av.position.set(s * 0.2, a + 0.33, 0.3); av.rotation.y = -s * 0.25; g.add(av); }
      if (o.casque) { const arc = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.012, 6, 16, Math.PI), M.noir); arc.position.set(0, a + 0.85, 0.09); g.add(arc); for (const s of [-1, 1]) { const e = cyl(0.04, 0.04, 0.03, M.noir, 12); e.rotation.z = Math.PI / 2; e.position.set(s * 0.11, a + 0.83, 0.09); g.add(e); } }
      if (o.telephone) { const t = boite(0.07, 0.012, 0.14, new THREE.MeshStandardMaterial({ color: 0x1b1d20, emissive: 0xbfd8ff, emissiveIntensity: 0.7, roughness: 0.3 })); t.position.set(0, a + 0.36, 0.44); t.rotation.x = -0.6; g.add(t); }
      if (o.id) { const z = boite(0.6, a + 1.0, 0.8, M.invisible); z.castShadow = false; z.position.set(0, (a + 1) / 2, 0.2); g.add(z); cible(`essayer:${o.id}`, z, [lieuId]); }
    },
  };
}
