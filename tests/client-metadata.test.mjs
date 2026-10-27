import test from "node:test";
import assert from "node:assert/strict";
import { loadLib } from "./helpers/load-ts.mjs";

const lib = await loadLib(["client-metadata.ts"]);
const { isMetadataClientId, isPublicAddress, parseClientMetadata, fetchClientMetadata } = await lib.import("client-metadata");
test.after(lib.cleanup);

const id = "https://assistant.example/oauth/client.json";
const httpsOnly = (uri) => uri.startsWith("https://");

test("only HTTPS URLs with a path count as metadata client IDs", () => {
  assert.equal(isMetadataClientId(id), true);
  for (const other of ["3f2a9c", "http://assistant.example/client.json", "https://assistant.example/", "https://user:pw@assistant.example/c.json", "https://assistant.example/c.json#x"]) assert.equal(isMetadataClientId(other), false, other);
});

test("private, loopback and link-local addresses are refused", () => {
  for (const ip of ["127.0.0.1", "10.1.2.3", "172.20.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"]) assert.equal(isPublicAddress(ip), false, ip);
  for (const ip of ["93.184.216.34", "2606:4700::1111", "172.32.0.1"]) assert.equal(isPublicAddress(ip), true, ip);
});

test("a document is accepted only when it names itself and lists safe redirects", () => {
  assert.deepEqual(parseClientMetadata(id, { client_id: id, client_name: " Muse ", redirect_uris: ["https://assistant.example/cb"] }, httpsOnly), { name: "Muse", redirectUris: ["https://assistant.example/cb"] });
  assert.equal(parseClientMetadata(id, { client_id: "https://other.example/c.json", redirect_uris: ["https://assistant.example/cb"] }, httpsOnly), undefined);
  assert.equal(parseClientMetadata(id, { client_id: id, redirect_uris: [] }, httpsOnly), undefined);
  assert.equal(parseClientMetadata(id, { client_id: id, redirect_uris: ["javascript:alert(1)"] }, httpsOnly), undefined);
  assert.equal(parseClientMetadata(id, { client_id: id, redirect_uris: ["https://assistant.example/cb"] }, httpsOnly).name, "assistant.example");
});

test("documents on internal hosts are never fetched", async () => {
  assert.equal(await fetchClientMetadata("https://localhost/client.json", httpsOnly), undefined);
  assert.equal(await fetchClientMetadata("https://127.0.0.1/client.json", httpsOnly), undefined);
});
