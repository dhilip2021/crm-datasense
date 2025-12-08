import mongoose from "mongoose";

const TokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiredAt: { type: Date, default: Date.now, expires: "10d" },
});

export default mongoose.models.TokenBlacklist ||
  mongoose.model("TokenBlacklist", TokenBlacklistSchema);
