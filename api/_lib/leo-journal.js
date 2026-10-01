// LE JOURNAL DES ÉCRITURES DE LÉO — les décisions, en fonctions PURES.
// B1 étape ③, cadrage §12.6 (29/09/2026).
//
// ⛔ CE MODULE N'ÉCRIT RIEN, ET NE LIT RIEN. Il fabrique l'entrée à poser et
// décide du plafond ; la lecture et l'insertion vivent dans
// `api/_lib/leo-execution.js` (B1 ④, 30/09), qui l'appelle.
//
// Pourquoi des fonctions pures et pas des requêtes : elles restent éprouvables
// sans base — donc AVANT que la migration `20260929220000_leo_ecritures.sql`
// ne soit appliquée, qui est un gate de Paul.
//
// ---- Ce qui garde le dispositif, depuis le 29/09 -------------------------
// Les dix outils du catalogue sont verts : l'anneau ne borne plus rien sur
// eux. Ce qui garde, désormais, c'est ce journal (on voit ce qui a été fait)
// et le plafond de volume (on ne peut pas en faire dix mille).
import { anneauDe } from './leo.js';

// Les quatre phases d'une écriture. ⛔ Cette liste est DOUBLÉE dans la
// contrainte `check (phase in (…))` de la migration — c'est inévitable, une
// contrainte SQL ne s'importe pas. Un test lit donc le fichier de migration et
// exige que les deux coïncident : sans lui, le code écrirait un jour une phase
// que la base refuse, et l'échec serait MUET côté insertion.
// (RenoDevis, 15/09 : un versement refusé parce que le script écrivait
// « fourniture », absent de la liste fermée de la base.)
export const PHASES = ['tentee', 'reussie', 'echouee', 'defaite'];

// Bornes, alignées sur la migration. Elles ne sont pas décoratives : la borne
// de `motif` est une sonde PII déguisée (voir plus bas).
export const MAX_OUTIL = 80;
export const MAX_QUADRANT = 40;
export const MAX_MOTIF = 200;

const UUID_MOTIF = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ═══════════════════════════════════════════════════════════════════════════
   LA CLÉ PARTAGÉE — arbitrage de Paul du 30/09 : « garde les deux avec la clé »
   ───────────────────────────────────────────────────────────────────────────
   Deux registres coexistent, et ils ne répondent pas à la même question :
     · `leo_operations` RÉGULE — il empêche le doublon (PK mission+operation),
       refuse sur état périmé, compte les quotas ;
     · `leo_ecritures` REND COMPTE — il dit quoi, où, sous quel anneau, avec
       quelle issue, et garantit zéro contenu dicté par la forme des colonnes.

   ⛔ CE QUI LES EMPÊCHE DE DIVERGER N'EST PAS UNE BONNE INTENTION, C'EST CETTE
   ÉGALITÉ : `leo_ecritures.trace_id` === `leo_operations.operation_id`. Alors
   une ligne de l'un se retrouve dans l'autre, et deux sondes peuvent exiger
   qu'aucune écriture n'existe d'un seul côté.

   ⚠️ L'HYPOTHÈSE QUI PORTE L'ARBITRAGE A ÉTÉ MESURÉE AVANT, PAS SUPPOSÉE :
   `operation_id` est un `text` borné par le motif ci-dessous, et un UUID le
   satisfait — éprouvé en base le 30/09 (minuscule, MAJUSCULE, tout-zéros →
   acceptés ; tiret initial et 129 caractères → refusés, donc le motif reste
   discriminant). Puis éprouvé par un INSERT réel des deux côtés, jointure à 2,
   et les deux sondes de divergence fabriquées exprès pour les faire crier : 1
   et 1. Sans cette mesure, la décision de Paul reposait sur une affirmation.

   ⛔ DOUBLE VÉRITÉ ASSUMÉE ET GARDÉE : ce motif est aussi la contrainte
   `leo_operations_operation_id_check` en base — une contrainte SQL ne
   s'importe pas. Un test lit le fichier de migration et exige que les deux
   coïncident, exactement comme pour `PHASES`.
   ⚠️ Ce fichier est un RELEVÉ (`…_leo_lv1_registre_transactionnel.RELEVE.sql`) :
   la source de vérité reste la base, et le relevé a été vérifié contre elle.
   ═══════════════════════════════════════════════════════════════════════════ */
export const MOTIF_OPERATION_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

/**
 * Ouvre une trace : LA seule façon de fabriquer la paire d'identifiants.
 * → { traceId, operationId } avec operationId === traceId.
 *
 * ⛔ UNE SEULE SOURCE, et c'est tout l'objet de cette fonction. Deux endroits
 * qui fabriquent l'identifiant finissent par en fabriquer deux différents —
 * et alors les deux registres ne se rejoignent plus, sans que rien ne le dise
 * au moment où ça arrive. C'est le même principe que l'anneau, qui est un
 * CHAMP du catalogue et jamais une seconde liste.
 *
 * ⚠️ AUCUN GÉNÉRATEUR N'EST INJECTABLE, et c'est pourquoi les contrôles
 * passent par la voie à UN argument : une fonction qui tire au hasard ne
 * s'éprouve pas sur un cas dont on connaît la réponse. `ouvrirTrace(uuid)`
 * est cette voie — déterministe, donc éprouvable des deux côtés ; l'appel
 * sans argument ne s'éprouve que sur ses invariants (paire égale, clé
 * acceptée par les deux motifs, deux ouvertures distinctes).
 */
