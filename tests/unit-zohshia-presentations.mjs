// Contrat d'intégration neutre ; le rendu et les refus réels sont éprouvés
// séparément par outils/presentations-claires/verifier.py, avec ses dépendances.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { construire } from '../zohshia/publier.mjs';
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const theme = JSON.parse(read('zohshia/presentations-claires/assets/theme.json'));
const exemple = JSON.parse(read('zohshia/presentations-claires/assets/exemple.json'));
const b = construire().technos.find((t) => t.id === 'presentations-claires');
assert.ok(b && b.onglets.length === 3 && b.onglets.every((o) => o.blocs.length >= 3));
assert.equal(theme.page.width / theme.page.height, 16 / 9);
assert.equal(exemple.slides.length, 10);
assert.equal(new Set(exemple.slides.map((s) => s.layout)).size, 10);
assert.ok(exemple.slides.every((s) => s.source && s.titre && s.section));
assert.match(exemple.mention, /FICTIVE/);
const skill = read('.claude/skills/presentations-claires/SKILL.md');
for (const required of ['zohshia/presentations-claires/', 'Contradicteur', 'PDF', 'SVG', 'source, date, périmètre']) assert.ok(skill.includes(required), required);
const guide = read('zohshia/presentations-claires/MISE-EN-SERVICE.md');
assert.match(guide, /session propriétaire/);
assert.match(guide, /dossier.*neuf/);
assert.match(read('.claude/skills/zohshia/SKILL.md'), /presentations-claires/);
console.log('UNIT-ZOHSHIA-PRESENTATIONS OK : badge, dix compositions, contrat et invocation');
