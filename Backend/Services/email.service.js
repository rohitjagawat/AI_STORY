import { Resend } from 'resend';
import path from 'path';
import fs from 'fs';

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendStoryEmail(customerEmail, childName, bookId) {
  const pdfPath = path.join("output", `${bookId}.pdf`);

  // Verify PDF exists
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF not found at: ${pdfPath}`);
    return false;
  }

  try {
    console.log(`📨 Sending PDF via Resend API to ${customerEmail}...`);
    
    // Read the PDF file into a buffer
    const pdfBuffer = fs.readFileSync(pdfPath);

    const { data, error } = await resend.emails.send({
      from: 'Magic Storybook <onboarding@resend.dev>', // After domain verify, use your domain
      to: customerEmail,
      subject: `✨ Your Magical Storybook for ${childName} is ready!`,
      html: `<strong>Hi!</strong><br><br>Your custom storybook for <strong>${childName}</strong> has been created with love. Please find the PDF attached to this email.<br><br>Happy Reading!`,
      attachments: [
        {
          filename: `${childName}_Storybook.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      return false;
    }

    console.log("✅ SUCCESS: Email sent via Resend!", data.id);
    return true;
  } catch (error) {
    console.error("❌ Resend Service Crash:", error.message);
    return false;
  }
}