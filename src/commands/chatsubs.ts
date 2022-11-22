import TelegramBot, {Message} from "node-telegram-bot-api";
import {SubModel} from "@/models/sub.model";
import {GitlabService} from "@/services/HttpService";
import {handleGetProjectRes} from "@/utils/handleData";


export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {

  const mySubs = await SubModel.find({messageID: msg.chat.id}).exec()

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