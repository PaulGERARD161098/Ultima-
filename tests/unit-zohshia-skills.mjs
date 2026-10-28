import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, cpSync, appendFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { validerCatalogue, documents, racine } from '../zohshia/skills-github/collecter.mjs';
import { construire } from '../zohshia/publier.mjs';
import { decrireStockZoh } from '../api/_lib/leo-zohshia.mjs';
const lire = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const catalogue = JSON.parse(lire('zohshia/skills-github/catalogue.json'));
validerCatalogue(catalogue, racine);
assert.ok(catalogue.skills.length >= 13, 'couverture antérieure conservée');
const ids = new Set(catalogue.skills.map(s => s.id));
for (const id of ['emails','copy-editing','email-writer','composition-editoriale','pitch-source','discourse-theme-authoring','discourse-block-authoring','community-marketing']) assert.ok(ids.has(id), id);
for (const [nom, contenu] of Object.entries(documents(catalogue))) assert.equal(lire('zohshia/skills-github/' + nom), contenu, nom + ' doit venir du registre');
for (const id of ['emails','copy-editing','email-writer']) {
 const s = catalogue.skills.find(s => s.id === id);
 assert.equal(s.installation.work, 'installe_verifie');
 assert.equal(s.installation.ultima, 'present_dans_source');
 assert.match(lire('.claude/skills/' + id + '/LICENSE.txt'), /MIT License/);
 const p = JSON.parse(lire('.claude/skills/' + id + '/references/provenance.json'));
 assert.equal(p.commit, s.sources[0].commit);
 assert.ok(p.files.length >= 4);
 assert.equal(createHash('sha256').update(lire('.claude/skills/' + id + '/SKILL.md')).digest('hex'), s.preuve_work.sha256);
}
const stock = construire();
const b = stock.technos.find(t => t.id === 'skills-github');
assert.ok(b);
assert.equal(b.onglets.length, 4);
assert.ok(b.onglets.every(o => o.blocs.length >= 3));
const projection = JSON.parse(decrireStockZoh(stock));
assert.equal(projection.couverture, 'complete');
assert.ok(projection.technos.some(t => t.id === 'skills-github'));
assert.equal(projection.technos.length, stock.technos.length);
assert.ok(projection.technos.find(t => t.id === 'skills-github').capacites_apercu.texte.includes('email-writer'));
assert.ok(lire('.claude/skills/zohshia/SKILL.md').includes('skills-github/CATALOGUE.md'));
const refuse = (modifier, attendu) => {
 const copie = structuredClone(catalogue);
 modifier(copie);
 assert.throws(() => validerCatalogue(copie, racine), attendu);
};
refuse(c => { c.skills = []; }, /incomplet/);
refuse(c => { c.skills.push(structuredClone(c.skills[0])); }, /dupliqué/);
refuse(c => { delete c.skills[0].preuve_work; }, /sans preuve/);
refuse(c => { c.skills[0].installation.work = 'actif_parce_que_lu'; }, /Statut/);
refuse(c => { c.skills[0].preuve_ultima.sha256 = '0'.repeat(64); }, /périmée/);
refuse(c => { c.skills[0].preuve_ultima.path = '../../secret'; }, /Chemin/);
refuse(c => { c.skills[0].sources[0].commit = 'main'; }, /Source/);
refuse(c => { c.pistes[0].statut = 'installe'; }, /Piste/);
refuse(c => { c.skills[0].invocation = 'fais ceci'; }, /Invocation/);
const fixture = mkdtempSync(join(tmpdir(), 'skills-catalogue-test-'));
try {
 cpSync(join(racine, '.claude/skills'), join(fixture, '.claude/skills'), {recursive:true});
 validerCatalogue(catalogue, fixture);
 const reference = join(fixture, '.claude/skills/emails/references/upstream/references/copy-guidelines.md');
 appendFileSync(reference, '\n');
 assert.throws(() => validerCatalogue(catalogue, fixture), /Source amont périmée/);
 rmSync(reference);
 assert.throws(() => validerCatalogue(catalogue, fixture), /ENOENT/);
} finally { rmSync(fixture, {recursive:true, force:true}); }
console.log('UNIT-ZOHSHIA-SKILLS OK : registre, fiches, copies, sources, projection et onze refus connus');

