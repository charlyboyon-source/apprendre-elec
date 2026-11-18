#!/usr/bin/env python3
"""Refait les pages des actualités d'ApprendreElec à partir de data/actualites.json.

    python3 publication/actualites.py --verifier    contrôle seulement, n'écrit rien
    python3 publication/actualites.py               contrôle, puis écrit

Il refait : actualites.html, les pages actualites/<adresse>.html (et supprime celles qui ne
correspondent plus à une actualité) et, dans sitemap.xml, uniquement les lignes des actualités.
L'accueil n'a pas besoin d'être refait : il lit data/actualites.json directement.

Python 3 standard, aucune bibliothèque à installer. Mode d'emploi : publication/LISEZ-MOI.md.
Ce fichier est la seule source du gabarit des actualités : le générateur complet du site l'appelle.
"""
import datetime, glob, html, json, os, re, subprocess, sys, unicodedata

SITE = "https://apprendre-electricite.fr/"
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHAMPS = ("date", "categorie", "titre", "texte", "a_retenir", "source", "url")
CATEGORIES = ("Normes", "Réglementation", "Sécurité", "Matériel", "Photovoltaïque")
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
AUTEUR = {"@type": "Person", "name": "Charly", "url": SITE + "a-propos.html"}


# ---------- Les briques communes à toutes les pages du site (mêmes textes que le générateur complet)
def slug(t):
    t = unicodedata.normalize("NFD", t).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")

def texte_brut(h):
    h = re.sub(r"\[\[(?:[^\]|]+\|)?([^\]]+)\]\]", r"\1", h)
    return html.unescape(re.sub(r"<[^>]+>", " ", h)).replace("  ", " ").strip()

def date_fr(d):
    a, m, j = d.split("-"); return f"{int(j)} {MOIS[int(m)-1]} {a}"

def sans_vide(o):
    if isinstance(o, dict): return {k: sans_vide(v) for k, v in o.items() if v not in (None, "", [])}
    if isinstance(o, list): return [sans_vide(v) for v in o]
    return o

def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(sans_vide(obj), ensure_ascii=False).replace("</", "<\\/") + "</script>"

def sommaire_ld(chemin, nom, description, items):
    return ld({"@context": "https://schema.org", "@type": "CollectionPage", "name": nom, "description": description,
               "url": SITE + chemin, "inLanguage": "fr", "isPartOf": {"@type": "WebSite", "name": "ApprendreElec", "url": SITE},
               "mainEntity": {"@type": "ItemList", "numberOfItems": len(items), "itemListElement": [
                   {"@type": "ListItem", "position": i + 1, "name": texte_brut(t), "url": SITE + c} for i, (t, c) in enumerate(items)]}})

def ariane(items):
    vis = " › ".join(f'<a href="{c}">{html.escape(l)}</a>' if c is not None else f'<span aria-current="page">{html.escape(l)}</span>' for l, c in items)
    data = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": l, **({"item": SITE + c} if c is not None else {})} for i, (l, c) in enumerate(items)]}
    return f'<nav class="ariane" aria-label="Fil d\'Ariane">{vis}</nav>\n    {ld(data)}'

def tete(titre, description, chemin, base="", robots="", image="assets/partage.png"):
    e = html.escape
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {f'<base href="{base}">' if base else ''}
  <title>{e(titre)}</title>
  <meta name="description" content="{e(description)}">
  <link rel="canonical" href="{SITE}{chemin}">{f'{chr(10)}  <meta name="robots" content="{robots}">' if robots else ""}
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="ApprendreElec">
  <meta property="og:title" content="{e(titre)}">
  <meta property="og:description" content="{e(description)}">
  <meta property="og:url" content="{SITE}{chemin}">
  <meta property="og:image" content="{SITE}{image}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <link rel="stylesheet" href="css/theme.css">
  <link rel="stylesheet" href="css/lecon.css">
  <link rel="stylesheet" href="css/pages.css">
  <link rel="stylesheet" href="css/habillage.css">
</head>
<body>
  <header class="entete">
    <button class="bouton-burger" aria-label="Menu">☰</button>
    <a class="titre-site" href="index.html">⚡ ApprendreElec</a>
  </header>
'''

PIED = '''  <footer class="pied">
    <a href="index.html">Le parcours</a> · <a href="schemas.html">Schémas</a> · <a href="atelier-depannage.html">Dépannage 3D</a> · <a href="lexique.html">Lexique</a> · <a href="examen.html">Examen blanc</a> · <a href="calculateurs.html">Calculateurs</a> · <a href="actualites.html">Actualités</a> · <a href="a-propos.html">À propos</a> · <a href="mentions-legales.html">Mentions légales</a> · <a href="#" data-gerer-mesure>Gérer les cookies</a>
  </footer>
  <script type="module" src="js/page.js"></script>
</body>
</html>
'''


# ---------- Les actualités
def charger():
    return json.load(open(os.path.join(RACINE, "data", "actualites.json"), encoding="utf-8"))["actualites"]

def trier(actu):
    """Les plus récentes en premier ; à date égale, l'ordre du fichier."""
    return sorted(actu, key=lambda a: a["date"], reverse=True)

def actu_id(a): return "actu-" + slug(a["titre"])[:60]
def actu_page(a): return "actualites/" + slug(a["titre"])[:60].rstrip("-") + ".html"

def pages_cours():
    """Adresse de la page de cours de chaque module : {numéro: "cours/NN-titre.html"}."""
    out = {}
    for f in sorted(glob.glob(os.path.join(RACINE, "data", "niveaux", "*.json"))):
        m = json.load(open(f, encoding="utf-8")); out[m["id"]] = f'cours/{m["id"]:02d}-{slug(m["titre"])}.html'
    return out

def liens_actu():
    """« Pour aller plus loin », selon la catégorie de l'actualité."""
    p = pages_cours()
    return {
        "Matériel": [("materiel.html", "🧰 Le matériel de l'apprenti électricien"), (p[9], "📖 Module 9 : travailler en sécurité")],
        "Normes": [(p[14], "📖 Module 14 : la GTL et les circuits du logement"), (p[11], "📖 Module 11 : le tableau et ses différentiels")],
        "Photovoltaïque": [(p[21], "📖 Module 21 : le photovoltaïque"), ("atelier-depannage.html", "🔧 Atelier dépannage : cherche une panne en 3D")],
    }

def legende(a):
    return '<p class="actu-legende">Image d\'illustration générée, non contractuelle.</p>' if a.get("image_generee") else ""


def verifier(actu, aujourd_hui=None):
    """Liste des défauts (vide si tout va bien)."""
    aujourd_hui = aujourd_hui or datetime.date.today()
    pb, vues = [], {}
    if not isinstance(actu, list): return ["« actualites » doit être une liste"]
    for n, a in enumerate(actu, 1):
        if not isinstance(a, dict): pb.append(f"actualité n° {n} : ce n'est pas un objet entre accolades"); continue
        nom = f"actualité n° {n} (« {str(a.get('titre', 'sans titre'))[:50]} »)"
        manque = [c for c in CHAMPS if not isinstance(a.get(c), str) or not a[c].strip()]
        if manque: pb.append(f"{nom} : champ manquant ou vide : {', '.join(manque)}")
        d = a.get("date")
        if isinstance(d, str) and d.strip():
            try:
                if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d): raise ValueError
                if datetime.date.fromisoformat(d) > aujourd_hui: pb.append(f"{nom} : la date {d} est dans le futur")
            except ValueError: pb.append(f"{nom} : la date « {d} » n'est pas une vraie date AAAA-MM-JJ")
        u = a.get("url")
        if isinstance(u, str) and u.strip() and not u.startswith("https://"): pb.append(f"{nom} : l'adresse de la source doit commencer par https:// (« {u[:60]} »)")
        c = a.get("categorie")
        if isinstance(c, str) and c.strip() and c not in CATEGORIES: pb.append(f"{nom} : catégorie inconnue « {c} » (catégories connues : {', '.join(CATEGORIES)})")
        im = a.get("image")
        if im and (not isinstance(im, str) or not os.path.isfile(os.path.join(RACINE, im))): pb.append(f"{nom} : l'image « {im} » n'existe pas dans le dépôt")
        t = a.get("titre")
        if isinstance(t, str) and t.strip():
            if not slug(t): pb.append(f"{nom} : le titre ne donne aucune adresse de page")
            else:
                p = actu_page(a)
                if p in vues: pb.append(f"{nom} : même adresse de page que l'actualité n° {vues[p]} ({p})")
                else: vues[p] = n
    return pb


def contenus(actu):
    """Toutes les pages des actualités : {chemin: texte complet}. La liste actualites.html vient en dernier."""
    actus_triees, LIENS = trier(actu), liens_actu()
    out = {}
    for i, a in enumerate(actus_triees):
        chemin = actu_page(a)
        titre = a["titre"] if len(a["titre"]) <= 60 else a["titre"][:59].rsplit(" ", 1)[0].rstrip(" :,") + "…"
        desc = a["texte"] if len(a["texte"]) <= 155 else a["texte"][:152].rsplit(" ", 1)[0] + "…"
        liens = LIENS.get(a["categorie"], []) + [("actualites.html", "📰 Toutes les actualités")]
        autres = [x for x in actus_triees if x is not a][:3]
        li_autres = "".join('<li><a href="' + actu_page(x) + '">' + html.escape(x["titre"]) + "</a></li>" for x in autres)
        bloc_autres = f'<section class="plus-loin"><h2>Les autres actualités</h2><ul>{li_autres}</ul></section>' if autres else ""
        article = {"@context": "https://schema.org", "@type": "NewsArticle", "headline": a["titre"][:110], "datePublished": a["date"], "dateModified": a["date"],
                   "description": desc, "inLanguage": "fr", "url": SITE + chemin, "image": [SITE + a["image"]] if a.get("image") else None,
                   "author": AUTEUR, "publisher": {"@type": "Organization", "name": "ApprendreElec", "url": SITE}, "citation": a["url"]}
        corps = f'''    {ariane([("Accueil", ""), ("Actualités", "actualites.html"), (titre, None)])}
    {ld(article)}
    <article class="actu-article">
      <p class="actu-meta"><span class="actu-cat">{html.escape(a["categorie"])}</span> · <time datetime="{a["date"]}">{date_fr(a["date"])}</time></p>
      <h1>{html.escape(a["titre"])}</h1>
      {f'<img class="actu-image" src="{a["image"]}" alt="{html.escape(a.get("image_alt", a["titre"]))}" width="960" height="540">' + legende(a) if a.get("image") else ""}
      <p>{html.escape(a["texte"])}</p>
      {f'<p class="actu-retenir"><b>À retenir :</b> {html.escape(a["a_retenir"])}</p>' if a.get("a_retenir") else ""}
      <p class="actu-source">Source : <a href="{html.escape(a["url"])}" rel="noopener" target="_blank">{html.escape(a["source"])}</a>. L'information est vérifiée sur cette source ; en cas de doute, c'est le texte officiel ou la documentation du fabricant qui fait foi.</p>
    </article>
    <section class="plus-loin"><h2>Pour aller plus loin</h2><ul>{"".join(f'<li><a href="{h}">{t}</a></li>' for h, t in liens)}</ul></section>
    {bloc_autres}'''
        out[chemin] = tete(titre, desc, chemin, base="../") + f'  <main class="niveau page-simple">\n{corps}\n  </main>\n' + PIED
    cartes = "\n".join(f'''      <article class="actu" id="{actu_id(a)}">
        {f'<img class="actu-image" src="{a["image"]}" alt="{html.escape(a.get("image_alt", a["titre"]))}" width="960" height="540"{"" if i == 0 else " loading=" + chr(34) + "lazy" + chr(34)}>' if a.get("image") else ""}
        <p class="actu-meta"><span class="actu-cat">{html.escape(a["categorie"])}</span> · {date_fr(a["date"])}</p>
        <h2><a href="{actu_page(a)}">{html.escape(a["titre"])}</a></h2>
        <p>{html.escape(a["texte"])}</p>
        {f'<p class="actu-retenir"><b>À retenir :</b> {html.escape(a["a_retenir"])}</p>' if a.get("a_retenir") else ""}
        <p class="actu-source">Source : <a href="{html.escape(a["url"])}" rel="noopener" target="_blank">{html.escape(a["source"])}</a> · <a href="{actu_page(a)}">L'article</a></p>
        {legende(a)}
      </article>''' for i, a in enumerate(actus_triees))
    corps = sommaire_ld("actualites.html", "Actualités de l'électricien", "Normes, réglementation et matériel : les nouveautés vérifiées et sourcées.", [(a["titre"], actu_page(a)) for a in actus_triees]) + f'''
    <h1>Actualités</h1>
    <p class="niveau-objectif">Normes, réglementation, nouveau matériel : ce qui change pour l'électricien. Chaque information est vérifiée sur une source officielle ou chez le fabricant, avec le lien pour aller plus loin.</p>
{cartes}
    <p class="note-affiliation">Une information te semble fausse ou dépassée ? Elle est datée : la norme ou le texte cité fait toujours foi.</p>'''
    out["actualites.html"] = (tete("Actualités de l'électricien : normes, matériel",
        "Les nouveautés utiles aux électriciens et aux apprentis : normes, réglementation, Consuel, nouveau matériel. Chaque information est vérifiée et sourcée.",
        "actualites.html") + f'  <main class="niveau page-outil">\n{corps}\n  </main>\n' + PIED)
    return out


def ecrire_pages(actu):
    """Écrit les pages (seulement celles dont le contenu change), supprime les pages qui ne correspondent plus
    à une actualité. Renvoie (adresses des actualités dans l'ordre, pages écrites, pages supprimées)."""
    pages = contenus(actu)
    os.makedirs(os.path.join(RACINE, "actualites"), exist_ok=True)
    ecrites, supprimees = [], []
    for f in sorted(glob.glob(os.path.join(RACINE, "actualites", "*.html"))):
        rel = "actualites/" + os.path.basename(f)
        if rel not in pages: os.remove(f); supprimees.append(rel)
    for chemin, texte in pages.items():
        f = os.path.join(RACINE, chemin)
        ancien = open(f, encoding="utf-8").read() if os.path.exists(f) else None
        if ancien != texte:
            open(f, "w", encoding="utf-8").write(texte); ecrites.append(chemin)
    return [c for c in pages if c != "actualites.html"], ecrites, supprimees


def version_publiee(chemin):
    """Le fichier tel qu'il est dans le dernier commit du dépôt (None s'il n'y est pas, ou sans git)."""
    try:
        r = subprocess.run(["git", "show", "HEAD:" + chemin], cwd=RACINE, capture_output=True)
        return r.stdout.decode("utf-8") if r.returncode == 0 else None
    except (OSError, UnicodeDecodeError): return None


def maj_sitemap(adresses, aujourd_hui=None):
    """Dans sitemap.xml, refait uniquement les lignes des actualités : ajout, retrait, ordre et date.
    Date d'une ligne : celle du plan du site déjà publié si la page est identique à sa version publiée,
    sinon la date du jour (page nouvelle ou modifiée). La ligne de actualites.html suit la même règle.
    Renvoie True si le fichier a changé."""
    jour = (aujourd_hui or datetime.date.today()).isoformat()
    f = os.path.join(RACINE, "sitemap.xml")
    avant = open(f, encoding="utf-8").read()
    motif = re.compile(r"<loc>" + re.escape(SITE) + r"(actualites(?:/[^<]+|\.html))</loc><lastmod>([^<]+)</lastmod>")
    dates = dict(motif.findall(version_publiee("sitemap.xml") or avant))
    def date(u):
        publiee = version_publiee(u)
        ici = open(os.path.join(RACINE, u), encoding="utf-8").read()
        return dates[u] if publiee == ici and u in dates else jour
    lignes = avant.splitlines(keepends=True)
    positions = [i for i, l in enumerate(lignes) if f"<loc>{SITE}actualites/" in l]
    if positions: ou = positions[0]
    else: ou = next((i for i, l in enumerate(lignes) if f"<loc>{SITE}qcm/" in l), next(i for i, l in enumerate(lignes) if "</urlset>" in l))
    neuves = [f"  <url><loc>{SITE}{u}</loc><lastmod>{date(u)}</lastmod></url>\n" for u in adresses]
    reste = [l for i, l in enumerate(lignes) if i not in set(positions)]
    lignes = reste[:ou] + neuves + reste[ou:]
    liste = f"<loc>{SITE}actualites.html</loc>"
    lignes = [re.sub(r"<lastmod>[^<]+</lastmod>", f"<lastmod>{date('actualites.html')}</lastmod>", l) if liste in l else l for l in lignes]
    apres = "".join(lignes)
    if apres != avant: open(f, "w", encoding="utf-8").write(apres)
    return apres != avant


def main(args):
    inconnus = [a for a in args if a != "--verifier"]
    if inconnus:
        print(__doc__); print("Option inconnue :", " ".join(inconnus)); return 2
    try: actu = charger()
    except (OSError, ValueError, KeyError) as e:
        print(f"REFUSÉ : data/actualites.json est illisible ({e}). Rien n'a été écrit."); return 1
    pb = verifier(actu)
    if pb:
        print(f"REFUSÉ : {len(pb)} défaut(s) dans data/actualites.json. Rien n'a été écrit.")
        for p in pb: print("  - " + p)
        return 1
    if "--verifier" in args:
        print(f"Vérification réussie : {len(actu)} actualité(s) valides. Rien n'a été écrit."); return 0
    adresses, ecrites, supprimees = ecrire_pages(actu)
    plan = maj_sitemap(adresses)
    print(f"{len(actu)} actualité(s). Pages écrites : {len(ecrites)}. Pages supprimées : {len(supprimees)}. Plan du site : {'mis à jour' if plan else 'inchangé'}.")
    for c in ecrites: print("  écrite    :", c)
    for c in supprimees: print("  supprimée :", c)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
