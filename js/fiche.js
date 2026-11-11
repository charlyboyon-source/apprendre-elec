// Fiches mémo : l'essentiel d'un module en cartes illustrées, à réviser à l'écran ou à imprimer.
import "./page.js";
import { chargerModules, melanger } from "./donnees.js";

const zone = document.querySelector(".fiche-zone");
const CLE = "apprendreelec-fiches-v1";
const sansTermes = (t) => t.replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, "$1");

// Met en valeur les grandeurs chiffrées (30 mA, 1,5 mm², 5 à 10 In…) sans toucher au texte.
const VALEUR = /(\d+(?:[  ]\d{3})*(?:[,.]\d+)?(?:[  ]?(?:à|ou|\/)[  ]?\d+(?:[,.]\d+)?)?[  ]?(?:mA|kVA|kWh|kWc|kW|mm²|m²|mm|cm|kA|ms|Hz|MΩ|kΩ|Ω|°C|%|In|V|A|W|m|s|h)(?![\wÀ-ÿ²]))/g;
const surligner = (t) => sansTermes(t).replace(VALEUR, '<strong class="fiche-val">$1</strong>');

function lireSues() {
  try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch { return {}; }
}
function ecrireSues(d) {
  try { localStorage.setItem(CLE, JSON.stringify(d)); } catch { /* stockage indisponible : la fiche marche quand même */ }
}

let blocs = [];

async function init() {
  const [modules, parcours] = await Promise.all([
    chargerModules(),
    fetch("data/parcours.json").then((r) => r.json()),
  ]);
  blocs = parcours.blocs;
  const id = Number(new URLSearchParams(location.search).get("id"));
  const module = modules.find((m) => m.id === id);
  if (module) afficherFiche(module, modules); else afficherListe(modules);
}

function afficherListe(modules) {
  document.title = "Fiches mémo d'électricité à imprimer — ApprendreElec";
  const sues = lireSues();
  zone.innerHTML = `
    <h1>Fiches mémo</h1>
    <p class="niveau-objectif">L'essentiel de chaque cours en images. Coche ce que tu sais déjà, teste-toi en trois questions, imprime la fiche si tu veux.</p>
    ${blocs.map((b) => {
      const liste = modules.filter((m) => m.bloc === b.id);
      if (!liste.length) return "";
      return `
      <h2 class="fiche-bloc-titre bloc-${b.id}"><span>Bloc ${b.id}</span> ${b.titre}</h2>
      <div class="fiche-grille-liste">${liste.map((m) => {
        const total = m.cours.sections.length;
        const fait = (sues[m.id] || []).filter((x) => x < total).length;
        return `
        <a class="fiche-vignette bloc-${b.id}" href="fiche.html?id=${m.id}">
          <span class="fiche-vignette-image"><img src="assets/svg/${m.cours.sections[0].svg}" alt="" loading="lazy"></span>
          <span class="fiche-vignette-num">Module ${m.id}</span>
          <span class="fiche-vignette-titre">${m.titre}</span>
          <span class="fiche-jauge"><span style="width:${Math.round((fait / total) * 100)}%"></span></span>
          <span class="fiche-vignette-etat">${fait === total ? "✓ Fiche maîtrisée" : `${fait} / ${total} points sus`}</span>
        </a>`;
      }).join("")}</div>`;
    }).join("")}`;
}

