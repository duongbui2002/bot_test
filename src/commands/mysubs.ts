import TelegramBot, {Message} from "node-telegram-bot-api";
import {SubModel} from "@/models/sub.model";
import {GitlabService} from "@/services/HttpService";
import {handleGetProjectRes} from "@/utils/handleData";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {
  let isPermitted = requireRoleMiddleware(user, Role.Admin);
  if (!isPermitted) {
    await bot.sendMessage(msg.chat.id, `You are not allow to do this command`)
    return
  }
  const userID = user.telegramId;
  const mySubs = await SubModel.find({userID}).exec()

  const mySubProjects: any[] = []
  for (const mySub of mySubs) {
    const project = await GitlabService.getProjectWithId(mySub.projectId)
    mySubProjects.push(project)
  }

  if (mySubProjects.length === 0) {
    await bot.sendMessage(msg.chat.id, `You haven't subscribed any project`)
    return;
  }

  let response = await handleGetProjectRes(mySubProjects)
  await bot.sendMessage(msg.chat.id, response)

  return
}