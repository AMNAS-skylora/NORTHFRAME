import "server-only";
import { cookies } from "next/headers";
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { database } from "./db";
export const cookieName = "northframe-admin";
function secret() {
  const key = process.env.ADMIN_SESSION_SECRET;
  if (
    !key ||
    key.length < 32 ||
    !process.env.ADMIN_PASSWORD_HASH ||
    !process.env.ADMIN_EMAIL
  )
    throw new Error("CMS_NOT_CONFIGURED");
  return key;
}
export function sameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    throw new Error("FORBIDDEN");
}
export function issueSession() {
  const body = `${Date.now() + 8 * 60 * 60 * 1000}.${randomBytes(24).toString("hex")}`;
  return `${body}.${createHmac("sha256", secret()).update(body).digest("hex")}`;
}
export function verifySession(token: string) {
  const [expires, nonce, signature, extra] = token.split(".");
  if (
    extra ||
    !expires ||
    !/^[a-f0-9]{48}$/.test(nonce || "") ||
    !/^[a-f0-9]{64}$/.test(signature || "") ||
    Number(expires) <= Date.now() ||
    Number(expires) > Date.now() + 8 * 60 * 60 * 1000
  )
    return false;
  const expected = createHmac("sha256", secret())
    .update(`${expires}.${nonce}`)
    .digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
export async function requireAdmin(request?: Request) {
  if (request) sameOrigin(request);
  secret();
  if (!verifySession((await cookies()).get(cookieName)?.value || ""))
    throw new Error("UNAUTHORIZED");
}
export async function login(
  request: Request,
  email: unknown,
  password: unknown,
) {
  secret();
  sameOrigin(request);
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    password.length > 200 ||
    email.length > 200
  )
    throw new Error("UNAUTHORIZED");
  // Shared across serverless instances. An account-wide window avoids trusting
  // client-supplied forwarding headers for login throttling.
  const db = await database();
  const attempts = db.collection<{
    _id: string;
    attempts: number;
    expiresAt: Date;
  }>("adminAttempts");
  await attempts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const id = createHash("sha256")
    .update(`${process.env.ADMIN_EMAIL}:${Math.floor(Date.now() / 600000)}`)
    .digest("hex");
  const record = await attempts.findOneAndUpdate(
    { _id: id },
    {
      $inc: { attempts: 1 },
      $setOnInsert: { expiresAt: new Date(Date.now() + 1200000) },
    },
    { upsert: true, returnDocument: "after" },
  );
  if ((record?.attempts || 0) > 10) throw new Error("RATE_LIMIT");
  const [salt, encoded] = process.env.ADMIN_PASSWORD_HASH!.split(":");
  if (
    !/^[a-f0-9]{32}$/.test(salt || "") ||
    !/^[a-f0-9]{128}$/.test(encoded || "")
  )
    throw new Error("CMS_NOT_CONFIGURED");
  const valid = timingSafeEqual(
    scryptSync(password, salt, 64),
    Buffer.from(encoded, "hex"),
  );
  if (
    !valid ||
    email.toLowerCase().trim() !== process.env.ADMIN_EMAIL!.toLowerCase().trim()
  )
    throw new Error("UNAUTHORIZED");
}
export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const statuses: Record<string, number> = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    RATE_LIMIT: 429,
    CONFLICT: 409,
    CMS_NOT_CONFIGURED: 503,
  };
  const status = statuses[message] || 503;
  return Response.json(
    {
      message:
        status === 409
          ? "Content changed. Reload before saving."
          : status === 429
            ? "Too many login attempts. Try again in 10 minutes."
            : status === 401
              ? "Sign in with your admin account."
              : status === 403
                ? "Request origin rejected."
                : "Admin connection is unavailable. Check server configuration.",
    },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
