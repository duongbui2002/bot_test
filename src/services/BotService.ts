import TelegramBot, {CallbackQuery, Message} from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import {
  handleCommit,
  handleLastCommitInMergeRequest,
  handleMergeRequestEvent,
  handlePayloadPushEvent,
  handlePipelineEvent
} from "@/utils/handleData";
import {UserModel} from "@/models/user.model";
import {DetailMessageModel} from "@/models/detail_message.model";
import {CallbackQueryEnum} from "@/enums/CallbackQueryEnum";
import {GitlabService} from "@/services/HttpService";
import {MergeRequest, MergeRequestModel} from "@/models/merge_request.model";
import {GitlabConnectionModel} from "@/models/gitlab-connection";
import moment from "moment";


const PublicServiceCommand = ['wc', 'wc_sub', 'wc_today', 'id', 'help']

export class BotService {
  static token = process.env.BOT_TOKEN;
  static bot: TelegramBot;
  static data = {};


  static register() {
    this.bot = new TelegramBot(this.token, {polling: true});
    this.bot.on('callback_query', async (callbackQuery: CallbackQuery) => {


      const data = callbackQuery.data.split(' ')
      const callbackQueryType = callbackQuery.data.split(' ')[0]
      const userId = callbackQuery.from.id

      if (callbackQueryType === CallbackQueryEnum.SendNotification) {
        const messageDetail = await DetailMessageModel.findOne({_id: callbackQuery.data.split(' ')[1]})

        switch (messageDetail.type) {
          case 'push':
            await this.bot.sendMessage(userId, messageDetail.content, {parse_mode: 'HTML'});
            break;
          case 'merge_request':
            await this.bot.sendMessage(userId, messageDetail.content, {parse_mode: 'HTML'});
            break;
          case 'pipeline':
            await this.bot.sendMessage(userId, messageDetail.content, {parse_mode: 'HTML'});
            break;
        }
      }

      if (callbackQueryType === CallbackQueryEnum.SendMergeRequestToSuperAdmin) {

        let gitlabConnection = await GitlabConnectionModel.findOne({ownerTelegramId: userId})

        if (!gitlabConnection) {
          await this.bot.sendMessage(userId, 'Please connect to GitLab before using the NorthStudioBot service');
          return

        } else {
          const isExpired = moment(gitlabConnection.accessTokenExpiresAt).isBefore(moment(Date.now()))
          if (isExpired) {
            const result = await GitlabService.refreshGitlabToken(gitlabConnection.refreshToken)
            if (!result) {
              await this.bot.sendMessage(userId, 'Please connect to GitLab again before using the NorthStudioBot service');
              return
            }
            gitlabConnection = await GitlabConnectionModel.findOne({_id: gitlabConnection._id})
          }
        }
        const projectID = data[2]
        const action = data[1]
        const mergeRequestIID = data[3]


        await MergeRequestModel.deleteOne({projectId: projectID, iid: mergeRequestIID})
        switch (action) {
          case 'merge':
            const result = await GitlabService.mergeRequest(projectID, mergeRequestIID, gitlabConnection.accessToken);
            console.log(result)
            await this.bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id.toString())
            await this.bot.sendMessage(callbackQuery.message.chat.id, 'Merged request successfully')
            break


          case 'close': {
            await GitlabService.closeMergeRequest(projectID, mergeRequestIID, gitlabConnection.accessToken);
            await this.bot.deleteMessage(callbackQuery.message.chat.id, callbackQuery.message.message_id.toString())
            await this.bot.sendMessage(callbackQuery.message.chat.id, 'Closed request successfully')
            break
          }

        }
      }

    })

