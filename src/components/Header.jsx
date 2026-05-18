import { Link, useLocation } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { openCheckout } from './PaddleCheckout.jsx';
import './Header.css';

export default function Header() {
  const location = useLocation();

  const handleNavClick = (e, hash) => {
    // If we are already on the home page, prevent default and manually scroll
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Update URL to include the hash without reloading
        window.history.pushState(null, '', `/#${hash}`);
      }
    }
    // If not on the home page, the Link's default behavior will navigate to /#hash
    // and the Layout.jsx useEffect will handle the scrolling once loaded.
  };

  return (
    <header className="header glass-panel">
      <div className="container header-container">
        <Link to="/" className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Layers className="logo-icon" />
          <span>flxks</span>
        </Link>
        <nav className="nav-links">
          <Link 
            to="/#features" 
            className="nav-link"
            onClick={(e) => handleNavClick(e, 'features')}
          >
            Features
          </Link>
          <Link 
            to="/#pricing" 
            className="nav-link"
            onClick={(e) => handleNavClick(e, 'pricing')}
          >
            Pricing
          </Link>
          <button className="btn btn-primary btn-sm" onClick={openCheckout}>Get flxks</button>
        </nav>
      </div>
    </header>
  );
}
