// Sons des jeux uniquement (Web Audio, volume bas, désactivables).
// La navigation et les gains d'électrons restent silencieux.

const CLE_SONS = "apprendre-elec-v1-sons";

let ctx = null;

export function sonsActives() {
  return localStorage.getItem(CLE_SONS) !== "off";
}

export function basculerSons() {
  localStorage.setItem(CLE_SONS, sonsActives() ? "off" : "on");
  return sonsActives();
}

function tone(freq, duree, type = "sine", gain = 0.1, delai = 0) {
  if (!sonsActives()) return;
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  vol.gain.setValueAtTime(gain, ctx.currentTime + delai);
  vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delai + duree);
  osc.connect(vol);
  vol.connect(ctx.destination);
  osc.start(ctx.currentTime + delai);
  osc.stop(ctx.currentTime + delai + duree + 0.02);
}

// "Clac" de disjoncteur
export function sonClac() {
  tone(180, 0.05, "square", 0.09);
  tone(90, 0.08, "square", 0.07, 0.04);
}

export function sonVictoire() {
  tone(523, 0.12, "sine", 0.07);
  tone(659, 0.12, "sine", 0.07, 0.1);
  tone(784, 0.2, "sine", 0.07, 0.2);
}

export function sonEchec() {
  tone(200, 0.25, "sawtooth", 0.06);
  tone(140, 0.3, "sawtooth", 0.06, 0.12);
}

// Bouton 🔊/🔇 dans le header
export function brancherBoutonSons() {
  const btn = document.querySelector(".bouton-sons");
  if (!btn) return;
  btn.textContent = sonsActives() ? "🔊" : "🔇";
  btn.addEventListener("click", () => {
    const actif = basculerSons();
    btn.textContent = actif ? "🔊" : "🔇";
    if (actif) sonClac();
  });
}
