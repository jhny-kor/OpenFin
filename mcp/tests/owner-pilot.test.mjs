import assert from "node:assert/strict";
import test from "node:test";
import { verifyOwnerSessionProof } from "../src/tools/recommend-owner-pilot.ts";

const base64Url = (bytes) => Buffer.from(bytes).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

test("owner pilot accepts only a server-verifiable session proof", async () => {
  const secret = "owner-pilot-test-secret";
  const domain = "deposit";
  const asOf = "2026-07-31";
  const sessionId = "session.test";
  const payload = `${domain}|${asOf}|${sessionId}|recommendation:owner_pilot`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const proof = base64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  assert.equal(await verifyOwnerSessionProof({ secret, domain, asOf, sessionId, proof }), true);
  assert.equal(await verifyOwnerSessionProof({ secret, domain, asOf, sessionId: "session.tampered", proof }), false);
});
