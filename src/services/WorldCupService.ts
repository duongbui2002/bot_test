import fetch from 'node-fetch';
import {WcSubModel} from "@/models/wc_sub.model";
import {BotService} from "@/services/BotService";

export class WorldCupService {
  static leagueId = '4265';
  static currentMatches = {};
  static async getMatches() {
    const data = await fetch('https://gw.vnexpress.net/football/fixture?league_id=' + this.leagueId).then(r => r.json());
    return data.data[this.leagueId].data;
  }
  static async getCurrentMatches() {
    const matches = await this.getMatches();
    const currentMatches = matches.filter(match => match.status !== 'Not Started' && match.status !== 'Match Finished');
    if (!(currentMatches && currentMatches.length > 0)) {
      return [];
    }
    return currentMatches;
  }
  static async getMatchEvents(matchId: string | number) {
    const data = await fetch('https://gw.vnexpress.net/football/fixture/event?fixture_id=' + matchId).then(r => r.json());
    return data.data[matchId];
  }
  static register() {
    setInterval(async () => {
      // automatically subscribe
      const matches = await this.getCurrentMatches();
      let subscribers = await WcSubModel.find();
      for (let match of matches) {
        const matchId = match.fixture_id;
        const {data: matchEvents, fixture_detail} = await this.getMatchEvents(matchId);
        const teams = [fixture_detail.home_team, fixture_detail.away_team];
        if (typeof this.currentMatches[matchId] === 'undefined') {
          for (let sub of subscribers) {
            BotService.bot.sendMessage(sub.chatId, `📣📣📣 TRẬN ĐẤU BẮT ĐẦU\n${teams[0].team_name} - ${teams[1].team_name}`);
          }
          this.currentMatches[matchId] = [];
        }
        for (let event of matchEvents) {
          const eventTick = this.createEventTick(event);
          if (!this.currentMatches[matchId].includes(eventTick)) {
            this.currentMatches[matchId].push(eventTick);
            switch (event.type) {
              case "Goal":
                let targetTeam = teams.find(x => x.team_name !== event.team_name);
                for (let sub of subscribers) {
                  BotService.bot.sendMessage(sub.chatId, `🎉🎉🎉\nPhút ${event.elapsed}. VÀO!!! ${event.player} vừa ghi bàn vào lưới ${targetTeam.team_name}.\n`+
                  `Tỉ số hiện tại ${teams[0].team_name} ${fixture_detail.goals_home_team} - ${fixture_detail.goals_away_team} ${teams[1].team_name}`);
                }
                break;
              case "subst":
                for (let sub of subscribers) {
                  BotService.bot.sendMessage(sub.chatId, `🏃🏽🏃🏽🏃🏽\nPhút ${event.elapsed}. Đội ${event.team_name} thay người.\n`+
                    `${event.player} vào sân thay cho ${event.assist}`);
                }
                break;
              case "Card":
                for (let sub of subscribers) {
                  const isYellow = event.detail === 'Yellow Card';
                  const emoji = isYellow ? "🟨🟨🟨": "🟥🟥🟥";
                  BotService.bot.sendMessage(sub.chatId, `${emoji} Phút ${event.elapsed}. THẺ ${isYellow ? "VÀNG": "ĐỎ"} cho ${event.player}.`);
                }
                break;
            }
          }
        }

      }
      for (let match in this.currentMatches) {
        if (!matches.map(x => x.fixture_id).includes(match)) {
          delete this.currentMatches[match];
        }
      }
    }, 5000);
  }
  static createEventTick(event) {
    return event.type + '_' + event.elapsed + '_' + event.team_id + '_' + event.player_id;
  }
}
