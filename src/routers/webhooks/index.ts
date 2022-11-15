import express from "express";
import {gitLabWebhooks} from "@/controllers/gitlab/webhooks";

export const webhookRouter = express.Router();
webhookRouter.post('/gitlab', gitLabWebhooks);
webhookRouter.get('/gitlab', (req, res) => res.json({type: 'OK'}));
