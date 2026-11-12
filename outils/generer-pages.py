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

def termes(h):
    return re.sub(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]",
                  lambda m: f'<a class="terme-lien" href="lexique.html#{slug(m.group(1))}">{m.group(2) or m.group(1)}</a>', h)

def tete(titre, description, chemin, base=""):
    e = html.escape
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {f'<base href="{base}">' if base else ''}
  <title>{e(titre)}</title>
  <meta name="description" content="{e(description)}">
  <link rel="canonical" href="{SITE}{chemin}">
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
    <a href="index.html">Le parcours</a> · <a href="lexique.html">Lexique</a> · <a href="examen.html">Examen blanc</a> · <a href="actualites.html">Actualités</a> · <a href="a-propos.html">À propos</a> · <a href="mentions-legales.html">Mentions légales</a> · <a href="#" data-gerer-mesure>Gérer les cookies</a>
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

for f in glob.glob("cours/*.html"): os.remove(f)

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
    <p class="module-liens"><a href="fiche.html?id={n}">🖨 La fiche mémo de ce cours</a></p>'''
    secs = []
    for k, s in enumerate(c["sections"]):
        fig = f'<div class="lecon-figure"><img src="assets/svg/{s["svg"]}" alt="{html.escape(texte_brut(s["titre"]))}" loading="lazy"></div>' if s.get("svg") else ""
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
    page = tete(f'{m["titre"]} — cours d\'électricité gratuit | ApprendreElec',
                f'{m["objectif"]}. Cours complet, illustré, avec quiz de {len(m["banque"])} questions.', pages[n], base="../")
    page += f'''  <main class="niveau page-cours" data-module="{n}">
    <p class="lecon-kicker">BLOC {bloc["id"]} · {bloc["titre"].upper()} · MODULE {n}</p>
    <h1>{m["titre"]}</h1>
    <p class="niveau-objectif">{m["objectif"]}</p>
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
    <p class="module-liens"><a href="fiche.html?id={n}">🖨 La fiche mémo de ce cours</a></p>
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
    lien = f' <a class="lexique-lien" href="{pages[e["niveau_associe"]]}">Voir le cours →</a>' if e.get("niveau_associe") in pages else ""
    entrees.append(f'''      <section class="lexique-entree" id="{slug(cle)}" data-lettre="{lettre}" data-recherche="{html.escape(slug(cle + ' ' + e['nom']).replace('-', ' '))}">
        <h2>{e["nom"]}</h2>
        <p>{e["definition"]}{lien}</p>
      </section>''')
molette = chr(10).join(
    f'      <button type="button" data-lettre="{l}"{"" if l in lettres_presentes else " disabled"}>{l}</button>'
    for l in (["#"] if "#" in lettres_presentes else []) + list("ABCDEFGHIJKLMNOPQRSTUVWXYZ"))
lex = tete("Lexique de l'électricien — les mots du métier expliqués | ApprendreElec",
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
def page(fichier, titre, description, corps, script="js/page.js", classe="page-outil"):
    open(fichier, "w", encoding="utf-8").write(tete(titre, description, fichier) + f'  <main class="niveau {classe}">\n{corps}\n  </main>\n' + PIED.replace("js/page.js", script))

# ---------- Actualités
actu = json.load(open("data/actualites.json", encoding="utf-8"))["actualites"]
MOIS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]
def date_fr(d):
    a, m, j = d.split("-"); return f"{int(j)} {MOIS[int(m)-1]} {a}"
def actu_id(a): return "actu-" + slug(a["titre"])[:60]
cartes = "\n".join(f'''      <article class="actu" id="{actu_id(a)}">
        {f'<img class="actu-image" src="{a["image"]}" alt="" loading="lazy">' if a.get("image") else ""}
        <p class="actu-meta"><span class="actu-cat">{html.escape(a["categorie"])}</span> · {date_fr(a["date"])}</p>
        <h2>{html.escape(a["titre"])}</h2>
        <p>{html.escape(a["texte"])}</p>
        {f'<p class="actu-retenir"><b>À retenir :</b> {html.escape(a["a_retenir"])}</p>' if a.get("a_retenir") else ""}
        <p class="actu-source">Source : <a href="{html.escape(a["url"])}" rel="noopener" target="_blank">{html.escape(a["source"])}</a></p>
      </article>''' for a in sorted(actu, key=lambda a: a["date"], reverse=True))
