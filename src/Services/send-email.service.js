// Services/send-email.service.js
import nodemailer from "nodemailer";
import { emailTemplate } from "../Utils/email.template.util.js";
import EventEmitter from "events";
import dotenv from "dotenv";
dotenv.config({ path: "../EnvironmentVariables/.env" });

console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASSWORD);
export const Sendmailservice = async ({ to, subject, message, attachments = [] }) => {
  try {
    const EMAIL = process.env.EMAIL_USER || "usefmoez@gmail.com";
    const PASSWORD = process.env.EMAIL_PASSWORD || "bedadgydwoacswcu";

    if (!EMAIL || !PASSWORD) {
      console.log("Email or password not found");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: EMAIL, pass: PASSWORD },
    });

    const info = await transporter.sendMail({
      from: `"Youssef" <${EMAIL}>`,
      to,
      subject,
      html: emailTemplate({ subject, message }),
      attachments,
    });

    return info;
  } catch (error) {
    console.log("Email sending failed:", error);
  }
};

/* ------------------ EVENT EMITTER ------------------ */

export const emitter = new EventEmitter();

emitter.on("SendEmail", ({ to, subject, message, attachments = [] }) => {
  Sendmailservice({ to, subject, message, attachments })
    .then(() => console.log("Email event executed successfully"))
    .catch((err) => console.log("Email event failed:", err));
});
