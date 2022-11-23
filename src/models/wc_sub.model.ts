import mongoose from "mongoose";


export const wcSubSchema = new mongoose.Schema({
  chatId: {
    type: String,
    unique: true
  },
});

export const WcSubModel = mongoose.model('WcSub', wcSubSchema);
