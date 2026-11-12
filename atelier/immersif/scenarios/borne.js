// Intervention « La voiture qui ne charge pas » : le Linky coupe le soir depuis l'installation de la borne.
// Mécanique d'enquête et de calcul : lire le compteur, la facture, les plaques signalétiques,
// régler la borne (intensité, heures creuses), simuler une nuit, convaincre la cliente.
import { texte, cadreCliquable } from "../commun.js";

const U = 230;
const h = (x) => { const hh = Math.floor(x) % 24, mm = Math.round((x - Math.floor(x)) * 60); return `${hh} h ${String(mm).padStart(2, "0")}`; };
// Foyers possibles (un par partie)
const FOYERS = {
  a: { souscrite: 6, base: 300, ce: 2400, ceDebut: 22.5, ceDuree: 3, hc: [22.5, 30.5], besoin: 20, four: [18.75, 19.5, 2500], plaque: [19, 19.75, 3000] },
  b: { souscrite: 9, base: 400, ce: 3000, ceDebut: 22, ceDuree: 3, hc: [22, 30], besoin: 30, four: [19, 20, 2500], plaque: [19, 20, 3600] },
  c: { souscrite: 6, base: 300, ce: 1800, ceDebut: 23, ceDuree: 3, hc: [23, 31], besoin: 25, four: [18.5, 19.25, 2500], plaque: [19, 19.5, 2800] },
};
const ARRIVEE = 19, DEPART = 31; // 19 h → 7 h le lendemain

// Nuit simulée, pas de 5 minutes : puissance appelée par le logement, énergie reçue par la voiture.
function simuler(f, reglage) {
  const pas = 5 / 60, points = [];
  let energie = 0, coupure = null, max = 0;
  const souscrite = (f.souscrite + (reglage.abonnement ? 3 : 0)) * 1000;
  for (let t = 18; t <= DEPART; t += pas) {
    let p = f.base;
    if (t >= f.four[0] && t < f.four[1]) p += f.four[2];
    if (t >= f.plaque[0] && t < f.plaque[1]) p += f.plaque[2];
    if (t >= f.ceDebut && t < f.ceDebut + f.ceDuree) p += f.ce;
    let voiture = 0;
    const fenetre = reglage.mode === "hc" ? t >= f.hc[0] && t < Math.min(f.hc[1], DEPART) : t >= ARRIVEE && t < DEPART;
    if (fenetre && energie < f.besoin) {
      voiture = reglage.courant * U;
      if (reglage.gestionnaire) voiture = Math.max(0, Math.min(voiture, souscrite - p - 200));
    }
    p += voiture;
    max = Math.max(max, p);
    points.push([t, p]);
    if (p > souscrite) { coupure = t; break; }
    energie += (voiture / 1000) * pas;
  }
  return { points, energie, coupure, max, souscrite };
}

