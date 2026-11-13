// Le matériel de l'électricien, modélisé par le code : multimètre, VAT bipolaire, pointes, tournevis, plateau aimanté.
// Le multimètre et le VAT sont « tenus » en bas de l'image : ils sont accrochés à la caméra.
import * as THREE from "./three.module.min.js";

const RAD = Math.PI / 180;
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...o });
const boite = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cyl = (rt, rb, h, m, seg = 16) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
function toile(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, g: c.getContext("2d"), t }; }

/* ---------- Multimètre : boîtier jaune, écran, sélecteur rotatif, deux douilles ---------- */
export function creerMultimetre() {
  const g = new THREE.Group();
  g.add(boite(0.08, 0.15, 0.034, mat(0xf2c230, { roughness: 0.6 })));
  const face = boite(0.066, 0.136, 0.002, mat(0x23272c, { roughness: 0.7 })); face.position.z = 0.0175; g.add(face);
  const ecran = toile(256, 128);
  const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.058, 0.029), new THREE.MeshBasicMaterial({ map: ecran.t })); lcd.position.set(0, 0.044, 0.0188); g.add(lcd);
  const cadran = toile(256, 200);
  { const c = cadran.g; c.fillStyle = "#23272c"; c.fillRect(0, 0, 256, 200); c.fillStyle = "#f2f2f2"; c.font = "700 34px system-ui, sans-serif"; c.textAlign = "center"; c.fillText("OFF", 52, 74); c.fillText("V~", 128, 40); c.fillText("Ω", 204, 74); cadran.t.needsUpdate = true; }
  const lblCadran = new THREE.Mesh(new THREE.PlaneGeometry(0.062, 0.048), new THREE.MeshBasicMaterial({ map: cadran.t })); lblCadran.position.set(0, -0.012, 0.0186); g.add(lblCadran);
  const molette = new THREE.Group(); molette.position.set(0, -0.022, 0.019); g.add(molette);
  const bouton = cyl(0.016, 0.017, 0.008, mat(0x111316, { roughness: 0.4 }), 32); bouton.rotation.x = Math.PI / 2; bouton.position.z = 0.004; molette.add(bouton);
  const index = boite(0.0035, 0.015, 0.002, mat(0xffffff, { roughness: 0.3 })); index.position.set(0, 0.008, 0.009); molette.add(index);
  const douilles = {};
  for (const [k, x, c] of [["noir", -0.016, 0x111111], ["rouge", 0.016, 0xc8261e]]) {
    const d = cyl(0.0045, 0.0045, 0.004, mat(c), 16); d.rotation.x = Math.PI / 2; d.position.set(x, -0.058, 0.019); g.add(d);
    const o = new THREE.Object3D(); o.position.set(x, -0.058, 0.022); g.add(o); douilles[k] = o;
  }
  const angle = { OFF: 55 * RAD, V: 0, "Ω": -55 * RAD };
  function maj(calibre, lecture) {
    const c = ecran.g; c.fillStyle = "#b9c7a3"; c.fillRect(0, 0, 256, 128);
    c.fillStyle = "#1b2418"; c.textAlign = "right"; c.font = "700 22px system-ui, sans-serif"; c.textAlign = "left";
    c.fillText(calibre === "OFF" ? "" : calibre === "V" ? "V~" : "Ω", 12, 28);
    c.textAlign = "right"; c.font = "700 72px ui-monospace, Menlo, monospace";
    c.fillText(calibre === "OFF" ? "" : lecture || "- - -", 244, 104);
    ecran.t.needsUpdate = true;
    molette.userData.cible = angle[calibre] ?? 0;
  }
  g.userData = { maj, molette, douilles, hauteur: 0.15 };
  return g;
}

