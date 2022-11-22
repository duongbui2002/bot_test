import mongoose from "mongoose";


export const subSchema = new mongoose.Schema({
  projectId: String,
  messageID: String
});

export const SubModel = mongoose.model('Sub', subSchema);
