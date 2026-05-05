// 📧 Mailer — uses nodemailer + Gmail by default (matches your existing .env).
// Falls back to Resend if RESEND_API_KEY is set.
//
// Required env (one of these setups):
//   1. Gmail (recommended, what your .env already has):
//        EMAIL=you@gmail.com
//        EMAIL_PASS=<16-char Gmail App Password>   (NOT your Gmail login password)
//        How to get one: https://myaccount.google.com/apppasswords
//
//   2. Resend (optional):
//        RESEND_API_KEY=re_...
//        RESEND_FROM="BloodConnect <noreply@yourdomain.com>"

const nodemailer = require("nodemailer");

let transporter;
let mode = "none";

if (process.env.RESEND_API_KEY) {
    // -------- Resend mode --------
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || "BloodConnect <onboarding@resend.dev>";

    transporter = {
        sendMail: async ({ to, subject, text, html }) => {
            const result = await resend.emails.send({
                from, to, subject,
                html: html || `<p>${text || ""}</p>`,
            });
            console.log("✅ Email sent (Resend) to:", to);
            return result;
        },
    };
    mode = "resend";
} else if (process.env.EMAIL && process.env.EMAIL_PASS) {
    // -------- Gmail SMTP mode --------
    const gmail = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS.replace(/\s+/g, ""), // strip spaces from app password
        },
    });

    // Verify on boot — surface bad credentials immediately instead of silently failing on first send.
    gmail.verify((err) => {
        if (err) console.error("❌ Gmail SMTP verify failed:", err.message);
        else console.log("✅ Gmail SMTP ready");
    });

    transporter = {
        sendMail: async ({ to, subject, text, html }) => {
            const info = await gmail.sendMail({
                from: `"BloodConnect 🩸" <${process.env.EMAIL}>`,
                to, subject, text,
                html: html || (text ? `<p>${text}</p>` : undefined),
            });
            console.log("✅ Email sent (Gmail) to:", to, "messageId:", info.messageId);
            return info;
        },
    };
    mode = "gmail";
} else {
    console.warn("⚠️  No mail credentials found — emails will fail. Set EMAIL+EMAIL_PASS or RESEND_API_KEY in .env");
    transporter = {
        sendMail: async () => {
            throw new Error("Mailer not configured. Set EMAIL+EMAIL_PASS or RESEND_API_KEY in server/.env");
        },
    };
}

console.log(`✅ Mailer ready — mode: ${mode}`);
module.exports = transporter;
