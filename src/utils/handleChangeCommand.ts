import fs from "fs";
import path from "path";
import TelegramBot from "node-telegram-bot-api";

export const handleChangeCommand = async (msg, bot: TelegramBot, listener?: any) => {
  if (msg.entities && msg.entities.length !== 0) {
    for (let entity of msg.entities) {
      if (entity.type === 'bot_command') {
        const commandName = msg.text.substring(entity.offset, entity.length).replace('/', '');
        if (fs.existsSync(path.join(global.__root, 'commands', commandName + '.ts'))) {
          await bot.sendMessage(msg.chat.id, '<b>Bye</b>', {
            reply_markup: {
              remove_keyboard: true
            },
            parse_mode: "HTML"
          });

          if (listener)
            bot.removeListener('message', listener);
          return true
        } else {
          return true
        }
      }
    }
  }
  return false
}