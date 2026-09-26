// L'âge d'une collecte Finubar (26/09) — Node pur, zéro réseau.
//
// Le bandeau disait « FINUBAR · ce matin » au-dessus d'un agrégat de
// l'avant-veille. Il dit désormais la date lue ET son âge (`ageDe`). Ce
// contrôle fixe « maintenant » : un âge calculé contre la vraie horloge serait
// un test qui change de réponse chaque jour.
import { ageDe } from '../js/finubar-bandeau.mjs';

const verdicts = {};
function verifier(nom, condition, detail = '') {
  verdicts[nom] = condition === true;
  console.log(`  ${condition === true ? '✅' : '❌'} ${nom}${detail ? ' — ' + detail : ''}`);
}
const MAINTENANT = new Date(2026, 8, 26, 10, 0, 0); // 26/09/2026, 10 h, heure locale
const cas = [
  ['2026-09-26', 'aujourd’hui'],
  ['2026-09-25', 'hier'],
  ['2026-09-24', 'il y a 2 jours'],
  ['2026-09-02', 'il y a 24 jours'],
  ['2026-09-27', ''],          // futur : on ne devine pas un âge
  ['2026-02-31', ''],          // date impossible
  ['26/09/2026', ''],          // format inconnu
  [null, ''], [undefined, ''], ['', ''],
];
for (const [le, attendu] of cas) {
  verifier(`ageDe(${JSON.stringify(le)}) = « ${attendu} »`, ageDe(le, MAINTENANT) === attendu, JSON.stringify(ageDe(le, MAINTENANT)));
}
// Le changement d'heure (29/03/2026 → 23 h dans la journée) ne décale pas d'un jour.
verifier('changement d\'heure : la veille reste « hier »', ageDe('2026-03-29', new Date(2026, 2, 30, 1)) === 'hier');
// Verrou de non-vacuité : les cas ont bien tourné.
verifier('verrou : au moins 10 cas contrôlés', Object.keys(verdicts).length >= 11);
const ok = Object.values(verdicts).every(Boolean);
console.log(ok ? 'UNIT FINUBAR-AGE OK' : 'UNIT FINUBAR-AGE ÉCHEC');
process.exit(ok ? 0 : 1);
