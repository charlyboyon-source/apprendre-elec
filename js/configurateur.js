// Configurateur pédagogique de tableau (logement, monophasé 230 V).
// Règles appliquées, toutes tirées des modules 11, 14 et 20 :
//  - éclairage : 1,5 mm², 16 A, 8 points max par circuit ; au moins 2 circuits au-delà de 35 m² ;
//  - prises 16 A : 12 max en 2,5 mm² / 20 A, ou 8 max en 1,5 mm² / 16 A ; cuisine : circuit dédié 2,5 mm² / 20 A ;
//  - spécialisés : plaque 6 mm² / 32 A ; four, lave-linge, lave-vaisselle, sèche-linge, chauffe-eau 2,5 mm² / 20 A ; VMC 1,5 mm² / 2 A ;
//  - au moins 2 interrupteurs différentiels 30 mA, dont 1 type AC et 1 type A ; plaque et lave-linge sous le type A ;
//  - 8 disjoncteurs max par interrupteur différentiel ; éclairage et prises répartis ;
//  - calibre du différentiel : méthode aval (somme / 2, chauffe-eau et recharge en entier), calibres 25, 40, 63 A ;
//  - recharge de véhicule (prise renforcée 2,5 mm² / 20 A) : différentiel 30 mA type A propre au circuit ;
//  - réserve : 20 % des emplacements dont 6 modules libres consécutifs ; 2 prises modulaires ; rangées de 13 modules.
import "./page.js";

const MODULES_RANGEE = 13, MODULES_ID = 2, MODULES_PRISE = 2.5;
const CAL_ID = [25, 40, 63];
const form = document.querySelector(".config-form");
const sortie = document.querySelector(".config-resultat");
const val = (n) => form.elements[n];
const entier = (n) => Math.max(0, Math.floor(Number(String(val(n).value).replace(",", ".")) || 0));
const coche = (n) => val(n).checked;

function circuits() {
  const liste = [];
  const surface = entier("surface"), points = entier("points");
  if (points > 0) {
    const n = Math.max(Math.ceil(points / 8), surface > 35 ? 2 : 1);
    for (let k = 0; k < n; k++) {
      const pts = Math.floor(points / n) + (k < points % n ? 1 : 0);
      liste.push({ nom: `Éclairage ${k + 1}`, court: `Écl.${k + 1}`, detail: `${pts} point${pts > 1 ? "s" : ""} lumineux`, cal: 16, sec: "1,5", fam: "ecl" });
    }
  }
  const prises = entier("prises"), en25 = val("sectionPrises").value === "2.5";
  if (prises > 0) {
    const max = en25 ? 12 : 8, n = Math.ceil(prises / max);
    for (let k = 0; k < n; k++) {
      const p = Math.floor(prises / n) + (k < prises % n ? 1 : 0);
      liste.push({ nom: `Prises ${k + 1}`, court: `Pr.${k + 1}`, detail: `${p} prise${p > 1 ? "s" : ""} 16 A`, cal: en25 ? 20 : 16, sec: en25 ? "2,5" : "1,5", fam: "pr" });
    }
  }
  if (coche("cuisine")) liste.push({ nom: "Prises cuisine", court: "Cuis.", detail: "6 prises dont 4 au plan de travail", cal: 20, sec: "2,5", fam: "pr" });
  const SPE = [
    ["plaque", "Plaque de cuisson", "Plaq.", 32, "6", "A"], ["lavelinge", "Lave-linge", "LL", 20, "2,5", "A"],
    ["four", "Four", "Four", 20, "2,5"], ["lavevaisselle", "Lave-vaisselle", "LV", 20, "2,5"],
    ["sechelinge", "Sèche-linge", "SL", 20, "2,5"], ["chauffeeau", "Chauffe-eau", "ECS", 20, "2,5", null, true],
    ["vmc", "VMC", "VMC", 2, "1,5"]
  ];
  for (const [id, nom, court, cal, sec, typeA, plein] of SPE) {
    if (coche(id)) liste.push({ nom, court, detail: "circuit spécialisé", cal, sec, fam: "spe", typeA: typeA === "A", plein: Boolean(plein), spe: id !== "vmc" });
  }
  if (coche("recharge")) liste.push({ nom: "Prise renforcée véhicule", court: "VE", detail: "recharge, différentiel dédié", cal: 20, sec: "2,5", fam: "ve", plein: true, ve: true, spe: true });
  return liste;
}

