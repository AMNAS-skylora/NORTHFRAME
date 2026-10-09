import { createHash } from "node:crypto";
import { apiError, requireAdmin } from "@/lib/cms/auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME,
      apiKey = process.env.CLOUDINARY_API_KEY,
      secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !secret) throw Error("CMS_NOT_CONFIGURED");
    const timestamp = Math.floor(Date.now() / 1000),
      folder = "northframe/works";
    const signature = createHash("sha256")
      .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
      .digest("hex");
    return Response.json(
      { cloudName, apiKey, timestamp, folder, signature },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
