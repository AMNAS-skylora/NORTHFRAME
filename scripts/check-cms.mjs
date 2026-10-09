import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { createRequire } from "node:module";
import crypto from "node:crypto";
const nativeRequire = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(
    source,
    {
      module,
      exports: module.exports,
      require: (name) =>
        name === "server-only"
          ? {}
          : name in mocks
            ? mocks[name]
            : nativeRequire(name),
      process,
      Buffer,
      console,
      Response,
      URL,
      Date,
      Set,
    },
    { filename: file },
  );
  return module.exports;
}
const data = load("src/data/work.ts");
const types = load("src/lib/cms/types.ts", { "@/data/work": data });
assert.equal(types.validateWorks(types.initialWorks).length, 8);
const invalid = structuredClone(types.initialWorks);
invalid[3].featured = 1;
assert.throws(() => types.validateWorks(invalid));
invalid[3].featured = 0;
invalid[3].slug = invalid[0].slug;
assert.throws(() => types.validateWorks(invalid));
invalid[3].slug = "different";
invalid[0].image = "javascript:alert(1)";
assert.throws(() => types.validateWorks(invalid));
const projects = structuredClone(types.initialWorks);
projects[2].video = "https://res.cloudinary.com/test/video/upload/v1/clip.mp4";
assert.equal(types.validateWorks(projects)[2].video, projects[2].video);
let doc = null;
const collection = {
  findOne: async () => doc,
  insertOne: async (value) => {
    if (doc) throw Object.assign(new Error(), { code: 11000 });
    doc = value;
  },
  updateOne: async (filter, update) => {
    if (doc?.version !== filter.version) return { matchedCount: 0 };
    doc = { ...doc, projects: update.$set.projects, version: doc.version + 1 };
    return { matchedCount: 1 };
  },
};
const works = load("src/lib/cms/works.ts", {
  "./db": { database: async () => ({ collection: () => collection }) },
  "./types": types,
});
assert.equal((await works.readWorks()).version, 0);
assert.equal(await works.saveWorks(projects, 0), 1);
assert.equal((await works.readWorks()).projects[2].video, projects[2].video);
await assert.rejects(() => works.saveWorks(projects, 0), /CONFLICT/);
assert.equal(await works.saveWorks(projects, 1), 2);
await assert.rejects(() => works.saveWorks(projects, 1), /CONFLICT/);
let attempts = 0;
const salt = crypto.randomBytes(16).toString("hex");
process.env.ADMIN_SESSION_SECRET = crypto.randomBytes(32).toString("hex");
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.ADMIN_PASSWORD_HASH =
  salt +
  ":" +
  crypto.scryptSync("local-test-password", salt, 64).toString("hex");
const auth = load("src/lib/cms/auth.ts", {
  "next/headers": { cookies: async () => ({ get: () => null }) },
  "./db": {
    database: async () => ({
      collection: () => ({
        createIndex: async () => {},
        findOneAndUpdate: async () => ({ attempts: ++attempts }),
      }),
    }),
  },
});
const token = auth.issueSession();
assert.ok(auth.verifySession(token));
assert.equal(auth.verifySession(token + "0"), false);
assert.equal(
  auth.verifySession("1." + token.split(".").slice(1).join(".")),
  false,
);
await assert.rejects(() => auth.requireAdmin(), /UNAUTHORIZED/);
assert.throws(
  () =>
    auth.sameOrigin(
      new Request("https://example.com/api", {
        headers: { origin: "https://evil.example" },
      }),
    ),
  /FORBIDDEN/,
);
const request = new Request("https://example.com/api/admin/session", {
  headers: { origin: "https://example.com" },
});
await auth.login(request, "admin@example.com", "local-test-password");
await assert.rejects(
  () => auth.login(request, "admin@example.com", "wrong"),
  /UNAUTHORIZED/,
);
attempts = 10;
await assert.rejects(
  () => auth.login(request, "admin@example.com", "local-test-password"),
  /RATE_LIMIT/,
);
console.log(
  "PASS: content validation, video support, persistence, stale-write conflicts, session tampering, origin checks and shared login throttling.",
);
