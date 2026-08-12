import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
const url = pathToFileURL('/home/user/Ultima-/design/preview-riven-stellaire.html').href;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [nom,w,h,etat] of [['ciel-large',1440,900,'ciel'],['ciel-tel',390,844,'ciel'],['fiche-large',1440,900,'fiche']]) {
  const p = await b.newPage({ viewport:{width:w,height:h} });
  await p.goto(url);
  await p.waitForFunction(() => window.MAQUETTE_STELLAIRE);
  await p.click(`.mq-bouton[data-etat="${etat}"]`);
  await p.waitForTimeout(900);
  await p.screenshot({ path:`/tmp/claude-0/-home-user-Ultima-/09402808-e84f-5de2-b0d7-8f2cb309c075/scratchpad/stel-${nom}.png` });
  await p.close();
}
await b.close(); console.log('captures faites');
