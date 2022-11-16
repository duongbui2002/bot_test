import express from "express";
import {appRouters} from "@/routers";
import bodyParser from "body-parser";

export class WebServer {
  static app;
  static port = process.env.PORT;

  static register(callback) {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.listen(this.port, (error) => {
      if (!error) {
        console.log("WebServer successfully started.");
        callback(this.app);
      }
    });
    this.app.use(appRouters);
  }
}
