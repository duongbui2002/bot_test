import TelegramBot, {Message} from "node-telegram-bot-api";
import {WorldCupService} from "@/services/WorldCupService";
import moment from "moment-timezone";

export default async function (bot: TelegramBot, msg: Message, command: string, commandName: string, user: any) {
  const start = new Date();
  start.setUTCHours(0,0,0,0);
  const end = new Date();
  end.setDate(end.getDate() + 1)
  end.setUTCHours(23,59,59,999);

  const matches = await WorldCupService.getMatches();
  const todayMatches = matches.filter(match => {
    return start.getTime() < match.event_timestamp * 1000 && match.event_timestamp * 1000 < end.getTime();
  });
  if (todayMatches.length === 0) {
    await bot.sendMessage(msg.chat.id, `Hôm nay và ngày mai không có trận nào`);
  }
  moment.locale('vi');
  for (let match of todayMatches) {
    const isFinished = match.status === 'Match Finished';
    const isStarted = !isFinished && match.status !== 'Not Started';
    await bot.sendMessage(msg.chat.id, `${moment(match.event_timestamp * 1000).tz('Asia/Ho_Chi_Minh').calendar()}\n` +
    `${match.away_team.team_name} vs ${match.home_team.team_name} (${isFinished ? 'Đã kết thúc' : isStarted ? 'Đang diễn ra': 'Chưa bắt đầu'})` +
      (isStarted || isFinished) ? `Tỉ số ${match.score.fulltime}` : '');
  }
  console.log(matches);
}
