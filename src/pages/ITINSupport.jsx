import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ITINSupport.css";

const ITINSupport = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, text: "Valid passport", checked: false },
    { id: 2, text: "Completed Form W-7", checked: false },
    { id: 3, text: "Federal tax return (if filing)", checked: false },
    { id: 4, text: "Proof of foreign status", checked: false },
    { id: 5, text: "Certified passport translation (if needed)", checked: false },
    { id: 6, text: "Notarized copies of documents", checked: false },
    { id: 7, text: "Proof of US income opportunity", checked: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const toggleChecklistItem = (id) => {
    setChecklistItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
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

  const sections = [
    { id: "overview", title: "📋 Overview", icon: "📋" },
    { id: "eligibility", title: "✅ Eligibility", icon: "✅" },
    { id: "documents", title: "📄 Required Documents", icon: "📄" },
    { id: "application", title: "📝 Application Process", icon: "📝" },
    { id: "timeline", title: "⏰ Timeline & Tracking", icon: "⏰" },
    { id: "postitin", title: "🏦 After Getting ITIN", icon: "🏦" },
    { id: "faq", title: "❓ FAQ", icon: "❓" },
  ];

  return (
    <div className="jobseeker-dashboard-container">
      {/* TOP NAVBAR */}
      <nav className="jobseeker-top-navbar">
        <div className="jobseeker-nav-brand">
          <a href="/" className="jobseeker-brand-logo">JobLytics</a>
          <div className="jobseeker-user-welcome">
            Welcome to ITIN Support
          </div>
        </div>
        
        <div className="jobseeker-nav-center">
          <ul className="jobseeker-nav-links">
            <li><a href="/jobseeker">Dashboard</a></li>
            <li><a href="/job-search">Jobs</a></li>
            <li><a href="/job-seeker/applications">Applications</a></li>
            <li><a href="/schedule-interview">Interviews</a></li>
            <li><a href="/itin-support" className="active">ITIN Support</a></li>
            <li><a href="/payment-gateway">Payments</a></li>
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
              <span className="notification-badge">2</span>
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
                    <div className="notification-title">ITIN Application Update</div>
                    <div className="notification-message">Your ITIN application is being processed</div>
                    <div className="notification-time">2 days ago</div>
                  </div>
                  <div className="unread-dot"></div>
                </div>
                <div className="notification-item">
                  <div className="notification-content">
                    <div className="notification-title">Document Verification</div>
                    <div className="notification-message">Passport verification complete</div>
                    <div className="notification-time">1 week ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Button */}
          <div className="jobseeker-icon-button-container">
            <button className="jobseeker-icon-button">
              <span className="jobseeker-icon-button-icon">💬</span>
              <span className="jobseeker-message-badge">1</span>
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
            <li className="active" onClick={() => navigate("/itin-support")}>
              <span className="jobseeker-menu-icon">🆔</span>
              <span className="jobseeker-menu-text">ITIN Support</span>
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
            <li onClick={() => navigate("/payment-gateway")}>
              <span className="jobseeker-menu-icon">🏦</span>
              <span className="jobseeker-menu-text">Payments</span>
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
          <div className="itin-content-wrapper">
            {/* Hero Section */}
            <div className="itin-hero">
              <h1>🆔 ITIN Support & Documentation Guide</h1>
              <p className="hero-subtitle">
                Complete step-by-step guide to obtain your Individual Taxpayer Identification Number (ITIN) for U.S. remote work
              </p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="stat-number">7-11</span>
                  <span className="stat-label">Weeks Processing</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">4</span>
                  <span className="stat-label">Key Documents</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">0</span>
                  <span className="stat-label">SSN Required</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Online Guidance</span>
                </div>
              </div>
            </div>

            <div className="itin-layout">
              {/* Left Column: Navigation */}
              <div className="itin-navigation">
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

                {/* Interactive Checklist */}
                <div className="checklist-card">
                  <h3>📋 ITIN Application Checklist</h3>
                  <p className="checklist-subtitle">Track your progress</p>
                  <div className="checklist-items">
                    {checklistItems.map(item => (
                      <div key={item.id} className="checklist-item">
                        <input
                          type="checkbox"
                          id={`check-${item.id}`}
                          checked={item.checked}
                          onChange={() => toggleChecklistItem(item.id)}
                        />
                        <label 
                          htmlFor={`check-${item.id}`}
                          className={item.checked ? 'checked' : ''}
                        >
                          {item.text}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="checklist-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(checklistItems.filter(item => item.checked).length / checklistItems.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {checklistItems.filter(item => item.checked).length} of {checklistItems.length} completed
                    </span>
                  </div>
                  <button 
                    className="print-checklist-btn"
                    onClick={() => window.print()}
                  >
                    🖨️ Print Checklist
                  </button>
                </div>

                {/* Quick Resources */}
                <div className="resources-card">
                  <h3>🔗 Quick Resources</h3>
                  <div className="resource-links">
                    <a 
                      href="https://www.irs.gov/forms-pubs/about-form-w-7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      📄 IRS Form W-7 (PDF)
                    </a>
                    <a 
                      href="https://www.irs.gov/individuals/international-taxpayers/itin-acceptance-agent-program"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      🏢 Find Acceptance Agents
                    </a>
                    <a 
                      href="https://www.irs.gov/individuals/international-taxpayers/itin-processing-times"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      ⏰ Check Processing Times
                    </a>
                    <button 
                      className="resource-link"
                      onClick={() => navigate("/tax-guidance")}
                    >
                      💰 Tax Guide for ITIN Holders
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="itin-content">
                {/* Overview Section */}
                {activeSection === "overview" && (
                  <div className="content-section">
                    <h2>📋 What is an ITIN?</h2>
                    <div className="section-content">
                      <p>
                        An <strong>Individual Taxpayer Identification Number (ITIN)</strong> is a tax processing number issued by the 
                        Internal Revenue Service (IRS) for individuals who are required to have a U.S. taxpayer identification 
                        number but don't have and are not eligible to get a Social Security Number (SSN).
                      </p>
                      
                      <div className="highlight-box important">
                        <h4>💡 Why Caribbean Remote Workers Need ITIN:</h4>
                        <ul>
                          <li>Required for U.S. tax reporting on income earned from U.S. companies</li>
                          <li>Needed to open certain U.S. bank accounts for receiving payments</li>
                          <li>Required for tax treaty benefits to reduce withholding taxes</li>
                          <li>Establishes your tax identity with the IRS</li>
                        </ul>
                      </div>

                      <h3>Who Should Apply for ITIN?</h3>
                      <div className="eligibility-cards">
                        <div className="eligibility-card">
                          <h4>✅ You SHOULD apply if:</h4>
                          <ul>
                            <li>You earn income from U.S. clients/companies</li>
                            <li>You need to file U.S. tax returns (Form 1040-NR)</li>
                            <li>You want to claim tax treaty benefits</li>
                            <li>Your employer requires it for payroll</li>
                          </ul>
                        </div>
                        <div className="eligibility-card">
                          <h4>❌ You DON'T need ITIN if:</h4>
                          <ul>
                            <li>You only work for non-U.S. companies</li>
                            <li>Your U.S. income is below $400 (consult tax advisor)</li>
                            <li>You already have a valid SSN</li>
                            <li>You're a U.S. citizen or resident alien</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Eligibility Section */}
                {activeSection === "eligibility" && (
                  <div className="content-section">
                    <h2>✅ ITIN Eligibility Requirements</h2>
                    <div className="section-content">
                      <p>To qualify for an ITIN, you must meet specific criteria set by the IRS:</p>
                      
                      <div className="requirements-grid">
                        <div className="requirement-card">
                          <div className="req-number">1</div>
                          <h4>Non-Resident Alien Status</h4>
                          <p>You must be a non-resident alien who is required to file a U.S. tax return or have a reporting requirement.</p>
                        </div>
                        <div className="requirement-card">
                          <div className="req-number">2</div>
                          <h4>U.S. Tax Filing Requirement</h4>
                          <p>You must have a valid reason for needing a U.S. taxpayer identification number (like receiving U.S. income).</p>
                        </div>
                        <div className="requirement-card">
                          <div className="req-number">3</div>
                          <h4>No SSN Eligibility</h4>
                          <p>You must not be eligible for a Social Security Number (SSN) from the Social Security Administration.</p>
                        </div>
                        <div className="requirement-card">
                          <div className="req-number">4</div>
                          <h4>Valid Foreign Status</h4>
                          <p>You must provide proof of your foreign status and identity.</p>
                        </div>
                      </div>

                      <div className="highlight-box tip">
                        <h4>🌎 Caribbean-Specific Eligibility Notes:</h4>
                        <ul>
                          <li>Caribbean citizens working remotely for U.S. companies <strong>are eligible</strong></li>
                          <li>Freelancers/contractors with U.S. clients <strong>are eligible</strong></li>
                          <li>You don't need a U.S. visa or work permit to apply for ITIN</li>
                          <li>Your physical location doesn't affect eligibility</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents Section */}
                {activeSection === "documents" && (
                  <div className="content-section">
                    <h2>📄 Required Documents Checklist</h2>
                    <div className="section-content">
                      <p>Gather these documents before starting your application:</p>
                      
                      <div className="documents-grid">
                        <div className="document-card essential">
                          <h4>1. Proof of Identity</h4>
                          <p><strong>Primary Document:</strong> Valid passport</p>
                          <p><strong>Alternatives:</strong> National ID card, driver's license, birth certificate</p>
                          <div className="doc-tip">
                            <small>📌 Must be original or certified copy. Non-English documents need certified translation.</small>
                          </div>
                        </div>
                        
                        <div className="document-card essential">
                          <h4>2. Form W-7</h4>
                          <p><strong>Purpose:</strong> ITIN Application form</p>
                          <p><strong>Download:</strong> <a href="https://www.irs.gov/pub/irs-pdf/fw7.pdf" target="_blank" rel="noopener noreferrer">IRS Form W-7 (PDF)</a></p>
                          <div className="doc-tip">
                            <small>📌 Complete all sections. Common errors: incorrect name spelling, missing signatures.</small>
                          </div>
                        </div>
                        
                        <div className="document-card essential">
                          <h4>3. U.S. Tax Return</h4>
                          <p><strong>Form:</strong> 1040-NR (Non-Resident Alien)</p>
                          <p><strong>When needed:</strong> If you're filing taxes with your ITIN application</p>
                          <div className="doc-tip">
                            <small>📌 Not always required. Consult tax advisor for your specific situation.</small>
                          </div>
                        </div>
                        
                        <div className="document-card important">
                          <h4>4. Proof of Foreign Status</h4>
                          <p><strong>Examples:</strong> Visa, entry stamp, immigration documents</p>
                          <p><strong>Caribbean specific:</strong> Passport with citizenship page</p>
                          <div className="doc-tip">
                            <small>📌 Required to prove you're a non-resident alien.</small>
                          </div>
                        </div>
                      </div>

                      <div className="document-tips">
                        <h3>📌 Document Preparation Tips:</h3>
                        <div className="tips-grid">
                          <div className="tip-card">
                            <h4>Certified Copies</h4>
                            <p>Get notarized or certified copies if sending originals makes you uncomfortable.</p>
                          </div>
                          <div className="tip-card">
                            <h4>Translation Services</h4>
                            <p>Non-English documents need certified translation. Local embassies can help.</p>
                          </div>
                          <div className="tip-card">
                            <h4>Document Safety</h4>
                            <p>Make photocopies of everything before mailing. Use tracked shipping.</p>
                          </div>
                          <div className="tip-card">
                            <h4>Validity Period</h4>
                            <p>Documents must be current (passport not expired, IDs recent).</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Process Section */}
                {activeSection === "application" && (
                  <div className="content-section">
                    <h2>📝 Step-by-Step Application Process</h2>
                    <div className="section-content">
                      <div className="process-steps">
                        <div className="process-step">
                          <div className="step-number">1</div>
                          <div className="step-content">
                            <h3>Gather Documents</h3>
                            <p>Collect all required documents from the checklist above. Ensure everything is current and valid.</p>
                            <div className="step-tip">
                              <strong>Time:</strong> 1-3 days | <strong>Cost:</strong> Varies (notarization, translation)
                            </div>
                          </div>
                        </div>
                        
                        <div className="process-step">
                          <div className="step-number">2</div>
                          <div className="step-content">
                            <h3>Complete Form W-7</h3>
                            <p>Download and fill out IRS Form W-7. Pay special attention to:</p>
                            <ul>
                              <li>Name (must match passport exactly)</li>
                              <li>Date and place of birth</li>
                              <li>Reason for applying (select "d" for non-resident filing tax return)</li>
                              <li>Signature and date</li>
                            </ul>
                            <a 
                              href="https://www.irs.gov/pub/irs-pdf/fw7.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="step-link"
                            >
                              📥 Download Form W-7
                            </a>
                          </div>
                        </div>
                        
                        <div className="process-step">
                          <div className="step-number">3</div>
                          <div className="step-content">
                            <h3>Prepare Tax Return (If Required)</h3>
                            <p>If you're filing taxes, complete Form 1040-NR. Common for:</p>
                            <ul>
                              <li>Those with U.S. income tax filing requirement</li>
                              <li>Claiming tax treaty benefits</li>
                              <li>Requesting refund of over-withheld taxes</li>
                            </ul>
                            <div className="step-tip">
                              <strong>Note:</strong> Consider consulting a tax professional familiar with Caribbean-U.S. tax treaties.
                            </div>
                          </div>
                        </div>
                        
                        <div className="process-step">
                          <div className="step-number">4</div>
                          <div className="step-content">
                            <h3>Choose Submission Method</h3>
                            <div className="method-cards">
                              <div className="method-card">
                                <h4>📮 Mail to IRS</h4>
                                <p><strong>Address:</strong><br/>IRS ITIN Operation<br/>P.O. Box 149342<br/>Austin, TX 78714-9342</p>
                                <p><strong>Best for:</strong> Most Caribbean applicants</p>
                              </div>
                              <div className="method-card">
                                <h4>🏢 In-Person (U.S. Only)</h4>
                                <p><strong>Option:</strong> IRS Taxpayer Assistance Center</p>
                                <p><strong>Best for:</strong> Those visiting the U.S.</p>
                              </div>
                              <div className="method-card">
                                <h4>🤝 Acceptance Agent</h4>
                                <p><strong>Option:</strong> Certified Acceptance Agent</p>
                                <p><strong>Best for:</strong> Faster processing, document verification</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="process-step">
                          <div className="step-number">5</div>
                          <div className="step-content">
                            <h3>Mail Application Package</h3>
                            <p>Include in your package:</p>
                            <ol>
                              <li>Completed Form W-7</li>
                              <li>Original/certified identity documents</li>
                              <li>Tax return (if applicable)</li>
                              <li>Proof of foreign status</li>
                              <li>Cover letter (optional but recommended)</li>
                            </ol>
                            <div className="step-tip warning">
                              <strong>⚠️ Important:</strong> Use tracked/registered mail. Keep copies of everything.
                            </div>
                          </div>
                        </div>
                        
                        <div className="process-step">
                          <div className="step-number">6</div>
                          <div className="step-content">
                            <h3>Wait for Processing</h3>
                            <p>Typical processing times:</p>
                            <ul>
                              <li><strong>7-11 weeks</strong> during non-peak periods</li>
                              <li><strong>Up to 14 weeks</strong> during tax season (Jan-Apr)</li>
                              <li><strong>9-10 weeks</strong> for Caribbean applicants</li>
                            </ul>
                            <div className="step-tip">
                              <strong>📞 Contact IRS after 11 weeks</strong> if you haven't received response.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline Section */}
                {activeSection === "timeline" && (
                  <div className="content-section">
                    <h2>⏰ Application Timeline & Tracking</h2>
                    <div className="section-content">
                      <div className="timeline-visual">
                        <div className="timeline-item">
                          <div className="timeline-dot current"></div>
                          <div className="timeline-content">
                            <h4>Week 1-2: Preparation</h4>
                            <p>Gather documents, complete forms, make copies</p>
                          </div>
                        </div>
                        <div className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <h4>Week 3: Submission</h4>
                            <p>Mail application via tracked courier</p>
                          </div>
                        </div>
                        <div className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <h4>Week 4-10: Processing</h4>
                            <p>IRS reviews application. No updates typically during this period.</p>
                          </div>
                        </div>
                        <div className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <h4>Week 11: Decision</h4>
                            <p>ITIN issued or additional information requested</p>
                          </div>
                        </div>
                        <div className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <h4>Week 12: Receipt</h4>
                            <p>Receive CP565 notice with your ITIN via mail</p>
                          </div>
                        </div>
                      </div>

                      <div className="tracking-tools">
                        <h3>📱 Tracking Your Application</h3>
                        <div className="tracking-cards">
                          <div className="tracking-card">
                            <h4>IRS Phone Inquiry</h4>
                            <p><strong>Phone:</strong> 1-800-829-1040</p>
                            <p><strong>Hours:</strong> Mon-Fri, 7am-7pm local time</p>
                            <p><strong>Have ready:</strong> Your name, date of birth, mailing address</p>
                          </div>
                          <div className="tracking-card">
                            <h4>Online Tools</h4>
                            <p><strong>Where's My ITIN?:</strong> Not available online</p>
                            <p><strong>Alternative:</strong> Contact IRS directly</p>
                            <p><strong>Tip:</strong> Call early morning for shorter wait times</p>
                          </div>
                          <div className="tracking-card">
                            <h4>Common Status Updates</h4>
                            <ul>
                              <li>✅ Application received</li>
                              <li>⏳ Under review</li>
                              <li>📄 Additional documents needed</li>
                              <li>✅ ITIN issued</li>
                              <li>❌ Application denied (with reason)</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="reminder-section">
                        <h3>🔔 Set Reminders</h3>
                        <div className="reminder-cards">
                          <div className="reminder-card">
                            <h4>After 8 Weeks</h4>
                            <p>Check if documents were returned (if sent originals)</p>
                          </div>
                          <div className="reminder-card">
                            <h4>After 11 Weeks</h4>
                            <p>Contact IRS if no response received</p>
                          </div>
                          <div className="reminder-card">
                            <h4>Upon Receipt</h4>
                            <p>Update your JobLytics profile with ITIN number</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* After ITIN Section */}
                {activeSection === "postitin" && (
                  <div className="content-section">
                    <h2>🏦 What to Do After Getting Your ITIN</h2>
                    <div className="section-content">
                      <div className="post-itin-grid">
                        <div className="post-itin-card">
                          <h3>1. Update Your Records</h3>
                          <ul>
                            <li>Save your CP565 notice securely</li>
                            <li>Update your JobLytics profile with ITIN</li>
                            <li>Inform current U.S. employers/clients</li>
                            <li>Add to your professional documents</li>
                          </ul>
                        </div>
                        
                        <div className="post-itin-card">
                          <h3>2. Banking & Payments</h3>
                          <ul>
                            <li>Open U.S. bank account (if desired)</li>
                            <li>Update payment information with employers</li>
                            <li>Submit Form W-8BEN for reduced withholding</li>
                            <li>Set up direct deposit with U.S. companies</li>
                          </ul>
                        </div>
                        
                        <div className="post-itin-card">
                          <h3>3. Tax Compliance</h3>
                          <ul>
                            <li>File annual U.S. tax returns (Form 1040-NR)</li>
                            <li>Claim tax treaty benefits if applicable</li>
                            <li>Keep records of all U.S. income</li>
                            <li>Understand state tax obligations</li>
                          </ul>
                        </div>
                        
                        <div className="post-itin-card">
                          <h3>4. ITIN Maintenance</h3>
                          <ul>
                            <li>Renew every 5 years if not used on tax return</li>
                            <li>Report address changes to IRS</li>
                            <li>Keep ITIN confidential (like SSN)</li>
                            <li>Watch for IRS notices about ITIN</li>
                          </ul>
                        </div>
                      </div>

                      <div className="highlight-box success">
                        <h4>🎉 Congratulations on Getting Your ITIN!</h4>
                        <p>You've taken a crucial step toward professional U.S. remote work. Your ITIN enables you to:</p>
                        <ul>
                          <li>Receive payments from U.S. companies more easily</li>
                          <li>Comply with U.S. tax regulations</li>
                          <li>Access financial services that require TIN</li>
                          <li>Build your professional credibility with U.S. clients</li>
                        </ul>
                      </div>

                      <div className="next-steps">
                        <h3>➡️ Next Steps</h3>
                        <div className="next-steps-buttons">
                          <button 
                            className="next-step-btn"
                            onClick={() => navigate("/tax-guidance")}
                          >
                            💰 Learn About U.S. Taxes
                          </button>
                          <button 
                            className="next-step-btn"
                            onClick={() => navigate("/payment-gateway")}
                          >
                            🏦 Set Up Payment Accounts
                          </button>
                          <button 
                            className="next-step-btn"
                            onClick={() => navigate("/job-search")}
                          >
                            🔍 Find U.S. Remote Jobs
                          </button>
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
                          <h4>Q: How long is an ITIN valid?</h4>
                          <p><strong>A:</strong> ITINs that haven't been used on a federal tax return at least once in the last three consecutive years will expire. If used regularly, they don't expire but may need renewal after 5 years of non-use.</p>
                        </div>
                        
                        <div className="faq-item">
                          <h4>Q: Can I use ITIN to work in the U.S. physically?</h4>
                          <p><strong>A:</strong> No. ITIN is for tax purposes only. It doesn't authorize work in the U.S., provide immigration benefits, or establish eligibility for Social Security benefits.</p>
                        </div>
                        
                        <div className="faq-item">
                          <h4>Q: What if my documents are in Spanish/French?</h4>
                          <p><strong>A:</strong> You need certified English translations. Many Caribbean translation services are IRS-accepted. Keep both original and translated copies.</p>
                        </div>
                        
                        <div className="faq-item">
                          <h4>Q: Can I expedite my ITIN application?</h4>
                          <p><strong>A:</strong> Generally no, but using an Acceptance Agent can be faster as they verify documents locally and submit certified copies.</p>
                        </div>
                        
                        <div className="faq-item">
                          <h4>Q: What happens if my application is denied?</h4>
                          <p><strong>A:</strong> You'll receive a letter explaining why. Common reasons: incomplete forms, expired documents, missing signatures. You can reapply with corrected documents.</p>
                        </div>
                        
                        <div className="faq-item">
                          <h4>Q: Do I need to file U.S. taxes every year with ITIN?</h4>
                          <p><strong>A:</strong> Only if you have U.S. source income above the filing threshold ($400 for self-employment income). Consult a tax professional for your specific situation.</p>
                        </div>
                        
                        <div className="faq-item">
                          <h4>Q: Can I get an ITIN for my business?</h4>
                          <p><strong>A:</strong> Businesses need an EIN (Employer Identification Number), not ITIN. ITIN is for individuals only.</p>
                        </div>
                        
                        <div className="faq-item">
                          <h4>Q: Is there a fee for ITIN application?</h4>
                          <p><strong>A:</strong> No fee from IRS. However, there may be costs for document preparation, notarization, translation, or Acceptance Agent services.</p>
                        </div>
                      </div>

                      <div className="support-contact">
                        <h3>📞 Need More Help?</h3>
                        <div className="contact-cards">
                          <div className="contact-card">
                            <h4>IRS ITIN Hotline</h4>
                            <p><strong>Phone:</strong> 1-800-829-1040</p>
                            <p><strong>International:</strong> 1-267-941-1000</p>
                            <p><strong>Hours:</strong> Mon-Fri, 7am-7pm local time</p>
                          </div>
                          <div className="contact-card">
                            <h4>Tax Professional</h4>
                            <p>Consider consulting a tax advisor familiar with:</p>
                            <ul>
                              <li>Caribbean-U.S. tax treaties</li>
                              <li>ITIN applications</li>
                              <li>Non-resident tax filing</li>
                            </ul>
                          </div>
                          <div className="contact-card">
                            <h4>JobLytics Support</h4>
                            <p>Our community can help with:</p>
                            <ul>
                              <li>Document preparation tips</li>
                              <li>Caribbean-specific advice</li>
                              <li>Success stories & experiences</li>
                            </ul>
                            <button 
                              className="community-btn"
                              onClick={() => navigate("/community")}
                            >
                              👥 Visit Community
                            </button>
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

export default ITINSupport;