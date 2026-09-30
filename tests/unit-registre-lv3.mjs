// Unitaires du registre Lv3 et du cockpit — Node pur, zéro réseau, zéro
// navigateur. Prouve les invariants de CADRAGE-LV3.md :
//   1. L'arbre est cohérent : aucun orphelin, aucune cible morte, chaque cap a
//      son blason / son état / sa parole, chaque boussole a son cœur et sa
//      légende gravée, tout est atteignable depuis la racine.
//   2. La règle nœud / feuille (§2.1) : une boussole a ≥ 2 caps ; une feuille
//      n'en a aucun (RIVEN reste une feuille tant qu'il n'a qu'une porte).
//      SEULE EXCEPTION (Paul, 30/09) : une CONSTELLATION (`constellation: true`)
//      est une boussole dès UN cap — et l'exception est éprouvée du côté où elle
//      peut fuir (section 3 quater), pas seulement du côté qu'on emprunte.
//   3. La structure dictée par Paul : deux supra-divisions (ALPHA, OMEGA),
//      DEUX constellations (ARMES, DRAGONS) sous IMLADRIK sous OMEGA — ADRAMELECH,
//      RESHIRAM et ZEKROM vivent sous DRAGONS —, RENOBOOST IA, DOKLĚS et SYMPHO
//      sous ALPHA (YCOME retiré le 28/09 ; GRIMA et NAGA supprimés le 29/09 ; TAO
//      supprimé le 30/09 — leur ABSENCE est éprouvée plus bas).
//   4. (Géométrie de la rose : ABANDONNÉE le 2026-08-19 — voir la section 4.)
//   5. Le cockpit ne rend QUE des comptes entiers (jamais de contenu, jamais de
//      PII) et se tait quand il n'y a rien à traiter.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import {
  NOEUDS, RACINE, parentDe, chemin, estBoussole, estConstellation, capsDe, verifierRegistre,
} from '../js/registre-lv3.mjs';
import { BLASONS, COEURS } from '../js/blasons.mjs';
// `ligneVivante`/`signalDe` vivent dans js/cockpit-parole.mjs depuis leur
// extraction du noyau (2026-08-13) ; l'import passait encore par le ré-export
// du noyau, supprimé en P5c — on importe désormais À LA SOURCE.
import { ligneVivante, signalDe } from '../js/cockpit-parole.mjs';

const verdicts = {};
const detail = {};

const RACINE_REPO = new URL('..', import.meta.url).pathname;

// Toutes les valeurs textuelles d'un arbre (nom, résumé, titre, légende…).
const valeursDe = (arbre) => {
  const out = [];
  const collecte = (v) => {
    if (typeof v === 'string') { out.push(v); }
    else if (v && typeof v === 'object') { Object.values(v).forEach(collecte); }
  };
  collecte(arbre);
  return out;
};

// ---------- 1. Cohérence globale de l'arbre ----------
const anomalies = verifierRegistre(NOEUDS, BLASONS, COEURS);
verdicts.registreSain = anomalies.length === 0;
detail.registreSain = anomalies.slice(0, 5).join(' | ');

// ---------- 2. Règle nœud / feuille ----------
verdicts.boussolesOntAuMoinsDeuxCaps = Object.keys(NOEUDS)
  .filter((id) => Array.isArray(NOEUDS[id].enfants))
  .every((id) => estBoussole(id));
verdicts.rivenEstUneFeuille = !estBoussole('riven') && NOEUDS.riven.cible === 'riven.html';
verdicts.feuillesSansEnfants = ['maedrethnir', 'vranesh', 'draukhain', 'reshiram', 'zekrom', 'abaque', 'ifulvin']
  .every((id) => !Array.isArray(NOEUDS[id].enfants));
// « Au moins deux caps » n'est plus vrai partout : il l'est SAUF pour les
// constellations. Le verdict ci-dessus passe par estBoussole (donc par
// l'exception) ; celui-ci dit l'exception à voix haute — tout nœud à UN seul
// cap est une constellation déclarée, et il n'y en a aujourd'hui qu'un (ARMES).
const unSeulCap = Object.keys(NOEUDS)
  .filter((id) => Array.isArray(NOEUDS[id].enfants) && NOEUDS[id].enfants.length === 1);
verdicts.seulesLesConstellationsOntUnSeulCap = unSeulCap.length >= 1
  && unSeulCap.every((id) => NOEUDS[id].constellation === true)
  && unSeulCap.join() === 'constellation-armes';
detail.seulesLesConstellationsOntUnSeulCap = unSeulCap.join(',');

// ---------- 3. La structure dictée par Paul (2026-07-30) ----------
// 2026-08-07 : la racine porte les deux supra-divisions ET ALTHEA. Paul l'a
// corrigé de vive voix (« je veux althea ici ») : « 3ᵉ cadran d'Ultima Lv3 »
// désignait cet écran-ci, pas la supra-division qui porte le même nom.
// 2026-09-29 : ULTIMA (supra-division) devient OMEGA, et ALPHA passe AVANT elle.
verdicts.racineDeuxSupraPlusAlthea = JSON.stringify(NOEUDS[RACINE].enfants)
  === JSON.stringify(['alpha', 'omega', 'althea']);
// INVERSÉ (30/09) : `taoSousImladrik` exigeait TAO sous IMLADRIK ; TAO est
// SUPPRIMÉ. Le verdict devient son contraire — TAO n'a plus de parent, plus de
// chemin, plus de nœud — et les deux jumeaux, ses enfants d'hier, ont un nouveau
// parent (la constellation DRAGONS). Éprouvé des DEUX côtés : la disparition sans
// la reprise en charge ferait deux étoiles orphelines (`verifierRegistre` le dirait
// aussi, mais on nomme ici la cause).
verdicts.taoSupprime = NOEUDS.tao === undefined && !('tao' in NOEUDS)
  && parentDe('tao') === null && chemin('tao').length === 0
  && !estBoussole('tao') && capsDe('tao').length === 0;
verdicts.jumeauxSousLesDragons = parentDe('reshiram') === 'constellation-dragons'
  && parentDe('zekrom') === 'constellation-dragons';
// YCOME RETIRÉ (Paul, 28/09 : « je ne travaille plus pour lui ») — cadrage
// CADRAGE-2026-09-28-retrait-ycome.md. Le nœud disparaît, ALPHA garde trois
// caps, et plus aucune phrase de Léo n'en parle.
verdicts.ycomeRetire = !('ycome' in NOEUDS) && !NOEUDS.alpha.enfants.includes('ycome');
verdicts.alphaTroisCaps = JSON.stringify(NOEUDS.alpha.enfants)
  === JSON.stringify(['renoboost-ia', 'dokles', 'sympho']);
verdicts.alphaNeParlePlusDYcome = !/ycome/i.test(JSON.stringify(NOEUDS));
verdicts.renoboostSousAlpha = parentDe('renoboost-ia') === 'alpha';
// TRANSPOSÉ (30/09) : `cheminTaoComplet` — le chemin de RESHIRAM passait par TAO ;
// il passe par DRAGONS, deux crans sous IMLADRIK. Même profondeur (5 marches), et
// aucune ne s'appelle plus « tao ».
verdicts.cheminReshiramParLesDragons = JSON.stringify(chemin('reshiram'))
  === JSON.stringify(['racine', 'omega', 'imladrik', 'constellation-dragons', 'reshiram'])
  && JSON.stringify(chemin('zekrom'))
  === JSON.stringify(['racine', 'omega', 'imladrik', 'constellation-dragons', 'zekrom'])
  && !chemin('reshiram').includes('tao') && !chemin('zekrom').includes('tao');

// ---------- 3 bis. Les cadrans d'OMEGA ----------
// (Historique ci-dessous : les macro-quadrants GRIMA/NAGA ont été SUPPRIMÉS le
// 2026-09-29 ; leurs verdicts sont INVERSÉS dans la section 3 ter.)
// 2026-08-01 : deux macro-quadrants — GRIMA « Ce qui est utile » (RIVEN, NICOL
// BOLAS) et NAGA « Ce qui fait grandir » (IMLADRIK, ADRAMELECH, TAO ; TAO est
// supprimé depuis le 30/09), chacun
// une vraie boussole avec sa coque.
// 2026-08-06 : Paul ajoute ALTHEA — « tout seul : c'est un autre système, c'est
// plutôt un jeu qu'autre chose ».
// 2026-08-07 : il le REMONTE À LA RACINE. Sous ULTIMA, il était subordonné au
// personnel ; à la racine il n'est subordonné à rien, ce qui est exactement ce
// que « tout seul » voulait dire. ULTIMA retrouve donc ses DEUX macro-quadrants.
verdicts.omegaTroisCaps = JSON.stringify(NOEUDS.omega.enfants)
  === JSON.stringify(['riven', 'nicol-bolas', 'imladrik'])
  && NOEUDS.omega.cible === 'omega.html' && NOEUDS.omega.nom === 'OMEGA'
  && estBoussole('omega');
// Éprouvé par l'ABSENCE autant que par la présence : ALTHEA pend à la racine, et
// ne se retrouve sous AUCUN autre nœud. Vérifier son seul parent ne suffirait
// pas — un doublon ailleurs dans l'arbre passerait au travers.
verdicts.altheaNePendQuALaRacine = parentDe('althea') === RACINE
  && Object.keys(NOEUDS)
    .filter((id) => id !== RACINE && Array.isArray(NOEUDS[id].enfants))
    .every((id) => !NOEUDS[id].enfants.includes('althea'));
// ALTHEA n'a qu'une porte → il reste une FEUILLE (règle §2.1 : est une boussole
// tout nœud qui a au moins DEUX enfants). Le jour où un second cap naît (le
// cadran en grand, le palmarès), il prendra la forme boussole sans rien casser.
verdicts.altheaEstUneFeuille = !NOEUDS.althea.enfants
  && NOEUDS.althea.cible === 'althea.html'
  && Boolean(NOEUDS.althea.blason);
// Un seul geste depuis l'accueil : c'est la raison d'être de la remontée.
verdicts.cheminAlthea = JSON.stringify(chemin('althea'))
  === JSON.stringify(['racine', 'althea']);
verdicts.cheminsSousOmega = parentDe('riven') === 'omega'
  && parentDe('nicol-bolas') === 'omega'
  && parentDe('imladrik') === 'omega'
  && parentDe('adramelech') === 'constellation-dragons'
  && parentDe('constellation-dragons') === 'imladrik'
  && parentDe('tao') === null;

// Le surligné des supra-divisions porte leur nom, plus « le personnel /
// le professionnel » (dicté par Paul le 2026-08-01) ; OMEGA depuis le 2026-09-29.
verdicts.surlignesSupraDivisions = NOEUDS.omega.surligne === 'Supra-division Omega'
  && NOEUDS.omega.legende === 'le personnel'
  && NOEUDS.alpha.surligne === 'Supra-division Alpha';

// ---------- 3 ter. Ce qui a DISPARU (2026-09-29) — éprouvé par l'ABSENCE ----------
// Une restructuration se prouve autant par ce qui n'est plus là que par ce qui
// est arrivé : sans ces verdicts, un GRIMA ou un NAGA ressuscité par un
// mauvais merge passerait vert (les nouveaux nœuds y sont aussi).
const REMPLACES = ['grima', 'naga', 'ultima-perso'];
verdicts.macroQuadrantsSupprimes = REMPLACES.every((id) => NOEUDS[id] === undefined
  && !Object.values(NOEUDS).some((n) => (n.enfants || []).includes(id)));
verdicts.aucunNoeudNeNommeGrimaNaga = !/grima|naga|ultima-perso/i.test(JSON.stringify(NOEUDS))
  && !/ultima\.html/.test(JSON.stringify(NOEUDS));
verdicts.pagesGrimaNagaUltimaSupprimees = ['grima.html', 'naga.html', 'ultima.html']
  .every((f) => !existsSync(RACINE_REPO + f)) && existsSync(RACINE_REPO + 'omega.html');
// Aucune cible du registre ne pointe vers une page disparue (et toutes les
// cibles locales existent : l'aiguillage des cartes ne mène à aucun 404).
const cibles = Object.values(NOEUDS).map((n) => n.cible).filter((c) => typeof c === 'string');
verdicts.cibleNePointePasVersUnePageDisparue = cibles.length > 0
  && cibles.every((c) => !/^(grima|naga|ultima|tao)\.html$/.test(c)); // + tao.html (supprimé le 30/09)
const ciblesLocalesManquantes = cibles
  .filter((c) => /\.html$/.test(c) && !c.startsWith('http') && !existsSync(RACINE_REPO + c));
verdicts.ciblesLocalesExistent = cibles.length > 0 && ciblesLocalesManquantes.length === 0;
detail.ciblesLocalesExistent = ciblesLocalesManquantes.join(',');
// Les anciennes adresses ne tombent pas dans le vide : vercel.json redirige.
const vercel = JSON.parse(readFileSync(RACINE_REPO + 'vercel.json', 'utf8'));
const redirs = vercel.redirects || [];
const versCe = (source) => (redirs.find((r) => r.source === source) || {}).destination;
verdicts.redirectionsAnciennesAdresses = redirs.length > 0
  && versCe('/ultima') === '/omega' && versCe('/ultima.html') === '/omega'
  && versCe('/grima') === '/omega' && versCe('/grima.html') === '/omega'
  && versCe('/naga') === '/imladrik' && versCe('/naga.html') === '/imladrik';
// AJOUT (30/09) : TAO redirige vers l'écran isolé des DRAGONS, là où ses deux
// pôles vivent — pas vers `/imladrik` nu (le visiteur d'un vieux lien /tao
// atterrit là où RESHIRAM et ZEKROM sont). Chaque source est UNIQUE (une seconde
// règle pour la même source ne s'appliquerait jamais) et permanente (308).
const REDIR_TAO = '/imladrik#constellation-dragons';
verdicts.redirectionsTaoVersLesDragons = ['/tao', '/tao.html'].every((src) => {
  const regles = redirs.filter((r) => r.source === src);
  return regles.length === 1 && regles[0].destination === REDIR_TAO
    && regles[0].permanent === true;
});

// IMLADRIK porte DEUX entrées (30/09, Paul : ADRAMELECH et les pôles de l'ex-TAO
// rejoignent les DRAGONS) : les CONSTELLATIONS ARMES et DRAGONS, et rien d'autre.
// Avant : quatre (avec ADRAMELECH et TAO), la veille ; cinq caps à plat avant.
// TRANSPOSÉ : `imladrikQuatreEntrees` → `imladrikDeuxEntrees`. Le COCKPIT, que
// TAO portait, est passé à IMLADRIK : sans lui, plus aucune ligne « En cours » ni
// aucun signal « À traiter » au survol de RESHIRAM, ZEKROM et DRAGONS.
verdicts.imladrikDeuxEntrees = JSON.stringify(NOEUDS.imladrik.enfants)
  === JSON.stringify(['constellation-armes', 'constellation-dragons'])
  && NOEUDS.imladrik.enfants.length === 2
  && estBoussole('imladrik')
  && !NOEUDS.imladrik.enfants.includes('adramelech')
  && !NOEUDS.imladrik.enfants.includes('tao');
verdicts.imladrikPorteLeCockpit = NOEUDS.imladrik.cockpit === true;
// Le cockpit ne s'est pas DUPLIQUÉ : les nœuds qui le portent sont exactement
// ceux d'avant (`racine,omega,tao`, relevés sur la boucle B) avec IMLADRIK À LA
// PLACE de TAO — la liste est LUE dans l'ancien registre, pas supposée.
verdicts.cockpitPortePar = Object.keys(NOEUDS).filter((id) => NOEUDS[id].cockpit === true).join()
  === 'racine,omega,imladrik'
  && NOEUDS['constellation-dragons'].cockpit === undefined;
detail.cockpitPortePar = Object.keys(NOEUDS).filter((id) => NOEUDS[id].cockpit === true).join();
// ADRAMELECH vit sous DRAGONS (plus sous IMLADRIK), et il est le SEUL cap
// à page à porter lui-même des enfants (ses trois caps ne sont PAS ceux de DRAGONS).
verdicts.adramelechSousLesDragons = parentDe('adramelech') === 'constellation-dragons'
  && chemin('adramelech').join('/') === 'racine/omega/imladrik/constellation-dragons/adramelech'
  && NOEUDS['constellation-dragons'].enfants.includes('adramelech')
  && !NOEUDS.imladrik.enfants.includes('adramelech')
  && estBoussole('adramelech');
// ADRAMELECH, RESHIRAM et ZEKROM ne pendent que sous DRAGONS (un doublon ailleurs
// passerait au travers d'un simple test de parent).
verdicts.adramelechEtJumeauxUnSeulParent = ['adramelech', 'reshiram', 'zekrom'].every((id) =>
  Object.keys(NOEUDS).filter((p) => (NOEUDS[p].enfants || []).includes(id)).join() === 'constellation-dragons');

// ---- TAO A DISPARU (30/09, Paul : « supprime TAO partout ») — l'ABSENCE ----
// Comme GRIMA et NAGA plus haut : un TAO ressuscité par un mauvais merge
// passerait vert partout ailleurs (ses deux enfants sont là aussi). Chaque
// détecteur est ÉPROUVÉ sur un cas dont on connaît la réponse (une copie sabotée)
// avant d'être cru sur le vrai registre : « aucun nœud ne nomme tao » est vert sur
// un détecteur aveugle, et sur un registre vide.
const nommeTao = (noeuds) => Object.keys(noeuds).filter((id) => {
  const n = noeuds[id];
  return id === 'tao' || (n.enfants || []).includes('tao') || n.lien === 'tao'
    || n.blason === 'tao' || n.coeur === 'tao' || n.cible === 'tao.html'
    || n.nebuleuse === 'tao';
});
{
  const sabotes = ['enfant', 'lien', 'blason', 'coeur', 'cible', 'nom'].map((cas) => {
    const c = structuredClone(NOEUDS);
    if (cas === 'enfant') { c.imladrik.enfants.push('tao'); }
    if (cas === 'lien') { c.zekrom.lien = 'tao'; }
    if (cas === 'blason') { c.zekrom.blason = 'tao'; }
    if (cas === 'coeur') { c.imladrik.coeur = 'tao'; }
    if (cas === 'cible') { c.zekrom.cible = 'tao.html'; }
    if (cas === 'nom') { c.tao = { nom: 'TAO', enfants: ['reshiram', 'zekrom'] }; }
    return nommeTao(c).length > 0;
  });
  verdicts.detecteurTaoVoitLesSixFormes = sabotes.length === 6 && sabotes.every(Boolean);
}
verdicts.taoAbsentDuRegistre = Object.keys(NOEUDS).length > 20 // non-vacuité : un registre plein
  && nommeTao(NOEUDS).length === 0
  && !/\btao\b/i.test(JSON.stringify(NOEUDS))
  && !valeursDe(NOEUDS).some((t) => /\btao\b/i.test(t));
verdicts.pageTaoSupprimee = !existsSync(RACINE_REPO + 'tao.html')
  && existsSync(RACINE_REPO + 'imladrik.html') && existsSync(RACINE_REPO + 'reshiram.html')
  && existsSync(RACINE_REPO + 'zekrom.html'); // les deux pages qu'elle reliait, elles, restent
