import mongoose from "mongoose";

const gitlabConnectionSchema = new mongoose.Schema({
  accessToken: {
    type: String,
    required: true
  },
  accessTokenExpiresAt: {
    type: Number,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  ownerTelegramId: {
    type: String,
    required: true
  }
})

export const GitlabConnectionModel = mongoose.model('GitlabConnection', gitlabConnectionSchema)