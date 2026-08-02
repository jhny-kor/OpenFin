import assert from "node:assert/strict";
import test from "node:test";
import { ownerSessionTokenPayload, verifyOwnerSessionProof } from "../src/tools/recommend-owner-pilot.ts";

const base64Url = (bytes) => Buffer.from(bytes).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

test("owner pilot accepts only a server-verifiable session proof", async () => {
  const secret = "owner-pilot-test-secret";
  const domain = "deposit";
  const asOf = "2026-07-31";
  const sessionId = "session.test";
  const generationId = "generation.test";
  const candidateSetChecksum = "sha256:candidate.test";
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64Url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "OPENFIN_OWNER_PILOT" })));
  const payload = base64Url(new TextEncoder().encode(JSON.stringify(ownerSessionTokenPayload({ domain, asOf, sessionId, generationId, candidateSetChecksum, issuedAt, expiresAt: issuedAt + 60, jti: "jti.test" }))));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const proof = `${header}.${payload}.${base64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${header}.${payload}`)))}`;
  assert.equal(await verifyOwnerSessionProof({ secret, domain, asOf, sessionId, proof, generationId, candidateSetChecksum, now: issuedAt + 1 }), true);
  assert.equal(await verifyOwnerSessionProof({ secret, domain, asOf, sessionId, proof, generationId, candidateSetChecksum, now: issuedAt + 1 }), false);
});
