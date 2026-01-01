import nodemailer from "nodemailer";

export async function sendStoryEmail(toEmail, bookId, pdfUrl) {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Jr Billionaire Stories" <${process.env.BREVO_SMTP_USER}>`,
    to: toEmail,
    subject: "📘 Your Personalized Storybook is Ready!",
    html: `
      <h2>Your storybook is ready ✨</h2>
      <p>Your personalized storybook PDF is ready.</p>

      <p>
        👉 <a href="${pdfUrl}" target="_blank">
        Click here to view / download your storybook
        </a>
      </p>

      <p>Happy reading 💖</p>
    `,
  });

  console.log("📧 Story email sent to:", toEmail);
}
