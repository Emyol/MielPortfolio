const {chromium}=require('@playwright/test');
(async()=>{ const browser=await chromium.launch({channel:'chrome'}); const report=[];
for(const width of [390,768,1440]) {
 const page=await browser.newPage({viewport:{width,height:900}}); const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error') errors.push(m.text())});
 await page.goto('http://127.0.0.1:3109'); await page.waitForTimeout(1500);
 await page.screenshot({path:`artifacts/motion/after-${width}-hero.png`});
 for(const id of ['about','credentials','projects','leadership','contact']) { await page.locator('#'+id).scrollIntoViewIfNeeded(); await page.waitForTimeout(950); await page.screenshot({path:`artifacts/motion/after-${width}-${id}.png`}); }
 await page.screenshot({path:`artifacts/motion/after-${width}.png`,fullPage:true});
 report.push({width,errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}); await page.close();
}
require('fs').writeFileSync('artifacts/motion/visual-report.json',JSON.stringify(report,null,2)); await browser.close(); })();
