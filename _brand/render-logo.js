// Renderiza a logo HTML em PNGs (1000x1000 e 640x640) pro perfil do WhatsApp.
const puppeteer = require('C:/Users/ruffy/.gemini/antigravity/scratch/krumora-bot/node_modules/puppeteer');
const path = require('path');

(async () => {
  const file = 'file://' + path.resolve(__dirname, 'logo-wa.html').replace(/\\/g, '/');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 1 });
  await page.goto(file, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600)); // garante fontes carregadas

  // 1000x1000
  await page.screenshot({ path: path.resolve(__dirname, 'krumora-logo-1000.png'), omitBackground: false, clip: { x: 0, y: 0, width: 1000, height: 1000 } });

  // 640x640 (recomendado WhatsApp)
  await page.setViewport({ width: 640, height: 640, deviceScaleFactor: 1 });
  await page.goto(file, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  // a arte é 1000px fixos; reduzimos via screenshot da página inteira escalada
  await page.evaluate(() => { document.documentElement.style.zoom = (640/1000); });
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.resolve(__dirname, 'krumora-logo-640.png'), clip: { x: 0, y: 0, width: 640, height: 640 } });

  await browser.close();
  console.log('OK — krumora-logo-1000.png e krumora-logo-640.png gerados em _brand/');
})().catch(e => { console.error(e); process.exit(1); });
