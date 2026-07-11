// Unitaires requireUser (Node pur, zéro réseau, zéro navigateur) : durcissement
// auth ④. Vérifie la VALIDATION RÉELLE du jeton (auth.getUser) au-dessus de la
// RLS. Le client est injecté (makeClient) pour stubber auth.getUser sans réseau.
// Cas de fermeture décisif : getUser en erreur → unauthenticated (non servi).
import { requireUser } from '../api/_lib/supabase.js';

const verdicts = {};

// ---------- Espion console.error : jamais de jeton ni de détail Auth en log ----------
const journalErreurs = [];
const consoleErrorOriginal = console.error;
console.error = (...args) => { journalErreurs.push(args.map(String).join(' ')); };

const JETON = 'Bearer jwt-de-test-abc123';
const reqAvecJeton = { headers: { authorization: JETON } };
const reqSansJeton = { headers: {} };

// Fabrique un makeClient stub : renvoie 'ok' avec un client dont auth.getUser
// rejoue la réponse fournie. Compte les appels pour prouver l'absence de réseau.
function makeClientStub(getUserResult) {
  const stub = { appels: [] };
  stub.fn = () => ({
    status: 'ok',
    client: {
      auth: {
        getUser: async (token) => {
          stub.appels.push(token);
          if (typeof getUserResult === 'function') return getUserResult();
          return getUserResult;
        },
      },
    },
  });
  return stub;
}

// ---------- 1. Jeton absent → unauthenticated, SANS appeler getUser ----------
// Chemin par défaut (vrai createUserClient) : aucune requête réseau.
{
  const r = await requireUser(reqSansJeton);
  verdicts.jetonAbsent = r.status === 'unauthenticated';
}

// ---------- 2. Jeton valide → ok + user vérifié ----------
{
  const stub = makeClientStub({ data: { user: { id: 'u-1' } }, error: null });
  const r = await requireUser(reqAvecJeton, stub.fn);
  verdicts.jetonValide = r.status === 'ok' && r.user?.id === 'u-1' &&
    stub.appels.length === 1 && stub.appels[0] === 'jwt-de-test-abc123';
}

// ---------- 3. CAS DE FERMETURE : getUser en erreur → unauthenticated ----------
// (jeton invalide/expiré/révoqué). Le point durci : on NE sert pas, et aucun
// détail Auth ne remonte au client.
{
  const stub = makeClientStub({ data: { user: null }, error: { message: 'invalid JWT', status: 401 } });
  const r = await requireUser(reqAvecJeton, stub.fn);
  verdicts.jetonInvalide401 = r.status === 'unauthenticated' &&
    !('user' in r) && !('error' in r) && !('message' in r);
}

// ---------- 4. Panne/timeout Auth (getUser jette) → fail-closed unauthenticated ----------
{
  const stub = makeClientStub(() => { const e = new Error('abort'); e.name = 'AbortError'; throw e; });
  const r = await requireUser(reqAvecJeton, stub.fn);
  verdicts.authPanneFailClosed = r.status === 'unauthenticated' && !('error' in r);
}

// ---------- 5. Env manquantes remontent telles quelles (unconfigured) ----------
{
  const r = await requireUser(reqAvecJeton, () => ({ status: 'unconfigured' }));
  verdicts.unconfiguredTraverse = r.status === 'unconfigured';
}

// ---------- 6. PII/secret : le jeton ne fuit jamais en log ----------
console.error = consoleErrorOriginal;
verdicts.jetonJamaisLogge = journalErreurs.every((l) =>
  !l.includes('jwt-de-test-abc123') && !l.includes('invalid JWT'));

// ---------- Bilan ----------
console.log(JSON.stringify(verdicts, null, 2));
const ok = Object.values(verdicts).every((v) => v === true);
console.log(ok ? 'UNIT-AUTH OK' : 'UNIT-AUTH ECHEC');
process.exit(ok ? 0 : 1);
