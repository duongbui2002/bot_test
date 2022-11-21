import mongoose from "mongoose";


export const subSchema = new mongoose.Schema({
  projectId: String,
  userID: String
});

export const SubModel = mongoose.model('Sub', subSchema);
