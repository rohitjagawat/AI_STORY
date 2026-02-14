import nodemailer from "nodemailer";
import path from "path";

// 1. Setup the transporter (The "Post Office")
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your App Password
  },
});

export async function sendStoryEmail(customerEmail, childName, bookId) {
  const pdfPath = path.join("output", `${bookId}.pdf`);

  const mailOptions = {
    from: '"Magic Storybook" <' + process.env.EMAIL_USER + '>',
    to: customerEmail,
    subject: `✨ Your Magical Storybook for ${childName} is here!`,
    text: `Hi there! Your custom storybook for ${childName} has been created successfully. Please find the PDF attached.`,
    attachments: [
      {
        filename: `${childName}_Storybook.pdf`,
        path: pdfPath,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${customerEmail}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}