page("actualites.html", "Actualités de l'électricité du bâtiment : normes, Consuel, matériel | ApprendreElec",
     "Les nouveautés utiles aux électriciens et aux apprentis : normes, réglementation, Consuel, nouveau matériel. Chaque information est vérifiée et sourcée.",
     f'''    <h1>Actualités</h1>
    <p class="niveau-objectif">Normes, réglementation, nouveau matériel : ce qui change pour l'électricien. Chaque information est vérifiée sur une source officielle ou chez le fabricant, avec le lien pour aller plus loin.</p>
{cartes}
    <p class="note-affiliation">Une information te semble fausse ou dépassée ? Elle est datée : la norme ou le texte cité fait toujours foi.</p>''')

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
page("cours.html", "Tous les cours d'électricité du bâtiment — ApprendreElec",
     f"Les {len(modules)} cours d'ApprendreElec, classés par bloc : bases, sécurité, tableau et conducteurs, montages d'éclairage, applications.",
     f'''    <h1>Tous les cours</h1>
    <p class="niveau-objectif">{len(modules)} cours illustrés, {nbq} questions. Chaque cours se lit sur une seule page, puis se vérifie par un quiz.</p>
{par_bloc}''')

page("examen.html", "Examen blanc d'électricité du bâtiment — 40 questions | ApprendreElec",
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
        <div class="page-actions"><button class="bouton-plein examen-demarrer" type="button">Commencer l'examen blanc</button></div>
      </section>
    </div>''', script="js/examen.js")

page("erreurs.html", "Mes erreurs — réviser les questions ratées | ApprendreElec",
     "Retrouve les questions que tu as ratées dans les quiz et l'examen blanc, et rejoue-les jusqu'à les réussir.",
     '''    <h1>Mes erreurs</h1>
    <p class="niveau-objectif">Les questions que tu as ratées sont gardées ici. Réponds juste, et elles disparaissent de la liste.</p>
    <div class="erreurs-zone"><p class="niveau-message">Chargement…</p></div>''', script="js/erreurs.js")

page("fiche.html", "Fiches mémo d'électricité à imprimer — ApprendreElec",
     "L'essentiel de chaque cours en une page : les fiches mémo d'ApprendreElec, à relire avant un contrôle ou à imprimer.",
     '''    <div class="fiche-zone"><p class="niveau-message">Chargement…</p></div>''', script="js/fiche.js")

page("materiel.html", "Le matériel de l'apprenti électricien — quoi acheter, quoi vérifier | ApprendreElec",
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

page("a-propos.html", "À propos d'ApprendreElec",
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
      <li>Un <a href="atelier-depannage.html">atelier de dépannage</a> pour s'entraîner à chercher une panne.</li>
    </ul>
    <h2>Qui l'a fait ?</h2>
    <p>Le site est conçu par Charly, en formation au TP Électricien d'Équipement du Bâtiment. Tout le contenu est original : aucun cours n'est recopié.</p>
    <h2>À garder en tête</h2>
    <p>ApprendreElec est un outil de révision. Il ne remplace ni une formation, ni un formateur, ni le texte des normes, qui évoluent. Une erreur a pu se glisser : en cas de doute, c'est la norme en vigueur et ton formateur qui font foi.</p>
    <p><b>On n'intervient jamais sur une installation électrique sans y être formé et habilité.</b> Toute intervention se fait hors tension, absence de tension vérifiée.</p>''', classe="page-simple")

page("mentions-legales.html", "Mentions légales — ApprendreElec",
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
urls = ["", "cours.html", "actualites.html", "lexique.html", "examen.html", "fiche.html", "materiel.html", "atelier-depannage.html", "a-propos.html"] + [pages[m["id"]] for m in modules]
open("sitemap.xml", "w", encoding="utf-8").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "".join(f"  <url><loc>{SITE}{u}</loc><lastmod>{jour}</lastmod></url>\n" for u in urls) + "</urlset>\n")
print(len(modules), "pages de cours,", len(glossaire), "termes,", len(urls), "adresses dans le plan du site")
