// Testes no navegador (Chromium). Rodar: npm run test:e2e -w @hope/web
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { build } = require("esbuild");
const { chromium } = require("playwright");

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, ".out");
const SHARED = join(here, "../../../packages/shared/src/index.ts");

let server, browser, base;
const errors = [];

before(async () => {
  mkdirSync(out, { recursive: true });
  await build({
    entryPoints: [join(here, "harness.tsx")],
    outfile: join(out, "harness.js"),
    bundle: true,
    format: "esm",
    jsx: "automatic",
    loader: { ".css": "css" },
    define: { "import.meta.env": "{}" },
    alias: { "@hope/shared": SHARED, "react-router-dom": join(here, "router-stub.tsx") },
    nodePaths: (process.env.NODE_PATH ?? "").split(":").filter(Boolean),
    logLevel: "warning",
  });
  writeFileSync(join(out, "index.html"), `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="harness.css"></head><body><div id="root"></div>
<svg width="0" height="0" style="position:absolute"><filter id="rabisco"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="2.5"/></filter></svg>
<script type="module" src="harness.js"></script></body></html>`);
  server = createServer((req, res) => {
    const file = req.url.split("?")[0] === "/" ? "index.html" : req.url.split("?")[0].slice(1);
    try {
      const body = readFileSync(join(out, file));
      res.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : "text/html");
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.end();
    }
  }).listen(0);
  base = `http://localhost:${server.address().port}/`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.close();
});

async function open(query, viewport = { width: 1200, height: 800 }) {
  const page = await browser.newPage({ viewport });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + query);
  return page;
}

