import { cookies } from "next/headers";
import {
  apiError,
  cookieName,
  issueSession,
  login,
  requireAdmin,
} from "@/lib/cms/auth";
export const runtime = "nodejs";
export async function GET() {
  try {
    await requireAdmin();
    return Response.json(
      { authenticated: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    await login(request, email, password);
    (await cookies()).set(cookieName, issueSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 28800,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);
    (await cookies()).delete(cookieName);
    return Response.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
