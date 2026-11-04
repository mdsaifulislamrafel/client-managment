import mongoose from "mongoose";

const uri = process.env.MONGODB_URI as string;
const g = globalThis as any;
g._mongo = g._mongo || { conn: null, promise: null };

export async function connectDB() {
  if (!uri) throw new Error("MONGODB_URI সেট করা নেই");
  if (g._mongo.conn) return g._mongo.conn;
  g._mongo.promise = g._mongo.promise || mongoose.connect(uri, { bufferCommands: false });
  g._mongo.conn = await g._mongo.promise;
  return g._mongo.conn;
}
