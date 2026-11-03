import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ventiler,ouvrirPaiement} from './moteur.mjs';
const base={mode:'plateforme',totalCents:1000000,recuAvantCents:0,montantCents:400000,commissionDueCents:100000,commissionPreleveeCents:0};
test('acompte et solde : conservation et aucun second prélèvement',()=>{
 const a=ventiler(base);assert.deepEqual(a,{commissionCents:100000,artisanCents:300000,commissionRestanteCents:0,resteClientCents:600000});
 const s=ventiler({...base,recuAvantCents:400000,montantCents:600000,commissionPreleveeCents:100000});assert.equal(s.commissionCents,0);assert.equal(s.artisanCents,600000);
 assert.equal(a.commissionCents+a.artisanCents+s.artisanCents,base.totalCents);
});
test('virement direct : aucune retenue automatique',()=>{const r=ventiler({...base,mode:'virement_direct'});assert.equal(r.commissionCents,0);assert.equal(r.artisanCents,400000);assert.equal(r.commissionRestanteCents,100000);});
test('petit acompte : reliquat explicite',()=>{const r=ventiler({...base,montantCents:50000});assert.equal(r.commissionCents,50000);assert.equal(r.commissionRestanteCents,50000);});
test('entrées incohérentes refusées',()=>{for(const patch of [{mode:'autre'},{totalCents:null},{montantCents:0},{montantCents:1.2},{montantCents:NaN},{recuAvantCents:-1},{commissionPreleveeCents:100001},{commissionDueCents:1000001},{recuAvantCents:900000}])assert.throws(()=>ventiler({...base,...patch}));});
test('conservation sur montants synthétiques variés',()=>{for(let total=1;total<10000;total+=137){for(const commission of [0,Math.floor(total/10),total]){const r=ventiler({...base,totalCents:total,montantCents:total,commissionDueCents:commission});assert.equal(r.commissionCents+r.artisanCents,total);assert.equal(r.resteClientCents,0);}}});
test('adaptateur externe fermé',async()=>{await assert.rejects(ouvrirPaiement(),/aucun adaptateur/);});
