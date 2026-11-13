// Script de la page d'accueil : en-tête, menu et carte
// du parcours. Volontairement léger : les cours, quiz et jeux ont leurs propres pages.

import { afficherCarte } from "./carte.js";
import { brancherMenu } from "./menu.js";
import { brancherBoutonSons } from "./audio.js";

document.addEventListener("DOMContentLoaded", () => {
  brancherBoutonSons();
  const entete = document.querySelector(".entete");
  if (entete) {
    const maj = () => document.documentElement.style.setProperty("--entete-h", entete.offsetHeight + "px");
    maj();
    window.addEventListener("resize", maj);
  }
  const conteneurCarte = document.querySelector(".carte");
  if (conteneurCarte) {
    afficherCarte(conteneurCarte);
    brancherMenu(() => afficherCarte(conteneurCarte));
  } else {
    brancherMenu();
  }
});
