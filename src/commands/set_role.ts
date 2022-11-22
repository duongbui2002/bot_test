import TelegramBot, {Message} from "node-telegram-bot-api";
import {UserModel} from "@/models/user.model";

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {
  if (msg.from.id.toString() !== process.env.SUPER_ADMIN) {
    await bot.sendMessage(msg.chat.id, 'You are not allowed to do this command')
    return
  }

  if (!commandName) {
    await bot.sendMessage(msg.chat.id, 'User id  must be required.')
    return
  }
  let updatedUser = await UserModel.findOne({telegramId: commandName})
  if (!updatedUser) {
    await bot.sendMessage(msg.chat.id, 'User does not exist')
    return
  }

  let response = `User with id #${updatedUser.telegramId} has role: ${updatedUser.role}.
Change role to:`
  await bot.sendMessage(msg.chat.id, response, {
    reply_markup: {
      inline_keyboard: [[{text: 'ADMIN', callback_data: `${updatedUser.telegramId} ADMIN`}, {
        text: 'USER',
        callback_data: `${updatedUser.telegramId} USER`
      }]]
    }
  })

  let updateRoleCallbackQuery = async function onCallbackQuery(callbackQuery) {
    const newRole = callbackQuery.data.split(' ')[1]
    const telegramId = callbackQuery.data.split(' ')[0]

    await UserModel.updateOne({telegramId}, {$set: {role: newRole}})
    await bot.sendMessage(msg.chat.id, 'Change role successfully')
    bot.removeListener('callback_query', updateRoleCallbackQuery)
    return
  }
  bot.on("callback_query", updateRoleCallbackQuery);
}