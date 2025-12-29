import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import './CompleteProfile.css';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [formData, setFormData] = useState({
    // Personal Information
    profilePicture: '',
    bio: '',
    phoneNumber: '',
    location: '',
    portfolio: '',
    linkedin: '',
    github: '',
    
    // Educational History (Array)
    education: [
      {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        currentlyStudying: false,
        description: ''
      }
    ],
    
    // Professional Experience (Array)
    experience: [
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        location: '',
        description: ''
      }
    ],
    
    // Certifications (Array)
    certifications: [
      {
        name: '',
        issuingOrganization: '',
        issueDate: '',
        expirationDate: '',
        credentialId: '',
        credentialUrl: ''
      }
    ],
    
    // Skills & Abilities
    skills: '',
    languages: '',
    technicalSkills: '',
    softSkills: '',
    
    // Job Preferences
    jobTitle: '',
    employmentType: ['Full-time'], // Array
    industries: [], // Array
    salaryExpectation: '',
    locationPreference: '', // Remote, On-site, Hybrid
    relocationWillingness: false,
    
    // Resume
    resumeUrl: '',
    resumeFile: null,
    
    // Additional
    availability: 'Immediately',
    noticePeriod: '0',
    references: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if email is verified
      if (!user.emailVerified) {
        navigate('/login', { 
          state: { 
            message: 'Please verify your email first' 
          } 
        });
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserInfo(data);
          
          // If profile already completed, redirect to dashboard
          if (data.profileCompleted) {
            redirectBasedOnRole(data.role);
            return;
          }
          
          // Pre-fill form with existing data
          setFormData(prev => ({
            ...prev,
            bio: data.bio || '',
            skills: data.skills || '',
            experience: data.experience || prev.experience,
            education: data.education || prev.education,
            jobTitle: data.jobTitle || '',
            portfolio: data.portfolio || '',
            linkedin: data.linkedin || '',
            github: data.github || ''
          }));
        }
      } catch (err) {
        setError('Error loading profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'employer':
        navigate('/employer');
        break;
      case 'jobseeker':
      default:
        navigate('/jobseeker');
        break;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [arrayName, index, field] = name.split('.');
        const updatedArray = [...formData[arrayName]];
        updatedArray[index][field] = checked;
        setFormData(prev => ({
          ...prev,
          [arrayName]: updatedArray
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const updatedArray = [...formData[arrayName]];
    updatedArray[index][field] = value;
    setFormData(prev => ({
      ...prev,
      [arrayName]: updatedArray
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          currentlyStudying: false,
          description: ''
        }
      ]
    }));
  };

  const removeEducation = (index) => {
    const updatedEducation = [...formData.education];
    updatedEducation.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          currentlyWorking: false,
          location: '',
          description: ''
        }
      ]
    }));
  };

  const removeExperience = (index) => {
    const updatedExperience = [...formData.experience];
    updatedExperience.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      experience: updatedExperience
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          name: '',
          issuingOrganization: '',
          issueDate: '',
          expirationDate: '',
          credentialId: '',
          credentialUrl: ''
        }
      ]
    }));
  };

  const removeCertification = (index) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      certifications: updatedCertifications
    }));
  };

  const handleEmploymentTypeChange = (type) => {
    const currentTypes = [...formData.employmentType];
    if (currentTypes.includes(type)) {
      const filtered = currentTypes.filter(t => t !== type);
      setFormData(prev => ({ ...prev, employmentType: filtered }));
    } else {
      setFormData(prev => ({ ...prev, employmentType: [...currentTypes, type] }));
    }
  };

  const handleIndustryChange = (industry) => {
    const currentIndustries = [...formData.industries];
    if (currentIndustries.includes(industry)) {
      const filtered = currentIndustries.filter(i => i !== industry);
      setFormData(prev => ({ ...prev, industries: filtered }));
    } else {
      setFormData(prev => ({ ...prev, industries: [...currentIndustries, industry] }));
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should be less than 5MB');
        return;
      }
      
      // In a real app, you would upload to storage and get URL
      setFormData(prev => ({
        ...prev,
        resumeFile: file,
        resumeUrl: URL.createObjectURL(file)
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const user = auth.currentUser;
    if (!user) {
      setError('User not logged in');
      setSaving(false);
      return;
    }

    try {
      // Prepare profile data
      const profileData = {
        ...formData,
        uid: user.uid,
        email: user.email,
        firstName: userInfo?.firstName || '',
        lastName: userInfo?.lastName || '',
        profileCompleted: true,
        isFirstTimeUser: false,
        profileCompletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Update user document
      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });

      alert('Profile completed successfully!');
      redirectBasedOnRole(userInfo?.role || 'jobseeker');

    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="employer-step-indicator">
      <div className="employer-step-progress">
        <div 
          className="employer-step-progress-bar" 
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        ></div>
      </div>
      <div className="employer-steps">
        {[1, 2, 3, 4, 5].map(step => (
          <div 
            key={step} 
            className={`employer-step ${step === currentStep ? 'active' : step < currentStep ? 'completed' : ''}`}
          >
            <div className="employer-step-number">{step}</div>
            <div className="employer-step-label">
              {step === 1 && 'Personal'}
              {step === 2 && 'Education'}
              {step === 3 && 'Experience'}
              {step === 4 && 'Skills'}
              {step === 5 && 'Preferences'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="employer-loading-container">
        <div className="employer-loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="employer-dashboard-container">
      {/* Top Navbar */}
      <nav className="employer-top-navbar">
        <div className="employer-nav-brand">
          <span className="employer-brand-logo">CareerConnect</span>
          <span className="employer-user-welcome">
            Complete Your Profile
          </span>
        </div>
        
        <div className="employer-nav-actions">
          <div className="employer-user-info">
            {userInfo?.firstName} {userInfo?.lastName}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="employer-dashboard-layout">
        {/* Sidebar */}
        <aside className="employer-sidebar">
          <div className="employer-logo">Profile Completion</div>
          <ul className="employer-menu">
            <li className={currentStep === 1 ? 'active' : ''}>
              <span className="employer-menu-icon">👤</span>
              <span className="employer-menu-text">Personal Info</span>
            </li>
            <li className={currentStep === 2 ? 'active' : ''}>
              <span className="employer-menu-icon">🎓</span>
              <span className="employer-menu-text">Education</span>
            </li>
            <li className={currentStep === 3 ? 'active' : ''}>
              <span className="employer-menu-icon">💼</span>
              <span className="employer-menu-text">Experience</span>
            </li>
            <li className={currentStep === 4 ? 'active' : ''}>
              <span className="employer-menu-icon">🛠️</span>
              <span className="employer-menu-text">Skills</span>
            </li>
            <li className={currentStep === 5 ? 'active' : ''}>
              <span className="employer-menu-icon">🎯</span>
              <span className="employer-menu-text">Preferences</span>
            </li>
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="employer-main-content">
          <header className="employer-header">
            <h1>Complete Your Profile</h1>
            <p>Welcome{userInfo?.firstName ? `, ${userInfo.firstName}` : ''}! Let's set up your profile to get started.</p>
          </header>

          {renderStepIndicator()}

          <div className="employer-profile-form-container">
            {error && (
              <div className="employer-error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="employer-profile-form">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="employer-form-section">
                  <h3>Personal Information</h3>
                  
                  <div className="employer-form-grid">
                    <div className="employer-form-group">
                      <label>Profile Picture</label>
                      <div className="employer-profile-picture-upload">
                        <div className="employer-profile-avatar">
                          {formData.profilePicture ? (
                            <img src={formData.profilePicture} alt="Profile" />
                          ) : (
                            <span>{userInfo?.firstName?.charAt(0)}{userInfo?.lastName?.charAt(0)}</span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData(prev => ({ ...prev, profilePicture: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <button type="button" className="employer-upload-btn">
                          Upload Photo
                        </button>
                      </div>
                    </div>

                    <div className="employer-form-group">
                      <label>Bio/Summary *</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself, your career goals, and what makes you unique..."
                        rows="4"
                        required
                      />
                    </div>

                    <div className="employer-form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>

                    <div className="employer-form-group">
                      <label>Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, State, Country"
                        required
                      />
                    </div>

                    <div className="employer-form-group">
                      <label>Portfolio Website</label>
                      <input
                        type="url"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>

                    <div className="employer-form-group">
                      <label>LinkedIn Profile</label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/yourname"
                      />
                    </div>

                    <div className="employer-form-group">
                      <label>GitHub Profile</label>
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Educational History */}
              {currentStep === 2 && (
                <div className="employer-form-section">
                  <h3>Educational History</h3>
                  
                  {formData.education.map((edu, index) => (
                    <div key={index} className="employer-form-card">
                      <div className="employer-form-card-header">
                        <h4>Education #{index + 1}</h4>
                        {index > 0 && (
                          <button 
                            type="button" 
                            className="employer-remove-btn"
                            onClick={() => removeEducation(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="employer-form-grid">
                        <div className="employer-form-group">
                          <label>Institution *</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleArrayChange('education', index, 'institution', e.target.value)}
                            placeholder="University Name"
                            required
                          />
                        </div>

                        <div className="employer-form-group">
                          <label>Degree *</label>
                          <select
                            value={edu.degree}
                            onChange={(e) => handleArrayChange('education', index, 'degree', e.target.value)}
                            required
                          >
                            <option value="">Select Degree</option>
                            <option value="High School">High School</option>
                            <option value="Associate's">Associate's Degree</option>
                            <option value="Bachelor's">Bachelor's Degree</option>
                            <option value="Master's">Master's Degree</option>
                            <option value="PhD">PhD</option>
                            <option value="Diploma">Diploma</option>
                            <option value="Certificate">Certificate</option>
                          </select>
                        </div>

                        <div className="employer-form-group">
                          <label>Field of Study *</label>
                          <input
                            type="text"
                            value={edu.fieldOfStudy}
                            onChange={(e) => handleArrayChange('education', index, 'fieldOfStudy', e.target.value)}
                            placeholder="e.g., Computer Science"
                            required
                          />
                        </div>

                        <div className="employer-form-group">
                          <label>Start Date *</label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => handleArrayChange('education', index, 'startDate', e.target.value)}
                            required
                          />
                        </div>

                        <div className="employer-form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={edu.currentlyStudying}
                              onChange={(e) => handleArrayChange('education', index, 'currentlyStudying', e.target.checked)}
                            />
                            Currently Studying
                          </label>
                        </div>

                        {!edu.currentlyStudying && (
                          <div className="employer-form-group">
                            <label>End Date *</label>
                            <input
                              type="month"
                              value={edu.endDate}
                              onChange={(e) => handleArrayChange('education', index, 'endDate', e.target.value)}
                              required={!edu.currentlyStudying}
                            />
                          </div>
                        )}

                        <div className="employer-form-group employer-full-width">
                          <label>Description</label>
                          <textarea
                            value={edu.description}
                            onChange={(e) => handleArrayChange('education', index, 'description', e.target.value)}
                            placeholder="Describe your studies, achievements, coursework..."
                            rows="3"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="employer-add-btn" onClick={addEducation}>
                    + Add Another Education
                  </button>
                </div>
              )}

              {/* Step 3: Professional Experience */}
              {currentStep === 3 && (
                <div className="employer-form-section">
                  <h3>Professional Experience</h3>
                  
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="employer-form-card">
                      <div className="employer-form-card-header">
                        <h4>Experience #{index + 1}</h4>
                        {index > 0 && (
                          <button 
                            type="button" 
                            className="employer-remove-btn"
                            onClick={() => removeExperience(index)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="employer-form-grid">
                        <div className="employer-form-group">
                          <label>Company *</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                            placeholder="Company Name"
                            required
                          />
                        </div>

                        <div className="employer-form-group">
                          <label>Position/Title *</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => handleArrayChange('experience', index, 'position', e.target.value)}
                            placeholder="e.g., Senior Software Engineer"
                            required
                          />
                        </div>

                        <div className="employer-form-group">
                          <label>Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => handleArrayChange('experience', index, 'location', e.target.value)}
                            placeholder="City, State"
                          />
                        </div>

                        <div className="employer-form-group">
                          <label>Start Date *</label>
                          <input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => handleArrayChange('experience', index, 'startDate', e.target.value)}
                            required
                          />
                        </div>

                        <div className="employer-form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={exp.currentlyWorking}
                              onChange={(e) => handleArrayChange('experience', index, 'currentlyWorking', e.target.checked)}
                            />
                            I currently work here
                          </label>
                        </div>

                        {!exp.currentlyWorking && (
                          <div className="employer-form-group">
                            <label>End Date *</label>
                            <input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => handleArrayChange('experience', index, 'endDate', e.target.value)}
                              required={!exp.currentlyWorking}
                            />
                          </div>
                        )}

                        <div className="employer-form-group employer-full-width">
                          <label>Description *</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value)}
                            placeholder="Describe your responsibilities, achievements, and key contributions..."
                            rows="4"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" className="employer-add-btn" onClick={addExperience}>
                    + Add Another Experience
                  </button>

                  {/* Certifications */}
                  <div className="employer-form-section">
                    <h3>Certifications</h3>
                    
                    {formData.certifications.map((cert, index) => (
                      <div key={index} className="employer-form-card">
                        <div className="employer-form-card-header">
                          <h4>Certification #{index + 1}</h4>
                          {index > 0 && (
                            <button 
                              type="button" 
                              className="employer-remove-btn"
                              onClick={() => removeCertification(index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="employer-form-grid">
                          <div className="employer-form-group">
                            <label>Certification Name *</label>
                            <input
                              type="text"
                              value={cert.name}
                              onChange={(e) => handleArrayChange('certifications', index, 'name', e.target.value)}
                              placeholder="e.g., AWS Certified Solutions Architect"
                              required
                            />
                          </div>

                          <div className="employer-form-group">
                            <label>Issuing Organization *</label>
                            <input
                              type="text"
                              value={cert.issuingOrganization}
                              onChange={(e) => handleArrayChange('certifications', index, 'issuingOrganization', e.target.value)}
                              placeholder="e.g., Amazon Web Services"
                              required
                            />
                          </div>

                          <div className="employer-form-group">
                            <label>Issue Date *</label>
                            <input
                              type="month"
                              value={cert.issueDate}
                              onChange={(e) => handleArrayChange('certifications', index, 'issueDate', e.target.value)}
                              required
                            />
                          </div>

                          <div className="employer-form-group">
                            <label>Expiration Date</label>
                            <input
                              type="month"
                              value={cert.expirationDate}
                              onChange={(e) => handleArrayChange('certifications', index, 'expirationDate', e.target.value)}
                            />
                          </div>

                          <div className="employer-form-group">
                            <label>Credential ID</label>
                            <input
                              type="text"
                              value={cert.credentialId}
                              onChange={(e) => handleArrayChange('certifications', index, 'credentialId', e.target.value)}
                              placeholder="License/Credential ID"
                            />
                          </div>

                          <div className="employer-form-group">
                            <label>Credential URL</label>
                            <input
                              type="url"
                              value={cert.credentialUrl}
                              onChange={(e) => handleArrayChange('certifications', index, 'credentialUrl', e.target.value)}
                              placeholder="https://verify.certificate-url.com"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button type="button" className="employer-add-btn" onClick={addCertification}>
                      + Add Another Certification
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Skills & Abilities */}
              {currentStep === 4 && (
                <div className="employer-form-section">
                  <h3>Skills & Abilities</h3>
                  
                  <div className="employer-form-grid">
                    <div className="employer-form-group employer-full-width">
                      <label>Skills (comma separated) *</label>
                      <textarea
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="React, Node.js, MongoDB, AWS, TypeScript, Python, Docker, Kubernetes"
                        rows="3"
                        required
                      />
                      <small>Separate skills with commas. Include both technical and soft skills.</small>
                    </div>

                    <div className="employer-form-group employer-full-width">
                      <label>Technical Skills</label>
                      <textarea
                        name="technicalSkills"
                        value={formData.technicalSkills}
                        onChange={handleChange}
                        placeholder="Programming languages, frameworks, tools, methodologies..."
                        rows="3"
                      />
                    </div>

                    <div className="employer-form-group employer-full-width">
                      <label>Soft Skills</label>
                      <textarea
                        name="softSkills"
                        value={formData.softSkills}
                        onChange={handleChange}
                        placeholder="Communication, leadership, problem-solving, teamwork..."
                        rows="3"
                      />
                    </div>

                    <div className="employer-form-group employer-full-width">
                      <label>Languages</label>
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages}
                        onChange={handleChange}
                        placeholder="English (Fluent), Spanish (Intermediate), French (Basic)"
                      />
                      <small>List languages and proficiency levels</small>
                    </div>

                    <div className="employer-form-group employer-full-width">
                      <label>Upload Resume/CV *</label>
                      <div className="employer-resume-upload">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          required={!formData.resumeUrl}
                        />
                        {formData.resumeFile && (
                          <div className="employer-resume-preview">
                            <i className="fas fa-file-pdf"></i>
                            <span>{formData.resumeFile.name}</span>
                            <span>{(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        )}
                      </div>
                      <small>Supported formats: PDF, DOC, DOCX (Max 5MB)</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Job Preferences */}
              {currentStep === 5 && (
                <div className="employer-form-section">
                  <h3>Job Preferences</h3>
                  
                  <div className="employer-form-grid">
                    <div className="employer-form-group">
                      <label>Desired Job Title *</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="e.g., Senior Frontend Developer"
                        required
                      />
                    </div>

                    <div className="employer-form-group">
                      <label>Employment Type *</label>
                      <div className="employer-checkbox-group">
                        {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map(type => (
                          <label key={type} className="employer-checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.employmentType.includes(type)}
                              onChange={() => handleEmploymentTypeChange(type)}
                            />
                            <span>{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="employer-form-group">
                      <label>Salary Expectation (Annual)</label>
                      <div className="employer-salary-input">
                        <select
                          name="salaryCurrency"
                          onChange={handleChange}
                          style={{ marginRight: '10px' }}
                        >
                          <option value="USD">$</option>
                          <option value="EUR">€</option>
                          <option value="GBP">£</option>
                          <option value="INR">₹</option>
                        </select>
                        <input
                          type="number"
                          name="salaryExpectation"
                          value={formData.salaryExpectation}
                          onChange={handleChange}
                          placeholder="e.g., 80000"
                        />
                      </div>
                    </div>

                    <div className="employer-form-group">
                      <label>Location Preference *</label>
                      <select
                        name="locationPreference"
                        value={formData.locationPreference}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Preference</option>
                        <option value="Remote">Remote Only</option>
                        <option value="On-site">On-site Only</option>
                        <option value="Hybrid">Hybrid (Remote + Office)</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>

                    <div className="employer-form-group">
                      <label>Industries of Interest</label>
                      <div className="employer-checkbox-grid">
                        {[
                          'Technology', 'Finance', 'Healthcare', 'Education', 
                          'Marketing', 'Design', 'Engineering', 'Sales', 
                          'Consulting', 'E-commerce', 'Entertainment', 'Non-profit'
                        ].map(industry => (
                          <label key={industry} className="employer-checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.industries.includes(industry)}
                              onChange={() => handleIndustryChange(industry)}
                            />
                            <span>{industry}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="employer-form-group">
                      <label>Availability</label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                      >
                        <option value="Immediately">Immediately Available</option>
                        <option value="1 week">1 Week Notice</option>
                        <option value="2 weeks">2 Weeks Notice</option>
                        <option value="1 month">1 Month Notice</option>
                        <option value="2 months">2 Months Notice</option>
                        <option value="3 months">3 Months Notice</option>
                      </select>
                    </div>

                    <div className="employer-form-group">
                      <label>Notice Period (Days)</label>
                      <input
                        type="number"
                        name="noticePeriod"
                        value={formData.noticePeriod}
                        onChange={handleChange}
                        min="0"
                        max="180"
                      />
                    </div>

                    <div className="employer-form-group">
                      <label>
                        <input
                          type="checkbox"
                          name="relocationWillingness"
                          checked={formData.relocationWillingness}
                          onChange={handleChange}
                        />
                        Willing to relocate
                      </label>
                    </div>

                    <div className="employer-form-group employer-full-width">
                      <label>References</label>
                      <textarea
                        name="references"
                        value={formData.references}
                        onChange={handleChange}
                        placeholder="List professional references or describe your reference availability..."
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="employer-form-navigation">
                {currentStep > 1 && (
                  <button type="button" className="employer-prev-btn" onClick={prevStep}>
                    <i className="fas fa-arrow-left"></i> Previous
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button type="button" className="employer-next-btn" onClick={nextStep}>
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="employer-submit-btn"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Saving...
                      </>
                    ) : (
                      'Complete Profile & Continue'
                    )}
                  </button>
                )}
                
                <button 
                  type="button" 
                  className="employer-skip-btn"
                  onClick={() => {
                    if (userInfo?.role) {
                      redirectBasedOnRole(userInfo.role);
                    } else {
                      navigate('/jobseeker');
                    }
                  }}
                >
                  Skip for Now
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompleteProfile;