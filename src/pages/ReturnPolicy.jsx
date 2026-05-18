import './Legal.css';

export default function ReturnPolicy() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-header">
          <h1>Return & Refund Policy</h1>
          <p className="last-updated">Last Updated: May 2026</p>
        </div>
        
        <div className="legal-content glass-panel">
          <h2>Cancellation Policy</h2>
          <p>
            flxks offers a monthly subscription. There is no commitment, and you can cancel your subscription at any time.
          </p>
          
          <h2>Access After Cancellation</h2>
          <p>
            If you choose to cancel your subscription, your cancellation will take effect at the end of the current paid term. 
            You will finish out the month without renewal, and you will not be charged again.
          </p>
          
          <h2>Refunds</h2>
          <p>
            Because we offer a free trial period to test out the application, we generally do not offer refunds for partial months of service. 
            If you experience technical issues, please contact our support team, and we will evaluate refund requests on a case-by-case basis.
          </p>
        </div>
      </div>
    </div>
  );
}
