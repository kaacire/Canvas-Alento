import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DUMMY_HASH, hashPassword, verifyPassword } from "../src/lib/password";
import { signToken, verifyToken } from "../src/lib/token";

describe("senha", () => {
  it("confere a senha certa e recusa a errada", async () => {
    const h = await hashPassword("minha-senha-123");
    assert.ok(await verifyPassword("minha-senha-123", h));
    assert.ok(!(await verifyPassword("outra", h)));
    assert.ok(!(await verifyPassword("x", "lixo")));
    assert.ok(!(await verifyPassword("x", DUMMY_HASH)));
  });
  it("dois hashes da mesma senha são diferentes (salt)", async () => {
    assert.notEqual(await hashPassword("abc12345"), await hashPassword("abc12345"));
  });
});

describe("token", () => {
  const secret = "segredo-de-teste-com-mais-de-32-caracteres";
  it("assina e verifica", () => {
    const t = signToken("user-1", secret, 60);
    assert.equal(verifyToken(t, secret)?.sub, "user-1");
  });
  it("recusa segredo errado, token adulterado e expirado", () => {
    const t = signToken("user-1", secret, 60);
    assert.equal(verifyToken(t, "outro-segredo-qualquer-123456789012"), null);
    assert.equal(verifyToken(t.slice(0, -2) + "xx", secret), null);
    assert.equal(verifyToken(signToken("user-1", secret, 60, Date.now() - 120_000), secret), null);
  });
});
