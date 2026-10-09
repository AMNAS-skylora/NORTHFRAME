import { apiError, requireAdmin } from "@/lib/cms/auth";
import { database } from "@/lib/cms/db";
import { ObjectId } from "mongodb";
export async function GET() {
  try {
    await requireAdmin();
    const items = await (
      await database()
    )
      .collection("enquiries")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return Response.json(items, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return apiError(e);
  }
}
export async function PATCH(request: Request) {
  try {
    await requireAdmin(request);
    const { id, status } = await request.json();
    if (
      typeof id !== "string" ||
      !/^[a-f0-9]{24}$/.test(id) ||
      !["new", "contacted", "closed"].includes(status)
    )
      return Response.json(
        { message: "Invalid enquiry status." },
        { status: 400 },
      );
    const r = await (
      await database()
    )
      .collection("enquiries")
      .updateOne({ _id: new ObjectId(id) }, { $set: { status } });
    return Response.json(
      { ok: !!r.matchedCount },
      { status: r.matchedCount ? 200 : 404 },
    );
  } catch (e) {
    return apiError(e);
  }
}
