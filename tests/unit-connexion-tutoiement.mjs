// L'ÉCRAN DE CONNEXION TUTOIE, COMME LÉO (Paul, 26/09 : « tutoiement »).
//
// La critique impeccable du 26/09 l'avait relevé : la porte d'Ultima vouvoyait
// (« votre interface unique », « vous est adressé », « Vérifiez votre boîte
// mail »), puis Léo tutoyait dès la porte franchie. Deux voix pour un seul
// interlocuteur.
//
// Ce harnais lit les SOURCES de la porte — les deux pages qui la portent
// (`index.html`, `riven.html`) et les deux modules qui envoient ses messages
// (`js/boussole-auth.js`, `js/app.js`) — et refuse toute marque du vouvoiement.
//
// ⛔ Vu rouge sur le texte d'avant. Et chaque recherche d'absence est précédée
// de son verrou de non-vacuité : un extrait vide ne contient pas de « vous »
// non plus, et serait vert pour rien.
//
// ⚠️ PÉRIMÈTRE, nommément : la PORTE seulement. Le reste de RIVEN vouvoie encore
// (`js/app.js`, `js/dictee.js`) — c'est hors de ce que Paul a tranché.
// Le mail du lien magique est rédigé côté Supabase, hors du dépôt : ce harnais
// ne peut pas le voir.
import { readFileSync } from 'node:fs';

const racine = new URL('../', import.meta.url);
const lire = (chemin) => readFileSync(new URL(chemin, racine), 'utf8');
const VOUVOIEMENT = /\b(vous|votre|vos|vérifiez|réessayez|connectez-vous|veuillez|saisissez|consultez)\b/i;

const verdicts = {};
function verifier(nom, condition, detail = '') {
  if (Object.prototype.hasOwnProperty.call(verdicts, nom)) { throw new Error('verdict en double : ' + nom); }
  verdicts[nom] = condition === true;
  console.log(`  ${condition === true ? '✅' : '❌'} ${nom}${detail ? ' — ' + detail : ''}`);
}

// Les deux pages : l'écran de connexion, de son ouverture à la fin du formulaire.
for (const page of ['index.html', 'riven.html']) {
  const source = lire(page);
  const debut = source.indexOf('id="ecran-connexion"');
  const fin = source.indexOf('</form>', debut);
  const porte = debut >= 0 && fin > debut ? source.slice(debut, fin) : '';
  verifier(`${page} : la porte est lue (verrou)`, porte.includes('Recevoir le lien') && porte.length > 300,
    `${porte.length} caractères`);
  const trouve = porte.match(VOUVOIEMENT);
  verifier(`${page} : la porte tutoie`, porte.length > 300 && !trouve, trouve ? `« ${trouve[0]} »` : '');
}

// Les deux modules : les messages que la porte affiche (envoi du lien, Google).
for (const module of ['js/boussole-auth.js', 'js/app.js']) {
  const source = lire(module);
  const debut = source.indexOf('function envoyerLienMagique');
  const google = source.indexOf('function seConnecterGoogle', debut);
  const fin = google > 0 ? source.indexOf('\n  }', google) : -1;
  const extrait = debut >= 0 && fin > debut ? source.slice(debut, fin) : '';
  const messages = [...extrait.matchAll(/toast\(\s*(['"])(.*?)\1/g)].map((m) => m[2]);
  verifier(`${module} : les messages de la porte sont lus (verrou)`, messages.length >= 3,
    `${messages.length} message(s)`);
  const fautifs = messages.filter((m) => VOUVOIEMENT.test(m));
  verifier(`${module} : les messages de la porte tutoient`, messages.length >= 3 && fautifs.length === 0,
    fautifs.join(' | '));
}

const rouges = Object.values(verdicts).filter((v) => !v).length;
console.log(`${rouges} verdict(s) rouge(s) sur ${Object.keys(verdicts).length}`);
process.exit(rouges ? 1 : 0);
