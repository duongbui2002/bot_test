import TelegramBot, {Message} from "node-telegram-bot-api";
import {GitlabConnectionModel} from "@/models/gitlab-connection";


export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user) {
  const result = await GitlabConnectionModel.deleteOne({owner: user._id})
  if (result.deletedCount === 0) {
    await bot.sendMessage(msg.chat.id, `You haven't connected to Gitlab.`, {parse_mode: 'HTML'})
    return
  }
  await bot.sendMessage(msg.chat.id, `Disconnected to Gitlab.`, {parse_mode: 'HTML'})

  return
}