import express from "express";
import {appRouters} from "@/routers";

export class WebServer {
  static app;
  static port = process.env.PORT;

  static register(callback) {
    this.app = express();
    this.app.listen(this.port, (error) => {
      if (!error) {
        console.log("WebServer successfully started.");
      } else callback(this.app);
    });
    this.app.use(appRouters);
  }
}
