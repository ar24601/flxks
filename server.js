import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-license', async (req, res) => {
  try {
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ error: 'Missing transaction_id' });
    }

    // 1. Verify with Paddle API
    const response = await fetch(`https://sandbox-api.paddle.com/transactions/${transaction_id}?include=customer`, {
      headers: { Authorization: `Bearer ${process.env.PADDLE_API_KEY}` },
    });

    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to verify transaction' });
    }

    const paddleData = await response.json();
    const transaction = paddleData.data;

    // Accounts for immediate state and slight delays in Sandbox
    if (!['completed', 'paid', 'ready'].includes(transaction.status)) {
      return res.status(400).json({ error: 'Transaction is not completed' });
    }

    // Attempt to extract email
    const email = transaction.customer?.email || transaction.details?.customer?.email || 'customer@example.com';

    // 2. Prepare JSON Payload
    const licenseData = {
      email,
      txn_id: transaction_id,
      date: transaction.created_at || new Date().toISOString(),
    };

    // 3. Cryptographic Signing (ECDSA)
    const rawEnvVar = process.env.ECDSA_PRIVATE_KEY_B64 || process.env.ECDSA_PRIVATE_KEY || '';
    const privateKey = rawEnvVar.includes('-----BEGIN') 
      ? rawEnvVar.replace(/\\n/g, '\n') 
      : Buffer.from(rawEnvVar, 'base64').toString('utf-8').replace(/\\n/g, '\n').replace(/"/g, '').trim();

    const payloadString = JSON.stringify(licenseData);
    const sign = crypto.createSign('SHA256');
    sign.update(payloadString);
    sign.end();
    const signature = sign.sign(privateKey, 'hex');

    const licenseContent = JSON.stringify({ data: licenseData, signature }, null, 2);

    // 4. Send Email via SMTP
    /*
    const smtpPass = process.env.SMTP_PASS_B64 
      ? Buffer.from(process.env.SMTP_PASS_B64, 'base64').toString('ascii').trim() 
      : (process.env.SMTP_PASS || '');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your License Key",
      text: "Please find your license key attached.",
      attachments: [{
        filename: 'license.mwkey', // Change extension to match your app configuration
        content: licenseContent,
        contentType: 'application/json'
      }]
    });
    */

    return res.json({ success: true });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/verify-transaction/:transaction_id', async (req, res) => {
  try {
    const { transaction_id } = req.params;
    
    if (!transaction_id) {
      return res.status(400).json({ error: 'Missing transaction_id' });
    }

    const response = await fetch(`https://sandbox-api.paddle.com/transactions/${transaction_id}?include=customer`, {
      headers: { Authorization: `Bearer ${process.env.PADDLE_API_KEY}` },
    });

    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to verify transaction' });
    }

    const paddleData = await response.json();
    const transaction = paddleData.data;

    if (!['completed', 'paid', 'ready'].includes(transaction.status)) {
      return res.status(400).json({ error: 'Transaction is not completed' });
    }

    const email = transaction.customer?.email || transaction.details?.customer?.email || null;

    return res.json({ success: true, email, status: transaction.status });
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
