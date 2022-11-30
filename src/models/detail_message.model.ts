import mongoose from "mongoose";


export const detailMessage = new mongoose.Schema({
  content: {
    type: String,
    require: true
  },
  type: {
    type: String,
    require: true
  }
});

export const DetailMessageModel = mongoose.model('DetailMessage', detailMessage);
