import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiBriefcase, FiAward, FiSettings, 
  FiStar, FiTrendingUp, FiUpload, FiX,
  FiCalendar, FiMapPin, FiDollarSign, FiMail,
  FiPhone, FiGlobe, FiCheck, FiPlus, FiEdit2,
  FiSave, FiTrash2, FiLogOut, FiSearch,
  FiBarChart2, FiTarget, FiClock, FiUsers,
  FiArrowLeft, FiBookOpen, FiFileText, FiBook,
  FiHome, FiTool, FiLayers, FiLoader,
  FiMessageSquare, FiBell
} from 'react-icons/fi';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './ProfilePageSeeker.css';

const ProfilePageSeeker = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [showAIChatbox, setShowAIChatbox] = useState(false);

  // Initialize default form data structure
  const defaultFormData = {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      profileTitle: '',
      summary: '',
      profilePhoto: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    qualifications: {
      education: [],
      skills: [],
      certifications: []
    },
    experience: [],
    preferences: {
      jobTitle: '',
      employmentType: ['Full-time'],
      salaryExpectation: '',
      locationPreference: 'Hybrid',
      industries: [],
      noticePeriod: '2 weeks',
      availability: 'Immediately',
      relocationWillingness: false,
      visaSponsorship: false
    },
    resumeUrl: '',
    languages: '',
    technicalSkills: '',
    softSkills: ''
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [stats, setStats] = useState({
    matchScore: 0,
    applications: 0,
    interviews: 0,
    profileCompletion: 0
  });

  // Fetch profile data from Firebase
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          // Transform Firebase data to match our structure
          const transformedData = {
            personalInfo: {
              fullName: data.firstName || data.fullName || user.displayName || 'Your Name',
              email: user.email || data.email || '',
              phone: data.phoneNumber || data.phone || '',
              location: data.location || '',
              profileTitle: data.title || data.jobTitle || 'Your Professional Title',
              summary: data.bio || data.summary || '',
              profilePhoto: data.profilePicture || data.profilePhoto || '',
              linkedin: data.linkedin || '',
              github: data.github || '',
              portfolio: data.portfolio || ''
            },
            qualifications: {
              education: Array.isArray(data.education) ? data.education : [],
              skills: data.skills ? (Array.isArray(data.skills) ? data.skills : data.skills.split(',').map(s => s.trim()).filter(s => s)) : [],
              certifications: Array.isArray(data.certifications) ? data.certifications : []
            },
            experience: Array.isArray(data.experience) ? data.experience : [],
            preferences: {
              jobTitle: data.jobTitle || data.title || '',
              employmentType: Array.isArray(data.employmentType) ? data.employmentType : ['Full-time'],
              salaryExpectation: data.salaryExpectation || '',
              locationPreference: data.locationPreference || 'Hybrid',
              industries: Array.isArray(data.industries) ? data.industries : [],
              noticePeriod: data.noticePeriod || '2 weeks',
              availability: data.availability || 'Immediately',
              relocationWillingness: data.relocationWillingness || false,
              visaSponsorship: data.visaSponsorship || false
            },
            resumeUrl: data.resumeUrl || '',
            languages: data.languages || '',
            technicalSkills: data.technicalSkills || '',
            softSkills: data.softSkills || ''
          };
          
          setProfileData(transformedData);
          setFormData(transformedData);
          calculateProfileCompletion(transformedData);
        } else {
          // If no profile exists, create default structure with user info
          const defaultData = {
            personalInfo: {
              fullName: user.displayName || 'Your Name',
              email: user.email || '',
              phone: '',
              location: '',
              profileTitle: 'Your Professional Title',
              summary: '',
              profilePhoto: '',
              linkedin: '',
              github: '',
              portfolio: ''
            },
            qualifications: {
              education: [],
              skills: [],
              certifications: []
            },
            experience: [],
            preferences: {
              jobTitle: '',
              employmentType: ['Full-time'],
              salaryExpectation: '',
              locationPreference: 'Hybrid',
              industries: [],
              noticePeriod: '2 weeks',
              availability: 'Immediately',
              relocationWillingness: false,
              visaSponsorship: false
            }
          };
          
          setProfileData(defaultData);
          setFormData(defaultData);
          calculateProfileCompletion(defaultData);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error loading profile data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate]);

  const calculateProfileCompletion = (data) => {
    if (!data) return;
    
    let completion = 0;
    const sections = [
      data?.personalInfo?.fullName,
      data?.personalInfo?.email,
      data?.personalInfo?.phone,
      data?.personalInfo?.location,
      data?.personalInfo?.profileTitle,
      data?.personalInfo?.summary,
      data?.preferences?.jobTitle,
      data?.qualifications?.skills?.length > 0,
      data?.experience?.length > 0,
      data?.qualifications?.education?.length > 0
    ];
    
    const filled = sections.filter(Boolean).length;
    completion = Math.round((filled / sections.length) * 100);
    
    setStats(prev => ({
      ...prev,
      profileCompletion: completion,
      matchScore: Math.min(100, completion + 20)
    }));
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => {
      if (!prev || !prev[section]) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const handleArrayUpdate = (section, field, newArray) => {
    setFormData(prev => {
      if (!prev || !prev[section]) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
  };

  const handleExperienceChange = (index, field, value) => {
    setFormData(prev => {
      if (!prev || !prev.experience) return prev;
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = { ...updatedExperience[index], [field]: value };
      return { ...prev, experience: updatedExperience };
    });
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      experience: [...(prev?.experience || []), newExperience]
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => {
      if (!prev || !prev.experience) return prev;
      const updatedExperience = prev.experience.filter((_, i) => i !== index);
      return { ...prev, experience: updatedExperience };
    });
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      currentlyStudying: false,
      description: ''
    };
    const updatedEducation = [...(formData?.qualifications?.education || []), newEducation];
    handleArrayUpdate('qualifications', 'education', updatedEducation);
  };

  const removeEducation = (index) => {
    const updatedEducation = (formData?.qualifications?.education || []).filter((_, i) => i !== index);
    handleArrayUpdate('qualifications', 'education', updatedEducation);
  };

  const addCertification = () => {
    const newCertification = {
      id: Date.now(),
      name: '',
      issuer: '',
      issueDate: '',
      expirationDate: '',
      credentialId: '',
      credentialUrl: ''
    };
    const updatedCertifications = [...(formData?.qualifications?.certifications || []), newCertification];
    handleArrayUpdate('qualifications', 'certifications', updatedCertifications);
  };

  const removeCertification = (index) => {
    const updatedCertifications = (formData?.qualifications?.certifications || []).filter((_, i) => i !== index);
    handleArrayUpdate('qualifications', 'certifications', updatedCertifications);
  };

  const addSkill = (skill) => {
    if (skill && !formData?.qualifications?.skills?.includes(skill)) {
      const updatedSkills = [...(formData?.qualifications?.skills || []), skill];
      handleArrayUpdate('qualifications', 'skills', updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = (formData?.qualifications?.skills || []).filter(skill => skill !== skillToRemove);
    handleArrayUpdate('qualifications', 'skills', updatedSkills);
  };

  const handleSave = async () => {
    if (!user || !formData) {
      setSaveMessage('Please wait while profile loads');
      return;
    }
    
    setIsLoading(true);
    try {
      // Transform data back to Firebase format
      const firebaseData = {
        // Personal Info
        firstName: formData.personalInfo?.fullName?.split(' ')[0] || '',
        lastName: formData.personalInfo?.fullName?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phoneNumber: formData.personalInfo?.phone || '',
        location: formData.personalInfo?.location || '',
        title: formData.personalInfo?.profileTitle || '',
        bio: formData.personalInfo?.summary || '',
        profilePicture: formData.personalInfo?.profilePhoto || '',
        linkedin: formData.personalInfo?.linkedin || '',
        github: formData.personalInfo?.github || '',
        portfolio: formData.personalInfo?.portfolio || '',
        
        // Qualifications
        skills: formData.qualifications?.skills?.join(', ') || '',
        education: formData.qualifications?.education || [],
        certifications: formData.qualifications?.certifications || [],
        
        // Experience
        experience: formData.experience || [],
        
        // Preferences
        jobTitle: formData.preferences?.jobTitle || '',
        employmentType: formData.preferences?.employmentType || ['Full-time'],
        salaryExpectation: formData.preferences?.salaryExpectation || '',
        locationPreference: formData.preferences?.locationPreference || 'Hybrid',
        industries: formData.preferences?.industries || [],
        noticePeriod: formData.preferences?.noticePeriod || '2 weeks',
        availability: formData.preferences?.availability || 'Immediately',
        relocationWillingness: formData.preferences?.relocationWillingness || false,
        visaSponsorship: formData.preferences?.visaSponsorship || false,
        
        // Additional fields
        languages: formData.languages || '',
        technicalSkills: formData.technicalSkills || '',
        softSkills: formData.softSkills || '',
        
        // Metadata
        updatedAt: new Date().toISOString(),
        profileCompleted: true
      };

      // Save to Firebase
      await setDoc(doc(db, "users", user.uid), firebaseData, { merge: true });
      
      // Update local state
      setProfileData(formData);
      setIsEditing(false);
      setSaveMessage('Profile updated successfully!');
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error saving profile: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData || defaultFormData);
    setIsEditing(false);
    setSaveMessage('');
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    
    setIsSavingPhoto(true);
    try {
      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `profile-pictures/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update form data
      handleInputChange('personalInfo', 'profilePhoto', downloadURL);
      
      // Save to Firebase immediately
      await updateDoc(doc(db, "users", user.uid), {
        profilePicture: downloadURL,
        updatedAt: new Date().toISOString()
      });
      
      setSaveMessage('Profile photo updated!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setSaveMessage('Error uploading photo');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage('File size should be less than 5MB');
      return;
    }
    
    try {
      // Upload to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `resumes/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Save to Firebase
      await updateDoc(doc(db, "users", user.uid), {
        resumeUrl: downloadURL,
        updatedAt: new Date().toISOString()
      });
      
      setResumeFile(file);
      setFormData(prev => ({ ...prev, resumeUrl: downloadURL }));
      setSaveMessage('Resume uploaded successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading resume:', error);
      setSaveMessage('Error uploading resume');
    }
  };

  const handleEmploymentTypeChange = (type) => {
    const currentTypes = formData?.preferences?.employmentType || [];
    if (currentTypes.includes(type)) {
      const filtered = currentTypes.filter(t => t !== type);
      handleInputChange('preferences', 'employmentType', filtered);
    } else {
      handleInputChange('preferences', 'employmentType', [...currentTypes, type]);
    }
  };

  const handleIndustryChange = (industry) => {
    const currentIndustries = formData?.preferences?.industries || [];
    if (currentIndustries.includes(industry)) {
      const filtered = currentIndustries.filter(i => i !== industry);
      handleInputChange('preferences', 'industries', filtered);
    } else {
      handleInputChange('preferences', 'industries', [...currentIndustries, industry]);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleDashboard = () => {
    navigate('/jobseeker');
  };

  const handleJobSearch = () => {
    navigate('/job-search');
  };

  const handleApplications = () => {
    navigate('/applications');
  };

  const handleMessages = () => {
    navigate('/messages');
  };

  const industryOptions = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing',
    'Design', 'Engineering', 'Sales', 'Consulting', 'E-commerce',
    'Entertainment', 'Non-profit', 'Manufacturing', 'Retail', 'Real Estate'
  ];

  const employmentTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

  // Loading State
  if (isLoading) {
    return (
      <div className="jobseeker-dashboard-container">
        <div className="loading-overlay">
          <FiLoader className="loading-spinner" size={40} />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="jobseeker-dashboard-container">
        <div className="error-container">
          <h2>Error Loading Profile</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-save">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No Profile Data State
  if (!profileData) {
    return (
      <div className="jobseeker-dashboard-container">
        <div className="error-container">
          <h2>Profile Not Found</h2>
          <p>Please complete your profile setup to continue.</p>
          <button onClick={() => navigate('/complete-profile')} className="btn-save">
            Complete Profile Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jobseeker-dashboard-container">
      {/* Top Navbar */}
      <nav className="jobseeker-top-navbar">
        <div className="jobseeker-nav-brand">
          <span className="jobseeker-brand-logo">CareerConnect</span>
          <span className="jobseeker-user-welcome">
            Profile Management
          </span>
        </div>
        
        <div className="jobseeker-nav-center">
          <div className="jobseeker-nav-links">
            <Link to="/jobseeker" onClick={handleDashboard}>Dashboard</Link>
            <Link to="/job-search" onClick={handleJobSearch}>Jobs</Link>
            <Link to="/applications" onClick={handleApplications}>Applications</Link>
            <Link to="/profile" className="active">Profile</Link>
            <Link to="/messages" onClick={handleMessages}>Messages</Link>
          </div>
        </div>
        
        <div className="jobseeker-nav-actions">
          <div className="notification-container">
            <button 
              className="notification-bell"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <FiBell className="notification-icon" />
              <span className="notification-badge">3</span>
            </button>
            
            {notificationsOpen && (
              <div className="notification-dropdown open">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button className="mark-all-read">Mark all as read</button>
                </div>
                <div className="notification-list">
                  <div className="notification-item unread">
                    <div className="notification-content">
                      <div className="notification-title">New Job Match</div>
                      <div className="notification-message">
                        You have a 95% match with Senior Frontend Developer at TechCorp
                      </div>
                      <div className="notification-time">2 hours ago</div>
                    </div>
                    <div className="unread-dot"></div>
                  </div>
                  <div className="notification-item unread">
                    <div className="notification-content">
                      <div className="notification-title">Application Update</div>
                      <div className="notification-message">
                        Your application at StartupXYZ has moved to interview stage
                      </div>
                      <div className="notification-time">1 day ago</div>
                    </div>
                    <div className="unread-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="jobseeker-icon-button-container">
            <button 
              className="jobseeker-icon-button"
              onClick={() => setMessagesOpen(true)}
            >
              <FiMessageSquare className="jobseeker-icon-button-icon" />
              <span className="jobseeker-message-badge">2</span>
            </button>
          </div>
          
          <div className="jobseeker-user-info">
            {formData?.personalInfo?.fullName || 'User'}
          </div>
          
          <button className="job-logout-btn" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content Layout */}
      <div className="jobseeker-dashboard-layout">
        {/* Sidebar */}
        <aside className="jobseeker-sidebar">
          <div className="jobseeker-logo">Profile Settings</div>
          <ul className="jobseeker-menu">
            <li 
              className={activeSection === 'personal' ? 'active' : ''}
              onClick={() => setActiveSection('personal')}
            >
              <span className="jobseeker-menu-icon"><FiUser /></span>
              <span className="jobseeker-menu-text">Personal Info</span>
            </li>
            <li 
              className={activeSection === 'qualifications' ? 'active' : ''}
              onClick={() => setActiveSection('qualifications')}
            >
              <span className="jobseeker-menu-icon"><FiAward /></span>
              <span className="jobseeker-menu-text">Education & Skills</span>
            </li>
            <li 
              className={activeSection === 'experience' ? 'active' : ''}
              onClick={() => setActiveSection('experience')}
            >
              <span className="jobseeker-menu-icon"><FiBriefcase /></span>
              <span className="jobseeker-menu-text">Experience</span>
            </li>
            <li 
              className={activeSection === 'preferences' ? 'active' : ''}
              onClick={() => setActiveSection('preferences')}
            >
              <span className="jobseeker-menu-icon"><FiSettings /></span>
              <span className="jobseeker-menu-text">Preferences</span>
            </li>
            <li 
              className={activeSection === 'documents' ? 'active' : ''}
              onClick={() => setActiveSection('documents')}
            >
              <span className="jobseeker-menu-icon"><FiFileText /></span>
              <span className="jobseeker-menu-text">Documents</span>
            </li>
            <li 
              className={activeSection === 'insights' ? 'active' : ''}
              onClick={() => setActiveSection('insights')}
            >
              <span className="jobseeker-menu-icon"><FiBarChart2 /></span>
              <span className="jobseeker-menu-text">Insights</span>
            </li>
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="jobseeker-main-content">
          <header className="jobseeker-header">
            <h1>Profile Management</h1>
            <p>Complete and optimize your professional profile</p>
          </header>

          {/* Action Buttons */}
          <div className="action-buttons" style={{ marginBottom: '20px' }}>
            {!isEditing ? (
              <button className="jobseeker-btn-primary" onClick={() => setIsEditing(true)}>
                <FiEdit2 /> Edit Profile
              </button>
            ) : (
              <div className="edit-actions" style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="btn-save" onClick={handleSave} disabled={isLoading}>
                  <FiSave /> {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {saveMessage && (
            <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
              {saveMessage}
            </div>
          )}

          {/* Stats Overview */}
          <div className="jobseeker-quick-stats">
            <div className="jobseeker-stat-card jobseeker-stat-highlight">
              <h3>Match Score</h3>
              <p>{stats.matchScore}%</p>
              <span className="jobseeker-stat-trend">+5% this week</span>
            </div>
            <div className="jobseeker-stat-card">
              <h3>Profile Complete</h3>
              <p>{stats.profileCompletion}%</p>
              <span className="jobseeker-stat-trend">Complete your profile</span>
            </div>
            <div className="jobseeker-stat-card">
              <h3>Skills</h3>
              <p>{formData?.qualifications?.skills?.length || 0}</p>
              <span className="jobseeker-stat-trend">Add more skills</span>
            </div>
            <div className="jobseeker-stat-card">
              <h3>Experiences</h3>
              <p>{formData?.experience?.length || 0}</p>
              <span className="jobseeker-stat-trend">Add experience</span>
            </div>
          </div>

          {/* Profile Content Sections */}
          <div className="profile-content">
            {/* Personal Information Section */}
            {activeSection === 'personal' && (
              <div className="jobseeker-content-section">
                <div className="jobseeker-section-header">
                  <h3>Personal Information</h3>
                </div>
                
                <div className="profile-photo-section">
                  <div className="photo-container">
                    {formData?.personalInfo?.profilePhoto ? (
                      <img src={formData.personalInfo.profilePhoto} alt="Profile" className="profile-photo" />
                    ) : (
                      <div className="photo-placeholder">
                        <FiUser size={32} />
                      </div>
                    )}
                    {isEditing && (
                      <div className="photo-actions">
                        <input
                          type="file"
                          id="photo-upload"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          style={{ display: 'none' }}
                          disabled={isSavingPhoto}
                        />
                        <label htmlFor="photo-upload" className="btn-upload">
                          <FiUpload /> {isSavingPhoto ? 'Uploading...' : 'Change Photo'}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData?.personalInfo?.fullName || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    ) : (
                      <div className="value-display">{formData?.personalInfo?.fullName || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Professional Title *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData?.personalInfo?.profileTitle || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'profileTitle', e.target.value)}
                        placeholder="Senior Software Engineer"
                        required
                      />
                    ) : (
                      <div className="value-display">{formData?.personalInfo?.profileTitle || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <div className="value-display">{formData?.personalInfo?.email || user?.email || 'Not provided'}</div>
                  </div>

                  <div className="form-group">
                    <label>Phone *</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData?.personalInfo?.phone || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    ) : (
                      <div className="value-display">{formData?.personalInfo?.phone || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Location *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData?.personalInfo?.location || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                        placeholder="City, State, Country"
                        required
                      />
                    ) : (
                      <div className="value-display">{formData?.personalInfo?.location || 'Not provided'}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>LinkedIn</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData?.personalInfo?.linkedin || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                      />
                    ) : (
                      <div className="value-display">
                        {formData?.personalInfo?.linkedin ? (
                          <a href={formData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                            View Profile
                          </a>
                        ) : 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>GitHub</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData?.personalInfo?.github || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                        placeholder="https://github.com/username"
                      />
                    ) : (
                      <div className="value-display">
                        {formData?.personalInfo?.github ? (
                          <a href={formData.personalInfo.github} target="_blank" rel="noopener noreferrer">
                            View Profile
                          </a>
                        ) : 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Portfolio</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData?.personalInfo?.portfolio || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'portfolio', e.target.value)}
                        placeholder="https://yourportfolio.com"
                      />
                    ) : (
                      <div className="value-display">
                        {formData?.personalInfo?.portfolio ? (
                          <a href={formData.personalInfo.portfolio} target="_blank" rel="noopener noreferrer">
                            Visit Portfolio
                          </a>
                        ) : 'Not provided'}
                      </div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label>Professional Summary *</label>
                    {isEditing ? (
                      <textarea
                        value={formData?.personalInfo?.summary || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                        rows="5"
                        placeholder="Describe your professional background, skills, and career goals..."
                        required
                      />
                    ) : (
                      <div className="value-display summary">
                        {formData?.personalInfo?.summary || 'No summary provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Qualifications Section */}
            {activeSection === 'qualifications' && (
              <div className="jobseeker-content-section">
                <div className="jobseeker-section-header">
                  <h3>Education & Skills</h3>
                </div>

                {/* Education */}
                <div className="subsection">
                  <h4>Education</h4>
                  {formData?.qualifications?.education?.map((edu, index) => (
                    <div key={index} className="education-item">
                      {isEditing ? (
                        <div className="education-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Institution *</label>
                              <input
                                type="text"
                                value={edu.institution || ''}
                                onChange={(e) => handleArrayUpdate('qualifications', 'education', 
                                  formData.qualifications.education.map((item, i) => 
                                    i === index ? {...item, institution: e.target.value} : item
                                  )
                                )}
                                placeholder="University Name"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label>Degree *</label>
                              <select
                                value={edu.degree || ''}
                                onChange={(e) => handleArrayUpdate('qualifications', 'education',
                                  formData.qualifications.education.map((item, i) =>
                                    i === index ? {...item, degree: e.target.value} : item
                                  )
                                )}
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
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Field of Study</label>
                              <input
                                type="text"
                                value={edu.fieldOfStudy || ''}
                                onChange={(e) => handleArrayUpdate('qualifications', 'education',
                                  formData.qualifications.education.map((item, i) =>
                                    i === index ? {...item, fieldOfStudy: e.target.value} : item
                                  )
                                )}
                                placeholder="e.g., Computer Science"
                              />
                            </div>
                            <div className="form-group">
                              <label>Currently Studying</label>
                              <label className="checkbox">
                                <input
                                  type="checkbox"
                                  checked={edu.currentlyStudying || false}
                                  onChange={(e) => handleArrayUpdate('qualifications', 'education',
                                    formData.qualifications.education.map((item, i) =>
                                      i === index ? {...item, currentlyStudying: e.target.checked} : item
                                    )
                                  )}
                                />
                                <span>Currently enrolled</span>
                              </label>
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Start Date</label>
                              <input
                                type="month"
                                value={edu.startDate || ''}
                                onChange={(e) => handleArrayUpdate('qualifications', 'education',
                                  formData.qualifications.education.map((item, i) =>
                                    i === index ? {...item, startDate: e.target.value} : item
                                  )
                                )}
                              />
                            </div>
                            {!edu.currentlyStudying && (
                              <div className="form-group">
                                <label>End Date</label>
                                <input
                                  type="month"
                                  value={edu.endDate || ''}
                                  onChange={(e) => handleArrayUpdate('qualifications', 'education',
                                    formData.qualifications.education.map((item, i) =>
                                      i === index ? {...item, endDate: e.target.value} : item
                                    )
                                  )}
                                />
                              </div>
                            )}
                          </div>

                          <div className="form-group">
                            <label>Description</label>
                            <textarea
                              value={edu.description || ''}
                              onChange={(e) => handleArrayUpdate('qualifications', 'education',
                                formData.qualifications.education.map((item, i) =>
                                  i === index ? {...item, description: e.target.value} : item
                                )
                              )}
                              rows="3"
                              placeholder="Describe your studies, achievements..."
                            />
                          </div>

                          <button className="btn-remove" onClick={() => removeEducation(index)}>
                            <FiTrash2 /> Remove
                          </button>
                        </div>
                      ) : (
                        <div className="education-display">
                          <div className="education-degree">{edu.degree}</div>
                          <div className="education-institution">{edu.institution}</div>
                          {edu.fieldOfStudy && (
                            <div className="education-field">{edu.fieldOfStudy}</div>
                          )}
                          <div className="education-dates">
                            {edu.startDate} - {edu.currentlyStudying ? 'Present' : edu.endDate}
                          </div>
                          {edu.description && (
                            <div className="education-description">{edu.description}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {isEditing && (
                    <button className="btn-add" onClick={addEducation}>
                      <FiPlus /> Add Education
                    </button>
                  )}
                </div>

                {/* Skills */}
                <div className="subsection">
                  <h4>Skills</h4>
                  {isEditing ? (
                    <>
                      <div className="skills-input">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill (e.g., React, Python, Project Management)"
                          onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
                        />
                        <button className="btn-add-skill" onClick={() => addSkill(newSkill)}>
                          <FiPlus /> Add
                        </button>
                      </div>
                      <div className="skills-list">
                        {formData?.qualifications?.skills?.map((skill, index) => (
                          <div key={index} className="skill-tag editable">
                            {skill}
                            <button className="remove-skill" onClick={() => removeSkill(skill)}>
                              <FiX />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="skills-list">
                      {formData?.qualifications?.skills?.length > 0 ? (
                        formData.qualifications.skills.map((skill, index) => (
                          <div key={index} className="skill-tag">
                            {skill}
                          </div>
                        ))
                      ) : (
                        <div className="empty-state">No skills added</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Certifications */}
                <div className="subsection">
                  <h4>Certifications</h4>
                  {formData?.qualifications?.certifications?.map((cert, index) => (
                    <div key={index} className="certification-item">
                      {isEditing ? (
                        <div className="certification-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Certification Name</label>
                              <input
                                type="text"
                                value={cert.name || ''}
                                onChange={(e) => handleArrayUpdate('qualifications', 'certifications',
                                  formData.qualifications.certifications.map((item, i) =>
                                    i === index ? {...item, name: e.target.value} : item
                                  )
                                )}
                                placeholder="e.g., AWS Certified Solutions Architect"
                              />
                            </div>
                            <div className="form-group">
                              <label>Issuer</label>
                              <input
                                type="text"
                                value={cert.issuer || ''}
                                onChange={(e) => handleArrayUpdate('qualifications', 'certifications',
                                  formData.qualifications.certifications.map((item, i) =>
                                    i === index ? {...item, issuer: e.target.value} : item
                                  )
                                )}
                                placeholder="Issuing Organization"
                              />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group">
                              <label>Issue Date</label>
                              <input
                                type="month"
                                value={cert.issueDate || ''}
                                onChange={(e) => handleArrayUpdate('qualifications', 'certifications',
                                  formData.qualifications.certifications.map((item, i) =>
                                    i === index ? {...item, issueDate: e.target.value} : item
                                  )
                                )}
                              />
                            </div>
                            <div className="form-group">
                              <label>Expiration Date</label>
                              <input
                                type="month"
                                value={cert.expirationDate || ''}
                                onChange={(e) => handleArrayUpdate('qualifications', 'certifications',
                                  formData.qualifications.certifications.map((item, i) =>
                                    i === index ? {...item, expirationDate: e.target.value} : item
                                  )
                                )}
                              />
                            </div>
                          </div>

                          <button className="btn-remove" onClick={() => removeCertification(index)}>
                            <FiTrash2 /> Remove
                          </button>
                        </div>
                      ) : (
                        <div className="certification-display">
                          <div className="certification-name">{cert.name}</div>
                          <div className="certification-issuer">{cert.issuer}</div>
                          <div className="certification-dates">
                            {cert.issueDate} {cert.expirationDate && `- ${cert.expirationDate}`}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isEditing && (
                    <button className="btn-add" onClick={addCertification}>
                      <FiPlus /> Add Certification
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {activeSection === 'experience' && (
              <div className="jobseeker-content-section">
                <div className="jobseeker-section-header">
                  <h3>Professional Experience</h3>
                </div>

                {formData?.experience?.map((exp, index) => (
                  <div key={index} className="experience-item">
                    {isEditing ? (
                      <div className="experience-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Job Title *</label>
                            <input
                              type="text"
                              value={exp.title || ''}
                              onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                              placeholder="Senior Software Engineer"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Company *</label>
                            <input
                              type="text"
                              value={exp.company || ''}
                              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                              placeholder="Company Name"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Location</label>
                            <input
                              type="text"
                              value={exp.location || ''}
                              onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                              placeholder="City, State"
                            />
                          </div>
                          <div className="form-group">
                            <label>Current Position</label>
                            <label className="checkbox">
                              <input
                                type="checkbox"
                                checked={exp.current || false}
                                onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                              />
                              <span>I currently work here</span>
                            </label>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Start Date</label>
                            <input
                              type="month"
                              value={exp.startDate || ''}
                              onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                            />
                          </div>
                          {!exp.current && (
                            <div className="form-group">
                              <label>End Date</label>
                              <input
                                type="month"
                                value={exp.endDate || ''}
                                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                              />
                            </div>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Description *</label>
                          <textarea
                            value={exp.description || ''}
                            onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                            rows="4"
                            placeholder="Describe your responsibilities, achievements..."
                            required
                          />
                        </div>

                        <button className="btn-remove" onClick={() => removeExperience(index)}>
                          <FiTrash2 /> Remove Experience
                        </button>
                      </div>
                    ) : (
                      <div className="experience-display">
                        <div className="experience-title">{exp.title}</div>
                        <div className="experience-company">{exp.company}</div>
                        {exp.location && (
                          <div className="experience-location">{exp.location}</div>
                        )}
                        <div className="experience-dates">
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </div>
                        {exp.description && (
                          <div className="experience-description">{exp.description}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isEditing && (
                  <button className="btn-add" onClick={addExperience}>
                    <FiPlus /> Add Experience
                  </button>
                )}
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="jobseeker-content-section">
                <div className="jobseeker-section-header">
                  <h3>Job Preferences</h3>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Desired Job Title *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData?.preferences?.jobTitle || ''}
                        onChange={(e) => handleInputChange('preferences', 'jobTitle', e.target.value)}
                        placeholder="e.g., Senior Frontend Developer"
                        required
                      />
                    ) : (
                      <div className="value-display">{formData?.preferences?.jobTitle || 'Not specified'}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Employment Type</label>
                    {isEditing ? (
                      <div className="checkbox-group">
                        {employmentTypeOptions.map(type => (
                          <label key={type} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData?.preferences?.employmentType?.includes(type) || false}
                              onChange={() => handleEmploymentTypeChange(type)}
                            />
                            <span>{type}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="value-display">
                        {formData?.preferences?.employmentType?.join(', ') || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Salary Expectation</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData?.preferences?.salaryExpectation || ''}
                        onChange={(e) => handleInputChange('preferences', 'salaryExpectation', e.target.value)}
                        placeholder="e.g., $80,000 - $100,000"
                      />
                    ) : (
                      <div className="value-display">{formData?.preferences?.salaryExpectation || 'Not specified'}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Location Preference</label>
                    {isEditing ? (
                      <select
                        value={formData?.preferences?.locationPreference || 'Hybrid'}
                        onChange={(e) => handleInputChange('preferences', 'locationPreference', e.target.value)}
                      >
                        <option value="Remote">Remote</option>
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    ) : (
                      <div className="value-display">{formData?.preferences?.locationPreference || 'Not specified'}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Industries of Interest</label>
                    {isEditing ? (
                      <div className="checkbox-grid">
                        {industryOptions.map(industry => (
                          <label key={industry} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData?.preferences?.industries?.includes(industry) || false}
                              onChange={() => handleIndustryChange(industry)}
                            />
                            <span>{industry}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="value-display">
                        {formData?.preferences?.industries?.join(', ') || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Notice Period</label>
                    {isEditing ? (
                      <select
                        value={formData?.preferences?.noticePeriod || '2 weeks'}
                        onChange={(e) => handleInputChange('preferences', 'noticePeriod', e.target.value)}
                      >
                        <option value="Immediately">Immediately</option>
                        <option value="1 week">1 week</option>
                        <option value="2 weeks">2 weeks</option>
                        <option value="1 month">1 month</option>
                        <option value="2 months">2 months</option>
                        <option value="3 months">3 months</option>
                      </select>
                    ) : (
                      <div className="value-display">{formData?.preferences?.noticePeriod || 'Not specified'}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Availability</label>
                    {isEditing ? (
                      <select
                        value={formData?.preferences?.availability || 'Immediately'}
                        onChange={(e) => handleInputChange('preferences', 'availability', e.target.value)}
                      >
                        <option value="Immediately">Immediately Available</option>
                        <option value="1 week">1 Week Notice</option>
                        <option value="2 weeks">2 Weeks Notice</option>
                        <option value="1 month">1 Month Notice</option>
                      </select>
                    ) : (
                      <div className="value-display">{formData?.preferences?.availability || 'Not specified'}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Additional Preferences</label>
                    {isEditing ? (
                      <div className="checkbox-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData?.preferences?.relocationWillingness || false}
                            onChange={(e) => handleInputChange('preferences', 'relocationWillingness', e.target.checked)}
                          />
                          <span>Willing to relocate</span>
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData?.preferences?.visaSponsorship || false}
                            onChange={(e) => handleInputChange('preferences', 'visaSponsorship', e.target.checked)}
                          />
                          <span>Requires visa sponsorship</span>
                        </label>
                      </div>
                    ) : (
                      <div className="value-display">
                        {formData?.preferences?.relocationWillingness ? 'Willing to relocate' : 'Not willing to relocate'}
                        {formData?.preferences?.visaSponsorship ? ', Requires visa sponsorship' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section */}
            {activeSection === 'documents' && (
              <div className="jobseeker-content-section">
                <div className="jobseeker-section-header">
                  <h3>Documents</h3>
                </div>

                <div className="document-upload">
                  <h4>Resume/CV</h4>
                  <div className="upload-area">
                    <label htmlFor="resume-upload" className="upload-label">
                      <FiUpload size={40} />
                      <div>Click to upload resume</div>
                      <small>PDF, DOC, DOCX (Max 5MB)</small>
                      <input
                        type="file"
                        id="resume-upload"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {formData?.resumeUrl && (
                    <div className="resume-preview">
                      <div className="resume-info">
                        <FiFileText size={24} />
                        <div>
                          <div className="resume-name">
                            {resumeFile ? resumeFile.name : 'Your Resume'}
                          </div>
                          <div className="resume-size">
                            {resumeFile ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                          </div>
                        </div>
                      </div>
                      <a
                        href={formData.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-view"
                      >
                        View Resume
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Insights Section */}
            {activeSection === 'insights' && (
              <div className="jobseeker-content-section">
                <div className="jobseeker-section-header">
                  <h3>Profile Insights</h3>
                </div>

                <div className="insights-grid">
                  <div className="insight-card">
                    <div className="insight-header">
                      <FiTrendingUp />
                      <h3>Profile Strength</h3>
                    </div>
                    <p>Your profile is {stats.profileCompletion}% complete. Complete more sections to increase your visibility.</p>
                    <div className="demand-meter">
                      <div 
                        className="meter-bar" 
                        style={{ width: `${stats.profileCompletion}%` }}
                      ></div>
                      <span>{stats.profileCompletion}% Complete</span>
                    </div>
                  </div>

                  <div className="insight-card">
                    <div className="insight-header">
                      <FiTarget />
                      <h3>Match Potential</h3>
                    </div>
                    <p>Based on your skills and preferences, you match with 85% of jobs in your target industry.</p>
                    <div className="strength-indicators">
                      <div className="strength-item">
                        <span>Technology Jobs</span>
                        <div className="strength-bar">
                          <div className="strength-fill" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div className="strength-item">
                        <span>Finance Jobs</span>
                        <div className="strength-bar">
                          <div className="strength-fill" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="insight-card full-width">
                    <div className="insight-header">
                      <FiTool />
                      <h3>Skill Gap Analysis</h3>
                    </div>
                    <p>Add these in-demand skills to improve your match score:</p>
                    <div className="skill-gap-list">
                      <div className="skill-gap-item">
                        <span className="skill-name">React.js</span>
                        <div className="skill-demand">
                          <div className="demand-bar" style={{ width: '90%' }}></div>
                          <span className="demand-label">High Demand</span>
                        </div>
                      </div>
                      <div className="skill-gap-item">
                        <span className="skill-name">TypeScript</span>
                        <div className="skill-demand">
                          <div className="demand-bar" style={{ width: '85%' }}></div>
                          <span className="demand-label">High Demand</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="insight-card full-width">
                    <div className="insight-header">
                      <FiStar />
                      <h3>Recommendations</h3>
                    </div>
                    <div className="recommendations-list">
                      <div className="recommendation-item">
                        <FiCheck /> Add 2 more skills to increase match score by 15%
                      </div>
                      <div className="recommendation-item">
                        <FiCheck /> Complete your experience section to attract more employers
                      </div>
                      <div className="recommendation-item">
                        <FiCheck /> Update your professional summary with specific achievements
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* AI Chatbox Toggle */}
      <button 
        className="jobseeker-chatbox-toggle"
        onClick={() => setShowAIChatbox(!showAIChatbox)}
      >
        AI
      </button>
    </div>
  );
};

export default ProfilePageSeeker;