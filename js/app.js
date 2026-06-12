// Init de l'application : header, compteur d'électrons, carte si présente.

import { majCompteurElectrons } from "./progression.js";
import { afficherCarte } from "./carte.js";

document.addEventListener("DOMContentLoaded", () => {
  majCompteurElectrons();

  const conteneurCarte = document.querySelector(".carte");
  if (conteneurCarte) afficherCarte(conteneurCarte);
});
