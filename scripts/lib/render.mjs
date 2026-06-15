// Rendering helpers for the report ops — all-Node, no Python.
//   svgToPng: rasterize a hand-built SVG chart with sharp (crisp, 2x).
//   withPage/shoot: a headless Chromium page for things that need a browser
//                   (word clouds via wordcloud2.js), mirroring generate-artifacts.mjs.
import { chromium } from '@playwright/test';
import sharp from 'sharp';

export async function svgToPng(svg, outPath, { scale = 2 } = {}) {
  await sharp(Buffer.from(svg), { density: 96 * scale }).png().toFile(outPath);
}

export async function withPage(fn) {
  const browser = await chromium.launch();
  try {
    return await fn(await browser.newPage({ deviceScaleFactor: 2 }));
  } finally {
    await browser.close();
  }
}

export async function shoot(page, { html, width, height, selector, scripts = [], evaluate, settle = 200 }) {
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: 'load' });
  for (const s of scripts) await page.addScriptTag({ path: s });
  if (evaluate) await page.evaluate(evaluate);
  await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; }).catch(() => {});
  await page.waitForTimeout(settle);
  const target = selector ? await page.waitForSelector(selector) : page;
  return Buffer.from(await target.screenshot({ type: 'png' }));
}
