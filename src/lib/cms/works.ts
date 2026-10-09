import "server-only";
import { database } from "./db";
import { initialWorks, type ManagedWork } from "./types";
type WorkDocument = { _id: string; version: number; projects: ManagedWork[] };
export async function readWorks() {
  const db = await database();
  const doc = await db
    .collection<WorkDocument>("content")
    .findOne({ _id: "works" });
  return {
    projects: doc?.projects ?? initialWorks,
    version: doc?.version ?? 0,
  };
}
export async function publicWorks() {
  if (!process.env.MONGODB_URI) return initialWorks;
  try {
    return (await readWorks()).projects.filter((p) => p.published);
  } catch {
    console.error("Work content unavailable; showing bundled portfolio.");
    return initialWorks;
  }
}
export async function saveWorks(projects: ManagedWork[], version: number) {
  const collection = (await database()).collection<WorkDocument>("content");
  if (version === 0) {
    try {
      await collection.insertOne({ _id: "works", version: 1, projects });
      return 1;
    } catch (e) {
      if ((e as { code?: number }).code === 11000) throw new Error("CONFLICT");
      throw e;
    }
  }
  const result = await collection.updateOne(
    { _id: "works", version },
    { $set: { projects }, $inc: { version: 1 } },
  );
  if (!result.matchedCount) throw new Error("CONFLICT");
  return version + 1;
}
