import { Link, useLocation } from 'react-router-dom';
import { Layers } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const location = useLocation();

  const handleNavClick = (e, hash) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${hash}`);
      }
    }
  };

  const handlePageClick = (path) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Layers className="logo-icon" />
              <span>Flxks</span>
            </Link>
            <p className="footer-desc">
              Your media stays on your device, under your control. Built for privacy, designed for you.
            </p>
          </div>
          
          <div className="footer-links-group">
            <div className="footer-column">
              <h3>Product</h3>
              <Link 
                to="/#features"
                onClick={(e) => handleNavClick(e, 'features')}
              >
                Features
              </Link>
              <Link 
                to="/#pricing"
                onClick={(e) => handleNavClick(e, 'pricing')}
              >
                Pricing
              </Link>
              <a href="#">Download</a>
            </div>
            <div className="footer-column">
              <h3>Legal</h3>
              <Link to="/privacy" onClick={() => handlePageClick('/privacy')}>Privacy Policy</Link>
              <Link to="/terms" onClick={() => handlePageClick('/terms')}>Terms of Service</Link>
              <Link to="/returns" onClick={() => handlePageClick('/returns')}>Return Policy</Link>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} flxks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
