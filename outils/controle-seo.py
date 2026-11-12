#!/usr/bin/env python3
"""Contrôle de référencement sur toutes les pages du plan du site.

    python3 outils/controle-seo.py            # fichiers locaux
    python3 outils/controle-seo.py --en-ligne # site publié

Pour chaque adresse de sitemap.xml : titre ≤ 60 caractères, description ≤ 155,
un seul h1, un canonical, pas de noindex, au moins 150 mots visibles dans le HTML.
"""
import re, sys, os, html, urllib.request

SITE = "https://apprendre-electricite.fr/"
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EN_LIGNE = "--en-ligne" in sys.argv

def lire(chemin):
    if EN_LIGNE:
        req = urllib.request.Request(SITE + chemin + ("?v=controle" if chemin else ""), headers={"User-Agent": "controle-seo"})
        return urllib.request.urlopen(req, timeout=20).read().decode("utf-8")
    f = os.path.join(RACINE, chemin or "index.html")
    return open(f, encoding="utf-8").read()

sitemap = lire("sitemap.xml") if EN_LIGNE else open(os.path.join(RACINE, "sitemap.xml"), encoding="utf-8").read()
adresses = [u.replace(SITE, "") for u in re.findall(r"<loc>([^<]+)</loc>", sitemap)]
problemes = 0
for chemin in adresses:
    try:
        h = lire(chemin)
    except Exception as err:
        print(f"✘ {chemin or '/'} : illisible ({err})"); problemes += 1; continue
    titre = html.unescape((re.search(r"<title>(.*?)</title>", h, re.S) or [None, ""])[1]).strip()
    desc = re.search(r'<meta name="description" content="([^"]*)"', h)
    desc = html.unescape(desc.group(1)) if desc else ""
    h1 = len(re.findall(r"<h1[\s>]", h))
    canon = re.search(r'<link rel="canonical" href="([^"]+)"', h)
    noindex = re.search(r'<meta name="robots" content="[^"]*noindex', h)
    corps = re.sub(r"<(script|style|svg)[\s\S]*?</\1>", " ", h)
    corps = re.sub(r"<head[\s\S]*?</head>", " ", corps)
    mots = len(re.findall(r"[A-Za-zÀ-ÿ0-9]+", html.unescape(re.sub(r"<[^>]+>", " ", corps))))
    defauts = []
    if not titre or len(titre) > 60: defauts.append(f"titre {len(titre)} car.")
    if not desc or len(desc) > 155: defauts.append(f"description {len(desc)} car.")
    if h1 != 1: defauts.append(f"{h1} h1")
    if not canon: defauts.append("pas de canonical")
    elif canon.group(1) != SITE + chemin: defauts.append(f"canonical {canon.group(1)}")
    if noindex: defauts.append("noindex")
    if mots < 150: defauts.append(f"{mots} mots")
    if defauts:
        problemes += 1
        print(f"✘ {chemin or '/'} : " + ", ".join(defauts))
print(f"{len(adresses)} pages contrôlées, {problemes} avec un défaut ({'en ligne' if EN_LIGNE else 'local'}).")
sys.exit(1 if problemes else 0)
