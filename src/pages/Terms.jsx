import './Legal.css';

export default function Terms() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-header">
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: May 2026</p>
        </div>
        
        <div className="legal-content glass-panel">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By downloading, installing, or using the flxks software application, you agree to be bound by these Terms of Service.
          </p>
          
          <h2>2. License</h2>
          <p>
            We grant you a non-exclusive, personal, non-transferable license to use flxks in accordance with these terms.
            The subscription provides access to the software functionality while active.
          </p>
          
          <h2>3. Subscription</h2>
          <p>
            flxks is offered as a monthly subscription service at $6.99 USD per month. 
            You can cancel anytime. If you cancel, you will continue to have access for the remainder of your billing cycle.
          </p>

          <h2>4. User Responsibilities</h2>
          <p>
            You are responsible for the media you view using flxks. We do not monitor, host, or have access to any content you open with the software.
          </p>
        </div>
      </div>
    </div>
  );
}
