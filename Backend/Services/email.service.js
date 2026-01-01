import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function sendStoryEmail(toEmail, bookId) {
  const pdfPath = path.join("output", `${bookId}.pdf`);

  if (!fs.existsSync(pdfPath)) {
    throw new Error("PDF not found");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Jr Billionaire Stories" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "📘 Your Personalized Storybook is Ready!",
    html: `
      <h2>Your storybook is ready ✨</h2>
      <p>We’ve attached your personalized PDF storybook.</p>
      <p>Thank you for creating a magical story with us 💖</p>
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
