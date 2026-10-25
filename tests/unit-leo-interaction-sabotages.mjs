// Dry run : vérifier que l'instrument détecte six versions volontairement
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
const checkpoint={task_id:'00000000-0000-4000-8000-000000000001',...plan,
  confirmes:[0],rappels:2,etat:'suspendue',revision:7};
await saboter('compteur-restauration','return suivi;','return {...suivi,rappels:0};',m=>{
  assert.deepEqual(m.hydraterSuiviCheckpoint(checkpoint),checkpoint);
});
await saboter('identite-revision',
  "...(Object.hasOwn(suivi,'task_id')?{task_id:suivi.task_id}:{}),",'',m=>{
    const s=m.hydraterSuiviCheckpoint(checkpoint);
    assert.equal(m.reviserSuivi(s,{...plan,etapes:[...plan.etapes,'Clore']}).task_id,checkpoint.task_id);
  });
console.log('6/6 corruptions connues détectées ; aucune mutation des fichiers applicatifs.');
