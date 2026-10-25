// Dry run : vérifier que l'instrument détecte quatre versions volontairement
// incorrectes. Modules purs chargés depuis data:, zéro modèle/service appelé.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as correcte from '../js/leo-interaction.mjs';
const source=readFileSync(new URL('../js/leo-interaction.mjs',import.meta.url),'utf8');
const plan={titre:'Tâche en cours',etapes:['Préparer','Vérifier']};
const brut='<leo_focus>Terminer le résultat</leo_focus>';
async function saboter(nom,ancre,remplacement,preuve){
  assert.equal(source.split(ancre).length,2,'Mutation non vacuë et unique : '+nom);
  const corrompue=await import('data:text/javascript;base64,'+Buffer.from(source.replace(ancre,remplacement)).toString('base64')+'#'+nom);
  assert.throws(()=>preuve(corrompue),assert.AssertionError,'Le contrôle doit rougir : '+nom);
  preuve(correcte);
  console.log('SABOTAGE DÉTECTÉ '+nom+' ; version correcte acceptée');
}
await saboter('troisieme-rappel','(contexte?.rappels_focus??0)<2','(contexte?.rappels_focus??0)<3',m=>{
  assert.equal(m.lireReponseInteraction(brut,{rappels_focus:2}).focus,null);
});
await saboter('compteur-revision','rappels:suivi.rappels','rappels:0',m=>{
  const s={...m.ouvrirSuivi(plan),rappels:2};
  assert.equal(m.reviserSuivi(s,{...plan,etapes:[...plan.etapes,'Clore']}).rappels,2);
});
await saboter('rappel-tache-finie','&&!tacheTerminee(contexte?.tache)','',m=>{
  const s=m.confirmerJalon(m.confirmerJalon(m.ouvrirSuivi(plan),0,1),1,1);
  assert.equal(m.lireReponseInteraction(brut,m.contexteInteraction(s)).focus,null);
});
await saboter('negation-hors-sujet',
  'export const prioriteExplicite=texte=>commandePriorite(texte)!==null;',
  'export const prioriteExplicite=texte=>!String(texte).includes("sans")&&commandePriorite(texte)!==null;',m=>{
    assert.equal(m.prioriteExplicite('On change de sujet sans perdre le point de reprise'),true);
  });
console.log('4/4 corruptions connues détectées ; aucune mutation des fichiers applicatifs.');
