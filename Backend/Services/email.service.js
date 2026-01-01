import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function sendStoryEmail(toEmail, bookId) {
  const pdfPath = path.join("output", `${bookId}.pdf`);

  if (!fs.existsSync(pdfPath)) {
    throw new Error("PDF not found");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER, // your gmail
      pass: process.env.BREVO_SMTP_PASS, // xkeysib-xxxx
    },
  });

  await transporter.sendMail({
    from: `"Jr Billionaire Stories" <${process.env.BREVO_SMTP_USER}>`,
    to: toEmail,
    subject: "📘 Your Personalized Storybook is Ready!",
    html: `
      <h2>Your storybook is ready ✨</h2>
      <p>Your personalized storybook PDF is attached.</p>
      <p>Enjoy reading! 💖</p>
    `,
    attachments: [
      {
        filename: "Your-Storybook.pdf",
        path: pdfPath,
      },
    ],
  });

  console.log("📧 Story email sent to:", toEmail);
}
