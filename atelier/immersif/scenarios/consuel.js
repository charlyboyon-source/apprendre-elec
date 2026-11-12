// Intervention « Le contrôle avant le Consuel » : une maison neuve à vérifier avant la visite de l'inspecteur.
// Mécanique d'inspection : regarder, mesurer au mètre, tester au contrôleur d'installation, noter les défauts.
import { vueTableau, texte, cadreCliquable } from "../commun.js";

/* ---------- Points de contrôle ---------- */
// nc : peut être non conforme (tiré au hasard). outil : l'outil qui révèle le défaut.
const POINTS = [
  { id: "prise-sdb", vue: "sdb", nom: "Prise de la salle de bain", outil: "metre", nc: true,
    ok: "Bord de la prise à 72 cm du bord du receveur de douche : hors volume.", ko: "Bord de la prise à 41 cm du bord du receveur de douche : elle est dans le volume 2.",
    regle: "Une prise 2P+T 230 V est interdite dans les volumes 0, 1 et 2. Le volume 2 s'étend sur 60 cm autour de la douche : la prise doit être au-delà, hors volume, et protégée par un différentiel 30 mA." },
  { id: "spot", vue: "sdb", nom: "Spot au-dessus de la douche", outil: "main", nc: true,
    ok: "Spot encastré au-dessus de la douche, marqué « IPX4 » et classe II.", ko: "Spot encastré au-dessus de la douche, marqué « IP20 ».",
    regle: "Au-dessus de la douche, on est dans le volume 1 : le matériel doit être au moins IPX4 (protégé contre les projections d'eau)." },
  { id: "seche", vue: "sdb", nom: "Sèche-serviettes", outil: "main", nc: false,
    ok: "Sèche-serviettes de classe II, posé hors volume, alimenté par une sortie de câble." },
  { id: "evier", vue: "cuisine", nom: "Au-dessus de l'évier", outil: "main", nc: true,
    ok: "Rien au-dessus de l'évier : les prises du plan de travail sont de part et d'autre.", ko: "Une prise de courant est posée juste au-dessus de l'évier.",
    regle: "Aucune prise au-dessus de l'évier ni au-dessus de la plaque de cuisson. Seule la prise de la hotte est tolérée au-dessus de la plaque, à 1,80 m au moins du sol." },
  { id: "prise32", vue: "cuisine", nom: "Prise 32 A de la plaque", outil: "metre", nc: true,
    ok: "Axe de la prise 32 A de la plaque de cuisson à 15 cm du sol fini.", ko: "Axe de la prise 32 A de la plaque de cuisson à 6 cm du sol fini.",
    regle: "Une prise 32 A se place à 12 cm au moins du sol fini (5 cm pour une prise 16 A ou 20 A)." },
  { id: "hotte", vue: "cuisine", nom: "Prise de la hotte", outil: "metre", nc: true,
    ok: "Prise de la hotte à 1,95 m du sol, au-dessus de la plaque.", ko: "Prise de la hotte à 1,55 m du sol, au-dessus de la plaque.",
    regle: "Au-dessus de la plaque de cuisson, seule la prise de la hotte est admise, et à 1,80 m au moins du sol." },
  { id: "plan4", vue: "cuisine", nom: "Prises du plan de travail", outil: "main", nc: false,
    ok: "Quatre prises au-dessus du plan de travail, sur le circuit dédié de la cuisine." },
  { id: "prise-basse", vue: "chambre", nom: "Prise près de la porte", outil: "metre", nc: true,
    ok: "Axe de la prise à 25 cm du sol fini.", ko: "Axe de la prise à 3 cm du sol fini.",
    regle: "L'axe d'une prise 16 A doit être à 5 cm au moins du sol fini, pour éviter l'eau du lavage des sols et les chocs." },
  { id: "pe-chambre", vue: "chambre", nom: "Prise près du lit (terre)", outil: "controleur", nc: true,
    ok: "Continuité du conducteur de protection jusqu'à la prise : 0,3 Ω.", ko: "Continuité du conducteur de protection jusqu'à la prise : 3,8 Ω.",
    regle: "Chaque prise doit être franchement reliée à la terre : on attend une continuité inférieure à 2 Ω. Au-delà, une connexion de terre est mauvaise (borne desserrée, raccord oublié) et doit être reprise." },
  { id: "inter-chambre", vue: "chambre", nom: "Interrupteur de la chambre", outil: "metre", nc: false,
    ok: "Interrupteur à 1,10 m du sol, à l'entrée, côté poignée de la porte." },
  { id: "terre", vue: "garage", nom: "Prise de terre", outil: "controleur", nc: true,
    ok: "Résistance de la prise de terre : 38 Ω.", ko: "Résistance de la prise de terre : 160 Ω.",
    regle: "Avec des différentiels 30 mA, la résistance de la prise de terre d'un logement doit rester à 100 Ω au plus. Au-delà, on améliore la prise de terre (piquet supplémentaire, meilleure liaison)." },
  { id: "test-id1", vue: "garage", nom: "Différentiel 1", outil: "controleur", nc: true,
    ok: "Test du différentiel 1 : il déclenche en 22 ms.", ko: "Test du différentiel 1 : il ne déclenche pas.",
    regle: "Chaque interrupteur différentiel 30 mA doit déclencher au test. Un appareil qui ne déclenche pas ne protège plus personne : il est à remplacer." },
  { id: "dj-eclairage", vue: "garage", nom: "Disjoncteur de l'éclairage", outil: "main", nc: true,
    ok: "Circuit éclairage : disjoncteur 16 A, fils de 1,5 mm².", ko: "Circuit éclairage : disjoncteur 20 A sur des fils de 1,5 mm².",
    regle: "En 1,5 mm², le disjoncteur ne doit pas dépasser 16 A. Un 20 A laisserait les fils chauffer sans couper." },
  { id: "plaque-id", vue: "garage", nom: "Protection de la plaque", outil: "main", nc: true,
    ok: "La plaque de cuisson est derrière le différentiel de type A.", ko: "La plaque de cuisson est derrière le différentiel de type AC.",
    regle: "La plaque de cuisson et le lave-linge doivent être derrière un interrupteur différentiel de type A." },
  { id: "cond-terre", vue: "garage", nom: "Conducteur de terre", outil: "main", nc: false,
    ok: "Conducteur de terre en cuivre nu de 25 mm², borne principale de terre avec sa barrette de mesure." },
];
const NB_DEFAUTS = 5;
const ko = (e, id) => e.defauts.includes(id);

