// RIVEN se remplit (2026-08-12) — deux gestes, sept axes.
//   A. Créer une personne DEPUIS la fiche, y compris registre VIDE : le geste
//      était inatteignable dans l'état réel de la base de Paul (0 personne).
//   B. Saisie en SÉRIE : « Enregistrer et suivant » enchaîne sans rouvrir.
// Mode démo, 390 px — la largeur du pouce, pas celle de l'écran de bureau.
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
  // La section 5 vérifie l'ORBITE des personnes, un trait du ciel EN VOLUME : depuis
  // le 2026-09-30, RIVEN s'ouvre à plat (carte des nébuleuses), on demande donc
  // le volume — une fois, sans écraser un choix fait pendant la traversée.
  try { if (!localStorage.getItem('ultima-ciel-vue')) { localStorage.setItem('ultima-ciel-vue', 'volume'); } } catch (e) {}
  Object.defineProperty(window, 'ULTIMA_CONFIG', {
    value: { SUPABASE_URL: '', SUPABASE_ANON_KEY: '' },
    writable: false,
  });
});

const verdicts = {};
await page.goto('http://127.0.0.1:8123/riven.html', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(1000);

const ongletContacts = page.locator('.barre-onglets button', { hasText: 'Contacts' });
const registreFiches = page.locator('#registre-fiches');
const registrePersonnes = page.locator('#registre-personnes');
const toasts = page.locator('.toasts');

// Les toasts persistent quelques secondes : on les efface avant chaque geste
// dont le verdict porte sur l'ABSENCE d'un message. Sans cela, on constaterait
// le toast du geste PRÉCÉDENT et l'assertion serait un faux positif.
// « Annuler » ne ferme pas le panneau : il revient à la fiche courante. Le
// panneau resterait alors EN COUVERTURE de la liste, et Playwright refuserait
// de cliquer un contact « not visible » — ce qu'un doigt vivrait pareil.
async function fermerPanneau() {
  if (!(await page.locator('#panneau').isHidden())) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }
}

async function viderToasts() {
  await page.evaluate(() => {
    const zone = document.querySelector('.toasts');
    if (zone) { zone.textContent = ''; }
  });
}

// ---------------------------------------------------------------------------
// 1. Le flux court d'hier n'est pas allongé : registre PEUPLÉ (3 personnes de
//    démo), le pli « nouvelle personne » reste FERMÉ, et l'option retenue par
//    défaut est une personne EXISTANTE — la parade au doublon.
// ---------------------------------------------------------------------------
await ongletContacts.click();
await page.waitForTimeout(200);
await page.locator('.item-contact', { hasText: 'Élec Ferrand' }).click();
await page.waitForTimeout(200);
await page.locator('#fiche-rattacher').click();
await page.waitForTimeout(200);

verdicts.formOuvertRegistrePeuple = await page.locator('#form-rattachement').isVisible();
verdicts.pliFermeParDefaut = await page.locator('#rattachement-nouvelle').isHidden();
const valeurParDefaut = await page.locator('#rattachement-personne').inputValue();
verdicts.defautEstUneExistante = valeurParDefaut !== '__nouvelle__' && valeurParDefaut.length > 0;
// « Créer » est offert EN TÊTE : visible sans dérouler cinquante noms.
const premiereOption = await page.locator('#rattachement-personne option').first().getAttribute('value');
verdicts.creerOffertEnTete = premiereOption === '__nouvelle__';

// Le pli s'ouvre au choix, et se referme si l'on revient sur une existante.
await page.locator('#rattachement-personne').selectOption('__nouvelle__');
await page.waitForTimeout(120);
verdicts.pliSOuvreAuChoix = await page.locator('#rattachement-nouvelle').isVisible();
await page.locator('#rattachement-personne').selectOption(valeurParDefaut);
await page.waitForTimeout(120);
verdicts.pliSeReferme = await page.locator('#rattachement-nouvelle').isHidden();

