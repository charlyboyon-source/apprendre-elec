// Confirmation partagée avant d'ouvrir un niveau verrouillé hors progression.

import { deverrouillerManuel } from "./progression.js";

// onConfirme() est appelé après le déverrouillage manuel (ex. naviguer vers le niveau).
export function demanderOuverture(niveau, onConfirme) {
  fermerDialogue();
  const fond = document.createElement("div");
  fond.className = "dialogue-fond";
  fond.innerHTML = `
    <div class="dialogue" role="dialog" aria-modal="true" aria-labelledby="dlg-titre">
      <h5 id="dlg-titre">Niveau ${niveau.id} — ${niveau.titre}</h5>
      <p>Ce niveau fait partie d'un parcours progressif. L'ouvrir quand même ?</p>
      <div class="dialogue-actions">
        <button class="dialogue-annuler" type="button">Annuler</button>
        <button class="dialogue-ouvrir" type="button">Ouvrir</button>
      </div>
    </div>`;

  fond.querySelector(".dialogue-annuler").addEventListener("click", fermerDialogue);
  fond.addEventListener("click", (e) => { if (e.target === fond) fermerDialogue(); });
  fond.querySelector(".dialogue-ouvrir").addEventListener("click", () => {
    deverrouillerManuel(niveau.id);
    fermerDialogue();
    onConfirme();
  });
  document.body.appendChild(fond);
}

export function fermerDialogue() {
  document.querySelector(".dialogue-fond")?.remove();
}
