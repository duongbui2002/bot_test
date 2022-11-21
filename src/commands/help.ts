import TelegramBot, {Message} from "node-telegram-bot-api";

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {
  const response =
    `<b>You can control me by sending these commands:</b> 
  +) /mysubs - See all your subscription projects
  +) /projects - See all available projects that you can subscribe to notifications
  +) /sub {id} - Subscribe to notifications about project with {id}
  +) /unsub {id} - Unsubscribe to notifications about project with {id} 
    `
  await bot.sendMessage(msg.chat.id, response, {parse_mode: "HTML"})
}