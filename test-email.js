import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const smtpPass = process.env.SMTP_PASS_B64 
      ? Buffer.from(process.env.SMTP_PASS_B64, 'base64').toString('ascii').trim() 
      : (process.env.SMTP_PASS || '');

    console.log('Connecting as:', process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: smtpPass },
      logger: true,
      debug: true
    });

    try {
        const info = await transporter.sendMail({
            from: `"Support" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // send to self to test
            subject: "Test Email from flxks",
            text: "This is a test to see if DreamHost is actually queueing the email."
        });
        console.log("Message sent: %s", info.messageId);
        console.log("Accepted: %s", info.accepted);
        console.log("Rejected: %s", info.rejected);
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
