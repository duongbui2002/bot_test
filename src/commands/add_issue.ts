import {SubModel} from "@/models/sub.model";
import {GitlabService} from "@/services/HttpService";
import TelegramBot, {Message} from "node-telegram-bot-api";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";
import {ChatProjectModel} from "@/models/chat-project.model";

export default async function (bot: TelegramBot, msg: Message, commandName: string, commandString: string, user: any, token?: string) {
  const existProject = await ChatProjectModel.findOne({chatId: msg.chat.id});
  if (!existProject) {
    return await bot.sendMessage(msg.chat.id, 'Default project was not set!');
  }
  await bot.sendMessage(msg.chat.id, commandString);
}
