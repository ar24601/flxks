import './Legal.css';

export default function Privacy() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: May 2026</p>
        </div>
        
        <div className="legal-content glass-panel">
          <h2>Our Commitment to Privacy</h2>
          <p>
            At flxks, privacy isn't just a feature; it's the foundation of our application. 
            We believe your photos and videos are yours alone.
          </p>
          
          <h2>Data Collection</h2>
          <p>
            flxks <strong>never</strong> uploads your media to the cloud. We do not track your viewing habits, 
            nor do we collect telemetry on what media files you open. Everything stays on your local device.
          </p>
          
          <h2>Third Parties</h2>
          <p>
            We do not share any of your personal data with third parties. Your media is entirely under your control.
            We use Paddle for secure payment processing. When you subscribe, Paddle processes your transaction, but they do not have access to your media files.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about our privacy practices, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
