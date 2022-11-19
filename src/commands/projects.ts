import TelegramBot, {ReplyKeyboardMarkup} from "node-telegram-bot-api";
import {KeyboardButton} from "node-telegram-bot-api";

import {html as format} from 'telegram-format';
import {GitlabHttpService} from "@/services/HttpService";
import {handleGetProjectRes} from "@/utils/handleData";
import {handleChangeCommand} from "@/utils/handleChangeCommand";

export default async function (bot: TelegramBot, msg, command, args) {
  let {data, totalPages, prevPage, nextPage} = await GitlabHttpService.getUserProject('10005623');

  let response = await handleGetProjectRes(data)
  response = format.bold(response)
  await bot.sendMessage(msg.chat.id, response, {parse_mode: "HTML",});
  let prevButton: KeyboardButton = {
    text: 'Prev'
  }
  let nextButton: KeyboardButton = {
    text: 'Next'
  }

  let exitButton: KeyboardButton = {
    text: 'Exit'
  }


  await bot.sendMessage(msg.chat.id, "Enter the page you want:", {
    reply_markup: {
      keyboard: [[prevButton, nextButton], [exitButton]],
      resize_keyboard: true
    }
  });

  let handleSelectPage = async (msg) => {
    let isOut = await handleChangeCommand(msg, bot, handleSelectPage)
    if (isOut) {
      return
    }
    switch (msg.text.toString()) {
      case 'Prev':
        if (prevPage.length !== 0) {
          const result = await GitlabHttpService.getUserProject('10005623', prevPage);
          prevPage = result.prevPage
          nextPage = result.nextPage
          response = format.bold(await handleGetProjectRes(result.data))
          await bot.sendMessage(msg.chat.id, response, {parse_mode: "HTML",});
        } else {
          await bot.sendMessage(msg.chat.id, '<b>Already on first page</b>', {parse_mode: "HTML",});
        }
        break;
      case 'Next':
        if (nextPage.length !== 0) {
          const result = await GitlabHttpService.getUserProject('10005623', nextPage);
          prevPage = result.prevPage
          nextPage = result.nextPage

          response = format.bold(await handleGetProjectRes(result.data))
          await bot.sendMessage(msg.chat.id, response, {parse_mode: "HTML",});
        } else {
          await bot.sendMessage(msg.chat.id, '<b>Already on last page</b>', {parse_mode: "HTML",});
        }
        break;
      case 'Exit':
        await bot.sendMessage(msg.chat.id, 'Bye', {
          reply_markup: {
            remove_keyboard: true
          }
        });


        await bot.removeListener('message', handleSelectPage)

        break;
      default:
        if (!isNaN(+msg.text.toString())) {
          const result = await GitlabHttpService.getUserProject('10005623', msg.text.toString());
          prevPage = result.prevPage
          nextPage = result.nextPage
          if (result.data.length === 0) {
            prevPage = '1';
            nextPage = '1';
            await bot.sendMessage(msg.chat.id, '<b>Page does not exist</b>', {parse_mode: "HTML",});
          } else {

            await bot.sendMessage(msg.chat.id, await handleGetProjectRes(result.data), {parse_mode: "HTML",});
          }
        } else {
          await bot.sendMessage(msg.chat.id, '<b>Invalid page.</b>', {parse_mode: "HTML",});
        }
    }
  }

  bot.on('message', handleSelectPage)
  return
}

