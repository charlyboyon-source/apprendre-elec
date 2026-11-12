#!/usr/bin/env python3
"""Génère les pages statiques d'ApprendreElec à partir des données.

À relancer après toute modification d'un module (data/niveaux/NN.json),
du glossaire (data/glossaire.json) ou du parcours (data/parcours.json) :

    python3 outils/generer-pages.py

Il écrit : cours/NN-titre.html (une page par module, lisible par Google),
lexique.html, cours.html, examen.html, erreurs.html, fiche.html, materiel.html,
a-propos.html, mentions-legales.html, sitemap.xml et data/pages-cours.json.
Le site lui-même n'a pas besoin de ce script pour fonctionner.
"""
import json, re, unicodedata, datetime, html, os, glob

SITE = "https://apprendre-electricite.fr/"
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RACINE)

def slug(t):
    t = unicodedata.normalize("NFD", t).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")

def texte_brut(h):
    h = re.sub(r"\[\[(?:[^\]|]+\|)?([^\]]+)\]\]", r"\1", h)
    return html.unescape(re.sub(r"<[^>]+>", " ", h)).replace("  ", " ").strip()

import subprocess
MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]
def date_fr(d):
    a, m, j = d.split("-"); return f"{int(j)} {MOIS[int(m)-1]} {a}"
def sans_vide(o):
    if isinstance(o, dict): return {k: sans_vide(v) for k, v in o.items() if v not in (None, "", [])}
    if isinstance(o, list): return [sans_vide(v) for v in o]
    return o
def ld(obj):
    return '<script type="application/ld+json">' + json.dumps(sans_vide(obj), ensure_ascii=False).replace("</", "<\\/") + "</script>"
def ariane(items):
    """items : [(libellé, chemin ou None)] ; renvoie le fil visible + son BreadcrumbList."""
    vis = " › ".join(f'<a href="{c}">{html.escape(l)}</a>' if c is not None else f'<span aria-current="page">{html.escape(l)}</span>' for l, c in items)
    data = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": l, **({"item": SITE + c} if c is not None else {})} for i, (l, c) in enumerate(items)]}
    return f'<nav class="ariane" aria-label="Fil d\'Ariane">{vis}</nav>\n    {ld(data)}'
def date_maj(chemin):
    try: return subprocess.run(["git", "log", "-1", "--format=%cs", "--", chemin], capture_output=True, text=True).stdout.strip() or datetime.date.today().isoformat()
    except Exception: return datetime.date.today().isoformat()
_svg_cache = {}
def infos_svg(nom):
    """(description, largeur, hauteur) lues dans l'image : son aria-label et son viewBox."""
    if nom not in _svg_cache:
        t = open(f"assets/svg/{nom}", encoding="utf-8").read()
        lab = re.search(r'aria-label="([^"]+)"', t)
        vb = re.search(r'viewBox="[-0-9.]+ [-0-9.]+ ([0-9.]+) ([0-9.]+)"', t)
        _svg_cache[nom] = (html.unescape(lab.group(1)) if lab else "", int(float(vb.group(1))) if vb else 640, int(float(vb.group(2))) if vb else 400)
    return _svg_cache[nom]
def img_svg(nom, secours, premiere=False):
    desc, w, h = infos_svg(nom)
    paresseux = "" if premiere else ' loading="lazy"'
    return f'<img src="assets/svg/{nom}" alt="{html.escape(desc or secours)}" width="{w}" height="{h}"{paresseux}>'
AUTEUR = {"@type": "Person", "name": "Charly", "url": SITE + "a-propos.html"}
LEX_PAGES = set()  # clés du glossaire qui ont leur propre page lexique/<slug>.html
def lien_terme(cle):
    return f"lexique/{slug(cle)}.html" if cle in LEX_PAGES else f"lexique.html#{slug(cle)}"
def termes(h):
    return re.sub(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]",
                  lambda m: f'<a class="terme-lien" href="{lien_terme(m.group(1))}">{m.group(2) or m.group(1)}</a>', h)

def tete(titre, description, chemin, base="", robots=""):
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
  <meta property="og:image" content="{SITE}assets/partage.png">
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
    <span class="compteur-electrons">0 e⁻</span>
  </header>
'''

PIED = '''  <footer class="pied">
    <a href="index.html">Le parcours</a> · <a href="lexique.html">Lexique</a> · <a href="examen.html">Examen blanc</a> · <a href="calculateurs.html">Calculateurs</a> · <a href="actualites.html">Actualités</a> · <a href="a-propos.html">À propos</a> · <a href="mentions-legales.html">Mentions légales</a> · <a href="#" data-gerer-mesure>Gérer les cookies</a>
  </footer>
  <script type="module" src="js/page.js"></script>
