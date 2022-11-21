import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  name: String,
  telegramId: {
    type: String,
    unique: true,
    index: true
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  }
});

export const UserModel = mongoose.model('User', userSchema);
