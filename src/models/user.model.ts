import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  name: String,
  telegramId: String,
  flowId: Number,
  flowStage: Number
});

export const UserModel = new mongoose.Model('User', userSchema);
