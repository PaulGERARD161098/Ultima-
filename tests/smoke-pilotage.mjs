// RIVEN — piloter, corriger, proposer (2026-08-12). Les trois boucles :
//   A. PILOTER  : intérêt qualitatif + efforts chiffrés (migration 0003) enfin
//                 atteignables depuis la fiche.
//   B. CORRIGER : type, note et rôle se réparent SANS détruire l'objet — donc
//                 sans perdre le journal qui lui est adossé.
//   C. PROPOSER : Léo suggère un rapprochement INÉDIT, et n'écrit rien seul.
//
// Tout se prouve par le DOM et par les gestes réels. Aucun état interne n'est
// exposé pour les besoins du test : `etat` reste privé (il porte de la PII), et
// un harnais qui aurait besoin d'un crochet en production mesurerait autre
// chose que ce que Paul touche. La survie du JOURNAL adossé à une relation est
// la preuve observable qu'on a corrigé au lieu de supprimer-recréer.
// Mode démo, 390 px.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SCRATCH = new URL('./.cache', import.meta.url).pathname;

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const erreurs = [];
page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('console: ' + m.text()); });

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64');
await page.addInitScript(() => {
  try { window.sessionStorage.setItem('ultima-leo-accueil-vu', '1'); } catch (e) {}
  Object.defineProperty(window, 'ULTIMA_CONFIG', {
    value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    writable: false,
  });
});

const verdicts = {};
await page.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1000);

const ongletContacts = page.locator('.barre-onglets button', { hasText: 'Contacts' });
const ongletAccueil = page.locator('.barre-onglets button', { hasText: 'Accueil' });
const registreFiches = page.locator('#registre-fiches');

async function fermerPanneau() {
  if (!(await page.locator('#panneau').isHidden())) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }
}

async function ouvrirFiche(nom) {
  await fermerPanneau();
  await ongletContacts.click();
  await page.waitForTimeout(200);
  await registreFiches.click();
  await page.waitForTimeout(200);
  await page.locator('.item-contact', { hasText: nom }).click();
  await page.waitForTimeout(300);
}

// ---------------------------------------------------------------------------
// A. PILOTER — les trois champs de 0003, atteignables depuis la fiche.
//    « Agence Habitat Sud » porte la relation demo-r1 vers Plomberie Roux, et
//    c'est la SEULE relation de la démo qui porte une entrée de journal : elle
//    servira de témoin en partie B.
// ---------------------------------------------------------------------------
await ouvrirFiche('Agence Habitat Sud');

const relationRoux = page.locator('.item-relation', { hasText: 'Plomberie Roux & Fils' });
const relationsSurLaFiche = await page.locator('.item-relation').count();
const journalAvant = await page.locator('.entree-journal').count();
const noteJournalTemoin = 'Deux dossiers transmis ce mois-ci, bonne dynamique.';
verdicts.temoinJournalPresent = (await page.locator('#vue-fiche').innerText())
  .includes(noteJournalTemoin);

verdicts.boutonModifierPresent = await relationRoux.locator('.bouton-modifier-relation').isVisible();
// Cible tactile MESURÉE, pas regardée (règle du 2026-08-01).
const boiteModifier = await relationRoux.locator('.bouton-modifier-relation').boundingBox();
verdicts.cibleTactileModifier = !!boiteModifier &&
  boiteModifier.height >= 24 && boiteModifier.width >= 24;
// Le statut d'avant, relevé À L'ÉCRAN : il devra survivre à la correction.
const statutAvant = await relationRoux.locator('.select-statut-relation').inputValue();

await relationRoux.locator('.bouton-modifier-relation').click();
await page.waitForTimeout(300);
verdicts.formEditionOuvert = await page.locator('#form-relation').isVisible();
verdicts.titreEdition = (await page.locator('#panneau-titre').textContent()).includes('Modifier la relation');
verdicts.boutonDitEnregistrer =
  (await page.locator('#relation-envoyer').textContent()).trim() === 'Enregistrer';
// P6 — la cible est FIGÉE : en changer désignerait une AUTRE relation.
verdicts.cibleFigeeEnEdition = await page.locator('#relation-cible').isDisabled();
// Le pli reste fermé : relier deux fiches doit rester un geste court.
verdicts.pliPilotageFerme = await page.evaluate(
  () => !document.getElementById('relation-pilotage-pli').open);
