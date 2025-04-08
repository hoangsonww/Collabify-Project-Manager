import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  userSub: { type: String, required: true, unique: true },
  sub: { type: String },
  sid: { type: String },
  name: { type: String },
  nickname: { type: String },
  email: { type: String },
  email_verified: { type: Boolean },
  picture: { type: String },
  updated_at: { type: Date, default: Date.now },
});

export const UserProfile =
  mongoose.models.UserProfile ||
  mongoose.model("UserProfile", UserProfileSchema);
