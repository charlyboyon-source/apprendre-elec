// Prototype 3D : « La lumière de la chambre », une seule panne (phase desserrée sur l'interrupteur).
// On reprend l'intervention de l'atelier 2D (cliente, dialogue, tableau, liaisons) et on remplace la panne.
import chambre from "../immersif/scenarios/chambre.js";

const PANNE = {
  id: "phaseInter", visible: "fil-rouge", cible: "int-E", reparation: "serrer",
  titre: "Phase desserrée sur la borne L de l'interrupteur",
  explication: "À l'interrupteur, la borne L ne reçoit rien (0 V par rapport à la terre), alors que le bout du fil rouge, lui, donne 230 V : la phase arrive jusqu'à l'interrupteur mais ne passe pas dans la borne. Le fil était mal serré : à force d'appuyer sur la touche, il est sorti de sa borne. Avant de le remettre, on coupe le disjoncteur « Éclairage chambres » et on vérifie l'absence de tension au VAT, testé avant et après sur une source connue (la prise, qui reste alimentée par un autre disjoncteur). Un serrage qui lâche fait d'abord clignoter la lampe et peut chauffer : c'est un risque d'incendie.",
};

// réponses de Mme Martin propres à cette panne (les autres questions gardent leur réponse générale)
const REPONSES = {
  comment: "« Depuis quelques jours, la lumière clignotait quand j'appuyais sur l'interrupteur. Hier soir, plus rien du tout. »",
  inter: "« Il fait son petit clic, mais j'ai entendu grésiller derrière la plaque, la dernière fois. »",
  odeur: "« Non, rien de spécial. »",
};

// même câblage que l'atelier 2D, sauf la liaison fil rouge → borne L, coupée par la panne
const LIAISONS = chambre.liaisons.map((l) => (l.a === "DjL" && l.b === "IntE" ? { a: "DjL", b: "IntE", coupePar: "phaseInter" } : l));

export default {
  ...chambre,
  id: "chambre-3d",
  pannes: [PANNE],
  liaisons: LIAISONS,
  dialogue: { ...chambre.dialogue, questions: chambre.dialogue.questions.map((q) => (REPONSES[q.id] ? { ...q, reponse: { ...q.reponse, "*": REPONSES[q.id] } } : q)) },
  // points de mesure de la vue « interrupteur » : nœud électrique et nom
  points: {
    "int-E": { noeud: "IntE", nom: "borne L de l'interrupteur" },
    "int-S": { noeud: "IntS", nom: "borne 1 de l'interrupteur" },
    "fil-rouge": { noeud: "DjL", nom: "bout du fil rouge (phase)" },
    "prise-terre": { noeud: "PE", nom: "broche de terre de la prise" },
    "prise-d": { noeud: "PrL", nom: "alvéole droite de la prise" },
    "prise-g": { noeud: "PrN", nom: "alvéole gauche de la prise" },
  },
};
