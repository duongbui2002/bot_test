import fetch from 'node-fetch';
import {BotService} from "@/services/BotService";

export class GarenaWatcherService {
    static intervalId: any;
    static register() {
        this.intervalId = setInterval(async () => {
            const data = await this.getStatus();
            console.log(data);
        }, 5000);
    }

    static getStatus() {
        const data = await fetch('https://game.garena.com/api/unit_status_get', {
            method: 'post',
            body: JSON.stringify({
                "session_token":"34fce0657d09be14c0e0f3b5c68f9e36a86b1306abde62ad8714b355cd7a4445",
                "client_version":125110842,"client_type":0,"country":"VN","language":"vi","unit_id":2,"branch_id":31
            }),
            headers: {'Content-Type': 'application/json'}
        }).then(r => r.json());
        return data;
    }
}