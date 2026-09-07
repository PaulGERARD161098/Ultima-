// finubar/mesure-git.mjs — la MESURE de fraîcheur d'un dépôt, isolée de la
// collecte pour être éprouvable.
//
// ⛔ POURQUOI ELLE VIT SEULE. Elle était enfouie dans `collecter.mjs`, un script
// CLI qui lance la collecte entière dès qu'on l'importe : aucun harnais ne
// pouvait donc l'appeler. C'est ce qui a laissé passer le défaut trouvé par le
// dry run DR du 07/09 — un `if` sans `else`, qui rendait la mesure MUETTE quand
// le grain ne portait pas de SHA du tout. Un garde-fou qu'aucun test ne peut
// appeler n'est pas un garde-fou, c'est une intention.
//
// Aucune écriture, aucun réseau. `git` est appelé par execFileSync en tableau
// d'arguments (jamais de shell) : rien de ce qui entre ici n'est interpolé dans
// une ligne de commande.

import { execFileSync } from 'node:child_process';

export // Mesure git d'un dépôt. Toute anomalie rend `null` — une mesure absente se dit,
// elle ne se remplace pas par une valeur par défaut qui aurait l'air d'un fait.
function mesurerGit(chemin, commitNote) {
  const git = (args) => execFileSync('git', ['-C', chemin, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 10_000,
  }).trim();
  let commitInconnu = false;
  try {
    const tete = git(['log', '-1', '--format=%h']);
    const teteLe = git(['log', '-1', '--format=%aI']);
    let commitsDepuis = null;
    if (commitNote && /^[0-9a-f]{7,40}$/i.test(commitNote)) {
      try {
        // `A..B` = les commits atteignables depuis B et pas depuis A.
        // ⛔ EN EXCLUANT LES FICHIERS DE FINUBAR LUI-MÊME. Sans cette exclusion,
        // le commit qui CRÉE la note la déclarerait aussitôt périmée, et les huit
        // dépôts s'afficheraient « dérivés » le jour de la pose. Un signal qui
        // s'allume partout dès le premier jour n'est plus un signal : on apprend
        // à l'ignorer, et il ne servira plus le jour où il aura raison.
        // Ce qui est mesuré est donc : « le dépôt a-t-il avancé sur du CONTENU
        // depuis cette note ? » — la seule question dont la réponse compte.
        // Sont exclus : le grain, le rappel de séance, et les DEUX FICHIERS
        // GÉNÉRÉS par la collecte. Les deux derniers ont été oubliés à la
        // première écriture, et le défaut s'est vu tout de suite : le commit
        // qui recalait le grain d'Ultima sur sa tête réelle le déclarait
        // périmé dans la seconde qui suivait. Tout fichier que Finubar écrit
        // lui-même s'ajoute ici — sinon l'outil se signale à lui-même.
        commitsDepuis = Number(git(['rev-list', '--count', `${commitNote}..HEAD`,
          '--', ':(exclude)FINUBAR.md', ':(exclude).claude/finubar-rappel.mjs',
          ':(exclude)finubar/macro.json', ':(exclude)api/_lib/finubar-macro.mjs']));
      } catch {
        // Le commit noté est introuvable : branche non récupérée, historique
        // réécrit — et surtout **fusion en squash**, qui est le cas NORMAL ici.
        // Quand une PR est fusionnée en squash, les commits de la branche
        // disparaissent au profit d'un seul commit neuf : tous les grains
        // pointent alors dans le vide, et la mesure de fraîcheur s'arrête.
        //
        // ⛔ Elle doit s'arrêter EN LE DISANT. Rendre `null` sans rien annoncer
        // ferait taire le seul garde-fou contre une note périmée, au moment
        // précis où il devient inopérant — et personne ne s'en apercevrait,
        // puisque l'absence d'avertissement se lit « tout va bien ». C'est
        // exactement la faute de forme qu'on traque depuis le début du lot.
        commitsDepuis = null;
        commitInconnu = true;
      }
    } else {
      // ⛔ ET LE CAS QUI N'EST MÊME PAS UN SHA — grain jamais renseigné, champ
      // laissé à « à renseigner », valeur vide. Il sortait d'ici SANS RIEN DIRE :
      // le `if` ci-dessus ne s'ouvrait pas, `commitInconnu` restait faux, et la
      // collecte annonçait le dépôt comme n'importe quel dépôt à jour.
      //
      // Le garde-fou avait été bâti pour le côté qu'on emprunte — le squash, qui
      // détruit un SHA VALIDE — et pas pour celui par où l'on entre : une note
      // qui n'a jamais été rattachée à rien. Les deux cas ont pourtant la même
      // conséquence exacte : la fraîcheur n'est plus mesurable. Le silence, lui,
      // se lit « tout va bien », ce qui en fait le pire des deux états.
      //
      // Trouvé par le dry run DR du 07/09 : le grain d'Ultima portait
      // `commit: "à renseigner"`, et la collecte n'en soufflait pas un mot.
      commitInconnu = true;
    }
    // ⚠️ La tête n'est CONSERVÉE que s'il y a quelque chose à dire.
    // Sans ça, chaque commit change `tete` et `tete_le`, donc chaque collecte
    // qui suit resalit `macro.json` — pour une information qui ne sert à rien
    // quand l'écart est nul. Résultat : un fichier généré jamais propre après un
    // push, qu'on finit par commiter sans le lire. Un bruit permanent finit
    // toujours par masquer un signal ; ici on le supprime à la racine.
    // Quand la dérive existe, en revanche, la tête est ce qui permet d'aller
    // voir CE qui a bougé — elle est donc gardée exactement dans ce cas.
    // Un commit introuvable GARDE la tête : c'est elle qui sert à recaler.
    if (commitInconnu) return { tete, tete_le: teteLe, commits_depuis: null, commit_inconnu: true };
    if (!commitsDepuis) return { tete: null, tete_le: null, commits_depuis: commitsDepuis, commit_inconnu: false };
    return { tete, tete_le: teteLe, commits_depuis: commitsDepuis, commit_inconnu: false };
  } catch {
    return null;
  }
}
