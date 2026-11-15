// Liste des dépannages 3D, dans l'ordre. « ouvert » décide de ce qui est proposé en fin de partie
// (« Dépannage suivant »). La page d'entrée atelier-depannage.html doit dire la même chose.
export const ENTREE = "atelier-depannage.html";
export const SECOURS = "atelier-ancien.html";
export const NIVEAUX = [
  { n: 1, page: "atelier-3d.html", titre: "La lumière de la chambre", ouvert: true },
  { n: 2, page: "atelier-3d-2.html", titre: "Ça saute la nuit", ouvert: true },
  { n: 3, page: "atelier-3d-3.html", titre: "La moitié de l'appartement est morte", ouvert: true },
  { n: 4, page: "atelier-3d-4.html", titre: "Le disjoncteur saute tous les soirs", ouvert: true },
  { n: 5, page: "atelier-3d-5.html", titre: "La lumière de l'escalier ne s'éteint plus", ouvert: true },
  { n: 6, page: "atelier-3d-6.html", titre: "Ça saute dès que j'allume le couloir", ouvert: true },
];
export const suivant = (n) => NIVEAUX.find((x) => x.n > n && x.ouvert) || null;
// Les deux liens de fin de partie : le niveau suivant ouvert, puis la page d'entrée.
export function liensFin(n) {
  const s = suivant(n);
  return `${s ? `<a class="j-suite" href="${s.page}">Dépannage suivant : ${s.titre} →</a>` : ""}<a class="j-lien" href="${ENTREE}">Tous les dépannages</a>`;
}
// Proposé seulement quand la 3D ne peut pas s'afficher.
export const lienSecours = (q = "") => `<a class="j-lien" href="${SECOURS}${q}">Jouer à la version simple</a>`;
