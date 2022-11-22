import TelegramBot, {Message} from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import {handleMergeRequestEvent, handlePayloadPushEvent, handlePipelineEvent} from "@/utils/handleData";
import {UserModel} from "@/models/user.model";

export class BotService {
  static token = process.env.BOT_TOKEN;
  static bot;

  static register() {
    this.bot = new TelegramBot(this.token, {polling: true});
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
          const commandName = msg.text.substring(entity.offset, entity.length).replace('/', '');
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
    if (payload.object_kind === 'push')
      await this.bot.sendMessage(msgId, handlePayloadPushEvent(payload), {parse_mode: 'HTML'});
    if (payload.object_kind === 'merge_request') {
      await this.bot.sendMessage(msgId, handleMergeRequestEvent(payload), {parse_mode: 'HTML'});
    }
    if (payload.object_kind === 'pipeline') {
      await this.bot.sendMessage(msgId, handlePipelineEvent(payload), {parse_mode: 'HTML'});
    }
    return
  }
}