</body>
</html>
'''

parcours = json.load(open("data/parcours.json", encoding="utf-8"))
glossaire = json.load(open("data/glossaire.json", encoding="utf-8"))
blocs = {n["id"]: b for b in parcours["blocs"] for n in b["niveaux"]}
modules = [json.load(open(f, encoding="utf-8")) for f in sorted(glob.glob("data/niveaux/*.json"))]
pages = {m["id"]: f'cours/{m["id"]:02d}-{slug(m["titre"])}.html' for m in modules}
qcm_pages = {m["id"]: f'qcm/{m["id"]:02d}-{slug(m["titre"])}.html' for m in modules}
fiche_pages = {m["id"]: f'fiches/{m["id"]:02d}-{slug(m["titre"])}.html' for m in modules}

# Titres pour Google (balise <title> et og:title ; le h1 affiché reste le titre du cours). 60 caractères au plus.
TITRES = {
    1: "Courant, tension, résistance : les bases de l'électricité",
    2: "Loi d'Ohm et puissance électrique : cours et calculs",
    3: "Le circuit électrique : phase, neutre, terre, protections",
    4: "Série, parallèle et courant alternatif : cours gratuit",
    5: "Électrisation, électrocution : les dangers du courant",
    6: "Différentiel 30 mA, prise de terre, régime TT : le cours",
    7: "Volumes de la salle de bain (NF C 15-100) : le cours",
    8: "Indice IP, indice IK et classes de matériel électrique",
    9: "Habilitation électrique, consignation, VAT : le cours",
    10: "Disjoncteur et fusible : calibre, courbes B, C, D",
    11: "Tableau électrique : interrupteurs différentiels, réserve",
    12: "Section de câble, H07V-U, 3G2,5 : conducteurs et câbles",
    13: "Gaine ICTA, tube IRL, TPC : conduits et modes de pose",
    14: "GTL, ETEL et circuits du logement (NF C 15-100)",
    15: "Lire un schéma électrique : unifilaire, développé",
    16: "Simple allumage et double allumage : schéma et câblage",
    17: "Va-et-vient et permutateur : schéma et câblage",
    18: "Télérupteur et minuterie : schéma et câblage",
    19: "Chauffe-eau et contacteur heures creuses : branchement",
    20: "Borne de recharge (IRVE) et domotique : le cours",
    21: "Installation photovoltaïque : principe et protections",
}
def description_cours(m):
    d = f'{m["objectif"].rstrip(".")}. Cours illustré et quiz de {len(m["banque"])} questions.'
    return d if len(d) <= 155 else m["objectif"].rstrip(".") + "."

for f in glob.glob("cours/*.html"): os.remove(f)

# ---------- Une page par terme du lexique (lexique/<slug>.html)
PLUS = json.load(open("data/lexique-plus.json", encoding="utf-8"))
os.makedirs("lexique", exist_ok=True)
for f in glob.glob("lexique/*.html"): os.remove(f)
def phrases_du_terme(cle, nom):
    """Passages des cours où le terme apparaît : (module, n° de section, titre de section, phrase)."""
    nom = re.sub(r"\s*\([^)]*\)", "", nom)
    marque = re.compile(r"\[\[" + re.escape(cle) + r"(\||\]\])")
    alternatives = [marque.pattern, r"\b" + re.escape(nom) + r"\b"]
    if cle != nom: alternatives.append(r"\b" + re.escape(cle) + r"\b")
    motif = re.compile("|".join(alternatives), re.I if len(cle) > 4 else 0)
    courant = " " not in nom and "-" not in nom and len(nom) <= 10 and nom.lower() == nom.lower().strip()  # mot très courant : tension, terre, phase…
    trouves, vus = [], set()
    ordre = sorted(modules, key=lambda m: (m["id"] != glossaire[cle].get("niveau_associe"), m["id"]))
    for m in ordre:
        for k, sec in enumerate(m["cours"]["sections"]):
            pris = False
            for bloc in (sec["contenu"], sec.get("encadre", {}).get("texte", "")):
                propre = re.sub(r"</?(p|li|ul|ol|br)[^>]*>", " . ", bloc)
                for ph in re.split(r"(?<=[.!?])\s+", propre):
                    if not motif.search(ph): continue
                    if courant and m["id"] != glossaire[cle].get("niveau_associe") and not marque.search(ph): continue
                    t = texte_brut(ph).strip(" .")
                    if len(t.split()) < 10 or t in vus: continue
                    vus.add(t); trouves.append((m, k, sec["titre"], t + ".")); pris = True
                    break
                if pris: break
            if len(trouves) >= 4: return trouves
    return trouves
def mots(h): return len(re.findall(r"[A-Za-zÀ-ÿ0-9]+", html.unescape(re.sub(r"<[^>]+>", " ", h))))
termes_pages = {}
for cle, e in glossaire.items():
    plus = PLUS.get(cle, {})
    sigle = cle != e["nom"] and cle.upper() == cle and cle not in re.sub(r"\s*\(" + re.escape(cle) + r"\)", "", e["nom"])
    nom_propre = re.sub(r"\s*\(" + re.escape(cle) + r"\)", "", e["nom"])
    h1 = f'{cle} : {re.sub(r"(?<![A-Za-zÀ-ÿ])([A-ZÀ-Ý])([a-zà-ÿ]+)", lambda x: x.group(0).lower(), nom_propre)}' if sigle else e["nom"]
    passages = phrases_du_terme(cle, e["nom"])
    corps = f'<p class="niveau-objectif">{e["definition"]}</p>'
    if plus.get("chantier"): corps += f'<aside class="cours-chantier"><b>🔧 Sur le chantier</b><p>{plus["chantier"]}</p></aside>'
    if plus.get("confondre"):
        corps += "<h2>À ne pas confondre avec</h2><ul>" + "".join(f"<li><b>{c}</b> : {t}</li>" for c, t in plus["confondre"]) + "</ul>"
    if passages:
        corps += "<h2>Dans les cours</h2>" + "".join(
            f'<blockquote class="lexique-extrait"><p>{t}</p><cite><a href="{pages[m["id"]]}#s{k+1}">Module {m["id"]} · {texte_brut(tit)}</a></cite></blockquote>'
            for m, k, tit, t in passages)
    voisins = [v for v in plus.get("voisins", []) if v in glossaire]
    mod = e.get("niveau_associe")
    if len(voisins) < 3 and mod:
        voisins += [k for k, x in glossaire.items() if k != cle and k not in voisins and x.get("niveau_associe") == mod][: 5 - len(voisins)]
    termes_pages[cle] = (h1, corps, voisins[:5])
for cle, (h1, corps, voisins) in termes_pages.items():
    if mots(corps) >= 125: LEX_PAGES.add(cle)
for cle in sorted(LEX_PAGES):
    h1, corps, voisins = termes_pages[cle]
    e = glossaire[cle]
    if voisins:
        corps += '<h2>Termes voisins</h2><p class="lexique-voisins">' + " · ".join(
            f'<a href="{lien_terme(v)}">{v if v.upper() == v else glossaire[v]["nom"]}</a>' for v in voisins) + "</p>"
    if e.get("niveau_associe") in pages:
        mod = next(m for m in modules if m["id"] == e["niveau_associe"])
        corps += f'<p class="module-liens"><a href="{pages[mod["id"]]}">📖 Lire le cours complet : module {mod["id"]}, {mod["titre"]}</a></p>'
    corps += '<p class="module-liens"><a href="lexique.html">← Tout le lexique</a></p>'
    nom_titre = cle if cle.upper() == cle else e["nom"]
    titre = f"{nom_titre} : définition simple"
    if len(titre) > 60: titre = f"{nom_titre} : définition"
    if len(titre) > 60: titre = nom_titre[:60]
    desc = e["definition"] if len(e["definition"]) <= 155 else e["definition"][:152].rsplit(" ", 1)[0] + "…"
    chemin = f"lexique/{slug(cle)}.html"
    contenu = (tete(titre, desc, chemin, base="../")
        + '  <main class="niveau page-terme">\n    ' + ariane([("Accueil", ""), ("Lexique", "lexique.html"), (nom_titre, None)])
        + "\n    " + ld({"@context": "https://schema.org", "@type": "DefinedTerm", "name": h1, "alternateName": cle if cle != h1 else None, "description": e["definition"], "url": SITE + chemin,
                       "inDefinedTermSet": {"@type": "DefinedTermSet", "name": "Lexique de l'électricien", "url": SITE + "lexique.html"}})
        + '\n    <p class="lecon-kicker">LEXIQUE DE L\'ÉLECTRICIEN</p>\n'
        + f"    <h1>{h1}</h1>\n    {termes(corps)}\n  </main>\n" + PIED)
    open(chemin, "w", encoding="utf-8").write(contenu)


for i, m in enumerate(modules):
    n, c = m["id"], m["cours"]
    bloc = blocs[n]
    jeu_nom = {"trouve-erreur": "Trouve l'erreur", "vrai-faux-rapide": "Vrai ou faux"}[m["jeu"]["type"]]
    jeu_desc = (f'{len(m["jeu"]["config"]["rounds"])} installations : trouve celle qui n\'est pas conforme' if m["jeu"]["type"] == "trouve-erreur"
                else f'{len(m["jeu"]["config"]["affirmations"])} affirmations : vrai ou faux, réponds vite')
    nbq = min(15, len(m["banque"]))
    etapes = f'''<ol class="module-etapes">
      <li><a class="module-etape" data-act="lecon" href="{pages[n]}#cours"><i>1</i><span><b>Lire le cours</b><small>{len(c["sections"])} parties illustrées</small></span></a></li>
      <li><a class="module-etape" data-act="quiz" href="{pages[n]}#quiz"><i>2</i><span><b>Faire le quiz</b><small>{nbq} questions</small></span></a></li>
      <li><a class="module-etape" data-act="jeu" href="{pages[n]}#jeu"><i>3</i><span><b>Jouer : {jeu_nom}</b><small>pour ancrer</small></span></a></li>
    </ol>
    <p class="module-liens"><a href="{fiche_pages[n]}">🖨 La fiche mémo de ce cours</a> · <a href="{qcm_pages[n]}">✅ Le QCM corrigé (10 questions)</a></p>'''
    secs = []
    for k, s in enumerate(c["sections"]):
        fig = f'<div class="lecon-figure">{img_svg(s["svg"], texte_brut(s["titre"]), premiere=(k == 0))}</div>' if s.get("svg") else ""
        enc = f'<aside class="cours-chantier"><b>🔧 {s["encadre"].get("titre") or "Sur le chantier"}</b><p>{termes(s["encadre"]["texte"])}</p></aside>' if s.get("encadre") else ""
        memo = f'<div class="lecon-memo">◆ {termes(s["memo"])}</div>' if s.get("memo") else ""
        secs.append(f'''      <section class="cours-section" id="s{k+1}">
        <h2 class="cours-titre">{s["titre"]}</h2>
        {fig}
        <div class="cours-texte">{termes(s["contenu"])}</div>
        {enc}
        {memo}
      </section>''')
    prec = f'<a href="{pages[modules[i-1]["id"]]}">← {modules[i-1]["titre"]}</a>' if i else "<span></span>"
    suiv = f'<a href="{pages[modules[i+1]["id"]]}">{modules[i+1]["titre"]} →</a>' if i < len(modules) - 1 else "<span></span>"
    page = tete(TITRES[n], description_cours(m), pages[n], base="../")
    maj = date_maj(f"data/niveaux/{n:02d}.json")
    res = {"@context": "https://schema.org", "@type": "LearningResource", "name": m["titre"], "headline": TITRES[n],
           "description": description_cours(m), "url": SITE + pages[n], "inLanguage": "fr", "isAccessibleForFree": True,
           "learningResourceType": "cours", "educationalLevel": "Débutant à titre professionnel Électricien d'Équipement du Bâtiment",
           "teaches": [texte_brut(x["titre"]).split(". ", 1)[-1] for x in c["sections"]], "dateModified": maj, "author": AUTEUR,
           "publisher": {"@type": "Organization", "name": "ApprendreElec", "url": SITE}}
    page += f'''  <main class="niveau page-cours" data-module="{n}">
    {ariane([("Accueil", ""), ("Cours", "cours.html"), (f"Bloc {bloc['id']}", "cours.html"), (m["titre"], None)])}
    {ld(res)}
    <p class="lecon-kicker">BLOC {bloc["id"]} · {bloc["titre"].upper()} · MODULE {n}</p>
    <h1>{m["titre"]}</h1>
    <p class="niveau-objectif">{m["objectif"]}</p>
    <p class="maj">Mis à jour le {date_fr(maj)}</p>
    {etapes}
    <article class="cours" id="cours">
      <p class="cours-intro">{termes(c["intro"])}</p>
{chr(10).join(secs)}
      <p class="cours-fin">Fin du cours. Place à l'entraînement.</p>
    </article>
    <section class="module-activite" id="quiz">
      <p class="module-activite-num">ÉTAPE 2</p>
      <h2>Le quiz</h2>
      <div class="activite-zone">
        <p>{nbq} questions tirées au hasard parmi {len(m["banque"])}. La correction arrive à la fin, avec un lien vers la partie du cours à revoir.</p>
        <button class="bouton-plein" type="button" data-lancer="quiz">Commencer le quiz</button>
      </div>
    </section>
    <section class="module-activite" id="jeu">
      <p class="module-activite-num">ÉTAPE 3</p>
      <h2>Le jeu : {jeu_nom}</h2>
      <div class="activite-zone">
        <p>{jeu_desc}.</p>
        <button class="bouton-plein" type="button" data-lancer="jeu">Commencer le jeu</button>
      </div>
    </section>
    <p class="module-bravo" hidden>Module terminé : <b>+{m["recompense"]["electrons"]} e⁻</b>. Le suivant est débloqué.</p>
    <p class="module-liens"><a href="{fiche_pages[n]}">🖨 La fiche mémo de ce cours</a></p>
    <nav class="page-voisins">{prec}{suiv}</nav>
  </main>
