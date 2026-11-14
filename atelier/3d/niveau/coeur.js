// Cœur du jeu des niveaux 2 à 6 de l'atelier dépannage : tout ce qui n'est pas de la 3D.
// Le joueur cherche. Il dispose d'un carnet qui se remplit tout seul, de questions au client, d'un indice en
// trois crans (méthode, zone, mesure : jamais la cause). La fin : trouver, prouver par une mesure, remettre en
// sécurité, expliquer. Toutes les valeurs viennent du moteur d'installation (../moteur/moteur.js).
// Ce fichier sert au jeu 3D (jeu.js) et aux tests (joueur automatique, avec Node).
import { creerInstallation } from "../moteur/moteur.js";

const fr = (x, d = 1) => x.toFixed(d).replace(".", ",").replace(/,0+$/, "");
export const heureFr = (h) => { const m = Math.round(h * 60) % 1440; return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`; };
// affichage du mesureur d'isolement : on compare, on ne donne pas de seuil
export function megohms(r) { if (r === Infinity || r > 2e8) return "plus de 200 MΩ"; const m = r / 1e6; return `${m >= 10 ? fr(m, 0) : m >= 0.1 ? fr(m, 1) : fr(m, 3)} MΩ`; }
const COUTS = { essayer: 0.5, manette: 0.25, test: 0.25, mode: 0.25, regler_horloge: 0.5, ouvrir: 2, fermer: 1, debrancher: 1, rebrancher: 1, mesurer: 0.5, question: 1, regarder: 0.25, deplacer: 0.5 };

export function creerPartie(N, cause) {
  const inst = creerInstallation(N.logement, [N.causes[cause]]), e = inst.etatInitial();
  if (N.preparer) N.preparer(e, cause);
  const T = N.logement.tableau, org = inst.organe;
  const P = {
    N, cause, inst, e, ouverts: new Set(), vus: new Set(), poses: [], soir: false,
    carnet: { constats: [], tableau: [], mesures: [], indices: [] },
    fautes: [], conseils: [], preuves: [], essais: new Set(), minutes: 0, indicesPris: 0, mauvaisDiagnostics: 0, mauvaisRemedes: 0,
    vat: { teste: false, absence: new Set() }, trouve: false, securise: false, fini: false, bilan: null, sansCourant: {},
  };
  const messages = [];
  const dire = (t, type = "info") => { messages.push({ t, type }); };
  const noter = (rubrique, t) => { const l = P.carnet[rubrique]; if (!l.includes(t)) l.push(t); };
  const faute = (t) => { if (!P.fautes.includes(t)) P.fautes.push(t); };
  const calc = () => inst.calculer(e);

  // ---- noms lisibles
  const nomProt = (id) => (id === T.agcp.id ? "le disjoncteur de branchement" : T.differentiels.some((d) => d.id === id) ? `l'interrupteur différentiel ${N.nomsDifferentiels[id]}` : `le disjoncteur « ${inst.etiquette(e, id)} »`);
  function nomBorne(b) {
    if (b.includes("#")) { const [cid, ext] = b.split("#"); const c = inst.conducteur[cid], autre = c[ext === "de" ? "vers" : "de"].split(".")[0]; return `bout du fil ${c.couleur} débranché (celui qui va vers ${nomOrgane(autre, true)})`; }
    const [id, borne] = b.split(".");
    if (N.nomsBornes && N.nomsBornes[b]) return N.nomsBornes[b];
    const p = inst.protections.find((x) => x.id === id);
    if (p) return `${{ Lout: "sortie phase", Nout: "sortie neutre", Lin: "arrivée phase", Nin: "arrivée neutre" }[borne]} de ${nomProt(id).replace(/^le |^l'/, "")}`;
    const lib = { ph: "borne de phase", n: "borne de neutre", pe: "borne de terre", L: "borne de phase", N: "borne de neutre", PE: "borne de terre", 1: "borne 1", 2: "borne 2", A1: "borne A1", A2: "borne A2" }[borne] || `borne ${borne}`;
    return `${lib} · ${nomOrgane(id, true)}`;
  }
  function nomOrgane(id, minuscule = false) { const o = org[id]; const n = o ? o.nom : inst.protections.some((p) => p.id === id) ? nomProt(id) : id === "bt" ? "bornier de terre" : id; return minuscule ? n.charAt(0).toLowerCase() + n.slice(1) : n; }

  // ---- le temps passe ; les protections peuvent déclencher
  function temps(min) {
    P.minutes += min;
    const ev = inst.avancer(e, min);
    declenchements(ev);
    for (const h of N.humeurs || []) if (P.minutes >= h.apres && !P.vus.has(`humeur:${h.apres}`)) { P.vus.add(`humeur:${h.apres}`); dire(h.texte, "client"); }
    for (const a of N.logement.appareils || []) if (N.fragiles && N.fragiles[a.id]) { const ok = calc().fonctionne(a.id); P.sansCourant[a.id] = ok ? 0 : (P.sansCourant[a.id] || 0) + min; if (P.sansCourant[a.id] >= N.fragiles[a.id].apres && !P.vus.has(`reproche:${a.id}`)) { P.vus.add(`reproche:${a.id}`); dire(N.fragiles[a.id].reproche, "client"); P.conseils.push(N.fragiles[a.id].conseil); } }
    return ev;
  }
  function declenchements(ev) {
    for (const d of ev) {
      dire(`Clac ! ${nomProt(d.id).replace(/^l/, "L")} vient de déclencher${d.raison === "court-circuit" ? ", d'un coup" : d.raison === "surintensite" ? ", après avoir chauffé un moment" : ""}.`, "alerte");
      if (d.raison === "court-circuit") P.vus.add(`cc:${d.id}`); if (d.raison === "surintensite") P.vus.add(`thermique:${d.id}`);
      noter("tableau", `${heureFr(d.heure !== undefined ? d.heure : e.env.heure)} : ${nomProt(d.id)} a déclenché${d.raison === "fuite" ? " (fuite vers la terre)" : ""}.`);
      P.vus.add(`declenche:${d.id}`);
    }
  }
  // ce qui se voit dans le logement : prises alimentées, lampes allumées, appareils en marche
  function etatVisible() { const r = calc(), v = {}; for (const o of inst.points) v[o.id] = o.type === "prise" ? r.alimente(o.id) : o.type === "point_lumineux" ? r.allume(o.id) : r.fonctionne(o.id); return v; }
  const sousTension = (bornes) => { const r = calc(); return bornes.some((b) => r.tension(b, "terre.PE") >= 50); };
  const bornesDe = (id) => inst.bornes(e).filter((b) => b.startsWith(`${id}.`) || (b.includes("#") && inst.logement.conducteurs.some((c) => `${c.id}#de` === b && c.de.startsWith(`${id}.`) || `${c.id}#vers` === b && c.vers.startsWith(`${id}.`))));

  // On débranche un câble entier : la phase et le neutre qui vont ensemble d'un organe à l'autre (la terre reste).
  // Sinon, le mesureur d'isolement « voit » encore l'aval à travers le neutre et les récepteurs.
  const organeDe = (b) => b.split(".")[0];
  // rôle d'une borne d'après les conducteurs qui y arrivent : phase, neutre, terre, retour
  function roleBorne(b) { if (b.includes("#")) return inst.conducteur[b.split("#")[0]].role; const c = N.logement.conducteurs.find((x) => x.de === b || x.vers === b); return c ? c.role : null; }
  const circuitBorne = (b) => { const c = b.includes("#") ? inst.conducteur[b.split("#")[0]] : N.logement.conducteurs.find((x) => x.de === b || x.vers === b); return c ? c.circuit : null; };
  function jumeaux(cid) { const c = inst.conducteur[cid]; return N.logement.conducteurs.filter((x) => x.role !== "terre" && x.circuit === c.circuit && ((organeDe(x.de) === organeDe(c.de) && organeDe(x.vers) === organeDe(c.vers)))); }

  // ---- une mesure d'isolement prouve la cause si elle est mauvaise, et si aucune autre cause possible ne donnerait
  //      une mauvaise valeur au même endroit (même par temps de pluie) : c'est qu'on a isolé le bon tronçon
  function prouve(a, b, r) {
    if (r === "tension" || r > 5e7) return false;
    for (const [k, panne] of Object.entries(N.causes)) {
      if (k === cause) continue;
      const autre = creerInstallation(N.logement, [panne]), ea = structuredClone(e); ea.repare = [false]; ea.env.pluie = true;
      const ra = autre.isolement(ea, a, b); if (ra !== "tension" && ra < 5e7) return false;
    }
    return true;
  }

  function action(a) {
    messages.length = 0;
    if (P.fini) return { messages: [] };
    const cout = COUTS[a.type] || 0;
    let retour;
    switch (a.type) {
      case "deplacer": if (a.lieu) P.vus.add(`lieu:${a.lieu}`); break;
      case "geste": { const g = N.gestes[a.id](P, { dire, noter, declenchements, calc }); retour = g; break; } // un geste propre au niveau (s'asseoir sur un lit…)
      case "regarder": { // un indice visuel (horloge, traces, buée…)
        const o = N.regards && N.regards[a.id]; const pr = inst.protections.find((x) => x.id === a.id);
        const t = o ? o(P) : pr ? { texte: `${nomProt(a.id).replace(/^l/, "L")} : calibre ${pr.calibre} A. Rien d'anormal à voir.`, valeur: { calibre: pr.calibre } } : null;
        if (t) { dire(t.texte, t.type || "info"); if (t.indice) { noter("indices", t.indice); P.vus.add(`indice:${a.id}`); } retour = t.valeur; }
        break;
      }
      case "essayer": { // prise (lampe témoin), interrupteur, appareil
        const o = org[a.id] || inst.mobile[a.id]; P.essais.add(a.id);
        if (o.type === "prise") { const ok = calc().alimente(a.id); dire(`${o.nom} : ta lampe témoin ${ok ? "s'allume" : "reste éteinte"}.`, ok ? "ok" : "alerte"); noter("constats", `${o.nom} : ${ok ? "alimentée" : "sans courant"} (${heureFr(e.env.heure)}).`); retour = ok; }
        else if (o.type === "interrupteur") { const avant = etatVisible(); declenchements(inst.agir(e, { type: "basculer", id: a.id }).declenchements); const apres = etatVisible(); const ch = inst.points.filter((p) => avant[p.id] !== apres[p.id]); dire(ch.length ? ch.map((p) => `${p.nom} : ${apres[p.id] ? "allumé" : "éteint"}`).join(" ; ") + "." : `${o.nom} : clic… rien ne change.`, ch.length ? "ok" : "alerte"); for (const p of ch) noter("constats", `${p.nom} : fonctionne.`); if (!ch.length) noter("constats", `${o.nom} : aucun effet (${heureFr(e.env.heure)}).`); retour = ch.length > 0; }
        else if (o.type === "point_lumineux") { const ok = calc().allume(a.id); dire(ok ? `${o.nom} : il éclaire.` : `${o.nom} : éteint. Tu essaies une ampoule neuve : toujours rien. Ce n'est pas l'ampoule.`, ok ? "ok" : "alerte"); noter("constats", `${o.nom} : ${ok ? "éclaire" : "éteint, même avec une ampoule neuve"} (${heureFr(e.env.heure)}).`); retour = ok; }
        else if ((inst.mobile[a.id] || o.type === "appareil_fixe") && N.commutables && N.commutables.includes(a.id)) { // un appareil du client : on lit sa plaque, on l'allume ou on l'éteint
          const r = inst.agir(e, { type: "marche", id: a.id }), on = e.marche[a.id]; dire(`${o.nom} — plaque signalétique : ${o.puissance} W. Tu ${on ? "l'allumes" : "l'éteins"}.`, on ? "ok" : "info"); noter("constats", `${o.nom} : ${o.puissance} W (plaque signalétique).`); declenchements(r.declenchements); retour = on; }
        else { const ok = calc().fonctionne(a.id); const t = (N.essais && N.essais[a.id]) ? N.essais[a.id](ok, P) : `${o.nom} : ${ok ? "en marche" : "à l'arrêt"}.`; dire(t, ok ? "ok" : "info"); noter("constats", `${o.nom} : ${ok ? "en marche" : "à l'arrêt"} (${heureFr(e.env.heure)}).`); retour = ok; }
        break;
      }
      case "manette": { // disjoncteur, interrupteur différentiel
        const avant = etatVisible(), ouvert = !e.positions[a.id], position = a.position !== undefined ? a.position : ouvert;
        const r = inst.agir(e, { type: "manoeuvrer", id: a.id, position });
        const apres = etatVisible(), perdus = inst.points.filter((p) => avant[p.id] && !apres[p.id]), retrouves = inst.points.filter((p) => !avant[p.id] && apres[p.id]);
        if (position && !e.positions[a.id]) { dire(`Tu remontes ${nomProt(a.id)} : il retombe aussitôt.`, "alerte"); noter("tableau", `${nomProt(a.id).replace(/^l/, "L")} retombe dès qu'on le remonte (${heureFr(e.env.heure)}).`); }
        else {
          dire(`${nomProt(a.id).replace(/^l/, "L")} : manette ${position ? "remontée (I)" : "baissée (O)"}.${!position ? (perdus.length ? ` S'arrêtent : ${perdus.map((p) => p.nom.toLowerCase()).join(", ")}.` : " Rien de visible ne change : ce départ n'alimente rien en ce moment.") : ""}`, "info");
          if (!position && perdus.length) noter("tableau", `« ${a.id === T.agcp.id ? "Disjoncteur de branchement" : T.differentiels.some((d) => d.id === a.id) ? `Différentiel ${N.nomsDifferentiels[a.id]}` : inst.etiquette(e, a.id)} » coupe : ${perdus.map((p) => p.nom.toLowerCase()).join(", ")}.`);
          if (position && retrouves.length) dire(`Le courant revient : ${retrouves.map((p) => p.nom.toLowerCase()).join(", ")}.`, "ok");
        }
        declenchements(r.declenchements.filter((d) => d.id !== a.id));
        retour = e.positions[a.id];
        break;
      }
      case "test": { // bouton test d'un interrupteur différentiel ou du disjoncteur de branchement
        const avant = etatVisible(), r = inst.agir(e, { type: "test", id: a.id }), nom = nomProt(a.id);
        if (r.testSansEffet) { dire(`Bouton test (${nom}) : rien ne se passe. ${e.positions[a.id] ? "Il n'est pas alimenté : le bouton test ne fonctionne que sous tension." : "Sa manette est déjà en bas."}`, "alerte"); retour = false; }
        else {
          const apres = etatVisible(), perdus = inst.points.filter((p) => avant[p.id] && !apres[p.id]);
          dire(`Tu appuies sur le bouton test : clac, ${nom} déclenche. Il fonctionne.${perdus.length ? ` S'arrêtent : ${perdus.map((p) => p.nom.toLowerCase()).join(", ")}.` : ""} Remonte sa manette pour remettre le courant.`, "ok");
          noter("tableau", `Bouton test : ${nom} déclenche bien.`);
          declenchements(r.declenchements.filter((d) => d.id !== a.id)); retour = true;
        }
        break;
      }
      case "mode": { // sélecteur d'une horloge ou d'un contacteur : auto → I → 0 → auto
        const suiv = a.mode || { auto: "I", I: "0", 0: "auto" }[e.modes[a.id]];
        const r = inst.agir(e, { type: "mode", id: a.id, mode: suiv });
        dire(`${org[a.id].nom} : sélecteur sur « ${{ auto: "auto", I: "I (marche forcée)", 0: "0 (arrêt)" }[suiv]} ».`); declenchements(r.declenchements); retour = suiv;
        break;
      }
      case "regler_horloge": { inst.agir(e, { type: "regler_horloge", id: a.id }); dire(`Tu remets l'horloge à l'heure : ${heureFr(e.env.heure)}.`, "ok"); declenchements(calc().declenchements); break; }
      case "ouvrir": {
        if (P.ouverts.has(a.id)) break;
        if (sousTension(bornesDe(a.id))) { faute(`Tu as ouvert « ${nomOrgane(a.id)} » sous tension. Avant d'ouvrir, on coupe le circuit et on vérifie l'absence de tension au VAT.`); dire("Attention : c'est sous tension là-dedans. Tu ne touches que les parties isolées ; seules les pointes touchent les bornes.", "alerte"); }
        P.ouverts.add(a.id);
        const t = N.ouvertures && N.ouvertures[a.id] ? N.ouvertures[a.id](P) : null;
        dire(t ? t.texte : `${nomOrgane(a.id)} : ouvert.`, t && t.type ? t.type : "info"); if (t && t.indice) noter("indices", t.indice);
        break;
      }
      case "fermer": { P.ouverts.delete(a.id); dire(`${nomOrgane(a.id)} : refermé.`); break; }
      case "debrancher": {
        const c = inst.conducteur[a.conducteur], b = c[a.extremite];
        const groupe = c.role === "terre" ? [c] : jumeaux(a.conducteur);
        if (groupe.some((x) => calc().tension(x[a.extremite], "terre.PE") >= 50)) { faute("Électrisation : tu as voulu débrancher un conducteur sous tension. On coupe, on vérifie l'absence de tension au VAT, et seulement ensuite on touche."); dire("⚡ Décharge ! Ce conducteur était sous tension.", "danger"); retour = false; break; }
        if (!P.vat.absence.has(b.split(".")[0])) { const t = "Avant de débrancher un conducteur, vérifie l'absence de tension au VAT, là où tu travailles (VAT testé avant et après sur une source connue)."; if (!P.conseils.includes(t)) P.conseils.push(t); }
        for (const x of groupe) inst.agir(e, { type: "debrancher_fil", conducteur: x.id, extremite: a.extremite });
        const autre = nomOrgane(organeDe(c[a.extremite === "de" ? "vers" : "de"]), true);
        dire(groupe.length > 1 ? `Tu débranches la phase et le neutre du câble qui va vers ${autre}. La terre reste raccordée.` : `Fil ${c.couleur} débranché de la ${nomBorne(b)}.`, "ok"); retour = true;
        break;
      }
      case "rebrancher": { const c = inst.conducteur[a.conducteur], groupe = c.role === "terre" ? [c] : jumeaux(a.conducteur); for (const x of groupe) inst.agir(e, { type: "rebrancher_fil", conducteur: x.id, extremite: a.extremite }); dire(groupe.length > 1 ? "Câble rebranché : phase et neutre resserrés sur leurs bornes." : `Fil ${c.couleur} rebranché sur la ${nomBorne(c[a.extremite])}.`, "ok"); declenchements(calc().declenchements); break; }
      case "mesurer": {
        const { outil, a: x, b: y } = a, r = calc();
        if (outil === "multi") { const u = r.tension(x, y); retour = u; dire(`${nomBorne(x)} ↔ ${nomBorne(y)} : ${u} V.`, "mesure"); noter("mesures", `Multimètre, ${nomBorne(x)} ↔ ${nomBorne(y)} : ${u} V (${heureFr(e.env.heure)}).`); }
        else if (outil === "vat") {
          const u = r.tension(x, y) >= 50; retour = u;
          if (u) { P.vat.teste = true; dire("VAT : les voyants s'allument. Il y a de la tension entre ces deux points.", "alerte"); }
          else if (!P.vat.teste) dire("VAT : aucun voyant… mais tu ne l'as pas testé avant sur une source connue : ça ne prouve rien.", "info");
          else { for (const b of [x, y]) P.vat.absence.add(b.split(/[.#]/)[0].startsWith("c") && b.includes("#") ? inst.conducteur[b.split("#")[0]][b.split("#")[1]].split(".")[0] : b.split(".")[0]); dire("VAT : aucun voyant entre ces deux points.", "ok"); }
          noter("mesures", `VAT, ${nomBorne(x)} ↔ ${nomBorne(y)} : ${u ? "tension présente" : "aucun voyant"} (${heureFr(e.env.heure)}).`);
        } else if (outil === "pince") { // autour d'UN conducteur : celui qui part de la borne touchée
          if (x.endsWith(".cable")) { retour = 0; dire("Pince autour du câble entier : 0 A. Le courant qui part par la phase revient par le neutre : autour des deux à la fois, leurs effets s'annulent. On serre UN seul conducteur.", "mesure"); noter("mesures", `Pince autour du câble entier : 0 A (${heureFr(e.env.heure)}).`); }
          else { const c = N.logement.conducteurs.find((k) => k.de === x) || N.logement.conducteurs.find((k) => k.vers === x); const i = c ? inst.courantConducteur(e, c.id) : 0; retour = i; dire(`Pince sur le conducteur ${c ? c.couleur : ""} · ${nomBorne(x)} : ${fr(i, 1)} A.`, "mesure"); noter("mesures", `Pince, ${nomBorne(x)} : ${fr(i, 1)} A (${heureFr(e.env.heure)}).`); }
        } else if (outil === "ohm") {
          const k = inst.continuite(e, x, y); retour = k;
          if (k === "tension") { faute("Ohmmètre posé sur un circuit sous tension : une continuité se mesure toujours circuit coupé."); dire("L'appareil signale une tension : la continuité se mesure hors tension. Coupe d'abord le circuit.", "danger"); }
          else { dire(`Continuité, ${nomBorne(x)} ↔ ${nomBorne(y)} : ${k ? "0,2 Ω, ça passe" : "OL, ça ne passe pas"}.`, "mesure"); noter("mesures", `Continuité, ${nomBorne(x)} ↔ ${nomBorne(y)} : ${k ? "0,2 Ω (continuité)" : "OL (pas de continuité)"} (${heureFr(e.env.heure)}).`); }
        } else if (outil === "iso") {
          const R = inst.isolement(e, x, y); retour = R;
          if (R === "tension") { faute("Mesureur d'isolement posé sur un circuit sous tension : l'isolement se mesure toujours circuit coupé."); dire("Le mesureur signale une tension : l'isolement se mesure hors tension. Coupe d'abord le circuit.", "danger"); }
          else {
            dire(`Isolement, ${nomBorne(x)} ↔ ${nomBorne(y)} : ${megohms(R)}.`, "mesure");
            noter("mesures", `Isolement, ${nomBorne(x)} ↔ ${nomBorne(y)} : ${megohms(R)} (${heureFr(e.env.heure)}, ${e.env.pluie ? "sous la pluie" : "temps sec"}).`);
            if (prouve(x, y, R)) { const t = `Isolement ${megohms(R)} entre ${nomBorne(x)} et la terre, le reste du circuit étant séparé.`; if (!P.preuves.includes(t)) P.preuves.push(t); }
          }
        }
        if (N.apresMesure) { const t = N.apresMesure(P, { outil, a: x, b: y, valeur: retour }); if (t) { dire(t.texte, t.type || "alerte"); if (t.indice) noter("indices", t.indice); } }
        break;
      }
      case "question": {
        const q = N.questions.find((k) => k.id === a.id);
        if (!q || P.poses.includes(q.id)) break;
        P.poses.push(q.id); const rep = q.reponse(P); dire(rep, "client"); retour = rep;
        break;
      }
      case "indice": { const cran = Math.min(3, (a.cran || P.indicesPris % 3 + 1)); P.indicesPris++; temps(2); retour = N.indices(P)[cran - 1]; dire(retour, "info"); break; }
      case "attendre": { const avant = e.env.heure; const ev = temps(a.minutes || 15); if (!ev.length) dire(`Tu attends. Il est ${heureFr(e.env.heure)}.${N.attente ? " " + N.attente(P, avant) : ""}`); retour = ev; break; }
      case "revenir_ce_soir": {
        if (P.soir) break;
        P.soir = true; const h = N.soir.heure, ecart = ((h - e.env.heure + 24) % 24) * 60;
        const ev = inst.avancer(e, ecart); inst.agir(e, { type: "meteo", env: { pluie: true } });
        dire(N.soir.texte, "client"); declenchements([...ev, ...calc().declenchements]);
        break;
      }
      case "diagnostic": {
        if (a.id === cause) { P.trouve = true; dire(N.diagnostics.find((d) => d.id === a.id).ok || "C'est bien ça.", "ok"); }
        else { P.mauvaisDiagnostics++; dire(N.diagnostics.find((d) => d.id === a.id).non, "client"); }
        retour = P.trouve; break;
      }
      case "securiser": { // la fin réaliste : remplacer, mettre hors service, expliquer ; puis on vérifie que ça tient
        if (!P.trouve) break;
        const rem = N.remedes.find((x) => x.id === a.id);
        if (!rem.pour.includes(cause)) { P.mauvaisRemedes++; if (rem.faute) faute(rem.faute); dire(rem.non || "Ce n'est pas la bonne réponse à cette panne.", "client"); retour = false; break; }
        for (const k of Object.keys(e.deconnecte)) delete e.deconnecte[k];
        if (rem.repare) inst.agir(e, { type: "reparer", panne: 0 });
        if (rem.effet) rem.effet(P);
        if (rem.horsService) inst.agir(e, { type: "manoeuvrer", id: rem.horsService, position: false });
        for (const p of inst.protections) if (p.id !== rem.horsService) inst.agir(e, { type: "manoeuvrer", id: p.id, position: true });
        for (const o of N.logement.organes) if (o.type === "horloge") inst.agir(e, { type: "regler_horloge", id: o.id });
        for (const id of Object.keys(e.modes)) if (e.modes[id] !== "auto" && e.modes[id] !== "permanent") e.modes[id] = "auto";
        if (N.verifier) { const pb = N.verifier(P); if (pb) { P.mauvaisRemedes++; dire(pb, "client"); retour = false; break; } }
        else { // vérification : une nuit entière sous la pluie
          inst.agir(e, { type: "meteo", env: { pluie: true } });
          const ev = inst.avancer(e, 16 * 60);
          if (ev.length) { P.mauvaisRemedes++; dire("Le lendemain, le client rappelle : ça a encore sauté dans la nuit.", "client"); retour = false; break; }
          inst.agir(e, { type: "meteo", env: { pluie: false } });
        }
        P.securise = true; P.remede = rem;
        if (N.etiquettes && !P.etiquettesFaites) { dire(`${rem.fait} Il reste à refaire les étiquettes du tableau.`, "ok"); retour = true; break; }
        finir(); retour = true;
        break;
      }
      case "etiqueter": { // geste de fin : refaire le repérage du tableau avec ce que le carnet a établi
        if (!P.securise || P.fini) break;
        const faux = N.etiquettes.filter((x) => a.choix[x.dj] !== x.bonne);
        if (faux.length) { P.mauvaisRemedes++; dire(`Ce n'est pas ce que tu as constaté pour ${faux.map((x) => `« ${x.ancienne} »`).join(" et ")}. Relis ton carnet, onglet « Le tableau ».`, "alerte"); retour = false; break; }
        P.etiquettesFaites = true; finir(); retour = true; break;
      }
      default: throw new Error(`Action inconnue : ${a.type}`);
    }
    if (cout) temps(cout);
    return { messages: [...messages], retour };
  }
  function finir() {
    const rem = P.remede, preuve = N.preuve ? N.preuve(P) : P.preuves[0] || null;
    P.fini = true;
    const etoiles = Math.max(1, 3 - (preuve ? 0 : 1) - (P.fautes.length ? 1 : 0) - (P.mauvaisDiagnostics + P.mauvaisRemedes ? 1 : 0));
    P.bilan = {
      etoiles, cause: N.causes[cause].titre, preuve, remede: rem.fait, explication: N.explications[cause], demarche: N.demarches[cause],
      inutile: N.inutile ? N.inutile(P) : [], fautes: [...P.fautes], conseils: [...new Set([...P.conseils, ...(N.conseilsFin || [])])], minutes: Math.round(P.minutes), indices: P.indicesPris,
    };
    dire(rem.fait, "ok");
  }
  const aPreuve = () => (N.preuve ? !!N.preuve(P) : P.preuves.length > 0);
  Object.assign(P, { roleBorne, circuitBorne, aPreuve, action, nomBorne, nomOrgane, nomProt, etatVisible, bornesDe, calc, sousTension, jumeaux });
  return P;
}
