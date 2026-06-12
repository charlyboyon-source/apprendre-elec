# ApprendreElec — Plan de construction (Claude Code)

> Fichier à placer à la racine du projet. Sert de référence à Claude Code pendant toute la construction.
> Commande de départ sur Mac : `mkdir apprendre-elec && cd apprendre-elec && claude`

---

## 1. Identité du projet (validée — ne pas changer)

- **Nom** : ApprendreElec
- **Cible** : mixte — candidats à l'examen (TP Électricien d'Équipement du Bâtiment), élèves en formation, professionnels en révision, et curieux motivés
- **Ton éditorial** : **vocabulaire technique exact** (DDR, SLT, NF C 15-100, schéma unifilaire…) — c'est le vocabulaire de l'examen, on ne le simplifie pas. En revanche, **chaque terme technique a une définition accessible en un tap** (glossaire intégré, voir section 5 bis)
- **Visuel** : thème sombre "Atelier" (fond anthracite, accents jaune/orange électrique)
- **Parcours** : carte en bulles (style Duolingo), 21 niveaux en 5 blocs
- **Points** : électrons (e⁻) au lieu de XP
- **Mascotte** : Volty, un disjoncteur vivant (réactions selon réussite/échec)
- **Sons** : uniquement dans les jeux, discrets, désactivables
- **Menu** : burger ☰
- **Monétisation future** : prévoir l'emplacement (bandeau premium désactivé en v1)

## 2. Règle de contenu — NON NÉGOCIABLE

- **Jamais recopier les cours AFPA** (© protégé).
- La structure des 82 docs AFPA sert uniquement de **sommaire de référence** (quels sujets couvrir, dans quel ordre).
- Tout texte de leçon, quiz, jeu = **rédaction 100 % originale**, mais avec la **terminologie normative exacte** (les termes des normes NF C 15-100, NF C 18-510, etc. ne sont pas du contenu protégé — c'est le vocabulaire du métier).
- Vérifier : aucune phrase ne doit pouvoir être retrouvée telle quelle dans un PDF AFPA.

## 3. Stack technique

| Choix | Décision | Pourquoi |
|---|---|---|
| Type de site | **Statique, sans build** (HTML/CSS/JS vanilla + JSON) | Hébergement gratuit, zéro maintenance, déploiement en 1 push |
| Hébergement | **GitHub Pages** (Netlify en plan B si besoin de formulaires) | Gratuit, HTTPS, domaine custom possible plus tard |
| Données niveaux | **1 fichier JSON par niveau** dans `/data/niveaux/` | Production des 21 niveaux indépendante du code |
| Progression | **localStorage** (clé unique versionnée `apprendre-elec-v1`) | Pas de backend en v1 |
| Schémas/illustrations | **SVG inline** réutilisables | Léger, animable, déjà maîtrisé (simulateurs v0.4) |
| Classement/défis | **Reporté v2** (nécessite un backend : Supabase gratuit) | Ne pas bloquer la v1 |

**Pas de framework (React/Vue)** : le prototype v0.4 est en vanilla, on capitalise dessus. Un module JS par fonctionnalité, c'est suffisant et ça reste lisible.

## 4. Arborescence du dépôt

```
apprendre-elec/
├── index.html              # Accueil + carte des niveaux (bulles)
├── niveau.html             # Page générique : charge un niveau via ?id=7
├── css/
│   ├── theme.css           # Variables (couleurs Atelier, typo, espacements)
│   ├── carte.css           # Carte en bulles + blocs
│   ├── lecon.css           # Mise en page leçon/quiz/jeu
│   └── volty.css           # Animations mascotte
├── js/
│   ├── app.js              # Routing léger, init
│   ├── progression.js      # localStorage : e⁻, badges, niveaux débloqués
│   ├── carte.js            # Rendu de la carte, verrouillage des niveaux
│   ├── lecon.js            # Moteur de leçon (étapes, navigation)
│   ├── quiz.js             # Moteur quiz : correction en fin de série + renvoi au cours
│   ├── jeux/
│   │   ├── trouve-erreur.js
│   │   ├── cable-le-circuit.js
│   │   └── vrai-faux-rapide.js
│   ├── volty.js            # Réactions mascotte (events: réussite, échec, badge)
│   ├── glossaire.js        # Détecte les termes [[…]] et affiche la définition (popover)
│   └── audio.js            # Sons des jeux (Web Audio, volume bas, toggle)
├── data/
│   ├── parcours.json       # Les 5 blocs, ordre des 21 niveaux, badges
│   ├── glossaire.json      # Tous les termes techniques + définitions courtes
│   └── niveaux/
│       ├── 01.json … 21.json
├── assets/
│   ├── svg/                # Schémas, icônes, Volty
│   └── sons/
├── sitemap.xml
├── robots.txt
└── PLAN-APPRENDRE-ELEC.md  # Ce fichier
```

## 5. Modèle de données d'un niveau (contrat fixe)

Chaque `data/niveaux/NN.json` respecte ce schéma — c'est ce qui permet de produire les 21 niveaux sans retoucher le code :

```json
{
  "id": 7,
  "bloc": 2,
  "titre": "L'électricité dans la salle de bain",
  "objectif": "Comprendre pourquoi eau + électricité = règles strictes",
  "lecon": [
    { "type": "texte", "contenu": "…" },
    { "type": "svg", "fichier": "sdb-volumes.svg", "legende": "…" },
    { "type": "astuce-volty", "contenu": "…" }
  ],
  "quiz": [
    {
      "question": "…",
      "choix": ["…", "…", "…", "…"],
      "bonne": 2,
      "explication": "…",
      "renvoi_lecon": 1
    }
  ],
  "jeu": { "type": "trouve-erreur", "config": { } },
  "recompense": { "electrons": 50, "badge": null }
}
```

Règles du quiz (validées en v0.4) : correction **en fin de série** (pas question par question), avec renvoi vers la section de la leçon concernée en cas d'erreur.

## 5 bis. Système de glossaire (nouveau — terminologie pro accessible)

Principe : on garde le terme exact, on rend sa définition accessible en un tap.

- Dans les textes de leçon et de quiz, les termes techniques sont marqués : `"Le [[DDR]] coupe le circuit en cas de défaut d'isolement."`
- `glossaire.js` transforme chaque `[[terme]]` en mot souligné en pointillés jaunes → tap = popover avec la définition courte (2 phrases max) tirée de `glossaire.json`.
- `glossaire.json` :

```json
{
  "DDR": {
    "nom": "Dispositif Différentiel à courant Résiduel",
    "definition": "Appareil qui compare le courant entrant et sortant d'un circuit. S'il détecte une fuite (vers la terre ou un corps humain), il coupe en quelques millisecondes.",
    "niveau_associe": 6
  }
}
```

- `niveau_associe` (optionnel) : ajoute un lien "→ Voir le niveau 6" dans le popover si le terme est traité en détail quelque part.
- Page `glossaire.html` : index alphabétique de tous les termes (bonus SEO : c'est exactement le genre de pages que Google indexe bien — "définition DDR", "qu'est-ce qu'un SLT"…).
- Règle de production : **tout sigle ou terme normatif utilisé pour la première fois dans un niveau doit exister dans glossaire.json** (à vérifier à chaque session de Phase C).

## 6. Les 5 blocs et la correspondance AFPA (sommaire de référence)

| Bloc | Thème | Niveaux | Docs AFPA de référence |
|---|---|---|---|
| 1 | Lois fondamentales et circuit électrique | 1–4 | 31, 35, 41, 54, 111 |
| 2 | Sécurité électrique et protection des personnes | 5–9 | 32, 81–87, 95 |
| 3 | Tableau de distribution, conducteurs et dimensionnement | 10–14 | 42–46, 61, 63, 151 |
| 4 | Schémas et montages d'éclairage | 15–18 | 51–57, 72, 73, 91 |
| 5 | Applications : ECS, domotique, IRVE, photovoltaïque | 19–21 | 74, 201, 211–215 |

## 7. Phases de construction (sessions Claude Code)

### Phase A — Socle (1 session)
1. Init dépôt Git + repo GitHub `apprendre-elec` + activation GitHub Pages (branche `main`).
2. Créer l'arborescence, `theme.css` (reprendre l'identité Atelier du proto v0.4), `parcours.json`.
3. Carte des bulles fonctionnelle avec niveaux verrouillés/déverrouillés (données factices).
4. `progression.js` : lecture/écriture localStorage, compteur e⁻ dans le header.
**Critère de fin : le site est en ligne sur `https://<user>.github.io/apprendre-elec/` avec la carte vide.**

### Phase B — Moteurs (1–2 sessions)
1. `lecon.js` + `quiz.js` : porter le niveau 7 du proto v0.4 dans le nouveau format JSON.
2. `glossaire.js` + `glossaire.json` (premiers termes : DDR, disjoncteur, phase, neutre, terre, NF C 15-100, volume de sécurité).
3. `volty.js` + `audio.js`.
4. Jeu "Trouve l'erreur" branché sur le moteur.
**Critère de fin : niveau 7 jouable de bout en bout, termes [[…]] cliquables, e⁻ crédités, niveau 8 se déverrouille.**

### Phase C — Production de contenu (4–5 sessions, ~4–5 niveaux par session)
1. Bloc 1 (niveaux 1–4) → relecture → push.
2. Bloc 2 (5–9), puis 3, 4, 5.
3. Pour chaque niveau : rédiger leçon originale → quiz (6–8 questions) → config du jeu → SVG si besoin → **ajouter au glossaire chaque nouveau terme technique introduit**.
**Critère de fin : 21 niveaux jouables, glossaire complet.**

### Phase D — Finitions v1 (1 session)
1. Badges de fin de bloc + écran de félicitations.
2. SEO : `<title>` et meta par page ("Apprendre l'électricité gratuitement — ApprendreElec", "Réviser le TP Électricien d'Équipement du Bâtiment"), page glossaire indexable, sitemap.xml, Open Graph.
3. Test mobile (la majorité du trafic sera mobile).
4. Page "À propos" (ton histoire : reconversion, AFPA — ça crédibilise et c'est bon pour le SEO).

### Phase E — v2 (plus tard, ne pas commencer avant la v1 en ligne)
- Examen blanc avec classement (backend Supabase, plan gratuit).
- Défis entre collègues (lien de défi partageable).
- Atelier schémas : construction libre + dimensionnement tableau unifilaire sur mise en situation.
- Nom de domaine `apprendre-elec.fr` (~7 €/an chez OVH) quand le trafic justifie.

## 8. Premier prompt à donner à Claude Code (Phase A)

```
Lis PLAN-APPRENDRE-ELEC.md à la racine. Exécute la Phase A uniquement :
initialise le dépôt, crée l'arborescence décrite en section 4, le thème
sombre "Atelier" en CSS (variables dans theme.css), parcours.json avec
les 5 blocs et 21 niveaux de la section 6, et la carte en bulles avec
verrouillage. Ne produis aucun contenu de leçon. À la fin, donne-moi
les commandes exactes pour publier sur GitHub Pages.
```
