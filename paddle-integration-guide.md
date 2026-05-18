# Paddle Integration & License Generation Guide

This guide documents the end-to-end implementation of Paddle Billing v2 integrated within a Next.js application. This implementation handles client-side checkout initialization, secure server-side transaction verification, cryptographic license signing, and automated license delivery via SMTP.

## Architecture Overview
1. **Client-side Checkout:** A global component (`PaddleCheckout.tsx`) loads the Paddle script and handles `checkout.completed` and `checkout.closed` events.
2. **Global Integration:** The loader is injected into the root layout (`app/layout.tsx`) so it's always ready.
3. **Backend Verification:** A Next.js API route (`/api/generate-license`) securely verifies the transaction ID against the Paddle API.
4. **License Generation:** An ECDSA digital signature is generated to prevent tampering.
5. **Delivery:** The final `.mwkey` license file is emailed to the customer using Nodemailer.

## Step 1: Environment Variables Setup

Ensure the following variables are in your `.env.local` (and your production environment):

```env
# Client-side Paddle Config (Requires NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_...
NEXT_PUBLIC_PADDLE_PRICE_ID=pri_...

# Server-side Paddle Config
PADDLE_API_KEY=your_paddle_api_key

# Security
# Your ECDSA Private Key (Base64 encoded to avoid multiline parsing issues on some hosts)
ECDSA_PRIVATE_KEY_B64=base64_encoded_private_key_here

# SMTP configuration for NodeMailer
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=support@yourdomain.com
# Base64 bypass for passwords containing special chars (#, $, etc)
SMTP_PASS_B64=base64_encoded_smtp_password
```

## Step 2: Client-side Checkout Component

Create a client component `components/PaddleCheckout.tsx` that will load the Paddle.js script and handle callbacks.

```tsx
'use client';

import { useCallback } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    Paddle: any;
    __paddleReady: boolean;
  }
}

const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!;
const PADDLE_PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID!;

const itemsList = [{ priceId: PADDLE_PRICE_ID, quantity: 1 }];

export function openCheckout() {
  if (typeof window === 'undefined') return;

  if (window.Paddle && window.__paddleReady) {
    window.Paddle.Checkout.open({ items: itemsList });
    return;
  }

  // Polling fallback if Paddle hasn't loaded yet
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (window.Paddle && window.__paddleReady) {
      clearInterval(interval);
      window.Paddle.Checkout.open({ items: itemsList });
    } else if (attempts >= 25) {
      clearInterval(interval);
      alert('Payment system is loading. Please try again in a moment.');
    }
  }, 200);
}

async function handleCheckoutCompleted(data: any) {
  const transactionId = data.data?.transaction_id;
  if (!transactionId) return;

  try {
    const response = await fetch('/api/generate-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: transactionId }),
    });

    if (!response.ok) {
      alert('Payment succeeded, but there was an error emailing your license key.');
      return;
    }

    // Redirect on success
    window.location.href = `/download?txn=${transactionId}`;
  } catch (err) {
    console.error('Network error during license generation:', err);
  }
}

export default function PaddleLoader() {
  const handleLoad = useCallback(() => {
    if (window.Paddle) {
      window.Paddle.Environment.set('sandbox'); // Remove for production
      window.Paddle.Initialize({
        token: PADDLE_CLIENT_TOKEN,
        eventCallback: function (data: any) {
          if (data.name === 'checkout.completed') {
            handleCheckoutCompleted(data);
          }
        },
      });
      window.__paddleReady = true;
    }
  }, []);

  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onLoad={handleLoad}
    />
  );
}
```

## Step 3: Injecting the Loader globally

Include the `PaddleLoader` component in your root `app/layout.tsx`. This ensures Paddle is pre-initialized and ready before the user clicks any checkout buttons, minimizing loading times.

```tsx
import PaddleLoader from "@/components/PaddleCheckout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PaddleLoader />
        {children}
      </body>
    </html>
  );
}
```

## Step 4: Backend API & License Generator

Create the endpoint at `app/api/generate-license/route.ts` to securely verify the transaction with Paddle, sign the license, and email it. This is your server-side barrier to entry.

```typescript
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { transaction_id } = await req.json();

    // 1. Verify with Paddle API
    const response = await fetch(`https://sandbox-api.paddle.com/transactions/${transaction_id}?include=customer`, {
      headers: { Authorization: `Bearer ${process.env.PADDLE_API_KEY}` },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to verify transaction' }, { status: 400 });
    }

    const paddleData = await response.json();
    const transaction = paddleData.data;

    // Accounts for immediate state and slight delays in Sandbox
    if (!['completed', 'paid', 'ready'].includes(transaction.status)) {
      return NextResponse.json({ error: 'Transaction is not completed' }, { status: 400 });
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

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

## Step 5: How to Trigger the Checkout

Anywhere in your application, you can simply call the `openCheckout()` function exported from the client component when a user clicks a payment button.

```tsx
'use client';
import { openCheckout } from '@/components/PaddleCheckout';

export default function PricingCard() {
  return (
    <button onClick={openCheckout}>
      Buy Now
    </button>
  );
}
```

## Key Considerations for Production

1. **Environment Sandbox:** Remember to remove `window.Paddle.Environment.set('sandbox');` inside `PaddleLoader` for the production environment, and swap your Client Token and Price IDs to the live ones.
2. **Security:** Never expose the `PADDLE_API_KEY` or `ECDSA_PRIVATE_KEY` to the client. Always verify the transaction securely from the backend to prevent malicious actors from triggering license generation.
3. **Base64 Encoding:** Using Base64 encoded variables (`ECDSA_PRIVATE_KEY_B64` and `SMTP_PASS_B64`) mitigates formatting issues on strictly-parsed shared hosting environments (like Hostinger) where standard special characters might be seen as comments.
