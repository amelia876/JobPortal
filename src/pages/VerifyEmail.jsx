import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, message } = location.state || {};
  const [hasClickedLink, setHasClickedLink] = useState(false);

  const handleResend = () => {
    // In production, you'd need the user to be signed in to resend
    alert('Please check your spam folder. If you need to resend, you can sign in and request a new verification email.');
    navigate('/login', { state: { email } });
  };

  const handleProceedToLogin = () => {
    navigate('/login', { state: { email } });
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <div className="verify-icon">📧</div>
        
        <h2>Verify Your Email</h2>
        
        <div className="email-display">
          <p>We sent a verification link to:</p>
          <div className="email-address">{email || 'your email'}</div>
        </div>
        
        <div className="instructions">
          <h4>Important Steps:</h4>
          <ol>
            <li>Check your email inbox (and spam folder)</li>
            <li><strong>Click the verification link</strong> from Firebase</li>
            <li>Wait for the confirmation page</li>
            <li>Return here and click "I've Verified"</li>
          </ol>
          
          <div className="warning">
            <strong>⚠️ You cannot login until you verify your email</strong>
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            onClick={() => {
              setHasClickedLink(true);
              alert('After clicking the verification link in your email, come back here and click "Proceed to Login"');
            }}
            className="primary-btn"
          >
            I've Clicked the Link
          </button>
          
          {hasClickedLink && (
            <button 
              onClick={handleProceedToLogin}
              className="success-btn"
            >
              ✅ Proceed to Login
            </button>
          )}
          
          <button 
            onClick={handleResend}
            className="secondary-btn"
          >
            ↻ Need Help? / Resend Email
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="tertiary-btn"
          >
            ↩ Back to Home
          </button>
        </div>
        
        <div className="help-section">
          <h4>Having Trouble?</h4>
          <ul>
            <li>Check your <strong>spam/junk folder</strong></li>
            <li>The email is from <strong>Firebase</strong> (noreply@firebase.com)</li>
            <li>Links expire after 24 hours</li>
            <li>Still stuck? <a href="/contact">Contact support</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;