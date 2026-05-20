/* eslint-disable react-refresh/only-export-components */
import { useEffect, useCallback } from 'react';

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
const PADDLE_PRICE_ID = import.meta.env.VITE_PADDLE_PRICE_ID;

const itemsList = [{ priceId: PADDLE_PRICE_ID, quantity: 1 }];

export function openCheckout() {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId) {
    console.log(`[Paddle] Initializing checkout for session: ${sessionId}`);
  }

  const checkoutSettings = { 
    items: itemsList,
    ...(sessionId && { customData: { session_id: sessionId } })
  };

  if (window.Paddle && window.__paddleReady) {
    window.Paddle.Checkout.open(checkoutSettings);
    return;
  }

  // Polling fallback if Paddle hasn't loaded yet
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (window.Paddle && window.__paddleReady) {
      clearInterval(interval);
      window.Paddle.Checkout.open(checkoutSettings);
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

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      alert('Payment succeeded, but there was a server error processing your license.');
    }

    if (result.license_file) {
      sessionStorage.setItem(`license_${transactionId}`, result.license_file);
    }

    // Redirect on success, optionally passing email error for debugging
    let redirectUrl = `/success?txn=${transactionId}`;
    if (result.email_sent === false && result.email_error) {
      redirectUrl += `&email_err=${encodeURIComponent(result.email_error)}`;
    }
    window.location.href = redirectUrl;
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
