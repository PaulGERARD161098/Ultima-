// Unitaires — lecteur vCard et dédoublonnage de l'import iPhone
// (CADRAGE-RIVEN-IMPORT.md, critères C2, C4, C7 côté lecteur).
// Node pur. Les cartes sont INVENTÉES ; aucun export réel ne transite ici.
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../js/import-contacts.js', import.meta.url), 'utf8');
const fenetre = {};
new Function('window', source)(fenetre);
const I = fenetre.UltimaImport;
const verdicts = {};

const carte = (...lignes) => ['BEGIN:VCARD', 'VERSION:3.0', ...lignes, 'END:VCARD'].join('\r\n');

// --- Verrou de non-vacuité : le lecteur voit bien quelque chose ---
{
  const r = I.lireVcard(carte('FN:Aubin Ferrand', 'TEL;TYPE=CELL:06 12 34 56 01'));
  verdicts.nonVacuite = r.contacts.length === 1 && r.contacts[0].nom === 'Aubin Ferrand' &&
    r.contacts[0].telephone === '+33612345601';
}

// --- C2 : les pièges vCard ---
// Ligne pliée (RFC 6350 §3.2) : CRLF + espace = continuation.
{
  const r = I.lireVcard(carte('FN:Hortense Blan', ' chard', 'TITLE:Co-g', '\térante'));
  verdicts.lignePliee = r.contacts[0].nom === 'Hortense Blanchard' && r.contacts[0].fonction === 'Co-gérante';
}
// Échappements \, \; \n
{
  const r = I.lireVcard(carte('FN:Maury\\, Cyprien', 'ORG:Maury Électricité\\; SARL;Atelier', 'TITLE:Chef\\nd\'équipe'));
  const c = r.contacts[0];
  verdicts.echappements = c.nom === 'Maury, Cyprien' && c.organisation === 'Maury Électricité; SARL — Atelier' &&
    c.fonction === "Chef d'équipe";
}
// QUOTED-PRINTABLE (vCard 2.1) avec continuation « = ».
{
  const texte = ['BEGIN:VCARD', 'VERSION:2.1',
    'FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:=C3=89tienne V=',
    'asseur', 'TEL;CELL:0755129800', 'END:VCARD'].join('\r\n');
  const c = I.lireVcard(texte).contacts[0];
  verdicts.quotedPrintable = c && c.nom === 'Étienne Vasseur' && c.telephone === '+33755129800';
}
// Groupe « item1. » + types multiples ; préférence mobile > pro.
{
  const c = I.lireVcard(carte('FN:Gaspard Leclerc',
    'item1.TEL;type=WORK;type=VOICE:+33 4 91 00 00 00',
    'item2.TEL;type=CELL;type=pref:+33 6 98 45 00 12',
    'item3.EMAIL;type=HOME:perso@exemple.fr',
    'item4.EMAIL;type=INTERNET;type=WORK:G.Leclerc@Exemple.fr')).contacts[0];
  verdicts.groupesEtPreferences = c.telephone === '+33698450012' && c.email === 'g.leclerc@exemple.fr';
}
// Carte sans FN : N recomposé, puis ORG en dernier recours ; sans rien → rejet compté.
{
  const r = I.lireVcard(
    carte('N:Lacombe;Bérénice;;;') + '\r\n' + carte('ORG:Pizzeria du Port') + '\r\n' + carte('TEL:0600000000'));
  verdicts.nomRecompose = r.contacts[0].nom === 'Bérénice Lacombe' && r.contacts[1].nom === 'Pizzeria du Port';
  verdicts.sansNomRejeteEtCompte = r.rejets.length === 1 && r.rejets[0].raison === 'sans nom' && r.cartes === 3;
}
// END manquant : la carte suivante clôt la précédente, rien n'est perdu.
{
  const r = I.lireVcard('BEGIN:VCARD\nFN:Premier\nBEGIN:VCARD\nFN:Second\nEND:VCARD\nBEGIN:VCARD\nFN:Troisième');
  verdicts.endManquant = r.contacts.map((c) => c.nom).join('|') === 'Premier|Second|Troisième';
}
// Fichier hostile : jamais d'exception.
{
  let leve = false;
  try {
    I.lireVcard(null); I.lireVcard(''); I.lireVcard('\u0000\u0001garbage:::');
    I.lireVcard('BEGIN:VCARD\nFN;ENCODING=QUOTED-PRINTABLE:=ZZ=\nEND:VCARD');
    I.lireVcard('BEGIN:VCARD\n' + 'X'.repeat(200000) + '\nEND:VCARD');
  } catch { leve = true; }
  verdicts.jamaisDException = !leve;
}
// HTML dans un nom : conservé comme TEXTE (le rendu est en textContent).
{
  const c = I.lireVcard(carte('FN:<img src=x onerror=alert(1)>')).contacts[0];
  verdicts.htmlResteDuTexte = c.nom === '<img src=x onerror=alert(1)>';
}

