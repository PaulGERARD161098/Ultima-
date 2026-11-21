import { NOEUDS } from "./registre-lv3.mjs";
import { BLASONS } from "./blasons.mjs";
const projectSource =
  "https://github.com/PaulGERARD161098/Ultima-/blob/main/js/registre-lv3.mjs";
export const projects = Object.fromEntries(
  Object.entries(NOEUDS).map(([id, n]) => [
    id,
    {
      name: n.nom,
      kids: n.enfants || [],
      icon: BLASONS[n.blason] || "",
      summary: n.resume || n.invite,
      state: n.etat || "",
      source: "Registre Ultima",
      url: projectSource,
    },
  ]),
);
projects["renoboost-ia"] = {
  ...projects["renoboost-ia"],
  name: "RénoBoost IA",
  kids: ["rb", "rd", "rp"],
};
projects.rb = {
  name: "RB",
  kids: [],
  icon: '<svg viewBox="0 0 24 24"><g fill="none" stroke="#e8bf83" stroke-width="1.8" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></g></svg>',
  summary:
    "Acquisition de chantiers, rendez-vous confirmés et suivi commercial.",
  state: "En cours",
  date: "2026-10-22",
  milestone: "Jalon 0 — l'amorçage : trois gestes de Paul, zéro ligne de code",
  source: "Finubar · RenoBoost",
  url: "https://github.com/PaulGERARD161098/RenoBoost/blob/main/FINUBAR.md",
};
projects.rd = {
  name: "RD",
  kids: [],
  icon: '<svg viewBox="0 0 24 24"><g fill="none" stroke="#e8bf83" stroke-width="1.8" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></g></svg>',
  summary:
    "Création des devis, suivi des dossiers, bibliothèque de mails et statistiques.",
  state: "En cours",
  date: "2026-11-17",
  milestone: "Jalon 1 boucle A — le premier euro encaissé",
  source: "Finubar · RenoDevis",
  url: "https://github.com/PaulGERARD161098/RenoDevis/blob/main/FINUBAR.md",
};
projects.rp = {
  name: "RenoPredict",
  kids: [],
  icon: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#263749"/><text x="16" y="20" fill="#e8bf83" font-family="sans-serif" font-size="12" text-anchor="middle">RP</text></svg>',
  summary:
    "Suivi des installations à partir du QR code de pose et préparation du contrat d’entretien Ripair.",
  state: "En attente de Paul",
  date: "2026-11-11",
  milestone: "Jalon 1 boucle B — le premier contrat Ripair",
  source: "Finubar · RenoPredict",
  url: "https://github.com/PaulGERARD161098/RenoPredict/blob/main/FINUBAR.md",
};
const rdSections = [
  ["rd-creer", "Créer un devis", "Préparer un nouveau devis."],
  ["rd-suivi", "Suivi", "Retrouver les dossiers et leur suivi."],
  ["rd-mails", "Mails", "Consulter la bibliothèque de mails."],
  ["rd-stats", "Statistiques", "Consulter les indicateurs de RénoDevis."],
];
projects.rd.kids = rdSections.map((s) => s[0]);
for (const [id, name, summary] of rdSections) {
  projects[id] = {
    name,
    summary,
    kids: [],
    icon: projects.rd.icon,
    state: "Rubrique RénoDevis",
    source: "Entrées de RénoDevis",
    url: "https://github.com/PaulGERARD161098/RenoDevis/blob/main/lib/arrivee.ts",
  };
}

export const parents = Object.fromEntries(
  Object.entries(projects).flatMap(([parent, n]) =>
    n.kids.map((child) => [child, parent]),
  ),
);
export function route(id) {
  const result = [];
  for (
    let current = id;
    current && current !== "racine";
    current = parents[current]
  )
    result.unshift(current);
  return result;
}
export function contextFor(id) {
  if (!Object.hasOwn(projects, id)) return null;
  const path = route(id);
  const product = path.find((key) => ["rb", "rd", "rp"].includes(key));
  return {
    repository:
      "PaulGERARD161098/" +
      ({ rb: "RenoBoost", rd: "RenoDevis", rp: "RenoPredict" }[product] ||
        "Ultima-"),
    path: path.map((key) => projects[key].name).join(" › "),
  };
}
