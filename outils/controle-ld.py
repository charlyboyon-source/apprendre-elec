#!/usr/bin/env python3
"""Valide les données structurées (JSON-LD) de toutes les pages du plan du site : JSON lisible et champs obligatoires."""
import re, json, os, sys
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://apprendre-electricite.fr/"
OBLIG = {"WebSite": ["name", "url"], "Organization": ["name", "url"], "LearningResource": ["name", "description", "inLanguage", "isAccessibleForFree", "educationalLevel", "dateModified", "author"],
         "BreadcrumbList": ["itemListElement"], "DefinedTerm": ["name", "description", "inDefinedTermSet"], "Quiz": ["name", "hasPart"], "Question": ["text", "acceptedAnswer"], "NewsArticle": ["headline", "datePublished", "author"]}
def objets(o):
    if isinstance(o, dict):
        yield o
        for v in o.values(): yield from objets(v)
    elif isinstance(o, list):
        for v in o: yield from objets(v)
sm = open(os.path.join(RACINE, "sitemap.xml"), encoding="utf-8").read()
erreurs, compte = 0, {}
for u in re.findall(r"<loc>([^<]+)</loc>", sm):
    f = os.path.join(RACINE, u.replace(SITE, "") or "index.html")
    h = open(f, encoding="utf-8").read()
    for bloc in re.findall(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
        try: data = json.loads(bloc.replace("<\\/", "</"))
        except Exception as err: print("✘", f, "JSON illisible", err); erreurs += 1; continue
        for o in objets(data):
            t = o.get("@type")
            if t in OBLIG:
                compte[t] = compte.get(t, 0) + 1
                manque = [c for c in OBLIG[t] if c not in o]
                if manque: print("✘", f, t, "manque", manque); erreurs += 1
            if t == "BreadcrumbList":
                for i, it in enumerate(o["itemListElement"]):
                    if "item" not in it and i < len(o["itemListElement"]) - 1: print("✘", f, "fil d'Ariane sans lien au rang", i + 1); erreurs += 1
print(compte, "—", erreurs, "erreur(s)")
sys.exit(1 if erreurs else 0)