// --- C7 côté lecteur : minimisation ---
{
  const c = I.lireVcard(carte('FN:Delphine Rouvière', 'PHOTO;ENCODING=b;TYPE=JPEG:' + 'A'.repeat(5000),
    'ADR;TYPE=HOME:;;1 rue X;Lyon;;69000;France', 'BDAY:1980-01-01', 'NOTE:secret', 'URL:https://x',
    'X-SOCIALPROFILE:y')).contacts[0];
  const cles = Object.keys(c).sort().join(',');
  const serialise = JSON.stringify(c);
  verdicts.minimisation = cles === 'alertes,carte,email,fonction,nom,organisation,telephone' &&
    !/secret|1980|Lyon|AAAA|https/.test(serialise);
}

// --- Bornes ---
{
  const c = I.lireVcard(carte('FN:' + 'N'.repeat(250), 'TITLE:' + 'T'.repeat(150), 'EMAIL:pas-un-mail', 'TEL:abc')).contacts[0];
  verdicts.bornes = c.nom.length === 200 && c.fonction.length === 120 && c.email === '' &&
    c.alertes.includes('nom tronqué') && c.alertes.includes('fonction tronquée') && c.alertes.includes('e-mail invalide');
}
{
  const beaucoup = Array.from({ length: I.LIMITES.cartes + 1 }, (_, i) => carte('FN:C' + i)).join('\n');
  verdicts.tropDeCartes = I.lireVcard(beaucoup).tropDeCartes === true;
}

// --- Normalisation téléphone ---
verdicts.telNational = I.normaliserTelephone('06 12 34 56 01') === '+33612345601';
verdicts.telInternational = I.normaliserTelephone('+33 6 12 34 56 01') === '+33612345601';
verdicts.telZeroZero = I.normaliserTelephone('0033 6 12 34 56 01') === '+33612345601';
verdicts.telParentheseZero = I.normaliserTelephone('+33 (0)6 12 34 56 01') === '+33612345601';
verdicts.telEtranger = I.normaliserTelephone('+1 (415) 555-0100') === '+14155550100';
verdicts.telVide = I.normaliserTelephone('—') === null && I.normaliserTelephone(undefined) === null;

// --- C4 : dédoublonnage ---
{
  const lu = I.lireVcard([
    carte('FN:Aubin Ferrand', 'TEL:06 12 34 56 01'),
    carte('FN:A. Ferrand', 'TEL:+33 6 12 34 56 01', 'ORG:Toitures Ferrand', 'TITLE:Gérant'),
    carte('FN:Aubin (pro)', 'EMAIL:a@toitures.fr', 'TEL:+33612345601'),
    carte('FN:Maman', 'TEL:06 00 00 00 11'),
    carte('FN:Karim bis', 'TEL:06 11 22 33 44'),
  ].join('\n'));
  const existants = [{ id: 'p1', nom: 'Karim Roux', telephone: '06 11 22 33 44' }];
  const fiches = [{ id: 'n1', nom: '  toitures FERRAND ' }];
  const g = I.regrouper(lu.contacts, existants, fiches);
  const aubin = g[0];
  verdicts.fusionEnUne = g.length === 3 && aubin.cartes === 3;
  verdicts.fusionSansEcraser = aubin.nom === 'Aubin Ferrand' && aubin.fonction === 'Gérant' &&
    aubin.organisation === 'Toitures Ferrand' && aubin.email === 'a@toitures.fr';
  verdicts.rattachementPropose = aubin.fiche && aubin.fiche.id === 'n1';
  verdicts.dejaEnBase = g[2].dejaEnBase === true && g[1].dejaEnBase === false;

  const ligne = I.versPersonne(aubin, true);
  verdicts.versPersonne = JSON.stringify(Object.keys(ligne).sort()) ===
    JSON.stringify(['email', 'fonction', 'node_id', 'nom', 'notes', 'telephone']) &&
    ligne.notes === 'Entreprise : Toitures Ferrand' && ligne.node_id === 'n1';
  verdicts.sansRattachementPasDeNodeId = !('node_id' in I.versPersonne(aubin, false));
  verdicts.champsVidesOmis = JSON.stringify(Object.keys(I.versPersonne(g[1], false))) === '["nom","telephone"]';
}

// --- Lots ---
verdicts.lots = I.enLots(Array.from({ length: 212 }, (_, i) => i), 50).map((l) => l.length).join(',') === '50,50,50,50,12';