''' + PIED
    page = page.replace('<span class="compteur-electrons">', '<button class="bouton-sons sndbtn" aria-label="Activer ou couper les sons des jeux">🔊</button>\n    <span class="compteur-electrons">', 1)
    page = page.replace('src="js/page.js"', 'src="js/cours.js"')
    open(pages[n], "w", encoding="utf-8").write(page)

json.dump({str(k): v for k, v in pages.items()}, open("data/pages-cours.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

# ---------- Lexique
cle_tri = lambda kv: slug(kv[1]["nom"])
entrees = []
lettres_presentes = set()
for cle, e in sorted(glossaire.items(), key=cle_tri):
    lettre = slug(e["nom"])[:1].upper()
    if not lettre.isalpha(): lettre = "#"
    lettres_presentes.add(lettre)
    lien = (f' <a class="lexique-lien" href="lexique/{slug(cle)}.html">La fiche complète →</a>' if cle in LEX_PAGES
             else f' <a class="lexique-lien" href="{pages[e["niveau_associe"]]}">Voir le cours →</a>' if e.get("niveau_associe") in pages else "")
    entrees.append(f'''      <section class="lexique-entree" id="{slug(cle)}" data-lettre="{lettre}" data-recherche="{html.escape(slug(cle + ' ' + e['nom']).replace('-', ' '))}">
        <h2>{e["nom"]}</h2>
        <p>{e["definition"]}{lien}</p>
      </section>''')
molette = chr(10).join(
    f'      <button type="button" data-lettre="{l}"{"" if l in lettres_presentes else " disabled"}>{l}</button>'
    for l in (["#"] if "#" in lettres_presentes else []) + list("ABCDEFGHIJKLMNOPQRSTUVWXYZ"))
lex = tete("Lexique de l'électricien : les mots du métier expliqués",
           f"{len(glossaire)} termes de l'électricité du bâtiment expliqués simplement : DDR, AGCP, ICTA, régime TT, calibre, sensibilité, GTL…", "lexique.html")
lex += f'''  <main class="niveau page-lexique">
    <h1>Lexique de l'électricien</h1>
    <p class="niveau-objectif">{len(glossaire)} mots du métier, expliqués simplement. Tape quelques lettres, ou touche une lettre sur le côté pour y aller directement.</p>
    <input class="lexique-recherche" type="search" placeholder="Chercher un terme…" aria-label="Chercher un terme">
    <p class="lexique-vide" hidden>Aucun terme ne correspond.</p>
    <div class="lexique-liste">
{chr(10).join(entrees)}
    </div>
    <nav class="lexique-molette" aria-label="Aller à une lettre">
{molette}
    </nav>
    <div class="lexique-bulle" hidden></div>
  </main>
