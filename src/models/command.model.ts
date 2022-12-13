import mongoose from "mongoose";

export const commandSchema = new mongoose.Schema({
  name: mongoose.Schema.Types.String,
  messageID: mongoose.Schema.Types.String,
  status: mongoose.Schema.Types.String,
  action: String,
  data: mongoose.Schema.Types.Mixed
});

export const CommandModel = mongoose.model('Command', commandSchema);
