import {SubModel} from "@/models/sub.model";
import {GitlabService} from "@/services/HttpService";
import TelegramBot, {Message} from "node-telegram-bot-api";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";
import {ChatProjectModel} from "@/models/chat-project.model";
import * as console from "console";

export default async function (bot: TelegramBot, msg: Message, commandName: string, commandString: string, user: any, token?: string) {
  return bot.sendMessage(msg.chat.id, 'https://file-examples.com/wp-content/uploads/2017/04/file_example_MP4_1920_18MG.mp4');
}
