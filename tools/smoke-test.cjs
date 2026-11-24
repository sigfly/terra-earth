// Run: npm install --no-save playwright && npx playwright install chromium
// node tools/smoke-test.cjs
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH || undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:900},acceptDownloads:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route(/^https?:/,r=>r.abort());
    await page.goto(pathToFileURL(path.resolve(__dirname,'../terra-offline.html')).href+'?quality=4096');
    await page.locator('#notice').waitFor({state:'hidden',timeout:90000});
    assert.match(await page.locator('#resolution').textContent(),/4096 × 2048/);
    const pixel = await page.evaluate(()=>{const c=document.querySelector('#globe'),g=c.getContext('webgl2'),p=new Uint8Array(4);g.readPixels(c.width/2,c.height/2,1,1,g.RGBA,g.UNSIGNED_BYTE,p);return [...p]});
    assert.equal(pixel[3],255);assert.ok(pixel.slice(0,3).some(n=>n>30));
    await page.getByRole('button',{name:'Elevation',exact:true}).click();
    assert.equal(await page.locator('#mapTag').textContent(),'Global elevation');
    assert.equal(await page.locator('#legend').isVisible(),true);
    await page.getByRole('button',{name:'Ocean depth',exact:true}).click();
    assert.equal(await page.locator('#mapTag').textContent(),'Ocean bathymetry');
    await page.locator('#location').selectOption({label:'Mount Everest'});
    assert.match(await page.locator('#info').textContent(),/Mount Everest/);
    await page.waitForFunction(()=>document.querySelector('#coords').textContent.includes('86.92° E'));
    await page.locator('#solar').click();
    assert.equal(await page.locator('#date').isVisible(),true);
    await page.locator('#date').fill('2026-06-21T12:00');
    await page.waitForFunction(()=>document.querySelector('#subsolar').textContent.includes('23.4'));
    await page.locator('#plus').click();
    await page.waitForFunction(()=>document.querySelector('#coords').textContent.includes('1.20×'));
    await page.locator('#reset').click();
    await page.waitForFunction(()=>document.querySelector('#coords').textContent.includes('1.00×'));
    await page.locator('#globe').focus();await page.keyboard.press('ArrowRight');
    await page.waitForFunction(()=>document.querySelector('#coords').textContent.includes('8.00° E'));
    const download=page.waitForEvent('download');await page.locator('#capture').click();assert.equal((await download).suggestedFilename(),'terra-earth.png');
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(350);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.deepEqual(errors,[]);console.log('PASS: offline WebGL rendering, layers, landmarks, solar position, zoom, reset, keyboard, screenshot, mobile layout.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
