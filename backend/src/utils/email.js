import nodemailer from "nodemailer";

export const sendEmail = async (options) => {

  // ── Option 1: Resend (recommended for Render – uses HTTPS, no SMTP IPv6 issues) ──
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${process.env.SMTP_FROM_NAME || "Red Rose Mart"} <${process.env.RESEND_FROM_EMAIL}>`,
        to: [options.email],
        subject: options.subject,
        text: options.message,
        html: options.html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      throw new Error(data.message || "Failed to send email via Resend");
    }
    console.log("✅ Email sent via Resend:", data.id);
    return;
  }

  // ── Option 2: SMTP via Nodemailer ──
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME || "Red Rose Mart"} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    });
    console.log("✅ Email sent via SMTP");
    return;
  }

  // ── Option 3: No config – log to console (for local dev) ──
  console.warn("⚠️  No email provider configured. Logging to console instead:");
  console.log("--------------------------------------------------");
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Message: ${options.message}`);
  if (options.html) console.log(`HTML: ${options.html}`);
  console.log("--------------------------------------------------");
};
