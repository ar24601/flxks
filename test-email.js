import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const smtpPass = process.env.MTP_PASS_B64 
      ? Buffer.from(process.env.MTP_PASS_B64, 'base64').toString('ascii').trim() 
      : (process.env.MTP_PASS || '');

    console.log('Connecting as:', process.env.MTP_USER);

    const transporter = nodemailer.createTransport({
      host: process.env.MTP_HOST,
      port: Number(process.env.MTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.MTP_USER, pass: smtpPass },
      logger: true,
      debug: true
    });

    try {
        const info = await transporter.sendMail({
            from: `"Support" <${process.env.MTP_USER}>`,
            to: process.env.MTP_USER, // send to self to test
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
