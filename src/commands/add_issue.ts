import {SubModel} from "@/models/sub.model";
import {GitlabService} from "@/services/HttpService";
import TelegramBot, {Message} from "node-telegram-bot-api";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";
import {ChatProjectModel} from "@/models/chat-project.model";
import * as console from "console";

export default async function (bot: TelegramBot, msg: Message, commandName: string, commandString: string, user: any, token?: string) {
  const projectSub = await ChatProjectModel.findOne({chatId: msg.chat.id});
  let title = commandString;
  let body = commandString;
  if (!projectSub) {
    return await bot.sendMessage(msg.chat.id, 'Default project was not set!');
  }
  try {
    if (msg.reply_to_message) {
      body = msg.reply_to_message.text;
    }
    const response = await GitlabService.createIssue(token, projectSub.projectId, title, body);
    return await bot.sendMessage(msg.chat.id, `New issue created, please commit with affix #${response.iid} to link commit to existing issue.`);
  } catch (e) {
    console.log(e);
    await bot.sendMessage(msg.chat.id, "Failed to create issue");
  }
}
