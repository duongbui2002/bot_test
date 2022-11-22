import TelegramBot, {Message} from "node-telegram-bot-api";
import {UserModel} from "@/models/user.model";
import {handleUserResponse} from "@/utils/handleData";

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {

  await bot.sendMessage(msg.chat.id, `Your id is: ${msg.from.id.toString()}`, {
    parse_mode: 'HTML'
  })
}