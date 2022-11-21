import {SubModel} from "@/models/sub.model";
import {GitlabService} from "@/services/HttpService";
import TelegramBot, {Message} from "node-telegram-bot-api";

export default async function (bot: TelegramBot, msg: Message, command, commandName: string, user: any) {
  if (!commandName) {
    await bot.sendMessage(msg.chat.id, 'Project Id must be required.')
    return
  }

  const project = await GitlabService.getProjectWithId(commandName)

  if (!project) {
    await bot.sendMessage(msg.chat.id, 'Project does not exist!')
    return
  }
  const existProject = await SubModel.findOne({projectId: project.id, messageId: msg.chat.id})
  if (!existProject) {
    await SubModel.create({userID: msg.chat.id, projectId: commandName})
    await bot.sendMessage(msg.chat.id, `Subscribe ${project.id} successfully`)
    return
  }
  await bot.sendMessage(msg.chat.id, '<b >You have subscribed this project.</b>', {parse_mode: 'HTML'})
}
