import TelegramBot, {Message} from "node-telegram-bot-api";
import {UserModel} from "@/models/user.model";
import {handleUserResponse} from "@/utils/handleData";

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {
  if (msg.from.id.toString() !== process.env.SUPER_ADMIN) {
    await bot.sendMessage(msg.chat.id, 'You are not allowed to do this command')
    return
  }

  const allUsers = await UserModel.find({telegramId: {$ne: process.env.SUPER_ADMIN}});
  let response = handleUserResponse(allUsers)
  await bot.sendMessage(msg.chat.id, response, {
    parse_mode: 'HTML'
  })
}