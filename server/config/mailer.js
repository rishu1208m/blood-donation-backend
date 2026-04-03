const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error("❌ Mailer error:", error.message);
    } else {
        console.log("✅ Mailer ready – emails will send from", process.env.EMAIL_USER);
    }
});

module.exports = transporter;