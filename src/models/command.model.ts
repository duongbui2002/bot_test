import mongoose from "mongoose";

export const commandSchema = new mongoose.Schema({
    name: mongoose.Schema.Types.String,
    messageID: mongoose.Schema.Types.String,
    status: mongoose.Schema.Types.Number
});

export const CommandModel = mongoose.model('Command', commandSchema);
