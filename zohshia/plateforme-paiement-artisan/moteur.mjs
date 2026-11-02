/** Socle sans réseau, compte, identifiant d'instance ni taux commercial. */
function cents(v,nom){if(!Number.isSafeInteger(v)||v<0)throw Error(`${nom} invalide.`);return v;}
export function ventiler({mode,totalCents,recuAvantCents,montantCents,commissionDueCents,commissionPreleveeCents}){
 if(!['virement_direct','plateforme'].includes(mode))throw Error('Mode inconnu.');
 for(const [nom,v] of Object.entries({totalCents,recuAvantCents,montantCents,commissionDueCents,commissionPreleveeCents}))cents(v,nom);
 if(totalCents===0||montantCents===0||recuAvantCents>totalCents||montantCents>totalCents-recuAvantCents||commissionDueCents>totalCents||commissionPreleveeCents>commissionDueCents)throw Error('Montants incohérents.');
 const due=commissionDueCents-commissionPreleveeCents;
 const commission=mode==='plateforme'?Math.min(due,montantCents):0;
 return {commissionCents:commission,artisanCents:montantCents-commission,commissionRestanteCents:due-commission,resteClientCents:totalCents-recuAvantCents-montantCents};
}
export async function ouvrirPaiement(){throw Error('Socle vierge : aucun adaptateur de paiement activé.');}
