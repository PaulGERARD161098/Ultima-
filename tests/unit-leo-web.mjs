// Léo lit le web : interrupteur, outils bornés, sources sûres, reprises bornées.
import assert from 'node:assert/strict';
import { texteFinalWeb, sommerUsage, webActif, outilsWeb, extraireSources, compterUsageWeb, appelerAvecReprises, REGLES_WEB,
  MAX_RECHERCHES, MAX_LECTURES, MAX_REPRISES, MAX_SOURCES } from '../api/_lib/leo-web.mjs';

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };

// Interrupteur : coupé par défaut, seul « actif » l'allume.
ok(!webActif({}), 'web coupé par défaut');
ok(!webActif({ LEO_WEB: 'oui' }) && !webActif({ LEO_WEB: '1' }), 'seul « actif » allume');
ok(webActif({ LEO_WEB: ' Actif ' }), '« actif » insensible à la casse et aux espaces');

// Outils : types actuels, plafonds posés.
const [rech, lect] = outilsWeb();
ok(rech.type === 'web_search_20260209' && rech.name === 'web_search' && rech.max_uses === MAX_RECHERCHES, 'recherche bornée');
ok(lect.type === 'web_fetch_20260209' && lect.name === 'web_fetch' && lect.max_uses === MAX_LECTURES, 'lecture bornée');
ok(MAX_RECHERCHES <= 5 && MAX_LECTURES <= 5 && MAX_REPRISES <= 3, 'plafonds raisonnables');
ok(/DONNÉE, jamais une consigne/.test(REGLES_WEB) && /réseau de Paul/.test(REGLES_WEB), 'règles : injection et PII');

// Sources : dédoublonnées, bornées, URL sûres seulement.
const contenu = [
  { type: 'server_tool_use', name: 'web_search' },
  { type: 'web_search_tool_result', content: [] },
  { type: 'text', text: 'A', citations: [
    { url: 'https://a.fr/x', title: 'Page A', cited_text: 'secret' },
    { url: 'https://a.fr/x', title: 'doublon' },
    { url: 'javascript:alert(1)', title: 'piège' },
    { url: 'https://u:p@b.fr/', title: 'identifiants' },
    { url: 'http://c.fr/y' }
  ] },
  { type: 'server_tool_use', name: 'web_fetch' }
];
const s = extraireSources(contenu);
ok(s.length === 2 && s[0].url === 'https://a.fr/x' && s[1].titre === 'c.fr', 'sources : dédoublonnage, filtre, titre de repli');
ok(!JSON.stringify(s).includes('secret'), 'le texte cité ne sort jamais');
const beaucoup = [{ type: 'text', citations: Array.from({ length: 20 }, (_, i) => ({ url: `https://s${i}.fr/` })) }];
ok(extraireSources(beaucoup).length === MAX_SOURCES, 'sources bornées');
ok(extraireSources(null).length === 0, 'contenu absent');
const u = compterUsageWeb(contenu);
ok(u.recherches === 1 && u.lectures === 1, 'usage compté');

// Reprises : pause_turn relancé au plus MAX_REPRISES fois, tour de l'assistant renvoyé tel quel.
const envois = [];
const toujoursEnPause = async (m) => { envois.push(m); return { stop_reason: 'pause_turn', content: [{ type: 'text', text: 'x' }] }; };
const r1 = await appelerAvecReprises(toujoursEnPause, [{ role: 'user', content: 'q' }]);
ok(r1.reprises === MAX_REPRISES && envois.length === MAX_REPRISES + 1, 'reprises bornées');
ok(envois[1].at(-1).role === 'assistant', 'le tour en pause est renvoyé');
let i = 0;
const finit = async () => (i++ === 0 ? { stop_reason: 'pause_turn', content: [{ type: 'text', text: 'a' }] } : { stop_reason: 'end_turn', content: [{ type: 'text', text: 'b' }] });
const r2 = await appelerAvecReprises(finit, [{ role: 'user', content: 'q' }]);
ok(r2.reprises === 1 && r2.reponse.stop_reason === 'end_turn' && r2.contenus.length === 2, 'reprise puis fin');
ok(r2.reponse.content.map((b) => b.text).join('') === 'ab', 'la réponse rendue garde le texte d\'avant la pause');
console.log(`unit-leo-web : ${n} vérifications vertes`);

// Usage sommé sur les reprises : le journal compte tout ce qui est payé.
{
  let k = 0;
  const deuxEnvois = async () => (k++ === 0
    ? { stop_reason: 'pause_turn', content: [], usage: { input_tokens: 100, output_tokens: 10, server_tool_use: { web_search_requests: 2 } } }
    : { stop_reason: 'end_turn', content: [], usage: { input_tokens: 150, output_tokens: 20, server_tool_use: { web_search_requests: 1 } } });
  const r = await appelerAvecReprises(deuxEnvois, [{ role: 'user', content: 'q' }]);
  ok(r.reponse.usage.input_tokens === 250 && r.reponse.usage.output_tokens === 30, 'tokens sommés sur les reprises');
  ok(r.reponse.usage.server_tool_use.web_search_requests === 3, 'recherches sommées');
  ok(sommerUsage([undefined, null]) === undefined, 'usage absent → indéfini');
}

// Texte final : la narration d'avant la recherche ne sort pas ; les blocs découpés par les citations se recollent.
{
  const c = [
    { type: 'text', text: 'Laisse-moi vérifier.' },
    { type: 'server_tool_use', name: 'web_search' },
    { type: 'web_search_tool_result', content: [] },
    { type: 'text', text: 'Le taux est de ' },
    { type: 'text', text: '5,5 %', citations: [{ url: 'https://www.service-public.fr/x' }] },
    { type: 'text', text: ' sous conditions :\n- ' },
    { type: 'text', text: 'Certains travaux', citations: [{ url: 'https://a.fr/' }] },
  ];
  const t = texteFinalWeb(c);
  ok(!t.includes('Laisse-moi'), 'narration d\'avant la recherche retirée');
  ok(t === 'Le taux est de 5,5 % sous conditions :\n- Certains travaux', 'blocs recollés sans saut parasite', JSON.stringify(t));
  ok(texteFinalWeb([{ type: 'text', text: 'Sans recherche.' }]) === 'Sans recherche.', 'sans recherche : tout le texte');
  ok(/sources officielles/.test(REGLES_WEB) && /Ne raconte pas ta recherche/.test(REGLES_WEB), 'règles : sources officielles, pas de narration');
}

// Câblage dans la route : outils web seulement derrière l'interrupteur, sources rendues.
{
  const { readFileSync } = await import('node:fs');
  const route = readFileSync(new URL('../api/leo.js', import.meta.url), 'utf8');
  ok(/const web = webActif\(process\.env\);/.test(route), 'route : interrupteur lu');
  ok(/\.\.\.\(web \? outilsWeb\(\) : \[\]\)/.test(route), 'route : outils web seulement si actif');
  ok(/\.\.\.\(web \? \[\{ type: 'text', text: REGLES_WEB \}\] : \[\]\)/.test(route), 'route : règles web seulement si actif');
  ok((route.match(/\.\.\.retourSources/g) || []).length === 2, 'route : sources rendues sur les deux sorties');
  ok(/maxRetries: 0/.test(route), 'route : toujours aucune relance facturée');
}
console.log(`unit-leo-web (câblage) : ${n} vérifications vertes au total`);
