// Jeu 3D des niveaux 2 à 6 de l'atelier dépannage. Même prise en main que le niveau 1 : glisser pour tourner la tête,
// toucher pour agir, caisse à outils (je prends l'appareil, je touche deux points). Mais ici, pas de guidage pas à pas :
// un carnet qui se remplit tout seul, des questions au client, un indice en trois crans.
// La logique du jeu est dans coeur.js, l'électricité dans ../moteur/moteur.js : ce fichier ne fait que montrer et toucher.
import * as THREE from "../three.module.min.js";
import { creerMonde } from "./monde.js";
import { creerPartie, heureFr, megohms } from "./coeur.js";
import { creerMultimetre, creerVAT, creerSonde } from "../materiel.js";
import { sons } from "../../immersif/sons.js";

export function lancerNiveau(N) {
  const racine = document.getElementById("jeu");
  const BASE = new URL("./", import.meta.url).href;
  const params = new URLSearchParams(location.search), REDUIT = matchMedia("(prefers-reduced-motion: reduce)").matches, RAD = Math.PI / 180;
  const FOV_PROCHE = 32; let fovLibre = 66;
  let P = null, W = null, renderer = null, camera = null, occupe = false, transition = null, appui = null, attente = null;
  const J = { etiq: {}, vue: N.depart, outil: null, rouge: null, noir: null, dernier: null, lecture: null, panneau: "client", debut: true, lieux: new Set([N.depart]), fil: [], bulle: null, aides: new Set(), onglet: "constats", pris: 0 };
  const regard = { yaw: 0, pitch: 0, base: null };
  const main = {}, sondes = {};
  const OUTILS = { vat: ["VAT", "VAT en main."], multi: ["Multimètre", "Multimètre en main, réglé sur V~."], iso: ["Isolement", "Mesureur d'isolement en main."], ohm: ["Continuité", "Multimètre en main, réglé sur Ω."] };
  const AIDES = {
    vat: "Touche les deux points entre lesquels tu veux vérifier. Teste-le d'abord sur une prise qui marche.",
    multi: "Touche les deux points entre lesquels tu veux mesurer.",
    ohm: "La continuité se mesure sur un circuit COUPÉ : touche deux points. « 0,2 Ω » : ils sont reliés. « OL » : la liaison est coupée entre les deux.",
    iso: "Il se pose sur un circuit COUPÉ : touche une borne de phase ou de neutre, puis une borne de terre. Compare les circuits entre eux.",
  };
  const lisse = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const mesureEnMain = () => !!J.outil;
  const libre = () => !!W.vues[J.vue].libre;
  const lieuDe = (v) => W.vues[v].lieu;

  /* ---------- partie ---------- */
  function nouvellePartie() {
    const causes = Object.keys(N.causes), voulue = (params.get("cause") || "").toUpperCase();
    P = creerPartie(N, causes.includes(voulue) ? voulue : causes[Math.floor(Math.random() * causes.length)]);
    Object.assign(J, { etiq: {}, vue: N.depart, outil: null, rouge: null, noir: null, dernier: null, lecture: null, panneau: "client", debut: true, lieux: new Set([N.depart]), fil: [], bulle: null, onglet: "constats" });
  }
  // une action du joueur : le cœur répond par des messages
  function jouer(a) {
    const r = P.action(a);
    for (const m of r.messages) { J.fil.unshift(m); if (m.type === "danger") { sons.zap(); flash(); } else if (m.type === "alerte" && /Clac/.test(m.t)) sons.disjoncteur(); }
    if (r.messages.length) { const ordre = ["danger", "alerte", "client", "mesure", "ok", "info"]; const tri = [...r.messages].sort((x, y) => ordre.indexOf(x.type) - ordre.indexOf(y.type)); J.bulle = { t: tri.slice(0, 2).map((m) => m.t).join(" "), type: tri[0].type }; }
    W.maj(lieuDe(J.vue), libre()); majSondes(); majUI();
    return r.retour;
  }
  function flash() { const f = racine.querySelector(".j-flash"); f.classList.remove("zap"); void f.offsetWidth; f.classList.add("zap"); try { navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive && navigator.vibrate([90, 40, 220]); } catch { /* rien */ } }

  /* ---------- caméra, vues, déplacements ---------- */
  function orient(pos, cible) { const d = cible.clone().sub(pos).normalize(); return { pos, yaw: Math.atan2(-d.x, -d.z), pitch: Math.asin(d.y) }; }
  function cadrage(v) { const c = W.vues[v].cadre(camera); return c.cible ? orient(c.pos, c.cible) : c; }
  function glisser(vers, d = 800, fov = camera.fov) {
    if (transition) { const a = transition; transition = null; a.res(); }
    let dy = vers.yaw - regard.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    return new Promise((res) => { transition = { t0: performance.now(), d: REDUIT ? 1 : d, de: { pos: camera.position.clone(), yaw: regard.yaw, pitch: regard.pitch, fov: camera.fov }, a: { pos: vers.pos.clone(), yaw: regard.yaw + dy, pitch: vers.pitch, fov }, res }; });
  }
  const fondu = (on) => new Promise((res) => { const f = racine.querySelector(".n-fondu"); f.classList.toggle("on", on); setTimeout(res, REDUIT ? 1 : 190); });
  async function allerVue(v) {
    const de = J.vue; if (v === de) return;
    ranger();
    const lA = lieuDe(de), lB = lieuDe(v);
    if (lA !== lB) { // on passe par la porte : on s'en approche, fondu, on ressort par la porte de l'autre lieu
      const pA = W.lieux[lA].portes && W.lieux[lA].portes[lB], pB = W.lieux[lB].portes && W.lieux[lB].portes[lA];
      if (pA && !pA.userData.trappe) { const p = pA.localToWorld(new THREE.Vector3(0, 0.55, 0.7)), c = pA.localToWorld(new THREE.Vector3(0, 0.5, 0)); await glisser(orient(p, c), 520, fovLibre); }
      await fondu(true);
      J.vue = v; W.maj(lB);
      if (pB && !pB.userData.trappe) { const p = pB.localToWorld(new THREE.Vector3(0, 0.55, 0.5)), c = pB.localToWorld(new THREE.Vector3(0, 0.5, 3)); const o = orient(p, c); camera.position.copy(o.pos); regard.yaw = o.yaw; regard.pitch = o.pitch; }
      else { const o = cadrage(v); camera.position.copy(o.pos); regard.yaw = o.yaw; regard.pitch = o.pitch; }
      camera.fov = fovLibre; camera.updateProjectionMatrix(); majUI();
      await fondu(false);
      jouer({ type: "deplacer" });
    }
    J.vue = v; J.lieux.add(lB); if (W.vues[v].lieuRaccourci) J.lieux.add(v);
    const c = cadrage(v);
    regard.base = W.vues[v].libre ? null : { yaw: 0, pitch: c.pitch };
    majUI();
    await glisser(c, lA !== lB ? 600 : 800, W.vues[v].libre ? fovLibre : FOV_PROCHE);
    if (regard.base) regard.base.yaw = regard.yaw;
    W.maj(lB, libre()); majSondes();
  }
  // chemin d'une vue à une autre : on recule jusqu'au lieu, on traverse les lieux par leurs portes, on s'approche
  function chemin(vers) {
    const haut = []; for (let x = J.vue; !W.vues[x].libre;) { x = W.vues[x].parent; haut.push(x); }
    const bas = []; for (let x = vers; !W.vues[x].libre; x = W.vues[x].parent) bas.unshift(x);
    const lA = lieuDe(J.vue), lB = lieuDe(vers), anc = haut.indexOf(vers);
    if (anc >= 0) return haut.slice(0, anc + 1);
    if (lA === lB) { const A = [J.vue, ...haut]; for (let i = 0; i < A.length; i++) { const k = bas.indexOf(A[i]); if (k >= 0) return [...A.slice(1, i + 1), ...bas.slice(k + 1)]; } return [...haut, ...bas]; }
    const vus = new Map([[lA, null]]), file = [lA];
    while (file.length) { const x = file.shift(); if (x === lB) break; for (const y of Object.keys(W.lieux[x].portes || {})) if (!vus.has(y)) { vus.set(y, x); file.push(y); } }
    const pas = []; for (let x = lB; x && x !== lA; x = vus.get(x)) pas.unshift(x);
    return [...haut, ...pas, ...bas];
  }
  async function allerA(vers) {
    if (occupe || vers === J.vue) return;
    occupe = true;
    try { for (const v of chemin(vers)) await allerVue(v); } finally { occupe = false; majUI(); }
  }
  function reculer() { const p = W.vues[J.vue].parent; if (p) allerA(p); }

  /* ---------- ce qui se touche ---------- */
  const actif = (c) => c.vues.includes(J.vue) && (c.type !== "point" || (mesureEnMain() && pointVisible(c))) && visible(c);
  function visible(c) { for (let o = c.objet; o; o = o.parent) if (o.visible === false) return false; return true; }
  // un point de mesure existe si son organe est accessible : boîte ouverte, bout de fil débranché…
  function pointVisible(c) {
    const id = c.id;
    if (id.endsWith("#bout")) return W.sorti(id.split("#")[0], c.ext);
    if (id.includes("#")) { const [cid, ext] = id.split("#"); return !!P.e.deconnecte[`${cid}:${ext}`]; }
    return true;
  }
  const ray = new THREE.Raycaster();
  function ecranDe(p) { const r = renderer.domElement.getBoundingClientRect(); const q = p.clone().project(camera); return { x: (q.x + 1) / 2 * r.width, y: (1 - q.y) / 2 * r.height, devant: q.z < 1 && q.z > -1 }; }
  function rayonEcran(c) { const p = c.objet.getWorldPosition(new THREE.Vector3()), dr = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0); const a = ecranDe(p), b = ecranDe(p.clone().addScaledVector(dr, c.rayon)); return { ...a, r: Math.hypot(b.x - a.x, b.y - a.y) }; }
  function centreEcran(c) { if (c.type === "point") return rayonEcran(c); const o = c.ancre || c.objet; return ecranDe(new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3())); }
  function cibleSous(x, y) {
    const actives = W.cibles.filter(actif); let best = null;
    for (const c of actives.filter((k) => k.type === "point")) { const s = rayonEcran(c); if (!s.devant) continue; const d = Math.hypot(s.x - x, s.y - y); if (d <= Math.max(s.r, 24) && (!best || d < best.d)) best = { id: c.id, d }; }
    if (best) return best.id;
    const r = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2((x / r.width) * 2 - 1, -(y / r.height) * 2 + 1), camera);
    const objets = actives.filter((k) => k.type === "surface").map((k) => k.objet);
    for (const h of ray.intersectObjects(objets, true)) { let o = h.object; while (o && !o.userData.cible) o = o.parent; if (o) return o.userData.cible; }
    return null;
  }
  async function agir(id) {
    const [quoi, ...reste] = id.split(":"), arg = reste.join(":");
    if (quoi === "aller") return allerVue(arg);
    if (quoi === "approcher") { const v = `v:${arg}`; await allerVue(v); if (N.regards && N.regards[arg] && !J.aides.has(`vu:${arg}`)) { J.aides.add(`vu:${arg}`); jouer({ type: "regarder", id: arg }); } return; }
    if (quoi === "regarder") return void jouer({ type: "regarder", id: arg });
    if (quoi === "manette") { sons.disjoncteur(); return void jouer({ type: "manette", id: arg }); }
    if (quoi === "mode") { sons.clip(); return void jouer({ type: "mode", id: arg }); }
    if (quoi === "regler") { sons.clip(); return void jouer({ type: "regler_horloge", id: arg }); }
    if (quoi === "essayer") { sons.interrupteur(); return void jouer({ type: "essayer", id: arg }); }
    if (quoi === "ouvrir") { sons.clip(); ranger(); return void jouer({ type: "ouvrir", id: arg }); }
    if (quoi === "fil" && W.sorti(reste[0], reste[1])) return void jouer({ type: "regarder", id });
    if (quoi === "fil") { const [cid, ext] = reste; sons.clip(); const deja = !!P.e.deconnecte[`${cid}:${ext}`]; ranger(); return void jouer({ type: deja ? "rebrancher" : "debrancher", conducteur: cid, extremite: ext }); }
    return poserPointe(id); // un point de mesure
  }

  /* ---------- la caisse à outils : je prends l'appareil, je touche deux points ---------- */
  function ranger() { J.outil = null; J.rouge = null; J.noir = null; J.dernier = null; J.lecture = null; if (main.vat) main.vat.userData.maj(0); }
  function prendre(outil) {
    sons.clip();
    if (J.outil === outil) { ranger(); J.bulle = { t: "Appareil rangé dans la caisse.", type: "info" }; }
    else {
      ranger(); J.outil = outil; J.pris = performance.now();
      const premiere = !J.aides.has(outil); J.aides.add(outil);
      const points = W.cibles.some((c) => c.type === "point" && c.vues.includes(J.vue));
      J.bulle = { t: `${OUTILS[outil][1]} ${premiere ? AIDES[outil] : points ? "Touche deux points." : "Approche-toi d'une prise, du tableau ou d'une boîte ouverte pour mesurer."}`, type: "mesure" };
    }
    majSondes(); majUI();
  }
  function poserPointe(id) {
    sons.clip();
    if (J.rouge === id || J.noir === id) { const q = J.rouge === id ? "rouge" : "noir"; J[q] = null; J.lecture = null; J.bulle = { t: "Pointe retirée. Touche un point pour la reposer.", type: "info" }; majSondes(); majUI(); return; }
    const q = !J.rouge ? "rouge" : !J.noir ? "noir" : J.dernier; J[q] = id; J.dernier = q;
    if (J.rouge && J.noir) {
      const r = jouer({ type: "mesurer", outil: J.outil, a: J.rouge, b: J.noir });
      J.lecture = J.outil === "multi" ? `${r} V` : J.outil === "vat" ? (r ? "Tension !" : "Aucun voyant") : r === "tension" ? "TENSION !" : J.outil === "ohm" ? (r ? "0,2 Ω" : "OL") : megohms(r);
      if (J.outil === "vat") main.vat.userData.maj(r ? 230 : 0);
      sons.bip();
    } else { J.lecture = null; J.bulle = { t: "Première pointe posée. Touche le second point.", type: "mesure" }; }
    majSondes(); majUI();
  }
  function majSondes() {
    if (!sondes.rouge) return;
    camera.updateMatrixWorld(true);
    for (const [q, lat] of [["rouge", 0.3], ["noir", -0.25]]) {
      const s = sondes[q], id = J[q], c = id && W.cibles.find((x) => x.id === id && x.vues.includes(J.vue));
      if (!c) { s.visible = false; continue; }
      const p = c.objet.getWorldPosition(new THREE.Vector3()), versCam = camera.position.clone().sub(p).normalize();
      const dr = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), bas = new THREE.Vector3(0, -1, 0).applyQuaternion(camera.quaternion);
      const axe = versCam.multiplyScalar(0.9).addScaledVector(dr, lat).addScaledVector(bas, 0.22).normalize();
      s.position.copy(p); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axe); s.visible = true;
    }
  }
  function majMain() {
    const k = lisse(Math.min(1, (performance.now() - J.pris) / (REDUIT ? 1 : 380))), bas = (1 - k) * 0.9;
    const d = 0.07, demiH = d * Math.tan((camera.fov / 2) * RAD), demiL = demiH * camera.aspect;
    const pose = (obj, fx, fy, taille, rx, rz) => { obj.position.set(fx * demiL, fy * demiH, -d); obj.scale.setScalar((taille * demiH) / obj.userData.hauteur); obj.rotation.set(rx, 0, rz); };
    main.vat.visible = J.outil === "vat" && !libre(); main.multi.visible = (J.outil === "multi" || J.outil === "iso" || J.outil === "ohm") && !libre();
    if (main.multi.visible) { pose(main.multi, 0.68, -0.72 - bas, 0.5, -0.25, 0.12); main.multi.userData.maj(J.outil === "ohm" ? "Ω" : "V", J.lecture ? J.lecture.replace(" MΩ", "M").replace("plus de ", ">") : null); }
    if (main.vat.visible) pose(main.vat, 0.74, -0.66 - bas, 0.56, -0.2, 0.18);
  }

  /* ---------- interface ---------- */
  const nuit = () => P.e.env.heure >= 18 || P.e.env.heure < 7;
  const questions = () => N.questions.filter((q) => !P.poses.includes(q.id) && (!q.si || q.si(P)));
  function panneauClient() {
    const c = N.client, fil = P.poses.map((id) => { const q = N.questions.find((x) => x.id === id); return `<p class="j-moi">${q.texte}</p><p class="j-r">${q.reponse(P)}</p>`; }).join("");
    return `<div class="j-panneau j-client"><div class="j-client-tete"><span class="j-avatar" style="background:${c.teinte}" aria-hidden="true">${c.initiales}</span><div><b>${c.nom}</b><small>${c.role}</small></div></div>
      <div class="j-fil"><p class="j-r">${N.accroche}</p>${fil}</div>
      <div class="j-choix">${questions().map((q) => `<button type="button" class="j-question" data-question="${q.id}">${q.texte}</button>`).join("") || `<p class="j-petit">Tu n'as plus de question pour l'instant. Ce que tu verras dans la maison en fera peut-être naître d'autres.</p>`}</div>
      <button type="button" class="j-plein" data-action="fermer">${J.debut ? "Au travail" : "Retour au travail"}</button></div>`;
  }
  function panneauCarnet() {
    const R = [["constats", "Ce qui marche"], ["tableau", "Le tableau"], ["mesures", "Mesures"], ["indices", "Indices vus"]];
    const l = P.carnet[J.onglet];
    return `<div class="j-panneau n-carnet"><h2>📒 Carnet de dépannage</h2><p class="j-petit">Il se remplit tout seul, au fil de ce que tu constates.</p>
      <div class="n-onglets">${R.map(([k, t]) => `<button type="button" data-onglet="${k}" class="${J.onglet === k ? "actif" : ""}">${t} <small>${P.carnet[k].length}</small></button>`).join("")}</div>
      ${l.length ? `<ul class="n-liste">${l.map((x) => `<li>${x}</li>`).join("")}</ul>` : `<p class="j-petit">Rien pour l'instant.</p>`}
      <button type="button" class="j-plein" data-action="fermer">Retour au travail</button></div>`;
  }
  function panneauAide() {
    const n = J.cran || 0, I = N.indices(P), T = ["La méthode", "Où regarder", "Quelle mesure"];
    return `<div class="j-panneau"><h2>🆘 Un indice</h2><p class="j-petit">Trois crans : la méthode, la zone, la mesure. Jamais la cause : c'est toi qui la trouves. Chaque cran coûte 2 minutes.</p>
      ${I.slice(0, n).map((t, i) => `<p><b>${T[i]}.</b> ${t}</p>`).join("")}
      ${n < 3 ? `<button type="button" class="j-question" data-action="indice">${T[n]} (+2 min)</button>` : ""}
      <button type="button" class="j-plein" data-action="fermer">Retour au travail</button></div>`;
  }
  function panneauTemps() {
    return `<div class="j-panneau"><h2>⏳ Le temps</h2><p>Il est <b>${heureFr(P.e.env.heure)}</b>${P.e.env.pluie ? ", il pleut" : ", il fait sec"}.</p>
      <button type="button" class="j-question" data-action="attendre">Attendre un quart d'heure</button>
      ${P.soir || !N.soir ? "" : `<button type="button" class="j-question" data-action="soir">Revenir ce soir, quand ça saute</button>`}
      <button type="button" class="j-plein" data-action="fermer">Retour au travail</button></div>`;
  }
  function panneauFin() {
    if (P.fini) {
      const b = P.bilan;
      return `<div class="j-panneau j-fin"><p class="j-etoiles">${"★".repeat(b.etoiles)}${"☆".repeat(3 - b.etoiles)}</p><h2>${b.cause}</h2>
        <p>${b.explication}</p>
        <h3>Ta preuve</h3><p>${b.preuve || "Tu as trouvé, mais aucune mesure du carnet ne le prouve : sur un vrai dépannage, on isole le tronçon et on mesure avant d'affirmer."}</p>
        <h3>Ce que tu as fait</h3><p>${b.remede}</p>
        <h3>La bonne démarche</h3><ol>${b.demarche.map((x) => `<li>${x}</li>`).join("")}</ol>
        ${b.inutile.length ? `<h3>Ce qui n'était pas nécessaire</h3><ul>${b.inutile.map((x) => `<li>${x}</li>`).join("")}</ul><p class="j-petit">Ce n'est pas une faute : sur un vrai dépannage, on cherche aussi.</p>` : ""}
        ${b.fautes.length ? `<div class="j-fautes"><b>Fautes de sécurité</b><ul>${b.fautes.map((x) => `<li>${x}</li>`).join("")}</ul></div>` : `<p class="j-ok">Aucune faute de sécurité.</p>`}
        ${b.conseils.map((c) => `<p class="j-conseil">💡 ${c}</p>`).join("")}
        <p class="j-petit">Temps passé chez ${N.client.court} : ${Math.floor(b.minutes / 60)} h ${String(b.minutes % 60).padStart(2, "0")}. Indices demandés : ${b.indices}.</p>
        <button type="button" class="j-plein" data-action="rejouer">Rejouer (la cause change à chaque partie)</button>
        <a class="j-lien" href="atelier-3d.html">Niveau 1 : la lumière de la chambre</a></div>`;
    }
    if (P.securise && N.etiquettes) return `<div class="j-panneau"><h2>🏷 Refais les étiquettes</h2><p>C'est réparé. Dernier geste : le repérage du tableau était faux. Écris ce que ton carnet a établi (onglet « Le tableau »).</p>
      ${N.etiquettes.map((x) => `<h3>Aujourd'hui : « ${x.ancienne} »</h3><div class="j-choix">${x.choix.map(([k, t]) => `<button type="button" class="j-question${J.etiq[x.dj] === k ? " n-choisi" : ""}" data-etiq="${x.dj}:${k}">${t}</button>`).join("")}</div>`).join("")}
      <button type="button" class="j-plein" data-action="etiqueter"${N.etiquettes.every((x) => J.etiq[x.dj]) ? "" : " disabled"}>Coller les nouvelles étiquettes</button>
      <button type="button" class="j-question" data-panneau="carnet">📒 Relire le carnet</button></div>`;
    if (!P.trouve) return `<div class="j-panneau"><h2>✅ J'ai trouvé</h2><p>D'où vient la panne ?</p>
      <div class="j-choix">${N.diagnostics.map((d) => `<button type="button" class="j-question" data-diagnostic="${d.id}">${d.texte}</button>`).join("")}</div>
      ${P.preuves.length ? `<p class="j-ok">Ton carnet contient une mesure qui prouve une cause.</p>` : `<p class="j-petit">Ton carnet ne contient pas encore de mesure qui prouve une cause. Tu peux répondre quand même.</p>`}
      <button type="button" class="j-plein" data-action="fermer">Je cherche encore</button></div>`;
    return `<div class="j-panneau"><h2>Que fais-tu ?</h2><p>La cause est trouvée. Il faut maintenant que ça ne saute plus, sans mettre personne en danger.</p>
      <div class="j-choix">${N.remedes.map((d) => `<button type="button" class="j-question" data-remede="${d.id}">${d.texte}</button>`).join("")}</div>
      <button type="button" class="j-plein" data-action="fermer">Je réfléchis</button></div>`;
  }
  let minuterie = null;
  function majUI() {
    if (!P) return;
    racine.querySelector(".j-compteurs").innerHTML = `<span title="Heure">${nuit() ? "🌙" : "☀️"} ${heureFr(P.e.env.heure)}</span><span title="Temps">${P.e.env.pluie ? "🌧 pluie" : "sec"}</span>`;
    const o = racine.querySelector(".t-objectif");
    o.innerHTML = J.bulle ? `<span class="t-retour ${J.bulle.type === "client" ? "info" : J.bulle.type}">${J.bulle.t}</span>` : `<b>🎯 ${N.mission}</b>`;
    clearTimeout(minuterie);
    if (J.bulle) { const b = J.bulle; minuterie = setTimeout(() => { if (J.bulle === b) { J.bulle = null; majUI(); } }, Math.min(14000, 3500 + b.t.length * 45)); }
    racine.querySelectorAll("[data-outil]").forEach((b) => { const pris = J.outil === b.dataset.outil; b.classList.toggle("en-main", pris); b.setAttribute("aria-pressed", pris); });
    const lec = racine.querySelector(".j-lecture"), deux = !!(J.rouge && J.noir);
    lec.hidden = !J.outil;
    if (J.outil) { lec.className = `j-lecture${J.outil === "vat" ? " vat" : ""}${J.outil === "vat" && deux && J.lecture === "Tension !" ? " allume" : ""}`; lec.innerHTML = `<small>${J.outil === "multi" ? "Multimètre · V~" : J.outil === "vat" ? "VAT" : J.outil === "ohm" ? "Multimètre · Ω" : "Mesureur d'isolement"}</small><b>${deux && J.lecture ? J.lecture : "– – –"}</b>`; }
    const parent = W.vues[J.vue].parent, rec = racine.querySelector("[data-action=reculer]");
    rec.disabled = !parent; rec.textContent = parent ? `↩ ${W.vues[parent].court}` : `📍 ${W.vues[J.vue].court}`;
    racine.querySelector(".j-lieux").innerHTML = [...J.lieux].filter((v) => v !== J.vue && v !== parent).map((v) => `<button type="button" data-lieu="${v}">${W.vues[v].lieuRaccourci || W.vues[v].court}</button>`).join("");
    const voile = racine.querySelector(".j-voile"), pan = { client: panneauClient, carnet: panneauCarnet, aide: panneauAide, temps: panneauTemps, fin: panneauFin }[J.panneau];
    voile.hidden = !pan; if (pan) voile.innerHTML = pan();
    racine.querySelector("[data-panneau=carnet] small").textContent = Object.values(P.carnet).reduce((s, l) => s + l.length, 0) || "";
  }
  // halos : les points mesurables quand un appareil est en main, et seulement eux
  let pool = [];
  function anneaux() {
    const couche = racine.querySelector(".j-anneaux"), liste = [];
    if (mesureEnMain() && !transition) {
      const pts = W.cibles.filter((c) => c.type === "point" && actif(c)).map((c) => ({ c, s: rayonEcran(c) })).filter((x) => x.s.devant);
      for (const x of pts) { let rr = x.s.r; for (const y of pts) if (y !== x) rr = Math.min(rr, Math.hypot(y.s.x - x.s.x, y.s.y - x.s.y) / 2 - 2); liste.push({ x: x.s.x, y: x.s.y, w: Math.max(12, rr) * 2, id: x.c.id }); }
    }
    while (pool.length < liste.length) { const d = document.createElement("div"); d.className = "j-anneau rond"; couche.appendChild(d); pool.push(d); }
    pool.forEach((d, i) => { const a = liste[i]; d.hidden = !a; if (a) d.style.cssText = `left:${a.x - a.w / 2}px;top:${a.y - a.w / 2}px;width:${a.w}px;height:${a.w}px`; });
    window.__anneaux = liste;
  }

  /* ---------- boucle de rendu ---------- */
  let dernier = performance.now();
  function image(now) {
    const dt = Math.min(0.1, (now - dernier) / 1000); dernier = now;
    if (transition) {
      const t = Math.min(1, (now - transition.t0) / transition.d), k = lisse(t), tr = transition;
      camera.position.lerpVectors(tr.de.pos, tr.a.pos, k); regard.yaw = tr.de.yaw + (tr.a.yaw - tr.de.yaw) * k; regard.pitch = tr.de.pitch + (tr.a.pitch - tr.de.pitch) * k;
      camera.fov = tr.de.fov + (tr.a.fov - tr.de.fov) * k; camera.updateProjectionMatrix();
      if (t >= 1) { transition = null; majSondes(); tr.res(); }
    }
    camera.rotation.set(regard.pitch, regard.yaw, 0, "YXZ"); camera.updateMatrixWorld(true);
    W.animer(dt); majMain();
    if (attente && !occupe && !transition) { const a = attente; attente = null; toucherEcran(a.x, a.y); }
    renderer.render(W.scene, camera); anneaux();
  }
  function boucle(now) { requestAnimationFrame(boucle); image(now); }

  /* ---------- entrées ---------- */
  async function toucherEcran(x, y) {
    if (occupe || transition || J.panneau) { attente = { x, y }; return; }
    const id = cibleSous(x, y); if (!id) return;
    J.bulle = null; occupe = true;
    try { await agir(id); } finally { occupe = false; majUI(); }
  }
  function brancher(canvas) {
    canvas.addEventListener("pointerdown", (ev) => { if (J.panneau) return; appui = { x: ev.clientX, y: ev.clientY, yaw: regard.yaw, pitch: regard.pitch, bouge: false }; try { canvas.setPointerCapture(ev.pointerId); } catch { /* rien */ } });
    canvas.addEventListener("pointermove", (ev) => {
      if (!appui) return; const r = canvas.getBoundingClientRect(), dx = ev.clientX - appui.x, dy = ev.clientY - appui.y;
      if (Math.hypot(dx, dy) > 8) appui.bouge = true; if (!appui.bouge || transition || occupe) return;
      const k = camera.fov / fovLibre; let yaw = appui.yaw + (dx / r.width) * Math.PI * k, pitch = appui.pitch + (dy / r.height) * (Math.PI / 2) * k;
      if (regard.base) { yaw = regard.base.yaw + Math.max(-0.07, Math.min(0.07, yaw - regard.base.yaw)); pitch = regard.base.pitch + Math.max(-0.06, Math.min(0.06, pitch - regard.base.pitch)); } else pitch = Math.max(-1.1, Math.min(1.2, pitch));
      regard.yaw = yaw; regard.pitch = pitch;
    });
    canvas.addEventListener("pointerup", (ev) => {
      if (!appui) return; const a = appui; appui = null; const dx = ev.clientX - a.x, dy = ev.clientY - a.y;
      if (a.bouge) { if (!libre() && dy > 70 && Math.abs(dx) < dy * 0.8) { regard.yaw = a.yaw; regard.pitch = a.pitch; reculer(); } return; }
      const r = canvas.getBoundingClientRect(); toucherEcran(ev.clientX - r.left, ev.clientY - r.top);
    });
    canvas.addEventListener("pointercancel", () => { appui = null; });
    racine.addEventListener("click", (ev) => {
      const t = ev.target.closest("[data-action],[data-panneau],[data-question],[data-outil],[data-lieu],[data-onglet],[data-diagnostic],[data-remede],[data-etiq]"); if (!t || !P) return;
      const d = t.dataset;
      if (d.action === "fermer") { if (J.debut) { J.debut = false; J.bulle = { t: N.debut || "À toi de chercher. Le carnet note tout ce que tu constates.", type: "info" }; } J.panneau = null; }
      else if (d.action === "reculer") return reculer();
      else if (d.etiq) { const [dj, k] = d.etiq.split(":"); J.etiq[dj] = k; }
      else if (d.action === "etiqueter") { const ok = jouer({ type: "etiqueter", choix: J.etiq }); if (ok) sons.succes(); else J.panneau = null; }
      else if (d.action === "rejouer") return rejouer();
      else if (d.action === "indice") { J.cran = Math.min(3, (J.cran || 0) + 1); P.action({ type: "indice", cran: J.cran }); }
      else if (d.action === "attendre") { J.panneau = null; jouer({ type: "attendre", minutes: 15 }); return; }
      else if (d.action === "soir") { J.panneau = null; fondu(true).then(() => { jouer({ type: "revenir_ce_soir" }); return allerA(N.depart); }).then(() => fondu(false)); return; }
      else if (d.lieu) return void allerA(d.lieu);
      else if (d.onglet) J.onglet = d.onglet;
      else if (d.panneau) J.panneau = J.panneau === d.panneau ? null : d.panneau;
      else if (d.question) { jouer({ type: "question", id: d.question }); J.bulle = null; }
      else if (d.outil) return prendre(d.outil);
      else if (d.diagnostic) { const ok = jouer({ type: "diagnostic", id: d.diagnostic }); if (!ok) J.panneau = null; }
      else if (d.remede) { const ok = jouer({ type: "securiser", id: d.remede }); if (ok) sons.succes(); else J.panneau = null; }
      majUI();
    });
  }
  const ICONES = {
    vat: `<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="17" y="2" width="14" height="30" rx="4" fill="#e9b400" stroke="#1d2228" stroke-width="2"/><rect x="20" y="5" width="8" height="3" rx="1" fill="#ff3b2f"/><rect x="20" y="10" width="8" height="3" rx="1" fill="#6b7480"/><rect x="20" y="15" width="8" height="3" rx="1" fill="#6b7480"/><path d="M24 32v6" stroke="#9aa3ad" stroke-width="2.5" stroke-linecap="round"/><path d="M17 26C8 26 8 12 8 6" fill="none" stroke="#1d2228" stroke-width="2"/><rect x="5" y="2" width="6" height="12" rx="2" fill="#2f6fb8" stroke="#1d2228" stroke-width="1.5"/></svg>`,
    ohm: `<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="14" y="1" width="20" height="34" rx="4" fill="#f2c230" stroke="#1d2228" stroke-width="2"/><rect x="17" y="4" width="14" height="9" rx="1.5" fill="#c8d4b4" stroke="#1d2228" stroke-width="1.2"/><circle cx="24" cy="23" r="7" fill="#2b2f34"/><text x="24" y="26.5" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">Ω</text></svg>`,
    multi: `<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="14" y="1" width="20" height="34" rx="4" fill="#f2c230" stroke="#1d2228" stroke-width="2"/><rect x="17" y="4" width="14" height="9" rx="1.5" fill="#c8d4b4" stroke="#1d2228" stroke-width="1.2"/><circle cx="24" cy="23" r="6" fill="#2b2f34"/><path d="M24 23l3-4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M7 27V14" stroke="#c8261e" stroke-width="3.5" stroke-linecap="round"/><path d="M41 27V14" stroke="#1b1b1b" stroke-width="3.5" stroke-linecap="round"/></svg>`,
    iso: `<svg viewBox="0 0 48 40" aria-hidden="true"><rect x="9" y="3" width="30" height="30" rx="5" fill="#d9480f" stroke="#1d2228" stroke-width="2"/><rect x="13" y="7" width="22" height="10" rx="1.5" fill="#c8d4b4" stroke="#1d2228" stroke-width="1.2"/><text x="24" y="15.5" font-size="8" font-weight="700" text-anchor="middle" fill="#1d2620">MΩ</text><circle cx="24" cy="25" r="5" fill="#2b2f34"/><text x="24" y="27.5" font-size="6" font-weight="700" text-anchor="middle" fill="#fff">TEST</text></svg>`,
  };
  function gabarit() {
    racine.innerHTML = `
    <div class="j-haut"><div class="j-titre"><b>${N.titre}</b><span>Niveau ${N.numero} · ${N.client.court}</span></div><div class="j-compteurs"></div>
      <a class="j-quitter" href="atelier-depannage.html" aria-label="Quitter et revenir à l'atelier">✕</a></div>
    <div class="t-objectif" role="status"></div>
    <div class="j-scene"><div class="j-anneaux" aria-hidden="true"></div><div class="j-flash"></div><div class="n-fondu"></div><output class="j-lecture" hidden aria-live="polite" aria-label="Valeur mesurée"></output><div class="j-voile" hidden></div></div>
    <div class="j-barre">
      <div class="j-caisse" role="group" aria-label="Caisse à outils" style="grid-template-columns:repeat(${N.outils.length},1fr)">${N.outils.map((o) => `<button type="button" data-outil="${o}" aria-pressed="false">${ICONES[o]}<b>${OUTILS[o][0]}</b></button>`).join("")}</div>
      <div class="j-deplacer"><button type="button" class="j-reculer" data-action="reculer">↩</button><div class="j-lieux" aria-label="Aller directement à"></div></div>
      <div class="j-boutons n-boutons">
        <button type="button" data-panneau="client">💬 ${N.client.court}</button>
        <button type="button" data-panneau="carnet">📒 Carnet <small></small></button>
        <button type="button" data-panneau="aide">🆘 Indice</button>
        <button type="button" data-panneau="temps">⏳ Temps</button>
        <button type="button" data-panneau="fin" class="n-trouve">✅ J'ai trouvé</button>
      </div>
    </div>`;
  }
  function rejouer() {
    nouvellePartie(); reconstruire(); J.cran = 0;
    const o = cadrage(J.vue); camera.position.copy(o.pos); regard.yaw = o.yaw; regard.pitch = o.pitch; regard.base = null; camera.fov = fovLibre; camera.updateProjectionMatrix();
    W.maj(lieuDe(J.vue)); majUI();
  }
  // le monde dépend de la cause (traces visibles) : on le reconstruit à chaque partie
  let frontale = null;
  function reconstruire() {
    if (frontale) { camera.remove(frontale); camera.remove(frontale.target); }
    W = creerMonde(renderer, BASE, N, P); W.scene.add(camera);
    frontale = W.frontale; camera.add(frontale); frontale.position.set(0.04, 0.05, 0.02); camera.add(frontale.target); frontale.target.position.set(0, 0, -1);
    for (const s of Object.values(sondes)) W.scene.add(s);
  }
  async function demarrer() {
    nouvellePartie(); gabarit();
    const scene = racine.querySelector(".j-scene");
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    scene.prepend(renderer.domElement);
    camera = new THREE.PerspectiveCamera(60, 1, 0.01, 60); camera.rotation.order = "YXZ";
    reconstruire();
    main.multi = creerMultimetre(); main.vat = creerVAT(); for (const o of [main.multi, main.vat]) { o.visible = false; camera.add(o); }
    camera.add(new THREE.PointLight(0xfff1dc, 0.06, 0.11, 2));
    sondes.rouge = creerSonde(0xc8261e); sondes.noir = creerSonde(0x1b1b1b); for (const s of Object.values(sondes)) { s.visible = false; W.scene.add(s); }
    const taille = () => { const r = scene.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / Math.max(1, r.height); fovLibre = camera.aspect < 0.8 ? 72 : 58; camera.fov = libre() ? fovLibre : FOV_PROCHE; camera.updateProjectionMatrix(); };
    taille(); addEventListener("resize", () => { taille(); if (!transition && !libre()) { const c = cadrage(J.vue); camera.position.copy(c.pos); regard.yaw = c.yaw; regard.pitch = c.pitch; } });
    const o = cadrage(J.vue); camera.position.copy(o.pos); regard.yaw = o.yaw; regard.pitch = o.pitch;
    W.maj(lieuDe(J.vue)); brancher(renderer.domElement); majUI();
    requestAnimationFrame(boucle);
    // pour les contrôles automatiques
    window.__niveau = {
      P: () => P, J: () => J, W: () => W, cam: () => camera, image: () => image(performance.now()), occupe: () => occupe || !!transition || !!attente,
      aller: (v) => allerA(v), prendre, toucherEcran, vues: () => Object.keys(W.vues),
      cibles: () => W.cibles.filter(actif).map((c) => ({ id: c.id, type: c.type, ...centreEcran(c), r: c.type === "point" ? rayonEcran(c).r : undefined })),
      ou: (id) => { const l = W.cibles.filter((x) => x.id === id).flatMap((x) => x.vues); return l.length ? l : null; },
      lecture: () => { const l = racine.querySelector(".j-lecture"); return l.hidden ? null : { texte: l.textContent, ...(({ left, top, right, bottom }) => ({ x0: left, y0: top, x1: right, y1: bottom }))(l.getBoundingClientRect()), scene: renderer.domElement.getBoundingClientRect().toJSON() }; },
    };
  }
  const webgl2 = () => { try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; } };
  racine.innerHTML = `<div class="j-accueil"><p class="j-sur">Atelier dépannage · niveau ${N.numero}</p><h1>${N.titre}</h1><p>${N.pitch}</p>
    <ul><li>🔎 <b>Cherche</b> : ici, personne ne te dit quoi faire. La cause change à chaque partie.</li><li>📒 Le <b>carnet</b> note tout seul ce que tu constates.</li><li>👉 <b>Glisse</b> pour tourner la tête, <b>touche</b> pour agir ou t'approcher.</li></ul>
    ${webgl2() ? `<button type="button" class="j-plein" id="entrer">${N.entrer}</button>` : `<p class="j-alerte">Ton navigateur n'affiche pas la 3D (WebGL 2 absent).</p>`}
    <a class="j-lien" href="atelier-3d.html">Niveau 1 : la lumière de la chambre</a></div>`;
  document.getElementById("entrer")?.addEventListener("click", () => {
    racine.innerHTML = `<div class="j-accueil"><p>Chargement…</p></div>`; document.body.classList.add("j-plein-ecran");
    demarrer().catch((err) => { console.error(err); racine.innerHTML = `<div class="j-accueil"><p class="j-alerte">La 3D n'a pas pu démarrer (${err.message}).</p></div>`; });
  });
}
