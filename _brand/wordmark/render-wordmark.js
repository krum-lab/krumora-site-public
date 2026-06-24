// Gera: PNG estático transparente + WebM animado do wordmark "Krumora".
const puppeteer = require('C:/Users/ruffy/.gemini/antigravity/scratch/krumora-bot/node_modules/puppeteer');
const path = require('path');

(async () => {
  const file = 'file://' + path.resolve(__dirname, 'krumora-wordmark.html').replace(/\\/g, '/');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 320, deviceScaleFactor: 2 });
  await page.goto(file, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 700)); // fontes

  // 1) WebM ANIMADO primeiro (com todos os efeitos), fundo escuro do site
  await page.evaluate(() => { document.body.style.background = '#030305'; });
  let webmOK = false;
  try {
    const recorder = await page.screencast({ path: path.resolve(__dirname, 'krumora-wordmark.webm') });
    await new Promise(r => setTimeout(r, 6200)); // ~1 ciclo completo (glitch 5s + pulse)
    await recorder.stop();
    webmOK = true;
    console.log('OK krumora-wordmark.webm (animado)');
  } catch (e) {
    console.log('WebM falhou:', e.message);
  }

  // 2) PNG ESTÁTICO LIMPO (sem glitch, glow fixo) — fundo transparente
  await page.evaluate(() => { document.body.style.background = 'transparent'; });
  await page.addStyleTag({ content: `
    .wordmark::before,.wordmark::after{display:none!important}
    .wordmark{animation:none!important;text-shadow:0 0 14px rgba(225,29,58,.6),0 0 28px rgba(225,29,58,.32)!important}
  ` });
  await new Promise(r => setTimeout(r, 200));
  const el = await page.$('.wordmark');
  await el.screenshot({ path: path.resolve(__dirname, 'krumora-wordmark.png'), omitBackground: true });
  console.log('OK krumora-wordmark.png (estático limpo, transparente)');

  await browser.close();
  console.log(webmOK ? 'DONE (png + webm)' : 'DONE (png; webm indisponível)');
})().catch(e => { console.error(e); process.exit(1); });
