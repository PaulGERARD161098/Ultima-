// Tests unitaires — interface Double Vue Direction & 3 Structures (Boucle 3).
// Node pur, zéro navigateur : éprouve les plans d'exécution de js/leo-accueil.js,
// les yeux bornés de js/direction-etat.mjs face à validerEtatQuadrant serveur,
// et la conformité CSP stricte de direction.html.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  normaliserScopeUrl,
  yeuxDirection,
  yeuxStructure
} from '../js/direction-etat.mjs';
import { validerEtatQuadrant } from '../api/_lib/leo.js';

// 1. Plans d'exécution front (js/leo-accueil.js) pour les 3 outils pro
{
  const fenetre = {};
  const source = readFileSync(new URL('../js/leo-accueil.js', import.meta.url), 'utf8');
  new Function('window', 'document', source)(fenetre, undefined);
  const { construirePlanExecution } = fenetre.UltimaLeo;

  const pTache = construirePlanExecution({
    outil: 'proposer_tache_pro',
    args: { structure_id: 'sola-air-paris', titre: 'Relancer devis clim', type: 'relance', priorite: 'haute' }
  });
  assert.equal(pTache.ok, true);
  assert.equal(pTache.url, '/api/pro-pilotage');
  assert.equal(pTache.methode, 'POST');
  assert.equal(pTache.corps.ressource, 'tache');
  assert.equal(pTache.corps.structure_id, 'sola-air-paris');

  const pDossier = construirePlanExecution({
    outil: 'proposer_dossier_pro',
    args: { structure_id: 'amo', titre: 'Résidence République', prochaine_action: 'Envoyer CR' }
  });
  assert.equal(pDossier.ok, true);
  assert.equal(pDossier.corps.ressource, 'dossier');
  assert.equal(pDossier.corps.structure_id, 'amo');

  const pDoc = construirePlanExecution({
    outil: 'proposer_document_pro',
    args: {
      structure_id: 'renoboost-ia',
      type: 'brouillon_mail',
      titre: 'Relance pro',
      contenu: 'Bonjour...'
    }
  });
  assert.equal(pDoc.ok, true);
  assert.equal(pDoc.corps.ressource, 'document');

  // Refus fail-closed si structure_id = 'direction' ou inconnue
  assert.equal(
    construirePlanExecution({ outil: 'proposer_tache_pro', args: { structure_id: 'direction', titre: 'X' } }).ok,
    false
  );
  assert.equal(
    construirePlanExecution({ outil: 'proposer_dossier_pro', args: { structure_id: 'inconnue', titre: 'X' } }).ok,
    false
  );
}

// 2. Normalisation URL & yeux bornés validés par le serveur (validerEtatQuadrant)
{
  assert.equal(normaliserScopeUrl('amo'), 'amo');
  assert.equal(normaliserScopeUrl('SOLA-AIR-PARIS'), 'sola-air-paris');
  assert.equal(normaliserScopeUrl('invalide'), 'direction');
  assert.equal(normaliserScopeUrl(null), 'direction');

  const etatDir = yeuxDirection({
    structures: [
      { id: 'renoboost-ia', nom: 'Renoboost IA', compteurs: { taches_ouvertes: 3, relances_dues: 1 } },
      { id: 'sola-air-paris', nom: 'Sola Air Paris', compteurs: { taches_ouvertes: 2, relances_dues: 0 } },
      { id: 'amo', nom: 'AMO', compteurs: { taches_ouvertes: 1, relances_dues: 1 } }
    ],
    priorites_transverses: [
      { structure_id: 'amo', structure_nom: 'AMO', titre: 'Valider planning', echeance: '2026-11-28' }
    ]
  });
  assert.equal(validerEtatQuadrant(etatDir).ok, true);

  // Étanchéité des yeux structure : une tâche étrangère glissée est filtrée
  const etatSola = yeuxStructure('sola-air-paris', {
    taches: [
      { structure_id: 'sola-air-paris', titre: 'Point associés', type: 'tache', statut: 'a_faire' },
      { structure_id: 'amo', titre: 'SECRET AMO', type: 'tache', statut: 'a_faire' }
    ],
    dossiers: [{ structure_id: 'sola-air-paris', titre: 'Chantier Paris 16', statut: 'actif' }],
    documents: []
  });
  assert.equal(validerEtatQuadrant(etatSola).ok, true);
  assert.equal(etatSola.listes.taches.length, 1);
  assert.doesNotMatch(JSON.stringify(etatSola), /SECRET AMO/);
}

// 3. Contrôle statique CSP de direction.html (zéro inline style / script)
{
  const html = readFileSync(new URL('../direction.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /<style\b/i);
  assert.doesNotMatch(html, /\sstyle=/i);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i);
  assert.match(html, /data-scope="direction"/);
  assert.match(html, /data-scope="renoboost-ia"/);
  assert.match(html, /data-scope="sola-air-paris"/);
  assert.match(html, /data-scope="amo"/);
  assert.match(html, /id="dir-leo-fil"/);
  assert.match(html, /id="dir-leo-form"/);
  for (const p of ['priorites', 'chantier', 'achats', 'reunion', 'cr', 'mail']) {
    assert.match(html, new RegExp(`data-leo-prompt="${p}"`));
  }
  const jsDir = readFileSync(new URL('../js/direction-pro.js', import.meta.url), 'utf8');
  assert.match(jsDir, /ressource:\s*'dossier'/);
  assert.match(jsDir, /Voir tout/);
  assert.match(jsDir, /Réduire/);
}

console.log('OK unit-direction-front');
