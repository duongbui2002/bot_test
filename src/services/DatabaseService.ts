import mongoose from "mongoose";

export class DatabaseService {
  static connectionUrl = process.env.MONGO_URL;
  static connection;

  static async connect() {
    const connectWithRetry = function () { // when using with docker, at the time we up containers. Mongodb take few seconds to starting, during that time NodeJS server will try to connect MongoDB until success.

      return mongoose.connect(DatabaseService.connectionUrl, {}, (err) => {
        if (err) {
          console.error('Failed to connect to mongo on startup - retrying in 5 sec', err)
          setTimeout(connectWithRetry, 5000)
        }
      })
    }

    if (!this.connectionUrl) {
      return new Error("Database Connection URL is not defined in env.");
    }
    //this.connection = await mongoose.connect(this.connectionUrl);
    connectWithRetry()
  }
}
