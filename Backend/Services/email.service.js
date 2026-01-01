import sgMail from "@sendgrid/mail";
import fs from "fs";
import path from "path";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendStoryEmail(toEmail, bookId) {
  const pdfPath = path.join("output", `${bookId}.pdf`);

  if (!fs.existsSync(pdfPath)) {
    throw new Error("PDF not found");
  }

  const msg = {
    to: toEmail,
    from: "stories@jrbillionaire.com", // 👈 sender email
    subject: "📘 Your Personalized Storybook is Ready!",
    html: `
      <h2>Your storybook is ready ✨</h2>
      <p>Your personalized storybook PDF is attached.</p>
      <p>Enjoy reading! 💖</p>
    `,
    attachments: [
      {
        content: fs.readFileSync(pdfPath).toString("base64"),
        filename: "Your-Storybook.pdf",
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  };

  await sgMail.send(msg);

  console.log("📧 Story email sent to:", toEmail);
}
