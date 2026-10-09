import "server-only";
import { database } from "./db";
export async function storeEnquiry(payload: {
  name: string;
  phone: string;
  email: string;
  projectDetails: string;
  services: string[];
}) {
  const db = await database();
  await db
    .collection("enquiries")
    .insertOne({ ...payload, status: "new", createdAt: new Date() });
}