// Chaque champ neuf porte son label, et la cible tactile du second bouton
// d'envoi est MESURÉE — pas regardée (règle du 2026-08-01).
verdicts.labelsDesChampsNeufs = await page.evaluate(() => {
  return ['rattachement-nom', 'rattachement-fonction', 'rattachement-telephone']
    .every((id) => {
      const champ = document.getElementById(id);
      const label = document.querySelector(`label[for="${id}"]`);
      return !!champ && !!label && label.textContent.trim().length > 0;
    });
});
await page.screenshot({ path: `${SCRATCH}/serie-rattachement-390.png` });

// ---------------------------------------------------------------------------
// 2. LE CUL-DE-SAC. On vide le registre par les VRAIS gestes de l'interface,
//    jusqu'à zéro personne — l'état mesuré en production le 2026-08-12.
// ---------------------------------------------------------------------------
await page.locator('#bouton-annuler-rattachement').click();
await page.waitForTimeout(200);
await fermerPanneau();
await ongletContacts.click();
await page.waitForTimeout(200);
await registrePersonnes.click();
await page.waitForTimeout(200);

page.on('dialog', (d) => d.accept());
let restantes = await page.locator('.item-personne').count();
verdicts.registrePeupleAuDepart = restantes === 3;
let garde = 0;
while (restantes > 0 && garde < 10) {
  await page.locator('.item-personne').first().click();
  await page.waitForTimeout(200);
  await page.locator('#vue-fiche .bouton-danger').last().click();
  await page.waitForTimeout(300);
  await ongletContacts.click();
  await page.waitForTimeout(150);
  await registrePersonnes.click();
  await page.waitForTimeout(200);
  restantes = await page.locator('.item-personne').count();
  garde += 1;
}
verdicts.registreVide = restantes === 0;

// Le geste, dans cet état : le formulaire DOIT s'ouvrir.
await registreFiches.click();
await page.waitForTimeout(200);
await page.locator('.item-contact', { hasText: 'Élec Ferrand' }).click();
await page.waitForTimeout(200);
await viderToasts();
await page.locator('#fiche-rattacher').click();
await page.waitForTimeout(300);

verdicts.formOuvertRegistreVide = await page.locator('#form-rattachement').isVisible();
// La règle se teste par l'ABSENCE (2026-07-30) : plus aucun toast d'erreur.
const texteToasts = (await toasts.textContent()) || '';
verdicts.aucunToastDeRefus = !texteToasts.includes('Aucune personne disponible');
verdicts.pliOuvertDOffice = await page.locator('#rattachement-nouvelle').isVisible();
verdicts.seuleOptionCreer =
  (await page.locator('#rattachement-personne option').count()) === 1 &&
  (await page.locator('#rattachement-personne').inputValue()) === '__nouvelle__';

// Un nom vide est refusé AVANT tout appel — et ne crée rien.
await viderToasts();
await page.locator('#form-rattachement button[type="submit"]').click();
await page.waitForTimeout(250);
verdicts.nomVideRefuse = ((await toasts.textContent()) || '').includes('nom de la personne est obligatoire');
verdicts.formToujoursLaApresRefus = await page.locator('#form-rattachement').isVisible();

// UN SEUL envoi : la personne naît ET le rattachement porte son rôle.
await page.locator('#rattachement-nom').fill('Solène Marchand');
await page.locator('#rattachement-fonction').fill('Conductrice de travaux');
await page.locator('#rattachement-telephone').fill('06 55 44 33 22');
await page.locator('#rattachement-role').fill('interlocutrice chantier');
await page.locator('#form-rattachement button[type="submit"]').click();
await page.waitForTimeout(400);

const texteFiche = await page.locator('#vue-fiche').innerText();
verdicts.retourSurLaFiche = (await page.locator('#panneau-titre').textContent()).includes('Élec Ferrand');
verdicts.personneSurLaFiche = texteFiche.includes('Solène Marchand');
verdicts.roleSurLaFiche = texteFiche.includes('interlocutrice chantier');
await page.screenshot({ path: `${SCRATCH}/serie-personne-creee-390.png` });

