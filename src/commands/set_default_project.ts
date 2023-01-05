import {SubModel} from "@/models/sub.model";
import {GitlabService} from "@/services/HttpService";
import TelegramBot, {Message} from "node-telegram-bot-api";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";
import {ChatProjectModel} from "@/models/chat-project.model";

export default async function (bot: TelegramBot, msg: Message, command, commandName: string, user: any, token?: string) {
  let isPermitted = requireRoleMiddleware(user, Role.Admin);
  if (!isPermitted) {
    await bot.sendMessage(msg.chat.id, `You are not allowed to do this command`)
    return
  }
  if (!commandName) {
    await bot.sendMessage(msg.chat.id, 'Project Id must be required.')
    return
  }

  const project = await GitlabService.getProjectWithId(commandName, token)

  if (!project) {
    await bot.sendMessage(msg.chat.id, 'Project does not exist!')
    return
  }
  const existProject = await SubModel.findOne({projectId: project.id, messageID: msg.chat.id})
  if (existProject) {
    await existProject.deleteOne();
  }
  await ChatProjectModel.create({chatId: msg.chat.id, projectId: commandName})
  await bot.sendMessage(msg.chat.id, `Project ${project.id} was set to default successfully`);
}
