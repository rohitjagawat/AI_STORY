import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

export async function sendBookEmail(userEmail, childName, bookId) {
  // 1. Gmail configuration
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Aapka Gmail
      pass: process.env.EMAIL_PASS, // Google App Password (16 characters)
    },
  });

  // 2. PDF ka rasta (Path)
  const pdfPath = path.resolve("output", `${bookId}.pdf`);

  // Check karein ki PDF bani bhi hai ya nahi
  if (!fs.existsSync(pdfPath)) {
    throw new Error("PDF file not found for attachment.");
  }

  // 3. Email ka dabba (Options)
  const mailOptions = {
    from: `"Jr. Billionaire" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🎁 Surprise! Your Storybook for ${childName} is ready!`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Hello!</h2>
        <p>The magical story for <b>${childName}</b> is now ready.</p>
        <p>We have attached the personalized PDF to this email.</p>
        <p>Happy reading!<br><b>Team Jr. Billionaire</b></p>
      </div>
    `,
    attachments: [
      {
        filename: `${childName}_Storybook.pdf`,
        path: pdfPath,
      },
    ],
  };

  // 4. Bhej do!
  return await transporter.sendMail(mailOptions);
}