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

// Molette de lettres sur le côté : un appui (ou un glissement du doigt) amène au premier terme de la lettre.
const molette = document.querySelector(".lexique-molette");
const bulle = document.querySelector(".lexique-bulle");
let derniere = null, glisse = false, minuterieBulle = null;

function allerA(lettre) {
  if (!lettre || lettre === derniere) return;
  const bouton = molette.querySelector(`button[data-lettre="${lettre}"]`);
  if (!bouton || bouton.disabled) return;
  derniere = lettre;
  if (champ.value) { champ.value = ""; champ.dispatchEvent(new Event("input")); }
  const cible = entrees.find((e) => e.dataset.lettre === lettre);
  if (!cible) return;
  cible.scrollIntoView({ block: "start", behavior: glisse ? "auto" : "smooth" });
  for (const b of molette.children) b.classList.toggle("actif", b === bouton);
  bulle.textContent = lettre;
  bulle.hidden = false;
  clearTimeout(minuterieBulle);
  minuterieBulle = setTimeout(() => { bulle.hidden = true; }, 700);
}

const lettreSous = (ev) => document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.(".lexique-molette button")?.dataset.lettre;

molette.addEventListener("pointerdown", (ev) => { glisse = true; derniere = null; allerA(lettreSous(ev)); });
molette.addEventListener("pointermove", (ev) => { if (glisse && ev.buttons) allerA(lettreSous(ev)); });
window.addEventListener("pointerup", () => { glisse = false; derniere = null; });
window.addEventListener("pointercancel", () => { glisse = false; derniere = null; });
// Clavier (Entrée / Espace sur une lettre)
molette.addEventListener("click", (ev) => { if (ev.detail === 0) { derniere = null; allerA(ev.target.dataset?.lettre); derniere = null; } });