describe("editor", () => {
  it("seleciona, redimensiona, gira, apaga e desfaz", async () => {
    const p = await open("?view=editor");
    await p.waitForSelector(".ed-sheet");
    const icon = p.locator(".ed-el").nth(1);
    const c = await icon.boundingBox();
    await p.mouse.click(c.x + c.width / 2, c.y + c.height / 2);
    const h = await p.locator(".ed-resize").boundingBox();
    const w0 = (await icon.boundingBox()).width;
    await p.mouse.move(h.x + 7, h.y + 7);
    await p.mouse.down();
    await p.mouse.move(h.x + 57, h.y + 7, { steps: 5 });
    await p.mouse.up();
    assert.ok((await icon.boundingBox()).width > w0 + 20, "deve ter aumentado");
    const r = await p.locator(".ed-rotate").boundingBox();
    const ib = await icon.boundingBox();
    await p.mouse.move(r.x + 7, r.y + 7);
    await p.mouse.down();
    await p.mouse.move(ib.x + ib.width + 80, ib.y + ib.height / 2, { steps: 6 });
    await p.mouse.up();
    assert.match(await icon.evaluate((e) => e.style.transform), /rotate\(/);
    const before = await p.locator(".ed-el").count();
    await p.keyboard.press("Delete");
    assert.equal(await p.locator(".ed-el").count(), before - 1);
    await p.keyboard.press("Control+z");
    assert.equal(await p.locator(".ed-el").count(), before);
    await p.close();
  });

  it("arrasta um elemento", async () => {
    const p = await open("?view=editor");
    await p.waitForSelector(".ed-sheet");
    const el = p.locator(".ed-el").first();
    const b0 = await el.boundingBox();
    await p.mouse.move(b0.x + b0.width / 2, b0.y + b0.height / 2);
    await p.mouse.down();
    await p.mouse.move(b0.x + b0.width / 2 + 40, b0.y + b0.height / 2 + 60, { steps: 5 });
    await p.mouse.up();
    const b1 = await el.boundingBox();
    assert.ok(Math.abs(b1.x - b0.x - 40) < 6 && Math.abs(b1.y - b0.y - 60) < 6, `moveu ${b1.x - b0.x}, ${b1.y - b0.y}`);
    await p.close();
  });

  it("adiciona elementos, troca de tema, adiciona mini-game e salva sozinho", async () => {
    const p = await open("?view=editor");
    await p.waitForSelector(".ed-sheet");
    const n0 = await p.locator(".ed-el").count();
    await p.click('[aria-label="Adicionar Flor"]');
    await p.click(".ed-rail >> text=Texto");
    await p.click("text=Adicionar título");
    assert.equal(await p.locator(".ed-el").count(), n0 + 2);
    await p.selectOption(".ed-theme", "DOODLE");
    const pages0 = await p.locator(".ed-thumb").count();
    await p.click(".ed-addbtn");
    await p.click("text=Labirinto");
    await p.waitForSelector(".ed-mgform");
    assert.equal(await p.locator(".ed-thumb").count(), pages0 + 1);
    await p.waitForFunction(() => window.__saves.length > 0, null, { timeout: 5000 });
    const saved = await p.evaluate(() => window.__saves.at(-1));
    assert.equal(saved.content.theme, "DOODLE");
    await p.close();
  });

  it("gera o link de compartilhamento", async () => {
    const p = await open("?view=editor");
    await p.waitForSelector(".ed-sheet");
    await p.click(".ed-post");
    await p.selectOption(".ed-modal select >> nth=0", "LINK");
    await p.click("text=Gerar link");
    await p.waitForSelector(".ed-link");
    assert.match(await p.inputValue(".ed-link input"), /\/e\/demo-abc$/);
    await p.close();
  });

  it("não deixa passar de 10 páginas", async () => {
    const p = await open("?view=editor");
    await p.waitForSelector(".ed-sheet");
    for (let i = 0; i < 8; i++) {
      if (await p.locator(".ed-addbtn:disabled").count()) break;
      await p.click(".ed-addbtn");
      await p.click("text=Página em branco");
    }
    assert.equal(await p.locator(".ed-thumb").count(), 10);
    assert.ok(await p.locator(".ed-addbtn").isDisabled());
    await p.close();
  });
});

describe("player", () => {
  it("percorre o card: portas, virada, os 6 mini-games e o final", async () => {
    const p = await open("?view=player&games=maze,puzzle,garden,lock,hangman", { width: 420, height: 800 });
    await p.waitForSelector(".pl-door");
    await p.click(".pl-door >> nth=0");
    await p.waitForSelector(".pl-leaf");
    const next = async () => {
      await p.click(".pl-next");
      await p.waitForTimeout(1050);
    };
    await next(); // 2
    await next(); // 3: memória
    assert.ok(await p.locator(".pl-next").isDisabled(), "bloqueado até resolver");

    const cards = p.locator(".mg-card");
    const n = await cards.count();
    const seen = {};
    for (let i = 0; i < n; i++) {
      await cards.nth(i).click();
      (seen[await cards.nth(i).getAttribute("aria-label")] ||= []).push(i);
      if (i % 2 === 1) await p.waitForTimeout(900);
    }
    for (const idx of Object.values(seen))
      for (const i of idx)
        if (!(await cards.nth(i).evaluate((e) => e.classList.contains("up")))) await cards.nth(i).click();
    await p.waitForSelector(".mg-win");
    await next(); // 4: texto
    await next(); // 5: labirinto
    await p.locator(".mg-maze").focus();
    for (let i = 0; i < 6000 && !(await p.locator(".mg-win").count()); i++)
      await p.keyboard.press(["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"][Math.floor(Math.random() * 4)]);
    assert.equal(await p.locator(".mg-win").count(), 1, "labirinto");
    await next(); // 6: quebra-cabeça
    for (let g = 0; g < 20 && !(await p.locator(".mg-win").count()); g++) {
      const vbs = await p.locator(".mg-piece svg").evaluateAll((els) => els.map((e) => e.getAttribute("viewBox")));
      const order = vbs.map((v) => { const [x, y] = v.split(" ").map(Number); return Math.round(y / (100 / 3)) * 3 + Math.round(x / (100 / 3)); });
      const i = order.findIndex((v, k) => v !== k);
      if (i < 0) break;
      await p.locator(".mg-piece").nth(i).click();
      await p.locator(".mg-piece").nth(order.indexOf(i)).click();
    }
    assert.equal(await p.locator(".mg-win").count(), 1, "quebra-cabeça");
    await next(); // 7: jardim
    const pots = p.locator(".mg-pot");
    for (let i = 0; i < (await pots.count()); i++) {
      const bb = await pots.nth(i).boundingBox();
      await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
      await p.mouse.down();
      await p.waitForTimeout(4200);
      await p.mouse.up();
    }
    assert.equal(await p.locator(".mg-win").count(), 1, "jardim");
    await next(); // 8: fechadura (código padrão 1402)
    [1, 4, 0, 2].forEach(() => {});
    for (const [i, times] of [1, 4, 0, 2].entries())
      for (let k = 0; k < times; k++) await p.locator(".mg-disc").nth(i).locator("button").first().click();
    assert.equal(await p.locator(".mg-win").count(), 1, "fechadura");
    await next(); // 9: forca (AMOR)
    for (const l of "AMOR") await p.click(`.mg-keys button:text-is("${l}")`);
    assert.equal(await p.locator(".mg-win").count(), 1, "forca");
    await next();
    assert.equal(await p.locator(".pl-sky").count(), 1, "chegou ao céu final");
    await p.close();
  });

  it("retoma de onde parou depois de recarregar", async () => {
    const p = await open("?view=player", { width: 420, height: 800 });
    await p.waitForSelector(".pl-door");
    await p.click(".pl-door >> nth=0");
    await p.click(".pl-next");
    await p.waitForTimeout(1050);
    assert.match(await p.textContent(".pl-controls span"), /^2 /);
    await p.reload();
    await p.waitForSelector(".pl-controls");
    assert.match(await p.textContent(".pl-controls span"), /^2 /);
    await p.close();
  });
});

describe("telas gerais", () => {
  for (const view of ["gallery", "minigames", "library"]) {
    it(`abre ${view} sem erro`, async () => {
      const p = await open(`?view=${view}`, { width: 1100, height: 900 });
      await p.waitForTimeout(400);
      assert.ok((await p.locator("h1").count()) > 0);
      await p.close();
    });
  }
  it("nenhum erro de JavaScript em toda a execução", () => {
    assert.deepEqual(errors, []);
  });
});
