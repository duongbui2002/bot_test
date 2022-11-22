import TelegramBot, {Message} from "node-telegram-bot-api";
import {UserModel} from "@/models/user.model";
import {handleUserResponse} from "@/utils/handleData";

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {


  await UserModel.updateOne({telegramId: '5606845949'}, {$set: {role: 'ADMIN'}})

  await bot.sendMessage(msg.chat.id, 'Set Duong admin success', {
    parse_mode: 'HTML'
  })
}