function afficherFiche(m, modules) {
  document.title = `Fiche mémo : ${m.titre} — ApprendreElec`;
  const i = modules.indexOf(m);
  const bloc = blocs.find((b) => b.id === m.bloc) || { id: 1, titre: "" };
  const sections = m.cours.sections;
  const sues = lireSues();
  const mesSues = new Set((sues[m.id] || []).filter((x) => x < sections.length));

  zone.innerHTML = `
    <header class="fiche-entete bloc-${bloc.id}">
      <p class="fiche-entete-kicker">FICHE MÉMO · MODULE ${m.id} · ${bloc.titre}</p>
      <h1>${m.titre}</h1>
      <p class="fiche-entete-objectif">${m.objectif}</p>
      <div class="fiche-progression non-imprime">
        <span class="fiche-jauge"><span></span></span>
        <span class="fiche-progression-texte"></span>
      </div>
    </header>
    <div class="page-actions">
      <button class="bouton-plein fiche-imprimer" type="button">🖨 Imprimer ou enregistrer en PDF</button>
      <a class="bouton-creux" href="niveau.html?id=${m.id}&module=lecon&libre=1">📖 Lire le cours</a>
      <a class="bouton-creux" href="fiche.html">Toutes les fiches</a>
    </div>
    <div class="fiche-cartes bloc-${bloc.id}">
      ${sections.map((s, n) => `
      <section class="fiche-carte${mesSues.has(n) ? " sue" : ""}" data-n="${n}">
        <div class="fiche-carte-image"><img src="assets/svg/${s.svg}" alt="${(s.titre || "").replace(/"/g, "&quot;")}" loading="lazy"></div>
        <div class="fiche-carte-corps">
          <h2><span class="fiche-carte-num">${n + 1}</span>${s.titre.replace(/^\d+\.\s*/, "")}</h2>
          <p class="fiche-carte-memo">${surligner(s.memo || "")}</p>
          ${s.encadre ? `<p class="fiche-carte-chantier"><strong>${s.encadre.titre || "Sur le chantier"}</strong> ${surligner(s.encadre.texte)}</p>` : ""}
          <label class="fiche-carte-coche non-imprime"><input type="checkbox"${mesSues.has(n) ? " checked" : ""}> Je le sais</label>
        </div>
      </section>`).join("")}
    </div>
    <section class="fiche-test non-imprime">
      <h2>Teste-toi en 3 questions</h2>
      <div class="fiche-test-questions"></div>
      <button class="bouton-creux fiche-test-autres" type="button">↻ Trois autres questions</button>
    </section>
    <p class="fiche-signature">apprendre-electricite.fr — fiche du module ${m.id}</p>
    <nav class="page-voisins non-imprime">
      ${i > 0 ? `<a href="fiche.html?id=${modules[i - 1].id}">← ${modules[i - 1].titre}</a>` : "<span></span>"}
      ${i < modules.length - 1 ? `<a href="fiche.html?id=${modules[i + 1].id}">${modules[i + 1].titre} →</a>` : "<span></span>"}
    </nav>`;

  zone.querySelector(".fiche-imprimer").addEventListener("click", () => window.print());

  // Progression : « Je le sais »
  const majProgression = () => {
    const total = sections.length;
    zone.querySelector(".fiche-progression .fiche-jauge span").style.width = `${Math.round((mesSues.size / total) * 100)}%`;
    zone.querySelector(".fiche-progression-texte").textContent =
      mesSues.size === total ? "✓ Fiche maîtrisée" : `${mesSues.size} / ${total} points sus`;
  };
  majProgression();
  zone.querySelector(".fiche-cartes").addEventListener("change", (ev) => {
    const carte = ev.target.closest(".fiche-carte");
    if (!carte) return;
    const n = Number(carte.dataset.n);
    if (ev.target.checked) mesSues.add(n); else mesSues.delete(n);
    carte.classList.toggle("sue", ev.target.checked);
    const tout = lireSues();
    tout[m.id] = [...mesSues].sort((a, b) => a - b);
    ecrireSues(tout);
    majProgression();
  });

  // Mini-test : 3 questions tirées de la banque du module
  const zoneTest = zone.querySelector(".fiche-test-questions");
  const tirer = () => {
    const questions = melanger([...m.banque]).slice(0, 3);
    zoneTest.innerHTML = questions.map((q, k) => {
      const ordre = melanger(q.choix.map((_, c) => c));
      return `
      <div class="fiche-question" data-k="${k}">
        <p class="fiche-question-texte">${sansTermes(q.question)}</p>
        <div class="fiche-question-choix">${ordre.map((c) => `<button type="button" data-ok="${c === q.bonne ? 1 : 0}">${sansTermes(q.choix[c])}</button>`).join("")}</div>
        <p class="fiche-question-explication" hidden>${sansTermes(q.explication || "")}</p>
      </div>`;
    }).join("");
  };
  tirer();
  zoneTest.addEventListener("click", (ev) => {
    const bouton = ev.target.closest(".fiche-question-choix button");
    if (!bouton) return;
    const question = bouton.closest(".fiche-question");
    if (question.classList.contains("repondue")) return;
    question.classList.add("repondue");
    for (const b of question.querySelectorAll("button")) {
      b.disabled = true;
      if (b.dataset.ok === "1") b.classList.add("juste");
    }
    if (bouton.dataset.ok !== "1") bouton.classList.add("faux");
    question.querySelector(".fiche-question-explication").hidden = false;
  });
  zone.querySelector(".fiche-test-autres").addEventListener("click", tirer);
  window.scrollTo(0, 0);
}

init();