// --- Fermetures de l'audit du 22/09 (chacune a d'abord été vue ROUGE) ---
// M1 : 40 000 continuations QUOTED-PRINTABLE, lecture linéaire.
{
  const texte = 'BEGIN:VCARD\nFN;ENCODING=QUOTED-PRINTABLE:' + 'xxxxxxxxxxxxxxxxxxxx=\n'.repeat(40000) + 'fin\nEND:VCARD';
  const t0 = performance.now();
  const r = I.lireVcard(texte);
  const duree = performance.now() - t0;
  verdicts.m1QpLineaire = duree < 300 && r.cartes === 1;
  const qp = I.lireVcard('BEGIN:VCARD\nFN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:=C3=89tienne V=\nasseur\nEND:VCARD');
  verdicts.m1QpInchange = qp.contacts[0].nom === 'Étienne Vasseur';
}
// F1 : UTF-8 invalide massif en QP → jamais d'exception.
{
  let leve = false;
  try { I.lireVcard('BEGIN:VCARD\nFN;ENCODING=QUOTED-PRINTABLE:' + '=FF'.repeat(200000) + '\nEND:VCARD'); } catch { leve = true; }
  verdicts.f1PasDException = !leve;
}
// F2 : troncature et demi-paires UTF-16.
{
  const c = I.lireVcard(carte('FN:' + 'a'.repeat(198) + '😀b')).contacts[0];
  const isolee = /[\ud800-\udbff](?![\udc00-\udfff])|(^|[^\ud800-\udbff])[\udc00-\udfff]/;
  verdicts.f2PasDeDemiPaire = !isolee.test(c.nom) && c.nom.length <= 200;
  const d = I.lireVcard(carte('FN:Nom\ud83d cassé')).contacts[0];
  verdicts.f2DemiPaireNettoyee = !isolee.test(d.nom) && d.nom === 'Nom cassé';
}
// F3 : une ORG hostile ne fabrique pas de fiche fantôme.
{
  const lu = I.lireVcard(carte('FN:A', 'ORG:constructor') + '\n' + carte('FN:B', 'ORG:__proto__') + '\n' + carte('FN:C', 'ORG:toString'));
  const g = I.regrouper(lu.contacts, [], [{ id: 'n1', nom: 'Vraie' }]);
  verdicts.f3PasDeFicheFantome = g.length === 3 && g.every((c) => c.fiche === null);
}
// M3 : les lots sont bornés en octets ; les rattachés partent à part, 25 au plus.
{
  const lourdes = Array.from({ length: 50 }, (_, i) => ({ nom: '漢'.repeat(200), fonction: '字'.repeat(120), notes: 'Entreprise : ' + '語'.repeat(200) + i }));
  const lots = I.enLots(lourdes, 50);
  const tailles = lots.map((l) => new TextEncoder().encode(JSON.stringify({ personnes: l })).length);
  verdicts.m3LotsBornesEnOctets = lots.length >= 2 && tailles.every((t) => t < 100000) &&
    lots.reduce((n, l) => n + l.length, 0) === 50;
  const melange = Array.from({ length: 60 }, (_, i) => (i % 2 ? { nom: 'R' + i, node_id: 'x' } : { nom: 'S' + i }));
  const l2 = I.enLots(melange, 50);
  verdicts.m2RattachesAPart = l2.every((l) => l.every((x) => x.node_id) || l.every((x) => !x.node_id)) &&
    l2.filter((l) => l[0].node_id).every((l) => l.length <= 25) && l2.reduce((n, l) => n + l.length, 0) === 60;
}
// M2 : sans téléphone ni e-mail, le même nom en base est SIGNALÉ, pas verrouillé.
{
  const g = I.regrouper(I.lireVcard(carte('FN:Godefroy  Aubert')).contacts, [{ id: 'p', nom: 'godefroy aubert' }], []);
  verdicts.m2NomSignale = g[0].nomDejaEnBase === true && g[0].dejaEnBase === false;
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  verdicts.m2PlusDePromesseDeRelanceSure = !/sera reconnu/.test(app) && /vérifiez le registre/.test(app);
}
// Une propriété démesurée est ignorée ET dite (règle ③ : rien en silence).
{
  const c = I.lireVcard(carte('FN:Long', 'TITLE:' + 'x'.repeat(70000))).contacts[0];
  verdicts.proprieteTropLongueDite = c.fonction === '' && c.alertes.includes('champ trop long ignoré');
}

let rouge = false;
for (const [nom, ok] of Object.entries(verdicts)) {
  console.log(`${ok ? '✅' : '❌'} ${nom}`);
  if (!ok) rouge = true;
}
if (rouge) process.exit(1);
