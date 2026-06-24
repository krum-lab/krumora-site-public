// Incrusta o krumora-wordmark no peito de cada Aurora COM WARP (acompanha a curva do corpo).
const puppeteer = require('C:/Users/ruffy/.gemini/antigravity/scratch/krumora-bot/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

const AVATAR_DIR = 'C:/Users/ruffy/Pictures/Krumora/Aurora';
const OUT_DIR = path.join(AVATAR_DIR, 'pronto');
const WORDMARK = 'C:/Users/ruffy/.gemini/antigravity/scratch/krumora-site/_brand/wordmark/krumora-wordmark.png';

// cx,cy = centro da logo (% da imagem). w = largura da logo (% da imagem).
// rot = inclinação (graus). arc = afundamento no centro (fração da altura da logo).
// bulge = aumento de altura no centro (bojo do peito). persp = afinamento do topo.
const DEFAULT = { cx: 50, cy: 81, w: 42, rot: 0, arc: 0.16, bulge: 0.14, persp: 0.10, opacity: 0.95 };
const CONFIG = {
  '1.png': { cx: 50, cy: 82, w: 40, rot: 0 },
  '2.png': { cx: 52, cy: 82, w: 38, rot: -3 },
  '3.png': { cx: 50, cy: 82, w: 40, rot: 0 },
  '4.png': { cx: 49, cy: 83, w: 40, rot: -2 },
  '5.png': { cx: 50, cy: 82, w: 40, rot: 0 },
  '6.png': { cx: 50, cy: 82, w: 40, rot: 0 },
  '7.png': { cx: 50, cy: 82, w: 40, rot: 0 },
};

function dataUrl(file) {
  const ext = path.extname(file).slice(1);
  return `data:image/${ext};base64,` + fs.readFileSync(file).toString('base64');
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const wmUrl = dataUrl(WORDMARK);
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('about:blank');

  for (const file of Object.keys(CONFIG)) {
    const src = path.join(AVATAR_DIR, file);
    if (!fs.existsSync(src)) { console.log('pula:', file); continue; }
    const cfg = { ...DEFAULT, ...CONFIG[file] };
    const avUrl = dataUrl(src);

    const out = await page.evaluate(async (avUrl, wmUrl, cfg) => {
      const load = (u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
      const av = await load(avUrl);
      const wm = await load(wmUrl);
      const W = av.naturalWidth, H = av.naturalHeight;

      // ── 1) WARP em RESOLUÇÃO NATIVA (sem perda): fatias 1px 1:1 horizontal ──
      const sw = wm.naturalWidth, sh = wm.naturalHeight;
      const arcN = cfg.arc * sh;
      const warpH = Math.ceil(sh * (1 + cfg.bulge) + arcN + 6);
      const wc = document.createElement('canvas'); wc.width = sw; wc.height = warpH;
      const wctx = wc.getContext('2d');
      for (let sx = 0; sx < sw; sx++) {
        const u = sx / (sw - 1);
        const bell = Math.sin(Math.PI * u);           // 0 nas pontas, 1 no centro
        const dy = arcN * bell;                        // afunda no centro (drapeia)
        const vsc = 1 + cfg.bulge * bell;              // bojo no centro
        const taper = 1 - cfg.persp * (1 - bell);      // topo afina nas pontas
        const destH = sh * vsc * taper;
        const destY = (warpH - destH) / 2 + dy;
        wctx.drawImage(wm, sx, 0, 1, sh, sx, destY, 1, destH);  // 1:1 horizontal = crisp
      }

      // ── 2) COMPÕE: 1 redimensionamento de alta qualidade + 1 sombra ──
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(av, 0, 0, W, H);

      const LW = (cfg.w / 100) * W;
      const LH = warpH * (LW / sw);
      const cx = (cfg.cx / 100) * W, cy = (cfg.cy / 100) * H;
      const sscale = LW / sw;

      ctx.save();
      ctx.globalAlpha = cfg.opacity;
      ctx.translate(cx, cy);
      ctx.rotate(cfg.rot * Math.PI / 180);
      ctx.shadowColor = 'rgba(0,0,0,.4)';
      ctx.shadowBlur = 3 * sscale;
      ctx.shadowOffsetY = 2 * sscale;
      ctx.drawImage(wc, 0, 0, sw, warpH, -LW / 2, -LH / 2, LW, LH);
      ctx.restore();
      return c.toDataURL('image/png');
    }, avUrl, wmUrl, cfg);

    fs.writeFileSync(path.join(OUT_DIR, file), Buffer.from(out.split(',')[1], 'base64'));
    console.log(`${file} -> pronto/ (warp)`);
  }

  await browser.close();
  console.log('OK — avatares com logo curvada em ' + OUT_DIR);
})().catch(e => { console.error(e); process.exit(1); });
