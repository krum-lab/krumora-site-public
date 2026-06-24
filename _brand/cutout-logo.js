// Recorta a Logo1: converte luminância em alfa (preto -> transparente, neon -> visível).
// Gera um PNG transparente do K aceso, sem o fundo/quadrado preto.
const puppeteer = require('C:/Users/ruffy/.gemini/antigravity/scratch/krumora-bot/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

const SRC = 'Logo1-1000.png';     // versão full-bleed
const OUT = 'logo-glow.png';      // transparente
const PREVIEW = 'logo-glow-preview.png';
const SIZE = 512;                 // resolução do recorte (nav usa ~40px; 512 sobra)

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const srcB64 = fs.readFileSync(path.resolve(__dirname, SRC)).toString('base64');
  const srcUrl = 'data:image/png;base64,' + srcB64;

  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
  await page.goto('about:blank');

  const dataUrl = await page.evaluate(async (srcUrl, SIZE) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = srcUrl; });
    const c = document.createElement('canvas');
    c.width = SIZE; c.height = SIZE;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    const id = ctx.getImageData(0, 0, SIZE, SIZE);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const m = Math.max(d[i], d[i + 1], d[i + 2]); // canal mais forte = brilho
      // floor alto mata o brilho fraco do fundo/badge; sobra só o neon e as faíscas
      let a = m <= 52 ? 0 : Math.min(255, (m - 52) * 1.7);
      d[i + 3] = a;
    }
    ctx.putImageData(id, 0, 0);
    return c.toDataURL('image/png');
  }, srcUrl, SIZE);

  const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync(path.resolve(__dirname, OUT), buf);

  // preview composto sobre o fundo do site (#030305) pra conferir
  const previewHtml = `<!DOCTYPE html><html><head><style>*{margin:0}
    body{width:${SIZE}px;height:${SIZE}px;background:#030305;display:grid;place-items:center}
    img{width:70%;height:70%}</style></head><body><img src="${dataUrl}"></body></html>`;
  const tmp = path.resolve(__dirname, '_tmp-prev.html');
  fs.writeFileSync(tmp, previewHtml);
  await page.goto('file://' + tmp.replace(/\\/g, '/'), { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.resolve(__dirname, PREVIEW), clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
  fs.unlinkSync(tmp);

  await browser.close();
  console.log('OK — logo-glow.png (transparente) + logo-glow-preview.png gerados.');
})().catch(e => { console.error(e); process.exit(1); });
