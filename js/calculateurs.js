// Calculateurs : chaque outil recalcule à chaque frappe et montre le calcul pas à pas.
import "./page.js";

const nombre = (v) => {
  const n = parseFloat(String(v).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};
const fr = (n, d = 2) => n.toLocaleString("fr-FR", { maximumFractionDigits: d });
const euros = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const $ = (sel, racine = document) => racine.querySelector(sel);

function brancher(id, calcul) {
  const carte = document.getElementById(id);
  if (!carte) return;
  const maj = () => {
    const r = calcul(carte);
    $(".calc-resultat", carte).innerHTML = r.resultat;
    $(".calc-detail", carte).innerHTML = r.detail || "";
  };
  carte.addEventListener("input", maj);
  carte.addEventListener("change", maj);
  maj();
}

// 1. Énergie et coût : E = P × t
brancher("calc-energie", (c) => {
  const p = nombre($("[name=p]", c).value), h = nombre($("[name=h]", c).value);
  const j = nombre($("[name=j]", c).value), prix = nombre($("[name=prix]", c).value);
  if (!(p > 0 && h >= 0 && j > 0)) return { resultat: "Renseigne la puissance, la durée et le nombre de jours." };
  const kwh = (p / 1000) * h * j;
  let res = `<b>${fr(kwh)} kWh</b> consommés`;
  let det = `E = P × t = ${fr(p / 1000, 3)} kW × ${fr(h)} h × ${fr(j, 0)} jour${j > 1 ? "s" : ""} = ${fr(kwh)} kWh`;
  if (prix > 0) { res += ` · environ <b>${euros(kwh * prix)} €</b>`; det += `<br>Coût = ${fr(kwh)} kWh × ${fr(prix, 4)} € = ${euros(kwh * prix)} €`; }
  return { resultat: res, detail: det };
});

// 2. Courant d'un appareil : I = P / U
brancher("calc-courant", (c) => {
  const p = nombre($("[name=p]", c).value), u = nombre($("[name=u]", c).value);
  if (!(p > 0 && u > 0)) return { resultat: "Renseigne la puissance et la tension." };
  const i = p / u;
  return { resultat: `Courant appelé : <b>${fr(i)} A</b>`, detail: `I = P / U = ${fr(p, 0)} W / ${fr(u, 0)} V = ${fr(i)} A` };
});

// 3. Section et calibre maximal (repères du module 12)
const TABLE = [[1.5, 16], [2.5, 20], [6, 32], [10, 40], [16, 63]];
brancher("calc-section", (c) => {
  const sens = $("[name=sens]:checked", c).value;
  $("[name=section]", c).closest("label").hidden = sens !== "section";
  $("[name=calibre]", c).closest("label").hidden = sens === "section";
  if (sens === "section") {
    const s = nombre($("[name=section]", c).value);
    const ligne = TABLE.find(([sec]) => sec === s);
    return { resultat: `Disjoncteur de <b>${ligne[1]} A au maximum</b> pour ${fr(s, 1)} mm²`, detail: "Le disjoncteur protège le conducteur : jamais un calibre plus fort que celui-ci." };
  }
  const cal = nombre($("[name=calibre]", c).value);
  const ligne = TABLE.find(([, ca]) => ca >= cal);
  return { resultat: `Section minimale : <b>${fr(ligne[0], 1)} mm²</b> pour un disjoncteur de ${cal} A`, detail: `Le calibre maximal de ${fr(ligne[0], 1)} mm² est ${ligne[1]} A.` };
});

// 4. Calibre d'un interrupteur différentiel (module 11)
const CALIBRES_ID = [25, 40, 63];
function ligneDisj(cal = 16, entier = false) {
  const d = document.createElement("div");
  d.className = "calc-ligne";
  d.innerHTML = `<label>Disjoncteur <select name="cal">${[2, 10, 16, 20, 25, 32, 40].map((v) => `<option${v === cal ? " selected" : ""}>${v}</option>`).join("")}</select> A</label>
    <label class="calc-coche"><input type="checkbox" name="entier"${entier ? " checked" : ""}> chauffage, chauffe-eau ou recharge</label>
    <button type="button" class="calc-moins" aria-label="Retirer ce disjoncteur">✕</button>`;
  return d;
}
const carteId = document.getElementById("calc-differentiel");
if (carteId) {
  const liste = $(".calc-liste", carteId);
  [[10, false], [16, false], [20, false], [20, false]].forEach(([c, e]) => liste.appendChild(ligneDisj(c, e)));
  $(".calc-plus", carteId).addEventListener("click", () => { liste.appendChild(ligneDisj()); carteId.dispatchEvent(new Event("input")); });
  liste.addEventListener("click", (ev) => {
    if (ev.target.closest(".calc-moins")) { ev.target.closest(".calc-ligne").remove(); carteId.dispatchEvent(new Event("input")); }
  });
}
brancher("calc-differentiel", (c) => {
  const lignes = [...c.querySelectorAll(".calc-ligne")];
  if (!lignes.length) return { resultat: "Ajoute au moins un disjoncteur." };
  let divises = [], entiers = [];
  for (const l of lignes) (l.querySelector("[name=entier]").checked ? entiers : divises).push(Number(l.querySelector("[name=cal]").value));
  const somme = divises.reduce((a, b) => a + b, 0), plein = entiers.reduce((a, b) => a + b, 0);
  const besoin = somme / 2 + plein;
  const agcp = nombre($("[name=agcp]", c).value);
  const exige = Math.max(besoin, agcp > 0 ? agcp : 0);
  const choix = CALIBRES_ID.find((v) => v >= exige);
  let det = divises.length ? `Méthode aval : (${divises.join(" + ")}) / 2 = ${fr(somme / 2)} A` : "Méthode aval : aucun circuit divisé par 2";
  if (entiers.length) det += `, plus ${entiers.join(" + ")} A comptés en entier`;
  det += ` → <b>${fr(besoin)} A</b> au moins.`;
  if (agcp > 0) det += `<br>Méthode amont : au moins le calibre de l'AGCP → <b>${fr(agcp, 0)} A</b>.`;
  if (lignes.length > 8) det += `<br><span class="calc-alerte">Plus de 8 disjoncteurs derrière un même différentiel : il faut les répartir.</span>`;
  if (!choix) return { resultat: `Plus de 63 A : <b>répartis ces circuits sur deux interrupteurs différentiels</b>`, detail: det };
  return { resultat: `Interrupteur différentiel : <b>${choix} A</b> (calibre courant juste au-dessus)`, detail: det };
});

// 5. Chute de tension en monophasé
const RHO = 0.0225; // résistivité du cuivre en service, Ω·mm²/m
brancher("calc-chute", (c) => {
  const l = nombre($("[name=l]", c).value), i = nombre($("[name=i]", c).value);
  const s = nombre($("[name=s]", c).value), usage = $("[name=usage]", c).value;
  if (!(l > 0 && i > 0 && s > 0)) return { resultat: "Renseigne la longueur, le courant et la section." };
  const r = RHO * 2 * l / s, du = r * i, pct = du / 230 * 100;
  const limite = usage === "eclairage" ? 3 : 5;
  const ok = pct <= limite;
  return {
    resultat: `Chute de tension : <b>${fr(du)} V</b>, soit <b>${fr(pct)} %</b> — ${ok ? `<span class="calc-ok">sous la limite de ${limite} %</span>` : `<span class="calc-alerte">au-dessus de ${limite} % : prends la section supérieure</span>`}`,
    detail: `R = ρ × 2L / S = 0,0225 × 2 × ${fr(l, 1)} / ${fr(s, 1)} = ${fr(r, 3)} Ω (aller et retour)<br>ΔU = R × I = ${fr(r, 3)} × ${fr(i)} = ${fr(du)} V · ${fr(du)} / 230 = ${fr(pct)} %`
  };
});
