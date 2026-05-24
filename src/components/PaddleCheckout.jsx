/* eslint-disable react-refresh/only-export-components */
import { useEffect, useCallback } from 'react';

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || 'test_1b7c3b9c4b0fa1cf936eb4c091d';
const PADDLE_MONTHLY_PRICE_ID = import.meta.env.VITE_PADDLE_MONTHLY_PRICE_ID || 'pri_01ksap1j1yrgxdq6hx9ppvppf5';
const PADDLE_YEARLY_PRICE_ID = import.meta.env.VITE_PADDLE_YEARLY_PRICE_ID || 'pri_01kd4jjj1410bzfa4d57be66zh';
const PADDLE_DAILY_PRICE_ID = import.meta.env.VITE_PADDLE_DAILY_PRICE_ID || 'pri_01kscsnbtdsggrn4c2adhdea7c';

export function openCheckout(plan = 'monthly') {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const urlPlan = urlParams.get('plan');

  if (sessionId) {
    console.log(`[Paddle] Initializing checkout for session: ${sessionId}`);
  }

  // Use URL plan parameter if provided, otherwise fallback to the argument
  const selectedPlan = urlPlan || plan;
  const priceId = selectedPlan === 'yearly' ? PADDLE_YEARLY_PRICE_ID : PADDLE_MONTHLY_PRICE_ID;

  const checkoutSettings = {
    items: [{ priceId, quantity: 1 }],
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
    let redirectUrl = `/success?txn=${transactionId}`;
    window.location.href = redirectUrl;
  } catch (err) {
    console.error('Network error during checkout completion:', err);
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
