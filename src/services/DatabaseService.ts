import mongoose from "mongoose";

export class DatabaseService {
  static connectionUrl = process.env.MONGO_URL;
  static connection;
  static async connect() {
    if (!this.connectionUrl) {
      return new Error("Database Connection URL is not defined in env.");
    }
    this.connection = await mongoose.connect(this.connectionUrl);
  }
}
