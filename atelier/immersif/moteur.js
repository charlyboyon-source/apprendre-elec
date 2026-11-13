// Modèle électrique de l'atelier dépannage, commun à l'atelier 2D (jeu.js) et à l'atelier 3D.
// Une intervention décrit ses liaisons entre nœuds (L = phase du réseau, N = neutre, PE = terre) :
// { a, b } un conducteur ; si: "cle" ne conduit que si l'appareil e.app[cle] est fermé ;
// sauf: "cle" l'inverse ; coupePar: "idPanne" coupé tant que cette panne n'est pas réparée ;
// charge: un récepteur (la lampe), qui transmet le potentiel sans relier les deux nœuds.
export function modele(S, e) {
  const liaisons = () => (typeof S.liaisons === "function" ? S.liaisons(e) : S.liaisons);
  function conduit(l) {
    if (l.coupePar && l.coupePar === e.panne.id && !e.repare) return false;
    if (l.si && !e.app[l.si]) return false;
    if (l.sauf && e.app[l.sauf]) return false;
    return true;
  }
  function potentiels() {
    const parent = {};
    const f = (x) => (parent[x] === undefined || parent[x] === x ? (parent[x] = x) : (parent[x] = f(parent[x])));
    const actives = liaisons().filter(conduit);
    for (const l of actives) if (!l.charge) parent[f(l.a)] = f(l.b);
    const pot = { [f("L")]: 230, [f("N")]: 0, [f("PE")]: 0 };
    let change = true;
    while (change) {
      change = false;
      for (const l of actives.filter((x) => x.charge)) {
        const a = f(l.a), b = f(l.b);
        if (pot[a] !== undefined && pot[b] === undefined) { pot[b] = pot[a]; change = true; }
        else if (pot[b] !== undefined && pot[a] === undefined) { pot[a] = pot[b]; change = true; }
      }
    }
    return { de: (n) => pot[f(n)], groupe: f };
  }
  function alimente(a, b) {
    const l = liaisons().find((x) => x.charge && ((x.a === a && x.b === b) || (x.a === b && x.b === a)));
    if (!l || !conduit(l)) return false;
    const p = potentiels();
    return (p.de(a) === 230 && p.groupe(b) === p.groupe("N")) || (p.de(b) === 230 && p.groupe(a) === p.groupe("N"));
  }
  // tension lue entre deux nœuds (0 si l'un des deux est « en l'air »)
  function tension(na, nb) {
    const p = potentiels(), va = p.de(na), vb = p.de(nb);
    return va === undefined || vb === undefined ? 0 : Math.abs(va - vb);
  }
  // continuité par les conducteurs (sans passer par un récepteur)
  function continuite(na, nb) {
    const fil = liaisons().filter((l) => conduit(l) && !l.charge);
    const vus = new Set([na]), file = [na];
    while (file.length) { const x = file.shift(); for (const l of fil) { const y = l.a === x ? l.b : l.b === x ? l.a : null; if (y && !vus.has(y)) { vus.add(y); file.push(y); } } }
    return vus.has(nb);
  }
  return { liaisons, conduit, potentiels, alimente, tension, continuite };
}
