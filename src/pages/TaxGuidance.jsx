import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TaxGuidance.css";

const TaxGuidance = ({ user }) => {
  const [activeSection, setActiveSection] = useState("overview");
  const [income, setIncome] = useState("");
  const [country, setCountry] = useState("Jamaica");
  const [calculatedTax, setCalculatedTax] = useState(null);
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

  // Tax calculation
  const calculateTax = () => {
    if (!income || isNaN(income) || income <= 0) {
      alert("Please enter a valid income amount");
      return;
    }

    const amount = parseFloat(income);
    let taxRate = 0.15; // Default 15% for general estimation

    // Different rates based on country treaties
    const treatyRates = {
      "Jamaica": 0.125, // Jamaica-US tax treaty rate
      "Trinidad & Tobago": 0.15, // Trinidad has tax treaty
      "Barbados": 0.10, // Barbados has favorable treaty
      "Bahamas": 0.30, // No treaty, standard 30%
      "Dominican Republic": 0.15,
      "Haiti": 0.30,
      "Guyana": 0.30,
      "Grenada": 0.30,
      "St. Lucia": 0.30,
      "St. Vincent": 0.30,
      "Dominica": 0.30
    };

    const rate = treatyRates[country] || 0.15;
    const tax = amount * rate;
    const netIncome = amount - tax;

    setCalculatedTax({
      gross: amount,
      taxRate: rate * 100,
      taxAmount: tax,
      netIncome: netIncome,
      treatyApplied: country === "Jamaica" || country === "Barbados" || country === "Trinidad & Tobago" || country === "Dominican Republic"
    });
  };

  // Caribbean countries
  const caribbeanCountries = [
    { code: "JM", name: "Jamaica", flag: "🇯🇲", hasTreaty: true },
    { code: "TT", name: "Trinidad & Tobago", flag: "🇹🇹", hasTreaty: true },
    { code: "BB", name: "Barbados", flag: "🇧🇧", hasTreaty: true },
    { code: "BS", name: "Bahamas", flag: "🇧🇸", hasTreaty: false },
    { code: "GD", name: "Grenada", flag: "🇬🇩", hasTreaty: false },
    { code: "LC", name: "St. Lucia", flag: "🇱🇨", hasTreaty: false },
    { code: "VC", name: "St. Vincent", flag: "🇻🇨", hasTreaty: false },
    { code: "DM", name: "Dominica", flag: "🇩🇲", hasTreaty: false },
    { code: "DO", name: "Dominican Republic", flag: "🇩🇴", hasTreaty: true },
    { code: "HT", name: "Haiti", flag: "🇭🇹", hasTreaty: false },
    { code: "GY", name: "Guyana", flag: "🇬🇾", hasTreaty: false },
  ];

  // Tax sections
  const sections = [
    { id: "overview", title: "📋 Overview", icon: "📋" },
    { id: "calculator", title: "🧮 Tax Calculator", icon: "🧮" },
    { id: "withholding", title: "💸 Withholding Rules", icon: "💸" },
    { id: "forms", title: "📄 Tax Forms", icon: "📄" },
    { id: "treaties", title: "🤝 Tax Treaties", icon: "🤝" },
    { id: "filing", title: "📅 Filing Requirements", icon: "📅" },
    { id: "faq", title: "❓ FAQ", icon: "❓" },
  ];

  return (
    <div className="jobseeker-dashboard-container">
      {/* TOP NAVBAR */}
      <nav className="jobseeker-top-navbar">
        <div className="jobseeker-nav-brand">
          <a href="/" className="jobseeker-brand-logo">JobLytics</a>
          <div className="jobseeker-user-welcome">
            Welcome to Tax Guidance
          </div>
        </div>
        
        <div className="jobseeker-nav-center">
          <ul className="jobseeker-nav-links">
            <li><a href="/jobseeker">Dashboard</a></li>
            <li><a href="/job-search">Jobs</a></li>
            <li><a href="/job-seeker/applications">Applications</a></li>
            <li><a href="/schedule-interview">Interviews</a></li>
            <li><a href="/itin-support">ITIN Support</a></li>
            <li><a href="/payment-gateway">Payments</a></li>
            <li><a href="/tax-guidance" className="active">Tax Guide</a></li>
            <li><a href="/internet-speed-test">Internet Test</a></li>
            <li><a href="/employer-resources">For Employers</a></li>
            <li><a href="/community">Community</a></li>
          </ul>
        </div>

        <div className="jobseeker-nav-actions">
          {/* Notification Bell */}
          <div className="notification-container">
            <button className="notification-bell" onClick={toggleNotifications}>
              <span className="notification-icon">🔔</span>
              <span className="notification-badge">4</span>
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
                    <div className="notification-title">Tax Filing Reminder</div>
                    <div className="notification-message">April 15 deadline approaching</div>
                    <div className="notification-time">2 days ago</div>
                  </div>
                  <div className="unread-dot"></div>
                </div>
                <div className="notification-item">
                  <div className="notification-content">
                    <div className="notification-title">Tax Treaty Update</div>
                    <div className="notification-message">New guidance for Caribbean workers</div>
                    <div className="notification-time">1 week ago</div>
                  </div>
                </div>
                <div className="notification-item unread">
                  <div className="notification-content">
                    <div className="notification-title">W-8BEN Renewal</div>
                    <div className="notification-message">Your form expires next month</div>
                    <div className="notification-time">3 weeks ago</div>
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
              <span className="jobseeker-message-badge">3</span>
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
            <li className="active" onClick={() => navigate("/tax-guidance")}>
              <span className="jobseeker-menu-icon">💰</span>
              <span className="jobseeker-menu-text">Tax Guidance</span>
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
              <span className="jobseeker-menu-icon">🆔</span>
              <span className="jobseeker-menu-text">ITIN Support</span>
            </li>
            <li onClick={() => navigate("/payment-gateway")}>
              <span className="jobseeker-menu-icon">🏦</span>
              <span className="jobseeker-menu-text">Payments</span>
            </li>
            <li onClick={() => navigate("/internet-speed-test")}>
              <span className="jobseeker-menu-icon">📶</span>
              <span className="jobseeker-menu-text">Internet Test</span>
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
          <div className="tax-content-wrapper">
            {/* Hero Section */}
            <div className="tax-hero">
              <h1>💰 U.S. Tax Compliance Guide</h1>
              <p className="hero-subtitle">
                Simplified tax guidance for Caribbean remote workers earning from U.S. companies
              </p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="stat-number">30%</span>
                  <span className="stat-label">Standard Withholding</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">0-15%</span>
                  <span className="stat-label">With Treaty Benefits</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">April 15</span>
                  <span className="stat-label">Filing Deadline</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">3</span>
                  <span className="stat-label">Key Forms</span>
                </div>
              </div>
            </div>

            <div className="tax-layout">
              {/* Left Column: Navigation */}
              <div className="tax-navigation">
                <div className="navigation-card">
                  <h3>📚 Guide Sections</h3>
                  <ul className="section-nav">
                    {sections.map(section => (
                      <li
                        key={section.id}
                        className={activeSection === section.id ? 'active' : ''}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <span className="nav-icon">{section.icon}</span>
                        <span className="nav-text">{section.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Tax Tips */}
                <div className="tips-card">
                  <h3>💡 Quick Tax Tips</h3>
                  <div className="tip-list">
                    <div className="tip-item">
                      <span className="tip-icon">📝</span>
                      <span className="tip-text">Always file Form W-8BEN with employers</span>
                    </div>
                    <div className="tip-item">
                      <span className="tip-icon">🗓️</span>
                      <span className="tip-text">Deadline: April 15 (June 15 for those abroad)</span>
                    </div>
                    <div className="tip-item">
                      <span className="tip-icon">💾</span>
                      <span className="tip-text">Keep records for at least 3 years</span>
                    </div>
                    <div className="tip-item">
                      <span className="tip-icon">🤝</span>
                      <span className="tip-text">Claim treaty benefits if available</span>
                    </div>
                  </div>
                </div>

                {/* Important Forms */}
                <div className="forms-card">
                  <h3>📄 Important Forms</h3>
                  <div className="form-links">
                    <a
                      href="https://www.irs.gov/pub/irs-pdf/f1040nr.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="form-link"
                    >
                      📋 Form 1040-NR
                      <small>Non-Resident Tax Return</small>
                    </a>
                    <a
                      href="https://www.irs.gov/pub/irs-pdf/fw8ben.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="form-link"
                    >
                      📄 Form W-8BEN
                      <small>Certificate of Foreign Status</small>
                    </a>
                    <a
                      href="https://www.irs.gov/pub/irs-pdf/f8233.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="form-link"
                    >
                      📑 Form 8233
                      <small>Withholding Exemption</small>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="tax-content">
                {/* Overview Section */}
                {activeSection === "overview" && (
                  <div className="content-section">
                    <h2>📋 U.S. Tax Basics for Caribbean Remote Workers</h2>
                    <div className="section-content">
                      <p>
                        As a Caribbean resident earning income from U.S. companies, you have specific
                        tax obligations to the United States. This guide simplifies the complex
                        U.S. tax rules for non-resident aliens.
                      </p>

                      <div className="key-points">
                        <h3>Key Concepts to Understand:</h3>
                        <div className="points-grid">
                          <div className="point-card">
                            <h4>🌎 Non-Resident Alien Status</h4>
                            <p>You're considered a non-resident alien for U.S. tax purposes since you don't live in the U.S.</p>
                          </div>
                          <div className="point-card">
                            <h4>💸 U.S. Source Income</h4>
                            <p>Income from U.S. companies is considered U.S. source income, subject to U.S. taxes.</p>
                          </div>
                          <div className="point-card">
                            <h4>🤝 Tax Treaties</h4>
                            <p>Many Caribbean countries have tax treaties with the U.S. that reduce withholding rates.</p>
                          </div>
                          <div className="point-card">
                            <h4>📝 Annual Filing</h4>
                            <p>You must file Form 1040-NR annually if you have U.S. source income.</p>
                          </div>
                        </div>
                      </div>

                      <div className="highlight-box important">
                        <h4>💡 Why This Matters:</h4>
                        <ul>
                          <li><strong>Legal Compliance:</strong> Avoid penalties for non-compliance</li>
                          <li><strong>Tax Savings:</strong> Claim treaty benefits to reduce withholding</li>
                          <li><strong>Professionalism:</strong> Proper documentation builds trust with U.S. employers</li>
                          <li><strong>Record Keeping:</strong> Essential for audits and future applications</li>
                        </ul>
                      </div>

                      <div className="caribbean-specific">
                        <h3>🌴 Caribbean-Specific Considerations</h3>
                        <div className="consideration-cards">
                          <div className="consideration-card">
                            <h4>✅ Advantages</h4>
                            <ul>
                              <li>Many Caribbean countries have tax treaties with U.S.</li>
                              <li>English-language documentation (most countries)</li>
                              <li>Similar time zones simplify communication</li>
                              <li>Growing recognition of Caribbean remote workers</li>
                            </ul>
                          </div>
                          <div className="consideration-card">
                            <h4>⚠️ Challenges</h4>
                            <ul>
                              <li>Limited local tax advisors familiar with U.S. tax law</li>
                              <li>Currency conversion considerations</li>
                              <li>Different fiscal year timing in some countries</li>
                              <li>Varying document authentication requirements</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tax Calculator Section */}
                {activeSection === "calculator" && (
                  <div className="content-section">
                    <h2>🧮 Tax Estimation Calculator</h2>
                    <div className="section-content">
                      <p>Estimate your U.S. tax obligations based on your income and country:</p>

                      <div className="tax-calculator">
                        <div className="calculator-inputs">
                          <div className="input-group">
                            <label>Annual Income (USD)</label>
                            <div className="currency-input">
                              <span className="currency-symbol">$</span>
                              <input
                                type="number"
                                placeholder="Enter amount"
                                value={income}
                                onChange={(e) => {
                                  setIncome(e.target.value);
                                  setCalculatedTax(null);
                                }}
                                min="0"
                                step="100"
                              />
                            </div>
                          </div>

                          <div className="input-group">
                            <label>Your Country</label>
                            <select
                              value={country}
                              onChange={(e) => {
                                setCountry(e.target.value);
                                setCalculatedTax(null);
                              }}
                              className="country-select"
                            >
                              {caribbeanCountries.map(country => (
                                <option key={country.code} value={country.name}>
                                  {country.flag} {country.name} {country.hasTreaty ? "(Treaty)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={calculateTax}
                            className="calculate-btn"
                            disabled={!income}
                          >
                            Calculate Tax Estimate
                          </button>
                        </div>

                        {calculatedTax && (
                          <div className="tax-results">
                            <h3>💰 Tax Estimation Results</h3>
                            <div className="results-grid">
                              <div className="result-card">
                                <h4>Gross Income</h4>
                                <p className="amount">${calculatedTax.gross.toLocaleString()}</p>
                              </div>
                              <div className="result-card">
                                <h4>Tax Rate</h4>
                                <p className="rate">{calculatedTax.taxRate.toFixed(1)}%</p>
                                {calculatedTax.treatyApplied && (
                                  <span className="treaty-badge">Treaty Applied</span>
                                )}
                              </div>
                              <div className="result-card">
                                <h4>Tax Amount</h4>
                                <p className="tax-amount">${calculatedTax.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                              <div className="result-card">
                                <h4>Net Income</h4>
                                <p className="net-amount">${calculatedTax.netIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                            </div>

                            <div className="calculation-notes">
                              <h4>📝 Important Notes:</h4>
                              <ul>
                                <li>This is an <strong>estimation only</strong> - actual taxes may vary</li>
                                <li>Rates assume proper Form W-8BEN submission</li>
                                <li>State taxes may apply depending on employer location</li>
                                <li>Consult a tax professional for accurate calculation</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        <div className="calculator-info">
                          <h3>📊 How Withholding Works:</h3>
                          <div className="withholding-steps">
                            <div className="step">
                              <div className="step-number">1</div>
                              <div className="step-content">
                                <h4>Default Withholding</h4>
                                <p>U.S. companies must withhold 30% from payments to non-resident aliens</p>
                              </div>
                            </div>
                            <div className="step">
                              <div className="step-number">2</div>
                              <div className="step-content">
                                <h4>Form W-8BEN</h4>
                                <p>Submit this form to employer to claim treaty benefits and reduce withholding</p>
                              </div>
                            </div>
                            <div className="step">
                              <div className="step-number">3</div>
                              <div className="step-content">
                                <h4>Actual Tax Liability</h4>
                                <p>File annual tax return to reconcile withholding with actual tax owed</p>
                              </div>
                            </div>
                            <div className="step">
                              <div className="step-number">4</div>
                              <div className="step-content">
                                <h4>Refund or Payment</h4>
                                <p>Receive refund if too much withheld, or pay additional if too little</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Withholding Rules Section */}
                {activeSection === "withholding" && (
                  <div className="content-section">
                    <h2>💸 U.S. Withholding Rules Explained</h2>
                    <div className="section-content">
                      <p>Understanding how U.S. companies withhold taxes from your payments:</p>

                      <div className="withholding-overview">
                        <div className="withholding-card standard">
                          <h3>Standard Rate: 30%</h3>
                          <p>Applies to all non-resident aliens without treaty benefits</p>
                          <div className="rate-breakdown">
                            <span className="rate-badge">Default Rate</span>
                            <span className="rate-applies">For: All countries without treaties</span>
                          </div>
                        </div>

                        <div className="withholding-card treaty">
                          <h3>Treaty Rate: 0-15%</h3>
                          <p>Reduced rates for countries with U.S. tax treaties</p>
                          <div className="rate-breakdown">
                            <span className="rate-badge">Reduced Rate</span>
                            <span className="rate-applies">For: Treaty countries (Jamaica, Barbados, etc.)</span>
                          </div>
                        </div>
                      </div>

                      <div className="withholding-process">
                        <h3>📋 How to Reduce Withholding:</h3>
                        <div className="process-steps">
                          <div className="process-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                              <h4>Complete Form W-8BEN</h4>
                              <p>Fill out all sections accurately, including treaty claim</p>
                              <a
                                href="https://www.irs.gov/pub/irs-pdf/fw8ben.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="step-link"
                              >
                                Download Form W-8BEN
                              </a>
                            </div>
                          </div>

                          <div className="process-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                              <h4>Submit to Employer</h4>
                              <p>Provide completed form before receiving first payment</p>
                              <div className="step-tip">
                                <strong>Tip:</strong> Keep a copy for your records
                              </div>
                            </div>
                          </div>

                          <div className="process-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                              <h4>Form 8233 (If Needed)</h4>
                              <p>For certain treaty benefits or exemption from withholding</p>
                              <div className="step-tip">
                                <strong>Note:</strong> Less common, but useful in specific situations
                              </div>
                            </div>
                          </div>

                          <div className="process-step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                              <h4>Renew Every 3 Years</h4>
                              <p>Form W-8BEN expires after 3 calendar years</p>
                              <div className="step-tip warning">
                                <strong>⚠️ Important:</strong> Update before expiration to avoid 30% withholding
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="country-treaty-rates">
                        <h3>🌐 Caribbean Country Withholding Rates</h3>
                        <div className="rates-table">
                          <table>
                            <thead>
                              <tr>
                                <th>Country</th>
                                <th>Tax Treaty</th>
                                <th>Withholding Rate</th>
                                <th>Form Required</th>
                              </tr>
                            </thead>
                            <tbody>
                              {caribbeanCountries.map(country => (
                                <tr key={country.code}>
                                  <td>
                                    <span className="country-flag">{country.flag}</span>
                                    {country.name}
                                  </td>
                                  <td>
                                    {country.hasTreaty ? (
                                      <span className="status yes">✅ Yes</span>
                                    ) : (
                                      <span className="status no">❌ No</span>
                                    )}
                                  </td>
                                  <td>
                                    {country.hasTreaty ? (
                                      <span className="rate-treaty">0-15%</span>
                                    ) : (
                                      <span className="rate-standard">30%</span>
                                    )}
                                  </td>
                                  <td>
                                    {country.hasTreaty ? "W-8BEN" : "W-8BEN"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tax Forms Section */}
                {activeSection === "forms" && (
                  <div className="content-section">
                    <h2>📄 Essential Tax Forms</h2>
                    <div className="section-content">
                      <p>Key forms every Caribbean remote worker should know:</p>

                      <div className="forms-overview">
                        <div className="form-card essential">
                          <div className="form-header">
                            <h3>Form W-8BEN</h3>
                            <span className="form-importance">Most Important</span>
                          </div>
                          <div className="form-details">
                            <p><strong>Purpose:</strong> Certificate of Foreign Status</p>
                            <p><strong>When to submit:</strong> Before first payment from each U.S. client</p>
                            <p><strong>Validity:</strong> 3 calendar years</p>
                            <p><strong>Key benefit:</strong> Reduces withholding to treaty rate</p>
                          </div>
                          <div className="form-actions">
                            <a
                              href="https://www.irs.gov/pub/irs-pdf/fw8ben.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="form-download"
                            >
                              📥 Download PDF
                            </a>
                            <button 
                              className="form-guide"
                              onClick={() => window.open("https://www.irs.gov/instructions/iw8ben", "_blank")}
                            >
                              📖 View Instructions
                            </button>
                          </div>
                        </div>

                        <div className="form-card important">
                          <div className="form-header">
                            <h3>Form 1040-NR</h3>
                            <span className="form-importance">Annual Filing</span>
                          </div>
                          <div className="form-details">
                            <p><strong>Purpose:</strong> U.S. Nonresident Alien Income Tax Return</p>
                            <p><strong>When to file:</strong> Annually by April 15 (June 15 for those abroad)</p>
                            <p><strong>Who needs it:</strong> All with U.S. source income above threshold</p>
                            <p><strong>Key benefit:</strong> Claim refunds or report additional tax</p>
                          </div>
                          <div className="form-actions">
                            <a
                              href="https://www.irs.gov/pub/irs-pdf/f1040nr.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="form-download"
                            >
                              📥 Download PDF
                            </a>
                            <button 
                              className="form-guide"
                              onClick={() => window.open("https://www.irs.gov/instructions/i1040nr", "_blank")}
                            >
                              📖 View Instructions
                            </button>
                          </div>
                        </div>

                        <div className="form-card additional">
                          <div className="form-header">
                            <h3>Form 8233</h3>
                            <span className="form-importance">Special Cases</span>
                          </div>
                          <div className="form-details">
                            <p><strong>Purpose:</strong> Exemption From Withholding</p>
                            <p><strong>When to use:</strong> For specific treaty benefits or teaching/research</p>
                            <p><strong>Complexity:</strong> More detailed than W-8BEN</p>
                            <p><strong>Key benefit:</strong> Complete exemption from withholding</p>
                          </div>
                          <div className="form-actions">
                            <a
                              href="https://www.irs.gov/pub/irs-pdf/f8233.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="form-download"
                            >
                              📥 Download PDF
                            </a>
                            <button 
                              className="form-guide"
                              onClick={() => window.open("https://www.irs.gov/instructions/i8233", "_blank")}
                            >
                              📖 View Instructions
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="form-timeline">
                        <h3>🗓️ Form Submission Timeline</h3>
                        <div className="timeline">
                          <div className="timeline-item">
                            <div className="timeline-date">Before First Payment</div>
                            <div className="timeline-content">
                              <h4>Submit Form W-8BEN</h4>
                              <p>Give to each U.S. employer/client to establish treaty benefits</p>
                            </div>
                          </div>
                          <div className="timeline-item">
                            <div className="timeline-date">January - April</div>
                            <div className="timeline-content">
                              <h4>Receive Form 1042-S</h4>
                              <p>U.S. payers must send this form reporting income and withholding</p>
                            </div>
                          </div>
                          <div className="timeline-item">
                            <div className="timeline-date">By April 15</div>
                            <div className="timeline-content">
                              <h4>File Form 1040-NR</h4>
                              <p>Submit annual tax return (June 15 automatic extension for those abroad)</p>
                            </div>
                          </div>
                          <div className="timeline-item">
                            <div className="timeline-date">Every 3 Years</div>
                            <div className="timeline-content">
                              <h4>Renew Form W-8BEN</h4>
                              <p>Update form before expiration to maintain treaty benefits</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tax Treaties Section */}
                {activeSection === "treaties" && (
                  <div className="content-section">
                    <h2>🤝 U.S.-Caribbean Tax Treaties</h2>
                    <div className="section-content">
                      <p>Understanding how tax treaties benefit Caribbean remote workers:</p>

                      <div className="treaty-explanation">
                        <div className="treaty-benefits">
                          <h3>✅ Treaty Benefits:</h3>
                          <ul>
                            <li><strong>Reduced withholding rates</strong> on U.S. source income</li>
                            <li><strong>Exemption from U.S. tax</strong> on certain types of income</li>
                            <li><strong>Prevention of double taxation</strong> (tax in both countries)</li>
                            <li><strong>Simplified compliance</strong> through standardized forms</li>
                          </ul>
                        </div>

                        <div className="treaty-requirements">
                          <h3>📝 Treaty Requirements:</h3>
                          <ul>
                            <li>Must be a <strong>tax resident</strong> of treaty country</li>
                            <li>Must submit <strong>Form W-8BEN</strong> to claim benefits</li>
                            <li>Must have a <strong>Taxpayer Identification Number</strong> (ITIN or SSN)</li>
                            <li>Benefits apply only to <strong>covered taxes</strong> in treaty</li>
                          </ul>
                        </div>
                      </div>

                      <div className="caribbean-treaties">
                        <h3>🌴 Caribbean Countries with U.S. Tax Treaties:</h3>
                        <div className="treaty-countries">
                          {caribbeanCountries
                            .filter(country => country.hasTreaty)
                            .map(country => (
                              <div key={country.code} className="treaty-country-card">
                                <div className="country-flag-large">{country.flag}</div>
                                <div className="country-info">
                                  <h4>{country.name}</h4>
                                  <div className="treaty-details">
                                    <p><strong>Treaty Signed:</strong> Varies by country</p>
                                    <p><strong>Withholding Rate:</strong> 0-15% depending on income type</p>
                                    <p><strong>Key Provisions:</strong> Reduced rates for services income</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="treaty-claim-process">
                        <h3>🔄 How to Claim Treaty Benefits:</h3>
                        <div className="claim-steps">
                          <div className="claim-step">
                            <h4>Step 1: Determine Eligibility</h4>
                            <p>Verify you're a tax resident of a treaty country and the income type is covered</p>
                          </div>
                          <div className="claim-step">
                            <h4>Step 2: Complete Form W-8BEN</h4>
                            <p>Check "Yes" for treaty claim and specify country in Part II</p>
                          </div>
                          <div className="claim-step">
                            <h4>Step 3: Provide Supporting Documents</h4>
                            <p>May need to provide proof of tax residency if requested</p>
                          </div>
                          <div className="claim-step">
                            <h4>Step 4: Submit Before Payment</h4>
                            <p>Give completed form to U.S. payer before receiving payments</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filing Requirements Section */}
                {activeSection === "filing" && (
                  <div className="content-section">
                    <h2>📅 Annual Filing Requirements</h2>
                    <div className="section-content">
                      <p>What you need to know about annual U.S. tax filing:</p>

                      <div className="filing-threshold">
                        <h3>📊 Who Must File Form 1040-NR?</h3>
                        <div className="threshold-cards">
                          <div className="threshold-card">
                            <h4>✅ MUST FILE if:</h4>
                            <ul>
                              <li>U.S. source income &gt; $400 (self-employment)</li>
                              <li>Withholding was incorrect (too much or too little)</li>
                              <li>Claiming treaty benefits not honored by payer</li>
                              <li>Required to file by specific treaty provisions</li>
                            </ul>
                          </div>
                          <div className="threshold-card">
                            <h4>❌ MAY NOT NEED TO FILE if:</h4>
                            <ul>
                              <li>Income below filing threshold</li>
                              <li>All income had proper 30% withholding</li>
                              <li>No U.S. tax liability after treaty benefits</li>
                              <li>Income fully exempt under treaty</li>
                            </ul>
                          </div>
                        </div>
                        <div className="threshold-note">
                          <p><strong>Note:</strong> When in doubt, consult a tax professional or file to be safe.</p>
                        </div>
                      </div>

                      <div className="filing-deadlines">
                        <h3>⏰ Important Deadlines</h3>
                        <div className="deadline-cards">
                          <div className="deadline-card critical">
                            <h4>April 15</h4>
                            <p><strong>Standard Filing Deadline</strong></p>
                            <p>Form 1040-NR due for previous tax year</p>
                          </div>
                          <div className="deadline-card important">
                            <h4>June 15</h4>
                            <p><strong>Automatic Extension</strong></p>
                            <p>For those living outside the U.S. on April 15</p>
                          </div>
                          <div className="deadline-card standard">
                            <h4>October 15</h4>
                            <p><strong>Final Deadline</strong></p>
                            <p>With extension request (Form 4868)</p>
                          </div>
                        </div>
                      </div>

                      <div className="filing-checklist">
                        <h3>📋 Filing Checklist</h3>
                        <div className="checklist-items">
                          <div className="checklist-item">
                            <input type="checkbox" id="check-1" />
                            <label htmlFor="check-1">Form 1040-NR completed</label>
                          </div>
                          <div className="checklist-item">
                            <input type="checkbox" id="check-2" />
                            <label htmlFor="check-2">Form 1042-S from all U.S. payers</label>
                          </div>
                          <div className="checklist-item">
                            <input type="checkbox" id="check-3" />
                            <label htmlFor="check-3">Income and expense records</label>
                          </div>
                          <div className="checklist-item">
                            <input type="checkbox" id="check-4" />
                            <label htmlFor="check-4">ITIN or SSN included</label>
                          </div>
                          <div className="checklist-item">
                            <input type="checkbox" id="check-5" />
                            <label htmlFor="check-5">Tax treaty benefits claimed (if applicable)</label>
                          </div>
                          <div className="checklist-item">
                            <input type="checkbox" id="check-6" />
                            <label htmlFor="check-6">Payment or direct deposit info for refund</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQ Section */}
                {activeSection === "faq" && (
                  <div className="content-section">
                    <h2>❓ Frequently Asked Questions</h2>
                    <div className="section-content">
                      <div className="faq-grid">
                        <div className="faq-item">
                          <h4>Q: Do I pay tax in both the U.S. and my home country?</h4>
                          <p><strong>A:</strong> Usually no, due to tax treaties and foreign tax credits. You typically pay in the country where the income is sourced (U.S.), then claim exemption or credit in your home country.</p>
                        </div>

                        <div className="faq-item">
                          <h4>Q: What if my U.S. client doesn't withhold taxes?</h4>
                          <p><strong>A:</strong> You're still responsible for the tax. File Form 1040-NR and pay the tax owed. Consider discussing proper withholding with the client.</p>
                        </div>

                        <div className="faq-item">
                          <h4>Q: Can I deduct business expenses?</h4>
                          <p><strong>A:</strong> Yes, on Form 1040-NR Schedule C. Keep receipts for home office, internet, equipment, etc.</p>
                        </div>

                        <div className="faq-item">
                          <h4>Q: What if I forget to file?</h4>
                          <p><strong>A:</strong> File as soon as possible. Penalties may apply but are often waived for first-time offenders or small amounts.</p>
                        </div>

                        <div className="faq-item">
                          <h4>Q: Do I need a U.S. tax professional?</h4>
                          <p><strong>A:</strong> Recommended for first-time filers or complex situations. Many specialize in non-resident taxes.</p>
                        </div>

                        <div className="faq-item">
                          <h4>Q: How long should I keep tax records?</h4>
                          <p><strong>A:</strong> At least 3 years from filing date, but 6 years is safer if you underreported income.</p>
                        </div>
                      </div>

                      <div className="professional-help">
                        <h3>👨‍💼 When to Seek Professional Help:</h3>
                        <div className="help-cards">
                          <div className="help-card">
                            <h4>✅ Consider a Professional If:</h4>
                            <ul>
                              <li>First time filing U.S. taxes</li>
                              <li>Income over $100,000</li>
                              <li>Multiple U.S. income sources</li>
                              <li>Complex treaty situations</li>
                              <li>Previous filing errors</li>
                            </ul>
                          </div>
                          <div className="help-card">
                            <h4>💰 Finding Tax Help:</h4>
                            <ul>
                              <li>Look for "non-resident tax specialists"</li>
                              <li>Verify experience with Caribbean clients</li>
                              <li>Check reviews and credentials</li>
                              <li>Ask about fixed-fee pricing</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxGuidance;