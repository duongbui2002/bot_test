import TelegramBot, {Message} from "node-telegram-bot-api";
import {WcSubModel} from "@/models/wc_sub.model";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";

export default async function (bot: TelegramBot, msg: Message, command, commandName: string, user: any) {
  let isPermitted = requireRoleMiddleware(user, Role.Admin);
  if (!isPermitted) {
    await bot.sendMessage(msg.chat.id, `You are not allowed to do this command`)
    return
  }
  const exists = await WcSubModel.find({
    chatId: msg.chat.id
  });
  if (exists.length === 0) {
    await WcSubModel.create({
      chatId: msg.chat.id
    })
    await bot.sendMessage(msg.chat.id, 'Tin tức World Cup 2022 sẽ được gửi tới bạn.');
  } else {
    await bot.sendMessage(msg.chat.id, 'Bạn đã đăng ký tin tức World Cup 2022 sẵn rồi.');
  }
}