/* ---------- Vues ---------- */
const cible = (x, y, w, h, id, label) => `<g class="zone cible" data-cible="${id}" role="button" tabindex="0" aria-label="${label}">
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#fff" fill-opacity="0" stroke="#f2c230" stroke-width="2.5" stroke-dasharray="7 6" class="zone-cadre"/></g>`;
const note = (e, id, x, y) => (e.notes.includes(id) ? `<g pointer-events="none"><circle cx="${x}" cy="${y}" r="17" fill="#d23a2e"/>${texte(x, y + 6, "!", 20, 900, "#fff")}</g>` : "");
function prise(x, y, k = 1, terre = true) {
  return `<g filter="url(#f-ombre-p)"><rect x="${x - 26 * k}" y="${y - 26 * k}" width="${52 * k}" height="${52 * k}" rx="${8 * k}" fill="url(#g-blanc)" stroke="#c8c1b4"/>
    <circle cx="${x}" cy="${y}" r="${18 * k}" fill="#f1efea" stroke="#c4bdb0"/></g>
    <circle cx="${x - 7 * k}" cy="${y + 2 * k}" r="${2.8 * k}" fill="#333"/><circle cx="${x + 7 * k}" cy="${y + 2 * k}" r="${2.8 * k}" fill="#333"/>${terre ? `<rect x="${x - 2 * k}" y="${y - 13 * k}" width="${4 * k}" height="${7 * k}" fill="#999"/>` : ""}`;
}
function vuePlan(e) {
  const piece = (x, y, w, h, coul, nom, vue) => `<g class="zone" data-aller="${vue}" role="button" tabindex="0" aria-label="${nom}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${coul}" stroke="#2b2f34" stroke-width="10"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" fill-opacity="0" class="zone-cadre" stroke="#f2c230" stroke-width="4" stroke-dasharray="12 9"/>
    ${texte(x + w / 2, y + h / 2, nom, 26, 800, "#2b2f34")}
    ${texte(x + w / 2, y + h / 2 + 30, `${e.notes.filter((n) => POINTS.find((p) => p.id === n).vue === vue).length} défaut(s) noté(s)`, 15, 600, "#555")}</g>`;
  return `<rect width="1200" height="750" fill="#f3f0e8"/><rect width="1200" height="750" fill="url(#p-crepi)"/>
    ${texte(600, 50, "Maison de M. et Mme Petit · plan du rez-de-chaussée", 22, 800)}
    ${piece(140, 90, 360, 280, "#dfeaf2", "Salle de bain", "sdb")}
    ${piece(500, 90, 560, 280, "#f2e6d4", "Cuisine", "cuisine")}
    ${piece(140, 370, 520, 320, "#e9e2f0", "Chambre", "chambre")}
    ${piece(660, 370, 400, 320, "#e3e5e7", "Garage (tableau)", "garage")}
    <path d="M300 690 h80" stroke="#f3f0e8" stroke-width="12"/><path d="M860 690 h120" stroke="#f3f0e8" stroke-width="12"/>
    ${texte(600, 728, "Entrée", 16, 700, "#555")}`;
}
function vueSdb(e) {
  const xp = ko(e, "prise-sdb") ? 520 : 650;
  let s = `<rect width="1200" height="750" fill="#e9eef0"/>
    ${Array.from({ length: 15 }, (_, i) => `<path d="M${i * 80} 0 V620" stroke="#d3dbe0"/>`).join("")}${Array.from({ length: 8 }, (_, j) => `<path d="M0 ${j * 80} H1200" stroke="#d3dbe0"/>`).join("")}
    <rect y="620" width="1200" height="130" fill="#b9b2a6"/>
    <rect x="60" y="590" width="340" height="40" rx="4" fill="#fbfbfa" stroke="#bfc4c8"/>
    <rect x="390" y="120" width="14" height="480" fill="#a9c7d6" opacity=".7"/><rect x="60" y="120" width="340" height="480" fill="#bcd8e6" opacity=".25"/>
    <path d="M110 140 V230 Q110 250 140 250 H180" stroke="#9aa1a8" stroke-width="8" fill="none"/><ellipse cx="200" cy="262" rx="34" ry="12" fill="#9aa1a8"/>
    ${texte(230, 670, "receveur de douche", 15, 700, "#555")}
    <rect x="560" y="360" width="250" height="40" rx="18" fill="#fbfbfa" stroke="#bfc4c8"/><rect x="580" y="400" width="210" height="190" rx="6" fill="#8d6e52"/>
    <rect x="575" y="140" width="220" height="180" rx="8" fill="#cfe0ea" stroke="#9aa1a8" stroke-width="4"/>
    <rect x="930" y="250" width="150" height="300" rx="10" fill="#f6f6f4" stroke="#c4c8cc"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="944" y="${266 + i * 34}" width="122" height="14" rx="6" fill="#e3e6e8"/>`).join("")}
    <circle cx="230" cy="40" r="26" fill="#f6f6f4" stroke="#bfc4c8" stroke-width="3"/><circle cx="230" cy="40" r="14" fill="#fff6c9"/>
    ${texte(230, 92, ko(e, "spot") ? "IP20" : "IPX4", 12, 700, "#7d858e")}
    ${prise(xp, 300)}`;
  s += cible(186, 6, 88, 96, "spot", "Spot au-dessus de la douche") + note(e, "spot", 280, 20);
  s += cible(xp - 40, 262, 80, 80, "prise-sdb", "Prise de la salle de bain") + note(e, "prise-sdb", xp + 40, 262);
  s += cible(920, 240, 170, 320, "seche", "Sèche-serviettes") + note(e, "seche", 1090, 240);
  s += cadreCliquable(24, 666, 140, 56, `data-aller="plan"`, "Plan");
  return s;
}
function vueCuisine(e) {
  let s = `<rect width="1200" height="750" fill="#f1ebe0"/><rect width="1200" height="750" fill="url(#p-crepi)"/>
    <rect y="660" width="1200" height="90" fill="#bfa384"/>
    <rect x="80" y="440" width="1040" height="34" fill="#7c5b3e"/><rect x="80" y="474" width="1040" height="186" fill="#efe9de" stroke="#cdbfa8"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${92 + i * 206}" y="486" width="196" height="162" rx="4" fill="#f7f2e9" stroke="#d6cab5"/>`).join("")}
    <rect x="300" y="440" width="170" height="16" rx="4" fill="#c9cdd1"/><path d="M385 440 V380 Q385 360 405 360 H420" stroke="#9aa1a8" stroke-width="8" fill="none"/>
    ${texte(385, 430, "évier", 13, 700, "#555")}
    <rect x="640" y="434" width="190" height="10" rx="3" fill="#1d1f22"/>${[680, 790].map((x) => `<circle cx="${x}" cy="439" r="16" fill="none" stroke="#3a3d42" stroke-width="2"/>`).join("")}
    ${texte(735, 428, "plaque", 13, 700, "#555")}
    <polygon points="660,120 810,120 830,220 640,220" fill="#c9cdd1" stroke="#9aa1a8"/><rect x="710" y="40" width="50" height="80" fill="#b9bec3"/>${texte(735, 210, "hotte", 13, 700, "#444")}`;
  // prises du plan de travail (4)
  for (const x of [170, 540, 930, 1050]) s += prise(x, 400, 0.9);
  if (ko(e, "evier")) s += prise(385, 320, 0.9);
  const yHotte = ko(e, "hotte") ? 300 : 170;
  s += prise(860, yHotte, 0.8);
  const y32 = ko(e, "prise32") ? 640 : 608;
  s += `<rect x="700" y="${y32 - 22}" width="56" height="44" rx="6" fill="#fbfbfa" stroke="#bdb5a7"/>${texte(728, y32 + 6, "32 A", 12, 800, "#555")}`;
  s += cible(300, 290, 170, 140, "evier", "Au-dessus de l'évier") + note(e, "evier", 470, 290);
  s += cible(820, yHotte - 36, 80, 72, "hotte", "Prise de la hotte") + note(e, "hotte", 900, yHotte - 36);
  s += cible(690, y32 - 34, 76, 68, "prise32", "Prise 32 A de la plaque") + note(e, "prise32", 766, y32 - 34);
  s += cible(130, 360, 960, 70, "plan4", "Prises du plan de travail") + note(e, "plan4", 1090, 360);
  s += cadreCliquable(24, 666, 140, 56, `data-aller="plan"`, "Plan");
  return s;
}
function vueChambre(e) {
  const yb = ko(e, "prise-basse") ? 676 : 618;
  let s = `<rect width="1200" height="750" fill="#ece5f2"/><rect width="1200" height="750" fill="url(#p-crepi)"/>
    <rect y="680" width="1200" height="70" fill="#b38a5f"/><rect y="672" width="1200" height="10" fill="#f6f2ea"/>
    <rect x="70" y="200" width="190" height="472" fill="url(#g-bois)"/><circle cx="240" cy="450" r="8" fill="#e2cf9c"/>
    <rect x="560" y="420" width="420" height="70" rx="10" fill="#6b4a32"/><rect x="540" y="480" width="460" height="130" rx="12" fill="#e9e4da"/><rect x="540" y="540" width="460" height="132" fill="#7186a3"/>
    <rect x="1020" y="520" width="90" height="152" fill="#8f6744"/>
    ${prise(330, yb, 0.9)}${prise(1060, 470, 0.9)}
    <g filter="url(#f-ombre-p)"><rect x="296" y="420" width="44" height="44" rx="6" fill="url(#g-blanc)" stroke="#c8c1b4"/></g>`;
  s += cible(290, yb - 36, 80, 72, "prise-basse", "Prise près de la porte") + note(e, "prise-basse", 370, yb - 36);
  s += cible(1020, 430, 80, 80, "pe-chambre", "Prise près du lit") + note(e, "pe-chambre", 1100, 430);
  s += cible(286, 410, 64, 64, "inter-chambre", "Interrupteur de la chambre") + note(e, "inter-chambre", 350, 410);
  s += cadreCliquable(24, 30, 140, 56, `data-aller="plan"`, "Plan");
  return s;
}
function rangees(e) {
  const plaqueKo = ko(e, "plaque-id");
  const plaque = { cle: "d9", type: "dj", cal: "C32", etiquette: "Plaque 6 mm²" };
  const r1 = [
    { cle: "diff", type: "id", haut: "40 A", ligne2: "IΔn 30 mA", typ: "AC", etiquette: "Différentiel 1" },
    { cle: "dj", type: "dj", cal: ko(e, "dj-eclairage") ? "C20" : "C16", etiquette: "Éclairage 1,5 mm²" },
    { cle: "d2", type: "dj", cal: "C20", etiquette: "Prises 2,5 mm²" },
    plaqueKo ? plaque : { cle: "d3", type: "dj", cal: "C16", etiquette: "Éclairage 1,5 mm²" },
    { cle: "d4", type: "dj", cal: "C20", etiquette: "Chambres 2,5 mm²" },
  ];
  const r2 = [
    { cle: "diff2", type: "id", haut: "40 A", ligne2: "IΔn 30 mA", typ: "A", etiquette: "Différentiel 2" },
    plaqueKo ? { cle: "d5", type: "dj", cal: "C20", etiquette: "Cuisine 2,5 mm²" } : plaque,
    { cle: "d6", type: "dj", cal: "C20", etiquette: "Lave-linge 2,5 mm²" },
    { cle: "d7", type: "dj", cal: "C20", etiquette: "Four 2,5 mm²" },
    { cle: "d8", type: "dj", cal: "C20", etiquette: "Lave-vaiss. 2,5 mm²" },
  ];
  return [r1, r2];
}
function vueGarage(e) {
  const plaqueKo = ko(e, "plaque-id");
  let s = vueTableau(e, { rangees: rangees(e), relies: [], retour: "plan" });
  s += cible(214, 96, 164, 250, "test-id1", "Différentiel 1") + note(e, "test-id1", 378, 96);
  s += cible(382, 46, 82, 300, "dj-eclairage", "Disjoncteur de l'éclairage") + note(e, "dj-eclairage", 464, 46);
  const xp = 554, yp = plaqueKo ? 46 : 388;
  s += cible(xp, yp, 82, 300, "plaque-id", "Protection de la plaque") + note(e, "plaque-id", xp + 82, yp);
  s += cible(896, 556, 118, 52, "terre", "Prise de terre (barrette de mesure)") + note(e, "terre", 1014, 556);
  s += cible(896, 610, 140, 120, "cond-terre", "Conducteur de terre") + note(e, "cond-terre", 1036, 610);
  return s;
}

/* ---------- Intervention ---------- */
export default {
  id: "consuel",
  titre: "Le contrôle avant le Consuel",
  lieu: "Maison neuve de M. et Mme Petit · la veille de la visite",
  intro: `<h2>Demain, le Consuel passe</h2>
    <p>Ton patron t'envoie faire le tour de la maison neuve de M. et Mme Petit avant la visite de l'inspecteur du Consuel. Il a un doute : « il y a sûrement des choses pas aux normes ».</p>
    <p><b>Ta mission :</b> trouver les défauts et les noter. Ne note que ce qui est vraiment non conforme : l'inspecteur jugera ton rapport.</p>
    <ul><li><b>✋ Main</b> : regarder un élément de près.</li><li><b>📏 Mètre</b> : mesurer une hauteur ou une distance.</li>
    <li><b>🧰 Contrôleur</b> : mesurer la terre, la continuité de la terre d'une prise, tester un différentiel.</li><li><b>✏️ Noter</b> : marquer un élément comme non conforme (ou l'effacer).</li></ul>
    <p class="im-petit">Il y a plusieurs défauts, à des endroits différents à chaque partie.</p>`,
  vueDepart: "plan",
  sansMultimetre: true,
  sansTournevis: true,
  outils: [{ id: "metre", label: "📏 Mètre" }, { id: "controleur", label: "🧰 Contrôleur" }, { id: "noter", label: "✏️ Noter" }],
  astuce: "Choisis un outil, puis touche un élément encadré. Les éléments notés portent un point rouge. Tes constats s'inscrivent dans le carnet.",
  pannes: [{ id: "controle", titre: "Contrôle avant la visite du Consuel", explication: "" }],
  liaisons: [], noeuds: {}, noms: {},
  etat() {
    const possibles = POINTS.filter((p) => p.nc).map((p) => p.id).sort(() => Math.random() - 0.5);
    return { defauts: possibles.slice(0, NB_DEFAUTS), notes: [], vus: {}, inspecte: false, repare: true };
  },
  compteurs: (a) => `<span>📋 ${a.e.notes.length} défaut${a.e.notes.length > 1 ? "s" : ""} noté${a.e.notes.length > 1 ? "s" : ""}</span>`,
  panneaux: {
    rapport: { label: "📋 Rapport", rendu(a) {
      const e = a.e;
      return `<h2>Ton rapport avant la visite</h2>
        ${e.notes.length ? `<ul>${e.notes.map((id) => { const p = POINTS.find((x) => x.id === id); return `<li><b>${p.nom}</b>${e.vus[id] ? ` — ${e.vus[id]}` : ""}</li>`; }).join("")}</ul>` : "<p>Aucun défaut noté pour l'instant.</p>"}
        <p class="im-petit">Quand tu as fait le tour, fais venir l'inspecteur. Il contrôle tout derrière toi.</p>
        <button type="button" class="im-plein" data-s="inspecteur">Faire venir l'inspecteur du Consuel</button>`;
    } },
  },
  vues: { plan: vuePlan, sdb: vueSdb, cuisine: vueCuisine, chambre: vueChambre, garage: vueGarage },
  gestes: { manette(a) { a.sons.disjoncteur(); a.dire("Pas besoin de couper pour ce contrôle : on regarde, on mesure et on teste."); } },
  utiliser(a, outil, id) {
    const e = a.e, p = POINTS.find((x) => x.id === id);
    if (!p) return;
    if (outil === "noter") {
      if (e.notes.includes(id)) { e.notes = e.notes.filter((x) => x !== id); a.dire(`« ${p.nom} » retiré du rapport.`); }
      else { e.notes.push(id); a.dire(`« ${p.nom} » noté comme non conforme.`, "alerte"); }
      a.sons.clip(); return;
    }
    const bon = outil === p.outil || (outil === "main" && p.outil !== "controleur" && p.outil !== "metre");
    if (!bon) {
      const conseils = { metre: "Le mètre ne t'apprend rien ici.", controleur: "Le contrôleur ne mesure rien ici.", main: "À l'œil, rien ne permet de juger : il faut mesurer." };
      a.dire(`${p.nom} : ${conseils[outil] || "rien de particulier."}`); return;
    }
    const constat = ko(e, id) ? p.ko : p.ok;
    e.vus[id] = constat; a.temps(1);
    if (e.journal[0] !== `${p.nom} : ${constat}`) e.journal.unshift(`${p.nom} : ${constat}`);
    if (outil === "controleur") a.sons.bip(); else if (outil === "metre") a.sons.clip();
    a.dire(`${p.nom} : ${constat}`, "mesure");
  },
  action(a, act) {
    if (act === "inspecteur") { a.e.inspecte = true; a.e.panneau = null; }
  },
  termine: (a) => a.e.inspecte,
  etoiles(a) {
    const e = a.e;
    const manques = e.defauts.filter((d) => !e.notes.includes(d)).length;
    const faux = e.notes.filter((n) => !e.defauts.includes(n)).length;
    return manques + faux === 0 ? 3 : manques + faux <= 2 ? 2 : 1;
  },
  finHtml(a) {
    const e = a.e;
    const trouves = e.defauts.filter((d) => e.notes.includes(d));
    const manques = e.defauts.filter((d) => !e.notes.includes(d));
    const faux = e.notes.filter((n) => !e.defauts.includes(n));
    const li = (id, cls) => { const p = POINTS.find((x) => x.id === id); return `<li class="${cls}"><b>${p.nom}</b> : ${ko(e, id) ? p.ko : p.ok}${p.regle && ko(e, id) ? `<br><small>${p.regle}</small>` : ""}</li>`; };
    return `<h2>${manques.length ? "L'inspecteur a trouvé ce que tu avais laissé passer" : "« Rien à redire, tout a été repris avant ma visite. »"}</h2>
      <p class="im-centre">${trouves.length} défaut${trouves.length > 1 ? "s" : ""} trouvé${trouves.length > 1 ? "s" : ""} sur ${e.defauts.length}${faux.length ? ` · ${faux.length} fausse${faux.length > 1 ? "s" : ""} alerte${faux.length > 1 ? "s" : ""}` : ""}</p>
      ${trouves.length ? `<h3>✔ Bien vu</h3><ul class="im-liste">${trouves.map((id) => li(id, "ok")).join("")}</ul>` : ""}
      ${manques.length ? `<h3>✘ Oubliés</h3><ul class="im-liste">${manques.map((id) => li(id, "ko")).join("")}</ul>` : ""}
      ${faux.length ? `<h3>Notés à tort (c'était conforme)</h3><ul class="im-liste">${faux.map((id) => li(id, "faux")).join("")}</ul>` : ""}`;
  },
};
