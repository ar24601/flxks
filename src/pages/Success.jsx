import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Home.css'; // Reuse existing styles if available

export default function Success() {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('txn');
  const emailErr = searchParams.get('email_err');
  
  const licenseFile = transactionId ? sessionStorage.getItem(`license_${transactionId}`) : null;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!transactionId) {
      setError('No transaction ID provided.');
      setLoading(false);
      return;
    }

    const verifyTransaction = async () => {
      try {
        const response = await fetch(`/api/verify-transaction/${transactionId}`);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server did not return a valid API response. (Are you running the Node server?)");
        }

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to verify transaction.');
        }
        
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    verifyTransaction();
  }, [transactionId]);

  return (
    <div className="home-container">
      <div className="hero-section" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {error ? 'Oops!' : (loading ? 'Verifying...' : 'Payment Successful!')}
        </h1>
        
        {loading && (
          <p className="hero-subtitle">Please wait while we confirm your transaction...</p>
        )}
        
        {error && (
          <div style={{ background: 'rgba(255, 50, 50, 0.1)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255, 50, 50, 0.3)' }}>
            <p className="hero-subtitle" style={{ color: '#ff6b6b', margin: 0 }}>{error}</p>
            <p style={{ marginTop: '1rem', color: '#888' }}>Transaction ID: {transactionId || 'N/A'}</p>
          </div>
        )}
        {data && !error && (
          <div style={{ background: 'rgba(50, 255, 100, 0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(50, 255, 100, 0.2)', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
            
            <h2 style={{ color: '#4ade80', marginBottom: '1rem' }}>You're all set!</h2>
            
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
        )}
      </div>
    </div>
  );
}
