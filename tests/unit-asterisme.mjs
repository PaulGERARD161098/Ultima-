// L'ASTÉRISME — lot 2 de CADRAGE-2026-09-25-carte-celeste.md (§14.2, arbitrage A2).
//
// La figure d'une constellation est un ARBRE CALCULÉ : n − 1 traits qui relient
// toutes ses étoiles, sans boucle, sans croisement, et toujours le même pour
// les mêmes étoiles. C'est l'arbre couvrant minimal sur les coordonnées PLANES
// de la disposition — un arbre de longueur minimale dans le plan ne se croise
// jamais lui-même, c'est ce qui le rend lisible comme une figure.
//
// Ce harnais ne voit pas de navigateur : il charge `js/ciel.js` dans un contexte
// isolé et lit `UltimaCiel.asterisme`, une fonction PURE.
//
// ⛔ L'INSTRUMENT SE VALIDE LUI-MÊME, à chaque exécution : ses contrôles sont
// d'abord passés sur deux implémentations VOLONTAIREMENT FAUSSES (la chaîne dans
// l'ordre d'entrée, le graphe complet) et doivent les REFUSER. Un contrôle qui
// laisserait passer l'une d'elles ne prouverait rien sur la vraie.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const code = readFileSync(new URL('../js/ciel.js', import.meta.url), 'utf8');
const contexte = { window: {}, document: {} };
vm.createContext(contexte);
vm.runInContext(code, contexte);
const brute = contexte.window.UltimaCiel && contexte.window.UltimaCiel.asterisme;
// ⚠️ LE MOTEUR TOURNE DANS UN AUTRE « ROYAUME » : ses tableaux n'ont pas le même
// prototype que ceux du harnais, et `deepEqual([], [])` échoue entre les deux —
// trouvé au premier passage, où la fonction était juste et l'instrument non. On
// recopie donc chaque résultat dans ce contexte-ci avant de le juger.
const asterisme = brute && ((pts) => JSON.parse(JSON.stringify(brute(pts))));

