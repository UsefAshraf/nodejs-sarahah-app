import express from "express";
import { Database_connect } from "./DB/connection.js";
import { config } from "dotenv";
config();
import authcontroller from "./Modules/Auth/authcontroller.js";
import usercontroller from "./Modules/User/user.controller.js";
import { globalErrorHandler } from "./Middleware/errorhandler.middleware.js";
import messageController from "./Modules/Message/message.controller.js";

async function startServer() {
  const app = express();
  app.use(express.json());
app.use("/auth", authcontroller);
app.use("/user", usercontroller);
app.use("/message",messageController);
  const PORT = process.env.PORT || 3000;

  await Database_connect();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  //error handling middleware return any html error to json
  app.use(globalErrorHandler);
}

startServer();