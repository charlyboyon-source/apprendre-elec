// Mes erreurs : liste des questions ratées, par module, et série de révision.
import "./page.js";
import { chargerModules } from "./donnees.js";
import { lireErreurs } from "./erreurs-store.js";
import { demarrerQuiz } from "./quiz.js";

const zone = document.querySelector(".erreurs-zone");
let modules = [];
let pages = {};

async function init() {
  [modules, pages] = await Promise.all([
    chargerModules(),
    fetch("data/pages-cours.json").then((r) => r.json()).catch(() => ({}))
  ]);
  afficherListe();
}

// Retrouve les questions encore présentes dans les banques (une question
// reformulée depuis ne compte plus).
function questionsRatees() {
  const erreurs = lireErreurs();
  const liste = [];
  for (const m of modules) {
    const ratees = new Set(erreurs[String(m.id)] || []);
    for (const q of m.banque) if (ratees.has(q.question)) liste.push({ ...q, _module: m.id });
  }
  return liste;
}

function afficherListe() {
  const liste = questionsRatees();
  if (!liste.length) {
    zone.innerHTML = `
      <section class="outil-carte">
        <h2>Aucune erreur enregistrée</h2>
        <p>Dès que tu rates une question dans un quiz ou dans l'examen blanc, elle arrive ici. Tu pourras la rejouer jusqu'à la réussir.</p>
        <div class="page-actions"><a class="bouton-plein" href="examen.html">Faire un examen blanc</a><a class="bouton-creux" href="index.html">Retour au parcours</a></div>
      </section>`;
    return;
  }
  const parModule = {};
  liste.forEach((q) => { parModule[q._module] = (parModule[q._module] || 0) + 1; });
  const titres = Object.fromEntries(modules.map((m) => [m.id, m.titre]));
  zone.innerHTML = `
    <section class="outil-carte">
      <h2>${liste.length} question${liste.length > 1 ? "s" : ""} à revoir</h2>
      <ul class="liste-modules">${Object.keys(parModule).map(Number).sort((a, b) => a - b).map((id) => `
        <li><span><span class="num">${id}</span><a href="${pages[id] || `niveau.html?id=${id}&libre=1`}">${titres[id]}</a></span>
        <span class="droite">${parModule[id]} question${parModule[id] > 1 ? "s" : ""}</span></li>`).join("")}</ul>
      <div class="page-actions"><button class="bouton-plein erreurs-reviser" type="button">Réviser ${Math.min(15, liste.length)} question${Math.min(15, liste.length) > 1 ? "s" : ""}</button></div>
    </section>`;
  zone.querySelector(".erreurs-reviser").addEventListener("click", () => reviser(liste));
}

function reviser(liste) {
  zone.innerHTML = `<div class="erreurs-quiz"></div>`;
  demarrerQuiz({ banque: liste }, zone.firstElementChild, {
    nb: 15,
    onFin: () => {
      const bouton = document.createElement("div");
      bouton.className = "page-actions";
      bouton.innerHTML = `<button class="bouton-plein" type="button">Voir ce qu'il me reste à revoir</button>`;
      bouton.firstElementChild.addEventListener("click", () => { afficherListe(); window.scrollTo({ top: 0 }); });
      zone.firstElementChild.prepend(bouton);
    },
    onRevoirLecon: (_section, q) => { location.href = pages[q._module] || `niveau.html?id=${q._module}&module=lecon&libre=1`; }
  });
}

init();
