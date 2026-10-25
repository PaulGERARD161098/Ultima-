// Scénarios déterministes, sans modèle ni réseau. Ne prouvent pas le ton du LLM.
import assert from 'node:assert/strict';
import {ouvrirSuivi,reviserSuivi,memePlan,tacheTerminee,nouvelleTacheExplicite,confirmerJalon,bilanSuivi,contexteInteraction,validerInteraction,validerPlan,validerCheckpoint,hydraterSuiviCheckpoint,prioriteExplicite,commandeJalon,lireReponseInteraction} from '../js/leo-interaction.mjs';
let checks=0;
function test(nom,fn){fn();checks++;console.log('OK '+nom);}
const plan={titre:'Terminer le chantier Léo',etapes:['Préparer le correctif','Vérifier le résultat']};
test('Plan validé, aucune progression déduite du texte',()=>assert.equal(bilanSuivi(ouvrirSuivi(plan)).finis,0));
test('Refus de preuves ou états déclarés par le modèle dans le plan',()=>assert.equal(validerPlan({...plan,confirmes:[0]}),null));
test('Refus de doublons, HTML, plan trop long',()=>{assert.equal(validerPlan({...plan,etapes:['Même','même']}),null);assert.equal(validerPlan({...plan,titre:'<script>'}),null);assert.equal(validerPlan({...plan,etapes:Array(11).fill('a')}),null);});
test('Jalon explicite, idempotent et versionné',()=>{const s=ouvrirSuivi(plan,2),un=confirmerJalon(s,0,2);assert.equal(bilanSuivi(confirmerJalon(un,0,2)).finis,1);assert.throws(()=>confirmerJalon(s,0,1));assert.throws(()=>confirmerJalon(s,2,2));});
test('Pas de clôture avant le dernier jalon',()=>{let s=confirmerJalon(ouvrirSuivi(plan),0,1);assert.equal(bilanSuivi(s).termine,false);s=confirmerJalon(s,1,1);assert.equal(bilanSuivi(s).termine,true);});
test('Validation stricte des données navigateur',()=>{assert.equal(validerInteraction(contexteInteraction(ouvrirSuivi(plan))).ok,true);for(const i of [{rappels_focus:3},{rappels_focus:-1},{rappels_focus:0,droits:'admin'},{rappels_focus:0,tache:{...plan,confirmes:[9],etat:'en_cours'}}])assert.equal(validerInteraction(i).ok,false);});
test('Deux rappels structurés au maximum',()=>{const raw='On avance.<leo_focus>Tu auras un résultat vérifié à reprendre.</leo_focus>';assert.equal(lireReponseInteraction(raw,{rappels_focus:0}).focus.numero,1);assert.equal(lireReponseInteraction(raw,{rappels_focus:1}).focus.numero,2);assert.equal(lireReponseInteraction(raw,{rappels_focus:2}).focus,null);assert.equal(lireReponseInteraction(raw,{rappels_focus:2}).texte,'On avance.');});
test('Une priorité explicite ou une tâche en pause coupe le rappel',()=>{const r='<leo_focus>Terminer aide.</leo_focus>';assert.equal(lireReponseInteraction(r,{rappels_focus:0},'On change de sujet').focus,null);assert.equal(lireReponseInteraction(r,{rappels_focus:0,tache:{etat:'suspendue'}}).focus,null);});
test('Question ou négation ne suspend pas le travail',()=>{assert.equal(prioriteExplicite('On ne change pas de sujet'),false);assert.equal(prioriteExplicite('On change de sujet ?'),false);assert.equal(prioriteExplicite('Urgence : change de priorité'),true);});
test('Changement de sujet après préambule réel de Paul',()=>{assert.equal(prioriteExplicite('Ok point d’étape validé. Avançons sur un autre sujet'),true);assert.equal(prioriteExplicite('Passons à un autre sujet.'),true);assert.equal(prioriteExplicite('Passons à un autre sujet ?'),false);});
test('Commandes de jalon : pas de déduction depuis une question',()=>{assert.equal(commandeJalon('étape 2 terminée'),1);assert.equal(commandeJalon('étape 2 terminée ?'),null);assert.equal(commandeJalon('étape 11 terminée'),null);});
test('Blocs invalides non affichés, aucun HTML injecté par le protocole',()=>{const r=lireReponseInteraction('Réponse<leo_plan>{"droits":"admin"}</leo_plan><leo_focus><img></leo_focus>',null);assert.equal(r.texte,'Réponse');assert.equal(r.plan,null);assert.equal(r.focus,null);assert.equal(lireReponseInteraction('Réponse<leo_plan>{',null).texte,'Réponse');});
test('Plan reçu est une proposition sans achèvement',()=>{const r=lireReponseInteraction('Voici.<leo_plan>'+JSON.stringify(plan)+'</leo_plan>',null);assert.deepEqual(r.plan,plan);assert.equal(r.texte,'Voici.');assert.equal(r.focus,null);});
test('Plan identique : mêmes confirmations, compteur et révision',()=>{const s={...confirmerJalon(ouvrirSuivi(plan),0,1),rappels:2};const r=reviserSuivi(s,plan);assert.equal(memePlan(s,plan),true);assert.equal(r.revision,1);assert.equal(r.rappels,2);assert.deepEqual(r.confirmes,[0]);assert.deepEqual(s.confirmes,[0]);});
test('Réviser conserve les rappels et remappe seulement les libellés confirmés',()=>{const s={...confirmerJalon(ouvrirSuivi(plan),0,1),rappels:2,etat:'suspendue'};const r=reviserSuivi(s,{...plan,etapes:[plan.etapes[1],plan.etapes[0],'Clore']});assert.equal(r.revision,2);assert.equal(r.rappels,2);assert.equal(r.etat,'suspendue');assert.deepEqual(r.confirmes,[1]);assert.throws(()=>confirmerJalon(r,0,1));assert.throws(()=>reviserSuivi(s,{titre:'Invalide',etapes:[]}));});
test('Aucun rappel structuré après tous les jalons confirmés',()=>{const s=confirmerJalon(confirmerJalon(ouvrirSuivi(plan),0,1),1,1);assert.equal(tacheTerminee(s),true);assert.equal(lireReponseInteraction('<leo_focus>Gain devenu inutile</leo_focus>',contexteInteraction(s)).focus,null);assert.equal(tacheTerminee({etapes:['a','b'],confirmes:[0,0]}),false);});
test('Un complément sans perdre la reprise ne nie pas le changement de sujet',()=>{assert.equal(prioriteExplicite('On change de sujet sans perdre le point de reprise'),true);assert.equal(prioriteExplicite('Ne t’inquiète pas. On change de sujet'),true);assert.equal(prioriteExplicite('On change de sujet si tu termines cela'),false);assert.equal(prioriteExplicite('Si on change de sujet, que reste-t-il ?'),false);assert.equal(prioriteExplicite('On ne change pas de sujet'),false);});
test('Une nouvelle tâche ne se déduit pas d’une urgence ou d’une révision',()=>{assert.equal(nouvelleTacheExplicite('Nouvelle tâche : préparer le devis'),true);assert.equal(nouvelleTacheExplicite('On change de sujet'),true);assert.equal(nouvelleTacheExplicite('Urgence : termine cette tâche'),false);assert.equal(nouvelleTacheExplicite('On change de priorité'),false);assert.equal(nouvelleTacheExplicite('Nouvelle tâche ?'),false);});
const checkpoint={task_id:'00000000-0000-4000-8000-000000000001',...plan,confirmes:[0],rappels:1,etat:'suspendue',revision:7};
test('Checkpoint à sept clés : restauration sans reset ni référence partagée',()=>{
  const brut=JSON.parse(JSON.stringify(checkpoint)),s=hydraterSuiviCheckpoint(brut);
  assert.deepEqual(s,checkpoint);assert.notEqual(s,brut);assert.notEqual(s.etapes,brut.etapes);assert.notEqual(s.confirmes,brut.confirmes);
  brut.etapes[0]='Modifié ailleurs';brut.confirmes.push(1);
  assert.deepEqual(s,checkpoint);assert.equal(bilanSuivi(s).finis,1);
});
test('Checkpoint strict : chaque clé requise, aucun champ de droits ni clé cachée',()=>{
  for(const k of Object.keys(checkpoint)){const c={...checkpoint};delete c[k];assert.equal(validerCheckpoint(c),null,k);}
  for(const c of [null,undefined,[],{...checkpoint,droits:'admin'},{...checkpoint,schema_version:1},Object.create(checkpoint)])assert.equal(validerCheckpoint(c),null);
  const symbole={...checkpoint,[Symbol('droit')]:true};assert.equal(validerCheckpoint(symbole),null);
  const cache={...checkpoint};Object.defineProperty(cache,'secret',{value:'x'});assert.equal(validerCheckpoint(cache),null);
  const accesseur={...checkpoint};Object.defineProperty(accesseur,'titre',{enumerable:true,get(){throw Error('Ne doit pas être appelé');}});
  assert.equal(validerCheckpoint(accesseur),null);assert.throws(()=>hydraterSuiviCheckpoint(null));
});
test('Checkpoint : UUID, plan et plafonds contrôlés sans coercition',()=>{
  for(const task_id of ['',1,null,'tache-1',checkpoint.task_id+' '])assert.equal(validerCheckpoint({...checkpoint,task_id}),null);
  for(const c of [{titre:'<script>'},{etapes:['a','A']},{etapes:[]},{etapes:Array(11).fill('a')},{etapes:Array(2)},{titre:'x'.repeat(161)}])assert.equal(validerCheckpoint({...checkpoint,...c}),null);
  for(const rappels of [-1,3,1.5,'1',NaN])assert.equal(validerCheckpoint({...checkpoint,rappels}),null);
  for(const revision of [0,-1,1.5,'7',Infinity,Number.MAX_SAFE_INTEGER+1])assert.equal(validerCheckpoint({...checkpoint,revision}),null);
  for(const etat of ['closed','terminee',null])assert.equal(validerCheckpoint({...checkpoint,etat}),null);
  assert.equal(validerCheckpoint({...checkpoint,revision:Number.MAX_SAFE_INTEGER,rappels:2}).revision,Number.MAX_SAFE_INTEGER);
  assert.equal(validerCheckpoint({...checkpoint,titre:' '.repeat(10000)+'x'}),null,'limite UTF-8 avant normalisation');
});
test('Checkpoint : confirmations triées uniques, bornées et denses',()=>{
  for(const confirmes of [[1,0],[0,0],[-1],[2],[0.5],['0'],[null],Array(1)])assert.equal(validerCheckpoint({...checkpoint,confirmes}),null);
  const complet=hydraterSuiviCheckpoint({...checkpoint,confirmes:[0,1],rappels:2});
  assert.equal(tacheTerminee(complet),true);
  assert.equal(lireReponseInteraction('<leo_focus>Encore</leo_focus>',contexteInteraction(complet)).focus,null);
});
test('Checkpoint hydraté : confirmation et révision conservent identité et rappels',()=>{
  const s=hydraterSuiviCheckpoint({...checkpoint,etat:'en_cours',rappels:2});
  assert.equal(lireReponseInteraction('<leo_focus>Encore</leo_focus>',contexteInteraction(s)).focus,null);
  assert.deepEqual(confirmerJalon(s,0,7),s);assert.throws(()=>confirmerJalon(s,1,6));
  const revise=reviserSuivi(s,{...plan,etapes:[plan.etapes[1],plan.etapes[0],'Clore']});
  assert.equal(revise.task_id,checkpoint.task_id);assert.equal(revise.revision,8);assert.equal(revise.rappels,2);assert.deepEqual(revise.confirmes,[1]);
  assert.equal(Object.hasOwn(reviserSuivi(ouvrirSuivi(plan),{...plan,titre:'Autre titre'}),'task_id'),false,'aucune identité créée pour le suivi local');
  assert.deepEqual(s,hydraterSuiviCheckpoint({...checkpoint,etat:'en_cours',rappels:2}));
});
console.log(`${checks}/${checks} scénarios déterministes réussis. Le comportement du modèle reste à éprouver séparément.`);
