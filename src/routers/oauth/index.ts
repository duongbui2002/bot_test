import express from "express";
import passport from "passport";
import GitLabStrategy from 'passport-gitlab2'
import {AuthCodeModel} from "@/models/auth-code.model";
import {GitlabConnectionModel} from "@/models/gitlab-connection";
import moment from 'moment';
import {GitlabService} from "@/services/HttpService";
import {BotService} from "@/services/BotService";
import {UserModel} from "@/models/user.model";


passport.use(new GitLabStrategy({
  clientID: process.env.GITLAB_APPLICATION_ID,
  clientSecret: process.env.GITLAB_SECRET,
  callbackURL: `${process.env.BASE_URL}/oauth/gitlab/callback`,

}, function (accessToken, refreshToken, payload, profile, cb) {
  Object.assign(payload, {refresh_token: refreshToken})
  return cb(null, payload)
}))


export const oAuthRouter = express.Router()


oAuthRouter.get('/gitlab', (req, res, next) => {
    passport.authenticate('gitlab', {
      state: req.query.auth_code as string,
      scope: 'read_api api read_user read_repository write_repository'
    }, null)(req, res, next)
  }
);

oAuthRouter.get('/gitlab/callback',
  passport.authenticate('gitlab', {
    failureRedirect: '/login',
    session: false
  }), async function (req, res) {
    const {state} = req.query
    const payload: any = {...req.user}
    const authCode = await AuthCodeModel.findOne({code: state})
    if (!authCode) {
      throw Error('AuthCode is not found')
    }

    const owner = await UserModel.findOne({_id: authCode.owner})
    await GitlabConnectionModel.create({
      owner: owner,
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      accessTokenExpiresAt: payload.created_at + payload.expires_in,
      ownerTelegramId: owner.telegramId
    })

    await AuthCodeModel.deleteOne({code: state})
    await BotService.sendConnectSuccess(owner.telegramId)
    res.json("success")
  });
