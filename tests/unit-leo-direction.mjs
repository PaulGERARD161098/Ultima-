// Tests unitaires et adverses — Léo assistante de direction multi-structures (Boucle 2).
// Node pur, zéro réseau, zéro appel IA.

import assert from 'node:assert/strict';
import {
  construireSysteme,
  outilsPour,
  validerProposition,
  reformulerProposition,
  anneauDe
} from '../api/_lib/leo.js';

// 1. Prompts système : vue Direction + 3 structures strictement cloisonnées
{
  const sysDir = construireSysteme('direction', true);
  const sysRb = construireSysteme('renoboost-ia', true);
  const sysSola = construireSysteme('sola-air-paris', true);
  const sysAmo = construireSysteme('amo', true);

  assert.ok(sysDir && sysRb && sysSola && sysAmo);
  assert.match(sysDir, /Mode DIRECTION/);
  assert.match(sysDir, /Renoboost IA, Sola Air Paris et AMO/);
  assert.match(sysRb, /Mode STRUCTURE CLOISONNÉE \(Renoboost IA\)/);
  assert.match(sysSola, /Mode STRUCTURE CLOISONNÉE \(Sola Air Paris\)/);
  assert.match(sysSola, /Posture CHALLENGER CHANTIER/);
  assert.match(sysSola, /Rétroplanning daté/);
  assert.doesNotMatch(sysAmo, /Posture CHALLENGER CHANTIER/);
  assert.doesNotMatch(sysRb, /Posture CHALLENGER CHANTIER/);
  assert.match(sysAmo, /Mode STRUCTURE CLOISONNÉE \(AMO\)/);
  assert.match(sysAmo, /Projet à part/);

  // Zéro PII dans les prompts système
  for (const s of [sysDir, sysRb, sysSola, sysAmo]) {
    assert.doesNotMatch(s, /@/);
  }
}

// 2. Catalogue d'outils pro : 3 outils, tous en anneau ORANGE
{
  for (const q of ['direction', 'renoboost-ia', 'sola-air-paris', 'amo']) {
    const outils = outilsPour(q);
    assert.ok(Array.isArray(outils));
    assert.deepEqual(
      outils.map((o) => o.name).sort(),
      ['proposer_document_pro', 'proposer_dossier_pro', 'proposer_tache_pro']
    );
  }
  assert.equal(anneauDe('proposer_tache_pro'), 'orange');
  assert.equal(anneauDe('proposer_dossier_pro'), 'orange');
  assert.equal(anneauDe('proposer_document_pro'), 'orange');
}

// 3. Cloisonnement strict des propositions :
//    en vue structure, toute écriture visant une AUTRE structure est REJETÉE.
{
  const fuiteCroisee = validerProposition(
    'proposer_tache_pro',
    { structure_id: 'amo', titre: 'Relancer maître ouvrage' },
    'sola-air-paris'
  );
  assert.equal(fuiteCroisee.ok, false);

  const fuiteDoc = validerProposition(
    'proposer_document_pro',
    {
      structure_id: 'renoboost-ia',
      type: 'brouillon_mail',
      titre: 'Mail prospect',
      contenu: 'Bonjour...'
    },
    'amo'
  );
  assert.equal(fuiteDoc.ok, false);

  // En vue direction, structure_id = 'direction' est interdit (enum fermée aux 3 structures)
  const dirInterdit = validerProposition(
    'proposer_dossier_pro',
    { structure_id: 'direction', titre: 'Dossier global' },
    'direction'
  );
  assert.equal(dirInterdit.ok, false);
}

// 4. Cas nominaux + reformulation déterministe étiquetée par structure
{
  const vTache = validerProposition(
    'proposer_tache_pro',
    {
      structure_id: 'sola-air-paris',
      titre: 'Préparer point associés',
      type: 'relance',
      priorite: 'haute',
      echeance: '2026-11-28',
      contact_ref: 'Matthieu'
    },
    'sola-air-paris'
  );
  assert.equal(vTache.ok, true);
  assert.equal(vTache.anneau, 'orange');
  const refTache = reformulerProposition(vTache.proposition);
  assert.match(refTache, /^\[Sola Air Paris\]/);
  assert.match(refTache, /28\/11\/2026/);

  const vDossier = validerProposition(
    'proposer_dossier_pro',
    {
      structure_id: 'amo',
      titre: 'Mission résidence République',
      prochaine_action: 'Envoyer compte rendu'
    },
    'direction'
  );
  assert.equal(vDossier.ok, true);
  assert.equal(vDossier.anneau, 'orange');
  assert.match(reformulerProposition(vDossier.proposition), /^\[AMO\]/);

  const vDoc = validerProposition(
    'proposer_document_pro',
    {
      structure_id: 'renoboost-ia',
      type: 'brouillon_mail',
      titre: 'Relance devis artisan',
      contenu: 'Bonjour, suite à notre échange...'
    },
    'renoboost-ia'
  );
  assert.equal(vDoc.ok, true);
  assert.equal(vDoc.anneau, 'orange');
  const refDoc = reformulerProposition(vDoc.proposition);
  assert.match(refDoc, /^\[Renoboost IA\]/);
  assert.match(refDoc, /jamais envoyé automatiquement/);
}

console.log('OK unit-leo-direction');
