// Unitaires validation DRAUKHAIN (Node pur, zéro réseau) : v1. Miroir de
// unit-zekrom-validate.mjs. Parité API↔base : les bornes/enum de
// validateSerment/validateFlamme reflètent les CHECK de
// supabase/migrations/0016_draukhain_serments.sql. Cas de fermeture : champ
// inconnu rejeté, owner_id jamais accepté, bornes respectées, nature enum,
// serment_id = uuid.
import {
  validateSerment,
  validateFlamme,
  FLAMME_NATURES,
} from '../api/_lib/validate.js';

const verdicts = {};
const U1 = '11111111-1111-4111-8111-111111111111';

// ---------- 1. Création serment valide (le quoi + pourquoi + horizon) ----------
{
  const { value, error } = validateSerment(
    { intitule: 'Tenir mon cap malgré les revers', pourquoi: 'ne pas trahir qui je veux être', horizon: 'ma vie' },
    'create',
  );
  verdicts.createOk = !error && value.intitule === 'Tenir mon cap malgré les revers' &&
    value.pourquoi === 'ne pas trahir qui je veux être' && value.horizon === 'ma vie';
}

// ---------- 2. Serment minimal : pourquoi/horizon absents ----------
{
  const { value, error } = validateSerment({ intitule: 'Rester libre' }, 'create');
  verdicts.minimalOk = !error && value.intitule === 'Rester libre' &&
    value.pourquoi === undefined && value.horizon === undefined;
}

// ---------- 3. Intitulé obligatoire à la création ----------
verdicts.createSansIntitule = !!validateSerment({ pourquoi: 'x' }, 'create').error;
verdicts.intituleVide = !!validateSerment({ intitule: '   ' }, 'create').error;
verdicts.intituleTropLong = !!validateSerment({ intitule: 'x'.repeat(201) }, 'create').error;

// ---------- 4. owner_id / champ inconnu jamais acceptés ----------
verdicts.rejetOwnerId = !!validateSerment({ intitule: 'X', owner_id: U1 }, 'create').error;
verdicts.rejetInconnu = !!validateSerment({ intitule: 'X', couleur: 'or' }, 'create').error;

// ---------- 5. pourquoi / horizon : nullable, bornés ----------
{
  const { value, error } = validateSerment({ intitule: 'X', pourquoi: null, horizon: null }, 'create');
  verdicts.pourquoiNull = !error && value.pourquoi === null && value.horizon === null;
}
verdicts.pourquoiTropLong = !!validateSerment({ intitule: 'X', pourquoi: 'x'.repeat(2001) }, 'create').error;
verdicts.horizonTropLong = !!validateSerment({ intitule: 'X', horizon: 'x'.repeat(201) }, 'create').error;

// ---------- 6. Update : partiel autorisé, vide refusé ----------
verdicts.updatePartiel = !validateSerment({ horizon: 'cette année' }, 'update').error;
verdicts.updateVide = !!validateSerment({}, 'update').error;

// ---------- 7. Flamme : valide, serment_id uuid exigé, texte borné ----------
{
  const { value, error } = validateFlamme(
    { serment_id: U1, nature: 'citation', texte: 'La volonté ouvre des portes que le talent ignore.' }, 'create');
  verdicts.flammeOk = !error && value.serment_id === U1 && value.nature === 'citation' &&
    value.texte === 'La volonté ouvre des portes que le talent ignore.';
}
// nature optionnelle (défaut base 'rappel') → absente = ok
{
  const { value, error } = validateFlamme({ serment_id: U1, texte: 'une victoire de plus' }, 'create');
  verdicts.flammeSansNatureOk = !error && value.nature === undefined && value.texte === 'une victoire de plus';
}
verdicts.flammeSansSerment = !!validateFlamme({ texte: 'une flamme' }, 'create').error;
verdicts.flammeSermentPasUuid = !!validateFlamme({ serment_id: 'pas-un-uuid', texte: 'une flamme' }, 'create').error;
verdicts.flammeTexteVide = !!validateFlamme({ serment_id: U1, texte: '   ' }, 'create').error;
verdicts.flammeTexteTropLong = !!validateFlamme({ serment_id: U1, texte: 'x'.repeat(2001) }, 'create').error;
verdicts.flammeNatureInvalide = !!validateFlamme({ serment_id: U1, nature: 'braise', texte: 'ok' }, 'create').error;
verdicts.flammeToutesNatures = FLAMME_NATURES.every((n) =>
  !validateFlamme({ serment_id: U1, nature: n, texte: 'ok' }, 'create').error);
verdicts.flammeChampInconnu = !!validateFlamme({ serment_id: U1, texte: 'ok', owner_id: U1 }, 'create').error;

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-DRAUKHAIN-VALIDATE OK' : 'UNIT-DRAUKHAIN-VALIDATE ECHEC');
process.exit(ok ? 0 : 1);
