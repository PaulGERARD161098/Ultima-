// Logique pure de l'INTENDANT (AD-5c-γ) : calcul serveur des alertes J-2.
// Zéro I/O, zéro dépendance — importable tel quel par l'API et par le harnais
// patrimoine (tests/unit-intendant-api.mjs). L'état des besoins n'est JAMAIS
// recalculé ici : il est lu tel que la base l'a dérivé (colonne générée `etat`,
// unique source de vérité, cf. 0008_intendant.sql). On ne fait qu'agréger.

// Date du jour au format ISO AAAA-MM-JJ (UTC). Vercel tourne en UTC ; l'écart
// possible d'un jour autour de minuit heure de Paris est négligeable pour une
// alerte à 2 jours (limite assumée en v1, cf. rapport).
export function todayIsoUtc(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

// Convertit une date ISO AAAA-MM-JJ en nombre de jours epoch UTC (comparaison
// jour-à-jour sans dérive d'heure/fuseau).
function isoToUtcDays(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

// Alerte J-2 = les chantiers dont la pose approche (date_pose ∈ [today, today+2])
// ET qui portent au moins un besoin `manquant`. La métrique « manquants détectés
// à J-2 » (preuve de valeur, prémortem) se lit sur le champ `manquants`.
// Entrées : chantiers [{ id, node_id, date_pose }], besoins [{ chantier_id, etat }].
// Sortie : [{ chantier_id, node_id, date_pose, manquants }] (manquants ≥ 1).
export function computeAlertesJ2(chantiers, besoins, todayIso = todayIsoUtc()) {
  const manquantsParChantier = new Map();
  for (const b of besoins || []) {
    if (b && b.etat === 'manquant') {
      manquantsParChantier.set(b.chantier_id, (manquantsParChantier.get(b.chantier_id) || 0) + 1);
    }
  }

  const today = isoToUtcDays(todayIso);
  const alertes = [];
  for (const c of chantiers || []) {
    if (!c || !c.date_pose) continue; // pose non renseignée → jamais d'alerte
    const diff = isoToUtcDays(c.date_pose) - today;
    if (diff < 0 || diff > 2) continue; // hors fenêtre [today, today+2]
    const manquants = manquantsParChantier.get(c.id) || 0;
    if (manquants < 1) continue; // couvert → pas d'alerte
    alertes.push({ chantier_id: c.id, node_id: c.node_id, date_pose: c.date_pose, manquants });
  }
  return alertes;
}
