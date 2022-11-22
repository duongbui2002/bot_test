import TelegramBot, {Message} from "node-telegram-bot-api";
import {WorldCupService} from "@/services/WorldCupService";
import moment from "moment-timezone";

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setDate(end.getDate() + 1)
  end.setUTCHours(23, 59, 59, 999);

  const matches = await WorldCupService.getMatches();
  const todayMatches = matches.filter(match => {
    return start.getTime() < match.event_timestamp * 1000 && match.event_timestamp * 1000 < end.getTime();
  });
  if (todayMatches.length === 0) {
    await bot.sendMessage(msg.chat.id, `Hôm nay và ngày mai không có trận nào`);
  }
  moment.locale('vi');
  for (let match of todayMatches) {
    const isFinished = match.status_short === 'FT';
    const notStarted = !isFinished || (match.status_short !== 'NS');
    const matchTime = moment(match.event_timestamp * 1000).tz('Asia/Ho_Chi_Minh').calendar();
    const matchStatus = isFinished ? 'Đã kết thúc' : notStarted ? 'Chưa bắt đầu' : 'Đang diễn ra';
    const teamsPhrase = `${match.away_team.team_name} - ${match.home_team.team_name}`;
    await bot.sendMessage(msg.chat.id, `${matchTime} (${matchStatus})\n${teamsPhrase}\n\n${match.score && match.score.fulltime ? `Tỉ số ${match.score.fulltime}`:""}`);
  }
}
