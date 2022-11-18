import mongoose from "mongoose";


export const subSchema = new mongoose.Schema({
  projectId: String,
  messageId: String
});

export const SubModel = mongoose.model('Sub', subSchema);
