import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";

export class BotService {
  static token = process.env.BOT_TOKEN;
  static bot;

  static register() {
    this.bot = new TelegramBot(this.token, {polling: true});

    this.bot.onText(/\/(.+)(.*)/, this.processCommands)
  }

  static processCommands(msg) {
    const chatId = msg.chat.id;
    const bot = this.bot;
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
              console.log(e);
              bot.sendMessage(chatId, 'Failed to execute command.');
            }
          } else {
            bot.sendMessage(chatId, 'Command currently not supported.');
          }
        }
      }
    }
  }
}
