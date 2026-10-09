import "server-only";
import { MongoClient } from "mongodb";
const cache = globalThis as typeof globalThis & {
  northframeDb?: Promise<MongoClient>;
};
export async function database() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("CMS_NOT_CONFIGURED");
  if (!cache.northframeDb)
    cache.northframeDb = new MongoClient(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    })
      .connect()
      .catch((e) => {
        cache.northframeDb = undefined;
        throw e;
      });
  return (await cache.northframeDb).db(process.env.MONGODB_DB || "northframe");
}
