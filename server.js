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
    const { transaction_id, session_id } = req.body;

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

    if (!['completed', 'paid', 'ready'].includes(transaction.status)) {
      return res.status(400).json({ error: 'Transaction is not completed' });
    }

    const email = transaction.customer?.email || transaction.details?.customer?.email || 'customer@example.com';
    const customer_id = transaction.customer_id || transaction.customer?.id || 'cust_123';

    // 2. Generate New KIRO String License Key
    const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = 'KIRO';
    const randomData = crypto.randomBytes(16);
    const hash = crypto.createHmac('sha256', `${email}-${Date.now()}-${randomData.toString('hex')}`)
      .update(randomData.toString('hex')).digest('hex');
    let uniqueId = '';
    for (let i = 0; i < 12; i++) {
        const index = parseInt(hash.substring(i * 2, i * 2 + 2), 16) % ALPHANUMERIC_CHARS.length;
        uniqueId += ALPHANUMERIC_CHARS[index];
    }
    const date = new Date();
    date.setUTCFullYear(date.getUTCFullYear() + 1);
    const expirationEncoded = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`;
    const baseKey = `${prefix}-${uniqueId}-${expirationEncoded}`;
    const signature = crypto.createHmac('sha256', process.env.LICENSE_KEY_SECRET || 'kiroClip_license_secret_2024_v1')
      .update(baseKey).digest('hex').substring(0, 32).toUpperCase();
    
    const licenseKeyString = `${baseKey}-${signature}`;

    // 3. Connect directly to Supabase to instantly unlock the Xcode App
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:8000';
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (session_id && supabaseKey) {
      console.log(`[Supabase] Fulfilling checkout session ${session_id}...`);
      
      // Update checkout_sessions table
      await fetch(`${supabaseUrl}/rest/v1/checkout_sessions?id=eq.${session_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: 'purchased',
          license_key: licenseKeyString
        })
      });

      // Insert into licenses table
      await fetch(`${supabaseUrl}/rest/v1/licenses`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          license_key: licenseKeyString,
          email: email,
          session_id: session_id,
          customer_id: customer_id,
          paddle_customer_id: customer_id,
          expiration_date: date.toISOString(),
          signature: signature,
          is_active: true
        })
      });
      console.log(`[Supabase] Successfully injected license: ${licenseKeyString}`);
    }

    // 4. Send Email via Nodemailer (Old System, preserved but sending string key)
    const smtpPass = process.env.SMTP_PASS_B64 
      ? Buffer.from(process.env.SMTP_PASS_B64, 'base64').toString('ascii').trim() 
      : (process.env.SMTP_PASS || '');

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT) || 1025,
      secure: false, // Use false for local mailhog
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: smtpPass } : undefined,
    });

    let emailSuccess = true;
    let emailError = null;

    try {
      await transporter.sendMail({
        from: `"Support" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@flxks.com'}>`,
        to: email,
        subject: "Your flxks License Key",
        text: `Thank you for your purchase!\n\nYour license key is: ${licenseKeyString}\n\nIf you started the purchase from the app, it should unlock automatically!`,
      });
    } catch (emailErr) {
      console.error('Email failed to send:', emailErr);
      emailSuccess = false;
      emailError = emailErr.message || String(emailErr);
    }

    return res.json({ 
      success: true, 
      email_sent: emailSuccess, 
      email_error: emailError,
      license_file: licenseKeyString // passing the string key back for UI
    });
    
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
