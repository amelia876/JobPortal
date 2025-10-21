import React, { useState, useEffect, memo } from "react";
import { auth, db } from "../firebase/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
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
        />
      </div>

      <div className="postjob-form-group">
        <label>Job Status</label>
        <select
          value={jobData.jobStatus}
          onChange={(e) => onChange("jobStatus", e.target.value)}
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
        />
      </div>

      <div className="postjob-form-group">
        <label>Minimum Experience</label>
        <select
          value={jobData.minExperience}
          onChange={(e) => onChange("minExperience", e.target.value)}
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
        />
      </div>

      <div className="postjob-form-group">
        <label>Compensation</label>
        <input
          type="text"
          value={jobData.compensation}
          onChange={(e) => onChange("compensation", e.target.value)}
          placeholder="Enter salary range"
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
        />
      </div>
      <div className="postjob-form-group">
        <label>Qualifications</label>
        <textarea
          value={jobData.qualifications}
          onChange={(e) => onChange("qualifications", e.target.value)}
          placeholder="List required qualifications, skills, and education..."
          rows={4}
        />
      </div>
      <div className="postjob-form-group">
        <label>Experience Required</label>
        <textarea
          value={jobData.experienceRequired}
          onChange={(e) => onChange("experienceRequired", e.target.value)}
          placeholder="Detail specific experience requirements..."
          rows={3}
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

  return (
    <div className="postjob-page">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">JobLytics</div>

        <ul className="nav-links">
          <li><a href="/EmployerDashboard">Home</a></li>
          <li><a href="/PostJobPage">Jobs</a></li>
          <li><a href="/Profile">Profile</a></li>
          <li><a href="/Applicants">Applicants</a></li>
        </ul>

        <div className="nav-actions">
          <button 
            onClick={() => window.history.back()} 
            className="login-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
          >
            Back
          </button>
          <button 
            onClick={async () => {
              try {
                await auth.signOut();
                navigate('/login');
              } catch (error) {
                console.error('Error signing out:', error);
              }
            }}
            className="signup-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
          >
            Log Out
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="postjob-content-wrapper">
        {/* Sidebar */}
        <aside className="postjob-sidebar">
          <div className="postjob-sidebar-header">
            <h2 className="postjob-logo">JobLytics</h2>
          </div>
          <div className="postjob-sidebar-steps">
            <div className={`postjob-step-indicator ${currentStep === 1 ? 'active' : ''}`}>
              <div className="postjob-step-number">1</div>
              <div className="postjob-step-info">
                <div className="postjob-step-title">Basic Information</div>
                <div className="postjob-step-desc">Job title & details</div>
              </div>
            </div>
            <div className={`postjob-step-indicator ${currentStep === 2 ? 'active' : ''}`}>
              <div className="postjob-step-number">2</div>
              <div className="postjob-step-info">
                <div className="postjob-step-title">Job Description</div>
                <div className="postjob-step-desc">Role & requirements</div>
              </div>
            </div>
            <div className={`postjob-step-indicator ${currentStep === 3 ? 'active' : ''}`}>
              <div className="postjob-step-number">3</div>
              <div className="postjob-step-info">
                <div className="postjob-step-title">Questions</div>
                <div className="postjob-step-desc">Candidate screening</div>
              </div>
            </div>
            <div className={`postjob-step-indicator ${currentStep === 4 ? 'active' : ''}`}>
              <div className="postjob-step-number">4</div>
              <div className="postjob-step-info">
                <div className="postjob-step-title">Hiring Process</div>
                <div className="postjob-step-desc">Interview stages</div>
              </div>
            </div>
            <div className={`postjob-step-indicator ${currentStep === 5 ? 'active' : ''}`}>
              <div className="postjob-step-number">5</div>
              <div className="postjob-step-info">
                <div className="postjob-step-title">Confirmation</div>
                <div className="postjob-step-desc">Review & submit</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="postjob-main-content">
          <header className="postjob-topbar">
            <div className="postjob-breadcrumb">
              Jobs / Post New Job
            </div>
            <div className="postjob-user-menu">
              <div className="postjob-user-avatar">
                <span>JD</span>
              </div>
              <span className="postjob-user-name">John Doe</span>
            </div>
          </header>

          {/* Progress Bar */}
          <div className="postjob-progress-container">
            <div className="postjob-progress-bar">
              <div 
                className="postjob-progress-fill" 
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
            <div className="postjob-progress-text">
              Step {currentStep} of 5
            </div>
          </div>

          {/* Form Card */}
          <div className="postjob-form-card">
            <div className="postjob-form-header">
              <h2>
                {currentStep === 1 && "Basic Information"}
                {currentStep === 2 && "Job Description"}
                {currentStep === 3 && "Candidate Questions"}
                {currentStep === 4 && "Hiring Process"}
                {currentStep === 5 && "Review Job Posting"}
              </h2>
              <p>
                {currentStep === 1 && "Enter the basic details about the position"}
                {currentStep === 2 && "Describe the role and what you're looking for"}
                {currentStep === 3 && "Add questions for candidates to answer"}
                {currentStep === 4 && "Outline your hiring process"}
                {currentStep === 5 && "Verify all information before posting"}
              </p>
            </div>

            <div className="postjob-form-content">
              {renderStep()}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="postjob-form-navigation">
            {currentStep > 1 && (
              <button onClick={prevStep} className="postjob-secondary-btn">
                Back
              </button>
            )}
            {currentStep < 5 && (
              <button onClick={nextStep} className="postjob-primary-btn">
                Continue
              </button>
            )}
            {currentStep === 5 && (
              <button
                onClick={async () => {
                  await saveJobStep();
                  alert("Job posted successfully!");
                  navigate("/employer");
                }}
                className="postjob-primary-btn"
              >
                Finish & Post Job
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJobPage;