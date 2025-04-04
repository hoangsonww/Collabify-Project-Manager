import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: { type: String, required: true },
  message: { type: String, required: true },
});

// Prevent model overwrite upon initial compile
export default mongoose.models.Log || mongoose.model("Log", LogSchema);
