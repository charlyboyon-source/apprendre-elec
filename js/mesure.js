// Mesure de fréquentation (Google Analytics 4, via la balise Google), uniquement si le visiteur accepte.
// Tant que ID est vide, rien ne se charge et aucun bandeau ne s'affiche.
const ID = "GTM-P3BHQXP6"; // balise Google de la propriété apprendre-electricite.fr
const CLE = "apprendreelec-mesure-v1"; // "oui" | "non"

function lireChoix() {
  try { return localStorage.getItem(CLE); } catch { return null; }
}
function ecrireChoix(v) {
  try { localStorage.setItem(CLE, v); } catch { /* stockage indisponible */ }
}

function chargerMesure() {
  if (!ID || window.__mesureChargee) return;
  window.__mesureChargee = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(ID);
  document.head.appendChild(s);
}

function afficherBandeau() {
  if (document.querySelector(".bandeau-mesure")) return;
  const b = document.createElement("div");
  b.className = "bandeau-mesure";
  b.setAttribute("role", "dialog");
  b.setAttribute("aria-label", "Mesure de fréquentation");
  b.innerHTML = `
    <p><strong>Compter les visites, tu es d'accord ?</strong> Le site utilise Google Analytics pour savoir combien de personnes viennent et quelles pages servent. Aucune publicité. Tu peux refuser, le site marche pareil.</p>
    <div class="bandeau-mesure-actions">
      <button type="button" data-v="non">Refuser</button>
      <button type="button" data-v="oui">Accepter</button>
    </div>`;
  b.addEventListener("click", (ev) => {
    const v = ev.target.dataset?.v;
    if (!v) return;
    ecrireChoix(v);
    b.remove();
    if (v === "oui") chargerMesure();
  });
  document.body.appendChild(b);
}

if (ID) {
  const choix = lireChoix();
  if (choix === "oui") chargerMesure();
  else if (choix !== "non") afficherBandeau();
  // Lien « Gérer les cookies » (pied de page ou mentions légales) : rouvre le bandeau.
  document.addEventListener("click", (ev) => {
    if (ev.target.closest?.("[data-gerer-mesure]")) { ev.preventDefault(); afficherBandeau(); }
  });
}
