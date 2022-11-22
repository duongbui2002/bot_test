import TelegramBot, {Message} from "node-telegram-bot-api";
import {UserModel} from "@/models/user.model";
import {SubModel} from "@/models/sub.model";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {

  let isPermitted = requireRoleMiddleware(user, Role.Admin);
  if (!isPermitted) {
    await bot.sendMessage(msg.chat.id, `You are not allowed to do this command`)
    return
  }
  let response = `Are you sure about that?`
  await bot.sendMessage(msg.chat.id, response, {
    reply_markup: {
      inline_keyboard: [[{text: 'Yes', callback_data: `yes`}, {
        text: 'No',
        callback_data: `no`
      }]]
    }
  })

  let clearCollection = async function onCallbackQuery(callbackQuery) {
    switch (callbackQuery.data) {
      case 'yes':
        await SubModel.collection.drop()


        await bot.sendMessage(msg.chat.id, 'Clear successfully')
        bot.removeListener('callback_query', clearCollection)

        break;
      case 'no':
        await bot.sendMessage(msg.chat.id, 'Bye')
        bot.removeListener('callback_query', clearCollection)

        break;
    }


    return
  }
  bot.on("callback_query", clearCollection);
}