/* ---------- Dessins ---------- */
function plaqueSignal(x, y, lignes) {
  return `<rect x="${x}" y="${y}" width="150" height="${22 + lignes.length * 16}" rx="4" fill="#e9eaeb" stroke="#9aa1a8"/>${lignes.map((l, i) => texte(x + 75, y + 18 + i * 16, l, 12, 700, "#2b2f34")).join("")}`;
}
function vueGarage(e) {
  const r = e.reglage;
  return `<rect width="1200" height="750" fill="#d6d2c9"/><rect width="1200" height="750" fill="url(#p-crepi)"/>
    <rect y="600" width="1200" height="150" fill="#9a958c"/>
    <path d="M150 600 C 170 480 260 430 420 420 L 760 420 C 880 420 960 470 1010 540 L 1060 560 C 1080 570 1080 600 1060 600 Z" fill="#33536f"/>
    <path d="M330 430 L 420 360 L 720 360 L 820 430 Z" fill="#9fb8cc" stroke="#33536f" stroke-width="10"/>
    <circle cx="330" cy="600" r="62" fill="#1d1f22"/><circle cx="330" cy="600" r="30" fill="#8a9198"/><circle cx="880" cy="600" r="62" fill="#1d1f22"/><circle cx="880" cy="600" r="30" fill="#8a9198"/>
    <rect x="1000" y="470" width="30" height="20" rx="4" fill="#ffd56a"/>
    <g filter="url(#f-ombre)"><rect x="1060" y="230" width="110" height="170" rx="16" fill="#f4f4f2" stroke="#b3b8bd" stroke-width="2"/>
    <rect x="1078" y="250" width="74" height="44" rx="5" fill="#1d2620"/>${texte(1115, 270, `${r.courant} A`, 15, 800, "#9fe39b")}${texte(1115, 287, r.mode === "hc" ? "heures creuses" : "immédiat", 9, 700, "#9fe39b")}
    <circle cx="1115" cy="320" r="8" fill="${e.chargee ? "#3d9a3d" : "#e0a800"}"/></g>
    <path d="M1115 400 C 1110 520 1060 520 1040 490" stroke="#1d1f22" stroke-width="10" fill="none"/>
    ${texte(600, 700, "garage · voiture électrique branchée sur la borne murale", 15, 700, "#3b3f44")}
    ${cadreCliquable(1050, 220, 130, 190, `data-panneau="borne"`, "Réglages de la borne")}
    ${cadreCliquable(20, 30, 200, 56, `data-aller="entree"`, "Entrée : compteur")}
    ${cadreCliquable(980, 30, 200, 56, `data-aller="cuisine"`, "Cuisine et cellier")}`;
}
function vueEntree(e) {
  return `<rect width="1200" height="750" fill="#e9e3d6"/><rect width="1200" height="750" fill="url(#p-crepi)"/>
    <rect x="380" y="60" width="440" height="600" fill="#e3d9c6" stroke="#cbbfa8" stroke-width="3"/>
    <rect x="420" y="100" width="190" height="250" rx="16" fill="#d5e05b" filter="url(#f-ombre)"/><rect x="442" y="130" width="146" height="60" rx="6" fill="#28331a"/>
    ${texte(515, 166, e.linkyAlerte ? "PUISS DEPASSEE" : "LINKY", 15, 800, "#bde39b", "middle", 'font-family="ui-monospace, Menlo, monospace"')}
    <circle cx="470" cy="240" r="16" fill="#9fa743"/>${texte(470, 246, "–", 18, 800, "#2b3313")}<circle cx="560" cy="240" r="16" fill="#9fa743"/>${texte(560, 246, "+", 18, 800, "#2b3313")}
    <rect x="640" y="120" width="140" height="170" rx="10" fill="#e9eaeb" stroke="#9aa1a8" stroke-width="2"/><rect x="680" y="150" width="60" height="80" rx="6" fill="#30353b"/><rect x="690" y="158" width="40" height="30" rx="4" fill="#d4372c"/>
    ${texte(710, 270, "AGCP", 13, 800)}
    <rect x="440" y="420" width="320" height="220" rx="10" fill="url(#g-coffret)" stroke="#babcbb" stroke-width="2"/>${texte(600, 540, "tableau", 15, 700, "#888")}
    <rect x="880" y="520" width="240" height="160" fill="#8d6e52"/><rect x="910" y="480" width="170" height="60" rx="3" fill="#fbfbf7" transform="rotate(-6 995 510)"/>${texte(995, 516, "facture d'électricité", 13, 700, "#555", "middle", 'transform="rotate(-6 995 510)"')}
    ${cadreCliquable(410, 90, 210, 270, `data-panneau="linky"`, "Lire le compteur Linky")}
    ${`<g class="zone cible" data-cible="facture" role="button" tabindex="0" aria-label="Lire la facture"><rect x="890" y="460" width="210" height="100" rx="10" fill="#fff" fill-opacity="0" stroke="#f2c230" stroke-width="3" stroke-dasharray="9 7" class="zone-cadre"/></g>`}
    ${cadreCliquable(20, 660, 180, 56, `data-aller="garage"`, "Retour au garage")}`;
}
function vueCuisine(e) {
  const f = e.foyer;
  const cible = (x, y, w, hh, id, label) => `<g class="zone cible" data-cible="${id}" role="button" tabindex="0" aria-label="${label}"><rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="10" fill="#fff" fill-opacity="0" stroke="#f2c230" stroke-width="3" stroke-dasharray="9 7" class="zone-cadre"/></g>`;
  return `<rect width="1200" height="750" fill="#f1ebe0"/><rect width="1200" height="750" fill="url(#p-crepi)"/>
    <rect y="660" width="1200" height="90" fill="#bfa384"/>
    <rect x="60" y="430" width="620" height="230" fill="#efe9de" stroke="#cdbfa8"/><rect x="60" y="410" width="620" height="24" fill="#7c5b3e"/>
    <rect x="300" y="404" width="200" height="8" fill="#1d1f22"/><rect x="290" y="450" width="220" height="180" rx="8" fill="#2b2f34"/><rect x="310" y="480" width="180" height="120" rx="6" fill="#4b5157"/>
    ${texte(400, 470, "four", 13, 700, "#cfd5da")}${texte(400, 398, "plaque", 13, 700, "#555")}
    <rect x="800" y="120" width="300" height="540" fill="#e3ddd2" stroke="#cbbfa8"/>${texte(950, 110, "cellier", 16, 800, "#555")}
    <rect x="880" y="180" width="140" height="300" rx="70" fill="#f4f4f2" stroke="#b3b8bd" stroke-width="2"/>${texte(950, 340, "chauffe-eau", 13, 700, "#666")}
    ${cible(280, 380, 240, 260, "four", "Plaques signalétiques du four et de la plaque")}
    ${cible(870, 170, 160, 320, "ce", "Plaque signalétique du chauffe-eau")}
    ${cadreCliquable(20, 660, 180, 56, `data-aller="garage"`, "Retour au garage")}`;
}