/* ---------- VAT bipolaire : corps avec l'échelle de voyants, et sa seconde poignée ---------- */
export function creerVAT() {
  const g = new THREE.Group();
  g.add(boite(0.036, 0.15, 0.028, mat(0x2f6fb8, { roughness: 0.55 })));
  const face = boite(0.026, 0.11, 0.002, mat(0x1a1d21)); face.position.set(0, 0.01, 0.0145); g.add(face);
  const valeurs = [12, 24, 50, 120, 230, 400], leds = [];
  const lbl = toile(128, 512);
  { const c = lbl.g; c.fillStyle = "#1a1d21"; c.fillRect(0, 0, 128, 512); c.fillStyle = "#f2f2f2"; c.font = "700 44px system-ui, sans-serif"; c.textAlign = "right";
    valeurs.forEach((v, i) => c.fillText(String(v), 120, 470 - i * 80)); lbl.t.needsUpdate = true; }
  const etiq = new THREE.Mesh(new THREE.PlaneGeometry(0.013, 0.104), new THREE.MeshBasicMaterial({ map: lbl.t })); etiq.position.set(0.0055, 0.01, 0.0158); g.add(etiq);
  valeurs.forEach((v, i) => {
    const m = new THREE.MeshStandardMaterial({ color: 0x5a1512, emissive: 0xff2a1a, emissiveIntensity: 0, roughness: 0.3 });
    const l = cyl(0.0028, 0.0028, 0.002, m, 14); l.rotation.x = Math.PI / 2; l.position.set(-0.0065, 0.01 - 0.052 + 0.0083 + i * 0.0163 - 0.0008, 0.016); g.add(l); leds.push({ v, m });
  });
  const embout = cyl(0.0035, 0.006, 0.02, mat(0x16181b), 12); embout.position.y = -0.085; g.add(embout);
  const sortie = new THREE.Object3D(); sortie.position.set(0, -0.095, 0); g.add(sortie);
  function maj(u) { for (const l of leds) l.m.emissiveIntensity = u >= l.v ? 2.2 : 0; }
  g.userData = { maj, sortie, hauteur: 0.15 };
  return g;
}

/* ---------- Pointe de touche (multimètre ou VAT), fine, avec sa garde ---------- */
export function creerSonde(coul) {
  const g = new THREE.Group();
  const m = mat(coul, { roughness: 0.45 });
  const corps = cyl(0.0026, 0.0032, 0.034, m, 12); corps.position.y = 0.032; g.add(corps);
  const garde = cyl(0.0045, 0.0045, 0.002, m, 12); garde.position.y = 0.0145; g.add(garde);
  const pointe = cyl(0.0006, 0.0011, 0.014, mat(0xd0d3d6, { metalness: 0.9, roughness: 0.3 }), 8); pointe.position.y = 0.007; g.add(pointe);
  const haut = new THREE.Object3D(); haut.position.y = 0.049; g.add(haut);
  g.userData.haut = haut;
  return g;
}

/* ---------- Tournevis d'électricien isolé, fin ---------- */
export function creerTournevis() {
  const g = new THREE.Group();
  const manche = cyl(0.0068, 0.0078, 0.07, mat(0xd8261c, { roughness: 0.5 }), 14); manche.position.y = 0.122; g.add(manche);
  const bague = cyl(0.0082, 0.0082, 0.01, mat(0xf2c230, { roughness: 0.5 }), 14); bague.position.y = 0.082; g.add(bague);
  const isolant = cyl(0.0024, 0.0024, 0.06, mat(0xd8261c, { roughness: 0.5 }), 10); isolant.position.y = 0.047; g.add(isolant);
  const tige = cyl(0.0016, 0.0016, 0.016, mat(0xc9ccd0, { metalness: 0.9, roughness: 0.3 }), 8); tige.position.y = 0.009; g.add(tige);
  const lame = boite(0.0036, 0.004, 0.0008, mat(0xc9ccd0, { metalness: 0.9, roughness: 0.3 })); lame.position.y = 0.0015; g.add(lame);
  return g;
}

/* ---------- Plateau aimanté où l'on pose les vis ---------- */
export function creerPlateau() {
  const g = new THREE.Group();
  const fond = cyl(0.03, 0.026, 0.008, mat(0x2b2f34, { roughness: 0.4, metalness: 0.5 }), 32); fond.rotation.x = Math.PI / 2; g.add(fond);
  const creux = cyl(0.026, 0.026, 0.002, mat(0x16181b, { roughness: 0.6 }), 32); creux.rotation.x = Math.PI / 2; creux.position.z = 0.0035; g.add(creux);
  const places = [new THREE.Vector3(-0.009, 0.004, 0.006), new THREE.Vector3(0.009, -0.004, 0.006)].map((p) => { const o = new THREE.Object3D(); o.position.copy(p); g.add(o); return o; });
  g.userData = { places, hauteur: 0.06 };
  return g;
}
