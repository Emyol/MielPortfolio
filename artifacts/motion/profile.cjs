const {chromium}=require('@playwright/test');
(async()=>{
 const b=await chromium.launch({channel:'chrome'});const p=await b.newPage({viewport:{width:1440,height:900}});
 await p.goto('http://127.0.0.1:3109');await p.waitForTimeout(1000);
 const cdp=await p.context().newCDPSession(p);await cdp.send('Performance.enable');
 const get=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
 const measure=async(name,run)=>{let a=await get();await run();let z=await get();return {name,seconds:+(z.Timestamp-a.Timestamp).toFixed(3),taskMs:+((z.TaskDuration-a.TaskDuration)*1000).toFixed(2),scriptMs:+((z.ScriptDuration-a.ScriptDuration)*1000).toFixed(2),layoutMs:+((z.LayoutDuration-a.LayoutDuration)*1000).toFixed(2)}};
 const result=[];result.push(await measure('hero idle visible',()=>p.waitForTimeout(1500)));
 await p.evaluate(()=>document.getElementById('projects').scrollIntoView({behavior:'instant'}));await p.waitForTimeout(1000);
 result.push(await measure('hero offscreen',()=>p.waitForTimeout(1500)));
 result.push(await measure('20 Work selections',async()=>{for(let i=0;i<20;i++) await p.locator('.work-index button').nth(i%4).click({force:true});await p.waitForTimeout(400)}));
 await p.evaluate(()=>{window.paintCount=0;const ctx=document.querySelector('canvas').getContext('2d');const clear=ctx.clearRect.bind(ctx);ctx.clearRect=(...a)=>{window.paintCount++;clear(...a)}});
 await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(300);
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))});
 const before=await p.evaluate(()=>window.paintCount);await p.waitForTimeout(200);result.push({name:'background visibility handler',paintsWhileHidden:await p.evaluate(()=>window.paintCount)-before});
 require('fs').writeFileSync('artifacts/motion/performance.json',JSON.stringify(result,null,2));console.log(result);await b.close();
})();
