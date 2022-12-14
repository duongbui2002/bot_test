import {SubModel} from "@/models/sub.model";
import {GitlabService} from "@/services/HttpService";
import TelegramBot, {Message} from "node-telegram-bot-api";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";
import {log} from "util";

export default async function (bot: TelegramBot, msg: Message, command, commandName: string, user: any, token?: string) {
  let isPermitted = requireRoleMiddleware(user, Role.Admin);

  if (!commandName) {
    throw new Error('Project id is required')
  }

  const project = await GitlabService.getProjectWithId(commandName, token)
  if (!project){
    await bot.sendMessage(msg.chat.id, `Project does not found`)
    return
  }

  const result = await GitlabService.runPipeline(token, commandName)
  if (!result) {
    await bot.sendMessage(msg.chat.id, `Can't run pipeline`)
    return
  }
  await bot.sendMessage(msg.chat.id, 'Run pipeline success')
}
