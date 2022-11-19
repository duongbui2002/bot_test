import {SubModel} from "@/models/sub.model";
import {GitlabHttpService} from "@/services/HttpService";

export default async function (bot, msg, command, args) {

  const project = await GitlabHttpService.getProjectWithId(args)

  if (!project) {
    await bot.sendMessage(msg.chat.id, 'Project does not exist!')
    return
  }
  const existProject = await SubModel.findOne({projectId: project.id, messageId: msg.chat.id})
  if (!existProject) {
    await SubModel.create({messageId: msg.chat.id, projectId: args})
    await bot.sendMessage(msg.chat.id, `Subscribe ${project.id} successfully`)
    return
  }
  await bot.sendMessage(msg.chat.id, '<b >You have subscribed this project.</b>', {parse_mode: 'HTML'})
}
