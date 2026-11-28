import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CARD_TEMPLATES, addElement, addPage, canRedo, canUndo, commit, createContentPage, createEmptyCard, createHistory,
  createMinigamePage, createRng, createTextElement, duplicatePage, generateMaze, hangmanGuess, hangmanLost, hangmanStart,
  hangmanWon, hashSeed, initialProgress, isPuzzleSolved, mazeSolvable, movePage, playOrder, redo, removePage,
  restoreProgress, shufflePuzzle, undo, updateElement, validateCard, breakCoalescing, checkLock, spinDigit,
  type CardDocument, type ContentPage,
} from "../src/index";

const content = (d: CardDocument, i = 0) => d.pages[i] as ContentPage;
const filled = (n: number) => {
  let d = createEmptyCard();
  for (let i = 0; i < n; i++) d = addPage(d, createContentPage());
  return d;
};

describe("validação do card", () => {
  it("todos os modelos prontos são válidos", () => {
    for (const t of CARD_TEMPLATES) {
      const r = validateCard(t.build());
      assert.ok(r.ok, `${t.id}: ${!r.ok && r.errors.join("; ")}`);
    }
  });
  it("aceita 10 páginas e rejeita 11", () => {
    const d = filled(20);
    assert.equal(d.pages.length, 10);
    assert.ok(validateCard(d).ok);
    assert.equal(validateCard({ ...d, pages: [...d.pages, createContentPage()] }).ok, false);
  });
  it("mini-game conta como página", () => {
    const d = addPage(filled(9), createMinigamePage("maze"));
    assert.equal(d.pages.length, 10);
    assert.equal(addPage(d, createMinigamePage("lock")).pages.length, 10);
  });
  it("rejeita estruturas inválidas", () => {
    assert.equal(validateCard(null).ok, false);
    assert.equal(validateCard({ schemaVersion: 1, pages: [] }).ok, false);
    assert.equal(validateCard({ schemaVersion: 1, pages: [{ id: "a", kind: "minigame", game: "x", config: {} }] }).ok, false);
    const bad = createEmptyCard();
    content(bad).elements.push({ type: "icon", icon: "nope", x: 0, y: 0, w: 50, rotation: 0, id: "z" } as never);
    assert.equal(validateCard(bad).ok, false);
  });
  it("corrige excessos em vez de rejeitar (texto longo, tamanho fora da faixa)", () => {
    const d = createEmptyCard();
    Object.assign(content(d).elements[0], { text: "x".repeat(5000), size: 9999, w: 9999 });
    const r = validateCard(d);
    assert.ok(r.ok);
    if (r.ok) {
      const el = (r.value.pages[0] as ContentPage).elements[0] as any;
      assert.equal(el.text.length, 600);
      assert.equal(el.size, 72);
      assert.equal(el.w, 400);
    }
  });
  it("rejeita código de fechadura e forca fora das regras", () => {
    assert.equal(validateCard({ ...createEmptyCard(), pages: [createMinigamePage("lock", { code: [1] })] }).ok, false);
    assert.equal(validateCard({ ...createEmptyCard(), pages: [createMinigamePage("hangman", { word: "AB" })] }).ok, false);
  });
});

describe("operações e histórico", () => {
  it("desfazer/refazer, com gesto contínuo virando um único passo", () => {
    const c0 = createEmptyCard();
    const pid = c0.pages[0].id, eid = content(c0).elements[0].id;
    let h = createHistory(c0);
    for (const x of [10, 20, 30]) h = commit(h, updateElement(h.present, pid, eid, { x }), "drag");
    assert.equal(h.past.length, 1);
    assert.ok(canUndo(h) && !canRedo(h));
    h = undo(h);
    assert.equal((content(h.present).elements[0] as any).x, 40);
    h = redo(h);
    assert.equal((content(h.present).elements[0] as any).x, 30);
    h = commit(breakCoalescing(h), updateElement(h.present, pid, eid, { x: 50 }), "drag");
    assert.equal(h.past.length, 2);
  });
  it("normaliza largura e rotação", () => {
    const c = createEmptyCard();
    const el = content(c).elements[0];
    const out = updateElement(c, c.pages[0].id, el.id, { w: 9999, rotation: 270 } as never);
    assert.equal(content(out).elements[0].w, 400);
    assert.equal(content(out).elements[0].rotation, -90);
  });
  it("limita 40 elementos por página", () => {
    let c = createEmptyCard();
    for (let i = 0; i < 60; i++) c = addElement(c, c.pages[0].id, createTextElement());
    assert.equal(content(c).elements.length, 40);
  });
  it("duplicar e mover páginas", () => {
    const c = createEmptyCard();
    const d = duplicatePage(c, c.pages[0].id);
    assert.equal(d.pages.length, 2);
    assert.notEqual(d.pages[1].id, c.pages[0].id);
    assert.equal(movePage(d, 0, 1).pages[0].id, d.pages[1].id);
    assert.equal(removePage(c, c.pages[0].id).pages.length, 1, "não apaga a última página");
  });
});

describe("reprodução", () => {
  it("ordem das páginas conforme o modo das portas", () => {
    const d = filled(4);
    assert.deepEqual(playOrder({ ...d, cover: { ...d.cover, doorMode: "own" } }, 2), [2, 3, 4, 0, 1]);
    assert.deepEqual(playOrder({ ...d, cover: { ...d.cover, doorMode: "same" } }, 2), [0, 1, 2, 3, 4]);
  });
  it("retoma o progresso só se o card não mudou", () => {
    const d = filled(4);
    const saved = JSON.parse(JSON.stringify({ ...initialProgress(d), doorIndex: 1, step: 2 }));
    assert.ok(restoreProgress(d, saved));
    assert.equal(restoreProgress(addPage(d, createContentPage()), saved), null);
    assert.equal(restoreProgress(d, { ...saved, step: 99 }), null);
    assert.equal(restoreProgress(d, "lixo"), null);
  });
});

describe("mini-games", () => {
  it("todo labirinto gerado tem saída e é reproduzível pela semente", () => {
    for (let s = 0; s < 50; s++) assert.ok(mazeSolvable(generateMaze(3 + (s % 8), 3 + (s % 10), createRng(s))));
    assert.deepEqual(generateMaze(5, 7, createRng(1)).cells, generateMaze(5, 7, createRng(1)).cells);
    assert.equal(hashSeed("a"), hashSeed("a"));
  });
  it("quebra-cabeça nunca começa montado", () => {
    for (let s = 0; s < 50; s++) assert.ok(!isPuzzleSolved(shufflePuzzle({ cols: 2, rows: 2 }, createRng(s))));
  });
  it("fechadura", () => {
    assert.ok(checkLock({ code: [1, 4, 0, 2] }, [1, 4, 0, 2]));
    assert.ok(!checkLock({ code: [1, 4, 0, 2] }, [1, 4, 0]));
    assert.equal(spinDigit(9, 1), 0);
    assert.equal(spinDigit(0, -1), 9);
  });
  it("forca: vitória, derrota e letras repetidas", () => {
    let s = hangmanStart();
    for (const l of "AMOR") s = hangmanGuess({ word: "AMOR" }, s, l);
    assert.ok(hangmanWon("AMOR", s));
    s = hangmanGuess({ word: "AMOR" }, hangmanStart(), "Z");
    assert.equal(hangmanGuess({ word: "AMOR" }, s, "z").wrong, 1, "repetir não conta de novo");
    for (const l of "BCDEF") s = hangmanGuess({ word: "AMOR" }, s, l);
    assert.ok(hangmanLost({ maxErrors: 6 }, s));
  });
});
