// Run from the server folder:  node test-email.js
// Sends a test email through your existing Gmail credentials.
// If it fails, the printed error is exactly what's killing your OTPs.

require("dotenv").config();
const nodemailer = require("nodemailer");

(async () => {
    const user = process.env.EMAIL;
    const pass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

    console.log("EMAIL:", user);
    console.log("EMAIL_PASS length (after stripping spaces):", pass.length, "(should be 16 for a Gmail App Password)");

    if (!user || !pass) {
        console.error("❌ EMAIL or EMAIL_PASS missing in .env");
        process.exit(1);
    }

    const t = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
        logger: true,   // verbose
        debug: true,    // dump SMTP conversation
    });

    try {
        await t.verify();
        console.log("\n✅ verify() passed — credentials are accepted by Gmail.");
    } catch (err) {
        console.error("\n❌ verify() failed:", err.message);
        console.error("Full error:", err);
        process.exit(2);
    }

    try {
        const info = await t.sendMail({
            from: `"BloodConnect Test" <${user}>`,
            to: user,                                   // send to yourself
            subject: "BloodConnect SMTP test ✅",
            text: "If you're reading this, OTP emails will work too.",
        });
        console.log("\n✅ Test email sent. messageId:", info.messageId);
        console.log("Check your inbox AND spam folder.");
    } catch (err) {
        console.error("\n❌ sendMail failed:", err.message);
        console.error("Full error:", err);
        process.exit(3);
    }
})();
