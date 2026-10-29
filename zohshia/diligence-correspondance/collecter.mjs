// Extraction de deux fichiers neutres depuis un commit vérifié, sans données d'instance.
import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,basename,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {chargerRecette,nomPropreDans} from '../renodevis/neutraliser.mjs';
const ICI=fileURLToPath(new URL('.',import.meta.url));
export function collecter({depot,manifeste,sortie,recette=chargerRecette()}){
 if(!depot||!manifeste||!/^[a-f0-9]{40}$/.test(manifeste.commit)||!Array.isArray(manifeste.fichiers)||manifeste.fichiers.length!==2)throw Error('Source versionnée et deux fichiers requis.');
 const permis=['lib/diligenceCorrespondance.ts','lib/diligenceCorrespondance.test.ts'];
 if(new Set(manifeste.fichiers.map(f=>f.chemin)).size!==2||manifeste.fichiers.some(f=>!permis.includes(f.chemin)||!/^[a-f0-9]{64}$/.test(f.sha256)))throw Error('Manifeste de code neutre invalide.');
 const git=(args)=>execFileSync('git',['-C',resolve(depot),...args],{encoding:'utf8',timeout:10000,maxBuffer:1000000,env:{PATH:process.env.PATH,HOME:'/nonexistent',GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null'}});
 const commit=git(['rev-parse','--verify',manifeste.commit+'^{commit}']).trim();
 if(commit!==manifeste.commit)throw Error('Commit différent de la source annoncée.');
 const fichiers=manifeste.fichiers.map(f=>{
  const contenu=git(['show',commit+':'+f.chemin]);
  if(contenu.length<200||createHash('sha256').update(contenu).digest('hex')!==f.sha256)throw Error('Empreinte du fichier différente.');
  if(nomPropreDans(contenu,recette)||/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/i.test(contenu))throw Error('Le fichier contient une donnée propre à une instance.');
  return {...f,contenu};
 });
 if(sortie){if(existsSync(sortie))throw Error('Le dossier de sortie doit être neuf.');mkdirSync(sortie,{recursive:true});for(const f of fichiers)writeFileSync(join(sortie,basename(f.chemin)),f.contenu,{flag:'wx'});}
 return {commit,fichiers:fichiers.map(({chemin,sha256})=>({chemin,sha256})),portee:'intégrité et neutralité structurelles ; preuves métier non certifiées',extrait:!!sortie};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{const args=process.argv.slice(2),option=(nom)=>{const i=args.indexOf(nom);return i<0?undefined:args[i+1];};
 const manifeste=JSON.parse(readFileSync(join(ICI,'source.json'),'utf8'));
 console.log(JSON.stringify(collecter({depot:option('--depot'),sortie:option('--sortie'),manifeste}),null,2));
 }catch(e){console.error(e.message);process.exitCode=1;}
}
