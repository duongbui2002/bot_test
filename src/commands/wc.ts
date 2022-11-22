import TelegramBot, {Message} from "node-telegram-bot-api";
import {WorldCupService} from "@/services/WorldCupService";
import requireRoleMiddleware, {Role} from "@/middlewares/requireRole.middleware";

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {
  let isPermitted = requireRoleMiddleware(user, Role.Admin);
  if (!isPermitted) {
    await bot.sendMessage(msg.chat.id, `You are not allowed to do this command`)
    return
  }
  const matches = await WorldCupService.getCurrentMatches();
  if (matches) {
    for (let match of matches) {
      await bot.sendMessage(msg.chat.id, `${match.away_team.team_name} (${match.goals_away_team}) - ${match.home_team.team_name} (${match.goals_home_team})\n` +
        `${match.status}, phút ${match.elapsed}\n` +
        `Sân ${match.venue}\n`);
    }
  } else {
    await bot.sendMessage(msg.chat.id, "No match is playing currently.");
  }
}
