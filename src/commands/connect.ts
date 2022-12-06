import TelegramBot, {Message} from "node-telegram-bot-api";
import {SubModel} from "@/models/sub.model";
import {GitlabService} from "@/services/HttpService";
import {handleGetProjectRes} from "@/utils/handleData";

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {


  await bot.sendMessage(msg.chat.id, "<a href=\"http://127.0.0.1:3000/auth/gitlab\">Connect to Gitlab</a>", {parse_mode: 'HTML'})

  return
}