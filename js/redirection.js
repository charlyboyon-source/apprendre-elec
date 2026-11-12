// Anciennes adresses niveau.html?id=N&module=… : on renvoie vers la page du cours.
const p = new URLSearchParams(location.search);
const id = p.get("id");
const ancre = { quiz: "#quiz", jeu: "#jeu" }[p.get("module")] || "";
fetch("data/pages-cours.json").then((r) => r.json()).then((pages) => {
  location.replace(pages[id] ? pages[id] + ancre : "cours.html");
}).catch(() => location.replace("cours.html"));
