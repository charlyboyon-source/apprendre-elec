// Page d'un cours : le cours, puis le quiz et le jeu sur la même page.
// Étape 1 cochée quand on arrive au bout du cours ; quand les trois étapes
// sont faites pour la première fois : module suivant débloqué.
import "./page.js";
import {
  terminerNiveau, deverrouillerManuel,
  activiteFaite, marquerActivite, toutesActivitesFaites
} from "./progression.js";
import { brancherBoutonSons } from "./audio.js";
import { demarrerQuiz } from "./quiz.js";
import { remonter } from "./remonter.js";
import { demarrerJeu as jeuTrouveErreur } from "./jeux/trouve-erreur.js";
import { demarrerJeu as jeuVraiFaux } from "./jeux/vrai-faux-rapide.js";

const MOTEURS = { "trouve-erreur": jeuTrouveErreur, "vrai-faux-rapide": jeuVraiFaux };
const page = document.querySelector(".page-cours");
const id = Number(page?.dataset.module);

brancherBoutonSons();

async function init() {
  if (!id) return;
  deverrouillerManuel(id);
  const niveau = await fetch(`data/niveaux/${String(id).padStart(2, "0")}.json`).then((r) => r.json());
  majEtapes();

  // Étape 1 : on considère le cours lu quand on arrive au dernier mémo.
  const fin = document.querySelector(".cours-fin");
  if (fin && !activiteFaite(id, "lecon")) {
    const verifier = () => {
      if (fin.getBoundingClientRect().top < window.innerHeight) {
        window.removeEventListener("scroll", verifier);
        fait(niveau, "lecon");
      }
    };
    window.addEventListener("scroll", verifier, { passive: true });
  }

  // Les trois cases du haut : le cours défile jusqu'au début, le quiz et le jeu démarrent directement.
  document.querySelectorAll(".module-etape").forEach((lien) => lien.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (lien.dataset.act === "lecon") remonter(document.getElementById("cours"));
    else lancer(lien.dataset.act, niveau);
  }));

  document.querySelectorAll("[data-lancer]").forEach((b) =>
    b.addEventListener("click", () => lancer(b.dataset.lancer, niveau)));

  // Arrivée directe sur le quiz ou le jeu (depuis « Tous les quiz », un ancien lien…)
  const ancre = location.hash.slice(1);
  if (ancre === "quiz" || ancre === "jeu") lancer(ancre, niveau);
}

function lancer(act, niveau) {
  const section = document.getElementById(act);
  const zone = section.querySelector(".activite-zone");
  section.classList.add("en-cours");
  if (act === "quiz") {
    demarrerQuiz(niveau, zone, {
      onFin: () => fait(niveau, "quiz"),
      onRevoirLecon: (index) => {
        const cible = document.getElementById(`s${index + 1}`) || document.querySelector(".cours");
        remonter(cible);
      }
    });
  } else {
    MOTEURS[niveau.jeu.type](niveau.jeu.config, zone, {
      onFin: () => {
        fait(niveau, "jeu");
        zone.innerHTML = `<p>Jeu terminé ✓ Tu peux le refaire quand tu veux pour réviser.</p>
          <button class="bouton-creux" type="button" data-lancer="jeu">Rejouer</button>`;
        zone.querySelector("[data-lancer]").addEventListener("click", () => lancer("jeu", niveau));
      }
    });
  }
  remonter(section);
}

function fait(niveau, act) {
  const avant = toutesActivitesFaites(id);
  marquerActivite(id, act);
  if (!avant && toutesActivitesFaites(id)) {
    terminerNiveau(id);
    const bravo = document.querySelector(".module-bravo");
    if (bravo) bravo.hidden = false;
  }
  majEtapes();
}

function majEtapes() {
  for (const act of ["lecon", "quiz", "jeu"]) {
    const el = document.querySelector(`.module-etape[data-act="${act}"]`);
    if (el) el.classList.toggle("faite", activiteFaite(id, act));
  }
  const bravo = document.querySelector(".module-bravo");
  if (bravo && toutesActivitesFaites(id)) bravo.hidden = false;
}

init();
