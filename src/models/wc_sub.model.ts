import mongoose from "mongoose";


export const wcSubSchema = new mongoose.Schema({
  chatId: String,
});

export const WcSubModel = mongoose.model('WcSub', wcSubSchema);