/* ---------- Panneaux ---------- */
function graphe(sim, f) {
  const x = (t) => 40 + ((t - 18) / (DEPART - 18)) * 620, y = (p) => 210 - (p / 15000) * 190;
  const pts = sim.points.map(([t, p]) => `${x(t).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  const heures = [18, 20, 22, 24, 26, 28, 30];
  return `<svg viewBox="0 0 680 240" class="im-graphe" role="img" aria-label="Puissance appelée pendant la nuit">
    <rect x="40" y="20" width="620" height="190" fill="#f7f4ec"/>
    ${heures.map((t) => `<path d="M${x(t)} 20 V210" stroke="#e1dccf"/><text x="${x(t)}" y="228" font-size="11" text-anchor="middle" fill="#555">${t % 24} h</text>`).join("")}
    ${[0, 5000, 10000, 15000].map((p) => `<text x="34" y="${y(p) + 4}" font-size="10" text-anchor="end" fill="#555">${p / 1000} kVA</text>`).join("")}
    <rect x="${x(f.hc[0])}" y="20" width="${x(Math.min(f.hc[1], DEPART)) - x(f.hc[0])}" height="190" fill="#3d6fb8" opacity=".08"/>
    <path d="M40 ${y(sim.souscrite)} H660" stroke="#d23a2e" stroke-width="2" stroke-dasharray="6 4"/><text x="656" y="${y(sim.souscrite) - 5}" font-size="11" text-anchor="end" fill="#d23a2e" font-weight="700">puissance souscrite ${sim.souscrite / 1000} kVA</text>
    <polyline points="${pts}" fill="none" stroke="#1d2228" stroke-width="2.5"/>
    ${sim.coupure !== null ? `<circle cx="${x(sim.coupure)}" cy="${y(sim.max)}" r="7" fill="#d23a2e"/><text x="${x(sim.coupure) + 10}" y="${y(sim.max) + 4}" font-size="12" fill="#d23a2e" font-weight="800">coupure</text>` : ""}
  </svg>`;
}
const LINKY = (e) => {
  const f = e.foyer;
  return [
    e.linkyAlerte ? "PUISS DEPASSEE" : "Période en cours : HEURES PLEINES",
    "PUISSANCE APP : 0,31 kVA (maintenant)",
    `PUISS MAX ATTEINTE HIER : ${(e.maxHier / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} kVA à ${h(e.coupureHier)}`,
    `INDEX HC : 18 452 kWh · INDEX HP : 26 117 kWh`,
  ];
};

/* ---------- Intervention ---------- */
export default {
  id: "borne",
  titre: "La voiture qui ne charge pas",
  lieu: "Maison de la famille Benali · garage, 17 h 30",
  client: { nom: "Mme Benali", court: "Mme Benali", initiales: "NB", teinte: "#a0526b", role: "Propriétaire, conduit une voiture électrique",
    humeurs: ["Mme Benali est agacée.", "Mme Benali est mitigée.", "Mme Benali est contente.", "Mme Benali est ravie."] },
  accueil: "« Bonjour ! Depuis qu'on a la borne, le courant coupe presque tous les soirs. Et ce matin, la voiture n'était même pas chargée. »",
  merci: "",
  vueDepart: "garage",
  sansMultimetre: true, sansTournevis: true,
  astuce: "Lis le compteur et la facture dans l'entrée, les plaques signalétiques en cuisine et au cellier, puis règle la borne et lance une nuit d'essai.",
  dialogue: {
    max: 5,
    fin: "« Je vous laisse calculer, moi les kilowatts… Je suis dans la cuisine. »",
    questions: [
      { id: "quand", texte: "Ça coupe à quelle heure, et dans quelles circonstances ?", reponse: { "*": "« Vers 19 heures, quand je fais à manger et que mon mari branche la voiture en rentrant. »" } },
      { id: "linky", apres: "quand", texte: "Le compteur affiche quelque chose quand ça coupe ?", reponse: { "*": "« Oui, il écrit « PUISS DEPASSEE ». J'appuie sur son bouton, le courant revient… et ça recommence. »" } },
      { id: "besoin", texte: "De combien la voiture a-t-elle besoin chaque nuit ?", reponse: {
        a: "« Mon mari fait 100 km par jour pour le travail. L'application de la voiture dit qu'il faut environ 20 kWh par nuit. »",
        b: "« On fait beaucoup de route, l'application dit qu'il faut environ 30 kWh par nuit. »",
        c: "« L'application de la voiture dit environ 25 kWh par nuit. »" } },
      { id: "depart", apres: "besoin", texte: "La voiture repart à quelle heure le matin ?", reponse: { "*": "« À 7 heures pile. Elle rentre vers 19 heures. »" } },
      { id: "eau", texte: "Comment chauffez-vous l'eau ?", reponse: { "*": "« Un ballon électrique, dans le cellier. Il chauffe la nuit, en heures creuses. »" } },
      { id: "hc", apres: "eau", texte: "Vous avez un tarif heures creuses ? À quelles heures ?", reponse: {
        a: "« Oui, de 22 h 30 à 6 h 30. C'est écrit sur la facture, dans l'entrée. »",
        b: "« Oui, de 22 h à 6 h. C'est sur la facture, dans l'entrée. »",
        c: "« Oui, de 23 h à 7 h. C'est sur la facture, dans l'entrée. »" } },
      { id: "contrat", texte: "Quelle puissance avez-vous au contrat ?", reponse: { "*": "« Aucune idée… c'est sur la facture, non ? Elle est sur le meuble de l'entrée. »" } },
      { id: "reproche", texte: "Pourquoi avoir pris une voiture électrique sans vérifier votre abonnement ?", mauvaise: true, reponse: { "*": "« L'installateur de la borne n'a rien dit. C'est vous l'électricien, non ? »" } },
    ],
  },
  pannes: [
    { id: "a", titre: "Foyer A : 6 kVA, chauffe-eau 2 400 W, 20 kWh par nuit", explication: "" },
    { id: "b", titre: "Foyer B : 9 kVA, chauffe-eau 3 000 W, 30 kWh par nuit", explication: "" },
    { id: "c", titre: "Foyer C : 6 kVA, chauffe-eau 1 800 W, 25 kWh par nuit", explication: "" },
  ],
  pieces: [],
  liaisons: [], noeuds: {}, noms: {},
  etat(p) {
    const foyer = FOYERS[p.id];
    const reglage = { courant: 32, mode: "immediat", gestionnaire: false, abonnement: false };
    const hier = simuler(foyer, reglage);
    return { foyer, reglage, essais: 0, dernier: null, valide: false, chargee: false, linkyAlerte: true, linkyEcran: 0, maxHier: Math.round(hier.max), coupureHier: hier.coupure, repare: true };
  },
  compteurs: (a) => `<span>🔋 besoin : ${a.e.poses.includes("besoin") ? a.e.foyer.besoin + " kWh" : "?"}</span><span>🧪 ${a.e.essais} nuit${a.e.essais > 1 ? "s" : ""} d'essai</span>`,
  vues: { garage: vueGarage, entree: vueEntree, cuisine: vueCuisine },
  entree(a) { a.dire("Le garage. La voiture est branchée sur la borne, réglée sur 32 A en charge immédiate."); },
  utiliser(a, outil, id) {
    const f = a.e.foyer;
    if (id === "facture") a.dire(`Facture : puissance souscrite ${f.souscrite} kVA, option heures creuses de ${h(f.hc[0])} à ${h(f.hc[1])}.`, "mesure");
    if (id === "four") a.dire(`Plaques signalétiques : four ${f.four[2].toLocaleString("fr-FR")} W, plaque ${f.plaque[2].toLocaleString("fr-FR")} W (en usage normal le soir). La cliente cuisine de ${h(f.four[0])} à ${h(f.plaque[1])}.`, "mesure");
    if (id === "ce") a.dire(`Plaque du chauffe-eau : 230 V ~ ${f.ce.toLocaleString("fr-FR")} W. Il chauffe environ ${f.ceDuree} h à partir du début des heures creuses.`, "mesure");
    a.temps(1);
  },
  panneaux: {
    linky: { rendu(a) {
      const e = a.e, ecr = LINKY(e);
      return `<h2>Compteur Linky</h2><div class="im-linky">${ecr[e.linkyEcran % ecr.length]}</div>
        <p class="im-petit">Écran ${e.linkyEcran % ecr.length + 1} / ${ecr.length}</p>
        <button type="button" class="im-question" data-s="linky">Appuyer sur « + » (écran suivant)</button>`;
    } },
    borne: { label: "🔌 Réglages et essai", rendu(a) {
      const e = a.e, r = e.reglage, f = e.foyer;
      const sim = e.dernier;
      return `<h2>Réglages de la borne</h2>
        <div class="im-reglage"><span>Intensité de charge maximale</span>
          <button type="button" class="im-pm" data-s="courant:-1" aria-label="Baisser">−</button><b>${r.courant} A</b><button type="button" class="im-pm" data-s="courant:1" aria-label="Augmenter">+</button>
          <small>soit ${(r.courant * U).toLocaleString("fr-FR")} W (P = U × I)</small></div>
        <div class="im-reglage"><span>Démarrage de la charge</span>
          <button type="button" class="im-question ${r.mode === "immediat" ? "choisi" : ""}" data-s="mode:immediat">Dès le branchement (19 h)</button>
          <button type="button" class="im-question ${r.mode === "hc" ? "choisi" : ""}" data-s="mode:hc">En heures creuses seulement</button></div>
        <details><summary>Solutions qui coûtent au client</summary>
          <button type="button" class="im-question ${r.gestionnaire ? "choisi" : ""}" data-s="option:gestionnaire">Poser un gestionnaire d'énergie (la borne ralentit toute seule quand la maison consomme) · 350 €</button>
          <button type="button" class="im-question ${r.abonnement ? "choisi" : ""}" data-s="option:abonnement">Passer l'abonnement à ${f.souscrite + 3} kVA (plus cher chaque mois)</button></details>
        <button type="button" class="im-plein" data-s="simuler">Lancer une nuit d'essai</button>
        ${sim ? `${graphe(sim, f)}
          <p class="${sim.coupure !== null ? "im-alerte" : sim.energie >= f.besoin - 0.05 ? "im-ok" : "im-alerte"}">${sim.coupure !== null
            ? `Coupure à ${h(sim.coupure)} : le logement appelle ${(sim.max / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kVA, plus que les ${sim.souscrite / 1000} kVA souscrits. Le Linky affiche PUISS DEPASSEE.`
            : sim.energie >= f.besoin - 0.05 ? `Aucune coupure. À 7 h, la voiture a reçu ${sim.energie.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kWh : elle est chargée.`
            : `Aucune coupure, mais à 7 h la voiture n'a reçu que ${sim.energie.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kWh sur ${f.besoin} : pas assez.`}</p>
          ${sim.coupure === null && sim.energie >= f.besoin - 0.05 ? `<button type="button" class="im-plein" data-s="valider">Garder ce réglage et l'expliquer à Mme Benali</button>` : ""}` : ""}`;
    } },
  },
  action(a, act, arg) {
    const e = a.e, r = e.reglage;
    if (act === "linky") { e.linkyEcran++; a.sons.bip(); return; }
    if (act === "courant") { r.courant = Math.max(6, Math.min(32, r.courant + Number(arg))); e.dernier = null; return; }
    if (act === "mode") { r.mode = arg; e.dernier = null; return; }
    if (act === "option") { r[arg] = !r[arg]; e.dernier = null; return; }
    if (act === "simuler") {
      e.essais++; a.temps(5);
      e.dernier = simuler(e.foyer, r);
      if (e.dernier.coupure !== null) a.sons.disjoncteur(); else a.sons.bip();
      return;
    }
    if (act === "valider") { e.valide = true; e.chargee = true; e.panneau = null; e.vue = "garage"; }
  },
  termine: (a) => a.e.valide,
  etoiles(a) {
    const e = a.e, r = e.reglage;
    let n = 3;
    if (r.gestionnaire || r.abonnement) n--;
    if (e.essais > 4) n--;
    if (e.humeur < 2) n--;
    return Math.max(1, n);
  },
  finHtml(a) {
    const e = a.e, r = e.reglage, f = e.foyer, sim = e.dernier;
    const dispo = f.souscrite * 1000 - f.base - f.ce;
    const imax = Math.floor(dispo / U), imin = Math.ceil((f.besoin / (f.hc[1] - f.hc[0]) * 1000) / U);
    return `<h2>« Plus de coupure, et la voiture est pleine le matin ! »</h2>
      <p class="im-centre">Ton réglage : ${r.courant} A, ${r.mode === "hc" ? "en heures creuses" : "dès le branchement"}${r.gestionnaire ? ", avec gestionnaire d'énergie" : ""}${r.abonnement ? `, abonnement passé à ${f.souscrite + 3} kVA` : ""}.</p>
      <h3>Le raisonnement</h3>
      <p>À 19 h, la cuisine appelle déjà ${(f.base + f.four[2] + f.plaque[2]).toLocaleString("fr-FR")} W. La borne à 32 A ajoute 32 × 230 = 7 360 W : on dépasse les ${f.souscrite} kVA souscrits et le Linky coupe.</p>
      <p>En heures creuses, le chauffe-eau (${f.ce.toLocaleString("fr-FR")} W) et la maison (${f.base} W) laissent ${f.souscrite * 1000} − ${f.base} − ${f.ce} = <b>${dispo.toLocaleString("fr-FR")} W</b> pour la voiture, soit ${dispo.toLocaleString("fr-FR")} ÷ 230 ≈ <b>${imax} A au plus</b>.</p>
      <p>Il faut ${f.besoin} kWh en ${f.hc[1] - f.hc[0]} h : ${f.besoin} ÷ ${f.hc[1] - f.hc[0]} = ${(f.besoin / (f.hc[1] - f.hc[0])).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} kW, soit <b>${imin} A au moins</b>.</p>
      <p><b>La bonne solution, gratuite :</b> charge en heures creuses, réglée entre ${imin} A et ${imax} A. ${r.gestionnaire || r.abonnement ? "Ta solution marche aussi, mais elle coûte au client alors qu'un simple réglage suffisait." : "C'est exactement ce que tu as fait."}</p>
      <p class="im-petit">Calcul simplifié : on prend les puissances en watts comme des voltampères (appareils résistifs). La puissance souscrite s'exprime en kVA.</p>`;
  },
};
