// Accueil : le bandeau « Actualités » sur le côté (les 3 plus récentes).
const zone = document.querySelector(".accueil-actu-liste");
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const slug = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

fetch("data/actualites.json").then((r) => r.json()).then(({ actualites }) => {
  const liste = actualites.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  if (!zone || !liste.length) return;
  zone.innerHTML = liste.map((a) => {
    const [an, m, j] = a.date.split("-");
    const id = "actu-" + slug(a.titre).slice(0, 60);
    return `<a class="accueil-actu-item" href="actualites.html#${id}">
      ${a.image ? `<img src="${esc(a.image)}" alt="" loading="lazy">` : ""}
      <span><small>${esc(a.categorie)} · ${Number(j)} ${MOIS[Number(m) - 1]} ${an}</small><b>${esc(a.titre)}</b></span>
    </a>`;
  }).join("");
}).catch(() => {});
