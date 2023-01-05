import mongoose from "mongoose";

const schema = new mongoose.Schema({
  chatId: String,
  projectId: String,
}, {timestamps: true});

export const ChatProjectModel = mongoose.model('ChatProject', schema);
