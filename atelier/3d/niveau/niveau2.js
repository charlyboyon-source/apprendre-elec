// Niveau 2 — « Ça saute la nuit » : la maison de Mme Roux et son jardin.
// Quatre causes possibles, une seule par partie. Le logement est câblé dans ../moteur/logements/maison-jardin.js.
import { maisonJardin, causesMaison, cadranMaison, reperesMaison as F } from "../moteur/logements/maison-jardin.js";
import { heureFr } from "./coeur.js";

const retard = (P) => ((P.e.env.heure - P.e.cadrans.horloge + 24) % 24);
const isoFaite = (P) => P.carnet.mesures.some((m) => m.startsWith("Isolement"));

export default {
  id: "niveau2", numero: 2, titre: "Ça saute la nuit", page: "atelier-3d-2.html",
  logement: maisonJardin, causes: causesMaison,
  preparer(e, cause) { e.cadrans.horloge = cadranMaison[cause]; },
  nomsDifferentiels: { ID1: "de la rangée du haut", ID2: "de la rangée du bas" },
  nomsBornes: {
    "horloge.1": "entrée du contact de l'horloge", "horloge.2": "sortie du contact de l'horloge (départ vers l'allée)", "bt.PE": "bornier de terre du tableau",
    "kc.1": "entrée du contacteur heures creuses", "kc.2": "sortie du contacteur (départ vers le chauffe-eau)",
  },
  outils: ["vat", "multi", "iso"],
  client: { nom: "Mme Roux", court: "Mme Roux", initiales: "MR", teinte: "#7a5ea8", role: "Retraitée · maison de plain-pied avec jardin" },
  accroche: "« Bonjour, entrez. Le matin je me lève et il n'y a plus de courant dans la moitié de la maison. Je remonte le gros bouton et ça repart. C'est surtout quand il pleut, je crois. J'ai perdu tout mon congélateur la semaine dernière. »",
  mission: "Trouve pourquoi le courant saute la nuit chez Mme Roux, prouve-le par une mesure, et remets l'installation en sécurité.",
  depart: "entree",
  pitch: "Fin d'après-midi, temps sec. Mme Roux t'attend devant sa maison de plain-pied : depuis une semaine, la moitié de la maison se retrouve sans courant au petit matin.",
  entrer: "Entrer chez Mme Roux",
  debut: "Mme Roux retourne au séjour. Le tableau est devant toi. À toi de chercher : le carnet note tout ce que tu constates.",
  // le plan des lieux : ce qu'on voit, et où
  plan: {
    tableau: { extras: { ID2: ["horloge", "kc"] } },
    lieux: {
      entree: { nom: "l'entrée", court: "L'entrée", raccourci: "Entrée", taille: [4.2, 3], sol: "bois", camera: [0.1, 1.62, 1.05], objets: [
        { t: "tableau", mur: "N", u: 0.9, y: 1.55 }, { t: "inter", id: "int_entree", mur: "N", u: -0.3, y: 1.1 }, { t: "plafonnier", id: "pl_entree" }, { t: "boite", id: "bd_ecl", mur: "N", u: 1.85, y: 2.2 },
        { t: "prise", id: "pc_entree", mur: "O", u: 0.3, y: 0.35 }, { t: "porte", vers: "sejour", mur: "E", u: 0.3, y: 1.025 }, { t: "porte", vers: "cellier", mur: "O", u: -0.9, y: 1.025 },
        { t: "porteEntree", mur: "N", u: -1.15, y: 0 }, { t: "portemanteau", mur: "O", u: 1.0, y: 1.74 }, { t: "chaussures", mur: "O", u: 1.0, y: 0 },
        { t: "tapis", x: 0.2, z: 0.35, w: 1.9, d: 1.1, couleurs: ["#2f3f55", "#d9c9a3", "#6b2a26"] },
        { t: "modele", f: "ClassicConsole_01", x: 1.86, z: -0.8, r: -Math.PI / 2, s: 0.75, avec: [
          { t: "cles", x: -0.36, y: 0.715, z: 0.04 }, { t: "courrier", x: -0.05, y: 0.715, z: 0.02 }, { t: "modele", f: "standing_picture_frame_01", x: 0.38, y: 0.715, z: -0.04, r: -0.3 }, { t: "modele", f: "potted_plant_04", x: 0.2, y: 0.715, z: 0.04 } ] },
        { t: "modele", f: "ornate_mirror_01", mur: "E", u: -0.8, y: 1.52, auMur: true, s: 1.35 }, { t: "modele", f: "hanging_picture_frame_01", mur: "E", u: 1.15, y: 1.55, auMur: true, s: 0.7 },
        { t: "modele", f: "potted_plant_01", x: 1.5, z: -1.18 }, { t: "modele", f: "fancy_picture_frame_01", mur: "N", u: 0.22, y: 1.68, auMur: true, s: 0.75 } ] },
      sejour: { nom: "le séjour", court: "Le séjour", raccourci: "Séjour", taille: [5, 4.2], sol: "bois", camera: [1.75, 1.62, 1.75], yaw: 0.62, pitch: -0.24, objets: [
        { t: "inter", id: "int_sejour", mur: "O", u: -0.2, y: 1.1 }, { t: "plafonnier", id: "pl_sejour" }, { t: "prise", id: "pc_sejour1", mur: "N", u: -1.3, y: 0.78 }, { t: "prise", id: "pc_sejour2", mur: "N", u: 1.6, y: 0.35 },
        { t: "porte", vers: "entree", mur: "O", u: 1.2, y: 1.025 }, { t: "porte", vers: "cuisine", mur: "E", u: -1.2, y: 1.025 }, { t: "porte", vers: "terrasse", mur: "S", u: 0.9, y: 1.025 },
        { t: "fenetre", mur: "N", u: 0.9, y: 1.45, w: 1.15, h: 1.15 },
        { t: "tapis", x: -0.6, z: -0.55, w: 2.7, d: 1.9 },
        { t: "modele", f: "modern_wooden_cabinet", x: -1.15, z: -1.83, e: [0.8, 1, 1], avec: [
          { t: "tele", id: "television", x: 0.42, y: 0.68, z: -0.02 }, { t: "lampe", id: "lampe_appoint", x: -0.75, y: 0.68, z: 0, ry: 0.5 }, { t: "modele", f: "ceramic_vase_01", x: -0.42, y: 0.68, z: 0.05, s: 0.8 } ] },
        { t: "modele", f: "sofa_03", x: -0.6, z: 0.3, r: Math.PI, avec: [ { t: "modele", f: "throw_pillows_01", x: -0.7, y: 0.47, z: -0.05, s: 0.8 }, { t: "plaid", x: 1.22, y: 0.7, z: 0.1, r: Math.PI / 2 } ] },
        { t: "modele", f: "modern_coffee_table_01", x: -0.6, z: -0.75, r: Math.PI / 2, avec: [
          { t: "modele", f: "tea_set_01", x: 0, y: 0.39, z: 0.3, s: 0.45 }, { t: "livre", x: 0.05, y: 0.39, z: -0.22, r: 0.3 }, { t: "telecommande", x: -0.13, y: 0.39, z: -0.02, r: -0.4 }, { t: "modele", f: "potted_plant_04", x: 0, y: 0.39, z: -0.47 } ] },
        { t: "modele", f: "ArmChair_01", x: 1.95, z: -0.85, r: -Math.PI / 2 - 0.35 }, { t: "lampadaire", id: "lampadaire", x: 2.2, z: -1.75 },
        { t: "modele", f: "wooden_bookshelf_worn", x: 2.2, z: 0.75, r: -Math.PI / 2, avec: [
          { t: "livres", y: 0.39, w: 1.1, z: 0.02, g: 0 }, { t: "livres", y: 0.67, w: 1.1, z: 0.02, g: 3 }, { t: "modele", f: "book_encyclopedia_set_01", x: -0.3, y: 0.96, z: 0.02 }, { t: "livres", x: 0.3, y: 0.96, w: 0.5, z: 0.02, g: 5, n: 10 },
          { t: "livres", y: 1.28, w: 0.7, x: -0.2, z: 0.02, g: 1, n: 14 }, { t: "modele", f: "standing_picture_frame_01", x: 0.4, y: 1.28, z: 0.05, r: -0.3 }, { t: "modele", f: "ceramic_vase_01", x: -0.35, y: 1.66, z: 0.03, s: 0.7 }, { t: "modele", f: "wicker_basket_02", x: 0.25, y: 1.66, z: 0.02 },
          { t: "modele", f: "wicker_basket_01", x: -0.3, y: 0.11, z: 0.05, s: 1.5 }, { t: "livres", x: 0.3, y: 0.11, w: 0.5, z: 0.02, g: 2, n: 9 } ] },
        { t: "modele", f: "hanging_picture_frame_02", mur: "N", u: -1.2, y: 1.8, auMur: true }, { t: "modele", f: "wall_clock", mur: "N", u: 2.15, y: 1.95, auMur: true },
        { t: "modele", f: "hanging_picture_frame_01", mur: "O", u: -1.25, y: 1.6, auMur: true, s: 0.8 }, { t: "modele", f: "fancy_picture_frame_01", mur: "E", u: 0.75, y: 2.25, auMur: true, s: 0.6 },
        { t: "modele", f: "potted_plant_01", x: -2.1, z: 1.7 } ] },
      cuisine: { nom: "la cuisine", court: "La cuisine", raccourci: "Cuisine", taille: [3.2, 3], sol: "carrelage", camera: [0.4, 1.62, 1.05], objets: [
        { t: "inter", id: "int_cuisine", mur: "O", u: 0.2, y: 1.1 }, { t: "plafonnier", id: "pl_cuisine" },
        { t: "prise", id: "pc_cuisine1", mur: "N", u: -1.3, y: 1.15 }, { t: "prise", id: "pc_cuisine2", mur: "N", u: 0.1, y: 1.15 }, { t: "prise", id: "pc_cuisine3", mur: "N", u: 1.3, y: 1.15 }, { t: "prise", id: "pc_cuisine4", mur: "E", u: -0.3, y: 1.15 },
        { t: "porte", vers: "sejour", mur: "O", u: -1.0, y: 1.025 },
        { t: "cuisine", mur: "N", u: 0, y: 0, x0: -1.6, segments: [{ k: "bas", w: 0.6, haut: true }, { k: "evier", w: 0.8 }, { k: "tiroirs", w: 0.6, haut: true }, { k: "vide", w: 0.55, hotte: true }, { k: "bas", w: 0.65, haut: true }] },
        { t: "fenetre", mur: "N", u: -0.6, y: 1.8, w: 0.7, h: 0.55, rideaux: false },
        { t: "modele", f: "electric_stove", id: "plaque", x: 0.675, z: -1.17, s: 1.05, zone: [0.55, 0.95, 0.7], voyant: [0.2, 0.8, 0.345] },
        { t: "bouilloire", id: "bouilloire", x: -1.3, y: 0.92, z: -1.2, ry: 0.4 }, { t: "cafetiere", id: "cafetiere", x: 0.1, y: 0.92, z: -1.2 }, { t: "microondes", id: "micro_ondes", x: 1.28, y: 0.92, z: -1.2 },
        { t: "modele", f: "pot_enamel_01", x: -0.33, y: 0.93, z: -1.2 }, { t: "modele", f: "wooden_bowl_02", x: -0.3, y: 0.92, z: -1.02, s: 1.4 }, { t: "modele", f: "jug_01", x: -0.12, y: 0.92, z: -1.3, r: 0.6 }, { t: "modele", f: "brass_pan_01", x: 0.6, y: 0.905, z: -1.2, r: 0.5 },
        { t: "torchon", x: 0.675, y: 0.62, z: -0.82 },
        { t: "frigo", id: "refrigerateur", x: 1.28, z: 0.6, r: -Math.PI / 2 },
        { t: "modele", f: "dining_table", x: -1.1, z: -0.05, r: Math.PI / 2, e: [0.467, 0.93, 0.5], avec: [ { t: "modele", f: "wooden_bowl_02", x: 0.1, y: 0.755, z: 0, s: 2.2 }, { t: "modele", f: "tea_set_01", x: -0.25, y: 0.755, z: 0.05, s: 0.4 } ] },
        { t: "modele", f: "dining_chair_02", x: -0.52, z: -0.32, r: -Math.PI / 2 }, { t: "modele", f: "dining_chair_02", x: -0.5, z: 0.25, r: -Math.PI / 2 - 0.25 },
        { t: "cadreTexte", mur: "E", u: -0.85, y: 1.6, titre: "NOVEMBRE" } ] },
      cellier: { nom: "le cellier", court: "Le cellier", raccourci: "Cellier", taille: [2.8, 3], sol: "beton", camera: [-0.15, 1.62, 1.1], yaw: -0.12, objets: [
        { t: "inter", id: "int_cellier", mur: "E", u: 0.2, y: 1.1 }, { t: "plafonnier", id: "pl_cellier" },
        { t: "ballon", id: "chauffe_eau", mur: "N", u: 0.3, y: 1.55 }, { t: "boite", id: "sc_ce", mur: "N", u: 0.78, y: 0.95, w: 0.09, h: 0.09 },
        { t: "congelateur", id: "congelateur", x: -0.82, z: -1.19 }, { t: "prise", id: "pc_congelateur", mur: "N", u: -0.82, y: 1.2 },
        { t: "prise", id: "pc_cellier", mur: "O", u: -0.6, y: 1.15 }, { t: "prise", id: "pc_lavelinge", mur: "O", u: 0.45, y: 1.15 }, { t: "lavelinge", id: "lavelinge", x: -1.1, z: -0.45, r: Math.PI / 2 },
        { t: "etagereChargee", x: 1.17, z: -0.92, r: -Math.PI / 2 },
        { t: "modele", f: "wicker_basket_02", x: -1.1, z: 0.6, h: 0.45, e: [0.62, 1, 0.62], avec: [{ t: "linge", y: 0.4 }] }, { t: "balai", x: 0.6, z: -1.42, r: 0 }, { t: "modele", f: "wooden_bucket_01", x: -1.05, z: 1.05, h: 0.36 },
        { t: "modele", f: "cardboard_box_01", x: 1.05, z: -0.15, r: 0.3 }, { t: "modele", f: "plastic_crate_02", x: -0.3, z: -1.25, r: 0.1 },
        { t: "porte", vers: "entree", mur: "E", u: 0.9, y: 1.025 } ] },
      terrasse: { nom: "la terrasse", court: "La terrasse", raccourci: "Terrasse", ext: true, taille: [7, 4], sol: "herbe", dalle: [7, 4, 0, "patio_tiles"], camera: [0.3, 1.62, 1.75], objets: [
        { t: "mur", mur: "N", u: 0, y: 0, w: 9, h: 3 }, { t: "facade", mur: "N", u: 0, y: 0, w: 9, h: 3 }, { t: "porte", vers: "sejour", mur: "N", u: 1.8, y: 1.025, facade: true },
        { t: "fenetre", mur: "N", u: 0.45, y: 1.55, w: 1.15, h: 1.15, rideaux: false },
        { t: "prise", id: "pc_terrasse", mur: "N", u: -0.3, y: 1.0 }, { t: "boite", id: "bd_mur", mur: "N", u: -1.7, y: 0.3, ext: (P) => P.cause !== "A", eau: (P) => P.cause === "A" },
        { t: "porte", vers: "allee", mur: "S", u: 0, y: 1.025 },
        { t: "modele", f: "outdoor_table_chair_set_01", x: 2.45, z: 0.45, r: 0.35 },
        { t: "modele", f: "planter_box_01", x: 0.45, z: -1.75, avec: [{ t: "modele", f: "potted_plant_04", x: -0.26, y: 0.22, s: 1.9 }, { t: "modele", f: "potted_plant_04", x: 0, y: 0.22, s: 2.2, r: 1 }, { t: "modele", f: "potted_plant_04", x: 0.26, y: 0.22, s: 1.8, r: 2 }] },
        { t: "modele", f: "planter_box_02", x: 2.95, z: -1.72, avec: [{ t: "modele", f: "potted_plant_01", x: -0.3, y: 0.05, h: 0.75 }, { t: "modele", f: "potted_plant_01", x: 0.3, y: 0.05, h: 0.9, r: 2 }] }, { t: "modele", f: "planter_pot_clay", x: 1.15, z: -1.75, s: 1.6, avec: [{ t: "modele", f: "potted_plant_04", y: 0.22, s: 2.4 }] },
        { t: "herbe", x: 0, z: 2.35, w: 7.5, d: 0.5, n: 260 }, { t: "herbe", x: -3.9, z: 0.3, w: 0.7, d: 4.5, n: 220 }, { t: "herbe", x: 3.9, z: 0.3, w: 0.7, d: 4.5, n: 220 }, { t: "modele", f: "planter_pot_clay", x: -2.6, z: 1.1, s: 2 },
        { t: "modele", f: "garden_hose_wall_mounted_01", mur: "N", u: -3.0, y: 0.95, auMur: true }, { t: "modele", f: "rusted_spade_01", x: -2.3, z: -1.86, rx: -0.14, r: 0.2 },
        { t: "modele", f: "watering_can_metal_01", x: -1.15, z: -1.7, r: 0.8 }, { t: "modele", f: "garden_gloves_01", x: -1.4, y: 0.04, z: -1.5, r: 0.5 }, { t: "modele", f: "garden_gnome", x: 3.9, z: 0.9, r: -0.7 },
        { t: "modele", f: "calathea_orbifolia_01", x: 4.0, z: -0.8, r: Math.PI / 2, sansOmbre: true },
        { t: "haie", x: -4.6, z: 1.5, r: Math.PI / 2, w: 8 }, { t: "haie", x: 4.9, z: 1.5, r: Math.PI / 2, w: 8 }, { t: "cloture", x: -2.9, z: 5.5, w: 4.6 }, { t: "cloture", x: 2.9, z: 5.5, w: 4.6 },
        { t: "flaques", liste: [[-0.7, 0.7, 0.5, 0.3], [1.5, 1.2, 0.36, 0.22], [2.7, -0.4, 0.28, 0.4], [-2.9, -1.2, 0.3, 0.2]], y: 0.043 } ] },
      allee: { nom: "l'allée du jardin", court: "L'allée", raccourci: "Allée", ext: true, taille: [4, 10], sol: "herbe", dalle: [1.1, 10, 0, "gravel_floor"], camera: [0, 1.62, 4.2], pitch: -0.2, objets: [
        { t: "borne", id: "borne1", x: 0.85, z: 2.4 }, { t: "borne", id: "borne2", x: 0.85, z: 0.2, buee: (P) => P.cause === "B" }, { t: "borne", id: "borne3", x: 0.85, z: -2.0 },
        { t: "bordure", x: 0.6, z: 0, l: 9.6 }, { t: "bordure", x: -0.6, z: 0, l: 9.6 }, { t: "terre", x: 1.05, z: 3.5, si: (P) => P.cause === "C" }, { t: "portillon", x: 0, z: -4.7 },
        { t: "haie", x: -2.1, z: 0, r: Math.PI / 2, w: 9.8 }, { t: "haie", x: 2.6, z: 0, r: Math.PI / 2, w: 9.8 }, { t: "cloture", x: -1.65, z: -4.7, w: 2.0, h: 1.2 }, { t: "cloture", x: 1.75, z: -4.7, w: 2.2, h: 1.2 },
        { t: "modele", f: "planter_box_02", x: -1.25, z: 1.6, r: Math.PI / 2, avec: [{ t: "modele", f: "potted_plant_01", x: -0.3, y: 0.05, h: 0.8 }, { t: "modele", f: "potted_plant_04", x: 0.25, y: 0.24, s: 2.4 }] },
        { t: "herbe", x: -0.95, z: 0, w: 0.6, d: 9.6, n: 520 }, { t: "herbe", x: 1.35, z: 0, w: 1.4, d: 9.6, n: 700 }, { t: "herbe", x: -1.6, z: 0, w: 0.5, d: 9.6, n: 380 }, { t: "modele", f: "garden_gnome", x: -1.05, z: -0.9, r: 0.9 }, { t: "modele", f: "fern_02", x: 1.5, z: -1.0, sansOmbre: true }, { t: "modele", f: "calathea_orbifolia_01", x: -1.3, z: -3.0, r: 1.2, sansOmbre: true },
        { t: "modele", f: "planter_pot_clay", x: 1.5, z: 3.6, s: 2 },
        { t: "flaques", liste: [[0.05, 2.9, 0.33, 0.5], [-0.15, -0.6, 0.28, 0.45], [0.2, -3.1, 0.3, 0.3]], y: 0.043 },
        { t: "porte", vers: "terrasse", mur: "S", u: 0, y: 1.025 } ] },
    },
    ronrons: [{ lieu: "cellier", id: "congelateur" }],
  },
  commutables: ["television", "lampadaire", "lampe_appoint", "bouilloire", "cafetiere", "micro_ondes", "plaque"],
  questions: [
    { id: "quoi", texte: "Qu'est-ce qui ne marche plus quand ça saute ?", reponse: () => "« Le congélateur, la prise de la terrasse, les lumières de l'allée… et je n'ai plus d'eau chaude. Le reste de la maison marche. »" },
    { id: "heure", texte: "À quelle heure ça saute ?", reponse: () => "« Je ne sais pas, je dors ! Je le vois le matin. À sept heures, en me levant, je remonte le gros bouton du bas. »" },
    { id: "pluie", texte: "Il a plu chaque fois ?", reponse: (P) => (P.cause === "D" ? "« Samedi et dimanche, oui. Mardi… non, mardi il faisait beau, et ça a sauté quand même. »" : "« Oui, je crois bien. Les trois fois, il avait plu dans la soirée. »") },
    { id: "travaux", texte: "Quelqu'un a travaillé dehors récemment ?", reponse: () => "« Le jardinier a refait la bordure de l'allée il y a quinze jours. »" },
    { id: "jour", si: (P) => P.vus.has("indice:horloge"), texte: "Les lampes de l'allée, vous les avez vues allumées en plein jour ?", reponse: (P) => (P.cause === "D" ? "« Non, je n'ai rien remarqué. »" : "« Tiens, oui ! L'autre matin elles étaient allumées en plein jour. J'ai trouvé ça bizarre. »") },
    { id: "age", texte: "L'installation a été modifiée ?", reponse: () => "« Non. Le chauffe-eau a douze ans. L'éclairage de l'allée, c'est mon mari qui l'avait posé. »" },
  ],
  fragiles: { congelateur: { apres: 90, reproche: "« Dites… mon congélateur est sans courant depuis un bon moment. Je ne veux pas tout reperdre. »", conseil: "On prévient le client avant de couper un circuit qui alimente un congélateur, et on ne le laisse pas longtemps sans courant." } },
  // ce qu'on voit en regardant (avant toute mesure)
  regards: {
    horloge(P) { const r = retard(P), h = Math.round(r * 60); return h < 5 ? { texte: `L'horloge de l'allée est à l'heure : ${heureFr(P.e.cadrans.horloge)}.`, valeur: P.e.cadrans.horloge }
      : { texte: `L'horloge de l'allée affiche ${heureFr(P.e.cadrans.horloge)}. Ta montre dit ${heureFr(P.e.env.heure)}.`, valeur: P.e.cadrans.horloge, indice: `L'horloge de l'allée retarde de ${Math.floor(h / 60)} h ${String(h % 60).padStart(2, "0")} : elle n'a pas de réserve de marche, elle s'arrête quand le courant est coupé.` }; },
    bd_mur: (P) => (P.cause === "A" ? { texte: "Boîte de dérivation au pied du mur : couvercle mal fermé, traces de calcaire. C'est un modèle prévu pour l'intérieur.", indice: "La boîte au pied du mur de la terrasse est un modèle d'intérieur, couvercle mal fermé, traces de calcaire." } : { texte: "Boîte de dérivation au pied du mur : modèle d'extérieur, couvercle bien fermé." }),
    borne2: (P) => (P.cause === "B" ? { texte: "Borne 2 : il y a de la buée sous le verre.", indice: "Borne 2 de l'allée : de la buée sous le verre." } : { texte: "Borne 2 : verre propre et sec." }),
    borne1: (P) => (P.cause === "C" ? { texte: "Borne 1 : la terre a été fraîchement retournée le long de la bordure, juste devant.", indice: "Terre fraîchement retournée le long de la bordure, entre la terrasse et la borne 1." } : { texte: "Borne 1 : rien de particulier." }),
    borne3: () => ({ texte: "Borne 3 : rien de particulier." }),
    compteur: (P) => { const hc = P.inst.heuresCreuses(P.e); return { texte: `Compteur communicant : il affiche « ${hc ? "heures creuses" : "heures pleines"} ». Son contact C1-C2 est ${hc ? "fermé" : "ouvert"} : c'est lui qui commande le contacteur du chauffe-eau (heures creuses de 23 h à 7 h).` }; },
  },
  ouvertures: {
    bd_mur: (P) => (P.cause === "A" ? { texte: "Tu ouvres la boîte : il y a de l'eau au fond, les connexions baignent dedans.", type: "alerte", indice: "De l'eau dans la boîte de dérivation au pied du mur." } : { texte: "Tu ouvres la boîte : c'est sec et propre. Trois bornes : phase, neutre, terre ; un câble arrive de la maison, un autre part sous terre vers l'allée." }),
    borne2: (P) => (P.cause === "B" ? { texte: P.e.env.pluie ? "Tu ouvres la borne 2 : de l'eau a coulé le long du câble jusqu'aux bornes. Le presse-étoupe est fendu." : "Tu ouvres la borne 2 : c'est sec, mais il y a des traces blanches sous le presse-étoupe, qui est fendu.", type: "alerte", indice: "Borne 2 : presse-étoupe fendu, traces d'eau à l'intérieur." } : { texte: "Tu ouvres la borne 2 : c'est sec et propre." }),
  },
  essais: {
    congelateur: (ok) => (ok ? "Le congélateur ronronne, son voyant vert est allumé." : "Le congélateur est silencieux, voyant éteint : il n'a plus de courant."),
    chauffe_eau: (ok, P) => (ok ? "Le chauffe-eau chauffe : son voyant est allumé." : `Le chauffe-eau ne chauffe pas en ce moment${P.inst.heuresCreuses(P.e) ? "" : " : il ne marche qu'en heures creuses, de 23 h à 7 h chez Mme Roux"}.`),
  },
  soir: { heure: 18.75, texte: "« Vous revoilà ! Il s'est mis à pleuvoir en fin d'après-midi. » Il est 18 h 45, il fait nuit. Tu allumes ta lampe frontale." },
  attente(P) { const r = P.calc(); return r.allume("borne1") ? "Les bornes de l'allée sont allumées." : r.fonctionne("chauffe_eau") ? "Le chauffe-eau est en chauffe." : ""; },
  // indice en trois crans : la méthode, la zone, la mesure. Jamais la cause.
  indices(P) {
    const methode = "Un interrupteur différentiel qui déclenche, c'est du courant qui fuit vers la terre sur l'un des circuits de sa rangée. Cherche d'abord QUEL circuit, puis OÙ sur ce circuit. Et demande-toi à quelle heure ça saute : qu'est-ce qui se met en marche à ce moment-là ?";
    let zone, mesure;
    if (!P.vus.has("indice:horloge")) { zone = "Ouvre le tableau, dans l'entrée, et regarde l'horloge de l'allée sur la rangée du bas : compare-la à ta montre."; mesure = "L'horloge s'est arrêtée à la coupure et Mme Roux a réarmé à 7 h : son retard te donne l'heure à laquelle ça a sauté."; }
    else if (!isoFaite(P)) { zone = "Reste au tableau, rangée du bas : cinq départs. Lequel fuit ?"; mesure = "Baisse un disjoncteur de la rangée du bas, prends le mesureur d'isolement, et mesure entre la sortie phase du départ et le bornier de terre. Attention à ce qui se trouve après l'horloge et après le contacteur : mesure en aval de leur contact."; }
    else if (!P.preuves.length && P.cause === "D") { zone = "Va voir dans le cellier, à la sortie de câble du chauffe-eau."; mesure = "Disjoncteur du chauffe-eau baissé et absence de tension vérifiée, ouvre la sortie de câble et mesure l'isolement entre la phase et la terre. Puis débranche le cordon de l'appareil pour savoir de quel côté est le défaut."; }
    else if (!P.preuves.length && !P.soir && P.cause === "B") { zone = "De jour et par temps sec, tout est bon. Le défaut n'existe peut-être que dans les conditions où ça saute."; mesure = "Choisis « Revenir ce soir ». Quand ça saute pour de bon : baisse tous les disjoncteurs de la rangée, réarme le différentiel, remonte-les un par un."; }
    else if (!P.preuves.length) { zone = "Dehors : la boîte de dérivation au pied du mur de la terrasse permet de couper le circuit de l'allée en deux."; mesure = "Circuit coupé et absence de tension vérifiée, ouvre la boîte, débranche le fil qui part vers l'allée, et mesure l'isolement de chaque côté. Recommence plus loin, borne par borne, sur le côté qui fuit."; }
    else { zone = "Tu as ta preuve dans le carnet."; mesure = "Touche « J'ai trouvé » et choisis ce que tu fais pour que ça ne saute plus."; }
    return [methode, zone, mesure];
  },
  diagnostics: [
    { id: "A", texte: "La boîte de dérivation au pied du mur prend l'eau", non: "« La boîte du mur ? Vous l'avez mesurée ? Parce que mon mari l'avait changée… » Ce n'est pas ça." },
    { id: "B", texte: "L'eau entre dans la borne 2 de l'allée quand il pleut", non: "« La deuxième borne ? Elle éclaire très bien, pourtant. » Ce n'est pas ça." },
    { id: "C", texte: "Le câble enterré entre la boîte et la borne 1 est abîmé", non: "« Le câble sous la terre ? Comment vous le savez ? » Tu n'as rien qui le prouve : ce n'est pas ça." },
    { id: "D", texte: "Le chauffe-eau a un défaut d'isolement", non: "« Le chauffe-eau ? Mais il chauffe très bien ! » Ce n'est pas ça." },
    { id: "congelateur", texte: "Le congélateur fait sauter le courant", non: "« Il est neuf, je l'ai racheté la semaine dernière… » Le congélateur subit la coupure, il ne la cause pas." },
    { id: "differentiel", texte: "L'interrupteur différentiel est trop sensible", non: "Un interrupteur différentiel 30 mA qui déclenche fait son travail : il y a une fuite quelque part. Ce n'est pas lui." },
  ],
  remedes: [
    { id: "boite", pour: ["A"], repare: true, texte: "Remplacer la boîte par un modèle prévu pour l'extérieur et refaire les connexions", fait: "Tu remplaces la boîte par un modèle prévu pour l'extérieur, tu refais les connexions et tu vérifies l'isolement. La nuit suivante, sous la pluie, le différentiel tient.", non: "Ça ne répond pas à ce que tu as trouvé." },
    { id: "presse", pour: ["B"], repare: true, texte: "Remplacer le presse-étoupe de la borne 2, sécher, refermer", fait: "Tu remplaces le presse-étoupe de la borne 2, tu sèches, tu refermes et tu vérifies l'isolement. La nuit suivante, sous la pluie, le différentiel tient.", non: "Ça ne répond pas à ce que tu as trouvé." },
    { id: "hs_allee", pour: ["C"], horsService: "Q8", texte: "Mettre « Éclairage allée » hors service (disjoncteur baissé, étiquette) et proposer de remplacer le câble enterré", fait: "Un câble enterré entaillé ne se « rebranche » pas. Tu laisses « Éclairage allée » hors service, disjoncteur baissé et étiqueté, et tu proposes le remplacement du tronçon enterré. Le reste de la maison ne saute plus : c'est ça, le dépannage.", non: "Ici, ça se répare sur place : inutile de priver Mme Roux de son éclairage." },
    { id: "hs_ce", pour: ["D"], horsService: "Q9", texte: "Laisser le chauffe-eau hors service et expliquer qu'il faut le réparer ou le remplacer", fait: "Tu laisses le chauffe-eau hors service, disjoncteur baissé et étiqueté, et tu expliques à Mme Roux que l'appareil doit être réparé ou remplacé. Le différentiel tient toute la nuit.", non: "Le chauffe-eau n'y est pour rien." },
    { id: "ruban", pour: [], texte: "Refaire l'isolant du câble enterré avec du ruban adhésif", non: "Du ruban adhésif sous terre ne tient pas et n'est pas étanche : le défaut reviendra à la première pluie." },
    { id: "moins_sensible", pour: [], texte: "Remplacer l'interrupteur différentiel 30 mA par un modèle moins sensible", non: "Jamais. Le 30 mA protège les personnes : on cherche la fuite, on ne rend pas le différentiel aveugle." },
  ],
  explications: {
    A: "La boîte de dérivation au pied du mur de la terrasse est un modèle d'intérieur : l'eau y entre et y reste. Tant que l'allée est éteinte, la phase n'arrive pas dans la boîte. Le soir, l'horloge allume l'allée : le courant fuit par l'eau vers la terre et l'interrupteur différentiel de la rangée déclenche.",
    B: "Le presse-étoupe de la borne 2 est fendu. Par temps sec, tout est normal et toutes les mesures sont bonnes. Quand il pleut, l'eau coule jusqu'aux bornes : le courant fuit vers la terre dès que l'horloge allume l'allée.",
    C: "Le câble enterré entre la boîte et la borne 1 a été entaillé par une bêche quand la bordure a été refaite. Dans la terre mouillée, son isolant ne tient plus : le courant fuit vers la terre dès que l'allée s'allume.",
    D: "La résistance du chauffe-eau a un défaut d'isolement. Le jour, le contacteur heures creuses est ouvert : rien ne se passe. À 23 h, il met le chauffe-eau en marche et l'interrupteur différentiel déclenche. La pluie n'y est pour rien.",
  },
  demarches: {
    A: ["Écouter Mme Roux, lire le tableau, remarquer que l'horloge retarde de douze heures : ça a sauté vers 19 h, quand l'allée s'allume.", "Mesurer l'isolement du circuit de l'allée, disjoncteur baissé, en aval du contact de l'horloge : il est médiocre.", "Couper, vérifier l'absence de tension, ouvrir la boîte au pied du mur : de l'eau.", "Débrancher le départ vers l'allée et mesurer de chaque côté : le défaut est côté boîte.", "Remplacer la boîte par un modèle d'extérieur, vérifier l'isolement, vérifier que le différentiel tient."],
    B: ["Écouter, lire le tableau, remarquer l'horloge : ça a sauté vers 19 h, quand l'allée s'allume.", "De jour, par temps sec, tous les isolements sont bons : le défaut n'existe que sous la pluie.", "Revenir le soir : quand ça saute, tout baisser, réarmer, remonter un par un. C'est « Éclairage allée ».", "Couper le circuit en deux à la boîte du pied de mur, puis à la borne 1 : le défaut est après la borne 1.", "Ouvrir la borne 2 : presse-étoupe fendu. Le remplacer, sécher, vérifier l'isolement."],
    C: ["Écouter (le jardinier a refait la bordure), lire le tableau, remarquer l'horloge : ça a sauté vers 19 h.", "Mesurer l'isolement du circuit de l'allée en aval de l'horloge : il est médiocre.", "Ouvrir la boîte au pied du mur, débrancher le départ vers l'allée : le défaut est côté jardin.", "Séparer la borne 1 du reste : le défaut est sur le tronçon enterré entre la boîte et la borne 1.", "Mettre le circuit hors service, l'étiqueter, proposer le remplacement du câble."],
    D: ["Écouter (mardi il faisait beau), lire le tableau, remarquer que l'horloge ne retarde que de huit heures : ça a sauté à 23 h, au début des heures creuses.", "Ce qui démarre à 23 h : le chauffe-eau, par son contacteur.", "Mesurer l'isolement en aval du contacteur, à la sortie de câble du chauffe-eau : très faible.", "Débrancher le cordon de l'appareil : le câble est bon, le défaut est dans le chauffe-eau.", "Laisser l'appareil hors service et l'expliquer à Mme Roux."],
  },
  conseilsFin: ["Dis à Mme Roux de ne pas laisser le congélateur sur une rangée qui alimente un circuit extérieur douteux."],
  inutile(P) {
    const l = [], utiles = { A: ["bd_mur"], B: ["bd_mur", "borne1", "borne2"], C: ["bd_mur", "borne1"], D: ["sc_ce"] }[P.cause];
    const trop = [...P.ouverts].filter((id) => !utiles.includes(id)); if (trop.length) l.push(`Ouvert sans que ce soit nécessaire : ${trop.map((id) => P.nomOrgane(id, true)).join(", ")}.`);
    const prises = [...P.essais].filter((id) => P.inst.organe[id] && P.inst.organe[id].type === "prise" && !["pr_cel", "pr_ter"].includes(P.inst.organe[id].circuit)).length; if (prises > 2) l.push(`${prises} prises essayées sur la rangée du haut, qui n'a jamais sauté.`);
    if (P.soir && ["A", "C", "D"].includes(P.cause)) l.push("Tu es revenu le soir alors que le défaut se mesurait déjà de jour.");
    return l;
  },
  fils: F,
};
