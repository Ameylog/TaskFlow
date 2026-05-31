import nodemailer from "nodemailer";
import mjml2html from "mjml";
import { taskAssignedTemplate } from "./templates/taskAssign";
import { passwordResetTemplate } from "./templates/passwordReset";

type PasswordResetEmail = {
  template: "passwordReset";
  to: string;
  subject: string;
  resetUrl: string;
};

type TaskAssignedEmail = {
  template: "taskAssigned";
  to: string;
  subject: string;
  userName: string;
  taskTitle: string;
  dueDate: string | null;
  taskUrl: string;
  actorName?: string;
};

type SendEmailOptions = PasswordResetEmail | TaskAssignedEmail;


export const sendEmail = async (options: SendEmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mjmlTemplate = "";

  if (options.template === "passwordReset") {
    mjmlTemplate = passwordResetTemplate(options.to, options.resetUrl);
  }

  if (options.template === "taskAssigned") {
    mjmlTemplate = taskAssignedTemplate(
      options.userName,
      options.taskTitle,
      options.dueDate,
      options.taskUrl,
      options?.actorName
    );
  }

  const { html } = mjml2html(mjmlTemplate);

  await transporter.sendMail({
    from: `"Task Management Application" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html,
  });
};