// AUCUNE PAGE SERVIE NE LIE ENCORE VERS TAO. Le registre ne suffit pas à le dire :
// une page peut porter son propre lien de retour (reshiram.html, zekrom.html et
// adramelech.html pointaient vers `tao.html` ou `imladrik.html` en dur). On balaye
// donc le HTML servi — tous les `*.html` de la racine — à la recherche de
// `href="tao.html"` (et de ses variantes : apostrophes, sans guillemets, `/tao`,
// sans extension). Le détecteur est ÉPROUVÉ d'abord sur des cas dont on connaît la
// réponse (positifs ET négatifs), puis le balayage est placé sous VERROU de
// non-vacuité : au moins 20 fichiers lus, dont les cinq pages qui liaient TAO ou
// l'auraient pu — « aucun lien » est vert sur zéro fichier lu.
const LIEN_VERS_TAO = /href\s*=\s*["']?\s*\/?(?:\.\/)?tao(?:\.html)?(?=["'\s>#?]|$)/i;
verdicts.detecteurLienTaoEprouve = [
  '<a href="tao.html">', '<a href=\'tao.html\'>', '<a href=tao.html>', '<a  href = "/tao">',
  '<a href="tao.html#x">', '<a class="r" href="./tao.html">', '<A HREF="TAO.HTML">',
].every((t) => LIEN_VERS_TAO.test(t))
  && [
    '<a href="imladrik.html">', '<a href="tao-x.html">', '<a href="ultima.html#tao">',
    '<a href="autao.html">', '<p>tao.html</p>', '<a href="imladrik.html#constellation-dragons">',
  ].every((t) => !LIEN_VERS_TAO.test(t));
{
  const pagesRacine = readdirSync(RACINE_REPO).filter((f) => /\.html$/.test(f));
  const lues = pagesRacine.map((f) => [f, readFileSync(RACINE_REPO + f, 'utf8')]);
  const fautives = lues.filter(([, html]) => LIEN_VERS_TAO.test(html)).map(([f]) => f);
  verdicts.aucunePageServieNeLieTao = lues.length >= 20
    && ['index.html', 'omega.html', 'imladrik.html', 'reshiram.html', 'zekrom.html', 'adramelech.html']
      .every((f) => lues.some(([n]) => n === f))
    && lues.every(([, html]) => html.length > 200) // aucun fichier vide ou tronqué
    && fautives.length === 0;
  detail.aucunePageServieNeLieTao = `${lues.length} fichiers lus ; fautifs : ${fautives.join(',') || 'aucun'}`;
  // Et la version « sabotée » du balayage voit bien un lien réintroduit : le même
  // balayage, sur les mêmes fichiers avec un `href="tao.html"` glissé dans l'un d'eux.
  const sabote = lues.map(([f, html]) => [f, f === 'reshiram.html'
    ? html.replace('</body>', '<a href="tao.html">↞ TAO</a></body>') : html]);
  verdicts.balayageTaoVoitUnLienReintroduit = sabote.filter(([, html]) => LIEN_VERS_TAO.test(html))
    .map(([f]) => f).join() === 'reshiram.html'
    && sabote.find(([f]) => f === 'reshiram.html')[1].includes('href="tao.html"');
}
// Aucune cible du registre ne mène à tao.html (`ciblesLocalesExistent`, plus haut,
// le dirait déjà — ici on nomme la cause). Non-vacuité : des cibles, il y en a.
{
  const ciblesReg = Object.values(NOEUDS).map((n) => n.cible).filter((c) => typeof c === 'string');
  verdicts.aucuneCibleVersTao = ciblesReg.length >= 15
    && ciblesReg.every((c) => !/tao/i.test(c));
  detail.aucuneCibleVersTao = ciblesReg.filter((c) => /tao/i.test(c)).join(',');
}
// Les gravures de TAO (le yin-yang) sont parties avec lui — et celles de ses
// deux pôles, elles, restent : sans elles, RESHIRAM et ZEKROM perdraient leur
// blason chez les DRAGONS (`verifierRegistre` refuserait « blason absent »).
verdicts.gravuresDeTaoSupprimees = BLASONS.tao === undefined && COEURS.tao === undefined
  && !('tao' in BLASONS) && !('tao' in COEURS)
  && !Object.keys(BLASONS).some((k) => /tao/i.test(k))
  && !Object.keys(COEURS).some((k) => /tao/i.test(k))
  && Object.keys(BLASONS).length > 20 && Boolean(COEURS.kalamn)
  && Boolean(BLASONS[NOEUDS.reshiram.blason]) && Boolean(BLASONS[NOEUDS.zekrom.blason]);

// Le repli <noscript> des coques égale le registre (un cap oublié y serait
// inatteignable sans JavaScript). index : ALPHA avant OMEGA, comme la racine.
const capsDuNoscript = (page) => {
  // Les commentaires HTML sont retirés AVANT la recherche : un commentaire qui
  // cite « <noscript> » (omega.html en a un) ferait lire le mauvais bloc.
  const html = readFileSync(RACINE_REPO + page, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const bloc = /<noscript>([\s\S]*?)<\/noscript>/.exec(html);
  if (!bloc) return null;
  const sansCommentaires = bloc[1];
  return [...sansCommentaires.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]);
};
const ciblesDe = (id) => capsDe(id).map((c) => c.cible);
// LES CIBLES QU'UN REPLI DOIT PORTER : celles des caps, et — puisqu'une
// CONSTELLATION n'a pas de page et que son repli est une SOUS-LISTE — celles de
// ce qu'elle contient, dans l'ordre du registre, en profondeur. On ne descend
// QUE par les constellations : ADRAMELECH a des enfants (LE REGISTRE, LES
// ARCHIPELS, LES RAPPROCHEMENTS) qui vivent sur sa propre page, pas dans le
// repli d'IMLADRIK (avant le 30/09 c'était TAO, avec RESHIRAM et ZEKROM).
const ciblesAtteignables = (id, noeuds = NOEUDS) => capsDe(id, noeuds).flatMap((c) => (
  c.constellation === true ? ciblesAtteignables(c.id, noeuds) : (c.cible ? [c.cible] : [])));
const texteNoscript = (page) => {
  const html = readFileSync(RACINE_REPO + page, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const bloc = /<noscript>([\s\S]*?)<\/noscript>/.exec(html);
  return bloc ? bloc[1] : null;
};
verdicts.noscriptOmegaEgaleLeRegistre = JSON.stringify(capsDuNoscript('omega.html'))
  === JSON.stringify(ciblesDe('omega')) && ciblesDe('omega').length === 3;
// IMLADRIK : les liens du repli = les cibles non nulles des caps ET de ce que
// portent ses constellations (6 : les trois dragons, ADRAMELECH, RESHIRAM,
// ZEKROM ; TAO n'y est plus), dans l'ordre du registre. L'ancien verdict comparait aux seuls enfants directs :
// devenu faux (les dragons sont une sous-liste), et sa version « enfants
// directs seulement » serait passée vert en oubliant les trois dragons.
const attendusNoscriptImladrik = ciblesAtteignables('imladrik');
verdicts.noscriptImladrikEgaleLeRegistre = JSON.stringify(capsDuNoscript('imladrik.html'))
  === JSON.stringify(attendusNoscriptImladrik)
  && JSON.stringify(attendusNoscriptImladrik) === JSON.stringify([
    'maedrethnir.html', 'vranesh.html', 'draukhain.html', 'adramelech.html',
    'reshiram.html', 'zekrom.html']);
// Le repli ne descend PAS plus bas que les constellations (les caps propres
// d'ADRAMELECH n'y sont pas) et ne nomme plus TAO. Non-vacuité : le repli EST lu.
verdicts.noscriptImladrikSansTaoNiSousPages = (capsDuNoscript('imladrik.html') || []).length === 6
  && !(capsDuNoscript('imladrik.html') || []).some((c) => /tao/i.test(c))
  && !(capsDuNoscript('imladrik.html') || []).some((c) => ['registre.html', 'idees.html'].includes(c))
  && !/\btao\b/i.test(texteNoscript('imladrik.html') || '');
detail.noscriptImladrikEgaleLeRegistre = JSON.stringify(capsDuNoscript('imladrik.html'));
// IFULVIN n'a pas de page, donc pas de lien : il doit pourtant être DIT dans le
// repli (sans JavaScript, ce qui n'est pas écrit n'existe pas) — sous le nom
// EXACT, et sans lien.
const noscriptImladrik = texteNoscript('imladrik.html') || '';
verdicts.noscriptImladrikDitIfulvin = /IFULVIN/.test(noscriptImladrik)
  && !/<a [^>]*>[^<]*IFULVIN/.test(noscriptImladrik);
// Les SIX étoiles des DRAGONS sont regroupées dans UNE sous-liste (`<ul>` sans
// `<ul>` dedans qui les contient toutes les six) : le repli reflète la hiérarchie.
// INVERSÉ (30/09) : l'ancien verdict exigeait `!ul.includes('adramelech.html')` —
// ADRAMELECH était à côté ; il est maintenant DEDANS, et son absence de la
// sous-liste serait la faute. Quant à IFULVIN, il reste HORS de cette sous-liste
// (il est sous les ARMES) : la sous-liste des dragons n'est pas « tout ce qui a
// une page ».
const CIBLES_DRAGONS = NOEUDS['constellation-dragons'].enfants.map((id) => NOEUDS[id].cible);
verdicts.noscriptImladrikRegroupeLesDragons = (noscriptImladrik.match(/<ul>((?:(?!<ul>)[\s\S])*?)<\/ul>/g) || [])
  .some((ul) => CIBLES_DRAGONS.length === 6
    && CIBLES_DRAGONS.every((c) => ul.includes(`href="${c}"`))
    && !/IFULVIN/.test(ul))
  && /DRAGONS/.test(noscriptImladrik);
const noscriptIndex = capsDuNoscript('index.html');
verdicts.noscriptIndexEgaleLeRegistre = JSON.stringify(noscriptIndex)
  === JSON.stringify(ciblesDe(RACINE));
verdicts.indexListeAlphaAvantOmega = Array.isArray(noscriptIndex)
  && noscriptIndex.indexOf('alpha.html') !== -1
  && noscriptIndex.indexOf('alpha.html') < noscriptIndex.indexOf('omega.html')
  && NOEUDS[RACINE].enfants.indexOf('alpha') < NOEUDS[RACINE].enfants.indexOf('omega');

// L'acquis IMLADRIK est intact (le noyau doit le rendre à l'identique).
// (Ses trois caps historiques — MAEDRETHNIR, VRANESH, DRAUKHAIN — vivent
// désormais SOUS la constellation DRAGONS : ils ne sont plus des enfants directs
// d'IMLADRIK depuis le 2026-09-30, et ils ne sont pas perdus : on les exige là.)
const capsImladrik = capsDe('imladrik');
// TRANSPOSÉ (30/09) : `imladrikDeuxConstellationsEnTete` — « en tête » devient
// « seules » (il n'y a plus rien derrière) ; `…TroisDragonsSousLaConstellation` →
// SIX étoiles sous DRAGONS (les trois dragons, ADRAMELECH, RESHIRAM, ZEKROM),
// dont aucune n'est un enfant direct d'IMLADRIK.
verdicts.imladrikDeuxConstellationsSeules = capsImladrik.length === 2
  && capsImladrik.map((c) => c.nom).join(',') === 'ARMES,DRAGONS'
  && capsImladrik.every((c) => c.constellation === true);
verdicts.imladrikSixEtoilesSousLesDragons = capsDe('constellation-dragons')
  .map((c) => c.nom).join(',') === 'MAEDRETHNIR,VRANESH,DRAUKHAIN,ADRAMELECH,RESHIRAM,ZEKROM'
  && capsDe('constellation-dragons').length === 6
  && !capsImladrik.some((c) => ['maedrethnir', 'vranesh', 'draukhain', 'adramelech', 'reshiram', 'zekrom']
    .includes(c.id));
// « Cinq cibles ouvertes » → SIX (30/09) : le compte est REFIXÉ, pas relâché ; il
// se lit en profondeur — les six pages d'IMLADRIK (trois dragons, ADRAMELECH,
// RESHIRAM, ZEKROM) sont atteignables, et la SEULE feuille sans page qu'il porte
// est IFULVIN. (Avant : cinq, avec TAO à la place de RESHIRAM et ZEKROM.)
const feuillesDImladrik = [];
const parcourir = (id) => capsDe(id).forEach((c) => {
  if (c.constellation === true) { parcourir(c.id); } else { feuillesDImladrik.push(c); }
});
parcourir('imladrik');
verdicts.imladrikSixCiblesOuvertes = feuillesDImladrik.filter((c) => c.cible).length === 6
  && feuillesDImladrik.filter((c) => c.cible).every((c) => typeof c.cible === 'string' && c.cible.endsWith('.html'))
  && feuillesDImladrik.filter((c) => c.cible).map((c) => c.cible).join()
    === 'maedrethnir.html,vranesh.html,draukhain.html,adramelech.html,reshiram.html,zekrom.html';
verdicts.imladrikSeuleIfulvinSansPage = feuillesDImladrik.filter((c) => !c.cible).map((c) => c.id).join() === 'ifulvin';
verdicts.imladrikLegendeGravee = NOEUDS.imladrik.legende === 'Kalamn-talaen'
  && NOEUDS.imladrik.legendeClasse === 'kalamn-legende';

// Les caps externes déclarent leur ouverture en nouvel onglet.
verdicts.renoboostExterne = NOEUDS['renoboost-ia'].externe === true
  && NOEUDS['renoboost-ia'].cible.startsWith('https://');
// Les ÉTOILES D'ATTENTE (sans page) : la garantie portée jadis par YCOME est
// reportée sur DOKLĚS et SYMPHO — elle ne part pas avec lui.
verdicts.etoilesDAttenteSansCible = ['dokles', 'sympho']
  .every((id) => NOEUDS[id] && NOEUDS[id].cible === null && NOEUDS[id].etat === 'À venir');

// Passerelle RESHIRAM ⇄ ZEKROM, dans le même nœud — qui n'est plus TAO (30/09)
// mais la constellation DRAGONS. TRANSPOSÉ : `passerelleTao` → `passerelleJumeaux`.
// La passerelle garde son NOM GRAVÉ, et ses deux bouts ont le MÊME parent (sans
// quoi l'arc ne serait tracé sur aucun écran : voir versCiel).
verdicts.passerelleJumeaux = NOEUDS.reshiram.lien === 'zekrom'
  && NOEUDS.reshiram.lienLibelle === '⇄ rétroplanning'
  && NOEUDS['constellation-dragons'].enfants.includes('reshiram')
  && NOEUDS['constellation-dragons'].enfants.includes('zekrom')
  && parentDe('reshiram') === parentDe('zekrom');
// Elle est la SEULE passerelle de tout le registre (l'astérisme des DRAGONS est
// retiré : aucune autre arête ne doit surgir par la déclaration d'un `lien`).
verdicts.uneSeulePasserelle = Object.keys(NOEUDS).filter((id) => NOEUDS[id].lien).join() === 'reshiram';

// Aucune donnée personnelle dans le registre (il décrit la navigation).
const texteRegistre = JSON.stringify(NOEUDS);
verdicts.zeroPii = !/@|\+33|\b0[1-9](\s?\d{2}){4}\b/.test(texteRegistre);

// ---------- 3 quater. Les CONSTELLATIONS d'IMLADRIK (dictées le 2026-09-29) ----------
// Deux nœuds SANS PAGE où l'on plonge (le moteur isole ce qui contient) :
// ARMES (IFULVIN, étoile d'attente) et DRAGONS (MAEDRETHNIR, VRANESH,
// DRAUKHAIN). Ils appellent une règle nouvelle — une constellation est une
// boussole dès UN cap — et c'est l'EXCEPTION qu'il faut attaquer, pas l'usage.
const CONSTELLATIONS = ['constellation-armes', 'constellation-dragons'];
verdicts.constellationsExistent = CONSTELLATIONS.every((id) => Boolean(NOEUDS[id])
  && parentDe(id) === 'imladrik'
  && estBoussole(id) && estConstellation(id)
  && NOEUDS[id].cible === null);
verdicts.constellationsNommeesArmesDragons = NOEUDS['constellation-armes'].nom === 'ARMES'
  && NOEUDS['constellation-dragons'].nom === 'DRAGONS';
verdicts.armesPorteIfulvinSeul = JSON.stringify(NOEUDS['constellation-armes'].enfants)
  === JSON.stringify(['ifulvin']);
// TRANSPOSÉ (30/09) : `dragonsPorteLesTroisDragons` → SIX enfants EXACTS, dans cet
// ordre — le compte se verrouille des deux côtés (ni cinq, ni sept) et l'ordre
// est celui du repli <noscript>, comparé plus haut.
verdicts.dragonsPorteLesSixEtoiles = JSON.stringify(NOEUDS['constellation-dragons'].enfants)
  === JSON.stringify(['maedrethnir', 'vranesh', 'draukhain', 'adramelech', 'reshiram', 'zekrom'])
  && NOEUDS['constellation-dragons'].enfants.length === 6;
// AJOUT (30/09) : les DRAGONS n'ont AUCUN trait de figure — `asterisme: false`,
// littéralement `false` (ni absent, ni « non »). ARMES, elle, garde le défaut
// (un seul cap : rien à relier de toute façon, mais l'exception n'est pas
// déclarée là où on n'en a pas besoin).
verdicts.dragonsSansAsterisme = NOEUDS['constellation-dragons'].asterisme === false
  && Object.keys(NOEUDS).filter((id) => NOEUDS[id].asterisme !== undefined).join()
    === 'constellation-dragons';
verdicts.cheminMaedrethnirParLesDragons = chemin('maedrethnir').join('/')
  === 'racine/omega/imladrik/constellation-dragons/maedrethnir'
  && chemin('vranesh').join('/') === 'racine/omega/imladrik/constellation-dragons/vranesh'
  && chemin('draukhain').join('/') === 'racine/omega/imladrik/constellation-dragons/draukhain';
verdicts.cheminDesTroisNouveauxDragons = chemin('adramelech').join('/')
  === 'racine/omega/imladrik/constellation-dragons/adramelech'
  && chemin('reshiram').join('/') === 'racine/omega/imladrik/constellation-dragons/reshiram'
  && chemin('zekrom').join('/') === 'racine/omega/imladrik/constellation-dragons/zekrom';
verdicts.cheminIfulvinParLesArmes = chemin('ifulvin').join('/')
  === 'racine/omega/imladrik/constellation-armes/ifulvin';
// Le drapeau ne s'accroche à AUCUN autre nœud (et l'absence se lit sur toute la
// table : vérifier les deux constellations ne dirait rien d'un troisième).
verdicts.seulesDeuxConstellationsPortentLeDrapeau = Object.keys(NOEUDS)
  .filter((id) => NOEUDS[id].constellation !== undefined).join() === CONSTELLATIONS.join()
  && Object.keys(NOEUDS).filter((id) => estConstellation(id)).join() === CONSTELLATIONS.join()
  && !estConstellation('imladrik') && !estConstellation('adramelech')
  && !estConstellation('reshiram') && !estConstellation('zekrom')
  && !estConstellation('tao') && !estConstellation('ifulvin')
  && !estConstellation('jamais-vu');
// Chaque dragon, chaque arme ne pend que sous SA constellation.
verdicts.dragonsEtIfulvinUnSeulParent = ['maedrethnir', 'vranesh', 'draukhain', 'adramelech', 'reshiram', 'zekrom', 'ifulvin'].every((id) => {
  const parents = Object.keys(NOEUDS).filter((p) => (NOEUDS[p].enfants || []).includes(id));
  return parents.length === 1 && NOEUDS[parents[0]].constellation === true;
});

// ---- IFULVIN : étoile d'attente, dont le nom ne s'abrège JAMAIS ----
// (modèle DOKLĚS / SYMPHO — nom, état, une phrase, AUCUNE cible.)
verdicts.ifulvinNomExact = NOEUDS.ifulvin.nom === 'IFULVIN';
detail.ifulvinNomExact = String(NOEUDS.ifulvin.nom);
verdicts.ifulvinSansCible = NOEUDS.ifulvin.cible === null
  && Object.prototype.hasOwnProperty.call(NOEUDS.ifulvin, 'cible');
verdicts.ifulvinEtoileDAttente = NOEUDS.ifulvin.etat === 'À venir'
  && !/ouvert|acc[eé]d/i.test(NOEUDS.ifulvin.etat)
  && !Array.isArray(NOEUDS.ifulvin.enfants);
// LE VERROU CONTRE L'ABRÉVIATION. Le nom se vérifie sur TOUTE valeur textuelle
// du registre (nom, résumé, titre, légende…), pas seulement sur la clé `nom` :
// une phrase de Léo qui dirait « Ifu » est la même faute que la clé abrégée.
// Le détecteur est éprouvé sur un cas dont on connaît la réponse (une copie
// sabotée) AVANT d'être cru sur le vrai registre — un « absent » vert sur un
// détecteur aveugle ne prouverait rien.
const valeursTextuelles = (noeuds) => {
  const out = [];
  const collecte = (v) => {
    if (typeof v === 'string') { out.push(v); }
    else if (v && typeof v === 'object') { Object.values(v).forEach(collecte); }
  };
  collecte(noeuds);
  return out;
};
const abregesIfulvin = (noeuds) => valeursTextuelles(noeuds)
  .flatMap((t) => t.match(/\bifu\w*/gi) || [])
  .filter((m) => m.toLowerCase() !== 'ifulvin');
{
  const sabote = structuredClone(NOEUDS);
  sabote.ifulvin.nom = 'IFU';
  sabote['constellation-armes'].resume = 'Ifu en est la première.';
  verdicts.detecteurIfuVoitLAbreviation = abregesIfulvin(sabote).length === 2
    && valeursTextuelles(sabote).some((t) => /\bifu\b/i.test(t));
}
const mentionsIfulvin = valeursTextuelles(NOEUDS).flatMap((t) => t.match(/\bifu\w*/gi) || []);
verdicts.ifulvinJamaisAbrege = mentionsIfulvin.length >= 3 // non-vacuité : nom, id, enfants…
  && abregesIfulvin(NOEUDS).length === 0
  && !valeursTextuelles(NOEUDS).some((t) => /\bifu\b/i.test(t));
detail.ifulvinJamaisAbrege = abregesIfulvin(NOEUDS).join(',');

// ---- L'EXCEPTION NE FUIT PAS ----
// « Assouplis la règle pour les constellations » : le risque est qu'on ait
// assoupli la règle POUR TOUT LE MONDE. Le garde-fou s'éprouve donc du côté où
// il peut être contourné — sur une COPIE du registre, sans jamais écrire dans
// le vrai — et non du côté qu'on emprunte tous les jours (ARMES à un cap, sain).
const copie = () => structuredClone(NOEUDS);
const anomaliesDe = (noeuds, motif) => verifierRegistre(noeuds, BLASONS, COEURS)
  .filter((a) => motif.test(a));
// Verrou de non-vacuité : la copie témoin est SAINE. Sans lui, « l'anomalie est
// signalée » serait vrai d'une copie cassée par la copie elle-même.
verdicts.exceptionCopieTemoinSaine = verifierRegistre(copie(), BLASONS, COEURS).length === 0
  && NOEUDS['constellation-armes'].enfants.length === 1;
// (a) Un nœud ORDINAIRE à un seul enfant reste une anomalie « moins de 2 caps ».
{
  const c = copie();
  // TRANSPOSÉ (30/09) : le nœud ordinaire de référence n'est plus TAO (supprimé)
  // mais ADRAMELECH — une boussole ordinaire (3 caps, une page), ramenée à un cap.
  c.adramelech.enfants = ['registre'];
  verdicts.exceptionNeFuitPas_noeudOrdinaire = anomaliesDe(c, /^adramelech : boussole à moins de 2 caps/).length === 1
    && !estBoussole('adramelech', c) && !estConstellation('adramelech', c);
}
// (a bis) Idem pour IMLADRIK lui-même : il n'hérite pas de l'exception de ses fils.
{
  const c = copie();
  c.imladrik.enfants = ['constellation-armes'];
  verdicts.exceptionNeFuitPas_imladrikNHeritePas = anomaliesDe(c, /^imladrik : boussole à moins de 2 caps/).length === 1
    && !estBoussole('imladrik', c);
}
// (b) Un drapeau qui n'est pas EXACTEMENT `true` est refusé — et n'ouvre pas
// l'exception : ARMES (un seul cap) redevient une boussole invalide.
{
  const valeurs = ['oui', 'true', 1, false, null, {}];
  const refusees = valeurs.map((v) => {
    const c = copie();
    c['constellation-armes'].constellation = v;
    const d = copie();
    d['constellation-dragons'].constellation = v;
    return anomaliesDe(c, /^constellation-armes : « constellation » ne vaut que true/).length === 1
      && anomaliesDe(c, /^constellation-armes : boussole à moins de 2 caps/).length === 1
      && !estBoussole('constellation-armes', c) && !estConstellation('constellation-armes', c)
      && anomaliesDe(d, /^constellation-dragons : « constellation » ne vaut que true/).length === 1
      && !estConstellation('constellation-dragons', d);
  });
  verdicts.exceptionNeFuitPas_drapeauNonBooleen = refusees.length === valeurs.length && refusees.every(Boolean);
}
// (c) Une constellation SANS CAP est une anomalie (0 enfant, ou plus de liste).
{
  const c = copie();
  c['constellation-armes'].enfants = [];
  const sansListe = copie();
  delete sansListe['constellation-armes'].enfants;
  const feuilleMarquee = copie();
  feuilleMarquee.ifulvin.constellation = true; // une feuille qui se dit constellation
  verdicts.exceptionNeFuitPas_constellationVide = anomaliesDe(c, /^constellation-armes : constellation sans aucun cap/).length === 1
    && !estBoussole('constellation-armes', c)
    && anomaliesDe(sansListe, /^constellation-armes : constellation sans aucun cap/).length === 1
    && anomaliesDe(feuilleMarquee, /^ifulvin : constellation sans aucun cap/).length === 1
    && !estBoussole('ifulvin', feuilleMarquee);
}
// (d) Le cas LÉGITIME, pour que le refus ci-dessus ne soit pas un refus de tout :
// une constellation à UN seul cap n'appelle AUCUNE anomalie de caps.
{
  const c = copie();
  c['constellation-dragons'].enfants = ['maedrethnir']; // DRAGONS ramenée à un cap
  const touchees = verifierRegistre(c, BLASONS, COEURS)
    .filter((a) => /^constellation-dragons :/.test(a));
  verdicts.exceptionLegitime_uneConstellationAUnCap = touchees.length === 0
    && estBoussole('constellation-dragons', c)
    && anomaliesDe(copie(), /^constellation-armes :/).length === 0;
  detail.exceptionLegitime_uneConstellationAUnCap = touchees.join(' | ');
}

// ---- LE DRAPEAU `asterisme` : mêmes règles, même côté du garde-fou (30/09) ----
// `asterisme: false` retire les traits de figure d'un écran (js/ciel-noeud.mjs) ;
// il est fait pour ne RETIRER que : `false` ou absent, rien d'autre. Éprouvé du
// côté où il peut être contourné — sur des COPIES, avec le cas légitime et la
// copie témoin saine, pour qu'« anomalie » ne soit pas vrai de tout.
const ANOM_ASTERISME = /« asterisme » ne vaut que false/;
verdicts.asterisme_copieTemoinSaine = verifierRegistre(copie(), BLASONS, COEURS).length === 0
  && NOEUDS['constellation-dragons'].asterisme === false
  && anomaliesDe(copie(), ANOM_ASTERISME).length === 0;
{
  // (a) `true` : le défaut ne se DÉCLARE pas (ce serait un second chemin vers le
  // même effet) — anomalie, sur DRAGONS comme sur un nœud qui n'en avait pas.
  const surDragons = copie();
  surDragons['constellation-dragons'].asterisme = true;
  const surImladrik = copie();
  surImladrik.imladrik.asterisme = true;
  verdicts.asterisme_trueRefuse = anomaliesDe(surDragons, ANOM_ASTERISME).length === 1
    && anomaliesDe(surDragons, /^constellation-dragons : « asterisme »/).length === 1
    && anomaliesDe(surImladrik, /^imladrik : « asterisme »/).length === 1
    && verifierRegistre(surDragons, BLASONS, COEURS).length === 1; // et rien d'autre ne casse
}
{
  // (b) toute autre valeur que le booléen `false` : refusée, une par une.
  const valeurs = ['non', 'false', 'oui', 0, 1, null, '', {}, []];
  const refusees = valeurs.map((v) => {
    const c = copie();
    c['constellation-dragons'].asterisme = v;
    return anomaliesDe(c, /^constellation-dragons : « asterisme » ne vaut que false/).length === 1;
  });
  verdicts.asterisme_autresValeursRefusees = refusees.length === valeurs.length && refusees.every(Boolean);
  detail.asterisme_autresValeursRefusees = refusees.join();
}
{
  // (c) ABSENT : aucune anomalie. C'est le défaut de tous les autres nœuds.
  const c = copie();
  delete c['constellation-dragons'].asterisme;
  verdicts.asterisme_absentNeDitRien = !('asterisme' in c['constellation-dragons'])
    && verifierRegistre(c, BLASONS, COEURS).length === 0
    && anomaliesDe(c, ANOM_ASTERISME).length === 0
    && Object.keys(copie()).filter((id) => copie()[id].asterisme === undefined).length
      === Object.keys(NOEUDS).length - 1; // tous sauf DRAGONS : le drapeau reste l'exception
  // (d) `false` explicite : le cas légitime, sur DRAGONS ET sur un autre nœud.
  const d = copie();
  d['constellation-armes'].asterisme = false;
  verdicts.asterisme_falseAccepte = verifierRegistre(d, BLASONS, COEURS).length === 0
    && anomaliesDe(d, ANOM_ASTERISME).length === 0;
}

// ---------- 4. Géométrie de la rose — ABANDONNÉE (P5c, 2026-08-19) ----------
// `positions()` vivait dans js/boussole-noyau.mjs, SUPPRIMÉ avec la dernière
// rose : VRANESH, son ultime appelant, est passé au ciel (arbitrage C du
// cadrage LV5 §3.3) — vérifié par grep avant suppression, plus aucune page ne
// chargeait le noyau. La trigonométrie de la rose est morte avec elle : le
// ciel a sa PROPRE géométrie, éprouvée par tests/smoke-lv4-ciel.mjs (cadrage
// serré, couronne, débordements) et par le pire cas construit couronne(12) de
// tests/smoke-vranesh.mjs §K. Verdicts retirés : premierCapPleinNord,
// repartitionReguliere, sensHoraire.

// ---------- 5. Cockpit : des comptes, rien d'autre ----------
const AGREGATS = {
  riven: { relances_dues: 3 },
  reshiram: { talents: 5, a_etayer: 2 },
  zekrom: { ideaux: 3, a_orienter: 1, acquis: 4, a_construire: 2 },
};
// TRANSPOSÉ (30/09) : ce que `tao` rendait, `constellation-dragons` le rend —
// À L'IDENTIQUE. Les attendus ci-dessous sont les sorties EXACTES du cockpit
// d'avant (`ligneVivante('tao', …)` / `signalDe('tao', …)`, relevées sur le code
// de la boucle B, commit 4f37e95), pas des chaînes recomposées à la main : on
// épingle la valeur d'hier, pas l'idée qu'on s'en fait. Neuf jeux de données,
// dont les trois cas de silence.
const DRAGONS = 'constellation-dragons';
const CAS_COCKPIT = [
  // [donnée, ligneVivante attendue, signalDe attendu]
  [null, null, null],
  [{}, null, null],
  [{ riven: { relances_dues: 3 } }, null, null],
  [{ reshiram: { talents: 5, a_etayer: 2 } },
    '5 talents réels · 2 à étayer — 0 idéal · 0 à orienter.', '2 talents à étayer'],
  [{ zekrom: { ideaux: 3, a_orienter: 1, acquis: 4, a_construire: 2 } },
    '0 talent réel · 0 à étayer — 3 idéaux · 1 à orienter.', '1 idéal à orienter'],
  [{ reshiram: { talents: 5, a_etayer: 2 }, zekrom: { ideaux: 3, a_orienter: 1 } },
    '5 talents réels · 2 à étayer — 3 idéaux · 1 à orienter.', '2 talents à étayer · 1 idéal à orienter'],
  [{ reshiram: { talents: 1, a_etayer: 0 }, zekrom: { ideaux: 1, a_orienter: 0 } },
    '1 talent réel · 0 à étayer — 1 idéal · 0 à orienter.', null],
  [{ reshiram: { a_etayer: 0 }, zekrom: { a_orienter: 0 } },
    '0 talent réel · 0 à étayer — 0 idéal · 0 à orienter.', null],
  [{ reshiram: { talents: '<x>' } },
    '0 talent réel · 0 à étayer — 0 idéal · 0 à orienter.', null],
];
verdicts.cockpitMuetSansDonnee = ligneVivante(DRAGONS, null) === null && signalDe(DRAGONS, null) === null
  && ligneVivante('tao', null) === null && signalDe('tao', null) === null;
verdicts.cockpitDragonsRendCeQueRendaitTao = CAS_COCKPIT.length === 9
  && CAS_COCKPIT.filter(([, l]) => l !== null).length >= 5 // non-vacuité : il y a du rendu à comparer
  && CAS_COCKPIT.every(([data, ligne, signal]) => ligneVivante(DRAGONS, data) === ligne
    && signalDe(DRAGONS, data) === signal);
detail.cockpitDragonsRendCeQueRendaitTao = CAS_COCKPIT
  .map(([data]) => `${ligneVivante(DRAGONS, data)}|${signalDe(DRAGONS, data)}`).join(' ; ');
// Et TAO, lui, ne rend plus RIEN : sur ces MÊMES neuf jeux, dont ceux où les
// DRAGONS rendent du texte. (Un cockpit resté branché sur l'id `tao` répondrait
// encore ici pour lui-même, et l'ancien verdict — sur `tao` seul — serait vert.)
verdicts.cockpitTaoNeRendPlusRien = CAS_COCKPIT.every(([data]) => ligneVivante('tao', data) === null
  && signalDe('tao', data) === null);
verdicts.cockpitTaoAgrege = /5 talents réels · 2 à étayer — 3 idéaux · 1 à orienter\./.test(ligneVivante(DRAGONS, AGREGATS))
  && ligneVivante('tao', AGREGATS) === null;
verdicts.cockpitDragonsSignalCumule = signalDe(DRAGONS, AGREGATS) === '2 talents à étayer · 1 idéal à orienter'
  && signalDe(DRAGONS, AGREGATS) === signalDe('imladrik', AGREGATS);
verdicts.cockpitSupraCumule = signalDe('omega', AGREGATS)
  === '3 relances dues · 2 talents à étayer · 1 idéal à orienter';
verdicts.cockpitRivenSeul = signalDe('riven', AGREGATS) === '3 relances dues';
// OMEGA cumule RIVEN + les DRAGONS (RESHIRAM + ZEKROM) ; IMLADRIK ne cumule que
// les DRAGONS : les relances de RIVEN ne remontent pas jusqu'à lui. (TRANSPOSÉ le
// 30/09 : `…CumuleTaoSeul` → `…CumuleLesDragonsSeuls`.)
verdicts.cockpitImladrikCumuleLesDragonsSeuls = signalDe('imladrik', AGREGATS)
  === '2 talents à étayer · 1 idéal à orienter'
  && signalDe('imladrik', { riven: { relances_dues: 9 } }) === null;
// GRIMA / NAGA n'existent plus : plus aucun signal cumulé ne leur répond.
verdicts.cockpitGrimaNagaSilencieux = signalDe('grima', AGREGATS) === null
  && signalDe('naga', AGREGATS) === null && signalDe('ultima-perso', AGREGATS) === null;
verdicts.cockpitSeTaitSiRienAFaire = signalDe('omega', {
  riven: { relances_dues: 0 }, reshiram: { a_etayer: 0 }, zekrom: { a_orienter: 0 },
}) === null;
// Robustesse : des valeurs aberrantes ne produisent jamais autre chose que des entiers.
verdicts.cockpitEntiersSeulement = signalDe('riven', { riven: { relances_dues: '<img src=x>' } }) === null
  && signalDe('riven', { riven: { relances_dues: -7 } }) === null
  && signalDe('riven', { riven: { relances_dues: '4.9' } }) === '4 relances dues';
verdicts.cockpitInconnuSilencieux = ligneVivante('imladrik', AGREGATS) === null
  && ligneVivante('omega', AGREGATS) === null
  && signalDe('maedrethnir', AGREGATS) === null;

// ---------- Verdict ----------
let echecs = 0;
for (const [nom, ok] of Object.entries(verdicts)) {
  if (ok) console.log(`  ✅ ${nom}`);
  else { console.log(`  ❌ ${nom}${detail[nom] ? ' — ' + detail[nom] : ''}`); echecs += 1; }
}
console.log(echecs === 0 ? '=== REGISTRE LV3 VERT ===' : `=== ${echecs} VERDICT(S) EN ÉCHEC ===`);
process.exit(echecs === 0 ? 0 : 1);
