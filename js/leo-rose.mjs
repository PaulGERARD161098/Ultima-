import { chargerCockpit } from './cockpit-parole.mjs';
import { NOEUDS } from './registre-lv3.mjs';

const caps = [
  { id: 'renodevis', nom: 'RenoDevis', cible: 'https://relance-renoboostia.com/', alias: ['reno devis', 'rd', 'sola'] },
  { id: 'artidispo', nom: 'Artidispo', cible: 'https://artidispo.com/', alias: ['arti dispo'] },
  { id: 'riven', nom: 'Riven', cible: NOEUDS.riven.cible + '?vue=relances', alias: ['relances'] },
  { id: 'renoagenda', nom: 'RenoAgenda', cible: 'https://reno-agenda.vercel.app/', alias: ['reno agenda', 'agenda'] },
  { id: 'finubar', nom: 'Finubar', cible: 'finubar.html', alias: ['dépôts'] },
  { id: 'althea', nom: 'Althéa', cible: NOEUDS.althea.cible, alias: ['quêtes'] },
];

function normaliser(valeur) {
  return valeur.toLocaleLowerCase('fr').normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

export function lirePriorites(data) {
  const compte = data?.riven?.relances_dues;
  if (!Number.isSafeInteger(compte) || compte < 0) return null;
  if (!compte) return [];
  const pluriel = compte > 1 ? 's' : '';
  return [{
    cap: caps.find(({ id }) => id === 'riven'),
    titre: `${compte} relance${pluriel} à traiter`,
    raison: 'Consulter les relances arrivées à échéance dans Riven.',
  }];
}

export function lireCommande(texte, priorites = [], contexte = null) {
  const phrase = normaliser(texte);
  if (!phrase) return { type: 'vide' };
  if (/\b(retour|reviens|revenir)\b.*\b(rose|accueil|boussole)\b/.test(phrase)) return { type: 'fermer' };

  const correspondances = caps.filter((cap) => [cap.nom, ...cap.alias]
    .some((alias) => ` ${phrase} `.includes(` ${normaliser(alias)} `)));
  if (correspondances.length > 1) {
    return { type: 'message', texte: `Quel projet veux-tu ouvrir ? ${correspondances.map((cap) => cap.nom).join(' ou ')} ?` };
  }
  const ordinal = phrase.match(/\b(premier|premiere|deuxieme|second|seconde|troisieme|priorite [123])\b/);
  const rang = ordinal && (/troisieme|3/.test(ordinal[0]) ? 2 : /deuxieme|second|2/.test(ordinal[0]) ? 1 : 0);
  const priorite = ordinal ? priorites[rang] : null;
  const cap = correspondances[0] || priorite?.cap;
  if (cap) {
    if (/\b(pourquoi|explique|decris)\b/.test(phrase)) {
      const action = priorite || priorites.find((item) => item.cap === cap);
      return { type: 'message', cap, texte: action?.raison || `Tu peux ouvrir ${cap.nom} depuis la rose.` };
    }
    return { type: 'ouvrir', cap };
  }
  if (ordinal) return { type: 'message', texte: 'Cette priorité n’est pas disponible.' };
  if (/\b(priorites|prioritaire|top 3)\b/.test(phrase)) return { type: 'priorites' };
  if (/\b(ouvre|ouvrir|vas y|go) (ca|ce dossier)\b/.test(phrase)) {
    if (contexte) return { type: 'ouvrir', cap: contexte };
    return { type: 'message', texte: 'Quel projet veux-tu ouvrir ? Donne son nom ou indique la priorité.' };
  }
  return { type: 'message', texte: 'Je n’ai pas trouvé ce projet. Donne son nom ou choisis une aiguille.' };
}

function monterRose() {
  const id = (suffixe) => document.getElementById(`leo-rose-${suffixe}`);
  const rose = document.getElementById('leo-rose');
  const lancer = id('ouvrir');
  const champ = id('cap');
  const liste = id('priorites-liste');
  const reponse = id('reponse');
  let token = null;
  let lecture = 0;
  let contexte = null;
  let priorites = [];

  function element(balise, classe, texte) {
    const noeud = document.createElement(balise);
    noeud.className = classe;
    if (texte !== undefined) noeud.textContent = texte;
    return noeud;
  }

  function fermerRose() {
    window.UltimaDictee?.annuler?.(champ);
    rose.close();
  }

  function ouvrirCap(cap) {
    fermerRose();
    window.location.assign(cap.cible);
  }

  for (const cap of caps) {
    const bouton = element('button', 'leo-rose-aiguille');
    bouton.type = 'button';
    bouton.dataset.cap = cap.id;
    const branche = element('span', 'leo-rose-branche');
    branche.setAttribute('aria-hidden', 'true');
    bouton.append(branche, element('span', 'leo-rose-nom', cap.nom));
    bouton.addEventListener('click', () => ouvrirCap(cap));
    id('aiguilles').appendChild(bouton);
  }

  function afficher(message, actions = []) {
    id('etat').textContent = message;
    priorites = actions.slice(0, 3);
    liste.replaceChildren(...priorites.map(({ cap, titre, raison }) => {
      const li = element('li', 'leo-rose-priorite');
      const bouton = element('button', 'leo-rose-priorite-lien');
      bouton.type = 'button';
      bouton.append(element('small', '', cap.nom), element('strong', '', titre), element('span', '', raison));
      bouton.addEventListener('click', () => ouvrirCap(cap));
      li.appendChild(bouton);
      return li;
    }));
  }

  function montrerPriorites(visible) {
    id('priorites').hidden = !visible;
    id('priorites-ouvrir').setAttribute('aria-expanded', String(visible));
  }

  async function actualiser() {
    const demande = ++lecture;
    afficher('Lecture des relances Riven…');
    let data = null;
    await chargerCockpit(token, (resultat) => { data = resultat; });
    if (demande !== lecture || !rose.open || !token) return;
    const actions = lirePriorites(data);
    if (!actions) afficher('Source Riven indisponible.');
    else if (!actions.length) afficher('Riven · aucune relance arrivée à échéance.');
    else afficher('Source · Riven', actions);
  }

  lancer.addEventListener('click', () => {
    if (!token || rose.open) return;
    contexte = null;
    champ.value = '';
    reponse.hidden = true;
    montrerPriorites(true);
    rose.showModal();
    id('titre').focus();
    actualiser();
  });
  rose.addEventListener('close', () => {
    if (rose.open) return;
    lecture += 1;
    window.UltimaDictee?.annuler?.(champ);
  });
  id('fermer').addEventListener('click', fermerRose);
  id('parler').addEventListener('click', () => champ.focus());
  id('priorites-ouvrir').addEventListener('click', () => montrerPriorites(id('priorites').hidden));
  id('priorites-fermer').addEventListener('click', () => {
    montrerPriorites(false);
    id('priorites-ouvrir').focus();
  });
  id('commande').addEventListener('submit', (event) => {
    event.preventDefault();
    const commande = lireCommande(champ.value, priorites, contexte);
    if (commande.type === 'ouvrir') ouvrirCap(commande.cap);
    if (commande.type === 'fermer') fermerRose();
    if (commande.type === 'priorites') {
      montrerPriorites(true);
      reponse.hidden = true;
    }
    if (commande.type === 'message') {
      contexte = commande.cap || null;
      reponse.textContent = commande.texte;
      reponse.hidden = false;
    }
  });
  if (window.UltimaDictee?.disponible()) {
    window.UltimaDictee.attacher(champ, 'la destination à ouvrir', { remplacer: true });
  }

  window.UltimaLeoRose = {
    poserSession(nouveauToken) {
      if (token === nouveauToken) return;
      token = nouveauToken;
      lecture += 1;
      contexte = null;
      window.UltimaDictee?.annuler?.(champ);
      lancer.hidden = !token;
      if (!token) {
        afficher('');
        reponse.textContent = '';
        reponse.hidden = true;
        champ.value = '';
        fermerRose();
      } else if (rose.open) {
        reponse.hidden = true;
        actualiser();
      }
    },
  };
}

if (typeof document !== 'undefined' && document.getElementById('leo-rose')) monterRose();

if (typeof document !== 'undefined' && document.getElementById('rose-vue-macro')) {
  import('./leo-boussole-cockpit.mjs').then(({ monterBoussoleCockpit }) => monterBoussoleCockpit());
}