''' + PIED.replace('js/page.js', 'js/lexique.js')
open("lexique.html", "w", encoding="utf-8").write(lex)

# ---------- Pages d'outils et d'information
def page(fichier, titre, description, corps, script="js/page.js", classe="page-outil", robots=""):
    open(fichier, "w", encoding="utf-8").write(tete(titre, description, fichier, robots=robots) + f'  <main class="niveau {classe}">\n{corps}\n  </main>\n' + PIED.replace("js/page.js", script))


# ---------- Un QCM corrigé par cours, lisible par Google (qcm/NN-slug.html) + index qcm.html
THEMES = {1: "bases de l'électricité", 2: "loi d'Ohm et puissance", 3: "circuit électrique", 4: "série, parallèle, alternatif",
          5: "danger électrique", 6: "protection des personnes", 7: "salle de bain", 8: "indices IP, IK et classes",
          9: "habilitation et consignation", 10: "disjoncteurs et fusibles", 11: "tableau électrique", 12: "conducteurs et câbles",
          13: "conduits et modes de pose", 14: "GTL et circuits", 15: "schémas électriques", 16: "simple et double allumage",
          17: "va-et-vient et permutateur", 18: "télérupteur et minuterie", 19: "chauffe-eau, heures creuses", 20: "IRVE et domotique",
          21: "photovoltaïque"}
os.makedirs("qcm", exist_ok=True)
for f in glob.glob("qcm/*.html"): os.remove(f)
def choisir_questions(m, n=10):
    """10 questions réparties sur toutes les parties du cours (tour par tour, dans l'ordre de la banque)."""
    par_section = {}
    for i, q in enumerate(m["banque"]): par_section.setdefault(q.get("renvoi_lecon", 0), []).append(i)
    choisies, tour = [], 0
    while len(choisies) < min(n, len(m["banque"])):
        ajout = False
        for k in sorted(par_section):
            if tour < len(par_section[k]) and len(choisies) < n: choisies.append(par_section[k][tour]); ajout = True
        if not ajout: break
        tour += 1
    return sorted(choisies)
for m in modules:
    n = m["id"]
    qs = [m["banque"][i] for i in choisir_questions(m)]
    titre = f"QCM {THEMES[n]} corrigé : 10 questions"
    desc = f"10 questions corrigées sur {THEMES[n]}, avec les explications : entraîne-toi au QCM d'électricité du module {n}, puis fais le quiz complet."
    if len(desc) > 155: desc = f"10 questions corrigées et expliquées sur {THEMES[n]} (module {n}). Entraîne-toi, puis fais le quiz complet."
    lettres = "ABCD"
    items = []
    for j, q in enumerate(qs):
        choix = "".join(f"<li><b>{lettres[c]}.</b> {html.escape(texte_brut(x))}</li>" for c, x in enumerate(q["choix"]))
        sec = m["cours"]["sections"][q.get("renvoi_lecon", 0)]
        items.append(f'''      <section class="qcm-question">
        <h2>Question {j + 1}</h2>
        <p class="qcm-enonce">{html.escape(texte_brut(q["question"]))}</p>
        <ol class="qcm-choix">{choix}</ol>
        <details class="qcm-reponse"><summary>Voir la réponse</summary>
          <p><b>Réponse {lettres[q["bonne"]]} : {html.escape(texte_brut(q["choix"][q["bonne"]]))}</b></p>
          <p>{html.escape(texte_brut(q.get("explication", "")))}</p>
          <p class="qcm-renvoi">À revoir : <a href="{pages[n]}#s{q.get("renvoi_lecon", 0) + 1}">{texte_brut(sec["titre"])}</a></p>
        </details>
      </section>''')
    quiz = {"@context": "https://schema.org", "@type": "Quiz", "name": f"QCM {THEMES[n]} : 10 questions corrigées", "inLanguage": "fr", "url": SITE + qcm_pages[n],
            "about": {"@type": "Thing", "name": m["titre"]}, "educationalLevel": "Débutant à titre professionnel", "isAccessibleForFree": True,
            "hasPart": [{"@type": "Question", "eduQuestionType": "Multiple choice", "text": texte_brut(q["question"]),
                         "suggestedAnswer": [{"@type": "Answer", "text": texte_brut(x)} for i, x in enumerate(q["choix"]) if i != q["bonne"]],
                         "acceptedAnswer": {"@type": "Answer", "text": texte_brut(q["choix"][q["bonne"]]), "answerExplanation": {"@type": "Comment", "text": texte_brut(q.get("explication", ""))}}} for q in qs]}
    blocq = blocs[n]
    corps = f'''    {ariane([("Accueil", ""), ("QCM corrigés", "qcm.html"), (f"Bloc {blocq['id']}", "qcm.html"), (f"QCM {THEMES[n]}", None)])}
    {ld(quiz)}
    <p class="lecon-kicker">QCM CORRIGÉ · MODULE {n}</p>
    <h1>QCM {THEMES[n]} : 10 questions corrigées</h1>
    <p class="niveau-objectif">Dix questions tirées du cours <a href="{pages[n]}">{m["titre"]}</a>, réparties sur toutes ses parties. Réponds de tête, puis ouvre « Voir la réponse » : la bonne réponse, l'explication et la partie du cours à revoir.</p>
{chr(10).join(items)}
    <div class="page-actions"><a class="bouton-plein" href="{pages[n]}#quiz">Faire le quiz complet ({min(15, len(m["banque"]))} questions tirées parmi {len(m["banque"])})</a>
    <a class="bouton-creux" href="qcm.html">Tous les QCM</a></div>'''
    contenu = (tete(titre, desc, qcm_pages[n], base="../")
        + f'  <main class="niveau page-qcm">\n{corps}\n  </main>\n' + PIED)
    open(qcm_pages[n], "w", encoding="utf-8").write(contenu)
liste_qcm = ""
for b in parcours["blocs"]:
    ids = [x["id"] for x in b["niveaux"]]
    liste_qcm += f'''    <section class="outil-carte">
      <h2>Bloc {b["id"]} — {b["titre"]}</h2>
      <ul class="liste-modules">
''' + "\n".join(f'        <li><span><span class="num">{m["id"]}</span><a href="{qcm_pages[m["id"]]}">QCM {THEMES[m["id"]]}</a></span><span class="droite"><a href="{pages[m["id"]]}">le cours</a></span></li>' for m in modules if m["id"] in ids) + '''
      </ul>
    </section>
