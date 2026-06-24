// Processa Logo1/Logo2 FULL-BLEED (zoom p/ remover margem cinza) + preview circular.
const puppeteer = require('C:/Users/ruffy/.gemini/antigravity/scratch/krumora-bot/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

// zoom por imagem: empurra a margem cinza pra fora do quadro
const ITEMS = [
  { file: 'Logo1.png', zoom: 1.13 },
  { file: 'Logo2.png', zoom: 1.20 },
];

function writeTmp(name, fileUrl, zoom, round) {
  const pct = (zoom * 100).toFixed(1) + '%';
  const html = `<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0}html,body{width:100%;height:100%}
    .box{width:100%;height:100%;overflow:hidden;${round ? 'border-radius:50%;' : ''}
      background:#000 url('${fileUrl}') center / ${pct} no-repeat}
  </style></head><body><div class="box"></div></body></html>`;
  const p = path.resolve(__dirname, name);
  fs.writeFileSync(p, html);
  return 'file://' + p.replace(/\\/g, '/');
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();

  for (const { file, zoom } of ITEMS) {
    const base = file.replace(/\.png$/i, '');
    const fileUrl = 'file://' + path.resolve(__dirname, file).replace(/\\/g, '/');
    const sq = writeTmp(`_tmp-${base}.html`, fileUrl, zoom, false);
    const rd = writeTmp(`_tmp-${base}-r.html`, fileUrl, zoom, true);

    for (const [size, url, suffix, omit] of [
      [1000, sq, '-1000.png', false],
      [640, sq, '-640.png', false],
      [640, rd, '-wa-preview.png', true],
    ]) {
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
      await page.goto(url, { waitUntil: 'load' });
      await new Promise(r => setTimeout(r, 450));
      await page.screenshot({ path: path.resolve(__dirname, `${base}${suffix}`), omitBackground: omit, clip: { x: 0, y: 0, width: size, height: size } });
    }

    fs.unlinkSync(path.resolve(__dirname, `_tmp-${base}.html`));
    fs.unlinkSync(path.resolve(__dirname, `_tmp-${base}-r.html`));
    console.log(`${file} → full-bleed (zoom ${zoom}) OK`);
  }

  await browser.close();
  console.log('OK — exports full-bleed gerados.');
})().catch(e => { console.error(e); process.exit(1); });
