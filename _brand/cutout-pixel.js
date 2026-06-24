// Recorta a logo PIXEL (brilho->alfa) PRESERVANDO os pixels (sem smoothing).
const puppeteer = require('C:/Users/ruffy/.gemini/antigravity/scratch/krumora-bot/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

const SRC = 'logo pixel.png';
const OUT = 'logo-pixel-glow.png';
const PREVIEW = 'logo-pixel-glow-preview.png';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const b64 = fs.readFileSync(path.resolve(__dirname, SRC)).toString('base64');
  const srcUrl = 'data:image/png;base64,' + b64;
  await page.goto('about:blank');

  const { dataUrl, w, h } = await page.evaluate(async (srcUrl) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = srcUrl; });
    const W = img.naturalWidth, H = img.naturalHeight;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, W, H);
    const id = ctx.getImageData(0, 0, W, H); const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const m = Math.max(d[i], d[i + 1], d[i + 2]);
      d[i + 3] = m <= 46 ? 0 : Math.min(255, (m - 46) * 1.6);
    }
    ctx.putImageData(id, 0, 0);
    return { dataUrl: c.toDataURL('image/png'), w: W, h: H };
  }, srcUrl);

  fs.writeFileSync(path.resolve(__dirname, OUT), Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log(`recorte ${w}x${h} -> ${OUT}`);

  // preview sobre o fundo do site
  const prevHtml = `<!DOCTYPE html><html><head><style>*{margin:0}
    body{width:512px;height:512px;background:#030305;display:grid;place-items:center}
    img{width:80%;height:80%;image-rendering:pixelated}</style></head>
    <body><img src="${dataUrl}"></body></html>`;
  const tmp = path.resolve(__dirname, '_tmp-pxg.html');
  fs.writeFileSync(tmp, prevHtml);
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await page.goto('file://' + tmp.replace(/\\/g, '/'), { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.resolve(__dirname, PREVIEW), clip: { x: 0, y: 0, width: 512, height: 512 } });
  fs.unlinkSync(tmp);

  await browser.close();
  console.log('OK — pixel transparente + preview.');
})().catch(e => { console.error(e); process.exit(1); });
