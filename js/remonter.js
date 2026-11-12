// Remonte la page juste au-dessus d'un élément (sous l'en-tête fixe).
// Sert au quiz et aux jeux, qu'ils soient seuls sur la page ou sous un cours.
export function remonter(el) {
  const entete = document.querySelector(".entete");
  const marge = (entete ? entete.offsetHeight : 0) + 12;
  const haut = el.getBoundingClientRect().top + window.scrollY - marge;
  window.scrollTo({ top: Math.max(0, haut) });
}
