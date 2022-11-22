import TelegramBot, {Message} from "node-telegram-bot-api";
import {SubModel} from "@/models/sub.model";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";

export default async function (bot: TelegramBot, msg: Message, command, commandName: string, user: any) {
  let isPermitted = requireRoleMiddleware(user, Role.Admin);
  if (!isPermitted) {
    await bot.sendMessage(msg.chat.id, `You are not allowed to do this command`)
    return
  }
  if (!commandName) {
    await bot.sendMessage(msg.chat.id, 'Project Id must be required.')
    return
  }

  const result = await SubModel.deleteOne({projectId: commandName, messageID: user.telegramId});

  if (result.deletedCount === 0) {
    await bot.sendMessage(msg.chat.id, `Project with #${commandName} does not exist`)
    return
  }


  await bot.sendMessage(msg.chat.id, ` The subscription project with #${commandName} was removed`)

  return

}
