import TelegramBot, {CallbackQuery, Message} from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import {handleMergeRequestEvent, handlePayloadPushEvent, handlePipelineEvent} from "@/utils/handleData";
import {UserModel} from "@/models/user.model";
import {DetailMessageModel} from "@/models/detail_message.model";

export class BotService {
  static token = process.env.BOT_TOKEN;
  static bot;
  static data = {};


  static register() {
    this.bot = new TelegramBot(this.token, {polling: true});
    this.bot.on('callback_query', async (callbackQuery: CallbackQuery) => {
      const messageDetail = await DetailMessageModel.findOne({_id: callbackQuery.data})
      const userId = callbackQuery.from.id
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
    if (msg.entities && msg.entities.length !== 0) {
      for (let entity of msg.entities) {
        if (entity.type === 'bot_command') {
          const commandName = msg.text.substring(entity.offset, entity.length).replace('/', '').split('@')[0];
          const commandString = msg.text.substring(entity.offset + entity.length + 1);
          if (fs.existsSync(path.join(global.__root, 'commands', commandName + '.ts'))) {
            try {
              const processor = require(`@/commands/${commandName}`).default;
              processor(bot, msg, commandName, commandString, user);
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
      console.log('')
      const newMessageDetail = await DetailMessageModel.create({content: messageResponse, type: 'push'})

      await this.bot.sendMessage(msgId, `<b>${payload.user_name} has just pushed ${payload.total_commits_count} commits on ${payload.project.name} \n\n</b>`, {
        reply_markup: {
          inline_keyboard: [[{text: 'Detail', callback_data: newMessageDetail._id.toString(),}]],

        },
        parse_mode: 'HTML'

      })
    }

    if (payload.object_kind === 'merge_request') {
      const messageResponse = handleMergeRequestEvent(payload)

      const newMessageDetail = await DetailMessageModel.create({content: messageResponse, type: 'merge_request'})
      await this.bot.sendMessage(msgId, `<b>A merge request has been ${payload.object_attributes.state} by ${payload.user.name} \n\n</b>`, {
        reply_markup: {
          inline_keyboard: [[{text: 'Detail', callback_data: newMessageDetail._id.toString()}]]
        },
        parse_mode: 'HTML'
      })
    }

    if (payload.object_kind === 'pipeline') {
      const messageResponse = handlePipelineEvent(payload)

      const newMessageDetail = await DetailMessageModel.create({content: messageResponse, type: 'pipeline'})
      await this.bot.sendMessage(msgId, `<b>A pipeline has been activated by ${payload.user.name}:</b>`, {
        reply_markup: {
          inline_keyboard: [[{text: 'Detail', callback_data: newMessageDetail._id.toString()}]]
        },
        parse_mode: 'HTML'
      })
    }


    let sendDetails = async function onCallbackQuery(callbackQuery: CallbackQuery) {
      const eventType = callbackQuery.data;
      const userId = callbackQuery.from.id

      switch (eventType) {
        case 'push':
          await bot.sendMessage(userId, handlePayloadPushEvent(payload), {parse_mode: 'HTML'});

          break;
        case 'merge_request':
          await bot.sendMessage(userId, handleMergeRequestEvent(payload), {parse_mode: 'HTML'});
          break;
        case 'pipeline':
          await bot.sendMessage(userId, handlePipelineEvent(payload), {parse_mode: 'HTML'});
          break;
      }

      //bot.removeListener('callback_query', sendDetails)
      return
    }

    return
  }
}
