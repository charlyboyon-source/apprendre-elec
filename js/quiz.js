// Moteur de quiz : réponses enregistrées au fil de la série,
// correction EN FIN DE SÉRIE avec renvoi vers l'écran de leçon concerné.

import { activerTermes, brancherTermes } from "./glossaire.js";

// Options :
//   onFin(score, total)     : appelé à l'affichage des résultats
//   onRevoirLecon(indexEcran) : renvoi vers la leçon depuis une erreur
export function demarrerQuiz(niveau, conteneur, { onFin, onRevoirLecon } = {}) {
  const questions = niveau.quiz;
  const reponses = Array(questions.length).fill(null);
  let index = 0;

  function rendreQuestion() {
    const q = questions[index];
    conteneur.innerHTML = `
      <div class="quiz-entete">
        <span>Question ${index + 1}/${questions.length}</span>
        <span>correction en fin de série</span>
      </div>
      <div class="quiz-rail">${questions
        .map((_, i) => `<i class="${i === index ? "courante" : reponses[i] !== null ? "faite" : ""}"></i>`)
        .join("")}</div>
      <div class="quiz-carte">
        ${q.svg ? `<div class="quiz-figure"><img src="assets/svg/${q.svg}" alt=""></div>` : ""}
        <p class="quiz-question">${activerTermes(q.question)}</p>
        <div class="quiz-choix">${q.choix
          .map((c, k) => `<button class="choix" data-k="${k}"><span class="lettre">${"ABCD"[k]}</span><span>${c}</span></button>`)
          .join("")}</div>
      </div>`;

    brancherTermes(conteneur);
    conteneur.querySelectorAll(".choix").forEach((btn) => {
      btn.addEventListener("click", () => {
        reponses[index] = Number(btn.dataset.k);
        btn.classList.add("selectionne");
        setTimeout(() => {
          if (index < questions.length - 1) { index++; rendreQuestion(); }
          else rendreResultats();
        }, 180);
      });
    });
  }

  function rendreResultats() {
    const score = reponses.reduce((s, r, i) => s + (r === questions[i].bonne ? 1 : 0), 0);
    const message =
      score >= questions.length * 0.9 ? "Excellent — ce chapitre n'a plus de secret." :
      score >= questions.length * 0.7 ? "Solide ! Revois juste les questions ratées ci-dessous." :
      "Pas grave : chaque erreur a son bouton « revoir la leçon ». C'est fait pour.";

    conteneur.innerHTML = `
      <div class="quiz-score">
        <div class="grand">${score}<small> /${questions.length}</small></div>
        <p>${message}</p>
      </div>
      <div class="quiz-resultats"></div>`;

    const liste = conteneur.querySelector(".quiz-resultats");
    questions.forEach((q, i) => {
      const ok = reponses[i] === q.bonne;
      const div = document.createElement("div");
      div.className = "resultat";
      div.innerHTML = `
        <div class="resultat-q"><span>${ok ? "✅" : "❌"}</span><span>Q${i + 1}. ${q.question}</span></div>
        <div class="resultat-x">${ok ? "" : `Ta réponse : « ${q.choix[reponses[i]]} » — `}Bonne réponse : <b>${q.choix[q.bonne]}</b><br>${q.explication}</div>
        ${ok ? "" : `<button class="revoir-lecon" data-ecran="${q.renvoi_lecon}">📖 Revoir la leçon — écran ${q.renvoi_lecon + 1}</button>`}`;
      liste.appendChild(div);
    });

    liste.querySelectorAll(".revoir-lecon").forEach((btn) => {
      btn.addEventListener("click", () => onRevoirLecon?.(Number(btn.dataset.ecran)));
    });

    onFin?.(score, questions.length);
    window.scrollTo({ top: 0 });
  }

  rendreQuestion();
}
