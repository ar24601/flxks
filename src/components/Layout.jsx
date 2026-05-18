import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there is a hash (e.g. #features), scroll to it
    if (hash) {
      // Small timeout to ensure the DOM is painted and elements are present
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Otherwise, scroll to top on route change
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
