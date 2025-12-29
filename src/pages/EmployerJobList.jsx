import React, { useState, useEffect } from 'react';
import { auth, db } from "../firebase/firebase";
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiHome,
  FiBriefcase,
  FiUser,
  FiUsers,
  FiBell,
  FiMessageSquare,
  FiLogOut,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArchive,
  FiFileText,
  FiDollarSign,
  FiMapPin,
  FiCalendar,
  FiChevronRight,
  FiPlus,
  FiFilter
} from 'react-icons/fi';
import './EmployerJobList.css';

const EmployerJobList = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    jobStatus: '',
    department: '',
    minExperience: '',
    location: '',
    compensation: '',
    description: '',
    qualifications: '',
    experienceRequired: '',
    questions: [],
    hiringProcess: ''
  });

  // Applicant status options
  const applicantStatuses = [
    { value: 'applied', label: 'Applied', color: '#6b7280', icon: <FiFileText /> },
    { value: 'reviewed', label: 'Reviewed', color: '#3b82f6', icon: <FiEye /> },
    { value: 'interview', label: 'Interview', color: '#f59e0b', icon: <FiClock /> },
    { value: 'rejected', label: 'Rejected', color: '#ef4444', icon: <FiXCircle /> },
    { value: 'hired', label: 'Hired', color: '#10b981', icon: <FiCheckCircle /> }
  ];

  // Fetch jobs from Firebase
  const fetchJobs = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const jobsQuery = query(
        collection(db, 'jobs'),
        where('employerId', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(jobsQuery);
      const jobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setJobs(jobsData);
      if (jobsData.length > 0 && !selectedJob) {
        setSelectedJob(jobsData[0]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Error loading jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs based on search term and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeJobs = filteredJobs.filter(job => job.status === 'active');
  const archivedJobs = filteredJobs.filter(job => job.status === 'archived');
  const draftJobs = filteredJobs.filter(job => job.status === 'draft');
  const closedJobs = filteredJobs.filter(job => job.status === 'closed');

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setActiveTab('view');
  };

  const handleEdit = (job) => {
    setEditingJob(job.id);
    setEditForm({
      title: job.title || '',
      jobStatus: job.jobStatus || '',
      department: job.department || '',
      minExperience: job.minExperience || '',
      location: job.location || '',
      compensation: job.compensation || '',
      description: job.description || '',
      qualifications: job.qualifications || '',
      experienceRequired: job.experienceRequired || '',
      questions: job.questions || [],
      hiringProcess: job.hiringProcess || ''
    });
    setActiveTab('edit');
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingJob) return;

      const jobRef = doc(db, 'jobs', editingJob);
      await updateDoc(jobRef, {
        ...editForm,
        updatedAt: Timestamp.now()
      });

      // Update local state
      const updatedJobs = jobs.map(job => 
        job.id === editingJob 
          ? { ...job, ...editForm }
          : job
      );
      setJobs(updatedJobs);
      setSelectedJob(updatedJobs.find(job => job.id === editingJob));
      setEditingJob(null);
      setActiveTab('view');
      
      alert('Job updated successfully!');
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Error updating job. Please try again.');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to archive this job posting?')) {
      return;
    }

    try {
      const jobRef = doc(db, 'jobs', jobId);
      
      await updateDoc(jobRef, {
        status: 'archived',
        updatedAt: Timestamp.now()
      });

      // Update local state
      const updatedJobs = jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'archived' }
          : job
      );
      setJobs(updatedJobs);
      
      if (selectedJob && selectedJob.id === jobId) {
        const newSelected = updatedJobs.find(job => job.id !== jobId) || updatedJobs[0];
        setSelectedJob(newSelected);
      }
      
      alert('Job has been archived successfully!');
    } catch (error) {
      console.error('Error archiving job:', error);
      alert('Error archiving job. Please try again.');
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });

      const updatedJobs = jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      );
      setJobs(updatedJobs);
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob({ ...selectedJob, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Error updating job status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: '#d1fae5', text: '#065f46' };
      case 'archived': return { bg: '#fef3c7', text: '#92400e' };
      case 'draft': return { bg: '#e0e7ff', text: '#3730a3' };
      case 'closed': return { bg: '#f3f4f6', text: '#374151' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FiCheckCircle />;
      case 'archived': return <FiArchive />;
      case 'draft': return <FiFileText />;
      case 'closed': return <FiXCircle />;
      default: return <FiClock />;
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="employer-dashboard-container">
        <div className="loading-overlay">
          <div className="loading-spinner">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-dashboard-container">
      {/* TOP NAVBAR */}
      <nav className="employer-top-navbar">
        <div className="employer-nav-brand">
          <span className="employer-brand-logo">JobLytics</span>
          <span className="employer-user-welcome">
            Job Management
          </span>
        </div>
        
        <div className="employer-nav-center">
          <ul className="employer-nav-links">
            <li><Link to="/EmployerDashboard">Dashboard</Link></li>
            <li><Link to="/EmployerJobList" className="active">Jobs</Link></li>
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
              onClick={() => navigate('/messages')}
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
            <FiLogOut />
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
              <Link to="/EmployerJobList" className="employer-menu-link">
                <span className="employer-menu-icon"><FiBriefcase /></span>
                <span className="employer-menu-text">Jobs</span>
                <span className="employer-menu-badge">{jobs.filter(j => j.status === 'active').length}</span>
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
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="employer-main-content">
          <header className="employer-header">
            <h1>Job Management</h1>
            <div className="employer-search-bar">
              <div className="employer-search-box">
                <FiSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search jobs..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="employer-search-input"
                />
              </div>
              <button 
                className="employer-primary-btn"
                onClick={() => navigate('/PostJobPage')}
              >
                <FiPlus /> Post New Job
              </button>
              <div className="employer-user-info">
                Welcome, {auth.currentUser?.displayName || 'Employer'}
              </div>
            </div>
          </header>

          {/* Quick Stats */}
          <div className="employer-quick-stats">
            <div className="employer-stat-card employer-stat-highlight">
              <h3>Active Jobs</h3>
              <p>{activeJobs.length}</p>
              <span className="employer-stat-trend">
                {activeJobs.length > 0 ? 'Live postings' : 'No active jobs'}
              </span>
            </div>
            <div className="employer-stat-card">
              <h3>Total Applicants</h3>
              <p>{jobs.reduce((sum, job) => sum + (job.applicants || 0), 0)}</p>
              <span className="employer-stat-trend">All jobs</span>
            </div>
            <div className="employer-stat-card">
              <h3>In Draft</h3>
              <p>{draftJobs.length}</p>
              <span className="employer-stat-trend">
                {draftJobs.length > 0 ? 'Pending review' : 'No drafts'}
              </span>
            </div>
            <div className="employer-stat-card">
              <h3>Archived</h3>
              <p>{archivedJobs.length}</p>
              <span className="employer-stat-trend">
                {archivedJobs.length > 0 ? 'Past postings' : 'No archived jobs'}
              </span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="employer-content-grid">
            {/* Job List Panel */}
            <div className="employer-content-section">
              <div className="employer-section-header">
                <h3>Your Job Postings</h3>
                <div className="employer-filter-controls">
                  <div className="filter-group">
                    <FiFilter className="filter-icon" />
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="employer-status-filter"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="closed">Closed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="employer-job-list-container">
                {filteredJobs.length === 0 ? (
                  <div className="employer-empty-state">
                    <FiBriefcase size={48} />
                    <h4>No jobs found</h4>
                    <p>Create your first job posting to get started</p>
                    <button 
                      className="employer-primary-btn"
                      onClick={() => navigate('/PostJobPage')}
                    >
                      <FiPlus /> Create Job
                    </button>
                  </div>
                ) : (
                  <div className="employer-job-list">
                    {activeJobs.length > 0 && (
                      <>
                        <div className="job-section-header">Active Jobs ({activeJobs.length})</div>
                        {activeJobs.map(job => (
                          <div 
                            key={job.id} 
                            className={`employer-job-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
                            onClick={() => handleJobSelect(job)}
                          >
                            <div className="job-item-content">
                              <div className="job-item-header">
                                <h4>{job.title}</h4>
                                <span 
                                  className="job-status-badge"
                                  style={{
                                    backgroundColor: getStatusColor(job.status).bg,
                                    color: getStatusColor(job.status).text
                                  }}
                                >
                                  {getStatusIcon(job.status)}
                                  {job.status}
                                </span>
                              </div>
                              <div className="job-item-meta">
                                <span className="job-department">
                                  <FiBriefcase size={14} /> {job.department}
                                </span>
                                <span className="job-location">
                                  <FiMapPin size={14} /> {job.location}
                                </span>
                                <span className="job-salary">
                                  <FiDollarSign size={14} /> {job.compensation || 'Not specified'}
                                </span>
                              </div>
                              <div className="job-stats">
                                <span className="applicant-count">
                                  <FiUsers size={14} /> {job.applicants || 0} applicants
                                </span>
                                <span className="posted-date">
                                  <FiCalendar size={14} /> {job.updatedAt ? new Date(job.updatedAt.toDate()).toLocaleDateString() : 'Recently'}
                                </span>
                              </div>
                            </div>
                            <div className="job-item-actions">
                              <button 
                                className="icon-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(job);
                                }}
                              >
                                <FiEdit />
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {draftJobs.length > 0 && (
                      <>
                        <div className="job-section-header">Drafts ({draftJobs.length})</div>
                        {draftJobs.map(job => (
                          <div 
                            key={job.id} 
                            className={`employer-job-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
                            onClick={() => handleJobSelect(job)}
                          >
                            <div className="job-item-content">
                              <div className="job-item-header">
                                <h4>{job.title}</h4>
                                <span 
                                  className="job-status-badge"
                                  style={{
                                    backgroundColor: getStatusColor(job.status).bg,
                                    color: getStatusColor(job.status).text
                                  }}
                                >
                                  {getStatusIcon(job.status)}
                                  {job.status}
                                </span>
                              </div>
                              <div className="job-item-meta">
                                <span className="job-department">
                                  <FiBriefcase size={14} /> {job.department}
                                </span>
                                <span className="job-location">
                                  <FiMapPin size={14} /> {job.location}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {archivedJobs.length > 0 && (
                      <>
                        <div className="job-section-header">Archived ({archivedJobs.length})</div>
                        {archivedJobs.map(job => (
                          <div 
                            key={job.id} 
                            className={`employer-job-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
                            onClick={() => handleJobSelect(job)}
                          >
                            <div className="job-item-content">
                              <div className="job-item-header">
                                <h4>{job.title}</h4>
                                <span 
                                  className="job-status-badge"
                                  style={{
                                    backgroundColor: getStatusColor(job.status).bg,
                                    color: getStatusColor(job.status).text
                                  }}
                                >
                                  {getStatusIcon(job.status)}
                                  {job.status}
                                </span>
                              </div>
                              <div className="job-item-meta">
                                <span className="job-department">
                                  <FiBriefcase size={14} /> {job.department}
                                </span>
                                <span className="job-location">
                                  <FiMapPin size={14} /> {job.location}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Job Details Panel */}
            <div className="employer-content-section">
              {selectedJob ? (
                <>
                  <div className="employer-section-header">
                    <h3>Job Details</h3>
                    <div className="job-actions">
                      <select 
                        value={selectedJob.status}
                        onChange={(e) => handleStatusChange(selectedJob.id, e.target.value)}
                        className="employer-status-select"
                        style={{
                          backgroundColor: getStatusColor(selectedJob.status).bg,
                          color: getStatusColor(selectedJob.status).text
                        }}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="archived">Archived</option>
                      </select>
                      <button 
                        className="employer-secondary-btn"
                        onClick={() => handleEdit(selectedJob)}
                      >
                        <FiEdit /> Edit
                      </button>
                      <button 
                        className="employer-danger-btn"
                        onClick={() => handleDelete(selectedJob.id)}
                      >
                        <FiTrash2 /> Archive
                      </button>
                    </div>
                  </div>

                  <div className="job-details-container">
                    {/* Tab Navigation */}
                    <div className="job-details-tabs">
                      <button 
                        className={`job-tab-btn ${activeTab === 'view' ? 'active' : ''}`}
                        onClick={() => setActiveTab('view')}
                      >
                        Overview
                      </button>
                      <button 
                        className={`job-tab-btn ${activeTab === 'applicants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('applicants')}
                      >
                        Applicants ({selectedJob.applicants || 0})
                      </button>
                      <button 
                        className={`job-tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                        onClick={() => handleEdit(selectedJob)}
                      >
                        Edit Details
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="job-tab-content">
                      {activeTab === 'view' && (
                        <div className="job-overview">
                          <div className="job-basic-info">
                            <h2>{selectedJob.title}</h2>
                            <div className="job-tags">
                              <span className="job-tag">
                                <FiBriefcase /> {selectedJob.jobStatus}
                              </span>
                              <span className="job-tag salary">
                                <FiDollarSign /> {selectedJob.compensation || 'Not specified'}
                              </span>
                              <span className="job-tag">
                                <FiMapPin /> {selectedJob.location}
                              </span>
                              <span className="job-tag">
                                {selectedJob.minExperience}
                              </span>
                            </div>
                            <div className="job-meta">
                              <span className="meta-item">
                                <strong>Department:</strong> {selectedJob.department || 'Not specified'}
                              </span>
                            </div>
                          </div>

                          <div className="job-section">
                            <h4>Job Description</h4>
                            <div className="job-content">
                              {selectedJob.description || 'No description provided'}
                            </div>
                          </div>

                          {selectedJob.qualifications && (
                            <div className="job-section">
                              <h4>Qualifications</h4>
                              <div className="job-content">
                                {selectedJob.qualifications}
                              </div>
                            </div>
                          )}

                          {selectedJob.experienceRequired && (
                            <div className="job-section">
                              <h4>Experience Required</h4>
                              <div className="job-content">
                                {selectedJob.experienceRequired}
                              </div>
                            </div>
                          )}

                          {selectedJob.questions && selectedJob.questions.length > 0 && (
                            <div className="job-section">
                              <h4>Candidate Questions</h4>
                              <ul className="job-questions">
                                {selectedJob.questions.map((question, index) => (
                                  <li key={index}>{question}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {selectedJob.hiringProcess && (
                            <div className="job-section">
                              <h4>Hiring Process</h4>
                              <div className="job-content">
                                {selectedJob.hiringProcess}
                              </div>
                            </div>
                          )}

                          <div className="job-stats-cards">
                            <div className="job-stat-card">
                              <div className="stat-number">{selectedJob.applicants || 0}</div>
                              <div className="stat-label">Total Applicants</div>
                            </div>
                            <div className="job-stat-card">
                              <div className="stat-number">{selectedJob.views || 0}</div>
                              <div className="stat-label">Job Views</div>
                            </div>
                            <div className="job-stat-card">
                              <div className="stat-number">
                                {selectedJob.updatedAt ? new Date(selectedJob.updatedAt.toDate()).toLocaleDateString() : 'N/A'}
                              </div>
                              <div className="stat-label">Last Updated</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'applicants' && (
                        <div className="applicants-view">
                          <div className="applicants-header">
                            <h4>Applicant Management</h4>
                            <div className="applicant-stats-summary">
                              {applicantStatuses.map(status => (
                                <div key={status.value} className="applicant-stat-item">
                                  <span 
                                    className="stat-indicator"
                                    style={{ backgroundColor: status.color }}
                                  >
                                    {status.icon}
                                  </span>
                                  <span className="stat-count">0</span>
                                  <span className="stat-label">{status.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="no-applicants-view">
                            <FiUsers size={48} />
                            <h5>No applicants yet</h5>
                            <p>Share this job posting to attract candidates</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'edit' && (
                        <div className="edit-job-view">
                          <h4>Edit Job Posting</h4>
                          
                          <div className="edit-form">
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Job Title *</label>
                                <input 
                                  type="text" 
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                  placeholder="Enter job title"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Job Type</label>
                                <select 
                                  value={editForm.jobStatus}
                                  onChange={(e) => setEditForm({...editForm, jobStatus: e.target.value})}
                                >
                                  <option value="">Select job type</option>
                                  <option value="Full-time">Full-time</option>
                                  <option value="Part-time">Part-time</option>
                                  <option value="Contract">Contract</option>
                                  <option value="Remote">Remote</option>
                                </select>
                              </div>
                              
                              <div className="form-group">
                                <label>Department</label>
                                <input 
                                  type="text" 
                                  value={editForm.department}
                                  onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                                  placeholder="Enter department"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Experience Level</label>
                                <select 
                                  value={editForm.minExperience}
                                  onChange={(e) => setEditForm({...editForm, minExperience: e.target.value})}
                                >
                                  <option value="">Select experience level</option>
                                  <option value="Entry Level">Entry Level</option>
                                  <option value="Mid Level">Mid Level</option>
                                  <option value="Senior Level">Senior Level</option>
                                </select>
                              </div>
                              
                              <div className="form-group">
                                <label>Location</label>
                                <input 
                                  type="text" 
                                  value={editForm.location}
                                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                  placeholder="Enter location"
                                />
                              </div>
                              
                              <div className="form-group">
                                <label>Compensation</label>
                                <input 
                                  type="text" 
                                  value={editForm.compensation}
                                  onChange={(e) => setEditForm({...editForm, compensation: e.target.value})}
                                  placeholder="Enter salary range"
                                />
                              </div>
                            </div>
                            
                            <div className="form-group">
                              <label>Job Description *</label>
                              <textarea 
                                value={editForm.description}
                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                rows="4"
                                placeholder="Describe the role and responsibilities..."
                              />
                            </div>
                            
                            <div className="form-group">
                              <label>Qualifications</label>
                              <textarea 
                                value={editForm.qualifications}
                                onChange={(e) => setEditForm({...editForm, qualifications: e.target.value})}
                                rows="3"
                                placeholder="List required qualifications..."
                              />
                            </div>
                            
                            <div className="form-group">
                              <label>Experience Required</label>
                              <textarea 
                                value={editForm.experienceRequired}
                                onChange={(e) => setEditForm({...editForm, experienceRequired: e.target.value})}
                                rows="3"
                                placeholder="Detail specific experience requirements..."
                              />
                            </div>
                            
                            <div className="form-group">
                              <label>Candidate Questions (one per line)</label>
                              <textarea 
                                value={editForm.questions.join('\n')}
                                onChange={(e) => setEditForm({...editForm, questions: e.target.value.split('\n')})}
                                rows="3"
                                placeholder="Enter questions for candidates..."
                              />
                            </div>
                            
                            <div className="form-group">
                              <label>Hiring Process</label>
                              <textarea 
                                value={editForm.hiringProcess}
                                onChange={(e) => setEditForm({...editForm, hiringProcess: e.target.value})}
                                rows="3"
                                placeholder="Describe your hiring process..."
                              />
                            </div>
                            
                            <div className="form-actions">
                              <button 
                                className="employer-secondary-btn"
                                onClick={() => {
                                  setEditingJob(null);
                                  setActiveTab('view');
                                }}
                              >
                                Cancel
                              </button>
                              <button 
                                className="employer-primary-btn"
                                onClick={handleSaveEdit}
                                disabled={!editForm.title || !editForm.description}
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-job-selected">
                  <FiBriefcase size={48} />
                  <h4>Select a Job</h4>
                  <p>Choose a job posting from the list to view details and manage applications</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployerJobList;