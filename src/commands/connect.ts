import TelegramBot, {Message} from "node-telegram-bot-api";
import {AuthCodeModel} from "@/models/auth-code.model";
import {UserModel} from "@/models/user.model";
import {Document} from "mongoose";
import {GitlabConnectionModel} from "@/models/gitlab-connection";


function randomString(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user, token?: string) {
  const existGitlabConnection = await GitlabConnectionModel.findOne({owner: user._id})
  if (existGitlabConnection) {
    await bot.sendMessage(msg.chat.id, `You have connected to Gitlab.`, {parse_mode: 'HTML'})
    return
  }
  const code = randomString(20);
  await AuthCodeModel.create({
    code: code,
    owner: user._id,
  });
  await bot.sendMessage(msg.chat.id, `${process.env.BASE_URL}/oauth/gitlab?auth_code=${code}`, {parse_mode: 'HTML'})

  return
}