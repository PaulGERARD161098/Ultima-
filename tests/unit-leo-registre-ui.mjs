// Client et UI réels ; DOM minimal et transport fictifs, aucun serveur ni SQL.
// Le HTML réel fournit les ancêtres : un bouton dans une section cachée
// ne devient pas cliquable par le seul fait que son disabled vaut false.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const html = source('index.html');
const clientSource = source('js/leo-registre-client.js');
const uiSource = source('js/leo-registre-ui.js');
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const user = '33333333-3333-4333-8333-333333333333';

function fixture() {
  const nodes = new Map(), stack = [];
  const entry = html.match(/<button\b[^>]*id="leo-mission-ouvrir"[^>]*>[\s\S]*?<\/button>/)?.[0];
  assert.ok(entry, 'entrée Mission Léo présente');
  const markup = entry + html.slice(html.indexOf('<dialog id="leo-mission-dialog"'), html.indexOf('</dialog>') + 9);
  assert.ok(markup.length > 1000, 'dialogue réel chargé, non vide');
  for (const match of markup.matchAll(/<(\/)?([a-z][a-z0-9-]*)\b([^>]*)>/gi)) {
    const [, close, tag, attrs] = match;
    if (close) { assert.equal(stack.pop()?.tag, tag); continue; }
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    const node = { tag, parent: stack.at(-1), hidden: /\bhidden\b/.test(attrs),
      disabled: /\bdisabled\b/.test(attrs), value: '', textContent: '', open: tag === 'dialog',
      handlers: {}, attributes: {},
      addEventListener(name, fn) { this.handlers[name] = fn; },
      setAttribute(name, value) { this.attributes[name] = value; },
      showModal() { this.open = true; }, close() { this.open = false; }, reset() {},
    };
    if (id) nodes.set(id, node);
    if (!['input','br','hr'].includes(tag)) stack.push(node);
  }
  assert.equal(stack.length, 0, 'arbre du dialogue complet');
  const el = suffix => nodes.get('leo-mission-' + suffix);
  const visible = node => !!node && !node.hidden && (!node.parent || visible(node.parent));
  const disabled = node => node.disabled || (node.parent && disabled(node.parent));
  const store = new Map(), requests = [];
  let failure = null, held = null;
  const window = { crypto: { randomUUID }, addEventListener() {},
    sessionStorage: { getItem: k => store.get(k) ?? null,
      setItem: (k,v) => store.set(k,v), removeItem: k => store.delete(k) },
    fetch: async (url, init) => {
      requests.push({url, method:init.method});
      assert.equal(init.method, 'GET', 'cette sortie de blocage ne doit jamais écrire');
      if (held) await held;
      if (failure) return {ok:false, status:failure, json:async()=>({ok:false,error:'fixture refusal'})};
      const id = new URL(url, 'https://fixture.invalid').searchParams.get('mission');
      return {ok:true, json:async()=>({ok:true,data:{
        mission:{id,version:1,state:'in_progress',next_action:id===A?'Action A':'Action B',
          stopped:false,scope:'memory',contract_version:'1.1',skill_version:'1.0',expires_at:'2099-01-01T00:00:00Z'},
        budget:{max_units:10,max_calls:10,used_units:0,calls:0}, operations:[],operations_truncated:false,
      }})};
    },
  };
  const document = {readyState:'complete',getElementById:id=>nodes.get(id)};
  new Function('window',clientSource)(window);
  new Function('window','document',uiSource)(window,document);
  window.UltimaLeoRegistreUI.poserSession({user:{id:user},access_token:'fixture-token'});
  async function settle() {
    for (let i=0;i<50;i++) {
      await new Promise(resolve=>setImmediate(resolve));
      if(el('dialog').attributes['aria-busy']==='false') return;
    }
    throw new Error('UI ne termine pas sa requête');
  }
  function trigger(suffix,event) { el(suffix).handlers[event]({preventDefault(){}}); }
  return {el, visible, disabled, requests, trigger, settle,
    fail: status => {failure=status;},
    hold: () => {let release;held=new Promise(resolve=>{release=resolve;});return()=>{held=null;release();};},
    load: async id => {el('id').value=id;trigger('chargement','submit');await settle();},
  };
}

for (const status of [403,503]) {
  const f=fixture(); await f.load(A);
  assert.equal(f.el('action').value,'Action A');
  f.el('action').value='Brouillon A'; f.trigger('edition','input');
  f.fail(status); f.trigger('relire','click'); await f.settle();
  assert.equal(f.visible(f.el('detail')),false,'données inaccessibles toujours masquées');
  const reads=f.requests.length; await f.load(B);
  assert.equal(f.requests.length,reads,'le brouillon bloque le changement avant abandon');
  assert.match(f.el('message').textContent,/brouillon.*conservé/i);
  assert.equal(f.visible(f.el('abandonner')),true,'abandon accessible après échec GET '+status);
  assert.equal(!!f.disabled(f.el('abandonner')),false);
  f.trigger('abandonner','click'); f.fail(null); await f.load(B);
  assert.equal(f.el('action').value,'Action B','aucun brouillon A transféré à B');
  assert.equal(f.el('enregistrer').disabled,true);
  assert.equal(f.requests.every(r=>r.method==='GET'),true);
  console.log('PASS GET '+status+' : abandon accessible, autre mission consultée, zéro POST');
}
{
  const f=fixture(); await f.load(A);
  assert.equal(f.el('abandonner').disabled,true,'aucun brouillon à abandonner');
  f.el('action').value='À conserver'; f.trigger('edition','input');
  const release=f.hold(); f.trigger('relire','click');
  assert.equal(f.el('abandonner').disabled,true,'abandon interdit pendant une requête');
  f.fail(503); release(); await f.settle();
  f.fail(null); f.trigger('relire','click'); await f.settle();
  assert.equal(f.el('action').value,'À conserver','brouillon préservé après panne temporaire');
  assert.equal(f.el('prochaine').textContent,'Action A');
  assert.equal(f.el('enregistrer').disabled,false);
  console.log('PASS panne temporaire : brouillon préservé et abandon verrouillé pendant lecture');
}
