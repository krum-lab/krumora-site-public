// Pixeliza a logo (nearest-neighbor) mantendo identidade. Gera versões transparente
// (pro site) e com badge preto (pro app/WhatsApp), em grids diferentes, + previews.
const puppeteer = require('C:/Users/ruffy/.gemini/antigravity/scratch/krumora-bot/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

const SIZE = 512;
const JOBS = [
  { src: 'logo-glow.png',   grids: [36, 48, 64], transparent: true,  prefix: 'logo-pixel' },
  { src: 'Logo1-1000.png',  grids: [48],          transparent: false, prefix: 'logo-pixel-badge' },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
  await page.goto('about:blank');

  for (const job of JOBS) {
    const b64 = fs.readFileSync(path.resolve(__dirname, job.src)).toString('base64');
    const srcUrl = 'data:image/png;base64,' + b64;

    for (const G of job.grids) {
      const dataUrl = await page.evaluate(async (srcUrl, SIZE, G, transparent) => {
        const img = new Image();
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = srcUrl; });
        const c = document.createElement('canvas'); c.width = SIZE; c.height = SIZE;
        const ctx = c.getContext('2d');
        if (!transparent) { ctx.fillStyle = '#050507'; ctx.fillRect(0, 0, SIZE, SIZE); }
        // downscale nearest
        const s = document.createElement('canvas'); s.width = G; s.height = G;
        const sc = s.getContext('2d'); sc.imageSmoothingEnabled = false;
        sc.drawImage(img, 0, 0, G, G);
        // upscale nearest -> blocos crisp
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(s, 0, 0, G, G, 0, 0, SIZE, SIZE);
        return c.toDataURL('image/png');
      }, srcUrl, SIZE, G, job.transparent);

      const out = `${job.prefix}-${G}.png`;
      fs.writeFileSync(path.resolve(__dirname, out), Buffer.from(dataUrl.split(',')[1], 'base64'));

      if (job.transparent) {
        const prevHtml = `<!DOCTYPE html><html><head><style>*{margin:0}
          body{width:${SIZE}px;height:${SIZE}px;background:#030305;display:grid;place-items:center}
          img{width:78%;height:78%;image-rendering:pixelated}</style></head>
          <body><img src="${dataUrl}"></body></html>`;
        const tmp = path.resolve(__dirname, '_tmp-px.html');
        fs.writeFileSync(tmp, prevHtml);
        await page.goto('file://' + tmp.replace(/\\/g, '/'), { waitUntil: 'load' });
        await new Promise(r => setTimeout(r, 250));
        await page.screenshot({ path: path.resolve(__dirname, `${job.prefix}-${G}-preview.png`), clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
        fs.unlinkSync(tmp);
      }
      console.log(`${out} (grid ${G}) OK`);
    }
  }

  await browser.close();
  console.log('OK — versões pixel art geradas.');
})().catch(e => { console.error(e); process.exit(1); });