verdicts.labelsPilotage = await page.evaluate(() =>
  ['relation-interet_qualitatif', 'relation-effort_temps', 'relation-effort_energie']
    .every((id) => {
      const champ = document.getElementById(id);
      const label = document.querySelector(`label[for="${id}"]`);
      return !!champ && !!label && label.textContent.trim().length > 0;
    }));
// La note existante est bien relue dans le formulaire (on corrige, on ne
// repart pas d'une page blanche).
verdicts.noteExistanteRelue = (await page.locator('#relation-notes').inputValue())
  .includes('copropriétés');

await page.locator('#relation-pilotage-pli summary').click();
await page.waitForTimeout(150);
await page.locator('#relation-interet_qualitatif').fill('Deux copropriétés à lui confier avant septembre.');
await page.locator('#relation-effort_temps').selectOption('2');
await page.locator('#relation-effort_energie').selectOption('4');
await page.locator('#relation-envoyer').click();
await page.waitForTimeout(450);

// C1 — écrit, relu, RÉAFFICHÉ. Les trois champs sortent enfin de la base.
const ficheApresPilotage = await page.locator('#vue-fiche').innerText();
verdicts.interetAffiche = ficheApresPilotage.includes('Deux copropriétés à lui confier avant septembre.');
verdicts.effortsAffiches = ficheApresPilotage.includes('temps 2/5') &&
  ficheApresPilotage.includes('énergie 4/5');
await page.screenshot({ path: `${SCRATCH}/pilotage-relation-390.png` });

// Et ils sont RELUS par le formulaire à la réouverture — pas seulement peints.
await relationRoux.locator('.bouton-modifier-relation').click();
await page.waitForTimeout(300);
verdicts.pilotageReluAuFormulaire =
  (await page.locator('#relation-interet_qualitatif').inputValue()).includes('copropriétés à lui confier') &&
  (await page.locator('#relation-effort_temps').inputValue()) === '2' &&
  (await page.locator('#relation-effort_energie').inputValue()) === '4';

// ---------------------------------------------------------------------------
// B. CORRIGER SANS DÉTRUIRE — le type et la note changent, l'objet survit.
// ---------------------------------------------------------------------------
const typeAvant = await page.locator('#relation-type').inputValue();
const typeVoulu = typeAvant === 'sous_traitance' ? 'chantier_commun' : 'sous_traitance';
await page.locator('#relation-type').selectOption(typeVoulu);
await page.locator('#relation-notes').fill('Corrigé : lot plomberie, pas menuiserie.');
await page.locator('#relation-envoyer').click();
await page.waitForTimeout(450);

const ficheApresCorrection = await page.locator('#vue-fiche').innerText();
const LIBELLE = { apport_affaires: "Apport d'affaires", sous_traitance: 'Sous-traitance', chantier_commun: 'Chantier commun' };
verdicts.typeCorrige = (await relationRoux.locator('.item-relation-texte').innerText())
  .includes(LIBELLE[typeVoulu]);
verdicts.noteCorrigee = ficheApresCorrection.includes('Corrigé : lot plomberie, pas menuiserie.');

// C2 — LA preuve de « sans détruire » : l'entrée de journal adossée à cette
// relation est TOUJOURS là. Un supprimer/recréer l'aurait emportée.
verdicts.journalSurvit = ficheApresCorrection.includes(noteJournalTemoin) &&
  (await page.locator('.entree-journal').count()) === journalAvant;
// Rien n'a été recréé : le compte de relations de la fiche est inchangé.
verdicts.aucuneRelationEnPlus = (await page.locator('.item-relation').count()) === relationsSurLaFiche;
// C4 — ce qu'on n'a pas touché n'a pas bougé.
verdicts.statutIntact = (await relationRoux.locator('.select-statut-relation').inputValue()) === statutAvant;
verdicts.pilotageIntact = ficheApresCorrection.includes('temps 2/5') &&
  ficheApresCorrection.includes('Deux copropriétés à lui confier avant septembre.');

// La règle d'hier n'a pas été affaiblie : un arrêt exige toujours sa raison.
page.on('dialog', (d) => d.dismiss());
await relationRoux.locator('.select-statut-relation').selectOption('arrete');
await page.waitForTimeout(350);
verdicts.arretSansRaisonToujoursRefuse =
  (await relationRoux.locator('.select-statut-relation').inputValue()) === statutAvant;

// ---------------------------------------------------------------------------
// B (suite). Le RÔLE se corrige sans détacher.
// ---------------------------------------------------------------------------
await ouvrirFiche('Plomberie Roux & Fils');
const personneLiee = page.locator('.item-personne-liee', { hasText: 'Karim Roux' });
verdicts.boutonRolePresent = await personneLiee.locator('.bouton-role').isVisible();
const boiteRole = await personneLiee.locator('.bouton-role').boundingBox();
verdicts.cibleTactileRole = !!boiteRole && boiteRole.height >= 24 && boiteRole.width >= 24;
verdicts.roleAvant = (await personneLiee.innerText()).includes('Gérant');

await personneLiee.locator('.bouton-role').click();
await page.waitForTimeout(300);
verdicts.titreRole = (await page.locator('#panneau-titre').textContent()).includes('Modifier le rôle');
// La personne est figée : c'est le rôle, et lui seul, qu'on répare.
verdicts.personneFigeeEnEditionRole = await page.locator('#rattachement-personne').isDisabled();
verdicts.pliNouvelleCacheEnEditionRole = await page.locator('#rattachement-nouvelle').isHidden();
verdicts.roleRelu = (await page.locator('#rattachement-role').inputValue()) === 'Gérant';
await page.locator('#rattachement-role').fill('référent chantier');
await page.locator('#rattachement-envoyer').click();
await page.waitForTimeout(450);

// C3 — le rôle change, la personne reste rattachée, le registre est intact.
verdicts.roleCorrige = (await page.locator('.item-personne-liee', { hasText: 'Karim Roux' }).innerText())
  .includes('référent chantier');
verdicts.personneToujoursRattachee =
  (await page.locator('.item-personne-liee').count()) >= 1;
await page.screenshot({ path: `${SCRATCH}/role-corrige-390.png` });

// Karim Roux servait DEUX fiches avec DEUX rôles : le second est intact.
// C'est la preuve qu'on a corrigé UN lien, pas la personne.
await fermerPanneau();
await ongletContacts.click();
await page.waitForTimeout(200);
await page.locator('#registre-personnes').click();
await page.waitForTimeout(250);
verdicts.registreIntact = (await page.locator('.item-personne').count()) === 3;
await page.locator('.item-personne', { hasText: 'Karim Roux' }).click();
await page.waitForTimeout(300);
const rolesDeKarim = await page.locator('.liste-personnes .item-personne-detail').allTextContents();
verdicts.autreRoleIntact = rolesDeKarim.some((r) => r.includes('Référent plomberie'));
verdicts.roleCorrigeVuDeLaPersonne = rolesDeKarim.some((r) => r.includes('référent chantier'));

// ---------------------------------------------------------------------------
// C. PROPOSER — le rapprochement inédit.
//    D'ABORD L'ABSENCE : aucun artisan de démo ne fait de la toiture, donc
//    aucune paire n'est éligible. La règle ne doit RIEN inventer.
// ---------------------------------------------------------------------------
await fermerPanneau();
await ongletAccueil.click();
await page.waitForTimeout(500);
const suggestionsAvant = await page.locator('.item-suggestion-texte').allTextContents();
verdicts.aucunRapprochementInvente =
  !suggestionsAvant.some((t) => t.includes('ne sont pas encore reliés'));

// Le lead « M. Lambert — rénovation toiture » (secteur Toiture) n'a qu'une
// relation en démo. On relève son compte AVANT, à l'écran.
await ouvrirFiche('M. Lambert');
const relationsDeLambertAvant = await page.locator('.item-relation').count();

// On crée le couvreur qui manque : la paire devient éligible.
await fermerPanneau();
await ongletContacts.click();
await page.waitForTimeout(200);
await registreFiches.click();
await page.waitForTimeout(200);
await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(300);
await page.locator('#noeud-type').selectOption('artisan');
await page.locator('#noeud-nom').fill('Couverture Bertin');
await page.locator('#noeud-secteur_activite').fill('Toiture');
await page.locator('#noeud-ville').fill('Bordeaux');
await page.locator('#form-noeud button.bouton-primaire[type="submit"]').click();
await page.waitForTimeout(450);
await fermerPanneau();

