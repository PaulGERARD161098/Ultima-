import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base='http://127.0.0.1:8123';
const browser=await chromium.launch({executablePath:process.env.PW_CHROMIUM || chromium.executablePath()});
const session={access_token:'audit-token',user:{id:'11111111-1111-4111-8111-111111111111'}};
async function page(){
  const p=await browser.newPage({viewport:{width:390,height:844}});
  await p.route('**/js/vendor/supabase-js-*.js',route=>route.fulfill({contentType:'application/javascript',body:`
    window.supabase={createClient:()=>({auth:{
      getSession:async()=>({data:{session:${JSON.stringify(session)}}}),
      onAuthStateChange(fn){window.auditAuthChange=fn;},
      signOut:async()=>{window.auditAuthChange('SIGNED_OUT',null);return {error:null};}
    }})};`}));
  await p.route('**/api/**',route=>route.fulfill({status:404,contentType:'application/json',body:'{"ok":false}'}));
  return p;
}
try {
  // Les saisies postérieures au clic survivent à la réponse du dépôt précédent.
  const p=await page();let release;let calls=0;
  const pending=new Promise(resolve=>release=resolve);
  await p.route('**/api/imladrik/entrees',async route=>{
    assert.equal(route.request().method(),'POST');calls++;
    await pending;await route.fulfill({contentType:'application/json',body:'{"ok":true,"data":{"id":"saved"}}'});
  });
  await p.goto(base+'/ecrire.html');await p.locator('#ecrire-form').waitFor({state:'visible'});
  await p.locator('#ecrire-contenu').fill('Premier texte');await p.locator('#ecrire-envoyer').click();
  await p.locator('#ecrire-contenu').fill('Nouveau texte pendant l’envoi');
  await p.evaluate(()=>{window.dispatchEvent(new Event('online'));window.dispatchEvent(new Event('online'));});
  release();await p.waitForFunction(()=>document.querySelector('#ecrire-envoyer').disabled===false);
  assert.equal(calls,1);assert.equal(await p.locator('#ecrire-contenu').inputValue(),'Nouveau texte pendant l’envoi');
  assert.equal(await p.evaluate(()=>localStorage.getItem(window.UltimaEcrire.CLE_BROUILLON)),'Nouveau texte pendant l’envoi');
  await p.close();

  // La reprise automatique et le bouton partagent le verrou ; le texte envoyé
  // est retiré du champ pour empêcher un nouveau dépôt involontaire.
  const q=await page();let resume;let replays=0;
  const waiting=new Promise(resolve=>resume=resolve);
  await q.addInitScript((id)=>localStorage.setItem('ultima-maedrethnir-brouillon:'+id,'Texte hors réseau'),session.user.id);
  await q.route('**/api/imladrik/entrees',async route=>{replays++;await waiting;await route.fulfill({contentType:'application/json',body:'{"ok":true}'});});
  await q.goto(base+'/ecrire.html');await q.waitForFunction(()=>document.querySelector('#ecrire-envoyer').disabled);
  await q.evaluate(()=>{window.dispatchEvent(new Event('online'));window.dispatchEvent(new Event('online'));document.querySelector('#ecrire-form').dispatchEvent(new Event('submit',{cancelable:true}));});
  resume();await q.waitForFunction(()=>!document.querySelector('#ecrire-envoyer').disabled);
  assert.equal(replays,1);assert.equal(await q.locator('#ecrire-contenu').inputValue(),'');
  await q.close();

  // Un ancien brouillon sans propriétaire ne part pas vers le compte courant.
  // Une réponse de A arrivant après connexion de B n'efface pas la saisie de B.
  const s=await page();let endOld;let sends=0;
  const oldPending=new Promise(resolve=>endOld=resolve);
  await s.addInitScript(()=>localStorage.setItem('ultima-maedrethnir-brouillon','Ancien texte privé'));
  await s.route('**/api/imladrik/entrees',async route=>{sends++;await oldPending;await route.fulfill({contentType:'application/json',body:'{"ok":true}'});});
  await s.goto(base+'/ecrire.html');await s.locator('#ecrire-form').waitFor({state:'visible'});
  assert.equal(await s.locator('#ecrire-contenu').inputValue(),'');assert.equal(sends,0);
  await s.locator('#ecrire-contenu').fill('Texte du compte A');await s.locator('#ecrire-envoyer').click();
  await s.waitForFunction(()=>document.querySelector('#ecrire-envoyer').disabled);
  await s.evaluate(()=>window.auditAuthChange('SIGNED_OUT',null));
  assert.equal(await s.locator('#ecrire-auth').isVisible(),true);
  assert.equal(await s.locator('#ecrire-contenu').inputValue(),'');
  await s.evaluate(()=>window.auditAuthChange('SIGNED_IN',{access_token:'token-B',user:{id:'22222222-2222-4222-8222-222222222222'}}));
  assert.equal(await s.locator('#ecrire-contenu').inputValue(),'');
  await s.locator('#ecrire-contenu').fill('Texte du compte B');endOld();await s.waitForLoadState('networkidle');
  assert.equal(sends,1);assert.equal(await s.locator('#ecrire-contenu').inputValue(),'Texte du compte B');
  const drafts=await s.evaluate((id)=>({old:localStorage.getItem('ultima-maedrethnir-brouillon'),a:localStorage.getItem('ultima-maedrethnir-brouillon:'+id),b:localStorage.getItem(window.UltimaEcrire.CLE_BROUILLON)}),session.user.id);
  assert.deepEqual(drafts,{old:'Ancien texte privé',a:'Texte du compte A',b:'Texte du compte B'});
  await s.close();

  // Une réponse réseau lancée avant SIGNED_OUT ne repeuple jamais le DOM.
  const r=await page();let finish;let requested;
  const arrived=new Promise(resolve=>requested=resolve);const late=new Promise(resolve=>finish=resolve);
  await r.route('**/api/intendant',route=>route.fulfill({contentType:'application/json',body:'{"ok":true,"data":{"chantiers":[],"besoins":[]}}'}));
  await r.route('**/api/reseau',async route=>{requested();await late;await route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,data:{nodes:[{id:'private-node',nom:'DONNEE_PRIVEE_TARDIVE',type:'artisan',statut:'actif'}],edges:[],journal:[],personnes:[],rattachements:[]}})});});
  await r.goto(base+'/riven.html');await arrived;
  await r.evaluate(()=>window.auditAuthChange('SIGNED_OUT',null));finish();
  await r.waitForLoadState('networkidle');
  assert.equal(await r.locator('#ecran-connexion').isVisible(),true);
  assert.equal((await r.locator('body').textContent()).includes('DONNEE_PRIVEE_TARDIVE'),false);
  await r.close();
  console.log('SMOKE AUDIT OK : bonne route, texte conservé, reprise sans doublon, réponse après déconnexion ignorée');
} finally {await browser.close();}
