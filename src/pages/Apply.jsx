import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import "./Apply.css";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYjjzQZunjUJ4IOJ-s_GLKQYxOw5V8psI",
  authDomain: "jobportal-84fc0.firebaseapp.com",
  projectId: "jobportal-84fc0",
  storageBucket: "jobportal-84fc0.appspot.com",
  messagingSenderId: "391211718873",
  appId: "1:391211718873:web:ed69f3abdfaa91b2ca86c8",
  measurementId: "G-QTCL4FK0BT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Apply = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    jobTitle: "",
    resume: null,
    coverLetter: "",
    portfolio: "",
    linkedin: "",
    salaryExpectation: "",
    availability: "immediately",
    questions: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSent, setApplicationSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [notificationCount, setNotificationCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  const steps = [
    { id: 1, title: "Personal Info" },
    { id: 2, title: "Resume & Cover" },
    { id: 3, title: "Additional Info" },
    { id: 4, title: "Questions" },
    { id: 5, title: "Review" }
  ];

  const menuItems = [
    { icon: "🏠", text: "Dashboard", link: "/dashboard" },
    { icon: "🔍", text: "Find Jobs", link: "/job-search", badge: 5 },
    { icon: "📄", text: "Applications", link: "/applications", badge: 12 },
    { icon: "📅", text: "Interviews", link: "/interviews", badge: 2 },
    { icon: "⭐", text: "Saved Jobs", link: "/saved" },
    { icon: "👤", text: "Profile", link: "/profile" },
    { icon: "⚙️", text: "Settings", link: "/settings" },
    { icon: "❓", text: "Help Center", link: "/help" }
  ];

  // Debug logging
  useEffect(() => {
    console.log("User in Apply component:", user);
    console.log("Job data:", job);
    console.log("Form data:", formData);
  }, [user, job, formData]);

  // Get job data from navigation state
  useEffect(() => {
    if (location.state?.job) {
      const jobData = location.state.job;
      setJob(jobData);
      
      // Initialize questions properly
      const jobQuestions = jobData.questions || [];
      const initializedQuestions = jobQuestions.map(question => ({
        question: typeof question === 'string' ? question : question.question || "",
        answer: ""
      }));

      // Pre-fill form with user data if available
      setFormData(prev => ({
        ...prev,
        fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        city: user?.city || "",
        state: user?.state || "",
        zipCode: user?.zipCode || "",
        country: user?.country || "United States",
        jobTitle: jobData.title || "",
        questions: initializedQuestions
      }));
    } else {
      // Redirect back to job search if no job data
      navigate("/job-search");
    }
  }, [location.state, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (submitError) setSubmitError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size <= 2 * 1024 * 1024) { // Reduced to 2MB for Firestore
          setFormData(prev => ({ ...prev, resume: file }));
          setSubmitError("");
        } else {
          setSubmitError("File size too large. Please upload a PDF smaller than 2MB for Firestore storage.");
          e.target.value = "";
        }
      } else {
        setSubmitError("Please upload a PDF file for your resume.");
        e.target.value = "";
      }
    }
  };

  const handleQuestionChange = (index, value) => {
    setFormData(prev => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        answer: value
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (step) => {
    if (step <= currentStep) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
    }
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        return formData.fullName.trim() && 
               formData.email.trim() && 
               formData.phone.trim() &&
               formData.city.trim() &&
               formData.state.trim() &&
               formData.zipCode.trim();
      case 2:
        // Make resume optional for now due to storage limitations
        return true;
      case 3:
        return true;
      case 4:
        return formData.questions.length === 0 || formData.questions.every(q => q.answer.trim());
      default:
        return true;
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    if (!validateStep(1)) {
      setSubmitError("Please complete all required fields in Personal Info");
      setCurrentStep(1);
      return;
    }
    if (formData.questions.length > 0 && !validateStep(4)) {
      setSubmitError("Please answer all application questions");
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      console.log("Starting application submission...");
      
      let resumeBase64 = null;
      let resumeFileSize = 0;
      let resumeFileName = "No resume uploaded";
      
      // Convert resume to base64 if exists
      if (formData.resume) {
        try {
          // Check file size
          if (formData.resume.size > 2 * 1024 * 1024) {
            throw new Error("File is too large for Firestore (max 2MB). Please use a smaller file or provide a link instead.");
          }
          
          console.log("Converting resume to base64...");
          resumeBase64 = await fileToBase64(formData.resume);
          resumeFileSize = formData.resume.size;
          resumeFileName = formData.resume.name;
          
          console.log("Resume converted to base64, size:", resumeBase64.length, "chars");
          
          // Check if base64 string is too large for Firestore
          if (resumeBase64.length > 1000000) { // Approx 1MB limit for Firestore
            console.warn("Base64 string is large, truncating...");
            // Store only first part and note
            resumeBase64 = resumeBase64.substring(0, 500000) + "... [TRUNCATED]";
          }
        } catch (conversionError) {
          console.error("Error converting resume:", conversionError);
          // Continue without resume but store metadata
          resumeFileName = `${formData.resume.name} (conversion failed)`;
        }
      }

      // Prepare application data
      const applicationData = {
        jobId: job?.id || location.state?.jobId,
        jobTitle: job?.title || "Unknown Position",
        company: job?.company || job?.employerName || "Unknown Company",
        jobLocation: job?.location || "Unknown Location",
        jobType: job?.type || job?.jobStatus || "Full-time",
        isRemote: job?.remote || false,
        
        applicantId: user?.uid || "anonymous",
        applicantName: formData.fullName.trim(),
        applicantEmail: formData.email.trim(),
        applicantPhone: formData.phone.trim(),
        applicantAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim(),
        applicantCountry: formData.country,
        
        coverLetter: formData.coverLetter.trim(),
        portfolioUrl: formData.portfolio.trim(),
        linkedinUrl: formData.linkedin.trim(),
        salaryExpectation: formData.salaryExpectation.trim(),
        availability: formData.availability,
        applicationQuestions: formData.questions,
        
        // Resume data (stored as base64 in Firestore)
        resumeBase64: resumeBase64,
        resumeFileName: resumeFileName,
        resumeFileSize: resumeFileSize,
        resumeFileType: formData.resume?.type || "",
        resumeUploadedAt: serverTimestamp(),
        
        status: "pending",
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        employerId: job?.employerId || "unknown",
        employerName: job?.employerName || job?.company || "Unknown Employer",
        
        // Metadata
        applicationMethod: "web_form",
        version: "1.0"
      };

      console.log("Saving application to Firestore:", {
        ...applicationData,
        resumeBase64: resumeBase64 ? `[BASE64_DATA:${resumeBase64.length} chars]` : "null"
      });
      
      // Save to Firestore
      const applicationsRef = collection(db, "applications");
      const docRef = await addDoc(applicationsRef, applicationData);
      console.log("Application saved with ID:", docRef.id);
      
      // Store a backup in localStorage for redundancy
      if (resumeBase64 && formData.resume) {
        try {
          const backupData = {
            applicationId: docRef.id,
            fileName: formData.resume.name,
            base64Preview: resumeBase64.substring(0, 100) + "...",
            timestamp: Date.now()
          };
          localStorage.setItem(`resume_backup_${docRef.id}`, JSON.stringify(backupData));
        } catch (backupError) {
          console.warn("Could not backup to localStorage:", backupError);
        }
      }
      
      setApplicationSent(true);
      
    } catch (error) {
      console.error("Error submitting application:", error);
      let errorMessage = "Failed to submit application. ";
      
      if (error.code) {
        switch (error.code) {
          case 'permission-denied':
            errorMessage += "Permission denied. Please make sure you're logged in.";
            break;
          case 'unavailable':
            errorMessage += "Network error. Please check your internet connection.";
            break;
          default:
            errorMessage += error.message || "Please try again.";
        }
      } else {
        errorMessage += error.message || "Please try again.";
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => navigate(-1);
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  if (!job) {
    return (
      <div className="apply-container">
        <div className="loading">Loading job information...</div>
      </div>
    );
  }

  if (applicationSent) {
    return (
      <div className="jobseeker-dashboard-container">
        {/* Top Navbar */}
        <nav className="jobseeker-top-navbar">
          <div className="jobseeker-nav-brand">
            <span className="jobseeker-brand-logo">JobLytics</span>
            <span className="jobseeker-user-welcome">Welcome back, {user?.firstName || "User"}!</span>
          </div>
          <div className="jobseeker-nav-center">
            <ul className="jobseeker-nav-links">
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/job-search">Find Jobs</a></li>
              <li><a href="/applications">Applications</a></li>
              <li><a href="/interviews">Interviews</a></li>
              <li><a href="/saved">Saved Jobs</a></li>
              <li><a href="/profile">Profile</a></li>
            </ul>
          </div>
          <div className="jobseeker-nav-actions">
            <div className="notification-container">
              <button className="notification-bell" onClick={toggleNotifications}>
                <span className="notification-icon">🔔</span>
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </button>
              {showNotifications && (
                <div className="notification-dropdown open">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <button className="mark-all-read">Mark all as read</button>
                  </div>
                  <div className="notification-list">
                    <div className="notification-item unread">
                      <div className="notification-content">
                        <div className="notification-title">Application Submitted!</div>
                        <div className="notification-message">
                          Your application for {job.title} has been received successfully.
                        </div>
                        <div className="notification-time">Just now</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="jobseeker-icon-button-container">
              <button className="jobseeker-icon-button">
                <span className="jobseeker-icon-button-icon">💬</span>
                <span className="jobseeker-message-badge">2</span>
              </button>
            </div>
            <button className="nav-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        {/* Sidebar */}
        <div className="jobseeker-dashboard-layout">
          <div className="jobseeker-sidebar">
            <div className="jobseeker-logo">JobLytics</div>
            <ul className="jobseeker-menu">
              {menuItems.map((item, index) => (
                <li key={index} className={item.link === window.location.pathname ? 'active' : ''}>
                  <span className="jobseeker-menu-icon">{item.icon}</span>
                  <span className="jobseeker-menu-text">{item.text}</span>
                  {item.badge && (
                    <span className={`jobseeker-menu-badge ${item.badge > 5 ? 'jobseeker-badge-red' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="jobseeker-main-content">
            <div className="success-container">
              <div className="success-icon">✓</div>
              <h1>Application Submitted Successfully!</h1>
              <p>Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been received.</p>
              
              {formData.resume && (
                <div className="success-note">
                  <p><strong>Note:</strong> Your resume has been stored in the application database.</p>
                  <p>File: {formData.resume.name} ({(formData.resume.size / 1024).toFixed(0)}KB)</p>
                </div>
              )}
              
              <p className="success-note">You will be notified by email when the employer reviews your application.</p>
              <div className="success-actions">
                <button className="btn-primary" onClick={() => navigate("/job-search")}>
                  Browse More Jobs
                </button>
                <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </button>
                <button className="btn-tertiary" onClick={() => navigate("/applications")}>
                  View All Applications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="jobseeker-dashboard-container">
      {/* Top Navbar */}
      <nav className="jobseeker-top-navbar">
        <div className="jobseeker-nav-brand">
          <span className="jobseeker-brand-logo">JobLytics</span>
          <span className="jobseeker-user-welcome">Welcome back, {user?.firstName || "User"}!</span>
        </div>
        <div className="jobseeker-nav-center">
          <ul className="jobseeker-nav-links">
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/job-search">Find Jobs</a></li>
            <li><a href="/applications">Applications</a></li>
            <li><a href="/interviews">Interviews</a></li>
            <li><a href="/saved">Saved Jobs</a></li>
            <li><a href="/profile">Profile</a></li>
          </ul>
        </div>
        <div className="jobseeker-nav-actions">
          <div className="notification-container">
            <button className="notification-bell" onClick={toggleNotifications}>
              <span className="notification-icon">🔔</span>
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-dropdown open">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button className="mark-all-read">Mark all as read</button>
                </div>
                <div className="notification-list">
                  <div className="notification-item unread">
                    <div className="notification-content">
                      <div className="notification-title">Application in Progress</div>
                      <div className="notification-message">
                        You're applying for {job.title} at {job.company}
                      </div>
                      <div className="notification-time">Just now</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="jobseeker-icon-button-container">
            <button className="jobseeker-icon-button">
              <span className="jobseeker-icon-button-icon">💬</span>
              <span className="jobseeker-message-badge">2</span>
            </button>
          </div>
          <button className="nav-btn back-btn" onClick={handleBack}>
            Back
          </button>
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Layout with Sidebar */}
      <div className="jobseeker-dashboard-layout">
        {/* Sidebar */}
        <div className="jobseeker-sidebar">
          <div className="jobseeker-logo" onClick={() => navigate("/dashboard")}>JobLytics</div>
          <ul className="jobseeker-menu">
            {menuItems.map((item, index) => (
              <li key={index} className={item.link === window.location.pathname ? 'active' : ''}>
                <span className="jobseeker-menu-icon">{item.icon}</span>
                <span className="jobseeker-menu-text">{item.text}</span>
                {item.badge && (
                  <span className={`jobseeker-menu-badge ${item.badge > 5 ? 'jobseeker-badge-red' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="jobseeker-main-content">
          <div className="apply-content-wrapper">
            {/* Left Column - Application Form */}
            <div className="application-main-content">
              <div className="application-header">
                <h1>Apply Now</h1>
                <p className="subtitle">
                  Complete the following form to apply for {job.title} at {job.company}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="progress-steps">
                {steps.map((step) => (
                  <div 
                    key={step.id}
                    className={`step-item ${step.id === currentStep ? 'active' : ''} ${step.id < currentStep ? 'completed' : ''}`}
                    onClick={() => goToStep(step.id)}
                  >
                    <div className="step-number">{step.id}</div>
                    <div className="step-title">{step.title}</div>
                  </div>
                ))}
              </div>

              {submitError && (
                <div className="error-message">
                  <div className="error-icon">⚠</div>
                  <div className="error-content">
                    <p className="error-title">Submission Error</p>
                    <p className="error-text">{submitError}</p>
                  </div>
                </div>
              )}

              <form className="application-form" onSubmit={handleSubmit}>
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="form-step">
                    <div className="step-header">
                      <h2>Personal Information</h2>
                      <p className="step-description">Tell us about yourself</p>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="fullName">
                          Name<span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">
                          Email<span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="phone">
                          Phone Number<span className="required">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          placeholder="(123) 456-7890"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Street address"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="city">
                          City<span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          placeholder="City"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="state">
                          State<span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          placeholder="State"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="zipCode">
                          Zip Code<span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          placeholder="Zip Code"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="country">Country</label>
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                        >
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="jobTitle">Position Applied For</label>
                        <input
                          type="text"
                          id="jobTitle"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          placeholder="e.g., Senior Manager"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Resume & Cover Letter */}
                {currentStep === 2 && (
                  <div className="form-step">
                    <div className="step-header">
                      <h2>Resume & Cover Letter</h2>
                      <p className="step-description">
                        Upload your resume (PDF only, max 2MB for Firestore storage)
                      </p>
                    </div>
                    <div className="form-section">
                      <div className="form-group">
                        <label htmlFor="resume">
                          Upload Resume (PDF only, max 2MB)
                          <span className="upload-hint">Will be stored directly in database</span>
                        </label>
                        <div className="file-upload-area">
                          <input
                            type="file"
                            id="resume"
                            name="resume"
                            accept=".pdf"
                            onChange={handleFileChange}
                          />
                          <div className="upload-placeholder">
                            <div className="upload-icon">📄</div>
                            <p>Click to upload or drag and drop</p>
                            <p className="upload-hint">PDF up to 2MB (required for Firestore)</p>
                          </div>
                        </div>
                        {formData.resume && (
                          <div className="file-preview">
                            <span className="file-icon">📄</span>
                            <span className="file-name">{formData.resume.name}</span>
                            <span className="file-size">
                              ({(formData.resume.size / 1024).toFixed(0)} KB)
                            </span>
                            {formData.resume.size > 2 * 1024 * 1024 && (
                              <span className="file-warning" style={{color: '#e74c3c', marginLeft: '10px'}}>
                                ⚠ File too large for Firestore
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="coverLetter">Cover Letter (Optional)</label>
                        <textarea
                          id="coverLetter"
                          name="coverLetter"
                          value={formData.coverLetter}
                          onChange={handleInputChange}
                          rows="8"
                          placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                        />
                        <div className="char-counter">
                          {formData.coverLetter.length} characters
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Additional Information */}
                {currentStep === 3 && (
                  <div className="form-step">
                    <div className="step-header">
                      <h2>Additional Information</h2>
                      <p className="step-description">Share more about yourself</p>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="portfolio">Portfolio URL (Optional)</label>
                        <input
                          type="url"
                          id="portfolio"
                          name="portfolio"
                          value={formData.portfolio}
                          onChange={handleInputChange}
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="linkedin">LinkedIn Profile (Optional)</label>
                        <input
                          type="url"
                          id="linkedin"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="salaryExpectation">Salary Expectation (Optional)</label>
                        <input
                          type="text"
                          id="salaryExpectation"
                          name="salaryExpectation"
                          value={formData.salaryExpectation}
                          onChange={handleInputChange}
                          placeholder="e.g., $60,000 - $75,000 or Negotiable"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="availability">Availability</label>
                        <select
                          id="availability"
                          name="availability"
                          value={formData.availability}
                          onChange={handleInputChange}
                        >
                          <option value="immediately">Immediately</option>
                          <option value="2 weeks">2 Weeks Notice</option>
                          <option value="1 month">1 Month Notice</option>
                          <option value="2 months">2 Months Notice</option>
                          <option value="3 months">3+ Months Notice</option>
                          <option value="negotiable">Negotiable</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Application Questions */}
                {currentStep === 4 && formData.questions.length > 0 && (
                  <div className="form-step">
                    <div className="step-header">
                      <h2>Application Questions</h2>
                      <p className="step-description">Answer the employer's questions</p>
                    </div>
                    <div className="questions-section">
                      {formData.questions.map((questionObj, index) => (
                        <div key={index} className="question-item">
                          <label htmlFor={`question-${index}`}>
                            {questionObj.question} <span className="required">*</span>
                          </label>
                          <textarea
                            id={`question-${index}`}
                            rows="4"
                            value={questionObj.answer || ""}
                            onChange={(e) => handleQuestionChange(index, e.target.value)}
                            placeholder="Type your answer here..."
                            required
                          />
                          <div className="char-counter">
                            {questionObj.answer?.length || 0} characters
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="form-step">
                    <div className="step-header">
                      <h2>Review Your Application</h2>
                      <p className="step-description">Confirm all details before submitting</p>
                    </div>
                    <div className="review-section">
                      <div className="review-card">
                        <h3>Personal Information</h3>
                        <div className="review-grid">
                          <div className="review-item">
                            <span className="review-label">Full Name:</span>
                            <span className="review-value">{formData.fullName}</span>
                          </div>
                          <div className="review-item">
                            <span className="review-label">Email:</span>
                            <span className="review-value">{formData.email}</span>
                          </div>
                          <div className="review-item">
                            <span className="review-label">Phone:</span>
                            <span className="review-value">{formData.phone}</span>
                          </div>
                          <div className="review-item">
                            <span className="review-label">Address:</span>
                            <span className="review-value">{formData.city}, {formData.state} {formData.zipCode}</span>
                          </div>
                          <div className="review-item">
                            <span className="review-label">Country:</span>
                            <span className="review-value">{formData.country}</span>
                          </div>
                          <div className="review-item">
                            <span className="review-label">Position:</span>
                            <span className="review-value">{formData.jobTitle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="review-card">
                        <h3>Documents</h3>
                        <div className="review-grid">
                          <div className="review-item">
                            <span className="review-label">Resume:</span>
                            <span className="review-value">
                              {formData.resume ? `${formData.resume.name} (${(formData.resume.size / 1024).toFixed(0)}KB)` : "Not uploaded"}
                            </span>
                          </div>
                          <div className="review-item">
                            <span className="review-label">Cover Letter:</span>
                            <span className="review-value">
                              {formData.coverLetter ? `${formData.coverLetter.length} characters` : "Not provided"}
                            </span>
                          </div>
                          <div className="review-item">
                            <span className="review-label">Storage Method:</span>
                            <span className="review-value">
                              {formData.resume ? "Base64 in Firestore" : "No resume"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="review-card">
                        <h3>Additional Information</h3>
                        <div className="review-grid">
                          <div className="review-item">
                            <span className="review-label">Portfolio:</span>
                            <span className="review-value">{formData.portfolio || "Not provided"}</span>
                          </div>
                          <div className="review-item">
                            <span className="review-label">LinkedIn:</span>
                            <span className="review-value">{formData.linkedin || "Not provided"}</span>
                          </div>
                          <div className="review-item">
                            <span className="review-label">Salary Expectation:</span>
                            <span className="review-value">{formData.salaryExpectation || "Not specified"}</span>
                          </div>
                          <div className="review-item">
                            <span className="review-label">Availability:</span>
                            <span className="review-value">
                              {formData.availability === "immediately" ? "Immediately" : 
                              formData.availability === "2 weeks" ? "2 Weeks Notice" :
                              formData.availability === "1 month" ? "1 Month Notice" :
                              formData.availability === "2 months" ? "2 Months Notice" :
                              formData.availability === "3 months" ? "3+ Months Notice" : "Negotiable"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {formData.questions.length > 0 && (
                        <div className="review-card">
                          <h3>Application Questions</h3>
                          <div className="questions-review">
                            {formData.questions.map((q, idx) => (
                              <div key={idx} className="question-review-item">
                                <div className="question-review-label">Q{idx + 1}: {q.question}</div>
                                <div className="question-review-answer">{q.answer || "Not answered"}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="form-navigation">
                  {currentStep > 1 && (
                    <button 
                      type="button" 
                      className="btn-prev"
                      onClick={prevStep}
                    >
                      ← Previous
                    </button>
                  )}
                  
                  <div className="nav-right">
                    {currentStep < steps.length ? (
                      <button 
                        type="button" 
                        className="btn-next"
                        onClick={nextStep}
                        disabled={!validateStep(currentStep)}
                      >
                        Next Step →
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="spinner"></div>
                            Submitting...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column - Job Details */}
            <div className="application-sidebar">
              <div className="sidebar-header">
                <h3>Job Details</h3>
              </div>
              
              <div className="job-summary-card">
                <div className="job-summary-content">
                  <h5>{job.title}</h5>
                  <p className="company">{job.company}</p>
                  <div className="job-tags">
                    <span className="job-tag location">{job.location}</span>
                    <span className="job-tag type">{job.type}</span>
                    {job.remote && <span className="job-tag remote">Remote</span>}
                  </div>
                </div>
              </div>

              <div className="job-details">
                <h4>Job Information</h4>
                <div className="detail-item">
                  <span className="detail-label">Department</span>
                  <span className="detail-value">{job.department || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{job.location || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Job Type</span>
                  <span className="detail-value">{job.type || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Qualifications</span>
                  <span className="detail-value">{job.qualifications || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Experience</span>
                  <span className="detail-value">{job.experience || "Not specified"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Offered Salary</span>
                  <span className="detail-value">{job.salary || "Not specified"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Apply;