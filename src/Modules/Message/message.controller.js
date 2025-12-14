import { Router } from "express";
import * as messageService from "./Services/message.service.js";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";

const messageController = Router();

messageController.post("/send-message", messageService.sendMessageService);
messageController.get("/get-messages", messageService.getMessagesService);
messageController.get(
  "/get-user-messages",
  authenticationMiddleware(),
  messageService.getUserMessageService
);

export default messageController;
