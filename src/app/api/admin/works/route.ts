import { apiError, requireAdmin } from "@/lib/cms/auth";
import { readWorks, saveWorks } from "@/lib/cms/works";
import { validateWorks } from "@/lib/cms/types";
export const runtime = "nodejs";
export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await readWorks(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return apiError(e);
  }
}
export async function PUT(request: Request) {
  try {
    await requireAdmin(request);
    const raw = await request.text();
    if (raw.length > 1000000)
      return Response.json({ message: "Content too large." }, { status: 413 });
    let projects, version;
    try {
      const payload = JSON.parse(raw);
      version = payload.version;
      if (!Number.isInteger(version) || version < 0)
        throw Error("Invalid content version.");
      projects = validateWorks(payload.projects);
    } catch (e) {
      return Response.json(
        { message: e instanceof Error ? e.message : "Invalid content." },
        { status: 400 },
      );
    }
    return Response.json({ version: await saveWorks(projects, version) });
  } catch (e) {
    return apiError(e);
  }
}
