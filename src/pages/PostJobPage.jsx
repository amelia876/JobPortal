import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./PostJobPage.css";

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
      });

      if (!jobData.id) setJobData((prev) => ({ ...prev, id: jobId }));
      console.log(`Step ${currentStep} saved!`);
    } catch (error) {
      console.error("Error saving job step:", error);
    }
  };

  // Navigation between steps
  const nextStep = async () => {
    await saveJobStep();
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Step components
  const Step1BasicInfo = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Title or Position *</label>
        <input
          type="text"
          value={jobData.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Job Status</label>
        <input
          type="text"
          value={jobData.jobStatus}
          onChange={(e) => handleChange("jobStatus", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Department</label>
        <input
          type="text"
          value={jobData.department}
          onChange={(e) => handleChange("department", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Minimum Experience</label>
        <input
          type="text"
          value={jobData.minExperience}
          onChange={(e) => handleChange("minExperience", e.target.value)}
        />
      </div>
    </div>
  );

  const Step2JobDescription = () => (
    <div className="form-grid">
      <div className="form-group">
        <label>Job Description *</label>
        <textarea
          value={jobData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Qualifications</label>
        <textarea
          value={jobData.qualifications}
          onChange={(e) => handleChange("qualifications", e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Experience Required</label>
        <input
          type="text"
          value={jobData.experienceRequired}
          onChange={(e) => handleChange("experienceRequired", e.target.value)}
        />
      </div>
    </div>
  );

  const Step3Questions = () => (
    <div>
      <p>Add applicable questions for candidates (optional)</p>
      <textarea
        placeholder="Enter questions separated by line breaks"
        value={jobData.questions.join("\n")}
        onChange={(e) =>
          handleChange("questions", e.target.value.split("\n"))
        }
      />
    </div>
  );

  const Step4HiringProcess = () => (
    <div>
      <p>Describe your hiring process (optional)</p>
      <textarea
        placeholder="Interview stages, assessments, etc."
        value={jobData.hiringProcess}
        onChange={(e) => handleChange("hiringProcess", e.target.value)}
      />
    </div>
  );

  const Step5Confirmation = () => (
    <div>
      <h3>Review Your Job Posting</h3>
      <pre>{JSON.stringify(jobData, null, 2)}</pre>
      <p>Click Finish to save the final job posting.</p>
    </div>
  );

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo />;
      case 2:
        return <Step2JobDescription />;
      case 3:
        return <Step3Questions />;
      case 4:
        return <Step4HiringProcess />;
      case 5:
        return <Step5Confirmation />;
      default:
        return null;
    }
  };

  return (
    <div className="postjob-page">
      {/* Sidebar */}
      <aside className="sidebarJobs">
        <div className="sidebar-icon active"></div>
        <div className="sidebar-icon"></div>
        <div className="sidebar-icon"></div>
        <div className="sidebar-icon"></div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <h2 className="logo">NOOBLABS</h2>
          <div className="settings-icon">⚙️</div>
        </header>

        {/* Steps Navigation */}
        <div className="steps">
          <div className={currentStep === 1 ? "step active" : "step"}>
            1. Basic Information
          </div>
          <div className={currentStep === 2 ? "step active" : "step"}>
            2. Job Description
          </div>
          <div className={currentStep === 3 ? "step active" : "step"}>
            3. Questions
          </div>
          <div className={currentStep === 4 ? "step active" : "step"}>
            4. Hiring Process
          </div>
          <div className={currentStep === 5 ? "step active" : "step"}>
            5. Confirmation
          </div>
        </div>

        {/* Form Card */}
        <div className="form-card">{renderStep()}</div>

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button onClick={prevStep} className="secondary-btn">
              Back
            </button>
          )}
          {currentStep < 5 && (
            <button onClick={nextStep} className="primary-btn">
              Next
            </button>
          )}
          {currentStep === 5 && (
            <button
              onClick={async () => {
                await saveJobStep();
                alert("Job posted successfully!");
                navigate("/employer");
              }}
              className="primary-btn"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostJobPage;




/*const PostJobPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Job fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState(""); // Full-time, Part-time
  const [salary, setSalary] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        if (userDoc.exists) setUser(userDoc.data());
      }
    };
    fetchUserData();
  }, []);

  const handlePostJob = async () => {
    if (!title || !description || !location || !type) {
      alert("Please fill in all required fields!");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await addDoc(collection(db, "jobs"), {
        title,
        description,
        location,
        type,
        salary,
        qualifications,
        experience,
        employerId: currentUser.uid,
        employerName: user?.fullName || "Employer",
        createdAt: Timestamp.now(),
      });

      alert("Job posted successfully!");

      // Clear form
      setTitle("");
      setDescription("");
      setLocation("");
      setType("");
      setSalary("");
      setQualifications("");
      setExperience("");

      // Redirect back to dashboard or postings page
      navigate("/employer-dashboard");

    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job. Try again.");
    }
  };

  return (
    <div className="post-job-container">
      <h2>Post a New Job</h2>
      <div className="job-form">
        <label>Job Title *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Job Description *</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Location *</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />

        <label>Job Type *</label>
        <input type="text" placeholder="Full-time / Part-time" value={type} onChange={(e) => setType(e.target.value)} />

        <label>Salary</label>
        <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} />

        <label>Qualifications</label>
        <textarea value={qualifications} onChange={(e) => setQualifications(e.target.value)} />

        <label>Experience</label>
        <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} />

        <button className="primary-btn" onClick={handlePostJob}>Post Job</button>
      </div>
    </div>
  );
};

export default PostJobPage; */