// Et elle est bien AU REGISTRE : une personne, pas un champ de la fiche.
await ongletContacts.click();
await page.waitForTimeout(200);
await registrePersonnes.click();
await page.waitForTimeout(200);
verdicts.unePersonneAuRegistre = (await page.locator('.item-personne').count()) === 1;
verdicts.fonctionConservee = (await page.locator('.item-personne').first().innerText())
  .includes('Conductrice de travaux');

// ---------------------------------------------------------------------------
// 3. SAISIE EN SÉRIE — les fiches. Deux créations sans jamais rouvrir.
// ---------------------------------------------------------------------------
await registreFiches.click();
await page.waitForTimeout(200);
const fichesAvant = await page.locator('.item-contact').count();

await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(250);
// Défaut trouvé par ce harnais : « + Ajouter » depuis le registre basculait
// sur la Carte (`ouvrirFormDepuisAccueil`), si bien qu'annuler faisait perdre
// sa liste. On saisit une série DEPUIS Contacts : on doit y rester.
verdicts.resteSurContacts = await page.evaluate(() => {
  const actif = document.querySelector('.onglet[aria-current="page"]');
  return !!actif && actif.textContent.trim() === 'Contacts';
});
verdicts.enchainerVisibleEnCreation = await page.locator('#noeud-enchainer').isVisible();
verdicts.compteurCacheAuDepart = await page.locator('#noeud-serie').isHidden();
// Cible tactile MESURÉE, pas regardée.
const boiteEnchainer = await page.locator('#noeud-enchainer').boundingBox();
verdicts.cibleTactileEnchainer = !!boiteEnchainer && boiteEnchainer.height >= 24 && boiteEnchainer.width >= 24;

await page.locator('#noeud-type').selectOption('artisan');
await page.locator('#noeud-statut').selectOption('prospect');
await page.locator('#noeud-secteur_activite').fill('Couverture');
await page.locator('#noeud-ville').fill('Roubaix');
await page.locator('#noeud-nom').fill('Toitures Delval');
await page.locator('#noeud-telephone').fill('03 20 11 22 33');
await page.locator('#noeud-enchainer').click();
await page.waitForTimeout(350);

// C2 — le formulaire est TOUJOURS là, le nom vide et focusé, le contexte gardé.
verdicts.formToujoursOuvert = await page.locator('#form-noeud').isVisible();
verdicts.nomVideApresEnchainement = (await page.locator('#noeud-nom').inputValue()) === '';
verdicts.focusSurLeNom = await page.evaluate(() => document.activeElement && document.activeElement.id === 'noeud-nom');
verdicts.secteurConserve = (await page.locator('#noeud-secteur_activite').inputValue()) === 'Couverture';
verdicts.villeConservee = (await page.locator('#noeud-ville').inputValue()) === 'Roubaix';
verdicts.typeConserve = (await page.locator('#noeud-type').inputValue()) === 'artisan';
verdicts.statutConserve = (await page.locator('#noeud-statut').inputValue()) === 'prospect';
// Ce qui identifiait la fiche précédente est bien parti.
verdicts.telephoneVide = (await page.locator('#noeud-telephone').inputValue()) === '';
verdicts.compteurUn = (await page.locator('#noeud-serie').textContent()).trim() === '1 fiche créée à la suite.';
verdicts.compteurAnnonce = (await page.locator('#noeud-serie').getAttribute('role')) === 'status';

// Seconde fiche, à la volée : on ne tape que le nom.
await page.locator('#noeud-nom').fill('Zinguerie Prévost');
await page.locator('#noeud-enchainer').click();
await page.waitForTimeout(350);
verdicts.compteurDeux = (await page.locator('#noeud-serie').textContent()).trim() === '2 fiches créées à la suite.';
await page.screenshot({ path: `${SCRATCH}/serie-fiches-390.png` });

// La troisième ferme, comme avant — « Enregistrer » n'a pas changé de sens.
await page.locator('#noeud-nom').fill('Charpentes Anseele');
await page.locator('#form-noeud button.bouton-primaire[type="submit"]').click();
await page.waitForTimeout(400);
verdicts.enregistrerFermeToujours = await page.locator('#vue-fiche').isVisible() &&
  (await page.locator('#panneau-titre').textContent()).includes('Charpentes Anseele');

