import { ObjectId } from "mongodb";
import { requireAdmin, apiError } from "@/lib/cms/auth";
import { database } from "@/lib/cms/db";
import { updateEnquiryNotification } from "@/lib/cms/enquiries";
import { sendContactNotification, type ContactEnquiry } from "@/lib/email/contactNotification";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const payload = (await request.json()) as { id?: unknown };
    const id = payload?.id;
    if (typeof id !== "string" || !/^[a-f0-9]{24}$/.test(id)) {
      return Response.json({ message: "Invalid enquiry ID." }, { status: 400 });
    }

    const collection = (await database()).collection("enquiries");
    const record = await collection.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        $or: [
          { notificationStatus: { $nin: ["sent", "sending"] } },
          {
            notificationStatus: "sending",
            notificationAttemptedAt: { $lt: new Date(Date.now() - 120000) },
          },
        ],
      },
      { $set: { notificationStatus: "sending", notificationAttemptedAt: new Date() } },
      { returnDocument: "after" },
    );

    if (!record) {
      return Response.json(
        { message: "Enquiry not found, already notified or delivery in progress." },
        { status: 409 },
      );
    }

    const enquiry: ContactEnquiry = {
      name: String(record.name || ""),
      phone: String(record.phone || ""),
      email: String(record.email || ""),
      projectDetails: String(record.projectDetails || ""),
      services: Array.isArray(record.services)
        ? record.services.filter((item): item is string => typeof item === "string")
        : [],
    };

    try {
      const provider = await sendContactNotification(enquiry);
      await updateEnquiryNotification(record._id, "sent", provider);
      return Response.json({ ok: true, notification: "sent" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const reason = message.startsWith("EMAIL_CONFIG_MISSING")
        ? "Email configuration missing"
        : message.startsWith("EMAIL_PROVIDER_REJECTED")
          ? message
          : "Email delivery failed";
      console.error("Admin enquiry notification failed:", reason);
      await updateEnquiryNotification(record._id, "failed", undefined, reason);
      return Response.json(
        { message: "Notification could not be sent. Check server email settings and logs." },
        { status: 502 },
      );
    }
  } catch (error) {
    return apiError(error);
  }
}
