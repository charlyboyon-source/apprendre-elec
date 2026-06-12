// Glossaire : transforme les [[terme]] en mots cliquables avec popover.
// Syntaxe : [[DDR]] ou [[volume de sécurité|volumes de sécurité]]
// (clé du glossaire | texte affiché).

let GLOSSAIRE = null;

export async function chargerGlossaire() {
  if (GLOSSAIRE) return GLOSSAIRE;
  const reponse = await fetch("data/glossaire.json");
  GLOSSAIRE = await reponse.json();
  return GLOSSAIRE;
}

// Remplace les [[…]] d'une chaîne HTML par des spans cliquables.
export function activerTermes(html) {
  return html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, cle, affiche) => {
    return `<span class="terme" data-terme="${cle}">${affiche || cle}</span>`;
  });
}

// À appeler après injection dans le DOM : branche les clics.
export function brancherTermes(racine = document) {
  racine.querySelectorAll(".terme").forEach((el) => {
    el.addEventListener("click", () => ouvrirPopover(el.dataset.terme));
  });
}

async function ouvrirPopover(cle) {
  const glossaire = await chargerGlossaire();
  const entree = glossaire[cle];
  if (!entree) return;

  fermerPopover();
  const fond = document.createElement("div");
  fond.className = "popover-fond";
  fond.innerHTML = `
    <div class="popover-glossaire" role="dialog" aria-modal="true">
      <h5>${entree.nom}</h5>
      <p>${entree.definition}</p>
      ${entree.niveau_associe ? `<a href="niveau.html?id=${entree.niveau_associe}">→ Voir le niveau ${entree.niveau_associe}</a>` : ""}
      <button type="button">Compris ✓</button>
    </div>`;
  fond.addEventListener("click", (e) => {
    if (e.target === fond || e.target.tagName === "BUTTON") fermerPopover();
  });
  document.body.appendChild(fond);
}

function fermerPopover() {
  document.querySelector(".popover-fond")?.remove();
}