await ongletAccueil.click();
await page.waitForTimeout(500);
const suggestions = await page.locator('.item-suggestion-texte').allTextContents();
const rapprochement = suggestions.find((t) => t.includes('ne sont pas encore reliés'));
// C5 — la suggestion paraît, NOMME les deux, et DIT pourquoi.
verdicts.rapprochementPropose = !!rapprochement;
verdicts.rapprochementNommeLesDeux = !!rapprochement &&
  rapprochement.includes('M. Lambert') && rapprochement.includes('Couverture Bertin');
verdicts.rapprochementDitPourquoi = !!rapprochement && rapprochement.includes('fait toiture');
await page.screenshot({ path: `${SCRATCH}/rapprochement-propose-390.png` });

// C5 (suite) — Léo n'écrit JAMAIS seul. On ouvre la suggestion, on ANNULE, et
// la fiche du lead doit avoir exactement le même nombre de relations qu'avant.
await page.locator('.item-suggestion', { hasText: 'ne sont pas encore reliés' }).click();
await page.waitForTimeout(450);
verdicts.formulairePreRempli = await page.locator('#form-relation').isVisible();
verdicts.sourcePreRemplie = (await page.locator('#relation-source').textContent())
  .includes('M. Lambert');
verdicts.ciblePreRemplie = (await page.locator('#relation-cible option:checked').textContent())
  .includes('Couverture Bertin');
verdicts.typePreRempli = (await page.locator('#relation-type').inputValue()) === 'apport_affaires';
// La cible reste MODIFIABLE ici : c'est une création, pas une réparation.
verdicts.cibleModifiableEnCreation = !(await page.locator('#relation-cible').isDisabled());

await page.locator('#bouton-annuler-relation').click();
await page.waitForTimeout(300);
await ouvrirFiche('M. Lambert');
verdicts.rienEcritSansValidation =
  (await page.locator('.item-relation').count()) === relationsDeLambertAvant;

// On valide pour de bon, depuis la suggestion.
await fermerPanneau();
await ongletAccueil.click();
await page.waitForTimeout(500);
await page.locator('.item-suggestion', { hasText: 'ne sont pas encore reliés' }).click();
await page.waitForTimeout(450);
await page.locator('#relation-envoyer').click();
await page.waitForTimeout(500);
await ouvrirFiche('M. Lambert');
verdicts.relationCreeeApresValidation =
  (await page.locator('.item-relation').count()) === relationsDeLambertAvant + 1;
verdicts.relationVersLeCouvreur = (await page.locator('#vue-fiche').innerText())
  .includes('Couverture Bertin');

// C6 — la paire est reliée : la règle ne la repropose JAMAIS. L'assertion
// porte sur le RAPPROCHEMENT, pas sur le nom : R3 (« ni téléphone ni e-mail »)
// nomme légitimement le même artisan, et confondre les deux ferait échouer un
// produit correct. C'est le harnais qui doit être précis, pas le produit qui
// doit se taire.
await fermerPanneau();
await ongletAccueil.click();
await page.waitForTimeout(500);
const suggestionsApres = await page.locator('.item-suggestion-texte').allTextContents();
verdicts.paireDejaRelieeNonReproposee = !suggestionsApres.some(
  (t) => t.includes('ne sont pas encore reliés') && t.includes('Couverture Bertin'));
// Et plus aucun rapprochement n'est proposé du tout : c'était la seule paire
// éligible du réseau de démo.
verdicts.plusAucunRapprochementEligible = !suggestionsApres.some(
  (t) => t.includes('ne sont pas encore reliés'));

// ---------------------------------------------------------------------------
verdicts.zeroErreurConsole = erreurs.length === 0;

await browser.close();

let rouge = false;
for (const [nom, ok] of Object.entries(verdicts)) {
  console.log(`${ok ? '✅' : '❌'} ${nom}`);
  if (!ok) { rouge = true; }
}
if (erreurs.length) { console.log('--- erreurs ---'); erreurs.forEach((e) => console.log(e)); }
if (rouge) { process.exit(1); }
