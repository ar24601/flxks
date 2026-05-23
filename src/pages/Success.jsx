import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Home.css'; // Reuse existing styles if available

export default function Success() {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('txn');

  // No need to verify the transaction on the frontend anymore!
  // Supabase Webhooks and KiroClip auto-recovery handle everything.

  return (
    <div className="home-container">
      <div className="hero-section" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Payment Successful!
        </h1>
        
        <div style={{ background: 'rgba(50, 255, 100, 0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(50, 255, 100, 0.2)', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          
          <h2 style={{ color: '#4ade80', marginBottom: '1rem' }}>You&apos;re all set!</h2>
          
          <p style={{ fontSize: '1.1rem', color: '#e2e8f0', lineHeight: '1.6', marginBottom: '2rem' }}>
            Your payment was successful and your subscription is now active.
          </p>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
            <p style={{ margin: 0, color: '#a0aec0', fontSize: '1.05rem' }}>
              You can safely close this window and return to the <strong>KiroClip app</strong> on your Mac. It will automatically detect your new license!
            </p>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/" className="cta-button">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