'''
page("qcm.html", "QCM d'électricité corrigés : 21 thèmes, 210 questions",
     "21 QCM d'électricité du bâtiment corrigés et expliqués, un par cours : loi d'Ohm, différentiel, tableau, câbles, va-et-vient, télérupteur, photovoltaïque…",
     f'''    <h1>QCM d'électricité corrigés</h1>
    <p class="niveau-objectif">Un QCM de 10 questions par cours, avec la réponse et l'explication à découvrir après avoir répondu. Pour aller plus loin, chaque cours propose un quiz complet tiré au hasard dans sa banque de questions, et l'<a href="examen.html">examen blanc</a> mélange les 21 modules.</p>
{liste_qcm}''')


# ---------- Une fiche mémo statique par cours (fiches/NN-slug.html) ; fiche.html devient l'index
os.makedirs("fiches", exist_ok=True)
for f in glob.glob("fiches/*.html"): os.remove(f)
for m in modules:
    n, c = m["id"], m["cours"]
    cartes = []
    for k, sec in enumerate(c["sections"]):
        img = f'<div class="fiche-carte-image">{img_svg(sec["svg"], texte_brut(sec["titre"]), premiere=(k == 0))}</div>' if sec.get("svg") else ""
        enc = f'<p class="fiche-carte-chantier"><strong>{sec["encadre"].get("titre") or "Sur le chantier"}</strong> {termes(sec["encadre"]["texte"])}</p>' if sec.get("encadre") else ""
        cartes.append(f'''      <section class="fiche-carte">
        {img}
        <div class="fiche-carte-corps">
          <h2><span class="fiche-carte-num">{k + 1}</span>{re.sub(r"^[0-9]+[.] *", "", sec["titre"])}</h2>
          <p class="fiche-carte-memo">{termes(sec.get("memo", ""))}</p>
          {enc}
        </div>
      </section>''')
    theme = THEMES[n]
    titre = f"Fiche mémo {theme} : l'essentiel"
    desc = f"L'essentiel du cours « {m['titre']} » en {len(c['sections'])} points illustrés, à relire avant un contrôle ou à imprimer."
    if len(desc) > 155: desc = f"L'essentiel du cours en {len(c['sections'])} points illustrés : {theme}. À relire avant un contrôle ou à imprimer."
    corps = f'''    {ariane([("Accueil", ""), ("Fiches mémo", "fiche.html"), (f"Bloc {blocs[n]['id']}", "fiche.html"), (m["titre"], None)])}
    <p class="lecon-kicker">FICHE MÉMO · MODULE {n}</p>
    <h1>Fiche mémo : {m["titre"]}</h1>
    <p class="niveau-objectif">{m["objectif"]}</p>
    <div class="page-actions"><button class="bouton-plein" type="button" onclick="window.print()">🖨 Imprimer ou enregistrer en PDF</button>
      <a class="bouton-creux" href="fiche.html?id={n}">Version à cocher, avec mini-test</a></div>
    <div class="fiche-cartes">
{chr(10).join(cartes)}
    </div>
    <p class="module-liens"><a href="{pages[n]}">📖 Le cours complet</a> · <a href="{qcm_pages[n]}">✅ Le QCM corrigé</a> · <a href="fiche.html">Toutes les fiches</a></p>'''
    open(fiche_pages[n], "w", encoding="utf-8").write(tete(titre, desc, fiche_pages[n], base="../") + f'  <main class="niveau page-fiche">\n{corps}\n  </main>\n' + PIED)

# ---------- Actualités
actu = json.load(open("data/actualites.json", encoding="utf-8"))["actualites"]

def actu_id(a): return "actu-" + slug(a["titre"])[:60]
cartes = "\n".join(f'''      <article class="actu" id="{actu_id(a)}">
        {f'<img class="actu-image" src="{a["image"]}" alt="{html.escape(a.get("image_alt", a["titre"]))}" width="1280" height="720"{"" if i == 0 else " loading=" + chr(34) + "lazy" + chr(34)}>' if a.get("image") else ""}
        <p class="actu-meta"><span class="actu-cat">{html.escape(a["categorie"])}</span> · {date_fr(a["date"])}</p>
        <h2>{html.escape(a["titre"])}</h2>
        <p>{html.escape(a["texte"])}</p>
        {f'<p class="actu-retenir"><b>À retenir :</b> {html.escape(a["a_retenir"])}</p>' if a.get("a_retenir") else ""}
        <p class="actu-source">Source : <a href="{html.escape(a["url"])}" rel="noopener" target="_blank">{html.escape(a["source"])}</a></p>
      </article>''' for i, a in enumerate(sorted(actu, key=lambda a: a["date"], reverse=True)))
page("actualites.html", "Actualités de l'électricien : normes, matériel",
     "Les nouveautés utiles aux électriciens et aux apprentis : normes, réglementation, Consuel, nouveau matériel. Chaque information est vérifiée et sourcée.",
     f'''    <h1>Actualités</h1>
    <p class="niveau-objectif">Normes, réglementation, nouveau matériel : ce qui change pour l'électricien. Chaque information est vérifiée sur une source officielle ou chez le fabricant, avec le lien pour aller plus loin.</p>
{cartes}
    <p class="note-affiliation">Une information te semble fausse ou dépassée ? Elle est datée : la norme ou le texte cité fait toujours foi.</p>''')

# ---------- Calculateurs
def champ(nom, label, valeur="", unite="", aide=""):
    return f'<label class="calc-champ"><span>{label}</span><span class="calc-entree"><input name="{nom}" inputmode="decimal" value="{valeur}" placeholder="{aide}">{f"<i>{unite}</i>" if unite else ""}</span></label>'
def carte_calc(id_, titre, intro, champs, lien, lien_txt, apres=""):
    return f'''    <section class="calc" id="{id_}">
      <h2>{titre}</h2>
      <p class="calc-intro">{intro}</p>
      <div class="calc-champs">{champs}</div>{apres}
      <p class="calc-resultat" aria-live="polite"></p>
      <p class="calc-detail"></p>
      <p class="calc-lien">Pour comprendre : <a href="{pages[lien]}">{lien_txt}</a></p>
    </section>'''
calc = "\n".join([
  carte_calc("calc-energie", "Combien consomme un appareil ?", "La puissance est écrite sur la plaque de l'appareil. Le prix du kWh est sur ta facture d'électricité.",
    champ("p","Puissance","2000","W")+champ("h","Durée par jour","2","h")+champ("j","Nombre de jours","30","jours")+champ("prix","Prix du kWh (facultatif)","","€","ex. 0,25"),
    2, "module 2, l'énergie E = P × t"),
  carte_calc("calc-courant", "Quel courant appelle un appareil ?", "On lit la puissance sur la plaque signalétique et on en déduit le courant : I = P / U.",
    champ("p","Puissance","2300","W")+champ("u","Tension","230","V"),
    2, "module 2, la puissance P = U × I"),
  carte_calc("calc-section", "Section du câble et calibre du disjoncteur", "Le repère de base entre la section des conducteurs en cuivre et le calibre maximal du disjoncteur qui les protège.",
    '<div class="calc-choix"><label><input type="radio" name="sens" value="section" checked> J\'ai une section</label><label><input type="radio" name="sens" value="calibre"> J\'ai un calibre</label></div>'
    +'<label class="calc-champ"><span>Section</span><select name="section"><option value="1.5">1,5 mm²</option><option value="2.5" selected>2,5 mm²</option><option value="6">6 mm²</option><option value="10">10 mm²</option><option value="16">16 mm²</option></select></label>'
    +'<label class="calc-champ"><span>Calibre du disjoncteur</span><select name="calibre"><option>10</option><option selected>16</option><option>20</option><option>32</option><option>40</option><option>63</option></select></label>',
    12, "module 12, la section et le courant",
    '\n      <p class="calc-note">Certains circuits ont leurs propres règles : éclairage, prises, plaque de cuisson… voir le module 14.</p>'),
  carte_calc("calc-differentiel", "Calibre d'un interrupteur différentiel", "Liste les disjoncteurs placés derrière le différentiel. Coche ceux qui se comptent en entier.",
    '<div class="calc-liste"></div><button type="button" class="bouton-creux calc-plus">+ Ajouter un disjoncteur</button>'
    +champ("agcp","Calibre de l'AGCP (facultatif, méthode amont)","","A","ex. 45"),
    11, "module 11, les méthodes amont et aval"),
  carte_calc("calc-chute", "Chute de tension sur une longue ligne", "Une ligne en monophasé 230 V, en cuivre. La longueur est celle du câble, du tableau à l'appareil.",
    champ("l","Longueur du câble","40","m")+champ("i","Courant","16","A")
    +'<label class="calc-champ"><span>Section</span><select name="s"><option value="1.5">1,5 mm²</option><option value="2.5" selected>2,5 mm²</option><option value="6">6 mm²</option><option value="10">10 mm²</option><option value="16">16 mm²</option></select></label>'
    +'<label class="calc-champ"><span>Usage</span><select name="usage"><option value="eclairage">éclairage (3 %)</option><option value="autre" selected>autres usages (5 %)</option></select></label>',
    12, "module 12, la chute de tension",
    '\n      <p class="calc-note">Hypothèses : cuivre en service (0,0225 Ω·mm²/m), circuit résistif (cos φ = 1). C\'est un ordre de grandeur pour apprendre, pas une note de calcul.</p>'),
])
page("calculateurs.html", "Calculateurs : section de câble, courant, chute de tension",
     "Calculateurs gratuits : consommation d'un appareil, courant, section de câble et calibre, calibre du différentiel, chute de tension. Calcul pas à pas.",
     f'''    <h1>Calculateurs</h1>
    <p class="niveau-objectif">Tape tes valeurs : le résultat s'affiche tout de suite, avec le calcul détaillé et le lien vers le cours qui l'explique. Ces outils servent à apprendre et à vérifier un ordre de grandeur ; ils ne remplacent pas l'étude d'une installation.</p>
    <nav class="calc-sommaire"><a href="calculateurs.html#calc-energie">Consommation</a><a href="calculateurs.html#calc-courant">Courant</a><a href="calculateurs.html#calc-section">Section</a><a href="calculateurs.html#calc-differentiel">Différentiel</a><a href="calculateurs.html#calc-chute">Chute de tension</a></nav>
{calc}''', script="js/calculateurs.js")

# ---------- Configurateur de tableau
def ch(nom, label, v):
    return f'<label class="calc-champ"><span>{label}</span><span class="calc-entree"><input name="{nom}" inputmode="numeric" value="{v}"></span></label>'
def cb(nom, label, on=False):
    return f'<label class="config-cb"><input type="checkbox" name="{nom}"{" checked" if on else ""}> {label}</label>'
page("configurateur.html", "Configurateur de tableau électrique NF C 15-100",
     "Compose le tableau électrique d'un logement : circuits, interrupteurs différentiels, calibres, rangées et réserve, selon la NF C 15-100. Outil gratuit.",
     f'''    <h1>Configurateur de tableau</h1>
    <p class="niveau-objectif">Décris le logement : l'outil compose le tableau en appliquant les règles des cours, et montre chaque vérification. C'est un outil pour apprendre et préparer un projet : les choix réels se font avec un professionnel, sur l'installation.</p>
    <div class="config">
      <form class="config-form calc" onsubmit="return false">
        <h2>Le logement</h2>
        <div class="calc-champs"><label class="calc-champ"><span>Type de logement</span><select name="logement"><option value="maison" selected>Maison individuelle</option><option value="appartement">Appartement</option></select></label>{ch("surface","Surface (m²)","70")}{ch("points","Points lumineux","12")}{ch("prises","Prises de courant (hors cuisine)","16")}
          <label class="calc-champ"><span>Section des prises</span><select name="sectionPrises"><option value="2.5" selected>2,5 mm² (20 A, 12 prises max)</option><option value="1.5">1,5 mm² (16 A, 8 prises max)</option></select></label></div>
        <h2>Les circuits spécialisés</h2>
        <div class="config-cbs">{cb("cuisine","Prises de la cuisine",True)}{cb("plaque","Plaque de cuisson",True)}{cb("four","Four",True)}{cb("lavelinge","Lave-linge",True)}{cb("lavevaisselle","Lave-vaisselle",True)}{cb("sechelinge","Sèche-linge")}{cb("chauffeeau","Chauffe-eau",True)}{cb("vmc","VMC",True)}{cb("recharge","Prise renforcée pour véhicule")}</div>
        <h2>Le disjoncteur de branchement (AGCP)</h2>
        <div class="calc-champs"><label class="calc-champ"><span>Réglage de l'AGCP</span><select name="agcp"><option value="">Je ne le connais pas</option><option value="15">15 A (abonnement 3 kVA)</option><option value="30">30 A (abonnement 6 kVA)</option><option value="45">45 A (abonnement 9 kVA)</option><option value="60">60 A (abonnement 12 kVA)</option></select></label>
          <label class="calc-champ"><span>Calibre des différentiels</span><select name="methode"><option value="aval">Aval (d'après les disjoncteurs)</option><option value="amont">Amont (d'après l'AGCP)</option></select></label></div>
      </form>
      <section class="config-resultat" aria-live="polite"></section>
    </div>
    <p class="calc-note">Règles utilisées (modules 11, 14 et 20) : éclairage 8 points max par circuit et 2 circuits au-delà de 35 m² ; prises 12 max en 2,5 mm² ou 8 max en 1,5 mm² ; au moins 2 différentiels 30 mA dont 1 type AC et 1 type A ; 8 disjoncteurs max par différentiel ; calibre par la méthode aval ; réserve de 20 % en maison individuelle ou de 6 modules en appartement ; 2 prises modulaires (comptées 2,5 modules chacune, selon le modèle) ; rangées de 13 modules, sans rangée laissée vide. Le chauffage électrique et les appareils qui demandent un différentiel de type F (pompe à chaleur, climatisation, pompe de piscine) ne sont pas pris en compte.</p>
    <p class="calc-lien">Pour comprendre : <a href="{pages[11]}">module 11, le tableau et ses différentiels</a> · <a href="{pages[14]}">module 14, les circuits du logement</a></p>''', script="js/configurateur.js")

par_bloc = ""
for b in parcours["blocs"]:
    ids = [n["id"] for n in b["niveaux"]]
    lignes = "\n".join(f'        <li><span><span class="num">{m["id"]}</span><a href="{pages[m["id"]]}">{m["titre"]}</a></span><span class="droite">{len(m["banque"])} questions</span></li>' for m in modules if m["id"] in ids)
    par_bloc += f'''    <section class="outil-carte">
      <h2>Bloc {b["id"]} — {b["titre"]}</h2>
      <p>{b.get("description", "")}</p>
      <ul class="liste-modules">
{lignes}
      </ul>
    </section>
'''
nbq = sum(len(m["banque"]) for m in modules)
page("cours.html", "Cours d'électricité du bâtiment : les 21 cours gratuits",
     f"Les {len(modules)} cours d'ApprendreElec, classés par bloc : bases, sécurité, tableau et conducteurs, montages d'éclairage, applications.",
     f'''    <h1>Tous les cours</h1>
    <p class="niveau-objectif">{len(modules)} cours illustrés, {nbq} questions. Chaque cours se lit sur une seule page, puis se vérifie par un quiz.</p>
{par_bloc}''')

page("examen.html", "Examen blanc d'électricité : 40 questions corrigées",
     "Entraîne-toi avec un examen blanc de 40 questions tirées au hasard dans les 21 modules, chronométré, avec ta note sur 20 et les modules à revoir.",
     '''    <h1>Examen blanc</h1>
    <p class="niveau-objectif">40 questions tirées au hasard dans tous les modules, en 40 minutes. À la fin : ta note sur 20 et les modules à revoir.</p>
    <div class="examen-zone">
      <section class="outil-carte">
        <h2>Comment ça se passe</h2>
        <ul>
          <li>40 questions, au moins une par module.</li>
          <li>40 minutes : le chrono reste affiché en haut de l'écran.</li>
          <li>La correction arrive à la fin, avec un lien vers chaque cours à revoir.</li>
          <li>Les questions ratées sont ajoutées à « Mes erreurs ».</li>
        </ul>
        <p>C'est un entraînement : il ne reproduit pas le déroulement officiel d'un examen.</p>
        <h2>Ce que couvre l'examen blanc</h2>
        <p>Les questions sont tirées dans toute la banque des 21 cours : les bases (courant, tension, loi d'Ohm, puissance), la sécurité (danger électrique, protection des personnes, salle de bain, indices IP et IK, habilitation et consignation), le tableau et les conducteurs (disjoncteurs, différentiels, sections, conduits, GTL), les montages d'éclairage (simple allumage, va-et-vient, télérupteur, minuterie) et les applications (eau chaude, recharge de véhicule, photovoltaïque).</p>
        <h2>Pour en tirer le meilleur</h2>
        <p>Passe-le d'une traite, sans tes notes, comme un vrai contrôle. Une note sous 12 sur 20 montre les modules à reprendre : relis leur fiche mémo, refais leur <a href="qcm.html">QCM corrigé</a>, puis repasse un examen : les questions changent à chaque fois.</p>
        <div class="page-actions"><button class="bouton-plein examen-demarrer" type="button">Commencer l'examen blanc</button></div>
      </section>
    </div>''', script="js/examen.js")

page("erreurs.html", "Mes erreurs : réviser les questions ratées",
     "Retrouve les questions que tu as ratées dans les quiz et l'examen blanc, et rejoue-les jusqu'à les réussir.",
     '''    <h1>Mes erreurs</h1>
    <p class="niveau-objectif">Les questions que tu as ratées sont gardées ici. Réponds juste, et elles disparaissent de la liste.</p>
    <div class="erreurs-zone"><p class="niveau-message">Chargement…</p></div>''', script="js/erreurs.js", robots="noindex")

page("fiche.html", "Fiches mémo d'électricité à imprimer : les 21 cours",
     "L'essentiel de chaque cours en une page : les fiches mémo d'ApprendreElec, à relire avant un contrôle ou à imprimer.",
     '''    <div class="fiche-zone">
    <h1>Fiches mémo</h1>
    <p class="niveau-objectif">L'essentiel de chaque cours en quelques cartes illustrées : à relire avant un contrôle, à imprimer, ou à réviser en cochant ce que tu sais déjà.</p>
''' + "".join(f'''    <section class="outil-carte">
      <h2>Bloc {b["id"]} — {b["titre"]}</h2>
      <ul class="liste-modules">
''' + "\n".join(f'        <li><span><span class="num">{m["id"]}</span><a href="{fiche_pages[m["id"]]}">{m["titre"]}</a></span><span class="droite">{len(m["cours"]["sections"])} cartes</span></li>' for m in modules if m["id"] in [x["id"] for x in b["niveaux"]]) + '''
      </ul>
    </section>
''' for b in parcours["blocs"]) + '''    </div>''', script="js/fiche.js")

page("materiel.html", "Outils de l'apprenti électricien : quoi acheter",
     "Les outils et les appareils de mesure à avoir pour débuter en électricité du bâtiment, et ce qu'il faut vérifier avant d'acheter.",
     '''    <h1>Le matériel de l'apprenti</h1>
    <p class="niveau-objectif">Ce qu'il faut avoir dans sa caisse pour débuter, et ce qu'il faut regarder avant d'acheter. Aucune marque imposée : des critères.</p>
    <h2>D'abord la sécurité</h2>
    <ul>
      <li><b>Un vérificateur d'absence de tension (VAT).</b> C'est l'achat numéro un. Un appareil dédié, pas un multimètre ni un tournevis testeur. On le contrôle avant et après chaque vérification (module 9).</li>
      <li><b>Des tournevis isolés 1 000 V.</b> Plats et cruciformes, avec le marquage 1 000 V sur le manche. L'isolant ne doit être ni fendu ni écaillé.</li>
      <li><b>Une pince coupante, une pince plate et une pince à dénuder isolées 1 000 V.</b> Même marquage, même exigence.</li>
      <li><b>Des gants isolants et un écran facial</b>, si tu interviens au voisinage de pièces sous tension. Les gants se vérifient avant chaque usage.</li>
      <li><b>Un cadenas de consignation et sa pancarte.</b> Quelques euros, et c'est ce qui empêche quelqu'un de te remettre le courant (module 9).</li>
    </ul>
    <h2>Pour mesurer</h2>
    <ul>
      <li><b>Un multimètre.</b> Tension, continuité, résistance. Regarde sa catégorie de mesure : CAT III 600 V au minimum pour travailler sur une installation de bâtiment. Il ne remplace pas le VAT.</li>
      <li><b>Une pince ampèremétrique</b>, pour mesurer un courant sans ouvrir le circuit.</li>
      <li><b>Un testeur de prise</b>, pour un premier contrôle rapide de la terre et de la polarité.</li>
    </ul>
    <h2>Pour poser</h2>
    <ul>
      <li><b>Un niveau, un mètre, un cordeau.</b> Une pose apparente se juge à l'œil (module 13).</li>
      <li><b>Un dénude-câble et un couteau d'électricien</b>, pour dégainer sans blesser l'âme.</li>
      <li><b>Une pince à sertir et des embouts</b>, pour tous les fils souples (module 12).</li>
      <li><b>Un tire-fil</b>, pour passer les conducteurs dans les conduits.</li>
      <li><b>Une lampe frontale.</b> On travaille souvent disjoncteur ouvert, donc dans le noir.</li>
    </ul>
    <h2>Pour apprendre</h2>
    <ul>
      <li><b>Un guide illustré de la NF C 15-100</b> dans son édition la plus récente. La norme évolue : vérifie l'année avant d'acheter.</li>
      <li><b>Une platine d'entraînement</b> : une planche, un petit tableau, quelques interrupteurs, des boutons-poussoirs, un télérupteur. Câbler les montages du bloc 4 pour de vrai, hors tension puis sous la surveillance d'un formateur, vaut toutes les lectures.</li>
    </ul>
    <p class="note-affiliation">Cette page ne contient pour l'instant aucun lien commercial. Si des liens vers des boutiques y sont ajoutés un jour, ils seront signalés comme liens affiliés : ApprendreElec touchera alors une petite commission, sans surcoût pour toi, et les critères ci-dessus ne changeront pas.</p>''', classe="page-simple")

page("a-propos.html", "À propos d'ApprendreElec : qui écrit ce site",
     "ApprendreElec est un site gratuit pour apprendre l'électricité du bâtiment : qui l'a fait, pour qui, et comment s'en servir.",
     f'''    <h1>À propos</h1>
    <p>ApprendreElec est un site gratuit pour apprendre l'électricité du bâtiment, du tout premier circuit jusqu'au niveau attendu pour le titre professionnel d'Électricien d'Équipement du Bâtiment.</p>
    <h2>Pour qui ?</h2>
    <p>Pour les candidats au TP Électricien, les élèves en formation, les professionnels qui révisent, et les curieux motivés. Le vocabulaire est celui du métier et des normes ; chaque terme technique est expliqué dans le <a href="lexique.html">lexique</a>.</p>
    <h2>Ce qu'on y trouve</h2>
    <ul>
      <li>{len(modules)} cours illustrés, en cinq blocs : <a href="cours.html">la liste complète</a>.</li>
      <li>{nbq} questions de quiz, tirées au hasard à chaque tentative.</li>
      <li>Un <a href="examen.html">examen blanc</a> chronométré, la révision de <a href="erreurs.html">tes erreurs</a>, et des <a href="fiche.html">fiches mémo</a> à imprimer.</li>
      <li>Un <a href="atelier-depannage.html">atelier de dépannage</a> (six interventions) pour s'entraîner à chercher une panne, et un <a href="atelier-schemas.html">atelier schémas</a> pour câbler soi-même les montages d'éclairage.</li>
    </ul>
    <h2>Qui l'a fait ?</h2>
    <p>Le site est conçu par Charly, en formation au TP Électricien d'Équipement du Bâtiment. Tout le contenu est original : aucun cours n'est recopié.</p>
    <h2>À garder en tête</h2>
    <p>ApprendreElec est un outil de révision. Il ne remplace ni une formation, ni un formateur, ni le texte des normes, qui évoluent. Une erreur a pu se glisser : en cas de doute, c'est la norme en vigueur et ton formateur qui font foi.</p>
    <p><b>On n'intervient jamais sur une installation électrique sans y être formé et habilité.</b> Toute intervention se fait hors tension, absence de tension vérifiée.</p>''', classe="page-simple")

page("mentions-legales.html", "Mentions légales | ApprendreElec",
     "Mentions légales du site ApprendreElec : éditeur, hébergeur, données personnelles, propriété du contenu.",
     '''    <h1>Mentions légales</h1>
    <h2>Éditeur</h2>
    <p>ApprendreElec est un site personnel, non commercial, édité par un particulier (Charly).</p>
    <h2>Hébergeur</h2>
    <p>GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>
    <h2>Données personnelles</h2>
    <p>Le site ne demande aucune inscription. Il n'affiche aucune publicité et n'utilise pas de cookies publicitaires.</p>
    <p><b>Mesure de fréquentation.</b> Pour savoir combien de personnes visitent le site et quelles pages sont utiles, le site utilise Google Analytics, un service de Google. Cet outil ne se charge que si tu cliques sur « Accepter » dans le bandeau affiché à ta première visite. Si tu refuses, rien n'est envoyé à Google et le site fonctionne de la même façon. Tu peux changer d'avis à tout moment : <a href="#" data-gerer-mesure>gérer les cookies</a>.</p>
    <p>Ta progression, tes électrons, tes réglages et la liste de tes erreurs sont enregistrés uniquement dans ton navigateur, sur ton appareil. Rien n'est envoyé à un serveur. Si tu effaces les données de navigation, ou si tu changes d'appareil, cette progression est perdue.</p>
    <h2>Propriété du contenu</h2>
    <p>Les textes, les questions et les illustrations sont des créations originales. Leur reproduction sans autorisation n'est pas permise.</p>
    <h2>Responsabilité</h2>
    <p>Le contenu est fourni à des fins pédagogiques. Il ne remplace ni une formation, ni les normes en vigueur, ni l'avis d'un professionnel qualifié. L'éditeur ne peut être tenu responsable de l'usage qui en est fait. Les travaux sur une installation électrique doivent être réalisés par des personnes formées et habilitées.</p>''', classe="page-simple")

# ---------- Plan du site
jour = datetime.date.today().isoformat()
urls_lex = sorted(f"lexique/{slug(c)}.html" for c in LEX_PAGES)
urls = ["", "qcm.html"] + list(qcm_pages.values()) + list(fiche_pages.values()) + ["cours.html", "calculateurs.html", "configurateur.html", "actualites.html", "lexique.html", "examen.html", "fiche.html", "materiel.html", "atelier-depannage.html", "atelier-schemas.html", "a-propos.html"] + [pages[m["id"]] for m in modules] + urls_lex
open("sitemap.xml", "w", encoding="utf-8").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{SITE}{u}</loc><lastmod>{jour}</lastmod></url>\n" for u in urls) + "</urlset>\n")
print(len(modules), "pages de cours,", len(glossaire), "termes dont", len(LEX_PAGES), "avec leur page,", len(urls), "adresses dans le plan du site")
