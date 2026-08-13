import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // If SMTP is not configured, we'll log the email content to the console
  // This allows the feature to be tested without needing an email server.
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP credentials not found in .env. Logging email to console instead:");
    console.log("--------------------------------------------------");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    if (options.html) {
      console.log(`HTML: ${options.html}`);
    }
    console.log("--------------------------------------------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // Fail fast after 10 seconds if unreachable
    greetingTimeout: 10000,
  });

  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME || "Red Rose Mart"} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};