// C3 — le compteur disait le vrai : trois fiches de plus, pas deux, pas quatre.
await ongletContacts.click();
await page.waitForTimeout(250);
verdicts.troisFichesDePlus = (await page.locator('.item-contact').count()) === fichesAvant + 3;

// Le compteur repart de zéro à la réouverture (il n'annonce pas une série
// qui n'a pas eu lieu), et disparaît en ÉDITION.
await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(250);
verdicts.compteurRemisAZero = await page.locator('#noeud-serie').isHidden();
await page.locator('#bouton-annuler-noeud').click();
await page.waitForTimeout(200);
await fermerPanneau();
await page.locator('.item-contact', { hasText: 'Toitures Delval' }).click();
await page.waitForTimeout(200);
await page.locator('#vue-fiche').getByRole('button', { name: 'Modifier' }).first().click();
await page.waitForTimeout(250);
verdicts.enchainerMasqueEnEdition = await page.locator('#noeud-enchainer').isHidden();
await page.locator('#bouton-annuler-noeud').click();
await page.waitForTimeout(200);
await fermerPanneau();

// ---------------------------------------------------------------------------
// 4. SAISIE EN SÉRIE — les personnes. Même geste, même preuve.
// ---------------------------------------------------------------------------
await ongletContacts.click();
await page.waitForTimeout(200);
await registrePersonnes.click();
await page.waitForTimeout(200);
const personnesAvant = await page.locator('.item-personne').count();
await page.locator('#contacts-ajouter').click();
await page.waitForTimeout(250);
verdicts.enchainerPersonneVisible = await page.locator('#personne-enchainer').isVisible();

await page.locator('#personne-nom').fill('Bastien Ollivier');
await page.locator('#personne-fonction').fill('Chef de chantier');
await page.locator('#personne-enchainer').click();
await page.waitForTimeout(350);
verdicts.formPersonneToujoursOuvert = await page.locator('#form-personne').isVisible();
verdicts.nomPersonneVide = (await page.locator('#personne-nom').inputValue()) === '';
verdicts.fonctionPersonneVidee = (await page.locator('#personne-fonction').inputValue()) === '';
verdicts.focusSurNomPersonne = await page.evaluate(() => document.activeElement && document.activeElement.id === 'personne-nom');
verdicts.compteurPersonneUn = (await page.locator('#personne-serie').textContent()).trim() === '1 personne créée à la suite.';

await page.locator('#personne-nom').fill('Awa Diallo');
await page.locator('#personne-enchainer').click();
await page.waitForTimeout(350);
verdicts.compteurPersonneDeux = (await page.locator('#personne-serie').textContent()).trim() === '2 personnes créées à la suite.';
await page.locator('#bouton-annuler-personne').click();
await page.waitForTimeout(250);
await fermerPanneau();
await ongletContacts.click();
await page.waitForTimeout(200);
await registrePersonnes.click();
await page.waitForTimeout(200);
verdicts.deuxPersonnesDePlus = (await page.locator('.item-personne').count()) === personnesAvant + 2;
await page.screenshot({ path: `${SCRATCH}/serie-personnes-390.png` });

// ---------------------------------------------------------------------------
// 5. Le CIEL reçoit l'orbite : la personne créée depuis la fiche y paraît.
//    C'est le bout de la chaîne — sans cela, remplir ne sert à rien.
// ---------------------------------------------------------------------------
await page.locator('.barre-onglets button', { hasText: 'Ciel' }).click();
await page.waitForTimeout(700);
verdicts.orbiteAuCiel = (await page.locator('#espace-ciel [data-personne-id]').count()) >= 1;
const etiquetteOrbite = await page.locator('#espace-ciel [data-personne-id]').first().getAttribute('aria-label');
verdicts.orbiteNommee = !!etiquetteOrbite && etiquetteOrbite.includes('Solène Marchand');
await page.screenshot({ path: `${SCRATCH}/serie-ciel-390.png` });

// ---------------------------------------------------------------------------
// 6. Zéro erreur console sur toute la traversée.
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
