import TelegramBot from "node-telegram-bot-api";
import {handleChangeCommand} from "@/utils/handleChangeCommand";

export default function (bot: TelegramBot, msg, command, args) {
  console.log('run')
  let testListener = async (msg) => {
    let isOut = await handleChangeCommand(msg, bot, testListener)

    if (isOut) {
      return
    }
    console.log(msg.text)

  }
  bot.on('message', testListener)
}
