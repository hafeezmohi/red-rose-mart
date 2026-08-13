import nodemailer from "nodemailer";
import { google } from "googleapis";

export const sendEmail = async (options) => {

  // ── Option 1: Gmail API via OAuth2 (recommended — HTTPS, sends from your real Gmail, no SMTP port issues) ──
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const fromHeader = `${process.env.SMTP_FROM_NAME || "Red Rose Mart"} <${process.env.GMAIL_FROM_EMAIL || process.env.SMTP_USER}>`;
    const bodyContent = options.html || options.message;
    const contentType = options.html ? "text/html" : "text/plain";

    const rawMessage = [
      `From: ${fromHeader}`,
      `To: ${options.email}`,
      `Subject: ${options.subject}`,
      `Content-Type: ${contentType}; charset=utf-8`,
      "",
      bodyContent,
    ].join("\r\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    console.log("✅ Email sent via Gmail API:", res.data.id);
    return;
  }

  // ── Option 2: Resend (HTTPS, but sends from your own verified domain, not @gmail.com) ──
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

  // ── Option 3: SMTP via Nodemailer (often blocked on Render — kept as last resort / local dev) ──
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      family: 4, // Force IPv4 to avoid IPv6 ENETUNREACH on Render
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

  // ── Option 4: No config – log to console (for local dev) ──
  console.warn("⚠️  No email provider configured. Logging to console instead:");
  console.log("--------------------------------------------------");
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Message: ${options.message}`);
  if (options.html) console.log(`HTML: ${options.html}`);
  console.log("--------------------------------------------------");
};
