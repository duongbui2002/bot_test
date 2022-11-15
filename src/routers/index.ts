import express from "express";
import {webhookRouter} from "./webhooks";
import {apiRouter} from "./api";

export const appRouters = express.Router();
appRouters.use('/webhook', webhookRouter);
appRouters.use('/api', apiRouter);
