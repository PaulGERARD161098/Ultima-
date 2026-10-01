// Repli opt-in : uniquement les dépôts du registre, jamais une liste de compte.
// La note est déclarative ; seul son contenu à un SHA précis est mesuré ici.
import { extraireBloc, lireGrain, reprendreGrain } from './agreger.mjs';
import { createHash } from 'node:crypto';

const DEPOT = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9_.-]{1,100}$/;
const SHA = /^[a-f0-9]{40}$/i;
const LIMITE = 256 * 1024;
const NON_EXAMINES = ['derive_git', 'rappel', 'pr', 'controles', 'permissions', 'dependances'];
function refValide(ref) {
  return typeof ref === 'string' && ref.length <= 200 && /^[A-Za-z0-9][A-Za-z0-9_./-]*$/.test(ref)
    && !ref.includes('..') && !ref.includes('//') && !ref.endsWith('/') && !ref.endsWith('.lock');
}

export async function lireGithub(d, { actif = false, fetchImpl = globalThis.fetch,
  maintenant = () => new Date(), timeoutMs = 5000, tentatives = 2 } = {}) {
  const lectureLe = maintenant().toISOString();
  const ref = d?.github_ref ?? 'HEAD';
  const controle = { type: 'github', lecture_le: lectureLe, statut: 'non_examine', examines: [] };
  // Aucun message d'erreur externe n'est conservé : il pourrait contenir un secret.
  controle.non_examines = [...NON_EXAMINES];
  const echec = (statut, motif) => ({ ok: false, depot: d?.depot, grain: null, derive: null,
    reprise: false, hors_seance: statut !== 'source_absente' && statut !== 'illisible',
    mesure_le: null, motif, controle: { ...controle, statut } });
  if (!actif) return echec('non_examine', 'repli GitHub désactivé');
  if (!d || !DEPOT.test(d.depot) || ['.', '..'].includes(d.depot.split('/')[1]) || !refValide(ref)) {
    return echec('refuse', 'source ou référence GitHub refusée');
  }
  if (!Number.isInteger(tentatives) || tentatives < 1 || tentatives > 2
    || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10000) {
    return echec('refuse', 'bornes GitHub refusées');
  }
  const base = `https://api.github.com/repos/${d.depot}`;
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (process.env.FINUBAR_GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.FINUBAR_GITHUB_TOKEN}`;
  // Deux destinations, deux tentatives chacune : nombre total GET 4 max
  // par dépôt et par collecte (40 secondes max de délais réseau configurés).
  async function get(path) {
    for (let essai = 0; essai < tentatives; essai++) {
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), timeoutMs);
      try {
        const response = await fetchImpl(base + path, { method: 'GET', headers, redirect: 'error', signal: abort.signal });
        if (!response.ok) {
          await response.body?.cancel();
          if ((response.status === 429 || response.status >= 500) && essai + 1 < tentatives) continue;
          return { status: response.status };
        }
        let size = 0;
        const chunks = [];
        for await (const chunk of response.body) {
          size += chunk.length;
          if (size > LIMITE) { abort.abort(); return { status: 502 }; }
          chunks.push(Buffer.from(chunk));
        }
        return { status: 200, data: JSON.parse(Buffer.concat(chunks).toString('utf8')) };
      } catch {
        if (essai + 1 === tentatives) return { status: 0 };
      } finally { clearTimeout(timer); }
    }
  }
  const anomalie = (r, contenu = false) => {
    if (r.status === 401 || r.status === 403) return echec('refuse', 'accès GitHub refusé');
    if (r.status === 404) return contenu ? echec('source_absente', 'FINUBAR.md absent à la version vérifiée')
      : echec('inaccessible', 'dépôt ou référence GitHub inaccessible');
    return echec('erreur', 'lecture GitHub échouée');
  };
  const commit = await get(`/commits/${encodeURIComponent(ref)}`);
  if (commit.status !== 200) return anomalie(commit);
  if (!SHA.test(commit.data?.sha) || (SHA.test(ref) && ref.toLowerCase() !== commit.data.sha.toLowerCase())) return echec('erreur', 'version GitHub invalide');
  controle.examines.push('tete');
  const sha = commit.data.sha;
  controle.commit = sha;
  controle.ref = ref;
  const fichier = await get(`/contents/FINUBAR.md?ref=${sha}`);
  if (fichier.status !== 200) return anomalie(fichier, true);
  const f = fichier.data;
  if (f?.type !== 'file' || f.path !== 'FINUBAR.md' || f.encoding !== 'base64' || !SHA.test(f.sha)
    || typeof f.content !== 'string' || !/^[A-Za-z0-9+/=\r\n]*$/.test(f.content)
    || !Number.isInteger(f.size) || f.size < 0 || f.size > LIMITE) return echec('erreur', 'contenu GitHub invalide');
  const contenu = Buffer.from(f.content, 'base64');
  if (contenu.length !== f.size) return echec('erreur', 'taille GitHub incohérente');
  const blob = createHash('sha1').update(`blob ${contenu.length}\0`).update(contenu).digest('hex');
  if (blob !== f.sha.toLowerCase()) return echec('erreur', 'empreinte GitHub incohérente');
  let entree;
  try {
    const bloc = extraireBloc(contenu.toString('utf8'));
    const brut = JSON.parse(bloc);
    if (!brut || typeof brut !== 'object' || Array.isArray(brut)) throw new Error('forme');
    entree = lireGrain(bloc, d.depot);
  } catch {
    entree = { ok: false, depot: d.depot, grain: null, motif: 'bloc illisible' };
  }
  controle.examines.push('FINUBAR.md');
  const source = { type: 'github', depot: d.depot, ref, commit: sha, blob: f.sha,
    lecture_le: lectureLe, mesure_le: lectureLe, qualification: 'déclaré',
    portee: 'contenu de FINUBAR.md vérifié à ce commit ; état métier non vérifié' };
  return { ...entree, derive: null, reprise: false, hors_seance: false,
    mesure_le: lectureLe.slice(0, 10), source,
    controle: { ...controle, statut: entree.ok ? 'lu' : 'illisible' } };
}

// Une panne d'accès conserve la preuve antérieure, sans redater sa mesure.
// Une absence vérifiée ou une note cassée reste en revanche un constat courant.
export function reprendreApresGithub(resultat, avant, options) {
  if (['non_examine', 'refuse', 'inaccessible', 'erreur'].includes(resultat.controle.statut)) {
    const repris = reprendreGrain(avant, options);
    if (repris) return { ...repris, controle: resultat.controle, motif_controle: resultat.motif };
  }
  return { ...resultat, ciel: options.ciel };
}
