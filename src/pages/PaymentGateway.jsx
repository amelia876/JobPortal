import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentGateway.css";

const PaymentGateway = () => {
  const [selectedOption, setSelectedOption] = useState("wise");
  const [currentStep, setCurrentStep] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Close notification dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNotifications]);

  // Account options with REAL LOGOS
  const accountOptions = [
    {
      id: "wise",
      name: "Wise",
      logo: "https://wise.com/public-resources/assets/logos/wise/brand_logo.svg",
      type: "Multi-currency Digital Bank",
      bestFor: "Freelancers receiving USD payments",
      description: "Get US routing numbers without SSN. Hold 50+ currencies.",
      difficulty: "Easy",
      time: "10 minutes",
      requirements: ["Passport", "Proof of address", "Email"],
      steps: [
        {
          title: "Visit Wise Website",
          action: "Go to wise.com",
          details: "Click 'Sign up' in top right corner",
          link: "https://wise.com",
          buttonText: "Go to Wise.com"
        },
        {
          title: "Create Account",
          action: "Enter your details",
          details: "Use real information matching your passport",
          tip: "Use your Caribbean address"
        },
        {
          title: "Verify Identity",
          action: "Upload passport photos",
          details: "Take clear photos of passport photo page",
          tip: "Ensure good lighting and all text is readable"
        },
        {
          title: "Activate USD Account",
          action: "Add minimum deposit",
          details: "Add $20 to activate your USD account",
          tip: "Use credit/debit card or bank transfer"
        },
        {
          title: "Get US Banking Details",
          action: "Copy your account info",
          details: "You'll receive US routing and account numbers",
          tip: "Save these for giving to employers"
        }
      ],
      pros: [
        "Real US routing numbers",
        "Convert to local currency easily",
        "Debit card available",
        "Low conversion fees"
      ],
      cons: [
        "No physical branches",
        "Card delivery takes 1-2 weeks"
      ],
      directLink: "https://wise.com",
      estimatedFees: "$0 monthly, 0.5-1.5% conversion fee"
    },
    {
      id: "payoneer",
      name: "Payoneer",
      logo: "https://www.payoneer.com/wp-content/uploads/2020/12/payoneer-logo.svg",
      type: "Payment Service Provider",
      bestFor: "Freelancers on platforms like Upwork, Fiverr",
      description: "US bank account details for receiving from companies worldwide.",
      difficulty: "Easy",
      time: "15 minutes",
      requirements: ["Government ID", "Proof of address", "Tax ID"],
      steps: [
        {
          title: "Sign Up on Payoneer",
          action: "Visit payoneer.com",
          details: "Click 'Sign Up' and select 'Freelancer'",
          link: "https://www.payoneer.com",
          buttonText: "Go to Payoneer.com"
        },
        {
          title: "Complete Application",
          action: "Fill personal details",
          details: "Use information matching your ID documents",
          tip: "Be consistent with name spelling"
        },
        {
          title: "Verify Documents",
          action: "Upload ID and address proof",
          details: "Passport and utility bill/bank statement",
          tip: "Documents must be under 6 months old"
        },
        {
          title: "Request US Payment Service",
          action: "Apply for US receiving account",
          details: "Found under 'Receive' section",
          tip: "Select 'US Dollar Account'"
        },
        {
          title: "Wait for Approval",
          action: "2-3 business days processing",
          details: "You'll receive email with US account details",
          tip: "Check spam folder"
        }
      ],
      pros: [
        "Direct integration with freelancing platforms",
        "Prepaid Mastercard available",
        "Withdraw to local bank",
        "Good for recurring payments"
      ],
      cons: [
        "$29.95/year card fee",
        "Higher withdrawal fees to local banks"
      ],
      directLink: "https://www.payoneer.com",
      estimatedFees: "Free account, withdrawal fees vary"
    },
    {
      id: "chime",
      name: "Chime",
      logo: "https://www.chime.com/wp-content/themes/chime/assets/dist/images/chime-logo.svg",
      type: "US Mobile Banking",
      bestFor: "Those needing full US checking account",
      description: "Online bank with US checking account and debit card.",
      difficulty: "Medium",
      time: "10-15 minutes",
      requirements: ["US address", "US phone number", "Passport"],
      steps: [
        {
          title: "Get US Address",
          action: "Use friend/family or mailbox service",
          details: "Services like Traveling Mailbox or Earth Class Mail",
          link: "https://www.travelingmailbox.com",
          buttonText: "Get US Address"
        },
        {
          title: "Get US Phone Number",
          action: "Use Google Voice",
          details: "Free US number with google.com/voice",
          link: "https://voice.google.com",
          buttonText: "Get Google Voice"
        },
        {
          title: "Download Chime App",
          action: "Use US App Store account",
          details: "Create new Apple ID with US address",
          tip: "Set region to United States"
        },
        {
          title: "Sign Up for Chime",
          action: "Use US address and phone",
          details: "Apply through the app",
          link: "https://chime.com",
          buttonText: "Learn About Chime"
        },
        {
          title: "Verify and Activate",
          action: "Upload passport for verification",
          details: "Card ships to US address in 7-10 days",
          tip: "Forward card internationally if needed"
        }
      ],
      pros: [
        "Full US checking account",
        "No monthly fees",
        "Early direct deposit",
        "Credit builder available"
      ],
      cons: [
        "Requires US address",
        "No international branches",
        "Limited customer service"
      ],
      directLink: "https://chime.com",
      estimatedFees: "$0 monthly, free ATM network"
    },
    {
      id: "wellsfargo",
      name: "Wells Fargo",
      logo: "https://www.wellsfargo.com/favicon.ico",
      logoText: "WF",
      type: "Traditional US Bank",
      bestFor: "Those who can visit US branches occasionally",
      description: "One of the largest US banks with international presence.",
      difficulty: "Hard",
      time: "30+ minutes",
      requirements: ["US address", "US phone", "Passport", "ITIN/SSN optional"],
      steps: [
        {
          title: "Check Eligibility",
          action: "Verify you can open account remotely",
          details: "Some accounts require in-person visit",
          link: "https://www.wellsfargo.com/international",
          buttonText: "Check International Services"
        },
        {
          title: "Gather Documents",
          action: "Prepare all required documents",
          details: "Passport, proof of address, proof of income",
          tip: "Documents may need translation/notarization"
        },
        {
          title: "Contact International Desk",
          action: "Call Wells Fargo international services",
          details: "+1-800-626-4687 (International)",
          tip: "Available Mon-Fri 8am-8pm EST"
        },
        {
          title: "Complete Application",
          action: "Work with bank representative",
          details: "May require video call verification",
          tip: "Be prepared for detailed questions"
        },
        {
          title: "Fund Account",
          action: "Make initial deposit",
          details: "Minimum deposit required ($25-$100)",
          tip: "Wire transfer or international check"
        }
      ],
      pros: [
        "Physical branches across US",
        "Full banking services",
        "International wire services",
        "Established reputation"
      ],
      cons: [
        "May require US visit",
        "Monthly fees possible",
        "Complex for non-residents",
        "Slow international support"
      ],
      directLink: "https://www.wellsfargo.com/international",
      estimatedFees: "$10-$30 monthly, wire fees apply"
    },
    {
      id: "keybank",
      name: "KeyBank",
      logo: "https://www.key.com/favicon.ico",
      logoText: "KB",
      type: "US Regional Bank",
      bestFor: "Those with US connections in Northeast/Midwest",
      description: "Major regional bank with digital account opening.",
      difficulty: "Medium",
      time: "20 minutes",
      requirements: ["US address", "US phone", "Passport", "Initial deposit"],
      steps: [
        {
          title: "Visit KeyBank International",
          action: "Go to key.com/international",
          details: "Explore international banking options",
          link: "https://www.key.com/international",
          buttonText: "Visit KeyBank International"
        },
        {
          title: "Check Account Options",
          action: "Review available account types",
          details: "Look for 'International Personal Banking'",
          tip: "Some accounts may require SSN/ITIN"
        },
        {
          title: "Contact International Banking",
          action: "Call +1-216-689-3000",
          details: "Speak with international banking specialist",
          tip: "Have your documents ready"
        },
        {
          title: "Submit Application",
          action: "Complete online or paper application",
          details: "May require additional documentation",
          tip: "Be honest about your residency status"
        },
        {
          title: "Verify and Fund",
          action: "Complete verification process",
          details: "Make initial deposit to activate account",
          tip: "Minimum deposit typically $50-$100"
        }
      ],
      pros: [
        "Good regional presence",
        "Digital banking tools",
        "International services",
        "Multiple account options"
      ],
      cons: [
        "Limited to certain US regions",
        "Fees for international clients",
        "Complex verification",
        "May require US ties"
      ],
      directLink: "https://www.key.com/international",
      estimatedFees: "$15-$25 monthly, international fees"
    },
    {
      id: "paypal",
      name: "PayPal",
      logo: "https://www.paypalobjects.com/webstatic/icon/pp258.png",
      type: "Payment Platform",
      bestFor: "Quick payments from US clients",
      description: "Widely accepted, instant transfers between PayPal accounts.",
      difficulty: "Very Easy",
      time: "5 minutes",
      requirements: ["Email", "Phone number", "Bank account (optional)"],
      steps: [
        {
          title: "Create PayPal Account",
          action: "Go to paypal.com",
          details: "Click 'Sign Up' and select 'Personal Account'",
          link: "https://www.paypal.com",
          buttonText: "Go to PayPal.com"
        },
        {
          title: "Verify Email",
          action: "Check your inbox",
          details: "Click verification link in email",
          tip: "Use personal email, not work"
        },
        {
          title: "Add Phone Number",
          action: "For security verification",
          details: "Receive SMS code to verify",
          tip: "Use mobile number you have access to"
        },
        {
          title: "Connect Bank Account (Optional)",
          action: "Link local Caribbean bank",
          details: "For withdrawals to your country",
          tip: "Check if your bank supports PayPal"
        },
        {
          title: "Get PayPal.Me Link",
          action: "Create payment request link",
          details: "Share with clients for easy payment",
          tip: "Customize with your name"
        }
      ],
      pros: [
        "Widely recognized",
        "Instant transfers",
        "No currency conversion until withdrawal",
        "Buyer/seller protection"
      ],
      cons: [
        "High conversion fees",
        "Account freezes possible",
        "Not ideal for large amounts"
      ],
      directLink: "https://www.paypal.com",
      estimatedFees: "4.4% + fixed fee for receiving"
    },
    {
      id: "revolut",
      name: "Revolut",
      logo: "https://www.revolut.com/favicon.ico",
      logoText: "R",
      type: "Digital Banking Alternative",
      bestFor: "Travelers and digital nomads",
      description: "Multi-currency account with USD IBAN for receiving payments.",
      difficulty: "Easy",
      time: "10 minutes",
      requirements: ["Passport", "Selfie", "Proof of address"],
      steps: [
        {
          title: "Download Revolut App",
          action: "Available worldwide",
          details: "Download from App Store or Google Play",
          link: "https://www.revolut.com",
          buttonText: "Get Revolut App"
        },
        {
          title: "Sign Up",
          action: "Enter personal details",
          details: "Use your Caribbean address",
          tip: "Select correct country of residence"
        },
        {
          title: "Verify Identity",
          action: "Take selfie with passport",
          details: "Follow in-app instructions",
          tip: "Good lighting, clear photo"
        },
        {
          title: "Activate USD Account",
          action: "Open USD balance",
          details: "Found in 'Accounts' section",
          tip: "Get USD account details for receiving"
        },
        {
          title: "Order Card (Optional)",
          action: "Physical or virtual card",
          details: "Card ships internationally",
          tip: "Standard shipping free, express available"
        }
      ],
      pros: [
        "USD IBAN for international transfers",
        "Free card delivery worldwide",
        "Crypto trading available",
        "Budgeting tools"
      ],
      cons: [
        "Exchange limits on free plan",
        "Some features region-locked"
      ],
      directLink: "https://www.revolut.com",
      estimatedFees: "Free standard plan, premium available"
    }
  ];

  const selectedAccount = accountOptions.find(acc => acc.id === selectedOption) || accountOptions[0];

  // Function to render logo with fallback
  const renderLogo = (account) => {
    return (
      <div className="account-logo">
        <img 
          src={account.logo} 
          alt={`${account.name} logo`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div class="logo-fallback">${account.logoText || account.name.charAt(0)}</div>`;
          }}
        />
      </div>
    );
  };

  // Function to render logo for table
  const renderTableLogo = (account) => {
    return (
      <span className="table-logo">
        <img 
          src={account.logo} 
          alt={`${account.name} logo`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<span class="logo-fallback">${account.logoText || account.name.charAt(0)}</span>`;
          }}
        />
      </span>
    );
  };

  return (
    <div className="jobseeker-dashboard-container">
      {/* TOP NAVBAR */}
      <nav className="jobseeker-top-navbar">
        <div className="jobseeker-nav-brand">
          <a href="/" className="jobseeker-brand-logo">JobLytics</a>
          <div className="jobseeker-user-welcome">
            Welcome to Payment Gateway
          </div>
        </div>
        
        <div className="jobseeker-nav-center">
          <ul className="jobseeker-nav-links">
            <li><a href="/jobseeker">Dashboard</a></li>
            <li><a href="/job-search">Jobs</a></li>
            <li><a href="/job-seeker/applications">Applications</a></li>
            <li><a href="/schedule-interview">Interviews</a></li>
            <li><a href="/itin-support">ITIN Support</a></li>
            <li><a href="/payment-gateway" className="active">Payments</a></li>
            <li><a href="/internet-speed-test">Internet Test</a></li>
            <li><a href="/tax-guidance">Tax Guide</a></li>
            <li><a href="/employer-resources">For Employers</a></li>
            <li><a href="/community">Community</a></li>
          </ul>
        </div>

        <div className="jobseeker-nav-actions">
          {/* Notification Bell */}
          <div className="notification-container">
            <button className="notification-bell" onClick={toggleNotifications}>
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>
            
            {/* Notification Dropdown */}
            <div className={`notification-dropdown ${showNotifications ? 'open' : ''}`}>
              <div className="notification-header">
                <h3>Notifications</h3>
                <button className="mark-all-read">Mark all as read</button>
              </div>
              <div className="notification-list">
                <div className="notification-item unread">
                  <div className="notification-content">
                    <div className="notification-title">Payment Alert</div>
                    <div className="notification-message">Your payment has been processed successfully</div>
                    <div className="notification-time">Just now</div>
                  </div>
                  <div className="unread-dot"></div>
                </div>
                <div className="notification-item">
                  <div className="notification-content">
                    <div className="notification-title">New Job Match</div>
                    <div className="notification-message">A new job matching your skills is available</div>
                    <div className="notification-time">2 hours ago</div>
                  </div>
                </div>
                <div className="notification-item unread">
                  <div className="notification-content">
                    <div className="notification-title">Account Update</div>
                    <div className="notification-message">Your bank account verification is complete</div>
                    <div className="notification-time">5 hours ago</div>
                  </div>
                  <div className="unread-dot"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Button */}
          <div className="jobseeker-icon-button-container">
            <button className="jobseeker-icon-button">
              <span className="jobseeker-icon-button-icon">💬</span>
              <span className="jobseeker-message-badge">2</span>
            </button>
          </div>

          {/* Profile Button */}
          <div className="jobseeker-icon-button-container">
            <button 
              className="jobseeker-icon-button"
              onClick={() => navigate("/jobseeker/profile")}
            >
              <span className="jobseeker-icon-button-icon">👤</span>
            </button>
          </div>

          {/* Logout Button */}
          <div className="jobseeker-icon-button-container">
            <button 
              className="jobseeker-icon-button logout-icon-btn"
              onClick={handleLogout}
            >
              <span className="jobseeker-icon-button-icon">🚪</span>
            </button>
          </div>
        </div>
      </nav>

      {/* SIDEBAR */}
      <div className="jobseeker-dashboard-layout">
        <div className="jobseeker-sidebar">
          <div className="jobseeker-logo">
            <span className="jobseeker-menu-icon">💼</span>
            <span>JobLytics</span>
          </div>
          
          <ul className="jobseeker-menu">
            <li className="active" onClick={() => navigate("/payment-gateway")}>
              <span className="jobseeker-menu-icon">🏦</span>
              <span className="jobseeker-menu-text">Payment Gateway</span>
            </li>
            <li onClick={() => navigate("/jobseeker")}>
              <span className="jobseeker-menu-icon">📊</span>
              <span className="jobseeker-menu-text">Dashboard</span>
            </li>
            <li onClick={() => navigate("/job-search")}>
              <span className="jobseeker-menu-icon">🔍</span>
              <span className="jobseeker-menu-text">Job Search</span>
            </li>
            <li onClick={() => navigate("/job-seeker/applications")}>
              <span className="jobseeker-menu-icon">📄</span>
              <span className="jobseeker-menu-text">Applications</span>
              <span className="jobseeker-menu-badge">3</span>
            </li>
            <li onClick={() => navigate("/schedule-interview")}>
              <span className="jobseeker-menu-icon">🎯</span>
              <span className="jobseeker-menu-text">Interviews</span>
              <span className="jobseeker-menu-badge">2</span>
            </li>
            <li onClick={() => navigate("/itin-support")}>
              <span className="jobseeker-menu-icon">📋</span>
              <span className="jobseeker-menu-text">ITIN Support</span>
            </li>
            <li onClick={() => navigate("/internet-speed-test")}>
              <span className="jobseeker-menu-icon">📶</span>
              <span className="jobseeker-menu-text">Internet Test</span>
            </li>
            <li onClick={() => navigate("/tax-guidance")}>
              <span className="jobseeker-menu-icon">💰</span>
              <span className="jobseeker-menu-text">Tax Guide</span>
            </li>
            <li onClick={() => navigate("/employer-resources")}>
              <span className="jobseeker-menu-icon">🏢</span>
              <span className="jobseeker-menu-text">For Employers</span>
            </li>
            <li onClick={() => navigate("/community")}>
              <span className="jobseeker-menu-icon">👥</span>
              <span className="jobseeker-menu-text">Community</span>
            </li>
          </ul>
        </div>

        {/* MAIN CONTENT */}
        <div className="jobseeker-main-content">
          <div className="pg-content-wrapper">
            <div className="pg-header">
              <h1>🏦 US Banking & Payment Accounts</h1>
              <p className="pg-subtitle">Step-by-step guides to create accounts without SSN for Caribbean remote workers</p>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat">
                <span className="stat-number">{accountOptions.length}</span>
                <span className="stat-label">Account Options</span>
              </div>
              <div className="stat">
                <span className="stat-number">0</span>
                <span className="stat-label">SSN Required</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Online Setup</span>
              </div>
              <div className="stat">
                <span className="stat-number">🌎</span>
                <span className="stat-label">Available Worldwide</span>
              </div>
            </div>

            <div className="pg-layout">
              {/* Left Column: Account Selection */}
              <div className="account-selection">
                <h2>Select Account Type</h2>
                <div className="account-options">
                  {accountOptions.map(account => (
                    <div
                      key={account.id}
                      className={`account-card ${selectedOption === account.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedOption(account.id);
                        setCurrentStep(0);
                      }}
                    >
                      {renderLogo(account)}
                      <div className="account-info">
                        <h3>{account.name}</h3>
                        <p className="account-type">{account.type}</p>
                        <div className="account-meta">
                          <span className="difficulty">{account.difficulty}</span>
                          <span className="time">⏱️ {account.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Direct Links */}
                <div className="direct-links-card">
                  <h3>🔗 Direct Links to All Services</h3>
                  <div className="links-grid">
                    {accountOptions.map(account => (
                      <a
                        key={account.id}
                        href={account.directLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="service-link"
                      >
                        <span className="link-logo">
                          <img 
                            src={account.logo} 
                            alt={`${account.name} logo`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<span class="link-logo-fallback">${account.logoText || account.name.charAt(0)}</span>`;
                            }}
                          />
                        </span>
                        <span className="link-text">{account.name}</span>
                        <span className="link-arrow">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Step-by-Step Guide */}
              <div className="step-by-step-guide">
                <div className="selected-account-header">
                  <div className="selected-account-title">
                    <div className="selected-logo">
                      <img 
                        src={selectedAccount.logo} 
                        alt={`${selectedAccount.name} logo`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div class="selected-logo-fallback">${selectedAccount.logoText || selectedAccount.name.charAt(0)}</div>`;
                        }}
                      />
                    </div>
                    <div>
                      <h2>{selectedAccount.name}</h2>
                      <p className="selected-description">{selectedAccount.description}</p>
                    </div>
                  </div>
                  <a
                    href={selectedAccount.directLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button"
                  >
                    <img 
                      src={selectedAccount.logo} 
                      alt=""
                      className="cta-logo"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    Create {selectedAccount.name} Account ↗
                  </a>
                </div>

                {/* Account Overview */}
                <div className="overview-card">
                  <div className="overview-item">
                    <h4>Best For</h4>
                    <p>{selectedAccount.bestFor}</p>
                  </div>
                  <div className="overview-item">
                    <h4>Estimated Fees</h4>
                    <p>{selectedAccount.estimatedFees}</p>
                  </div>
                  <div className="overview-item">
                    <h4>Requirements</h4>
                    <ul>
                      {selectedAccount.requirements.map((req, idx) => (
                        <li key={idx}>✓ {req}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Step Navigation */}
                <div className="step-navigation">
                  <h3>Step-by-Step Setup Guide</h3>
                  <div className="step-dots">
                    {selectedAccount.steps.map((_, idx) => (
                      <button
                        key={idx}
                        className={`step-dot ${currentStep === idx ? 'active' : ''}`}
                        onClick={() => setCurrentStep(idx)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Step */}
                <div className="current-step-card">
                  <div className="step-header">
                    <span className="step-number">Step {currentStep + 1}</span>
                    <h3>{selectedAccount.steps[currentStep].title}</h3>
                  </div>
                  <div className="step-content">
                    <div className="step-action">
                      <h4>Action Required:</h4>
                      <p>{selectedAccount.steps[currentStep].action}</p>
                    </div>
                    <div className="step-details">
                      <h4>Details:</h4>
                      <p>{selectedAccount.steps[currentStep].details}</p>
                    </div>
                    {selectedAccount.steps[currentStep].tip && (
                      <div className="step-tip">
                        <h4>💡 Pro Tip:</h4>
                        <p>{selectedAccount.steps[currentStep].tip}</p>
                      </div>
                    )}
                    {selectedAccount.steps[currentStep].link && (
                      <a
                        href={selectedAccount.steps[currentStep].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="step-link-button"
                      >
                        {selectedAccount.steps[currentStep].buttonText || 'Visit Link'} ↗
                      </a>
                    )}
                  </div>
                  <div className="step-navigation-buttons">
                    <button
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className="nav-button prev"
                    >
                      ← Previous Step
                    </button>
                    <button
                      onClick={() => setCurrentStep(Math.min(selectedAccount.steps.length - 1, currentStep + 1))}
                      disabled={currentStep === selectedAccount.steps.length - 1}
                      className="nav-button next"
                    >
                      Next Step →
                    </button>
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="pros-cons-card">
                  <div className="pros-section">
                    <h4>✅ Advantages</h4>
                    <ul>
                      {selectedAccount.pros.map((pro, idx) => (
                        <li key={idx}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cons-section">
                    <h4>⚠️ Considerations</h4>
                    <ul>
                      {selectedAccount.cons.map((con, idx) => (
                        <li key={idx}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Quick Checklist */}
                <div className="checklist-card">
                  <h3>📋 Quick Checklist</h3>
                  <div className="checklist-items">
                    {selectedAccount.requirements.map((req, idx) => (
                      <div key={idx} className="checklist-item">
                        <input type="checkbox" id={`check-${idx}`} />
                        <label htmlFor={`check-${idx}`}>{req}</label>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="print-checklist"
                    onClick={() => window.print()}
                  >
                    🖨️ Print This Guide
                  </button>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="comparison-section">
              <h2>📊 Quick Comparison</h2>
              <div className="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Best For</th>
                      <th>Time to Setup</th>
                      <th>Monthly Cost</th>
                      <th>US Banking Details</th>
                      <th>Card Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountOptions.map(account => (
                      <tr key={account.id}>
                        <td>
                          {renderTableLogo(account)}
                          {account.name}
                        </td>
                        <td>{account.bestFor}</td>
                        <td>{account.time}</td>
                        <td>{account.estimatedFees.split(',')[0]}</td>
                        <td>{account.pros?.some(p => p.includes('routing') || p.includes('bank account')) ? '✅' : '❌'}</td>
                        <td>{account.pros?.some(p => p.includes('card') || p.includes('debit') || p.includes('Mastercard') || p.includes('Visa')) ? '✅' : '❌'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="faq-section">
              <h2>❓ Frequently Asked Questions</h2>
              <div className="faq-grid">
                <div className="faq-item">
                  <h4>Is this legal for non-US residents?</h4>
                  <p>Yes, all these services are designed for international users and comply with financial regulations.</p>
                </div>
                <div className="faq-item">
                  <h4>Do I need to pay US taxes?</h4>
                  <p>Only if you're a US tax resident. Caribbean residents pay taxes in their home country on worldwide income.</p>
                </div>
                <div className="faq-item">
                  <h4>What's the best option for me?</h4>
                  <p>Wise for most freelancers, PayPal for quick payments, Chime for full banking needs, Wells Fargo for traditional banking.</p>
                </div>
                <div className="faq-item">
                  <h4>Can I get a physical card?</h4>
                  <p>Yes, Wise, Revolut, Chime, and many others offer cards that ship internationally.</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="cta-section">
              <h2>Ready to Get Paid Like a US Worker?</h2>
              <p>Choose an account above and follow the step-by-step guide. Start receiving USD payments today!</p>
              <div className="cta-buttons">
                {accountOptions.slice(0, 3).map(account => (
                  <a
                    key={account.id}
                    href={account.directLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-account-button"
                  >
                    <img 
                      src={account.logo} 
                      alt=""
                      className="cta-btn-logo"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <span>Create {account.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;