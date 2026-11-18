# Publier les actualités du lundi

Ce dossier contient le seul outil nécessaire pour mettre en ligne une actualité :
`publication/actualites.py`. Il fonctionne avec Python 3 tel qu'il est installé partout,
sans rien ajouter.

## Les étapes

1. Ajouter l'actualité dans `data/actualites.json`, dans la liste `actualites`
   (l'ordre dans le fichier n'a pas d'importance : les plus récentes passent en premier).
2. Vérifier, sans rien écrire :

   ```bash
   python3 publication/actualites.py --verifier
   ```

3. Refaire les pages :

   ```bash
   python3 publication/actualites.py
   ```

4. Enregistrer (commit) et publier (push) sur la branche `main`. Le site se met à jour
   en une à deux minutes.

Si la vérification échoue, l'outil dit pourquoi, n'écrit rien et s'arrête avec un code
d'erreur. Dans ce cas, on ne publie pas.

## Ce que l'outil refait

- `actualites.html` (la liste) ;
- une page par actualité dans `actualites/` ; les pages qui ne correspondent plus à une
  actualité sont supprimées ;
- dans `sitemap.xml`, uniquement les lignes des actualités et la date de la ligne
  `actualites.html`. Une page nouvelle ou modifiée prend la date du jour ; les autres
  gardent leur date. Le reste du fichier ne bouge pas.

L'accueil du site n'est pas à refaire : son bandeau « Actualités » lit directement
`data/actualites.json` et montre les trois plus récentes.

L'outil ne touche à aucun autre fichier.

## Les champs d'une actualité

| Champ | Obligatoire | Contenu |
|---|---|---|
| `date` | oui | Date de publication, `AAAA-MM-JJ`, jamais dans le futur |
| `categorie` | oui | `Normes`, `Réglementation`, `Sécurité`, `Matériel` ou `Photovoltaïque` |
| `titre` | oui | Le titre. Ses 60 premiers caractères donnent l'adresse de la page : deux actualités ne peuvent pas avoir la même |
| `texte` | oui | Le texte, écrit avec nos mots, jamais recopié |
| `a_retenir` | oui | Une ou deux phrases : ce que l'électricien doit en retenir |
| `source` | oui | Le nom de la source et du document cité |
| `url` | oui | L'adresse de la source, qui commence par `https://` |
| `image` | non | Une image de `assets/photos/` (tableau ci-dessous). Le fichier doit exister |
| `image_generee` | avec `image` | `true` : affiche « Image d'illustration générée, non contractuelle. » |
| `image_alt` | non | Description de l'image ; par défaut, le titre |

Exemple :

```json
{
  "date": "2026-11-16",
  "categorie": "Sécurité",
  "titre": "Amiante : pas de travaux dans l'ancien sans repérage, rappelle l'INRS",
  "texte": "L'INRS a mis à jour son point juridique sur le repérage de l'amiante avant travaux. …",
  "a_retenir": "Avant de percer ou de saigner dans un bâtiment ancien, demande le repérage amiante.",
  "source": "INRS, focus juridique « Repérage amiante avant travaux »",
  "url": "https://www.inrs.fr/…",
  "image": "assets/photos/actu-norme.webp",
  "image_generee": true
}
```

Rappel des règles du site : une actualité n'est publiée que si elle est vérifiée sur une
source officielle ou sur le site du fabricant, citée avec son lien.

## Quelle image pour quelle catégorie

On ne fabrique pas d'image ici et on ne reprend jamais la photo d'un fabricant ou d'un
autre site : on réutilise une image déjà présente dans `assets/photos/`.

| Catégorie | Image à utiliser |
|---|---|
| `Normes` | `assets/photos/actu-norme.webp` |
| `Réglementation` | `assets/photos/actu-norme.webp` |
| `Sécurité` | `assets/photos/actu-norme.webp` |
| `Photovoltaïque` | `assets/photos/actu-onduleur.webp` |
| `Matériel`, outil électroportatif (perforateur, perceuse, visseuse…) | `assets/photos/actu-perforateur.webp` |
| `Matériel`, outil à main (pince, tournevis…) | `assets/photos/actu-pince.webp` |
| `Matériel`, autre chose | pas d'image |

Avec une de ces images, toujours ajouter `"image_generee": true`.
Si aucune image ne convient : pas de champ `image`, l'actualité s'affiche sans image.

## Ce que la vérification refuse

- un champ obligatoire absent ou vide ;
- une date qui n'est pas une vraie date `AAAA-MM-JJ`, ou qui est dans le futur ;
- une adresse de source qui ne commence pas par `https://` ;
- une catégorie qui n'est pas dans la liste ;
- une image indiquée mais absente du dépôt ;
- deux actualités qui donnent la même adresse de page.
