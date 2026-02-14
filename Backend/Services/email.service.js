import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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