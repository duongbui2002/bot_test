import mongoose from "mongoose";


export const MergeRequest = new mongoose.Schema({
  projectId: String,
  messageID: String,
  chatID: String,
  iid: Number,
});

export const MergeRequestModel = mongoose.model('MergeRequest', MergeRequest);