// Générateur déterministe (mulberry32) : les nuages d'essai sont les mêmes à
// chaque exécution, donc un échec se rejoue.
function alea(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function nuage(n, graine) {
  const r = alea(graine);
  return Array.from({ length: n }, (_, i) => ({ id: 'e' + i, u: r() * 400 - 200, v: r() * 300 - 150 }));
}
const cle = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
const longueur = (pts, aretes) => {
  const p = Object.fromEntries(pts.map((x) => [x.id, x]));
  return aretes.reduce((s, [a, b]) => s + Math.hypot(p[a].u - p[b].u, p[a].v - p[b].v), 0);
};
// Deux segments se coupent-ils PROPREMENT (hors extrémité commune) ?
function secoupent(p1, p2, p3, p4) {
  const o = (a, b, c) => Math.sign((b.u - a.u) * (c.v - a.v) - (b.v - a.v) * (c.u - a.u));
  return o(p1, p2, p3) * o(p1, p2, p4) < 0 && o(p3, p4, p1) * o(p3, p4, p2) < 0;
}
// Le vrai minimum, par force brute (codes de Prüfer), pour n ≤ 7.
function minimumBrut(pts) {
  const n = pts.length; if (n < 2) return 0;
  const d = (i, j) => Math.hypot(pts[i].u - pts[j].u, pts[i].v - pts[j].v);
  if (n === 2) return d(0, 1);
  let meilleur = Infinity;
  const code = new Array(n - 2).fill(0);
  const total = n ** (n - 2);
  for (let k = 0; k < total; k++) {
    let x = k; for (let i = 0; i < n - 2; i++) { code[i] = x % n; x = Math.floor(x / n); }
    const degre = new Array(n).fill(1); code.forEach((c) => degre[c]++);
    let s = 0;
    for (const c of code) { const f = degre.findIndex((g) => g === 1); s += d(f, c); degre[f]--; degre[c]--; }
    const [u, v] = degre.map((g, i) => (g === 1 ? i : -1)).filter((i) => i >= 0);
    s += d(u, v);
    if (s < meilleur) meilleur = s;
  }
  return meilleur;
}

// LES CONTRÔLES — une fonction qui rend la liste des défauts, vide si sain.
function controler(fn) {
  const defauts = [];
  const essai = (nom, f) => { try { f(); } catch (e) { defauts.push(nom + ' : ' + e.message); } };
  essai('n = 0 → aucun trait', () => assert.deepEqual(fn([]), []));
  essai('n = 1 → aucun trait', () => assert.deepEqual(fn([{ id: 'a', u: 0, v: 0 }]), []));
  essai('n = 2 → un trait', () => assert.equal(fn([{ id: 'a', u: 0, v: 0 }, { id: 'b', u: 5, v: 0 }]).length, 1));
  for (const n of [3, 4, 5, 6, 7, 12, 24]) {
    for (const graine of [1, 7, 42]) {
      const pts = nuage(n, n * 100 + graine);
      const aretes = fn(pts);
      const lieu = `n = ${n}, graine ${graine}`;
      essai(`${lieu} : n − 1 traits`, () => assert.equal(aretes.length, n - 1));
      essai(`${lieu} : chaque trait relie deux étoiles connues, distinctes`, () => {
        const ids = new Set(pts.map((p) => p.id));
        for (const [a, b] of aretes) { assert.ok(ids.has(a) && ids.has(b) && a !== b); }
      });
      essai(`${lieu} : connexe (toute étoile est atteinte)`, () => {
        const voisins = {}; aretes.forEach(([a, b]) => { (voisins[a] ||= []).push(b); (voisins[b] ||= []).push(a); });
        const vus = new Set([pts[0].id]); const file = [pts[0].id];
        while (file.length) { for (const w of voisins[file.pop()] || []) { if (!vus.has(w)) { vus.add(w); file.push(w); } } }
        assert.equal(vus.size, n);
      });
      essai(`${lieu} : aucun croisement`, () => {
        const p = Object.fromEntries(pts.map((x) => [x.id, x]));
        for (let i = 0; i < aretes.length; i++) for (let j = i + 1; j < aretes.length; j++) {
          const [a, b] = aretes[i], [c, d] = aretes[j];
          if (new Set([a, b, c, d]).size < 4) continue;
          assert.ok(!secoupent(p[a], p[b], p[c], p[d]), `${a}-${b} × ${c}-${d}`);
        }
      });
      essai(`${lieu} : même figure quel que soit l'ordre d'entrée`, () => {
        const inverse = fn(pts.slice().reverse()).map(([a, b]) => cle(a, b)).sort();
        assert.deepEqual(inverse, aretes.map(([a, b]) => cle(a, b)).sort());
      });
      if (n <= 7) {
        essai(`${lieu} : longueur minimale (force brute)`, () => {
          assert.ok(Math.abs(longueur(pts, aretes) - minimumBrut(pts)) < 1e-6);
        });
      }
    }
  }
  // ⚠️ LES ÉGALITÉS DE DISTANCE, et c'est là que l'ordre peut trahir. Sur un nuage
  // aléatoire l'arbre minimal est unique, donc l'ordre d'entrée ne change rien et
  // le contrôle ci-dessus est vert même sans tri — mesuré au sabotage, il ne
  // rougissait pas. Une COURONNE régulière, elle, est faite d'égalités : carré,
  // hexagone. C'est sur elles que « même figure quel que soit l'ordre » se juge.
  for (const [nom, k] of [['carré', 4], ['hexagone', 6], ['octogone', 8]]) {
    const poly = Array.from({ length: k }, (_, i) => ({
      id: 'p' + i, u: Math.round(100 * Math.cos((2 * Math.PI * i) / k) * 1e6) / 1e6,
      v: Math.round(100 * Math.sin((2 * Math.PI * i) / k) * 1e6) / 1e6 }));
    essai(`${nom} régulier : même figure dans tout ordre d'entrée`, () => {
      const ref = fn(poly).map(([a, b]) => cle(a, b)).sort();
      for (let decal = 1; decal < k; decal++) {
        const tourne = poly.slice(decal).concat(poly.slice(0, decal));
        assert.deepEqual(fn(tourne).map(([a, b]) => cle(a, b)).sort(), ref, `décalage ${decal}`);
        assert.deepEqual(fn(tourne.slice().reverse()).map(([a, b]) => cle(a, b)).sort(), ref, `inversé ${decal}`);
      }
    });
  }
  essai('points confondus : toujours n − 1 traits, toujours connexe', () => {
    const pts = [{ id: 'a', u: 0, v: 0 }, { id: 'b', u: 0, v: 0 }, { id: 'c', u: 3, v: 4 }];
    assert.equal(fn(pts).length, 2);
  });
  return defauts;
}

// ① L'INSTRUMENT, d'abord : il doit refuser deux fausses figures connues.
const chaine = (pts) => pts.slice(1).map((p, i) => [pts[i].id, p.id]);
const complet = (pts) => pts.flatMap((p, i) => pts.slice(i + 1).map((q) => [p.id, q.id]));
const defautsChaine = controler(chaine);
const defautsComplet = controler(complet);
assert.ok(defautsChaine.length > 0, 'INSTRUMENT AVEUGLE : la chaîne dans l\'ordre d\'entrée est passée');
assert.ok(defautsComplet.length > 0, 'INSTRUMENT AVEUGLE : le graphe complet est passé');
console.log(`  ✅ instrument : refuse la chaîne naïve (${defautsChaine.length} défauts) et le graphe complet (${defautsComplet.length})`);

// ② La vraie fonction.
assert.equal(typeof asterisme, 'function', 'UltimaCiel.asterisme est absente du moteur');
const defauts = controler(asterisme);
if (defauts.length) { console.error(defauts.slice(0, 8).join('\n')); }
assert.equal(defauts.length, 0, `${defauts.length} défaut(s) sur la vraie fonction`);
console.log('  ✅ asterisme : n − 1 traits, connexe, sans croisement, minimal, indépendant de l\'ordre');
