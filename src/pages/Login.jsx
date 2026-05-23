import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/account',
        },
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon-wrapper">
          <Mail size={32} />
        </div>
        <h1 className="login-title">Welcome to Flxks</h1>
        <p className="login-subtitle">
          Enter your email address to access your licenses and manage your devices. No password required.
        </p>

        {success ? (
          <div className="success-message">
            <CheckCircle2 size={48} />
            <div>
              <h3 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Check your email</h3>
              <p style={{ opacity: 0.9, fontSize: '0.9rem', lineHeight: '1.5' }}>
                We sent a secure login link to <strong>{email}</strong>. 
                <br/><br/>
                <em>(If you are testing locally, check the Inbucket mail catcher at localhost:54324)</em>
              </p>
            </div>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleLogin}>
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary login-btn" 
              disabled={loading || !email}
            >
              {loading ? 'Sending link...' : 'Send Magic Link'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
