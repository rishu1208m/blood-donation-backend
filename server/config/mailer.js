const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = {
    sendMail: async ({ to, subject, text, html }) => {
        try {
            const result = await resend.emails.send({
                from: "BloodConnect <onboarding@resend.dev>",
                to,
                subject,
                html: html || `<p>${text}</p>`,
            });
            console.log("✅ Email sent to:", to);
            return result;
        } catch (error) {
            console.error("❌ Email failed:", error.message);
            throw error;
        }
    }
};

console.log("✅ Mailer ready using Resend");
module.exports = transporter;