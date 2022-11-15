import dotenv from 'dotenv';
dotenv.config();
import {BotService} from "@/services/BotService";
import {WebServer} from "./services/WebServer";

global.__root = __dirname;

WebServer.register(() => {
  BotService.register();
});
