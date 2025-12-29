import React, { useState, useEffect, memo } from "react";
import { auth, db } from "../firebase/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import {
  FiHome,
  FiBriefcase,
  FiUser,
  FiBell,
  FiMessageSquare,
  FiCheckCircle,
  FiFileText,
  FiUsers,
  FiClipboard,
  FiCalendar,
  FiArrowLeft,
  FiSave,
  FiChevronRight,
  FiChevronLeft
} from "react-icons/fi";
import "./PostJobPage.css";

// Step components extracted and memoized to avoid unnecessary remounts
const Step1BasicInfo = memo(function Step1BasicInfo({ jobData, onChange }) {
  return (
    <div className="postjob-form-grid">
      <div className="postjob-form-group">
        <label>Title or Position *</label>
        <input
          type="text"
          value={jobData.title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Enter job title"
          className="postjob-input"
        />
      </div>

      <div className="postjob-form-group">
        <label>Job Status</label>
        <select
          value={jobData.jobStatus}
          onChange={(e) => onChange("jobStatus", e.target.value)}
          className="postjob-select"
        >
          <option value="">Select job status</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      <div className="postjob-form-group">
        <label>Department</label>
        <input
          type="text"
          value={jobData.department}
          onChange={(e) => onChange("department", e.target.value)}
          placeholder="Enter department"
          className="postjob-input"
        />
      </div>

      <div className="postjob-form-group">
        <label>Minimum Experience</label>
        <select
          value={jobData.minExperience}
          onChange={(e) => onChange("minExperience", e.target.value)}
          className="postjob-select"
        >
          <option value="">Select experience level</option>
          <option value="Entry Level">Entry Level (0-2 years)</option>
          <option value="Mid Level">Mid Level (2-5 years)</option>
          <option value="Senior Level">Senior Level (5+ years)</option>
        </select>
      </div>

      <div className="postjob-form-group">
        <label>Location</label>
        <input
          type="text"
          value={jobData.location}
          onChange={(e) => onChange("location", e.target.value)}
          placeholder="Enter location"
          className="postjob-input"
        />
      </div>

      <div className="postjob-form-group">
        <label>Compensation</label>
        <input
          type="text"
          value={jobData.compensation}
          onChange={(e) => onChange("compensation", e.target.value)}
          placeholder="Enter salary range"
          className="postjob-input"
        />
      </div>
    </div>
  );
});

const Step2JobDescription = memo(function Step2JobDescription({ jobData, onChange }) {
  return (
    <div className="postjob-form-grid-full">
      <div className="postjob-form-group">
        <label>Job Description *</label>
        <textarea
          value={jobData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
          rows={6}
          className="postjob-textarea"
        />
      </div>
      <div className="postjob-form-group">
        <label>Qualifications</label>
        <textarea
          value={jobData.qualifications}
          onChange={(e) => onChange("qualifications", e.target.value)}
          placeholder="List required qualifications, skills, and education..."
          rows={4}
          className="postjob-textarea"
        />
      </div>
      <div className="postjob-form-group">
        <label>Experience Required</label>
        <textarea
          value={jobData.experienceRequired}
          onChange={(e) => onChange("experienceRequired", e.target.value)}
          placeholder="Detail specific experience requirements..."
          rows={3}
          className="postjob-textarea"
        />
      </div>
    </div>
  );
});

const Step3Questions = memo(function Step3Questions({ jobData, onChange }) {
  return (
    <div className="postjob-form-grid-full">
      <div className="postjob-form-group">
        <label>Add applicable questions for candidates (optional)</label>
        <textarea
          placeholder="Enter questions separated by line breaks. Each new line will be treated as a separate question."
          value={jobData.questions.join("\n")}
          onChange={(e) => onChange("questions", e.target.value.split("\n"))}
          rows={8}
          className="postjob-textarea"
        />
        <div className="postjob-hint">
          Candidates will answer these questions when applying for this position.
        </div>
      </div>
    </div>
  );
});

const Step4HiringProcess = memo(function Step4HiringProcess({ jobData, onChange }) {
  return (
    <div className="postjob-form-grid-full">
      <div className="postjob-form-group">
        <label>Describe your hiring process (optional)</label>
        <textarea
          placeholder="Describe the interview stages, assessments, timeline, and what candidates can expect..."
          value={jobData.hiringProcess}
          onChange={(e) => onChange("hiringProcess", e.target.value)}
          rows={8}
          className="postjob-textarea"
        />
        <div className="postjob-hint">
          This helps candidates understand what to expect during the hiring process.
        </div>
      </div>
    </div>
  );
});

const Step5Confirmation = memo(function Step5Confirmation({ jobData }) {
  return (
    <div className="postjob-review-container">
      <h3>Review Your Job Posting</h3>
      
      <div className="postjob-review-section">
        <h4>Basic Information</h4>
        <div className="postjob-review-grid">
          <div className="postjob-review-item">
            <strong>Job Title:</strong> {jobData.title || "Not specified"}
          </div>
          <div className="postjob-review-item">
            <strong>Job Status:</strong> {jobData.jobStatus || "Not specified"}
          </div>
          <div className="postjob-review-item">
            <strong>Department:</strong> {jobData.department || "Not specified"}
          </div>
          <div className="postjob-review-item">
            <strong>Experience Level:</strong> {jobData.minExperience || "Not specified"}
          </div>
          <div className="postjob-review-item">
            <strong>Location:</strong> {jobData.location || "Not specified"}
          </div>
          <div className="postjob-review-item">
            <strong>Compensation:</strong> {jobData.compensation || "Not specified"}
          </div>
        </div>
      </div>

      <div className="postjob-review-section">
        <h4>Job Description</h4>
        <div className="postjob-review-content">
          {jobData.description || "No description provided"}
        </div>
      </div>

      <div className="postjob-review-section">
        <h4>Qualifications</h4>
        <div className="postjob-review-content">
          {jobData.qualifications || "No qualifications specified"}
        </div>
      </div>

      <div className="postjob-review-section">
        <h4>Experience Required</h4>
        <div className="postjob-review-content">
          {jobData.experienceRequired || "No experience requirements specified"}
        </div>
      </div>

      {jobData.questions.length > 0 && (
        <div className="postjob-review-section">
          <h4>Candidate Questions</h4>
          <ul className="postjob-questions-list">
            {jobData.questions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </div>
      )}

      {jobData.hiringProcess && (
        <div className="postjob-review-section">
          <h4>Hiring Process</h4>
          <div className="postjob-review-content">
            {jobData.hiringProcess}
          </div>
        </div>
      )}

      <div className="postjob-review-note">
        Click "Finish" to save this job posting and make it live.
      </div>
    </div>
  );
});

const PostJobPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [jobData, setJobData] = useState({
    id: null,
    title: "",
    jobStatus: "",
    department: "",
    minExperience: "",
    location: "",
    country: "",
    state: "",
    city: "",
    zipcode: "",
    compensation: "",
    description: "",
    qualifications: "",
    experienceRequired: "",
    questions: [],
    hiringProcess: "",
  });

  // Handle field changes
  const handleChange = (field, value) => {
    setJobData((prev) => ({ ...prev, [field]: value }));
  };

  // Save current step to Firestore
  const saveJobStep = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const jobId = jobData.id || doc(collection(db, "jobs")).id;
      const jobRef = doc(db, "jobs", jobId);

      await setDoc(jobRef, {
        ...jobData,
        id: jobId,
        employerId: currentUser.uid,
        employerName: currentUser.displayName || "Employer",
        updatedAt: Timestamp.now(),
        status: "active",
      });

      if (!jobData.id) setJobData((prev) => ({ ...prev, id: jobId }));
      console.log(`Step ${currentStep} saved!`);
    } catch (error) {
      console.error("Error saving job step:", error);
    }
  };

  // Navigation between steps
  const nextStep = async () => {
    if (currentStep === 1 && !jobData.title) {
      alert("Please enter a job title");
      return;
    }
    if (currentStep === 2 && !jobData.description) {
      alert("Please enter a job description");
      return;
    }
    
    await saveJobStep();
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo jobData={jobData} onChange={handleChange} />;
      case 2:
        return <Step2JobDescription jobData={jobData} onChange={handleChange} />;
      case 3:
        return <Step3Questions jobData={jobData} onChange={handleChange} />;
      case 4:
        return <Step4HiringProcess jobData={jobData} onChange={handleChange} />;
      case 5:
        return <Step5Confirmation jobData={jobData} />;
      default:
        return null;
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="employer-dashboard-container">
      {/* TOP NAVBAR */}
      <nav className="employer-top-navbar">
        <div className="employer-nav-brand">
          <span className="employer-brand-logo">JobLytics</span>
          <span className="employer-user-welcome">
            Post New Job
          </span>
        </div>
        
        <div className="employer-nav-center">
          <ul className="employer-nav-links">
            <li><Link to="/EmployerDashboard">Dashboard</Link></li>
            <li><Link to="/PostJobPage" className="active">Jobs</Link></li>
            <li><Link to="/Profile">Profile</Link></li>
            <li><Link to="/Applicants">Applicants</Link></li>
          </ul>
        </div>
        
        <div className="employer-nav-actions">
          <div className="employer-notification-container">
            <button 
              className="employer-notification-bell"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <FiBell className="employer-notification-icon" />
              <span className="employer-notification-badge">3</span>
            </button>
            
            {notificationsOpen && (
              <div className="employer-notification-dropdown open">
                <div className="employer-notification-header">
                  <h3>Notifications</h3>
                  <button className="employer-mark-all-read">Mark all as read</button>
                </div>
                <div className="employer-notification-list">
                  <div className="employer-notification-item unread">
                    <div className="employer-notification-content">
                      <div className="employer-notification-title">New Application</div>
                      <div className="employer-notification-message">
                        John Doe applied for Senior Developer position
                      </div>
                      <div className="employer-notification-time">2 hours ago</div>
                    </div>
                    <div className="employer-unread-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="employer-icon-button-container">
            <button 
              className="employer-icon-button"
              onClick={() => setMessagesOpen(true)}
            >
              <FiMessageSquare className="employer-icon-button-icon" />
            </button>
          </div>
          
          <div className="employer-user-info">
            {auth.currentUser?.displayName || 'Employer'}
          </div>
          
          <button 
            onClick={handleLogout}
            className="employer-icon-button"
            style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="employer-dashboard-layout">
        {/* SIDEBAR */}
        <aside className="employer-sidebar">
          <div className="employer-logo">JobLytics</div>
          <ul className="employer-menu">
            <li>
              <Link to="/EmployerDashboard" className="employer-menu-link">
                <span className="employer-menu-icon"><FiHome /></span>
                <span className="employer-menu-text">Dashboard</span>
              </Link>
            </li>
            <li className="active">
              <Link to="/PostJobPage" className="employer-menu-link">
                <span className="employer-menu-icon"><FiBriefcase /></span>
                <span className="employer-menu-text">Jobs</span>
                <span className="employer-menu-badge">5</span>
              </Link>
            </li>
            <li>
              <Link to="/Applicants" className="employer-menu-link">
                <span className="employer-menu-icon"><FiUsers /></span>
                <span className="employer-menu-text">Applicants</span>
                <span className="employer-menu-badge employer-badge-red">12</span>
              </Link>
            </li>
            <li>
              <Link to="/Profile" className="employer-menu-link">
                <span className="employer-menu-icon"><FiUser /></span>
                <span className="employer-menu-text">Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/messages" className="employer-menu-link">
                <span className="employer-menu-icon"><FiMessageSquare /></span>
                <span className="employer-menu-text">Messages</span>
                <span className="employer-menu-badge">3</span>
              </Link>
            </li>
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="employer-main-content">
          <header className="employer-header">
            <h1>Post New Job</h1>
            <div className="employer-search-bar">
              <input 
                type="text" 
                placeholder="Search jobs, applicants..." 
                className="postjob-search"
              />
              <div className="employer-user-info">
                Welcome, {auth.currentUser?.displayName || 'Employer'}
              </div>
            </div>
          </header>

          {/* Progress Section */}
          <div className="postjob-progress-section">
            <div className="postjob-step-indicators">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="postjob-step-indicator-wrapper">
                  <div className={`postjob-step-circle ${currentStep >= step ? 'active' : ''}`}>
                    {currentStep > step ? <FiCheckCircle /> : step}
                  </div>
                  <div className="postjob-step-label">
                    {step === 1 && 'Basic Info'}
                    {step === 2 && 'Description'}
                    {step === 3 && 'Questions'}
                    {step === 4 && 'Process'}
                    {step === 5 && 'Review'}
                  </div>
                  {step < 5 && (
                    <div className={`postjob-step-connector ${currentStep > step ? 'active' : ''}`}></div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="postjob-progress-bar-container">
              <div 
                className="postjob-progress-fill" 
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
            <div className="postjob-progress-text">
              Step {currentStep} of 5 · {Math.round((currentStep / 5) * 100)}% Complete
            </div>
          </div>

          {/* Form Card */}
          <div className="postjob-form-card">
            <div className="postjob-form-header">
              <div className="postjob-form-title">
                <h2>
                  {currentStep === 1 && "Basic Information"}
                  {currentStep === 2 && "Job Description"}
                  {currentStep === 3 && "Candidate Questions"}
                  {currentStep === 4 && "Hiring Process"}
                  {currentStep === 5 && "Review Job Posting"}
                </h2>
                <p className="postjob-form-subtitle">
                  {currentStep === 1 && "Enter the basic details about the position"}
                  {currentStep === 2 && "Describe the role and what you're looking for"}
                  {currentStep === 3 && "Add questions for candidates to answer"}
                  {currentStep === 4 && "Outline your hiring process"}
                  {currentStep === 5 && "Verify all information before posting"}
                </p>
              </div>
              <div className="postjob-form-icon">
                {currentStep === 1 && <FiFileText />}
                {currentStep === 2 && <FiClipboard />}
                {currentStep === 3 && <FiUsers />}
                {currentStep === 4 && <FiCalendar />}
                {currentStep === 5 && <FiCheckCircle />}
              </div>
            </div>

            <div className="postjob-form-content">
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="postjob-form-navigation">
              <div className="postjob-nav-left">
                {currentStep > 1 && (
                  <button onClick={prevStep} className="postjob-secondary-btn">
                    <FiChevronLeft /> Back
                  </button>
                )}
              </div>
              <div className="postjob-nav-right">
                {currentStep < 5 ? (
                  <button onClick={nextStep} className="postjob-primary-btn">
                    Continue <FiChevronRight />
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await saveJobStep();
                      alert("Job posted successfully!");
                      navigate("/employer");
                    }}
                    className="postjob-primary-btn postjob-finish-btn"
                  >
                    <FiSave /> Finish & Post Job
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PostJobPage;