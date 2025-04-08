import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  userSub: { type: String, required: true, unique: true }, // our local key
  sub: { type: String }, // Auth0's sub (usually same as userSub)
  sid: { type: String }, // Auth0's session ID
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
