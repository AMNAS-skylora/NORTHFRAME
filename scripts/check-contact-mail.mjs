import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const env = {
  MONGODB_URI: "mongodb://test.local/northframe",
  RESEND_API_KEY: "re_mock_not_real",
  CONTACT_FROM_EMAIL: "notifications@example.test",
  CONTACT_TO_EMAIL: "owner@example.test",
};

let providerResponse = { ok: true, status: 200 };
let requestBody;
let requestUrl;
const fakeFetch = async (url, init) => {
  requestUrl = url;
  requestBody = JSON.parse(init.body);
  return providerResponse;
};

function load(file, mocks = {}) {
  const module = { exports: {} };
  const output = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  vm.runInNewContext(output, {
    module,
    exports: module.exports,
    require: (name) => {
      if (name === "server-only") return {};
      if (name in mocks) return mocks[name];
      throw Error("Unmocked dependency: " + name);
    },
    process: { env },
    fetch: fakeFetch,
    AbortSignal,
    Date,
    Intl,
    Buffer,
    Response,
    Request,
    URL,
    console,
  }, { filename: file });
  return module.exports;
}

const email = load("src/lib/email/contactNotification.ts", { "node:tls": {} });
const enquiry = {
  name: "Test <Client>",
  phone: "+919000000001",
  email: "client@example.test",
  services: ["Brand Identity"],
  projectDetails: "Testing & privacy",
};

assert.equal(await email.sendContactNotification(enquiry), "resend");
assert.equal(requestUrl, "https://api.resend.com/emails");
assert.deepEqual([...requestBody.to], ["owner@example.test"]);
assert.equal(requestBody.reply_to, enquiry.email);
assert.ok(requestBody.html.includes("Test &lt;Client&gt;"));
assert.ok(!requestBody.html.includes("Test <Client>"));

providerResponse = { ok: false, status: 401 };
await assert.rejects(() => email.sendContactNotification(enquiry), /EMAIL_PROVIDER_REJECTED/);
providerResponse = { ok: true, status: 200 };

const statuses = [];
let failing = false;
const savedId = { id: "mock-id" };
const route = load("src/app/api/contact/route.ts", {
  "@/lib/cms/enquiries": {
    storeEnquiry: async () => savedId,
    updateEnquiryNotification: async (_id, status) => { statuses.push(status); },
  },
  "@/lib/email/contactNotification": {
    isEmail: email.isEmail,
    sendContactNotification: async () => {
      if (failing) throw Error("EMAIL_PROVIDER_REJECTED: Mock returned HTTP 401");
      return "resend";
    },
  },
  "next/server": { NextResponse: { json: (value, options) => Response.json(value, options) } },
});

function post(payload) {
  return route.POST(new Request("https://example.test/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  }));
}

let result = await post(enquiry);
assert.equal(result.status, 200);
assert.equal((await result.json()).notification, "sent");
assert.equal(statuses.at(-1), "sent");

failing = true;
result = await post(enquiry);
assert.equal(result.status, 200);
const failed = await result.json();
assert.equal(failed.saved, true);
assert.equal(failed.notification, "failed");
assert.equal(statuses.at(-1), "failed");

result = await post({ ...enquiry, email: "not-an-email" });
assert.equal(result.status, 400);

const attemptedBeforeBot = statuses.length;
result = await post({ ...enquiry, website: "honeypot" });
assert.equal(result.status, 200);
assert.equal(statuses.length, attemptedBeforeBot);

env.RESEND_API_KEY = "";
env.SMTP_USER = "";
await assert.rejects(() => email.sendContactNotification(enquiry), /EMAIL_CONFIG_MISSING/);

let retryCount = 0;
const admin = load("src/app/api/admin/enquiries/notify/route.ts", {
  mongodb: { ObjectId: class ObjectId { constructor(value) { this.value = value; } } },
  "@/lib/cms/auth": {
    requireAdmin: async () => {},
    apiError: () => Response.json({ message: "Unavailable" }, { status: 503 }),
  },
  "@/lib/cms/db": {
    database: async () => ({
      collection: () => ({
        findOneAndUpdate: async () => ({ _id: savedId, ...enquiry }),
      }),
    }),
  },
  "@/lib/cms/enquiries": {
    updateEnquiryNotification: async (_id, status) => statuses.push(status),
  },
  "@/lib/email/contactNotification": {
    sendContactNotification: async () => { retryCount++; return "resend"; },
  },
});
const retry = await admin.POST(new Request("https://example.test/api/admin/enquiries/notify", {
  method: "POST",
  headers: { origin: "https://example.test", "content-type": "application/json" },
  body: JSON.stringify({ id: "abcdef0123456789abcdef01" }),
}));
assert.equal(retry.status, 200);
assert.equal((await retry.json()).notification, "sent");
assert.equal(retryCount, 1);

console.log("PASS: Resend payload & escaping, provider rejection, saved lead mail status, validation, honeypot, SMTP config, authenticated retry route (all mocked; no live emails).");
