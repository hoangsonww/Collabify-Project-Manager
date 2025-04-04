import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// Extend the global type with our mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// Initialize global.mongoose if not already initialized
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }
  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongooseInstance): Mongoose => mongooseInstance);
  }
  global.mongoose.conn = await global.mongoose.promise;
  return global.mongoose.conn;
}
