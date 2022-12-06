import express from "express";
import {appRouters} from "@/routers";
import bodyParser from "body-parser";
import passport from "passport";
import GitLabStrategy from 'passport-gitlab2'

export class WebServer {
  static app;
  static port = process.env.PORT;

  static register(callback) {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(appRouters);
    passport.use(new GitLabStrategy({
      clientID: process.env.GITLAB_APPLICATION_ID,
      clientSecret: process.env.GITLAB_SECRET,
      callbackURL: "http://127.0.0.1/oauth/gitl0ab/callback"
    }, function (accessToken, refreshToken, profile, cb) {
      console.log(refreshToken)
      return cb(null, profile)
    }))

    this.app.get('/auth/gitlab', passport.authenticate('gitlab'));
    this.app.get('/oauth/gitlab/callback',
      passport.authenticate('gitlab', {
        failureRedirect: '/login',
        session: false
      }), function (req, res) {

        res.json("success")
      });

    this.app.listen(this.port, (error) => {
      if (!error) {
        console.log("WebServer successfully started.");
        callback(this.app);
      }
    });
  }
}
