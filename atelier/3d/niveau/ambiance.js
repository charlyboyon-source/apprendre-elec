// Sons d'ambiance des niveaux 2 à 6, synthétisés dans le navigateur (Web Audio) : le ronron d'un congélateur,
// la pluie. Coupés si l'utilisateur a désactivé les sons du site.
import { sonsActives } from "../../../js/audio.js";

let ctx = null;
const voies = {};
function voie(nom, fabriquer) {
  if (voies[nom]) return voies[nom];
  const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination); fabriquer(g); return (voies[nom] = g);
}
function bruitContinu(sortie, type, freq, q) {
  const n = ctx.sampleRate * 2, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  src.connect(f); f.connect(sortie); src.start();
}
// etat : { ronron, pluie, dehors }. À appeler après chaque action du joueur.
export function ambiance(etat) {
  if (!sonsActives()) { if (ctx) for (const g of Object.values(voies)) g.gain.value = 0; return; }
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const ronron = voie("ronron", (g) => { for (const [f, v] of [[50, 1], [100, 0.5], [150, 0.18]]) { const o = ctx.createOscillator(), a = ctx.createGain(); o.type = "sine"; o.frequency.value = f; a.gain.value = v; o.connect(a); a.connect(g); o.start(); } bruitContinu(g, "lowpass", 180, 0.5); });
    const pluie = voie("pluie", (g) => { bruitContinu(g, "highpass", 2400, 0.3); });
    ronron.gain.setTargetAtTime(etat.ronron ? 0.035 : 0, t, 0.25);
    pluie.gain.setTargetAtTime(etat.pluie ? (etat.dehors ? 0.05 : 0.012) : 0, t, 0.4);
  } catch { /* pas de son : le jeu continue */ }
}
