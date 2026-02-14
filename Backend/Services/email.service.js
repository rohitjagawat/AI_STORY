import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Try 465 for SSL or 587 for TLS
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // ✅ ADD THIS: Timeout settings badha do
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

export async function sendStoryEmail(customerEmail, childName, bookId) {
  // We assume the PDF is saved as "output/bookId.pdf"
  const pdfPath = path.join("output", `${bookId}.pdf`);

  const mailOptions = {
    from: `"Magic Storybook" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `✨ Your Magical Storybook for ${childName} is ready!`,
    text: `Hi! Your custom storybook for ${childName} has been created. Please find the PDF attached to this email.`,
    attachments: [
      {
        filename: `${childName}_Storybook.pdf`,
        path: pdfPath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Email failed:", error);
    return false;
  }
}