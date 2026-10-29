import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {collecter} from '../zohshia/diligence-correspondance/collecter.mjs';
const dir=mkdtempSync(join(tmpdir(),'diligence-'));
const git=(...args)=>execFileSync('git',['-C',dir,...args],{encoding:'utf8',env:{PATH:process.env.PATH,HOME:'/nonexistent',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null'}}).trim();
try{
 git('init','-q');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');
 mkdirSync(join(dir,'lib'));
 const fichiers=['lib/diligenceCorrespondance.ts','lib/diligenceCorrespondance.test.ts'].map(chemin=>{
  const contenu='// Code neutre de contrôle fictif.\n'.repeat(12)+'export const fixture=true;\n';
  writeFileSync(join(dir,chemin),contenu);return {chemin,sha256:createHash('sha256').update(contenu).digest('hex')};
 });
 git('add','.');git('commit','-qm','fixture');const manifeste={commit:git('rev-parse','HEAD'),fichiers};
 const sortie=join(dir,'extrait'),r=collecter({depot:dir,manifeste,sortie});
 assert.equal(r.extrait,true);assert.equal(r.fichiers.length,2);assert.ok(readFileSync(join(sortie,'diligenceCorrespondance.ts'),'utf8').length>200);
 assert.throws(()=>collecter({depot:dir,manifeste,sortie}),/neuf/);
 assert.throws(()=>collecter({depot:dir,manifeste:{...manifeste,commit:''}}),/versionnée/);
 assert.throws(()=>collecter({depot:dir,manifeste:{...manifeste,fichiers:[fichiers[0]]}}),/deux fichiers/);
 assert.throws(()=>collecter({depot:dir,manifeste:{...manifeste,fichiers:[{...fichiers[0],chemin:'../secret'},fichiers[1]]}}),/invalide/);
 assert.throws(()=>collecter({depot:dir,manifeste:{...manifeste,fichiers:[{...fichiers[0],sha256:'0'.repeat(64)},fichiers[1]]}}),/Empreinte/);
 const intrus='// code fictif de contrôle\n'.repeat(12)+"export const contact='fixture@example.invalid';\n";
 writeFileSync(join(dir,fichiers[0].chemin),intrus);git('add','.');git('commit','-qm','intrus');
 const altere={commit:git('rev-parse','HEAD'),fichiers:[{...fichiers[0],sha256:createHash('sha256').update(intrus).digest('hex')},fichiers[1]]};
 assert.throws(()=>collecter({depot:dir,manifeste:altere}),/donnée propre/);
 const guide=readFileSync(new URL('../zohshia/diligence-correspondance/TECHNO.md',import.meta.url),'utf8');
 for(const phrase of ['ne valide ni prix ni signature','zéro','ne constitue jamais une permission'])assert.ok(guide.includes(phrase));
 console.log(JSON.stringify({verdicts:{extractionVersionnee:true,sortieNeuve:true,commitAbsentRefuse:true,nonVacuite:true,cheminIntrusRefuse:true,empreinteAltereeRefusee:true,limitesDocumentees:true,donneeInstanceRefusee:true}}));
}finally{rmSync(dir,{recursive:true,force:true});}
