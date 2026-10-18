import { storeEnquiry, updateEnquiryNotification } from "@/lib/cms/enquiries";
import { isEmail, sendContactNotification } from "@/lib/email/contactNotification";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FIELD_LENGTH = 4000;

type ContactPayload = {
  services?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  projectDetails?: unknown;
  website?: unknown;
};

function cleanText(value: unknown, max = MAX_FIELD_LENGTH) {
  return typeof value === "string"
    ? value.replace(/\0/g, "").trim().slice(0, max)
    : "";
}

function diagnostic(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown email error";
  if (message.startsWith("EMAIL_CONFIG_MISSING")) return "Email configuration missing";
  if (message.startsWith("EMAIL_PROVIDER_REJECTED")) return message;
  if (/timed? out|abort/i.test(message)) return "Email delivery connection timed out";
  if (/SMTP/i.test(message)) return "SMTP delivery failed";
  return "Email notification failed";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactPayload;

    // Bot honeypot: do not store or notify.
    if (cleanText(payload.website, 200)) {
      return NextResponse.json({ ok: true });
    }

    const services = Array.isArray(payload.services)
      ? payload.services
          .filter((item): item is string => typeof item === "string")
          .map((item) => cleanText(item, 80))
          .filter(Boolean)
          .slice(0, 10)
      : [];

    const name = cleanText(payload.name, 120);
    const phone = cleanText(payload.phone, 40);
    const email = cleanText(payload.email, 180);
    const projectDetails = cleanText(payload.projectDetails, 4000);

    if (!name || !phone || services.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Please complete the required fields." },
        { status: 400 }
      );
    }
    if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }
    if (email && !isEmail(email)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const enquiry = { name, phone, email, projectDetails, services };
    // Persist before attempting notification so a provider outage never loses a lead.
    const savedId = process.env.MONGODB_URI ? await storeEnquiry(enquiry) : null;

    try {
      const provider = await sendContactNotification(enquiry);
      if (savedId) {
        try {
          await updateEnquiryNotification(savedId, "sent", provider);
        } catch (error) {
          console.error("Contact email accepted but status update failed:", diagnostic(error));
        }
      }
      return NextResponse.json({
        ok: true,
        saved: Boolean(savedId),
        notification: "sent",
        message: savedId ? "Your enquiry has been received." : "Your enquiry has been sent.",
      });
    } catch (error) {
      const reason = diagnostic(error);
      console.error("Contact notification failed:", reason);
      if (savedId) {
        try {
          await updateEnquiryNotification(savedId, "failed", undefined, reason);
        } catch (dbError) {
          console.error("Contact notification status update failed:", diagnostic(dbError));
        }
        // Data is safe in the admin inbox; do not claim mail was sent.
        return NextResponse.json({
          ok: true,
          saved: true,
          notification: "failed",
          message: "Your enquiry was saved. Our team can review it and will follow up.",
        });
      }
      return NextResponse.json(
        {
          ok: false,
          message: "We could not submit your enquiry. Please try WhatsApp or contact us directly.",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Contact enquiry request failed:", diagnostic(error));
    return NextResponse.json(
      { ok: false, message: "Unable to save your enquiry right now. Please try again." },
      { status: 503 }
    );
  }
}
