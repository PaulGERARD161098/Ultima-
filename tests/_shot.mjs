import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [w,h,name] of [[1280,860,'desktop'],[390,844,'mobile']]) {
  const p = await b.newPage({ viewport:{width:w,height:h} });
  await p.goto('http://127.0.0.1:8123/', { waitUntil:'load' });
  await p.screenshot({ path: '/tmp/claude-0/-home-user-Ultima-/f3b4f8cd-5c45-5024-a89f-6861acf4dd97/scratchpad/console-'+name+'.png', fullPage: name==='mobile' });
  await p.close();
}
await b.close(); console.log('shots done');
