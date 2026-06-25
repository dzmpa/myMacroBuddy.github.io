const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8000', { waitUntil: 'networkidle' });
  const before = await page.evaluate(() => {
    const el = document.getElementById('macroChart');
    return el ? el.getAttribute('data-rendered-at') : null;
  });
  console.log('before', before);
  await page.click('#kcal');
  await page.keyboard.type('100');
  // wait 900ms
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => {
    const el = document.getElementById('macroChart');
    return el ? el.getAttribute('data-rendered-at') : null;
  });
  console.log('after', after);
  const outer = await page.evaluate(() => {
    const el = document.getElementById('macroChart');
    return el ? el.outerHTML : null;
  });
  console.log('outer', outer && outer.slice(0, 300));
  await browser.close();
})();
