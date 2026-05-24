import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, Maximize, PlayCircle, EyeOff, Navigation, HardDrive } from 'lucide-react';
import { openCheckout } from '../components/PaddleCheckout.jsx';
import './Home.css';

export default function Home() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('session_id')) {
      openCheckout();
    }
  }, [searchParams]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="animate-fade-in delay-100">
              Experience Media Like <br /><span className="text-gradient">Never Before</span>
            </h1>
            <p className="hero-subtitle animate-fade-in delay-200">
              A premium desktop multimedia viewer that puts you in complete control. 
              No cloud uploads, no tracking. Just your photos and videos, beautifully displayed.
            </p>
            <div className="hero-actions animate-fade-in delay-300">
              <button className="btn btn-primary" onClick={() => import('../utils/download.js').then(m => m.handleDownload())}>Download Now</button>
            </div>
            <p className="animate-fade-in delay-300" style={{ marginTop: '1rem', fontSize: '0.95rem', opacity: 0.8 }}>
              Free download includes limited functionality. Unlock all features directly in the app.
            </p>
          </div>
          
          <div className="hero-visual animate-fade-in delay-300">
            <div className="app-mockup glass-panel">
              {/* Using a placeholder gradient for the image that we might replace with a generated mockup, 
                  but CSS gradients give a beautiful aesthetic by default. */}
              <div className="mockup-header">
                <div className="window-controls">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div className="mockup-body">
                 <div className="mockup-image-grid">
                    <div className="grid-item large"></div>
                    <div className="grid-item"></div>
                    <div className="grid-item"></div>
                 </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="glow-effect"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Built for Privacy, Designed for You</h2>
            <p>Powerful features wrapped in an elegant interface.</p>
          </div>
          
          <div className="grid grid-cols-3">
            <div className="feature-card glass-panel">
              <div className="feature-icon"><Shield /></div>
              <h3>Total Privacy</h3>
              <p>No uploads, no cloud storage, no sharing with third-parties.</p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon"><HardDrive /></div>
              <h3>Stays on Device</h3>
              <p>Everything stays on your local device, under your control. We respect your privacy.</p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon"><Maximize /></div>
              <h3>Optimized Viewing</h3>
              <p>Layout design, multi-media, flawless, optimized, custom viewing.</p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon"><PlayCircle /></div>
              <h3>Smart Auto-Play</h3>
              <p>Seamlessly transition between videos and photos with intelligent auto-play functionality.</p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon"><Navigation /></div>
              <h3>Intuitive Navigation</h3>
              <p>Navigate through thousands of files instantly with keyboard shortcuts and fluid mouse gestures.</p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon"><EyeOff /></div>
              <h3>Distraction-Free</h3>
              <p>A beautifully minimalist interface that fades away so your content can take center stage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof">
        <div className="container">
          <div className="section-header">
            <h2>Loved by Photographers and Creators</h2>
            <p>See what people are saying about flxks.</p>
          </div>
          
          <div className="grid grid-cols-3" style={{ marginBottom: '4rem' }}>
            <div className="feature-card glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ marginBottom: '1rem', color: '#ffb400', fontSize: '1.2rem', letterSpacing: '2px' }}>
                 ★★★★★
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: '1.6' }}>"Love having control over my images and videos. Exactly what I was looking for and the minimalist interface is exceptional"</p>
              <p style={{ fontWeight: '600', fontSize: '0.95rem', opacity: 0.9 }}>— Sarah T.</p>
            </div>
            
            <div className="feature-card glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ marginBottom: '1rem', color: '#ffb400', fontSize: '1.2rem', letterSpacing: '2px' }}>
                 ★★★★★
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: '1.6' }}>"The performance on massive video files is incredible. It handles my 4K footage without skipping a beat, all while looking like a premium native macOS app."</p>
              <p style={{ fontWeight: '600', fontSize: '0.95rem', opacity: 0.9 }}>— Marcus R.</p>
            </div>
            
            <div className="feature-card glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ marginBottom: '1rem', color: '#ffb400', fontSize: '1.2rem', letterSpacing: '2px' }}>
                 ★★★★★
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: '1.6' }}>"I love how minimalist it is. It gets completely out of the way and lets me focus entirely on my content. Easily the best media player I've ever used."</p>
              <p style={{ fontWeight: '600', fontSize: '0.95rem', opacity: 0.9 }}>— Elena K.</p>
            </div>
          </div>

          <div className="glass-panel text-center cta-panel">
            <h2>Ready to take control of your media?</h2>
            <p className="cta-subtitle">Discover why thousands of users Love Flxks</p>
            <button className="btn btn-primary" onClick={() => import('../utils/download.js').then(m => m.handleDownload())}>Download Now</button>
            <p style={{ marginTop: '1rem', fontSize: '0.95rem', opacity: 0.8 }}>
              Free version has limited features. Upgrade within the app anytime.
            </p>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Simple, Transparent Pricing</h2>
            <p>Premium features without the premium price tag.</p>
          </div>
          
          <div className="grid grid-cols-2" style={{ maxWidth: '900px', margin: '0 auto', gap: '2rem' }}>
            {/* Monthly Plan */}
            <div className="pricing-card glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="pricing-header">
                <h3>Monthly Subscription</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '500', marginBottom: '0.5rem' }}>Free version available</p>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">6.99</span>
                  <span className="period">/mo</span>
                </div>
                <p className="currency-note">USD</p>
              </div>
              <div className="pricing-features" style={{ flexGrow: 1 }}>
                <ul>
                  <li><Shield className="check-icon"/> Unlimited media viewing</li>
                  <li><Shield className="check-icon"/> All display and navigation features</li>
                  <li><Shield className="check-icon"/> Future updates included</li>
                  <li><Shield className="check-icon"/> 100% Privacy</li>
                </ul>
              </div>
              <div className="pricing-actions">
                <button className="btn btn-primary w-full" onClick={() => import('../utils/download.js').then(m => m.handleDownload())}>Try Free</button>
              </div>
            </div>

            {/* Yearly Plan */}
            <div style={{ position: 'relative', height: '100%' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-color)', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10 }}>
                Save 28%
              </div>
              <div className="pricing-card glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid var(--accent-color)' }}>
                <div className="pricing-header">
                  <h3>Yearly Subscription</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: '500', marginBottom: '0.5rem' }}>Best Value</p>
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">59.98</span>
                    <span className="period">/yr</span>
                  </div>
                  <p className="currency-note">USD</p>
                </div>
                <div className="pricing-features" style={{ flexGrow: 1 }}>
                  <ul>
                    <li><Shield className="check-icon"/> Unlimited media viewing</li>
                    <li><Shield className="check-icon"/> All display and navigation features</li>
                    <li><Shield className="check-icon"/> Future updates included</li>
                    <li><Shield className="check-icon"/> 100% Privacy</li>
                  </ul>
                </div>
                <div className="pricing-actions">
                  <button className="btn btn-primary w-full" onClick={() => import('../utils/download.js').then(m => m.handleDownload())}>Try Free</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="commitment-note" style={{ marginTop: '2.5rem', opacity: 0.8 }}>
            Purchase not required. Subscription can be purchased in the App.<br/>
            No commitment • Cancel anytime
          </div>
        </div>
      </section>
    </div>
  );
}
