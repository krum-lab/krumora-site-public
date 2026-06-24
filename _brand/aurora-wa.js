// Versão WhatsApp da Aurora #6: quadrada (640/1000) + preview circular.
const puppeteer = require('C:/Users/ruffy/.gemini/antigravity/scratch/krumora-bot/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

const SRC = 'C:/Users/ruffy/Pictures/Krumora/Aurora/pronto/6.png';
const OUTDIR = 'C:/Users/ruffy/Pictures/Krumora/Aurora/pronto';

function dataUrl(file) {
  return 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
}

(async () => {
  const avUrl = dataUrl(SRC);
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('about:blank');

  for (const [SIZE, round, name] of [[1000, false, '6-wa-ext-1000.png'], [640, false, '6-wa-ext-640.png'], [640, true, '6-wa-ext-preview.png']]) {
    const out = await page.evaluate(async (avUrl, SIZE, round) => {
      const load = (u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
      const av = await load(avUrl);
      const W = av.naturalWidth, H = av.naturalHeight;

      const c = document.createElement('canvas'); c.width = SIZE; c.height = SIZE;
      const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

      if (round) { ctx.save(); ctx.beginPath(); ctx.arc(SIZE/2, SIZE/2, SIZE/2, 0, 7); ctx.clip(); }

      // contain: figura inteira (rosto + logo)
      const scale = Math.min(SIZE / W, SIZE / H);
      const dw = W * scale, dh = H * scale;
      const x0 = (SIZE - dw) / 2, y0 = (SIZE - dh) / 2;

      // figura principal
      ctx.drawImage(av, x0, y0, dw, dh);

      // EXPANDE a estampa: espelha as colunas de fundo da borda pras laterais (nítido)
      // esquerda — reflete em torno de x0
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, x0, SIZE); ctx.clip();
      ctx.translate(2 * x0, 0); ctx.scale(-1, 1);
      ctx.drawImage(av, x0, y0, dw, dh);
      ctx.restore();
      // direita — reflete em torno de (x0+dw)
      const xr = x0 + dw;
      ctx.save();
      ctx.beginPath(); ctx.rect(xr, 0, SIZE - xr, SIZE); ctx.clip();
      ctx.translate(2 * xr, 0); ctx.scale(-1, 1);
      ctx.drawImage(av, x0, y0, dw, dh);
      ctx.restore();

      // escurece a ponta externa pra sumir o "fantasma" da figura espelhada
      const gl = ctx.createLinearGradient(0, 0, x0, 0);
      gl.addColorStop(0, 'rgba(6,8,16,.92)'); gl.addColorStop(1, 'rgba(6,8,16,0)');
      ctx.fillStyle = gl; ctx.fillRect(0, 0, x0, SIZE);
      const gr = ctx.createLinearGradient(SIZE, 0, xr, 0);
      gr.addColorStop(0, 'rgba(6,8,16,.92)'); gr.addColorStop(1, 'rgba(6,8,16,0)');
      ctx.fillStyle = gr; ctx.fillRect(xr, 0, SIZE - xr, SIZE);

      if (round) ctx.restore();
      return c.toDataURL('image/png');
    }, avUrl, SIZE, round);
    fs.writeFileSync(path.join(OUTDIR, name), Buffer.from(out.split(',')[1], 'base64'));
    console.log('OK', name);
  }

  await browser.close();
  console.log('DONE — versão WhatsApp da #6 em ' + OUTDIR);
})().catch(e => { console.error(e); process.exit(1); });
