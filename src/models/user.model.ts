import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  name: String,
  telegramId: String,
  flowId: Number,
  flowStage: Number
});

export const UserModel = mongoose.model('User', userSchema);