const besoin = (id) => id.circ.filter((c) => !c.plein).reduce((s, c) => s + c.cal, 0) / 2 + id.circ.filter((c) => c.plein).reduce((s, c) => s + c.cal, 0);
const peutPrendre = (id, c) => id.circ.length < 8 && besoin({ circ: [...id.circ, c] }) <= 63;

function repartir(liste) {
  const ids = [{ type: "A", circ: [] }, { type: "AC", circ: [] }];
  const ajouterAC = () => { const n = { type: "AC", circ: [] }; ids.push(n); return n; };
  for (const c of liste.filter((c) => c.typeA)) {
    const cible = ids.find((i) => i.type === "A" && !i.ve && peutPrendre(i, c)) || (() => { const n = { type: "A", circ: [] }; ids.push(n); return n; })();
    cible.circ.push(c);
  }
  // Éclairage puis prises : chacun sur le différentiel le moins chargé, pour les répartir.
  const generaux = () => ids.filter((i) => !i.ve);
  for (const fam of ["ecl", "pr"]) {
    for (const c of liste.filter((x) => x.fam === fam && !x.typeA)) {
      const tri = generaux().filter((i) => peutPrendre(i, c)).sort((a, b) =>
        a.circ.filter((x) => x.fam === fam).length - b.circ.filter((x) => x.fam === fam).length || besoin(a) - besoin(b));
      (tri[0] || ajouterAC()).circ.push(c);
    }
  }
  // Spécialisés : les plus lourds d'abord, chacun là où la charge reste la plus faible.
  const spe = liste.filter((x) => x.fam === "spe" && !x.typeA).sort((a, b) => (b.plein - a.plein) || (b.cal - a.cal));
  for (const c of spe) {
    const tri = generaux().filter((i) => peutPrendre(i, c)).sort((a, b) => besoin({ circ: [...a.circ, c] }) - besoin({ circ: [...b.circ, c] }));
    (tri[0] || ajouterAC()).circ.push(c);
  }
  for (const c of liste.filter((x) => x.ve)) ids.push({ type: "A", circ: [c], ve: true });
  for (const i of ids) i.cal = CAL_ID.find((v) => v >= besoin(i));
  return ids.filter((i) => i.circ.length || i.type === "A" || i.type === "AC");
}

function rangees(ids) {
  const r = ids.map((i) => ({ id: i, prises: 0, libres: MODULES_RANGEE - MODULES_ID - i.circ.length }));
  let aPlacer = 2;
  for (const row of [...r].sort((a, b) => b.libres - a.libres)) {
    while (aPlacer && row.libres >= MODULES_PRISE) { row.prises++; row.libres -= MODULES_PRISE; aPlacer--; }
  }
  if (aPlacer) r.push({ id: null, prises: aPlacer, libres: MODULES_RANGEE - aPlacer * MODULES_PRISE });
  const ok = () => {
    const total = r.length * MODULES_RANGEE, libres = r.reduce((s, x) => s + x.libres, 0);
    return libres >= 0.2 * total && r.some((x) => x.libres >= 6);
  };
  while (!ok()) r.push({ id: null, prises: 0, libres: MODULES_RANGEE });
  return r;
}

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function dessin(r) {
  return `<div class="tab-coffret">${r.map((row, k) => {
    const cases = [];
    if (row.id) {
      cases.push(`<div class="tab-mod tab-id t-${row.id.type}" style="grid-column: span ${MODULES_ID * 2}" title="Interrupteur différentiel ${row.id.cal} A, 30 mA, type ${row.id.type}"><b>${row.id.cal} A</b><small>30 mA</small><small>type ${row.id.type}</small></div>`);
      for (const c of row.id.circ) cases.push(`<div class="tab-mod tab-dj f-${c.fam}" style="grid-column: span 2" title="${esc(c.nom)} : ${c.sec} mm², disjoncteur ${c.cal} A"><b>C${c.cal}</b><small>${esc(c.court)}</small></div>`);
    }
    for (let p = 0; p < row.prises; p++) cases.push(`<div class="tab-mod tab-prise" style="grid-column: span ${MODULES_PRISE * 2}" title="Prise de courant modulaire"><span></span></div>`);
    const libres = Math.round(row.libres * 2);
    if (libres > 0) cases.push(`<div class="tab-mod tab-libre" style="grid-column: span ${libres}"><small>réserve</small></div>`);
    return `<div class="tab-rangee"><span class="tab-num">${k + 1}</span><div class="tab-rail">${cases.join("")}</div></div>`;
  }).join("")}</div>`;
}

