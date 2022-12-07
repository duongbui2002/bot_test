import express from "express";
import {webhookRouter} from "./webhooks";
import {apiRouter} from "./api";
import {oAuthRouter} from "@/routers/oauth";

export const appRouters = express.Router();
appRouters.use('/webhook', webhookRouter);
appRouters.use('/api', apiRouter);

appRouters.use('/oauth', oAuthRouter)
