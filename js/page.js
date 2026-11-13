// Initialisation commune des pages annexes : menu.
import { brancherMenu } from "./menu.js";

brancherMenu();
const entete = document.querySelector(".entete");
if (entete) document.documentElement.style.setProperty("--entete-h", entete.offsetHeight + "px");
