/* eslint-disable react-refresh/only-export-components */
import { useEffect, useCallback } from 'react';

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
const PADDLE_PRICE_ID = import.meta.env.VITE_PADDLE_PRICE_ID;

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

async function handleCheckoutCompleted(data) {
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
    if (window.Paddle && !window.__paddleReady) {
      window.Paddle.Environment.set('sandbox'); // Remove for production
      window.Paddle.Initialize({
        token: PADDLE_CLIENT_TOKEN,
        eventCallback: function (data) {
          if (data.name === 'checkout.completed') {
            handleCheckoutCompleted(data);
          }
        },
      });
      window.__paddleReady = true;
    }
  }, []);

  useEffect(() => {
    if (document.getElementById('paddle-js')) {
      if (window.Paddle) {
        handleLoad();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.id = 'paddle-js';
    script.async = true;
    script.onload = handleLoad;
    document.body.appendChild(script);

    return () => {
      // Optional cleanup
    };
  }, [handleLoad]);

  return null;
}