export function ouvrirTrace(...args) {
  // ⛔ DEUX APPELS, DEUX SENS, ET ILS NE SE CONFONDENT PAS — corrigé le 30/09,
  // le harnais ayant attrapé une CORRECTION SILENCIEUSE dans la première
  // version : `ouvrirTrace('')`, `ouvrirTrace(null)` et `ouvrirTrace(42)`
  // rendaient une trace VALIDE, en générant un UUID par-dessus l'argument
  // absurde. Un appelant qui se trompe obtenait donc une clé au lieu d'un
  // refus — et ce dépôt interdit la correction silencieuse partout ailleurs
  // (les enums d'arguments, la casse des anneaux, le vocabulaire des postes).
  //   · `ouvrirTrace()`   → on n'a pas d'identifiant, on en fabrique un ;
  //   · `ouvrirTrace(x)`  → on en a un, il doit être valide, sinon REFUS.
  // La distinction porte sur `args.length`, pas sur la valeur : c'est la seule
  // façon de séparer « rien fourni » d'« undefined fourni ».
  if (args.length === 0) {
    const genere = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID() : '';
    return genere
      ? { ok: true, traceId: genere, operationId: genere }
      : { ok: false, motif: 'aucun générateur d\u2019UUID disponible' };
  }
  const id = typeof args[0] === 'string' ? args[0].trim() : '';
  // ⛔ Fail-closed : on ne rend JAMAIS une paire qu'un des deux registres
  // refuserait. Un identifiant qui passe ici mais que la base rejette
  // produirait une opération sans journal — la divergence même qu'on évite.
  if (!UUID_MOTIF.test(id)) return { ok: false, motif: 'trace invalide' };
  if (!MOTIF_OPERATION_ID.test(id)) return { ok: false, motif: 'trace refusée par leo_operations' };
  return { ok: true, traceId: id, operationId: id };
}

/** Les seules clés qu'une entrée peut porter. ⛔ Liste FERMÉE : une clé
 *  surnuméraire fait refuser l'entrée entière, jamais une mise de côté
 *  silencieuse — même règle que `validerProposition` pour les arguments.
 *  C'est elle qui empêche qu'un `texte` ou un `titre` se glisse dans le
 *  journal le jour où quelqu'un trouvera ça pratique. */
const CLES = ['traceId', 'outil', 'quadrant', 'phase', 'cibleId', 'motif'];

/**
 * Construit l'entrée à insérer, ou refuse.
 * → { ok: true, entree } | { ok: false, motif }
 *
 * ⛔ L'ANNEAU N'EST PAS UN PARAMÈTRE : il est LU dans le catalogue. Le laisser
 * passer par l'appelant permettrait de journaliser « vert » une écriture faite
 * sous un autre régime — le journal mentirait, et c'est la seule chose qu'il
 * n'a pas le droit de faire.
 */
