import './fetch-polyfill';
import dotenv from 'dotenv';
dotenv.config();
import {BotService} from "@/services/BotService";
import {WebServer} from "./services/WebServer";
import {DatabaseService} from "@/services/DatabaseService";
import {GarenaWatcherService} from "@/services/GarenaWatcherService";

global.__root = __dirname;
DatabaseService.connect().then(() => {
  console.log('Database has been connected.');
  WebServer.register(() => {
    BotService.register();
    GarenaWatcherService.register();
  });
});
