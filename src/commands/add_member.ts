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

        if (!commandObj.data.projectID || !commandObj.data.accessLevel || !commandObj.data.userID) {
          console.log('run')
          await bot.sendMessage(chatId, fact_obj(commandObj.data))

          await bot.sendMessage(chatId, "UserId, accessLevel, projectID are required; please add full.", {
            reply_markup: {
              keyboard: [[userIdButton, projectIDButton, accessLevelButton], [doneButton, exitButton]],
              force_reply: false
            },
          })
          return
        }


        const result = await GitlabService.addMemberToProject({
          projectID: commandObj.data.projectID,
          accessLevel: commandObj.data.accessLevel,
          userID: commandObj.data.userID
        }, token)

        if (result === null) {
          await bot.sendMessage(chatId, fact_obj(commandObj.data))
          await bot.sendMessage(chatId, "Unable to add members, please recheck the information.", {
            reply_markup: {
              keyboard: [[userIdButton, projectIDButton, accessLevelButton], [doneButton, exitButton]],
              force_reply: false
            },
          })
          return
        }

        if (result === 'Member already exists') {

          await bot.sendMessage(chatId, "Member already exists", {
            reply_markup: {
              remove_keyboard: true
            }
          })
          await CommandModel.deleteOne({_id: commandObj._id})
          await bot.removeListener('message', handleAddMember)
          return
        }

        if (result === '403 Forbidden') {

          await bot.sendMessage(chatId, "You are not authorized to add members to this project.", {
            reply_markup: {
              remove_keyboard: true
            }
          })
          await CommandModel.deleteOne({_id: commandObj._id})
          await bot.removeListener('message', handleAddMember)
          return
        }
        await bot.sendMessage(msg.chat.id, `Add member ${result.name} successfully.`, {
          reply_markup: {
            remove_keyboard: true
          }
        });
        await CommandModel.deleteOne({_id: commandObj._id})
        await bot.removeListener('message', handleAddMember)

        break;

      case 'userID':
      case 'projectID':
      case 'accessLevel':
        let listenerReply;
        let moreInfo = msg.text.toString() === 'accessLevel' ? '<pre>(0 - No access, 5 - Minimal access, 10 - Guest, 20 - Reporter, 30 - Developer, Maintainer - 40, Owner - 50)</pre>' : ''
        let contentMessage = await bot.sendMessage(msg.chat.id, `Type ${msg.text.toString()} you want ${moreInfo} `, {
          "reply_markup": {
            "force_reply": true
          },
          parse_mode: 'HTML'
        });

        listenerReply = (async (replyHandler) => {
          bot.removeReplyListener(listenerReply);


          commandObj = await CommandModel.findByIdAndUpdate(commandObj._id, {
            data: {
              ...commandObj.data,
              [`${msg.text.toString()}`]: msg.text.toString() === 'accessLevel' ? getAccessLevelValue(replyHandler.text) : replyHandler.text
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

function getAccessLevelValue(data: any) {
  let accessValue;
  const accessLevels = [0, 5, 10, 20, 30, 40, 50]
  if (!isNaN(data)) {
    if (!accessLevels.includes(data)) {
      return 30
    }
    return data
  }
  data = data.toLowerCase();
  switch (data) {
    case 'no access':
      accessValue = 0;
      break;
    case 'minimal access':
      accessValue = 5;
      break;
    case 'guest':
      accessValue = 10;
      break;
    case 'reporter':
      accessValue = 20;
      break;
    case 'developer':
      accessValue = 30;
      break;
    case 'maintainer':
      accessValue = 40;
      break;
    case 'owner':
      accessValue = 50;
      break;
    default:
      accessValue = 30
  }

  return accessValue
}