export function construireEntreeJournal(brut) {
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) {
    return { ok: false, motif: 'entrée illisible' };
  }
  for (const cle of Object.keys(brut)) {
    if (!CLES.includes(cle)) return { ok: false, motif: 'champ surnuméraire' };
  }

  const traceId = typeof brut.traceId === 'string' ? brut.traceId.trim() : '';
  if (!UUID_MOTIF.test(traceId)) return { ok: false, motif: 'trace invalide' };

  const outil = typeof brut.outil === 'string' ? brut.outil.trim() : '';
  if (!outil || outil.length > MAX_OUTIL) return { ok: false, motif: 'outil hors bornes' };

  const quadrant = typeof brut.quadrant === 'string' ? brut.quadrant.trim() : '';
  if (!quadrant || quadrant.length > MAX_QUADRANT) {
    return { ok: false, motif: 'quadrant hors bornes' };
  }

  const phase = typeof brut.phase === 'string' ? brut.phase.trim() : '';
  // Aucune correction silencieuse : 'Tentee' n'est pas 'tentee'.
  if (!PHASES.includes(phase)) return { ok: false, motif: 'phase inconnue' };

  // ⛔ UN IDENTIFIANT, JAMAIS UN LIBELLÉ. Le contrôle de forme est ce qui le
  // garantit : « Racheter le local » n'est pas un UUID, donc il est refusé.
  // Sans lui, la promesse « zéro contenu dicté » reposerait sur la politesse
  // de l'appelant.
  let cibleId = null;
  if (brut.cibleId !== undefined && brut.cibleId !== null) {
    const v = typeof brut.cibleId === 'string' ? brut.cibleId.trim() : '';
    if (!UUID_MOTIF.test(v)) return { ok: false, motif: 'cible invalide' };
    cibleId = v;
  }

  // ⛔ LE MOTIF SE REFUSE, IL NE SE TRONQUE PAS. Un motif technique tient en
  // deux mots ; au-delà de 200 caractères, ce n'est plus un motif, c'est
  // probablement du contenu qui a fui. Tronquer laisserait entrer les 200
  // premiers caractères d'une page de journal intime — la borne est donc une
  // SONDE, et une sonde ne rattrape pas, elle refuse.
  let motif = null;
  if (brut.motif !== undefined && brut.motif !== null) {
    const v = typeof brut.motif === 'string' ? brut.motif.trim() : '';
    if (!v) return { ok: false, motif: 'motif vide' };
    if (v.length > MAX_MOTIF) return { ok: false, motif: 'motif trop long' };
    motif = v;
  }
  // Un motif n'a de sens que sur un échec : ailleurs, il n'aurait rien de
  // technique à dire, donc il ne porterait que du récit.
  if (motif && phase !== 'echouee') return { ok: false, motif: 'motif hors échec' };

  return {
    ok: true,
    entree: {
      trace_id: traceId,
      outil,
      quadrant,
      // Lu, jamais reçu : le journal ne peut pas mentir sur le régime.
      anneau: anneauDe(outil),
      phase,
      cible_id: cibleId,
      motif
    }
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   LE PLAFOND DE VOLUME — la garde principale depuis que tout est vert.
   ───────────────────────────────────────────────────────────────────────────
   Le risque qu'il couvre n'est pas le droit, c'est la QUANTITÉ : dix mille
   idées versées dans ADRAMELECH noient les vraies, sans qu'aucun droit
   particulier n'ait été obtenu. Un déni de service sur la mémoire de Paul.

   ⚠️ Il ne remplace pas `creerGardeVoix` (`api/_lib/leo.js`), qui borne le
   COÛT — un appel IA toutes les 3 secondes. Les deux ne mesurent pas la même
   chose : on peut tenir la cadence d'appel et écrire quand même sans fin.
   ═══════════════════════════════════════════════════════════════════════════ */

/** ⚠️ VALEUR DE DÉPART, À RÉ-RÉGLER SUR LA MESURE — pas un étalon.
 *  Justification de l'ordre de grandeur, pas du chiffre exact : le prompt
 *  système impose « un seul outil par tour », et Paul dicte. Quarante
 *  écritures en une heure est très au-dessus de ce qu'une séance de travail
 *  humaine produit, et très en dessous d'un emballement.
 *  ⛔ Ne pas le « durcir » avant d'avoir une semaine de journal : un seuil
 *  posé au jugé bloque du travail réel, et on le désarme alors par lassitude.
 *  (RenoDevis, 21/09 : un instrument a déclaré sept écrans sains invalides
 *  parce que sa valeur attendue venait d'un souvenir.) */
export const PLAFOND_PAR_DEFAUT = 40;
export const FENETRE_PAR_DEFAUT_MS = 60 * 60 * 1000;

/**
 * Décide si une écriture de plus est permise, à partir des horodatages des
 * écritures déjà posées. PURE : on lui passe ce qu'on a lu, elle ne lit rien.
 * → { ok: true, restant } | { ok: false, motif, restant: 0 }
 */
export function creerPlafondEcritures(max = PLAFOND_PAR_DEFAUT,
                                      fenetreMs = FENETRE_PAR_DEFAUT_MS) {
  // ⛔ Un plafond mal configuré ne doit pas OUVRIR la porte : un `max` absurde
  // retombe sur le défaut au lieu de valoir l'infini. `Number.isFinite` EST le
  // contrôle — `NaN > 0` vaut false, donc un NaN passerait une comparaison
  // naïve sans jamais déclencher de refus (RenoDevis, 21/09).
  const plafond = Number.isFinite(max) && max > 0 ? Math.floor(max) : PLAFOND_PAR_DEFAUT;
  const fenetre = Number.isFinite(fenetreMs) && fenetreMs > 0
    ? Math.floor(fenetreMs) : FENETRE_PAR_DEFAUT_MS;

  return function autoriserUneEcriture(horodatages, maintenant) {
    const t = Number.isFinite(maintenant) ? maintenant : Date.now();
    const depuis = t - fenetre;
    // ⛔ Tout ce qui n'est pas un instant LISIBLE est compté comme récent.
    // Un horodatage illisible pourrait venir d'une ligne abîmée ; l'écarter
    // ferait baisser le compte, donc DESSERRERAIT le plafond. Le repli va vers
    // le plus contraint.
    const recentes = (Array.isArray(horodatages) ? horodatages : [])
      .filter((h) => {
        const ms = h instanceof Date ? h.getTime()
          : typeof h === 'number' ? h
            : typeof h === 'string' ? Date.parse(h) : NaN;
        return !Number.isFinite(ms) || ms >= depuis;
      }).length;

    if (recentes >= plafond) {
      return { ok: false, motif: 'plafond d’écritures atteint', restant: 0 };
    }
    return { ok: true, restant: plafond - recentes };
  };
}
