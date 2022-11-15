import dotenv from 'dotenv';
dotenv.config();
import {BotService} from "@/services/BotService";

global.__root = __dirname;

BotService.register();
