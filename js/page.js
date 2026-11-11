// Initialisation commune des pages annexes : compteur d'électrons et menu.
import { majCompteurElectrons } from "./progression.js";
import { brancherMenu } from "./menu.js";

majCompteurElectrons();
brancherMenu();
const entete = document.querySelector(".entete");
if (entete) document.documentElement.style.setProperty("--entete-h", entete.offsetHeight + "px");
