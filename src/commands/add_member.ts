import TelegramBot, {KeyboardButton, Message} from "node-telegram-bot-api";

import {html as format} from 'telegram-format';
import {GitlabService} from "@/services/HttpService";
import {handleGetProjectRes} from "@/utils/handleData";
import {handleChangeCommand} from "@/utils/handleChangeCommand";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";
import {CommandModel} from "@/models/command.model";

export default async function (bot: TelegramBot, msg: Message, command, commandName: string, user: any, token?: string) {

  let userIdButton: KeyboardButton = {
    text: 'userID'
  }
  let projectIDButton: KeyboardButton = {
    text: 'projectID'
  }

  let accessLevelButton: KeyboardButton = {
    text: 'accessLevel'
  }
  let doneButton: KeyboardButton = {
    text: 'Done'
  }
  let exitButton: KeyboardButton = {
    text: 'Exit'
  }
  const chatId = msg.chat.id

  await bot.sendMessage(chatId, "Select the field you want to add new.", {
    reply_markup: {
      keyboard: [[userIdButton, projectIDButton, accessLevelButton], [doneButton, exitButton]],
      force_reply: false
    },

  });

  let commandObj = await CommandModel.findOne({messageID: chatId})

  if (!commandObj) {
    commandObj = await CommandModel.create({name: 'add_member', status: 'progress', messageID: chatId, data: {}})
  }

  let handleAddMember = async (msg) => {
    let isOut = await handleChangeCommand(msg, bot, handleAddMember)
    if (isOut) {
      return
    }
    switch (msg.text.toString()) {
      case 'Exit':
        await bot.sendMessage(msg.chat.id, 'Bye', {
          reply_markup: {
            remove_keyboard: true
          }
        });

        await bot.removeListener('message', handleAddMember)

        break;

      case 'Done':
        break;
      case 'userID':
      case 'projectID':
      case 'accessLevel':
        let listenerReply;

        let contentMessage = await bot.sendMessage(msg.chat.id, `Type ${msg.text.toString()} you want: `, {
          "reply_markup": {
            "force_reply": true
          }
        });

        listenerReply = (async (replyHandler) => {
          bot.removeReplyListener(listenerReply);


          commandObj = await CommandModel.findByIdAndUpdate(commandObj._id, {
            data: {
              ...commandObj.data,
              [`${msg.text.toString()}`]: replyHandler.text
            }
          }, {new: true})


          await bot.sendMessage(replyHandler.chat.id, fact_obj(commandObj.data))

          await bot.sendMessage(replyHandler.chat.id, "Select the field you want to add new.", {
            reply_markup: {
              keyboard: [[userIdButton, projectIDButton, accessLevelButton], [doneButton, exitButton]],
              force_reply: false
            },
          })

        });

        bot.onReplyToMessage(contentMessage.chat.id, contentMessage.message_id, listenerReply);

        break;

      default:
        await bot.sendMessage(chatId, "Select the field you want to add new.", {
          reply_markup: {
            keyboard: [[userIdButton, projectIDButton, accessLevelButton], [doneButton, exitButton]],
            force_reply: false
          },
        })
        break
    }


    return
  }
  bot.on('message', handleAddMember)


}


function fact_obj(data: any) {
  let result = 'Request data:\n'
  for (const dataKey in data) {
    result += ` -) ${dataKey} : ${data[dataKey]}\n`
  }

  return result
}