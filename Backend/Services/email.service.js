import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

export async function sendBookEmail(userEmail, childName, bookId) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use 16-character App Password
    },
  });

  const pdfPath = path.resolve("output", `${bookId}.pdf`);

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF not found at ${pdfPath}`);
  }

  const mailOptions = {
    from: `"Jr. Billionaire" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🎁 Your Storybook: ${childName}'s Magical Adventure!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; color: #333;">
        <h2 style="color: #e11d48;">Your story is ready!</h2>
        <p>Hi there,</p>
        <p>Thank you for choosing <b>Jr. Billionaire</b>. We have finished crafting the personalized storybook for <b>${childName}</b>.</p>
        <p>You can find the PDF attached to this email. We hope you and your child enjoy this magical journey together!</p>
        <br />
        <p>Best regards,<br />The Jr. Billionaire Team</p>
      </div>
    `,
    attachments: [
      {
        filename: `${childName}_Magical_Story.pdf`,
        path: pdfPath,
      },
    ],
  };

  return await transporter.sendMail(mailOptions);
}