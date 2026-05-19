import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Home.css'; // Reuse existing styles if available

export default function Success() {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('txn');
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!transactionId) {
      setError('No transaction ID provided.');
      setLoading(false);
      return;
    }

    async function verifyTransaction() {
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <div>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>Status</span>
                <div style={{ color: '#4ade80', fontSize: '1.2rem', textTransform: 'capitalize', fontWeight: 'bold' }}>{data.status}</div>
              </div>
              
              <div>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>Transaction ID</span>
                <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '1.1rem' }}>{transactionId}</div>
              </div>

              <div>
                <span style={{ color: '#888', fontSize: '0.9rem' }}>Email Address</span>
                <div style={{ color: '#e2e8f0', fontSize: '1.1rem' }}>{data.email || 'Not provided'}</div>
              </div>
            </div>

            <p style={{ marginTop: '2rem', color: '#a0aec0' }}>
              Your license key and download instructions have been generated.
            </p>
            
            <Link to="/" className="cta-button" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
