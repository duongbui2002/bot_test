import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import {handleMergeRequestEvent, handlePayloadPushEvent} from "@/utils/handleData";

export class BotService {
  static token = process.env.BOT_TOKEN;
  static bot;

  static register() {
    this.bot = new TelegramBot(this.token, {polling: true});
    this.bot.onText(/\/(.+)(.*)/, (args) => this.processCommands(args));
  }

  static async processCommands(msg) {
    const chatId = msg.chat.id;
    const bot: TelegramBot = this.bot;
    if (msg.entities && msg.entities.length !== 0) {
      for (let entity of msg.entities) {
        if (entity.type === 'bot_command') {
          const commandName = msg.text.substring(entity.offset, entity.length).replace('/', '');
          const commandString = msg.text.substring(entity.offset + entity.length + 1);
          if (fs.existsSync(path.join(global.__root, 'commands', commandName + '.ts'))) {
            try {

              const processor = require(`@/commands/${commandName}`).default;
              processor(bot, msg, commandName, commandString);
            } catch (e) {
              console.log(e)
              await bot.sendMessage(chatId, 'Failed to execute command.');
            }
          } else {
            await bot.sendMessage(chatId, 'Command currently not supported.');
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
    return
  }
}
