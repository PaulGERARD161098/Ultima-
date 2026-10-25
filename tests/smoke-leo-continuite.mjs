// Recette composée : client, UI du registre et cartouche réels ; HTTP fictif.
// La fixture simule CAS/reçus, pas les droits SQL. Aucun modèle/service appelé.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const BASE='http://127.0.0.1:8123';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const entry=html.match(/<button\b[^>]*id="leo-mission-ouvrir"[^>]*>[\s\S]*?<\/button>/)?.[0];
const dialog=html.match(/<dialog id="leo-mission-dialog"[\s\S]*?<\/dialog>/)?.[0];
assert.ok(entry&&dialog,'dialogue extrait du HTML produit');
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const mission=id(1),owner=id(2),other=id(3);
const PLAN={titre:'Livrer le chantier',etapes:['Préparer','Vérifier','Recevoir']};
const db={mission:{id:mission,version:1,state:'in_progress',next_action:'Suite',stopped:false,
  scope:'memory',contract_version:'1.1',skill_version:'1.0',expires_at:'2099-01-01T00:00:00Z',checkpoint:null},
  budget:{max_units:100,max_calls:100,used_units:0,calls:0},operations:[],operations_truncated:false,
  capabilities:{checkpoint:1,checkpoint_write:true}};
let controles=0,writes=0,loseNext=false,conflictNext=false,writeHold=null,writeStarted=false;
const receipts=new Map();
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM||chromium.executablePath()});
const check=(name,value)=>{assert.ok(value,name);controles++;console.log('OK '+name);};
const response=(route,data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(status===200?{ok:true,data}:{ok:false,error:'Refus fixture'})});
async function fixture(options={}){
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],outside=[];
 let answer=async()=>({reponse:'Suite conservée.'});
 page.on('pageerror',e=>errors.push(String(e)));
 await page.route('**/*',route=>{
  const u=new URL(route.request().url());
  if(u.origin!==BASE){outside.push(u.href);return route.abort();}
  if(u.pathname.startsWith('/api/')){outside.push(u.pathname);return route.abort();}
  return route.continue();
 });
 await page.route(BASE+'/__leo_continuite_fixture__',route=>route.fulfill({contentType:'text/html',body:
  '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/css/leo.css"><body>'+entry+dialog+
  '<script src="/js/leo-registre-client.js"></script><script src="/js/leo-registre-ui.js"></script><script src="/js/leo-accueil.js"></script></body></html>'}));
 await page.route(BASE+'/api/leo',async route=>response(route,await answer(route.request().postDataJSON())));
 await page.route(BASE+'/api/leo-registre**',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(req.method()==='GET'){
   if(u.searchParams.get('list')==='missions')return response(route,{missions:[{id:mission,label:'Suite',state:'in_progress',
     stopped:false,expires_at:'2099-01-01T00:00:00Z',updated_at:'2026-10-25T12:00:00Z'}],truncated:false});
   if(u.searchParams.has('operation_id'))return response(route,{mission_id:mission,operation:receipts.get(u.searchParams.get('operation_id'))||null});
   const state=structuredClone(db);if(options.legacy){delete state.capabilities;delete state.mission.checkpoint;}
   return response(route,state);
  }
  writes++;writeStarted=true;
  const body=req.postDataJSON();
  assert.equal(body.mission,mission);assert.equal(body.action,'write_memory');
  if(writeHold)await writeHold;
  if(conflictNext){conflictNext=false;db.mission.version++;return response(route,null,409);}
  if(body.expected_version!==db.mission.version)return response(route,null,409);
  const patch=body.patch;
  assert.ok(patch.checkpoint&&patch.checkpoint_command,'écriture structurée explicite');
  if(patch.checkpoint_command.kind==='adopt')assert.equal(db.mission.checkpoint,null);
  else assert.equal(patch.checkpoint_command.expected_task_id,db.mission.checkpoint.task_id);
  db.mission.checkpoint=structuredClone(patch.checkpoint);db.mission.version++;
  db.budget.used_units++;db.budget.calls++;
  const receipt={operation_id:body.operation_id,status:'completed',result:{mission_version:db.mission.version,
   state:db.mission.state,next_action:db.mission.next_action,checkpoint:structuredClone(patch.checkpoint),checkpoint_command:structuredClone(patch.checkpoint_command)}};
  receipts.set(body.operation_id,receipt);
  // Reçu volontairement absent de la liste : éprouve la recherche ciblée après perte.
  if(loseNext){loseNext=false;return route.abort('failed');}
  return response(route,receipt);
 });
 await page.goto(BASE+'/__leo_continuite_fixture__');
 await page.evaluate(({owner})=>{
  window.UltimaLeoRegistreUI.poserSession({user:{id:owner},access_token:'fixture-token'});
 },{owner});
 async function settle(){await page.waitForFunction(()=>!document.querySelector('.leo-voix-champ').disabled&&!document.querySelector('.leo-bulle-attente')&&!window.UltimaLeoRegistreUI.snapshot()?.busy);}
 async function send(text,wait=true){await page.locator('.leo-voix-champ').fill(text);await page.locator('.leo-voix-envoyer').click();if(wait)await settle();}
 async function load(){
  await page.locator('#leo-mission-ouvrir').click();
  await page.waitForFunction(()=>!document.getElementById('leo-mission-choix').disabled);
  await page.locator('#leo-mission-choix').selectOption(mission);
  await page.locator('#leo-mission-selectionner').click();
  await page.waitForFunction(()=>!!window.UltimaLeoRegistreUI.snapshot()?.data);
  await page.locator('#leo-mission-fermer').click();
  // Parcours réel : consulter la mission AVANT d'ouvrir le cartouche modal,
  // sans clic forcé sur une commande masquée derrière son voile.
  await page.evaluate(()=>window.UltimaLeo.accueillirQuadrant({quadrant:'riven',forcer:true,sansPropositions:true,salutation:'Recette continuité',sections:[],voix:{quadrant:'riven',jeton:'fixture-token'}}));
  await page.locator('.leo-voix-champ').waitFor();
 }
 async function link(){await page.locator('.leo-suivi-memoire').click();await page.waitForFunction(()=>/Suivi enregistré|Mission liée/.test(document.querySelector('.leo-suivi-source')?.textContent||''));}
 async function reread(){await page.locator('.leo-suivi-memoire').click();await page.waitForFunction(()=>!window.UltimaLeoRegistreUI.snapshot()?.busy&&!window.UltimaLeoRegistreUI.snapshot()?.uncertain&&!window.UltimaLeoRegistreUI.snapshot()?.needsRefresh);await settle();}
 async function close(){check('Aucun appel externe',outside.length===0);check('Aucune erreur JS',errors.length===0);await page.close();}
 return {page,send,load,link,reread,settle,close,answer:f=>{answer=f;}};
}
try{
 const a=await fixture();await a.load();
 check('Commande de reprise utilisable au doigt',await a.page.locator('.leo-suivi-memoire').evaluate(b=>b.getBoundingClientRect().height>=44));
 check('Consulter seul ne restaure pas implicitement le suivi',await a.page.locator('.leo-suivi-tache progress').count()===0);
 await a.link();
 check('Mission vide liée sans annoncer un plan sauvegardé',await a.page.locator('.leo-suivi-source').textContent()==='Mission liée — aucun plan enregistré pour le moment.');
 a.answer(async()=>({reponse:'Plan proposé.',interaction:{plan:PLAN}}));await a.send('Cadre ce chantier');
 check('Proposition seule sans écriture',writes===0&&db.mission.checkpoint===null);
 await a.page.locator('.leo-suivi-adopter').click();await a.settle();
 check('Adoption persistée dans la mission explicitement liée',writes===1&&db.mission.checkpoint.titre===PLAN.titre);
 const stableTask=db.mission.checkpoint.task_id;
 let release;writeStarted=false;writeHold=new Promise(r=>{release=r;});
 a.answer(async()=>({reponse:'Piste notée.',interaction:{focus:{numero:1,texte:'Gain confirmé un'}}}));await a.send('Une autre piste',false);
 await a.page.waitForFunction(()=>document.querySelector('.leo-suivi-source')?.textContent.includes('Enregistrement'));
 check('Rappel non affiché pendant le CAS en attente',await a.page.getByText('Gain confirmé un',{exact:true}).count()===0&&db.mission.checkpoint.rappels===0);
 writeHold=null;release();await a.settle();
 check('Rappel affiché après persistance',db.mission.checkpoint.rappels===1&&await a.page.getByText('Gain confirmé un',{exact:true}).count()===1);
 for(const n of [2,3]){a.answer(async()=>({reponse:'Piste notée.',interaction:{focus:{numero:n,texte:'Gain confirmé '+n}}}));await a.send('Piste '+n);}
 check('Deux rappels maximum persistés',db.mission.checkpoint.rappels===2&&await a.page.getByText('Gain confirmé 3',{exact:true}).count()===0);
 await a.send('étape 1 terminée');check('Jalon sauvegardé',db.mission.checkpoint.confirmes.join(',')==='0');
 a.answer(async()=>({reponse:'Priorité suivie.'}));await a.send('Urgence : autre priorité');
 check('Pause persistée sans reset',db.mission.checkpoint.etat==='suspendue'&&db.mission.checkpoint.rappels===2);
 await a.send('reprenons');check('Reprise conserve identité et compteur',db.mission.checkpoint.etat==='en_cours'&&db.mission.checkpoint.task_id===stableTask&&db.mission.checkpoint.rappels===2);
 a.answer(async()=>({reponse:'Autre tâche proposée.',interaction:{plan:{titre:'Autre résultat',etapes:['Cadrer','Recevoir']}}}));
 await a.send('Nouvelle tâche : autre résultat');await a.page.locator('.leo-suivi-adopter').click();
 check('Nouvelle tâche durable refusée sans reset',db.mission.checkpoint.task_id===stableTask&&db.mission.checkpoint.rappels===2&&db.mission.checkpoint.titre===PLAN.titre);
 a.answer(async()=>({reponse:'On reprend.'}));await a.send('reprenons');
 await a.close();
 const b=await fixture();await b.load();check('Nouvelle page attend liaison explicite',await b.page.locator('.leo-suivi-tache progress').count()===0);
 await b.link();check('Reprise autre page conserve confirmations et rappels',await b.page.locator('.leo-suivi-tache progress').evaluate(p=>p.value)===1&&db.mission.checkpoint.rappels===2);
 const beforeLoss=writes;loseNext=true;await b.send('étape 2 terminée');
 check('Réponse perdue : suivi local non confirmé',await b.page.locator('.leo-suivi-tache progress').evaluate(p=>p.value)===1&&writes===beforeLoss+1);
 await b.reread();check('Reçu relu sans POST rejoué',writes===beforeLoss+1&&await b.page.locator('.leo-suivi-tache progress').evaluate(p=>p.value)===2);
 conflictNext=true;await b.send('étape 3 terminée');
 check('Conflit CAS sans jalon optimiste',await b.page.locator('.leo-suivi-tache progress').evaluate(p=>p.value)===2&&db.mission.checkpoint.confirmes.length===2);
 await b.reread();
 let finish;const held=new Promise(r=>{finish=r;});b.answer(async()=>{await held;return {reponse:'Réponse ancienne privée',interaction:{plan:{titre:'Ancien compte privé',etapes:['Secret']}}};});
 await b.send('Question avant changement de compte',false);await b.page.locator('.leo-bulle-attente').waitFor();
 await b.page.evaluate(other=>window.UltimaLeoRegistreUI.poserSession({user:{id:other},access_token:'other-fixture-token'}),other);
 const staleResponse=b.page.waitForResponse(r=>new URL(r.url()).pathname==='/api/leo');
 finish();await staleResponse;await b.page.waitForFunction(()=>!document.querySelector('.leo-bulle-attente'));
 check('Ancien cartouche révoqué après changement de compte',await b.page.locator('.leo-voix-champ').isDisabled());
 check('Changement de compte efface suivi et ancienne réponse',await b.page.locator('.leo-suivi-tache progress').count()===0&&await b.page.getByText('Réponse ancienne privée',{exact:true}).count()===0&&await b.page.getByText('Ancien compte privé',{exact:false}).count()===0);
 await b.close();
 const c=await fixture({legacy:true});await c.load();
 check('Ancienne capacité : liaison durable désactivée',await c.page.locator('.leo-suivi-memoire').isDisabled());
 const beforeLocal=writes;c.answer(async()=>({reponse:'Plan local.',interaction:{plan:PLAN}}));await c.send('Prépare le plan local');
 await c.page.locator('.leo-suivi-adopter').click();await c.settle();
 check('Ancien registre : adoption locale sans POST checkpoint',writes===beforeLocal&&await c.page.locator('.leo-suivi-tache progress').count()===1);
 await c.page.evaluate(other=>window.UltimaLeoRegistreUI.poserSession({user:{id:other},access_token:'other-fixture-token'}),other);
 check('Changement de compte efface aussi le plan local',await c.page.locator('.leo-suivi-tache progress').count()===0&&await c.page.locator('.leo-suivi-adopter').count()===0&&await c.page.locator('.leo-voix-champ').isDisabled());
 await c.close();
 // Nouvelle instance de fixture, aucun reset produit : reprendre un backend vide.
 db.mission.checkpoint=null;db.mission.version++;receipts.clear();
 const d=await fixture();await d.load();await d.link();
 d.answer(async()=>({reponse:'Plan de course.',interaction:{plan:PLAN}}));await d.send('Cadre cette fixture');
 await d.page.locator('.leo-suivi-adopter').click();await d.settle();
 let releaseFocus;writeStarted=false;writeHold=new Promise(r=>{releaseFocus=r;});
 await d.page.evaluate(()=>{const original=window.UltimaLeoRegistreUI.checkpoint;window.__checkpointSettled=false;window.UltimaLeoRegistreUI.checkpoint=async function(...args){try{return await original.apply(this,args);}finally{window.__checkpointSettled=true;}};});
 d.answer(async()=>({reponse:'Ancienne piste avant CAS.',interaction:{focus:{numero:1,texte:'Ancien focus confidentiel'},plan:{titre:'Ancien plan confidentiel',etapes:['Ancienne étape']}}}));
 await d.send('Piste en cours de sauvegarde',false);
 await d.page.waitForFunction(()=>document.querySelector('.leo-suivi-source')?.textContent.includes('Enregistrement'));
 check('Course focus : aucune bulle avant confirmation du POST',await d.page.getByText('Ancien focus confidentiel',{exact:true}).count()===0);
 await d.page.evaluate(other=>window.UltimaLeoRegistreUI.poserSession({user:{id:other},access_token:'other-fixture-token'}),other);
 writeHold=null;releaseFocus();
 await d.page.waitForFunction(()=>window.__checkpointSettled&&!document.querySelector('.leo-bulle-attente'));
 check('Course focus : compte changé ne récupère ni focus ni plan ancien',await d.page.getByText('Ancien focus confidentiel',{exact:true}).count()===0&&await d.page.getByText('Ancien plan confidentiel',{exact:false}).count()===0&&await d.page.locator('.leo-suivi-tache progress').count()===0);
 await d.close();console.log(`${controles}/${controles} contrôles continuité sur HTTP fictif ; droits SQL et multi-connexion restent à éprouver séparément.`);
}finally{await browser.close();}
