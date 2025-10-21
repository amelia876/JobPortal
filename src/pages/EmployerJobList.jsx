import React, { useState, useEffect } from 'react';
import { auth, db } from "../firebase/firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './EmployerJobList.css';

const EmployerJobList = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const [showNewJobModal, setShowNewJobModal] = useState(false);

  // Applicant status options
  const applicantStatuses = [
    { value: 'applied', label: 'Applied', color: '#6b7280' },
    { value: 'reviewed', label: 'Reviewed', color: '#3b82f6' },
    { value: 'interview', label: 'Interview', color: '#f59e0b' },
    { value: 'rejected', label: 'Rejected', color: '#ef4444' },
    { value: 'hired', label: 'Hired', color: '#10b981' }
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
    if (!window.confirm('Are you sure you want to delete this job posting? This will remove it from the site but keep it in the database.')) {
      return;
    }

    try {
      const jobRef = doc(db, 'jobs', jobId);
      
      // Instead of deleting, we'll mark it as "deleted" or "archived"
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
      case 'active': return '#dcfce7';
      case 'archived': return '#fef3c7';
      case 'draft': return '#e0e7ff';
      case 'closed': return '#f3f4f6';
      default: return '#f1f5f9';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'active': return '#166534';
      case 'archived': return '#92400e';
      case 'draft': return '#3730a3';
      case 'closed': return '#374151';
      default: return '#475569';
    }
  };

  const getApplicantStatusColor = (status) => {
    const statusObj = applicantStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : '#6b7280';
  };

  if (loading) {
    return (
      <div className="employer-job-list">
        <div className="container">
          <div className="loading-spinner">Loading jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-job-list">
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

      <div className="container">
        <header className="page-header">
          <h1>Job Management</h1>
          <p>Manage your job postings and track applications</p>
        </header>

        <div className="layout">
          {/* Job List Sidebar */}
          <div className="job-sidebar">
            <div className="sidebar-header">
              <h2>Your Job Posts</h2>
              <button 
                className="btn-primary"
                onClick={() => navigate('/PostJobPage')}
              >
                + New Job
              </button>
            </div>

            {/* Search and Filter */}
            <div className="search-filter-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="search-icon">🔍</span>
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="job-filters">
              <button 
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({filteredJobs.length})
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                Active ({activeJobs.length})
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'draft' ? 'active' : ''}`}
                onClick={() => setStatusFilter('draft')}
              >
                Draft ({draftJobs.length})
              </button>
            </div>

            <div className="job-list">
              {filteredJobs.length === 0 ? (
                <div className="no-jobs-message">
                  <p>No jobs found matching your criteria.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/PostJobPage')}
                  >
                    Create Your First Job
                  </button>
                </div>
              ) : (
                <>
                  {activeJobs.length > 0 && (
                    <>
                      <div className="section-divider">Active Jobs</div>
                      {activeJobs.map(job => (
                        <div 
                          key={job.id} 
                          className={`job-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
                          onClick={() => handleJobSelect(job)}
                        >
                          <div className="job-item-header">
                            <h3>{job.title}</h3>
                            <span 
                              className="status-badge"
                              style={{
                                backgroundColor: getStatusColor(job.status),
                                color: getStatusTextColor(job.status)
                              }}
                            >
                              {job.status}
                            </span>
                          </div>
                          <p className="company">{job.department} • {job.location}</p>
                          <div className="job-meta">
                            <span className="applicants">{job.applicants || 0} applicants</span>
                            <span className="views">{job.views || 0} views</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {draftJobs.length > 0 && (
                    <>
                      <div className="section-divider">Drafts</div>
                      {draftJobs.map(job => (
                        <div 
                          key={job.id} 
                          className={`job-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
                          onClick={() => handleJobSelect(job)}
                        >
                          <div className="job-item-header">
                            <h3>{job.title}</h3>
                            <span 
                              className="status-badge"
                              style={{
                                backgroundColor: getStatusColor(job.status),
                                color: getStatusTextColor(job.status)
                              }}
                            >
                              {job.status}
                            </span>
                          </div>
                          <p className="company">{job.department} • {job.location}</p>
                          <div className="job-meta">
                            <span className="applicants">{job.applicants || 0} applicants</span>
                            <span className="views">{job.views || 0} views</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {closedJobs.length > 0 && (
                    <>
                      <div className="section-divider">Closed</div>
                      {closedJobs.map(job => (
                        <div 
                          key={job.id} 
                          className={`job-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
                          onClick={() => handleJobSelect(job)}
                        >
                          <div className="job-item-header">
                            <h3>{job.title}</h3>
                            <span 
                              className="status-badge"
                              style={{
                                backgroundColor: getStatusColor(job.status),
                                color: getStatusTextColor(job.status)
                              }}
                            >
                              {job.status}
                            </span>
                          </div>
                          <p className="company">{job.department} • {job.location}</p>
                          <div className="job-meta">
                            <span className="applicants">{job.applicants || 0} applicants</span>
                            <span className="views">{job.views || 0} views</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {archivedJobs.length > 0 && (
                    <>
                      <div className="section-divider">Archived</div>
                      {archivedJobs.map(job => (
                        <div 
                          key={job.id} 
                          className={`job-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
                          onClick={() => handleJobSelect(job)}
                        >
                          <div className="job-item-header">
                            <h3>{job.title}</h3>
                            <span 
                              className="status-badge"
                              style={{
                                backgroundColor: getStatusColor(job.status),
                                color: getStatusTextColor(job.status)
                              }}
                            >
                              {job.status}
                            </span>
                          </div>
                          <p className="company">{job.department} • {job.location}</p>
                          <div className="job-meta">
                            <span className="applicants">{job.applicants || 0} applicants</span>
                            <span className="views">{job.views || 0} views</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Job Details Panel */}
          <div className="job-details-panel">
            {selectedJob ? (
              <>
                <div className="panel-header">
                  <div className="job-title-section">
                    <h2>{selectedJob.title}</h2>
                    <div className="job-actions">
                      <select 
                        value={selectedJob.status}
                        onChange={(e) => handleStatusChange(selectedJob.id, e.target.value)}
                        className="status-select"
                        style={{
                          backgroundColor: getStatusColor(selectedJob.status),
                          color: getStatusTextColor(selectedJob.status)
                        }}
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="archived">Archived</option>
                      </select>
                      <button 
                        className="btn-secondary"
                        onClick={() => handleEdit(selectedJob)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleDelete(selectedJob.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="company-location">{selectedJob.department} • {selectedJob.location}</p>
                  <div className="job-tags">
                    <span className="tag">{selectedJob.jobStatus}</span>
                    <span className="tag salary">{selectedJob.compensation}</span>
                    <span className="tag">{selectedJob.minExperience}</span>
                    <span 
                      className="status-tag"
                      style={{
                        backgroundColor: getStatusColor(selectedJob.status),
                        color: getStatusTextColor(selectedJob.status)
                      }}
                    >
                      {selectedJob.status}
                    </span>
                  </div>
                </div>

                <div className="tab-navigation">
                  <button 
                    className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
                    onClick={() => setActiveTab('view')}
                  >
                    Job Details
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'applicants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('applicants')}
                  >
                    Applicants ({selectedJob.applicants || 0})
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
                    onClick={() => handleEdit(selectedJob)}
                  >
                    Edit Job
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'view' && (
                    <div className="view-tab">
                      <div className="section">
                        <h3>Job Description</h3>
                        <p>{selectedJob.description}</p>
                      </div>

                      <div className="section">
                        <h3>Qualifications</h3>
                        <p>{selectedJob.qualifications}</p>
                      </div>

                      <div className="section">
                        <h3>Experience Required</h3>
                        <p>{selectedJob.experienceRequired}</p>
                      </div>

                      {selectedJob.questions && selectedJob.questions.length > 0 && (
                        <div className="section">
                          <h3>Candidate Questions</h3>
                          <ul className="requirements-list">
                            {selectedJob.questions.map((question, index) => (
                              <li key={index}>{question}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedJob.hiringProcess && (
                        <div className="section">
                          <h3>Hiring Process</h3>
                          <p>{selectedJob.hiringProcess}</p>
                        </div>
                      )}

                      <div className="job-stats">
                        <div className="stat-card">
                          <span className="stat-number">{selectedJob.applicants || 0}</span>
                          <span className="stat-label">Total Applicants</span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-number">{selectedJob.views || 0}</span>
                          <span className="stat-label">Job Views</span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-number">
                            {selectedJob.updatedAt ? new Date(selectedJob.updatedAt.toDate()).toLocaleDateString() : 'N/A'}
                          </span>
                          <span className="stat-label">Last Updated</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'applicants' && (
                    <div className="applicants-tab">
                      <div className="applicants-header">
                        <h3>Applicant Management</h3>
                        <div className="applicant-stats">
                          {applicantStatuses.map(status => (
                            <div key={status.value} className="applicant-stat">
                              <span 
                                className="stat-dot"
                                style={{ backgroundColor: status.color }}
                              ></span>
                              <span>0 {status.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="no-applicants">
                        <p>No applicants yet for this position.</p>
                        <p>Share this job posting to attract candidates.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'edit' && (
                    <div className="edit-tab">
                      <div className="form-section">
                        <h3>Edit Job Posting</h3>
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Job Title *</label>
                            <input 
                              type="text" 
                              value={editForm.title}
                              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            />
                          </div>
                          <div className="form-group">
                            <label>Job Status</label>
                            <select 
                              value={editForm.jobStatus}
                              onChange={(e) => setEditForm({...editForm, jobStatus: e.target.value})}
                            >
                              <option value="">Select job status</option>
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
                            />
                          </div>
                          <div className="form-group">
                            <label>Minimum Experience</label>
                            <select 
                              value={editForm.minExperience}
                              onChange={(e) => setEditForm({...editForm, minExperience: e.target.value})}
                            >
                              <option value="">Select experience level</option>
                              <option value="Entry Level">Entry Level (0-2 years)</option>
                              <option value="Mid Level">Mid Level (2-5 years)</option>
                              <option value="Senior Level">Senior Level (5+ years)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Location</label>
                            <input 
                              type="text" 
                              value={editForm.location}
                              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                            />
                          </div>
                          <div className="form-group">
                            <label>Compensation</label>
                            <input 
                              type="text" 
                              value={editForm.compensation}
                              onChange={(e) => setEditForm({...editForm, compensation: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="form-group full-width">
                          <label>Job Description *</label>
                          <textarea 
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            rows="4"
                          />
                        </div>
                        
                        <div className="form-group full-width">
                          <label>Qualifications</label>
                          <textarea 
                            value={editForm.qualifications}
                            onChange={(e) => setEditForm({...editForm, qualifications: e.target.value})}
                            rows="4"
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Experience Required</label>
                          <textarea 
                            value={editForm.experienceRequired}
                            onChange={(e) => setEditForm({...editForm, experienceRequired: e.target.value})}
                            rows="4"
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Questions (one per line)</label>
                          <textarea 
                            value={editForm.questions.join('\n')}
                            onChange={(e) => setEditForm({...editForm, questions: e.target.value.split('\n')})}
                            rows="4"
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>Hiring Process</label>
                          <textarea 
                            value={editForm.hiringProcess}
                            onChange={(e) => setEditForm({...editForm, hiringProcess: e.target.value})}
                            rows="4"
                          />
                        </div>
                        
                        <div className="form-actions">
                          <button 
                            className="btn-secondary"
                            onClick={() => {
                              setEditingJob(null);
                              setActiveTab('view');
                            }}
                          >
                            Cancel
                          </button>
                          <button 
                            className="btn-primary"
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
              </>
            ) : (
              <div className="no-job-selected">
                <div className="placeholder-content">
                  <h3>Select a job to view details</h3>
                  <p>Choose a job posting from the list to see applicants, edit details, or manage the posting.</p>
                  {jobs.length === 0 && (
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/PostJobPage')}
                    >
                      Create Your First Job
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerJobList;