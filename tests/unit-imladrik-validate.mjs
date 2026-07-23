// Unitaires validation IMLADRIK (Node pur, zéro réseau) : v1 « pouvoir écrire ».
// Parité API↔base : les bornes de validateEntreeImladrik reflètent les CHECK de
// supabase/migrations/0012_imladrik_journal.sql. Cas de fermeture : champ inconnu
// rejeté, owner_id jamais accepté, contenu obligatoire, bornes respectées.
import { validateEntreeImladrik } from '../api/_lib/validate.js';

const verdicts = {};
const U1 = '11111111-1111-4111-8111-111111111111';

// ---------- 1. Création valide (contenu seul) ----------
{
  const { value, error } = validateEntreeImladrik({ contenu: 'Aujourd’hui, j’ai avancé.' }, 'create');
  verdicts.createOk = !error && value.contenu === 'Aujourd’hui, j’ai avancé.' && value.titre === undefined;
}

// ---------- 2. Création valide (titre + contenu, trim) ----------
{
  const { value, error } = validateEntreeImladrik({ titre: '  Cap  ', contenu: '  du texte  ' }, 'create');
  verdicts.createTitre = !error && value.titre === 'Cap' && value.contenu === 'du texte';
}

// ---------- 3. Création : contenu obligatoire ----------
verdicts.createSansContenu = !!validateEntreeImladrik({ titre: 'X' }, 'create').error;
verdicts.createContenuVide = !!validateEntreeImladrik({ contenu: '   ' }, 'create').error;

// ---------- 4. owner_id / id / champ inconnu jamais acceptés ----------
verdicts.rejetOwnerId = !!validateEntreeImladrik({ contenu: 'x', owner_id: U1 }, 'create').error;
verdicts.rejetInconnu = !!validateEntreeImladrik({ contenu: 'x', humeur: 'gaie' }, 'create').error;

// ---------- 5. Bornes (miroir CHECK) ----------
verdicts.titreTropLong = !!validateEntreeImladrik({ contenu: 'x', titre: 'x'.repeat(201) }, 'create').error;
verdicts.contenuTropLong = !!validateEntreeImladrik({ contenu: 'x'.repeat(20001) }, 'create').error;
verdicts.contenuLimiteOk = !validateEntreeImladrik({ contenu: 'x'.repeat(20000) }, 'create').error;
verdicts.titreMauvaisType = !!validateEntreeImladrik({ contenu: 'x', titre: 42 }, 'create').error;

// ---------- 6. Update : partiel autorisé, vide refusé, titre null efface ----------
verdicts.updateContenu = !validateEntreeImladrik({ contenu: 'révisé' }, 'update').error;
verdicts.updateVide = !!validateEntreeImladrik({}, 'update').error;
{
  const { value, error } = validateEntreeImladrik({ titre: null }, 'update');
  verdicts.updateTitreNull = !error && value.titre === null;
}

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-IMLADRIK-VALIDATE OK' : 'UNIT-IMLADRIK-VALIDATE ECHEC');
process.exit(ok ? 0 : 1);
