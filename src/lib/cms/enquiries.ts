import "server-only";
import { type ObjectId } from "mongodb";
import { database } from "./db";
import type { ContactEnquiry, NotificationProvider } from "@/lib/email/contactNotification";

export type NotificationStatus = "pending" | "sending" | "sent" | "failed";

export async function storeEnquiry(payload: ContactEnquiry): Promise<ObjectId> {
  const db = await database();
  const result = await db.collection("enquiries").insertOne({
    ...payload,
    status: "new",
    notificationStatus: "pending",
    notificationAttempts: 0,
    createdAt: new Date(),
  });
  return result.insertedId;
}

export async function updateEnquiryNotification(
  id: ObjectId,
  status: "sent" | "failed",
  provider?: NotificationProvider,
  error?: string,
) {
  await (await database()).collection("enquiries").updateOne(
    { _id: id },
    {
      $set: {
        notificationStatus: status,
        notificationProvider: provider || null,
        notificationAttemptedAt: new Date(),
        notificationSentAt: status === "sent" ? new Date() : null,
        notificationError: error ? error.slice(0, 240) : null,
      },
      $inc: { notificationAttempts: 1 },
    },
  );
}
