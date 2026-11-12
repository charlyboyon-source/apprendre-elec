// Sons de l'atelier (Web Audio, synthétisés, volume bas). Coupés si l'utilisateur a désactivé les sons.
import { sonsActives } from "../../js/audio.js";

let ctx = null;
function audio() {
  if (!sonsActives()) return null;
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}
function ton(freq, duree, type = "sine", gain = 0.08, delai = 0) {
  const c = audio(); if (!c) return;
  const o = c.createOscillator(), v = c.createGain();
  o.type = type; o.frequency.value = freq;
  v.gain.setValueAtTime(gain, c.currentTime + delai);
  v.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + delai + duree);
  o.connect(v); v.connect(c.destination);
  o.start(c.currentTime + delai); o.stop(c.currentTime + delai + duree + 0.03);
}
function bruit(duree, gain = 0.12, freqFiltre = 2000, delai = 0) {
  const c = audio(); if (!c) return;
  const n = Math.floor(c.sampleRate * duree);
  const buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freqFiltre;
  const v = c.createGain(); v.gain.value = gain;
  src.connect(f); f.connect(v); v.connect(c.destination);
  src.start(c.currentTime + delai);
}
export const sons = {
  interrupteur() { bruit(0.03, 0.25, 3500); ton(1800, 0.02, "square", 0.03); },
  disjoncteur() { bruit(0.05, 0.35, 900); ton(120, 0.08, "square", 0.06, 0.01); },
  bip() { ton(2400, 0.07, "square", 0.025); },
  vis() { for (let i = 0; i < 5; i++) bruit(0.02, 0.18, 4200, i * 0.07); },
  clip() { bruit(0.04, 0.3, 2600); bruit(0.03, 0.2, 1800, 0.06); },
  zap() { bruit(0.35, 0.5, 600); ton(50, 0.4, "sawtooth", 0.12); ton(100, 0.3, "square", 0.06); },
  alarme() { [0, 0.18, 0.36].forEach((t) => ton(3000, 0.12, "square", 0.04, t)); },
  succes() { ton(523, 0.12, "sine", 0.06); ton(659, 0.12, "sine", 0.06, 0.1); ton(784, 0.25, "sine", 0.06, 0.2); },
  rate() { ton(220, 0.2, "triangle", 0.06); ton(180, 0.25, "triangle", 0.05, 0.12); },
};