function calculer() {
  const liste = circuits();
  if (!liste.length) { sortie.innerHTML = `<p class="config-vide">Ajoute des points lumineux, des prises ou des appareils : le tableau se compose tout seul.</p>`; return; }
  const ids = repartir(liste), r = rangees(ids);
  const total = r.length * MODULES_RANGEE, libres = r.reduce((s, x) => s + x.libres, 0);
  const nbSpe = liste.filter((c) => c.spe).length, plaque = coche("plaque");
  const autres20 = liste.filter((c) => c.spe && c.cal === 20 && !c.ve).length;
  const agcp = Number(String(val("agcp").value).replace(",", ".")) || 0;
  const alertes = [];
  if (!(plaque && autres20 >= 3)) alertes.push("Un logement compte au moins 4 circuits spécialisés : la plaque de cuisson et au moins trois autres en 2,5 mm² sous 20 A.");
  if (coche("recharge")) alertes.push("Recharge : vérifie dans la notice le type de différentiel exigé (type A au minimum, parfois type B). Une borne de plus de 3,7 kW demande la qualification IRVE.");
  const verifs = [
    [ids.filter((i) => !i.ve).length >= 2, "Au moins 2 interrupteurs différentiels 30 mA"],
    [ids.some((i) => i.type === "AC") && ids.some((i) => i.type === "A" && !i.ve), "Au moins 1 type AC et 1 type A"],
    [ids.every((i) => i.circ.length <= 8), "8 disjoncteurs au maximum par différentiel"],
    [liste.filter((c) => c.typeA).every((c) => ids.some((i) => i.type === "A" && i.circ.includes(c))), "Plaque et lave-linge sous un type A"],
    [libres >= 0.2 * total, `Réserve : ${Math.round(libres * 10) / 10} modules libres sur ${total} (au moins 20 %)`],
    [r.some((x) => x.libres >= 6), "6 modules libres consécutifs"],
  ];
  sortie.innerHTML = `
    <div class="config-chiffres">
      <div><b>${r.length}</b><span>rangée${r.length > 1 ? "s" : ""} de 13 modules</span></div>
      <div><b>${ids.length}</b><span>interrupteurs différentiels</span></div>
      <div><b>${liste.length}</b><span>circuits</span></div>
    </div>
    ${dessin(r)}
    <ul class="config-verifs">${verifs.map(([ok, t]) => `<li class="${ok ? "ok" : "ko"}">${ok ? "✓" : "✗"} ${t}</li>`).join("")}</ul>
    ${alertes.map((a) => `<p class="config-alerte">${a}</p>`).join("")}
    <h3>Les circuits</h3>
    <table class="config-table"><thead><tr><th>Circuit</th><th>Section</th><th>Disjoncteur</th><th>Différentiel</th></tr></thead><tbody>
      ${ids.map((i, k) => i.circ.map((c) => `<tr><td>${esc(c.nom)}<small>${esc(c.detail)}</small></td><td>${c.sec} mm²</td><td>${c.cal} A</td><td>n° ${k + 1} · ${i.cal} A type ${i.type}</td></tr>`).join("")).join("")}
    </tbody></table>
    <h3>Le calibre des différentiels (méthode aval)</h3>
    <ul class="config-calibres">${ids.map((i, k) => {
      const div = i.circ.filter((c) => !c.plein).map((c) => c.cal), pl = i.circ.filter((c) => c.plein).map((c) => c.cal);
      const b = besoin(i);
      return `<li>n° ${k + 1}, type ${i.type}${i.ve ? " (dédié à la recharge)" : ""} : ${div.length ? `(${div.join(" + ")}) / 2` : "0"}${pl.length ? ` + ${pl.join(" + ")} en entier` : ""} = ${Math.round(b * 10) / 10} A → <b>${i.cal} A</b></li>`;
    }).join("")}</ul>
    ${agcp > 0 ? `<p class="config-note">Méthode amont, avec ton AGCP de ${agcp} A : chaque interrupteur différentiel doit faire au moins ${CAL_ID.find((v) => v >= agcp) || "plus de 63"} A. L'une ou l'autre méthode suffit.</p>` : ""}`;
}

form.addEventListener("input", calculer);
form.addEventListener("change", calculer);
calculer();
