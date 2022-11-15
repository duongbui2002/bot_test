import dotenv from 'dotenv';
import TelegramBot from "node-telegram-bot-api";
import * as fs from "fs";
import path from "path";
global.__root = __dirname;
dotenv.config();


// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  bot.sendMessage(chatId, resp);
});

bot.onText(/\/(.+)(.*)/, (msg) => {
  const chatId = msg.chat.id;

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
            bot.sendMessage(chatId, 'Failed to execute command.');
          }
        } else {
          bot.sendMessage(chatId, 'Command currently not supported.');
        }
      }
    }
  }
});
