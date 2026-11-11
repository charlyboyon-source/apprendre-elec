// Lexique : filtre les termes pendant la frappe (sans tenir compte des accents).
import "./page.js";

const champ = document.querySelector(".lexique-recherche");
const entrees = [...document.querySelectorAll(".lexique-entree")];
const vide = document.querySelector(".lexique-vide");
const normaliser = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

champ.addEventListener("input", () => {
  const q = normaliser(champ.value);
  let visibles = 0;
  for (const e of entrees) {
    const ok = !q || e.dataset.recherche.includes(q) || normaliser(e.textContent).includes(q);
    e.hidden = !ok;
    if (ok) visibles++;
  }
  vide.hidden = visibles > 0;
});