    this.bot.onText(/\/(.+)(.*)/, (args) => this.processCommands(args));
  }

  static async processCommands(msg: Message) {
    const chatId = msg.chat.id;
    const bot: TelegramBot = this.bot;
    let user = await UserModel.findOne({telegramId: msg.from.id})
    if (!user) {
      user = await UserModel.create({telegramId: msg.from.id, name: `${msg.from.first_name} ${msg.from.last_name}`})
    }

    let gitlabConnection = await GitlabConnectionModel.findOne({owner: user._id})


    if (msg.entities && msg.entities.length !== 0) {
      for (let entity of msg.entities) {
        if (entity.type === 'bot_command') {
          const commandName = msg.text.substring(entity.offset, entity.length).replace('/', '').split('@')[0];
          const commandString = msg.text.substring(entity.offset + entity.length + 1);


          if (!PublicServiceCommand.includes(commandName)) {
            if (!gitlabConnection) {
              if (commandName !== 'connect') {
                await bot.sendMessage(chatId, 'Please connect to GitLab before using the NorthStudioBot service');
                return
              }
            } else {
              const isExpired = moment(gitlabConnection.accessTokenExpiresAt).isBefore(moment(Date.now()))
              if (isExpired) {
                const result = await GitlabService.refreshGitlabToken(gitlabConnection.refreshToken)
                if (!result) {
                  await bot.sendMessage(chatId, 'Please connect to GitLab again before using the NorthStudioBot service');
                  return
                }
                gitlabConnection = await GitlabConnectionModel.findOne({_id: gitlabConnection._id})
              }
            }
          }

          if (fs.existsSync(path.join(global.__root, 'commands', commandName + '.ts'))) {
            try {
              const processor = require(`@/commands/${commandName}`).default;
              processor(bot, msg, commandName, commandString, user, gitlabConnection?.accessToken);
            } catch (e) {
              console.log(e)
              await bot.sendMessage(chatId, 'Failed to execute command.');
            }
          } else {
            await bot.sendMessage(chatId, `The command is currently not supported. Use command /help to see all available commands `);
          }
        }
      }
    }
  }

  static async sendNotification(payload: any, msgId: string) {
    let bot: TelegramBot = this.bot

    if (payload.object_kind === 'push') {

      const messageResponse = handlePayloadPushEvent(payload)

      const commits = payload.commits;
      const lastPushCommit = handleCommit(commits[commits.length - 1])

      const newMessageDetail = await DetailMessageModel.create({content: messageResponse, type: 'push'})

      await this.bot.sendMessage(msgId, `<b>${payload.user_name} has just pushed ${payload.total_commits_count} commits on ${payload.project.name} \n\n <b>Last commit: \n</b> ${lastPushCommit}</b>`, {
        reply_markup: {
          inline_keyboard: [[{
            text: 'Detail',
            callback_data: `${CallbackQueryEnum.SendNotification} ${newMessageDetail._id.toString()}`
          }]],

        },
        parse_mode: 'HTML'

      })
    }

    if (payload.object_kind === 'merge_request') {
      const messageResponse = handleMergeRequestEvent(payload)

      const lastMergeCommit = handleLastCommitInMergeRequest(payload.object_attributes.last_commit)
      const newMessageDetail = await DetailMessageModel.create({content: messageResponse, type: 'merge_request'})
      await this.bot.sendMessage(msgId, `<b>A merge request has been ${payload.object_attributes.state} by ${payload.user.name} \n\n<b>Last commit: \n</b> ${lastMergeCommit}</b>`, {
        reply_markup: {
          inline_keyboard: [[{
            text: 'Detail',
            callback_data: `${CallbackQueryEnum.SendNotification} ${newMessageDetail._id.toString()}`
          }]]
        },
        parse_mode: 'HTML'
      })
    }

    if (payload.object_kind === 'pipeline') {
      const messageResponse = handlePipelineEvent(payload)

      const newMessageDetail = await DetailMessageModel.create({content: messageResponse, type: 'pipeline'})
      await this.bot.sendMessage(msgId, `<b>A pipeline has been activated by ${payload.user.name}:</b>`, {
        reply_markup: {
          inline_keyboard: [[{
            text: 'Detail',
            callback_data: `${CallbackQueryEnum.SendNotification} ${newMessageDetail._id.toString()}`
          }]]
        },
        parse_mode: 'HTML'
      })
    }

    return
  }

  static async sendMergeRequestForSuperAdmin(payload: any, msgId: string) {
    let bot: TelegramBot = this.bot

    const newMessage = await this.bot.sendMessage(msgId, handleMergeRequestEvent(payload), {
      reply_markup: {
        inline_keyboard: [[{
          text: 'Merge',
          callback_data: `${CallbackQueryEnum.SendMergeRequestToSuperAdmin} merge ${payload.project.id} ${payload.object_attributes.iid}`
        }, {
          text: 'Close',
          callback_data: `${CallbackQueryEnum.SendMergeRequestToSuperAdmin} close ${payload.project.id} ${payload.object_attributes.iid}`
        }]]
      },
      parse_mode: 'HTML'
    })
    const newMergeRequest = await MergeRequestModel.create({
      iid: payload.object_attributes.iid,
      projectId: payload.project.id,
      chatID: newMessage.chat.id.toString(),
      messageID: newMessage.message_id.toString()
    })
  }

  static async deleteMergeRequestMessage(payload: any, msgId: string) {
    const mergeRequest = await MergeRequestModel.findOne({
      iid: payload.object_attributes.iid,
      projectId: payload.project.id
    })
    if (!mergeRequest) {
      // await this.bot.sendMessage(msgId, 'No merge request')
      return
    }
    await this.bot.deleteMessage(mergeRequest.chatID, mergeRequest.messageID)
    await MergeRequestModel.deleteOne({_id: mergeRequest._id})
    await this.bot.sendMessage(msgId, handleMergeRequestEvent(payload), {parse_mode: 'HTML'})
  }

  static async sendConnectSuccess(id: string) {
    await this.bot.sendMessage(id, 'Connect to Gitlab successfully')
    return
  }
}
