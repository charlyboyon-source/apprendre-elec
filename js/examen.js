// Examen blanc : 40 questions tirées dans tous les modules, 40 minutes.
import "./page.js";
import { chargerModules, melanger } from "./donnees.js";
import { demarrerQuiz } from "./quiz.js";

const NB = 40;
const DUREE = 40 * 60; // secondes
const zone = document.querySelector(".examen-zone");
const accueil = zone.innerHTML;

function brancherDepart() {
  zone.querySelector(".examen-demarrer").addEventListener("click", lancer);
}
brancherDepart();

async function lancer() {
  zone.innerHTML = `<p class="niveau-message">Préparation des questions…</p>`;
  const [modules, pages] = await Promise.all([
    chargerModules(),
    fetch("data/pages-cours.json").then((r) => r.json()).catch(() => ({}))
  ]);

  // Deux questions par module, puis on ramène la série à 40.
  let tirage = [];
  for (const m of modules) {
    for (const q of melanger(m.banque.slice()).slice(0, 2)) tirage.push({ ...q, _module: m.id });
  }
  tirage = melanger(tirage);
  while (tirage.length > NB) {
    // On retire une question d'un module qui en a encore deux.
    const compte = {};
    tirage.forEach((q) => { compte[q._module] = (compte[q._module] || 0) + 1; });
    const i = tirage.findIndex((q) => compte[q._module] > 1);
    tirage.splice(i < 0 ? 0 : i, 1);
  }

  zone.innerHTML = `
    <div class="examen-chrono"><span>Examen blanc · ${tirage.length} questions</span><span class="temps">40:00</span></div>
    <div class="examen-quiz"></div>`;
  const affichage = zone.querySelector(".temps");
  const fin = Date.now() + DUREE * 1000;
  let fini = false;

  const quiz = demarrerQuiz({ banque: tirage }, zone.querySelector(".examen-quiz"), {
    nb: tirage.length,
    onFin: (score, total, detail) => { fini = true; clearInterval(horloge); bilan(score, total, detail, modules, pages); },
    onRevoirLecon: (_section, q) => { location.href = pages[q._module] || `niveau.html?id=${q._module}&module=lecon&libre=1`; }
  });

  const horloge = setInterval(() => {
    const reste = Math.max(0, Math.round((fin - Date.now()) / 1000));
    affichage.textContent = `${String(Math.floor(reste / 60)).padStart(2, "0")}:${String(reste % 60).padStart(2, "0")}`;
    affichage.classList.toggle("presse", reste <= 300);
    if (reste === 0 && !fini) quiz.terminer();
  }, 500);
}

function bilan(score, total, { questions, reponses }, modules, pages) {
  const note = Math.round((score / total) * 20 * 10) / 10;
  const titres = Object.fromEntries(modules.map((m) => [m.id, m.titre]));
  const rates = {};
  questions.forEach((q, i) => { if (reponses[i] !== q.bonne) rates[q._module] = (rates[q._module] || 0) + 1; });
  const aRevoir = Object.keys(rates).map(Number).sort((a, b) => a - b);

  const chrono = zone.querySelector(".examen-chrono");
  chrono.innerHTML = `<span>Examen blanc terminé</span><span class="temps">${score} / ${total}</span>`;

  const bloc = document.createElement("section");
  bloc.className = "outil-carte";
  bloc.innerHTML = `
    <h2>Ta note</h2>
    <div class="examen-note">${String(note).replace(".", ",")} / 20</div>
    ${aRevoir.length
      ? `<p>Modules à revoir :</p>
         <ul class="liste-modules">${aRevoir.map((id) => `
           <li><span><span class="num">${id}</span><a href="${pages[id] || `niveau.html?id=${id}&libre=1`}">${titres[id]}</a></span>
           <span class="droite">${rates[id]} erreur${rates[id] > 1 ? "s" : ""}</span></li>`).join("")}</ul>`
      : `<p>Sans faute. Rien à revoir.</p>`}
    <div class="page-actions">
      <button class="bouton-plein examen-refaire" type="button">Refaire un examen blanc</button>
      ${aRevoir.length ? `<a class="bouton-creux" href="erreurs.html">Réviser mes erreurs</a>` : ""}
    </div>`;
  zone.querySelector(".examen-quiz").prepend(bloc);
  bloc.querySelector(".examen-refaire").addEventListener("click", () => { zone.innerHTML = accueil; brancherDepart(); lancer(); });
  window.scrollTo({ top: 0 });
}
