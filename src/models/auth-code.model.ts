import mongoose from "mongoose";

const authCodeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  code: String,
}, {timestamps: true});
authCodeSchema.index({createdAt: 1}, {expireAfterSeconds: 1800})

export const AuthCodeModel = mongoose.model('AuthCode', authCodeSchema);