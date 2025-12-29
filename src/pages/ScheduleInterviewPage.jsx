import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase';
import { 
  collection, 
  addDoc, 
  Timestamp, 
  query, 
  where, 
  getDocs,
  orderBy 
} from 'firebase/firestore';
import './ScheduleInterviewPage.css';
import { format } from 'date-fns';

const ScheduleInterviewPage = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    candidateId: '',
    jobTitle: '',
    jobId: '',
    interviewDate: '',
    interviewTime: '',
    duration: 60,
    interviewType: 'video',
    meetingTitle: '',
    agenda: '',
    meetingLink: '',
    notes: ''
  });
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const navigate = useNavigate();

  // Fetch current user
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchUserData(currentUser.uid);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch user's data (jobs and candidates)
  const fetchUserData = async (userId) => {
    try {
      // Fetch employer's jobs
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('employerId', '==', userId)
      );
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobs = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAvailableJobs(jobs);

      // Fetch applicants/candidates (from applications)
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('employerId', '==', userId)
      );
      const appsSnapshot = await getDocs(applicationsQuery);
      const candidates = [];
      
      appsSnapshot.docs.forEach(doc => {
        const app = doc.data();
        if (!candidates.find(c => c.id === app.candidateId)) {
          candidates.push({
            id: app.candidateId,
            name: app.candidateName || 'Candidate',
            email: app.candidateEmail || '',
            jobId: app.jobId
          });
        }
      });
      setAvailableCandidates(candidates);

      // Fetch scheduled meetings
      fetchScheduledMeetings(userId);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch scheduled meetings
  const fetchScheduledMeetings = async (userId) => {
    try {
      const now = Timestamp.now();
      
      // Upcoming meetings (interviewDate >= now)
      const upcomingQuery = query(
        collection(db, 'interviews'),
        where('employerId', '==', userId),
        where('interviewDate', '>=', now),
        orderBy('interviewDate', 'asc')
      );
      
      // Past meetings (interviewDate < now)
      const pastQuery = query(
        collection(db, 'interviews'),
        where('employerId', '==', userId),
        where('interviewDate', '<', now),
        orderBy('interviewDate', 'desc')
      );

      const [upcomingSnapshot, pastSnapshot] = await Promise.all([
        getDocs(upcomingQuery),
        getDocs(pastQuery)
      ]);

      const upcoming = upcomingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const past = pastSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setScheduledMeetings(upcoming);
      setPastMeetings(past);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle candidate selection
  const handleCandidateSelect = (candidateId) => {
    const candidate = availableCandidates.find(c => c.id === candidateId);
    if (candidate) {
      setFormData(prev => ({
        ...prev,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email
      }));
    }
  };

  // Handle job selection
  const handleJobSelect = (jobId) => {
    const job = availableJobs.find(j => j.id === jobId);
    if (job) {
      setFormData(prev => ({
        ...prev,
        jobId: job.id,
        jobTitle: job.title
      }));
    }
  };

  // Handle schedule interview
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in');
      return;
    }

    if (!formData.candidateId || !formData.jobId || !formData.interviewDate || !formData.interviewTime) {
      alert('Please fill in all required fields: candidate, job, date, and time');
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const dateTimeStr = `${formData.interviewDate}T${formData.interviewTime}`;
      const interviewDateTime = new Date(dateTimeStr);
      
      // Prepare interview data
      const interviewData = {
        employerId: user.uid,
        employerName: user.displayName || user.email || 'Employer',
        employerEmail: user.email,
        candidateId: formData.candidateId,
        candidateName: formData.candidateName,
        candidateEmail: formData.candidateEmail,
        jobId: formData.jobId,
        jobTitle: formData.jobTitle,
        interviewDate: Timestamp.fromDate(interviewDateTime),
        interviewTime: formData.interviewTime,
        duration: parseInt(formData.duration) || 60,
        interviewType: formData.interviewType,
        meetingTitle: formData.meetingTitle || `Interview for ${formData.jobTitle}`,
        agenda: formData.agenda || '',
        meetingLink: formData.meetingLink || (formData.interviewType === 'video' ? 'https://meet.google.com/new' : ''),
        notes: formData.notes || '',
        status: 'scheduled',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'interviews'), interviewData);
      
      console.log('Interview scheduled with ID:', docRef.id);
      
      // TODO: Send notification to candidate (you can implement email or in-app notification)
      
      alert('Interview scheduled successfully!');
      
      // Reset form
      setFormData({
        candidateName: '',
        candidateEmail: '',
        candidateId: '',
        jobTitle: '',
        jobId: '',
        interviewDate: '',
        interviewTime: '',
        duration: 60,
        interviewType: 'video',
        meetingTitle: '',
        agenda: '',
        meetingLink: '',
        notes: ''
      });
      
      // Refresh meetings list
      fetchScheduledMeetings(user.uid);
      
      // Switch to meetings tab
      setActiveTab('meetings');
      
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert(`Failed to schedule interview: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return format(date, 'MMM d, yyyy h:mm a');
  };

  // Get upcoming meetings for today
  const getTodayMeetings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return scheduledMeetings.filter(meeting => {
      const meetingDate = meeting.interviewDate.toDate();
      return meetingDate >= today && meetingDate < tomorrow;
    });
  };

  // Get upcoming meetings after today
  const getUpcomingMeetings = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return scheduledMeetings.filter(meeting => {
      const meetingDate = meeting.interviewDate.toDate();
      return meetingDate >= tomorrow;
    });
  };

  return (
    <div className="interview-page">
      {/* Navbar */}
      <nav className="interview-navbar">
        <div className="interview-navbar-content">
          <div className="interview-navbar-left">
            <h1 className="interview-logo" onClick={() => navigate('/employer')} style={{ cursor: 'pointer' }}>
              JobPortal
            </h1>
          </div>
          <div className="interview-navbar-center">
            <div className="interview-nav-links">
              <button 
                className={`interview-nav-link ${activeTab === 'schedule' ? 'interview-nav-link-active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                Schedule Interview
              </button>
              <button 
                className={`interview-nav-link ${activeTab === 'meetings' ? 'interview-nav-link-active' : ''}`}
                onClick={() => setActiveTab('meetings')}
              >
                Upcoming Meetings
              </button>
              <button 
                className={`interview-nav-link ${activeTab === 'past' ? 'interview-nav-link-active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past Meetings
              </button>
            </div>
          </div>
          <div className="interview-navbar-right">
            <div className="interview-user-menu">
              <div className="interview-user-avatar">
                <span>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'E'}</span>
              </div>
              <span className="interview-user-name">{user?.displayName || user?.email || 'Employer'}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="interview-container">
        {/* Left Section - Schedule Form or Meetings List */}
        <div className="interview-left-section">
          {activeTab === 'schedule' ? (
            <div className="interview-card">
              <h2>Schedule New Interview</h2>
              
              <form onSubmit={handleScheduleInterview}>
                {/* Candidate Selection */}
                <div className="form-group">
                  <label>Select Candidate *</label>
                  <select 
                    name="candidateId"
                    value={formData.candidateId}
                    onChange={(e) => handleCandidateSelect(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">-- Select a candidate --</option>
                    {availableCandidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} ({candidate.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Selection */}
                <div className="form-group">
                  <label>Select Job *</label>
                  <select 
                    name="jobId"
                    value={formData.jobId}
                    onChange={(e) => handleJobSelect(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">-- Select a job --</option>
                    {availableJobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Time */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Interview Date *</label>
                    <input
                      type="date"
                      name="interviewDate"
                      value={formData.interviewDate}
                      onChange={handleInputChange}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Interview Time *</label>
                    <input
                      type="time"
                      name="interviewTime"
                      value={formData.interviewTime}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Duration and Type */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Duration (minutes) *</label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Interview Type *</label>
                    <select
                      name="interviewType"
                      value={formData.interviewType}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="video">Video Call</option>
                      <option value="in-person">In-Person</option>
                      <option value="phone">Phone Call</option>
                    </select>
                  </div>
                </div>

                {/* Meeting Details */}
                <div className="form-group">
                  <label>Meeting Title</label>
                  <input
                    type="text"
                    name="meetingTitle"
                    value={formData.meetingTitle}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="E.g., Technical Interview Round 2"
                  />
                </div>

                <div className="form-group">
                  <label>Agenda</label>
                  <textarea
                    name="agenda"
                    value={formData.agenda}
                    onChange={handleInputChange}
                    className="form-input"
                    rows="3"
                    placeholder="What will be discussed in the interview..."
                  />
                </div>

                {formData.interviewType === 'video' && (
                  <div className="form-group">
                    <label>Meeting Link</label>
                    <input
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Notes (Internal)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="form-input"
                    rows="2"
                    placeholder="Any internal notes for the interview..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="schedule-button"
                  disabled={loading}
                >
                  {loading ? 'Scheduling...' : 'Schedule Interview'}
                </button>
              </form>
            </div>
          ) : activeTab === 'meetings' ? (
            <div className="interview-card">
              <h2>Upcoming Meetings</h2>
              
              {/* Today's Meetings */}
              <div className="meetings-section">
                <h3>Today's Meetings</h3>
                {getTodayMeetings().length === 0 ? (
                  <p className="no-meetings">No meetings scheduled for today</p>
                ) : (
                  getTodayMeetings().map(meeting => (
                    <div key={meeting.id} className="meeting-item">
                      <div className="meeting-header">
                        <span className="meeting-title">{meeting.meetingTitle}</span>
                        <span className={`meeting-status ${meeting.status}`}>
                          {meeting.status}
                        </span>
                      </div>
                      <div className="meeting-details">
                        <div><strong>Candidate:</strong> {meeting.candidateName}</div>
                        <div><strong>Job:</strong> {meeting.jobTitle}</div>
                        <div><strong>Time:</strong> {formatDate(meeting.interviewDate)}</div>
                        <div><strong>Duration:</strong> {meeting.duration} minutes</div>
                        <div><strong>Type:</strong> {meeting.interviewType}</div>
                        {meeting.meetingLink && (
                          <div>
                            <strong>Link:</strong> 
                            <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                              Join Meeting
                            </a>
                          </div>
                        )}
                        {meeting.agenda && (
                          <div><strong>Agenda:</strong> {meeting.agenda}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Future Meetings */}
              <div className="meetings-section">
                <h3>Future Meetings</h3>
                {getUpcomingMeetings().length === 0 ? (
                  <p className="no-meetings">No upcoming meetings</p>
                ) : (
                  getUpcomingMeetings().map(meeting => (
                    <div key={meeting.id} className="meeting-item">
                      <div className="meeting-header">
                        <span className="meeting-title">{meeting.meetingTitle}</span>
                        <span className={`meeting-status ${meeting.status}`}>
                          {meeting.status}
                        </span>
                      </div>
                      <div className="meeting-details">
                        <div><strong>Candidate:</strong> {meeting.candidateName}</div>
                        <div><strong>Job:</strong> {meeting.jobTitle}</div>
                        <div><strong>Time:</strong> {formatDate(meeting.interviewDate)}</div>
                        <div><strong>Type:</strong> {meeting.interviewType}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="interview-card">
              <h2>Past Meetings</h2>
              {pastMeetings.length === 0 ? (
                <p className="no-meetings">No past meetings</p>
              ) : (
                pastMeetings.map(meeting => (
                  <div key={meeting.id} className="meeting-item past">
                    <div className="meeting-header">
                      <span className="meeting-title">{meeting.meetingTitle}</span>
                      <span className={`meeting-status ${meeting.status}`}>
                        {meeting.status}
                      </span>
                    </div>
                    <div className="meeting-details">
                      <div><strong>Candidate:</strong> {meeting.candidateName}</div>
                      <div><strong>Job:</strong> {meeting.jobTitle}</div>
                      <div><strong>Time:</strong> {formatDate(meeting.interviewDate)}</div>
                      <div><strong>Type:</strong> {meeting.interviewType}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Section - Stats & Info */}
        <div className="interview-right-section">
          {/* Stats Card */}
          <div className="interview-card">
            <h2>Interview Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{scheduledMeetings.length}</div>
                <div className="stat-label">Upcoming</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{getTodayMeetings().length}</div>
                <div className="stat-label">Today</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{pastMeetings.length}</div>
                <div className="stat-label">Past</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{availableCandidates.length}</div>
                <div className="stat-label">Candidates</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="interview-card">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button 
                className="action-btn"
                onClick={() => setActiveTab('schedule')}
              >
                Schedule New Interview
              </button>
              <button 
                className="action-btn"
                onClick={() => navigate('/employer/candidates')}
              >
                View Candidates
              </button>
              <button 
                className="action-btn"
                onClick={() => navigate('/employer/jobs')}
              >
                View Jobs
              </button>
            </div>
          </div>

          {/* Tips Card */}
          <div className="interview-card">
            <h2>Interview Tips</h2>
            <ul className="tips-list">
              <li className="tip-item">
                <span className="tip-bullet">•</span>
                Send calendar invites to candidates
              </li>
              <li className="tip-item">
                <span className="tip-bullet">•</span>
                Prepare questions in advance
              </li>
              <li className="tip-item">
                <span className="tip-bullet">•</span>
                Test meeting links 10 minutes before
              </li>
              <li className="tip-item">
                <span className="tip-bullet">•</span>
                Take notes during the interview
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInterviewPage;