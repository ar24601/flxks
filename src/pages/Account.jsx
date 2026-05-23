import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Key, HardDrive, CreditCard, ExternalLink, ShieldAlert, Monitor, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import './Account.css';

export default function Account() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ licenses: [], devices: [] });
  const [billingLoading, setBillingLoading] = useState(false);
  const [removingDevice, setRemovingDevice] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate('/login');
      } else {
        fetchAccountDetails(session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate('/login');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAccountDetails = async (currentSession) => {
    try {
      // The edge functions run on port 8012 in local dev
      const apiUrl = import.meta.env.VITE_SUPABASE_URL.includes('localhost') 
        ? 'http://localhost:8012' 
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/account-details`;

      const res = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch account details');
      
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_SUPABASE_URL.includes('localhost') 
        ? 'http://localhost:8011' 
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-portal-url`;

      const res = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to open billing portal');
      
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setBillingLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to remove this device? This will free up a seat on your license.')) {
      return;
    }

    setRemovingDevice(deviceId);
    try {
      const apiUrl = import.meta.env.VITE_SUPABASE_URL.includes('localhost') 
        ? 'http://localhost:8013' 
        : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/account-device-remove`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deviceId })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to remove device');
      }
      
      // Refresh data
      await fetchAccountDetails(session);
    } catch (err) {
      alert(err.message);
    } finally {
      setRemovingDevice(null);
    }
  };

  if (loading) {
    return (
      <div className="account-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your account details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <header className="account-header animate-fade-in">
        <div>
          <h1>My Account</h1>
          <p>{session?.user?.email}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          Sign Out
        </button>
      </header>

      <section className="account-section animate-fade-in delay-100">
        <h2 className="section-title">
          <Key size={24} />
          Your Licenses
        </h2>
        
        {data.licenses.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>You don't have any active licenses associated with this email address.</p>
          </div>
        ) : (
          data.licenses.map(license => (
            <div key={license.id} className="license-card">
              <div className="license-info">
                <h3>{license.license_key}</h3>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                  <span className={`license-status ${new Date(license.expiration_date) > new Date() ? 'status-active' : 'status-expired'}`}>
                    {new Date(license.expiration_date) > new Date() ? 'Active' : 'Expired'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                    Expires: {new Date(license.expiration_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="license-actions">
                <button 
                  className="billing-btn" 
                  onClick={handleManageBilling}
                  disabled={billingLoading}
                >
                  <CreditCard size={18} />
                  {billingLoading ? 'Loading...' : 'Manage Billing'}
                  {!billingLoading && <ExternalLink size={14} />}
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="account-section animate-fade-in delay-200">
        <h2 className="section-title">
          <HardDrive size={24} />
          Registered Devices
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Manage the Macs currently using your license. Remove old devices to free up seats.
        </p>
        
        {data.devices.length === 0 ? (
          <div className="empty-state">
            <Monitor size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No devices are currently registered to your licenses.</p>
          </div>
        ) : (
          <div className="device-grid">
            {data.devices.map(device => (
              <div key={device.id} className="device-card">
                <div className="device-icon">
                  <Monitor size={24} color="#a87ffb" />
                </div>
                <div className="device-details">
                  <h4>MacBook / Mac</h4>
                  <p>Added: {new Date(device.registration_date).toLocaleDateString()}</p>
                </div>
                <button 
                  className="device-remove-btn"
                  onClick={() => handleRemoveDevice(device.id)}
                  disabled={removingDevice === device.id}
                >
                  {removingDevice === device.id ? 'Removing...' : 'Remove Device'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
