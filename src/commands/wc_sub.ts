import TelegramBot, {Message} from "node-telegram-bot-api";
import {WcSubModel} from "@/models/wc_sub.model";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";

export default async function (bot: TelegramBot, msg: Message, command, commandName: string, user: any) {
  let isPermitted = requireRoleMiddleware(user, Role.Admin);
  if (!isPermitted) {
    await bot.sendMessage(msg.chat.id, `You are not allowed to do this command`)
    return
  }
  await WcSubModel.create({
    chatId: msg.chat.id
  })
  await bot.sendMessage(msg.chat.id, 'You will receive World Cup 2022 news.');
}
